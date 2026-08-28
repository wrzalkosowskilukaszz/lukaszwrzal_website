import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { About } from "@/components/About/About";
import { Bento } from "@/components/Bento/Bento";
import { Clients } from "@/components/Clients/Clients";
import { Footer } from "@/components/Footer/Footer";
import { Hero } from "@/components/Hero/Hero";
import { Reveal } from "@/components/Reveal";
import { HeroReel } from "@/components/HeroReel/HeroReel";
import { PersonSchema } from "@/components/StructuredData";
import { getCards } from "@/lib/projects";
import { t } from "@/lib/i18n";
import { LOCALES, type Locale } from "@/lib/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const l = (LOCALES.includes(locale as Locale) ? locale : "en") as Locale;
  return {
    title: "Lukasz Wrzal — Creative Designer & AI Director",
    description: `${t(l, "heroLedeA")} ${t(l, "heroLedeB")}`,
    alternates: {
      canonical: `/${l}`,
      languages: { en: "/en", pl: "/pl" },
    },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!LOCALES.includes(locale as Locale)) notFound();
  const l = locale as Locale;

  const bento = getCards(l).slice(0, 6);
  const reel = getCards(l).slice(0, 3);

  const points = [
    { title: t(l, "aboutPoint1Title"), body: t(l, "aboutPoint1Body") },
    { title: t(l, "aboutPoint2Title"), body: t(l, "aboutPoint2Body") },
    { title: t(l, "aboutPoint3Title"), body: t(l, "aboutPoint3Body") },
  ];

  return (
    <>
      <PersonSchema locale={l} />
      {/* The hero and reel are present on load — no entry animation above
          the fold. Everything below reveals as it is reached. */}
      <Hero locale={l} />
      <HeroReel projects={reel} locale={l} />

      <Reveal>
        <Bento projects={bento} locale={l} />
      </Reveal>
      <Reveal>
        <About locale={l} points={points} />
      </Reveal>
      <Reveal>
        <Clients locale={l} />
      </Reveal>
      <Reveal>
        <Footer locale={l} variant="booking" />
      </Reveal>
    </>
  );
}
