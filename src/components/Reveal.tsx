"use client";

import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useReveal } from "@/hooks/useReveal";

/**
 * Reveals a block as it enters the viewport. No page-load choreography —
 * content is present on load and only sections below the fold animate.
 *
 * The hook carries a 2.4s safety timeout that force-shows anything the
 * observer missed, so a missed entry can never leave content invisible.
 */
export function Reveal({
  children,
  delay = 0,
  as: Tag = "div",
  className,
  id,
}: {
  children: React.ReactNode;
  /** ms — stagger siblings sparingly. */
  delay?: number;
  as?: "div" | "section";
  className?: string;
  id?: string;
}) {
  const reduced = useReducedMotion();
  const ref = useReveal<HTMLDivElement>(!reduced);

  return (
    <Tag
      ref={ref}
      id={id}
      className={`lw-reveal ${className ?? ""}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
