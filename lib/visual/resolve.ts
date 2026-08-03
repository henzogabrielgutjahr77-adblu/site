import { FONT_STACKS } from "./font-families";
import { DEFAULT_VISUAL, HEADER_HEIGHT } from "./defaults";
import type {
  Breakpoint,
  FloatingImageConfig,
  GradientConfig,
  HeroConfig,
  PhotoConfig,
  Responsive,
  VisualConfig,
} from "./types";
import { BREAKPOINTS } from "./types";

export const BREAKPOINT_WIDTH = {
  tablet: 1024,
  mobile: 767,
} as const;

/* ------------------------------------------------------------------ */
/* Deep merge                                                          */
/* ------------------------------------------------------------------ */

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function deepMerge<T>(base: T, patch: unknown): T {
  if (patch === undefined || patch === null) return base;
  if (Array.isArray(patch)) return patch as T;
  if (isObject(base) && isObject(patch)) {
    const out: Record<string, unknown> = { ...base };
    for (const key of Object.keys(patch)) {
      out[key] = deepMerge(base[key], patch[key]);
    }
    return out as T;
  }
  return patch as T;
}

function getPath(obj: unknown, path: string): unknown {
  let cur: unknown = obj;
  for (const part of path.split(".")) {
    if (cur === undefined || cur === null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  return cur;
}

/** Preenche os campos responsivos-objeto (photo/gradient) com a cascata. */
function cascadeResponsives(cfg: Record<string, unknown>): void {
  const walk = (obj: unknown, prefix: string, out: Set<string>) => {
    if (!isObject(obj)) return;
    for (const key of Object.keys(obj)) {
      const path = prefix ? `${prefix}.${key}` : key;
      const val = obj[key];
      if (!isObject(val)) continue;
      if (key === "tablet" || key === "mobile") {
        out.add(prefix);
      }
      walk(val, path, out);
    }
  };
  const respos = new Set<string>();
  walk(cfg, "", respos);
  for (const path of respos) {
    const val = getPath(cfg, path) as Record<string, unknown> | undefined;
    if (!isObject(val)) continue;
    const desktop = val["desktop"];
    if (isObject(val["tablet"]) && isObject(desktop)) {
      val["tablet"] = deepMerge(desktop, val["tablet"]);
    }
    const prev = isObject(val["tablet"]) ? val["tablet"] : desktop;
    if (isObject(val["mobile"]) && isObject(prev)) {
      val["mobile"] = deepMerge(prev, val["mobile"]);
    }
  }
}

/* ------------------------------------------------------------------ */
/* Resolução pública                                                   */
/* ------------------------------------------------------------------ */

export function resolveVisual(raw: unknown): VisualConfig {
  const merged = deepMerge(DEFAULT_VISUAL, raw ?? {}) as VisualConfig;
  cascadeResponsives(merged as unknown as Record<string, unknown>);
  return merged;
}

/** Valor efetivo de um campo responsivo num breakpoint. */
export function r<T>(rv: Responsive<T> | undefined, bp: Breakpoint): T | undefined {
  if (!rv) return undefined;
  if (bp === "desktop") return rv.desktop;
  return (bp === "tablet" ? rv.tablet : rv.mobile) ?? rv.desktop;
}

/* ------------------------------------------------------------------ */
/* Helpers de valor CSS                                                */
/* ------------------------------------------------------------------ */

export function clamp(v: number, min: number, max = Number.MAX_SAFE_INTEGER): number {
  if (typeof v !== "number" || Number.isNaN(v)) return min;
  return Math.min(max, Math.max(min, v));
}

export function clamp01(v: number): number {
  return clamp(v, 0, 1);
}

export function px(v: number, min = 0): string {
  return `${clamp(v, min)}px`;
}

/** hex → rgba() */
export function rgba(hex: string, alpha: number): string {
  const h = String(hex ?? "").replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full || "000000", 16);
  if (Number.isNaN(n)) return `rgba(0,0,0,${alpha})`;
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${clamp01(alpha)})`;
}

export function fontStack(family: string): string {
  const safe = family.trim() || "Inter";
  return FONT_STACKS[safe] ?? `"${safe}", system-ui, -apple-system, sans-serif`;
}

/* ------------------------------------------------------------------ */
/* Geração de valores por recurso                                      */
/* ------------------------------------------------------------------ */

function gradientCss(g: GradientConfig | undefined): string {
  if (!g) return "none";
  const opacity = clamp01(g.opacity);
  const intensity = clamp01(g.intensity);
  const dir = clamp(g.direction, 0, 360);
  const a = (hex: string) => rgba(hex, opacity * intensity);
  return `linear-gradient(${dir}deg, ${a(g.start)} ${clamp(g.stopStart, 0, 100)}%, ${a(g.middle)} ${clamp(g.stopMiddle, 0, 100)}%, ${a(g.end)} ${clamp(g.stopEnd, 0, 100)}%)`;
}

function photoTransform(p: PhotoConfig | undefined): string {
  if (!p) return "none";
  const s = clamp(p.scale, 0.01) * clamp(p.zoom, 0.01);
  return `scale(${s}) rotate(${clamp(p.rotation, -360, 360)}deg)`;
}

function photoFilter(p: PhotoConfig | undefined): string {
  if (!p) return "none";
  return `blur(${clamp(p.blur, 0)}px) brightness(${clamp(p.brightness, 0, 3)}) contrast(${clamp(p.contrast, 0, 3)}) saturate(${clamp(p.saturation, 0, 3)})`;
}

function shadowCss(s: {
  color: string;
  intensity: number;
  offsetX: number;
  offsetY: number;
  blur: number;
}): string {
  return `${px(s.offsetX)} ${px(s.offsetY)} ${px(s.blur)} ${rgba(s.color, s.intensity)}`;
}

function alignMargins(halign: string | undefined): { ml: string; mr: string } {
  if (halign === "center") return { ml: "auto", mr: "auto" };
  if (halign === "right") return { ml: "auto", mr: "0" };
  return { ml: "0", mr: "auto" };
}

/** Gera as declarações de um breakpoint para uma hero. */
function heroDecls(
  bp: Breakpoint,
  hero: HeroConfig,
  p: string,
  palette: VisualConfig["palette"],
): Record<string, string> {
  const v = (name: string) => `${p}-${name}`;
  const out: Record<string, string> = {};

  const h = r(hero.height, bp) ?? 0;
  const minH = r(hero.minHeight, bp) ?? 0;
  out[v("height")] = h > 0 ? px(h) : "auto";
  out[v("min-height")] = minH > 0 ? px(minH) : `calc(100svh - ${HEADER_HEIGHT}px)`;
  const maxW = r(hero.maxWidth, bp) ?? 1280;
  out[v("max-width")] = maxW > 0 ? px(maxW) : "none";
  out[v("justify")] =
    r(hero.verticalAlign, bp) === "center"
      ? "center"
      : r(hero.verticalAlign, bp) === "bottom"
        ? "flex-end"
        : "flex-start";
  const mg = alignMargins(r(hero.horizontalAlign, bp));
  out[v("margin-left")] = mg.ml;
  out[v("margin-right")] = mg.mr;
  out[v("text-align")] = r(hero.alignText, bp) ?? "left";
  out[v("padding-top")] = px(r(hero.paddingTop, bp) ?? 0);
  out[v("padding-bottom")] = px(r(hero.paddingBottom, bp) ?? 0);
  out[v("margin-bottom")] = px(r(hero.marginBottom, bp) ?? 0);
  out[v("gap")] = px(r(hero.blockGap, bp) ?? 0);
  const col = r(hero.columnWidth, bp) ?? 0;
  out[v("column-width")] = col > 0 ? px(col) : "100%";

  const overlay = hero.overlayColor || palette.primaryDark;
  out[v("overlay")] = overlay;
  out[v("overlay-opacity")] = String(clamp01(hero.overlayOpacity));

  const photo = r(hero.photo, bp);
  out[v("photo-image")] = photo?.image ? `url(${photo.image})` : "none";
  out[v("photo-position")] = `${clamp(photo?.positionX ?? 50, 0, 100)}% ${clamp(photo?.positionY ?? 50, 0, 100)}%`;
  out[v("photo-transform")] = photoTransform(photo);
  out[v("photo-filter")] = photoFilter(photo);
  out[v("photo-opacity")] = String(clamp01(photo?.opacity ?? 1));

  out[v("gradient")] = gradientCss(r(hero.gradient, bp));

  const tr = hero.transition;
  const fadeH = clamp(tr?.height ?? 0, 0);
  const fadeInt = clamp01(tr?.intensity ?? 0);
  const fadeEnd = clamp(tr?.gradientEnd ?? 100, 0, 100);
  out[v("fade-height")] = fadeH > 0 ? px(fadeH) : "0px";
  out[v("fade-gradient")] =
    fadeH > 0
      ? `linear-gradient(to top, ${rgba(palette.background, fadeInt)} 0%, ${rgba(palette.background, 0)} ${fadeEnd}%)`
      : "none";

  const anim = hero.animation;
  const typeMap: Record<string, string> = {
    fade: "vi-fade",
    slide: "vi-slide",
    zoom: "vi-zoom",
    blur: "vi-blur",
  };
  out[v("anim-name")] = anim?.enabled === false ? "none" : (typeMap[anim?.type ?? "fade"] ?? "vi-fade");
  out[v("anim-duration")] = `${clamp(anim?.duration ?? 700, 0)}ms`;
  out[v("anim-delay")] = `${clamp(anim?.delay ?? 0, 0)}ms`;
  out[v("anim-easing")] = anim?.easing ?? "ease-out";

  return out;
}

function floatImgDecls(img: FloatingImageConfig): {
  base: Record<string, string>;
  bp: Record<Breakpoint, Record<string, string>>;
} {
  const scale = clamp(img.scale, 0.01);
  const base: Record<string, string> = {
    "--fi-z": String(clamp(img.zIndex, 0, 100)),
    "--fi-overlay": img.overlay || "transparent",
    "--fi-overlay-opacity": String(clamp01(img.overlayOpacity)),
    "z-index": String(clamp(img.zIndex, 0, 100)),
    "opacity": String(clamp01(img.opacity)),
    "transform": `translate(-50%, -50%) scale(${scale}) rotate(${clamp(img.rotation, -360, 360)}deg)`,
    "filter": `blur(${clamp(img.blur, 0)}px)`,
    "border-radius": px(img.borderRadius),
    "border": img.borderWidth > 0 ? `${px(img.borderWidth)} solid ${img.borderColor || "#ffffff"}` : "none",
    "box-shadow": img.shadowEnabled
      ? shadowCss({ color: img.shadowColor, intensity: img.shadowOpacity, offsetX: 0, offsetY: 0, blur: img.shadowBlur })
      : "none",
    "left": `${clamp(img.position?.desktop?.x ?? 50, 0, 100)}%`,
    "top": `${clamp(img.position?.desktop?.y ?? 50, 0, 100)}%`,
    "width": (img.width?.desktop ?? 0) > 0 ? px(img.width.desktop ?? 0) : "auto",
    "height": (img.height?.desktop ?? 0) > 0 ? px(img.height.desktop ?? 0) : "auto",
  };
  const bp = { desktop: {}, tablet: {}, mobile: {} } as Record<Breakpoint, Record<string, string>>;
  for (const b of BREAKPOINTS) {
    const pos = r(img.position, b) ?? { x: 50, y: 50 };
    const w = r(img.width, b) ?? 0;
    const h = r(img.height, b) ?? 0;
    bp[b] = {
      left: `${clamp(pos.x, 0, 100)}%`,
      top: `${clamp(pos.y, 0, 100)}%`,
      width: w > 0 ? px(w) : "auto",
      height: h > 0 ? px(h) : "auto",
    };
  }
  return { base, bp };
}

/* ------------------------------------------------------------------ */
/* Geração de CSS completo                                             */
/* ------------------------------------------------------------------ */

function join(decls: Record<string, string>): string {
  return Object.entries(decls)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join("\n");
}

function addResponsiveVars(visual: VisualConfig, bp: Breakpoint, heroKeys: string[]): Record<string, string> {
  const d: Record<string, string> = {};
  const ty = visual.typography;
  const sp = visual.spacing;
  const set = (k: string, v: string) => { d[k] = v; };

  set("--v-palette-primary", visual.palette.primary);
  set("--v-palette-primary-dark", visual.palette.primaryDark);
  set("--v-palette-secondary", visual.palette.secondary);
  set("--v-palette-accent", visual.palette.accent);
  set("--v-palette-action", visual.palette.action);
  set("--v-palette-bg", visual.palette.background);
  set("--v-palette-surface", visual.palette.surface);
  set("--v-palette-text", visual.palette.text);
  set("--v-palette-muted", visual.palette.muted);
  set("--v-palette-border", visual.palette.border);

  set("--v-radius-general", px(visual.radius.general));
  set("--v-radius-card", px(visual.radius.card));
  set("--v-radius-button", px(visual.radius.button));
  set("--v-radius-image", px(visual.radius.image));
  set("--v-radius-section", px(visual.radius.section));
  set("--v-radius-input", px(visual.radius.input));
  set("--v-shadow", shadowCss(visual.shadow));

  const roles: [string, string, string][] = [
    ["heading", "--v-heading", "--v-font-heading"],
    ["subtitle", "--v-subtitle", "--v-font-subtitle"],
    ["body", "--v-body", "--v-font-body"],
    ["button", "--v-button", "--v-font-button"],
  ];
  for (const [role, base, fontVar] of roles) {
    const fr = ty[role as keyof typeof ty];
    set(fontVar, fontStack(r(fr.family, bp) ?? "Inter"));
    set(`${base}-size`, px(r(fr.size, bp) ?? 16));
    set(`${base}-weight`, String(r(fr.weight, bp) ?? 400));
    set(`${base}-lh`, String(r(fr.lineHeight, bp) ?? 1.5));
    set(`${base}-ls`, `${r(fr.letterSpacing, bp) ?? 0}em`);
  }

  set("--v-sp-section", px(r(sp.section, bp) ?? 80));
  set("--v-sp-heading", px(r(sp.heading, bp) ?? 32));
  set("--v-sp-card", px(r(sp.card, bp) ?? 24));
  set("--v-sp-text", px(r(sp.text, bp) ?? 16));

  for (const key of heroKeys) {
    const hero = key === "homeHero" ? visual.homeHero : visual.hero;
    const prefix = key === "homeHero" ? "--v-home" : "--v-hero";
    const decls = heroDecls(bp, hero, prefix, visual.palette);
    for (const [k, v] of Object.entries(decls)) d[k] = v;
  }
  return d;
}

export function visualCss(visual: VisualConfig, heroKeys: string[] = ["hero", "homeHero"]): string {
  const parts: string[] = [];

  const emit = (selector: string, bp: Breakpoint) => {
    parts.push(`${selector} {`);
    parts.push(join(addResponsiveVars(visual, bp, heroKeys)));
    parts.push("}");
  };

  emit(":root", "desktop");
  parts.push(`@media (max-width: ${BREAKPOINT_WIDTH.tablet}px) {`);
  emit(":root", "tablet");
  parts.push("}");
  parts.push(`@media (max-width: ${BREAKPOINT_WIDTH.mobile}px) {`);
  emit(":root", "mobile");
  parts.push("}");
  for (const bp of ["tablet", "mobile"] as const) {
    parts.push(`html[data-breakpoint="${bp}"] {`);
    parts.push(join(addResponsiveVars(visual, bp, heroKeys)));
    parts.push("}");
  }
  parts.push(`html[data-breakpoint="desktop"] {`);
  parts.push(join(addResponsiveVars(visual, "desktop", heroKeys)));
  parts.push("}");

  /* aliases por instância: classes estruturais usam --hero-* (neutro) */
  const heroAlias = [
    "min-height", "height", "max-width", "justify", "margin-left", "margin-right",
    "text-align", "padding-top", "padding-bottom", "margin-bottom", "gap",
    "column-width", "overlay", "overlay-opacity", "photo-image", "photo-position",
    "photo-transform", "photo-filter", "photo-opacity", "gradient", "fade-height",
    "fade-gradient", "anim-name", "anim-duration", "anim-delay", "anim-easing",
  ] as const;
  const instances: { scope: string; prefix: string }[] = [
    { scope: ".vi-inner", prefix: "--v-hero-" },
    { scope: ".vi-home", prefix: "--v-home-" },
  ];
  for (const inst of instances) {
    parts.push(`${inst.scope} {`);
    for (const name of heroAlias) {
      parts.push(`  --hero-${name}: var(${inst.prefix}${name});`);
    }
    parts.push("}");
  }

  /* bridge Tailwind → paleta/tokens CMS */
  const bridge: Record<string, string> = {
    "--color-navy-900": visual.palette.primaryDark,
    "--color-navy-800": visual.palette.primary,
    "--color-navy-700": visual.palette.secondary,
    "--color-accent": visual.palette.accent,
    "--color-action": visual.palette.action,
    "--color-ink": visual.palette.text,
    "--color-muted-ink": visual.palette.muted,
    "--color-card-bg": visual.palette.background,
    "--color-surface": visual.palette.surface,
    "--color-border-soft": visual.palette.border,
  };
  parts.push(":root {");
  for (const [k, v] of Object.entries(bridge)) parts.push(`  ${k}: ${v};`);
  parts.push("}");

  /* imagens flutuantes */
  for (const key of heroKeys) {
    const hero = key === "homeHero" ? visual.homeHero : visual.hero;
    const scope = key === "homeHero" ? ".vi-home" : ".vi-inner";
    if (!hero || !hero.floatingImages?.length) continue;
    for (const img of hero.floatingImages) {
      const { base, bp } = floatImgDecls(img);
      const sel = `${scope} .fi-${img.id}`;
      parts.push(`${sel} {`);
      parts.push(join({ ...base, ...bp.desktop }));
      parts.push("}");
      parts.push(`@media (max-width: ${BREAKPOINT_WIDTH.tablet}px) {`);
      parts.push(`${sel} {`);
      parts.push(join(bp.tablet));
      parts.push("}");
      parts.push("}");
      parts.push(`@media (max-width: ${BREAKPOINT_WIDTH.mobile}px) {`);
      parts.push(`${sel} {`);
      parts.push(join(bp.mobile));
      parts.push("}");
      parts.push("}");
    }
  }

  if (visual.motion?.enabled === false) {
    parts.push(".vi-anim, .vi-anim * { animation: none !important; transition: none !important; }");
  }

  return parts.join("\n");
}
