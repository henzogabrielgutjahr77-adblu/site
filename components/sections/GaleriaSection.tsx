import GalleryGrid from "@/components/GalleryGrid";
import type { GalleryDisplayItem } from "@/lib/nextcloud";

export interface GallerySectionData {
  items: GalleryDisplayItem[];
  maxPerPage: number;
  offline: boolean;
  notice: string | null;
}

export default function GaleriaSection({ data }: { data?: GallerySectionData }) {
  if (!data) return null;
  return (
    <div className="mx-auto max-w-7xl px-4 py-14">
      {data.offline && data.notice && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {data.notice}
        </div>
      )}
      {data.items.length > 0 ? (
        <GalleryGrid items={data.items} maxPerPage={data.maxPerPage} />
      ) : (
        <p className="text-slate-500">{data.notice ?? "As fotos serão adicionadas em breve."}</p>
      )}
    </div>
  );
}
