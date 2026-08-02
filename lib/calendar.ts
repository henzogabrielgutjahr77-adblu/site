import fs from "fs";
import path from "path";
import { XMLParser } from "fast-xml-parser";
import { CONTENT_DIR } from "@/lib/content";
import type { CalendarSettings } from "@/lib/content";

/**
 * Integração com o calendário do Nextcloud via CalDAV, usada na página Agenda.
 *
 * Estratégia (espelha a da galeria):
 *  1. Os arquivos .ics do calendário são baixados para um cache local em
 *     `content/cache/nextcloud-calendar/` (gitignored).
 *  2. Um manifesto JSON (`content/cache/nextcloud-calendar-manifest.json`)
 *     registra quais arquivos existem e de onde vieram.
 *  3. A página Agenda lê o manifesto; se estiver "velho" demais, uma
 *     sincronização é disparada sob um lock (para evitar consultas concorrentes).
 *  4. Os eventos são expandidos (incluindo recorrências RRULE) para o mês em
 *     exibição e agrupados por dia.
 *
 * A senha/app password é a mesma da galeria: NEXTCLOUD_PASSWORD (env) ou
 * content/site/nextcloud.secret (gitignored).
 */

import type { CalendarEvent } from "@/lib/calendar-shared";

export { formatTime, isToday, type CalendarEvent } from "@/lib/calendar-shared";

/** Resultado mensal da agenda. */
export interface MonthCalendarResult {
  year: number;
  month: number;
  /** Eventos agrupados por dia (YYYY-MM-DD). */
  days: { date: string; items: CalendarEvent[] }[];
  syncedAt: string | null;
  offline: boolean;
  error?: string;
}

const CACHE_DIR = path.join(CONTENT_DIR, "cache");
const CAL_CACHE_DIR = path.join(CACHE_DIR, "nextcloud-calendar");
const MANIFEST_FILE = path.join(CACHE_DIR, "nextcloud-calendar-manifest.json");
const LOCK_FILE = path.join(CACHE_DIR, "nextcloud-calendar-sync.lock");
const REQUEST_TIMEOUT_MS = 10_000;

const WEEKDAY_TO_INDEX: Record<string, number> = {
  SU: 0,
  MO: 1,
  TU: 2,
  WE: 3,
  TH: 4,
  FR: 5,
  SA: 6,
};

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  removeNSPrefix: true,
  attributeNamePrefix: "",
});

interface ManifestItem {
  name: string;
  href: string;
  size: number;
  mtime: string;
  etag?: string;
}

interface CalendarManifest {
  version: 1;
  syncedAt: string;
  calendarId: string;
  items: ManifestItem[];
}

interface ParsedRule {
  freq: string;
  interval: number;
  byDay: string[];
  byMonthDay: number[];
  count?: number;
  until?: Date;
}

interface RawEvent {
  uid: string;
  summary: string;
  location?: string;
  description?: string;
  dtstart: Date;
  dtend: Date;
  allDay: boolean;
  rrule?: string;
  exdates: Set<number>;
}

/** Indica se a integração com o calendário está ativa. */
export function isCalendarEnabled(cfg?: CalendarSettings): cfg is CalendarSettings {
  return cfg !== undefined && cfg.enabled === true;
}

/** Senha/app password do usuário do calendário (env primeiro, depois arquivo gitignored). */
function getCalendarPassword(): string {
  if (process.env.NEXTCLOUD_CALENDAR_PASSWORD) return process.env.NEXTCLOUD_CALENDAR_PASSWORD;
  try {
    return fs
      .readFileSync(path.join(CONTENT_DIR, "site", "nextcloud-calendar.secret"), "utf-8")
      .trim();
  } catch {
    return "";
  }
}

function authHeaders(cfg: CalendarSettings): Record<string, string> {
  const token = Buffer.from(`${cfg.username}:${getCalendarPassword()}`).toString("base64");
  return { Authorization: `Basic ${token}` };
}

async function caldavRequest(
  cfg: CalendarSettings,
  method: string,
  url: string,
  extraHeaders: Record<string, string> = {},
  body?: string,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, {
      method,
      headers: { ...authHeaders(cfg), ...extraHeaders },
      signal: controller.signal,
      body,
      cache: "no-store",
    });
  } catch {
    throw new Error("Não foi possível conectar ao Nextcloud (servidor offline ou endereço inválido).");
  } finally {
    clearTimeout(timer);
  }
}

function calendarUrl(cfg: CalendarSettings): string {
  const base = cfg.caldav_url.replace(/\/+$/, "");
  const id = cfg.calendar_id.replace(/^\/+|\/+$/g, "");
  return `${base}/${id}/`;
}

function toArray<T>(value: T | T[] | undefined): T[] {
  if (Array.isArray(value)) return value;
  return value === undefined ? [] : [value];
}

/** Lista os objetos .ics do calendário via PROPFIND (Depth: 1). */
async function listCalendarObjects(cfg: CalendarSettings): Promise<ManifestItem[]> {
  const body = `<?xml version="1.0"?><d:propfind xmlns:d="DAV:"><d:prop><d:getetag/><d:getlastmodified/><d:getcontentlength/></d:prop></d:propfind>`;
  const res = await caldavRequest(cfg, "PROPFIND", calendarUrl(cfg), { Depth: "1" }, body);
  if (res.status === 401 || res.status === 403) {
    throw new Error("Credenciais do CalDAV inválidas. Verifique usuário e senha.");
  }
  if (!res.ok) {
    throw new Error(`Falha ao listar o calendário do Nextcloud (HTTP ${res.status}).`);
  }
  const parsed = xmlParser.parse(await res.text());
  const items: ManifestItem[] = [];
  for (const response of toArray(parsed?.multistatus?.response)) {
    const href = String(response?.href ?? "");
    if (!href || !href.toLowerCase().endsWith(".ics")) continue;
    const name = decodeURIComponent(href.split("/").filter(Boolean).pop() ?? "");
    const propstats = toArray(response?.propstat);
    const okStat = propstats.find((p) => String(p?.status ?? "").includes("200")) ?? propstats[0];
    const prop = okStat?.prop ?? {};
    const size = Number(prop.getcontentlength ?? 0) || 0;
    const mtime = new Date(String(prop.getlastmodified ?? "")).toISOString();
    const etag = String(prop.getetag ?? "").replace(/^"(.*)"$/, "$1");
    items.push({ name, href, size, mtime, etag });
  }
  return items;
}

/** Baixa um .ics para o cache local. */
async function downloadIcs(cfg: CalendarSettings, href: string, localPath: string): Promise<void> {
  const url = new URL(href, cfg.caldav_url).toString();
  const res = await caldavRequest(cfg, "GET", url);
  if (!res.ok) {
    throw new Error(`Falha ao baixar evento do Nextcloud (HTTP ${res.status}).`);
  }
  fs.mkdirSync(path.dirname(localPath), { recursive: true });
  fs.writeFileSync(localPath, Buffer.from(await res.arrayBuffer()));
}

function sanitizeFileName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9._-]+/g, "-")
    .slice(0, 120) || "evento.ics";
}

function readManifest(): CalendarManifest | null {
  try {
    const raw = JSON.parse(fs.readFileSync(MANIFEST_FILE, "utf-8"));
    if (raw?.version !== 1 || !Array.isArray(raw?.items)) return null;
    return raw as CalendarManifest;
  } catch {
    return null;
  }
}

/** Sincroniza o calendário: baixa .ics novos, remove removidos, atualiza o manifesto. */
export async function syncCalendar(cfg: CalendarSettings): Promise<void> {
  const remote = await listCalendarObjects(cfg);
  fs.mkdirSync(CAL_CACHE_DIR, { recursive: true });
  const previous = readManifest()?.items ?? [];
  const prevByHref = new Map(previous.map((p) => [p.href, p]));

  const keep = new Set<string>();
  for (const item of remote) {
    const localName = sanitizeFileName(item.name);
    const localPath = path.join(CAL_CACHE_DIR, localName);
    keep.add(localName);
    const prev = prevByHref.get(item.href);
    const changed =
      !fs.existsSync(localPath) || prev === undefined || prev.etag !== item.etag;
    if (changed) {
      await downloadIcs(cfg, item.href, localPath);
    }
  }

  for (const file of fs.readdirSync(CAL_CACHE_DIR)) {
    if (!keep.has(file)) fs.rmSync(path.join(CAL_CACHE_DIR, file), { force: true });
  }

  const manifest: CalendarManifest = {
    version: 1,
    syncedAt: new Date().toISOString(),
    calendarId: cfg.calendar_id,
    items: remote,
  };
  fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2));
}

function acquireLock(maxAgeMs: number): boolean {
  try {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
    if (fs.existsSync(LOCK_FILE)) {
      const born = Number(fs.readFileSync(LOCK_FILE, "utf-8") || 0);
      if (!isNaN(born) && Date.now() - born < maxAgeMs) return false;
    }
    fs.writeFileSync(LOCK_FILE, String(Date.now()));
    return true;
  } catch {
    return false;
  }
}

function releaseLock(): void {
  try {
    fs.rmSync(LOCK_FILE, { force: true });
  } catch {
    // ignora
  }
}

/* ------------------------- parsing iCalendar ------------------------- */

function unfold(text: string): string[] {
  const out: string[] = [];
  for (const line of text.replace(/\r\n/g, "\n").split("\n")) {
    if ((line.startsWith(" ") || line.startsWith("\t")) && out.length > 0) {
      out[out.length - 1] += line.slice(1);
    } else if (line.trim().length > 0) {
      out.push(line);
    }
  }
  return out;
}

interface IcsProp {
  name: string;
  params: Record<string, string>;
  value: string;
}

function parseLine(line: string): IcsProp {
  const colon = line.indexOf(":");
  const head = colon === -1 ? line : line.slice(0, colon);
  const value = colon === -1 ? "" : line.slice(colon + 1);
  const parts = head.split(";");
  const name = parts[0].toUpperCase();
  const params: Record<string, string> = {};
  for (let i = 1; i < parts.length; i++) {
    const eq = parts[i].indexOf("=");
    if (eq === -1) continue;
    const key = parts[i].slice(0, eq).toUpperCase();
    const val = parts[i].slice(eq + 1).replace(/^"|"$/g, "");
    params[key] = val;
  }
  return { name, params, value };
}

/**
 * Monta uma Date com os valores "de parede" representados em UTC, para que a
 * exibição (via getUTC*) mostre sempre o horário local do evento, independente
 * do fuso do servidor.
 */
function parseDateValue(raw: string, _tzid?: string): Date {
  const isUtc = raw.endsWith("Z");
  const body = isUtc ? raw.slice(0, -1) : raw;
  const y = Number(body.slice(0, 4));
  const mo = Number(body.slice(4, 6)) - 1;
  const d = Number(body.slice(6, 8));
  const isDateOnly = body.length <= 8;
  const hh = isDateOnly ? 0 : Number(body.slice(9, 11));
  const mm = isDateOnly ? 0 : Number(body.slice(11, 13));
  const ss = isDateOnly ? 0 : Number(body.slice(13, 15));
  return new Date(Date.UTC(y, mo, d, hh, mm, ss));
}

function daysInMonth(d: Date): number {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
}

function parseDuration(raw: string): number {
  const m = raw.match(/(\d+)D/);
  const h = raw.match(/(\d+)H/);
  const mi = raw.match(/(\d+)M/);
  const s = raw.match(/(\d+)S/);
  let ms = 0;
  if (raw.startsWith("-")) ms = -ms;
  if (m) ms += Number(m[1]) * 86_400_000;
  if (h) ms += Number(h[1]) * 3_600_000;
  if (mi) ms += Number(mi[1]) * 60_000;
  if (s) ms += Number(s[1]) * 1000;
  return ms || 3_600_000;
}

function parseRule(rule: string): ParsedRule {
  const p: ParsedRule = { freq: "WEEKLY", interval: 1, byDay: [], byMonthDay: [] };
  for (const part of rule.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    const key = part.slice(0, eq).toUpperCase();
    const value = part.slice(eq + 1);
    if (key === "FREQ") p.freq = value.toUpperCase();
    else if (key === "INTERVAL") p.interval = Math.max(1, Number(value) || 1);
    else if (key === "BYDAY") p.byDay = value.split(",").map((s) => s.trim().toUpperCase());
    else if (key === "BYMONTHDAY") p.byMonthDay = value.split(",").map((s) => Number(s.trim()));
    else if (key === "COUNT") p.count = Number(value);
    else if (key === "UNTIL") p.until = parseDateValue(value);
  }
  return p;
}

/** Gera as ocorrências (datas de início) a partir do DTSTART, respeitando a RRULE. */
function* occurrences(start: Date, rule: ParsedRule, cap = 8000): Generator<Date> {
  let produced = 0;
  let period = 0;
  while (produced < cap) {
    const freq = rule.freq;
    if (freq === "DAILY") {
      const t = new Date(start);
      t.setUTCDate(start.getUTCDate() + period * rule.interval);
      produced++;
      yield t;
    } else if (freq === "WEEKLY") {
      const weekStart = new Date(start);
      weekStart.setUTCDate(start.getUTCDate() + period * 7 * rule.interval);
      if (rule.byDay.length === 0) {
        const t = new Date(weekStart);
        if (t.getTime() >= start.getTime()) {
          produced++;
          yield t;
        }
      } else {
        const baseDate = weekStart.getUTCDate();
        const baseDay = weekStart.getUTCDay();
        for (const bd of rule.byDay) {
          const target = WEEKDAY_TO_INDEX[bd];
          if (target === undefined) continue;
          const cand = new Date(weekStart);
          cand.setUTCDate(baseDate + (target - baseDay));
          if (cand.getTime() >= start.getTime()) {
            produced++;
            yield cand;
          }
        }
      }
    } else if (freq === "MONTHLY") {
      const base = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + period * rule.interval, 1));
      const dim = daysInMonth(base);
      if (rule.byMonthDay.length === 0) {
        const day = Math.min(start.getUTCDate(), dim);
        const t = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), day));
        if (t.getTime() >= start.getTime()) {
          produced++;
          yield t;
        }
      } else {
        for (const md of rule.byMonthDay) {
          const day = md > 0 ? md : dim + md + 1;
          if (day >= 1 && day <= dim) {
            const t = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), day));
            if (t.getTime() >= start.getTime()) {
              produced++;
              yield t;
            }
          }
        }
      }
    } else if (freq === "YEARLY") {
      const y = start.getUTCFullYear() + period * rule.interval;
      const dim = daysInMonth(new Date(Date.UTC(y, start.getUTCMonth(), 1)));
      const day = Math.min(start.getUTCDate(), dim);
      const t = new Date(Date.UTC(y, start.getUTCMonth(), day));
      if (t.getTime() >= start.getTime()) {
        produced++;
        yield t;
      }
    }
    period++;
  }
}

/** Expande um evento dentro da janela do mês. */
function expandEvent(
  ev: RawEvent,
  winStart: Date,
  winEnd: Date,
): { start: Date; end: Date }[] {
  const out: { start: Date; end: Date }[] = [];
  const duration = ev.dtend.getTime() - ev.dtstart.getTime();
  const rule = ev.rrule ? parseRule(ev.rrule) : null;
  if (!rule) {
    if (ev.dtend.getTime() >= winStart.getTime() && ev.dtstart.getTime() <= winEnd.getTime()) {
      out.push({ start: ev.dtstart, end: ev.dtend });
    }
    return out;
  }
  let idx = 0;
  for (const occ of occurrences(ev.dtstart, rule)) {
    if (rule.count !== undefined && idx >= rule.count) break;
    if (rule.until !== undefined && occ.getTime() > rule.until.getTime()) break;
    if (occ.getTime() > winEnd.getTime()) break;
    if (!ev.exdates.has(occ.getTime())) {
      const end = new Date(occ.getTime() + duration);
      if (end.getTime() >= winStart.getTime()) {
        out.push({ start: occ, end });
      }
    }
    idx++;
  }
  return out;
}

/** Faz o parse de um texto .ics em eventos "brutos". */
function parseIcs(text: string): RawEvent[] {
  const lines = unfold(text);
  const events: RawEvent[] = [];
  let inEvent = false;
  const props: IcsProp[] = [];

  const flush = () => {
    if (props.length === 0) return;
    const get = (name: string) => props.find((p) => p.name === name);
    const dtstart = get("DTSTART");
    if (!dtstart) return;
    const dtend = get("DTEND");
    const duration = get("DURATION");
    const allDay = dtstart.params.VALUE === "DATE" || dtstart.params.TZID === undefined && /^\d{8}$/.test(dtstart.value);
    const start = parseDateValue(dtstart.value, dtstart.params.TZID);
    let end: Date;
    if (dtend) {
      end = parseDateValue(dtend.value, dtend.params.TZID);
    } else if (duration) {
      end = new Date(start.getTime() + parseDuration(duration.value));
    } else {
      end = new Date(start.getTime() + (allDay ? 86_400_000 : 3_600_000));
    }
    const exdates = new Set<number>();
    for (const p of props) {
      if (p.name === "EXDATE") {
        const tz = p.params.TZID;
        for (const v of p.value.split(",")) {
          exdates.add(parseDateValue(v.trim(), tz).getTime());
        }
      }
    }
    events.push({
      uid: get("UID")?.value ?? `ev-${events.length}`,
      summary: get("SUMMARY")?.value ?? "Evento",
      location: get("LOCATION")?.value,
      description: get("DESCRIPTION")?.value,
      dtstart: start,
      dtend: end,
      allDay,
      rrule: get("RRULE")?.value,
      exdates,
    });
    props.length = 0;
  };

  for (const line of lines) {
    if (line.startsWith("BEGIN:VEVENT")) {
      inEvent = true;
      props.length = 0;
    } else if (line.startsWith("END:VEVENT")) {
      flush();
      inEvent = false;
    } else if (inEvent) {
      props.push(parseLine(line));
    }
  }
  return events;
}

/** Lê os .ics do cache e devolve os eventos brutos. */
function readCachedEvents(): RawEvent[] {
  if (!fs.existsSync(CAL_CACHE_DIR)) return [];
  const out: RawEvent[] = [];
  for (const file of fs.readdirSync(CAL_CACHE_DIR)) {
    if (!file.toLowerCase().endsWith(".ics")) continue;
    try {
      out.push(...parseIcs(fs.readFileSync(path.join(CAL_CACHE_DIR, file), "utf-8")));
    } catch {
      // ignora arquivo corrompido
    }
  }
  return out;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function dateKey(d: Date): string {
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

/** Monta o resultado mensal a partir dos eventos brutos do cache. */
function buildMonthResult(
  raw: RawEvent[],
  year: number,
  month: number,
  offline: boolean,
  syncedAt: string | null,
  error?: string,
): MonthCalendarResult {
  const winStart = new Date(Date.UTC(year, month - 1, 1));
  const winEnd = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
  const map = new Map<string, CalendarEvent[]>();
  for (const ev of raw) {
    for (const occ of expandEvent(ev, winStart, winEnd)) {
      const key = dateKey(occ.start);
      const list = map.get(key) ?? [];
      list.push({
        uid: ev.uid,
        summary: ev.summary,
        location: ev.location,
        description: ev.description,
        start: occ.start,
        end: occ.end,
        allDay: ev.allDay,
      });
      map.set(key, list);
    }
  }
  const days = [...map.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([date, items]) => ({
      date,
      items: items.sort((a, b) => a.start.getTime() - b.start.getTime()),
    }));
  return { year, month, days, syncedAt, offline, error };
}



/** Retorna os eventos do mês, sincronizando quando o cache estiver velho. */
export async function getMonthCalendar(
  config: CalendarSettings | undefined,
  year: number,
  month: number,
): Promise<MonthCalendarResult> {
  if (!isCalendarEnabled(config)) {
    return { year, month, days: [], syncedAt: null, offline: false };
  }
  const cached = readManifest();
  const staleMs = Math.max(config.sync_interval_seconds, 1) * 1000;
  const age = cached?.syncedAt ? Date.now() - new Date(cached.syncedAt).getTime() : Infinity;

  if (cached && age < staleMs) {
    return buildMonthResult(readCachedEvents(), year, month, false, cached.syncedAt);
  }

  if (!acquireLock(staleMs)) {
    if (cached) return buildMonthResult(readCachedEvents(), year, month, false, cached.syncedAt);
    return { year, month, days: [], syncedAt: null, offline: true, error: "Sincronização em andamento." };
  }

  try {
    await syncCalendar(config);
    releaseLock();
    const manifest = readManifest();
    return buildMonthResult(
      readCachedEvents(),
      year,
      month,
      false,
      manifest?.syncedAt ?? new Date().toISOString(),
    );
  } catch (cause) {
    releaseLock();
    const message = cause instanceof Error ? cause.message : "Falha ao sincronizar com o Nextcloud.";
    if (cached) return buildMonthResult(readCachedEvents(), year, month, true, cached.syncedAt, message);
    return { year, month, days: [], syncedAt: null, offline: true, error: message };
  }
}



