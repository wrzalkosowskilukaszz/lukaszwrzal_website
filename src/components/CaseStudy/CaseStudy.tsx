"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Aurora } from "@/components/Aurora/Aurora";
import { ArrowRight } from "@/components/icons/Arrows";
import { Reveal } from "@/components/Reveal";
import { useReveal } from "@/hooks/useReveal";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { t } from "@/lib/i18n";
import { DEFAULT_SECTIONS, type FigureKey, type Locale, type LocalisedProject, type SectionKind } from "@/lib/types";

import styles from "./CaseStudy.module.css";
import { Figure } from "./Figure";
import { Lightbox, type LightboxItem } from "./Lightbox";
import { PlateStrip } from "./PlateStrip";
import { Process } from "./Process";
import { Spine } from "./Spine";
import { Stats } from "./Stats";

const SLOTS: FigureKey[] = [
  "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12",
];

export interface CaseStudyProps {
  project: LocalisedProject;
  next: { slug: string; title: string };
  locale: Locale;
  /** slot -> image url. Empty until real assets land. */
  images: Partial<Record<FigureKey, string>>;
  /** Bespoke layout. Omit for the default order. */
  sections?: SectionKind[];
}

export function CaseStudy({ project, next, locale, images, sections }: CaseStudyProps) {
  const { copy } = project;
  const [lightbox, setLightbox] = useState<number | null>(null);
  const reduced = useReducedMotion();
  const motionRef = useReveal<HTMLDivElement>(!reduced);

  /* Only slots holding a real image are in the lightbox — empty
     placeholders stay inert. */
  const lightboxItems = useMemo<LightboxItem[]>(
    () =>
      SLOTS.filter((s) => images[s]).map((s) => ({
        slot: s,
        src: images[s] as string,
        caption: copy.captions?.[s],
        alt: copy.captionsShort?.[s],
      })),
    [images, copy.captions, copy.captionsShort],
  );

  const openSlot = (slot: string) => {
    const i = lightboxItems.findIndex((it) => it.slot === slot);
    if (i !== -1) setLightbox(i);
  };

  const fig = (slot: FigureKey, extra: Partial<Parameters<typeof Figure>[0]> = {}) => (
    <Figure
      slot={slot}
      src={images[slot]}
      alt={copy.captionsShort?.[slot]}
      captionShort={copy.captionsShort?.[slot]}
      expandLabel={t(locale, "expand")}
      onOpen={images[slot] ? () => openSlot(slot) : undefined}
      {...extra}
    />
  );

  const chapters = [
    { id: "brief", label: t(locale, "chapterBrief") },
    { id: "process", label: t(locale, "chapterProcess") },
    { id: "system", label: t(locale, "chapterSystem") },
    { id: "outcome", label: t(locale, "chapterOutcome") },
  ];

  const meta = [
    { label: t(locale, "metaClient"), value: copy.client },
    { label: t(locale, "metaRole"), value: copy.role },
    { label: t(locale, "metaScope"), value: copy.scope },
    { label: t(locale, "metaTeam"), value: copy.team },
  ];

  return (
    <>
      <Spine chapters={chapters} />

      {/* A case study offered only "next project" — no way back to the index
          you arrived from, and on mobile the nav had no route either. */}
      <Link href={`/${locale}/work`} className={styles.backLink}>
        <span className={styles.backArrow} aria-hidden="true">
          <ArrowRight />
        </span>
        {t(locale, "allWork")}
      </Link>

      <header className={styles.hero}>
        <p className={`lw-eyebrow ${styles.rise}`}>{copy.eyebrow}</p>
        <h1 className={`${styles.title} ${styles.rise}`}>{copy.title}</h1>
        <p className={`${styles.lede} ${styles.rise}`}>{copy.lede}</p>
      </header>

      {/* Sections render in the order the project asks for. A bespoke case
          study is a different list here, not a forked template. */}
      {(sections ?? DEFAULT_SECTIONS).map((kind) => {
        switch (kind) {
          case "keyVisual":
            return (
              /* Destination of the tile morph. The name is unique per page,
                 and the tile only claims it during the transition. */
              <div
                key={kind}
                data-section={kind}
                className={styles.keyVisual}
                style={{ viewTransitionName: "project-media" }}
              >
                {fig("01", { stage: true, height: "clamp(340px, 50vw, 700px)", parallax: 0.1 })}
              </div>
            );

          case "meta":
            return (
              <div key={kind} data-section={kind} className={styles.meta}>
                {meta.map((m) => (
                  <div key={m.label}>
                    <div className={styles.metaLabel}>{m.label}</div>
                    <div className={styles.metaValue}>{m.value}</div>
                  </div>
                ))}
              </div>
            );

          case "brief":
            return (
              <Reveal key={kind}>
                <section data-section={kind} className={styles.section} id="brief">
                  <p className="lw-eyebrow">{t(locale, "sectionBrief")}</p>
                  <h2 className={styles.statement}>{copy.statement}</h2>
                  <div className={styles.columns}>
                    {copy.brief?.map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                </section>
              </Reveal>
            );

          case "figurePair":
            return (
              <div key={kind} data-section={kind} className={styles.pair}>
                {fig("02", { height: "clamp(220px, 24vw, 340px)" })}
                {fig("03", { height: "clamp(220px, 24vw, 340px)" })}
              </div>
            );

          case "process":
            return (
              <div key={kind} data-section={kind}>
              <Process
                steps={copy.process ?? []}
                locale={locale}
                figures={[images["04"], images["05"], images["06"], images["07"]]}
              />
              </div>
            );

          case "system":
            return (
              <Reveal key={kind}>
                <section data-section={kind} className={styles.section} id="system">
                  <p className="lw-eyebrow">{t(locale, "sectionSystem")}</p>
                  <h2 className={styles.statement}>{copy.system?.statement}</h2>
                  <p className={styles.body}>{copy.system?.body}</p>
                </section>
              </Reveal>
            );

          case "plateStrip":
            return (
              <div key={kind} data-section={kind} style={{ marginTop: "clamp(2.5rem, 5vw, 4rem)" }}>
                <PlateStrip
                  locale={locale}
                  onOpen={openSlot}
                  slots={(["08", "09", "10", "11"] as FigureKey[]).map((s) => ({
                    slot: s,
                    src: images[s],
                    caption: copy.captionsShort?.[s],
                  }))}
                />
              </div>
            );

          case "motion":
            /* Fig. 12 — settles to full scale on view. */
            return (
              <div key={kind} data-section={kind} className={styles.motionSlot} ref={motionRef} data-slot="12">
                {images["12"] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={images["12"]}
                    alt={copy.captionsShort?.["12"] ?? ""}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : null}
              </div>
            );

          case "outcome":
            return (
              <Reveal key={kind}>
                <section data-section={kind} className={styles.section} id="outcome">
                  <p className="lw-eyebrow">{t(locale, "sectionOutcome")}</p>
                  <h2 className={styles.statement}>{copy.outcome?.statement}</h2>
                  <div className={styles.columns}>
                    {copy.outcome?.body?.map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                  {copy.stats.length ? <Stats stats={copy.stats} locale={locale} /> : null}
                </section>
              </Reveal>
            );

          default:
            return null;
        }
      })}

      <footer className={styles.next}>
        <Aurora />
        <div className={styles.nextInner}>
          <p className="lw-eyebrow">{t(locale, "nextProject")}</p>
          <Link href={`/${locale}/work/${next.slug}`} className={styles.nextLink}>
            <span className={styles.nextName}>{next.title}</span>
            <span className={styles.nextDisc} aria-hidden="true">
              <ArrowRight size={18} />
            </span>
          </Link>
        </div>
      </footer>

      {lightbox !== null ? (
        <Lightbox
          items={lightboxItems}
          index={lightbox}
          locale={locale}
          onClose={() => setLightbox(null)}
          onNavigate={setLightbox}
        />
      ) : null}
    </>
  );
}
