"use client";

import s from "./Studio.module.css";

/** Add / remove / reorder rows — used for gallery items, steps, stats, roles,
    and paragraph lists. One generic wrapper, so those four don't repeat
    the same up/down/delete plumbing four times. */
export function RepeatableList<T>({
  items,
  onChange,
  makeRow,
  newItem,
  addLabel,
}: {
  items: T[];
  onChange: (next: T[]) => void;
  makeRow: (item: T, update: (next: T) => void) => React.ReactNode;
  newItem: () => T;
  addLabel: string;
}) {
  const move = (i: number, delta: number) => {
    const j = i + delta;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const update = (i: number, val: T) => onChange(items.map((it, idx) => (idx === i ? val : it)));

  return (
    <div className={s.repeatable}>
      {items.map((item, i) => (
        <div className={s.repRow} key={i}>
          <div className={s.repRowHead}>
            <button type="button" className={s.iconBtn} disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up">↑</button>
            <button type="button" className={s.iconBtn} disabled={i === items.length - 1} onClick={() => move(i, 1)} aria-label="Move down">↓</button>
            <button type="button" className={`${s.iconBtn} ${s.iconBtnDanger}`} onClick={() => remove(i)} aria-label="Remove">✕</button>
          </div>
          {makeRow(item, (next) => update(i, next))}
        </div>
      ))}
      <button type="button" className={s.repAdd} onClick={() => onChange([...items, newItem()])}>
        + {addLabel}
      </button>
    </div>
  );
}
