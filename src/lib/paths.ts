import { existsSync } from "node:fs";
import path from "node:path";

/**
 * Locate the site root by walking up from cwd looking for the content file.
 *
 * process.cwd() is correct when the dev server is started normally, but a
 * launcher that starts node from elsewhere silently resolves paths against
 * the wrong directory — and the resulting ENOENT is a confusing way to find
 * that out. Walking up makes the editor work regardless.
 */
export function siteRoot(): string {
  let dir = process.cwd();
  for (let i = 0; i < 6; i++) {
    if (existsSync(path.join(dir, "src", "content", "projects.json"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  // Fall back to cwd so the caller's own error names the real path.
  return process.cwd();
}

export const contentFile = (): string =>
  path.join(siteRoot(), "src", "content", "projects.json");

export const imagesFile = (): string =>
  path.join(siteRoot(), "src", "content", "images.json");

export const publicWorkDir = (): string =>
  path.join(siteRoot(), "public", "work");
