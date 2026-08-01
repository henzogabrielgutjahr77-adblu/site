import fs from "fs";
import path from "path";
import matter from "gray-matter";
import yaml from "js-yaml";

export const CONTENT_DIR = path.join(process.cwd(), "content");

export interface SiteConfig {
  nome: string;
  titulo_hero: string;
  local: string;
  hero_imagem?: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
  slogan: string;
  descricao: string;
  cta: string;
  whatsapp: string;
  whatsapp_url: string;
  endereco: string;
  email: string;
  horario_domingo: string;
  horario_quinta: string;
}

export interface PageContent {
  title: string;
  order: number;
  body: string;
}

export interface PostContent {
  title: string;
  date: string;
  description: string;
  image?: string;
  body: string;
  slug: string;
}

export interface GalleryItem {
  image?: string;
  alt?: string;
}

export interface GalleryContent {
  title: string;
  imagens: GalleryItem[];
}

export function getSiteConfig(): SiteConfig {
  const file = path.join(CONTENT_DIR, "site", "config.yml");
  const raw = fs.readFileSync(file, "utf-8");
  return yaml.load(raw) as SiteConfig;
}

export function getPage(slug: string): PageContent | null {
  const file = path.join(CONTENT_DIR, "pages", `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  const { data, content } = matter(fs.readFileSync(file, "utf-8"));
  return {
    title: String(data.title ?? ""),
    order: Number(data.order ?? 10),
    body: content.trim(),
  };
}

export function getPages(): PageContent[] {
  const dir = path.join(CONTENT_DIR, "pages");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
  return files
    .map((f) => {
      const slug = f.replace(/\.md$/, "");
      const page = getPage(slug);
      return page ? { ...page, slug } : null;
    })
    .filter((p): p is PageContent & { slug: string } => p !== null)
    .sort((a, b) => a.order - b.order);
}

export function getPosts(): (PostContent & { slug: string })[] {
  const dir = path.join(CONTENT_DIR, "posts");
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
  return files
    .map((f) => {
      const slug = f.replace(/\.md$/, "");
      const file = path.join(dir, f);
      const { data, content } = matter(fs.readFileSync(file, "utf-8"));
      return {
        title: String(data.title ?? ""),
        date: String(data.date ?? ""),
        description: String(data.description ?? ""),
        image: data.image ? String(data.image) : undefined,
        body: content.trim(),
        slug,
      };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPost(slug: string): PostContent | null {
  const file = path.join(CONTENT_DIR, "posts", `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  const { data, content } = matter(fs.readFileSync(file, "utf-8"));
  return {
    title: String(data.title ?? ""),
    date: String(data.date ?? ""),
    description: String(data.description ?? ""),
    image: data.image ? String(data.image) : undefined,
    body: content.trim(),
    slug,
  };
}

export function getGallery(): GalleryContent | null {
  const file = path.join(CONTENT_DIR, "gallery", "index.md");
  if (!fs.existsSync(file)) return null;
  const { data } = matter(fs.readFileSync(file, "utf-8"));
  return {
    title: String(data.title ?? "Galeria"),
    imagens: Array.isArray(data.imagens) ? (data.imagens as GalleryItem[]) : [],
  };
}

export function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00`);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
