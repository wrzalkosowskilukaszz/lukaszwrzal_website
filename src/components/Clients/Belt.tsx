"use client";

import { useEffect, useRef } from "react";

import { useReducedMotion } from "@/hooks/useReducedMotion";
import { subscribe } from "@/lib/raf";

import styles from "./Clients.module.css";

const MAX_SETS = 8;
const REMEASURE_EVERY = 20;

export interface BeltProps {
  logos: string[];
  /** 1 travels right, -1 travels left. */
  direction: 1 | -1;
  /** px per second. */
  speed?: number;
}

/**
 * A marquee that measures itself from the LAID-OUT DOM.
 *
 * The bug this avoids: summing image widths at mount reads 0 for every image
 * that has not loaded, so a "set" measures as just the gaps (~240px instead of
 * ~1100px) and the belt snaps back every 2–3s. And `img.complete` is true for
 * cached AND cloned images, so load listeners may never fire and the bad
 * reading sticks.
 *
 * So: measure the offset between the first child and its first clone, re-read
 * it every ~20 frames so a stale value self-corrects, and hold the belt still
 * until the width is real.
 */
export function Belt({ logos, direction, speed = 14 }: BeltProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const hovered = useRef(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const perSet = logos.length;
    let x = 0;
    let setWidth = 0;
    let frame = 0;

    /** Distance from the first child to its first clone = one true set. */
    const measure = (): number => {
      const kids = track.children;
      if (kids.length < perSet * 2) return 0;
      const a = (kids[0] as HTMLElement).offsetLeft;
      const b = (kids[perSet] as HTMLElement).offsetLeft;
      const w = b - a;
      return w > 1 ? w : 0;
    };

    /** Clone until the track covers the viewport twice; trim when over. */
    const ensureCoverage = () => {
      const width = setWidth || measure();
      if (!width) return;
      const need = Math.min(
        MAX_SETS,
        Math.max(2, Math.ceil((window.innerWidth * 2) / width) + 1),
      );
      const have = track.children.length / perSet;
      if (have < need) {
        const frag = document.createDocumentFragment();
        for (let s = have; s < need; s++) {
          for (let i = 0; i < perSet; i++) {
            frag.appendChild(track.children[i].cloneNode(true));
          }
        }
        track.appendChild(frag);
      } else if (have > need) {
        while (track.children.length / perSet > need) {
          for (let i = 0; i < perSet; i++) track.lastElementChild?.remove();
        }
      }
    };

    const stop = subscribe((dt) => {
      if (reduced) {
        track.dataset.ready = "true";
        track.style.transform = "";
        return;
      }

      if (frame % REMEASURE_EVERY === 0) {
        const w = measure();
        if (w) {
          setWidth = w;
          ensureCoverage();
        }
      }
      frame++;

      if (!setWidth) {
        track.dataset.ready = "false";
        return;
      }
      track.dataset.ready = "true";

      // Hovering eases the belt to 15% — slowed, never stopped.
      const factor = hovered.current ? 0.15 : 1;

      /* Travel always accumulates forward and wraps into [0, setWidth); the
         DIRECTION is expressed in how that distance maps to an offset. Applying
         the sign to `x` instead made the wrapped value run backwards through
         the range, so a left-running belt rendered as a right-running one — and
         both belts moved the same way. */
      x = (x + speed * factor * dt) % setWidth;
      const offset = direction === 1 ? x - setWidth : -x;
      track.style.transform = `translate3d(${offset}px, 0, 0)`;
    });

    return stop;
  }, [logos.length, direction, speed, reduced]);

  return (
    <div
      className={styles.belt}
      onPointerEnter={() => { hovered.current = true; }}
      onPointerLeave={() => { hovered.current = false; }}
    >
      <div className={styles.track} ref={trackRef} data-ready="false">
        {/* Two sets up front so the first measurement has a clone to read. */}
        {[0, 1].map((set) =>
          logos.map((src, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={`${set}-${i}`}
              className={styles.logo}
              src={src}
              alt=""
              aria-hidden="true"
              loading="eager"
              decoding="async"
            />
          )),
        )}
      </div>
    </div>
  );
}
