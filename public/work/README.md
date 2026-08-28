# Project images

Drop files here, named after the slot they fill. Nothing else to do — the
site picks them up on the next build.

```
public/work/
  northwind/
    01.jpg     ← key visual. Also becomes the tile image on the homepage
    02.jpg     ← the 2-up pair
    03.jpg
    04–07.jpg  ← the four layers of the pinned Process wipe
    08–11.jpg  ← the drag-scrolled plate strip
    12.mp4     ← the motion slot
  kettle/
    01.jpg
    ...
```

- Folder name = the project's `slug` in `src/content/projects.json`.
- File name = the slot number, zero-padded: `01` … `12`.
- Accepted: `jpg jpeg png webp avif gif mp4 webm`.
- Any slot without a file renders the designed empty well — that is a
  finished state, not a gap.

Full resolution is fine and preferred; nothing is re-encoded.
