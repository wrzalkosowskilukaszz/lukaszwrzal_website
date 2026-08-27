"use client";

/**
 * One shared requestAnimationFrame loop for the whole page. Do not create a
 * loop per component — see DESIGN-SPEC "Motion".
 *
 * Every subscriber runs inside its own try/catch so one throwing frame cannot
 * take down the reel, the springs or the gradients. This is the guard that
 * cal.com breaking taught us; see context/MEMORY.md.
 */
type Frame = (dt: number, elapsed: number) => void;

const subscribers = new Set<Frame>();
let rafId: number | null = null;
let last = 0;
let elapsed = 0;
let failed: WeakSet<Frame> = new WeakSet();

function tick(now: number) {
  const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016);
  last = now;
  elapsed += dt;

  for (const fn of subscribers) {
    if (failed.has(fn)) continue;
    try {
      fn(dt, elapsed);
    } catch (err) {
      // Drop the offender, keep the loop alive for everyone else.
      failed.add(fn);
      if (process.env.NODE_ENV !== "production") {
        console.error("[raf] subscriber threw and was dropped", err);
      }
    }
  }

  rafId = requestAnimationFrame(tick);
}

/** Start the clock. Called before any third-party embed mounts. */
export function startClock(): void {
  if (rafId !== null || typeof window === "undefined") return;
  last = 0;
  rafId = requestAnimationFrame(tick);
}

export function subscribe(fn: Frame): () => void {
  subscribers.add(fn);
  startClock();
  return () => {
    subscribers.delete(fn);
    failed.delete(fn);
  };
}

export function resetClock(): void {
  elapsed = 0;
  failed = new WeakSet();
}
