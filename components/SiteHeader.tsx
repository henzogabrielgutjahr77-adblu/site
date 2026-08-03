import Link from "next/link";
import { getSiteConfig, getPages } from "@/lib/content";
import MobileMenu from "@/components/MobileMenu";

export default function SiteHeader() {
  const config = getSiteConfig();
  const nav = getPages()
    .map((page) => ({ href: `/${page.slug}`, label: page.title }))
    .filter((item) => item.label);
  return (
    <header className="sticky top-0 z-[100] flex h-[60px] items-center justify-between border-b border-white/[0.06] bg-[#08111f] px-5 text-white sm:px-12">
      <Link href="/" className="flex items-center gap-2.5">
        <img
          src={config.logo || "/logo.png"}
          alt={config.nome_curto}
          className="h-10 w-auto rounded object-contain"
        />
        <span className="text-[18px] font-bold tracking-[-0.3px]">
          {config.nome_curto}
        </span>
      </Link>
      <nav className="hidden md:flex">
        <ul className="flex list-none items-center gap-[1.2rem] sm:gap-[2.2rem]">
          {nav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="text-[13px] font-medium text-white/65 transition-colors hover:text-white sm:text-[14px]"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <MobileMenu items={nav} />
    </header>
  );
}
