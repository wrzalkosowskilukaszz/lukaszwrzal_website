"use client";

import { useEffect, useRef, useState } from "react";

import { useReducedMotion } from "@/hooks/useReducedMotion";
import { clamp01 } from "@/lib/spring";
import { subscribe } from "@/lib/raf";

import styles from "./Aurora.module.css";
import { createAurora, type AuroraGL } from "./shader";

/**
 * The aurora field — a GPU noise flow in the brand colours that drifts on
 * its own clock, leans with the section's travel through the viewport and
 * quickens with scroll velocity. Used in exactly two roles: behind the
 * work grid and behind footers. That scarcity is what keeps it a signature.
 *
 * Where WebGL is unavailable, the original five-blob field takes over
 * (static under reduced motion, orbiting otherwise).
 */

/** Exact geometry from DESIGN-SPEC "The aurora field" — the fallback. */
const BLOBS = [
  { css: { left: "-12%", top: "-10%", width: "62%", height: "62%" }, colour: "--lw-aura-sky", fade: "rgba(205,221,242,0)", blur: 30 },
  { css: { right: "-10%", top: "-12%", width: "56%", height: "58%" }, colour: "--lw-aura-violet", fade: "rgba(60,44,194,0)", blur: 40 },
  { css: { left: "-14%", bottom: "-14%", width: "64%", height: "60%" }, colour: "--lw-aura-butter", fade: "rgba(255,248,207,0)", blur: 34 },
  { css: { right: "-12%", bottom: "-12%", width: "58%", height: "58%" }, colour: "--lw-aura-mint", fade: "rgba(94,231,197,0)", blur: 36 },
  { css: { left: "34%", top: "30%", width: "42%", height: "46%" }, colour: "--lw-aura-sky-soft", fade: "rgba(205,221,242,0)", blur: 44 },
] as const;

export interface AuroraProps {
  /** The bento variant: lower two-thirds, soft top mask, scroll-ramped opacity. */
  masked?: boolean;
}

export function Aurora({ masked = false }: AuroraProps) {
  const fieldRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const blobRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const reduced = useReducedMotion();
  /* null = shader not running (SSR, init failure) — blobs render then.
     The canvas is always mounted (unless reduced), so a failed init can
     never leave the field empty: the blobs are simply behind it.
     StrictMode note: cleanup must null the state and must NOT kill the
     GL context — the dev double-mount re-inits the same canvas. */
  const [gl, setGl] = useState<AuroraGL | null>(null);

  useEffect(() => {
    if (reduced) return; // reduced motion always gets the static blobs
    const canvas = canvasRef.current;
    if (!canvas) return;
    const instance = createAurora(canvas);
    if (!instance) return;
    /* Paint frame zero immediately so the field is never blank while the
       shared loop spins up (or in environments where it never ticks). */
    instance.draw(0, 0, 0, 0, 0);
    setGl(instance);
    return () => {
      setGl(null);
      instance.dispose();
    };
  }, [reduced]);

  /* One subscription drives whichever field is active. */
  useEffect(() => {
    const field = fieldRef.current;
    if (!field) return;

    if (reduced) {
      for (const el of blobRefs.current) if (el) el.style.transform = "none";
      field.style.opacity = "1";
      return;
    }

    let ptrX = 0, ptrY = 0, tgtX = 0, tgtY = 0;
    let lastScrollY = window.scrollY;
    let vel = 0; // smoothed |scroll velocity|, 0..1

    const onMove = (e: PointerEvent) => {
      tgtX = (e.clientX / window.innerWidth) * 2 - 1;
      tgtY = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const onLeave = () => { tgtX = 0; tgtY = 0; };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave, { passive: true });

    const stop = subscribe((dt, elapsed) => {
      const rect = field.getBoundingClientRect();
      const vh = window.innerHeight;

      // Scroll velocity keeps integrating even while offscreen, so the
      // field doesn't jolt when it re-enters mid-fling.
      const dy = window.scrollY - lastScrollY;
      lastScrollY = window.scrollY;
      const instant = clamp01(Math.abs(dy / Math.max(dt, 0.001)) / 2600);
      vel += (instant - vel) * (instant > vel ? 0.16 : 0.03); // fast in, slow out

      if (rect.bottom < -300 || rect.top > vh + 300) return;

      ptrX += (tgtX - ptrX) * 0.045;
      ptrY += (tgtY - ptrY) * 0.045;

      const travel = ((rect.top + rect.height / 2) / vh - 0.5) * -2;

      if (masked) {
        const p = (vh - rect.top) / (rect.height + vh);
        field.style.opacity = String(clamp01((p - 0.08) / 0.34));
      }

      if (gl) {
        gl.draw(elapsed, travel, vel, ptrX, ptrY);
        return;
      }

      /* Blob fallback — the original orbits. */
      for (let i = 0; i < BLOBS.length; i++) {
        const el = blobRefs.current[i];
        if (!el) continue;
        const ax = 26 + i * 9;
        const ay = 20 + i * 7;
        const sx = 0.055 + i * 0.017;
        const sy = 0.041 + i * 0.013;
        const px = i * 1.7;
        const py = i * 2.3;
        const pull = 0.5 + i * 0.22;
        const x = Math.sin(elapsed * sx * 6.28 + px) * ax + ptrX * 26 * pull;
        const y =
          Math.cos(elapsed * sy * 6.28 + py) * ay +
          ptrY * 20 * pull +
          travel * 34 * pull;
        const sc = 1 + Math.sin(elapsed * sx * 4.4 + py) * 0.06;
        el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${sc})`;
      }
    });

    return () => {
      stop();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, [masked, reduced, gl]);

  const shaderActive = gl !== null && !reduced;

  return (
    <div
      ref={fieldRef}
      className={`${styles.field} ${masked ? styles.masked : ""}`}
      aria-hidden="true"
      style={masked ? { opacity: 0 } : undefined}
    >
      {!reduced ? <canvas ref={canvasRef} className={styles.canvas} /> : null}
      {shaderActive
        ? null
        : BLOBS.map((b, i) => (
            <span
              key={i}
              ref={(el) => { blobRefs.current[i] = el; }}
              className={styles.blob}
              style={{
                ...b.css,
                filter: `blur(${b.blur}px)`,
                // Fade to the SAME colour at zero alpha, never `transparent` —
                // that is rgba(0,0,0,0) and greys the falloff.
                background: `radial-gradient(circle at 50% 50%, var(${b.colour}) 0%, ${b.fade} 68%)`,
              }}
            />
          ))}
    </div>
  );
}
