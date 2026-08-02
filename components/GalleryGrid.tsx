"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import type { GalleryDisplayItem } from "@/lib/nextcloud";
import GalleryLightbox from "./GalleryLightbox";

interface GalleryGridProps {
  items: GalleryDisplayItem[];
  /** Quantidade máxima de imagens visíveis por página (0 = todas). */
  maxPerPage: number;
}

export default function GalleryGrid({ items, maxPerPage }: GalleryGridProps) {
  const initial = maxPerPage > 0 ? maxPerPage : items.length;
  const [visible, setVisible] = useState(initial);
  const [open, setOpen] = useState<number | null>(null);
  const shown = useMemo(() => items.slice(0, visible), [items, visible]);

  const loadMore = () => setVisible((v) => Math.min(items.length, v + initial));

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {shown.map((item, i) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setOpen(i)}
            aria-label={`Abrir foto ${item.caption ?? item.alt}`}
            className="group relative block w-full overflow-hidden rounded-lg bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            style={{
              animation: "gallery-fade-in 0.55s ease-out both",
              animationDelay: `${Math.min(i * 45, 700)}ms`,
            }}
          >
            <div className="relative aspect-[4/3] w-full">
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
              />
            </div>
            <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-2 pt-6 text-left text-xs font-medium text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              {item.caption ?? item.alt}
            </span>
          </button>
        ))}
      </div>

      {visible < items.length && (
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={loadMore}
            className="rounded-lg bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-700"
          >
            Carregar mais
          </button>
        </div>
      )}

      {open !== null && (
        <GalleryLightbox
          items={items}
          index={open}
          onNavigate={setOpen}
          onClose={() => setOpen(null)}
        />
      )}
    </>
  );
}
