"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import { useReducedMotion } from "@/hooks/useReducedMotion";
import { t } from "@/lib/i18n";
import { subscribe } from "@/lib/raf";
import { Spring, clamp01 } from "@/lib/spring";
import type { Locale } from "@/lib/types";

import styles from "./About.module.css";

export interface AboutPoint {
  title: string;
  body: string;
}

export interface AboutProps {
  locale: Locale;
  points: AboutPoint[];
}

const MOBILE = 900;

export function About({ locale, points }: AboutProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const portraitRef = useRef<HTMLImageElement | null>(null);
  const bodyRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pointRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const springs = useRef<Spring[]>([]);
  const reduced = useReducedMotion();

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    if (springs.current.length !== points.length) {
      springs.current = points.map((_, i) => new Spring(i === 0 ? 1 : 0, 150, 24));
    }

    const stop = subscribe((dt) => {
      const narrow = window.innerWidth <= MOBILE;

      if (narrow) {
        // Pattern abandoned, not stacked: everything open, tracking inert.
        for (let i = 0; i < points.length; i++) {
          const b = bodyRefs.current[i];
          const p = pointRefs.current[i];
          const d = dotRefs.current[i];
          if (b) b.style.height = "";
          if (p) p.style.opacity = "";
          if (d) d.style.transform = "";
        }
        if (portraitRef.current) portraitRef.current.style.transform = "";
        return;
      }

      const rect = track.getBoundingClientRect();
      const vh = window.innerHeight;
      if (rect.bottom < -200 || rect.top > vh + 200) return;

      // Progress through the track, 0..1.
      const p = clamp01(-rect.top / (rect.height - vh));
      const active = Math.min(points.length - 1, Math.floor(p * points.length * 0.999));

      if (portraitRef.current && !reduced) {
        portraitRef.current.style.transform =
          `translate3d(0, ${-p * 22}px, 0) scale(${1 + p * 0.04})`;
      }

      for (let i = 0; i < points.length; i++) {
        const s = springs.current[i];
        s.target = i === active ? 1 : 0;
        if (reduced) s.set(s.target);
        else s.step(dt);

        const el = pointRefs.current[i];
        if (el) el.style.opacity = String(0.4 + s.v * 0.6);

        const dot = dotRefs.current[i];
        if (dot) dot.style.transform = `scale(${0.7 + s.v * 0.9})`;

        const wrap = bodyRefs.current[i];
        const inner = wrap?.firstElementChild as HTMLElement | null;
        if (wrap && inner) wrap.style.height = `${inner.scrollHeight * s.v}px`;
      }
    });

    return stop;
  }, [points, reduced]);

  return (
    <section className={styles.track} ref={trackRef} id="about">
      <div className={styles.pane}>
        <div className={styles.inner}>
          <div className={styles.portraitWrap}>
            <Image
              ref={portraitRef}
              className={styles.portrait}
              src="/brand/portrait.jpg"
              alt="Lukasz Wrzal"
              fill
              sizes="(max-width: 900px) 100vw, 46vw"
            />
          </div>

          <div className={styles.copy}>
            <p className="lw-eyebrow">{t(locale, "aboutEyebrow")}</p>
            <h2 className={styles.title}>{t(locale, "aboutTitle")}</h2>
            <p className={styles.intro}>{t(locale, "aboutIntro")}</p>

            {points.map((pt, i) => (
              <div
                key={pt.title}
                className={styles.point}
                ref={(el) => { pointRefs.current[i] = el; }}
              >
                <div className={styles.pointHead}>
                  <span
                    className={styles.dot}
                    ref={(el) => { dotRefs.current[i] = el; }}
                    aria-hidden="true"
                  />
                  <h3 className={styles.pointTitle}>{pt.title}</h3>
                </div>
                <div
                  className={styles.pointBodyWrap}
                  ref={(el) => { bodyRefs.current[i] = el; }}
                >
                  <p className={styles.pointBody}>{pt.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
