"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { flushSync } from "react-dom";

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
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Page furniture around the blocks: the back link, the
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
      if (/\.(mp4|webm|json)$/i.test(src)) return;
      out.push({ slot: src, src: mediaUrl(doc.slug, src), caption });
    };
    for (const b of doc.blocks as Block[]) {
      if (b.type === "figure" || b.type === "textMedia") push(b.src, tx(b.lightboxCaption ?? b.caption, locale));
      if (b.type === "gallery") b.items.forEach((i) => push(i.src, tx(i.lightboxCaption ?? i.caption, locale)));
      if (b.type === "story") b.items.forEach((i) => { if (i.src) push(i.src, tx(i.eyebrow, locale)); });
      if (b.type === "deck") b.items.forEach((i) => { if (i.src) push(i.src, tx(i.title, locale)); });
    }
    return out;
  }, [doc, locale]);

  /* The first figure is the element a clicked work tile morphs into. */
  const morphIndex = doc.blocks.findIndex((b) => b.type === "figure");

  const reduced = useReducedMotion();

  /* Open and close morph the image between its frame and the viewer — a
     same-document view transition. The clicked frame is found by its slot
     attribute; where several frames show the same file (a story picture
     has an inline and a pinned copy), the largest visible one is the
     morph source. Falls back to a plain state change without the API or
     under reduced motion. */
  const zoomTransition = useCallback(
    (slot: string | null, update: () => void) => {
      const supported =
        typeof document !== "undefined" &&
        typeof document.startViewTransition === "function";
      if (!supported || reduced) {
        update();
        return;
      }
      let el: HTMLElement | null = null;
      if (slot) {
        const candidates = [...document.querySelectorAll<HTMLElement>(
          `[data-media-slot="${CSS.escape(slot)}"]`,
        )].filter((c) => {
          const r = c.getBoundingClientRect();
          return r.width > 0 && getComputedStyle(c).visibility !== "hidden";
        });
        candidates.sort((a, b) => {
          const ra = a.getBoundingClientRect();
          const rb = b.getBoundingClientRect();
          return rb.width * rb.height - ra.width * ra.height;
        });
        el = candidates[0] ?? null;
        if (el) el.style.viewTransitionName = "zoom-media";
      }
      const transition = document.startViewTransition(() => {
        flushSync(update);
      });
      // Rejects when a newer transition aborts this one — routine, not an error.
      const untag = () => {
        if (el) el.style.viewTransitionName = "";
      };
      transition.finished.then(untag, untag);
    },
    [reduced],
  );

  const ctx = {
    slug: doc.slug,
    locale,
    morphIndex: morphIndex === -1 ? undefined : morphIndex,
    onOpenMedia: gallery.length
      ? (src: string) => {
          const i = gallery.findIndex((g) => g.slot === src);
          if (i !== -1) zoomTransition(src, () => setLightbox(i));
        }
      : undefined,
  };

  return (
    <>
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
            <span
              className={`${styles.nextName} ${next.title.length > 16 ? styles.nextNameLong : ""}`}
            >
              {next.title}
            </span>
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
          onClose={() =>
            zoomTransition(
              lightbox !== null ? gallery[lightbox]?.slot ?? null : null,
              () => setLightbox(null),
            )
          }
          onNavigate={setLightbox}
        />
      ) : null}
    </>
  );
}
