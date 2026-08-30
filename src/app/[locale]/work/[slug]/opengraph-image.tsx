import { ImageResponse } from "next/og";

import { getProjectDoc, getProjectDocs, isDraftDoc, toCard } from "@/lib/projects";
import { CATEGORY_LABELS } from "@/lib/i18n";
import { LOCALES, type Locale } from "@/lib/types";

export const alt = "Project — Lukasz Wrzal";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return LOCALES.flatMap((locale) =>
    getProjectDocs()
      .filter((d) => !isDraftDoc(d))
      .map((d) => ({ locale, slug: d.slug })),
  );
}

const HUES: Record<string, string> = {
  identity: "#3C2CC2",
  product: "#0F8B7E",
  brand: "#C2761B",
  web: "#2563EB",
  campaign: "#C026A3",
  illustrations: "#E4572E",
};

/** A shared case study shows the project, in its own discipline's colour. */
export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const l = (LOCALES.includes(locale as Locale) ? locale : "en") as Locale;
  const doc = getProjectDoc(slug);
  const project = doc ? toCard(doc, l) : undefined;
  const hue = project ? HUES[project.cat] ?? "#3C2CC2" : "#3C2CC2";
  const stat = project?.stat;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#071A31",
        }}
      >
        {/* The project's discipline, as a full-height spine. */}
        <div style={{ display: "flex", width: 22, background: hue }} />

        <div
          style={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "68px 72px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                display: "flex",
                width: 13,
                height: 13,
                borderRadius: 9999,
                background: hue,
              }}
            />
            <div
              style={{
                display: "flex",
                fontFamily: "monospace",
                fontSize: 21,
                letterSpacing: 5,
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.62)",
              }}
            >
              {project ? CATEGORY_LABELS[l][project.cat] : "Work"}
              {project?.year ? ` · ${project.year}` : ""}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div
              style={{
                display: "flex",
                fontSize: 100,
                lineHeight: 1,
                letterSpacing: -4.5,
                color: "#FFFFFF",
              }}
            >
              {project?.title ?? "Work"}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 30,
                lineHeight: 1.3,
                color: "rgba(255,255,255,0.72)",
                maxWidth: 860,
              }}
            >
              {project?.desc ?? ""}
            </div>
            {stat ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 14,
                  fontFamily: "monospace",
                  fontSize: 24,
                  color: "#5EE7C5",
                }}
              >
                {`${stat.value.toLocaleString("en-US")}${stat.suffix ?? ""} · ${stat.label}`}
              </div>
            ) : null}
          </div>

          <div
            style={{
              display: "flex",
              fontFamily: "monospace",
              fontSize: 21,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.5)",
            }}
          >
            Lukasz Wrzal · takealuke.studio
          </div>
        </div>
      </div>
    ),
    size,
  );
}
