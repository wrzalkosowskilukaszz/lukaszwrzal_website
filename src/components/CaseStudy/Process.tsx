"use client";

import { useEffect, useRef, useState } from "react";

import { Aurora } from "@/components/Aurora/Aurora";
import { subscribe } from "@/lib/raf";
import { t } from "@/lib/i18n";
import type { Locale, ProcessStep } from "@/lib/types";

import styles from "./Process.module.css";

const PIN_MIN = 1000;

export interface ProcessProps {
  steps: ProcessStep[];
  locale: Locale;
  /** Figure sources for slots 04..07, empty until content lands. */
  figures: (string | undefined)[];
}

export function Process({ steps, locale, figures }: ProcessProps) {
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const [pinned, setPinned] = useState(true);

  useEffect(() => {
    // No reduced-motion branch here: this only derives the active step from
    // scroll. The wipe itself is a CSS transition, disabled in the module's
    // prefers-reduced-motion block, so the layer swap becomes instant.
    const stop = subscribe(() => {
      const wide = window.innerWidth >= PIN_MIN;
      if (wide !== pinned) setPinned(wide);

      // Below the breakpoint the step tracking goes inert.
      if (!wide) return;

      const middle = window.innerHeight / 2 + 60;
      let next = 0;
      for (let i = 0; i < steps.length; i++) {
        const el = stepRefs.current[i];
        if (el && el.getBoundingClientRect().top <= middle) next = i;
      }
      if (next !== activeRef.current) {
        activeRef.current = next;
        setActive(next);
      }
    });
    return stop;
  }, [steps.length, pinned]);

  /* Layers WIPE vertically rather than fade — the effect is one surface
     changing, not four images swapping. */
  const clipFor = (i: number) =>
    i === active
      ? "inset(0 0 0 0)"
      : i < active
        ? "inset(0 0 100% 0)"
        : "inset(100% 0 0 0)";

  return (
    <section className={styles.stage} id="process">
      <Aurora />

      <div className={styles.inner}>
        <div className={styles.left}>
          <div className={styles.frameWrap}>
            <div className={styles.frame}>
              {steps.map((s, i) => (
                <div
                  key={s.n}
                  className={styles.layer}
                  data-slot={String(i + 4).padStart(2, "0")}
                  style={{
                    clipPath: clipFor(i),
                    zIndex: i === active ? 2 : i === active - 1 ? 1 : 0,
                  }}
                  aria-hidden="true"
                >
                  {figures[i] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={figures[i]} alt="" loading="lazy" decoding="async" />
                  ) : null}
                </div>
              ))}

              <div className={styles.dots} aria-hidden="true">
                {steps.map((s, i) => (
                  <span key={s.n} className={styles.dot} data-active={i === active} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.right}>
          <p className="lw-eyebrow">{t(locale, "sectionProcess")}</p>

          {steps.map((s, i) => (
            <div
              key={s.n}
              className={styles.step}
              ref={(el) => { stepRefs.current[i] = el; }}
              data-active={i === active}
            >
              <span className={styles.stepN}>{s.n}</span>
              <h3 className={styles.stepTitle}>{s.title}</h3>
              <p className={styles.stepBody}>{s.body}</p>

              {/* Below 1000px each figure relocates inline beneath its step. */}
              <div className={styles.inlineFig}>
                {figures[i] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={figures[i]} alt="" loading="lazy" decoding="async" />
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
