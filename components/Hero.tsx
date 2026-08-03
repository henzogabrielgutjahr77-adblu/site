import type { CSSProperties } from "react";
import Link from "next/link";
import { getSiteConfig, getVisualConfig } from "@/lib/content";
import HeroVisual from "@/components/visual/HeroVisual";
import { ChevronDownIcon, CompassIcon, InstagramIcon } from "@/components/icons";

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

const BTN_PRIMARY =
  "vi-button flex w-full items-center justify-center rounded-(--v-radius-button) bg-(--color-action) px-8 py-[15px] text-white transition-all hover:-translate-y-px hover:brightness-90 sm:w-auto";
const BTN_SECONDARY =
  "vi-button flex w-full items-center justify-center rounded-(--v-radius-button) border-[1.5px] border-white/20 bg-white/[0.07] px-8 py-[15px] text-white transition-all hover:-translate-y-px hover:border-white/40 hover:bg-white/[0.13] sm:w-auto";

function delay(ms: number): CSSProperties {
  return { animationDelay: `${ms}ms` };
}

export default function Hero() {
  const config = getSiteConfig();
  const visual = getVisualConfig();
  const hero = visual.homeHero;

  return (
    <HeroVisual
      variant="home"
      hero={hero}
      bottom={
        <a
          href="#horarios"
          aria-label="Rolar para o conteúdo"
          className="absolute bottom-6 left-1/2 z-20 opacity-30 transition-opacity hover:opacity-70"
          style={{ animation: "hero-bounce 2s infinite" }}
        >
          <ChevronDownIcon className="h-5 w-5 text-white" />
        </a>
      }
    >
      <div
        className="vi-hero-anim inline-flex items-center gap-2 rounded-full border border-white/10 bg-[rgba(20,24,35,0.75)] px-5 py-[7px] backdrop-blur"
        style={delay(0)}
      >
        <CompassIcon className="h-[13px] w-[13px] text-white/60" />
        <span className="text-[11.5px] font-medium uppercase tracking-[0.14em] text-white/70">
          {config.local}
        </span>
      </div>

      <h1 className="vi-heading vi-title-display vi-hero-anim text-white" style={delay(80)}>
        {splitTitle(config.titulo_hero)}
      </h1>

      <p className="vi-subtitle vi-hero-anim italic text-white/50" style={delay(160)}>
        {config.slogan}
      </p>

      <div className="vi-hero-anim flex w-full flex-wrap items-center justify-center gap-3.5" style={delay(240)}>
        <Link href="/fale-conosco" className={BTN_PRIMARY} style={{ boxShadow: "var(--v-shadow)" }}>
          {config.cta}
        </Link>
        <Link href="/agenda" className={BTN_SECONDARY}>
          Nossa Agenda
        </Link>
      </div>

      {config.instagram && (
        <a
          href={config.instagram}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          className="vi-hero-anim mt-2 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white/75 transition-all hover:-translate-y-0.5 hover:bg-(--color-action) hover:text-white"
          style={delay(320)}
        >
          <InstagramIcon className="h-5 w-5" />
        </a>
      )}
    </HeroVisual>
  );
}
