import { describe, expect, it } from "vitest";

import {
  GAP,
  baseWidth,
  columnsFor,
  resolveRow,
  widthFactor,
} from "@/lib/workGridLayout";

const PROJECT_COUNT = 30;

describe("columnsFor", () => {
  it("matches the documented breakpoints", () => {
    expect(columnsFor(1600)).toBe(4);
    expect(columnsFor(1500)).toBe(4);
    expect(columnsFor(1499)).toBe(3);
    expect(columnsFor(1100)).toBe(3);
    expect(columnsFor(1099)).toBe(2);
    expect(columnsFor(680)).toBe(2);
    expect(columnsFor(679)).toBe(1);
    expect(columnsFor(375)).toBe(1);
  });
});

describe("baseWidth", () => {
  it("leaves a sub-pixel gap so rounding cannot force a wrap", () => {
    for (const cols of [1, 2, 3, 4]) {
      for (const gridWidth of [680, 1099, 1248, 1568, 2400]) {
        const base = baseWidth(gridWidth, cols);
        const rowTotal = base * cols + GAP * (cols - 1);
        expect(rowTotal).toBeLessThanOrEqual(gridWidth);
        // ...but only just: never waste more than a pixel per column.
        expect(gridWidth - rowTotal).toBeLessThanOrEqual(cols * 0.5);
      }
    }
  });
});

describe("resolveRow", () => {
  it("uses the SHORT final row length, not the column count", () => {
    // 30 cards across 4 columns leaves a final row of 2.
    const last = resolveRow(28, PROJECT_COUNT, 4);
    expect(last.rowStart).toBe(28);
    expect(last.rowLen).toBe(2);

    const full = resolveRow(0, PROJECT_COUNT, 4);
    expect(full.rowLen).toBe(4);
  });

  it("never claims width in a row of one", () => {
    // 29 visible across 4 columns leaves a final row of 1.
    const alone = resolveRow(28, 29, 4);
    expect(alone.rowLen).toBe(1);
    expect(alone.claim).toBe(1);
    expect(alone.shed).toBe(1);
  });
});

describe("widthFactor", () => {
  it("is exactly 1 everywhere when nothing is hovered", () => {
    for (let i = 0; i < PROJECT_COUNT; i++) {
      expect(widthFactor(i, null, PROJECT_COUNT, 4)).toBe(1);
    }
  });

  it("keeps every row summing to the column count", () => {
    // This is the invariant that stops cards wrapping mid-hover.
    for (const cols of [2, 3, 4]) {
      for (const visibleCount of [30, 29, 7, 6, 5, 4, 3, 2, 1]) {
        for (let hovered = 0; hovered < visibleCount; hovered++) {
          const { rowStart, rowLen } = resolveRow(hovered, visibleCount, cols);
          let sum = 0;
          for (let vi = rowStart; vi < rowStart + rowLen; vi++) {
            sum += widthFactor(vi, hovered, visibleCount, cols);
          }
          expect(sum).toBeCloseTo(rowLen, 9);
        }
      }
    }
  });

  it("leaves every other row untouched", () => {
    const hovered = 28; // final short row, 4 columns
    for (let vi = 0; vi < 28; vi++) {
      expect(widthFactor(vi, hovered, PROJECT_COUNT, 4)).toBe(1);
    }
  });

  it("gives the hovered card the claim and its siblings the shed", () => {
    expect(widthFactor(0, 0, PROJECT_COUNT, 4)).toBeCloseTo(1.24, 9);
    // three siblings share the shortfall
    const shed = widthFactor(1, 0, PROJECT_COUNT, 4);
    expect(shed).toBeCloseTo((4 - 1.24) / 3, 9);
    expect(shed).toBeLessThan(1);
  });

  it("never produces a negative or zero width factor", () => {
    for (const cols of [1, 2, 3, 4]) {
      for (let visibleCount = 1; visibleCount <= 30; visibleCount++) {
        for (let hovered = 0; hovered < visibleCount; hovered++) {
          for (let vi = 0; vi < visibleCount; vi++) {
            expect(widthFactor(vi, hovered, visibleCount, cols)).toBeGreaterThan(0);
          }
        }
      }
    }
  });
});

describe("real widths never overflow the container", () => {
  it("holds for every filter size, column count and hovered card", () => {
    const gridWidth = 1568;
    for (const cols of [2, 3, 4]) {
      const base = baseWidth(gridWidth, cols);
      for (const visibleCount of [30, 12, 7, 6, 5, 4, 2]) {
        for (let hovered = 0; hovered < visibleCount; hovered++) {
          const { rowStart, rowLen } = resolveRow(hovered, visibleCount, cols);
          let px = GAP * (rowLen - 1);
          for (let vi = rowStart; vi < rowStart + rowLen; vi++) {
            px += base * widthFactor(vi, hovered, visibleCount, cols);
          }
          expect(px).toBeLessThanOrEqual(gridWidth);
        }
      }
    }
  });
});
