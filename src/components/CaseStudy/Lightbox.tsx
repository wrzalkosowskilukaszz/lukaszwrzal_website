"use client";

import { useCallback, useEffect, useRef } from "react";

import { ArrowRight } from "@/components/icons/Arrows";
import { t } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

import styles from "./Lightbox.module.css";

export interface LightboxItem {
  slot: string;
  src: string;
  caption?: string;
  alt?: string;
}

export interface LightboxProps {
  items: LightboxItem[];
  index: number;
  locale: Locale;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function Lightbox({ items, index, locale, onClose, onNavigate }: LightboxProps) {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const restoreTo = useRef<HTMLElement | null>(null);

  const current = items[index];

  const go = useCallback(
    (delta: number) => {
      const next = (index + delta + items.length) % items.length;
      onNavigate(next);
    },
    [index, items.length, onNavigate],
  );

  /* Focus trap + body scroll lock. The prototype wired only esc and arrows. */
  useEffect(() => {
    restoreTo.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "ArrowRight") { e.preventDefault(); go(1); return; }
      if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); return; }
      if (e.key !== "Tab") return;

      const focusables = overlayRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      restoreTo.current?.focus?.();
    };
  }, [go, onClose]);

  if (!current) return null;

  return (
    <div
      ref={overlayRef}
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={current.caption ?? current.alt ?? current.slot}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <button ref={closeRef} type="button" className={styles.close} onClick={onClose}>
        {t(locale, "closeEsc")}
      </button>

      <div className={styles.stage} onClick={onClose}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={current.slot}
          className={styles.image}
          src={current.src}
          alt={current.alt ?? current.caption ?? ""}
        />
      </div>

      <div className={styles.bar}>
        <p className={styles.caption}>{current.caption}</p>

        <div className={styles.controls}>
          <span className={styles.counter}>
            {String(index + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
          </span>
          <button
            type="button"
            className={styles.ghost}
            onClick={() => go(-1)}
            aria-label={t(locale, "previousImage")}
          >
            <span style={{ transform: "rotate(180deg)", display: "inline-flex" }}>
              <ArrowRight />
            </span>
          </button>
          <button
            type="button"
            className={styles.ghost}
            onClick={() => go(1)}
            aria-label={t(locale, "nextImage")}
          >
            <ArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
}
