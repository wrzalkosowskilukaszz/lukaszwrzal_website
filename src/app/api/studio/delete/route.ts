import { existsSync } from "node:fs";
import { rm } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

const DIR = path.join(process.cwd(), "src", "content", "projects");

/** Removes a project's content file. Its picture folder is left alone. */
export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "The editor only runs during development." }, { status: 403 });
  }
  const { slug } = (await request.json()) as { slug?: string };
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ error: "Unknown project." }, { status: 400 });
  }
  const file = path.join(DIR, `${slug}.json`);
  if (existsSync(file)) await rm(file);
  return NextResponse.json({ ok: true });
}
