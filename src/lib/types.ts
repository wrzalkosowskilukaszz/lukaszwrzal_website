export const LOCALES = ["en", "pl"] as const;
export type Locale = (typeof LOCALES)[number];

export const CATEGORIES = [
  "identity",
  "product",
  "brand",
  "web",
  "campaign",
  "illustrations",
] as const;
export type Category = (typeof CATEGORIES)[number];

export interface Stat {
  value: number;
  suffix?: string;
  label: string;
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
  /** Shown when known. The content rule is: never invent dates. */
  year?: string;
  title: string;
  desc: string;
  /** Already filtered: absent when the outcome has not been written yet. */
  stat?: Stat;
  image?: string;
}

