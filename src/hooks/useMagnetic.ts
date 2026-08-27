"use client";

import { useEffect, useRef } from "react";

import { useReducedMotion } from "@/hooks/useReducedMotion";
import { subscribe } from "@/lib/raf";
import { Spring, clamp } from "@/lib/spring";

/**
 * Magnetic pull. The element drifts toward the pointer once it is within
 * `radius`, and springs back when it leaves.
 *
 * Not a scale() — the object moves, which is the same instinct as the rest
 * of the site's hover language.
 */
export function useMagnetic<T extends HTMLElement>(strength = 0.32, radius = 90) {
  const ref = useRef<T | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;

    const x = new Spring(0, 170, 20);
    const y = new Spring(0, 170, 20);
    let painted = "";

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      const reach = Math.max(r.width, r.height) / 2 + radius;

      if (dist > reach) {
        x.target = 0;
        y.target = 0;
        return;
      }
      const falloff = 1 - clamp(dist / reach, 0, 1);
      x.target = dx * strength * falloff;
      y.target = dy * strength * falloff;
    };

    const onLeave = () => { x.target = 0; y.target = 0; };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave, { passive: true });

    const stop = subscribe((dt) => {
      x.step(dt);
      y.step(dt);
      const next =
        x.atRest && y.atRest && x.target === 0
          ? ""
          : `translate3d(${x.v.toFixed(2)}px, ${y.v.toFixed(2)}px, 0)`;
      if (next !== painted) {
        painted = next;
        el.style.transform = next;
      }
    });

    return () => {
      stop();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      el.style.transform = "";
    };
  }, [strength, radius, reduced]);

  return ref;
}
