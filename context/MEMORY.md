# MEMORY.md — decision log

Why things are the way they are. Read before changing something that looks odd —
most oddities here are scars from a specific failure.

---

## Direction history

| Version | What it was | Why it ended |
| --- | --- | --- |
| `Portfolio.dc.html` | Warm paper, minimal, dark finale | User: "I don't want a paper look" |
| `Portfolio v2.dc.html` | Bright, DS components, GrainGradient | Superseded by the Figma direction |
| `Portfolio v3.dc.html` | Built from the user's Figma | **Current. Approved:** "I really like how the website looks now" |

The user attached a Figma file (`1920w-light`) as a base and asked for it to be
made better. Exact values taken from it: ink `rgb(7,26,49)`, tile
`rgb(205,221,242)`, 64px container radius, 22px tiles, 1420 content width, 30/29px
bento gaps, `-2px` display tracking. Roboto was swapped for Geist deliberately —
Roboto was carrying the mock, Geist is the established voice.

**Known open items on v2** (only relevant if it's ever revived): FeatureCard
printed its `shape` prop as visible text; GrainGradient fell back to the warm
preset. Never fixed — v2 is superseded.

---

## Bugs whose causes are worth remembering

**"It looks chaotic."** Three competing left edges — a 1200px text container,
`94vw` breakout sections, and percentage flex bases resolving differently per
section. Nothing shared a column line. Fixed by one 12-column grid with explicit
spans per block.

**Logo belts snapping back every 2–3s.** Set width was measured by summing image
widths at mount, but images hadn't loaded, so every width was 0 — the "set"
measured as just the gaps (~240px instead of ~1100px). Then: `img.complete` is
true for cached *and cloned* images, so the load listeners never fired and the
bad reading stuck. Now re-measured from the live DOM (first child → first clone)
every 20 frames, copy count capped at 8 and trimmed down.

**Hover stretching a whole column instead of one tile.** CSS Grid tracks are
shared down the entire grid — widening a track *must* widen every card beneath.
Unavoidable in a grid. Replaced with a wrapping flex row per rank, each card
sized in px with its own spring; hover redistributes within that card's row only.

**Last-column hover reflow.** 30 projects × 4 columns leaves a final row of 2, but
the code spread the claimed width across 4. Widths stopped summing to the
container, so cards wrapped mid-hover. Now measures actual row length, plus a
0.5px shave on base width so rounding can't overflow.

**Stretch going vertical as well as horizontal.** Cards were on
`aspect-ratio: 4/3`. Height is now pinned in px from the *resting* column width.

**Sticky media not sticking.** `overflow:hidden` on the section made it the sticky
scrollport. Moved the clipping (and the 64px radius) onto the aura layer, which
already clips.

**Pinned frame breaking below ~1000px.** Stacking wasn't enough — the pattern had
to be abandoned. Each figure now relocates inline beneath its own step, all steps
at full opacity, `setStep` inert. Swaps live on resize both ways.

**cal.com killing the page.** The embed script threw and took down the reel,
bento springs, gradients and the About sequence. Now: rAF clock starts before any
embed, per-init guards, per-frame guard. Also `loading="lazy"` on an iframe 4.4k px
down the page meant it never requested while off-screen and an unconditional 8s
timer hid its parent permanently — now eager, 20s guard, cleared on load.

**Caption "shortening" was a no-op** — the long lightbox caption printed under
every image and wrapped. Two fields now: `captions` (long, lightbox) and
`captionsShort` (terse, under image).

---

## Things tried and rejected

- **Shadow to define the bento's bottom edge** — "too big and too visible". The
  gradient's own weight defines the edge instead.
- **A blue-family palette for the bento** — user wanted the footer's exact
  colours. Both fields are now literally the same five blobs.
- **A linear gradient with a dark band at the bottom** — rejected twice. The
  footer's field isn't linear, so the bento's isn't either.
- **Before/after comparison slider** — built, then cut on request.
- **Pull quote on the case study** — built, then cut on request.
- **A dense info card in the hero reel** (`01 / IDENTITY` + title + body + link)
  — too much text. Now a single low pill bar: progress segments → title → CTA.
  Chrome stays still, only the type inside cycles.

---

## Interaction concepts, as built

**Hero reel.** Three planes, one 64px container. Outgoing plane wipes upward via
clip mask while drifting; incoming arrives from below; both on critically-damped
springs. Spring-damped pointer parallax on the media. Title rolls out and the
next rolls in behind the bar's own edge. Default mode is **scroll-driven** (pinned
track, scroll distance → project); `Auto-advance` (6.5s) available as a tweak.
Drag, arrow keys, and velocity throw all work.

**Bento.** 12 tiles, staggered middle column. Hovered column claims `fr` on a
spring (default 1.2), neighbours shed. In-tile labels.

**About.** 300vh track, pinned viewport, scroll advances three points, each
expanding on a spring with the others at 0.4. No wheel blocking.

**Clients.** Two counter-running belts — top rightward, bottom leftward — inside
an edge-masked container. Hover slows to 15%, not a stop. 14 px/s default.

**Case study.** Centred hero → full-bleed parallax key visual → 01 Brief (statement
+ 2 columns, then a 2-up pair) → 02 Process (aurora stage: pinned frame beside
four scrolling decisions, layers *wipe* vertically so four figures read as one
surface) → 03 System (drag plate-strip with snap + progress rail) → Fig. 12 motion
slot settling to full scale on view → 04 Outcome (prose + 4 count-ups) → next
project on an aurora footer. Fixed left spine tracks and jumps; top progress
hairline; lightbox across all 12 figures with arrows and esc. Twelve slots, six
display modes, so 8–10 images never repeat a treatment.

---

## Content state

`content/projects.json` — 30 projects, each with `en` and `pl` blocks, chained in
a loop via `nextSlug`.

**Northwind is fully written in both languages** and is the reference for tone and
length. The other 29 have real identity (title, eyebrow, lede, client, role,
scope, team, year, category) but **prompt text** in place of body copy — "Replace
this paragraph with the situation you were handed…". The user is filling these in
himself.

Work-page filters: All / Identity / Product / Brand / Web / AI / Illustrations.
("Print" was retired at the user's request; AI and Web added.) Spread across 30:
Identity 7, Product 5, Brand 4, Web 4, AI 4, Illustrations 6. Category is the
`data-cat` attribute on each card — trivial to move a project.

---

## Asset specs given to the user

**Hero reel motion (3 slots):** 1600×900px, 16:9, key content in the centre ~80%
(container is fluid 4:3→16:9 and crops with `object-fit: cover`). MP4 or WebM, not
GIF. 4–8s seamless loop, no audio. He uses **Jitter** — advised to export MP4
directly rather than wire up a Lottie player for three background loops; offered
to swap that slot to Lottie if he prefers.

**Already in the project:** `assets/portrait.jpg` (his Figma portrait),
`assets/client-01…11.png` (client logos, in the belts), `assets/arrow-right.svg`,
`assets/arrow-diag.svg`.

---

## Still open

- Real body copy for 29 projects (his task; JSON is ready)
- Hero reel motion files (his task; specs above)
- Vercel deploy — requested once, never completed
- A hosted CMS (Sanity/Contentful/Payload) if he ever wants login + rich text;
  explained as a real dev project on a real host, not something these files can do
