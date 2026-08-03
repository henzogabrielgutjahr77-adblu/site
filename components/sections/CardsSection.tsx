import Markdown from "@/components/Markdown";
import type { CardContent, CardsProps } from "@/lib/sections";

function CardIcon({ name, className }: { name: string; className?: string }) {
  const cls = className ?? "h-5 w-5";
  switch (name) {
    case "target":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={cls}>
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      );
    case "eye":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={cls}>
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case "heart":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={cls}>
          <path d="M19.5 12.6 12 20l-7.5-7.4A5 5 0 1 1 12 6a5 5 0 1 1 7.5 6.6" />
        </svg>
      );
    case "check":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={cls}>
          <path d="M4 12.5 9.5 18 20 6" />
        </svg>
      );
    default:
      return null;
  }
}

export default function CardsSection({ props }: { props?: CardsProps }) {
  const cards = props?.cards ?? [];
  const titulo = props?.titulo;
  if (cards.length === 0) return null;
  return (
    <section
      className="bg-slate-50"
      style={{ paddingTop: "var(--v-sp-section)", paddingBottom: "var(--v-sp-section)" }}
    >
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        {titulo && (
          <h2 className="vi-heading vi-title-section text-navy-900">{titulo}</h2>
        )}
        <div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          style={{
            gap: "var(--v-sp-card)",
            marginTop: titulo ? "var(--v-sp-heading)" : undefined,
          }}
        >
          {cards.map((card: CardContent, i: number) => (
            <div
              key={i}
              className="border bg-white shadow-md"
              style={{
                borderRadius: "var(--v-radius-card)",
                borderColor: "var(--v-palette-border)",
                boxShadow: "var(--v-shadow)",
                padding: "calc(var(--v-sp-card) + 4px)",
              }}
            >
              {card.icone && card.icone !== "none" && (
                <div
                  className="flex h-11 w-11 items-center justify-center"
                  style={{
                    backgroundColor:
                      "color-mix(in srgb, var(--v-palette-action) 10%, transparent)",
                    color: "var(--v-palette-action)",
                    borderRadius: "var(--v-radius-general)",
                  }}
                >
                  <CardIcon name={card.icone} />
                </div>
              )}
              {card.titulo && (
                <h3 className="vi-heading mt-5 text-xl text-navy-900" style={{ marginTop: "var(--v-sp-heading)" }}>
                  {card.titulo}
                </h3>
              )}
              {Array.isArray(card.valores) && card.valores.length > 0 ? (
                <ul className="mt-4 space-y-3">
                  {card.valores.map((v, j) => (
                    <li key={j} className="flex items-center gap-2.5 text-sm text-slate-700">
                      <CardIcon name="check" className="h-4 w-4 shrink-0 text-(--color-accent)" />
                      <span>{v}</span>
                    </li>
                  ))}
                </ul>
              ) : card.texto ? (
                <div className="mt-3 text-sm text-slate-700">
                  <Markdown>{card.texto}</Markdown>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}