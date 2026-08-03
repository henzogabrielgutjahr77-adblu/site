export interface HeroProps {
  home?: boolean;
  titulo?: string;
  subtitulo?: string;
  imagem?: string;
  botao1_texto?: string;
  botao1_link?: string;
  botao2_texto?: string;
  botao2_link?: string;
}

export interface TextoProps {
  titulo?: string;
  corpo?: string;
}

export interface CardContent {
  titulo?: string;
  icone?: "target" | "eye" | "heart" | "check" | "none" | "";
  texto?: string;
  valores?: string[];
}

export interface CardsProps {
  titulo?: string;
  cards?: CardContent[];
}

export interface CtaProps {
  titulo?: string;
  texto?: string;
  botao_texto?: string;
  botao_link?: string;
  botao2_texto?: string;
  botao2_link?: string;
  botao2_ocultar?: boolean;
}

export interface ContatoProps {
  titulo?: string;
  texto?: string;
  mostrar_form?: boolean;
}

export interface ImagemProps {
  src?: string;
  alt?: string;
}

export type HorariosProps = Record<string, never>;
export type CalendarioProps = Record<string, never>;
export type GaleriaProps = Record<string, never>;

export type Section =
  | { type: "hero"; props?: HeroProps }
  | { type: "texto"; props?: TextoProps }
  | { type: "cards"; props?: CardsProps }
  | { type: "horarios"; props?: HorariosProps }
  | { type: "cta"; props?: CtaProps }
  | { type: "contato"; props?: ContatoProps }
  | { type: "imagem"; props?: ImagemProps }
  | { type: "calendario"; props?: CalendarioProps }
  | { type: "galeria"; props?: GaleriaProps };

export type SectionType = Section["type"];

export const SECTION_LABELS: Record<SectionType, string> = {
  hero: "Cabeçalho (Hero)",
  texto: "Texto",
  cards: "Cards",
  horarios: "Horários de Culto",
  cta: "Faixa de destaque",
  contato: "Contato + Formulário",
  imagem: "Imagem em largura total",
  calendario: "Calendário (Agenda)",
  galeria: "Galeria de fotos",
};

export const SECTION_TYPES: SectionType[] = [
  "hero",
  "texto",
  "cards",
  "horarios",
  "cta",
  "contato",
  "imagem",
  "calendario",
  "galeria",
];
