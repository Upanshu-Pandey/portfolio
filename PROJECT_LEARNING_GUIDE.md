# Upanshu's Retro RPG Portfolio: Learning Guide

A plain-English tour of how the project works, how to change it, and where to learn more.

---

## 1. The big idea

The portfolio is a tiny GBA-style game. You walk around **Upanshu Town**, enter buildings, and talk to people and objects. Each conversation can open an HTML panel with a project write-up or a résumé section.

Three ideas hold it together:

1. **The world is a grid.** Every map is 16×16-pixel tiles. The player moves one tile at a time, like in GBA-era handheld RPGs.
2. **All art is code.** There are no PNG files. Tiles, buildings and characters are drawn pixel by pixel in TypeScript and turned into sprites when the page loads. That's why everything shares one palette and one outline colour.
3. **Text lives in HTML, not the canvas.** The canvas draws the world. Dialogue, menus and panels are normal HTML/CSS on top, so they stay sharp, selectable and accessible.

---

## 2. How a frame of the game comes together

```
content.ts ─────────────┐
maps/*.ts (ASCII) ──► tilemap.ts ──► 3 pre-rendered ground images (for water/flower animation)
art/*.ts (pixel code) ──┘                 + collision grid + "who talks here" grid
                                                  │
                                          world/scene.ts
                          (player + NPC movement, warps, camera)
                                                  │  press A while facing something
                                          ui/interact.ts
                          dialogue.ts → YES/NO → panel.ts / menu.ts
```

### Key files
| File | What it does |
|---|---|
| `src/art/pixel.ts` | A tiny RGBA buffer (`Pix`) with helpers: rectangles, ASCII grids, auto-shaded shapes. |
| `src/art/tiles.ts` | Paints terrain. Paths and water look at their neighbours to draw edges ("autotiling"). |
| `src/art/props.ts` | Buildings, trees, the fountain, furniture and project terminals. |
| `src/art/characters.ts` | Walking characters drawn as ASCII grids. NPCs are palette swaps of one body. |
| `src/world/maps/town.ts` | The town layout as text: `.` grass, `:` path, `~` water, `T` trees… |
| `src/world/scene.ts` | Grid movement, NPC wandering, doors/warps with fades, camera clamping. |
| `src/input.ts` | Turns keyboard/touch into GBA buttons. UI "handlers" sit on a stack so the player freezes while a menu is open. |
| `src/ui/*.ts` | Text box, main menu, Project Log/Résumé panels, title screen, touch pad. |
| `src/content.ts` | Every fact about Upanshu. Change it here and the panels update. |

---

## 3. Common changes

**Edit a project or your experience:** change `src/content.ts`.

**Change what an NPC says:** find the NPC in `src/world/maps/*.ts` and edit its `talk.say` lines. `\n` is a line break; each array item is one page.

**Add a project:**
1. Add an entry to `PROJECTS` in `content.ts`.
2. In `src/world/maps/interiors.ts`, add `kiosk("your-id", x, y, RAMP.teal)` to a workshop's `props` on a free floor tile.

**Tweak the art:**
1. Edit colours in `src/art/palette.ts`, or drawing code in `tiles.ts`, `props.ts` or `characters.ts`.
2. Run `npm run art:preview` and open `art-preview/map-town.png` to see the result without a browser.

**Change the map:** edit the ASCII rows in `town.ts`. Keep every row the same length, and keep trees (`T`) in 2×2 blocks.

---

## 4. Running it

```bash
npm install
npm run dev          # live-reloading dev server at http://localhost:5173
npm run build        # type-check + production build into dist/
npm run preview      # serve dist/ locally
npm run art:preview  # render the art to PNGs
```

Pushing to `master` deploys to GitHub Pages through `.github/workflows/deploy.yml`.

---

## 5. Learning resources

- **KAPLAY.js:** [docs](https://kaplayjs.com/) and the [KAPLAYground examples](https://play.kaplayjs.com/)
- **TypeScript:** [TypeScript in 5 minutes](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html)
- **Vite:** [getting started](https://vitejs.dev/guide/)
- **Pixel art:** [Lospec palettes & tutorials](https://lospec.com/) and [Aseprite](https://www.aseprite.org/) for sketching before coding
- **Web Audio:** [MDN Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- **CSS container queries** (how the text box scales with the screen): [MDN guide](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries)
