"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import styles from "./Editor.module.css";

type Tone = "idle" | "dirty" | "saving" | "saved" | "error";

/**
 * In-place content editor. Reached with `?edit=1` on any page.
 *
 * Same gesture as the design prototypes, but it writes to real files:
 * copy lands in src/content/projects.json, dropped images are saved into
 * /public/work/<slug>/ at their ORIGINAL resolution.
 *
 * Development only — the API routes it calls refuse in production.
 */
export function Editor() {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const on = params.get("edit") === "1";

  /** Uploads are namespaced per project, so only case studies take drops. */
  const slug = pathname.match(/^\/(?:en|pl)\/work\/([a-z0-9-]+)\/?$/)?.[1];

  /* Editability is a property of the route, not something to discover from
     the DOM — only case-study pages carry copy and image slots. */
  const editable = Boolean(slug);

  const [tone, setTone] = useState<Tone>("idle");
  const [message, setMessage] = useState("No changes");
  const edits = useRef<Map<string, string>>(new Map());

  const setStatus = (t: Tone, m: string) => { setTone(t); setMessage(m); };

  /* Turn every [data-edit] node into a contentEditable field. */
  useEffect(() => {
    if (!on) {
      document.body.removeAttribute("data-edit");
      return;
    }
    document.body.setAttribute("data-edit", "on");

    const nodes = Array.from(
      document.querySelectorAll<HTMLElement>("[data-edit]"),
    );

    const originals = new Map<HTMLElement, string>();

    const onInput = (e: Event) => {
      const el = e.currentTarget as HTMLElement;
      const key = el.dataset.edit;
      if (!key) return;
      const value = el.innerText.trim();
      if (value === originals.get(el)) {
        edits.current.delete(key);
        el.removeAttribute("data-dirty");
      } else {
        edits.current.set(key, value);
        el.setAttribute("data-dirty", "true");
      }
      const n = edits.current.size;
      setStatus(n ? "dirty" : "idle", n ? `${n} unsaved` : "No changes");
    };

    /* Enter commits rather than inserting a newline — these are plain
       strings in JSON, not rich text. */
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        (e.currentTarget as HTMLElement).blur();
      }
      if (e.key === "Escape") {
        const el = e.currentTarget as HTMLElement;
        el.innerText = originals.get(el) ?? el.innerText;
        el.dispatchEvent(new Event("input", { bubbles: false }));
        el.blur();
      }
    };

    /* Strip formatting from pasted text. */
    const onPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      const text = e.clipboardData?.getData("text/plain") ?? "";
      document.execCommand("insertText", false, text);
    };

    for (const el of nodes) {
      originals.set(el, el.innerText.trim());
      el.contentEditable = "plaintext-only";
      el.spellcheck = true;
      el.addEventListener("input", onInput);
      el.addEventListener("keydown", onKeyDown as EventListener);
      el.addEventListener("paste", onPaste as EventListener);
    }

    return () => {
      for (const el of nodes) {
        el.contentEditable = "false";
        el.removeAttribute("data-dirty");
        el.removeEventListener("input", onInput);
        el.removeEventListener("keydown", onKeyDown as EventListener);
        el.removeEventListener("paste", onPaste as EventListener);
      }
      document.body.removeAttribute("data-edit");
    };
  }, [on]);

  /* Drag an image onto any media slot. */
  useEffect(() => {
    if (!on || !slug) return;

    const slots = Array.from(document.querySelectorAll<HTMLElement>("[data-slot]"));

    const over = (e: DragEvent) => {
      e.preventDefault();
      (e.currentTarget as HTMLElement).dataset.drop = "over";
    };
    const leave = (e: DragEvent) => {
      delete (e.currentTarget as HTMLElement).dataset.drop;
    };
    const drop = async (e: DragEvent) => {
      e.preventDefault();
      const el = e.currentTarget as HTMLElement;
      delete el.dataset.drop;

      const file = e.dataTransfer?.files?.[0];
      const slot = el.dataset.slot;
      if (!file || !slot) return;

      setStatus("saving", `Uploading ${file.name}…`);
      const body = new FormData();
      body.append("file", file);
      body.append("slug", slug);
      body.append("slot", slot);

      try {
        const res = await fetch("/api/upload", { method: "POST", body });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Upload failed");
        setStatus("saved", `Saved ${slot} · ${(json.bytes / 1024 / 1024).toFixed(1)}MB`);
        router.refresh();
      } catch (err) {
        setStatus("error", err instanceof Error ? err.message : "Upload failed");
      }
    };

    for (const el of slots) {
      el.addEventListener("dragover", over);
      el.addEventListener("dragleave", leave);
      el.addEventListener("drop", drop);
    }
    return () => {
      for (const el of slots) {
        el.removeEventListener("dragover", over);
        el.removeEventListener("dragleave", leave);
        el.removeEventListener("drop", drop);
      }
    };
  }, [on, slug, router]);

  const save = useCallback(async () => {
    if (edits.current.size === 0) return;
    setStatus("saving", "Saving…");
    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ edits: Object.fromEntries(edits.current) }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Save failed");

      if (json.rejected?.length) {
        setStatus("error", `Saved ${json.saved}, rejected ${json.rejected.length}`);
        console.warn("[editor] rejected paths", json.rejected);
      } else {
        setStatus("saved", `Saved ${json.saved}`);
      }
      edits.current.clear();
      document
        .querySelectorAll("[data-dirty]")
        .forEach((el) => el.removeAttribute("data-dirty"));
      router.refresh();
    } catch (err) {
      setStatus("error", err instanceof Error ? err.message : "Save failed");
    }
  }, [router]);

  /* Cmd/Ctrl+S saves. */
  useEffect(() => {
    if (!on) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void save();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [on, save]);

  /* Warn before losing unsaved edits. */
  useEffect(() => {
    if (!on) return;
    const warn = (e: BeforeUnloadEvent) => {
      if (edits.current.size > 0) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [on]);

  const enter = () => {
    const url = new URL(window.location.href);
    url.searchParams.set("edit", "1");
    window.location.href = url.toString();
  };

  if (!on) {
    return (
      <button type="button" className={styles.launcher} onClick={enter}>
        <span className={styles.pip} aria-hidden="true" />
        Edit content
      </button>
    );
  }

  const nothingHere = !editable;

  return (
    <>
      {nothingHere ? (
        <p className={styles.hint}>
          Nothing on this page is editable yet. Open any project from{" "}
          <b>Work</b> — that is where the copy and all twelve image slots live.
        </p>
      ) : null}

      <div className={styles.bar} role="toolbar" aria-label="Content editor">
      <span className={styles.status} data-tone={tone}>{message}</span>

      <button
        type="button"
        className={`${styles.btn} ${styles.primary}`}
        onClick={save}
        disabled={tone === "saving"}
      >
        Save
      </button>

      {editable ? (
        <span className={styles.scope}>12 image slots</span>
      ) : null}

      <button
        type="button"
        className={styles.btn}
        onClick={() => {
          const url = new URL(window.location.href);
          url.searchParams.delete("edit");
          window.location.href = url.toString();
        }}
      >
        Done
      </button>
      </div>
    </>
  );
}
