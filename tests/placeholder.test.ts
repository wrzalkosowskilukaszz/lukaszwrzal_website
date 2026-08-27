import { describe, expect, it } from "vitest";

import projects from "@/content/projects.json";
import { headlineStat, isPlaceholder, realStats } from "@/lib/placeholder";
import type { ProjectsFile } from "@/lib/types";

const FILE = projects as unknown as ProjectsFile;

describe("isPlaceholder", () => {
  it("catches the authoring prompts actually present in the content", () => {
    expect(isPlaceholder("Replace with a real number")).toBe(true);
    expect(isPlaceholder("  Replace this paragraph with the situation…")).toBe(true);
  });

  it("leaves real copy alone", () => {
    expect(isPlaceholder("Member-owners at launch")).toBe(false);
    expect(isPlaceholder("Lift in portal sign-ups, Q1")).toBe(false);
    expect(isPlaceholder("Surfaces the system holds")).toBe(false);
    // "Replacement rate" starts with "Replace" but is a real word, not a prompt.
    expect(isPlaceholder("Replacements avoided")).toBe(false);
  });

  it("handles missing values", () => {
    expect(isPlaceholder(undefined)).toBe(false);
    expect(isPlaceholder(null)).toBe(false);
    expect(isPlaceholder("")).toBe(false);
  });
});

describe("no placeholder ever reaches a public surface", () => {
  it("headlineStat returns nothing for an unwritten project", () => {
    const unwritten = FILE.projects.find((p) => p.slug === "thicket");
    expect(unwritten).toBeDefined();
    expect(headlineStat(unwritten!.en)).toBeUndefined();
  });

  it("headlineStat returns the real outcome for a written one", () => {
    const northwind = FILE.projects.find((p) => p.slug === "northwind");
    expect(headlineStat(northwind!.en)?.label).toBe("Member-owners at launch");
  });

  it("filters prompts out of every project, in both languages", () => {
    for (const p of FILE.projects) {
      for (const locale of ["en", "pl"] as const) {
        for (const stat of realStats(p[locale].stats)) {
          expect(isPlaceholder(stat.label)).toBe(false);
        }
      }
    }
  });

  it("still surfaces every written stat", () => {
    const northwind = FILE.projects.find((p) => p.slug === "northwind");
    expect(realStats(northwind!.en.stats)).toHaveLength(4);
  });
});
