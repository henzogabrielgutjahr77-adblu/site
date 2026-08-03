import fs from "fs";
import path from "path";
import { XMLParser } from "fast-xml-parser";
import { CONTENT_DIR } from "@/lib/content";
import type { NextcloudSettings } from "@/lib/content";

/**
 * Camada de baixo nível de acesso WebDAV ao Nextcloud, compartilhada entre a
 * sincronização da galeria (`lib/nextcloud.ts`) e o processador de imagens
 * (`lib/gallery-processor.ts`). Este módulo não conhece a estrutura interna da
 * galeria: lida apenas com autenticação e chamadas WebDAV (listar, baixar,
 * enviar, remover e criar pastas).
 */

/** Extensões de imagem suportadas na galeria (em minúsculas). */
export const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

/** Imagem listada remotamente no WebDAV do Nextcloud. */
export interface NextcloudRemoteImage {
  /** Nome do arquivo no Nextcloud. */
  name: string;
  /** Caminho absoluto (URL-encoded) dentro do WebDAV. */
  href: string;
  /** Tamanho em bytes. */
  size: number;
  /** Data de modificação no Nextcloud (ISO 8601). */
  mtime: string;
  /** ETag do arquivo no Nextcloud (muda quando o conteúdo muda). */
  etag: string;
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

/** Cabeçalhos de autenticação Basic do WebDAV. */
export function authHeaders(cfg: NextcloudSettings): Record<string, string> {
  const token = Buffer.from(`${cfg.username}:${getNextcloudPassword()}`).toString("base64");
  return { Authorization: `Basic ${token}` };
}

/** Executa uma chamada WebDAV com timeout, classificando erros de rede como offline. */
export async function webdavRequest(
  cfg: NextcloudSettings,
  method: string,
  url: string,
  extraHeaders: Record<string, string> = {},
  body?: BodyInit | Buffer,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, {
      method,
      headers: { ...authHeaders(cfg), ...extraHeaders },
      body: body as unknown as BodyInit | undefined,
      signal: controller.signal,
      cache: "no-store",
    });
  } catch {
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

/** Monta a URL completa da pasta (com encode por segmento e barra final). */
export function folderUrl(cfg: NextcloudSettings, sub?: string): string {
  const base = cfg.webdav_url.replace(/\/+$/, "");
  const segments = cfg.folder
    .split("/")
    .map((s) => s.trim())
    .filter(Boolean)
    .map(encodeURIComponent)
    .join("/");
  const subPath = sub
    ? sub
        .split("/")
        .filter(Boolean)
        .map(encodeURIComponent)
        .join("/") + "/"
    : "";
  return `${base}/${segments}/${subPath}`;
}

/** Gera um nome de arquivo local seguro a partir do nome remoto. */
export function sanitizeFileName(name: string): string {
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

/**
 * Lista as imagens de uma subpasta do Nextcloud via PROPFIND (Depth: 1).
 * `allowMissing` trata pastas que ainda não existem como vazias (útil quando a
 * estrutura site/ e thumbs/ ainda não foi criada).
 */
export async function listRemoteImages(
  cfg: NextcloudSettings,
  sub?: string,
  allowMissing = false,
): Promise<NextcloudRemoteImage[]> {
  const res = await webdavRequest(cfg, "PROPFIND", folderUrl(cfg, sub), { Depth: "1" });
  if (res.status === 401 || res.status === 403) {
    throw new NextcloudError("Credenciais do WebDAV inválidas. Verifique usuário e senha.", false);
  }
  if (res.status === 404) {
    if (allowMissing) return [];
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
    const etag = String(prop.getetag ?? "").replace(/^"|"$/g, "");

    items.push({ name, href, size, mtime, etag });
  }

  // Mais recentes primeiro (data de modificação no Nextcloud).
  return items.sort((a, b) => (a.mtime < b.mtime ? 1 : -1));
}

/** Baixa um arquivo do WebDAV e retorna o Buffer. */
export async function downloadRemoteFile(cfg: NextcloudSettings, href: string): Promise<Buffer> {
  const url = new URL(href, cfg.webdav_url).toString();
  const res = await webdavRequest(cfg, "GET", url);
  if (!res.ok) {
    throw new NextcloudError(`Falha ao baixar arquivo do Nextcloud (HTTP ${res.status}).`, true);
  }
  return Buffer.from(await res.arrayBuffer());
}

/** Envia um arquivo (PUT) para uma subpasta do Nextcloud. */
export async function uploadRemoteFile(
  cfg: NextcloudSettings,
  sub: string,
  name: string,
  data: Buffer,
  contentType: string,
): Promise<void> {
  const url = `${folderUrl(cfg, sub)}${encodeURIComponent(name)}`;
  const res = await webdavRequest(cfg, "PUT", url, { "Content-Type": contentType }, data);
  if (res.status !== 201 && res.status !== 204) {
    throw new NextcloudError(`Falha ao enviar ${name} para o Nextcloud (HTTP ${res.status}).`, true);
  }
}

/** Remove um arquivo (DELETE) de uma subpasta do Nextcloud. */
export async function removeRemoteFile(
  cfg: NextcloudSettings,
  sub: string,
  name: string,
): Promise<void> {
  const url = `${folderUrl(cfg, sub)}${encodeURIComponent(name)}`;
  const res = await webdavRequest(cfg, "DELETE", url);
  if (res.status !== 200 && res.status !== 204 && res.status !== 404) {
    throw new NextcloudError(`Falha ao remover ${name} do Nextcloud (HTTP ${res.status}).`, true);
  }
}

/** Garante que uma subpasta exista no Nextcloud (MKCOL quando necessário). */
export async function ensureRemoteFolder(cfg: NextcloudSettings, sub: string): Promise<void> {
  const url = folderUrl(cfg, sub);
  const res = await webdavRequest(cfg, "PROPFIND", url, { Depth: "0" });
  if (res.status === 404) {
    const mk = await webdavRequest(cfg, "MKCOL", url);
    if (mk.status !== 201) {
      throw new NextcloudError(`Falha ao criar a pasta ${sub} no Nextcloud.`, true);
    }
  } else if (res.status !== 207 && !res.ok) {
    throw new NextcloudError(`Falha ao verificar a pasta ${sub} no Nextcloud.`, true);
  }
}
