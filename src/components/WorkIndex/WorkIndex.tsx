"use client";

import { useEffect, useRef, useState } from "react";

import { TransitionLink } from "@/components/TransitionLink";

import { CategoryTag } from "@/components/Category/Category";
import { ArrowDiagonal } from "@/components/icons/Arrows";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { subscribe } from "@/lib/raf";
import { Spring } from "@/lib/spring";
import type { FigureKey, Locale, LocalisedProject } from "@/lib/types";

import styles from "./WorkIndex.module.css";

/** Below this width there is no pointer to speak of; scroll drives instead. */
const TOUCH_MAX = 900;

export interface WorkIndexProps {
  projects: LocalisedProject[];
  locale: Locale;
  images: Record<string, Partial<Record<FigureKey, string>>>;
}

export function WorkIndex({ projects, locale, images }: WorkIndexProps) {
  const listRef = useRef<HTMLDivElement | null>(null);
  const revealRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mediaRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rowRefs = useRef<(HTMLAnchorElement | null)[]>([]);
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
        const el = revealRefs.current[i];
        if (!s || !el) continue;

        s.target = i === target ? 1 : 0;
        if (reduced) s.set(s.target);
        else s.step(dt);

        const inner = el.firstElementChild as HTMLElement | null;
        if (!inner) continue;

        if (s.atRest && s.target === 0) {
          if (el.style.height !== "0px") el.style.height = "0px";
        } else {
          el.style.height = `${inner.offsetHeight * s.v}px`;
        }
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
          getMorphEl={() => mediaRefs.current[i] ?? null}
          prefetch={false}
          className={styles.row}
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
          <div className={styles.line}>
            <span className={styles.n}>{String(i + 1).padStart(2, "0")}</span>
            <span className={styles.name}>{p.copy.title}</span>
            <span className={styles.desc}>{p.copy.desc}</span>
            <span className={styles.catCell}>
              <CategoryTag cat={p.cat} locale={locale} />
            </span>
            <span className={styles.year}>{p.year}</span>
            <span className={styles.arrow} aria-hidden="true">
              <ArrowDiagonal size={14} />
            </span>
          </div>

          <div className={styles.reveal} ref={(el) => { revealRefs.current[i] = el; }}>
            <div>
              <div className={styles.media} ref={(el) => { mediaRefs.current[i] = el; }}>
                {images[p.slug]?.["01"] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={images[p.slug]["01"]} alt="" loading="lazy" decoding="async" />
                ) : null}
                <span className={styles.mediaMeta}>
                  {p.copy.stats?.[0] ? (
                    <span className={styles.stat}>
                      {p.copy.stats[0].value.toLocaleString(locale === "pl" ? "pl-PL" : "en-US")}
                      {p.copy.stats[0].suffix ?? ""} · {p.copy.stats[0].label}
                    </span>
                  ) : null}
                </span>
              </div>
            </div>
          </div>
        </TransitionLink>
      ))}
    </div>
  );
}
