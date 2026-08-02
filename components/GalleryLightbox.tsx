"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, type TouchEvent } from "react";
import type { GalleryDisplayItem } from "@/lib/nextcloud";

interface GalleryLightboxProps {
  items: GalleryDisplayItem[];
  index: number;
  onNavigate: (index: number) => void;
  onClose: () => void;
}

const iconBtnCls =
  "flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25";
const sideArrowCls =
  "absolute top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-3xl leading-none text-white shadow-lg backdrop-blur-sm transition-colors hover:bg-black/70 active:scale-95 sm:h-14 sm:w-14";
const bottomBtnCls =
  "flex items-center gap-1.5 rounded-full bg-white/10 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/25 active:scale-95";

export default function GalleryLightbox({
  items,
  index,
  onNavigate,
  onClose,
}: GalleryLightboxProps) {
  const item = items[index];
  const touchStartX = useRef<number | null>(null);

  const prev = useCallback(
    () => onNavigate((index - 1 + items.length) % items.length),
    [index, items.length, onNavigate],
  );
  const next = useCallback(
    () => onNavigate((index + 1) % items.length),
    [index, items.length, onNavigate],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, prev, next]);

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) > 48) {
      if (dx < 0) next();
      else prev();
    }
  };

  if (!item) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Visualização da foto"
      className="fixed inset-0 z-[100] flex flex-col bg-black/95"
      onClick={onClose}
    >
      <div className="flex items-center justify-between px-4 py-3 text-white">
        <button type="button" aria-label="Fechar" onClick={onClose} className={iconBtnCls}>
          ✕
        </button>
        <span className="text-sm tabular-nums text-white/70">
          {index + 1} / {items.length}
        </span>
        <span className="w-11" aria-hidden />
      </div>

      <div
        className="relative min-h-0 flex-1 px-14 sm:px-20"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Image
          src={item.src}
          alt={item.alt}
          fill
          sizes="100vw"
          className="object-contain"
        />

        <button
          type="button"
          aria-label="Foto anterior"
          onClick={(e) => {
            e.stopPropagation();
            prev();
          }}
          className={`${sideArrowCls} left-1 sm:left-4`}
        >
          ‹
        </button>
        <button
          type="button"
          aria-label="Próxima foto"
          onClick={(e) => {
            e.stopPropagation();
            next();
          }}
          className={`${sideArrowCls} right-1 sm:right-4`}
        >
          ›
        </button>
      </div>

      {item.caption && (
        <div className="px-4 py-2 text-center text-sm text-white/70">{item.caption}</div>
      )}

      <div className="flex items-center justify-between px-4 py-4">
        <button type="button" onClick={prev} className={bottomBtnCls}>
          ‹ Anterior
        </button>
        <button type="button" onClick={next} className={bottomBtnCls}>
          Próxima ›
        </button>
      </div>
    </div>
  );
}
