"use client";

import type { Localised } from "@/blocks/types";
import type { FieldDef } from "@/studio/schema";

import { LocalisedField } from "./LocalisedField";
import { MediaField } from "./MediaField";
import { RepeatableList } from "./RepeatableList";
import s from "./Studio.module.css";

interface MediaItem { src: string; caption?: Localised }
interface StepItem { n?: string; title?: Localised; body?: Localised; src?: string }
interface ChapterItem { eyebrow?: Localised; statement?: Localised; body?: Localised[]; src?: string }

/* A chapter's paragraphs edit as one textarea, blank line = new paragraph.
   Localised bodies join and split per language. */
const joinParas = (body?: Localised[]): Localised => {
  if (!body?.length) return "";
  if (body.every((p) => typeof p === "string")) return (body as string[]).join("\n\n");
  const en = body.map((p) => (typeof p === "string" ? p : p.en ?? "")).join("\n\n");
  const pl = body.map((p) => (typeof p === "string" ? p : p.pl ?? "")).join("\n\n");
  return { en, pl };
};
const splitParas = (v: Localised): Localised[] => {
  const split = (t: string) => t.split(/\n\s*\n/).map((x) => x.trim()).filter(Boolean);
  if (typeof v === "string") return split(v);
  const en = split(v.en ?? "");
  const pl = split(v.pl ?? "");
  return en.map((e, i) => (pl[i] ? { en: e, pl: pl[i] } : e));
};
interface StatItem { value?: number; suffix?: string; label?: Localised }
interface RoleItem { role?: Localised; name?: string }
interface KvItem { label?: Localised; value?: Localised }
interface TermItem { term?: Localised; description?: Localised }

/** One field, dispatched by kind. The schema table decides what a block
    needs; this component is the only place that knows how to draw it. */
export function FieldRenderer({
  field,
  value,
  onChange,
  slug,
}: {
  field: FieldDef;
  value: unknown;
  onChange: (next: unknown) => void;
  slug: string;
}) {
  switch (field.kind) {
    case "text":
      return (
        <input
          className={s.input}
          value={(value as string) ?? ""}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case "number":
      return (
        <input
          className={s.input}
          type="number"
          step={0.05}
          min={0}
          max={0.3}
          value={(value as number) ?? ""}
          onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
        />
      );

    case "select":
      return (
        <select
          className={s.select}
          value={(value as string) ?? field.options?.[0]?.value ?? ""}
          onChange={(e) => onChange(e.target.value)}
        >
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      );

    case "spacing":
      return (
        <select
          className={s.select}
          value={(value as string) ?? "normal"}
          onChange={(e) => onChange(e.target.value === "normal" ? undefined : e.target.value)}
        >
          <option value="tight">Tight</option>
          <option value="normal">Normal</option>
          <option value="loose">Loose</option>
        </select>
      );

    case "localisedText":
      return (
        <LocalisedField value={value as Localised} placeholder={field.placeholder} onChange={onChange} />
      );

    case "localisedTextarea":
      return (
        <LocalisedField value={value as Localised} multiline placeholder={field.placeholder} onChange={onChange} />
      );

    case "media":
      return <MediaField slug={slug} value={value as string | undefined} onChange={onChange} />;

    case "localisedList": {
      const items = (value as Localised[] | undefined) ?? [];
      return (
        <RepeatableList
          items={items}
          onChange={onChange}
          newItem={() => ""}
          addLabel="Add a paragraph"
          makeRow={(item, update) => (
            <LocalisedField value={item} multiline onChange={update} />
          )}
        />
      );
    }

    case "mediaList": {
      const items = (value as MediaItem[] | undefined) ?? [];
      return (
        <RepeatableList
          items={items}
          onChange={onChange}
          newItem={() => ({ src: "" } as MediaItem)}
          addLabel="Add a picture"
          makeRow={(item, update) => (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <MediaField slug={slug} value={item.src} onChange={(src) => update({ ...item, src })} />
              <div>
                <span className={s.langLabel}>Caption (optional)</span>
                <LocalisedField value={item.caption} onChange={(caption) => update({ ...item, caption })} />
              </div>
            </div>
          )}
        />
      );
    }

    case "steps": {
      const items = (value as StepItem[] | undefined) ?? [];
      return (
        <RepeatableList
          items={items}
          onChange={onChange}
          newItem={() => ({ title: "", body: "" })}
          addLabel="Add a step"
          makeRow={(item, update) => (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div>
                <span className={s.langLabel}>Title</span>
                <LocalisedField value={item.title} onChange={(title) => update({ ...item, title })} />
              </div>
              <div>
                <span className={s.langLabel}>Text</span>
                <LocalisedField value={item.body} multiline onChange={(body) => update({ ...item, body })} />
              </div>
              <div>
                <span className={s.langLabel}>Picture (optional)</span>
                <MediaField slug={slug} value={item.src} onChange={(src) => update({ ...item, src })} />
              </div>
            </div>
          )}
        />
      );
    }

    case "chapters": {
      const items = (value as ChapterItem[] | undefined) ?? [];
      return (
        <RepeatableList
          items={items}
          onChange={onChange}
          newItem={() => ({ eyebrow: "", body: [""] })}
          addLabel="Add a chapter"
          makeRow={(item, update) => (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div>
                <span className={s.langLabel}>Small label (e.g. The challenge)</span>
                <LocalisedField value={item.eyebrow} onChange={(eyebrow) => update({ ...item, eyebrow })} />
              </div>
              <div>
                <span className={s.langLabel}>Big line (optional)</span>
                <LocalisedField value={item.statement} onChange={(statement) => update({ ...item, statement })} />
              </div>
              <div>
                <span className={s.langLabel}>Copy — blank line between paragraphs</span>
                <LocalisedField
                  value={joinParas(item.body)}
                  multiline
                  onChange={(v) => update({ ...item, body: splitParas(v) })}
                />
              </div>
              <div>
                <span className={s.langLabel}>Picture</span>
                <MediaField slug={slug} value={item.src} onChange={(src) => update({ ...item, src })} />
              </div>
            </div>
          )}
        />
      );
    }

    case "stats": {
      const items = (value as StatItem[] | undefined) ?? [];
      return (
        <RepeatableList
          items={items}
          onChange={onChange}
          newItem={() => ({ value: 0, label: "" })}
          addLabel="Add a number"
          makeRow={(item, update) => (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <span className={s.langLabel}>Number</span>
                  <input className={s.input} type="number" value={item.value ?? 0}
                    onChange={(e) => update({ ...item, value: Number(e.target.value) })} />
                </div>
                <div style={{ flex: 1 }}>
                  <span className={s.langLabel}>Suffix (optional, e.g. %)</span>
                  <input className={s.input} value={item.suffix ?? ""}
                    onChange={(e) => update({ ...item, suffix: e.target.value || undefined })} />
                </div>
              </div>
              <div>
                <span className={s.langLabel}>Label</span>
                <LocalisedField value={item.label} onChange={(label) => update({ ...item, label })} />
              </div>
            </div>
          )}
        />
      );
    }

    case "kv": {
      const items = (value as KvItem[] | undefined) ?? [];
      return (
        <RepeatableList
          items={items}
          onChange={onChange}
          newItem={() => ({ label: "", value: "" })}
          addLabel="Add a fact"
          makeRow={(item, update) => (
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1 }}>
                <span className={s.langLabel}>Label</span>
                <LocalisedField value={item.label} onChange={(label) => update({ ...item, label })} />
              </div>
              <div style={{ flex: 1 }}>
                <span className={s.langLabel}>Value</span>
                <LocalisedField value={item.value} onChange={(value) => update({ ...item, value })} />
              </div>
            </div>
          )}
        />
      );
    }

    case "terms": {
      const items = (value as TermItem[] | undefined) ?? [];
      return (
        <RepeatableList
          items={items}
          onChange={onChange}
          newItem={() => ({ term: "", description: "" })}
          addLabel="Add an item"
          makeRow={(item, update) => (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div>
                <span className={s.langLabel}>Term</span>
                <LocalisedField value={item.term} onChange={(term) => update({ ...item, term })} />
              </div>
              <div>
                <span className={s.langLabel}>What it means</span>
                <LocalisedField value={item.description} multiline
                  onChange={(description) => update({ ...item, description })} />
              </div>
            </div>
          )}
        />
      );
    }

    case "roles": {
      const items = (value as RoleItem[] | undefined) ?? [];
      return (
        <RepeatableList
          items={items}
          onChange={onChange}
          newItem={() => ({ role: "", name: "" })}
          addLabel="Add a name"
          makeRow={(item, update) => (
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1 }}>
                <span className={s.langLabel}>Role</span>
                <LocalisedField value={item.role} onChange={(role) => update({ ...item, role })} />
              </div>
              <div style={{ flex: 1 }}>
                <span className={s.langLabel}>Name</span>
                <input className={s.input} value={item.name ?? ""}
                  onChange={(e) => update({ ...item, name: e.target.value })} />
              </div>
            </div>
          )}
        />
      );
    }

    default:
      return null;
  }
}
