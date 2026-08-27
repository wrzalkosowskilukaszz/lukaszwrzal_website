"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ProjectTile } from "@/components/ProjectTile/ProjectTile";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { subscribe } from "@/lib/raf";
import { Spring } from "@/lib/spring";
import { baseWidth, columnsFor, widthFactor } from "@/lib/workGridLayout";
import type { Category, Locale, ProjectCard } from "@/lib/types";

import styles from "./WorkGrid.module.css";

export interface WorkGridProps {
  projects: ProjectCard[];
  locale: Locale;
  /** Owned by WorkBrowser, so both views share one filter. */
  filter: Category | "all";
}

export function WorkGrid({ projects, locale, filter }: WorkGridProps) {
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

  const setHover = useCallback((i: number | null) => {
    hovered.current = i;
    setActiveIndex(i);
  }, []);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    if (springs.current.length !== projects.length) {
      springs.current = projects.map(() => new Spring(1, 130, 21));
    }

    /* Reset to rest whenever the filter changes, so a half-open hover from
       the previous set cannot leak into the new layout. `filter` is in the
       dep list, so this runs on every change. */
    for (const s of springs.current) s.set(1);
    hovered.current = null;

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
  }, [projects, visible, reduced, filter]);

  return (
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
  );
}
