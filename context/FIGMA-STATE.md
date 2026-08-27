# Figma build state

File: https://www.figma.com/design/8NbALQ7FcvANxgXynW8Wdt/Surveyvor
Page: `47:2` — renamed **"Portfolio — Site"**
Stopped: hit the Figma MCP tool-call limit on the Starter plan, mid project page.

## Foundation — done

**Variable collection "Brand"** (`VariableCollectionId:57:2`), 13 colours:
Ink/Ink, Ink/Ink 2, Ink/Muted, Surface/Paper, Surface/White, Surface/Tile,
Accent/Mint, and the six Category hues.

**8 text styles**, sizes resolved at a 1920 viewport so Figma matches the
browser: Display/XL 77, Display/LG 48, Display/MD 24, Body/Lede 24,
Body/Base 18, Body/Small 14, Mono/Label 11, Mono/Data 14.

**Nav component** `58:23` — 439x44, used by all three pages.

## Frames

| Frame | Node | State |
| --- | --- | --- |
| 01 · Homepage | `62:22` | **Complete.** 1920x4948 |
| 02 · Work | `59:2` | **Complete.** 1920x2689, all 30 real rows |
| 03 · Project | `65:42` | **Half built, one section broken** |

## What is broken

The **02 Process stage** on the project page rendered 16,705px tall.

Cause: its "Content" frame is a HORIZONTAL auto-layout left hugging on the
primary axis while both children were set to `layoutSizingHorizontal = FILL`.
Hug-vs-fill on the same axis collapsed the text column to a thread, so the
body copy ran vertically for thousands of pixels.

Fix: set that frame to a FIXED 1420 width and `counterAxisSizingMode = AUTO`
BEFORE setting either child to FILL. Then re-run the blob resize.

## Still to build on the project page

- 03 System (eyebrow, statement, body)
- Plate strip — Figs 08–11, horizontal scroll with progress rail
- Fig. 12 motion slot (1420 wide, 64px radius)
- 04 Outcome (eyebrow, statement, two columns) + four count-up stats
- Next-project footer on an aurora field

## Notes for resuming

- Fonts in this file use `SemiBold` / `ExtraBold` (no space).
- A plain `createFrame()` has `layoutMode = NONE`, so children are already
  absolute — setting `layoutPositioning = "ABSOLUTE"` on them throws.
- `figma.createAutoLayout()` hugs both axes by default; resize + set sizing
  modes before appending children that FILL.
