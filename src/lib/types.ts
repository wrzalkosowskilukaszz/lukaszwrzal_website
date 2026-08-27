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
