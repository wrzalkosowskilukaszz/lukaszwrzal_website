import { notFound } from "next/navigation";

import { Editor } from "@/components/Studio/Editor";
import { getProjectDoc, getProjectDocs } from "@/lib/projects";
import type { DraftDoc } from "@/studio/draft";

export const dynamic = "force-dynamic";

export default async function EditProject({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = getProjectDoc(slug);
  if (!doc) notFound();

  const draft: DraftDoc = {
    slug: doc.slug,
    cat: doc.cat,
    year: doc.year ?? "",
    nextSlug: doc.nextSlug,
    title: doc.title,
    desc: doc.desc,
    blocks: doc.blocks as unknown as DraftDoc["blocks"],
  };

  const others = getProjectDocs().map((d) => ({ slug: d.slug, title: d.title }));

  return <Editor initial={draft} originalSlug={doc.slug} otherProjects={others} />;
}
