import type { ImagemProps } from "@/lib/sections";

export default function ImagemSection({ props }: { props?: ImagemProps }) {
  if (!props?.src) return null;
  return (
    <section
      className="bg-white"
      style={{ paddingTop: "var(--v-sp-section)", paddingBottom: "var(--v-sp-section)" }}
    >
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <img
          src={props.src}
          alt={props.alt ?? ""}
          className="w-full rounded-(--v-radius-image) object-cover shadow-md"
        />
      </div>
    </section>
  );
}