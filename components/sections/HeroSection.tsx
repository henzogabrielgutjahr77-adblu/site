import type { CSSProperties } from "react";
import Link from "next/link";
import {
  getPage,
  getSiteConfig,
  imageExists,
  type SiteConfig,
} from "@/lib/content";
import { getPageVisual } from "@/lib/page-visual";
import type { VisualConfig } from "@/lib/visual";
import type { HeroProps } from "@/lib/sections";
import HeroVisual from "@/components/visual/HeroVisual";
import { ChevronDownIcon, CompassIcon, InstagramIcon } from "@/components/icons";

function delay(ms: number): CSSProperties {
  return { animationDelay: `${ms}ms` };
}

const BTN_PRIMARY =
  "vi-button flex w-full items-center justify-center rounded-(--v-radius-button) bg-(--color-action) px-8 py-[15px] text-white transition-all hover:-translate-y-px hover:brightness-90 sm:w-auto";
const BTN_SECONDARY =
  "vi-button flex w-full items-center justify-center rounded-(--v-radius-button) border-[1.5px] border-white/20 bg-white/[0.07] px-8 py-[15px] text-white transition-all hover:-translate-y-px hover:border-white/40 hover:bg-white/[0.13] sm:w-auto";
const PRIMARY_BTN =
  "vi-button flex w-full items-center justify-center rounded-(--v-radius-button) bg-(--color-action) px-6 py-3 text-white shadow-[var(--v-shadow)] transition-all hover:-translate-y-px hover:brightness-90 sm:px-8 sm:py-[15px] sm:w-auto";
const SECONDARY_BTN =
  "vi-button flex w-full items-center justify-center rounded-(--v-radius-button) border-[1.5px] border-white/20 bg-white/[0.07] px-6 py-3 text-white transition-all sm:px-8 sm:py-[15px] hover:-translate-y-px hover:border-white/40 hover:bg-white/[0.13] sm:w-auto";

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

export default function HeroSection({
  slug,
  props,
}: {
  slug: string;
  props?: HeroProps;
}) {
  const config = getSiteConfig();
  const visual = getPageVisual(slug);
  if (props?.home) return <HomeHero config={config} visual={visual} />;
  return <InnerHero slug={slug} config={config} visual={visual} props={props} />;
}

function HomeHero({ config, visual }: { config: SiteConfig; visual: VisualConfig }) {
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

function InnerHero({
  slug,
  config,
  visual,
  props,
}: {
  slug: string;
  config: SiteConfig;
  visual: VisualConfig;
  props?: HeroProps;
}) {
  const q = config.quem_somos ?? {};
  const hero = visual.hero;
  const pageTitle = getPage(slug)?.title;
  const isQuemSomos = slug === "quem-somos";

  const heroTitulo =
    props?.titulo ??
    (isQuemSomos ? config.quem_somos_titulo ?? q.titulo : undefined) ??
    pageTitle ??
    "Página";
  const heroSubtitulo =
    props?.subtitulo ??
    (isQuemSomos ? config.quem_somos_subtitulo ?? q.subtitulo : undefined);
  const botao1Text =
    props?.botao1_texto ??
    (isQuemSomos ? config.quem_somos_botao_primario_texto ?? q.botao_principal_texto : undefined);
  const botao1Link =
    props?.botao1_link ??
    (isQuemSomos ? config.quem_somos_botao_primario_link ?? q.botao_principal_link : undefined) ??
    "/fale-conosco";
  const botao2Text =
    props?.botao2_texto ??
    (isQuemSomos ? config.quem_somos_botao_secundario_texto ?? q.botao_secundario_texto : undefined);
  const botao2Link =
    props?.botao2_link ??
    (isQuemSomos ? config.quem_somos_botao_secundario_link ?? q.botao_secundario_link : undefined) ??
    "/agenda";
  const imagemSrc =
    props?.imagem ?? (isQuemSomos ? config.quem_somos_hero_imagem ?? q.imagem : undefined);
  const imagem = imagemSrc && imageExists(imagemSrc) ? imagemSrc : "";

  return (
    <HeroVisual variant="inner" hero={hero} photoImage={imagem}>
      <div className="relative flex w-full flex-col pl-5 sm:pl-6" style={{ gap: "var(--hero-gap)" }}>
        <span
          aria-hidden
          className="vi-hero-anim absolute left-0 top-3 h-16 w-[3px] rounded-full sm:h-20"
          style={{
            ...delay(0),
            background:
              "linear-gradient(to bottom, var(--v-palette-accent), color-mix(in srgb, var(--v-palette-accent) 10%, transparent))",
          }}
        />
        <nav
          aria-label="Trilha de navegação"
          className="vi-hero-anim flex items-center gap-2.5 text-[13px] sm:text-sm"
          style={delay(0)}
        >
          <Link href="/" className="text-white/60 transition-colors hover:text-white">
            Início
          </Link>
          <span aria-hidden className="text-white/30">
            /
          </span>
          <span className="font-medium text-white/95">{heroTitulo}</span>
        </nav>

        <h1 className="vi-heading vi-title-display vi-hero-anim text-white" style={delay(80)}>
          {heroTitulo}
        </h1>

        {heroSubtitulo && (
          <p className="vi-subtitle vi-hero-anim max-w-[620px] text-white/80" style={delay(160)}>
            {heroSubtitulo}
          </p>
        )}

        {(botao1Text || botao2Text) && (
          <div
            className="vi-hero-anim flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row sm:items-center"
            style={delay(240)}
          >
            {botao1Text && (
              <Link href={botao1Link} className={PRIMARY_BTN}>
                {botao1Text}
              </Link>
            )}
            {botao2Text && (
              <Link href={botao2Link} className={SECONDARY_BTN}>
                {botao2Text}
              </Link>
            )}
          </div>
        )}
      </div>
    </HeroVisual>
  );
}