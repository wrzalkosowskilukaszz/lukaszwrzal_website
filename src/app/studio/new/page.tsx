import { Editor } from "@/components/Studio/Editor";
import { getProjectDocs } from "@/lib/projects";

export const dynamic = "force-dynamic";

export default function NewProject() {
  const others = getProjectDocs().map((d) => ({ slug: d.slug, title: d.title }));
  return <Editor initial={null} originalSlug={null} otherProjects={others} />;
}
