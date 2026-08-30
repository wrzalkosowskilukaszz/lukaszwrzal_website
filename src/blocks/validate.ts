import { BLOCK_TYPES, type Block, type BlockType } from "./types";

/** Fields a block cannot render without. */
const REQUIRED: Partial<Record<BlockType, string[]>> = {
  hero: ["title"],
  meta: ["items"],
  text: ["body"],
  statement: ["text"],
  figure: ["src"],
  gallery: ["items"],
  textMedia: ["src", "body"],
  quote: ["text"],
  process: ["steps"],
  stats: ["items"],
  video: ["src"],
  credits: ["roles"],
};

/**
 * Checked at build time. A mistyped block type or a missing field should name
 * itself, not produce a silently empty page.
 */
export function validateBlocks(slug: string, blocks: Block[]): string[] {
  const errors: string[] = [];

  blocks.forEach((block, i) => {
    const where = `${slug} block ${i} (${block.type ?? "no type"})`;

    if (!BLOCK_TYPES.includes(block.type)) {
      errors.push(`${where}: unknown type. Expected one of ${BLOCK_TYPES.join(", ")}`);
      return;
    }
    for (const field of REQUIRED[block.type] ?? []) {
      const value = (block as unknown as Record<string, unknown>)[field];
      const empty = value == null || (Array.isArray(value) && value.length === 0);
      if (empty) errors.push(`${where}: "${field}" is required`);
    }
  });

  if (blocks.filter((b) => b.type === "hero").length > 1) {
    errors.push(`${slug}: more than one hero block`);
  }
  return errors;
}
