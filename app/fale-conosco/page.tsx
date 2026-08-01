import type { Metadata } from "next";
import Markdown from "@/components/Markdown";
import WhatsAppForm from "@/components/WhatsAppForm";
import { getPage, getSiteConfig } from "@/lib/content";

export const revalidate = 60;

export const metadata: Metadata = { title: "Fale Conosco" };

export default function FaleConoscoPage() {
  const page = getPage("fale-conosco");
  const config = getSiteConfig();

  return (
    <article className="mx-auto max-w-5xl px-4 py-14">
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <h1 className="mb-6 text-3xl font-bold text-navy-900">
            {page?.title ?? "Fale Conosco"}
          </h1>
          {page && <Markdown>{page.body}</Markdown>}

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

        <WhatsAppForm whatsappUrl={config.whatsapp_url} />
      </div>
    </article>
  );
}
