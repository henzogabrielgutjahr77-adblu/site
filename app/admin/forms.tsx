"use client";

import { useActionState, useState } from "react";
import type { SiteConfig, PageContent } from "@/lib/content";
import {
  saveConfigAction,
  savePageAction,
  createPageAction,
  deletePageAction,
  saveGalleryAction,
  saveHorariosAction,
  uploadImageAction,
  saveNextcloudConfigAction,
  syncNextcloudAction,
  saveCalendarConfigAction,
  syncCalendarAction,
  type ActionResult,
} from "./actions";
import type { Horario } from "@/lib/content";

const inputCls =
  "mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-orange-500 focus:outline-none";

const btnCls =
  "rounded-md bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60";

const dangerBtnCls =
  "rounded-md border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60";

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
  { key: "instagram", label: "Instagram (URL)" },
  { key: "slogan", label: "Slogan" },
  { key: "descricao", label: "Descrição" },
  { key: "cta", label: "Botão CTA" },
  { key: "whatsapp", label: "WhatsApp (texto)" },
  { key: "whatsapp_url", label: "WhatsApp (URL)" },
  { key: "endereco", label: "Endereço" },
  { key: "email", label: "Email" },
  { key: "logo", label: "Logo (URL ou /uploads/…)" },
  { key: "copyright", label: "Copyright do rodapé" },
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

export function PageForm({
  page,
  defaultOpen,
}: {
  page: PageContent & { slug: string };
  defaultOpen?: boolean;
}) {
  const [state, action, pending] = useActionState(savePageAction, {});
  const [delState, delAction, delPending] = useActionState(deletePageAction, {});
  const content = (
    <>
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
        <div className="flex items-center gap-3">
          <button type="submit" disabled={pending} className={btnCls}>
            {pending ? "Salvando…" : `Salvar /${page.slug}`}
          </button>
        </div>
        <Status state={state} />
      </form>
      <form
        action={delAction}
        onSubmit={(e) => {
          if (!window.confirm(`Excluir a página "${page.title}" (/${page.slug})?`)) {
            e.preventDefault();
          }
        }}
        className="mt-3 flex items-center gap-3 border-t border-slate-100 pt-3"
      >
        <input type="hidden" name="slug" value={page.slug} />
        <button type="submit" disabled={delPending} className={dangerBtnCls}>
          {delPending ? "Excluindo…" : "Excluir página"}
        </button>
        <Status state={delState} />
      </form>
    </>
  );
  if (defaultOpen) {
    return (
      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">
          Informações da página{" "}
          <span className="ml-1 text-sm font-normal text-slate-400">/{page.slug}</span>
        </h3>
        <div className="mt-4">{content}</div>
      </section>
    );
  }
  return (
    <details className="group mt-3 rounded-2xl bg-white p-6 shadow-sm open:pb-4">
      <summary className="cursor-pointer text-base font-semibold text-slate-900">
        {page.title}{" "}
        <span className="ml-1 text-sm font-normal text-slate-400">/{page.slug}</span>
      </summary>
      {content}
    </details>
  );
}

export function PageCreateForm({ defaultOpen }: { defaultOpen?: boolean }) {
  const [state, action, pending] = useActionState(createPageAction, {});
  const content = (
    <>
      <form action={action} className="mt-4 space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="np-title">
              Título
            </label>
            <input id="np-title" name="title" className={inputCls} placeholder="Ex.: Nossa História" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="np-slug">
              Slug (endereço da página)
            </label>
            <input id="np-slug" name="slug" className={inputCls} placeholder="nossa-historia" />
            <p className="mt-1 text-xs text-slate-500">A página ficará em /nossa-historia. Use letras minúsculas, números e hífens.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="np-order">
              Ordem no menu
            </label>
            <input id="np-order" name="order" type="number" defaultValue={10} className={inputCls} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="np-body">
            Conteúdo (Markdown)
          </label>
          <textarea id="np-body" name="body" rows={12} className={`${inputCls} font-mono`} />
        </div>
        <button type="submit" disabled={pending} className={btnCls}>
          {pending ? "Criando…" : "Criar página"}
        </button>
        <Status state={state} />
      </form>
    </>
  );
  if (defaultOpen) {
    return (
      <section className="rounded-2xl border border-dashed border-orange-300 bg-orange-50/40 p-6 shadow-sm">
        <h3 className="text-base font-semibold text-orange-800">+ Nova página</h3>
        <div className="mt-4">{content}</div>
      </section>
    );
  }
  return (
    <details className="group mt-3 rounded-2xl border border-dashed border-orange-300 bg-orange-50/40 p-6 shadow-sm open:pb-4">
      <summary className="cursor-pointer text-base font-semibold text-orange-800">
        + Nova página
      </summary>
      {content}
    </details>
  );
}

export function HorariosForm({ horarios }: { horarios: Horario[] }) {
  const [state, action, pending] = useActionState(saveHorariosAction, {});
  const [rows, setRows] = useState<Horario[]>(
    horarios.length > 0
      ? horarios.map((h) => ({ dia: h.dia, horario: h.horario, descricao: h.descricao ?? "" }))
      : [{ dia: "", horario: "", descricao: "" }],
  );

  function updateRow(index: number, key: keyof Horario, value: string) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, [key]: value } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, { dia: "", horario: "", descricao: "" }]);
  }

  function removeRow(index: number) {
    setRows((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  }

  function moveRow(index: number, dir: -1 | 1) {
    setRows((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return (
    <form action={action} className="mt-3 rounded-2xl bg-white p-6 shadow-sm">
      <p className="text-sm text-slate-500">
        Adicione ou remova quantos cultos quiser. Cada linha é um horário exibido na página inicial.
      </p>
      <div className="mt-4 space-y-4">
        {rows.map((row, index) => (
          <div key={index} className="rounded-lg border border-slate-200 p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-slate-700" htmlFor={`hr-dia-${index}`}>
                  Dia
                </label>
                <input
                  id={`hr-dia-${index}`}
                  name="dia"
                  value={row.dia}
                  onChange={(e) => updateRow(index, "dia", e.target.value)}
                  className={inputCls}
                  placeholder="Domingo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700" htmlFor={`hr-hor-${index}`}>
                  Horário
                </label>
                <input
                  id={`hr-hor-${index}`}
                  name="horario"
                  value={row.horario}
                  onChange={(e) => updateRow(index, "horario", e.target.value)}
                  className={inputCls}
                  placeholder="Domingo às 18h30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700" htmlFor={`hr-desc-${index}`}>
                  Descrição (opcional)
                </label>
                <input
                  id={`hr-desc-${index}`}
                  name="descricao"
                  value={row.descricao ?? ""}
                  onChange={(e) => updateRow(index, "descricao", e.target.value)}
                  className={inputCls}
                  placeholder="Culto ao Senhor, com louvor e ministração da Palavra."
                />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => moveRow(index, -1)}
                disabled={index === 0}
                aria-label="Mover para cima"
                className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => moveRow(index, 1)}
                disabled={index === rows.length - 1}
                aria-label="Mover para baixo"
                className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => removeRow(index)}
                disabled={rows.length <= 1}
                className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-40"
              >
                Remover este culto
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addRow}
        className="mt-4 rounded-md border border-orange-300 px-4 py-2 text-sm font-semibold text-orange-700 hover:bg-orange-50"
      >
        + Adicionar culto
      </button>
      <div className="mt-5">
        <button type="submit" disabled={pending} className={btnCls}>
          {pending ? "Salvando…" : "Salvar horários"}
        </button>
      </div>
      <Status state={state} />
    </form>
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

export function NextcloudForm({ config }: { config: SiteConfig }) {
  const [state, action, pending] = useActionState(saveNextcloudConfigAction, {});
  const nc = config.nextcloud;
  return (
    <div className="space-y-4">
      <form action={action} className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            name="enabled"
            defaultChecked={nc?.enabled ?? false}
            className="h-4 w-4 rounded border-slate-300"
          />
          Habilitar galeria sincronizada pelo Nextcloud
        </label>
        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="nc-webdav">
            URL do WebDAV
          </label>
          <input
            id="nc-webdav"
            name="webdav_url"
            defaultValue={nc?.webdav_url ?? ""}
            placeholder="https://cloud.exemplo.com/remote.php/dav/files/usuario"
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="nc-folder">
            Pasta (origem oficial das fotos)
          </label>
          <input
            id="nc-folder"
            name="folder"
            defaultValue={nc?.folder ?? "Galeria Site"}
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="nc-user">
            Usuário
          </label>
          <input
            id="nc-user"
            name="username"
            defaultValue={nc?.username ?? ""}
            autoComplete="off"
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="nc-pass">
            Senha / App password
          </label>
          <input
            id="nc-pass"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="deixe em branco para manter a atual"
            className={inputCls}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="nc-max">
              Fotos por página
            </label>
            <input
              id="nc-max"
              name="max_per_page"
              type="number"
              min={1}
              max={200}
              defaultValue={nc?.max_per_page ?? 48}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="nc-int">
              Intervalo de sincronização (s)
            </label>
            <input
              id="nc-int"
              name="sync_interval_seconds"
              type="number"
              min={15}
              defaultValue={nc?.sync_interval_seconds ?? 300}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="nc-ttl">
              Vida do cache (s)
            </label>
            <input
              id="nc-ttl"
              name="cache_ttl_seconds"
              type="number"
              min={30}
              defaultValue={nc?.cache_ttl_seconds ?? 3600}
              className={inputCls}
            />
          </div>
        </div>
        <button type="submit" disabled={pending} className={btnCls}>
          {pending ? "Salvando…" : "Salvar configuração"}
        </button>
        <Status state={state} />
      </form>
      <SyncNowForm />
    </div>
  );
}

export function CalendarForm({ config }: { config: SiteConfig }) {
  const [state, action, pending] = useActionState(saveCalendarConfigAction, {});
  const cal = config.calendar;
  return (
    <div className="space-y-4">
      <form action={action} className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            name="enabled"
            defaultChecked={cal?.enabled ?? false}
            className="h-4 w-4 rounded border-slate-300"
          />
          Habilitar agenda sincronizada pelo Nextcloud
        </label>
        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="cal-url">
            URL base do CalDAV
          </label>
          <input
            id="cal-url"
            name="caldav_url"
            defaultValue={cal?.caldav_url ?? ""}
            placeholder="https://cloud.exemplo.com/remote.php/dav/calendars/usuario"
            className={inputCls}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="cal-id">
              ID do calendário
            </label>
            <input
              id="cal-id"
              name="calendar_id"
              defaultValue={cal?.calendar_id ?? "agenda"}
              placeholder="agenda"
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="cal-user">
              Usuário
            </label>
            <input
              id="cal-user"
              name="username"
              defaultValue={cal?.username ?? ""}
              autoComplete="off"
              className={inputCls}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="cal-int">
            Intervalo de sincronização (s)
          </label>
          <input
            id="cal-int"
            name="sync_interval_seconds"
            type="number"
            min={15}
            defaultValue={cal?.sync_interval_seconds ?? 300}
            className={inputCls}
          />
          <p className="mt-1 text-xs text-slate-500">
            Usa a mesma senha / app password da galeria (content/site/nextcloud.secret).
          </p>
        </div>
        <button type="submit" disabled={pending} className={btnCls}>
          {pending ? "Salvando…" : "Salvar configuração"}
        </button>
        <Status state={state} />
      </form>
      <CalendarSyncNowForm />
    </div>
  );
}

export function CalendarSyncNowForm() {
  const [state, action, pending] = useActionState(syncCalendarAction, {});
  return (
    <form action={action} className="rounded-2xl bg-white p-6 shadow-sm">
      <p className="text-sm text-slate-600">
        Baixa os eventos novos do calendário do Nextcloud e remove os que saíram.
      </p>
      <div className="mt-3 flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          {pending ? "Sincronizando…" : "Sincronizar agora"}
        </button>
        <Status state={state} />
      </div>
    </form>
  );
}

export function SyncNowForm() {
  const [state, action, pending] = useActionState(syncNextcloudAction, {});
  return (
    <form action={action} className="rounded-2xl bg-white p-6 shadow-sm">
      <p className="text-sm text-slate-600">
        Baixa as fotos novas da pasta do Nextcloud e remove as que saíram.
      </p>
      <div className="mt-3 flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          {pending ? "Sincronizando…" : "Sincronizar agora"}
        </button>
        <Status state={state} />
      </div>
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
