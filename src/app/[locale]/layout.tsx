import type { Metadata, Viewport } from "next";
import { Fragment_Mono, Hanken_Grotesk, Schibsted_Grotesk } from "next/font/google";
import { notFound } from "next/navigation";

import { ClockStarter } from "@/components/ClockStarter";
import { Nav } from "@/components/Nav/Nav";
import { LOCALES, type Locale } from "@/lib/types";

import "./globals.css";

/* Self-hosted by next/font — no render-blocking request to Google, and no
   layout shift from a late webfont. latin-ext carries the Polish diacritics.

   Direction C from the type lab. Schibsted Grotesk is the display voice —
   an editorial grotesque with real personality in its heavy weights that
   almost no portfolio uses (Bricolage before it had become everyone's
   safe-quirky pick; Geist before that was the default of the moment).
   Hanken Grotesk warms the body; Fragment Mono replaces the developer-tool
   flavour of JetBrains in the labels. */
const display = Schibsted_Grotesk({
  subsets: ["latin", "latin-ext"],
  variable: "--lw-font-display-face",
  display: "swap",
});

const body = Hanken_Grotesk({
  subsets: ["latin", "latin-ext"],
  variable: "--lw-font-body",
  display: "swap",
});

/* Fragment Mono ships one weight — the labels never needed more. */
const mono = Fragment_Mono({
  subsets: ["latin", "latin-ext"],
  weight: "400",
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
      </body>
    </html>
  );
}
