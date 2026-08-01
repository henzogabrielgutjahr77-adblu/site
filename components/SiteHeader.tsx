import Link from "next/link";
import { getSiteConfig } from "@/lib/content";

const NAV = [
  { href: "/", label: "Início" },
  { href: "/quem-somos", label: "Quem Somos" },
  { href: "/ministerios", label: "Ministérios" },
  { href: "/agenda", label: "Agenda" },
  { href: "/artigos", label: "Artigos e Notícias" },
  { href: "/galeria", label: "Galeria" },
  { href: "/fale-conosco", label: "Fale Conosco" },
];

export default function SiteHeader() {
  const config = getSiteConfig();
  return (
    <header className="border-b border-white/10 bg-navy-900 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent font-bold text-white">
            A
          </span>
          <span className="text-sm font-semibold leading-tight">
            {config.nome}
          </span>
        </Link>
        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-white/80 transition-colors hover:text-accent"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
