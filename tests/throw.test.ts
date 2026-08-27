import { describe, expect, it } from "vitest";

import {
  DRAG_DISTANCE,
  THROW_VELOCITY,
  resolveThrow,
} from "@/components/HeroReel/throw";

describe("resolveThrow", () => {
  it("ignores a short, slow drag", () => {
    expect(resolveThrow(-20, 400)).toBe(0);
    expect(resolveThrow(12, 300)).toBe(0);
    expect(resolveThrow(0, 100)).toBe(0);
  });

  it("advances on a deliberate drag past the distance threshold", () => {
    expect(resolveThrow(-(DRAG_DISTANCE + 1), 500)).toBe(1);
    expect(resolveThrow(DRAG_DISTANCE + 1, 500)).toBe(-1);
  });

  it("advances on a fast flick that never travels far", () => {
    // 40px in 20ms = 2 px/ms — well over the threshold, well under 60px.
    expect(resolveThrow(-40, 20)).toBe(1);
    expect(resolveThrow(40, 20)).toBe(-1);
  });

  it("holds just under both thresholds and releases just over", () => {
    const slow = DRAG_DISTANCE / THROW_VELOCITY + 50; // safely sub-threshold
    expect(resolveThrow(-(DRAG_DISTANCE - 1), slow)).toBe(0);
    expect(resolveThrow(-(DRAG_DISTANCE + 1), slow)).toBe(1);
  });

  it("treats leftwards as forward in both languages of input", () => {
    expect(resolveThrow(-200, 900)).toBe(1);
    expect(resolveThrow(-15, 5)).toBe(1);
  });

  it("never divides by zero on an instantaneous release", () => {
    expect(() => resolveThrow(-50, 0)).not.toThrow();
    expect(resolveThrow(-50, 0)).toBe(1);
  });
});
