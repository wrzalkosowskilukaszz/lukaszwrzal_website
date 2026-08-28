"use client";

import { useState } from "react";

import type { Localised } from "@/blocks/types";

import s from "./Studio.module.css";

/**
 * Every piece of bilingual copy on the site is either one string (same in
 * both languages) or { en, pl }. Writing that by hand in JSON is exactly
 * the syntax that broke IKEA.json. Here it is a checkbox: checked shows one
 * box and saves a plain string; unchecked shows two boxes and saves both.
 */
export function LocalisedField({
  value,
  onChange,
  multiline = false,
  placeholder,
}: {
  value: Localised | undefined;
  onChange: (next: Localised) => void;
  multiline?: boolean;
  placeholder?: string;
}) {
  const startedSplit = typeof value === "object" && value !== null;
  const [split, setSplit] = useState(startedSplit);

  const en = typeof value === "string" ? value : (value?.en ?? "");
  const pl = typeof value === "string" ? "" : (value?.pl ?? "");

  const Field = multiline ? "textarea" : "input";
  const fieldClass = multiline ? s.textarea : s.input;

  if (!split) {
    return (
      <div>
        <Field
          className={fieldClass}
          value={en}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
        <label className={s.sameToggle} style={{ marginTop: 8 }}>
          <input
            type="checkbox"
            checked={false}
            onChange={() => { setSplit(true); onChange({ en, pl: en }); }}
          />
          Write English and Polish separately
        </label>
      </div>
    );
  }

  return (
    <div className={s.localised}>
      <label className={s.sameToggle}>
        <input
          type="checkbox"
          checked={false}
          onChange={() => { setSplit(false); onChange(en); }}
        />
        Same in both languages
      </label>
      <div className={s.langPair}>
        <div>
          <span className={s.langLabel}>English</span>
          <Field className={fieldClass} value={en} placeholder={placeholder}
            onChange={(e) => onChange({ en: e.target.value, pl })} />
        </div>
        <div>
          <span className={s.langLabel}>Polish</span>
          <Field className={fieldClass} value={pl} placeholder={placeholder}
            onChange={(e) => onChange({ en, pl: e.target.value })} />
        </div>
      </div>
    </div>
  );
}
