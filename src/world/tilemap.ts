// src/world/tilemap.ts
// ─── Turn a MapDef into pre-rendered ground frames + collision/interaction grids ───
// The whole ground is baked into ONE image per animation frame (3 frames).
// Outdoor maps get a decorative forest margin so wide screens never show the void.

import { Pix } from "../art/pixel.ts";
import { T, TERRAIN, DEFAULT_THEME, type TileCtx } from "../art/tiles.ts";
import { propArt, type PropArt } from "../art/props.ts";
import type { Interaction, MapDef, PropDef } from "./types.ts";

export const FRAMES = 3;
export const MARGIN = 8;   // tiles of forest around outdoor maps (even, keeps trees aligned)

export interface BuiltMap {
  w: number;                        // playable size in tiles
  h: number;
  margin: number;                   // decorative border in tiles (0 indoors)
  frames: Pix[];                    // ground layer incl. margin, one per animation frame
  over: Pix[];                      // parts of props that overhang the tile above (drawn over actors)
  solid: boolean[];
  ledge: boolean[];                 // one-way ledges: hop down from the tile above
  talk: Map<number, Interaction>;
  tallGrass: boolean[];
  idx: (x: number, y: number) => number;
}

const drawCache = new Map<string, Pix>();

export function renderMap(map: MapDef): BuiltMap {
  const h = map.tiles.length;
  const w = Math.max(...map.tiles.map((r) => r.length));
  const M = map.outdoor ? MARGIN : 0;
  const inside = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h;
  const raw = (x: number, y: number) => map.tiles[y]![x] ?? "X";

  /** Terrain char, including the margin: paths continue outward, everything else is forest. */
  const at = (x: number, y: number): string => {
    if (inside(x, y)) return raw(x, y);
    if (!map.outdoor) return "?";
    if (x < -M || y < -M || x >= w + M || y >= h + M) return "T";
    const cx = Math.min(w - 1, Math.max(0, x)), cy = Math.min(h - 1, Math.max(0, y));
    const edge = raw(cx, cy);
    const straight = (x >= 0 && x < w) || (y >= 0 && y < h);
    return straight && edge === ":" ? ":" : "T";
  };
  const idx = (x: number, y: number) => y * w + x;
  const theme = map.theme ?? DEFAULT_THEME;

  const solid = new Array<boolean>(w * h).fill(false);
  const ledge = new Array<boolean>(w * h).fill(false);
  const tallGrass = new Array<boolean>(w * h).fill(false);
  const talk = new Map<number, Interaction>();

  // Group 'T' cells into 2×2 trees (greedy, top-left first), margin included
  const trees: [number, number][] = [];
  const used = new Set<string>();
  for (let y = -M; y < h + M; y++)
    for (let x = -M; x < w + M; x++)
      if (at(x, y) === "T" && !used.has(`${x},${y}`)) {
        trees.push([x, y]);
        for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]] as const)
          if (at(x + dx, y + dy) === "T") used.add(`${x + dx},${y + dy}`);
      }

  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const c = raw(x, y);
      const t = TERRAIN[c] ?? TERRAIN["X"]!;
      solid[idx(x, y)] = t.solid;
      tallGrass[idx(x, y)] = c === ",";
      ledge[idx(x, y)] = c === "L";
    }

  const defs: PropDef[] = [...trees.map(([x, y]): PropDef => ({ kind: "tree", x, y })), ...map.props];
  const props: { def: PropDef; art: PropArt }[] = defs
    .map((d) => ({ def: d, art: propArt(d.kind, d.opts) }))
   .sort((a, b) => a.def.y + a.art.h - (b.def.y + b.art.h));

  for (const { def, art } of props)
    art.solid.forEach((row, dy) => {
      [...row].forEach((c, dx) => {
        const x = def.x + dx, y = def.y + dy;
        if (!inside(x, y)) return;
        if (c === "#") solid[idx(x, y)] = true;
        if (c === "D") solid[idx(x, y)] = false;
        if (c === "#" && def.talk) {
          // wall-mounted items also answer from the wall row the player can face
          for (let yy = y; yy < h && (yy === y || raw(x, yy) === "W"); yy++) talk.set(idx(x, yy), def.talk);
        }
      });
    });

  for (const s of map.spots ?? []) talk.set(idx(s.x, s.y), s.talk);

  const frames: Pix[] = [];
  const over: Pix[] = [];
  for (let f = 0; f < FRAMES; f++) {
    const p = new Pix((w + 2 * M) * T, (h + 2 * M) * T);
    const o = new Pix(p.w, p.h);
    for (let y = -M; y < h + M; y++)
      for (let x = -M; x < w + M; x++) {
        const ctx: TileCtx = {
          p, x: (x + M) * T, y: (y + M) * T, tx: x, ty: y, frame: f, theme,
          n: (dx, dy) => at(x + dx, y + dy),
        };
        (TERRAIN[at(x, y)] ?? TERRAIN["X"]!).paint(ctx);
      }
    for (const { def, art } of props) {
      const key = `${def.kind}|${JSON.stringify(def.opts ?? {})}|${f}`;
      let img = drawCache.get(key);
      if (!img) drawCache.set(key, (img = art.draw(f)));
      const px = (def.x + M) * T + (art.ox ?? 0), py = (def.y + M) * T + (art.oy ?? 0);
      p.blit(img, px, py);
      // overhang above the footprint (tree canopies, lamp heads) must cover actors standing behind
      if (art.oy && art.oy < 0) o.blit(img.crop(0, 0, img.w, -art.oy), px, py);
    }
    frames.push(p);
    over.push(o);
  }

  return { w, h, margin: M, frames, over, solid, ledge, talk, tallGrass, idx };
}
