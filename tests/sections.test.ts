import { describe, expect, it } from "vitest";

import projects from "@/content/projects.json";
import { DEFAULT_SECTIONS, SECTIONS, type ProjectsFile } from "@/lib/types";

const FILE = projects as unknown as ProjectsFile;

describe("case-study sections", () => {
  it("the default order uses every block exactly once", () => {
    expect(new Set(DEFAULT_SECTIONS).size).toBe(DEFAULT_SECTIONS.length);
    expect([...DEFAULT_SECTIONS].sort()).toEqual([...SECTIONS].sort());
  });

  it("every project's custom order names only real sections", () => {
    for (const p of FILE.projects) {
      if (!p.sections) continue;
      for (const s of p.sections) {
        expect(SECTIONS).toContain(s);
      }
    }
  });

  it("no project repeats a section", () => {
    for (const p of FILE.projects) {
      if (!p.sections) continue;
      expect(new Set(p.sections).size).toBe(p.sections.length);
    }
  });
});
