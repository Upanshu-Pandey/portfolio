// scripts/process-sprite.mjs
// Removes magenta background from spritesheet using sharp + raw pixel processing
// Usage: node scripts/process-sprite.mjs

import sharp from "sharp";
import { writeFileSync } from "fs";

const SRC = "public/assets/sprites/player_source.png";
const OUT = "public/assets/sprites/player.png";

console.log("Loading spritesheet...");

// Get raw pixel data from the source image
const { data, info } = await sharp(SRC)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height, channels } = info;
console.log(`Image: ${width}x${height}, ${channels} channels`);

let transparentPixels = 0;
const buf = Buffer.from(data);

for (let i = 0; i < buf.length; i += channels) {
  const r = buf[i];
  const g = buf[i + 1];
  const b = buf[i + 2];

  // Detect magenta/pink background pixels
  // Magenta from generation: high R, very low G, high B
  const isMagenta = r > 160 && g < 120 && b > 140 && r + b > g * 4;

  if (isMagenta) {
    buf[i + 3] = 0; // fully transparent
    transparentPixels++;
  }
}

console.log(`Made ${transparentPixels.toLocaleString()} pixels transparent`);

// Write back as PNG with alpha
await sharp(buf, {
  raw: { width, height, channels },
})
  .png()
  .toFile(OUT);

console.log(`Saved transparent sprite to ${OUT}`);
