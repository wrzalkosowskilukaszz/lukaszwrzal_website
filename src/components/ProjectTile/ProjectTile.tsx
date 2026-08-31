"use client";

import { useEffect, useRef } from "react";

import { useReducedMotion } from "@/hooks/useReducedMotion";

import { TransitionLink } from "@/components/TransitionLink";

import { CategoryTag } from "@/components/Category/Category";
import { ArrowDiagonal } from "@/components/icons/Arrows";
import type { Locale, ProjectCard } from "@/lib/types";

import styles from "./ProjectTile.module.css";

export interface ProjectTileProps {
  project: ProjectCard;
  locale: Locale;
  active: boolean;
  dimmed: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
  /** Show the descriptor at rest rather than only on hover. */
  showDesc?: boolean;
  /** Show the headline outcome — the thing that earns the click. */
  showStat?: boolean;
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
  showDesc = false,
  showStat = false,
  meta,
  style,
  className,
}: ProjectTileProps) {
  const descRef = useRef<HTMLDivElement | null>(null);
  const mediaRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const reduced = useReducedMotion();

  /* The hover video plays only while the tile has attention, and fetches
     only on first play (preload=none) — a still tile costs zero bytes. */
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (active && !reduced) void v.play().catch(() => {});
    else v.pause();
  }, [active, reduced]);

  /* Only the hover-reveal variant animates height; when the descriptor is
     always shown there is nothing to measure. */
  useEffect(() => {
    if (showDesc) return;
    const el = descRef.current;
    const inner = el?.firstElementChild as HTMLElement | null;
    if (!el || !inner) return;
    el.style.height = active ? `${inner.scrollHeight}px` : "0px";
  }, [active, showDesc]);

  const { image, stat, video } = project;

  return (
    <TransitionLink
      href={`/${locale}/work/${project.slug}`}
      morphName="project-media"
      getMorphEl={() => mediaRef.current}
      prefetch
      className={`${styles.tile} ${className ?? ""}`}
      style={style}
      data-active={active || undefined}
      data-empty={!image || undefined}
      data-dimmed={dimmed || undefined}
      onPointerEnter={onActivate}
      onPointerLeave={onDeactivate}
      onFocus={onActivate}
      onBlur={onDeactivate}
    >
      <div className={styles.media} ref={mediaRef}>
        {video ? (
          <video
            ref={videoRef}
            src={video}
            poster={image}
            muted
            loop
            playsInline
            preload="none"
          />
        ) : image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" loading="lazy" decoding="async" />
        ) : null}
      </div>

      <div className={styles.scrim} />

      {meta ? (
        <span className={styles.year} aria-hidden="true">{meta}</span>
      ) : null}

      <span className={styles.disc} aria-hidden="true">
        <ArrowDiagonal />
      </span>

      <div className={styles.label}>
        <CategoryTag cat={project.cat} locale={locale} onMedia />
        <span className={`${styles.name} tileName`}>{project.title}</span>

        {showDesc ? (
          <p className={styles.descStatic}>{project.desc}</p>
        ) : (
          <div className={styles.desc} ref={descRef}>
            <p className={styles.descInner}>{project.desc}</p>
          </div>
        )}

        {showStat && stat ? (
          <p className={styles.stat}>
            <b>
              {stat.value.toLocaleString(locale === "pl" ? "pl-PL" : "en-US")}
              {stat.suffix ?? ""}
            </b>
            <span>{stat.label}</span>
          </p>
        ) : null}
      </div>
    </TransitionLink>
  );
}
