import Markdown from "@/components/Markdown";
import WhatsAppForm from "@/components/WhatsAppForm";
import { getPage, getSiteConfig } from "@/lib/content";
import type { ContatoProps } from "@/lib/sections";

export default function ContatoSection({
  slug,
  props,
}: {
  slug: string;
  props?: ContatoProps;
}) {
  const page = getPage(slug);
  const config = getSiteConfig();
  const titulo = props?.titulo ?? page?.title ?? "Contato";
  const texto = props?.texto ?? page?.body ?? "";
  return (
    <article className="mx-auto max-w-5xl px-4 py-14">
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <h1 className="mb-6 text-3xl font-bold text-navy-900">{titulo}</h1>
          {texto && <Markdown>{texto}</Markdown>}
          <div className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-5 text-sm">
            <p>
              <strong>Endereço:</strong> {config.endereco}
            </p>
            {config.whatsapp && (
              <p className="mt-2">
                <strong>WhatsApp do Pastor:</strong>{" "}
                <a
                  href={config.whatsapp_url}
                  className="text-accent hover:underline"
                >
                  {config.whatsapp}
                </a>
              </p>
            )}
            {config.email && (
              <p className="mt-2">
                <strong>E-mail:</strong> {config.email}
              </p>
            )}
          </div>
        </div>
        {props?.mostrar_form !== false && (
          <WhatsAppForm whatsappUrl={config.whatsapp_url} />
        )}
      </div>
    </article>
  );
}