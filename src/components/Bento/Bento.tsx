"use client";

import Link from "next/link";
import { useState } from "react";

import { Aurora } from "@/components/Aurora/Aurora";
import { ProjectTile } from "@/components/ProjectTile/ProjectTile";
import { ArrowRight } from "@/components/icons/Arrows";
import { t } from "@/lib/i18n";
import type { FigureKey, Locale, LocalisedProject } from "@/lib/types";

import styles from "./Bento.module.css";

/**
 * Six projects at three scales, not twelve at one.
 *
 * The hover language is unchanged — the tile still desaturates its
 * neighbours and reveals its arrow. What changed is that the layout no
 * longer needs a spring to redistribute width: the composition is fixed and
 * asymmetric, so a hovered tile lifts out of a hierarchy that already
 * exists rather than manufacturing one on the fly.
 */
export interface BentoProps {
  projects: LocalisedProject[];
  locale: Locale;
  images: Record<string, Partial<Record<FigureKey, string>>>;
}

export function Bento({ projects, locale, images }: BentoProps) {
  const [active, setActive] = useState<string | null>(null);
  const featured = projects.slice(0, 6);
  const [lead, a, b, wide, narrow] = [
    featured[0], featured[1], featured[2], featured[3], featured[4],
  ];

  const tile = (
    p: LocalisedProject | undefined,
    className: string,
    showStat = false,
  ) =>
    p ? (
      <div className={className}>
        <ProjectTile
          project={p}
          locale={locale}
          image={images[p.slug]?.["01"]}
          active={active === p.slug}
          dimmed={active !== null && active !== p.slug}
          onActivate={() => setActive(p.slug)}
          onDeactivate={() => setActive(null)}
          showDesc
          showStat={showStat}
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    ) : null;

  return (
    <section className={styles.stage} id="work">
      <Aurora masked />

      <div className={styles.inner}>
        <div className={styles.head}>
          <h2>{t(locale, "recentWorks")}</h2>
          <div className={styles.showAllWrap}>
            <Link href={`/${locale}/work`} className={styles.showAll}>
              {t(locale, "showAll")}
              <ArrowRight size={13} height={11} />
            </Link>
            <div className={styles.rule} />
          </div>
        </div>

        <div className={styles.grid}>
          {tile(lead, `${styles.cell} ${styles.lead}`, true)}

          <div className={styles.stack}>
            {tile(a, styles.cell)}
            {tile(b, styles.cell)}
          </div>

          {tile(wide, `${styles.cell} ${styles.wide}`)}
          {tile(narrow, `${styles.cell} ${styles.narrow}`)}
        </div>
      </div>
    </section>
  );
}
