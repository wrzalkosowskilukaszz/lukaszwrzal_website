/**
 * Critically-damped spring. Anything interruptible uses this rather than a CSS
 * transition — a transition restarts when re-triggered, which is exactly wrong
 * when a pointer crosses four tiles quickly.
 *
 * Stiffness/damping pairs in use (from DESIGN-SPEC "Motion → the spring"):
 *   (130, 21) grid columns · (120, 22) carousel planes · (150, 20) carousel copy
 *   (150, 24) About points  · (60, 14) pointer drift
 */
export class Spring {
  v: number;
  target: number;
  vel = 0;
  k: number;
  d: number;

  constructor(v: number, k = 130, d = 21) {
    this.v = v;
    this.target = v;
    this.k = k;
    this.d = d;
  }

  step(dt: number): number {
    this.vel += (-this.k * (this.v - this.target) - this.d * this.vel) * dt;
    this.v += this.vel * dt;
    return this.v;
  }

  /** Jump to a value with no travel — used for reduced motion and resets. */
  set(v: number): void {
    this.v = v;
    this.target = v;
    this.vel = 0;
  }

  get atRest(): boolean {
    return Math.abs(this.v - this.target) < 0.001 && Math.abs(this.vel) < 0.001;
  }
}

export const clamp = (n: number, lo: number, hi: number): number =>
  Math.min(hi, Math.max(lo, n));

export const clamp01 = (n: number): number => clamp(n, 0, 1);
