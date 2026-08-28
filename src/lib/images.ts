import { existsSync, readdirSync } from "node:fs";
import path from "node:path";

import type { FigureKey } from "./types";

/**
 * Images are discovered from the filesystem, not from a manifest.
 *
 * Drop a file into `public/work/<slug>/` named after its slot — `01.jpg`,
 * `07.png`, `12.mp4` — and it appears. Nothing to register, nothing to keep
 * in sync, and no upload tool to go wrong.
 *
 * Slots with no file render the designed empty well.
 */
const PUBLIC_WORK = path.join(process.cwd(), "public", "work");

const SLOT = /^(0[1-9]|1[0-2])\.(jpg|jpeg|png|webp|avif|gif|mp4|webm)$/i;

/** Read once per build; the folder does not change while the server runs. */
const cache = new Map<string, Partial<Record<FigureKey, string>>>();

export function imagesFor(slug: string): Partial<Record<FigureKey, string>> {
  const hit = cache.get(slug);
  if (hit) return hit;

  const dir = path.join(PUBLIC_WORK, slug);
  const found: Partial<Record<FigureKey, string>> = {};

  if (existsSync(dir)) {
    for (const name of readdirSync(dir)) {
      const m = SLOT.exec(name);
      if (!m) continue;
      found[m[1] as FigureKey] = `/work/${slug}/${name}`;
    }
  }

  cache.set(slug, found);
  return found;
}
