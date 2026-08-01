import { getSiteConfig } from "@/lib/content";

export default function SiteFooter() {
  const config = getSiteConfig();
  return (
    <footer className="bg-navy-900 text-white/85">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 sm:grid-cols-3">
        <div>
          <h3 className="text-base font-semibold text-white">{config.nome}</h3>
        </div>
        <div className="text-sm">
          <h3 className="mb-2 text-base font-semibold text-white">Endereço</h3>
          <p>{config.endereco}</p>
        </div>
        <div className="text-sm">
          <h3 className="mb-2 text-base font-semibold text-white">Contato</h3>
          {config.whatsapp && (
            <p>
              WhatsApp:{" "}
              <a
                href={config.whatsapp_url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-accent transition-colors hover:text-orange-400 hover:underline"
              >
                {config.whatsapp}
              </a>
            </p>
          )}
          {config.email && <p>E-mail: {config.email}</p>}
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/60">
        {config.nome} © {new Date().getFullYear()} - Todos os direitos
        reservados.
      </div>
    </footer>
  );
}
