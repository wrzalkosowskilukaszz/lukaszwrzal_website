"use client";

import { useEffect, useRef, useState } from "react";

import s from "./Studio.module.css";

/**
 * Uploading a picture. No dragging JSON, no remembering a filename — pick a
 * file, it's saved into the project's folder, and the field is filled in
 * for you. "Choose existing" reuses a file already sitting in that folder.
 */
export function MediaField({
  slug,
  value,
  onChange,
}: {
  slug: string;
  value: string | undefined;
  onChange: (filename: string) => void;
}) {
  const [existing, setExisting] = useState<string[]>([]);
  const [showExisting, setShowExisting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const slugReady = /^[a-z0-9-]+$/.test(slug);

  useEffect(() => {
    if (!slugReady) return;
    fetch(`/api/studio/assets?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((d) => setExisting(d.files ?? []))
      .catch(() => {});
  }, [slug, slugReady, value]);

  const upload = async (file: File) => {
    setBusy(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("slug", slug);
      const res = await fetch("/api/studio/upload", { method: "POST", body });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Upload failed.");
      onChange(json.filename);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  };

  const isVideo = value ? /\.(mp4|webm)$/i.test(value) : false;
  const src = value && slugReady ? `/work/${slug}/${value}` : null;

  return (
    <div>
      <div className={s.media}>
        <div className={s.thumb}>
          {src ? (
            isVideo ? <video src={src} muted /> : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={src} alt="" />
            )
          ) : (
            <span className={s.thumbEmpty}>No file</span>
          )}
        </div>
        <div className={s.mediaButtons}>
          <span className={s.mediaFilename}>{value || "Nothing chosen yet"}</span>
          <div className={s.mediaRow}>
            <button
              type="button"
              className={s.smallBtn}
              disabled={!slugReady || busy}
              onClick={() => inputRef.current?.click()}
            >
              {busy ? "Uploading…" : "Upload"}
            </button>
            {existing.length > 0 ? (
              <button type="button" className={s.smallBtn} onClick={() => setShowExisting((v) => !v)}>
                Choose existing
              </button>
            ) : null}
          </div>
          {!slugReady ? <span className={s.help}>Fill in the project&apos;s URL name above first.</span> : null}
          {error ? <span className={s.help} style={{ color: "#B23030" }}>{error}</span> : null}
        </div>
      </div>

      {showExisting ? (
        <div className={s.mediaRow} style={{ marginTop: 8, flexWrap: "wrap" }}>
          {existing.map((f) => (
            <button
              key={f}
              type="button"
              className={s.smallBtn}
              onClick={() => { onChange(f); setShowExisting(false); }}
            >
              {f}
            </button>
          ))}
        </div>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/mp4,video/webm"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void upload(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
