# Lukasz Wrzal — Portfolio

Next.js (App Router) + TypeScript + CSS Modules. Built from the design handoff
in `../design_handoff_portfolio/`.

## Running it

```bash
npm run dev
```

Then open http://localhost:3000 — it redirects to `/en`.

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server, with the content editor enabled |
| `npm run build` | Production build — pre-renders 64 pages |
| `npm test` | Layout-invariant tests for the work grid |
| `npm run lint` | ESLint |

## Editing content

**Text** lives in `src/content/projects.json` — 30 projects, each with an
`en` and a `pl` block. Edit it directly.

**Images** are discovered from the filesystem. Drop a file into
`public/work/<slug>/` named after its slot and it appears on the next build:

```
public/work/northwind/01.jpg    key visual, and the tile image everywhere else
public/work/northwind/02.jpg    the 2-up pair
public/work/northwind/04–07.jpg the four layers of the Process wipe
public/work/northwind/08–11.jpg the plate strip
public/work/northwind/12.mp4    the motion slot
```

Nothing to register. Full resolution is fine; nothing is re-encoded. Any
slot without a file renders the designed empty well, which is a finished
state rather than a gap. See `public/work/README.md`.

**Layout per project.** Not every project wants the same case study. A
project can name the sections it wants, in the order it wants them:

```json
"sections": ["keyVisual", "plateStrip", "meta", "brief", "motion", "outcome"]
```

Omit the field for the default order. Available blocks: `keyVisual`, `meta`,
`brief`, `figurePair`, `process`, `system`, `plateStrip`, `motion`,
`outcome`.

> There was an in-browser editor here. It was removed: editing a
> React-rendered page in place desynchronises the virtual DOM, and the page
> blanks with "removeChild: the node to be removed is not a child of this
> node". That is inherent to the approach, not a bug that was one fix away.

### What still needs writing

29 of 30 projects carry prompt text in their body fields. **Northwind is
fully written in both languages** and is the reference for tone and length.
A project whose body copy is still prompts is treated as a draft: it keeps
its row in the index, and its case-study page 404s in production until
written.

18 of 30 have no Polish tile description yet and fall back to English.

## Structure

```
src/
├─ app/[locale]/            en + pl, pre-rendered
│  ├─ page.tsx              Homepage
│  ├─ work/page.tsx         Work index — 30 projects, 7 filters
│  └─ work/[slug]/page.tsx  ONE template serving all 30 case studies
├─ app/api/                 Dev-only editor endpoints
├─ components/
│  ├─ Aurora/               The five-blob field (never a linear gradient)
│  ├─ ProjectTile/          The shared hover language
│  ├─ WorkGrid/             Flex-row grid — deliberately not CSS Grid
│  ├─ Bento/                Homepage grid, spring-driven fr columns
│  ├─ HeroReel/             Scroll-driven, three planes, clip-path wipe
│  ├─ About/                300vh track, pinned pane
│  ├─ Clients/              Two counter-running belts
│  ├─ CaseStudy/            Spine, pinned wipe, plate strip, lightbox, stats
│  └─ Editor/               In-place content editing
├─ lib/
│  ├─ spring.ts             Critically-damped spring
│  ├─ raf.ts                ONE shared rAF loop, guarded per subscriber
│  ├─ workGridLayout.ts     Pure layout maths (tested)
│  └─ i18n.ts               Page chrome, EN + PL
└─ content/
   ├─ projects.json         30 projects x EN/PL — the source of truth
   └─ images.json           Slot -> file manifest
```

## Things that will look wrong but aren't

Read `CLAUDE.md` and `context/MEMORY.md` before changing any of these — each is
a scar from a specific failure.

- **The work grid is flex, not CSS Grid.** Grid tracks are shared down the
  whole grid, so widening one track widens every card beneath it.
- **`rowLen`, not `cols`.** 30 cards across 4 columns leaves a final row of 2.
- **The `-0.5px` shave on card width.** Without it rounded widths overflow and
  cards wrap mid-hover.
- **Card height is pinned in px, never `aspect-ratio`.** Otherwise the hover
  stretch goes vertical too.
- **No `overflow: hidden` on the Process stage.** It would become the sticky
  scrollport and the frame would stop sticking.
- **The clients belt measures from the laid-out DOM**, not by summing image
  widths — those are 0 before load, and `img.complete` is true for cached
  *and cloned* images.
- **CSS owns every resting layout.** The springs only override during a hover.
  The grid is correct with JS disabled, still booting, or in a background tab
  where `requestAnimationFrame` never fires.
- **cal.com is a plain eager iframe**, not the embed script, with a 20s
  fallback cleared on load.

## Known gaps

- **Mobile needs design attention.** The handoff calls it the least-developed
  area and desktop is pixel-final. Sensible collapses are in place (bento to
  one column under 900px, the About pin abandoned rather than stacked, the
  Process pin abandoned under 1000px) but phone layouts were never designed.
- **Hero reel motion files are missing.** Specs: 1600x900, 16:9, key content
  in the centre ~80%, MP4 or WebM, 4–8s seamless loop, no audio. Drop them in
  and swap the empty planes in `HeroReel.tsx` for `<video autoplay muted loop
  playsinline>`.
- `--lw-faint` (rgb 163) is 2.44:1 on paper and fails AA. It is no longer used
  for text anywhere; the token is kept for fidelity with the brand file.

## Deploying

Vercel, zero config. `npm run build` pre-renders everything; there is nothing
server-side in production (the editor's API routes refuse to run there).
Set the real domain in `src/app/sitemap.ts`, `robots.ts`, and the
`metadataBase` in `src/app/[locale]/layout.tsx` — all three currently point at
`https://takealuke.studio`.
