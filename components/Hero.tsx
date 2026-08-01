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

      <div className="relative mx-auto flex min-h-[340px] max-w-4xl flex-col items-center justify-center px-4 py-16 text-center">
        <div className="mb-5 flex items-center gap-2 rounded-full border border-accent/40 bg-accent/15 px-4 py-1.5">
          <MapPinIcon className="h-3.5 w-3.5 text-[#f5a36c]" />
          <span className="text-xs font-medium uppercase tracking-[0.12em] text-[#f5a36c]">
            {config.local}
          </span>
        </div>

        <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          {config.titulo_hero}
        </h1>

        <p className="mb-8 mt-3 text-lg italic text-white/65">
          {config.slogan}
        </p>

        <div className="mb-7 flex flex-wrap justify-center gap-3">
          <Link
            href="/fale-conosco"
            className="rounded-lg bg-accent px-7 py-3.5 font-medium text-white transition-colors hover:bg-orange-600"
          >
            {config.cta}
          </Link>
          <Link
            href="/agenda"
            className="rounded-lg border-[1.5px] border-white/35 px-7 py-3.5 font-medium text-white transition-colors hover:bg-white/10"
          >
            Nossa Agenda
          </Link>
        </div>

        <div className="flex gap-5">
          {socials.map(({ href, icon: Icon, label }) => (
            <a
              key={label}
              href={href}
              aria-label={label}
              className="text-white/45 transition-colors hover:text-white"
            >
              <Icon className="h-5 w-5" />
            </a>
          ))}
        </div>
      </div>

      <a
        href="#sobre"
        aria-label="Rolar para o conteúdo"
        className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/30 transition-colors hover:text-white/60"
      >
        <ChevronDownIcon className="h-5 w-5" />
      </a>
    </section>
  );
}
