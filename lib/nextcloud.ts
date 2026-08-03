import fs from "fs";
import path from "path";
import { CONTENT_DIR } from "@/lib/content";
import type { NextcloudSettings } from "@/lib/content";
import { downloadRemoteFile, listRemoteImages, sanitizeFileName } from "@/lib/nextcloud-webdav";
import { processGallery } from "@/lib/gallery-processor";
import { NextcloudError } from "@/lib/nextcloud-webdav";

// Re-exports mantidos para compatibilidade com páginas e painel admin.
export { IMAGE_EXTENSIONS, NextcloudError, getNextcloudPassword } from "@/lib/nextcloud-webdav";
export type { NextcloudRemoteImage } from "@/lib/nextcloud-webdav";

/**
 * Sincronização da galeria do site com o Nextcloud (WebDAV).
 *
 * Estratégia:
 *  1. O processador (`processGallery`) garante que as pastas `site/` e
 *     `thumbs/` do Nextcloud estão sempre em dia com a pasta `originais/`.
 *  2. A galeria lê **somente** as pastas `site/` e `thumbs/`:
 *       - `thumbs/` monta a grade da galeria;
 *       - `site/` é usada ao abrir a foto.
 *     As originais nunca são baixadas nem exibidas pelo site.
 *  3. As versões de exibição são baixadas para um cache local em
 *     `content/uploads/nextcloud/<pasta>/thumbs|site/` (gitignored) e um
 *     manifesto JSON (`content/cache/nextcloud-gallery.json`) registra o estado.
 *  4. A página lê o manifesto; se ele estiver "velho" demais (mais que
 *     `sync_interval_seconds`), uma sincronização é disparada sob um lock para
 *     evitar consultas concorrentes (thundering herd).
 *
 * A configuração (URL do WebDAV, pasta, usuário, intervalo, paginação) fica no
 * bloco `nextcloud` de `content/site/config.yml`. A senha é lida da env
 * `NEXTCLOUD_PASSWORD` ou do arquivo gitignored `content/site/nextcloud.secret`.
 */

/** Item exibido na galeria, independente da fonte (Nextcloud ou manual). */
export interface GalleryDisplayItem {
  /** Identificador estável do item. */
  id: string;
  /** URL da miniatura para a grade (pasta thumbs/ do Nextcloud). */
  src: string;
  /** URL da versão otimizada para abrir a foto (pasta site/ do Nextcloud). */
  srcFull?: string;
  /** Texto alternativo para acessibilidade. */
  alt: string;
  /** Legenda opcional. */
  caption?: string;
  /** Fonte do item: "nextcloud" (automático) ou "manual" (CMS atual). */
  source: "nextcloud" | "manual";
}

/** Item persistido no manifesto de cache local. */
interface ManifestItem {
  name: string;
  /** URL da miniatura (grade). */
  src: string;
  /** URL da versão otimizada (tela cheia). */
  srcFull: string;
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

const CACHE_DIR = path.join(CONTENT_DIR, "cache");
const MANIFEST_FILE = path.join(CACHE_DIR, "nextcloud-gallery.json");
const LOCK_FILE = path.join(CACHE_DIR, "nextcloud-sync.lock");
const UPLOADS_DIR = path.join(CONTENT_DIR, "uploads");
const LOCAL_ROOT = path.join(UPLOADS_DIR, "nextcloud");
/** Tempo máximo de uma sincronização antes de outra requisição assumir. */
const SYNC_LOCK_MAX_MS = 5 * 60_000;

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
      srcFull: item.srcFull,
      alt: item.name,
      caption: item.name,
      source: "nextcloud" as const,
    }))
    .filter((item) => {
      // Garante que só exibimos miniaturas que realmente existem no cache local.
      const rel = item.src.replace(/^\/uploads\//, "");
      return fs.existsSync(path.join(UPLOADS_DIR, rel));
    });
  return { items, syncedAt: manifest.syncedAt, offline };
}

/** Baixa um arquivo do WebDAV para o cache local. */
async function downloadTo(cfg: NextcloudSettings, href: string, localPath: string): Promise<void> {
  const data = await downloadRemoteFile(cfg, href);
  fs.mkdirSync(path.dirname(localPath), { recursive: true });
  fs.writeFileSync(localPath, data);
}

/**
 * Executa a sincronização completa:
 *  1. processa novas originais → site/ e thumbs/ no Nextcloud;
 *  2. baixa as versões de exibição novas (thumbs/ para a grade e site/ para a
 *     tela cheia) e remove as que saíram da pasta;
 *  3. atualiza o manifesto.
 */
export async function syncNextcloudGallery(
  cfg: NextcloudSettings,
): Promise<NextcloudGalleryResult> {
  // 1. Converte originais novas/alteradas em site/ e thumbs/ (ignora já processadas).
  await processGallery(cfg);

  // 2. Lista as versões de exibição (thumbs/ + site/), nunca as originais.
  const [remoteThumbs, remoteSites] = await Promise.all([
    listRemoteImages(cfg, "thumbs", true),
    listRemoteImages(cfg, "site", true),
  ]);
  const siteByName = new Map(remoteSites.map((s) => [s.name, s]));

  const folderName = localFolderName(cfg);
  const keepThumb = new Set<string>();
  const keepSite = new Set<string>();

  const items = remoteThumbs.map((thumb) => {
    const file = sanitizeFileName(thumb.name);
    const thumbRel = path.join(folderName, "thumbs", file);
    const siteRel = path.join(folderName, "site", file);
    const thumbLocal = path.join(LOCAL_ROOT, thumbRel);
    const siteLocal = path.join(LOCAL_ROOT, siteRel);
    keepThumb.add(thumbLocal);
    keepSite.add(siteLocal);
    const siteRemote = siteByName.get(thumb.name);
    const thumbSrc = `/uploads/nextcloud/${thumbRel.split(path.sep).join("/")}`;
    const siteSrc = siteRemote
      ? `/uploads/nextcloud/${siteRel.split(path.sep).join("/")}`
      : thumbSrc;
    return {
      name: thumb.name,
      src: thumbSrc,
      srcFull: siteSrc,
      size: thumb.size,
      mtime: thumb.mtime,
      thumbLocal,
      siteLocal,
      thumbHref: thumb.href,
      siteHref: siteRemote?.href ?? null,
    };
  });

  // Remove arquivos locais órfãos das pastas thumbs/ e site/.
  for (const base of [path.join(localFolder(cfg), "thumbs"), path.join(localFolder(cfg), "site")]) {
    if (!fs.existsSync(base)) continue;
    for (const file of fs.readdirSync(base)) {
      const p = path.join(base, file);
      if (fs.statSync(p).isFile() && !keepThumb.has(p) && !keepSite.has(p)) {
        fs.rmSync(p, { force: true });
      }
    }
  }

  // Baixa as versões novas (as já presentes são mantidas).
  for (const item of items) {
    if (!fs.existsSync(item.thumbLocal) && item.thumbHref) {
      await downloadTo(cfg, item.thumbHref, item.thumbLocal);
    }
    if (item.srcFull !== item.src && !fs.existsSync(item.siteLocal) && item.siteHref) {
      await downloadTo(cfg, item.siteHref, item.siteLocal);
    }
  }

  const manifest: GalleryManifest = {
    version: 1,
    syncedAt: new Date().toISOString(),
    folder: cfg.folder,
    items: items.map(({ name, src, srcFull, size, mtime }) => ({
      name,
      src,
      srcFull,
      size,
      mtime,
    })),
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

  if (!acquireLock(Math.max(staleMs, SYNC_LOCK_MAX_MS))) {
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
