import fs from "fs";
import path from "path";
import sharp from "sharp";
import { CONTENT_DIR } from "@/lib/content";
import type { NextcloudSettings } from "@/lib/content";
import {
  IMAGE_EXTENSIONS,
  downloadRemoteFile,
  ensureRemoteFolder,
  listRemoteImages,
  removeRemoteFile,
  sanitizeFileName,
  uploadRemoteFile,
} from "@/lib/nextcloud-webdav";

/**
 * Processador automático da galeria: converte as fotos enviadas para a pasta
 * `originais/` do Nextcloud em duas versões:
 *
 *   - `site/`   → imagem otimizada em alta qualidade para abrir a foto;
 *   - `thumbs/` → miniatura 4:5 (vertical) usada pela grade da galeria.
 *
 * Regras:
 *   - NUNCA modifica/apaga a imagem em `originais/`.
 *   - Só processa imagens novas ou alteradas (tamanho + data de modificação) —
 *     nunca reconverte o que já foi processado.
 *   - Se a original for substituída, site/ e thumbs/ são atualizadas.
 *   - Se a original for removida, as versões correspondentes são removidas.
 *
 * As thumbnails usam corte centrado conservador (sem smart crop, sem detecção
 * de rosto, sem IA): enquadra-se o centro da foto, preservando a composição e
 * mostrando o máximo de fundo possível.
 */

const CACHE_DIR = path.join(CONTENT_DIR, "cache");
const PROCESSED_FILE = path.join(CACHE_DIR, "gallery-processed.json");
const PROCESS_LOCK_FILE = path.join(CACHE_DIR, "gallery-process.lock");
/** Tempo máximo que um processamento pode durar antes de outro assumir. */
const PROCESS_LOCK_MAX_MS = 5 * 60_000;

/** Maior dimensão (px) da versão otimizada para exibição (pasta site/). */
const SITE_MAX_DIM = 1600;
const SITE_QUALITY = 82;

/** Proporção da thumbnail: 4:5 vertical. */
const THUMB_W = 640;
const THUMB_H = 800;
const THUMB_QUALITY = 80;

const MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
};

/** Assinatura de processamento: a original é reprocessada quando mudar (ETag). */
interface ProcessedSignature {
  size: number;
  mtime: string;
  etag: string;
}

type ProcessedState = Record<string, ProcessedSignature>;

function readProcessed(): ProcessedState {
  try {
    const raw = JSON.parse(fs.readFileSync(PROCESSED_FILE, "utf-8"));
    return raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
  } catch {
    return {};
  }
}

function writeProcessed(state: ProcessedState): void {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(PROCESSED_FILE, JSON.stringify(state, null, 2));
}

/** Lock simples baseado em arquivo para evitar processamentos concorrentes. */
function acquireLock(maxAgeMs: number): boolean {
  try {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
    if (fs.existsSync(PROCESS_LOCK_FILE)) {
      const born = Number(fs.readFileSync(PROCESS_LOCK_FILE, "utf-8") || 0);
      if (!isNaN(born) && Date.now() - born < maxAgeMs) return false;
    }
    fs.writeFileSync(PROCESS_LOCK_FILE, String(Date.now()));
    return true;
  } catch {
    return false;
  }
}

function releaseLock(): void {
  try {
    fs.rmSync(PROCESS_LOCK_FILE, { force: true });
  } catch {
    // ignora
  }
}

function outFormat(ext: string): "jpeg" | "png" | "webp" | "avif" {
  if (ext === ".png") return "png";
  if (ext === ".webp") return "webp";
  if (ext === ".avif") return "avif";
  return "jpeg";
}

/** Aplica o encoder correspondente à extensão, mantendo o formato original. */
function encode(img: sharp.Sharp, ext: string, quality: number): sharp.Sharp {
  switch (outFormat(ext)) {
    case "png":
      return img.png({ compressionLevel: 8 });
    case "webp":
      return img.webp({ quality });
    case "avif":
      return img.avif({ quality });
    default:
      return img.jpeg({ quality, mozjpeg: true });
  }
}

/** Versão otimizada para a pasta site/ (mantém proporção, max 1600px). */
async function generateSiteVersion(buf: Buffer, ext: string): Promise<Buffer> {
  return encode(
    sharp(buf)
      .rotate()
      .resize(SITE_MAX_DIM, SITE_MAX_DIM, { fit: "inside", withoutEnlargement: true }),
    ext,
    SITE_QUALITY,
  ).toBuffer();
}

/** Miniatura 4:5 (vertical) para a pasta thumbs/ — corte centrado conservador. */
async function generateThumbVersion(buf: Buffer, ext: string): Promise<Buffer> {
  return encode(
    sharp(buf)
      .rotate()
      .resize(THUMB_W, THUMB_H, { fit: "cover", position: "centre" }),
    ext,
    THUMB_QUALITY,
  ).toBuffer();
}

/**
 * Sincroniza as pastas site/ e thumbs/ com a pasta originais/ do Nextcloud.
 * Seguro para chamar em todo ciclo de sincronização: imagens já processadas e
 * sem alteração são ignoradas instantaneamente (apenas uma PROPFIND).
 */
export async function processGallery(cfg: NextcloudSettings): Promise<void> {
  if (!acquireLock(PROCESS_LOCK_MAX_MS)) {
    // Outro processamento em andamento (ex.: requisição concorrente).
    return;
  }

  try {
    const originals = await listRemoteImages(cfg, "originais");
    const state = readProcessed();
    const still = new Set(originals.map((o) => o.name));

    const pending = originals.filter((o) => {
      const prev = state[o.name];
      return !(
        prev &&
        prev.size === o.size &&
        prev.mtime === o.mtime &&
        prev.etag === o.etag
      );
    });
    const removed = Object.keys(state).filter((name) => !still.has(name));
    let changed = false;

    if (pending.length > 0) {
      await ensureRemoteFolder(cfg, "site");
      await ensureRemoteFolder(cfg, "thumbs");
    }

    for (const original of pending) {
      const ext = path.extname(original.name).toLowerCase();
      if (!IMAGE_EXTENSIONS.has(ext)) continue;
      const file = sanitizeFileName(original.name);
      try {
        const buf = await downloadRemoteFile(cfg, original.href);
        const siteBuf = await generateSiteVersion(buf, ext);
        const thumbBuf = await generateThumbVersion(buf, ext);
        await uploadRemoteFile(cfg, "site", file, siteBuf, MIME_BY_EXT[ext] ?? "image/jpeg");
        await uploadRemoteFile(cfg, "thumbs", file, thumbBuf, MIME_BY_EXT[ext] ?? "image/jpeg");
        state[original.name] = {
          size: original.size,
          mtime: original.mtime,
          etag: original.etag,
        };
        changed = true;
        console.log(`[galeria] processado: ${original.name}`);
      } catch (cause) {
        // Não registra no estado: será reprocessado na próxima sincronização.
        console.error(
          `[galeria] erro ao processar ${original.name}:`,
          cause instanceof Error ? cause.message : cause,
        );
      }
    }

    for (const name of removed) {
      const file = sanitizeFileName(name);
      await removeRemoteFile(cfg, "site", file).catch(() => {});
      await removeRemoteFile(cfg, "thumbs", file).catch(() => {});
      delete state[name];
      changed = true;
      console.log(`[galeria] removido: ${name}`);
    }

    if (changed) writeProcessed(state);
  } finally {
    releaseLock();
  }
}
