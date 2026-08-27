"use client";

import { useEffect, useRef } from "react";

import { useReducedMotion } from "@/hooks/useReducedMotion";
import { subscribe } from "@/lib/raf";
import { clamp01 } from "@/lib/spring";

const OUT_MS = 170;
const IN_MS = 340;

/** cubic ease-out, matching --lw-ease-out closely enough for a 170ms roll. */
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
/** slight overshoot on the way in, matching --lw-ease-playful. */
const easeBack = (t: number) => {
  const c = 1.70158 + 1;
  return 1 + c * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2);
};

/**
 * The bar itself never moves — only the type inside it cycles. That
 * stillness is what makes it read as furniture rather than a carousel
 * caption.
 *
 * The outgoing title rolls up and out; the incoming one arrives from below,
 * behind the bar's own edge. Two phases rather than a cross-fade, and
 * interruptible: a fast scroll that skips a slide restarts the roll with
 * the newest title rather than queueing.
 */
export function useTitleRoll(text: string) {
  const elRef = useRef<HTMLSpanElement | null>(null);
  const shownRef = useRef(text);
  const pendingRef = useRef<string | null>(null);
  const phaseRef = useRef<"idle" | "out" | "in">("idle");
  const tRef = useRef(0);
  const reduced = useReducedMotion();

  /* Queue a roll whenever the incoming text differs from what's painted. */
  useEffect(() => {
    if (text === shownRef.current) return;

    if (reduced) {
      shownRef.current = text;
      if (elRef.current) elRef.current.textContent = text;
      return;
    }

    pendingRef.current = text;
    phaseRef.current = "out";
    tRef.current = 0;
  }, [text, reduced]);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    el.textContent = shownRef.current;
    if (reduced) return;

    const stop = subscribe((dt) => {
      const phase = phaseRef.current;
      if (phase === "idle") return;

      const duration = phase === "out" ? OUT_MS : IN_MS;
      tRef.current = clamp01(tRef.current + (dt * 1000) / duration);
      const t = tRef.current;

      if (phase === "out") {
        const p = easeOut(t);
        el.style.transform = `translateY(${-120 * p}%)`;
        el.style.opacity = String(1 - p);

        if (t >= 1) {
          // Swap the text while it is off-stage, then re-enter from below.
          const next = pendingRef.current;
          if (next !== null) {
            shownRef.current = next;
            el.textContent = next;
            pendingRef.current = null;
          }
          phaseRef.current = "in";
          tRef.current = 0;
          el.style.transform = "translateY(120%)";
          el.style.opacity = "0";
        }
        return;
      }

      const p = easeBack(t);
      el.style.transform = `translateY(${120 * (1 - p)}%)`;
      el.style.opacity = String(Math.min(1, t * 1.6));

      if (t >= 1) {
        phaseRef.current = "idle";
        el.style.transform = "";
        el.style.opacity = "";
      }
    });

    return stop;
  }, [reduced]);

  return elRef;
}
