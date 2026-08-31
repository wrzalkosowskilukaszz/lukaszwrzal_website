"use client";

import { useMemo, useState } from "react";

import { ProjectTile } from "@/components/ProjectTile/ProjectTile";
import type { Category, Locale, ProjectCard } from "@/lib/types";

import styles from "./WorkGrid.module.css";

export interface WorkGridProps {
  projects: ProjectCard[];
  locale: Locale;
  filter: Category | "all";
}

/**
 * The grid view. Tiles are STATIC — the width-claim spring was tried here
 * and rejected: reflowing neighbours under the pointer read as restless,
 * and the mid-stretch rewrap clipped two-line descriptions. The hover
 * story is the tile's own reveal (scrim deepens, year and arrow surface,
 * the description unfolds inside) — the same language as the homepage
 * bento, with neighbours desaturating to hand the hovered tile the room.
 *
 * Filtering remounts the grid, so the surviving tiles re-enter with the
 * shared stagger — the one entrance the index rows use too.
 */
export function WorkGrid({ projects, locale, filter }: WorkGridProps) {
  const [hover, setHover] = useState<number | null>(null);

  const visible = useMemo(
    () => projects.map((p) => filter === "all" || p.cat === filter),
    [projects, filter],
  );

  /* Stagger by position among the VISIBLE tiles, so a filtered set starts
     from the front rather than inheriting gaps from hidden neighbours. */
  const order = useMemo(() => {
    let n = 0;
    return projects.map((_, i) => (visible[i] ? n++ : 0));
  }, [projects, visible]);

  const activeIndex = hover !== null && visible[hover] ? hover : null;

  return (
    <div className={styles.grid} key={filter}>
      {projects.map((p, i) =>
        visible[i] ? (
          <div
            key={p.slug}
            className={styles.card}
            style={{ ["--i" as string]: order[i] }}
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
        ) : null,
      )}
    </div>
  );
}
