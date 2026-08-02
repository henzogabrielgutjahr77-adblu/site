"use client";

import { useActionState } from "react";
import type { SiteConfig, PageContent } from "@/lib/content";
import {
  saveConfigAction,
  savePageAction,
  saveGalleryAction,
  uploadImageAction,
  type ActionResult,
} from "./actions";

const inputCls =
  "mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-orange-500 focus:outline-none";

const btnCls =
  "rounded-md bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60";

function Status({ state }: { state: ActionResult }) {
  if (state.ok) return <p className="mt-3 text-sm font-medium text-emerald-600">{state.ok}</p>;
  if (state.error) return <p className="mt-3 text-sm font-medium text-red-600">{state.error}</p>;
  return null;
}

const CONFIG_FIELDS: { key: keyof SiteConfig; label: string }[] = [
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

export function ConfigForm({ config }: { config: SiteConfig }) {
  const [state, action, pending] = useActionState(saveConfigAction, {});
  return (
    <form action={action} className="mt-3 rounded-2xl bg-white p-6 shadow-sm">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {CONFIG_FIELDS.map((field) => (
          <div key={field.key}>
            <label className="block text-sm font-medium text-slate-700" htmlFor={`cfg-${field.key}`}>
              {field.label}
            </label>
            <input
              id={`cfg-${field.key}`}
              name={field.key}
              defaultValue={String(config[field.key] ?? "")}
              className={inputCls}
            />
          </div>
        ))}
      </div>
      <button type="submit" disabled={pending} className={`${btnCls} mt-5`}>
        {pending ? "Salvando…" : "Salvar configurações"}
      </button>
      <Status state={state} />
    </form>
  );
}

export function PageForm({ page }: { page: PageContent & { slug: string } }) {
  const [state, action, pending] = useActionState(savePageAction, {});
  return (
    <details className="group mt-3 rounded-2xl bg-white p-6 shadow-sm open:pb-4">
      <summary className="cursor-pointer text-base font-semibold text-slate-900">
        {page.title}{" "}
        <span className="ml-1 text-sm font-normal text-slate-400">/{page.slug}</span>
      </summary>
      <form action={action} className="mt-4 space-y-4">
        <input type="hidden" name="slug" value={page.slug} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor={`t-${page.slug}`}>
              Título
            </label>
            <input id={`t-${page.slug}`} name="title" defaultValue={page.title} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor={`o-${page.slug}`}>
              Ordem no menu
            </label>
            <input id={`o-${page.slug}`} name="order" type="number" defaultValue={page.order} className={inputCls} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor={`b-${page.slug}`}>
            Conteúdo (Markdown)
          </label>
          <textarea id={`b-${page.slug}`} name="body" rows={14} defaultValue={page.body} className={`${inputCls} font-mono`} />
        </div>
        <button type="submit" disabled={pending} className={btnCls}>
          {pending ? "Salvando…" : `Salvar /${page.slug}`}
        </button>
        <Status state={state} />
      </form>
    </details>
  );
}

export function GalleryForm({ title, imagens }: { title: string; imagens: string }) {
  const [state, action, pending] = useActionState(saveGalleryAction, {});
  return (
    <form action={action} className="mt-3 rounded-2xl bg-white p-6 shadow-sm">
      <label className="block text-sm font-medium text-slate-700" htmlFor="gal-title">
        Título
      </label>
      <input id="gal-title" name="title" defaultValue={title} className={inputCls} />
      <label className="mt-4 block text-sm font-medium text-slate-700" htmlFor="gal-imagens">
        Imagens (uma por linha: <code className="font-mono">url</code> ou{" "}
        <code className="font-mono">url|descrição</code>)
      </label>
      <textarea id="gal-imagens" name="imagens" rows={8} defaultValue={imagens} className={`${inputCls} font-mono`} />
      <button type="submit" disabled={pending} className={`${btnCls} mt-5`}>
        {pending ? "Salvando…" : "Salvar galeria"}
      </button>
      <Status state={state} />
    </form>
  );
}

export function UploadForm() {
  const [state, action, pending] = useActionState(uploadImageAction, {});
  return (
    <form action={action} className="mt-3 rounded-2xl bg-white p-6 shadow-sm">
      <input
        name="file"
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        required
        className="block text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium"
      />
      <button type="submit" disabled={pending} className={`${btnCls} mt-5`}>
        {pending ? "Enviando…" : "Enviar imagem"}
      </button>
      {state.ok ? (
        <p className="mt-3 rounded bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          URL: <code className="font-mono">{state.ok}</code>
        </p>
      ) : (
        <Status state={state} />
      )}
    </form>
  );
}
