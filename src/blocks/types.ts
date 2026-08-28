/**
 * A project page is a LIST OF BLOCKS, each carrying its own content.
 *
 * The old model had one fixed template and a content shape that mirrored it —
 * exactly two brief paragraphs, exactly four process steps, exactly twelve
 * numbered image slots, and no block could repeat. Every project was forced
 * into the same shape because the model gave it no choice.
 *
 * Here, a block owns its content. Any block can appear any number of times,
 * in any order, holding as much or as little as it needs.
 */

/** Copy that differs per language. A plain string is used for both. */
export type Localised = string | { en: string; pl: string };

/** Air around a block. Defaults are sensible; set this only to tune. */
export type Spacing = "tight" | "normal" | "loose";

export interface Media {
  /** Filename inside public/work/<slug>/ — e.g. "signage.jpg". */
  src: string;
  /** Printed under the image. */
  caption?: Localised;
  /** Long caption, lightbox only. Falls back to `caption`. */
  lightboxCaption?: Localised;
  alt?: Localised;
  /** Set by the loader when the file is not in public/work/<slug>/ yet. */
  missing?: boolean;
}

interface Base {
  spacing?: Spacing;
}

export interface HeroBlock extends Base {
  type: "hero";
  variant?: "centred" | "left";
  eyebrow?: Localised;
  title: string;
  lede?: Localised;
}

export interface MetaBlock extends Base {
  type: "meta";
  client?: Localised;
  role?: Localised;
  scope?: Localised;
  team?: Localised;
}

export interface TextBlock extends Base {
  type: "text";
  variant?: "single" | "two-column";
  eyebrow?: Localised;
  statement?: Localised;
  body: Localised[];
}

export interface StatementBlock extends Base {
  type: "statement";
  variant?: "left" | "centred";
  eyebrow?: Localised;
  text: Localised;
}

export interface FigureBlock extends Base, Media {
  type: "figure";
  /** How wide the frame sits. */
  width?: "content" | "stage" | "full-bleed";
  /** 0–0.3. Overscan parallax as it passes the viewport. */
  parallax?: number;
}

export interface GalleryBlock extends Base {
  type: "gallery";
  /** grid-2/3 are even rows; masonry keeps native ratios; strip drag-scrolls. */
  variant?: "grid-2" | "grid-3" | "masonry" | "strip";
  items: Media[];
}

export interface TextMediaBlock extends Base, Media {
  type: "textMedia";
  variant?: "media-left" | "media-right";
  eyebrow?: Localised;
  statement?: Localised;
  body: Localised[];
}

export interface QuoteBlock extends Base {
  type: "quote";
  variant?: "plain" | "aurora";
  text: Localised;
  attribution?: Localised;
}

export interface ProcessBlock extends Base {
  type: "process";
  /** `pinned` sticks the frame and wipes layers; `stacked` reads inline. */
  variant?: "pinned" | "stacked";
  eyebrow?: Localised;
  steps: { n?: string; title: Localised; body: Localised; src?: string }[];
}

export interface StatsBlock extends Base {
  type: "stats";
  eyebrow?: Localised;
  items: { value: number; suffix?: string; label: Localised }[];
}

export interface VideoBlock extends Base {
  type: "video";
  src: string;
  poster?: string;
  width?: "content" | "stage" | "full-bleed";
  caption?: Localised;
}

export interface CreditsBlock extends Base {
  type: "credits";
  eyebrow?: Localised;
  roles: { role: Localised; name: string }[];
}

export type Block =
  | HeroBlock
  | MetaBlock
  | TextBlock
  | StatementBlock
  | FigureBlock
  | GalleryBlock
  | TextMediaBlock
  | QuoteBlock
  | ProcessBlock
  | StatsBlock
  | VideoBlock
  | CreditsBlock;

export type BlockType = Block["type"];

export const BLOCK_TYPES: BlockType[] = [
  "hero", "meta", "text", "statement", "figure", "gallery",
  "textMedia", "quote", "process", "stats", "video", "credits",
];
