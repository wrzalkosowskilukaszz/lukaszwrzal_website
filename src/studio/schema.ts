import type { BlockType } from "@/blocks/types";
import { CATEGORIES, type Category } from "@/lib/types";

/**
 * Drives the Studio form. One row per field, per block type — the form is
 * generated from this table rather than hand-built per block, so adding a
 * field to a block means editing data here, not writing a new component.
 */
export type FieldKind =
  | "text"
  | "localisedText"
  | "localisedTextarea"
  | "select"
  | "number"
  | "media"
  | "mediaList"
  | "localisedList"
  | "kv"
  | "steps"
  | "stats"
  | "roles"
  | "spacing";

export interface FieldDef {
  key: string;
  label: string;
  kind: FieldKind;
  required?: boolean;
  /** For "select": the value saved vs. the plain-English label shown. */
  options?: { value: string; label: string }[];
  placeholder?: string;
  help?: string;
}

const SPACING_FIELD: FieldDef = {
  key: "spacing",
  label: "Space above this section",
  kind: "spacing",
};

export const BLOCK_FIELDS: Record<BlockType, FieldDef[]> = {
  hero: [
    { key: "title", label: "Title", kind: "text", required: true },
    { key: "eyebrow", label: "Small label above the title", kind: "localisedText",
      placeholder: "Identity · Six weeks · 2026" },
    { key: "lede", label: "Opening line", kind: "localisedTextarea" },
    { key: "variant", label: "Layout", kind: "select", options: [
      { value: "centred", label: "Centred" }, { value: "left", label: "Left-aligned" },
    ] },
    SPACING_FIELD,
  ],
  meta: [
    { key: "items", label: "Facts", kind: "kv", required: true,
      help: "Any label and value — Client, Role, Scope, Status, Location…" },
    SPACING_FIELD,
  ],
  text: [
    { key: "eyebrow", label: "Small label above", kind: "localisedText" },
    { key: "statement", label: "Big statement (optional)", kind: "localisedText" },
    { key: "body", label: "Paragraphs", kind: "localisedList", required: true },
    { key: "variant", label: "Layout", kind: "select", options: [
      { value: "two-column", label: "Two columns" }, { value: "single", label: "One column" },
    ] },
    SPACING_FIELD,
  ],
  statement: [
    { key: "eyebrow", label: "Small label above", kind: "localisedText" },
    { key: "text", label: "Statement", kind: "localisedTextarea", required: true },
    { key: "variant", label: "Layout", kind: "select", options: [
      { value: "left", label: "Left-aligned" }, { value: "centred", label: "Centred" },
    ] },
    SPACING_FIELD,
  ],
  figure: [
    { key: "src", label: "Picture", kind: "media", required: true },
    { key: "width", label: "Size", kind: "select", options: [
      { value: "content", label: "Normal" }, { value: "stage", label: "Large, rounded corners" },
      { value: "full-bleed", label: "Edge to edge" },
    ] },
    { key: "caption", label: "Caption (shown under the picture)", kind: "localisedText" },
    { key: "parallax", label: "Drift as you scroll (0 to 0.3)", kind: "number" },
    SPACING_FIELD,
  ],
  gallery: [
    { key: "variant", label: "Layout", kind: "select", options: [
      { value: "grid-2", label: "Grid, 2 across" }, { value: "grid-3", label: "Grid, 3 across" },
      { value: "masonry", label: "Scattered sizes" }, { value: "strip", label: "Scrolling strip" },
    ] },
    { key: "items", label: "Pictures", kind: "mediaList", required: true },
    SPACING_FIELD,
  ],
  textMedia: [
    { key: "src", label: "Picture", kind: "media", required: true },
    { key: "variant", label: "Picture position", kind: "select", options: [
      { value: "media-right", label: "Picture on the right" }, { value: "media-left", label: "Picture on the left" },
    ] },
    { key: "eyebrow", label: "Small label above", kind: "localisedText" },
    { key: "statement", label: "Heading (optional)", kind: "localisedText" },
    { key: "body", label: "Paragraphs", kind: "localisedList", required: true },
    SPACING_FIELD,
  ],
  quote: [
    { key: "text", label: "Quote", kind: "localisedTextarea", required: true },
    { key: "attribution", label: "Who said it", kind: "localisedText" },
    { key: "variant", label: "Background", kind: "select", options: [
      { value: "plain", label: "Plain" }, { value: "aurora", label: "Soft colour field" },
    ] },
    SPACING_FIELD,
  ],
  process: [
    { key: "eyebrow", label: "Small label above", kind: "localisedText" },
    { key: "steps", label: "Steps", kind: "steps", required: true },
    { key: "variant", label: "Behaviour", kind: "select", options: [
      { value: "pinned", label: "Picture sticks while you scroll the steps" },
      { value: "stacked", label: "Simple list" },
    ] },
    SPACING_FIELD,
  ],
  stats: [
    { key: "eyebrow", label: "Small label above", kind: "localisedText" },
    { key: "items", label: "Numbers", kind: "stats", required: true },
    SPACING_FIELD,
  ],
  video: [
    { key: "src", label: "Video file", kind: "media", required: true },
    { key: "poster", label: "Cover image (optional)", kind: "media" },
    { key: "width", label: "Size", kind: "select", options: [
      { value: "stage", label: "Large, rounded corners" }, { value: "content", label: "Normal" },
      { value: "full-bleed", label: "Edge to edge" },
    ] },
    { key: "caption", label: "Caption", kind: "localisedText" },
    SPACING_FIELD,
  ],
  credits: [
    { key: "eyebrow", label: "Small label above", kind: "localisedText" },
    { key: "roles", label: "Roles and names", kind: "roles", required: true },
    SPACING_FIELD,
  ],
};

export const BLOCK_LABELS: Record<BlockType, { label: string; help: string }> = {
  hero: { label: "Title block", help: "The opening of the page — title and first line." },
  meta: { label: "Fact row", help: "Client, role, scope, team." },
  text: { label: "Text", help: "A paragraph or two, with an optional big statement." },
  statement: { label: "Statement", help: "One large sentence, standing alone." },
  figure: { label: "Picture", help: "A single image." },
  gallery: { label: "Gallery", help: "Several pictures together." },
  textMedia: { label: "Text beside a picture", help: "Words next to an image." },
  quote: { label: "Quote", help: "A pull-quote." },
  process: { label: "Process steps", help: "Numbered steps with a picture that follows along." },
  stats: { label: "Numbers", help: "Big numbers that count up." },
  video: { label: "Video", help: "A looping video." },
  credits: { label: "Credits", help: "Roles and names at the close." },
};

export const CATEGORY_OPTIONS: { value: Category; label: string }[] = CATEGORIES.map((c) => ({
  value: c,
  label: c[0].toUpperCase() + c.slice(1),
}));
