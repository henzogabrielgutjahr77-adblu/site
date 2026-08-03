import { getSiteConfig } from "@/lib/content";
import { resolveVisual, visualCss } from "@/lib/visual";

export default function VisualProvider() {
  const config = getSiteConfig();
  const visual = resolveVisual(config.visual);
  const css = visualCss(visual);
  return <style id="visual-config" dangerouslySetInnerHTML={{ __html: css }} />;
}
