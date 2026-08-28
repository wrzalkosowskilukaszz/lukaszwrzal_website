import { mkdirSync, existsSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

const WORK_DIR = path.join(process.cwd(), "public", "work");

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp",
  "image/avif": "avif", "image/gif": "gif",
  "video/mp4": "mp4", "video/webm": "webm",
};

const MAX_BYTES = 60 * 1024 * 1024;

/** Saves a dropped file at its original resolution into public/work/<slug>/. */
export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "The editor only runs during development." }, { status: 403 });
  }

  const form = await request.formData();
  const file = form.get("file");
  const slug = String(form.get("slug") ?? "");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file was sent." }, { status: 400 });
  }
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ error: "Save the project's title and category first." }, { status: 400 });
  }
  const ext = EXT_BY_TYPE[file.type];
  if (!ext) {
    return NextResponse.json({ error: `"${file.name}" isn't a picture or video file.` }, { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: `"${file.name}" is larger than ${MAX_BYTES / 1024 / 1024}MB.` }, { status: 413 });
  }

  const dir = path.join(WORK_DIR, slug);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  // Keep the original name where possible so it stays recognisable.
  const base = file.name.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "") || "image";
  let filename = `${base}.${ext}`;
  let n = 1;
  while (existsSync(path.join(dir, filename))) {
    filename = `${base}-${++n}.${ext}`;
  }

  await writeFile(path.join(dir, filename), Buffer.from(await file.arrayBuffer()));

  return NextResponse.json({ filename, bytes: file.size });
}
