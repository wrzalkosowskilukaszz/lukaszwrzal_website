"use client";

import { useEffect, useRef } from "react";

/**
 * Scroll-into-view reveal. No page-load choreography — content is present on
 * load and reveals only as it enters the viewport.
 *
 * The 2.4s safety timeout force-shows anything the observer missed (a tab
 * restored mid-page, a zero-height element at mount). Without it a missed
 * entry leaves content permanently invisible.
 */
export function useReveal<T extends HTMLElement>(enabled = true) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const show = () => el.setAttribute("data-shown", "true");

    if (!enabled) {
      show();
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            show();
            io.disconnect();
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);

    const safety = window.setTimeout(show, 2400);

    return () => {
      io.disconnect();
      window.clearTimeout(safety);
    };
  }, [enabled]);

  return ref;
}
