import { hasPageVisual, getPageVisual } from "@/lib/page-visual";
import { visualCss } from "@/lib/visual";

export default function PageVisualCss({ slug }: { slug: string }) {
  if (!hasPageVisual(slug)) return null;
  return (
    <style
      id={`visual-config-${slug}`}
      dangerouslySetInnerHTML={{ __html: visualCss(getPageVisual(slug)) }}
    />
  );
}
