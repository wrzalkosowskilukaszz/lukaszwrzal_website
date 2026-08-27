> Copied from the design project's `CLAUDE.md`. Rename it back to `CLAUDE.md`
> at the root of your repo so Claude Code picks it up automatically.

# CLAUDE.md — Lukasz Wrzal Portfolio

Persistent working rules for this project. Read this before touching anything.

## What this project is

A personal portfolio site for **Lukasz Wrzal** — Creative Designer & AI Director,
Warsaw. Multi-page, built as Design Components. Not a single-page artifact.

**Live pages (the only files that matter):**

| File | Role |
| --- | --- |
| `Portfolio v3.dc.html` | **Homepage.** The canonical design. |
| `Work.dc.html` | All-work index — 30 projects, 7 filters |
| `Project - Northwind.dc.html` | **Every** case-study page, via `?p=<slug>` |
| `content/projects.json` | Content source of truth — 30 projects × EN/PL |
| `brand/tokens.css` | Brand System v2 tokens |
| `brand/readme.md` | Brand System v2 documentation |
| `site-tools.js` | Language switching + in-page copy editor |
| `image-slot.js` | Drag-and-drop image placeholders |

**Superseded — do not edit, do not reference, do not "fix":**
`Portfolio.dc.html` (v1, warm paper), `Portfolio v2.dc.html` (bright DS-components
experiment), `Case Study - Northwind.dc.html` (replaced by `Project - Northwind`),
`Northwind Case Study.html` (a standalone export — regenerate rather than edit).

## Non-negotiables

1. **Never fork a page to add a variant.** Twelve→thirty projects did not create
   thirty files. `Project - Northwind.dc.html?p=slug` serves all of them. One file
   to refine, N pages that benefit. Same instinct applies to anything else.
2. **All copy lives in `content/projects.json`**, never hardcoded in a page. Pages
   carry a small inline fallback map only for when the fetch fails (`file://`).
3. **Every page needs:** the floating pill nav, the EN/PL toggle, `site-tools.js`,
   `brand/tokens.css`, the design-system bundle, and the aurora footer.
4. **Palette follows the user's Figma**, not the design system's warm paper. Navy
   ink `rgb(7,26,49)` on near-white `rgb(252,251,248)`. This is a deliberate,
   documented departure — do not "correct" it back to the DS palette.
5. **Mint `rgb(94,231,197)` is the only accent.** Primary CTA, the arrow disc in a
   hovered tile, the language pill. Nowhere else. If a second accent seems needed,
   the layout is wrong.
6. **Guard every init and every frame.** `try/catch` per init, `try/catch` inside
   the rAF loop, animation clock started *before* any third-party embed. A
   cal.com failure must never take down the reel or the gradients.
7. **Sentence case everywhere.** ALL CAPS only for mono eyebrow labels.

## The hover language

**The layout moves, not the object.** Never `scale()` a tile on hover.

- A hovered card/column claims width via spring-interpolated `fr` (homepage) or
  pixel widths (work page); neighbours shed the difference.
- Unattended tiles drop to `saturate(0.22) brightness(1.04)`.
- Labels live **inside** the media, never below it — twelve identical
  relationships instead of twelve accidental ones.
- Hover adds: index/year top-left, mint arrow disc top-right, deepened scrim, and
  a descriptor expanding beneath the name via animated `height`.

## The aurora field

The only place colour appears at scale. Five soft radial blobs on independent
sine orbits inside a clipped rounded container — **never a linear gradient**.

- Colours: sky `rgba(205,221,242,.98)`, violet `rgba(60,44,194,.2)`, butter
  `rgba(255,248,207,.95)`, mint `rgba(94,231,197,.5)`, sky-soft core.
- Blur 30–44px, scales breathe ±6%, eased pointer drift, plus a shift driven by
  the section's travel through the viewport.
- Used in exactly two roles: behind the work grid and behind footers. That
  scarcity is what makes it read as intentional.
- The bento instance is the **same field** as the footer's, positioned over the
  lower two-thirds with a soft top mask so it starts as pure page background and
  colour arrives mid-section.

## Motion

Two CSS curves: `--lw-ease-out` (enters), `--lw-ease-playful` (hover/press).
Anything interruptible uses a **critically-damped spring in JS**, not a
transition — column widths, carousel planes, pinned sequences. No page-load
choreography.

**Never hijack the wheel.** Scroll-driven sequences use a sticky viewport over a
tall track, mapping scroll distance to steps. The scroll never stops being the
scroll. Both the hero reel and the About section work this way.

## Layout

- `1872px` outer stage · `1420px` content · `1200px` prose
- Work grid is full-bleed: `min(2400px, 100% - 32px)`, 14px gap
- Radii: `64px` section containers · `22px` tiles · `999px` pills
- Bento gaps 29px column / 30px row
- Section rhythm `clamp(4rem, 8vw, 7.5rem)`

**One grid, explicit spans.** Mixing a fixed container with `94vw` breakouts and
percentage flex bases is what made an earlier build read as chaos. Every block
declares its span.

## Type

Geist (display + body), Geist Mono (labels). Display tracking `-2px`, titles
`-0.3px`, mono labels `0.12em` uppercase. Body 15–18px at 1.5–1.7 line-height.

The design system nominally specifies Space Grotesk / Work Sans — Geist is the
established choice here and stays.

## Languages

EN + PL. Segmented pill in the nav, left of the CTA, hairline separator.
Persists via `localStorage` + `?lang=pl`.

- **Project copy** comes from the `en`/`pl` blocks in `projects.json`.
- **Page chrome** translates from a `CHROME_PL` / `COPY_PL` dictionary in each
  page's logic, matched by exact English text — so the template stays the single
  source of the English wording. When you add chrome copy, add its PL key too.

## Content editing

- Images: drag-and-drop `<image-slot>`, namespaced per project slug, persists.
- Text: `?edit=1` on any page → pill bottom-centre → Edit text / Save / Copy JSON
  / Reset. Saves to `localStorage`, keyed per language *and* per project. **Copy
  JSON** is how edits become permanent in `projects.json`.

## Working style with this user

- He is a designer. He notices sub-pixel drift, colour temperature, and rhythm.
  Vague reassurance is worse than a blunt diagnosis.
- **When he says something "looks chaotic" or "bugs", find the structural cause
  and name it.** Past real causes: three competing left edges; grid columns being
  shared down the whole grid; `img.complete` true for cached images so a
  zero-width measurement stuck; a last row of 2 cards distributing width across 4.
- He asks for "world-class 2026" work and explicitly rejects: simple fades, SVG
  line-draw, `scale(1.05)` hovers, basic drop shadows, standard carousels.
- He proposes ideas and asks for a better one. Give a real opinion with the
  reason, then build. He accepted "don't hijack the wheel" when the reason was
  clear.
- Terse replies. Lead with what changed. No preamble.

## Never

- Copy or reproduce Calendly's code or proprietary UI. Their *feeling* is
  available through this design system, which is an original interpretation.
  This has come up more than once — hold the line politely.
- Add a shadow to fake a section edge (tried, rejected — the gradient's own
  weight defines the edge).
- Put project names below tiles in a masonry layout.
- Use `aspect-ratio` on cards whose width animates — it makes the stretch
  vertical too. Pin height in px from the resting width.

---

# Implementation notes (added when the site was built)

The rules above came from the design project. This section records how they
landed in this codebase.

## Stack

Next.js App Router + TypeScript + CSS Modules. No animation library — the
spring is ~15 lines in `src/lib/spring.ts` and stays interruptible.

## Where the non-negotiables live

| Rule | Code |
| --- | --- |
| One template, N pages | `src/app/[locale]/work/[slug]/page.tsx` |
| Copy never hardcoded | `src/content/projects.json`, read at build time |
| Nav + EN/PL on every page | `src/app/[locale]/layout.tsx` |
| Guard every init and frame | `src/lib/raf.ts` — one loop, per-subscriber try/catch |
| Mint is the only accent | CTA, tile arrow disc, active language pill |
| Sentence case | `.lw-eyebrow` is the only uppercase |

## Deviations from the prototypes, and why

- **i18n uses semantic keys**, not English-string matching. The handoff said to
  replace the text-node walker with the framework's own i18n; string keys are
  fragile once copy is edited. Both dictionaries are in `src/lib/i18n.ts`.
- **`desc` moved into the `en`/`pl` blocks.** It was top-level and English-only,
  but the prototype's `CHROME_PL` carried Polish for 12 of them. The other 18
  fall back to English until written.
- **`cat` / `year` / `desc` were recovered from `Work.dc.html`.** The JSON only
  carried them for the last 10 of 30 projects; the rest lived as `data-cat`
  attributes in the prototype markup. The recovered spread matches the
  documented one exactly (Identity 7, Product 5, Brand 4, Web 4, AI 4,
  Illustrations 6).
- **CSS owns every resting layout.** The prototypes drove card widths purely
  from the rAF loop, so with JS disabled or in a background tab the grid
  collapsed. CSS now sets the resting width and height; springs only override
  mid-hover.
- **`prefers-reduced-motion` is implemented** — a global CSS kill-switch plus
  per-module blocks, and `useReducedMotion()` holds springs at rest.
- **Accessibility gaps from the handoff are closed**: lightbox focus trap and
  `aria-modal`, filters as a `role="group"` with `aria-pressed`, language
  control with `aria-current`, skip link, decorative elements hidden.
  `--lw-faint` is no longer used for text (2.44:1 on paper).

## Content editing

`?edit=1` on any page. Text writes to `projects.json`, dropped images save into
`public/work/<slug>/` at original resolution. Development only — the API routes
in `src/app/api/` refuse to run in production. See README.md.

**Never route content back through the design prototypes.** `image-slot.js`
caps uploads at 1200px, re-encodes to WebP and keeps the result in browser
storage — destructive for a portfolio and impossible to export.

## Tests

`npm test` covers the work-grid layout invariants — the short final row, the
0.5px shave, and the rule that every row's width factors sum to its length so
cards can never wrap mid-hover. These are the bugs from context/MEMORY.md,
pinned down so they cannot come back.
