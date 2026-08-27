export const LOCALES = ["en", "pl"] as const;
export type Locale = (typeof LOCALES)[number];

export const CATEGORIES = [
  "identity",
  "product",
  "brand",
  "web",
  "ai",
  "illustrations",
] as const;
export type Category = (typeof CATEGORIES)[number];

/**
 * The blocks a case study can be built from.
 *
 * Projects are not all the same shape — some need a bespoke case study. A
 * project names the sections it wants, in the order it wants them, so a
 * different layout is a content decision rather than a forked template.
 * Anything not listed simply isn't rendered.
 */
export const SECTIONS = [
  "keyVisual",   // Fig 01, full-bleed, 64px radius
  "meta",        // Client / Role / Scope / Team
  "brief",       // 01 — statement + two prose columns
  "figurePair",  // Figs 02–03, side by side
  "process",     // 02 — pinned frame, four wiping layers
  "system",      // 03 — statement + body
  "plateStrip",  // Figs 08–11, drag-scrolled with a progress rail
  "motion",      // Fig 12, settles to full scale on view
  "outcome",     // 04 — statement, columns, count-up stats
] as const;

export type SectionKind = (typeof SECTIONS)[number];

/** The order used when a project doesn't specify its own. */
export const DEFAULT_SECTIONS: SectionKind[] = [
  "keyVisual", "meta", "brief", "figurePair",
  "process", "system", "plateStrip", "motion", "outcome",
];

/** Figure slots on a case study, "01".."12". */
export type FigureKey =
  | "01" | "02" | "03" | "04" | "05" | "06"
  | "07" | "08" | "09" | "10" | "11" | "12";

export interface ProcessStep {
  n: string;
  title: string;
  body: string;
}

export interface Stat {
  value: number;
  suffix?: string;
  label: string;
}

/** One language block. Identical keys across en/pl. */
export interface ProjectCopy {
  title: string;
  eyebrow: string;
  lede: string;
  client: string;
  role: string;
  scope: string;
  team: string;
  statement: string;
  /** Two prose columns under 01 Brief. */
  brief: string[];
  /** Exactly four steps in 02 Process. */
  process: ProcessStep[];
  system: { statement: string; body: string };
  outcome: { statement: string; body: string[] };
  /** Four count-up stats. */
  stats: Stat[];
  /** Long — lightbox only. */
  captions: Partial<Record<FigureKey, string>>;
  /** Terse — printed under the image. */
  captionsShort: Partial<Record<FigureKey, string>>;
  /** Display name of the next project. */
  next: string;
  /** Short line used on the work-index tile and the bento. */
  desc: string;
}

export interface Project {
  slug: string;
  cat: Category;
  year: string;
  nextSlug: string;
  /** Bespoke layout. Omit to use DEFAULT_SECTIONS. */
  sections?: SectionKind[];
  en: ProjectCopy;
  pl: ProjectCopy;
}

export interface ProjectsFile {
  projects: Project[];
}

/**
 * What a tile or index row actually needs. Case studies carry brief,
 * process, system, outcome and twelve captions — none of which a list of
 * thirty rows uses, and all of which would otherwise be serialised to the
 * browser along with the authoring prompts still sitting in them.
 */
export interface ProjectCard {
  slug: string;
  cat: Category;
  year: string;
  title: string;
  desc: string;
  /** Already filtered: absent when the outcome has not been written yet. */
  stat?: Stat;
  image?: string;
}

/** A project with one language already resolved. */
export type LocalisedProject = Omit<Project, "en" | "pl"> & {
  copy: ProjectCopy;
};
