/* Inline SVG throughout — no icon font, no icon library.
   stroke: currentColor, round caps and joins. */

export function ArrowDiagonal({ size = 13 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M2.5 9.5 9.5 2.5" />
      <path d="M4 2.5h5.5V8" />
    </svg>
  );
}

export function ArrowRight({ size = 13, height }: { size?: number; height?: number }) {
  return (
    <svg
      width={size}
      height={height ?? size}
      viewBox="0 0 13 11"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M1 5.5h10.5" />
      <path d="M7.5 1.5 11.5 5.5 7.5 9.5" />
    </svg>
  );
}
