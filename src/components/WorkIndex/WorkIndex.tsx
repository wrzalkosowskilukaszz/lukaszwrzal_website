"use client";

import { useEffect, useRef, useState } from "react";

import { TransitionLink } from "@/components/TransitionLink";

import { CategoryTag } from "@/components/Category/Category";
import { ArrowDiagonal } from "@/components/icons/Arrows";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { subscribe } from "@/lib/raf";
import { Spring, clamp } from "@/lib/spring";
import type { Locale, ProjectCard } from "@/lib/types";

import styles from "./WorkIndex.module.css";

/** Below this width there is no pointer to speak of; scroll drives instead. */
const TOUCH_MAX = 900;

export interface WorkIndexProps {
  projects: ProjectCard[];
  locale: Locale;
}

/**
 * The index. Rows stay slim; on a real pointer the hovered project's image
 * floats WITH the cursor — carried on springs, tilting with its own
 * momentum, wiping to the next image as the pointer crosses rows. On touch
 * (and under reduced motion) the image reveals inline instead: the same
 * information, the pointing device the reader actually has.
 */
export function WorkIndex({ projects, locale }: WorkIndexProps) {
  const listRef = useRef<HTMLDivElement | null>(null);
  const revealRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mediaRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rowRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const springs = useRef<Spring[]>([]);
  const hovered = useRef<number | null>(null);
  const openRef = useRef<number | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const reduced = useReducedMotion();

  /* ── The floating ghost ──────────────────────────────────────────── */
  const ghostRef = useRef<HTMLDivElement | null>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const metaRef = useRef<HTMLSpanElement | null>(null);
  const gx = useRef(new Spring(0, 170, 26));
  const gy = useRef(new Spring(0, 170, 26));
  const gs = useRef(new Spring(0, 150, 20)); // presence: scale + opacity
  const ptr = useRef({ x: 0, y: 0, has: false });
  const activeGhost = useRef<number | null>(null);
  const settleTimer = useRef<number | null>(null);

  /* Swap the visible layer with a directional wipe: moving down the list
     wipes the incoming image in from the top, moving up from the bottom. */
  const showLayer = (next: number | null) => {
    const prev = activeGhost.current;
    if (next === prev) return;
    activeGhost.current = next;

    if (metaRef.current) {
      const p = next !== null ? projects[next] : null;
      metaRef.current.textContent = p?.stat
        ? `${p.stat.value.toLocaleString(locale === "pl" ? "pl-PL" : "en-US")}${p.stat.suffix ?? ""} · ${p.stat.label}`
        : "";
    }
    if (next === null) return;

    const goingDown = prev === null || next > prev;
    const from = goingDown ? "inset(0 0 100% 0)" : "inset(100% 0 0 0)";

    for (let i = 0; i < projects.length; i++) {
      const el = layerRefs.current[i];
      if (!el) continue;
      if (i === next) {
        el.style.zIndex = "2";
        el.style.visibility = "visible";
        /* Start clipped without transition, reflow, then wipe open. */
        el.style.transition = "none";
        el.style.clipPath = prev === null ? "none" : from;
        void el.offsetWidth;
        el.style.transition = "clip-path 380ms var(--lw-ease-out)";
        el.style.clipPath = "none";
      } else {
        el.style.zIndex = "1";
      }
    }
    /* Once the wipe lands, drop everything beneath from painting. */
    if (settleTimer.current) window.clearTimeout(settleTimer.current);
    settleTimer.current = window.setTimeout(() => {
      for (let i = 0; i < projects.length; i++) {
        const el = layerRefs.current[i];
        if (el && i !== activeGhost.current) el.style.visibility = "hidden";
      }
    }, 420);
  };

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    if (springs.current.length !== projects.length) {
      springs.current = projects.map(() => new Spring(0, 150, 24));
    }

    const finePointer = window.matchMedia("(pointer: fine)");

    const onMove = (e: PointerEvent) => {
      ptr.current.x = e.clientX;
      ptr.current.y = e.clientY;
      ptr.current.has = true;
    };
    list.addEventListener("pointermove", onMove, { passive: true });

    const stop = subscribe((dt) => {
      const touch = window.innerWidth <= TOUCH_MAX;
      const ghostMode = !touch && !reduced && finePointer.matches;

      /* Which row has the reader's attention?
         Pointer on desktop; on touch, whichever row straddles the focal
         line — the same idea, a different pointing device. */
      let target: number | null = hovered.current;

      if (touch) {
        const focal = window.innerHeight * 0.42;
        let best: number | null = null;
        let bestDist = Infinity;
        for (let i = 0; i < projects.length; i++) {
          const el = rowRefs.current[i];
          if (!el) continue;
          const r = el.getBoundingClientRect();
          if (r.bottom < 0 || r.top > window.innerHeight) continue;
          const dist = Math.abs(r.top + 28 - focal);
          if (dist < bestDist) { bestDist = dist; best = i; }
        }
        target = best;
      }

      if (target !== openRef.current) {
        openRef.current = target;
        setOpen(target);
      }

      /* Inline reveal — the touch/reduced-motion presentation. In ghost
         mode every reveal stays shut and the ghost carries the image. */
      for (let i = 0; i < projects.length; i++) {
        const s = springs.current[i];
        const el = revealRefs.current[i];
        if (!s || !el) continue;

        s.target = !ghostMode && i === target ? 1 : 0;
        if (reduced) s.set(s.target);
        else s.step(dt);

        const inner = el.firstElementChild as HTMLElement | null;
        if (!inner) continue;

        if (s.atRest && s.target === 0) {
          if (el.style.height !== "0px") el.style.height = "0px";
        } else {
          el.style.height = `${inner.offsetHeight * s.v}px`;
        }
      }

      /* The ghost itself. */
      const ghost = ghostRef.current;
      if (!ghost) return;

      const wantGhost = ghostMode && target !== null && ptr.current.has;
      if (wantGhost && target !== activeGhost.current) showLayer(target);
      if (!wantGhost && activeGhost.current !== null && gs.current.v < 0.02) {
        showLayer(null);
      }

      /* First appearance snaps to the cursor so the ghost never flies in
         from a stale corner; afterwards the springs carry it. */
      if (wantGhost && gs.current.v < 0.02 && gs.current.target === 0) {
        gx.current.set(ptr.current.x);
        gy.current.set(ptr.current.y);
      }

      gx.current.target = ptr.current.x;
      gy.current.target = ptr.current.y;
      gs.current.target = wantGhost ? 1 : 0;
      gx.current.step(dt);
      gy.current.step(dt);
      gs.current.step(dt);

      const p = gs.current.v;
      if (p < 0.01 && gs.current.target === 0) {
        if (ghost.style.opacity !== "0") ghost.style.opacity = "0";
        return;
      }

      const w = ghost.offsetWidth;
      const h = ghost.offsetHeight;
      /* Momentum tilt: the image leans into its own horizontal travel. */
      const tilt = clamp(gx.current.vel * 0.008, -6, 6);
      ghost.style.opacity = String(Math.min(1, p));
      ghost.style.transform =
        `translate3d(${gx.current.v - w / 2}px, ${gy.current.v - h / 2}px, 0) ` +
        `rotate(${tilt}deg) scale(${0.86 + p * 0.14})`;
    });

    return () => {
      stop();
      list.removeEventListener("pointermove", onMove);
      if (settleTimer.current) window.clearTimeout(settleTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects, reduced]);

  /* In ghost mode the morph into the case study starts from the ghost —
     the image the reader is actually looking at. */
  const morphSource = (i: number) => {
    const ghostVisible =
      activeGhost.current === i && gs.current.v > 0.5 && ghostRef.current;
    return ghostVisible ? layerRefs.current[i] : mediaRefs.current[i];
  };

  return (
    <div className={styles.list} ref={listRef}>
      {projects.map((p, i) => (
        <TransitionLink
          key={p.slug}
          href={`/${locale}/work/${p.slug}`}
          morphName="project-media"
          getMorphEl={() => morphSource(i)}
          prefetch={false}
          className={styles.row}
          ref={(el) => { rowRefs.current[i] = el; }}
          data-open={open === i || undefined}
          onPointerEnter={() => {
            if (window.innerWidth > TOUCH_MAX) hovered.current = i;
          }}
          onPointerLeave={() => {
            if (window.innerWidth > TOUCH_MAX) hovered.current = null;
          }}
          onFocus={() => { hovered.current = i; }}
          onBlur={() => { hovered.current = null; }}
        >
          <div className={styles.line}>
            <span className={styles.n}>{String(i + 1).padStart(2, "0")}</span>
            <span className={styles.name}>{p.title}</span>
            <span className={styles.desc}>{p.desc}</span>
            <span className={styles.catCell}>
              <CategoryTag cat={p.cat} locale={locale} />
            </span>
            <span className={styles.year}>{p.year}</span>
            <span className={styles.arrow} aria-hidden="true">
              <ArrowDiagonal size={14} />
            </span>
          </div>

          <div className={styles.reveal} ref={(el) => { revealRefs.current[i] = el; }}>
            <div>
              <div className={styles.media} ref={(el) => { mediaRefs.current[i] = el; }}>
                {p.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image} alt="" loading="lazy" decoding="async" />
                ) : null}
                <span className={styles.mediaMeta}>
                  {p.stat ? (
                    <span className={styles.stat}>
                      {p.stat.value.toLocaleString(locale === "pl" ? "pl-PL" : "en-US")}
                      {p.stat.suffix ?? ""} · {p.stat.label}
                    </span>
                  ) : null}
                </span>
              </div>
            </div>
          </div>
        </TransitionLink>
      ))}

      {/* The cursor companion. Decorative — every image also exists in its
          row's inline reveal, which is the accessible presentation. */}
      <div ref={ghostRef} className={styles.ghost} aria-hidden="true">
        {projects.map((p, i) => (
          <div
            key={p.slug}
            ref={(el) => { layerRefs.current[i] = el; }}
            className={styles.ghostLayer}
          >
            {p.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.image} alt="" loading="lazy" decoding="async" />
            ) : null}
          </div>
        ))}
        <span ref={metaRef} className={styles.ghostMeta} />
      </div>
    </div>
  );
}
