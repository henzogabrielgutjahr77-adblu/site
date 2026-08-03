import fs from "fs";
import path from "path";
import yaml from "js-yaml";

const ROOT_DIR = process.cwd();
const CONFIG_FILE = path.join(ROOT_DIR, "content", "site", "config.yml");
const OUTPUT_FILE = path.join(ROOT_DIR, "public", "figma-design-system.json");

function normalizePath(filePath) {
  return filePath.replace(/\\/g, "/");
}

function toKebab(value) {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function listFilesRecursive(dirPath, extensions = []) {
  if (!fs.existsSync(dirPath)) return [];

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      if ([".next", "node_modules", "cache"].includes(entry.name)) continue;
      files.push(...listFilesRecursive(absolutePath, extensions));
      continue;
    }

    const ext = path.extname(entry.name);
    if (extensions.length > 0 && !extensions.includes(ext)) continue;
    files.push(absolutePath);
  }

  return files;
}

function getDesignTokens(rawConfig) {
  const visual = rawConfig?.visual ?? {};
  const palette = visual.palette ?? {};
  const typography = visual.typography ?? {};
  const spacing = visual.spacing ?? {};
  const radius = visual.radius ?? {};
  const shadow = visual.shadow ?? {};

  return {
    colors: {
      primary: { value: palette.primary ?? "#0e2540", type: "color" },
      primaryDark: { value: palette.primaryDark ?? "#08111f", type: "color" },
      secondary: { value: palette.secondary ?? "#17354f", type: "color" },
      accent: { value: palette.accent ?? "#ff6900", type: "color" },
      action: { value: palette.action ?? "#e85d04", type: "color" },
      background: { value: palette.background ?? "#ffffff", type: "color" },
      surface: { value: palette.surface ?? "#f8fafc", type: "color" },
      text: { value: palette.text ?? "#0f172a", type: "color" },
      muted: { value: palette.muted ?? "#64748b", type: "color" },
      border: { value: palette.border ?? "#e2e8f0", type: "color" },
    },
    typography: {
      heading: {
        family: typography.heading?.family?.desktop ?? "Figtree",
        size: typography.heading?.size?.desktop ?? 48,
        weight: typography.heading?.weight?.desktop ?? 800,
        lineHeight: typography.heading?.lineHeight?.desktop ?? 1.1,
        letterSpacing: typography.heading?.letterSpacing?.desktop ?? -0.03,
      },
      subtitle: {
        family: typography.subtitle?.family?.desktop ?? "Inter",
        size: typography.subtitle?.size?.desktop ?? 18,
        weight: typography.subtitle?.weight?.desktop ?? 400,
        lineHeight: typography.subtitle?.lineHeight?.desktop ?? 1.5,
        letterSpacing: typography.subtitle?.letterSpacing?.desktop ?? 0,
      },
      body: {
        family: typography.body?.family?.desktop ?? "Inter",
        size: typography.body?.size?.desktop ?? 16,
        weight: typography.body?.weight?.desktop ?? 400,
        lineHeight: typography.body?.lineHeight?.desktop ?? 1.65,
        letterSpacing: typography.body?.letterSpacing?.desktop ?? 0,
      },
      button: {
        family: typography.button?.family?.desktop ?? "Inter",
        size: typography.button?.size?.desktop ?? 15.5,
        weight: typography.button?.weight?.desktop ?? 600,
        lineHeight: typography.button?.lineHeight?.desktop ?? 1.2,
        letterSpacing: typography.button?.letterSpacing?.desktop ?? 0,
      },
    },
    spacing: {
      section: spacing.section?.desktop ?? 80,
      heading: spacing.heading?.desktop ?? 32,
      card: spacing.card?.desktop ?? 24,
      text: spacing.text?.desktop ?? 16,
    },
    radius: {
      general: radius.general ?? 12,
      card: radius.card ?? 12,
      button: radius.button ?? 23,
      image: radius.image ?? 8,
      section: radius.section ?? 0,
      input: radius.input ?? 8,
    },
    shadow: {
      color: shadow.color ?? "#000000",
      intensity: shadow.intensity ?? 0.1,
      offsetX: shadow.offsetX ?? 0,
      offsetY: shadow.offsetY ?? 4,
      blur: shadow.blur ?? 16,
    },
  };
}

function listComponentInventory() {
  const componentsDir = path.join(ROOT_DIR, "components");
  const appDir = path.join(ROOT_DIR, "app");
  const contentDir = path.join(ROOT_DIR, "content");

  const componentFiles = listFilesRecursive(componentsDir, [".tsx", ".ts", ".jsx", ".js"])
    .map((filePath) => normalizePath(path.relative(ROOT_DIR, filePath)))
    .filter((filePath) => !filePath.includes("/plasmic/"));

  const routeFiles = listFilesRecursive(appDir, [".tsx", ".ts", ".jsx", ".js"])
    .map((filePath) => normalizePath(path.relative(ROOT_DIR, filePath)))
    .filter((filePath) => !filePath.includes("/api/"));

  const contentFiles = listFilesRecursive(contentDir, [".md", ".yml", ".yaml"])
    .map((filePath) => normalizePath(path.relative(ROOT_DIR, filePath)))
    .filter((filePath) => filePath.includes("/pages/") || filePath.includes("/posts/"));

  return {
    components: componentFiles.map((filePath) => ({
      name: path.basename(filePath, path.extname(filePath)),
      path: filePath,
      category: "component",
      id: toKebab(path.basename(filePath, path.extname(filePath))),
    })),
    routes: routeFiles.map((filePath) => ({
      name: path.basename(filePath, path.extname(filePath)),
      path: filePath.replace(/\/page\.(tsx|ts|jsx|js)$/, ""),
      category: "route",
      id: toKebab(filePath.replace(/\/page\.(tsx|ts|jsx|js)$/, "")),
    })),
    content: contentFiles.map((filePath) => ({
      name: path.basename(filePath, path.extname(filePath)),
      path: filePath,
      category: "content",
      id: toKebab(path.basename(filePath, path.extname(filePath))),
    })),
  };
}

export function buildFigmaExport() {
  const raw = fs.readFileSync(CONFIG_FILE, "utf8");
  const config = yaml.load(raw) ?? {};
  const inventory = listComponentInventory();
  const designTokens = getDesignTokens(config);

  return {
    name: `${config.nome ?? "AdBlu Missões"} – Design System Export`,
    version: "1.0.0",
    source: {
      project: config.nome ?? "AdBlu Missões",
      framework: "Next.js",
      exportedAt: new Date().toISOString(),
    },
    metadata: {
      description: "Tokens, estrutura e componentes exportados do projeto para uso no Figma.",
      exportType: "figma-design-system",
      target: "Figma Tokens / Figma",
    },
    tokens: designTokens,
    semanticTokens: {
      surface: { value: designTokens.colors.surface.value, type: "color" },
      text: { value: designTokens.colors.text.value, type: "color" },
      action: { value: designTokens.colors.action.value, type: "color" },
      accent: { value: designTokens.colors.accent.value, type: "color" },
    },
    projectStructure: {
      components: inventory.components,
      routes: inventory.routes,
      content: inventory.content,
    },
    site: {
      title: config.nome ?? "AdBlu Missões",
      shortName: config.nome_curto ?? "ADBlu",
      slogan: config.slogan ?? "",
      description: config.descricao ?? "",
      cta: config.cta ?? "",
      location: config.local ?? "",
      instagram: config.instagram ?? "",
    },
  };
}

export function writeFigmaExport(outputFile = OUTPUT_FILE) {
  const exportData = buildFigmaExport();
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, `${JSON.stringify(exportData, null, 2)}\n`, "utf8");
  return exportData;
}
