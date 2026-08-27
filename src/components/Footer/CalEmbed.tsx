"use client";

import { useEffect, useRef, useState } from "react";

import { t } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

import styles from "./Footer.module.css";

const CAL_URL =
  "https://cal.com/takealuke/30min?embed=true&layout=month_view&theme=light";

/**
 * A plain iframe, NOT the cal.com embed script — the script was blocked in
 * some contexts and threw, taking the whole page down with it.
 *
 * Must be eager-loading: loading="lazy" never fires on an iframe this far down
 * the page, and a naive timeout then hid its parent permanently. The 20s
 * fallback is cleared on load.
 */
export function CalEmbed({ locale }: { locale: Locale }) {
  const [failed, setFailed] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    timer.current = window.setTimeout(() => setFailed(true), 20_000);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  const onLoad = () => {
    if (timer.current) window.clearTimeout(timer.current);
    setFailed(false);
  };

  if (failed) {
    return (
      <div className={styles.calCard}>
        <div className={styles.calFallback}>
          <p>{t(locale, "calendarFailed")}</p>
          <a
            className={styles.pillCta}
            href="https://cal.com/takealuke/30min"
            target="_blank"
            rel="noreferrer"
          >
            {t(locale, "openCalendar")}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.calCard}>
      <iframe
        src={CAL_URL}
        title={t(locale, "bookCall")}
        onLoad={onLoad}
        onError={() => setFailed(true)}
      />
    </div>
  );
}
