import { Aurora } from "@/components/Aurora/Aurora";

import s from "./blocks.module.css";
import { tx, txAll, type BlockContext } from "./shared";
import type {
  CreditsBlock, HeroBlock, MetaBlock, QuoteBlock, StatementBlock, TextBlock,
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
  const cells = [
    ["Client", block.client], ["Role", block.role],
    ["Scope", block.scope], ["Team", block.team],
  ] as const;
  return (
    <div className={`${s.read} ${s.meta}`}>
      {cells.filter(([, v]) => v).map(([label, value]) => (
        <div key={label}>
          <div className={s.metaLabel}>{label}</div>
          <div className={s.metaValue}>{tx(value, ctx.locale)}</div>
        </div>
      ))}
    </div>
  );
}

export function Text({ block, ctx }: { block: TextBlock; ctx: BlockContext }) {
  const twoCol = (block.variant ?? "two-column") === "two-column";
  const paras = txAll(block.body, ctx.locale);
  return (
    <section className={s.read}>
      {block.eyebrow ? <p className={s.eyebrow}>{tx(block.eyebrow, ctx.locale)}</p> : null}
      {block.statement ? <h2 className={s.statement}>{tx(block.statement, ctx.locale)}</h2> : null}
      <div className={`${s.prose} ${twoCol ? s.columns : ""}`} style={twoCol ? undefined : { maxWidth: "64ch" }}>
        {paras.map((p, i) => <p key={i}>{p}</p>)}
      </div>
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
