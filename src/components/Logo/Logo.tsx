import type { CSSProperties } from "react";

/**
 * Mark geometry extracted from the design-system bundle rather than shipping
 * the bundle itself, per DESIGN-SPEC "Assets".
 */
const MARK_PATHS = [
  "M627.2,211.6v375.8c0,19.5-15.5,34.9-34.9,34.9h-198.5c-17.2,0-33.2-8.4-42.9-22.5l-44.2-63.7h0l-1.8-2.2c-3.5-5.7-5.7-12.4-5.7-19.9,0-19.9,15.9-36.3,35.8-37.1h96.4c4,0,7.5-.9,11.1-2.2,9.7-4.4,16.8-14.1,16.8-25.6s0-4-.4-5.7h0c0-1.3-.9-2.7-1.3-4l-12.4-41.1v-.9c-.9-1.3-.9-3.1-.9-4.9,0-10.6,8.8-19,19.5-19h23.9c3.1,0,6.2-.9,8.8-2.2,6.2-3.1,10.6-9.7,10.6-17.2s0-1.8,0-2.7c-.4-3.5-2.2-7.1-4.4-9.7h0l-58.8-82.7h0l-2.7-3.5c-4.9-7.5-8-16.8-8-27-.4-28.3,23.4-51.7,51.7-51.7h107.9c19.5,0,34.9,15.5,34.9,34.9h-.4Z",
  "M29.9,446.8V71.5c0-19.5,15.5-34.9,34.9-34.9h198.5c17.2,0,33.2,8.4,42.9,22.5l44.2,63.7h0l1.8,2.2c3.5,5.7,5.7,12.4,5.7,19.9,0,19.9-15.9,36.3-35.8,37.1h-96.4c-4,0-7.5.9-11.1,2.2-9.7,4.4-16.8,14.1-16.8,25.6s0,4,.4,5.7h0c0,1.3.9,2.7,1.3,4l12.4,41.1v.9c.9,1.3.9,3.1.9,4.9,0,10.6-8.8,19-19.5,19h-23.9c-3.1,0-6.2.9-8.8,2.2-6.2,3.1-10.6,9.7-10.6,17.2s0,1.8,0,2.7c.4,3.5,2.2,7.1,4.4,9.7h0l58.8,82.7h0l2.7,3.5c4.9,7.5,8,16.8,8,27,.4,28.3-23.4,51.7-51.7,51.7h-107.4c-19.5,0-34.9-15.5-34.9-34.9v-.4Z",
];

export interface LogoProps {
  variant?: "mark" | "lockup";
  size?: number;
  /** Any CSS colour; defaults to the current text colour. */
  color?: string;
  style?: CSSProperties;
  className?: string;
  /** Decorative when a nearby label already names the site. */
  decorative?: boolean;
}

export function Logo({
  variant = "lockup",
  size = 32,
  color = "currentColor",
  style,
  className,
  decorative = false,
}: LogoProps) {
  const mark = (
    <svg
      viewBox="0 0 658 658"
      width={size}
      height={size}
      style={{ display: "block", flexShrink: 0 }}
      role={decorative || variant === "lockup" ? undefined : "img"}
      aria-label={decorative || variant === "lockup" ? undefined : "Lukasz Wrzal"}
      aria-hidden={decorative || variant === "lockup" ? true : undefined}
      focusable="false"
    >
      <circle cx={382.7} cy={282.4} r={24.8} fill={color} />
      {MARK_PATHS.map((d, i) => (
        <path key={i} d={d} fill={color} />
      ))}
    </svg>
  );

  if (variant === "mark") {
    return (
      <span className={className} style={{ display: "inline-flex", ...style }}>
        {mark}
      </span>
    );
  }

  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: size * 0.4,
        ...style,
      }}
    >
      {mark}
      <span
        style={{
          fontFamily: "var(--lw-font)",
          fontWeight: 600,
          letterSpacing: "-0.01em",
          fontSize: size * 0.66,
          color,
          whiteSpace: "nowrap",
        }}
      >
        Lukasz Wrzal
      </span>
    </span>
  );
}
