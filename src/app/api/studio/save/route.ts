import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { NextResponse } from "next/server";

import { validateBlocks } from "@/blocks/validate";
import type { Block } from "@/blocks/types";
import type { ProjectDoc } from "@/lib/projects";
import { CATEGORIES } from "@/lib/types";

const DIR = path.join(process.cwd(), "src", "content", "projects");
const WORK_DIR = path.join(process.cwd(), "public", "work");

/**
 * The only way project files are written. The browser never constructs
 * JSON text — it sends a plain object, this route validates it and writes
 * pretty-printed JSON itself. A malformed file is not a state the tool can
 * reach; the closest a user can get is a validation message with the
 * project name and field, before anything touches disk.
 */
export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ errors: ["The editor only runs during development."] }, { status: 403 });
  }

  let body: { doc: ProjectDoc; originalSlug?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ errors: ["The request was not valid."] }, { status: 400 });
  }

  const { doc, originalSlug } = body;
  const errors: string[] = [];

  if (!doc?.slug || !/^[a-z0-9-]+$/.test(doc.slug)) {
    errors.push("The project's URL name can only use lowercase letters, numbers and hyphens.");
  }
  if (!doc?.title?.trim()) errors.push("Give the project a title.");
  if (!doc?.year || !/^\d{4}$/.test(doc.year)) errors.push("Year must be four digits, e.g. 2026.");
  if (!doc?.cat || !CATEGORIES.includes(doc.cat)) errors.push("Choose a category.");
  if (!doc?.nextSlug?.trim()) errors.push("Choose which project the “next project” link points to.");
  if (!doc?.blocks?.length) errors.push("Add at least one section to the page.");

  if (doc?.slug && doc.slug !== originalSlug) {
    const taken = readdirSync(DIR).some((f) => f === `${doc.slug}.json`);
    if (taken) errors.push(`A project named "${doc.slug}" already exists.`);
  }

  if (doc?.blocks?.length) {
    errors.push(...validateBlocks(doc.slug || "this project", doc.blocks as Block[]));
  }

  if (errors.length) {
    return NextResponse.json({ errors }, { status: 422 });
  }

  // Renaming a project's slug: write the new file, remove the old one.
  if (originalSlug && originalSlug !== doc.slug) {
    const oldFile = path.join(DIR, `${originalSlug}.json`);
    if (existsSync(oldFile)) {
      const fs = await import("node:fs/promises");
      await fs.rm(oldFile, { force: true });
    }
  }

  const ordered: ProjectDoc & { $schema: string } = {
    $schema: "../project.schema.json",
    slug: doc.slug,
    cat: doc.cat,
    year: doc.year,
    nextSlug: doc.nextSlug,
    title: doc.title,
    desc: doc.desc,
    blocks: doc.blocks,
  };

  writeFileSync(path.join(DIR, `${doc.slug}.json`), `${JSON.stringify(ordered, null, 2)}\n`, "utf8");

  const assetDir = path.join(WORK_DIR, doc.slug);
  if (!existsSync(assetDir)) mkdirSync(assetDir, { recursive: true });

  return NextResponse.json({ ok: true, slug: doc.slug });
}
