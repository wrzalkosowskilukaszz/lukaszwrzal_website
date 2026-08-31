# CLAUDE.md — Lukasz Wrzal Portfolio

Persistent working rules. Read this before touching anything. Everything
durable about this project lives in this file, the code, and git history —
a fresh session needs nothing else.

## The brief

**Who:** Lukasz "Luke" Wrzal — Creative Designer & AI Director, Warsaw.
A designer, not an engineer: explain tooling plainly, show screenshots not
descriptions, and when something "looks chaotic," find the structural cause
and name it bluntly.

**For whom:** recruiters and hiring creatives. They come to see projects.
Straight to the work, fast to judge, easy to browse.

**Goal:** land the next role. The site must read as *his* — creative,
joyful, crafted — never as a template or an AI-generated default. He
explicitly rejects "AI slop": generic fonts, purple gradients, scale-up
hovers, cookie-cutter layouts.

**Tone:** minimal but characterful. Editorial rigor with playful details.
Personality through craft (letterforms, motion physics, composition), not
through gimmicks.

## Stack

Next.js App Router + TypeScript + CSS Modules. No animation library — the
critically-damped spring is ~15 lines in `src/lib/spring.ts`; ONE shared
rAF loop (`src/lib/raf.ts`) with per-subscriber try/catch. No unnecessary
dependencies, ever.

## Architecture — blocks

A project page is a JSON file in `src/content/projects/<slug>.json`:
`hero, meta, text, statement, figure, gallery, textMedia, list, quote,
process, deck, stats, video, credits`. One renderer per type, registered in
`src/blocks/registry.tsx`. Adding a PROJECT touches no code; adding a block
KIND = one component + one registry line + Studio fields
(`src/studio/schema.ts`) + `src/content/project.schema.json`.

- Loader (`src/lib/projects.ts`) never lets one bad file kill the site; it
  marks media files that don't exist yet (`missing`) so empty wells render
  as design, not broken images.
- `/studio` (dev-only) is how Luke edits content — forms, not JSON.
  `/type-lab` (dev-only) compares type directions.
- Images: `public/work/<slug>/01.jpg…`, discovered from the filesystem.

## Design system (the current truth)

- **Palette:** navy ink `rgb(7,26,49)` on warm paper `rgb(252,251,248)`.
  **Mint `rgb(94,231,197)` is the only interactive accent** — CTA, tile
  arrow disc, language pill. If a second accent seems needed, the layout
  is wrong.
- **Type (direction C, chosen from /type-lab):** Schibsted Grotesk display,
  Hanken Grotesk body, Fragment Mono labels — via `next/font`, latin-ext
  for Polish. Sentence case everywhere; ALL CAPS only in mono eyebrows.
  Rejected: Geist (the default of the moment), Bricolage (everyone's
  safe-quirky pick), JetBrains Mono (reads developer-tool).
- **ONE grid on case pages: 1200px, one left edge.** Everything — hero
  figure (width `read`, 2:1, 22px corners), story blocks, lists, codas —
  aligns to it. A section with an `eyebrow` gets a hairline and an
  auto-numbered pill (CSS counter `lwsec`) — never type numbers into
  content. Prose measure 66ch, first paragraph inked lede. Text
  registers: labelled flow (stacked), `wide` (closing sections: left,
  full grid width), kicker (bare connective line, full width, body size).
  A 720px centred column, a left label rail, split statement/prose and a
  centred close were ALL tried and rejected.
- **Story block is the case-study spine:** chapters flow as text while a
  pinned 4:3 frame beside them wipes per chapter (starts when the
  incoming heading crosses 38% of the viewport — no pre-roll); `side:
  "left"` flips it; alternate consecutive stories. Deck = pinned slide
  wipes, Expondo Blackout only. List cards are OPEN editorial columns
  (top rule + pill number), never boxed cells.
- **Media conventions:** images 2400x1800 JPEG q80 (recompress uploads:
  Pillow quality 80 progressive). Hero video = 01.mp4 + poster 01.jpg;
  tile.mp4 in a project folder auto-animates its grid tile on hover
  (preload=none); the homepage reel plays card.heroVideo on the active
  plane only. Encode: ffmpeg -vf scale=1280:-2 -crf 23 -preset slow -an
  (tiles: 960/-2, crf 26). Lottie plays via lottie-web light (dynamic
  import); compress embedded rasters inside the JSON. Figures take
  tone (ink/black) and link {href,label} — the mint live-site pill.
- **/work:** grid tiles are STATIC (hover story lives inside the tile);
  the index row FLOODS with its image; both views share one staggered
  rise entrance that replays on filter change.
- **The aurora** is a WebGL noise-flow shader (`src/components/Aurora/`)
  in the five brand colours — drifts on its own clock, leans with section
  travel, quickens with scroll velocity. Ramp is tuned to ~25% paper /
  ~50% sky / ~25% butter with mint scarce; blob field remains as the
  no-WebGL fallback, static under reduced motion. Exactly two roles:
  behind the work grid and behind footers. Scarcity keeps it a signature.
- **Layout tokens:** stage 1872 · content 1420 · read 1200 · chapter 720.
  Radii 64/22/999. Section rhythm `clamp(4rem, 8vw, 7.5rem)`.

## Motion rules

- **Never hijack the wheel.** Pinned sequences (hero reel, `deck` block,
  `process` pinned) are a sticky viewport over a tall track — scroll maps
  to progress, the scrollbar never lies. Luke asked for fullpage
  snap-scrolling once; accepted this instead when the reason was clear.
- **The layout moves, not the object.** Never `scale()` a tile on hover.
  Labels live inside media. The hover story lives INSIDE a tile: scrim
  deepens, year/arrow surface, description unfolds, neighbours
  desaturate. Width-claim springs were tried on the /work grid and
  REJECTED (restless; mid-stretch rewrap clipped two-line copy) — tiles
  there are static. The /work index row FLOODS instead: it claims a
  little height while its image wipes in as the row's own background.
  One shared entrance everywhere: rise + fade staggered ~32ms by
  visible order, replayed on filter change (the grid/index remount).
- Scroll-driven entrances: `animation-timeline: view()` on blocks after
  the first two (blocks.module.css) — scrubbed by scroll, not observer
  one-shots. He rejected kinetic/stretchy text ("looks cheap") and simple
  fades.
- View Transitions: clicked tile morphs into the case-study hero.
  `TransitionLink` names the tile on click; the FIRST figure block carries
  `view-transition-name: project-media` at rest (exactly one per page,
  `ctx.morphIndex`).
- `prefers-reduced-motion` everywhere: CSS kill-switch + springs at rest.
- CSS owns every resting layout; JS only overrides mid-interaction (with
  JS off the page must still be whole).

## Verification limits (important)

The in-app browser pane never fires rAF, never repaints after scroll or
transforms, and drops canvas compositing. **Test the maths, probe the
DOM** (getBoundingClientRect, computed styles, readPixels on a
preserveDrawingBuffer probe context); screenshots work only for
freshly-loaded pages. Anything that moves needs Luke's own browser for
the taste call — say so explicitly.

Full check: `tsc --noEmit` · `eslint .` · `npm test` · `next build` ·
fetch every `/en/work/<slug>` for 200. Node v26.7.0 via nvm.
Tests cover the block registry invariants and lowercase-filename rule
(the old work-grid width-spring tests left with that mechanic).

## Never

- **Set text in columns.** Not two-column prose, not statement-beside-
  paragraphs, not any side-by-side text arrangement — tried three times
  (auto-fit prose grid, the label rail, the split chapter), rejected
  three times. Copy stacks on the single measure; a short section's
  empty right side is air, not a defect. The ONLY side-by-side is text
  beside an IMAGE (story block).
- Rebuild in-place content editing (contentEditable on React DOM died
  with removeChild errors; the Studio exists instead).
- Route content through the old Claude-Design prototypes — image-slot.js
  re-encodes and caps images destructively. The prototype era is over;
  this repo is the only source of truth.
- Copy Calendly's proprietary UI (came up repeatedly; hold the line).
- Uppercase filenames in content or `public/work/` (case-sensitive deploy
  targets; there's a test for it).
- `aspect-ratio` on cards whose width animates — pin height in px.
- Docx notes-to-self published as site copy (it happened; three were
  removed — watch for "the portfolio version should…" phrasing).

## External pieces

- AuraGen live site: https://auragen-ten.vercel.app/ — source at
  ~/Desktop/Claude/Code/AuraGen/site (NOT a git repo; deployed by manual
  upload — after edits Luke re-uploads). Its mobile matrix fix is local.
- Surveyvor live at surveyvor.app. Launch configs: portfolio-site (this
  app), auragen-site (static). /type-lab and /studio are dev-only.

## Open items

- **Images are the ceiling:** every gallery is a placeholder well. Real
  work into `public/work/<slug>/` is the single biggest upgrade.
- Polish copy doesn't exist yet — EN serves both locales (`Localised =
  string | {en, pl}` is ready).
- Three projects want one real metric each: Expondo Blackout, Rennes,
  Resi4Rent Website.
- AuraGen is the finished reference page (real copy, images, video,
  Lottie). The other 15 await Luke's new copy — rebuild each around its
  own structure the way AuraGen was, not the migration template.
- Gallery rhythm is uniform across projects (migration artifact); vary
  per project (masonry/strip/full-bleed) once real images land.
