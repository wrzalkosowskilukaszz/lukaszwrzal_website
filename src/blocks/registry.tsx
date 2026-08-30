import { Gallery, Figure, TextMedia, Video } from "./MediaBlocks";
import { Deck } from "./DeckBlock";
import { Story } from "./StoryBlock";
import { Process } from "./ProcessBlock";
import { Stats } from "./StatsBlock";
import { Credits, Hero, List, Meta, Quote, Statement, Text } from "./TextBlocks";
import type { BlockContext } from "./shared";
import type { Block, BlockType } from "./types";

/**
 * type → component. This is the only place a block type is registered.
 *
 * Adding a new kind of block means writing one component and adding one line
 * here. Adding a PROJECT means writing a content file and touching nothing.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const REGISTRY: Record<BlockType, (props: any) => React.ReactNode> = {
  hero: Hero,
  meta: Meta,
  text: Text,
  statement: Statement,
  figure: Figure,
  gallery: Gallery,
  textMedia: TextMedia,
  list: List,
  quote: Quote,
  process: Process,
  story: Story,
  deck: Deck,
  stats: Stats,
  video: Video,
  credits: Credits,
};

export function renderBlock(block: Block, ctx: BlockContext, key: React.Key) {
  const Component = REGISTRY[block.type];
  if (!Component) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[blocks] unknown block type: ${(block as { type: string }).type}`);
    }
    return null;
  }
  return <Component key={key} block={block} ctx={ctx} index={typeof key === "number" ? key : undefined} />;
}

export { REGISTRY };
