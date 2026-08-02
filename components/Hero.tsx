import Link from "next/link";
import type { SiteConfig } from "@/lib/content";
import { ChevronDownIcon, CompassIcon, InstagramIcon } from "@/components/icons";

const HERO_BG = [
  "radial-gradient(ellipse 60% 60% at 75% 45%, rgba(18,80,150,0.55) 0%, transparent 70%)",
  "radial-gradient(ellipse 50% 50% at 25% 70%, rgba(8,55,80,0.45) 0%, transparent 65%)",
  "radial-gradient(ellipse 40% 40% at 50% 20%, rgba(10,50,100,0.3) 0%, transparent 60%)",
  "linear-gradient(160deg, #08111f 0%, #0e2540 45%, #0b1e34 100%)",
].join(", ");

function splitTitle(title: string) {
  const parts = title.trim().split(" ");
  if (parts.length < 2) return title;
  const last = parts.pop();
  return (
    <>
      {parts.join(" ")} <br /> {last}
    </>
  );
}

export default function Hero({ config }: { config: SiteConfig }) {
  return (
    <section
      className="relative flex min-h-[calc(100svh-60px)] flex-col items-center justify-center overflow-hidden px-8 pb-16 pt-20 text-center text-white"
      style={{ background: HERO_BG }}
    >
      {config.hero_imagem && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: `url(${config.hero_imagem})` }}
        />
      )}

      <div className="relative z-10 flex w-full flex-col items-center justify-center">
        <div className="mb-[1.6rem] inline-flex items-center gap-2 rounded-[100px] border border-white/10 bg-[rgba(20,24,35,0.75)] px-5 py-[7px] backdrop-blur">
          <CompassIcon className="h-[13px] w-[13px] text-white/60" />
          <span className="text-[11.5px] font-medium uppercase tracking-[0.14em] text-white/70">
            {config.local}
          </span>
        </div>

        <h1 className="text-[clamp(46px,7.5vw,80px)] font-extrabold leading-[1.07] tracking-[-1.5px] text-white">
          {splitTitle(config.titulo_hero)}
        </h1>

        <p className="mb-11 mt-0 text-[clamp(16px,2vw,19px)] italic text-white/50">
          {config.slogan}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3.5">
          <Link
            href="/fale-conosco"
            className="rounded-lg bg-[#e85d04] px-8 py-[15px] text-[15.5px] font-semibold text-white shadow-[0_4px_20px_rgba(232,93,4,0.35)] transition-all hover:-translate-y-px hover:bg-[#d05203] hover:shadow-[0_6px_28px_rgba(232,93,4,0.45)]"
          >
            {config.cta}
          </Link>
          <Link
            href="/agenda"
            className="rounded-lg border-[1.5px] border-white/20 bg-white/[0.07] px-8 py-[15px] text-[15.5px] font-semibold text-white transition-all hover:-translate-y-px hover:border-white/40 hover:bg-white/[0.13]"
          >
            Nossa Agenda
          </Link>
        </div>

        {config.instagram && (
          <a
            href={config.instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="mt-6 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white/75 transition-all hover:-translate-y-0.5 hover:bg-[#e85d04] hover:text-white"
          >
            <InstagramIcon className="h-5 w-5" />
          </a>
        )}
      </div>

      <a
        href="#horarios"
        aria-label="Rolar para o conteúdo"
        className="absolute bottom-7 left-1/2 opacity-30 transition-opacity hover:opacity-70"
        style={{ animation: "hero-bounce 2s infinite" }}
      >
        <ChevronDownIcon className="h-5 w-5 text-white" />
      </a>

      <style>{`@keyframes hero-bounce { 0%,100% { transform: translateX(-50%) translateY(0); } 50% { transform: translateX(-50%) translateY(5px); } }`}</style>
    </section>
  );
}
