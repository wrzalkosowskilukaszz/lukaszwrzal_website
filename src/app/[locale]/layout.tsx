import type { Metadata, Viewport } from "next";
import { Archivo, Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import { notFound } from "next/navigation";

import { ClockStarter } from "@/components/ClockStarter";
import { Nav } from "@/components/Nav/Nav";
import { LOCALES, type Locale } from "@/lib/types";

import "./globals.css";

/* Self-hosted by next/font — no render-blocking request to Google, and no
   layout shift from a late webfont. latin-ext carries the Polish diacritics.

   Bricolage Grotesque is the display voice: a variable grotesque drawn
   deliberately imperfect. Geist was replaced because it is the default of
   the moment — an excellent, invisible choice that made the site read as
   anyone's. Only the optical-size axis is loaded; the type does not move. */
const display = Bricolage_Grotesque({
  subsets: ["latin", "latin-ext"],
  axes: ["opsz"],
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
      </body>
    </html>
  );
}
