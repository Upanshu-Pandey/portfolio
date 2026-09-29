---
name: kaplay-rpg-loader
description: How this portfolio's KAPLAY world works — code-authored pixel art, ASCII maps, tile-grid movement, props/NPCs/warps and interactions. Use when changing maps, art, movement or anything in src/art or src/world.
---

# KAPLAY world: maps, art and movement

## Pipeline
1. `src/art/*` draws everything into `Pix` RGBA buffers (DOM-free, so it also runs in Node).
2. `src/world/tilemap.ts#renderMap` turns a `MapDef` into three ground frames (for animated water, flowers and fountain), a `solid[]` grid and a `talk` map (tile → Interaction).
3. `src/art/index.ts#loadArt` converts the buffers to canvases and calls `k.loadSprite` (`map-<id>` and `over-<id>` with `sliceY: 3`, `char-<outfit>` with `sliceX: 12`, plus `shadow` and `grass-over`).
4. `src/world/scene.ts` is the only scene (`k.go("map", { map, spawn })`).

## MapDef rules (`src/world/types.ts`)
- `tiles`: ASCII rows, all the same length. Terrain legend is in `TERRAIN` (`src/art/tiles.ts`). `T` trees must form 2×2 blocks.
- `props`: `{ kind, x, y, opts?, talk? }`. The footprint comes from `propArt(kind).solid` (`#` solid, `.` walkable, `D` door). `talk` answers on every solid cell, and wall-mounted props also answer from the wall row below.
- `npcs`: `{ id, outfit, x, y, dir, talk, wander? }`. Wanderers stay within 1 tile of home.
- `warps`: stepping onto the tile loads `to` at `spawn`. Doors: the building's `D` cell. Interiors: `M` mat tiles.
- `spawns`: named `{ x, y, dir }`. Outside spawns sit one tile below each door. Inside, `door` sits one tile above the mat.

## Movement
- Tile-grid movement with `WALK_TIME`/`RUN_TIME` from `src/config.ts`. A tap shorter than `TURN_GRACE` turns in place.
- The target tile is reserved while moving, so NPCs and the player never overlap.
- The player freezes whenever `uiActive()` (any UI handler on the stack).
- Sprites are 16×32, drawn 16px above their tile, with a separate drop-shadow sprite. `z = 10 + y` sorts actors; the over layer (z 1000) covers canopies and lamp heads.
- Ledges (`L`) are solid except for the player moving down, who hops two tiles.
- The camera clamps to the playable map using `k.width()/k.height()`. Outdoor maps have a decorative forest margin (`MARGIN` in `tilemap.ts`).

## Art conventions
- Use colours only from `src/art/palette.ts`. `C.ink` is the universal outline.
- `Pix.shape()` gives auto-outlined, top-left-lit blobs, good for trees, bushes and rounded stone.
- Check changes with `npm run art:preview` (writes `art-preview/*.png`).
