import type { Metadata, Viewport } from "next";
import { Archivo, Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ClockStarter } from "@/components/ClockStarter";
import { Editor } from "@/components/Editor/Editor";
import { Nav } from "@/components/Nav/Nav";
import { LOCALES, type Locale } from "@/lib/types";

import "./globals.css";

/* Self-hosted by next/font — no render-blocking request to Google, and no
   layout shift from a late webfont. latin-ext carries the Polish diacritics.

   Bricolage Grotesque is the display voice: a variable grotesque drawn
   deliberately imperfect, with a width axis we drive from scroll velocity.
   Geist was replaced because it is the default of the moment — an excellent,
   invisible choice that made the site read as anyone's. */
const display = Bricolage_Grotesque({
  subsets: ["latin", "latin-ext"],
  axes: ["opsz", "wdth"],
  variable: "--lw-font-display-face",
  display: "swap",
});

const body = Archivo({
  subsets: ["latin", "latin-ext"],
  variable: "--lw-font-body",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  variable: "--lw-font-mono-face",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://takealuke.studio"),
};

export const viewport: Viewport = {
  themeColor: "#FCFBF8",
};

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!LOCALES.includes(locale as Locale)) notFound();

  return (
    <html
      lang={locale}
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <body>
        {/* The animation clock starts before any third-party embed mounts — a
            cal.com failure must never take down the springs or the gradients. */}
        <ClockStarter />
        <Nav locale={locale as Locale} />
        <main id="main">{children}</main>
        {/* Development-only content editor, reached with ?edit=1 */}
        {process.env.NODE_ENV !== "production" ? (
          <Suspense fallback={null}>
            <Editor />
          </Suspense>
        ) : null}
      </body>
    </html>
  );
}
