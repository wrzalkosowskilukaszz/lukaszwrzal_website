"use client";

import { useEffect, useRef, useState } from "react";

import { TransitionLink } from "@/components/TransitionLink";

import { CategoryTag } from "@/components/Category/Category";
import { ArrowDiagonal } from "@/components/icons/Arrows";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { subscribe } from "@/lib/raf";
import { Spring } from "@/lib/spring";
import type { Locale, ProjectCard } from "@/lib/types";

import styles from "./WorkIndex.module.css";

/** Below this width there is no pointer to speak of; scroll drives instead. */
const TOUCH_MAX = 900;

export interface WorkIndexProps {
  projects: ProjectCard[];
  locale: Locale;
}

/**
 * The index. The hovered row FLOODS: it claims a little height on a spring
 * while its image wipes in as the row's own full-bleed background, text
 * flipping to paper over the same scrim the grid tiles use. One hover
 * grammar for both /work views — labels live inside the media.
 *
 * Nothing is ever covered: the image occupies the rectangle that already
 * belongs to that project. On touch the same flood is driven by scroll
 * proximity — one presentation on every input. (A cursor-following ghost
 * was tried and rejected: it sat on top of the very row being read.)
 */
export function WorkIndex({ projects, locale }: WorkIndexProps) {
  const listRef = useRef<HTMLDivElement | null>(null);
  const rowRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const floodRefs = useRef<(HTMLDivElement | null)[]>([]);
  const springs = useRef<Spring[]>([]);
  const hovered = useRef<number | null>(null);
  const openRef = useRef<number | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    if (springs.current.length !== projects.length) {
      springs.current = projects.map(() => new Spring(0, 150, 24));
    }

    const stop = subscribe((dt) => {
      const touch = window.innerWidth <= TOUCH_MAX;

      /* Which row has the reader's attention?
         Pointer on desktop; on touch, whichever row straddles the focal
         line — the same idea, a different pointing device. */
      let target: number | null = hovered.current;

      if (touch) {
        const focal = window.innerHeight * 0.42;
        let best: number | null = null;
        let bestDist = Infinity;
        for (let i = 0; i < projects.length; i++) {
          const el = rowRefs.current[i];
          if (!el) continue;
          const r = el.getBoundingClientRect();
          if (r.bottom < 0 || r.top > window.innerHeight) continue;
          const dist = Math.abs(r.top + 28 - focal);
          if (dist < bestDist) { bestDist = dist; best = i; }
        }
        target = best;
      }

      if (target !== openRef.current) {
        openRef.current = target;
        setOpen(target);
      }

      for (let i = 0; i < projects.length; i++) {
        const s = springs.current[i];
        const line = lineRefs.current[i];
        const flood = floodRefs.current[i];
        if (!s || !line || !flood) continue;

        s.target = i === target ? 1 : 0;
        if (reduced) s.set(s.target);
        else s.step(dt);

        const v = s.v;
        if (s.atRest && s.target === 0) {
          /* Resting layout goes back to CSS. */
          if (line.style.paddingBlock) {
            line.style.paddingBlock = "";
            flood.style.clipPath = "";
            flood.style.opacity = "";
          }
          continue;
        }

        /* The row claims height; its image wipes in from the left —
           reading direction — and fades the last stretch. */
        line.style.paddingBlock = `${18 + v * 26}px`;
        flood.style.clipPath = `inset(0 ${(1 - v) * 100}% 0 0)`;
        flood.style.opacity = String(Math.min(1, v * 1.6));
      }
    });

    return stop;
  }, [projects, reduced]);

  return (
    <div className={styles.list} ref={listRef}>
      {projects.map((p, i) => (
        <TransitionLink
          key={p.slug}
          href={`/${locale}/work/${p.slug}`}
          morphName="project-media"
          getMorphEl={() => floodRefs.current[i] ?? null}
          prefetch={false}
          className={styles.row}
          style={{ ["--i" as string]: i }}
          ref={(el) => { rowRefs.current[i] = el; }}
          data-open={open === i || undefined}
          onPointerEnter={() => {
            if (window.innerWidth > TOUCH_MAX) hovered.current = i;
          }}
          onPointerLeave={() => {
            if (window.innerWidth > TOUCH_MAX) hovered.current = null;
          }}
          onFocus={() => { hovered.current = i; }}
          onBlur={() => { hovered.current = null; }}
        >
          {/* The row's own image, behind its text. */}
          <div className={styles.flood} ref={(el) => { floodRefs.current[i] = el; }} aria-hidden="true">
            {p.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.image} alt="" loading="lazy" decoding="async" />
            ) : null}
            <span className={styles.floodScrim} />
            {p.stat ? (
              <span className={styles.floodStat}>
                {p.stat.value.toLocaleString(locale === "pl" ? "pl-PL" : "en-US")}
                {p.stat.suffix ?? ""} · {p.stat.label}
              </span>
            ) : null}
          </div>

          <div className={styles.line} ref={(el) => { lineRefs.current[i] = el; }}>
            <span className={styles.n}>{String(i + 1).padStart(2, "0")}</span>
            <span className={styles.name}>{p.title}</span>
            <span className={styles.desc}>{p.desc}</span>
            <span className={styles.catCell}>
              <CategoryTag cat={p.cat} locale={locale} />
            </span>
            <span className={styles.year}>{p.year}</span>
            <span className={styles.arrow} aria-hidden="true">
              <ArrowDiagonal size={14} />
            </span>
          </div>
        </TransitionLink>
      ))}
    </div>
  );
}
