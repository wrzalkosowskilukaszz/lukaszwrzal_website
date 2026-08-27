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

/**
 * A project is a draft until its body copy is written. Title, description,
 * category and year are real for all thirty, so a draft still belongs in
 * the index — it is only the case-study page that would show prompts.
 */
export function isDraft(copy: ProjectCopy): boolean {
  return (
    isPlaceholder(copy.statement) ||
    isPlaceholder(copy.brief?.[0]) ||
    isPlaceholder(copy.process?.[0]?.body) ||
    isPlaceholder(copy.outcome?.statement)
  );
}
