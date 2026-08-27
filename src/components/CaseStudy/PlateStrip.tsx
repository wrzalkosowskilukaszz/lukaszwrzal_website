"use client";

import { useEffect, useRef } from "react";

import { subscribe } from "@/lib/raf";
import { t } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

import styles from "./PlateStrip.module.css";

export interface PlateStripProps {
  slots: { slot: string; src?: string; caption?: string }[];
  locale: Locale;
  onOpen?: (slot: string) => void;
}

const DRAG_SUPPRESS_CLICK = 6;

export function PlateStrip({ slots, locale, onOpen }: PlateStripProps) {
  const stripRef = useRef<HTMLDivElement | null>(null);
  const thumbRef = useRef<HTMLSpanElement | null>(null);
  const drag = useRef({ active: false, startX: 0, startScroll: 0, moved: 0 });

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;

    // No reduced-motion branch: this reflects the strip's real scroll
    // position rather than animating anything.
    const stop = subscribe(() => {
      const thumb = thumbRef.current;
      if (!thumb) return;
      const ratio = strip.clientWidth / Math.max(1, strip.scrollWidth);
      const maxScroll = strip.scrollWidth - strip.clientWidth;
      const p = maxScroll > 0 ? strip.scrollLeft / maxScroll : 0;
      thumb.style.width = `${ratio * 100}%`;
      thumb.style.left = `${p * (100 - ratio * 100)}%`;
    });

    const onDown = (e: PointerEvent) => {
      drag.current = {
        active: true,
        startX: e.clientX,
        startScroll: strip.scrollLeft,
        moved: 0,
      };
      strip.dataset.dragging = "true";
      strip.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!drag.current.active) return;
      const dx = e.clientX - drag.current.startX;
      drag.current.moved = Math.max(drag.current.moved, Math.abs(dx));
      strip.scrollLeft = drag.current.startScroll - dx;
    };
    const onUp = (e: PointerEvent) => {
      if (!drag.current.active) return;
      drag.current.active = false;
      delete strip.dataset.dragging;
      try { strip.releasePointerCapture(e.pointerId); } catch {}
    };

    strip.addEventListener("pointerdown", onDown);
    strip.addEventListener("pointermove", onMove);
    strip.addEventListener("pointerup", onUp);
    strip.addEventListener("pointercancel", onUp);

    return () => {
      stop();
      strip.removeEventListener("pointerdown", onDown);
      strip.removeEventListener("pointermove", onMove);
      strip.removeEventListener("pointerup", onUp);
      strip.removeEventListener("pointercancel", onUp);
    };
  }, []);

  return (
    <div className={styles.wrap}>
      <div className={styles.strip} ref={stripRef}>
        {slots.map((s) => (
          <div
            key={s.slot}
            className={styles.plate}
            data-slot={s.slot}
            onClick={() => {
              // A drag over 6px must not open the lightbox.
              if (drag.current.moved > DRAG_SUPPRESS_CLICK) return;
              if (s.src) onOpen?.(s.slot);
            }}
          >
            {s.src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={s.src} alt={s.caption ?? ""} loading="lazy" decoding="async" />
            ) : null}
          </div>
        ))}
      </div>

      <div className={styles.rail} aria-hidden="true">
        <span className={styles.thumb} ref={thumbRef} />
      </div>
      <p className={styles.hint}>{t(locale, "drag")}</p>
    </div>
  );
}
