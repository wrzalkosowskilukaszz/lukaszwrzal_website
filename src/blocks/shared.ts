import type { Locale } from "@/lib/types";

import type { Localised, Spacing } from "./types";

/** Resolve a localised value. A plain string is used for both languages. */
export function tx(value: Localised | undefined, locale: Locale): string {
  if (value == null) return "";
  return typeof value === "string" ? value : (value[locale] ?? value.en);
}

export function txAll(values: Localised[] | undefined, locale: Locale): string[] {
  return (values ?? []).map((v) => tx(v, locale));
}

/** Images live beside their project: public/work/<slug>/<src>. */
export function mediaUrl(slug: string, src: string): string {
  return src.startsWith("/") ? src : `/work/${slug}/${src}`;
}

/**
 * Vertical rhythm. Blocks own their spacing so content never has to place
 * blank space by hand — `spacing` only nudges the default.
 */
export const SPACING: Record<Spacing, string> = {
  tight: "clamp(1.5rem, 3vw, 2.5rem)",
  normal: "clamp(4rem, 8vw, 7.5rem)",
  loose: "clamp(7rem, 13vw, 12rem)",
};

export function spacingFor(spacing: Spacing | undefined): string {
  return SPACING[spacing ?? "normal"];
}

/** The three widths the design uses. Everything sits on one of them. */
export const WIDTH = {
  read: "min(var(--lw-read-max), 100% - 48px)",
  content: "min(var(--lw-content-max), 100% - 40px)",
  stage: "min(var(--lw-stage-max), 100% - 48px)",
  "full-bleed": "100%",
} as const;

export interface BlockContext {
  slug: string;
  locale: Locale;
  /** Opens the lightbox for a media src, when the project has real images. */
  onOpenMedia?: (src: string) => void;
  /** Index of the block whose media carries the `project-media`
      view-transition name — the element a clicked tile morphs into.
      Exactly one per page, or the transition silently degrades. */
  morphIndex?: number;
}
