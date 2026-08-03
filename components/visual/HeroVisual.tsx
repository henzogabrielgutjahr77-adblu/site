import type { ReactNode } from "react";
import type { HeroConfig } from "@/lib/visual";
import FloatingImages from "@/components/visual/FloatingImages";

interface HeroVisualProps {
  variant: "inner" | "home";
  hero: HeroConfig;
  children?: ReactNode;
  /** Elemento fixo na base da hero (ex.: seta de rolagem). */
  bottom?: ReactNode;
  /** Foto de fundo vinda do conteúdo (usada se o CMS visual não definir). */
  photoImage?: string;
}

export default function HeroVisual({ variant, hero, children, bottom, photoImage }: HeroVisualProps) {
  const scope = variant === "home" ? "vi-home" : "vi-inner";
  const bg = hero.photo?.desktop?.image || photoImage || "";
  return (
    <section className={`vi-hero vi-anim ${scope} text-white`} data-hero={variant}>
      {bg ? (
        <div className="vi-photo" style={{ backgroundImage: `url(${bg})` }} aria-hidden />
      ) : (
        <div className="vi-photo" aria-hidden />
      )}
      <div className="vi-gradient" aria-hidden />
      <div className="vi-overlay" aria-hidden />
      <FloatingImages variant={variant} images={hero.floatingImages} />
      <div className="vi-fade" aria-hidden />
      <div className="vi-body">
        <div className="vi-col">{children}</div>
      </div>
      {bottom}
    </section>
  );
}
