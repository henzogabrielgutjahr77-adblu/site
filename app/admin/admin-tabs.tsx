"use client";

import { useState } from "react";
import type { SiteConfig, PageContent, GalleryContent } from "@/lib/content";
import type { VisualConfig } from "@/lib/visual";
import {
  ConfigForm,
  PageForm,
  PageCreateForm,
  GalleryForm,
  HorariosForm,
  UploadForm,
  NextcloudForm,
  CalendarForm,
} from "./forms";
import VisualForm from "./visual-form";
import SectionsForm, { type EditablePage } from "./sections-form";

interface PageTab extends EditablePage {
  visual: VisualConfig;
}

interface AdminTabsProps {
  config: SiteConfig;
  pages: (PageContent & { slug: string })[];
  gallery: GalleryContent | null;
  imagens: string;
  builderPages: PageTab[];
}

const activeTabCls = "border-b-2 border-orange-600 px-3 py-2 text-sm font-semibold text-orange-700";
const idleTabCls = "border-b-2 border-transparent px-3 py-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800";

export default function AdminTabs({
  config,
  pages,
  gallery,
  imagens,
  builderPages,
}: AdminTabsProps) {
  const [active, setActive] = useState("page:home");

  const tabBtn = (id: string, label: string) => (
    <button
      key={id}
      type="button"
      onClick={() => setActive(id)}
      className={active === id ? activeTabCls : idleTabCls}
    >
      {label}
    </button>
  );

  const hrefFor = (slug: string) => (slug === "home" ? "/" : `/${slug}`);

  function renderContent() {
    if (active.startsWith("page:")) {
      const slug = active.slice("page:".length);
      const bp = builderPages.find((b) => b.slug === slug);
      const page = pages.find((p) => p.slug === slug);
      if (!bp) {
        return <p className="text-sm text-slate-500">Página não encontrada.</p>;
      }
      return (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Layout da página</h2>
            <a
              href={hrefFor(slug)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-orange-600 hover:underline"
            >
              Abrir página ↗
            </a>
          </div>
          {page && <PageForm page={page} defaultOpen />}
          <SectionsForm pages={[bp]} />
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Aparência desta página</h2>
            <p className="text-sm text-slate-500">
              Personalize paleta, tipografia, espaçamentos, cards e hero somente desta página.
              O preview à direita é ao vivo.
            </p>
            <VisualForm slug={bp.slug} visual={bp.visual} />
          </div>
        </div>
      );
    }
    switch (active) {
      case "new-page":
        return <PageCreateForm defaultOpen />;
      case "config":
        return <ConfigForm config={config} />;
      case "horarios":
        return <HorariosForm horarios={config.horarios ?? []} />;
      case "integrations":
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Galeria via Nextcloud</h2>
              <p className="text-sm text-slate-500">
                Configure a pasta oficial de fotos no Nextcloud. A galeria do site passa a ser
                atualizada automaticamente quando fotos forem adicionadas ou removidas.
              </p>
              <NextcloudForm config={config} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Agenda via Nextcloud</h2>
              <p className="text-sm text-slate-500">
                Configure o calendário do Nextcloud (CalDAV). Os eventos aparecem, mês a mês,
                na página Agenda do site.
              </p>
              <CalendarForm config={config} />
            </div>
          </div>
        );
      case "gallery":
        return (
          <div className="space-y-8">
            <GalleryForm title={gallery?.title ?? "Galeria"} imagens={imagens} />
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Upload de imagens</h2>
              <UploadForm />
              <p className="mt-2 text-xs text-slate-500">
                Use a URL retornada nos campos de imagem (ex.: /uploads/…). Máximo de 5 MB.
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <div>
      <nav className="mt-8 flex items-center gap-1 overflow-x-auto border-b border-slate-200 pb-px">
        <span className="mr-2 shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Páginas
        </span>
        {builderPages.map((p) => tabBtn(`page:${p.slug}`, p.title))}
        {tabBtn("new-page", "+ Nova página")}
        <span className="mx-3 h-6 w-px shrink-0 bg-slate-200" aria-hidden />
        <span className="mr-2 shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Site
        </span>
        {tabBtn("config", "Configurações")}
        {tabBtn("horarios", "Horários")}
        {tabBtn("integrations", "Integrações")}
        {tabBtn("gallery", "Galeria")}
      </nav>
      <div className="mt-6">{renderContent()}</div>
    </div>
  );
}
