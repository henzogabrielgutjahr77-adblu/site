import { getSiteConfig, getPages, getGallery } from "@/lib/content";
import { getSections } from "@/lib/sections";
import { getPageVisual } from "@/lib/page-visual";
import { logoutAction } from "./actions";
import AdminTabs from "./admin-tabs";

export default function Dashboard() {
  const config = getSiteConfig();
  const pages = getPages();
  const gallery = getGallery();
  const imagens = (gallery?.imagens ?? [])
    .map((item) => (item.alt ? `${item.image ?? ""}|${item.alt}` : item.image ?? ""))
    .join("\n");

  const fixedPages = new Set(["home", "quem-somos", "fale-conosco", "agenda", "galeria"]);
  const builderPages = [
    { slug: "home", title: "Início", sections: getSections("home"), visual: getPageVisual("home") },
    { slug: "quem-somos", title: "Quem Somos", sections: getSections("quem-somos"), visual: getPageVisual("quem-somos") },
    { slug: "agenda", title: "Agenda", sections: getSections("agenda"), visual: getPageVisual("agenda") },
    { slug: "galeria", title: "Galeria", sections: getSections("galeria"), visual: getPageVisual("galeria") },
    { slug: "fale-conosco", title: "Fale Conosco", sections: getSections("fale-conosco"), visual: getPageVisual("fale-conosco") },
    ...pages
      .filter((p) => !fixedPages.has(p.slug))
      .map((p) => ({ slug: p.slug, title: p.title, sections: getSections(p.slug), visual: getPageVisual(p.slug) })),
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Administração do site</h1>
          <p className="mt-1 text-sm text-slate-500">
            As alterações são salvas em Markdown/YAML e sincronizadas com o repositório.
          </p>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Sair
          </button>
        </form>
      </div>

      <AdminTabs
        config={config}
        pages={pages}
        gallery={gallery}
        imagens={imagens}
        builderPages={builderPages}
      />
    </div>
  );
}
