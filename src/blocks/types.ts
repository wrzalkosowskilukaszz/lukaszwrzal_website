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
  /** Label/value rows — Client, Role, Scope, Status, Location, whatever the
      project actually has. The old fixed Client/Role/Scope/Team shape forced
      every project to have the same four facts (and hardcoded the labels in
      English). */
  items: { label: Localised; value: Localised }[];
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
  /** How wide the frame sits. `read` matches the 1200px text grid. */
  width?: "read" | "content" | "stage" | "full-bleed";
  /** 0–0.3. Overscan parallax as it passes the viewport. */
  parallax?: number;
  /** Paints the frame dark behind the media — animations and cut-outs
      read better on `ink` (navy) or `black` than on the tile well. */
  tone?: "ink" | "black";
  /** A live destination pinned to the frame — the mint pill in the corner.
      For the hero figure of a shipped project. */
  link?: { href: string; label?: Localised };
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

/**
 * A term-and-description list. Both bullet runs in the source copy are
 * "Term — what it means" pairs, which is a definition list, not a bullet
 * list — and a definition list can carry real typographic hierarchy.
 */
export interface ListBlock extends Base {
  type: "list";
  /** `cards` numbers a fixed taxonomy; `rows` suits varied-length reasoning. */
  variant?: "cards" | "rows";
  eyebrow?: Localised;
  statement?: Localised;
  /** Set false to drop the counters on `cards`. */
  numbered?: boolean;
  items: { term: Localised; description?: Localised }[];
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

export interface StoryBlock extends Base {
  type: "story";
  /** Chapters flow as normal text on the left while a pinned image on the
      right wipes to each chapter's picture as it arrives. Text scroll is
      NEVER hijacked; on phones each picture simply sits inline after its
      chapter. Eyebrows join the page-wide chapter numbering. */
  /** Which side the pinned picture sits on (default right). Alternating
      consecutive stories keeps a long page from reading as one template. */
  side?: "left" | "right";
  items: {
    eyebrow: Localised;
    statement?: Localised;
    body: Localised[];
    src?: string;
  }[];
}

export interface DeckBlock extends Base {
  type: "deck";
  /** Slides. On a wide screen the section pins while scroll plays them
      through; on mobile, reduced motion or without JS they simply stack.
      The scrollbar is never hijacked — scroll distance maps to progress. */
  items: { title: Localised; body?: Localised; src?: string }[];
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
  | ListBlock
  | QuoteBlock
  | ProcessBlock
  | DeckBlock
  | StoryBlock
  | StatsBlock
  | VideoBlock
  | CreditsBlock;

export type BlockType = Block["type"];

export const BLOCK_TYPES: BlockType[] = [
  "hero", "meta", "text", "statement", "figure", "gallery",
  "textMedia", "list", "quote", "process", "story", "deck", "stats", "video", "credits",
];
