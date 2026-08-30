"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Aurora } from "@/components/Aurora/Aurora";
import { ArrowRight } from "@/components/icons/Arrows";
import { BlockList } from "@/blocks/BlockList";
import { mediaUrl, tx } from "@/blocks/shared";
import type { Block } from "@/blocks/types";
import { t } from "@/lib/i18n";
import type { ProjectDoc } from "@/lib/projects";
import type { Locale } from "@/lib/types";

import styles from "./CaseStudy.module.css";
import { Lightbox, type LightboxItem } from "./Lightbox";
import { Spine } from "./Spine";

/**
 * Page furniture around the blocks: the back link, the chapter spine, the
 * lightbox and the next-project footer. Everything between is composed from
 * the project's own block list.
 */
export function ProjectPage({
  doc,
  locale,
  next,
}: {
  doc: ProjectDoc;
  locale: Locale;
  next: { slug: string; title: string };
}) {
  const [lightbox, setLightbox] = useState<number | null>(null);

  /* Every image in the project, in document order, so the lightbox can walk
     the whole page rather than one fixed set of twelve slots. */
  const gallery = useMemo<LightboxItem[]>(() => {
    const out: LightboxItem[] = [];
    const push = (src: string, caption?: string) => {
      if (/\.(mp4|webm)$/i.test(src)) return;
      out.push({ slot: src, src: mediaUrl(doc.slug, src), caption });
    };
    for (const b of doc.blocks as Block[]) {
      if (b.type === "figure" || b.type === "textMedia") push(b.src, tx(b.lightboxCaption ?? b.caption, locale));
      if (b.type === "gallery") b.items.forEach((i) => push(i.src, tx(i.lightboxCaption ?? i.caption, locale)));
    }
    return out;
  }, [doc, locale]);

  const ctx = {
    slug: doc.slug,
    locale,
    onOpenMedia: gallery.length
      ? (src: string) => {
          const i = gallery.findIndex((g) => g.slot === src);
          if (i !== -1) setLightbox(i);
        }
      : undefined,
  };

  /* The spine tracks whichever blocks carry an eyebrow — so it reflects the
     project's own structure rather than four hardcoded chapters. */
  const chapters = doc.blocks
    .map((b, i) => {
      const label =
        "eyebrow" in b && b.eyebrow ? tx(b.eyebrow, locale) : "";
      return label ? { id: `block-${i}`, label } : null;
    })
    .filter((c): c is { id: string; label: string } => c !== null);

  return (
    <>
      {chapters.length > 1 ? <Spine chapters={chapters} /> : null}

      <Link href={`/${locale}/work`} className={styles.backLink}>
        <span className={styles.backArrow} aria-hidden="true">
          <ArrowRight />
        </span>
        {t(locale, "allWork")}
      </Link>

      <article className={styles.chapters}>
        <BlockList blocks={doc.blocks} ctx={ctx} />
      </article>

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
          items={gallery}
          index={lightbox}
          locale={locale}
          onClose={() => setLightbox(null)}
          onNavigate={setLightbox}
        />
      ) : null}
    </>
  );
}
