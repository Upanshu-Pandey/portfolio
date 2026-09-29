// src/art/props.ts
// ─── Multi-tile props: trees, buildings, town furniture, interior furniture ───
// Each prop has a tile footprint (`solid` rows: '#' blocked, '.' walkable, 'D' door/warp)
// and a drawing that may overhang the footprint by (ox, oy) pixels (e.g. tree canopies).

import { Pix, hash, clusters, ellipseShadow, shadeAt, drawText, textWidth, type RGBA } from "./pixel.ts";
import { RAMP, C, type Ramp } from "./palette.ts";

export interface PropArt {
  w: number;
  h: number;
  solid: string[];
  ox?: number;            // drawing offset from footprint origin (px, usually ≤ 0)
  oy?: number;
  draw: (frame: number) => Pix;
}

export interface PropOpts {
  glow?: Ramp;            // kiosk screens, banners
  item?: "cv" | "papers";
  label?: string;
}

const solid = (w: number, h: number, door?: [number, number]) =>
  Array.from({ length: h }, (_, y) =>
    Array.from({ length: w }, (_, x) => (door && door[0] === x && door[1] === y ? "D" : "#")).join(""));

// ── Nature ──────────────────────────────────────────────────────

/** Round-canopy tree, 36×40 drawn over a 2×2 footprint (canopy overhangs neighbours). */
function tree(): Pix {
  const p = new Pix(36, 40);
  ellipseShadow(p, 18, 36, 13, 3.5, C.shadow);
  const b = RAMP.bark;
  for (let y = 25; y < 37; y++) {
    const flare = y > 33 ? y - 33 : 0;
    for (let x = 15 - flare; x <= 20 + flare; x++) {
      const edge = x === 15 - flare || x === 20 + flare;
      const t = (x - (15 - flare)) / (5 + flare * 2);
      let c = edge ? b[0] : t < 0.3 ? b[3] : t < 0.7 ? b[2] : b[1];
      if (!edge && (y + x * 3) % 7 === 0) c = b[1];
      p.px(x, y, c);
    }
  }
  p.hline(12, 37, 12, b[0]);
  clusters(p, 0, 0, [
    { cx: 18, cy: 7, r: 7 },
    { cx: 11, cy: 11, r: 7.5 }, { cx: 25, cy: 11, r: 7.5 },
    { cx: 18, cy: 15, r: 10 },
    { cx: 7.5, cy: 19, r: 7 }, { cx: 28.5, cy: 19, r: 7 },
    { cx: 13, cy: 23, r: 7 }, { cx: 23, cy: 23, r: 7 },
  ], RAMP.leaf, { base: 1.1, gain: 3.1, speck: 0.05, seed: 3 });
  return p;
}

function fountain(frame: number): Pix {
  const p = new Pix(64, 48);
  const s = RAMP.stone, w = RAMP.water;
  ellipseShadow(p, 32, 42, 30, 5, C.shadow);
  const rim = (x: number, y: number, ex: number, ey: number, rr: number) => {
    const dx = Math.max(0, Math.abs(x - 31.5) - ex), dy = Math.max(0, Math.abs(y - 22) - ey);
    return Math.hypot(dx, dy) <= rr;
  };
  for (let y = 0; y < 48; y++)
    for (let x = 0; x < 64; x++) {
      if (!rim(x, y, 22, 11, 9)) continue;
      const inner = rim(x, y, 18, 7, 7);
      const edge = !rim(x - 1, y, 22, 11, 9) || !rim(x + 1, y, 22, 11, 9) || !rim(x, y + 1, 22, 11, 9) || !rim(x, y - 1, 22, 11, 9);
      if (inner) {
        const iedge = !rim(x, y - 1, 18, 7, 7) || !rim(x - 1, y, 18, 7, 7);
        if (iedge) { p.px(x, y, s[0]); continue; }
        const nearTop = !rim(x, y - 2, 18, 7, 7);
        let c = nearTop ? w[1] : w[2];
        if ((x * 3 + y * 5 + frame * 4) % 23 === 0) c = w[4];
        else if ((x + y * 2 + frame * 2) % 11 === 0) c = w[3];
        p.px(x, y, c);
        continue;
      }
      if (edge) { p.px(x, y, s[0]); continue; }
      p.px(x, y, y > 30 ? (y > 38 ? s[1] : s[2]) : (y < 6 || x < 6 ? s[4] : s[3]));
    }
  clusters(p, 0, 0, [{ cx: 32, cy: 22, r: 6 }], RAMP.stone, { base: 1.5 });
  p.rect(30, 12, 4, 10, s[3]).vline(30, 12, 10, s[4]).vline(33, 12, 10, s[1]).vline(29, 12, 10, s[0]).vline(34, 12, 10, s[0]);
  clusters(p, 0, 0, [{ cx: 32, cy: 11, r: 3.5 }], RAMP.stone, { base: 1.6 });
  const spray = [[32, 2], [31, 4], [33, 4], [29, 6], [35, 6], [27, 9], [37, 9], [26, 13], [38, 13], [26, 17], [38, 17]];
  spray.forEach(([sx, sy], i) => {
    if ((i + frame) % 3 !== 2) { p.px(sx!, sy!, w[4]); p.px(sx!, sy! + 1, w[3]); }
  });
  p.rect(31, 5, 2, 5, w[3]).vline(31, 5, 5, w[4]);
  return p;
}

const SIGN = [
  "000000000000000.",
  "0444444444444430",
  "0433333333333320",
  "0432222222223320",
  "0433333333333320",
  "0432222222333320",
  "0433333333333220",
  "0222222222222210",
  "0000000000000000",
  "......0320......",
  "......0320......",
  "......0320......",
  "......0210......",
  "....s000000s....",
];

function sign(): Pix {
  const p = new Pix(16, 16);
  const w = RAMP.wood;
  p.grid(SIGN, { "0": w[0], "1": w[1], "2": w[2], "3": w[3], "4": w[4], s: C.shadow }, 0, 1);
  return p;
}

function mailbox(): Pix {
  const p = new Pix(16, 16);
  const r = RAMP.red, w = RAMP.wood;
  ellipseShadow(p, 8, 15, 6, 1.5, C.shadow);
  p.rect(7, 8, 2, 7, w[2]).vline(6, 8, 7, w[0]).vline(9, 8, 7, w[0]);
  for (let y = 1; y < 10; y++)
    for (let x = 2; x < 14; x++) {
      const cut = y < 3 && (x < 2 + (3 - y) || x > 13 - (3 - y));
      if (cut) continue;
      const edge = x === 2 || x === 13 || y === 9 || y === 1 || (y < 3 && (x === 2 + (3 - y) || x === 13 - (3 - y)));
      p.px(x, y, edge ? r[0] : y < 4 ? r[4] : x < 5 ? r[3] : r[2]);
    }
  p.rect(12, 2, 2, 4, RAMP.yellow[3]).vline(13, 2, 4, RAMP.yellow[1]).px(12, 1, RAMP.yellow[0]).px(13, 1, RAMP.yellow[0]);
  p.hline(4, 7, 7, r[1]);
  return p;
}

function lamp(frame: number): Pix {
  const p = new Pix(16, 32);
  const m = RAMP.metal, y = RAMP.yellow;
  ellipseShadow(p, 8, 30, 5, 1.5, C.shadow);
  p.rect(6, 27, 5, 3, m[2]).hline(6, 27, 5, m[4]).box(5, 26, 7, 5, m[0]);
  p.rect(7, 9, 2, 18, m[2]).vline(7, 9, 18, m[3]).vline(6, 9, 18, m[0]).vline(9, 9, 18, m[0]);
  p.rect(4, 2, 8, 7, frame === 1 ? y[4] : y[3]).box(3, 1, 10, 9, m[0]).hline(4, 2, 8, y[4]);
  p.vline(7, 3, 5, m[1]).vline(8, 3, 5, m[1]);
  p.hline(3, 0, 10, m[0]).hline(4, 1, 8, m[2]);
  return p;
}

// ── Building kit ────────────────────────────────────────────────

type RoofStyle = "shingle" | "slate" | "corrugated";

function roof(p: Pix, x: number, y: number, w: number, h: number, ramp: Ramp, style: RoofStyle, inset = 3): void {
  for (let j = 0; j < h; j++) {
    const shrink = Math.floor(((h - 1 - j) / h) * inset);   // slight trapezoid: narrower at the ridge
    for (let i = shrink; i < w - shrink; i++) {
      const gx = x + i, gy = y + j;
      const light = 3.1 - (j / h) * 1.1;
      let v = light;
      if (style === "shingle") {
        const row = Math.floor(j / 5), ry = j % 5, sx = (i + (row % 2) * 4) % 8;
        if (ry === 0) v = light + 0.9;
        else if (ry === 4) v = 1;
        else if (sx === 7) v = light - 1;
        else if (sx === 6 && ry > 1) v = light - 0.4;
      } else if (style === "slate") {
        const row = Math.floor(j / 4), ry = j % 4, sx = (i + (row % 2) * 6) % 12;
        if (ry === 0) v = light + 0.8;
        else if (ry === 3 || sx === 11) v = light - 1.1;
      } else {
        const k = i % 4;
        v = k === 0 ? light + 0.9 : k === 1 ? light : k === 2 ? light - 0.5 : light - 1.4;
        if (j % 12 === 11) v = light - 1.2;
      }
      p.px(gx, gy, shadeAt(ramp, v, gx, gy));
    }
    p.px(x + shrink, y + j, ramp[0]).px(x + w - 1 - shrink, y + j, ramp[0]);
  }
  p.hline(x + inset, y, w - inset * 2, ramp[0]);
  p.hline(x + inset, y + 1, w - inset * 2, ramp[4]);
  p.hline(x, y + h - 3, w, ramp[1]);
  p.hline(x, y + h - 2, w, ramp[1]);
  p.hline(x, y + h - 1, w, ramp[0]);
}

function wall(p: Pix, x: number, y: number, w: number, h: number, ramp: Ramp, siding = true): void {
  for (let j = 0; j < h; j++)
    for (let i = 0; i < w; i++) {
      let c = ramp[3];
      if (siding && j % 4 === 3) c = ramp[2];
      if (i < 2) c = ramp[4];
      if (i > w - 3) c = ramp[2];
      p.px(x + i, y + j, c);
    }
  p.rect(x, y, w, 2, ramp[1]);
  p.vline(x, y, h, ramp[0]).vline(x + w - 1, y, h, ramp[0]);
}

function brickWall(p: Pix, x: number, y: number, w: number, h: number): void {
  const b = RAMP.brick;
  for (let j = 0; j < h; j++)
    for (let i = 0; i < w; i++) {
      const row = Math.floor(j / 4), bx = (i + (row % 2) * 4) % 8;
      let c = hash(Math.floor((i + (row % 2) * 4) / 8), row, 4) > 0.7 ? b[2] : b[3];
      if (j % 4 === 3 || bx === 7) c = b[1];
      else if (j % 4 === 0) c = b[4];
      p.px(x + i, y + j, c);
    }
  p.rect(x, y, w, 2, b[1]);
  p.vline(x, y, h, b[0]).vline(x + w - 1, y, h, b[0]);
}

function foundation(p: Pix, x: number, y: number, w: number): void {
  const s = RAMP.stone;
  p.hline(x, y, w, s[4]).rect(x, y + 1, w, 2, s[2]).hline(x, y + 3, w, s[0]);
  for (let i = 4; i < w; i += 8) p.vline(x + i, y + 1, 2, s[1]);
}

function windowPane(p: Pix, x: number, y: number, w: number, h: number, curtains?: Ramp): void {
  const g = RAMP.glass, f = RAMP.white;
  p.box(x, y, w, h, C.ink);
  p.box(x + 1, y + 1, w - 2, h - 2, f[4]);
  for (let j = 2; j < h - 2; j++)
    for (let i = 2; i < w - 2; i++) {
      const t = (j - 2) / (h - 4);
      let c = t < 0.3 ? g[3] : t < 0.7 ? g[2] : g[1];
      const d = (i + j) % 9;
      if (d === 0 || d === 1) c = g[4];
      p.px(x + i, y + j, c);
    }
  if (curtains) {
    for (let j = 2; j < Math.floor(h * 0.6); j++) {
      p.px(x + 2, y + j, curtains[3]).px(x + 3, y + j, curtains[2]);
      p.px(x + w - 3, y + j, curtains[3]).px(x + w - 4, y + j, curtains[2]);
    }
  }
  p.vline(x + (w >> 1), y + 2, h - 4, f[2]).hline(x + 2, y + (h >> 1), w - 4, f[2]);
  p.hline(x - 1, y + h, w + 2, f[4]).hline(x - 1, y + h + 1, w + 2, f[1]);
}

function glassDoor(p: Pix, x: number, y: number, h = 24): void {
  const m = RAMP.metal, g = RAMP.glass;
  p.rect(x, y, 16, h, m[2]).box(x, y, 16, h, C.ink).hline(x + 1, y + 1, 14, m[4]);
  for (const dx of [2, 9]) {
    p.rect(x + dx, y + 3, 5, h - 4, g[2]);
    p.rect(x + dx, y + 3, 5, 4, g[3]);
    p.vline(x + dx, y + 3, h - 4, g[4]);
    p.vline(x + dx + 4, y + 3, h - 4, g[1]);
  }
  p.vline(x + 7, y + 2, h - 2, C.ink).vline(x + 8, y + 2, h - 2, C.ink);
}

function woodDoor(p: Pix, x: number, y: number): void {
  const w = RAMP.wood;
  p.rect(x + 1, y, 14, 22, w[2]).box(x + 1, y, 14, 22, w[0]);
  p.hline(x + 2, y + 1, 12, w[4]).vline(x + 2, y + 1, 20, w[3]);
  for (const py of [3, 12]) {
    p.rect(x + 4, y + py, 8, 7, w[3]).box(x + 4, y + py, 8, 7, w[1]);
    p.hline(x + 5, y + py + 1, 6, w[4]);
  }
  p.px(x + 12, y + 11, RAMP.yellow[4]).px(x + 12, y + 12, RAMP.yellow[1]);
}

function plate(p: Pix, cx: number, y: number, text: string, bg: Ramp, fg: RGBA): void {
  const w = textWidth(text) + 8;
  const x = Math.round(cx - w / 2);
  p.rect(x, y, w, 11, bg[2]).box(x, y, w, 11, bg[0]).hline(x + 1, y + 1, w - 2, bg[4]).hline(x + 1, y + 9, w - 2, bg[1]);
  drawText(p, text, x + 4, y + 3, fg);
}

function flowerBox(p: Pix, x: number, y: number, w: number): void {
  const wd = RAMP.wood;
  p.rect(x, y + 3, w, 4, wd[2]).box(x, y + 3, w, 4, wd[0]).hline(x + 1, y + 4, w - 2, wd[3]);
  for (let i = 1; i < w - 1; i += 3) {
    p.px(x + i, y + 1, RAMP.leaf[3]).px(x + i + 1, y + 2, RAMP.leaf[2]);
    p.px(x + i, y, i % 2 ? RAMP.red[3] : RAMP.pink[3]);
  }
}

/** Upanshu's house: two-storey look, red shingle roof. 6×5 tiles, door at (2,4). */
function house(): Pix {
  const p = new Pix(96, 80);
  ellipseShadow(p, 48, 78, 46, 3, C.shadowSoft);
  roof(p, 0, 0, 96, 30, RAMP.roofRed, "shingle", 4);
  p.rect(70, 0, 10, 12, RAMP.brick[3]).box(70, 0, 10, 12, RAMP.brick[0]).hline(71, 1, 8, RAMP.brick[4]);
  wall(p, 3, 30, 90, 46, RAMP.cream);
  p.rect(3, 50, 90, 3, RAMP.roofRed[2]).hline(3, 50, 90, RAMP.roofRed[3]).hline(3, 53, 90, RAMP.roofRed[0]);
  windowPane(p, 12, 34, 16, 12, RAMP.pink);
  windowPane(p, 68, 34, 16, 12, RAMP.pink);
  windowPane(p, 62, 57, 18, 12, RAMP.yellow);
  flowerBox(p, 60, 69, 22);
  woodDoor(p, 32, 54);
  foundation(p, 3, 76, 90);
  return p;
}

/** Pine Research Lab: wide slate roof, vents, big windows. 9×6 tiles, door at (4,5). */
function lab(frame: number): Pix {
  const p = new Pix(144, 96);
  ellipseShadow(p, 72, 94, 70, 3, C.shadowSoft);
  roof(p, 0, 6, 144, 40, RAMP.roofSlate, "slate", 5);
  for (const vx of [20, 112]) {
    p.rect(vx, 8, 12, 10, RAMP.metal[3]).box(vx, 8, 12, 10, RAMP.metal[0]).hline(vx + 1, 9, 10, RAMP.metal[4]);
    for (let i = 0; i < 3; i++) p.hline(vx + 2, 11 + i * 2, 8, RAMP.metal[1]);
  }
  p.vline(72, 0, 12, RAMP.metal[0]).vline(73, 0, 12, RAMP.metal[3]);
  p.rect(71, 0, 4, 2, frame === 1 ? RAMP.red[4] : RAMP.red[2]);
  wall(p, 4, 46, 136, 46, RAMP.wall);
  for (const wx of [12, 36, 90, 114]) windowPane(p, wx, 54, 18, 14);
  plate(p, 72, 49, "LAB", RAMP.teal, RAMP.white[4]);
  glassDoor(p, 64, 66, 26);
  foundation(p, 4, 92, 136);
  return p;
}

/** Web Workshop: teal roof, glass storefront, neon </> sign. 7×5 tiles, door at (3,4). */
function webWorkshop(frame: number): Pix {
  const p = new Pix(112, 80);
  ellipseShadow(p, 56, 78, 54, 3, C.shadowSoft);
  roof(p, 0, 0, 112, 30, RAMP.roofTeal, "shingle", 4);
  wall(p, 4, 30, 104, 46, RAMP.cream);
  for (const wx of [10, 68]) {
    windowPane(p, wx, 50, 34, 18);
    p.rect(wx - 1, 46, 36, 3, RAMP.roofTeal[2]).hline(wx - 1, 46, 36, RAMP.roofTeal[4]).hline(wx - 1, 49, 36, RAMP.roofTeal[0]);
  }
  const nx = 36, ny = 33;
  p.rect(nx, ny, 40, 13, RAMP.navy[1]).box(nx, ny, 40, 13, C.ink).hline(nx + 1, ny + 1, 38, RAMP.navy[3]);
  const neon = frame === 2 ? RAMP.teal[3] : RAMP.teal[4];
  const glyph = [
    "..#.....#.#.....",
    ".#.....#...#....",
    "#.....#.....#...",
    ".#...#.....#....",
    "..#.#.....#.....",
  ];
  glyph.forEach((row, j) => [...row].forEach((c, i) => {
    if (c === "#") { p.px(nx + 13 + i, ny + 5 + j, RAMP.teal[1]); p.px(nx + 12 + i, ny + 4 + j, neon); }
  }));
  glassDoor(p, 48, 52, 24);
  foundation(p, 4, 76, 104);
  return p;
}

function gear(p: Pix, cx: number, cy: number, r: number, ramp: Ramp): void {
  for (let y = -r - 2; y <= r + 2; y++)
    for (let x = -r - 2; x <= r + 2; x++) {
      const d = Math.hypot(x, y), a = Math.atan2(y, x);
      const tooth = Math.cos(a * 8) > 0.4 ? 2 : 0;
      if (d > r + tooth || d < r * 0.35) continue;
      const lit = (-x - y) / (r * 1.5);
      const edge = d > r + tooth - 1 || d < r * 0.35 + 1;
      p.px(cx + x, cy + y, edge ? ramp[0] : shadeAt(ramp, 2.4 + lit, cx + x, cy + y));
    }
}

/** Systems Works: corrugated steel roof, brick walls, roller shutter, gear sign. 7×5, door at (3,4). */
function systemsWorks(frame: number): Pix {
  const p = new Pix(112, 80);
  ellipseShadow(p, 56, 78, 54, 3, C.shadowSoft);
  roof(p, 0, 4, 112, 26, RAMP.roofSteel, "corrugated", 3);
  for (const px of [18, 90]) {
    p.rect(px, 0, 6, 10, RAMP.metal[2]).box(px, 0, 6, 10, RAMP.metal[0]).vline(px + 1, 1, 8, RAMP.metal[4]);
  }
  if (frame === 1) p.px(20, 0, RAMP.white[4]).px(92, 0, RAMP.white[4]);
  brickWall(p, 4, 30, 104, 46);
  const m = RAMP.metal;
  p.rect(10, 46, 30, 30, m[3]).box(10, 45, 30, 31, C.ink);
  for (let j = 47; j < 75; j += 3) p.hline(11, j, 28, m[1]).hline(11, j + 1, 28, m[4]);
  p.rect(66, 38, 36, 28, RAMP.navy[1]).box(66, 38, 36, 28, C.ink).hline(67, 39, 34, RAMP.navy[3]);
  gear(p, 84, 52, 8, RAMP.yellow);
  glassDoor(p, 48, 52, 24);
  foundation(p, 4, 76, 104);
  return p;
}

// ── Interior furniture (3/4 view) ───────────────────────────────

function bookshelf(): Pix {
  const p = new Pix(16, 32);
  const w = RAMP.wood;
  p.rect(0, 30, 16, 2, C.shadow);
  p.rect(0, 0, 16, 30, w[2]).box(0, 0, 16, 30, w[0]).hline(1, 1, 14, w[4]).vline(1, 1, 28, w[3]);
  const spines = [RAMP.red, RAMP.navy, RAMP.yellow, RAMP.teal, RAMP.purple, RAMP.orange, RAMP.white, RAMP.pink];
  for (const sy of [3, 12, 21]) {
    p.rect(2, sy, 12, 8, w[0]);
    let x = 2, i = sy;
    while (x < 14) {
      const bw = 1 + (hash(x, sy, 9) > 0.5 ? 1 : 0);
      const bh = 6 + (hash(x, sy, 8) > 0.5 ? 1 : 0);
      const r = spines[i++ % spines.length]!;
      p.rect(x, sy + 8 - bh, bw, bh, r[3]).vline(x, sy + 8 - bh, bh, r[4]);
      if (bw > 1) p.vline(x + 1, sy + 8 - bh, bh, r[2]);
      p.px(x, sy + 8 - bh + 2, r[1]);
      x += bw;
    }
    p.hline(1, sy + 8, 14, w[3]).hline(1, sy + 9, 14, w[1]);
  }
  return p;
}

function pcDesk(frame: number): Pix {
  const p = new Pix(16, 32);
  const w = RAMP.wood, m = RAMP.metal, g = RAMP.glass;
  p.rect(0, 30, 16, 2, C.shadow);
  p.rect(0, 17, 16, 13, w[2]).box(0, 16, 16, 14, w[0]).hline(1, 17, 14, w[4]).hline(1, 18, 14, w[3]);
  p.rect(2, 21, 12, 3, w[1]).box(2, 21, 12, 3, w[0]).px(7, 22, RAMP.yellow[3]).px(8, 22, RAMP.yellow[3]);
  p.rect(1, 1, 14, 12, m[3]).box(1, 1, 14, 12, m[0]).hline(2, 2, 12, m[4]);
  p.rect(3, 3, 10, 8, g[1]);
  p.hline(4, 4, 6, frame === 1 ? g[4] : g[3]).hline(4, 6, 8, g[3]).hline(4, 8, 5, g[2]);
  p.rect(6, 13, 4, 3, m[2]).box(5, 13, 6, 3, m[0]);
  p.rect(3, 15, 10, 2, m[4]).hline(3, 16, 10, m[2]);
  return p;
}

function desk(opts: PropOpts, frame: number): Pix {
  const p = new Pix(32, 32);
  const w = RAMP.wood, m = RAMP.metal;
  ellipseShadow(p, 16, 29, 15, 2.5, C.shadow);
  p.rect(1, 8, 30, 12, w[3]).box(0, 7, 32, 14, w[0]).hline(1, 8, 30, w[4]).rect(1, 18, 30, 2, w[1]);
  p.rect(1, 20, 30, 6, w[2]).box(0, 20, 32, 7, w[0]).hline(1, 21, 30, w[3]);
  p.rect(3, 22, 8, 3, w[1]).box(3, 22, 8, 3, w[0]).rect(21, 22, 8, 3, w[1]).box(21, 22, 8, 3, w[0]);
  if (opts.item === "cv") {
    p.rect(4, 1, 13, 9, m[1]).box(4, 1, 13, 9, C.ink).rect(5, 2, 11, 7, RAMP.glass[1]);
    p.hline(6, 3, 6, RAMP.glass[4]).hline(6, 5, 8, RAMP.glass[3]).hline(6, 7, 4, RAMP.glass[3]);
    p.rect(3, 10, 15, 3, m[4]).box(3, 10, 15, 3, C.ink);
    p.rect(21, 6, 9, 11, RAMP.white[2]).rect(20, 5, 9, 11, RAMP.white[4]).box(20, 5, 9, 11, RAMP.white[0]);
    for (const ly of [7, 9, 11, 13]) p.hline(22, ly, ly === 7 ? 3 : 5, RAMP.white[1]);
    if (frame === 1) p.px(27, 6, RAMP.yellow[4]);
  } else if (opts.item === "papers") {
    p.rect(5, 9, 9, 7, RAMP.white[4]).box(5, 9, 9, 7, RAMP.white[0]).hline(7, 11, 5, RAMP.white[1]).hline(7, 13, 4, RAMP.white[1]);
    p.rect(18, 10, 9, 6, RAMP.white[3]).box(18, 10, 9, 6, RAMP.white[0]).hline(20, 12, 5, RAMP.white[1]);
    p.rect(14, 12, 3, 3, RAMP.yellow[3]);
  }
  return p;
}

function plant(): Pix {
  const p = new Pix(16, 32);
  const o = RAMP.orange;
  ellipseShadow(p, 8, 30, 6, 1.5, C.shadow);
  for (let y = 20; y < 30; y++) {
    const inset = Math.floor((y - 20) / 4);
    for (let x = 3 + inset; x < 13 - inset; x++) {
      const edge = x === 3 + inset || x === 12 - inset || y === 29;
      p.px(x, y, edge ? o[0] : x < 6 ? o[3] : x > 10 ? o[1] : o[2]);
    }
  }
  p.hline(3, 20, 10, o[4]).hline(3, 21, 10, o[0]);
  clusters(p, 0, 0, [
    { cx: 8, cy: 8, r: 5 }, { cx: 4.5, cy: 12, r: 4 }, { cx: 11.5, cy: 12, r: 4 }, { cx: 8, cy: 15, r: 5 }, { cx: 8, cy: 3.5, r: 3 },
  ], RAMP.leaf, { base: 1.4, speck: 0.08, seed: 17 });
  return p;
}

function serverRack(frame: number): Pix {
  const p = new Pix(16, 32);
  const m = RAMP.metal;
  p.rect(0, 30, 16, 2, C.shadow);
  p.rect(0, 0, 16, 30, m[1]).box(0, 0, 16, 30, C.ink).hline(1, 1, 14, m[3]).vline(1, 1, 28, m[2]);
  for (let u = 0; u < 6; u++) {
    const y = 3 + u * 4;
    p.rect(2, y, 12, 3, m[0]).hline(2, y, 12, m[2]);
    const on = (u + frame) % 3;
    p.px(11, y + 1, on === 0 ? RAMP.teal[4] : RAMP.teal[1]);
    p.px(12, y + 1, on === 1 ? RAMP.yellow[4] : RAMP.yellow[1]);
    for (let i = 3; i < 9; i += 2) p.px(i, y + 1, m[3]);
  }
  return p;
}

/** Project kiosk: glowing screen on a pedestal. */
function kiosk(opts: PropOpts, frame: number): Pix {
  const p = new Pix(16, 32);
  const m = RAMP.metal, g = opts.glow ?? RAMP.teal;
  ellipseShadow(p, 8, 30, 7, 1.5, C.shadow);
  p.rect(5, 16, 6, 12, m[2]).vline(5, 16, 12, m[3]).box(4, 16, 8, 12, C.ink);
  p.rect(2, 27, 12, 3, m[3]).box(2, 27, 12, 3, C.ink);
  p.rect(1, 1, 14, 15, m[1]).box(1, 1, 14, 15, C.ink).hline(2, 2, 12, m[3]);
  for (let j = 0; j < 10; j++)
    for (let i = 0; i < 10; i++) p.px(3 + i, 4 + j, j < 3 ? g[3] : j < 7 ? g[2] : g[1]);
  p.hline(3, 4 + ((frame * 4) % 10), 10, g[4]);
  p.rect(5, 6, 3, 3, RAMP.white[4]).hline(9, 7, 3, g[4]).hline(5, 11, 6, g[4]);
  return p;
}

function plinth(): Pix {
  const p = new Pix(16, 32);
  const s = RAMP.stone, y = RAMP.yellow;
  ellipseShadow(p, 8, 30, 7, 1.5, C.shadow);
  p.rect(2, 16, 12, 13, s[3]).box(2, 16, 12, 13, s[0]).vline(3, 17, 11, s[4]).vline(12, 17, 11, s[1]);
  p.rect(1, 14, 14, 3, s[4]).box(1, 14, 14, 3, s[0]);
  p.rect(1, 28, 14, 2, s[2]).box(1, 28, 14, 2, s[0]);
  p.rect(4, 20, 8, 5, y[2]).box(4, 20, 8, 5, y[0]).hline(5, 21, 6, y[4]);
  const star = ["..0..", ".040.", "04440", ".030.", "0.0.0"];
  p.grid(star, { "0": y[0], "3": y[2], "4": y[4] }, 5, 7);
  p.rect(6, 12, 4, 2, y[2]).box(5, 12, 6, 2, y[0]);
  return p;
}

function bed(): Pix {
  const p = new Pix(16, 32);
  const w = RAMP.wood, b = RAMP.navy, wh = RAMP.white;
  p.rect(0, 30, 16, 2, C.shadow);
  p.rect(0, 0, 16, 6, w[2]).box(0, 0, 16, 6, w[0]).hline(1, 1, 14, w[4]);
  p.rect(1, 6, 14, 23, wh[3]).box(0, 5, 16, 25, w[0]);
  p.rect(2, 7, 12, 6, wh[4]).box(2, 7, 12, 6, wh[1]);
  for (let y = 14; y < 29; y++) for (let x = 1; x < 15; x++) p.px(x, y, y === 14 ? b[4] : (x + y) % 6 === 0 ? b[2] : b[3]);
  p.hline(1, 28, 14, b[1]);
  return p;
}

function tv(frame: number): Pix {
  const p = new Pix(16, 32);
  const w = RAMP.wood, m = RAMP.metal;
  p.rect(0, 30, 16, 2, C.shadow);
  p.rect(0, 17, 16, 13, w[2]).box(0, 16, 16, 14, w[0]).hline(1, 17, 14, w[4]).rect(2, 21, 12, 6, w[1]).box(2, 21, 12, 6, w[0]);
  p.rect(1, 3, 14, 12, m[1]).box(1, 3, 14, 12, C.ink);
  const scr = frame === 2 ? RAMP.teal : RAMP.glass;
  p.rect(3, 5, 10, 8, scr[2]).hline(3, 5, 10, scr[3]).rect(4, 6, 3, 2, scr[4]);
  p.px(6, 1, C.ink).px(7, 2, C.ink).px(10, 1, C.ink).px(9, 2, C.ink);
  return p;
}

function sofa(): Pix {
  const p = new Pix(32, 32);
  const r = RAMP.teal;
  ellipseShadow(p, 16, 28, 15, 2.5, C.shadow);
  p.rect(2, 8, 28, 10, r[2]).box(2, 8, 28, 10, r[0]).hline(3, 9, 26, r[4]).hline(3, 10, 26, r[3]);
  p.rect(0, 12, 32, 13, r[3]).box(0, 12, 32, 13, r[0]);
  p.rect(4, 16, 11, 7, r[3]).box(4, 16, 11, 7, r[1]).rect(17, 16, 11, 7, r[3]).box(17, 16, 11, 7, r[1]);
  p.hline(5, 17, 9, r[4]).hline(18, 17, 9, r[4]);
  p.rect(0, 12, 4, 12, r[2]).rect(28, 12, 4, 12, r[1]).box(0, 12, 4, 12, r[0]).box(28, 12, 4, 12, r[0]);
  p.rect(2, 25, 3, 2, RAMP.wood[1]).rect(27, 25, 3, 2, RAMP.wood[1]);
  return p;
}

function fridge(): Pix {
  const p = new Pix(16, 32);
  const w = RAMP.white;
  p.rect(0, 30, 16, 2, C.shadow);
  p.rect(1, 0, 14, 30, w[3]).box(1, 0, 14, 30, w[0]).vline(2, 1, 28, w[4]).vline(13, 1, 28, w[2]);
  p.hline(2, 11, 12, w[1]).px(12, 5, RAMP.metal[1]).px(12, 6, RAMP.metal[1]).px(12, 15, RAMP.metal[1]).px(12, 16, RAMP.metal[1]);
  p.rect(4, 3, 4, 3, RAMP.yellow[3]).rect(7, 14, 3, 4, RAMP.red[3]);
  return p;
}

function diploma(): Pix {
  const p = new Pix(16, 16);
  const y = RAMP.yellow, wh = RAMP.white;
  p.rect(1, 3, 14, 12, y[2]).box(1, 3, 14, 12, y[0]).hline(2, 4, 12, y[4]).vline(2, 4, 10, y[3]);
  p.rect(4, 6, 8, 6, wh[4]).hline(5, 7, 6, wh[1]).hline(5, 9, 4, wh[1]);
  p.px(10, 10, RAMP.red[3]).px(11, 10, RAMP.red[3]).px(10, 11, RAMP.red[2]);
  return p;
}

function wallWindow(): Pix {
  const p = new Pix(16, 16);
  windowPane(p, 1, 3, 14, 10, RAMP.cream);
  return p;
}

function banner(opts: PropOpts): Pix {
  const p = new Pix(32, 16);
  const g = opts.glow ?? RAMP.navy;
  p.rect(1, 3, 30, 11, g[2]).box(0, 2, 32, 13, C.ink).hline(1, 3, 30, g[4]).hline(1, 13, 30, g[1]);
  if (opts.label) drawText(p, opts.label, 16 - Math.floor(textWidth(opts.label) / 2), 6, RAMP.white[4]);
  return p;
}

function rug(): Pix {
  const p = new Pix(48, 32);
  const r = RAMP.red, y = RAMP.yellow;
  p.rect(2, 2, 44, 28, r[2]).box(2, 2, 44, 28, r[0]).box(4, 4, 40, 24, y[3]).box(5, 5, 38, 22, r[1]);
  for (let j = 6; j < 26; j++) for (let i = 6; i < 42; i++) if ((Math.abs(i - 24) + Math.abs(j - 16)) % 6 === 0) p.px(i, j, r[3]);
  for (let i = 3; i < 46; i += 2) { p.px(i, 1, y[3]); p.px(i, 30, y[3]); }
  return p;
}

function counter(): Pix {
  const p = new Pix(32, 32);
  const w = RAMP.wood, s = RAMP.stone;
  p.rect(0, 30, 32, 2, C.shadow);
  p.rect(0, 10, 32, 5, s[3]).box(0, 10, 32, 5, s[0]).hline(1, 11, 30, s[4]);
  p.rect(0, 15, 32, 15, w[2]).box(0, 15, 32, 15, w[0]);
  for (const x of [2, 12, 22]) p.rect(x, 17, 8, 11, w[3]).box(x, 17, 8, 11, w[1]).px(x + 6, 22, RAMP.yellow[3]);
  p.rect(20, 4, 8, 6, RAMP.white[3]).box(20, 4, 8, 6, RAMP.white[0]).rect(21, 2, 3, 2, RAMP.metal[2]);
  return p;
}

// ── Registry ────────────────────────────────────────────────────

export function propArt(kind: string, opts: PropOpts = {}): PropArt {
  switch (kind) {
    case "tree":         return { w: 2, h: 2, solid: solid(2, 2), ox: -2, oy: -8, draw: tree };
    case "fountain":     return { w: 4, h: 3, solid: solid(4, 3), draw: fountain };
    case "sign":         return { w: 1, h: 1, solid: solid(1, 1), draw: sign };
    case "mailbox":      return { w: 1, h: 1, solid: solid(1, 1), draw: mailbox };
    case "lamp":         return { w: 1, h: 1, solid: solid(1, 1), oy: -16, draw: lamp };
    case "lab":          return { w: 9, h: 6, solid: solid(9, 6, [4, 5]), draw: lab };
    case "webWorkshop":  return { w: 7, h: 5, solid: solid(7, 5, [3, 4]), draw: webWorkshop };
    case "systemsWorks": return { w: 7, h: 5, solid: solid(7, 5, [3, 4]), draw: systemsWorks };
    case "house":        return { w: 6, h: 5, solid: solid(6, 5, [2, 4]), draw: house };
    case "bookshelf":    return { w: 1, h: 2, solid: solid(1, 2), draw: bookshelf };
    case "pc":           return { w: 1, h: 2, solid: solid(1, 2), draw: pcDesk };
    case "desk":         return { w: 2, h: 2, solid: solid(2, 2), draw: (f) => desk(opts, f) };
    case "plant":        return { w: 1, h: 2, solid: solid(1, 2), draw: plant };
    case "server":       return { w: 1, h: 2, solid: solid(1, 2), draw: serverRack };
    case "kiosk":        return { w: 1, h: 2, solid: solid(1, 2), draw: (f) => kiosk(opts, f) };
    case "plinth":       return { w: 1, h: 2, solid: solid(1, 2), draw: plinth };
    case "bed":          return { w: 1, h: 2, solid: solid(1, 2), draw: bed };
    case "tv":           return { w: 1, h: 2, solid: solid(1, 2), draw: tv };
    case "sofa":         return { w: 2, h: 2, solid: ["..", "##"], draw: sofa };
    case "fridge":       return { w: 1, h: 2, solid: solid(1, 2), draw: fridge };
    case "counter":      return { w: 2, h: 2, solid: ["..", "##"], draw: counter };
    case "diploma":      return { w: 1, h: 1, solid: ["#"], draw: diploma };
    case "window":       return { w: 1, h: 1, solid: ["#"], draw: wallWindow };
    case "banner":       return { w: 2, h: 1, solid: ["##"], draw: () => banner(opts) };
    case "rug":          return { w: 3, h: 2, solid: ["...", "..."], draw: rug };
    default: throw new Error(`Unknown prop: ${kind}`);
  }
}
