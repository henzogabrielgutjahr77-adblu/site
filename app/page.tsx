import Link from "next/link";
import Hero from "@/components/Hero";
import Markdown from "@/components/Markdown";
import { getPage, getSiteConfig } from "@/lib/content";

export const revalidate = 60;

export default function Home() {
  const config = getSiteConfig();
  const home = getPage("home");

  return (
    <>
      {/* Hero */}
      <Hero config={config} />

      {/* Boas-vindas */}
      {home && (
        <section id="sobre" className="mx-auto max-w-3xl px-6 py-20">
          <Markdown>{home.body}</Markdown>
        </section>
      )}

      {/* Horários */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto grid max-w-4xl gap-6 px-6 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-7 shadow-md">
            <p className="text-sm font-semibold uppercase tracking-wide text-accent">
              Domingo
            </p>
            <h3 className="mt-1.5 text-xl font-semibold text-navy-900">
              {config.horario_domingo}
            </h3>
            <p className="mt-2 text-sm text-slate-700">
              Culto ao Senhor, com louvor e ministração da Palavra.
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-7 shadow-md">
            <p className="text-sm font-semibold uppercase tracking-wide text-accent">
              Quinta-feira
            </p>
            <h3 className="mt-1.5 text-xl font-semibold text-navy-900">
              {config.horario_quinta}
            </h3>
            <p className="mt-2 text-sm text-slate-700">
              Culto de ensino e oração, aberto a todos.
            </p>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-navy-700 py-20 text-white">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-2xl font-semibold">
            Precisa de oração ou quer receber uma visita?
          </h2>
          <p className="mt-3 text-white/90">
            Estamos aqui para você. Entre em contato e retornaremos em breve.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-4">
            <Link
              href="/fale-conosco"
              className="rounded-lg bg-gradient-to-b from-accent to-orange-600 px-7 py-3.5 font-semibold text-white shadow-lg shadow-black/20 transition-all hover:-translate-y-0.5 hover:from-orange-600 hover:to-orange-700"
            >
              {config.cta}
            </Link>
            {config.whatsapp_url && (
              <a
                href={config.whatsapp_url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-white/40 px-7 py-3.5 font-semibold transition-colors hover:border-white/70 hover:bg-white/10"
              >
                WhatsApp {config.whatsapp}
              </a>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
