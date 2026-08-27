"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ProjectTile } from "@/components/ProjectTile/ProjectTile";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { CATEGORY_LABELS, t } from "@/lib/i18n";
import { subscribe } from "@/lib/raf";
import { Spring } from "@/lib/spring";
import { baseWidth, columnsFor, widthFactor } from "@/lib/workGridLayout";
import { CATEGORIES, type Category, type Locale, type LocalisedProject } from "@/lib/types";

import styles from "./WorkGrid.module.css";

export interface WorkGridProps {
  projects: LocalisedProject[];
  locale: Locale;
}

export function WorkGrid({ projects, locale }: WorkGridProps) {
  const [filter, setFilter] = useState<Category | "all">("all");
  const gridRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const springs = useRef<Spring[]>([]);
  const hovered = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const reduced = useReducedMotion();

  const visible = useMemo(
    () => projects.map((p) => filter === "all" || p.cat === filter),
    [projects, filter],
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: projects.length };
    for (const cat of CATEGORIES) c[cat] = projects.filter((p) => p.cat === cat).length;
    return c;
  }, [projects]);

  const setHover = useCallback((i: number | null) => {
    hovered.current = i;
    setActiveIndex(i);
  }, []);

  /* Springs reset to rest on a filter change, so a half-open hover from the
     previous set cannot leak into the new layout. Done in the click handler
     rather than an effect — it is a consequence of the interaction, not of
     rendering. */
  const changeFilter = useCallback((cat: Category | "all") => {
    for (const s of springs.current) s.set(1);
    hovered.current = null;
    setActiveIndex(null);
    setFilter(cat);
  }, []);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    if (springs.current.length !== projects.length) {
      springs.current = projects.map(() => new Spring(1, 130, 21));
    }

    const stop = subscribe((dt) => {
      const width = grid.clientWidth;
      if (width <= 0) return;

      const cols = columnsFor(window.innerWidth);
      const base = baseWidth(width, cols);

      const shown: number[] = [];
      for (let i = 0; i < projects.length; i++) if (visible[i]) shown.push(i);

      const h = hovered.current;
      const hoveredVisible = h !== null && visible[h] ? shown.indexOf(h) : -1;

      let anyMoving = false;

      for (let vi = 0; vi < shown.length; vi++) {
        const i = shown[vi];
        const s = springs.current[i];
        const el = cardRefs.current[i];
        if (!s || !el) continue;

        s.target = widthFactor(
          vi,
          hoveredVisible === -1 ? null : hoveredVisible,
          shown.length,
          cols,
        );

        if (reduced) {
          s.set(s.target);
        } else {
          s.step(dt);
        }

        if (s.atRest && s.target === 1) {
          // Hand the resting layout back to CSS, so the grid stays correct
          // even if this loop later stalls (background tab, throttling).
          if (el.style.width) el.style.width = "";
        } else {
          anyMoving = true;
          el.style.width = `${base * s.v}px`;
        }
      }

      // Height is CSS-owned and never animates; nothing to write here.
      void anyMoving;
    });

    return stop;
  }, [projects, visible, reduced]);

  return (
    <>
      <div className={styles.filters} role="group" aria-label={t(locale, "workTitle")}>
        {(["all", ...CATEGORIES] as const).map((cat) => (
          <button
            key={cat}
            type="button"
            className={styles.filter}
            aria-pressed={filter === cat}
            onClick={() => changeFilter(cat)}
          >
            {cat === "all" ? t(locale, "filterAll") : CATEGORY_LABELS[locale][cat]}
            <span className={styles.count}>{counts[cat]}</span>
          </button>
        ))}
      </div>

      <div className={styles.grid} ref={gridRef}>
        {projects.map((p, i) => (
          <div
            key={p.slug}
            className={styles.card}
            ref={(el) => { cardRefs.current[i] = el; }}
            data-hidden={!visible[i] || undefined}
            aria-hidden={!visible[i] || undefined}
            // Staggered collapse rather than a whole-grid reflow.
            style={{ transitionDelay: `${(i % 6) * 24}ms` }}
          >
            <ProjectTile
              project={p}
              locale={locale}
              meta={p.year}
              active={activeIndex === i}
              dimmed={activeIndex !== null && activeIndex !== i}
              onActivate={() => setHover(i)}
              onDeactivate={() => setHover(null)}
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        ))}
      </div>
    </>
  );
}
