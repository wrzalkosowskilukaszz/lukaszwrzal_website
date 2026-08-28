import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProjectPage } from "@/components/CaseStudy/ProjectPage";
import { getProjectDoc, getProjectDocs, isDraftDoc, toCard } from "@/lib/projects";
import { LOCALES, type Locale } from "@/lib/types";

/** One route, N projects. Adding a project adds a content file, not a page. */
export function generateStaticParams() {
  return LOCALES.flatMap((locale) =>
    getProjectDocs()
      .filter((d) => !isDraftDoc(d))
      .map((d) => ({ locale, slug: d.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const l = (LOCALES.includes(locale as Locale) ? locale : "en") as Locale;
  const doc = getProjectDoc(slug);
  if (!doc) return {};
  const card = toCard(doc, l);

  return {
    title: `${doc.title} — Lukasz Wrzal`,
    description: card.desc,
    alternates: {
      canonical: `/${l}/work/${slug}`,
      languages: { en: `/en/work/${slug}`, pl: `/pl/work/${slug}` },
    },
    openGraph: { title: `${doc.title} — Lukasz Wrzal`, description: card.desc, type: "article" },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!LOCALES.includes(locale as Locale)) notFound();
  const l = locale as Locale;

  const doc = getProjectDoc(slug);
  if (!doc) notFound();

  /* Unwritten projects keep their row in the index but 404 in production. */
  if (isDraftDoc(doc) && process.env.NODE_ENV === "production") notFound();

  const next = getProjectDoc(doc.nextSlug) ?? doc;

  return (
    <ProjectPage
      doc={doc}
      locale={l}
      next={{ slug: next.slug, title: next.title }}
    />
  );
}
