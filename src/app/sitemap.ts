import type { MetadataRoute } from "next";

import { getProjects } from "@/lib/content";
import { LOCALES } from "@/lib/types";

const BASE = "https://takealuke.studio";

export default function sitemap(): MetadataRoute.Sitemap {
  const projects = getProjects();

  const alternates = (suffix: string) => ({
    languages: Object.fromEntries(
      LOCALES.map((l) => [l, `${BASE}/${l}${suffix}`]),
    ),
  });

  return LOCALES.flatMap((locale) => [
    {
      url: `${BASE}/${locale}`,
      changeFrequency: "monthly" as const,
      priority: 1,
      alternates: alternates(""),
    },
    {
      url: `${BASE}/${locale}/work`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
      alternates: alternates("/work"),
    },
    ...projects.map((p) => ({
      url: `${BASE}/${locale}/work/${p.slug}`,
      changeFrequency: "yearly" as const,
      priority: 0.6,
      alternates: alternates(`/work/${p.slug}`),
    })),
  ]);
}
