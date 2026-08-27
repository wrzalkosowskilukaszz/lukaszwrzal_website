import { Aurora } from "@/components/Aurora/Aurora";
import { Logo } from "@/components/Logo/Logo";
import { ArrowRight } from "@/components/icons/Arrows";
import { t } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

import { CalEmbed } from "./CalEmbed";
import styles from "./Footer.module.css";

export interface FooterProps {
  locale: Locale;
  /** The homepage books in place; other pages link to it. */
  variant?: "booking" | "link";
}

export function Footer({ locale, variant = "link" }: FooterProps) {
  return (
    <footer className={styles.section} id="connect">
      <Aurora />

      <div className={styles.inner}>
        <Logo variant="lockup" size={26} className={styles.lockup} />

        <h2 className={styles.title}>{t(locale, "footerTitle")}</h2>
        <p className={styles.lede}>
          {t(locale, variant === "booking" ? "footerLede" : "footerLedeShort")}
        </p>

        {variant === "booking" ? (
          <>
            <CalEmbed locale={locale} />
            <p className={styles.emailLine}>
              {t(locale, "footerEmailLine").split("hello@takealuke.studio")[0]}
              <a href="mailto:hello@takealuke.studio">hello@takealuke.studio</a>
            </p>
          </>
        ) : (
          <a className={styles.pillCta} href={`/${locale}#connect`}>
            {t(locale, "bookCall")}
            <span className={styles.disc} aria-hidden="true">
              <ArrowRight />
            </span>
          </a>
        )}

        <div className={styles.bottom}>
          <span>{t(locale, "rights")}</span>
          <a href="https://www.linkedin.com/in/lukaszwrzal/" target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <span>{t(locale, "availability")}</span>
        </div>
      </div>
    </footer>
  );
}
