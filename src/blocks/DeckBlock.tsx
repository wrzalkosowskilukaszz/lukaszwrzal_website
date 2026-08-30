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
        el.style.clipPath = "";
        el.style.visibility = "";
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

      /* Slides never move and never fade — the incoming slide is revealed
         by a clip edge wiping downward over the (static, opaque) one
         beneath. The wipe occupies only the middle quarter of the gap
         between slots, so each slide dwells planted for most of its
         scroll; there is no ghost overlap, only a crisp travelling edge. */
      const WINDOW = 0.24;
      for (let i = 0; i < n; i++) {
        const el = slideRefs.current[i];
        if (!el) continue;
        if (i === 0) {
          el.style.clipPath = "none";
        } else {
          const t = clamp01((pos - (i - 0.5 - WINDOW / 2)) / WINDOW);
          el.style.clipPath =
            t <= 0 ? "inset(0 0 100% 0)" : t >= 1 ? "none" : `inset(0 0 ${(1 - t) * 100}% 0)`;
          el.style.visibility = t <= 0 ? "hidden" : "visible";
        }
        /* Fully covered by the next slide? Drop it from painting. */
        const covered = i < n - 1 && pos >= i + 0.5 + WINDOW / 2;
        if (covered) el.style.visibility = "hidden";
        else if (i === 0) el.style.visibility = "visible";
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
