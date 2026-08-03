import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { CONTENT_DIR, getSiteConfig } from "@/lib/content";
import { resolveVisual, type VisualConfig } from "@/lib/visual";

const PAGE_VISUAL_FILE = path.join(CONTENT_DIR, "site", "pages-visual.yml");

type PageVisualMap = Record<string, unknown>;

function readMap(): PageVisualMap {
  if (!fs.existsSync(PAGE_VISUAL_FILE)) return {};
  try {
    const raw = yaml.load(fs.readFileSync(PAGE_VISUAL_FILE, "utf-8"));
    return raw && typeof raw === "object" ? (raw as PageVisualMap) : {};
  } catch {
    return {};
  }
}

function writeMap(map: PageVisualMap): void {
  fs.writeFileSync(
    PAGE_VISUAL_FILE,
    yaml.dump(map, { lineWidth: 120, noRefs: true }) + "\n",
  );
}

export function hasPageVisual(slug: string): boolean {
  return readMap()[slug] != null;
}

/** Aparência resolvida de uma página: override da página ou a global. */
export function getPageVisual(slug: string): VisualConfig {
  const raw = readMap()[slug];
  if (raw && typeof raw === "object") return resolveVisual(raw);
  return resolveVisual(getSiteConfig().visual);
}

export function savePageVisual(slug: string, visual: unknown): void {
  const map = readMap();
  map[slug] = visual;
  writeMap(map);
}

export function resetPageVisual(slug: string): void {
  const map = readMap();
  delete map[slug];
  writeMap(map);
}
