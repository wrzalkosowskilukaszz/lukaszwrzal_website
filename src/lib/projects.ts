import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { validateBlocks } from "@/blocks/validate";
import type { Block, Localised } from "@/blocks/types";

import type { Category, Locale, ProjectCard, Stat } from "./types";

export interface ProjectDoc {
  slug: string;
  cat: Category;
  /** Only when verified — the content rule is: never invent dates. */
  year?: string;
  /** Position in the work index. */
  order?: number;
  nextSlug: string;
  title: string;
  desc: Localised;
  blocks: Block[];
}

const DIR = path.join(process.cwd(), "src", "content", "projects");

/**
 * One file per project, read at build time and validated once.
 *
 * Adding a project means adding a file here — no application code changes,
 * and the route, work index, sitemap and social card all follow.
 */
/** Populated by the last load(). One broken file must never take every
    other project down with it — see loadErrors() below. */
let lastErrors: string[] = [];

/**
 * One bad file must not 500 the whole site. Each file is read and validated
 * on its own; a broken one is skipped and reported, not thrown.
 */
function load(): ProjectDoc[] {
  const errors: string[] = [];
  const docs: ProjectDoc[] = [];

  for (const file of readdirSync(DIR).filter((f) => f.endsWith(".json"))) {
    let doc: ProjectDoc;
    try {
      doc = JSON.parse(readFileSync(path.join(DIR, file), "utf8")) as ProjectDoc;
    } catch (err) {
      errors.push(`${file}: not valid JSON — ${err instanceof Error ? err.message : err}`);
      continue;
    }

    const blockErrors = validateBlocks(doc.slug ?? file, doc.blocks ?? []);
    if (blockErrors.length) {
      errors.push(...blockErrors.map((e) => `${file}: ${e}`));
      continue;
    }

    docs.push(doc);
  }

  /* Mark media whose file has not landed yet, so the page shows the designed
     empty well instead of a broken image. */
  for (const doc of docs) {
    const has = (src: string) =>
      existsSync(path.join(process.cwd(), "public", "work", doc.slug, src));
    const mark = (m: { src?: string; missing?: boolean }) => {
      if (m.src) m.missing = !has(m.src);
    };
    for (const b of doc.blocks) {
      if (b.type === "figure" || b.type === "textMedia") mark(b);
      if (b.type === "gallery") b.items.forEach(mark);
      if (b.type === "process") b.steps.forEach(mark);
    }
  }

  lastErrors = errors;
  if (errors.length && process.env.NODE_ENV !== "production") {
    console.error(`[projects] ${errors.length} project file(s) skipped:\n  ${errors.join("\n  ")}`);
  }

  // Explicit curatorial order first; then year (newest), then name.
  return docs.sort(
    (a, b) =>
      (a.order ?? 999) - (b.order ?? 999) ||
      (b.year ?? "").localeCompare(a.year ?? "") ||
      a.slug.localeCompare(b.slug),
  );
}

/** Files that failed to load on the last read, for the Studio tool to surface. */
export function loadErrors(): string[] {
  projects();
  return lastErrors;
}

/**
 * Cached for the production build, re-read every request in development —
 * otherwise editing a content file shows nothing until the server restarts,
 * which is most of what working on this site involves.
 */
let cached: ProjectDoc[] | null = null;

function projects(): ProjectDoc[] {
  if (process.env.NODE_ENV !== "production") return load();
  cached ??= load();
  return cached;
}

const tx = (v: Localised | undefined, locale: Locale): string =>
  v == null ? "" : typeof v === "string" ? v : (v[locale] ?? v.en);

export function getProjectDocs(): ProjectDoc[] {
  return projects();
}

export function getProjectDoc(slug: string): ProjectDoc | undefined {
  return projects().find((p) => p.slug === slug);
}

/** The headline outcome, if the project has a stats block with real numbers. */
function headline(doc: ProjectDoc, locale: Locale): Stat | undefined {
  for (const b of doc.blocks) {
    if (b.type !== "stats") continue;
    for (const item of b.items) {
      const label = tx(item.label, locale);
      if (label && !/^(replace|describe|add |write )/i.test(label)) {
        return { value: item.value, suffix: item.suffix, label };
      }
    }
  }
  return undefined;
}

/** A project is a draft until its prose is written. */
export function isDraftDoc(doc: ProjectDoc): boolean {
  const prose = doc.blocks
    .filter((b) => b.type === "text")
    .flatMap((b) => (b.type === "text" ? b.body : []));
  const first = tx(prose[0], "en");
  return !first || /^(replace|describe|add |write )/i.test(first.trim());
}

export function toCard(doc: ProjectDoc, locale: Locale): ProjectCard {
  const stat = headline(doc, locale);
  return {
    slug: doc.slug,
    cat: doc.cat,
    ...(doc.year ? { year: doc.year } : {}),
    title: doc.title,
    desc: tx(doc.desc, locale),
    ...(stat ? { stat } : {}),
  };
}

export function getCards(locale: Locale): ProjectCard[] {
  return projects().map((d) => toCard(d, locale));
}
