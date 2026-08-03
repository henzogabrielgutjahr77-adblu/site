export type Breakpoint = "desktop" | "tablet" | "mobile";

export const BREAKPOINTS: Breakpoint[] = ["desktop", "tablet", "mobile"];

/** Valor responsivo: `tablet`/`mobile` ausentes herdam o desktop. */
export interface Responsive<T> {
  desktop: T;
  tablet?: T;
  mobile?: T;
}

export type Horizontal = "left" | "center" | "right";
export type Vertical = "top" | "center" | "bottom";

export interface GradientConfig {
  start: string;
  middle: string;
  end: string;
  opacity: number;
  intensity: number;
  direction: number;
  stopStart: number;
  stopMiddle: number;
  stopEnd: number;
}

export interface PhotoConfig {
  image: string;
  positionX: number;
  positionY: number;
  scale: number;
  zoom: number;
  opacity: number;
  blur: number;
  brightness: number;
  contrast: number;
  saturation: number;
  rotation: number;
}

export interface FloatingImageConfig {
  id: string;
  enabled: boolean;
  name: string;
  image: string;
  position: Responsive<{ x: number; y: number }>;
  width: Responsive<number>;
  height: Responsive<number>;
  scale: number;
  opacity: number;
  blur: number;
  rotation: number;
  zIndex: number;
  overlay: string;
  overlayOpacity: number;
  shadowEnabled: boolean;
  shadowColor: string;
  shadowOpacity: number;
  shadowBlur: number;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
}

export interface HeroTransitionConfig {
  height: number;
  intensity: number;
  gradientEnd: number;
  nextSectionOffset: number;
}

export type AnimationType = "fade" | "slide" | "zoom" | "blur";
export type Easing =
  | "ease"
  | "ease-in"
  | "ease-out"
  | "ease-in-out"
  | "linear";

export interface AnimationConfig {
  enabled: boolean;
  type: AnimationType;
  duration: number;
  delay: number;
  easing: Easing;
}

export interface HeroConfig {
  enabled: boolean;
  height: Responsive<number>;
  minHeight: Responsive<number>;
  maxWidth: Responsive<number>;
  horizontalAlign: Responsive<Horizontal>;
  verticalAlign: Responsive<Vertical>;
  alignText: Responsive<Horizontal>;
  paddingTop: Responsive<number>;
  paddingBottom: Responsive<number>;
  marginBottom: Responsive<number>;
  blockGap: Responsive<number>;
  columnWidth: Responsive<number>;
  overlayColor: string;
  overlayOpacity: number;
  photo: Responsive<PhotoConfig>;
  gradient: Responsive<GradientConfig>;
  transition: HeroTransitionConfig;
  floatingImages: FloatingImageConfig[];
  animation: AnimationConfig;
}

export interface FontRole {
  family: Responsive<string>;
  size: Responsive<number>;
  weight: Responsive<number>;
  lineHeight: Responsive<number>;
  letterSpacing: Responsive<number>;
}

export interface TypographyConfig {
  heading: FontRole;
  subtitle: FontRole;
  body: FontRole;
  button: FontRole;
}

export interface SpacingConfig {
  section: Responsive<number>;
  heading: Responsive<number>;
  card: Responsive<number>;
  text: Responsive<number>;
}

export interface RadiusConfig {
  general: number;
  card: number;
  button: number;
  image: number;
  section: number;
  input: number;
}

export interface ShadowConfig {
  color: string;
  intensity: number;
  offsetX: number;
  offsetY: number;
  blur: number;
}

export interface PaletteConfig {
  primary: string;
  primaryDark: string;
  secondary: string;
  accent: string;
  action: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
}

export interface MotionConfig {
  enabled: boolean;
}

export interface VisualConfig {
  version: number;
  palette: PaletteConfig;
  typography: TypographyConfig;
  spacing: SpacingConfig;
  radius: RadiusConfig;
  shadow: ShadowConfig;
  motion: MotionConfig;
  /** Hero das páginas internas (ex.: Quem Somos). */
  hero: HeroConfig;
  /** Hero da página inicial (landing). */
  homeHero: HeroConfig;
}
