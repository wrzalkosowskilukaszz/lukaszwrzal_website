import type { BlockType, Localised } from "@/blocks/types";
import type { Category } from "@/lib/types";

/**
 * The shapes the Studio form works with. Loosely typed on purpose — the
 * form is generated from schema.ts, so a block's fields are read and
 * written by key rather than through the strict discriminated union the
 * rendered site uses. The server re-validates against the real types
 * before anything is written to disk.
 */
export type DraftBlock = { type: BlockType; [key: string]: unknown };

export interface DraftDoc {
  slug: string;
  cat: Category | "";
  year: string;
  nextSlug: string;
  title: string;
  desc: Localised;
  blocks: DraftBlock[];
}

export function emptyDoc(): DraftDoc {
  return { slug: "", cat: "", year: new Date().getFullYear().toString(), nextSlug: "", title: "", desc: "", blocks: [] };
}

/** A gentle starting point rather than a blank page. */
export function starterBlocks(): DraftBlock[] {
  return [
    { type: "hero", variant: "centred", title: "" },
    { type: "figure", src: "", width: "stage" },
    { type: "meta", items: [{ label: "Role", value: "" }, { label: "Scope", value: "" }] },
    { type: "text", variant: "two-column", body: [""] },
    { type: "credits", roles: [{ role: "Design", name: "Lukasz Wrzal" }] },
  ];
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFKD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
