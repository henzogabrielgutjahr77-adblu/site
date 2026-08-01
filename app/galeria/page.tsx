import type { Metadata } from "next";
import Image from "next/image";
import Markdown from "@/components/Markdown";
import { getGallery, getPage } from "@/lib/content";

export const revalidate = 60;

export const metadata: Metadata = { title: "Galeria" };

export default function GaleriaPage() {
  const intro = getPage("galeria");
  const gallery = getGallery();
  const imagens = gallery?.imagens ?? [];

  return (
    <article className="mx-auto max-w-5xl px-4 py-14">
      {intro && (
        <div className="mb-8">
          <h1 className="mb-4 text-3xl font-bold text-navy-900">
            {intro.title}
          </h1>
          <Markdown>{intro.body}</Markdown>
        </div>
      )}

      {imagens.length === 0 ? (
        <p className="text-slate-500">As fotos serão adicionadas em breve.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {imagens.map((item, i) =>
            item.image ? (
              <figure
                key={i}
                className="overflow-hidden rounded-lg border border-slate-200"
              >
                <Image
                  src={item.image}
                  alt={item.alt ?? "Foto da galeria"}
                  width={800}
                  height={600}
                  className="h-56 w-full object-cover"
                />
                {item.alt && (
                  <figcaption className="px-3 py-2 text-sm text-slate-600">
                    {item.alt}
                  </figcaption>
                )}
              </figure>
            ) : null,
          )}
        </div>
      )}
    </article>
  );
}
