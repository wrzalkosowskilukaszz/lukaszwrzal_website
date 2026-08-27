"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { ArrowRight } from "@/components/icons/Arrows";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { t } from "@/lib/i18n";
import { subscribe } from "@/lib/raf";
import { Spring, clamp01 } from "@/lib/spring";
import type { Locale, LocalisedProject } from "@/lib/types";

import styles from "./HeroReel.module.css";

export interface HeroReelProps {
  projects: LocalisedProject[];
  locale: Locale;
}

export function HeroReel({ projects, locale }: HeroReelProps) {
  const count = projects.length;
  const trackRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const planeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mediaRefs = useRef<(HTMLDivElement | null)[]>([]);
  const fillRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const planeSprings = useRef<Spring[]>([]);
  const ptr = useRef({ x: new Spring(0, 60, 14), y: new Spring(0, 60, 14) });
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    const track = trackRef.current;
    const frame = frameRef.current;
    if (!track || !frame) return;

    if (planeSprings.current.length !== count) {
      planeSprings.current = Array.from(
        { length: count },
        (_, i) => new Spring(i === 0 ? 0 : 1, 120, 22),
      );
    }

    let tx = 0, ty = 0;

    const onMove = (e: PointerEvent) => {
      const r = frame.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width) * 2 - 1;
      ty = ((e.clientY - r.top) / r.height) * 2 - 1;
    };
    const onLeave = () => { tx = 0; ty = 0; };

    frame.addEventListener("pointermove", onMove, { passive: true });
    frame.addEventListener("pointerleave", onLeave, { passive: true });

    const stop = subscribe((dt) => {
      const rect = track.getBoundingClientRect();
      const vh = window.innerHeight;
      if (rect.bottom < -300 || rect.top > vh + 300) return;

      /* Scroll distance maps to slides. No wheel interception, ever. */
      const p = clamp01(-rect.top / Math.max(1, rect.height - vh));
      const next = Math.min(count - 1, Math.floor(p * count * 0.999));
      if (next !== activeRef.current) {
        activeRef.current = next;
        setActive(next);
      }

      ptr.current.x.target = reduced ? 0 : tx;
      ptr.current.y.target = reduced ? 0 : ty;
      const px = reduced ? 0 : ptr.current.x.step(dt);
      const py = reduced ? 0 : ptr.current.y.step(dt);

      for (let i = 0; i < count; i++) {
        const s = planeSprings.current[i];
        s.target = i === activeRef.current ? 0 : 1;
        if (reduced) s.set(s.target);
        else s.step(dt);

        const plane = planeRefs.current[i];
        const media = mediaRefs.current[i];
        if (!plane || !media) continue;

        const v = s.v;
        /* Outgoing wipes upward; incoming arrives from below. Not a fade. */
        plane.style.clipPath = `inset(${v * 100}% 0 0 0)`;
        plane.style.opacity = String(1 - v * 0.25);
        plane.style.zIndex = String(i === activeRef.current ? 4 : 3 - Math.abs(i - activeRef.current));

        const drift = (1 - v) * 0.5;
        media.style.transform =
          `translate3d(${px * 14 * drift}px, ${py * 10 * drift - v * 26}px, 0) ` +
          `scale(${1.02 + (1 - v) * 0.03})`;
      }

      /* Progress segments show the live position within the track. */
      for (let i = 0; i < count; i++) {
        const fill = fillRefs.current[i];
        if (!fill) continue;
        const seg = clamp01(p * count - i);
        fill.style.width = `${seg * 100}%`;
      }
    });

    return () => {
      stop();
      frame.removeEventListener("pointermove", onMove);
      frame.removeEventListener("pointerleave", onLeave);
    };
  }, [count, reduced]);

  const current = projects[active];

  return (
    <section
      className={styles.track}
      ref={trackRef}
      style={{ height: `${count * 80 + 100}vh` }}
      aria-roledescription="carousel"
      aria-label={t(locale, "recentWorks")}
    >
      <div className={styles.sticky}>
        <div className={styles.frame} ref={frameRef}>
          {projects.map((p, i) => (
            <div
              key={p.slug}
              className={styles.plane}
              ref={(el) => { planeRefs.current[i] = el; }}
              aria-hidden={i !== active}
            >
              <div className={styles.media} ref={(el) => { mediaRefs.current[i] = el; }}>
                {/* Hero reel motion files pending — 1600x900, 4–8s seamless
                    loop, MP4/WebM. Until they land this is the designed
                    empty well. */}
              </div>
            </div>
          ))}

          <div className={styles.bar}>
            <div className={styles.segments}>
              {projects.map((p, i) => (
                <button
                  key={p.slug}
                  type="button"
                  className={styles.segment}
                  aria-label={p.copy.title}
                  aria-current={i === active ? "true" : undefined}
                  onClick={() => {
                    const track = trackRef.current;
                    if (!track) return;
                    const per = (track.offsetHeight - window.innerHeight) / count;
                    window.scrollTo({
                      top: track.offsetTop + per * (i + 0.5),
                      behavior: reduced ? "auto" : "smooth",
                    });
                  }}
                >
                  <span
                    className={styles.segmentFill}
                    ref={(el) => { fillRefs.current[i] = el; }}
                  />
                </button>
              ))}
            </div>

            <span className={styles.titleWrap}>
              <span className={styles.title} key={current?.slug}>
                {current?.copy.title} — {current?.copy.desc}
              </span>
            </span>

            <Link href={`/${locale}/work/${current?.slug}`} className={styles.cta}>
              {t(locale, "navWork")}
              <span className={styles.ctaDisc} aria-hidden="true">
                <ArrowRight />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
