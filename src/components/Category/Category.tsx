import { CATEGORY_LABELS } from "@/lib/i18n";
import type { Category, Locale } from "@/lib/types";

import styles from "./Category.module.css";

/**
 * Category is on all thirty projects and was invisible until you hovered.
 * Shown at rest, a visitor reads the shape of the practice without moving
 * the mouse — which is what a recruiter scanning actually needs.
 *
 * Deliberately small: a 7px dot and a mono word, so it disappears behind a
 * photograph rather than fighting it.
 */
export function CategoryTag({
  cat,
  locale,
  onMedia = false,
}: {
  cat: Category;
  locale: Locale;
  onMedia?: boolean;
}) {
  return (
    <span
      className={`${styles.tag} ${onMedia ? styles.onMedia : ""}`}
      style={{ ["--cat" as string]: `var(--c-${cat})` }}
    >
      <span className={styles.dot} aria-hidden="true" />
      {CATEGORY_LABELS[locale][cat]}
    </span>
  );
}
