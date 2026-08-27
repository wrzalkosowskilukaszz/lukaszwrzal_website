import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Footer } from "@/components/Footer/Footer";
import { WorkBrowser } from "@/components/WorkGrid/WorkBrowser";
import { getLocalisedProjects } from "@/lib/content";
import { allImages } from "@/lib/images";
import { t } from "@/lib/i18n";
import { LOCALES, type Locale } from "@/lib/types";

import styles from "./work.module.css";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const l = (LOCALES.includes(locale as Locale) ? locale : "en") as Locale;
  return {
    title: `${t(l, "workTitle")} — Lukasz Wrzal`,
    description: t(l, "workLede"),
    alternates: {
      canonical: `/${l}/work`,
      languages: { en: "/en/work", pl: "/pl/work" },
    },
  };
}

export default async function WorkPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!LOCALES.includes(locale as Locale)) notFound();
  const l = locale as Locale;

  const projects = getLocalisedProjects(l);

  return (
    <>
      <header className={styles.header}>
        <p className="lw-eyebrow">{t(l, "workEyebrow")}</p>
        <h1 className={styles.title}>{t(l, "workTitle")}</h1>
        <p className={styles.lede}>{t(l, "workLede")}</p>
      </header>

      <WorkBrowser projects={projects} locale={l} images={allImages()} />

      <Footer locale={l} />
    </>
  );
}
