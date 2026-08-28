import { existsSync, readdirSync } from "node:fs";
import path from "node:path";

import { NextResponse } from "next/server";

const WORK_DIR = path.join(process.cwd(), "public", "work");

/** Files already sitting in a project's folder, so a picture can be reused
    across blocks without uploading it twice. */
export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get("slug") ?? "";
  if (!/^[a-z0-9-]+$/.test(slug)) return NextResponse.json({ files: [] });

  const dir = path.join(WORK_DIR, slug);
  if (!existsSync(dir)) return NextResponse.json({ files: [] });

  const files = readdirSync(dir).filter((f) => /\.(jpg|jpeg|png|webp|avif|gif|mp4|webm)$/i.test(f));
  return NextResponse.json({ files });
}
