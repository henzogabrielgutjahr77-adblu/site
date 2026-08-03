import { getSiteConfig } from "@/lib/content";

export default function HorariosSection() {
  const config = getSiteConfig();
  const horarios = config.horarios ?? [];
  if (horarios.length === 0) return null;
  return (
    <section
      id="horarios"
      className="bg-slate-50"
      style={{ paddingTop: "var(--v-sp-section)", paddingBottom: "var(--v-sp-section)" }}
    >
      <div
        className="mx-auto grid max-w-4xl px-6 sm:grid-cols-2"
        style={{ gap: "var(--v-sp-card)" }}
      >
        {horarios.map((h, i) => (
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
            <p className="text-sm font-semibold uppercase tracking-wide text-accent">
              {h.dia}
            </p>
            <h3 className="vi-heading mt-1.5 text-xl text-navy-900" style={{ marginTop: "var(--v-sp-heading)" }}>
              {h.horario}
            </h3>
            {h.descricao && (
              <p className="mt-2 text-sm text-slate-700">{h.descricao}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}