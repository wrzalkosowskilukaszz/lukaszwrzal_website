import manifest from "@/content/images.json";

import type { FigureKey } from "./types";

/**
 * Figure images live in /public/work/<slug>/ and are listed here by slot.
 * Anything absent renders as the designed empty well (--lw-tile) rather than
 * a broken image, so the site is presentable before assets land.
 *
 * The in-site editor writes to this manifest when a file is dropped on a slot.
 */
type Manifest = Record<string, Partial<Record<FigureKey, string>>>;

const MANIFEST = manifest as Manifest;

export function imagesFor(slug: string): Partial<Record<FigureKey, string>> {
  return MANIFEST[slug] ?? {};
}
