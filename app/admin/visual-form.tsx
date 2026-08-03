"use client";

import { useEffect, useMemo, useRef, useState, useActionState, type ReactNode } from "react";
import {
  defaultFloatingImage,
  FONT_FAMILIES,
  resolveVisual,
  visualCss,
  type Breakpoint,
  type FloatingImageConfig,
  type GradientConfig,
  type HeroConfig,
  type PaletteConfig,
  type PhotoConfig,
  type RadiusConfig,
  type Responsive,
  type ShadowConfig,
  type SpacingConfig,
  type TypographyConfig,
  type VisualConfig,
} from "@/lib/visual";
import { savePageVisualAction, resetPageVisualAction, type ActionResult } from "./actions";

const inputCls =
  "mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-orange-500 focus:outline-none";
const btnCls =
  "rounded-md bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60";

function Status({ state }: { state: ActionResult }) {
  if (state.ok) return <p className="mt-3 text-sm font-medium text-emerald-600">{state.ok}</p>;
  if (state.error) return <p className="mt-3 text-sm font-medium text-red-600">{state.error}</p>;
  return null;
}

function FieldLabel({ children }: { children: ReactNode }) {
  return <span className="block text-xs font-medium text-slate-600">{children}</span>;
}

function normalizeColor(v: string): string {
  if (/^#[0-9a-fA-F]{6}$/.test(v)) return v;
  const m = v.replace("#", "");
  if (m.length === 3) return "#" + m.split("").map((c) => c + c).join("");
  return "#000000";
}

/* ------------------------------------------------------------------ */
/* Campos básicos                                                      */
/* ------------------------------------------------------------------ */

function Num({
  label,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  unit,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}) {
  return (
    <div>
      <FieldLabel>
        {label}
        {unit ? ` (${unit})` : ""}
      </FieldLabel>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => {
          const n = parseFloat(e.target.value);
          onChange(Number.isFinite(n) ? n : min);
        }}
        className={inputCls}
      />
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={inputCls}
      />
    </div>
  );
}

function Color({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="mt-1 flex items-center gap-2">
        <input
          type="color"
          value={normalizeColor(value)}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-12 shrink-0 cursor-pointer rounded-md border border-slate-300"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputCls}
        />
      </div>
    </div>
  );
}

function Checkbox({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 pt-1 text-sm font-medium text-slate-700">
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-slate-300"
      />
      {label}
    </label>
  );
}

function Sel({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { v: string; l: string }[];
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
        {options.map((o) => (
          <option key={o.v} value={o.v}>
            {o.l}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Campos responsivos                                                  */
/* ------------------------------------------------------------------ */

function BpNum({
  label,
  value,
  parent,
  onChange,
  min,
  max,
  step,
}: {
  label: string;
  value?: number;
  parent: number;
  onChange: (v: number | undefined) => void;
  min: number;
  max?: number;
  step: number;
}) {
  const inherited = value === undefined;
  return (
    <div>
      <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
        <input
          type="checkbox"
          checked={inherited}
          onChange={(e) => onChange(e.target.checked ? undefined : value ?? parent)}
          className="h-3.5 w-3.5 rounded border-slate-300"
        />
        {label}: {inherited ? "usar desktop" : ""}
      </label>
      <input
        type="number"
        value={inherited ? "" : value}
        disabled={inherited}
        placeholder={String(parent)}
        min={min}
        max={max}
        step={step}
        onChange={(e) => {
          const n = parseFloat(e.target.value);
          onChange(Number.isFinite(n) ? n : parent);
        }}
        className={`${inputCls} disabled:bg-slate-100`}
      />
    </div>
  );
}

function RespNum({
  label,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  unit,
}: {
  label: string;
  value: Responsive<number>;
  onChange: (v: Responsive<number>) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <div className="mb-2 text-xs font-semibold text-slate-700">
        {label}
        {unit ? ` (${unit})` : ""}
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <FieldLabel>Desktop</FieldLabel>
          <input
            type="number"
            value={value.desktop}
            min={min}
            max={max}
            step={step}
            onChange={(e) => {
              const n = parseFloat(e.target.value);
              onChange({ ...value, desktop: Number.isFinite(n) ? n : min });
            }}
            className={inputCls}
          />
        </div>
        <BpNum
          label="Tablet"
          parent={value.desktop}
          value={value.tablet}
          onChange={(v) => onChange({ ...value, tablet: v })}
          min={min}
          max={max}
          step={step}
        />
        <BpNum
          label="Mobile"
          parent={value.tablet ?? value.desktop}
          value={value.mobile}
          onChange={(v) => onChange({ ...value, mobile: v })}
          min={min}
          max={max}
          step={step}
        />
      </div>
    </div>
  );
}

function RespSel<T extends string | number>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: Responsive<T>;
  onChange: (v: Responsive<T>) => void;
  options: { v: T; l: string }[];
}) {
  const toStr = (x: T) => String(x);
  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <div className="mb-2 text-xs font-semibold text-slate-700">{label}</div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <FieldLabel>Desktop</FieldLabel>
          <select
            value={toStr(value.desktop)}
            onChange={(e) => {
              const opt = options.find((o) => toStr(o.v) === e.target.value);
              onChange({ ...value, desktop: opt ? opt.v : value.desktop });
            }}
            className={inputCls}
          >
            {options.map((o) => (
              <option key={toStr(o.v)} value={toStr(o.v)}>
                {o.l}
              </option>
            ))}
          </select>
        </div>
        {(["tablet", "mobile"] as const).map((bp) => {
          const v = value[bp];
          const inherited = v === undefined;
          const parent = (bp === "tablet" ? value.desktop : value.tablet ?? value.desktop) as T;
          return (
            <div key={bp}>
              <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                <input
                  type="checkbox"
                  checked={inherited}
                  onChange={(e) =>
                    onChange({ ...value, [bp]: e.target.checked ? undefined : parent })
                  }
                  className="h-3.5 w-3.5 rounded border-slate-300"
                />
                {bp === "tablet" ? "Tablet" : "Mobile"}: {inherited ? "usar desktop" : ""}
              </label>
              <select
                value={inherited ? "" : toStr(v)}
                disabled={inherited}
                onChange={(e) => {
                  const opt = options.find((o) => toStr(o.v) === e.target.value);
                  onChange({ ...value, [bp]: opt ? opt.v : parent });
                }}
                className={`${inputCls} disabled:bg-slate-100`}
              >
                <option value="" disabled>
                  {String(parent)}
                </option>
                {options.map((o) => (
                  <option key={toStr(o.v)} value={toStr(o.v)}>
                    {o.l}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Abas                                                                */
/* ------------------------------------------------------------------ */

const ALIGN_OPTIONS: { v: "left" | "center" | "right"; l: string }[] = [
  { v: "left", l: "Esquerda" },
  { v: "center", l: "Centro" },
  { v: "right", l: "Direita" },
];
const VERT_OPTIONS: { v: "top" | "center" | "bottom"; l: string }[] = [
  { v: "top", l: "Topo" },
  { v: "center", l: "Centro" },
  { v: "bottom", l: "Base" },
];
const WEIGHT_OPTIONS: { v: number; l: string }[] = [400, 500, 600, 700, 800].map((n) => ({
  v: n,
  l: String(n),
}));
const FAMILY_OPTIONS: { v: string; l: string }[] = FONT_FAMILIES.map((f) => ({ v: f, l: f }));
const ANIM_OPTIONS: { v: string; l: string }[] = [
  { v: "fade", l: "Desvanecer" },
  { v: "slide", l: "Deslizar" },
  { v: "zoom", l: "Zoom" },
  { v: "blur", l: "Desfoque" },
];
const EASING_OPTIONS: { v: string; l: string }[] = [
  { v: "ease", l: "Suave" },
  { v: "ease-in", l: "Entrada" },
  { v: "ease-out", l: "Saída" },
  { v: "ease-in-out", l: "Entrada/saída" },
  { v: "linear", l: "Linear" },
];

const PALETTE_KEYS: { key: keyof PaletteConfig; l: string }[] = [
  { key: "primary", l: "Primária" },
  { key: "primaryDark", l: "Primária escura" },
  { key: "secondary", l: "Secundária" },
  { key: "accent", l: "Destaque (accent)" },
  { key: "action", l: "Ação (botões)" },
  { key: "background", l: "Fundo da página" },
  { key: "surface", l: "Superfície (cards)" },
  { key: "text", l: "Texto" },
  { key: "muted", l: "Texto secundário" },
  { key: "border", l: "Borda" },
];

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-800">
        {title}
      </div>
      <div className="grid grid-cols-1 gap-4 p-4 @lg:grid-cols-2">{children}</div>
    </div>
  );
}

function PaletteTab({
  value,
  onChange,
}: {
  value: PaletteConfig;
  onChange: (v: PaletteConfig) => void;
}) {
  return (
    <Panel title="Paleta de cores">
      {PALETTE_KEYS.map(({ key, l }) => (
        <Color key={key} label={l} value={value[key]} onChange={(v) => onChange({ ...value, [key]: v })} />
      ))}
    </Panel>
  );
}

function SpacingTab({
  value,
  onChange,
}: {
  value: SpacingConfig;
  onChange: (v: SpacingConfig) => void;
}) {
  return (
    <Panel title="Espaçamentos">
      <RespNum label="Seções" unit="px" value={value.section} onChange={(v) => onChange({ ...value, section: v })} />
      <RespNum label="Cabeçalhos" unit="px" value={value.heading} onChange={(v) => onChange({ ...value, heading: v })} />
      <RespNum label="Cards" unit="px" value={value.card} onChange={(v) => onChange({ ...value, card: v })} />
      <RespNum label="Parágrafos" unit="px" value={value.text} onChange={(v) => onChange({ ...value, text: v })} />
    </Panel>
  );
}

function CardsTab({
  radius,
  onRadius,
  shadow,
  onShadow,
  motion,
  onMotion,
}: {
  radius: RadiusConfig;
  onRadius: (v: RadiusConfig) => void;
  shadow: ShadowConfig;
  onShadow: (v: ShadowConfig) => void;
  motion: { enabled: boolean };
  onMotion: (v: { enabled: boolean }) => void;
}) {
  const rk: { key: keyof RadiusConfig; l: string }[] = [
    { key: "general", l: "Geral" },
    { key: "card", l: "Cards" },
    { key: "button", l: "Botões" },
    { key: "image", l: "Imagens" },
    { key: "section", l: "Seções" },
    { key: "input", l: "Campos de formulário" },
  ];
  return (
    <div className="space-y-4">
      <Panel title="Arredondamentos (raio)">
        {rk.map(({ key, l }) => (
          <Num
            key={key}
            label={l}
            unit="px"
            value={radius[key]}
            min={0}
            max={200}
            onChange={(v) => onRadius({ ...radius, [key]: v })}
          />
        ))}
      </Panel>
      <Panel title="Sombra padrão">
        <Color label="Cor" value={shadow.color} onChange={(v) => onShadow({ ...shadow, color: v })} />
        <Num label="Intensidade" value={shadow.intensity} min={0} max={1} step={0.05} onChange={(v) => onShadow({ ...shadow, intensity: v })} />
        <Num label="Deslocamento X" unit="px" value={shadow.offsetX} min={-200} max={200} onChange={(v) => onShadow({ ...shadow, offsetX: v })} />
        <Num label="Deslocamento Y" unit="px" value={shadow.offsetY} min={-200} max={200} onChange={(v) => onShadow({ ...shadow, offsetY: v })} />
        <Num label="Desfoque" unit="px" value={shadow.blur} min={0} max={200} onChange={(v) => onShadow({ ...shadow, blur: v })} />
      </Panel>
      <Panel title="Animações gerais">
        <Checkbox
          label="Habilitar animações de entrada"
          value={motion.enabled}
          onChange={(v) => onMotion({ enabled: v })}
        />
      </Panel>
    </div>
  );
}

const ROLE_LABELS: Record<keyof TypographyConfig, string> = {
  heading: "Título (hero)",
  subtitle: "Subtítulo",
  body: "Texto",
  button: "Botões",
};

function RolePanel({
  role,
  value,
  onChange,
}: {
  role: keyof TypographyConfig;
  value: TypographyConfig[typeof role];
  onChange: (v: TypographyConfig[typeof role]) => void;
}) {
  return (
    <Panel title={ROLE_LABELS[role]}>
      <RespSel label="Família" value={value.family} onChange={(v) => onChange({ ...value, family: v })} options={FAMILY_OPTIONS} />
      <RespNum label="Tamanho" unit="px" value={value.size} min={8} max={200} onChange={(v) => onChange({ ...value, size: v })} />
      <RespSel label="Peso" value={value.weight} onChange={(v) => onChange({ ...value, weight: v })} options={WEIGHT_OPTIONS} />
      <RespNum label="Altura da linha" value={value.lineHeight} min={0.8} max={2.5} step={0.05} onChange={(v) => onChange({ ...value, lineHeight: v })} />
      <RespNum label="Espaçamento entre letras" unit="em" value={value.letterSpacing} min={-0.2} max={1} step={0.01} onChange={(v) => onChange({ ...value, letterSpacing: v })} />
    </Panel>
  );
}

function TypographyTab({
  value,
  onChange,
}: {
  value: TypographyConfig;
  onChange: (v: TypographyConfig) => void;
}) {
  return (
    <div className="space-y-4">
      {(["heading", "subtitle", "body", "button"] as const).map((role) => (
        <RolePanel key={role} role={role} value={value[role]} onChange={(v) => onChange({ ...value, [role]: v })} />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hero (compartilhado entre internas e home)                          */
/* ------------------------------------------------------------------ */

function PhotoFields({
  photo,
  onChange,
}: {
  photo: PhotoConfig;
  onChange: (p: PhotoConfig) => void;
}) {
  const set = <K extends keyof PhotoConfig>(k: K, v: PhotoConfig[K]) => onChange({ ...photo, [k]: v });
  return (
    <Panel title="Foto de fundo">
      <TextField label="Imagem (URL ou /uploads/…)" value={photo.image} onChange={(v) => set("image", v)} placeholder="/uploads/exemplo.jpg" />
      <Num label="Posição X" unit="%" value={photo.positionX} min={0} max={100} onChange={(v) => set("positionX", v)} />
      <Num label="Posição Y" unit="%" value={photo.positionY} min={0} max={100} onChange={(v) => set("positionY", v)} />
      <Num label="Escala" value={photo.scale} min={0.1} max={3} step={0.05} onChange={(v) => set("scale", v)} />
      <Num label="Zoom" value={photo.zoom} min={0.1} max={3} step={0.05} onChange={(v) => set("zoom", v)} />
      <Num label="Opacidade" value={photo.opacity} min={0} max={1} step={0.05} onChange={(v) => set("opacity", v)} />
      <Num label="Desfoque" unit="px" value={photo.blur} min={0} max={50} onChange={(v) => set("blur", v)} />
      <Num label="Brilho" value={photo.brightness} min={0} max={3} step={0.05} onChange={(v) => set("brightness", v)} />
      <Num label="Contraste" value={photo.contrast} min={0} max={3} step={0.05} onChange={(v) => set("contrast", v)} />
      <Num label="Saturação" value={photo.saturation} min={0} max={3} step={0.05} onChange={(v) => set("saturation", v)} />
      <Num label="Rotação" unit="°" value={photo.rotation} min={-360} max={360} onChange={(v) => set("rotation", v)} />
    </Panel>
  );
}

function GradientFields({
  gradient,
  onChange,
}: {
  gradient: GradientConfig;
  onChange: (g: GradientConfig) => void;
}) {
  const set = <K extends keyof GradientConfig>(k: K, v: GradientConfig[K]) => onChange({ ...gradient, [k]: v });
  return (
    <Panel title="Gradiente">
      <Color label="Cor inicial" value={gradient.start} onChange={(v) => set("start", v)} />
      <Color label="Cor do meio" value={gradient.middle} onChange={(v) => set("middle", v)} />
      <Color label="Cor final" value={gradient.end} onChange={(v) => set("end", v)} />
      <Num label="Opacidade" value={gradient.opacity} min={0} max={1} step={0.05} onChange={(v) => set("opacity", v)} />
      <Num label="Intensidade" value={gradient.intensity} min={0} max={1} step={0.05} onChange={(v) => set("intensity", v)} />
      <Num label="Direção" unit="°" value={gradient.direction} min={0} max={360} onChange={(v) => set("direction", v)} />
      <Num label="Parada inicial" unit="%" value={gradient.stopStart} min={0} max={100} onChange={(v) => set("stopStart", v)} />
      <Num label="Parada do meio" unit="%" value={gradient.stopMiddle} min={0} max={100} onChange={(v) => set("stopMiddle", v)} />
      <Num label="Parada final" unit="%" value={gradient.stopEnd} min={0} max={100} onChange={(v) => set("stopEnd", v)} />
    </Panel>
  );
}

function TransitionFields({
  value,
  onChange,
}: {
  value: HeroConfig["transition"];
  onChange: (v: HeroConfig["transition"]) => void;
}) {
  return (
    <Panel title="Transição inferior (fade)">
      <Num label="Altura" unit="px" value={value.height} min={0} max={600} onChange={(v) => onChange({ ...value, height: v })} />
      <Num label="Intensidade" value={value.intensity} min={0} max={1} step={0.05} onChange={(v) => onChange({ ...value, intensity: v })} />
      <Num label="Fim do gradiente" unit="%" value={value.gradientEnd} min={0} max={100} onChange={(v) => onChange({ ...value, gradientEnd: v })} />
      <Num label="Offset da próxima seção" unit="px" value={value.nextSectionOffset} min={0} max={600} onChange={(v) => onChange({ ...value, nextSectionOffset: v })} />
    </Panel>
  );
}

function AnimFields({
  value,
  onChange,
}: {
  value: HeroConfig["animation"];
  onChange: (v: HeroConfig["animation"]) => void;
}) {
  return (
    <Panel title="Animação de entrada">
      <Checkbox label="Habilitar" value={value.enabled} onChange={(v) => onChange({ ...value, enabled: v })} />
      <Sel label="Tipo" value={value.type} onChange={(v) => onChange({ ...value, type: v as HeroConfig["animation"]["type"] })} options={ANIM_OPTIONS} />
      <Num label="Duração" unit="ms" value={value.duration} min={0} max={5000} step={100} onChange={(v) => onChange({ ...value, duration: v })} />
      <Num label="Atraso" unit="ms" value={value.delay} min={0} max={5000} step={100} onChange={(v) => onChange({ ...value, delay: v })} />
      <Sel label="Curva" value={value.easing} onChange={(v) => onChange({ ...value, easing: v as HeroConfig["animation"]["easing"] })} options={EASING_OPTIONS} />
    </Panel>
  );
}

function FloatingImagesEditor({
  list,
  onChange,
}: {
  list: FloatingImageConfig[];
  onChange: (l: FloatingImageConfig[]) => void;
}) {
  const setImg = (i: number, patch: Partial<FloatingImageConfig>) =>
    onChange(list.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const remove = (i: number) => onChange(list.filter((_, j) => j !== i));
  const add = () => onChange([...list, defaultFloatingImage(list.length + 1)]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <span className="text-sm font-semibold text-slate-800">Imagens flutuantes</span>
        <button
          type="button"
          onClick={add}
          className="rounded-md border border-orange-300 px-3 py-1.5 text-xs font-semibold text-orange-700 hover:bg-orange-50"
        >
          + Adicionar
        </button>
      </div>
      {list.length === 0 && (
        <p className="px-4 py-3 text-xs text-slate-400">Nenhuma imagem flutuante nesta hero.</p>
      )}
      {list.map((img, i) => (
        <details key={img.id} className="border-t border-slate-100 px-4 py-2" open={list.length === 1}>
          <summary className="flex list-none cursor-pointer items-center justify-between gap-2 py-1 text-sm font-medium text-slate-700">
            <span className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={img.enabled}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => setImg(i, { enabled: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300"
              />
              {img.name || `Imagem ${i + 1}`}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                remove(i);
              }}
              className="text-xs font-semibold text-red-600 hover:text-red-700"
            >
              Remover
            </button>
          </summary>
          <div className="mt-2 grid grid-cols-1 gap-4 @lg:grid-cols-2">
            <TextField label="Nome" value={img.name} onChange={(v) => setImg(i, { name: v })} />
            <TextField label="Imagem" value={img.image} placeholder="/uploads/flutuante.jpg" onChange={(v) => setImg(i, { image: v })} />
            <Num label="Posição X" unit="%" value={img.position?.desktop?.x ?? 50} min={0} max={100} onChange={(v) => setImg(i, { position: { desktop: { ...img.position?.desktop, x: v } } })} />
            <Num label="Posição Y" unit="%" value={img.position?.desktop?.y ?? 50} min={0} max={100} onChange={(v) => setImg(i, { position: { desktop: { ...img.position?.desktop, y: v } } })} />
            <Num label="Largura" unit="px" value={img.width?.desktop ?? 0} min={0} max={2000} onChange={(v) => setImg(i, { width: { desktop: v } })} />
            <Num label="Altura (0 = auto)" unit="px" value={img.height?.desktop ?? 0} min={0} max={2000} onChange={(v) => setImg(i, { height: { desktop: v } })} />
            <Num label="Escala" value={img.scale} min={0.1} max={3} step={0.05} onChange={(v) => setImg(i, { scale: v })} />
            <Num label="Opacidade" value={img.opacity} min={0} max={1} step={0.05} onChange={(v) => setImg(i, { opacity: v })} />
            <Num label="Desfoque" unit="px" value={img.blur} min={0} max={50} onChange={(v) => setImg(i, { blur: v })} />
            <Num label="Rotação" unit="°" value={img.rotation} min={-360} max={360} onChange={(v) => setImg(i, { rotation: v })} />
            <Num label="Camada (z-index)" value={img.zIndex} min={0} max={100} onChange={(v) => setImg(i, { zIndex: v })} />
            <Color label="Cor da borda" value={img.borderColor} onChange={(v) => setImg(i, { borderColor: v })} />
            <Num label="Espessura da borda" unit="px" value={img.borderWidth} min={0} max={50} onChange={(v) => setImg(i, { borderWidth: v })} />
            <Num label="Raio da borda" unit="px" value={img.borderRadius} min={0} max={200} onChange={(v) => setImg(i, { borderRadius: v })} />
            <Color label="Cor do overlay" value={img.overlay || "#000000"} onChange={(v) => setImg(i, { overlay: v })} />
            <Num label="Opacidade do overlay" value={img.overlayOpacity} min={0} max={1} step={0.05} onChange={(v) => setImg(i, { overlayOpacity: v })} />
            <Checkbox label="Sombra" value={img.shadowEnabled} onChange={(v) => setImg(i, { shadowEnabled: v })} />
            <Color label="Cor da sombra" value={img.shadowColor} onChange={(v) => setImg(i, { shadowColor: v })} />
            <Num label="Opacidade da sombra" value={img.shadowOpacity} min={0} max={1} step={0.05} onChange={(v) => setImg(i, { shadowOpacity: v })} />
            <Num label="Desfoque da sombra" unit="px" value={img.shadowBlur} min={0} max={200} onChange={(v) => setImg(i, { shadowBlur: v })} />
          </div>
        </details>
      ))}
    </div>
  );
}

function HeroFields({
  value,
  onChange,
}: {
  value: HeroConfig;
  onChange: (h: HeroConfig) => void;
}) {
  const set = <K extends keyof HeroConfig>(k: K, v: HeroConfig[K]) => onChange({ ...value, [k]: v });
  return (
    <div className="space-y-4">
      <Panel title="Layout">
        <RespNum label="Altura (0 = automático)" unit="px" value={value.height} min={0} max={2000} onChange={(v) => set("height", v)} />
        <RespNum label="Altura mínima (0 = preencher a tela)" unit="px" value={value.minHeight} min={0} max={2000} onChange={(v) => set("minHeight", v)} />
        <RespNum label="Largura máxima do conteúdo" unit="px" value={value.maxWidth} min={0} max={3000} onChange={(v) => set("maxWidth", v)} />
        <RespNum label="Largura da coluna de texto" unit="px" value={value.columnWidth} min={0} max={2000} onChange={(v) => set("columnWidth", v)} />
        <RespSel label="Alinhamento horizontal" value={value.horizontalAlign} onChange={(v) => set("horizontalAlign", v)} options={ALIGN_OPTIONS} />
        <RespSel label="Alinhamento vertical" value={value.verticalAlign} onChange={(v) => set("verticalAlign", v)} options={VERT_OPTIONS} />
        <RespSel label="Alinhamento do texto" value={value.alignText} onChange={(v) => set("alignText", v)} options={ALIGN_OPTIONS} />
        <RespNum label="Padding superior" unit="px" value={value.paddingTop} min={0} max={600} onChange={(v) => set("paddingTop", v)} />
        <RespNum label="Padding inferior" unit="px" value={value.paddingBottom} min={0} max={600} onChange={(v) => set("paddingBottom", v)} />
        <RespNum label="Margem inferior" unit="px" value={value.marginBottom} min={0} max={600} onChange={(v) => set("marginBottom", v)} />
        <RespNum label="Espaço entre blocos" unit="px" value={value.blockGap} min={0} max={200} onChange={(v) => set("blockGap", v)} />
      </Panel>
      <Panel title="Sobreposição (overlay)">
        <Color label="Cor do overlay" value={value.overlayColor} onChange={(v) => set("overlayColor", v)} />
        <Num label="Opacidade do overlay" value={value.overlayOpacity} min={0} max={1} step={0.05} onChange={(v) => set("overlayOpacity", v)} />
      </Panel>
      <PhotoFields photo={value.photo.desktop} onChange={(p) => set("photo", { desktop: p })} />
      <GradientFields gradient={value.gradient.desktop} onChange={(g) => set("gradient", { desktop: g })} />
      <TransitionFields value={value.transition} onChange={(v) => set("transition", v)} />
      <AnimFields value={value.animation} onChange={(v) => set("animation", v)} />
      <FloatingImagesEditor list={value.floatingImages} onChange={(l) => set("floatingImages", l)} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Serialização                                                        */
/* ------------------------------------------------------------------ */

function serialize(d: VisualConfig): string {
  const c: VisualConfig = JSON.parse(JSON.stringify(d));
  for (const key of ["hero", "homeHero"] as const) {
    const h = c[key];
    if (h.photo?.desktop) h.photo = { desktop: h.photo.desktop };
    if (h.gradient?.desktop) h.gradient = { desktop: h.gradient.desktop };
    if (Array.isArray(h.floatingImages) && h.floatingImages.length) {
      h.floatingImages = h.floatingImages.map((fi) => ({
        ...fi,
        position: { desktop: fi.position?.desktop ?? { x: 50, y: 50 } },
        width: { desktop: fi.width?.desktop ?? 0 },
        height: { desktop: fi.height?.desktop ?? 0 },
      }));
    }
  }
  return JSON.stringify(c, null, 2);
}

/* ------------------------------------------------------------------ */
/* Form principal                                                      */
/* ------------------------------------------------------------------ */

const DEVICE_SIZE: Record<Breakpoint, { width: number; height: number }> = {
  desktop: { width: 1280, height: 720 },
  tablet: { width: 768, height: 620 },
  mobile: { width: 390, height: 693 },
};

const TABS = [
  { id: "paleta", label: "Paleta" },
  { id: "tipografia", label: "Tipografia" },
  { id: "espacamentos", label: "Espaçamentos" },
  { id: "cards", label: "Cards" },
  { id: "hero", label: "Hero (internas)" },
  { id: "home", label: "Home" },
] as const;
type TabId = (typeof TABS)[number]["id"];

export default function VisualForm({ visual, slug }: { visual: VisualConfig; slug: string }) {
  const [draft, setDraft] = useState<VisualConfig>(visual);
  const [tab, setTab] = useState<TabId>("paleta");
  const [device, setDevice] = useState<Breakpoint>("desktop");
  const [state, action, pending] = useActionState(savePageVisualAction, {});
  const [resetState, resetAction, resetPending] = useActionState(resetPageVisualAction, {});

  const css = useMemo(() => visualCss(resolveVisual(draft)), [draft]);
  const serialized = useMemo(() => serialize(draft), [draft]);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const previewSize = DEVICE_SIZE[device];
  const scaledW = Math.max(1, Math.floor(previewSize.width * scale));
  const scaledH = Math.max(1, Math.floor(previewSize.height * scale));

  const previewSrc = slug === "home" ? `/?preview=${device}` : `/${slug}?preview=${device}`;

  const applyPreviewCss = () => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;
    doc.querySelectorAll('style[id^="visual-config"]').forEach((el) => el.remove());
    let el = doc.getElementById("adblu-draft-css") as HTMLStyleElement | null;
    if (!el) {
      el = doc.createElement("style");
      el.id = "adblu-draft-css";
      (doc.body || doc.head || doc.documentElement).appendChild(el);
    }
    el.textContent = css;
  };

  useEffect(() => {
    applyPreviewCss();
  }, [css, previewSrc]);

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const update = () => {
      setScale(Math.min(1, el.clientWidth / previewSize.width));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [previewSize.width]);

  const setVisual = (patch: Partial<VisualConfig>) => setDraft((d) => ({ ...d, ...patch }));

  return (
    <div className="@container mt-3">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <form action={action}>
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="visual" value={serialized} />
          <button type="submit" disabled={pending} className={btnCls}>
            {pending ? "Salvando…" : "Salvar aparência"}
          </button>
        </form>
        <Status state={state} />
        <form action={resetAction}>
          <input type="hidden" name="slug" value={slug} />
          <button
            type="submit"
            disabled={resetPending}
            className="rounded-md border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
          >
            {resetPending ? "Restaurando…" : "Restaurar padrão"}
          </button>
        </form>
        <Status state={resetState} />
      </div>
        <div className="grid gap-6 @6xl:grid-cols-[minmax(0,1fr)_860px]">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={
                    tab === t.id
                      ? "rounded-md bg-orange-600 px-4 py-2 text-sm font-semibold text-white"
                      : "rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                  }
                >
                  {t.label}
                </button>
              ))}
            </div>

            {tab === "paleta" && <PaletteTab value={draft.palette} onChange={(v) => setVisual({ palette: v })} />}
            {tab === "tipografia" && <TypographyTab value={draft.typography} onChange={(v) => setVisual({ typography: v })} />}
            {tab === "espacamentos" && <SpacingTab value={draft.spacing} onChange={(v) => setVisual({ spacing: v })} />}
            {tab === "cards" && (
              <CardsTab
                radius={draft.radius}
                onRadius={(v) => setVisual({ radius: v })}
                shadow={draft.shadow}
                onShadow={(v) => setVisual({ shadow: v })}
                motion={draft.motion}
                onMotion={(v) => setVisual({ motion: v })}
              />
            )}
            {tab === "hero" && <HeroFields value={draft.hero} onChange={(v) => setVisual({ hero: v })} />}
            {tab === "home" && <HeroFields value={draft.homeHero} onChange={(v) => setVisual({ homeHero: v })} />}
          </div>

          <div className="@6xl:sticky @6xl:top-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex gap-1 rounded-md border border-slate-200 p-1">
                  {(["desktop", "tablet", "mobile"] as Breakpoint[]).map((bp) => (
                    <button
                      key={bp}
                      type="button"
                      onClick={() => setDevice(bp)}
                      className={
                        device === bp
                          ? "rounded bg-orange-600 px-3 py-1 text-xs font-semibold text-white"
                          : "rounded px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                      }
                    >
                      {bp === "desktop" ? "Desktop" : bp === "tablet" ? "Tablet" : "Mobile"}
                    </button>
                  ))}
                </div>

              </div>
              <div ref={panelRef} className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                <div
                  className="relative mx-auto"
                  style={{ width: scaledW, height: scaledH, overflow: "hidden", minWidth: 0 }}
                >
                  <iframe
                    ref={iframeRef}
                    src={previewSrc}
                    onLoad={applyPreviewCss}
                    title="Preview ao vivo"
                    className="block bg-white"
                    style={{
                      width: previewSize.width,
                      height: previewSize.height,
                      transform: `scale(${scale})`,
                      transformOrigin: "top left",
                      border: 0,
                    }}
                  />
                </div>
              </div>
              <p className="mt-2 text-[11px] text-slate-400">
                Preview ao vivo. Salve para aplicar no site.
              </p>
            </div>
          </div>
        </div>
    </div>
  );
}
