"use client";

import { useEffect, useRef } from "react";

import { useReducedMotion } from "@/hooks/useReducedMotion";
import { subscribe } from "@/lib/raf";

import styles from "./Figure.module.css";

export interface FigureProps {
  /** Slot id, "01".."12". */
  slot: string;
  /** Terse label printed under the image. */
  captionShort?: string;
  /** Long caption — lightbox only. */
  src?: string;
  alt?: string;
  height?: string;
  /** 64px stage radius rather than the 22px tile radius. */
  stage?: boolean;
  /** 0–0.3. */
  parallax?: number;
  onOpen?: () => void;
  expandLabel?: string;
}

export function Figure({
  slot,
  captionShort,
  src,
  alt,
  height,
  stage = false,
  parallax = 0.1,
  onOpen,
  expandLabel,
}: FigureProps) {
  const figRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const fig = figRef.current;
    const inner = innerRef.current;
    if (!fig || !inner || reduced || parallax <= 0) return;

    const stop = subscribe(() => {
      const rect = fig.getBoundingClientRect();
      const vh = window.innerHeight;
      if (rect.bottom < -200 || rect.top > vh + 200) return;

      const c = (rect.top + rect.height / 2 - vh / 2) / vh;
      inner.style.transform = `translate3d(0, ${c * rect.height * parallax * -1}px, 0)`;
    });

    return stop;
  }, [parallax, reduced]);

  /* Empty placeholders stay inert — only a real image opens the lightbox. */
  const zoomable = Boolean(src && onOpen);

  return (
    <figure style={{ margin: 0 }}>
      <div
        ref={figRef}
        className={`${styles.figure} ${stage ? styles.stage : ""} ${zoomable ? styles.zoomable : ""}`}
        style={{ height }}
        data-slot={slot}
        onClick={zoomable ? onOpen : undefined}
        onKeyDown={
          zoomable
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onOpen?.();
                }
              }
            : undefined
        }
        role={zoomable ? "button" : undefined}
        tabIndex={zoomable ? 0 : undefined}
        aria-label={zoomable ? `${expandLabel}: ${alt ?? captionShort ?? slot}` : undefined}
      >
        <div className={styles.inner} ref={innerRef}>
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt={alt ?? ""} loading="lazy" decoding="async" />
          ) : null}
        </div>

        {zoomable && expandLabel ? (
          <span className={styles.expand} aria-hidden="true">
            {expandLabel}
          </span>
        ) : null}
      </div>

      {captionShort ? (
        <figcaption className={styles.caption}>{captionShort}</figcaption>
      ) : null}
    </figure>
  );
}
