"use client";

import { useState } from "react";

import { tx } from "@/blocks/shared";
import { BLOCK_FIELDS, BLOCK_LABELS } from "@/studio/schema";
import type { DraftBlock } from "@/studio/draft";

import { FieldRenderer } from "./FieldRenderer";
import s from "./Studio.module.css";

function preview(block: DraftBlock): string {
  const text =
    block.title ?? block.text ?? block.statement ??
    (Array.isArray(block.body) ? block.body[0] : block.body) ??
    (Array.isArray(block.items) ? `${(block.items as unknown[]).length} item(s)` : "");
  return typeof text === "string" ? text : tx(text as never, "en");
}

export function BlockCard({
  block,
  slug,
  onChange,
  onRemove,
  onMove,
  canMoveUp,
  canMoveDown,
  startOpen = false,
}: {
  block: DraftBlock;
  slug: string;
  onChange: (next: DraftBlock) => void;
  onRemove: () => void;
  onMove: (delta: number) => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  startOpen?: boolean;
}) {
  const [open, setOpen] = useState(startOpen);
  const info = BLOCK_LABELS[block.type];
  const fields = BLOCK_FIELDS[block.type];

  return (
    <div className={s.blockCard}>
      <div className={s.blockHead} onClick={() => setOpen((v) => !v)}>
        <span className={s.blockType}>{info?.label ?? block.type}</span>
        <span className={s.blockPreview}>{preview(block)}</span>
        <div className={s.blockActions} onClick={(e) => e.stopPropagation()}>
          <button type="button" className={s.iconBtn} disabled={!canMoveUp} onClick={() => onMove(-1)} aria-label="Move up">↑</button>
          <button type="button" className={s.iconBtn} disabled={!canMoveDown} onClick={() => onMove(1)} aria-label="Move down">↓</button>
          <button type="button" className={`${s.iconBtn} ${s.iconBtnDanger}`} onClick={onRemove} aria-label="Remove section">✕</button>
        </div>
      </div>

      {open ? (
        <div className={s.blockBody}>
          {fields.map((field) => (
            <div className={s.field} key={field.key}>
              <span className={s.label}>{field.label}{field.required ? " *" : ""}</span>
              {field.help ? <span className={s.help}>{field.help}</span> : null}
              <FieldRenderer
                field={field}
                slug={slug}
                value={block[field.key]}
                onChange={(next) => onChange({ ...block, [field.key]: next })}
              />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
