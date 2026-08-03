"use client";

import { useActionState, useState } from "react";
import {
  SECTION_LABELS,
  SECTION_TYPES,
  type Section,
  type SectionType,
  type HeroProps,
  type TextoProps,
  type CardsProps,
  type CtaProps,
  type ContatoProps,
  type ImagemProps,
  type CardContent,
} from "@/lib/section-types";
import {
  saveSectionsAction,
  resetSectionsAction,
  type ActionResult,
} from "./actions";

const inputCls =
  "mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-orange-500 focus:outline-none";
const btnCls =
  "rounded-md bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60";
const ghostBtn =
  "rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40";

export interface EditablePage {
  slug: string;
  title: string;
  sections: Section[];
}

function Status({ state }: { state: ActionResult }) {
  if (state.ok) return <p className="mt-3 text-sm font-medium text-emerald-600">{state.ok}</p>;
  if (state.error) return <p className="mt-3 text-sm font-medium text-red-600">{state.error}</p>;
  return null;
}

function newSection(type: SectionType): Section {
  switch (type) {
    case "texto":
      return { type, props: { titulo: "", corpo: "" } };
    case "cards":
      return { type, props: { cards: [] } };
    case "cta":
      return {
        type,
        props: {
          titulo: "",
          texto: "",
          botao_texto: "",
          botao_link: "",
          botao2_texto: "",
          botao2_link: "",
          botao2_ocultar: false,
        },
      };
    case "hero":
      return { type, props: {} };
    case "contato":
      return { type, props: { mostrar_form: true } };
    case "imagem":
      return { type, props: { src: "", alt: "" } };
    default:
      return { type };
  }
}

function Field({
  label,
  value,
  onChange,
  textarea,
  rows,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  rows?: number;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600">{label}</label>
      {textarea ? (
        <textarea
          rows={rows ?? 4}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputCls}
          placeholder={placeholder}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputCls}
          placeholder={placeholder}
        />
      )}
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

export default function SectionsForm({ pages }: { pages: EditablePage[] }) {
  return (
    <div className="mt-3 space-y-4">
      <p className="text-sm text-slate-500">
        Monte o layout desta página adicionando, removendo ou reordenando seções.
      </p>
      {pages.map((page) => (
        <PageBuilder key={page.slug} page={page} />
      ))}
    </div>
  );
}

function PageBuilder({ page }: { page: EditablePage }) {
  const [sections, setSections] = useState<Section[]>(page.sections);
  const [adding, setAdding] = useState<SectionType>("texto");
  const [saveState, saveAction, savePending] = useActionState(saveSectionsAction, {});
  const [resetState, resetAction, resetPending] = useActionState(resetSectionsAction, {});

  function setSection(index: number, next: Section) {
    setSections((prev) => prev.map((s, i) => (i === index ? next : s)));
  }
  function move(index: number, dir: -1 | 1) {
    setSections((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }
  function remove(index: number) {
    setSections((prev) => prev.filter((_, i) => i !== index));
  }
  function add() {
    setSections((prev) => [...prev, newSection(adding)]);
  }

  return (
    <details className="group rounded-2xl bg-white p-6 shadow-sm open:pb-4">
      <summary className="cursor-pointer text-base font-semibold text-slate-900">
        {page.title}{" "}
        <span className="ml-1 text-sm font-normal text-slate-400">/{page.slug}</span>
      </summary>

      <div className="mt-4 space-y-3">
        {sections.length === 0 && (
          <p className="text-sm text-slate-400">
            Nenhuma seção. Adicione uma abaixo.
          </p>
        )}
        {sections.map((section, index) => (
          <div key={index} className="rounded-lg border border-slate-200 p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-slate-700">
                {SECTION_LABELS[section.type]}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  className={ghostBtn}
                  aria-label="Mover para cima"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === sections.length - 1}
                  className={ghostBtn}
                  aria-label="Mover para baixo"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className={`${ghostBtn} border-red-200 text-red-600 hover:bg-red-50`}
                >
                  Remover
                </button>
              </div>
            </div>
            <SectionFields section={section} onChange={(next) => setSection(index, next)} />
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <select
          value={adding}
          onChange={(e) => setAdding(e.target.value as SectionType)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          {SECTION_TYPES.map((t) => (
            <option key={t} value={t}>
              {SECTION_LABELS[t]}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={add}
          className="rounded-md border border-orange-300 px-4 py-2 text-sm font-semibold text-orange-700 hover:bg-orange-50"
        >
          + Adicionar seção
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
        <form action={saveAction}>
          <input type="hidden" name="slug" value={page.slug} />
          <input type="hidden" name="sections" value={JSON.stringify(sections)} />
          <button type="submit" disabled={savePending} className={btnCls}>
            {savePending ? "Salvando…" : "Salvar layout"}
          </button>
        </form>
        <form action={resetAction}>
          <input type="hidden" name="slug" value={page.slug} />
          <button
            type="submit"
            disabled={resetPending}
            className="rounded-md border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
          >
            Restaurar padrão
          </button>
        </form>
        <Status state={saveState} />
        <Status state={resetState} />
      </div>
    </details>
  );
}

function SectionFields({
  section,
  onChange,
}: {
  section: Section;
  onChange: (s: Section) => void;
}) {
  function patch(props: Record<string, unknown>) {
    onChange({ ...section, props: { ...(section.props ?? {}), ...props } } as Section);
  }
  switch (section.type) {
    case "hero":
      return <HeroFields props={section.props} patch={patch} />;
    case "texto":
      return <TextoFields props={section.props} patch={patch} />;
    case "cards":
      return <CardsFields props={section.props} patch={patch} />;
    case "horarios":
      return (
        <p className="mt-3 text-xs text-slate-500">
          Usa os cultos definidos na seção &quot;Horários de culto&quot; acima.
        </p>
      );
    case "calendario":
      return (
        <p className="mt-3 text-xs text-slate-500">
          Mostra o calendário de eventos sincronizado com o Nextcloud (página Agenda).
        </p>
      );
    case "galeria":
      return (
        <p className="mt-3 text-xs text-slate-500">
          Mostra a galeria de fotos (manual + Nextcloud), com visualização em tela cheia.
        </p>
      );
    case "cta":
      return <CtaFields props={section.props} patch={patch} />;
    case "contato":
      return <ContatoFields props={section.props} patch={patch} />;
    case "imagem":
      return <ImagemFields props={section.props} patch={patch} />;
    default:
      return null;
  }
}

function HeroFields({
  props,
  patch,
}: {
  props?: HeroProps;
  patch: (p: Record<string, unknown>) => void;
}) {
  if (props?.home) {
    return (
      <p className="mt-3 text-xs text-slate-500">
        Hero da página inicial: usa o título, slogan, CTA e Instagram das
        &quot;Configurações gerais&quot;.
      </p>
    );
  }
  return (
    <div className="mt-3 grid gap-3 sm:grid-cols-2">
      <Field label="Título" value={props?.titulo ?? ""} onChange={(v) => patch({ titulo: v })} />
      <Field
        label="Imagem de fundo (URL ou /uploads/…)"
        value={props?.imagem ?? ""}
        onChange={(v) => patch({ imagem: v })}
        hint="Faça upload na seção &quot;Upload de imagens&quot; e cole aqui."
      />
      <Field
        label="Subtítulo"
        value={props?.subtitulo ?? ""}
        onChange={(v) => patch({ subtitulo: v })}
        placeholder="Deixe vazio para usar o padrão"
      />
      <Field label="Botão 1 — texto" value={props?.botao1_texto ?? ""} onChange={(v) => patch({ botao1_texto: v })} />
      <Field label="Botão 1 — link" value={props?.botao1_link ?? ""} onChange={(v) => patch({ botao1_link: v })} />
      <Field label="Botão 2 — texto" value={props?.botao2_texto ?? ""} onChange={(v) => patch({ botao2_texto: v })} />
      <Field label="Botão 2 — link" value={props?.botao2_link ?? ""} onChange={(v) => patch({ botao2_link: v })} />
    </div>
  );
}

function TextoFields({
  props,
  patch,
}: {
  props?: TextoProps;
  patch: (p: Record<string, unknown>) => void;
}) {
  return (
    <div className="mt-3 grid gap-3 sm:grid-cols-2">
      <Field label="Título" value={props?.titulo ?? ""} onChange={(v) => patch({ titulo: v })} />
      <div className="sm:col-span-2">
        <Field
          label="Conteúdo (Markdown)"
          value={props?.corpo ?? ""}
          onChange={(v) => patch({ corpo: v })}
          textarea
          rows={5}
          hint="Deixe vazio para usar o conteúdo da página (editado em &quot;Páginas&quot;)."
        />
      </div>
    </div>
  );
}

function CardsFields({
  props,
  patch,
}: {
  props?: CardsProps;
  patch: (p: Record<string, unknown>) => void;
}) {
  const cards: CardContent[] = props?.cards ?? [];
  function setCards(next: CardContent[]) {
    patch({ cards: next });
  }
  return (
    <div className="mt-3 space-y-3">
      <Field label="Título da seção (opcional)" value={props?.titulo ?? ""} onChange={(v) => patch({ titulo: v })} />
      {cards.map((card, i) => (
        <div key={i} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Card {i + 1}</span>
            <button
              type="button"
              onClick={() => setCards(cards.filter((_, j) => j !== i))}
              className={`${ghostBtn} border-red-200 text-red-600 hover:bg-red-50`}
            >
              Remover card
            </button>
          </div>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            <Field label="Título" value={card.titulo ?? ""} onChange={(v) => setCards(cards.map((c, j) => (j === i ? { ...c, titulo: v } : c)))} />
            <div>
              <label className="block text-xs font-medium text-slate-600">Ícone</label>
              <select
                value={card.icone ?? ""}
                onChange={(e) =>
                  setCards(cards.map((c, j) => (j === i ? { ...c, icone: e.target.value as CardContent["icone"] } : c)))
                }
                className={inputCls}
              >
                <option value="">Sem ícone</option>
                <option value="target">Alvo (Missão)</option>
                <option value="eye">Olho (Visão)</option>
                <option value="heart">Coração (Valores)</option>
                <option value="check">Check</option>
              </select>
            </div>
            <Field
              label="Texto (Markdown)"
              value={card.texto ?? ""}
              onChange={(v) => setCards(cards.map((c, j) => (j === i ? { ...c, texto: v } : c)))}
              textarea
              rows={3}
            />
            <Field
              label="Lista (um item por linha)"
              value={(card.valores ?? []).join("\n")}
              onChange={(v) =>
                setCards(
                  cards.map((c, j) =>
                    j === i
                      ? { ...c, valores: v.split("\n").map((x) => x.trim()).filter(Boolean) }
                      : c,
                  ),
                )
              }
              textarea
              rows={3}
              hint="Se preenchido, mostra a lista com checks em vez do texto."
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setCards([...cards, {}])}
        className="rounded-md border border-orange-300 px-3 py-1.5 text-xs font-semibold text-orange-700 hover:bg-orange-50"
      >
        + Adicionar card
      </button>
    </div>
  );
}

function CtaFields({
  props,
  patch,
}: {
  props?: CtaProps;
  patch: (p: Record<string, unknown>) => void;
}) {
  return (
    <div className="mt-3 grid gap-3 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Field label="Título" value={props?.titulo ?? ""} onChange={(v) => patch({ titulo: v })} />
      </div>
      <div className="sm:col-span-2">
        <Field label="Texto (opcional)" value={props?.texto ?? ""} onChange={(v) => patch({ texto: v })} />
      </div>
      <Field label="Botão 1 — texto" value={props?.botao_texto ?? ""} onChange={(v) => patch({ botao_texto: v })} hint="Vazio = usa o CTA das configurações gerais." />
      <Field label="Botão 1 — link" value={props?.botao_link ?? ""} onChange={(v) => patch({ botao_link: v })} />
      <Field label="Botão 2 — texto" value={props?.botao2_texto ?? ""} onChange={(v) => patch({ botao2_texto: v })} hint="Vazio = mostra o WhatsApp das configurações gerais." />
      <Field label="Botão 2 — link" value={props?.botao2_link ?? ""} onChange={(v) => patch({ botao2_link: v })} />
      <div className="flex items-end">
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={props?.botao2_ocultar !== true}
            onChange={(e) => patch({ botao2_ocultar: !e.target.checked })}
            className="h-4 w-4 rounded border-slate-300 text-orange-600"
          />
          Mostrar botão 2 (WhatsApp)
        </label>
      </div>
    </div>
  );
}

function ContatoFields({
  props,
  patch,
}: {
  props?: ContatoProps;
  patch: (p: Record<string, unknown>) => void;
}) {
  return (
    <div className="mt-3 grid gap-3 sm:grid-cols-2">
      <Field label="Título" value={props?.titulo ?? ""} onChange={(v) => patch({ titulo: v })} />
      <div className="flex items-end">
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={props?.mostrar_form !== false}
            onChange={(e) => patch({ mostrar_form: e.target.checked })}
            className="h-4 w-4 rounded border-slate-300 text-orange-600"
          />
          Mostrar formulário de contato
        </label>
      </div>
      <div className="sm:col-span-2">
        <Field
          label="Texto (Markdown)"
          value={props?.texto ?? ""}
          onChange={(v) => patch({ texto: v })}
          textarea
          rows={4}
          hint="Deixe vazio para usar o conteúdo da página (editado em &quot;Páginas&quot;)."
        />
      </div>
    </div>
  );
}

function ImagemFields({
  props,
  patch,
}: {
  props?: ImagemProps;
  patch: (p: Record<string, unknown>) => void;
}) {
  return (
    <div className="mt-3 grid gap-3 sm:grid-cols-2">
      <Field
        label="Imagem (URL ou /uploads/…)"
        value={props?.src ?? ""}
        onChange={(v) => patch({ src: v })}
        hint="Faça upload na seção &quot;Upload de imagens&quot; e cole aqui."
      />
      <Field label="Texto alternativo (acessibilidade)" value={props?.alt ?? ""} onChange={(v) => patch({ alt: v })} />
    </div>
  );
}