"use client";

import { useCallback, useMemo, useState } from "react";

import { WorkIndex } from "@/components/WorkIndex/WorkIndex";
import { CATEGORY_LABELS, t } from "@/lib/i18n";
import { CATEGORIES, type Category, type Locale, type ProjectCard } from "@/lib/types";

import { ViewToggle, type WorkView } from "./ViewToggle";
import { WorkGrid } from "./WorkGrid";
import styles from "./WorkGrid.module.css";
import toggleStyles from "./ViewToggle.module.css";

export interface WorkBrowserProps {
  projects: ProjectCard[];
  locale: Locale;
}

/**
 * Owns the filter and the view mode; the two views share both.
 *
 * Index is the default: for the audience this page is really for — someone
 * scanning to understand the shape of a practice — thirty rows read faster
 * than thirty pictures. Grid is one click away for browsing by eye.
 */
export function WorkBrowser({ projects, locale }: WorkBrowserProps) {
  const [filter, setFilter] = useState<Category | "all">("all");
  const [view, setView] = useState<WorkView>("index");

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: projects.length };
    for (const cat of CATEGORIES) c[cat] = projects.filter((p) => p.cat === cat).length;
    return c;
  }, [projects]);

  const shown = useMemo(
    () => (filter === "all" ? projects : projects.filter((p) => p.cat === filter)),
    [projects, filter],
  );

  const changeFilter = useCallback((cat: Category | "all") => setFilter(cat), []);

  return (
    <>
      <div className={toggleStyles.bar}>
        <div className={styles.filters} role="group" aria-label={t(locale, "workTitle")}>
          {(["all", ...CATEGORIES] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              className={styles.filter}
              aria-pressed={filter === cat}
              onClick={() => changeFilter(cat)}
              style={
                cat === "all"
                  ? undefined
                  : ({ ["--cat" as string]: `var(--c-${cat})` })
              }
            >
              {cat !== "all" ? (
                <span className={styles.filterDot} aria-hidden="true" />
              ) : null}
              {cat === "all" ? t(locale, "filterAll") : CATEGORY_LABELS[locale][cat]}
              <span className={styles.count}>{counts[cat]}</span>
            </button>
          ))}
        </div>

        <span className={toggleStyles.divider} aria-hidden="true" />

        <ViewToggle
          view={view}
          onChange={setView}
          labels={{
            index: t(locale, "viewIndex"),
            grid: t(locale, "viewGrid"),
            group: t(locale, "viewGroup"),
          }}
        />
      </div>

      {view === "index" ? (
        <WorkIndex key={filter} projects={shown} locale={locale} />
      ) : (
        <WorkGrid projects={projects} locale={locale} filter={filter} />
      )}
    </>
  );
}
