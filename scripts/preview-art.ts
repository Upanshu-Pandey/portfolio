// scripts/preview-art.ts
// ─── Render the code-authored art to PNGs for quick visual review ───
// Usage: npm run art:preview  → writes ./art-preview/*.png (git-ignored)
// Node ≥ 22.18 runs this TypeScript file directly (type stripping), no build step.

import { mkdirSync, writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";
import { Pix } from "../src/art/pixel.ts";
import { buildCharacter, OUTFITS } from "../src/art/characters.ts";
import { renderMap } from "../src/world/tilemap.ts";
import { MAPS } from "../src/world/maps/index.ts";

const OUT = "art-preview";
const SCALE = 3;

function crc32(buf: Uint8Array): number {
  let c = ~0;
  for (const b of buf) {
    c ^= b;
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type: string, data: Uint8Array): Buffer {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}

function png(p: Pix, scale = SCALE): Buffer {
  const w = p.w * scale, h = p.h * scale;
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0;
    for (let x = 0; x < w; x++) {
      const c = p.get(Math.floor(x / scale), Math.floor(y / scale));
      // checkerboard behind transparent pixels
      const bg = ((x >> 3) + (y >> 3)) % 2 ? 200 : 230;
      const a = c[3] / 255;
      const o = y * (w * 4 + 1) + 1 + x * 4;
      raw[o] = c[0] * a + bg * (1 - a);
      raw[o + 1] = c[1] * a + bg * (1 - a);
      raw[o + 2] = c[2] * a + bg * (1 - a);
      raw[o + 3] = 255;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", new Uint8Array()),
  ]);
}

mkdirSync(OUT, { recursive: true });

const cast = Pix.col(Object.values(OUTFITS).map(buildCharacter));
writeFileSync(`${OUT}/characters.png`, png(cast, 4));

// usage: preview-art.ts [mapId] [tx ty tw th] [scale]  → optional crop in tiles (map coords)
const [only, ...rest] = process.argv.slice(2);
const crop = rest.slice(0, 4).map(Number);
for (const map of Object.values(MAPS)) {
  if (only && map.id !== only) continue;
  const { frames, margin } = renderMap(map);
  writeFileSync(`${OUT}/map-${map.id}.png`, png(frames[0]!, 2));
  if (crop.length === 4) {
    const [tx, ty, tw, th] = crop as [number, number, number, number];
    const c = new Pix(tw * 16, th * 16);
    c.blit(frames[0]!, -(tx + margin) * 16, -(ty + margin) * 16);
    writeFileSync(`${OUT}/crop.png`, png(c, Number(rest[4] ?? 4)));
  }
}
console.log(`wrote ${OUT}/`);
