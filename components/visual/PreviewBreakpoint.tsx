"use client";

import { useEffect } from "react";

/**
 * Aplica data-breakpoint no <html> a partir de ?preview=desktop|tablet|mobile.
 * Usado pelo painel admin para forçar o breakpoint independente do viewport.
 */
export default function PreviewBreakpoint() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const bp = params.get("preview");
    const root = document.documentElement;
    if (bp === "desktop" || bp === "tablet" || bp === "mobile") {
      root.dataset.breakpoint = bp;
    } else {
      delete root.dataset.breakpoint;
    }
  }, []);
  return null;
}
