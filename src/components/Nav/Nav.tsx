"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/Logo/Logo";
import { t } from "@/lib/i18n";
import type { Locale } from "@/lib/types";
import { LOCALES } from "@/lib/types";

import styles from "./Nav.module.css";

export interface NavProps {
  locale: Locale;
}

export function Nav({ locale }: NavProps) {
  const pathname = usePathname();

  /** Same page, other language — swap only the locale segment. */
  const swapLocale = (next: Locale) => {
    const rest = pathname.replace(/^\/(en|pl)(?=\/|$)/, "") || "/";
    return `/${next}${rest === "/" ? "" : rest}`;
  };

  const isActive = (href: string) =>
    href === `/${locale}` ? pathname === href : pathname.startsWith(href);

  const links = [
    { href: `/${locale}/work`, label: t(locale, "navWork") },
    { href: `/${locale}#about`, label: t(locale, "navAbout") },
    { href: `/${locale}#connect`, label: t(locale, "navConnect") },
  ];

  return (
    <div className={styles.wrap}>
      <a className={styles.skip} href="#main">
        {t(locale, "skipToContent")}
      </a>

      <nav className={styles.pill} aria-label="Primary">
        <Link href={`/${locale}`} className={styles.mark} aria-label="Lukasz Wrzal — home">
          <Logo variant="mark" size={20} decorative />
        </Link>

        <div className={styles.links}>
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={styles.link}
              data-active={isActive(l.href) || undefined}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <span className={styles.sep} aria-hidden="true" />

        <div className={styles.lang} role="group" aria-label={t(locale, "langLabel")}>
          {LOCALES.map((l) => (
            <Link
              key={l}
              href={swapLocale(l)}
              className={styles.langBtn}
              data-active={l === locale}
              hrefLang={l}
              aria-current={l === locale ? "true" : undefined}
            >
              {l}
            </Link>
          ))}
        </div>

        <Link href={`/${locale}#connect`} className={styles.cta}>
          {t(locale, "navCta")}
        </Link>
      </nav>
    </div>
  );
}
