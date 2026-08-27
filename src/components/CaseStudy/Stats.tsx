"use client";

import { useEffect, useRef } from "react";

import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { Locale, Stat } from "@/lib/types";

import styles from "./Stats.module.css";

const DURATION = 1100;

/** Counts from 0 on first view. cubic ease-out, tabular numerals. */
export function Stats({ stats, locale }: { stats: Stat[]; locale: Locale }) {
  const rowRef = useRef<HTMLDivElement | null>(null);
  const valueRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const reduced = useReducedMotion();

  const format = (n: number) =>
    n.toLocaleString(locale === "pl" ? "pl-PL" : "en-US");

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;

    const paint = (progress: number) => {
      stats.forEach((s, i) => {
        const el = valueRefs.current[i];
        if (!el) return;
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = `${format(Math.round(s.value * eased))}${s.suffix ?? ""}`;
      });
    };

    if (reduced) {
      paint(1);
      return;
    }

    let raf = 0;
    let start = 0;
    const run = (now: number) => {
      if (!start) start = now;
      const p = Math.min(1, (now - start) / DURATION);
      paint(p);
      if (p < 1) raf = requestAnimationFrame(run);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            raf = requestAnimationFrame(run);
            io.disconnect();
          }
        }
      },
      { threshold: 0.3 },
    );
    io.observe(row);

    // Safety: if the observer never fires, show the real numbers anyway.
    const safety = window.setTimeout(() => paint(1), 2400);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.clearTimeout(safety);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats, reduced, locale]);

  return (
    <div className={styles.row} ref={rowRef}>
      {stats.map((s, i) => (
        <div key={s.label}>
          {/* Server-rendered with the real value, so it is correct with no JS. */}
          <span
            className={styles.value}
            ref={(el) => { valueRefs.current[i] = el; }}
          >
            {format(s.value)}
            {s.suffix ?? ""}
          </span>
          <p className={styles.label}>{s.label}</p>
        </div>
      ))}
    </div>
  );
}
