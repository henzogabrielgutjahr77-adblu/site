import type { Metadata } from "next";
import GalleryGrid from "@/components/GalleryGrid";
import Markdown from "@/components/Markdown";
import { getGallery, getPage, getSiteConfig } from "@/lib/content";
import { getNextcloudGallery, isNextcloudEnabled } from "@/lib/nextcloud";
import type { GalleryDisplayItem } from "@/lib/nextcloud";

export const revalidate = 60;

export const metadata: Metadata = { title: "Galeria" };

export default async function GaleriaPage() {
  const intro = getPage("galeria");
  const config = getSiteConfig();
  const gallery = getGallery();

  // Fonte manual (CMS atual) — usada como fallback quando a integração está
  // desativada ou o Nextcloud está offline.
  const manualItems: GalleryDisplayItem[] = (gallery?.imagens ?? [])
    .filter((item) => item.image)
    .map((item, i) => ({
      id: `manual-${i}`,
      src: item.image!,
      alt: item.alt ?? "Foto da galeria",
      caption: item.alt,
      source: "manual" as const,
    }));

  const nextcloud = await getNextcloudGallery(config.nextcloud);
  const ncEnabled = isNextcloudEnabled(config.nextcloud);

  let items = manualItems;
  let notice: string | null = null;
  let offline = false;

  if (ncEnabled) {
    if (nextcloud.items.length > 0) {
      // Fonte principal: fotos sincronizadas automaticamente do Nextcloud.
      items = nextcloud.items;
    } else if (nextcloud.offline) {
      offline = true;
      notice =
        nextcloud.error ??
        "Não foi possível acessar o Nextcloud no momento. As fotos anteriores continuam disponíveis.";
      if (manualItems.length > 0) items = manualItems;
    } else {
      notice = "Ainda não há fotos na pasta do Nextcloud.";
    }
  }

  const maxPerPage = config.nextcloud?.max_per_page ?? 0;

  return (
    <article className="mx-auto max-w-7xl px-4 py-14">
      {intro && (
        <div className="mb-8">
          <h1 className="mb-4 text-3xl font-bold text-navy-900">{intro.title}</h1>
          <Markdown>{intro.body}</Markdown>
        </div>
      )}

      {offline && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {notice}
        </div>
      )}

      {items.length > 0 ? (
        <GalleryGrid items={items} maxPerPage={maxPerPage} />
      ) : (
        <p className="text-slate-500">{notice ?? "As fotos serão adicionadas em breve."}</p>
      )}
    </article>
  );
}
