import Link from "next/link";
import { notFound } from "next/navigation";

import "../[locale]/globals.css";
import s from "@/components/Studio/Studio.module.css";

export const metadata = { title: "Studio" };

/**
 * The content tool. Development only — it writes files, which no deployed
 * site should be able to do.
 */
export default function StudioLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <html lang="en">
      <body>
        <div className={s.shell}>
          <div className={s.topbar}>
            <span className={s.brand}>
              <Link href="/studio">Studio</Link>
            </span>
            <Link href="/en" className={s.brand} style={{ fontWeight: 500, fontSize: 13 }}>
              View site →
            </Link>
          </div>
          {children}
        </div>
      </body>
    </html>
  );
}
