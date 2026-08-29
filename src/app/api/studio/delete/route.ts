import { existsSync, readdirSync } from "node:fs";
import { rm } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

const DIR = path.join(process.cwd(), "src", "content", "projects");
const WORK_DIR = path.join(process.cwd(), "public", "work");

/**
 * Removes a project. Its pictures are only removed when explicitly asked —
 * but leaving them has a sharp edge: recreating a project with the same
 * slug would silently pick the old images back up. The Studio asks which
 * you want rather than choosing for you.
 */
export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "The editor only runs during development." }, { status: 403 });
  }

  const { slug, deleteImages } = (await request.json()) as {
    slug?: string;
    deleteImages?: boolean;
  };

  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ error: "Unknown project." }, { status: 400 });
  }

  const file = path.join(DIR, `${slug}.json`);
  if (existsSync(file)) await rm(file);

  let imagesRemoved = 0;
  if (deleteImages) {
    const dir = path.join(WORK_DIR, slug);
    if (existsSync(dir)) {
      imagesRemoved = readdirSync(dir).length;
      await rm(dir, { recursive: true, force: true });
    }
  }

  return NextResponse.json({ ok: true, imagesRemoved });
}
