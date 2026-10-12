# Retro RPG Portfolio: Workspace Guidelines

## Project Vision
An interactive top-down portfolio for **Upanshu Pandey** in the visual style of GBA-era handheld RPGs, built with KAPLAY.js. Visitors walk a pixel-art town tile by tile, enter buildings, and talk to NPCs and objects that open HTML panels with projects and résumé details.

**Style, not franchise:** the look is inspired by GBA-era RPGs, but the site must contain no names, logos, items, UI or quotes from any existing game franchise.

## Tech Stack
- **Engine:** KAPLAY.js (TypeScript, HTML5 canvas), one generic map scene
- **Build:** Vite + TypeScript (`npm run dev`, `npm run build`)
- **Art:** 100% code-authored pixel art in `src/art/` (no image assets). Preview with `npm run art:preview` → `art-preview/*.png`
- **Maps:** ASCII layouts + prop/NPC/warp lists in `src/world/maps/`
- **UI:** DOM overlay (retro text box, main menu) + full-screen HTML panels (Project Log, Résumé)
- **Deploy:** GitHub Pages via `.github/workflows/deploy.yml` (relative `base: "./"`)

## Critical Architecture Principles

### 1. Canvas + DOM separation
- The canvas draws only the world: the ground layer, the "over" layer (canopies and lamp heads drawn above actors), characters and their shadows, and the tall-grass overlay.
- All text lives in the DOM: dialogue (`src/ui/dialogue.ts`), menus (`src/ui/menu.ts`), panels (`src/ui/panel.ts`). Never draw paragraphs on the canvas.

### 2. Recruiter fast path (non-negotiable)
- A **MENU** button is always visible top-right, and `ESC` opens it anywhere.
- The menu gives instant access to PROJECTS (all write-ups), RÉSUMÉ (everything on one page), MAP (quick travel), CV (opens in a new tab) and sound.
- The title screen has an "Open the résumé" shortcut, and `index.html` has a `<noscript>` fallback with contact details and the CV link.

### 3. One source of truth for content
- Everything the site says about Upanshu lives in `src/content.ts`.
- Dialogue lines live next to the map objects that speak them (`src/world/maps/*.ts`).
- Only state facts that come from the CV or the user. Don't invent achievements.

### 4. Art direction (GBA-era fidelity)
- Colours come from the 5-shade, hue-shifted ramps in `src/art/palette.ts`.
- Tiles are 16×16. Characters are 16×32 frames (about 26px visible) with a soft drop shadow.
- Terrain edges use the quarter-tile autotiler in `src/art/tiles.ts`, and rounded shapes use the lit-cluster renderer (`clusters()` in `src/art/pixel.ts`).
- Props may overhang their footprint (`ox`/`oy` in `src/art/props.ts`). Anything above the footprint goes into the over layer automatically.
- The canvas fills the page. `pickScale()` in `src/config.ts` picks an integer pixel scale (fractional only on narrow phones), and in-game UI is sized with the CSS var `--px`.

### 5. Input model
- `src/input.ts` maps keyboard and touch to buttons (`up/down/left/right/a/b/start`).
- UI pushes handlers onto a stack. While the stack is non-empty the player is frozen.

## Map Zones
| Zone | Map id | Contents |
|---|---|---|
| Upanshu Town (spawn) | `town` | Welcome sign, guide, fountain plaza, pond + pier, tall grass, ledge, north road sign |
| Town Hall | `hall` | *Who is he?* Mayor (About), career timeline of wall portraits left → right (A-Levels → diploma/Education → each role → Experience → empty "next role" frame/Contact), bookshelves (Skills, each linked to the projects that used it), CV desk (opens PDF) |
| The Platform | `platform` | *The flagship product.* Engineer (overview) + one station per part of the Voyager analytics platform: NL query engine, RAG, ML service, SaaS & reporting, identity & connectors, front end, ETL/migration/observability, hosting & deployment |
| Consultancy Office | `consultancy` | *Client work.* Consultant + one filing cabinet per case file (client, brief, what he did): retail group upgrade, health insurance FHIR, IRD localisation, warehouse extensions, integrations, maintenance contracts |
| Observatory | `observatory` | *His own work.* Stargazer + telescope (Quantum RL), thesis desk (opens the PDF), PC (E-Commerce) |
| Upanshu's House | `house` | Mom (Contact), flavour objects |

**No repeats:** each fact has one home in the world. Buildings go deep on one question each; only the RÉSUMÉ panel summarises everything together.

## Adding things
- **New project:** add it to `PROJECTS` in `src/content.ts` (`building: "platform" | "consultancy" | "observatory"`; case files also take `client` and `brief`). Tag it with names from `SKILLS` so it shows up as evidence on the Tech Stack page. Then place it in that building in `src/world/maps/interiors.ts` with `station(...)`, `caseFile(...)` or a prop of its own. Make sure it doesn't retell another entry.
- **New map object:** add a prop from the `propArt` registry (`src/art/props.ts`) to a map's `props`, with an optional `talk` interaction.
- **New building:** draw it in `props.ts` with the building kit (`roof`, `wall`, `windowPane`, `glassDoor`…). Give its footprint a `D` door cell, and add a warp and a spawn on both maps.
- After art changes, run `npm run art:preview` (optionally `npm run art:preview -- town 20 14 12 10 3` for a zoomed crop) and look at the PNGs.

## Development
```
npm install
npm run dev          # http://localhost:5173
npm run build        # tsc + vite build → dist/
npm run art:preview  # render maps + characters to art-preview/
```
