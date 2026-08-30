# How to add or edit a project

Everything about a project lives in two places:

- **its words** → one file in this folder, e.g. `northwind.json`
- **its pictures** → one folder, `public/work/northwind/`

You never touch code.

---

## Before you start (once)

Open a terminal, and leave this running while you work:

```
cd Portfolio/site
npm run dev
```

Then open **http://localhost:3000** in your browser.

Leave it running. Every time you save a file, the browser updates.

---

## Adding a new project

**1 — Copy the template.**
Duplicate `_TEMPLATE.json.txt` and rename it to your project's name, all
lowercase, no spaces, ending in `.json`. For example `harbour.json`.

**2 — Change the six lines at the top.**

```json
"slug":     "harbour",        ← must match the filename, without .json
"cat":      "web",            ← identity, product, brand, web, ai, illustrations
"year":     "2026",
"nextSlug": "northwind",      ← which project the "next project" link goes to
"title":    "Harbour",
"desc":     { "en": "…", "pl": "…" }   ← one line, shown on the work list
```

**3 — Make a folder for its pictures.**
`public/work/harbour/` — even if it's empty for now.

**4 — That's it.** The project is already live at
`http://localhost:3000/en/work/harbour`, and it's in the work list.

---

## Adding pictures

Put the file in the project's folder and use its name in the JSON:

```
public/work/harbour/pier.jpg
```

```json
{ "type": "figure", "src": "pier.jpg", "width": "stage" }
```

Any name you like. Full size is best — nothing is shrunk or re-compressed.

A picture you haven't added yet shows as a soft blue panel. **That is on
purpose** — the page looks finished before the photography exists.

---

## Changing the page's shape

The `"blocks"` list *is* the page, top to bottom. Move a block up, and it
moves up the page. Delete one, and it's gone. Copy one, and you get two.

These are all the blocks you can use:

| Write this | You get | Options (`"variant"`) |
| --- | --- | --- |
| `hero` | Title, eyebrow, opening line | `centred`, `left` |
| `meta` | Client / Role / Scope / Team | — |
| `text` | Paragraphs, with an optional big statement | `single`, `two-column` (side by side — only works with exactly two paragraphs) |
| `list` | Term + description pairs (instead of bullet points) | `cards` (numbered set), `rows` (term left, text right) |
| `statement` | One large sentence on its own | `left`, `centred` |
| `figure` | One picture | width: `content`, `stage`, `full-bleed` |
| `gallery` | Several pictures | `grid-2`, `grid-3`, `masonry`, `strip` |
| `textMedia` | Words beside a picture | `media-left`, `media-right` |
| `quote` | A quote | `plain`, `aurora` |
| `process` | Numbered steps with sticky images | `pinned`, `stacked` |
| `stats` | Big numbers that count up | — |
| `video` | A looping video | width: `content`, `stage`, `full-bleed` |
| `credits` | Roles and names | — |

Any block can be used as many times as you like, in any order.

Give a `text` or `list` block an `"eyebrow"` (like `"The idea"`) and it becomes a
numbered chapter — the `01`, `02`, `03` appear by themselves, so never type the
numbers yourself. Blocks without an eyebrow stay unnumbered.

Need more air around something? Add `"spacing": "loose"` to that block.
Less air? `"spacing": "tight"`.

---

## Writing in two languages

If the English and Polish are different:

```json
"lede": { "en": "Twenty-two plates.", "pl": "Dwadzieścia dwie plansze." }
```

If they're the same (a name, a number), just write it once:

```json
"title": "Harbour"
```

---

## If you break something

You will, and it's fine. Nothing is permanent, and the page tells you what's
wrong.

**"Expected ',' or '}'"** — a comma is missing or extra. Every line inside
`{ }` needs a comma after it **except the last one**.

**"unknown type. Expected one of hero, meta, text…"** — a block name is
mistyped. It even lists the valid ones.

**"`text` is required"** — that block needs a field you haven't given it.

Fix the file, save, and the page comes straight back. You cannot break the
site permanently by editing these files.

**In VS Code you'll rarely get this far** — the editor knows the rules and
underlines mistakes in red as you type, and offers you the list of block
names when you type `"type":`.

---

## The one rule worth remembering

Commas separate items in a list. The **last** item never has one.

```json
"blocks": [
  { "type": "hero", "title": "Harbour" },     ← comma
  { "type": "figure", "src": "pier.jpg" }     ← no comma, it's last
]
```
