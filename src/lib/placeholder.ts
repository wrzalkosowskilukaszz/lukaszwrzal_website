import type { ProjectCopy, Stat } from "./types";

/**
 * 29 of 30 projects still carry authoring prompts in place of real copy
 * ("Replace with a real number", "Replace this paragraph with…").
 *
 * They are useful while writing and must never reach a visitor — least of
 * all a social card, which is the most-shared surface on the site. The
 * handoff is explicit: preserve them as prompts, don't ship them.
 */
const PROMPT = /^(replace|describe|name the|write |add |summarise|outline)\b/i;

export function isPlaceholder(text: string | undefined | null): boolean {
  return typeof text === "string" && PROMPT.test(text.trim());
}

/** Only stats a reader should actually see. */
export function realStats(stats: Stat[] | undefined): Stat[] {
  if (!stats) return [];
  return stats.filter((s) => !isPlaceholder(s.label));
}

/** The headline outcome, or nothing if it hasn't been written yet. */
export function headlineStat(copy: ProjectCopy): Stat | undefined {
  return realStats(copy.stats)[0];
}
