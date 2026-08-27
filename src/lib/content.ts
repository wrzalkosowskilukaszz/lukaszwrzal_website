import projectsData from "@/content/projects.json";

import type {
  Category,
  Locale,
  LocalisedProject,
  Project,
  ProjectsFile,
} from "./types";
import { CATEGORIES } from "./types";

/**
 * Imported as a module, not read from disk — no runtime fetching and no
 * dependence on process.cwd(). See DESIGN-SPEC "State": read the JSON at build
 * time and pre-render 30 pages x 2 locales.
 */
const FILE = projectsData as unknown as ProjectsFile;

if (!Array.isArray(FILE.projects) || FILE.projects.length === 0) {
  throw new Error("src/content/projects.json holds no projects");
}

export const PROJECTS: Project[] = FILE.projects;

export function getProjects(): Project[] {
  return PROJECTS;
}

export function getProject(slug: string): Project | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}

export function localise(project: Project, locale: Locale): LocalisedProject {
  const { en, pl, ...rest } = project;
  return { ...rest, copy: locale === "pl" ? pl : en };
}

export function getLocalisedProjects(locale: Locale): LocalisedProject[] {
  return PROJECTS.map((p) => localise(p, locale));
}

export function getLocalisedProject(
  slug: string,
  locale: Locale,
): LocalisedProject | undefined {
  const p = getProject(slug);
  return p ? localise(p, locale) : undefined;
}

/** Homepage bento shows the first twelve. */
export function getBentoProjects(locale: Locale): LocalisedProject[] {
  return getLocalisedProjects(locale).slice(0, 12);
}

export function getCategoryCounts(): { cat: Category | "all"; count: number }[] {
  return [
    { cat: "all" as const, count: PROJECTS.length },
    ...CATEGORIES.map((cat) => ({
      cat,
      count: PROJECTS.filter((p) => p.cat === cat).length,
    })),
  ];
}
