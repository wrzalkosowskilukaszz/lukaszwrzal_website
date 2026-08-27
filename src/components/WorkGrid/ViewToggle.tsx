"use client";

import styles from "./ViewToggle.module.css";

export type WorkView = "index" | "grid";

const ICONS = {
  index: (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" aria-hidden="true" focusable="false">
      <path d="M2 3.5h10M2 7h10M2 10.5h10" />
    </svg>
  ),
  grid: (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <rect x="2" y="2" width="4" height="4" rx="1" />
      <rect x="8" y="2" width="4" height="4" rx="1" />
      <rect x="2" y="8" width="4" height="4" rx="1" />
      <rect x="8" y="8" width="4" height="4" rx="1" />
    </svg>
  ),
};

export function ViewToggle({
  view,
  onChange,
  labels,
}: {
  view: WorkView;
  onChange: (v: WorkView) => void;
  labels: { index: string; grid: string; group: string };
}) {
  return (
    <div className={styles.toggle} role="group" aria-label={labels.group}>
      {(["index", "grid"] as const).map((v) => (
        <button
          key={v}
          type="button"
          className={styles.btn}
          aria-pressed={view === v}
          onClick={() => onChange(v)}
        >
          {ICONS[v]}
          {labels[v]}
        </button>
      ))}
    </div>
  );
}
