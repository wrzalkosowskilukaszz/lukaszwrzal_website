import { t } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

import { Belt } from "./Belt";
import styles from "./Clients.module.css";

const LOGOS = Array.from(
  { length: 11 },
  (_, i) => `/clients/client-${String(i + 1).padStart(2, "0")}.png`,
);

export function Clients({ locale }: { locale: Locale }) {
  return (
    <section className={styles.section}>
      <div className={styles.copy}>
        <p className="lw-eyebrow">{t(locale, "clientsEyebrow")}</p>
        <h2 className={styles.title}>{t(locale, "clientsTitle")}</h2>
        <p className={styles.intro}>{t(locale, "clientsIntro")}</p>
      </div>

      <div className={styles.belts}>
        <p className="lw-visually-hidden">{t(locale, "workedWith")}</p>
        {/* Counter-running: top rightward, bottom leftward. */}
        <Belt logos={LOGOS} direction={1} />
        <Belt logos={[...LOGOS].reverse()} direction={-1} />
      </div>
    </section>
  );
}
