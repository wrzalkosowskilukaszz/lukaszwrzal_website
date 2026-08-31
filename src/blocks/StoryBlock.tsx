"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

import { useReducedMotion } from "@/hooks/useReducedMotion";
import { clamp01 } from "@/lib/spring";
import { subscribe } from "@/lib/raf";

import { Media } from "./Media";
import s from "./blocks.module.css";
import { tx, txAll, type BlockContext } from "./shared";
import type { StoryBlock } from "./types";

const WIDE = "(min-width: 900px)";
const subscribeWidth = (cb: () => void) => {
  const mq = window.matchMedia(WIDE);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const readWidth = () => window.matchMedia(WIDE).matches;

/**
 * The case-study spine: chapters read as one flowing text column while a
 * pinned image beside them wipes to each chapter's picture as it arrives.
 * The text is NEVER pinned or hijacked — only the picture holds still.
 *
 * The chapter headers use the same numbered-pill eyebrows as plain text
 * sections, and the page-wide counter runs straight through, so stories,
 * texts and lists can interleave freely.
 *
 * On phones (and under reduced motion, and without JS) each picture sits
 * inline after its chapter — the plain reading order.
 */
export function Story({ block, ctx }: { block: StoryBlock; ctx: BlockContext }) {
  const rootRef = useRef<HTMLElement | null>(null);
  const chapterRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mediaRefs = useRef<(HTMLDivElement | null)[]>([]);
  const reduced = useReducedMotion();

  const wide = useSyncExternalStore(subscribeWidth, readWidth, () => false);
  const pinned = wide && !reduced;

  const n = block.items.length;
  const withMedia = block.items.some((i) => i.src);
  const baseIdx = block.items.findIndex((i) => i.src);

  useEffect(() => {
    if (!pinned || !withMedia) {
      for (const el of mediaRefs.current) {
        if (!el) continue;
        el.style.clipPath = "";
        el.style.visibility = "";
      }
      return;
    }

    const root = rootRef.current;
    if (!root) return;

    /* The wipe BEGINS only when the incoming chapter's heading crosses
       the reading line (~38% down the viewport) and completes over a short
       band above it — never before. A pre-roll band was tried first and
       swapped images while the reader was still mid-chapter. */
    return subscribe(() => {
      const rect = root.getBoundingClientRect();
      const vh = window.innerHeight;
      if (rect.bottom < -100 || rect.top > vh + 100) return;

      const anchor = vh * 0.38;
      const band = Math.min(180, vh * 0.2);

      for (let i = 0; i < n; i++) {
        const media = mediaRefs.current[i];
        if (!media) continue;
        if (i === baseIdx) {
          media.style.clipPath = "none";
          media.style.visibility = "visible";
          continue;
        }
        const ch = chapterRefs.current[i];
        if (!ch) continue;
        const t = clamp01((anchor - ch.getBoundingClientRect().top) / band);
        media.style.clipPath =
          t <= 0 ? "inset(0 0 100% 0)" : t >= 1 ? "none" : `inset(0 0 ${(1 - t) * 100}% 0)`;
        media.style.visibility = t <= 0 ? "hidden" : "visible";
      }

      /* Drop fully covered layers from painting. */
      for (let i = 0; i < n - 1; i++) {
        const next = chapterRefs.current[i + 1];
        const media = mediaRefs.current[i];
        if (!next || !media) continue;
        const tNext = clamp01((anchor - next.getBoundingClientRect().top) / band);
        if (tNext >= 1) media.style.visibility = "hidden";
      }
    });
  }, [pinned, withMedia, n, baseIdx]);

  return (
    <section
      ref={rootRef}
      className={`${s.story} ${pinned && withMedia ? s.storyPinned : ""} ${
        block.side === "left" ? s.storyFlip : ""
      }`}
    >
      <div className={s.storyText}>
        {block.items.map((item, i) => (
          <div
            key={i}
            ref={(el) => { chapterRefs.current[i] = el; }}
            className={s.storyChapter}
          >
            <p className={`${s.eyebrow} ${s.secEyebrow}`}>{tx(item.eyebrow, ctx.locale)}</p>
            {item.statement ? (
              <h2 className={s.statement}>{tx(item.statement, ctx.locale)}</h2>
            ) : null}
            <div className={s.prose}>
              {txAll(item.body, ctx.locale).map((p, j) => <p key={j}>{p}</p>)}
            </div>
            {/* Inline picture for the stacked layout; CSS hides it when
                the pinned frame takes over. */}
            {item.src ? (
              <div className={s.storyInlineMedia}>
                <Media media={item as { src: string; missing?: boolean }} ctx={ctx} radius="tile" ratio="4 / 3" />
              </div>
            ) : null}
          </div>
        ))}
      </div>

      {withMedia ? (
        <div className={s.storyMedia} aria-hidden="true">
          <div className={s.storyFrame}>
            {block.items.map((item, i) =>
              item.src ? (
                <div
                  key={i}
                  ref={(el) => { mediaRefs.current[i] = el; }}
                  className={s.storyLayer}
                >
                  <Media media={item as { src: string; missing?: boolean }} ctx={ctx} radius="flat" height="100%" />
                </div>
              ) : null,
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}
