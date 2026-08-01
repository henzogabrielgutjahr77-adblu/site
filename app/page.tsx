import Link from "next/link";
import Hero from "@/components/Hero";
import Markdown from "@/components/Markdown";
import { formatDate, getPage, getPosts, getSiteConfig } from "@/lib/content";

export const revalidate = 60;

export default function Home() {
  const config = getSiteConfig();
  const home = getPage("home");
  const posts = getPosts().slice(0, 3);

  return (
    <>
      {/* Hero */}
      <Hero config={config} />

      {/* Boas-vindas */}
      {home && (
        <section id="sobre" className="mx-auto max-w-3xl px-4 py-16">
          <Markdown>{home.body}</Markdown>
        </section>
      )}

      {/* Horários */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto grid max-w-4xl gap-6 px-4 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-accent">
              Domingo
            </p>
            <h3 className="mt-1 text-xl font-semibold text-navy-900">
              {config.horario_domingo}
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Culto ao Senhor, com louvor e ministração da Palavra.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-accent">
              Quinta-feira
            </p>
            <h3 className="mt-1 text-xl font-semibold text-navy-900">
              {config.horario_quinta}
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Culto de ensino e oração, aberto a todos.
            </p>
          </div>
        </div>
      </section>

      {/* Últimos artigos */}
      <section className="mx-auto max-w-4xl px-4 py-16">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-navy-900">
            Artigos e Notícias
          </h2>
          <Link
            href="/artigos"
            className="text-sm font-medium text-accent hover:underline"
          >
            Ver todos
          </Link>
        </div>
        {posts.length === 0 ? (
          <p className="text-slate-500">Nenhum artigo publicado ainda.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/artigos/${post.slug}`}
                className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <p className="text-xs text-slate-400">{formatDate(post.date)}</p>
                <h3 className="mt-2 font-semibold text-navy-900 group-hover:text-accent">
                  {post.title}
                </h3>
                {post.description && (
                  <p className="mt-2 line-clamp-3 text-sm text-slate-600">
                    {post.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* CTA final */}
      <section className="bg-navy-700 py-16 text-white">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-2xl font-semibold">
            Precisa de oração ou quer receber uma visita?
          </h2>
          <p className="mt-3 text-white/85">
            Estamos aqui para você. Entre em contato e retornaremos em breve.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link
              href="/fale-conosco"
              className="rounded bg-accent px-6 py-3 font-semibold text-white transition-colors hover:bg-orange-600"
            >
              {config.cta}
            </Link>
            {config.whatsapp_url && (
              <a
                href={config.whatsapp_url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded border border-white/40 px-6 py-3 font-semibold transition-colors hover:bg-white/10"
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
