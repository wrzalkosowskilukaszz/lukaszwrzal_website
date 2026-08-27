"use client";

import { useEffect } from "react";

import { useReducedMotion } from "@/hooks/useReducedMotion";
import { subscribe } from "@/lib/raf";
import { Spring, clamp } from "@/lib/spring";

/** Bricolage Grotesque's width axis runs 75–100. */
const WIDE = 100;
const NARROW = 82;

/** Scroll speed (px/s) at which the type reaches full compression. */
const FULL_TILT = 2600;

/**
 * Kinetic typography, driven by a real variable axis rather than a fade.
 *
 * Headings compress on the `wdth` axis as the page scrolls fast and relax
 * back to full width when it settles. Writes a single custom property on
 * :root, so every heading responds without its own listener.
 *
 * Held at rest under prefers-reduced-motion.
 */
export function useKineticType(): void {
  const reduced = useReducedMotion();

  useEffect(() => {
    const root = document.documentElement;

    if (reduced) {
      root.style.setProperty("--wdth", String(WIDE));
      return;
    }

    const width = new Spring(WIDE, 90, 18);
    let lastY = window.scrollY;
    let painted = -1;

    const stop = subscribe((dt) => {
      const y = window.scrollY;
      const velocity = Math.abs(y - lastY) / Math.max(dt, 0.0001);
      lastY = y;

      const tilt = clamp(velocity / FULL_TILT, 0, 1);
      width.target = WIDE - (WIDE - NARROW) * tilt;
      width.step(dt);

      // Only touch the DOM when the rendered value actually changes.
      const next = Math.round(width.v * 10) / 10;
      if (next !== painted) {
        painted = next;
        root.style.setProperty("--wdth", String(next));
      }
    });

    return () => {
      stop();
      root.style.removeProperty("--wdth");
    };
  }, [reduced]);
}
