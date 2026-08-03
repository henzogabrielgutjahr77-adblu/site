import Markdown from "@/components/Markdown";
import { getPage } from "@/lib/content";
import type { TextoProps } from "@/lib/sections";

export default function TextoSection({
  slug,
  props,
}: {
  slug: string;
  props?: TextoProps;
}) {
  const page = getPage(slug);
  const titulo = props?.titulo ?? page?.title ?? "";
  const corpo = (props?.corpo ?? "").trim() || page?.body?.trim() || "";
  if (!corpo) return null;
  return (
    <section
      className="bg-white"
      style={{ paddingTop: "var(--v-sp-section)", paddingBottom: "var(--v-sp-section)" }}
    >
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        {titulo && (
          <h2 className="vi-heading vi-title-section text-navy-900">{titulo}</h2>
        )}
        <div
          className="mt-6 leading-relaxed text-slate-700"
          style={{ marginTop: "var(--v-sp-heading)" }}
        >
          <Markdown>{corpo}</Markdown>
        </div>
      </div>
    </section>
  );
}