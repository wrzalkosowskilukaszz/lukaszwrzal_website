"use client";

import { renderBlock } from "./registry";
import s from "./blocks.module.css";
import { spacingFor, type BlockContext } from "./shared";
import type { Block } from "./types";

/**
 * The whole project page.
 *
 * This file does not change when you add a project, reorder sections, or
 * invent a new layout — only when a genuinely new KIND of block is added,
 * and then only in the registry.
 */
export function BlockList({ blocks, ctx }: { blocks: Block[]; ctx: BlockContext }) {
  return (
    <>
      {blocks.map((block, i) => (
        <div
          key={i}
          className={s.block}
          style={{ ["--block-space" as string]: spacingFor(block.spacing) }}
          data-block={block.type}
        >
          {renderBlock(block, ctx, i)}
        </div>
      ))}
    </>
  );
}
