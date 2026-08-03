import type {
  FloatingImageConfig,
  GradientConfig,
  HeroConfig,
  PaletteConfig,
  PhotoConfig,
  RadiusConfig,
  ShadowConfig,
  SpacingConfig,
  TypographyConfig,
  VisualConfig,
} from "./types";

export const HEADER_HEIGHT = 60;

export const DEFAULT_PALETTE: PaletteConfig = {
  primary: "#0e2540",
  primaryDark: "#08111f",
  secondary: "#17354f",
  accent: "#ff6900",
  action: "#e85d04",
  background: "#ffffff",
  surface: "#f8fafc",
  text: "#0f172a",
  muted: "#64748b",
  border: "#e2e8f0",
};

export const DEFAULT_TYPOGRAPHY: TypographyConfig = {
  heading: {
    family: { desktop: "Inter" },
    size: { desktop: 48, tablet: 40, mobile: 32 },
    weight: { desktop: 800 },
    lineHeight: { desktop: 1.1 },
    letterSpacing: { desktop: -0.03 },
  },
  subtitle: {
    family: { desktop: "Inter" },
    size: { desktop: 18, tablet: 16, mobile: 15 },
    weight: { desktop: 400 },
    lineHeight: { desktop: 1.5 },
    letterSpacing: { desktop: 0 },
  },
  body: {
    family: { desktop: "Inter" },
    size: { desktop: 16, tablet: 15, mobile: 15 },
    weight: { desktop: 400 },
    lineHeight: { desktop: 1.65 },
    letterSpacing: { desktop: 0 },
  },
  button: {
    family: { desktop: "Inter" },
    size: { desktop: 15.5, tablet: 15, mobile: 14 },
    weight: { desktop: 600 },
    lineHeight: { desktop: 1.2 },
    letterSpacing: { desktop: 0 },
  },
};

export const DEFAULT_SPACING: SpacingConfig = {
  section: { desktop: 80, tablet: 64, mobile: 48 },
  heading: { desktop: 32, tablet: 28, mobile: 24 },
  card: { desktop: 24, tablet: 20, mobile: 16 },
  text: { desktop: 16, tablet: 14, mobile: 12 },
};

export const DEFAULT_RADIUS: RadiusConfig = {
  general: 12,
  card: 12,
  button: 8,
  image: 8,
  section: 0,
  input: 8,
};

export const DEFAULT_SHADOW: ShadowConfig = {
  color: "#000000",
  intensity: 0.1,
  offsetX: 0,
  offsetY: 4,
  blur: 16,
};

export const DEFAULT_GRADIENT: GradientConfig = {
  start: "#08111f",
  middle: "#0e2540",
  end: "#0b1e34",
  opacity: 0.55,
  intensity: 1,
  direction: 160,
  stopStart: 0,
  stopMiddle: 45,
  stopEnd: 100,
};

export const DEFAULT_PHOTO: PhotoConfig = {
  image: "",
  positionX: 50,
  positionY: 50,
  scale: 1.05,
  zoom: 1,
  opacity: 1,
  blur: 3,
  brightness: 1,
  contrast: 1,
  saturation: 1,
  rotation: 0,
};

export const DEFAULT_HERO: HeroConfig = {
  enabled: true,
  height: { desktop: 0 },
  minHeight: { desktop: 0 },
  maxWidth: { desktop: 1280 },
  horizontalAlign: { desktop: "center" },
  verticalAlign: { desktop: "center" },
  alignText: { desktop: "left" },
  paddingTop: { desktop: 64, tablet: 56, mobile: 48 },
  paddingBottom: { desktop: 96, tablet: 72, mobile: 56 },
  marginBottom: { desktop: 0 },
  blockGap: { desktop: 24, tablet: 20, mobile: 16 },
  columnWidth: { desktop: 700 },
  overlayColor: "#0e1a26",
  overlayOpacity: 0.82,
  photo: {
    desktop: { ...DEFAULT_PHOTO, image: "" },
  },
  gradient: {
    desktop: { ...DEFAULT_GRADIENT },
  },
  transition: {
    height: 0,
    intensity: 0,
    gradientEnd: 100,
    nextSectionOffset: 0,
  },
  floatingImages: [] as FloatingImageConfig[],
  animation: {
    enabled: true,
    type: "fade",
    duration: 700,
    delay: 0,
    easing: "ease-out",
  },
};

export function defaultFloatingImage(seed = 1): FloatingImageConfig {
  return {
    id: `fi-${seed}-${Date.now().toString(36)}`,
    enabled: true,
    name: "Imagem flutuante",
    image: "",
    position: { desktop: { x: 80, y: 20 } },
    width: { desktop: 160 },
    height: { desktop: 0 },
    scale: 1,
    opacity: 1,
    blur: 0,
    rotation: 0,
    zIndex: 2,
    overlay: "",
    overlayOpacity: 0,
    shadowEnabled: false,
    shadowColor: "#000000",
    shadowOpacity: 0.25,
    shadowBlur: 24,
    borderColor: "#ffffff",
    borderWidth: 0,
    borderRadius: 8,
  };
}

export const DEFAULT_HOME_HERO: HeroConfig = {
  ...DEFAULT_HERO,
  alignText: { desktop: "center" },
  columnWidth: { desktop: 0 },
  paddingTop: { desktop: 88, tablet: 72, mobile: 56 },
  paddingBottom: { desktop: 88, tablet: 72, mobile: 56 },
  blockGap: { desktop: 28, tablet: 24, mobile: 20 },
  overlayOpacity: 0,
  photo: {
    desktop: { ...DEFAULT_PHOTO, image: "", opacity: 1, blur: 0 },
  },
};

export const DEFAULT_VISUAL: VisualConfig = {
  version: 1,
  palette: DEFAULT_PALETTE,
  typography: DEFAULT_TYPOGRAPHY,
  spacing: DEFAULT_SPACING,
  radius: DEFAULT_RADIUS,
  shadow: DEFAULT_SHADOW,
  motion: { enabled: true },
  hero: DEFAULT_HERO,
  homeHero: DEFAULT_HOME_HERO,
};
