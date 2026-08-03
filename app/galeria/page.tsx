import type { Metadata } from "next";
import Sections from "@/components/sections";
import { getGallery, getSiteConfig } from "@/lib/content";
import { getNextcloudGallery, isNextcloudEnabled } from "@/lib/nextcloud";
import type { GalleryDisplayItem } from "@/lib/nextcloud";

export const revalidate = 60;

export const metadata: Metadata = { title: "Galeria" };

export default async function GaleriaPage() {
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

  return <Sections slug="galeria" galeria={{ items, notice, offline, maxPerPage }} />;
}
