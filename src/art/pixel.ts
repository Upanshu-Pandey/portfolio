// src/art/pixel.ts
// ─── Tiny DOM-free pixel buffer used to author all game art in code ───
// Everything is drawn into RGBA buffers, then converted to <canvas> for KAPLAY.
// Being DOM-free also lets `scripts/preview-art.ts` render the art to PNG in Node.

export type RGBA = readonly [number, number, number, number];

export function hex(h: string, a = 255): RGBA {
  const n = parseInt(h.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255, a];
}

export const CLEAR: RGBA = [0, 0, 0, 0];

/** Deterministic hash → [0,1) used for texture noise (same map = same pixels). */
export function hash(x: number, y: number, seed = 0): number {
  let h = (x * 374761393 + y * 668265263 + seed * 2246822519) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

export class Pix {
  readonly w: number;
  readonly h: number;
  readonly data: Uint8ClampedArray<ArrayBuffer>;

  constructor(w: number, h: number) {
    this.w = w;
    this.h = h;
    this.data = new Uint8ClampedArray(w * h * 4);
  }

  get(x: number, y: number): RGBA {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return CLEAR;
    const i = (y * this.w + x) * 4;
    const d = this.data;
    return [d[i]!, d[i + 1]!, d[i + 2]!, d[i + 3]!];
  }

  /** Set a pixel; semi-transparent colours are alpha-blended over what's there. */
  px(x: number, y: number, c: RGBA): this {
    x |= 0; y |= 0;
    if (x < 0 || y < 0 || x >= this.w || y >= this.h || c[3] === 0) return this;
    const i = (y * this.w + x) * 4;
    const d = this.data;
    if (c[3] === 255 || d[i + 3] === 0) {
      d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = c[3];
      return this;
    }
    const a = c[3] / 255;
    d[i]     = c[0] * a + d[i]!     * (1 - a);
    d[i + 1] = c[1] * a + d[i + 1]! * (1 - a);
    d[i + 2] = c[2] * a + d[i + 2]! * (1 - a);
    d[i + 3] = Math.max(d[i + 3]!, c[3]);
    return this;
  }

  rect(x: number, y: number, w: number, h: number, c: RGBA): this {
    for (let yy = y; yy < y + h; yy++)
      for (let xx = x; xx < x + w; xx++) this.px(xx, yy, c);
    return this;
  }

  hline(x: number, y: number, w: number, c: RGBA): this { return this.rect(x, y, w, 1, c); }
  vline(x: number, y: number, h: number, c: RGBA): this { return this.rect(x, y, 1, h, c); }

  /** Rectangle outline. */
  box(x: number, y: number, w: number, h: number, c: RGBA): this {
    this.hline(x, y, w, c).hline(x, y + h - 1, w, c);
    return this.vline(x, y, h, c).vline(x + w - 1, y, h, c);
  }

  /**
   * Paint an ASCII grid. Each character maps to a colour in `pal`;
   * '.' and ' ' (or any unmapped char) are transparent.
   */
  grid(rows: readonly string[], pal: Record<string, RGBA>, ox = 0, oy = 0, flipX = false): this {
    rows.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) {
        const c = pal[row[x]!];
        if (c) this.px(ox + (flipX ? row.length - 1 - x : x), oy + y, c);
      }
    });
    return this;
  }

  /** Copy another buffer onto this one (alpha-aware). */
  blit(src: Pix, ox: number, oy: number, flipX = false): this {
    for (let y = 0; y < src.h; y++)
      for (let x = 0; x < src.w; x++) {
        const c = src.get(x, y);
        if (c[3]) this.px(ox + (flipX ? src.w - 1 - x : x), oy + y, c);
      }
    return this;
  }

  /**
   * Fill a shape given by `inside(x,y)` with automatic outline + top-left lighting.
   * ramp = [outline, dark, mid, light]. `tex` can override colours for texture.
   */
  shape(
    x0: number, y0: number, w: number, h: number,
    inside: (x: number, y: number) => boolean,
    ramp: readonly [RGBA, RGBA, RGBA, RGBA],
    tex?: (x: number, y: number, base: RGBA) => RGBA,
  ): this {
    const isIn = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h && inside(x, y);
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        if (!isIn(x, y)) continue;
        let c: RGBA;
        if (!isIn(x - 1, y) || !isIn(x + 1, y) || !isIn(x, y - 1) || !isIn(x, y + 1)) c = ramp[0];
        else if (!isIn(x - 1, y - 2) || !isIn(x - 2, y - 1)) c = ramp[3];
        else if (!isIn(x + 2, y + 1) || !isIn(x + 1, y + 2) || !isIn(x, y + 3)) c = ramp[1];
        else c = ramp[2];
        if (tex) c = tex(x, y, c);
        this.px(x0 + x, y0 + y, c);
      }
    return this;
  }

  /** Copy a sub-rectangle into a new buffer. */
  crop(x: number, y: number, w: number, h: number): Pix {
    const out = new Pix(w, h);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const c = this.get(x + i, y + j);
      if (c[3]) out.px(i, j, c);
    }
    return out;
  }

  /** Stack frames horizontally into one sheet. */
  static row(frames: Pix[]): Pix {
    const w = frames[0]!.w, h = frames[0]!.h;
    const out = new Pix(w * frames.length, h);
    frames.forEach((f, i) => out.blit(f, i * w, 0));
    return out;
  }

  /** Stack frames vertically into one sheet. */
  static col(frames: Pix[]): Pix {
    const w = frames[0]!.w, h = frames[0]!.h;
    const out = new Pix(w, h * frames.length);
    frames.forEach((f, i) => out.blit(f, 0, i * h));
    return out;
  }
}

// ── 3×5 pixel font for plates on buildings ("LAB", "WEB"…) ──
const FONT: Record<string, string> = {
  A: "010101111101101", B: "110101110101110", C: "011100100100011", D: "110101101101110",
  E: "111100110100111", F: "111100110100100", G: "011100101101011", H: "101101111101101",
  I: "111010010010111", J: "001001001101010", K: "101101110101101", L: "100100100100111",
  M: "101111111101101", N: "110101101101101", O: "010101101101010", P: "110101110100100",
  Q: "010101101110011", R: "110101110101101", S: "011100010001110", T: "111010010010010",
  U: "101101101101111", V: "101101101101010", W: "101101111111101", X: "101101010101101",
  Y: "101101010010010", Z: "111001010100111", "1": "010110010010111", "2": "110001010100111",
  " ": "000000000000000", "-": "000000111000000", ".": "000000000000010", "!": "010010010000010",
};

export function textWidth(s: string): number {
  return s.length * 4 - 1;
}

export function drawText(p: Pix, s: string, x: number, y: number, c: RGBA): void {
  [...s.toUpperCase()].forEach((ch, i) => {
    const g = FONT[ch] ?? FONT[" "]!;
    for (let j = 0; j < 15; j++)
      if (g[j] === "1") p.px(x + i * 4 + (j % 3), y + Math.floor(j / 3), c);
  });
}

// ── Shading helpers ────────────────────────────────────────────

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

/** Ordered-dither threshold in [0,1) for a pixel. */
export function bayer(x: number, y: number): number {
  return BAYER[(y & 3) * 4 + (x & 3)]! / 16;
}

/**
 * Pick a ramp colour for a continuous shade value v (0..4).
 * Values near a band boundary get a light checker dither, like GBA-era shading.
 */
export function shadeAt(ramp: readonly RGBA[], v: number, x: number, y: number): RGBA {
  const cv = Math.max(0, Math.min(ramp.length - 1, v));
  const i = Math.floor(cv);
  const f = cv - i;
  if (i >= ramp.length - 1) return ramp[ramp.length - 1]!;
  const up = f > 0.66 || (f > 0.4 && (x + y) % 2 === 0);
  return ramp[up ? i + 1 : i]!;
}

export interface Sphere { cx: number; cy: number; r: number; z?: number }

/**
 * Render overlapping lit spheres (foliage clusters, rounded stone…).
 * Front-most cluster wins per pixel; cluster seams and the silhouette get darker rims.
 */
export function clusters(
  p: Pix, ox: number, oy: number, list: Sphere[], ramp: readonly RGBA[],
  opts: { base?: number; gain?: number; speck?: number; seed?: number } = {},
): void {
  const base = opts.base ?? 1.2, gain = opts.gain ?? 2.9;
  const L = [-0.55, -0.72, 0.42];
  const n = Math.hypot(L[0]!, L[1]!, L[2]!);
  const lx = L[0]! / n, ly = L[1]! / n, lz = L[2]! / n;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const s of list) {
    minX = Math.min(minX, s.cx - s.r); maxX = Math.max(maxX, s.cx + s.r);
    minY = Math.min(minY, s.cy - s.r); maxY = Math.max(maxY, s.cy + s.r);
  }
  const owner = (x: number, y: number): number => {
    let best = -1, bestZ = -Infinity;
    list.forEach((s, i) => {
      const dx = (x + 0.5 - s.cx) / s.r, dy = (y + 0.5 - s.cy) / s.r;
      const d = dx * dx + dy * dy;
      if (d > 1) return;
      const z = Math.sqrt(1 - d) * s.r + (s.z ?? s.cy * 0.35);
      if (z > bestZ) { bestZ = z; best = i; }
    });
    return best;
  };
  const W = Math.ceil(maxX) - Math.floor(minX) + 2, H = Math.ceil(maxY) - Math.floor(minY) + 2;
  const x0 = Math.floor(minX) - 1, y0 = Math.floor(minY) - 1;
  const own: number[] = new Array(W * H).fill(-1);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) own[y * W + x] = owner(x + x0, y + y0);
  const at = (x: number, y: number) => (x < 0 || y < 0 || x >= W || y >= H ? -1 : own[y * W + x]!);

  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const i = at(x, y);
      if (i < 0) continue;
      const gx = x + x0, gy = y + y0;
      let c: RGBA;
      if (at(x - 1, y) < 0 || at(x + 1, y) < 0 || at(x, y - 1) < 0 || at(x, y + 1) < 0) c = ramp[0]!;
      else if (at(x, y + 1) !== i && at(x, y + 1) >= 0 && list[at(x, y + 1)]!.cy > list[i]!.cy) c = ramp[1]!;  // seam over a front cluster
      else {
        const s = list[i]!;
        const dx = (gx + 0.5 - s.cx) / s.r, dy = (gy + 0.5 - s.cy) / s.r;
        const dz = Math.sqrt(Math.max(0, 1 - dx * dx - dy * dy));
        const lit = dx * lx + dy * ly + dz * lz;
        let v = base + lit * gain;
        if (opts.speck && hash(gx, gy, opts.seed ?? 0) < opts.speck) v += 1;
        c = shadeAt(ramp, v, gx, gy);
      }
      p.px(ox + gx, oy + gy, c);
    }
}

/** Soft elliptical drop shadow. */
export function ellipseShadow(p: Pix, cx: number, cy: number, rx: number, ry: number, c: RGBA): void {
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++)
      if (((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2 <= 1) p.px(x, y, c);
}
