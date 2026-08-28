"use client";

import { useEffect, useRef, useState } from "react";

import { Aurora } from "@/components/Aurora/Aurora";
import { subscribe } from "@/lib/raf";

import s from "./blocks.module.css";
import p from "./process.module.css";
import { mediaUrl, tx, type BlockContext } from "./shared";
import type { ProcessBlock as ProcessData } from "./types";

const PIN_MIN = 1000;

/**
 * The pinned wipe, now taking any number of steps rather than exactly four.
 *
 * Two traps preserved from the original: no overflow:hidden on the stage
 * (it would become the sticky scrollport and the frame would stop sticking),
 * and below 1000px the pattern is abandoned rather than stacked.
 */
export function Process({ block, ctx }: { block: ProcessData; ctx: BlockContext }) {
  const steps = block.steps ?? [];
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);

  const pinned = (block.variant ?? "pinned") === "pinned";

  useEffect(() => {
    if (!pinned) return;
    return subscribe(() => {
      if (window.innerWidth < PIN_MIN) return;
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
  }, [steps.length, pinned]);

  const clipFor = (i: number) =>
    i === active ? "inset(0 0 0 0)" : i < active ? "inset(0 0 100% 0)" : "inset(100% 0 0 0)";

  return (
    <section className={`${s.stage} ${p.stage}`}>
      <Aurora />
      <div className={p.inner}>
        {pinned ? (
          <div className={p.left}>
            <div className={p.frameWrap}>
              <div className={p.frame}>
                {steps.map((step, i) => (
                  <div
                    key={i}
                    className={p.layer}
                    style={{ clipPath: clipFor(i), zIndex: i === active ? 2 : i === active - 1 ? 1 : 0 }}
                    aria-hidden="true"
                  >
                    {step.src ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={mediaUrl(ctx.slug, step.src)} alt="" loading="lazy" decoding="async" />
                    ) : null}
                  </div>
                ))}
                <div className={p.dots} aria-hidden="true">
                  {steps.map((_, i) => (
                    <span key={i} className={p.dot} data-active={i === active} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <div className={p.right}>
          {block.eyebrow ? <p className={s.eyebrow}>{tx(block.eyebrow, ctx.locale)}</p> : null}
          {steps.map((step, i) => (
            <div
              key={i}
              className={p.step}
              ref={(el) => { stepRefs.current[i] = el; }}
              data-active={!pinned || i === active}
            >
              <span className={p.stepN}>{step.n ?? String(i + 1).padStart(2, "0")}</span>
              <h3 className={p.stepTitle}>{tx(step.title, ctx.locale)}</h3>
              <p className={p.stepBody}>{tx(step.body, ctx.locale)}</p>
              {step.src ? (
                <div className={p.inlineFig}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={mediaUrl(ctx.slug, step.src)} alt="" loading="lazy" decoding="async" />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
