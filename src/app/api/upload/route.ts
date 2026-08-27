import { promises as fs } from "node:fs";
import path from "node:path";

import { NextResponse } from "next/server";

import { imagesFile, publicWorkDir } from "@/lib/paths";

const SLOTS = new Set([
  "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12",
]);

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/webm": "webm",
};

const MAX_BYTES = 40 * 1024 * 1024;

/**
 * Saves a dropped file into /public/work/<slug>/ at its ORIGINAL resolution
 * and records it in the image manifest.
 *
 * This is the whole point of doing content here rather than in the design
 * prototypes: those capped uploads at 1200px, re-encoded to WebP and kept the
 * result in browser storage. A portfolio needs the original file.
 *
 * DEV ONLY, like the content route.
 */
export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "The content editor only runs in development." },
      { status: 403 },
    );
  }

  const form = await request.formData();
  const file = form.get("file");
  const slug = String(form.get("slug") ?? "");
  const slot = String(form.get("slot") ?? "");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file supplied." }, { status: 400 });
  }
  // Reject anything that could escape the work directory.
  if (!/^[a-z0-9-]+$/.test(slug) || !SLOTS.has(slot)) {
    return NextResponse.json({ error: "Unknown slug or slot." }, { status: 400 });
  }
  const ext = EXT_BY_TYPE[file.type];
  if (!ext) {
    return NextResponse.json(
      { error: `Unsupported file type: ${file.type || "unknown"}` },
      { status: 415 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `File is larger than ${MAX_BYTES / 1024 / 1024}MB.` },
      { status: 413 },
    );
  }

  const dir = path.join(publicWorkDir(), slug);
  await fs.mkdir(dir, { recursive: true });

  // Drop any previous file for this slot so extensions cannot collide.
  for (const previous of Object.values(EXT_BY_TYPE)) {
    await fs.rm(path.join(dir, `${slot}.${previous}`), { force: true });
  }

  const filename = `${slot}.${ext}`;
  await fs.writeFile(
    path.join(dir, filename),
    Buffer.from(await file.arrayBuffer()),
  );

  const url = `/work/${slug}/${filename}`;

  let manifest: Record<string, Record<string, string>> = {};
  try {
    manifest = JSON.parse(await fs.readFile(imagesFile(), "utf8"));
  } catch {
    manifest = {};
  }
  manifest[slug] = { ...(manifest[slug] ?? {}), [slot]: url };
  await fs.writeFile(imagesFile(), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  return NextResponse.json({ url, bytes: file.size });
}
