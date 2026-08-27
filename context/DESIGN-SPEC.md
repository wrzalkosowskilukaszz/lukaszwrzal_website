# Handoff: Lukasz Wrzal Portfolio

## Overview

A personal portfolio site for **Lukasz Wrzal** — Creative Designer & AI Director,
based in Warsaw. Three page types, bilingual (EN/PL), driven by a single JSON
content file. Thirty projects, each with its own case-study page.

The site's character comes from three things, and they are the point of the
design — not decoration:

1. **A hover language where the layout moves, not the object.** Nothing ever
   scales on hover. A hovered tile's column claims width and its neighbours give
   it up, on a spring.
2. **An "aurora" colour field** — five blurred blobs on independent orbits — used
   in exactly two places, so colour reads as intentional rather than applied.
3. **Scroll-driven sequences that never hijack the wheel.** Sticky viewports over
   tall tracks; scroll distance maps to steps.

If an implementation loses those three, it has lost the design.

---

## About the design files

**The files in `prototypes/` are design references created in HTML.** They are
working prototypes that demonstrate intended look, motion, and behaviour. They are
**not production code to copy directly.**

They are authored as "Design Components" (`.dc.html`) — a streaming, inline-styled
format specific to the design tool they were made in. Each file contains a
template and a logic class. **Do not try to port that format.** Read them the way
you'd read a Figma file: for exact values, structure, and behaviour.

**Your task is to recreate these designs in a real front-end codebase**, using its
established patterns and libraries. If no codebase exists yet, choose an
appropriate stack. Recommendation for this project, given it's a content-driven
marketing site with heavy custom motion:

- **Next.js (App Router) + TypeScript** — the content is a static JSON file and
  pages are `?p=slug`-shaped, which maps cleanly onto dynamic routes with static
  generation (`/work/[slug]`).
- **CSS Modules or vanilla-extract** over Tailwind. The design leans on long
  bespoke gradients, spring-driven inline transforms, and precise one-off values;
  a utility framework fights that.
- **No animation library required.** The springs are ~15 lines (see
  *Motion → the spring*). Framer Motion is fine if the team already uses it, but
  the critically-damped spring and rAF loop are deliberately hand-rolled and
  should stay interruptible.

---

## Fidelity

**High-fidelity.** Final colours, typography, spacing, radii, easing curves, and
interaction behaviour. Every value in this document is exact and taken from the
approved build — recreate it pixel-perfectly. Where a value is a `clamp()`, keep
the clamp; the fluid behaviour is intended.

The only intentionally unfinished parts are **content**: 29 of 30 projects carry
prompt text instead of real body copy, and image slots are empty pending the
client's assets. See *Content model*.

---

## Design tokens

Canonical source: `brand/tokens.css` (copy it in as-is; it is plain custom
properties). Documentation: `brand/readme.md`.

### Colour

| Role | Token | Value |
| --- | --- | --- |
| Ink — headings, dark surfaces | `--lw-ink` | `rgb(7, 26, 49)` |
| Ink 2 — nav rest state | `--lw-ink-2` | `rgb(60, 62, 68)` |
| Body copy | `--lw-muted` | `rgb(95, 109, 119)` |
| Meta / mono labels | `--lw-faint` | `rgb(163, 163, 163)` |
| Page ground | `--lw-paper` | `rgb(252, 251, 248)` |
| Cards, footer ground | `--lw-white` | `rgb(255, 255, 255)` |
| Empty media wells | `--lw-tile` | `rgb(205, 221, 242)` |
| **Accent (the only one)** | `--lw-mint` | `rgb(94, 231, 197)` |

Two additional literals appear in prose: `rgb(69, 69, 69)` for hero ledes.

**Mint is the only accent in the system.** It appears on the primary CTA, the
arrow disc revealed inside a hovered tile, and the active language pill. Nowhere
else. If a second accent seems necessary, the layout is wrong.

> **Note on palette provenance:** this navy/near-white palette comes from the
> client's own Figma file and deliberately departs from the attached design
> system's warmer paper palette. It is documented as intentional. Do not
> "correct" it.

### Aurora field colours

Used only in the blob fields. Alphas are tuned for a white/paper ground — do not
raise them.

| Token | Value |
| --- | --- |
| `--lw-aura-sky` | `rgba(205, 221, 242, 0.98)` |
| `--lw-aura-sky-soft` | `rgba(205, 221, 242, 0.60)` |
| `--lw-aura-violet` | `rgba(60, 44, 194, 0.20)` |
| `--lw-aura-butter` | `rgba(255, 248, 207, 0.95)` |
| `--lw-aura-mint` | `rgba(94, 231, 197, 0.50)` |

### Typography

**Geist** (display + body) and **Geist Mono** (labels), via Google Fonts:

```
https://fonts.googleapis.com/css2?family=Geist:wght@300..700&family=Geist+Mono:wght@400;500&display=swap
```

| Use | Size | Weight | Line-height | Tracking |
| --- | --- | --- | --- | --- |
| Page h1 | `clamp(2.5rem, 5.4vw, 4.5rem)` | 500 | 1.1 | `-2px` |
| Section h2 | `clamp(2.2rem, 4.6vw, 4.4rem)` | 500 | 1.12 | `-2px` |
| Case-study statement | `clamp(1.7rem, 3.4vw, 3rem)` | 500 | 1.14 | `-2px` |
| Sub-head h3 | `clamp(1.2rem, 1.9vw, 1.6rem)` | 500 | 1.28 | `-0.3px` |
| Tile name | `19–20px` | 500 | 1.3 | `-0.3px` |
| Hero lede | `clamp(1.05rem, 1.5vw, 1.5rem)` | 400 | 1.35–1.4 | — |
| Body | `1rem–1.0625rem` | 400 | 1.7 | — |
| Small body | `13–15px` | 400 | 1.5–1.6 | — |
| Mono eyebrow | `10.5–12px` | 400 | — | `0.12em`, uppercase |

**Sentence case everywhere.** ALL CAPS only for mono eyebrow labels.
`text-wrap: balance` on display headings, `text-wrap: pretty` on body paragraphs.

### Radius

| Use | Value |
| --- | --- |
| Full-width section containers | `64px` |
| Media tiles, cards | `22px` |
| Buttons, nav, chips, progress segments | `999px` |

Nothing in the design has sharp corners.

### Shadow

| Token | Value |
| --- | --- |
| `--lw-shadow-tile` | `0 1px 2px rgba(16,17,26,0.06), 0 1px 1px rgba(16,17,26,0.04)` |
| `--lw-shadow-card` | `0 2px 4px rgba(16,17,26,0.04), 0 12px 32px -12px rgba(16,17,26,0.14)` |
| `--lw-shadow-float` | `0 1px 2px rgba(16,17,26,0.05), 0 16px 40px -20px rgba(16,17,26,0.35)` |

Shadows are for elevation only. **Never** add a shadow to fake a section edge —
that was tried and rejected; the aurora's own weight defines the bento's edge.

### Layout scale

| Token | Value | Use |
| --- | --- | --- |
| `--lw-stage-max` | `1872px` | Outer rounded containers |
| `--lw-content-max` | `1420px` | Bento grid, hero media |
| `--lw-read-max` | `1200px` | Prose, footers |
| `--lw-gap-col` | `29px` | Bento column gap |
| `--lw-gap-row` | `30px` | Bento row gap |

Work-page grid is wider and tighter: `min(2400px, 100% - 32px)`, `14px` gap.
Section rhythm between major blocks: `clamp(4rem, 8vw, 7.5rem)`.

---

## Motion

### The two curves

| Token | Value | Use |
| --- | --- | --- |
| `--lw-ease-out` | `cubic-bezier(0.22, 1, 0.36, 1)` | Enters, reveals, wipes |
| `--lw-ease-playful` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Hover, press, arrows |

Durations: `--lw-dur-quick 180ms`, `--lw-dur-base 320ms`, `--lw-dur-slow 480ms`.

### The spring

Anything that can be interrupted mid-flight uses a **critically-damped spring in
JS**, not a CSS transition — column widths, carousel planes, pinned sequences.
This matters: a transition restarts when re-triggered, which is exactly wrong when
a pointer moves across four tiles quickly.

```js
class Spring {
  constructor(v, k = 130, d = 21) {
    this.v = v; this.target = v; this.vel = 0; this.k = k; this.d = d;
  }
  step(dt) {
    this.vel += (-this.k * (this.v - this.target) - this.d * this.vel) * dt;
    this.v += this.vel * dt;
    return this.v;
  }
}
```

Stiffness/damping pairs in use: `(130, 21)` grid columns · `(120, 22)` carousel
planes · `(150, 20)` carousel copy · `(150, 24)` About points · `(60, 14)` pointer
drift.

Drive every spring from **one shared `requestAnimationFrame` loop** per page, with
`dt` clamped to `0.05s`. Do not create a loop per component.

### Rules

- **No page-load choreography.** Content is present on load. Reveals happen on
  scroll-into-view only, via `IntersectionObserver` (`opacity 0→1`,
  `translateY(18px)→0`, 700ms `--lw-ease-out`), with a 2.4s safety timeout that
  force-shows anything the observer missed.
- **Never hijack the wheel.** No `preventDefault` on scroll, ever.
- **Guard everything.** Each init in its own `try/catch`; the rAF frame body in a
  `try/catch`; the animation clock started *before* any third-party embed mounts.
  A cal.com failure must not take down the reel or the gradients.
- Respect `prefers-reduced-motion` — this is **not** implemented in the prototypes
  and should be added: hold springs at rest, skip parallax, keep reveals as
  instant opacity.

---

## The aurora field (shared component)

The only place colour appears at scale. Appears behind the homepage work grid and
behind every footer. **Never a linear gradient** — that was tried twice and
rejected.

**Structure:** a `position: absolute; inset: 0` layer with `overflow: hidden` and
the container's border-radius, holding five `<span>` blobs.

**The five blobs** (percentages relative to the field):

| # | Position | Size | Colour | Blur |
| --- | --- | --- | --- | --- |
| 0 | `left: -12%; top: -10%` | `62% × 62%` | `--lw-aura-sky` | `30px` |
| 1 | `right: -10%; top: -12%` | `56% × 58%` | `--lw-aura-violet` | `40px` |
| 2 | `left: -14%; bottom: -14%` | `64% × 60%` | `--lw-aura-butter` | `34px` |
| 3 | `right: -12%; bottom: -12%` | `58% × 58%` | `--lw-aura-mint` | `36px` |
| 4 | `left: 34%; top: 30%` | `42% × 46%` | `--lw-aura-sky-soft` | `44px` |

Each blob: `border-radius: 50%`, and
`background: radial-gradient(circle at 50% 50%, <colour> 0%, <same colour at 0 alpha> 68%)`.

**The animation** (per blob, index `i`, in the shared rAF loop):

```js
// per-blob constants
ax = 26 + i * 9;      ay = 20 + i * 7;        // orbit amplitude, px
sx = 0.055 + i*0.017; sy = 0.041 + i*0.013;   // orbit frequency
px = i * 1.7;         py = i * 2.3;           // phase offset
pull = 0.5 + i * 0.22;                        // pointer sensitivity

// per frame, t = elapsed seconds
x = sin(t * sx * 6.28 + px) * ax + ptrX * 26 * pull
y = cos(t * sy * 6.28 + py) * ay + ptrY * 20 * pull + travel * 34 * pull
s = 1 + sin(t * sx * 4.4 + py) * 0.06
transform = translate3d(x, y, 0) scale(s)
```

- `ptrX/ptrY` — pointer position normalised to `-1…1`, eased at `0.045` per frame.
- `travel` — `((fieldTop + fieldHeight/2) / viewportHeight - 0.5) * -2`; the
  field's progress through the viewport, so it reacts to scroll.
- Skip the whole field when its rect is more than 300px outside the viewport.

Distinct periods and phases per blob mean the composition never visibly repeats.

**The bento instance** is the *same field*, with two differences: it is positioned
`top: 34%; bottom: 0` (lower two-thirds only) and carries a soft top mask so the
section begins as pure page background and colour arrives mid-section:

```css
mask-image: linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.28) 16%, #000 40%, #000 100%);
```

Its opacity also ramps with scroll: `clamp01((p - 0.08) / 0.34)` where `p` is the
section's progress `(viewportHeight - rect.top) / (rect.height + viewportHeight)`.

---

## The hover language (shared behaviour)

**The layout moves, not the object.** Never `scale()` a tile. Never a
`scale(1.05)` hover — explicitly rejected by the client.

A hovered project tile does five things at once:

1. **Its column claims width** on a spring; siblings shed the difference (exact
   mechanics differ per page — see each screen below).
2. **Unattended tiles desaturate** to `filter: saturate(0.22) brightness(1.04)`;
   the hovered one goes to `saturate(1.06)`. Transition `480ms --lw-ease-out`.
3. **The scrim deepens** from `opacity 0.72` to `1` over `420ms`.
4. **An index or year appears** top-left — mono `11px`, `letter-spacing 0.12em`,
   `rgba(255,255,255,0.78)`, fading in over `320ms`.
5. **A mint arrow disc appears** top-right — `36 × 36px`, `border-radius 999px`,
   `background --lw-mint`, ink-coloured diagonal arrow glyph, animating
   `opacity 0→1` (280ms) and `scale(0.78)→1` (380ms `--lw-ease-playful`).
6. **A descriptor expands** beneath the name via animated `height` (`0 → measured
   scrollHeight`, `460ms --lw-ease-out`) — `13px`, `rgba(255,255,255,0.74)`.

**Labels live inside the media, never below it.** This is load-bearing: in a
masonry layout with varying tile heights, labels placed below produce N unrelated
vertical positions and read as chaos. Inside the tile, every label sits at the
same offset from its own tile's bottom edge — N identical relationships.

Tile anatomy, resting state:

```
<a>  position: relative; border-radius: 22px; overflow: hidden;
     background: --lw-tile; box-shadow: --lw-shadow-tile
  ├── media layer      position: absolute; inset: 0
  ├── scrim            inset: 0; opacity: 0.72;
  │                    linear-gradient(180deg, rgba(7,26,49,0) 40%, rgba(7,26,49,0.62) 100%)
  ├── index/year       top: 18px; left: 20px; opacity: 0
  ├── mint arrow disc  top: 14px; right: 14px; opacity: 0; scale(0.78)
  └── label block      left: 20px; right: 20px; bottom: 18px
        ├── name       19–20px / 500 / -0.3px / white — always visible
        └── descriptor height: 0; overflow: hidden
```

---

## Screens / Views

### 1 — Homepage (`prototypes/Portfolio v3.dc.html`)

Route suggestion: `/`

Sections in order: nav · hero copy · hero reel · work bento · about · clients ·
footer.

#### Floating pill nav (on every page)

- `position: fixed; top: 18px; left: 0; right: 0; z-index: 60`, centred,
  `pointer-events: none` on the wrapper and `auto` on the pill so it doesn't
  block the page.
- Pill: `padding: 6px 6px 6px 12px`, `border: 1px solid rgba(7,26,49,0.06)`,
  `border-radius: 999px`, `background: rgba(255,255,255,0.82)`,
  `backdrop-filter: blur(16px) saturate(1.6)`, `--lw-shadow-float`.
- Contents left→right: logo mark (20px) · **Work** · **About** · **Connect** ·
  hairline separator (`1px × 18px`, `rgba(7,26,49,0.1)`, `margin: 0 5px`) ·
  EN/PL segmented control · **Let's meet** CTA.
- Links: `13.5px / 500`, `--lw-ink-2`, `padding: 8px 14px`. Hover →
  `background: rgba(7,26,49,0.05)`, colour `--lw-ink`, `180ms --lw-ease-out`.
- CTA: `padding: 9px 18px`, `background: --lw-mint`, `color: --lw-ink`,
  `13px / 600`. Hover → `translateY(-1px)` over `220ms --lw-ease-playful`.
- Language control: `padding: 2px`, `background: rgba(7,26,49,0.05)`,
  `border-radius: 999px`, two buttons `padding: 6px 9px`, mono `10.5px`,
  `letter-spacing 0.08em`. Active → `background: #fff`, `color: --lw-ink`,
  `box-shadow: 0 1px 2px rgba(16,17,26,0.08)`. Inactive →
  `rgba(7,26,49,0.42)`, transparent.

#### Hero copy

- Container `min(930px, 100% - 40px)`, centred text,
  `padding: clamp(7rem, 11vw, 9.875rem) 0 clamp(2.5rem, 5vw, 4rem)`.
- H1: *"Hi! I'm Luke, Creative Designer & AI Director."* — see type table.
- Lede, forced to two lines with an explicit `<br>`:
  *"Focused on digital products, visual systems, and clear user experiences."* /
  *"Powered by AI. Designed for humans."*
- Both enter with a single `csRise` keyframe (`opacity 0→1`,
  `translateY(18px)→0`), `700–800ms --lw-ease-out`, staggered `60 / 140 / 250ms`.
  This is the only load animation on the site.

#### Hero reel — flagship interaction

Container: `min(1420px, 100% - 40px)`, `height: clamp(360px, 52vw, 720px)`,
`border-radius: 64px`, `overflow: hidden`, `background: --lw-tile`,
`--lw-shadow-card`, `cursor: grab`, `touch-action: pan-y`.

**Three stacked planes**, each `position: absolute; inset: 0`, holding a media
layer inset `-4%` (the overscan that allows parallax without exposing an edge).
Media for each is a looping video — see *Assets*.

**Transition — this is not a cross-fade.** Each plane has a spring
(`120, 22`) whose value `v` runs `0` (present) → `1` (gone):

```js
plane.clipPath = `inset(${v * 100}% 0 0 0)`;   // outgoing wipes upward
plane.opacity  = 1 - v * 0.25;
media.transform = translate3d(
  ptrX * 14 * drift,
  ptrY * 10 * drift - v * 26,   // outgoing also drifts up 26px
  0
) scale(1.02 + (1 - v) * 0.03);
// where drift = (1 - v) * 0.5
```

The incoming plane runs the same maths in reverse, so it appears to arrive from
below while the outgoing one wipes away. `z-index` is reassigned on change:
active plane `4`, others `3 - abs(i - active)`.

**Pointer parallax:** pointer position normalised `-1…1`, eased through springs
(`60, 14`), applied as above. Resets to centre on pointer-leave.

**Two modes** (the client chose scroll-driven as default):

- *Scroll-driven* (default) — the section becomes a track of
  `SLIDES.length * 80 + 100` vh with the reel `position: sticky;
  top: clamp(84px, 10vh, 120px)`. Scroll progress `p` through the track selects
  `floor(p * 3 * 0.999)`. **No wheel interception.**
- *Auto-advance* — advances every `6.5s` while in view; pauses on pointer-enter.

**Info bar** — a single low pill, `position: absolute`, inset
`left/right: clamp(16px,2.2vw,40px); bottom: clamp(16px,2.2vw,40px)`,
`max-width: 1160px`, `margin: 0 auto`, `padding: 12px 12px 12px clamp(20px,2vw,30px)`,
`border-radius: 999px`, `background: rgba(255,255,255,0.82)`,
`backdrop-filter: blur(22px) saturate(1.6)`,
`box-shadow: 0 1px 2px rgba(16,17,26,0.05), 0 16px 40px -20px rgba(16,17,26,0.35)`.

Left→right: three progress segments · project title · CTA.

- Segments: `clamp(22px,3vw,44px) × 3px`, `border-radius: 2px`,
  `background: rgba(7,26,49,0.16)`, with an inner fill in `--lw-ink` whose width
  is the live elapsed fraction (`0%` upcoming, `100%` past). Clickable.
- Title: single line, `clamp(0.95rem,1.35vw,1.25rem) / 500 / -0.3px`,
  `white-space: nowrap; text-overflow: ellipsis`.
- CTA: `padding: 11px 12px 11px 22px`, `background: --lw-ink`, white
  `14px / 600`, with a `26px` mint disc holding a right-arrow. Hover →
  `translateX(3px)`.

**The bar itself never moves.** On slide change only the type cycles: the title
animates `translateY(0 → -120%)` with `opacity 1 → 0`, the text swaps at 170ms,
then the new title springs back in. That stillness is what makes it read as
furniture rather than a carousel caption.

**Also supported:** drag (threshold 60px or throw velocity > 0.6), `←`/`→` keys
while in view.

#### Work bento — flagship interaction

Outer stage: `min(1872px, 100% - 48px)`, `border-radius: 64px`,
`overflow: hidden`, `background: --lw-paper`. Contains the masked aurora field
(see above) at `z-index 0` and content at `z-index 1`.

Header row: h2 *"Recent works"* left; right a **Show all** link
(`20px / 700` + `13 × 11px` arrow) above an `83px × 1px` ink rule, linking to
`/work`.

Grid: `min(1420px, 100% - 56px)`, **three explicit columns**,
`gap: 30px 29px`. Twelve tiles. Column 1 heights
`646 / 406 / 646 / 406`, column 2 `406 / 646 / 406 / 646` with
`padding-top: clamp(0px, 4vw, 80px)`, column 3 `646 / 406 / 646 / 406`
(all `clamp(…)`-scaled: tall `clamp(280px,32vw,646px)`, short
`clamp(200px,20vw,406px)`). The offset middle column is what gives the bento its
rhythm.

**Hover:** each column has a spring (`130, 21`) on its `fr` value. Hovering any
tile sets its column's target to `1.2` (a prop, `bentoClaim`) and the other two to
`(3 - 1.2) / 2 = 0.9`. Written to `grid-template-columns` every frame. Combined
with the shared hover language above.

#### About — pinned sequence

- Track `height: 300vh`; inside it a `position: sticky; top: 0; height: 100vh`
  pane, vertically centred, `min(1200px, 100% - 48px)`.
- Left: square portrait, `border-radius: 64px`, `max-height: min(58vh, 580px)`,
  image inset `-5%` at `110%` and given a scroll transform
  `translateY(-p * 22px) scale(1 + p * 0.04)`.
- Right: eyebrow *"About"* · h2 *"Nice to meet you."* · intro paragraph · three
  points.
- Each point: `border-top: 2px solid rgba(7,26,49,0.14)`, `padding-top: 22px`, a
  `7px` ink dot, an h3, and a body paragraph inside a `height`-animated wrapper.
- Scroll progress `p` through the track divides into three; the active point's
  spring (`150, 24`) goes to `1`, others to `0`. Per point:
  `opacity = 0.4 + v * 0.6`, body `height = measured * v`, dot
  `scale(0.7 + v * 0.9)`.
- **No wheel blocking** — the page releases naturally at the end of the track.

Content: *Brand systems that outlive the launch* / *Product interfaces people open
daily* / *AI direction, used honestly* (bodies in the prototype).

#### Clients — counter-running belts

- Left column (`flex: 0 1 358px`): eyebrow *"Clients"*, h2 *"Who trusted me."*,
  `18px` intro.
- Right: two belts in a container with edge masks:
  `mask-image: linear-gradient(90deg, transparent 0, #000 7%, #000 93%, transparent 100%)`.
- **Top belt travels right, bottom belt travels left**, simultaneously.
- Each belt is a `width: max-content` flex track, `gap: clamp(28px,4vw,58px)`,
  logos `height: 40px`, `opacity 0.5`, `filter: grayscale(1)`. Hovering a logo →
  `opacity 1`, `grayscale(0)` over `300ms`.
- Default speed **14 px/s** (a tweakable prop). Hovering a belt eases it to
  **15% speed**, not a stop.

**Implementation warning — this caused a real bug.** The loop works by measuring
one set's true width and wrapping `x` by exactly that distance. Measure it from
the **laid-out DOM** — the offset between the first child and its first clone —
never by summing image widths, which are `0` before images load. Also: `img.complete`
is `true` for cached *and cloned* images, so `load` listeners may never fire. The
production fix re-measures from the live DOM every ~20 frames so a stale reading
self-corrects, clones until the track covers the viewport twice (capped at 8 sets,
trimmed back down when over), and holds the belt still until the width is real.

#### Footer / booking

- `min(1872px, 100% - 48px)`, `border-radius: 64px`, `background: --lw-white`,
  full unmasked aurora field behind.
- Centred: logo lockup · h2 *"Prompt me with your next project."* · lede ·
  cal.com embed in a `22px`-radius white card (`--lw-shadow-card`,
  `height: clamp(520px, 58vh, 680px)`) · a line offering email instead.
- Bottom row: `© 2026 Lukasz Wrzal` · LinkedIn · `Warsaw · Available for new work`,
  separated by `border-top: 1px solid rgba(7,26,49,0.08)`.
- **cal.com:** a plain `<iframe src="https://cal.com/takealuke/30min?embed=true&layout=month_view&theme=light">`,
  **not** the embed script — the script was blocked in some contexts and threw.
  Must be **eager-loading** (`loading="lazy"` never fires on an iframe this far
  down the page, and a naive timeout then hides it permanently). Keep a 20s
  fallback timer, cleared on `load`, that swaps in an "Open my calendar" button.

---

### 2 — Work index (`prototypes/Work.dc.html`)

Route suggestion: `/work`

- Centred header: eyebrow *"Thirty projects · 2022—2026"*, h1 *"All work"*, lede.
- **Filter row:** All · Identity · Product · Brand · Web · AI · Illustrations.
  Buttons `padding: 10px 18px`, `border-radius: 999px`, `13.5px / 500`. Active →
  `background: --lw-ink`, white, ink border. Inactive → transparent,
  `--lw-muted`, `1px solid rgba(7,26,49,0.1)`. Transition `220ms`.
- **Grid: `min(2400px, 100% - 32px)`, `gap: 14px`** — near-full-bleed and tight.
- 30 tiles. Current spread: Identity 7, Product 5, Brand 4, Web 4, AI 4,
  Illustrations 6. Category is a per-card attribute, trivially reassigned.

#### The grid is flex, not grid — and that is deliberate

**Do not implement this as CSS Grid.** Grid column tracks are shared down the
entire grid, so widening a track *must* widen every card beneath it. That produced
a real bug where hovering one tile stretched a whole column.

Instead: a **wrapping flex row per rank**, each card sized in **pixels** with its
own spring.

```js
cols  = vw >= 1500 ? 4 : vw >= 1100 ? 3 : vw >= 680 ? 2 : 1;
gap   = 14;
base  = (gridWidth - gap * (cols - 1)) / cols - 0.5;  // 0.5px shave, see below
cardH = round(clamp(200, base * 0.72, 430));          // pinned in px
```

On hover, resolve the hovered card's **row** among *visible* cards and
redistribute within that row only:

```js
rowStart = floor(visibleIndex / cols) * cols;
rowLen   = min(cols, visibleCount - rowStart);   // ← the last row may be short
claim    = rowLen > 1 ? 1.24 : 1;
shed     = rowLen > 1 ? (rowLen - claim) / (rowLen - 1) : 1;
```

Two hard-won details:

- **`rowLen`, not `cols`.** 30 cards across 4 columns leaves a final row of 2.
  Distributing the claimed width across 4 there meant widths no longer summed to
  the container, so cards wrapped mid-hover and the layout jumped.
- **The `-0.5px` on `base`.** Without it, rounded pixel widths can total more than
  the container and force a wrap.
- **Height is pinned in px from the *resting* width.** Using `aspect-ratio` makes
  the stretch vertical as well as horizontal — the client explicitly rejected that.

**Filtering** collapses a card in place (`opacity 0`, `scale(0.96)`,
`width/height 0`, `position: absolute`) with a `24ms × (i % 6)` stagger, rather
than reflowing the whole grid. Springs reset to `1` on filter change.

Footer: aurora field, h2 *"Prompt me with your next project."*, a **Book a call**
CTA (ink pill + mint arrow disc).

---

### 3 — Case study (`prototypes/Project - Northwind.dc.html`)

Route suggestion: `/work/[slug]` — **one template serves all 30 projects.** The
prototype does this with `?p=<slug>`; the file name is historical.

> **Do not create 30 page files.** This is the project's first non-negotiable.
> One template to refine, 30 pages that benefit.

Structure in order:

1. **Progress hairline** — `position: fixed; top: 0; height: 2px`,
   `background: --lw-ink`, `opacity 0.35`, width = scroll fraction.
2. **Chapter spine** — `position: fixed; left: clamp(18px,2.4vw,44px)`, vertically
   centred, shown at `≥1240px` only. Four entries: Brief / Process / System /
   Outcome. Each is a `12px` tick + mono label; the active one's tick grows to
   `30px` (`400ms --lw-ease-playful`) and its colour goes `--lw-faint` →
   `--lw-ink`. Active = last chapter whose top is above viewport middle. Click
   scrolls to `top - 100px`.
3. **Hero** — centred, `min(1000px, 100% - 40px)`: eyebrow (type · duration ·
   year), h1 (project name), lede. Same `pRise` stagger as the homepage.
4. **Fig. 01** — full-bleed key visual, `min(1420px, 100% - 40px)`,
   `height: clamp(340px,50vw,700px)`, `border-radius: 64px`, media inset `-6%`
   with scroll parallax (see below), `cursor: zoom-in`, hover reveals an
   **Expand** pill bottom-right.
5. **Meta row** — `min(1200px, 100% - 48px)`, auto-fit columns `minmax(190px,1fr)`,
   `gap: 28px 24px`, `border-bottom: 1px solid rgba(7,26,49,0.08)`. Four pairs:
   Client / Role / Scope / Team — mono label above `15px / 500` value.
6. **01 Brief** — eyebrow, statement (`max-width: 24ch`), then two prose columns
   (`auto-fit minmax(300px,1fr)`, `gap: clamp(1.5rem,4vw,3.5rem)`).
7. **Figs. 02–03** — a 2-up pair, `auto-fit minmax(260px,1fr)`,
   `height: clamp(220px,24vw,340px)`, each with a mono caption below.
8. **02 Process** — the aurora stage. See below.
9. **03 System** — eyebrow, statement, body paragraph.
10. **Figs. 08–11** — a horizontal **plate strip**: `min(1872px, 100% - 48px)`,
    `overflow-x: auto`, `scroll-snap-type: x mandatory`, cards
    `flex: 0 0 clamp(280px,38vw,540px)`, `scroll-snap-align: center`. Pointer-drag
    to scroll (`cursor: grab`, snap disabled during drag), plus a progress rail
    below: a `1px` track with a `3px` ink thumb sized `clientWidth / scrollWidth`.
    A drag over 6px must suppress the click so it doesn't open the lightbox.
11. **Fig. 12 — motion slot** — `border-radius: 64px`, resting at `scale(0.97)`
    and settling to `scale(1)` over `900ms --lw-ease-out` when ≥35% visible.
12. **04 Outcome** — eyebrow, statement, two prose columns, then four count-up
    stats (`auto-fit minmax(210px,1fr)`): value `clamp(2.2rem,4.2vw,3.4rem) / 500`,
    `font-variant-numeric: tabular-nums`, label `14px --lw-muted`. Counts from 0
    on first view, `1100ms`, cubic ease-out, `toLocaleString('en-US')`, optional
    suffix.
13. **Next project** + footer — aurora field, eyebrow *"Next project"*, the next
    project's name at `clamp(2.2rem,5vw,4rem)`, and a `56px` mint disc. On hover
    the name shifts `translateX(14px)` and the disc `translateX(10px)`
    (`340ms --lw-ease-playful`).

#### 02 Process — the pinned wipe

A `64px`-radius white stage with a full aurora field. Inside, two columns:

- **Left (`flex: 1 1 460px`), `position: sticky; top: 104px`** — one frame,
  `height: min(74vh, 660px)`, `border-radius: 22px`, holding **four stacked
  layers** (Figs. 04–07). Four `20 × 2px` dots bottom-left show position.
- **Right (`flex: 1 1 400px`)** — four decision blocks, each
  `padding: clamp(2rem, 8vh, 5rem) 0`, at `opacity 0.28` unless active.

The active step is the last one whose top is above `viewportMiddle + 60px`.
Layers **wipe vertically** rather than fade — the effect is one surface changing,
not four images swapping:

```js
active:        clip-path: inset(0 0 0 0)
already past:  clip-path: inset(0 0 100% 0)
still ahead:   clip-path: inset(100% 0 0 0)
transition:    clip-path 720ms cubic-bezier(0.22, 1, 0.36, 1)
z-index:       active 2, previous 1, others 0
```

**Two implementation traps here.**

1. **Do not put `overflow: hidden` on the stage.** It makes the stage the sticky
   scrollport and the frame will not stick. Put the clipping (and the `64px`
   radius) on the aurora layer, which already clips.
2. **Below `1000px` this pattern must be abandoned, not stacked.** Each figure
   relocates inline beneath its own step (`height: clamp(220px,52vw,400px)`,
   `margin-top: 22px`, `border-radius: 22px`, no clip), all four steps go to full
   opacity, and the step-tracking logic goes inert. It must swap live on resize in
   both directions.

#### Figure parallax

Any framed media with an overscanned inner layer:

```js
c = (rect.top + rect.height / 2 - viewportMiddle) / viewportHeight;
inner.transform = translate3d(0, c * rect.height * 0.1 * -1, 0);
```

`0.1` is a tweakable prop (`0–0.3`). Skip when more than 200px outside the
viewport.

#### Lightbox

Every figure is `cursor: zoom-in` and opens a lightbox — **but only if it holds a
real image**; empty placeholders stay inert.

- Overlay `position: fixed; inset: 0; z-index: 90`,
  `background: rgba(7,26,49,0.94)`, `backdrop-filter: blur(6px)`, fading `320ms`.
- Image `max-width/height: 100%`, `object-fit: contain`, `border-radius: 22px`,
  entering `scale(0.985) → 1` over `420ms --lw-ease-playful`.
- Bottom bar: long caption left; `NN / NN` counter and two `42px` circular
  ghost buttons right.
- Top-right **Close · esc** pill.
- Keys: `esc` closes, `←`/`→` move. Clicking the backdrop or the image closes.
  Body scroll locked while open. Navigation crossfades the image at `130ms`.

---

## Content model

`content/projects.json` is the single source of truth. Shape:

```json
{
  "projects": [
    {
      "slug": "northwind",
      "cat": "identity",
      "year": "2026",
      "desc": "Short line used on the work-index tile",
      "nextSlug": "kettle",
      "en": { /* see keys below */ },
      "pl": { /* identical keys */ }
    }
  ]
}
```

Per-language keys:

| Key | Type | Used by |
| --- | --- | --- |
| `title` | string | h1, document title, next-project label |
| `eyebrow` | string | hero eyebrow (`type · duration · year`) |
| `lede` | string | hero lede |
| `client`, `role`, `scope`, `team` | string | meta row |
| `statement` | string | 01 Brief statement |
| `brief` | string[2] | 01 Brief prose columns |
| `process` | `{n,title,body}[4]` | 02 Process steps |
| `system` | `{statement,body}` | 03 System |
| `outcome` | `{statement,body[2]}` | 04 Outcome |
| `stats` | `{value,suffix?,label}[4]` | count-up row |
| `captions` | `{"01".."12"}` | **long** captions, lightbox only |
| `captionsShort` | `{"01".."12"}` | **terse** labels under images |
| `next` | string | next-project name |

**Two caption fields, deliberately.** A single field meant the long lightbox
caption printed under every image and wrapped to two lines.

**Current state:** all 30 projects have real identity (title, eyebrow, lede, meta,
year, category) in both languages, chained in a loop via `nextSlug`. **Northwind
is fully written in both EN and PL** and is the reference for tone and length. The
other 29 carry prompt text in the body fields ("Replace this paragraph with the
situation you were handed…") — the client is writing these himself. Preserve them
as authoring prompts; don't ship them.

Pages also hold a small inline fallback map, used only when the fetch fails (e.g.
opened over `file://`). In a real app with SSG this is unnecessary — read the JSON
at build time.

---

## Internationalisation

Two languages: **EN** and **PL**. Persisted in `localStorage` and reflected in the
URL as `?lang=pl`. In a real app, prefer proper locale routing (`/pl/...`) and a
standard i18n library.

Two distinct layers, and the split is intentional:

1. **Project copy** — from the `en` / `pl` blocks in `projects.json`.
2. **Page chrome** — nav, section labels, *Client/Role/Scope/Team*, *Expand*,
   *Drag*, *Next project*, footer lines — translated from a `CHROME_PL` /
   `COPY_PL` dictionary keyed by the **exact English string**, so the template
   stays the single source of the English wording and there is no `data-i18n`
   bookkeeping.

The prototype implements layer 2 by walking text nodes and substituting matches
(`site-tools.js`). **That is a prototype technique — replace it** with your
framework's i18n. Keep the *principle*: English lives in the template, Polish in a
dictionary. When adding chrome copy, add its PL key in the same commit.

Existing dictionaries are in each prototype's logic class and are worth lifting
wholesale — they're already translated.

---

## State

Per page, minimal:

| State | Where | Notes |
| --- | --- | --- |
| `lang` | global | `'en' \| 'pl'`, from URL or storage |
| `activeSlide` | homepage reel | `0…2`; derived from scroll in the default mode |
| `hoveredTile` | bento, work grid | drives springs + desaturation |
| `activeFilter` | work index | `'all'` + six categories |
| `activeStep` | case study | `0…3`; derived from scroll |
| `lightbox` | case study | `{ open, index, list }` |
| `slug` | case study | route param |

Spring values are **animation state, not React state** — keep them in refs and
write to the DOM in the rAF loop. Putting them in component state re-renders 60
times a second.

Data fetching: none at runtime. Read `projects.json` at build time
(`getStaticProps` / `generateStaticParams`) and pre-render 30 pages × 2 locales.

---

## Assets

| Path | What | Notes |
| --- | --- | --- |
| `assets/portrait.jpg` | Studio portrait | About section. From the client's Figma. |
| `assets/client-01…11.png` | 11 client logos | The two belts. |
| `assets/arrow-right.svg`, `arrow-diag.svg` | Arrow glyphs | Exported from Figma; the prototypes inline equivalent SVG. |

**Every other image is an empty placeholder.** The prototypes use a custom
`<image-slot>` element (`prototypes/image-slot.js`) that accepts drag-and-drop and
persists to `localStorage`, so the client can populate designs without code. **Do
not port it.** Replace with real `<img>` / `<Image>` elements fed from the CMS or
content layer. Slot inventory: 12 per case-study page (namespaced per slug), 12 on
the homepage bento, 30 on the work index, 3 hero reel media.

**Hero reel motion — spec already given to the client:**

- **1600 × 900px, 16:9**
- Key content inside the centre **~80%** — the container is fluid (≈4:3 → 16:9)
  and crops with `object-fit: cover`
- **MP4 or WebM** (H.264 / VP9), not GIF
- **4–8s seamless loop**, no audio
- Authored in **Jitter**, exported as MP4 (Lottie was considered and set aside for
  three full-bleed background loops; revisit if the files arrive as JSON)

Implement as `<video autoplay muted loop playsinline>` with a poster frame.

**Icons** are inline SVG throughout, `stroke: currentColor`, `stroke-width`
`1.2–1.75`, `stroke-linecap/linejoin: round`. No icon font, no icon library.

**Logo** comes from the attached design system's `Logo` component (`variant="mark"`
at 20–26px, `variant="lockup"` in footers). The bundle is included at
`prototypes/_ds/` for reference — extract the mark as an SVG rather than shipping
the bundle.

---

## Responsive behaviour

Breakpoints in use:

| Width | Effect |
| --- | --- |
| `≥1500px` | Work grid 4 columns |
| `≥1240px` | Case-study chapter spine visible |
| `≥1100px` | Work grid 3 columns |
| `≥1000px` | Case-study process frame pins; **below this the pattern is replaced** |
| `≥680px` | Work grid 2 columns |
| `<680px` | Work grid 1 column |

Most sizing is fluid `clamp()` rather than breakpoint-driven — keep it that way.
The homepage bento's three columns are not yet responsive below ~900px and need a
mobile treatment; recommend collapsing to one column with tiles at their short
height and hover behaviour disabled.

**Mobile is the least-developed area of these prototypes.** Desktop is
pixel-final; phone layouts need design attention. Flag anything ambiguous rather
than guessing.

---

## Accessibility — known gaps to close

The prototypes are desktop-pointer-first. Please fix these during implementation:

- **`prefers-reduced-motion` is not handled.** Add it: hold springs at rest, skip
  parallax and blob orbits, keep reveals as instant opacity.
- Tile hover state is also wired to `focus`/`blur`, which is good — verify the
  keyboard path end to end, including the desaturation of siblings.
- The lightbox needs a focus trap and `aria-modal`; currently only `esc` and
  arrows are wired.
- Filter buttons should be a `role="group"` with `aria-pressed`.
- The language control should expose the current selection (`aria-current`).
- Check contrast of `--lw-faint` (`rgb(163,163,163)`) on `--lw-paper` — it fails
  AA for body text and is only acceptable at label sizes; consider darkening.
- Progress hairline and dot indicators are decorative — hide from assistive tech.
- Scroll-driven sequences must remain reachable without scrolling; ensure the
  content is also linearly readable.

---

## Files in this bundle

```
design_handoff_portfolio/
├── README.md                        ← you are here
├── prototypes/
│   ├── Portfolio v3.dc.html         Homepage
│   ├── Work.dc.html                 Work index (30 projects, 7 filters)
│   ├── Project - Northwind.dc.html  Case-study template (all 30 via ?p=slug)
│   ├── site-tools.js                Language switch + in-page copy editor
│   ├── image-slot.js                Drag-and-drop placeholder element
│   └── _ds/                         Design-system bundle (Logo component only)
├── brand/
│   ├── tokens.css                   All design tokens — copy this in as-is
│   └── readme.md                    Brand System v2 documentation
├── content/
│   └── projects.json                30 projects × EN/PL
├── assets/                          Portrait, 11 client logos, arrow SVGs
└── context/
    ├── PROJECT-RULES.md             Working rules — rename to CLAUDE.md in your repo
    └── MEMORY.md                    Decision log: why things are as they are
```

**Open `prototypes/*.dc.html` directly in a browser** to see the designs running.
They work offline apart from Google Fonts and the cal.com iframe.

### Read these two files before starting

`context/PROJECT-RULES.md` and `context/MEMORY.md` are not filler. They carry the
non-negotiables and the root cause of every bug already solved here — grid tracks
being shared down a column, `img.complete` being true for cached images, a short
final row breaking width distribution, `overflow: hidden` stealing a sticky
scrollport, `aspect-ratio` making a horizontal stretch vertical. Rename
`PROJECT-RULES.md` to `CLAUDE.md` at your repo root and Claude Code will pick it
up automatically.

---

## Suggested build order

1. Tokens + fonts + the floating nav (appears on every page).
2. The `Spring` class and one shared rAF loop utility.
3. The aurora field as a component, with the masked variant as a prop.
4. Work index — the flex-row hover mechanic is the fiddliest piece; getting it
   right first de-risks the bento.
5. Homepage bento (reuses the hover language), then About, then the clients belts.
6. Hero reel last on the homepage — it needs the real video files.
7. Case-study template: static sections first, then the pinned wipe, then the
   plate strip and lightbox.
8. i18n pass, then the accessibility gaps above.
