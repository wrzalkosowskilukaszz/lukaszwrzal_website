/**
 * Drag-release decision for the hero reel, kept pure so it can be tested
 * without a DOM — browser timers are too unreliable to assert a velocity
 * threshold through dispatched events.
 */

export const DRAG_DISTANCE = 60;
/** px per millisecond. */
export const THROW_VELOCITY = 0.6;

export type Throw = -1 | 0 | 1;

/**
 * @param dx  pointer travel in px; negative is leftwards
 * @param dtMs elapsed drag time in ms
 * @returns +1 to advance, -1 to go back, 0 to stay
 */
export function resolveThrow(dx: number, dtMs: number): Throw {
  const distance = Math.abs(dx);
  const velocity = distance / Math.max(1, dtMs);

  if (distance < DRAG_DISTANCE && velocity < THROW_VELOCITY) return 0;
  // A deliberate drag and a flick both read the same way: leftwards means
  // "bring the next one in".
  return dx < 0 ? 1 : -1;
}
