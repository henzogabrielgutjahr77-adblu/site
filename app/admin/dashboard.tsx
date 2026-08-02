import { getSiteConfig, getPages, getGallery } from "@/lib/content";
import { logoutAction } from "./actions";
import { ConfigForm, PageForm, PageCreateForm, GalleryForm, HorariosForm, UploadForm, NextcloudForm, CalendarForm } from "./forms";

export default function Dashboard() {
  const config = getSiteConfig();
  const pages = getPages();
  const gallery = getGallery();
  const imagens = (gallery?.imagens ?? [])
    .map((item) => (item.alt ? `${item.image ?? ""}|${item.alt}` : item.image ?? ""))
    .join("\n");

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Administração do site</h1>
          <p className="mt-1 text-sm text-slate-500">
            As alterações são salvas em Markdown/YAML e sincronizadas com o repositório.
          </p>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Sair
          </button>
        </form>
      </div>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900">Configurações gerais</h2>
        <ConfigForm config={config} />
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">Horários de culto</h2>
        <p className="text-sm text-slate-500">
          Adicione, remova ou edite os cultos exibidos na página inicial. Cada culto tem dia, horário e descrição.
        </p>
        <HorariosForm horarios={config.horarios ?? []} />
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">Páginas</h2>
        <p className="text-sm text-slate-500">
          Crie novas páginas ou edite as existentes. O campo &quot;ordem&quot; define a posição no menu.
        </p>
        <PageCreateForm />
        {pages.map((page) => (
          <PageForm key={page.slug} page={page} />
        ))}
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">Galeria via Nextcloud</h2>
        <p className="text-sm text-slate-500">
          Configure a pasta oficial de fotos no Nextcloud. A galeria do site passa a ser
          atualizada automaticamente quando fotos forem adicionadas ou removidas.
        </p>
        <NextcloudForm config={config} />
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">Agenda via Nextcloud</h2>
        <p className="text-sm text-slate-500">
          Configure o calendário do Nextcloud (CalDAV). Os eventos aparecem, mês a
          mês, na página Agenda do site.
        </p>
        <CalendarForm config={config} />
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">Galeria de fotos</h2>
        <GalleryForm title={gallery?.title ?? "Galeria"} imagens={imagens} />
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">Upload de imagens</h2>
        <UploadForm />
        <p className="mt-2 text-xs text-slate-500">
          Use a URL retornada nos campos de imagem (ex.: /uploads/…). Máximo de 5 MB.
        </p>
      </section>
    </div>
  );
}
