"use client";

import { useEffect, useRef } from "react";
import type { AnimationItem } from "lottie-web";

import { useReducedMotion } from "@/hooks/useReducedMotion";
import { subscribe } from "@/lib/raf";

import s from "./blocks.module.css";
import { mediaUrl, tx, type BlockContext } from "./shared";
import type { Media as MediaData } from "./types";

/**
 * One image or video in a frame. Used directly by `figure` and reused by
 * `gallery` and `textMedia`, so cropping, parallax, captions and the
 * lightbox behave identically wherever media appears.
 */
export function Media({
  media,
  ctx,
  radius = "tile",
  height,
  ratio,
  parallax = 0,
  morph = false,
}: {
  media: MediaData;
  ctx: BlockContext;
  radius?: "tile" | "stage" | "flat";
  height?: string;
  /** e.g. "16 / 9". Lets a gallery keep native proportions. */
  ratio?: string;
  parallax?: number;
  /** Names this frame `project-media`, the shared element a clicked work
      tile morphs into. At most one Media per page may set it. */
  morph?: boolean;
}) {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const frame = frameRef.current;
    const inner = innerRef.current;
    if (!frame || !inner || reduced || parallax <= 0) return;

    return subscribe(() => {
      const rect = frame.getBoundingClientRect();
      const vh = window.innerHeight;
      if (rect.bottom < -200 || rect.top > vh + 200) return;
      const c = (rect.top + rect.height / 2 - vh / 2) / vh;
      inner.style.transform = `translate3d(0, ${c * rect.height * parallax * -1}px, 0)`;
    });
  }, [parallax, reduced]);

  /* Lottie files mount a vector player; the library loads only when a page
     actually contains one. Reduced motion holds frame zero. */
  const lottieRef = useRef<HTMLDivElement | null>(null);
  const isLottieSrc = /\.json$/i.test(media.src);
  useEffect(() => {
    if (!isLottieSrc || media.missing === true) return;
    const el = lottieRef.current;
    if (!el) return;
    let anim: AnimationItem | null = null;
    let dead = false;
    void import("lottie-web/build/player/lottie_light").then((mod) => {
      if (dead || !lottieRef.current) return;
      anim = mod.default.loadAnimation({
        container: lottieRef.current,
        renderer: "svg",
        loop: true,
        autoplay: !reduced,
        path: mediaUrl(ctx.slug, media.src),
      });
    });
    return () => {
      dead = true;
      anim?.destroy();
    };
  }, [isLottieSrc, media.missing, media.src, ctx.slug, reduced]);

  /* `missing` is set by the loader for files that do not exist yet. An empty
     well is a designed state; a broken-image icon is not. */
  const missing = media.missing === true;
  const url = mediaUrl(ctx.slug, media.src);
  const isVideo = /\.(mp4|webm)$/i.test(media.src);
  const isLottie = /\.json$/i.test(media.src);
  const caption = tx(media.caption, ctx.locale);
  const zoomable = Boolean(ctx.onOpenMedia) && !isVideo && !isLottie && !missing;

  const radiusClass =
    radius === "stage" ? s.frameStage : radius === "flat" ? s.frameFlat : s.frameTile;

  return (
    <figure style={{ margin: 0 }}>
      <div
        ref={frameRef}
        data-media-slot={zoomable ? media.src : undefined}
        className={`${s.frame} ${radiusClass} ${zoomable ? s.zoomable : ""}`}
        style={{
          height,
          aspectRatio: height ? undefined : ratio,
          viewTransitionName: morph ? "project-media" : undefined,
        }}
        onClick={zoomable ? () => ctx.onOpenMedia?.(media.src) : undefined}
        role={zoomable ? "button" : undefined}
        tabIndex={zoomable ? 0 : undefined}
        onKeyDown={
          zoomable
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  ctx.onOpenMedia?.(media.src);
                }
              }
            : undefined
        }
        aria-label={zoomable ? tx(media.alt, ctx.locale) || caption : undefined}
      >
        {missing ? null : isLottie ? (
          <div className={s.lottie} ref={lottieRef} aria-label={tx(media.alt, ctx.locale) || undefined} />
        ) : isVideo ? (
          <video src={url} autoPlay={!reduced} muted loop playsInline preload="metadata" />
        ) : parallax > 0 ? (
          <div className={s.inner} ref={innerRef}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={tx(media.alt, ctx.locale)} loading="lazy" decoding="async" />
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={tx(media.alt, ctx.locale)} loading="lazy" decoding="async" />
        )}
      </div>
      {caption ? <figcaption className={s.caption}>{caption}</figcaption> : null}
    </figure>
  );
}
