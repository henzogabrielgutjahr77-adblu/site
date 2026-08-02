import fs from "fs";
import path from "path";
import { XMLParser } from "fast-xml-parser";
import { CONTENT_DIR } from "@/lib/content";
import type { NextcloudSettings } from "@/lib/content";

/**
 * Integração com o Nextcloud via WebDAV usada como fonte oficial das fotos da
 * galeria do site.
 *
 * Estratégia de sincronização (evita consultar o Nextcloud a cada requisição):
 *  1. As imagens são baixadas para um cache local em
 *     `content/uploads/nextcloud/<pasta>/` (gitignored).
 *  2. Um manifesto JSON (`content/cache/nextcloud-gallery.json`) registra quais
 *     arquivos existem e de onde vieram.
 *  3. A página da galeria lê o manifesto; se ele estiver "velho" demais
 *     (mais que `sync_interval_seconds`), uma sincronização é disparada sob um
 *     lock para evitar consultas concorrentes (thundering herd).
 *
 * Toda a configuração (URL do WebDAV, pasta, usuário, intervalo, paginação)
 * fica no bloco `nextcloud` de `content/site/config.yml`. A senha/app password
 * é lida da env `NEXTCLOUD_PASSWORD` ou do arquivo gitignored
 * `content/site/nextcloud.secret`, nunca do arquivo versionado.
 */

/** Extensões de imagem suportadas na galeria (em minúsculas). */
export const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

/** Item exibido na galeria, independente da fonte (Nextcloud ou manual). */
export interface GalleryDisplayItem {
  /** Identificador estável do item. */
  id: string;
  /** URL servida pelo próprio site (ex.: /uploads/nextcloud/...). */
  src: string;
  /** Texto alternativo para acessibilidade. */
  alt: string;
  /** Legenda opcional. */
  caption?: string;
  /** Fonte do item: "nextcloud" (automático) ou "manual" (CMS atual). */
  source: "nextcloud" | "manual";
}

/** Imagem listada remotamente no WebDAV do Nextcloud. */
interface NextcloudRemoteImage {
  /** Nome do arquivo no Nextcloud. */
  name: string;
  /** Caminho absoluto (URL-encoded) dentro do WebDAV. */
  href: string;
  /** Tamanho em bytes. */
  size: number;
  /** Data de modificação no Nextcloud (ISO 8601). */
  mtime: string;
}

/** Item persistido no manifesto de cache local. */
interface ManifestItem {
  name: string;
  src: string;
  size: number;
  mtime: string;
}

interface GalleryManifest {
  version: 1;
  syncedAt: string;
  folder: string;
  items: ManifestItem[];
}

export interface NextcloudGalleryResult {
  items: GalleryDisplayItem[];
  /** Momento (ISO) da última sincronização bem-sucedida, ou null. */
  syncedAt: string | null;
  /** true quando o Nextcloud não pôde ser consultado (offline/erro). */
  offline: boolean;
  /** Mensagem amigável para exibição quando offline. */
  error?: string;
}

/** Erro da integração, com a flag `offline` para tratamento amigável. */
export class NextcloudError extends Error {
  readonly offline: boolean;

  constructor(message: string, offline: boolean) {
    super(message);
    this.name = "NextcloudError";
    this.offline = offline;
  }
}

const SECRET_FILE = path.join(CONTENT_DIR, "site", "nextcloud.secret");
const CACHE_DIR = path.join(CONTENT_DIR, "cache");
const MANIFEST_FILE = path.join(CACHE_DIR, "nextcloud-gallery.json");
const LOCK_FILE = path.join(CACHE_DIR, "nextcloud-sync.lock");
const UPLOADS_DIR = path.join(CONTENT_DIR, "uploads");
const LOCAL_ROOT = path.join(UPLOADS_DIR, "nextcloud");
/** Tempo máximo de espera em uma chamada ao WebDAV. */
const REQUEST_TIMEOUT_MS = 10_000;

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  removeNSPrefix: true,
  attributeNamePrefix: "",
});

/** Lê a senha/app password do WebDAV (env primeiro, depois arquivo gitignored). */
export function getNextcloudPassword(): string {
  if (process.env.NEXTCLOUD_PASSWORD) return process.env.NEXTCLOUD_PASSWORD;
  try {
    return fs.readFileSync(SECRET_FILE, "utf-8").trim();
  } catch {
    return "";
  }
}

/** Indica se a integração está ativa (config presente e habilitada). */
export function isNextcloudEnabled(cfg?: NextcloudSettings): cfg is NextcloudSettings {
  return cfg !== undefined && cfg.enabled === true;
}

/** Converte a pasta configurada em um nome de diretório local seguro. */
function localFolderName(cfg: NextcloudSettings): string {
  const safe = cfg.folder
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9._/-]+/g, "-")
    .replace(/\/+/g, "/")
    .replace(/^-+|-+$/g, "");
  return safe || "galeria";
}

function localFolder(cfg: NextcloudSettings): string {
  return path.join(LOCAL_ROOT, localFolderName(cfg));
}

/** Monta a URL completa da pasta (com encode por segmento e barra final). */
function folderUrl(cfg: NextcloudSettings): string {
  const base = cfg.webdav_url.replace(/\/+$/, "");
  const segments = cfg.folder
    .split("/")
    .map((s) => s.trim())
    .filter(Boolean)
    .map(encodeURIComponent)
    .join("/");
  return `${base}/${segments}/`;
}

/** Cabeçalhos de autenticação Basic do WebDAV. */
function authHeaders(cfg: NextcloudSettings): Record<string, string> {
  const token = Buffer.from(`${cfg.username}:${getNextcloudPassword()}`).toString("base64");
  return { Authorization: `Basic ${token}` };
}

/** Executa uma chamada WebDAV com timeout, classificando erros de rede como offline. */
async function webdavRequest(
  cfg: NextcloudSettings,
  method: string,
  url: string,
  extraHeaders: Record<string, string> = {},
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, {
      method,
      headers: { ...authHeaders(cfg), ...extraHeaders },
      signal: controller.signal,
      cache: "no-store",
    });
  } catch (cause) {
    throw new NextcloudError(
      "Não foi possível conectar ao Nextcloud (servidor offline ou endereço inválido).",
      true,
    );
  } finally {
    clearTimeout(timer);
  }
}

/** Normaliza um valor do parser XML para array (evita checagens de singular/plural). */
function toArray<T>(value: T | T[] | undefined): T[] {
  if (Array.isArray(value)) return value;
  return value === undefined ? [] : [value];
}

/** Converte a string de data do WebDAV (RFC 1123) em ISO 8601. */
function toIso(raw: string): string {
  const date = new Date(raw);
  return isNaN(date.getTime()) ? new Date(0).toISOString() : date.toISOString();
}

/** Lista as imagens da pasta do Nextcloud via PROPFIND (Depth: 1). */
async function listRemoteImages(cfg: NextcloudSettings): Promise<NextcloudRemoteImage[]> {
  const res = await webdavRequest(cfg, "PROPFIND", folderUrl(cfg), { Depth: "1" });
  if (res.status === 401 || res.status === 403) {
    throw new NextcloudError("Credenciais do WebDAV inválidas. Verifique usuário e senha.", false);
  }
  if (res.status === 404) {
    throw new NextcloudError("Pasta configurada não encontrada no Nextcloud.", false);
  }
  if (!res.ok) {
    throw new NextcloudError(`Falha ao listar a pasta do Nextcloud (HTTP ${res.status}).`, true);
  }

  const parsed = xmlParser.parse(await res.text());
  const items: NextcloudRemoteImage[] = [];

  for (const response of toArray(parsed?.multistatus?.response)) {
    const href = String(response?.href ?? "");
    if (!href || href.endsWith("/")) continue;

    const name = decodeURIComponent(href.split("/").filter(Boolean).pop() ?? "");
    const ext = path.extname(name).toLowerCase();
    if (!IMAGE_EXTENSIONS.has(ext)) continue;

    const propstats = toArray(response?.propstat);
    const okStat = propstats.find((p) => String(p?.status ?? "").includes("200")) ?? propstats[0];
    const prop = okStat?.prop ?? {};

    const size = Number(prop.getcontentlength ?? 0) || 0;
    const mtime = toIso(String(prop.getlastmodified ?? ""));

    items.push({ name, href, size, mtime });
  }

  // Mais recentes primeiro (data de modificação no Nextcloud).
  return items.sort((a, b) => (a.mtime < b.mtime ? 1 : -1));
}

/** Baixa um arquivo do WebDAV para o cache local. */
async function downloadRemote(
  cfg: NextcloudSettings,
  href: string,
  localPath: string,
): Promise<void> {
  const url = new URL(href, cfg.webdav_url).toString();
  const res = await webdavRequest(cfg, "GET", url);
  if (!res.ok) {
    throw new NextcloudError(`Falha ao baixar imagem do Nextcloud (HTTP ${res.status}).`, true);
  }
  fs.mkdirSync(path.dirname(localPath), { recursive: true });
  fs.writeFileSync(localPath, Buffer.from(await res.arrayBuffer()));
}

/** Gera um nome de arquivo local seguro a partir do nome remoto. */
function sanitizeFileName(name: string): string {
  const ext = path.extname(name);
  const base = path.basename(name, ext);
  const safeBase =
    base
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^A-Za-z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "imagem";
  return `${safeBase}${ext.toLowerCase()}`;
}

/** Lê o manifesto do cache (null se ainda não existir). */
function readManifest(): GalleryManifest | null {
  try {
    const raw = JSON.parse(fs.readFileSync(MANIFEST_FILE, "utf-8"));
    if (raw?.version !== 1 || !Array.isArray(raw?.items)) return null;
    return raw as GalleryManifest;
  } catch {
    return null;
  }
}

/** Converte o manifesto em itens de exibição, descartando arquivos sumidos do cache. */
function manifestToResult(manifest: GalleryManifest, offline: boolean): NextcloudGalleryResult {
  const items = manifest.items
    .map((item) => ({
      id: `nextcloud-${item.name}`,
      src: item.src,
      alt: item.name,
      caption: item.name,
      source: "nextcloud" as const,
    }))
    .filter((item) => {
      // Garante que só exibimos imagens que realmente existem no cache local.
      const rel = item.src.replace(/^\/uploads\//, "");
      return fs.existsSync(path.join(UPLOADS_DIR, rel));
    });
  return { items, syncedAt: manifest.syncedAt, offline };
}

/**
 * Executa a sincronização completa: lista o Nextcloud, baixa imagens novas,
 * remove as que saíram da pasta e atualiza o manifesto.
 */
export async function syncNextcloudGallery(
  cfg: NextcloudSettings,
): Promise<NextcloudGalleryResult> {
  const remote = await listRemoteImages(cfg);
  const dir = localFolder(cfg);
  const keepLocal = new Set<string>();

  const items: (ManifestItem & { localPath: string })[] = remote.map((image) => {
    const file = sanitizeFileName(image.name);
    let localName = file;
    const rel = path.join(localFolderName(cfg), localName);
    const localPath = path.join(LOCAL_ROOT, rel);
    keepLocal.add(localPath);
    const src = `/uploads/nextcloud/${rel.split(path.sep).join("/")}`;
    return { name: image.name, src, size: image.size, mtime: image.mtime, localPath };
  });

  // Remove arquivos locais que não estão mais na pasta do Nextcloud.
  if (fs.existsSync(dir)) {
    for (const file of fs.readdirSync(dir)) {
      const localPath = path.join(dir, file);
      if (fs.statSync(localPath).isFile() && !keepLocal.has(localPath)) {
        fs.rmSync(localPath, { force: true });
      }
    }
  }

  // Baixa imagens novas (as já presentes são mantidas).
  for (const item of items) {
    const remoteImage = remote.find((r) => r.name === item.name);
    if (!remoteImage) continue;
    if (!fs.existsSync(item.localPath)) {
      await downloadRemote(cfg, remoteImage.href, item.localPath);
    }
  }

  const manifest: GalleryManifest = {
    version: 1,
    syncedAt: new Date().toISOString(),
    folder: cfg.folder,
    items: items.map(({ name, src, size, mtime }) => ({ name, src, size, mtime })),
  };
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2));

  return manifestToResult(manifest, false);
}

/** Lock simples baseado em arquivo para evitar sincronizações concorrentes. */
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

/**
 * Retorna as imagens da galeria vindas do Nextcloud.
 *
 * Usa o cache local enquanto ele está "fresco" (menos que `sync_interval_seconds`).
 * Quando expira, sincroniza sob lock. Se o Nextcloud estiver offline, devolve o
 * cache existente (ou vazio) com `offline: true` e uma mensagem amigável — a
 * página nunca quebra.
 */
export async function getNextcloudGallery(
  config: NextcloudSettings | undefined,
): Promise<NextcloudGalleryResult> {
  if (!isNextcloudEnabled(config)) {
    return { items: [], syncedAt: null, offline: false };
  }

  const cached = readManifest();
  const staleMs = Math.max(config.sync_interval_seconds, 1) * 1000;
  const age = cached?.syncedAt ? Date.now() - new Date(cached.syncedAt).getTime() : Infinity;

  if (cached && age < staleMs) {
    return manifestToResult(cached, false);
  }

  if (!acquireLock(staleMs)) {
    // Outra requisição já está sincronizando: usa o cache atual, se houver.
    return cached
      ? manifestToResult(cached, false)
      : { items: [], syncedAt: null, offline: true, error: "Sincronização em andamento." };
  }

  try {
    const result = await syncNextcloudGallery(config);
    releaseLock();
    return result;
  } catch (cause) {
    releaseLock();
    const error =
      cause instanceof NextcloudError
        ? cause
        : new NextcloudError("Falha ao sincronizar com o Nextcloud.", true);
    return cached
      ? { ...manifestToResult(cached, true), error: error.message }
      : { items: [], syncedAt: null, offline: true, error: error.message };
  }
}
