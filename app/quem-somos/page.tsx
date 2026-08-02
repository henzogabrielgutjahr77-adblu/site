import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Markdown from "@/components/Markdown";
import { getSiteConfig, imageExists } from "@/lib/content";

export const revalidate = 60;

export const metadata: Metadata = { title: "Quem Somos" };

function TargetIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function EyeIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function HeartIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M19.5 12.6 12 20l-7.5-7.4A5 5 0 1 1 12 6a5 5 0 1 1 7.5 6.6" />
    </svg>
  );
}

function CheckIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d="M4 12.5 9.5 18 20 6" />
    </svg>
  );
}

const PRIMARY_BTN =
  "flex w-full items-center justify-center rounded-lg bg-[#e85d04] px-8 py-[15px] text-[15.5px] font-semibold text-white shadow-[0_4px_20px_rgba(232,93,4,0.35)] transition-all hover:-translate-y-px hover:bg-[#d05203] hover:shadow-[0_6px_28px_rgba(232,93,4,0.45)] sm:w-auto";
const SECONDARY_BTN =
  "flex w-full items-center justify-center rounded-lg border-[1.5px] border-white/20 bg-white/[0.07] px-8 py-[15px] text-[15.5px] font-semibold text-white transition-all hover:-translate-y-px hover:border-white/40 hover:bg-white/[0.13] sm:w-auto";

export default function QuemSomosPage() {
  const config = getSiteConfig();
  const q = config.quem_somos ?? {};

  const imagem = q.imagem && imageExists(q.imagem) ? q.imagem : "";
  const imagemExterna = imagem && /^https?:\/\//i.test(imagem);
  const primaryLink = q.botao_principal_link || "/fale-conosco";
  const secondaryLink = q.botao_secundario_link || "/agenda";
  const valores = Array.isArray(q.valores) ? q.valores : [];

  return (
    <>
      <section className="relative flex min-h-[55vh] items-center justify-center overflow-hidden bg-[#0e1a26] text-center text-white sm:min-h-[65vh]">
        {imagem &&
          (imagemExterna ? (
            <div
              aria-hidden
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${imagem})` }}
            />
          ) : (
            <Image
              src={imagem}
              alt={q.titulo ?? "Quem Somos"}
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
          ))}
        <div className="absolute inset-0 bg-gradient-to-b from-[#08111f]/90 via-[#0e1a26]/90 to-[#122536]/90" />
        <div className="relative z-10 mx-auto w-full max-w-3xl px-5 py-24 sm:px-8">
          <h1 className="text-4xl font-extrabold leading-tight tracking-[-1px] text-white sm:text-5xl">
            {q.titulo ?? "Quem Somos"}
          </h1>
          {q.subtitulo && (
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-white/75">
              {q.subtitulo}
            </p>
          )}
          {(q.botao_principal_texto || q.botao_secundario_texto) && (
            <div className="mt-9 flex w-full flex-wrap items-center justify-center gap-3.5">
              {q.botao_principal_texto && (
                <Link href={primaryLink} className={PRIMARY_BTN}>
                  {q.botao_principal_texto}
                </Link>
              )}
              {q.botao_secundario_texto && (
                <Link href={secondaryLink} className={SECONDARY_BTN}>
                  {q.botao_secundario_texto}
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      {q.historia_texto && (
        <section className="bg-white py-20">
          <div className="mx-auto max-w-3xl px-5 sm:px-8">
            {q.historia_titulo && (
              <h2 className="text-3xl font-bold tracking-tight text-navy-900">
                {q.historia_titulo}
              </h2>
            )}
            <div className="mt-6 leading-relaxed text-slate-700">
              <Markdown>{q.historia_texto}</Markdown>
            </div>
          </div>
        </section>
      )}

      {(q.missao_texto || q.visao_texto || valores.length > 0) && (
        <section className="bg-slate-50 py-20">
          <div className="mx-auto grid max-w-5xl gap-6 px-5 sm:grid-cols-2 sm:px-8 lg:grid-cols-3">
            {q.missao_texto && (
              <div className="rounded-xl border border-slate-200 bg-white p-7 shadow-md">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e85d04]/10 text-[#e85d04]">
                  <TargetIcon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-navy-900">
                  {q.missao_titulo ?? "Nossa Missão"}
                </h3>
                <div className="mt-3 text-sm text-slate-700">
                  <Markdown>{q.missao_texto}</Markdown>
                </div>
              </div>
            )}
            {q.visao_texto && (
              <div className="rounded-xl border border-slate-200 bg-white p-7 shadow-md">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e85d04]/10 text-[#e85d04]">
                  <EyeIcon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-navy-900">
                  {q.visao_titulo ?? "Nossa Visão"}
                </h3>
                <div className="mt-3 text-sm text-slate-700">
                  <Markdown>{q.visao_texto}</Markdown>
                </div>
              </div>
            )}
            {valores.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-7 shadow-md">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e85d04]/10 text-[#e85d04]">
                  <HeartIcon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-navy-900">
                  {q.valores_titulo ?? "Nossos Valores"}
                </h3>
                <ul className="mt-4 space-y-3">
                  {valores.map((v, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-sm text-slate-700">
                      <CheckIcon className="h-4 w-4 shrink-0 text-[#e85d04]" />
                      <span>{v}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {q.destaque_final && (
        <section className="bg-navy-700 py-20 text-white">
          <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
            <p className="text-2xl font-semibold leading-snug sm:text-3xl">
              {q.destaque_final}
            </p>
            {q.botao_principal_texto && (
              <div className="mt-8 flex w-full flex-wrap justify-center gap-3.5">
                <Link
                  href={primaryLink}
                  className="flex w-full items-center justify-center rounded-lg bg-gradient-to-b from-accent to-orange-600 px-7 py-3.5 font-semibold text-white shadow-lg shadow-black/20 transition-all hover:-translate-y-0.5 hover:from-orange-600 hover:to-orange-700 sm:w-auto"
                >
                  {q.botao_principal_texto}
                </Link>
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
}
