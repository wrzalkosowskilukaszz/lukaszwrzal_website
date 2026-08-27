"use client";

import { useEffect, useState } from "react";

/**
 * Not handled at all in the prototypes — added here per the handoff's
 * accessibility notes. When true: hold springs at rest, skip parallax and
 * blob orbits, keep reveals as instant opacity.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return reduced;
}
