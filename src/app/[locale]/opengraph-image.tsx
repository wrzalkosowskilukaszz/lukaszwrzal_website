import { ImageResponse } from "next/og";

import { t } from "@/lib/i18n";
import { getProjectDocs } from "@/lib/projects";
import { CATEGORIES, LOCALES, type Locale } from "@/lib/types";

export const alt = "Lukasz Wrzal — Creative Designer & AI Director";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

const HUES: Record<string, string> = {
  identity: "#3C2CC2",
  product: "#0F8B7E",
  brand: "#C2761B",
  web: "#2563EB",
  campaign: "#C026A3",
  illustrations: "#E4572E",
};

/**
 * Every link shared during a job hunt renders as this card — the most-seen
 * surface on the site, and previously a bare title.
 *
 * Deliberately built from flat colour rather than the site's aurora: Satori
 * renders blur as hard bands and flattens layered gradients, and a card
 * viewed at 500px wide in a chat preview wants sharpness, not atmosphere.
 * The spine is the real portfolio — six disciplines, weighted by how many
 * projects each holds.
 */
export default async function Image({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const l = (LOCALES.includes(locale as Locale) ? locale : "en") as Locale;

  /* The spine is the real portfolio: one band per discipline, sized by how
     many projects it holds. Computed, so it can never go stale again. */
  const docs = getProjectDocs();
  const spectrum = CATEGORIES.map((cat) => ({
    hue: HUES[cat],
    n: docs.filter((d) => d.cat === cat).length,
  })).filter((b) => b.n > 0);

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
        {/* Discipline spine: each band's height is that category's share. */}
        <div style={{ display: "flex", flexDirection: "column", width: 22 }}>
          {spectrum.map((b) => (
            <div key={b.hue} style={{ display: "flex", flexGrow: b.n, background: b.hue }} />
          ))}
        </div>

        <div
          style={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "68px 72px",
          }}
        >
          <div
            style={{
              display: "flex",
              fontFamily: "monospace",
              fontSize: 21,
              letterSpacing: 5,
              color: "rgba(255,255,255,0.55)",
            }}
          >
            TAKEALUKE.STUDIO
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
            <div
              style={{
                display: "flex",
                fontSize: 82,
                lineHeight: 1.02,
                letterSpacing: -3.5,
                color: "#FFFFFF",
                maxWidth: 900,
              }}
            >
              Lukasz Wrzal
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 38,
                lineHeight: 1.15,
                letterSpacing: -1,
                color: "#5EE7C5",
              }}
            >
              Creative Designer &amp; AI Director
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 27,
                lineHeight: 1.35,
                color: "rgba(255,255,255,0.7)",
                maxWidth: 800,
              }}
            >
              {t(l, "heroLedeA")}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              fontFamily: "monospace",
              fontSize: 21,
              letterSpacing: 3,
              color: "rgba(255,255,255,0.55)",
            }}
          >
            {`${docs.length} PROJECTS · WARSAW · AVAILABLE FOR NEW WORK`}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
