import type { Section } from "@/lib/sections";
import { getSections } from "@/lib/sections";
import HeroSection from "./HeroSection";
import TextoSection from "./TextoSection";
import CardsSection from "./CardsSection";
import HorariosSection from "./HorariosSection";
import CtaSection from "./CtaSection";
import ContatoSection from "./ContatoSection";
import ImagemSection from "./ImagemSection";
import CalendarioSection, { type AgendaSectionData } from "./CalendarioSection";
import PageVisualCss from "@/components/PageVisualCss";
import GaleriaSection, { type GallerySectionData } from "./GaleriaSection";

export default function Sections({
  slug,
  agenda,
  galeria,
}: {
  slug: string;
  agenda?: AgendaSectionData;
  galeria?: GallerySectionData;
}) {
  const sections = getSections(slug);
  return (
    <>
      <PageVisualCss slug={slug} />
      {sections.map((section, i) => (
        <SectionView
          key={`${slug}-${i}`}
          slug={slug}
          section={section}
          agenda={agenda}
          galeria={galeria}
        />
      ))}
    </>
  );
}

function SectionView({
  slug,
  section,
  agenda,
  galeria,
}: {
  slug: string;
  section: Section;
  agenda?: AgendaSectionData;
  galeria?: GallerySectionData;
}) {
  switch (section.type) {
    case "hero":
      return <HeroSection slug={slug} props={section.props} />;
    case "texto":
      return <TextoSection slug={slug} props={section.props} />;
    case "cards":
      return <CardsSection props={section.props} />;
    case "horarios":
      return <HorariosSection />;
    case "cta":
      return <CtaSection props={section.props} />;
    case "contato":
      return <ContatoSection slug={slug} props={section.props} />;
    case "imagem":
      return <ImagemSection props={section.props} />;
    case "calendario":
      return <CalendarioSection data={agenda} />;
    case "galeria":
      return <GaleriaSection data={galeria} />;
    default:
      return null;
  }
}
