import Link from "next/link";
import { getSiteConfig } from "@/lib/content";
import type { CtaProps } from "@/lib/sections";

export default function CtaSection({ props }: { props?: CtaProps }) {
  const config = getSiteConfig();
  const titulo = props?.titulo;
  const texto = props?.texto;
  const botaoTexto = props?.botao_texto || config.cta;
  const botaoLink = props?.botao_link || "/fale-conosco";
  const botao2Texto = props?.botao2_texto || (config.whatsapp ? `WhatsApp ${config.whatsapp}` : "");
  const botao2Link = props?.botao2_link || config.whatsapp_url;
  const showBotao2 = !props?.botao2_ocultar;

  if (!titulo && !texto) return null;

  return (
    <section
      className="bg-navy-700 text-white"
      style={{ paddingTop: "var(--v-sp-section)", paddingBottom: "var(--v-sp-section)" }}
    >
      <div className="mx-auto max-w-3xl px-6 text-center">
        {titulo && <h2 className="vi-heading vi-title-section">{titulo}</h2>}
        {texto && <p className="mt-3 text-white/90">{texto}</p>}
        <div className="mt-7 flex flex-wrap justify-center gap-4">
          <Link
            href={botaoLink}
            className="vi-button rounded-(--v-radius-button) bg-(--color-action) px-7 py-3.5 text-white shadow-lg shadow-black/20 transition-all hover:-translate-y-0.5 hover:brightness-90"
          >
            {botaoTexto}
          </Link>
          {showBotao2 && botao2Texto && botao2Link && (
            <a
              href={botao2Link}
              target="_blank"
              rel="noopener noreferrer"
              className="vi-button rounded-(--v-radius-button) border border-white/40 px-7 py-3.5 transition-colors hover:border-white/70 hover:bg-white/10"
            >
              {botao2Texto}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}