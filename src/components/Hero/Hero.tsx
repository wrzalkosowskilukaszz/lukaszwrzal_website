import { t } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

import styles from "./Hero.module.css";

export function Hero({ locale }: { locale: Locale }) {
  return (
    <header className={styles.hero}>
      <h1 className={`${styles.title} ${styles.rise}`}>{t(locale, "heroTitle")}</h1>
      <p className={`${styles.lede} ${styles.rise}`}>
        {t(locale, "heroLedeA")}
        <br />
        {t(locale, "heroLedeB")}
      </p>
    </header>
  );
}
