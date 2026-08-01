import Link from "next/link";
import { getSiteConfig } from "@/lib/content";

const NAV = [
  { href: "/quem-somos", label: "Quem Somos" },
  { href: "/ministerios", label: "Ministérios" },
  { href: "/agenda", label: "Agenda" },
  { href: "/galeria", label: "Galeria" },
  { href: "/fale-conosco", label: "Fale Conosco" },
];

export default function SiteHeader() {
  const config = getSiteConfig();
  return (
    <header className="border-b border-white/10 bg-navy-900 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <img
            src="/logo.png"
            alt={config.nome_curto}
            className="h-10 w-10 rounded-full object-cover"
          />
          <span className="text-base font-semibold leading-tight">
            {config.nome_curto}
          </span>
        </Link>
        <nav className="flex flex-wrap items-center gap-x-7 gap-y-2 text-sm">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-white/85 transition-colors hover:text-accent"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
