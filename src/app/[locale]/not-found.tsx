import Link from "next/link";

import { Aurora } from "@/components/Aurora/Aurora";
import { ArrowRight } from "@/components/icons/Arrows";

import styles from "./not-found.module.css";

/**
 * Locale-agnostic on purpose: a 404 can be reached with a malformed locale
 * segment, so it must not depend on one resolving.
 */
export default function NotFound() {
  return (
    <section className={styles.stage}>
      <Aurora />
      <div className={styles.inner}>
        <p className="lw-eyebrow">404</p>
        <h1 className={styles.title}>That page went out of scope.</h1>
        <p className={styles.lede}>
          The link is broken or the work moved. Everything I can show publicly
          is one click away.
        </p>
        <div className={styles.actions}>
          <Link href="/en/work" className={styles.primary}>
            See the work
            <span className={styles.disc} aria-hidden="true">
              <ArrowRight />
            </span>
          </Link>
          <Link href="/en" className={styles.secondary}>
            Back to the start
          </Link>
        </div>
      </div>
    </section>
  );
}
