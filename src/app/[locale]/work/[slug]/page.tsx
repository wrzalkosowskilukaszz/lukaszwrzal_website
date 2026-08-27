import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CaseStudy } from "@/components/CaseStudy/CaseStudy";
import { getLocalisedProject, getProjects } from "@/lib/content";
import { imagesFor } from "@/lib/images";
import { LOCALES, type Locale } from "@/lib/types";

/** One template, 30 projects x 2 locales, pre-rendered. Never 30 page files. */
export function generateStaticParams() {
  return LOCALES.flatMap((locale) =>
    getProjects().map((p) => ({ locale, slug: p.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const l = (LOCALES.includes(locale as Locale) ? locale : "en") as Locale;
  const project = getLocalisedProject(slug, l);
  if (!project) return {};

  return {
    title: `${project.copy.title} — Lukasz Wrzal`,
    description: project.copy.lede,
    alternates: {
      canonical: `/${l}/work/${slug}`,
      languages: { en: `/en/work/${slug}`, pl: `/pl/work/${slug}` },
    },
    openGraph: {
      title: `${project.copy.title} — Lukasz Wrzal`,
      description: project.copy.lede,
      type: "article",
    },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!LOCALES.includes(locale as Locale)) notFound();
  const l = locale as Locale;

  const project = getLocalisedProject(slug, l);
  if (!project) notFound();

  const next = getLocalisedProject(project.nextSlug, l) ?? project;

  return (
    <CaseStudy
      project={project}
      next={next}
      locale={l}
      images={imagesFor(slug)}
    />
  );
}
