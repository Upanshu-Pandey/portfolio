// src/art/tiles.ts
// ─── 16×16 terrain, painted straight into a map-sized buffer ───
// Paths, water and plaza use a quarter-tile autotiler (RPG-Maker "A2" style):
// each 8×8 quarter picks centre / edge / outer-corner / inner-corner geometry from its neighbours,
// then a distance field with a gentle wobble gives soft, organic borders.

import { Pix, hash, clusters, type RGBA } from "./pixel.ts";
import { RAMP, C, type Ramp } from "./palette.ts";

export const T = 16;

export interface TileCtx {
  p: Pix;
  x: number;         // pixel origin in the buffer
  y: number;
  tx: number;        // tile coords (noise seed)
  ty: number;
  frame: number;     // 0..2
  n: (dx: number, dy: number) => string;
  theme: Theme;
}

export interface Theme {
  wall: Ramp;
  wallpaper: "stripe" | "diamond" | "plain" | "panel";
  floor: "wood" | "tile" | "check";
  floorRamp: Ramp;
  floorAlt?: Ramp;
  trim: Ramp;
}

export const DEFAULT_THEME: Theme = {
  wall: RAMP.cream, wallpaper: "stripe", floor: "wood", floorRamp: RAMP.plank, trim: RAMP.wood,
};

// ── Noise ───────────────────────────────────────────────────────

/** Smooth value noise in [0,1). */
export function vnoise(x: number, y: number, scale: number, seed = 0): number {
  const fx = x / scale, fy = y / scale;
  const ix = Math.floor(fx), iy = Math.floor(fy);
  const u = fx - ix, v = fy - iy;
  const s = (t: number) => t * t * (3 - 2 * t);
  const a = hash(ix, iy, seed), b = hash(ix + 1, iy, seed);
  const c = hash(ix, iy + 1, seed), d = hash(ix + 1, iy + 1, seed);
  return a + (b - a) * s(u) + (c - a) * s(v) + (a - b - c + d) * s(u) * s(v);
}

// ── Grass ───────────────────────────────────────────────────────

const TUFT = [
  ".4.4.",
  "43234",
  ".222.",
];

export function grass({ p, x, y, tx, ty }: TileCtx): void {
  const g = RAMP.grass;
  for (let j = 0; j < T; j++)
    for (let i = 0; i < T; i++) {
      const gx = tx * T + i, gy = ty * T + j;
      const n = vnoise(gx, gy, 11, 3);
      let c = g[3];
      if (n > 0.72 && hash(gx, gy, 5) < 0.12) c = g[4];
      else if (n < 0.28 && hash(gx, gy, 6) < 0.1) c = g[2];
      p.px(x + i, y + j, c);
    }
  // blade tufts on a jittered 8×8 grid
  for (let q = 0; q < 4; q++) {
    const cx = (q % 2) * 8, cy = Math.floor(q / 2) * 8;
    if (hash(tx * 2 + (q % 2), ty * 2 + (q >> 1), 11) > 0.42) continue;
    const ox = cx + 1 + Math.floor(hash(tx, ty, 20 + q) * 3);
    const oy = cy + 2 + Math.floor(hash(tx, ty, 30 + q) * 3);
    p.grid(TUFT, { "2": g[1], "3": g[2], "4": g[4] }, x + ox, y + oy);
  }
}

// ── Tall grass: staggered hand-drawn clumps ────────────────────

const CLUMP = [
  "..4...4.",
  ".43..432",
  ".432.432",
  "4332.432",
  "43324321",
  "33323321",
  "2222221.",
  ".1111...",
];
const CLUMP_KEY = { "1": RAMP.tall[0], "2": RAMP.tall[1], "3": RAMP.tall[3], "4": RAMP.tall[4] };

const TALL_TILE = (() => {
  const t = RAMP.tall;
  const q = new Pix(T, T);        // drawn in its own buffer so wrapped clumps clip to the tile
  q.rect(0, 0, T, T, t[2]);
  for (let j = 0; j < T; j += 2) for (let i = (j >> 1) % 2; i < T; i += 2) q.px(i, j, t[1]);
  for (const [cx, cy] of [[0, 0], [8, 0], [4, 8], [12, 8], [-4, 8]] as const) q.grid(CLUMP, CLUMP_KEY, cx, cy);
  return q;
})();

export function tallGrass({ p, x, y }: TileCtx): void {
  p.blit(TALL_TILE, x, y);
}

/** Lower clumps, drawn over an actor's legs when standing in tall grass. */
export function tallGrassOverlay(): Pix {
  const p = new Pix(T, T);
  for (const cx of [-4, 4, 12]) p.grid(CLUMP.slice(2), CLUMP_KEY, cx, 10);
  return p;
}

// ── Autotiled materials ─────────────────────────────────────────

interface Material {
  under: (ctx: TileCtx) => void;                    // what shows outside the rounded edge
  joins: (c: string) => boolean;                    // which neighbours count as "same"
  band: (d: number, gx: number, gy: number, frame: number) => RGBA | null;  // edge bands by distance
  fill: (gx: number, gy: number, frame: number, tx: number, ty: number) => RGBA;
}

const R = 6;  // corner radius

/** Distance (px) from a quarter pixel to the material edge, given which sides are open. */
function edgeDist(lx: number, ly: number, openX: boolean, openY: boolean, diag: boolean): number {
  // lx, ly: distance from the tile's outer corner of this quarter (0..8, centre of pixel)
  if (openX && openY) {
    const dx = Math.max(0, R - lx), dy = Math.max(0, R - ly);
    return dx > 0 && dy > 0 ? R - Math.hypot(dx, dy) : Math.min(lx, ly);
  }
  if (openX) return lx;
  if (openY) return ly;
  if (diag) {
    const d = Math.hypot(lx, ly);
    return d - (R - 3) + 1;       // small inner bite
  }
  return 99;
}

function paintMaterial(ctx: TileCtx, m: Material): void {
  const { p, x, y, tx, ty, frame, n } = ctx;
  m.under(ctx);
  const same = (dx: number, dy: number) => m.joins(n(dx, dy));
  for (let j = 0; j < T; j++)
    for (let i = 0; i < T; i++) {
      const sx = i < 8 ? -1 : 1, sy = j < 8 ? -1 : 1;
      const lx = (i < 8 ? i : 15 - i) + 0.5, ly = (j < 8 ? j : 15 - j) + 0.5;
      const openX = !same(sx, 0), openY = !same(0, sy), diag = !same(sx, sy);
      const gx = tx * T + i, gy = ty * T + j;
      const wob = (Math.sin(gx * 0.9 + gy * 0.35) + Math.sin(gy * 1.1 - gx * 0.4)) * 0.35;
      const d = edgeDist(lx, ly, openX, openY, diag) + wob;
      if (d < 0) continue;
      const c = m.band(d, gx, gy, frame) ?? m.fill(gx, gy, frame, tx, ty);
      p.px(x + i, y + j, c);
    }
}

const isPathy = (c: string) => c === ":" || c === "o" || c === "=" || c === "?" || c === "M";

const PATH: Material = {
  under: grass,
  joins: isPathy,
  band: (d) => (d < 1 ? RAMP.grass[1] : d < 2 ? RAMP.path[1] : d < 3 ? RAMP.path[2] : null),
  fill: (gx, gy) => {
    const pa = RAMP.path;
    let c = pa[3];
    if (vnoise(gx, gy, 9, 5) < 0.3 && hash(gx, gy, 46) < 0.25) c = pa[2];
    // pebbles
    const h = hash(gx >> 2, gy >> 2, 44);
    if (h < 0.09 && (gx & 3) === 1 && (gy & 3) === 2) c = pa[1];
    if (h < 0.09 && (gx & 3) === 1 && (gy & 3) === 1) c = pa[4];
    if (hash(gx, gy, 45) < 0.03) c = pa[4];
    return c;
  },
};

const PLAZA: Material = {
  under: grass,
  joins: (c) => c === "o" || c === "?",
  band: (d) => (d < 1 ? RAMP.stone[0] : d < 2 ? RAMP.stone[1] : null),
  fill: (gx, gy) => {
    const s = RAMP.stone;
    const row = Math.floor(gy / 8);
    const bx = (gx + (row % 2) * 4) % 8, by = gy % 8;
    if (by === 7 || bx === 7) return s[1];
    if (by === 0 || bx === 0) return s[4];
    if (by === 6 || bx === 6) return s[2];
    return hash(Math.floor((gx + (row % 2) * 4) / 8), row, 12) > 0.75 ? s[2] : s[3];
  },
};

const WATER: Material = {
  under: grass,
  joins: (c) => c === "~" || c === "?" || c === "=",
  band: (d, gx, gy, frame) => {
    const w = RAMP.water;
    if (d < 1) return RAMP.grass[0];
    if (d < 2) return w[1];
    if (d < 3) return (gx + gy + frame) % 3 === 0 ? w[4] : w[3];   // shimmering foam line
    if (d < 4) return w[3];
    return null;
  },
  fill: (gx, gy, frame) => {
    const w = RAMP.water;
    let c = w[2];
    // drifting ripples
    const rx = (gx + frame * 2) % 16, ry = gy % 8;
    const cell = hash(Math.floor((gx + frame * 2) / 16), Math.floor(gy / 8), 3);
    if (ry === 3 && rx >= 4 && rx < 4 + 3 + Math.floor(cell * 4)) c = w[3];
    if (ry === 2 && rx === 5 + Math.floor(cell * 3)) c = w[4];
    return c;
  },
};

// ── Flowers (2 per tile, 3-frame sway) ──────────────────────────

const FLOWER = [
  [".hh..", "hPPp.", "hPYp.", ".pp..", "..g..", ".gG.."],
  [".hh..", "hPPp.", "hPYp.", ".pp..", "..g..", "..Gg."],
  ["..hh.", ".hPPp", ".hPYp", "..pp.", "..g..", ".gG.."],
];

export function flowers(ctx: TileCtx): void {
  grass(ctx);
  const { p, x, y, tx, ty, frame } = ctx;
  const kind = hash(tx, ty, 80);
  const petal = kind < 0.5 ? RAMP.red : kind < 0.75 ? RAMP.yellow : RAMP.pink;
  const key = { h: petal[4], P: petal[3], p: petal[1], Y: RAMP.yellow[4], g: RAMP.grass[1], G: RAMP.grass[4] };
  const f = FLOWER[frame % 3]!;
  for (const [fx, fy] of [[1, 1], [9, 8]] as const) p.grid(f, key, x + fx, y + fy);
}

// ── Fence, ledge, bush, rock ───────────────────────────────────

const POST = [
  "..0..",
  ".040.",
  "03420",
  "03420",
  "03420",
  "03420",
  "03420",
  "03420",
  "03420",
  "03320",
  "02210",
  ".000.",
];

export function fence(ctx: TileCtx): void {
  grass(ctx);
  const { p, x, y, n } = ctx;
  const w = RAMP.white;
  const f = (c: string) => c === "#";
  const l = f(n(-1, 0)) ? 0 : 6, r = f(n(1, 0)) ? 16 : 10;
  // rails with shadow on the grass
  p.rect(x + l, y + 13, r - l, 2, C.shadowSoft);
  for (const ry of [5, 9]) {
    p.hline(x + l, y + ry - 1, r - l, w[0]);
    p.hline(x + l, y + ry, r - l, w[4]);
    p.hline(x + l, y + ry + 1, r - l, w[2]);
    p.hline(x + l, y + ry + 2, r - l, w[0]);
  }
  p.grid(POST, { "0": w[0], "1": w[1], "2": w[2], "3": w[3], "4": w[4] }, x + 5, y + 2);
  p.rect(x + 6, y + 14, 4, 1, C.shadow);
}

export function ledge(ctx: TileCtx): void {
  grass(ctx);
  const { p, x, y, n } = ctx;
  const g = RAMP.grass;
  const l = n(-1, 0) === "L", r = n(1, 0) === "L";
  for (let i = 0; i < T; i++) {
    if ((!l && i < 1) || (!r && i > 14)) continue;
    const dip = i % 4 === 0 ? 1 : 0;           // scalloped lip
    p.px(x + i, y + 8, g[4]);
    p.px(x + i, y + 9, g[3]);
    p.px(x + i, y + 10, i % 4 === 3 ? g[1] : g[2]);
    p.px(x + i, y + 11, g[1]);
    p.px(x + i, y + 12, g[0]);
    if (dip) p.px(x + i, y + 13, g[0]);
    p.px(x + i, y + 13 + dip, C.shadow);
    p.px(x + i, y + 14 + dip, C.shadowSoft);
  }
  if (!l) p.vline(x, y + 9, 4, g[0]);
  if (!r) p.vline(x + 15, y + 9, 4, g[0]);
}

export function bush(ctx: TileCtx): void {
  grass(ctx);
  const { p, x, y, tx, ty } = ctx;
  p.rect(x + 2, y + 13, 12, 2, C.shadow);
  clusters(p, x, y, [
    { cx: 8, cy: 9, r: 6 }, { cx: 4.5, cy: 10, r: 4 }, { cx: 11.5, cy: 10, r: 4 }, { cx: 8, cy: 5.5, r: 4 },
  ], RAMP.leaf, { base: 1.5, speck: 0.08, seed: tx * 7 + ty });
}

export function rock(ctx: TileCtx): void {
  grass(ctx);
  const { p, x, y } = ctx;
  p.rect(x + 3, y + 12, 11, 2, C.shadow);
  clusters(p, x, y, [{ cx: 8, cy: 9, r: 5.5 }, { cx: 5, cy: 10.5, r: 3.5 }, { cx: 11, cy: 10.5, r: 3.5 }], RAMP.stone, { base: 1.4 });
}

// ── Indoor surfaces ─────────────────────────────────────────────

export function wallTile({ p, x, y, n, theme, tx }: TileCtx): void {
  const w = theme.wall, tr = theme.trim;
  const top = n(0, -1) !== "W", bottom = n(0, 1) !== "W" && n(0, 1) !== "?";
  for (let j = 0; j < T; j++)
    for (let i = 0; i < T; i++) {
      const gx = tx * T + i;
      let c = w[3];
      if (theme.wallpaper === "stripe") c = gx % 8 < 4 ? w[3] : w[2];
      else if (theme.wallpaper === "diamond") c = (Math.abs((gx % 8) - 4) + Math.abs((j % 8) - 4)) === 3 ? w[2] : w[3];
      else if (theme.wallpaper === "panel") c = gx % 16 === 0 ? w[1] : gx % 16 === 1 ? w[4] : w[3];
      p.px(x + i, y + j, c);
    }
  if (top) {
    p.hline(x, y, T, tr[0]);
    p.rect(x, y + 1, T, 2, tr[2]);
    p.hline(x, y + 1, T, tr[3]);
    p.hline(x, y + 3, T, tr[0]);
    p.hline(x, y + 4, T, w[1]);      // shadow under the cornice
  }
  if (bottom) {
    // wainscot + baseboard
    p.hline(x, y + 8, T, tr[4]);
    p.rect(x, y + 9, T, 5, tr[2]);
    for (let i = 0; i < T; i += 8) p.vline(x + i, y + 9, 5, tr[1]);
    p.hline(x, y + 9, T, tr[3]);
    p.hline(x, y + 14, T, tr[0]);
    p.hline(x, y + 15, T, tr[1]);
  }
}

export function floorTile({ p, x, y, tx, ty, theme }: TileCtx): void {
  const f = theme.floorRamp;
  if (theme.floor === "wood") {
    for (let r = 0; r < 4; r++) {
      const py0 = y + r * 4;
      const plank = ty * 4 + r;
      const seam = (plank * 7 + 3) % 16;
      const tone = hash(tx, plank, 5) > 0.6 ? 2 : 3;
      for (let i = 0; i < T; i++) {
        const gx = tx * T + i;
        const grain = hash(gx >> 2, plank, 6) > 0.85 && i % 3 === 0;
        p.px(x + i, py0, f[4]);
        p.px(x + i, py0 + 1, grain ? f[2] : f[tone]!);
        p.px(x + i, py0 + 2, f[tone]!);
        p.px(x + i, py0 + 3, f[1]);
        if ((gx - seam + 64) % 16 === 0) { p.vline(x + i, py0, 3, f[1]); }
      }
    }
  } else if (theme.floor === "tile") {
    for (let j = 0; j < T; j++)
      for (let i = 0; i < T; i++) {
        let c = f[3];
        if (i === 15 || j === 15) c = f[1];
        else if (i === 0 || j === 0) c = f[4];
        else if (i + j < 5) c = f[4];
        else if (i > 11 && j > 11) c = f[2];
        p.px(x + i, y + j, c);
      }
  } else {
    const alt = theme.floorAlt ?? f;
    const r = (tx + ty) % 2 === 0 ? f : alt;
    for (let j = 0; j < T; j++)
      for (let i = 0; i < T; i++) {
        let c = r[3];
        if (i === 0 || j === 0) c = r[4];
        if (i === 15 || j === 15) c = r[1];
        if (i > 2 && i < 6 && j === 3) c = r[4];
        p.px(x + i, y + j, c);
      }
  }
}

export function mat(ctx: TileCtx): void {
  floorTile(ctx);
  const { p, x, y, n } = ctx;
  const r = RAMP.red;
  const l = n(-1, 0) === "M" ? 0 : 2, rr = n(1, 0) === "M" ? 16 : 14;
  p.rect(x + l, y + 3, rr - l, 11, r[2]);
  p.hline(x + l, y + 2, rr - l, r[0]).hline(x + l, y + 14, rr - l, r[0]).hline(x + l, y + 15, rr - l, C.shadow);
  p.hline(x + l, y + 3, rr - l, r[3]);
  for (let i = l; i < rr; i++) if (i % 2 === 0) { p.px(x + i, y + 6, r[3]); p.px(x + i, y + 10, r[1]); }
  if (l) p.vline(x + 1, y + 2, 13, r[0]);
  if (rr < 16) p.vline(x + 14, y + 2, 13, r[0]);
}

export function voidTile({ p, x, y }: TileCtx): void {
  p.rect(x, y, T, T, C.void);
}

/** Wooden pier planks laid over water. */
export function pier(ctx: TileCtx): void {
  paintMaterial(ctx, WATER);
  const { p, x, y } = ctx;
  const w = RAMP.plank;
  p.rect(x + 2, y, 12, T, w[3]);
  for (let i = 2; i < 14; i += 4) { p.vline(x + i, y, T, w[4]); p.vline(x + i + 3, y, T, w[1]); }
  p.vline(x + 1, y, T, w[0]).vline(x + 14, y, T, w[0]);
  p.hline(x + 2, y + 7, 12, w[2]).hline(x + 2, y + 15, 12, w[2]);
  p.rect(x + 14, y + 3, 1, 12, C.shadow);
}

/** Terrain char → painter + walkability. */
export const TERRAIN: Record<string, { paint: (c: TileCtx) => void; solid: boolean }> = {
  ".": { paint: grass, solid: false },
  ",": { paint: tallGrass, solid: false },
  ":": { paint: (c) => paintMaterial(c, PATH), solid: false },
  "o": { paint: (c) => paintMaterial(c, PLAZA), solid: false },
  "~": { paint: (c) => paintMaterial(c, WATER), solid: true },
  "*": { paint: flowers, solid: false },
  "#": { paint: fence, solid: true },
  "b": { paint: bush, solid: true },
  "r": { paint: rock, solid: true },
  "=": { paint: pier, solid: false },
  "L": { paint: ledge, solid: true },               // one-way: hop down from above (scene.ts)
  "T": { paint: grass, solid: true },               // trees are props drawn over grass
  "W": { paint: wallTile, solid: true },
  "_": { paint: floorTile, solid: false },
  "M": { paint: mat, solid: false },
  "X": { paint: voidTile, solid: true },
};

