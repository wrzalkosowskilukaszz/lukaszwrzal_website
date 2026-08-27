"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import { ArrowDiagonal } from "@/components/icons/Arrows";
import type { Locale, LocalisedProject } from "@/lib/types";

import styles from "./ProjectTile.module.css";

export interface ProjectTileProps {
  project: LocalisedProject;
  locale: Locale;
  /** Hover/focus is owned by the parent grid, which also drives the springs. */
  active: boolean;
  dimmed: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
  /** Top-left meta. The bento shows the index, the work index shows the year. */
  meta?: string;
  style?: React.CSSProperties;
  className?: string;
}

export function ProjectTile({
  project,
  locale,
  active,
  dimmed,
  onActivate,
  onDeactivate,
  meta,
  style,
  className,
}: ProjectTileProps) {
  const descRef = useRef<HTMLDivElement | null>(null);

  /* Measure the real content height rather than animating to a guess. */
  useEffect(() => {
    const el = descRef.current;
    if (!el) return;
    const inner = el.firstElementChild as HTMLElement | null;
    if (!inner) return;
    el.style.height = active ? `${inner.scrollHeight}px` : "0px";
  }, [active]);

  return (
    <Link
      href={`/${locale}/work/${project.slug}`}
      className={`${styles.tile} ${className ?? ""}`}
      style={style}
      data-active={active || undefined}
      data-dimmed={dimmed || undefined}
      onPointerEnter={onActivate}
      onPointerLeave={onDeactivate}
      onFocus={onActivate}
      onBlur={onDeactivate}
    >
      <div className={styles.media}>
        {/* Empty media wells are a designed state (--lw-tile), not a gap.
            Real images drop in here as content arrives. */}
      </div>

      <div className={styles.scrim} />

      {meta ? (
        <span className={styles.year} aria-hidden="true">
          {meta}
        </span>
      ) : null}

      <span className={styles.disc} aria-hidden="true">
        <ArrowDiagonal />
      </span>

      <div className={styles.label}>
        <span className={styles.name}>{project.copy.title}</span>
        <div className={styles.desc} ref={descRef}>
          <p className={styles.descInner}>{project.copy.desc}</p>
        </div>
      </div>
    </Link>
  );
}
