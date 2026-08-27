"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Aurora } from "@/components/Aurora/Aurora";
import { ProjectTile } from "@/components/ProjectTile/ProjectTile";
import { ArrowRight } from "@/components/icons/Arrows";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { t } from "@/lib/i18n";
import { subscribe } from "@/lib/raf";
import { Spring } from "@/lib/spring";
import type { Locale, LocalisedProject } from "@/lib/types";

import styles from "./Bento.module.css";

/** Column 1 and 3 run tall/short/tall/short; column 2 is offset. */
const HEIGHTS = [
  ["tall", "short", "tall", "short"],
  ["short", "tall", "short", "tall"],
  ["tall", "short", "tall", "short"],
] as const;

const CLAIM = 1.2;
const TOTAL = 3;

export interface BentoProps {
  projects: LocalisedProject[];
  locale: Locale;
}

export function Bento({ projects, locale }: BentoProps) {
  const gridRef = useRef<HTMLDivElement | null>(null);
  const springs = useRef<Spring[]>([]);
  const hoveredCol = useRef<number | null>(null);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const reduced = useReducedMotion();

  /* Twelve tiles dealt down three columns of four. */
  const columns: LocalisedProject[][] = [[], [], []];
  projects.slice(0, 12).forEach((p, i) => columns[i % TOTAL].push(p));

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    // Built here, never during render — a ref mutated in the render body
    // breaks under concurrent rendering.
    if (springs.current.length !== TOTAL) {
      springs.current = Array.from({ length: TOTAL }, () => new Spring(1, 130, 21));
    }

    const stop = subscribe((dt) => {
      // Below the collapse breakpoint the grid is a single column and the
      // claim is meaningless — leave grid-template-columns to CSS.
      if (window.innerWidth <= 900) {
        if (grid.style.gridTemplateColumns) grid.style.gridTemplateColumns = "";
        return;
      }

      const h = hoveredCol.current;
      let moving = false;

      for (let i = 0; i < TOTAL; i++) {
        const s = springs.current[i];
        s.target = h === null ? 1 : i === h ? CLAIM : (TOTAL - CLAIM) / (TOTAL - 1);
        if (reduced) s.set(s.target);
        else s.step(dt);
        if (!s.atRest || s.target !== 1) moving = true;
      }

      if (!moving) {
        // Hand the resting layout back to CSS.
        if (grid.style.gridTemplateColumns) grid.style.gridTemplateColumns = "";
        return;
      }

      grid.style.gridTemplateColumns = springs.current
        .map((s) => `${s.v}fr`)
        .join(" ");
    });

    return stop;
  }, [reduced]);

  return (
    <section className={styles.stage} id="work">
      {/* The same five blobs as the footer, masked to the lower two-thirds so
          the section begins as pure page background. */}
      <Aurora masked />

      <div className={styles.inner}>
        <div className={styles.head}>
          <h2 className={styles.title}>{t(locale, "recentWorks")}</h2>
          <div className={styles.showAllWrap}>
            <Link href={`/${locale}/work`} className={styles.showAll}>
              {t(locale, "showAll")}
              <ArrowRight size={13} height={11} />
            </Link>
            <div className={styles.rule} />
          </div>
        </div>

        <div className={styles.grid} ref={gridRef}>
          {columns.map((col, ci) => (
            <div
              key={ci}
              className={styles.col}
              onPointerEnter={() => { hoveredCol.current = ci; }}
              onPointerLeave={() => { hoveredCol.current = null; }}
            >
              {col.map((p, ri) => (
                <ProjectTile
                  key={p.slug}
                  project={p}
                  locale={locale}
                  meta={String(ci + ri * TOTAL + 1).padStart(2, "0")}
                  className={styles[HEIGHTS[ci][ri]]}
                  active={activeSlug === p.slug}
                  dimmed={activeSlug !== null && activeSlug !== p.slug}
                  onActivate={() => { hoveredCol.current = ci; setActiveSlug(p.slug); }}
                  onDeactivate={() => { hoveredCol.current = null; setActiveSlug(null); }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
