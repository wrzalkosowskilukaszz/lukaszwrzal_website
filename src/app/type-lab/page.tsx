import { notFound } from "next/navigation";

/**
 * Type lab — development only. Four candidate voices for the site, each
 * rendered as the same real case-study fragment so the comparison is fair.
 * Fonts load straight from Google here (fine for a lab page); whichever
 * direction wins gets wired through next/font like the current set.
 */

const SPECIMEN = {
  eyebrow: "01 The challenge",
  statement: "A brief can be beautifully written and still say nothing.",
  hero: "Lukasz Wrzal",
  heroSub: "Creative Designer & AI Director",
  lede: "We’ve all seen it. A project gets three months in, everyone is looking at the same brief, and everyone thinks they agree.",
  body: "The problem isn’t always bad writing. A brief can look finished while the important decisions inside it are still unresolved.",
  pl: "Zażółć gęślą jaźń — projektuję marki, produkty i systemy.",
  stat: "90%",
  meta: "Identity · Warsaw · 2026",
};

const DIRECTIONS = [
  {
    id: "current",
    name: "Control — what the site uses today",
    fonts: "Bricolage Grotesque · Archivo · JetBrains Mono",
    note: "Characterful, but Bricolage is now everyone’s ‘safe quirky’ pick, Archivo has no voice, JetBrains reads developer-tool.",
    display: "'Bricolage Grotesque'",
    displayVar: "\"opsz\" 48",
    body: "Archivo",
    mono: "'JetBrains Mono'",
  },
  {
    id: "wonk",
    name: "A — Editorial wonk",
    fonts: "Fraunces · Archivo · Fragment Mono",
    note: "A juicy high-contrast serif with a deliberate-imperfection axis (WONK), tuned rather than default — the strongest break from grotesque-only portfolio land. Joy lives in the letterforms.",
    display: "Fraunces",
    displayVar: "\"opsz\" 144, \"SOFT\" 0, \"WONK\" 1",
    body: "Archivo",
    mono: "'Fragment Mono'",
  },
  {
    id: "heritage",
    name: "B — Polish heritage",
    fonts: "Bona Nova · Hanken Grotesk · Martian Mono",
    note: "Bona was drawn in 1971 by Andrzej Heidrich — the designer of Poland’s banknotes — and digitised as Bona Nova. A display voice with a story no other portfolio can borrow.",
    display: "'Bona Nova'",
    displayVar: "\"opsz\" 1",
    body: "'Hanken Grotesk'",
    mono: "'Martian Mono'",
  },
  {
    id: "switzer",
    name: "D — Swiss minimal (Fontshare)",
    fonts: "Switzer · Switzer · Fragment Mono",
    note: "The cleanest free neo-grotesque outside Google Fonts — Swiss tradition, colder and more anonymous than Schibsted. The go-to for designers who find Inter too prevalent, which is also its risk: the minimal tier is crowded.",
    display: "Switzer",
    displayVar: "\"opsz\" 1",
    body: "Switzer",
    mono: "'Fragment Mono'",
  },
  {
    id: "general",
    name: "E — Grounded Swiss (Fontshare)",
    fonts: "General Sans · General Sans · Fragment Mono",
    note: "Swiss precision with more warmth in the bowls than Switzer. One family for display and body — maximum quiet, minimum voices.",
    display: "'General Sans'",
    displayVar: "\"opsz\" 1",
    body: "'General Sans'",
    mono: "'Fragment Mono'",
  },
  {
    id: "grotesk",
    name: "C — Sharpened grotesque",
    fonts: "Schibsted Grotesk · Hanken Grotesk · Fragment Mono",
    note: "Stay sans, but rarer: a characterful editorial grotesque that almost nobody’s portfolio uses, over a warmer body. Evolution, not revolution.",
    display: "'Schibsted Grotesk'",
    displayVar: "\"opsz\" 1",
    body: "'Hanken Grotesk'",
    mono: "'Fragment Mono'",
  },
];

const GF =
  "https://fonts.googleapis.com/css2?" +
  [
    "family=Fraunces:opsz,wght,SOFT,WONK@9..144,300..900,0..100,0..1",
    "family=Bona+Nova:ital,wght@0,400;0,700",
    "family=Hanken+Grotesk:wght@400;500;700",
    "family=Schibsted+Grotesk:wght@400;500;700;900",
    "family=Fragment+Mono",
    "family=Martian+Mono:wght@400;500",
    "family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,700",
    "family=Archivo:wght@400;500",
    "family=JetBrains+Mono:wght@500",
  ].join("&") +
  "&display=swap&subset=latin-ext";

const CSS = `
  * { margin: 0; box-sizing: border-box; }
  body { background: rgb(252, 251, 248); color: rgb(7, 26, 49); }
  .lab { max-width: 1200px; margin: 0 auto; padding: 48px 24px 120px; }
  .labHead { font-family: var(--mono, monospace); font-size: 12px; letter-spacing: 0.12em;
             text-transform: uppercase; color: rgb(95, 109, 119); margin-bottom: 60px; }
  .panel { border-top: 1px solid rgba(7, 26, 49, 0.14); padding: 26px 0 90px; }
  .dirName { font-size: 15px; font-weight: 700; margin-bottom: 4px; font-family: system-ui; }
  .dirFonts { font-size: 13px; color: rgb(95, 109, 119); font-family: system-ui; }
  .dirNote { font-size: 13px; color: rgb(95, 109, 119); font-family: system-ui;
             max-width: 62ch; margin-top: 8px; line-height: 1.5; }
  .stage { margin-top: 44px; display: grid; grid-template-columns: 220px minmax(0, 1fr); gap: 64px; }
  .rail { font-size: 11px; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase;
          color: rgb(95, 109, 119); }
  .hero { font-weight: 700; font-size: 72px; line-height: 1.02; letter-spacing: -0.03em; }
  .heroSub { margin-top: 10px; font-size: 18px; color: rgb(69, 69, 69); }
  .statement { margin-top: 46px; font-weight: 700; font-size: 42px; line-height: 1.12;
               letter-spacing: -0.02em; max-width: 24ch; text-wrap: balance; }
  .lede { margin-top: 28px; font-size: 19px; line-height: 1.6; max-width: 60ch; }
  .bodyP { margin-top: 14px; font-size: 17px; line-height: 1.65; color: rgb(95, 109, 119); max-width: 62ch; }
  .pl { margin-top: 14px; font-size: 17px; line-height: 1.65; color: rgb(95, 109, 119); }
  .row { margin-top: 34px; display: flex; align-items: baseline; gap: 40px; }
  .stat { font-weight: 700; font-size: 64px; letter-spacing: -0.03em; }
  .metaLbl { font-size: 11px; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase;
             color: rgb(95, 109, 119); }
  .cta { display: inline-block; margin-left: auto; background: rgb(7, 26, 49); color: rgb(252, 251, 248);
         border-radius: 999px; padding: 12px 22px; font-size: 14px; font-weight: 500; }
  .cta b { color: rgb(94, 231, 197); font-weight: 500; }
`;

export default function TypeLab() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <html lang="en">
      <head>
        <title>Type lab</title>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={GF} />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=switzer@400,500,700,900&f[]=general-sans@400,500,600,700&display=swap"
        />
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
      </head>
      <body>
        <main className="lab">
          <p className="labHead" style={{ fontFamily: "'JetBrains Mono'" }}>
            Type lab · six voices · same copy · judge with your eyes
          </p>
          {DIRECTIONS.map((d) => (
            <section className="panel" key={d.id}>
              <h2 className="dirName">{d.name}</h2>
              <p className="dirFonts">{d.fonts}</p>
              <p className="dirNote">{d.note}</p>

              <div className="stage">
                <div className="rail" style={{ fontFamily: d.mono }}>{SPECIMEN.eyebrow}</div>
                <div>
                  <h1 className="hero" style={{ fontFamily: d.display, fontVariationSettings: d.displayVar }}>
                    {SPECIMEN.hero}
                  </h1>
                  <p className="heroSub" style={{ fontFamily: d.body }}>{SPECIMEN.heroSub}</p>

                  <h3 className="statement" style={{ fontFamily: d.display, fontVariationSettings: d.displayVar }}>
                    {SPECIMEN.statement}
                  </h3>
                  <p className="lede" style={{ fontFamily: d.body }}>{SPECIMEN.lede}</p>
                  <p className="bodyP" style={{ fontFamily: d.body }}>{SPECIMEN.body}</p>
                  <p className="pl" style={{ fontFamily: d.body }}>{SPECIMEN.pl}</p>

                  <div className="row">
                    <span className="stat" style={{ fontFamily: d.display, fontVariationSettings: d.displayVar }}>
                      {SPECIMEN.stat}
                    </span>
                    <span className="metaLbl" style={{ fontFamily: d.mono }}>{SPECIMEN.meta}</span>
                    <span className="cta" style={{ fontFamily: d.body }}>
                      Book a call <b>→</b>
                    </span>
                  </div>
                </div>
              </div>
            </section>
          ))}
        </main>
      </body>
    </html>
  );
}
