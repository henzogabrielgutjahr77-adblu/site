import type { FloatingImageConfig } from "@/lib/visual";

interface FloatingImagesProps {
  variant: "inner" | "home";
  images?: FloatingImageConfig[];
}

export default function FloatingImages({ variant, images }: FloatingImagesProps) {
  const active = (images ?? []).filter((img) => img.enabled && img.image);
  if (active.length === 0) return null;
  const scope = variant === "home" ? "vi-home" : "vi-inner";
  return (
    <>
      {active.map((img) => (
        <div key={img.id} className={`fi-img fi-${img.id} ${scope}-fi`} aria-hidden>
          <img src={img.image} alt={img.name || ""} className="h-full w-full object-cover" />
          {img.overlay && <span className="fi-ov" />}
        </div>
      ))}
    </>
  );
}
