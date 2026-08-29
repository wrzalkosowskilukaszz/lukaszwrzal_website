"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { BlockType } from "@/blocks/types";
import { BLOCK_FIELDS, BLOCK_LABELS, CATEGORY_OPTIONS } from "@/studio/schema";
import { emptyDoc, slugify, starterBlocks, type DraftBlock, type DraftDoc } from "@/studio/draft";

import { BlockCard } from "./BlockCard";
import { LocalisedField } from "./LocalisedField";
import s from "./Studio.module.css";

type Tone = "idle" | "saving" | "ok" | "error";

export function Editor({
  initial,
  originalSlug,
  otherProjects,
}: {
  initial: DraftDoc | null;
  originalSlug: string | null;
  otherProjects: { slug: string; title: string }[];
}) {
  const router = useRouter();
  const isNew = initial === null;
  const [doc, setDoc] = useState<DraftDoc>(() => {
    if (initial) return initial;
    const d = emptyDoc();
    d.blocks = starterBlocks();
    return d;
  });
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [addOpen, setAddOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [alsoDeleteImages, setAlsoDeleteImages] = useState(false);
  const [imageCount, setImageCount] = useState(0);
  const [tone, setTone] = useState<Tone>("idle");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  const set = <K extends keyof DraftDoc>(key: K, value: DraftDoc[K]) =>
    setDoc((d) => ({ ...d, [key]: value }));

  const onTitleChange = (title: string) => {
    set("title", title);
    if (!slugTouched) set("slug", slugify(title));
  };

  const addBlock = (type: BlockType) => {
    const draft: DraftBlock = { type };
    setDoc((d) => ({ ...d, blocks: [...d.blocks, draft] }));
    setAddOpen(false);
  };

  const save = async () => {
    setTone("saving");
    setMessage("Saving…");
    setErrors([]);
    try {
      const res = await fetch("/api/studio/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doc, originalSlug }),
      });
      const json = await res.json();
      if (!res.ok) {
        setTone("error");
        setMessage("Couldn't save — fix the following:");
        setErrors(json.errors ?? ["Something went wrong."]);
        return;
      }
      setTone("ok");
      setMessage("Saved");
      if (isNew || doc.slug !== originalSlug) {
        router.push(`/studio/${doc.slug}`);
      } else {
        router.refresh();
      }
    } catch {
      setTone("error");
      setMessage("Couldn't reach the server.");
    }
  };

  /* Deleting is the one irreversible thing here, so it asks in place rather
     than in a browser dialog — and shows how many pictures are at stake. */
  const startRemove = async () => {
    if (!originalSlug) return;
    try {
      const res = await fetch(`/api/studio/assets?slug=${encodeURIComponent(originalSlug)}`);
      const json = await res.json();
      setImageCount((json.files ?? []).length);
    } catch {
      setImageCount(0);
    }
    setAlsoDeleteImages(false);
    setConfirming(true);
  };

  const confirmRemove = async () => {
    if (!originalSlug) return;
    await fetch("/api/studio/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: originalSlug, deleteImages: alsoDeleteImages }),
    });
    router.push("/studio");
  };

  const nextOptions = otherProjects.filter((p) => p.slug !== doc.slug);

  return (
    <div className={s.page}>
      <h1 className={s.h1}>{isNew ? "New project" : doc.title || doc.slug}</h1>
      <p className={s.sub}>
        {isNew ? "Fill in the basics, then build the page below." : `/work/${doc.slug}`}
      </p>

      <div className={s.metaGrid}>
        <div className={`${s.field} ${s.full}`}>
          <span className={s.label}>Title *</span>
          <input className={s.input} value={doc.title} onChange={(e) => onTitleChange(e.target.value)} />
        </div>

        <div className={s.field}>
          <span className={s.label}>URL name (slug) *</span>
          <input
            className={s.input}
            data-invalid={doc.slug !== "" && !/^[a-z0-9-]+$/.test(doc.slug)}
            value={doc.slug}
            onChange={(e) => { setSlugTouched(true); set("slug", slugify(e.target.value)); }}
          />
          <span className={s.help}>Lowercase letters, numbers, hyphens. Becomes /work/{doc.slug || "…"}</span>
        </div>

        <div className={s.field}>
          <span className={s.label}>Category *</span>
          <select className={s.select} value={doc.cat} onChange={(e) => set("cat", e.target.value as DraftDoc["cat"])}>
            <option value="" disabled>Choose one</option>
            {CATEGORY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <div className={s.field}>
          <span className={s.label}>Year *</span>
          <input className={s.input} value={doc.year} onChange={(e) => set("year", e.target.value)} />
        </div>

        <div className={s.field}>
          <span className={s.label}>“Next project” links to *</span>
          <select className={s.select} value={doc.nextSlug} onChange={(e) => set("nextSlug", e.target.value)}>
            <option value="" disabled>Choose a project</option>
            {nextOptions.map((p) => <option key={p.slug} value={p.slug}>{p.title}</option>)}
          </select>
        </div>

        <div className={`${s.field} ${s.full}`}>
          <span className={s.label}>Short description *</span>
          <span className={s.help}>Shown on the work list.</span>
          <LocalisedField value={doc.desc} onChange={(desc) => set("desc", desc)} />
        </div>
      </div>

      <div className={s.sectionsHead}>
        <h2>Page sections</h2>
        <span className={s.help}>{doc.blocks.length} section{doc.blocks.length === 1 ? "" : "s"}</span>
      </div>

      {doc.blocks.map((block, i) => (
        <BlockCard
          key={i}
          block={block}
          slug={doc.slug}
          canMoveUp={i > 0}
          canMoveDown={i < doc.blocks.length - 1}
          onMove={(delta) => {
            const j = i + delta;
            const next = [...doc.blocks];
            [next[i], next[j]] = [next[j], next[i]];
            set("blocks", next);
          }}
          onRemove={() => set("blocks", doc.blocks.filter((_, idx) => idx !== i))}
          onChange={(next) => set("blocks", doc.blocks.map((b, idx) => (idx === i ? next : b)))}
        />
      ))}

      {addOpen ? (
        <div className={s.addMenu}>
          {(Object.keys(BLOCK_FIELDS) as BlockType[]).map((type) => (
            <button key={type} type="button" className={s.addOption} onClick={() => addBlock(type)}>
              <span className="name" style={{ display: "block", fontFamily: "var(--lw-font-display)", fontWeight: 700, fontSize: 13.5 }}>
                {BLOCK_LABELS[type].label}
              </span>
              <span className="desc" style={{ fontSize: 12, color: "var(--lw-muted)" }}>{BLOCK_LABELS[type].help}</span>
            </button>
          ))}
        </div>
      ) : (
        <button type="button" className={s.addToggle} onClick={() => setAddOpen(true)}>+ Add a section</button>
      )}

      {confirming ? (
        <div className={s.confirmPanel}>
          <b>Delete &ldquo;{doc.title || originalSlug}&rdquo;?</b>
          <p>
            The project page and its entry in the work list will be removed.
            This can&apos;t be undone.
          </p>
          {imageCount > 0 ? (
            <label className={s.confirmCheck}>
              <input
                type="checkbox"
                checked={alsoDeleteImages}
                onChange={(e) => setAlsoDeleteImages(e.target.checked)}
              />
              Also delete its {imageCount} picture{imageCount === 1 ? "" : "s"} from
              {" "}<code>public/work/{originalSlug}/</code>
            </label>
          ) : null}
          {imageCount > 0 && !alsoDeleteImages ? (
            <p className={s.confirmNote}>
              Pictures will be kept. If you later create a project with the same
              URL name, they&apos;ll reappear on it.
            </p>
          ) : null}
          <div className={s.confirmActions}>
            <button type="button" className={`${s.saveBtn} ${s.confirmDelete}`} onClick={confirmRemove}>
              Delete project
            </button>
            <button type="button" className={s.ghostBtn} onClick={() => setConfirming(false)}>
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {errors.length ? (
        <div className={s.errorBanner}>
          <b>Fix these before saving:</b>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {errors.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
      ) : null}

      <div className={s.saveBar}>
        <a href={`/en/work/${doc.slug}`} target="_blank" rel="noreferrer" className={s.ghostBtn}>
          Preview
        </a>
        {!isNew ? (
          <button type="button" className={`${s.ghostBtn} ${s.dangerBtn}`} onClick={startRemove}>
            Delete
          </button>
        ) : null}
        <span className={s.status} data-tone={tone}>{message}</span>
        <button type="button" className={s.saveBtn} onClick={save} disabled={tone === "saving"}>
          Save
        </button>
      </div>
    </div>
  );
}
