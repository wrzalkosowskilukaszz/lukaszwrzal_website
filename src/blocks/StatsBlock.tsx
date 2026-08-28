"use client";

import { useEffect, useRef } from "react";

import { useReducedMotion } from "@/hooks/useReducedMotion";

import s from "./blocks.module.css";
import st from "./stats.module.css";
import { tx, type BlockContext } from "./shared";
import type { StatsBlock as StatsData } from "./types";

const DURATION = 1100;

/** Count-ups. Any number of them, not exactly four. */
export function Stats({ block, ctx }: { block: StatsData; ctx: BlockContext }) {
  const rowRef = useRef<HTMLDivElement | null>(null);
  const valueRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const reduced = useReducedMotion();
  const items = block.items ?? [];

  const format = (n: number) =>
    n.toLocaleString(ctx.locale === "pl" ? "pl-PL" : "en-US");

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;

    const paint = (progress: number) => {
      items.forEach((item, i) => {
        const el = valueRefs.current[i];
        if (!el) return;
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = `${format(Math.round(item.value * eased))}${item.suffix ?? ""}`;
      });
    };

    if (reduced) { paint(1); return; }

    let raf = 0;
    let start = 0;
    const run = (now: number) => {
      if (!start) start = now;
      const p = Math.min(1, (now - start) / DURATION);
      paint(p);
      if (p < 1) raf = requestAnimationFrame(run);
    };

    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { raf = requestAnimationFrame(run); io.disconnect(); }
    }, { threshold: 0.3 });
    io.observe(row);

    const safety = window.setTimeout(() => paint(1), 2400);
    return () => { io.disconnect(); cancelAnimationFrame(raf); window.clearTimeout(safety); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, reduced, ctx.locale]);

  return (
    <section className={s.read}>
      {block.eyebrow ? <p className={s.eyebrow}>{tx(block.eyebrow, ctx.locale)}</p> : null}
      <div className={st.row} ref={rowRef}>
        {items.map((item, i) => (
          <div key={i}>
            {/* Server-rendered with the real number, so it is correct with no JS. */}
            <span className={st.value} ref={(el) => { valueRefs.current[i] = el; }}>
              {format(item.value)}{item.suffix ?? ""}
            </span>
            <p className={st.label}>{tx(item.label, ctx.locale)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
