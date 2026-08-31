"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, type ComponentProps } from "react";

import { useReducedMotion } from "@/hooks/useReducedMotion";

/** If a navigation stalls, release the transition rather than freezing the page. */
const SAFETY_MS = 1200;

type Props = ComponentProps<typeof Link> & {
  /**
   * Element to morph. The same name must exist on the destination page, and
   * must be unique on both — so it is applied on click, not at rest.
   *
   * Resolved by a getter rather than a ref object, so nothing reads a ref
   * during render.
   */
  morphName?: string;
  getMorphEl?: () => HTMLElement | null;
};

/**
 * A Link that runs the navigation inside a View Transition, so a clicked
 * tile morphs into the case-study hero rather than cutting.
 *
 * Next 16.3 ships no view-transition integration, so this drives the native
 * API directly. Degrades to an ordinary link wherever the API is missing,
 * motion is reduced, or the user is opening a new tab.
 */
export function TransitionLink({
  morphName,
  getMorphEl,
  onClick,
  href,
  ...rest
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const resolveRef = useRef<(() => void) | null>(null);
  const timerRef = useRef<number | null>(null);

  /* The transition's callback resolves once the new route has painted. */
  useEffect(() => {
    resolveRef.current?.();
    resolveRef.current = null;
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, [pathname]);

  useEffect(
    () => () => {
      resolveRef.current?.();
      if (timerRef.current) window.clearTimeout(timerRef.current);
    },
    [],
  );

  const handle = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      onClick?.(e);
      if (e.defaultPrevented) return;

      const supported =
        typeof document !== "undefined" &&
        typeof document.startViewTransition === "function";

      // Let the browser do its normal thing for new tabs and modified clicks.
      const plainClick =
        e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;

      if (!supported || reduced || !plainClick) return;

      e.preventDefault();

      const el = getMorphEl?.() ?? null;
      if (el && morphName) el.style.viewTransitionName = morphName;

      const transition = document.startViewTransition(
        () =>
          new Promise<void>((resolve) => {
            resolveRef.current = resolve;
            timerRef.current = window.setTimeout(resolve, SAFETY_MS);
            router.push(String(href));
          }),
      );

      // The name must not outlive the transition, or the next one collides.
      // `finished` REJECTS when a newer transition aborts this one — routine
      // traffic (fast double-clicks), not an error worth surfacing.
      const untag = () => {
        if (el) el.style.viewTransitionName = "";
      };
      transition.finished.then(untag, untag);
    },
    [href, morphName, getMorphEl, onClick, reduced, router],
  );

  return <Link href={href} onClick={handle} {...rest} />;
}
