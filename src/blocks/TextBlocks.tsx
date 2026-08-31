import { Aurora } from "@/components/Aurora/Aurora";

import s from "./blocks.module.css";
import { tx, txAll, type BlockContext } from "./shared";
import type {
  CreditsBlock, HeroBlock, ListBlock, MetaBlock, QuoteBlock, StatementBlock, TextBlock,
} from "./types";

export function Hero({ block, ctx }: { block: HeroBlock; ctx: BlockContext }) {
  const centred = (block.variant ?? "centred") === "centred";
  return (
    <header className={`${s.hero} ${centred ? s.heroCentred : ""}`}>
      {block.eyebrow ? <p className={s.eyebrow}>{tx(block.eyebrow, ctx.locale)}</p> : null}
      <h1 className={s.heroTitle}>{block.title}</h1>
      {block.lede ? <p className={s.heroLede}>{tx(block.lede, ctx.locale)}</p> : null}
    </header>
  );
}

export function Meta({ block, ctx }: { block: MetaBlock; ctx: BlockContext }) {
  return (
    <div className={`${s.read} ${s.meta}`}>
      {block.items.map((row, i) => (
        <div key={i}>
          <div className={s.metaLabel}>{tx(row.label, ctx.locale)}</div>
          <div className={s.metaValue}>{tx(row.value, ctx.locale)}</div>
        </div>
      ))}
    </div>
  );
}

export function Text({ block, ctx }: { block: TextBlock; ctx: BlockContext }) {
  const paras = txAll(block.body, ctx.locale);

  /* Side-by-side only makes sense for exactly two paragraphs. Asking for it
     with three or five produced the ragged grid this replaced, so the layout
     falls back to the single measure rather than honouring an impossible
     request. */
  const pair = block.variant === "two-column" && paras.length === 2;

  /* Two registers on the same grid: a labelled flow (stacked on the
     single measure — text NEVER sets in columns, house rule), and a bare
     KICKER line spanning the width. */
  const kicker = !block.statement && !block.eyebrow;
  const wide = block.variant === "wide";

  return (
    <section
      className={`${s.chapter} ${block.eyebrow ? s.chapterRuled : ""} ${
        kicker ? s.kicker : ""
      } ${wide ? s.chapterWide : ""}`}
    >
      {block.eyebrow ? (
        <p className={`${s.eyebrow} ${s.secEyebrow}`}>{tx(block.eyebrow, ctx.locale)}</p>
      ) : null}
      {block.statement ? <h2 className={s.statement}>{tx(block.statement, ctx.locale)}</h2> : null}
      <div className={`${s.prose} ${pair ? s.pair : ""}`}>
        {paras.map((p, i) => <p key={i}>{p}</p>)}
      </div>
    </section>
  );
}

/**
 * A definition list. `cards` for a fixed taxonomy that should read as a set;
 * `rows` when the descriptions vary in length and want a shared left edge.
 */
export function List({ block, ctx }: { block: ListBlock; ctx: BlockContext }) {
  const cards = (block.variant ?? "cards") === "cards";
  const numbered = block.numbered ?? cards;

  return (
    <section className={`${s.chapter} ${block.eyebrow ? s.chapterRuled : ""}`}>
      {block.eyebrow ? (
        <p className={`${s.eyebrow} ${s.secEyebrow}`}>{tx(block.eyebrow, ctx.locale)}</p>
      ) : null}
      {block.statement ? <h2 className={s.statement}>{tx(block.statement, ctx.locale)}</h2> : null}

      {cards ? (
        /* Column count follows the item count so the hairline grid always
           fills its rows — four reads as 2×2, three sits in one row. The
           last-child span in the CSS catches any count that still orphans. */
        <div
          className={`${s.listCards} ${numbered ? "" : s.listStat}`}
          style={{ ["--list-cols" as string]:
            block.items.length <= 4 ? block.items.length
            : block.items.length % 4 === 0 ? 4
            : block.items.length % 3 === 0 ? 3 : 4 }}
        >
          {block.items.map((item, i) => (
            <div className={s.listCard} key={i}>
              {numbered ? (
                <span className={s.listCount}>{String(i + 1).padStart(2, "0")}</span>
              ) : null}
              <h3 className={s.listTerm}>{tx(item.term, ctx.locale)}</h3>
              {item.description ? (
                <p className={s.listDesc}>{tx(item.description, ctx.locale)}</p>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <div className={s.listRows}>
          {block.items.map((item, i) => (
            <div className={s.listRow} key={i}>
              <h3 className={s.listTerm}>{tx(item.term, ctx.locale)}</h3>
              {item.description ? (
                <p className={s.listDesc}>{tx(item.description, ctx.locale)}</p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function Statement({ block, ctx }: { block: StatementBlock; ctx: BlockContext }) {
  const centred = block.variant === "centred";
  return (
    <section className={s.read}>
      {block.eyebrow ? <p className={s.eyebrow}>{tx(block.eyebrow, ctx.locale)}</p> : null}
      <h2 className={`${s.statement} ${centred ? s.statementCentred : ""}`} style={{ marginBottom: 0 }}>
        {tx(block.text, ctx.locale)}
      </h2>
    </section>
  );
}

export function Quote({ block, ctx }: { block: QuoteBlock; ctx: BlockContext }) {
  const aurora = block.variant === "aurora";
  return (
    <section className={`${aurora ? s.stage : s.read} ${s.quote} ${aurora ? s.quoteAurora : ""}`}>
      {aurora ? <Aurora /> : null}
      <div className={s.quoteInner}>
        <p className={s.quoteText}>{tx(block.text, ctx.locale)}</p>
        {block.attribution ? (
          <p className={s.quoteAttribution}>{tx(block.attribution, ctx.locale)}</p>
        ) : null}
      </div>
    </section>
  );
}

export function Credits({ block, ctx }: { block: CreditsBlock; ctx: BlockContext }) {
  return (
    <section className={s.read}>
      <p className={s.eyebrow}>{tx(block.eyebrow, ctx.locale) || "Credits"}</p>
      <div className={s.credits}>
        {block.roles.map((r, i) => (
          <div key={i}>
            <div className={s.creditRole}>{tx(r.role, ctx.locale)}</div>
            <div className={s.creditName}>{r.name}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
