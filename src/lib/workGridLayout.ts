/**
 * Pure layout maths for the work grid, kept out of the component so it can be
 * tested without a DOM. Every hard-won detail from context/MEMORY.md lives
 * here and is covered by tests.
 */

export const GAP = 14;

export function columnsFor(viewportWidth: number): number {
  return viewportWidth >= 1500
    ? 4
    : viewportWidth >= 1100
      ? 3
      : viewportWidth >= 680
        ? 2
        : 1;
}

/** Resting card width. The 0.5px shave stops rounded widths overflowing. */
export function baseWidth(gridWidth: number, cols: number): number {
  return (gridWidth - GAP * (cols - 1)) / cols - 0.5;
}

export interface RowClaim {
  /** Index into the VISIBLE list where the hovered card's row starts. */
  rowStart: number;
  /** Cards actually in that row — may be fewer than `cols` on the last row. */
  rowLen: number;
  /** Multiplier for the hovered card. */
  claim: number;
  /** Multiplier for each sibling in the same row. */
  shed: number;
}

/**
 * Resolve the hovered card's row among VISIBLE cards and work out how width
 * redistributes within that row only.
 *
 * `rowLen`, not `cols`: 30 cards across 4 columns leaves a final row of 2.
 * Distributing the claim across 4 there meant widths no longer summed to the
 * container, so cards wrapped mid-hover and the layout jumped.
 */
export function resolveRow(
  visibleIndex: number,
  visibleCount: number,
  cols: number,
  claimFactor = 1.24,
): RowClaim {
  const rowStart = Math.floor(visibleIndex / cols) * cols;
  const rowLen = Math.min(cols, visibleCount - rowStart);
  const claim = rowLen > 1 ? claimFactor : 1;
  const shed = rowLen > 1 ? (rowLen - claim) / (rowLen - 1) : 1;
  return { rowStart, rowLen, claim, shed };
}

/** Multiplier for one visible card given the current hover, or 1 at rest. */
export function widthFactor(
  visibleIndex: number,
  hoveredVisibleIndex: number | null,
  visibleCount: number,
  cols: number,
  claimFactor = 1.24,
): number {
  if (hoveredVisibleIndex === null) return 1;

  const { rowStart, rowLen, claim, shed } = resolveRow(
    hoveredVisibleIndex,
    visibleCount,
    cols,
    claimFactor,
  );

  if (visibleIndex < rowStart || visibleIndex >= rowStart + rowLen) return 1;
  return visibleIndex === hoveredVisibleIndex ? claim : shed;
}
