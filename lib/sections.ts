import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { CONTENT_DIR } from "@/lib/content";

export type {
  HeroProps,
  TextoProps,
  CardContent,
  CardsProps,
  CtaProps,
  ContatoProps,
  ImagemProps,
  HorariosProps,
  CalendarioProps,
  GaleriaProps,
  Section,
  SectionType,
} from "@/lib/section-types";
export { SECTION_LABELS, SECTION_TYPES } from "@/lib/section-types";
import type { Section, SectionType } from "@/lib/section-types";

const SECTIONS_FILE = path.join(CONTENT_DIR, "site", "sections.yml");

type SectionsMap = Record<string, Section[]>;

function readMap(): SectionsMap {
  if (!fs.existsSync(SECTIONS_FILE)) return {};
  try {
    const raw = yaml.load(fs.readFileSync(SECTIONS_FILE, "utf-8"));
    return raw && typeof raw === "object" ? (raw as SectionsMap) : {};
  } catch {
    return {};
  }
}

function writeMap(map: SectionsMap): void {
  fs.writeFileSync(
    SECTIONS_FILE,
    yaml.dump(map, { lineWidth: 120, noRefs: true }) + "\n",
  );
}

export function getSections(slug: string): Section[] {
  return readMap()[slug] ?? defaultSections(slug);
}

export function saveSections(slug: string, sections: Section[]): void {
  const map = readMap();
  map[slug] = sections;
  writeMap(map);
}

export function resetSections(slug: string): void {
  const map = readMap();
  delete map[slug];
  writeMap(map);
}

export function defaultSections(slug: string): Section[] {
  switch (slug) {
    case "home":
      return [
        { type: "hero", props: { home: true } },
        { type: "horarios" },
        {
          type: "cta",
          props: {
            titulo: "Precisa de oração ou quer receber uma visita?",
            texto:
              "Estamos aqui para você. Entre em contato e retornaremos em breve.",
          },
        },
      ];
    case "quem-somos":
      return [
        { type: "hero" },
        {
          type: "texto",
          props: {
            titulo: "Nossa História",
            corpo: [
              "A **Assembleia de Deus Blumenau Missões** é uma congregação da Assembleia de Deus, nascida com o coração voltado para a evangelização.",
              "",
              'Nosso lema é simples e forte: **"Evangelização, a chama não pode apagar!"**',
              "",
              "- **Evangelismo** — levar o amor de Deus às ruas, casas e corações;",
              "- **Discipulado** — ajudar cada pessoa a crescer na fé;",
              "- **Comunhão** — viver em família, com acolhimento e cuidado;",
              "- **Missões** — apoiar a obra missionária dentro e fora do país.",
            ].join("\n"),
          },
        },
        {
          type: "cards",
          props: {
            cards: [
              {
                titulo: "Nossa Missão",
                icone: "target",
                texto:
                  "Evangelizar, discipular e cuidar de pessoas, levando a esperança de Cristo às ruas, casas e corações — a chama não pode apagar!",
              },
              {
                titulo: "Nossa Visão",
                icone: "eye",
                texto:
                  "Ser uma congregação pequena e acolhedora, que reflete o amor de Deus e cresce em comunhão, alcançando a cidade de Blumenau.",
              },
              {
                titulo: "Nossos Valores",
                icone: "heart",
                valores: [
                  "Palavra de Deus",
                  "Oração",
                  "Comunhão",
                  "Evangelização",
                  "Serviço",
                ],
              },
            ],
          },
        },
        {
          type: "cta",
          props: {
            titulo: "Você e sua família são bem-vindos!",
            botao_texto: "Fale Conosco",
            botao_link: "/fale-conosco",
            botao2_ocultar: true,
          },
        },
      ];
    case "fale-conosco":
      return [{ type: "contato" }];
    case "agenda":
      return [{ type: "texto" }, { type: "calendario" }];
    case "galeria":
      return [{ type: "texto" }, { type: "galeria" }];
    default:
      return [
        { type: "hero" },
        { type: "texto", props: { titulo: "" } },
      ];
  }
}