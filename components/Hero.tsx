import Link from "next/link";
import type { SiteConfig } from "@/lib/content";
import {
  ChevronDownIcon,
  FacebookIcon,
  InstagramIcon,
  MapPinIcon,
  YoutubeIcon,
} from "@/components/icons";

export default function Hero({ config }: { config: SiteConfig }) {
  const socials = [
    { href: config.facebook || "#", icon: FacebookIcon, label: "Facebook" },
    { href: config.instagram || "#", icon: InstagramIcon, label: "Instagram" },
    { href: config.youtube || "#", icon: YoutubeIcon, label: "YouTube" },
  ];

  return (
    <section
      className="relative overflow-hidden text-white"
      style={{
        backgroundImage: config.hero_imagem
          ? `url(${config.hero_imagem})`
          : "linear-gradient(160deg, #0d1b2a 0%, #1a3a5c 60%, #0d2d1e 100%)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {config.hero_imagem && (
        <div className="absolute inset-0 bg-black/60" aria-hidden="true" />
      )}

      <div className="relative mx-auto flex min-h-svh max-w-4xl flex-col items-center justify-center px-6 pb-[12vh] pt-0 text-center">
        <div className="mb-6 flex items-center gap-2 rounded-full border border-accent/40 bg-accent/15 px-5 py-2">
          <MapPinIcon className="h-4 w-4 text-[#f5a36c]" />
          <span className="text-xs font-medium uppercase tracking-[0.12em] text-[#f5a36c] sm:text-sm">
            {config.local}
          </span>
        </div>

        <h1 className="text-5xl font-bold leading-tight tracking-tight sm:text-7xl">
          {config.titulo_hero}
        </h1>

        <p className="mb-10 mt-5 text-xl italic text-white/75 sm:text-2xl">
          {config.slogan}
        </p>

        <div className="mb-9 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/fale-conosco"
            className="rounded-xl bg-gradient-to-b from-accent to-orange-600 px-9 py-4 text-base font-semibold text-white shadow-lg shadow-orange-500/25 transition-all hover:-translate-y-0.5 hover:from-orange-600 hover:to-orange-700 hover:shadow-xl hover:shadow-orange-500/30"
          >
            {config.cta}
          </Link>
          <Link
            href="/agenda"
            className="rounded-xl border-[1.5px] border-white/40 px-8 py-4 text-base font-medium text-white transition-colors hover:border-white/70 hover:bg-white/10"
          >
            Nossa Agenda
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {socials.map(({ href, icon: Icon, label }) => (
            <a
              key={label}
              href={href}
              aria-label={label}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white/75 transition-all hover:-translate-y-0.5 hover:bg-accent hover:text-white"
            >
              <Icon className="h-5 w-5" />
            </a>
          ))}
        </div>
      </div>

      <a
        href="#sobre"
        aria-label="Rolar para o conteúdo"
        className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/40 transition-colors hover:text-white/80"
      >
        <ChevronDownIcon className="h-6 w-6" />
      </a>
    </section>
  );
}
