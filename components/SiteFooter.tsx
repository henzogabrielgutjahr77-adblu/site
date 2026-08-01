import Link from "next/link";
import { getSiteConfig } from "@/lib/content";

export default function SiteFooter() {
  const config = getSiteConfig();
  return (
    <footer className="bg-navy-900 text-white/80">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <h3 className="mb-2 font-semibold text-white">{config.nome}</h3>
          <p className="text-sm">{config.slogan}</p>
        </div>
        <div className="text-sm">
          <h3 className="mb-2 font-semibold text-white">Onde estamos</h3>
          <p>{config.endereco}</p>
          <p className="mt-2">
            {config.horario_domingo} · {config.horario_quinta}
          </p>
        </div>
        <div className="text-sm">
          <h3 className="mb-2 font-semibold text-white">Contato</h3>
          {config.whatsapp && (
            <p>
              WhatsApp:{" "}
              <a
                href={config.whatsapp_url}
                className="text-accent hover:underline"
              >
                {config.whatsapp}
              </a>
            </p>
          )}
          {config.email && <p>E-mail: {config.email}</p>}
          <Link
            href="/fale-conosco"
            className="mt-3 inline-block rounded bg-accent px-4 py-2 font-medium text-white transition-colors hover:bg-orange-600"
          >
            {config.cta}
          </Link>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        {config.nome} © {new Date().getFullYear()} · Feito com Next.js
      </div>
    </footer>
  );
}
