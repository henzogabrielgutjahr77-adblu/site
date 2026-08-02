"use server";

import crypto from "crypto";
import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import matter from "gray-matter";
import yaml from "js-yaml";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { CONTENT_DIR } from "@/lib/content";
import { attemptLogin, destroySession, isAuthed } from "@/lib/auth";

const PAGES_DIR = path.join(CONTENT_DIR, "pages");
const SITE_FILE = path.join(CONTENT_DIR, "site", "config.yml");
const GALLERY_FILE = path.join(CONTENT_DIR, "gallery", "index.md");
const UPLOADS_DIR = path.join(CONTENT_DIR, "uploads");
const SLUG_RE = /^[a-z0-9-]{1,64}$/;

const CONFIG_FIELDS: { key: string; label: string }[] = [
  { key: "nome", label: "Nome completo" },
  { key: "nome_curto", label: "Nome curto" },
  { key: "titulo_hero", label: "Título do hero" },
  { key: "local", label: "Local" },
  { key: "hero_imagem", label: "Imagem do hero (URL ou /uploads/…)" },
  { key: "facebook", label: "Facebook (URL)" },
  { key: "instagram", label: "Instagram (URL)" },
  { key: "youtube", label: "YouTube (URL)" },
  { key: "slogan", label: "Slogan" },
  { key: "descricao", label: "Descrição" },
  { key: "cta", label: "Botão CTA" },
  { key: "whatsapp", label: "WhatsApp (texto)" },
  { key: "whatsapp_url", label: "WhatsApp (URL)" },
  { key: "endereco", label: "Endereço" },
  { key: "email", label: "Email" },
  { key: "horario_domingo", label: "Horário domingo" },
  { key: "horario_quinta", label: "Horário quinta" },
];

const ALLOWED_MIME = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);
const EXT_BY_MIME: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
  "image/gif": ".gif",
};
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export type ActionResult = { ok?: string; error?: string };

async function requireAuth(): Promise<void> {
  if (!(await isAuthed())) redirect("/admin");
}

async function getIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]?.trim() || "local";
  return h.get("x-real-ip") || "local";
}

function syncToGit() {
  try {
    const cwd = path.join(process.cwd());
    execFileSync("git", ["add", "-A"], { cwd, stdio: "ignore" });
    try {
      execFileSync(
        "git",
        [
          "-c",
          "user.name=gabriel",
          "-c",
          "user.email=gabriel@localhost",
          "commit",
          "-m",
          "Conteúdo atualizado via CMS",
          "-q",
        ],
        { cwd, stdio: "ignore" },
      );
    } catch {}
    execFileSync("git", ["pull", "--ff-only", "-q"], { cwd, stdio: "ignore" });
    execFileSync("git", ["push", "origin", "main", "-q"], { cwd, stdio: "ignore" });
  } catch {}
}

export async function loginAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const password = String(formData.get("password") ?? "");
  const ip = await getIp();
  const result = await attemptLogin(ip, password);
  if (result === "ok") redirect("/admin");
  if (result === "locked") {
    return { error: "Muitas tentativas falhas. Aguarde 15 minutos." };
  }
  return { error: "Senha incorreta." };
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/admin");
}

export async function saveConfigAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireAuth();
  const current = yaml.load(fs.readFileSync(SITE_FILE, "utf-8")) as Record<string, unknown>;
  const updated: Record<string, unknown> = {};
  for (const field of CONFIG_FIELDS) {
    updated[field.key] = String(formData.get(field.key) ?? "").trim();
  }
  for (const [key, value] of Object.entries(current)) {
    if (!(key in updated)) updated[key] = value;
  }
  fs.writeFileSync(
    SITE_FILE,
    yaml.dump(updated, { lineWidth: 120, noRefs: true }) + "\n",
  );
  syncToGit();
  return { ok: "Configurações salvas e sincronizadas." };
}

export async function savePageAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireAuth();
  const slug = String(formData.get("slug") ?? "");
  if (!SLUG_RE.test(slug)) return { error: "Slug inválido." };
  const file = path.join(PAGES_DIR, `${slug}.md`);
  if (!fs.existsSync(file)) return { error: "Página não encontrada." };
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Título é obrigatório." };
  const order = Number(formData.get("order") ?? 10);
  const body = String(formData.get("body") ?? "");
  const out = matter.stringify(body.replace(/\n+$/, "") + "\n", { title, order });
  fs.writeFileSync(file, out);
  syncToGit();
  return { ok: `Página "${title}" salva e sincronizada.` };
}

export async function saveGalleryAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireAuth();
  const title = String(formData.get("title") ?? "").trim();
  const imagens = String(formData.get("imagens") ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [image, alt] = line.split("|").map((part) => part.trim());
      return alt ? { image, alt } : { image };
    });
  const out = matter.stringify("", { title, imagens });
  fs.writeFileSync(GALLERY_FILE, out);
  syncToGit();
  return { ok: "Galeria salva e sincronizada." };
}

export async function uploadImageAction(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireAuth();
  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "Nenhum arquivo enviado." };
  if (!ALLOWED_MIME.has(file.type)) {
    return { error: "Tipo de imagem não permitido (use PNG, JPG, WEBP ou GIF)." };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { error: "Imagem muito grande (máximo 5 MB)." };
  }
  const name = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}${EXT_BY_MIME[file.type]}`;
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  fs.writeFileSync(path.join(UPLOADS_DIR, name), Buffer.from(await file.arrayBuffer()));
  syncToGit();
  return { ok: `/uploads/${name}` };
}
