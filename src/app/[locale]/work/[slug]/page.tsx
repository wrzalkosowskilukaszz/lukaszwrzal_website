import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CaseStudy } from "@/components/CaseStudy/CaseStudy";
import { getLocalisedProject, getProjects } from "@/lib/content";
import { isDraft, realStats } from "@/lib/placeholder";
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

  /* A project whose body copy is still authoring prompts is a draft. It
     keeps its row in the index — title, description, category and year are
     all real — but its case-study page would be 29 screens of "Replace this
     paragraph with…". Visible while writing, 404 once deployed. */
  if (isDraft(project.copy) && process.env.NODE_ENV === "production") {
    notFound();
  }

  // Unwritten outcomes are authoring prompts, not content — drop them here
  // rather than filtering at render, so they never reach the browser.
  const clean = {
    ...project,
    copy: { ...project.copy, stats: realStats(project.copy.stats) },
  };

  const nextProject = getLocalisedProject(project.nextSlug, l) ?? project;
  const next = { slug: nextProject.slug, title: nextProject.copy.title };

  return (
    <CaseStudy
      project={clean}
      next={next}
      locale={l}
      images={imagesFor(slug)}
    />
  );
}
