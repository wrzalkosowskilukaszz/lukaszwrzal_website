"use client";

import { useEffect, useRef, useState } from "react";

import { useReducedMotion } from "@/hooks/useReducedMotion";
import { subscribe } from "@/lib/raf";
import { clamp01 } from "@/lib/spring";

import styles from "./Spine.module.css";

export interface SpineProps {
  chapters: { id: string; label: string }[];
}

/** Fixed progress hairline plus the chapter spine. Both decorative. */
export function Spine({ chapters }: SpineProps) {
  const barRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    const stop = subscribe(() => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const p = max > 0 ? clamp01(window.scrollY / max) : 0;
      if (barRef.current) barRef.current.style.width = `${p * 100}%`;

      // Active = the last chapter whose top is above the viewport middle.
      const middle = window.innerHeight / 2;
      let next = 0;
      for (let i = 0; i < chapters.length; i++) {
        const el = document.getElementById(chapters[i].id);
        if (el && el.getBoundingClientRect().top <= middle) next = i;
      }
      if (next !== activeRef.current) {
        activeRef.current = next;
        setActive(next);
      }
    });
    return stop;
  }, [chapters]);

  return (
    <>
      <div className={styles.progress} ref={barRef} aria-hidden="true" />

      <nav className={styles.spine} aria-label="Chapters">
        {chapters.map((c, i) => (
          <a
            key={c.id}
            href={`#${c.id}`}
            className={styles.entry}
            data-active={i === active}
            aria-current={i === active ? "true" : undefined}
            onClick={(e) => {
              e.preventDefault();
              const el = document.getElementById(c.id);
              if (!el) return;
              window.scrollTo({
                top: el.getBoundingClientRect().top + window.scrollY - 100,
                behavior: reduced ? "auto" : "smooth",
              });
            }}
          >
            <span className={styles.tick} aria-hidden="true" />
            <span className={styles.label}>{c.label}</span>
          </a>
        ))}
      </nav>
    </>
  );
}
