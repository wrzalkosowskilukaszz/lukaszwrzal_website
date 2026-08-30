"use client";

import { useEffect, useRef } from "react";

import { subscribe } from "@/lib/raf";

import { Media } from "./Media";
import s from "./blocks.module.css";
import { mediaUrl, tx, txAll, type BlockContext } from "./shared";
import type { FigureBlock, GalleryBlock, TextMediaBlock, VideoBlock } from "./types";

const widthClass = (w?: string) =>
  w === "stage" ? s.stage : w === "full-bleed" ? s.fullBleed : s.content;

export function Figure({ block, ctx, index }: { block: FigureBlock; ctx: BlockContext; index?: number }) {
  const width = block.width ?? "content";
  return (
    <div className={widthClass(width)}>
      <Media
        media={block}
        ctx={ctx}
        morph={index !== undefined && index === ctx.morphIndex}
        radius={width === "full-bleed" ? "flat" : width === "stage" ? "stage" : "tile"}
        height={width === "stage" ? "clamp(340px, 50vw, 700px)" : undefined}
        ratio={width === "stage" ? undefined : "16 / 10"}
        parallax={block.parallax ?? 0}
      />
    </div>
  );
}

export function Video({ block, ctx }: { block: VideoBlock; ctx: BlockContext }) {
  const width = block.width ?? "stage";
  return (
    <div className={widthClass(width)}>
      <div
        className={`${s.frame} ${width === "full-bleed" ? s.frameFlat : s.frameStage}`}
        style={{ height: "clamp(340px, 44vw, 620px)" }}
      >
        <video
          src={mediaUrl(ctx.slug, block.src)}
          poster={block.poster ? mediaUrl(ctx.slug, block.poster) : undefined}
          autoPlay
          muted
          loop
          playsInline
        />
      </div>
      {block.caption ? <p className={s.caption}>{tx(block.caption, ctx.locale)}</p> : null}
    </div>
  );
}

export function TextMedia({ block, ctx }: { block: TextMediaBlock; ctx: BlockContext }) {
  const left = block.variant === "media-left";
  return (
    <section className={`${s.content} ${s.textMedia} ${left ? s.mediaLeft : ""}`}>
      <div>
        {block.eyebrow ? <p className={s.eyebrow}>{tx(block.eyebrow, ctx.locale)}</p> : null}
        {block.statement ? <h2 className={s.statement}>{tx(block.statement, ctx.locale)}</h2> : null}
        <div className={s.prose}>
          {txAll(block.body, ctx.locale).map((p, i) => <p key={i}>{p}</p>)}
        </div>
      </div>
      <Media media={block} ctx={ctx} ratio="4 / 5" />
    </section>
  );
}

/**
 * One block, four ways to lay media out. `strip` keeps the drag-scroll and
 * progress rail from the original plate strip; `masonry` preserves native
 * ratios, which is what illustration work needs.
 */
export function Gallery({ block, ctx }: { block: GalleryBlock; ctx: BlockContext }) {
  const variant = block.variant ?? "grid-2";
  const stripRef = useRef<HTMLDivElement | null>(null);
  const thumbRef = useRef<HTMLSpanElement | null>(null);
  const drag = useRef({ active: false, startX: 0, startScroll: 0, moved: 0 });

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip || variant !== "strip") return;

    const stop = subscribe(() => {
      const thumb = thumbRef.current;
      if (!thumb) return;
      const ratio = strip.clientWidth / Math.max(1, strip.scrollWidth);
      const max = strip.scrollWidth - strip.clientWidth;
      const p = max > 0 ? strip.scrollLeft / max : 0;
      thumb.style.width = `${ratio * 100}%`;
      thumb.style.left = `${p * (100 - ratio * 100)}%`;
    });

    const down = (e: PointerEvent) => {
      drag.current = { active: true, startX: e.clientX, startScroll: strip.scrollLeft, moved: 0 };
      strip.dataset.dragging = "true";
      strip.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!drag.current.active) return;
      const dx = e.clientX - drag.current.startX;
      drag.current.moved = Math.max(drag.current.moved, Math.abs(dx));
      strip.scrollLeft = drag.current.startScroll - dx;
    };
    const up = (e: PointerEvent) => {
      if (!drag.current.active) return;
      drag.current.active = false;
      delete strip.dataset.dragging;
      try { strip.releasePointerCapture(e.pointerId); } catch {}
    };

    strip.addEventListener("pointerdown", down);
    strip.addEventListener("pointermove", move);
    strip.addEventListener("pointerup", up);
    strip.addEventListener("pointercancel", up);
    return () => {
      stop();
      strip.removeEventListener("pointerdown", down);
      strip.removeEventListener("pointermove", move);
      strip.removeEventListener("pointerup", up);
      strip.removeEventListener("pointercancel", up);
    };
  }, [variant]);

  const layout =
    variant === "grid-3" ? s.grid3
    : variant === "masonry" ? s.masonry
    : variant === "strip" ? s.strip
    : s.grid2;

  /* A drag over 6px must not open the lightbox. */
  const guarded: BlockContext = {
    ...ctx,
    onOpenMedia: ctx.onOpenMedia
      ? (src) => { if (drag.current.moved <= 6) ctx.onOpenMedia?.(src); }
      : undefined,
  };

  return (
    <section className={variant === "strip" ? s.stage : s.content}>
      <div className={layout} ref={variant === "strip" ? stripRef : undefined}>
        {block.items.map((item, i) => (
          <Media
            key={`${item.src}-${i}`}
            media={item}
            ctx={guarded}
            ratio={variant === "masonry" ? undefined : variant === "grid-3" ? "1 / 1" : "4 / 3"}
            height={variant === "strip" ? "clamp(220px, 28vw, 380px)" : undefined}
          />
        ))}
      </div>
      {variant === "strip" ? (
        <div className={s.rail} aria-hidden="true">
          <span className={s.thumb} ref={thumbRef} />
        </div>
      ) : null}
    </section>
  );
}
