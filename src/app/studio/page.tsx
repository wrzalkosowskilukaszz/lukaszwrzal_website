import Link from "next/link";

import { getProjectDocs, isDraftDoc, loadErrors } from "@/lib/projects";
import s from "@/components/Studio/Studio.module.css";

export const dynamic = "force-dynamic";

export default function StudioIndex() {
  const docs = getProjectDocs();
  const broken = loadErrors();

  return (
    <div className={s.page}>
      <h1 className={s.h1}>Projects</h1>
      <p className={s.sub}>{docs.length} project{docs.length === 1 ? "" : "s"}. Click one to edit it.</p>

      <Link href="/studio/new" className={s.newBtn}>+ New project</Link>

      {broken.length ? (
        <div className={s.errorBanner}>
          <b>{broken.length} file{broken.length === 1 ? "" : "s"} couldn&apos;t be read and {broken.length === 1 ? "is" : "are"} being skipped:</b>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {broken.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
      ) : null}

      <div className={s.list}>
        {docs.map((doc) => (
          <Link key={doc.slug} href={`/studio/${doc.slug}`} className={s.row}>
            <span className={s.rowTitle}>{doc.title}</span>
            {isDraftDoc(doc) ? <span className={`${s.badge} ${s.badgeDraft}`}>Draft</span> : null}
            <span className={s.rowMeta}>{doc.cat} · {doc.year}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
