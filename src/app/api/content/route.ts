import { promises as fs } from "node:fs";

import { NextResponse } from "next/server";

import { contentFile } from "@/lib/paths";
import { SECTIONS, type ProjectsFile, type SectionKind } from "@/lib/types";

/**
 * Writes copy edits back to projects.json.
 *
 * DEV ONLY. This touches the filesystem, which is both a security hole and a
 * no-op on a serverless host. The editor is a local authoring tool: run
 * `npm run dev`, edit, commit the JSON.
 */
function devOnly() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "The content editor only runs in development." },
      { status: 403 },
    );
  }
  return null;
}

/** Apply "slug.locale.field" or "slug.locale.field.0" paths onto the file. */
function applyEdit(
  data: ProjectsFile,
  editPath: string,
  value: string,
): boolean {
  const [slug, locale, ...rest] = editPath.split(".");
  const project = data.projects.find((p) => p.slug === slug);
  if (!project || (locale !== "en" && locale !== "pl") || rest.length === 0) {
    return false;
  }

  let target: Record<string, unknown> = project[locale] as unknown as Record<
    string,
    unknown
  >;

  for (let i = 0; i < rest.length - 1; i++) {
    const next = target[rest[i]];
    if (next === null || typeof next !== "object") return false;
    target = next as Record<string, unknown>;
  }

  const leaf = rest[rest.length - 1];
  if (!(leaf in target)) return false;
  target[leaf] = value;
  return true;
}

/** Replace a project's section order, or clear it back to the default. */
function applySections(
  data: ProjectsFile,
  slug: string,
  order: string[] | null,
): string | null {
  const project = data.projects.find((p) => p.slug === slug);
  if (!project) return `Unknown project: ${slug}`;

  if (order === null) {
    delete project.sections;
    return null;
  }
  const bad = order.filter((s) => !SECTIONS.includes(s as SectionKind));
  if (bad.length) return `Unknown sections: ${bad.join(", ")}`;
  if (new Set(order).size !== order.length) return "A section is listed twice.";

  project.sections = order as SectionKind[];
  return null;
}

export async function POST(request: Request) {
  const blocked = devOnly();
  if (blocked) return blocked;

  let body: {
    edits?: Record<string, string>;
    sections?: { slug: string; order: string[] | null };
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const edits = body.edits ?? {};
  const keys = Object.keys(edits);
  if (keys.length === 0 && !body.sections) {
    return NextResponse.json({ saved: 0, rejected: [] });
  }

  const file = contentFile();
  const raw = await fs.readFile(file, "utf8");
  const data = JSON.parse(raw) as ProjectsFile;

  const rejected: string[] = [];
  let saved = 0;
  for (const key of keys) {
    if (applyEdit(data, key, edits[key])) saved++;
    else rejected.push(key);
  }

  let sectionError: string | null = null;
  if (body.sections) {
    sectionError = applySections(data, body.sections.slug, body.sections.order);
    if (!sectionError) saved++;
  }

  if (saved > 0) {
    await fs.writeFile(file, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  }

  return NextResponse.json({ saved, rejected, sectionError });
}
