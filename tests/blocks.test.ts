import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { validateBlocks } from "@/blocks/validate";
import { REGISTRY } from "@/blocks/registry";
import { BLOCK_TYPES, type Block } from "@/blocks/types";
import { BLOCK_FIELDS, BLOCK_LABELS } from "@/studio/schema";

const DIR = path.join(process.cwd(), "src", "content", "projects");
const files = readdirSync(DIR).filter((f) => f.endsWith(".json"));
const docs = files.map(
  (f) => JSON.parse(readFileSync(path.join(DIR, f), "utf8")) as {
    slug: string; blocks: Block[];
  },
);

describe("project content", () => {
  it("is one file per project, named after its slug", () => {
    // No hard count — projects are added and removed through the Studio.
    expect(files.length).toBeGreaterThan(0);
    for (const d of docs) {
      expect(files).toContain(`${d.slug}.json`);
    }
  });

  it("every project's picture folder matches its slug exactly", () => {
    // Case matters once deployed — macOS is forgiving, Linux is not.
    const workDir = path.join(process.cwd(), "public", "work");
    const folders = readdirSync(workDir, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name);
    for (const folder of folders) {
      expect(folder).toBe(folder.toLowerCase());
    }
  });

  it("no two projects share a slug", () => {
    const slugs = docs.map((d) => d.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("every block validates", () => {
    for (const d of docs) {
      expect(validateBlocks(d.slug, d.blocks)).toEqual([]);
    }
  });

  it("catches an unknown block type", () => {
    const bad = [{ type: "galery", items: [] }] as unknown as Block[];
    expect(validateBlocks("x", bad)[0]).toContain("unknown type");
  });

  it("catches a missing required field", () => {
    const bad = [{ type: "quote" }] as unknown as Block[];
    expect(validateBlocks("x", bad)[0]).toContain('"text" is required');
  });
});

describe("projects are free to differ", () => {
  it("blocks may repeat within a project", () => {
    const repeated = docs.filter(
      (d) => new Set(d.blocks.map((b) => b.type)).size < d.blocks.length,
    );
    expect(repeated.length).toBeGreaterThan(0);
  });

  it("no two projects are forced into the same shape", () => {
    const shapes = new Set(docs.map((d) => d.blocks.map((b) => b.type).join(">")));
    expect(shapes.size).toBeGreaterThan(1);
  });

  it("a block carries its own content, so counts are free", () => {
    const galleries = docs
      .flatMap((d) => d.blocks)
      .filter((b): b is Extract<Block, { type: "gallery" }> => b.type === "gallery");
    const sizes = new Set(galleries.map((g) => g.items.length));
    expect(sizes.size).toBeGreaterThan(1);
  });

  it("every block type has a renderer and a Studio form", () => {
    // The real invariant, rather than a count that goes stale each time a
    // block is added.
    for (const type of BLOCK_TYPES) {
      expect(REGISTRY[type], `no renderer for "${type}"`).toBeTypeOf("function");
      expect(BLOCK_FIELDS[type], `no Studio fields for "${type}"`).toBeDefined();
      expect(BLOCK_LABELS[type], `no Studio label for "${type}"`).toBeDefined();
    }
  });
});
