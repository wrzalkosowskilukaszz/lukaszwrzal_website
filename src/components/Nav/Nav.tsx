"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { Logo } from "@/components/Logo/Logo";
import { useMagnetic } from "@/hooks/useMagnetic";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { subscribe } from "@/lib/raf";
import { Spring } from "@/lib/spring";
import { t } from "@/lib/i18n";
import type { Locale } from "@/lib/types";
import { LOCALES } from "@/lib/types";

import styles from "./Nav.module.css";

export interface NavProps {
  locale: Locale;
}

export function Nav({ locale }: NavProps) {
  const pathname = usePathname();
  const ctaRef = useMagnetic<HTMLAnchorElement>();
  const langRef = useRef<HTMLDivElement | null>(null);
  const chipRef = useRef<HTMLSpanElement | null>(null);
  const reduced = useReducedMotion();

  /* The active chip travels between EN and PL on a spring. Measured from
     the live DOM so it stays correct at any font size or language width. */
  useEffect(() => {
    const wrap = langRef.current;
    const chip = chipRef.current;
    if (!wrap || !chip) return;

    const left = new Spring(0, 190, 22);
    const width = new Spring(0, 190, 22);
    let first = true;

    const stop = subscribe((dt) => {
      const active = wrap.querySelector<HTMLElement>('[data-active="true"]');
      if (!active) return;

      left.target = active.offsetLeft;
      width.target = active.offsetWidth;

      if (first || reduced) {
        left.set(left.target);
        width.set(width.target);
        first = false;
      } else {
        left.step(dt);
        width.step(dt);
      }
      chip.style.transform = `translateX(${left.v.toFixed(2)}px)`;
      chip.style.width = `${width.v.toFixed(2)}px`;
    });

    return stop;
  }, [reduced]);

  /** Same page, other language — swap only the locale segment. */
  const swapLocale = (next: Locale) => {
    const rest = pathname.replace(/^\/(en|pl)(?=\/|$)/, "") || "/";
    return `/${next}${rest === "/" ? "" : rest}`;
  };

  const isActive = (href: string) =>
    href === `/${locale}` ? pathname === href : pathname.startsWith(href);

  /* Priority 1 never sheds. A phone must always have a route to the work. */
  const links = [
    { href: `/${locale}/work`, label: t(locale, "navWork"), priority: 1 },
    { href: `/${locale}#about`, label: t(locale, "navAbout"), priority: 2 },
    { href: `/${locale}#connect`, label: t(locale, "navConnect"), priority: 3 },
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
              data-priority={l.priority}
              data-active={isActive(l.href) || undefined}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <span className={styles.sep} aria-hidden="true" />

        <div className={styles.lang} role="group" aria-label={t(locale, "langLabel")} ref={langRef}>
          <span className={styles.langChip} ref={chipRef} aria-hidden="true" />
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

        <Link href={`/${locale}#connect`} className={styles.cta} ref={ctaRef}>
          {t(locale, "navCta")}
        </Link>
      </nav>
    </div>
  );
}
