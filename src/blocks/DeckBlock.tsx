"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

import { useReducedMotion } from "@/hooks/useReducedMotion";
import { clamp01 } from "@/lib/spring";
import { subscribe } from "@/lib/raf";

import { Media } from "./Media";
import s from "./blocks.module.css";
import { tx, type BlockContext } from "./shared";
import type { DeckBlock } from "./types";

const WIDE = "(min-width: 900px)";
const subscribeWidth = (cb: () => void) => {
  const mq = window.matchMedia(WIDE);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const readWidth = () => window.matchMedia(WIDE).matches;

/**
 * A pinned slide sequence. The section holds the viewport while scroll
 * plays its slides through — the feeling of "one view per idea" WITHOUT
 * hijacking the wheel: this is a sticky viewport over a tall track, the
 * same mechanism as the homepage reel. The scrollbar stays truthful, and
 * momentum is never interrupted.
 *
 * The stacked layout is the default (SSR, no JS, small screens, reduced
 * motion); the pinned mode is layered on when it can actually work.
 */
export function Deck({ block, ctx }: { block: DeckBlock; ctx: BlockContext }) {
  const rootRef = useRef<HTMLElement | null>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const counterRef = useRef<HTMLSpanElement | null>(null);
  const reduced = useReducedMotion();

  const n = block.items.length;

  /* Pin only where it earns its keep: wide screens, motion allowed.
     (Server snapshot is false, so SSR always emits the stacked layout.) */
  const wide = useSyncExternalStore(subscribeWidth, readWidth, () => false);
  const pinned = wide && !reduced && n >= 2;

  useEffect(() => {
    if (!pinned) {
      /* Stacked mode: clear any leftover per-slide styling. */
      for (const el of slideRefs.current) {
        if (!el) continue;
        el.style.opacity = "";
        el.style.visibility = "";
        el.style.transform = "";
      }
      return;
    }

    const root = rootRef.current;
    if (!root) return;

    let shown = -1;
    return subscribe(() => {
      const rect = root.getBoundingClientRect();
      const vh = window.innerHeight;
      if (rect.bottom < -100 || rect.top > vh + 100) return;

      /* Progress through the track maps to a continuous slide position. */
      const travel = rect.height - vh;
      const pos = clamp01(-rect.top / Math.max(travel, 1)) * (n - 1);

      for (let i = 0; i < n; i++) {
        const el = slideRefs.current[i];
        if (!el) continue;
        const d = pos - i;
        /* Full at its slot, gone one slot away; outgoing drifts up,
           incoming rises in. */
        const o = clamp01(1 - Math.abs(d) * 1.45);
        el.style.opacity = String(o);
        el.style.visibility = o < 0.02 ? "hidden" : "visible";
        el.style.transform = `translate3d(0, ${d * -34}px, 0)`;
      }

      const active = Math.round(pos);
      if (active !== shown && counterRef.current) {
        shown = active;
        counterRef.current.textContent = String(active + 1).padStart(2, "0");
      }
    });
  }, [pinned, n]);

  return (
    <section
      ref={rootRef}
      className={`${s.deck} ${pinned ? s.deckPinned : ""}`}
      style={pinned ? { height: `${n * 110}vh` } : undefined}
    >
      <div className={s.deckView}>
        {block.items.map((item, i) => (
          <div
            key={i}
            ref={(el) => { slideRefs.current[i] = el; }}
            className={s.deckSlide}
          >
            <div className={s.deckText}>
              <p className={`${s.eyebrow} ${s.deckIndex}`}>
                {String(i + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
              </p>
              <h3 className={s.deckTitle}>{tx(item.title, ctx.locale)}</h3>
              {item.body ? <p className={s.deckBody}>{tx(item.body, ctx.locale)}</p> : null}
            </div>
            <div className={s.deckMedia}>
              {item.src ? (
                <Media media={item as { src: string; missing?: boolean }} ctx={ctx} radius="stage" ratio="4 / 3" />
              ) : null}
            </div>
          </div>
        ))}

        {/* Live position, pinned mode only (CSS hides it when stacked). */}
        <p className={`${s.eyebrow} ${s.deckCounter}`} aria-hidden="true">
          <span ref={counterRef}>01</span> / {String(n).padStart(2, "0")}
        </p>
      </div>
    </section>
  );
}
