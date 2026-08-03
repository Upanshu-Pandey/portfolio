// scripts/process-assets.mjs
import sharp from "sharp";
import { readdirSync, existsSync, mkdirSync } from "fs";
import path from "path";

const ART_DIR = "C:\\Users\\Upanshu\\.gemini\\antigravity-cli\\brain\\4773d595-8b92-4acd-981c-4ed7b96247b4";
const OUT_DIR = "public/assets/sprites";

if (!existsSync(OUT_DIR)) {
  mkdirSync(OUT_DIR, { recursive: true });
}

const files = readdirSync(ART_DIR);

function findLatest(prefix) {
  const matching = files.filter(f => f.startsWith(prefix) && (f.endsWith(".jpg") || f.endsWith(".png")));
  matching.sort();
  return matching.length > 0 ? path.join(ART_DIR, matching[matching.length - 1]) : null;
}

async function removeBackgroundAndSave(inputPath, outputPath) {
  if (!inputPath || !existsSync(inputPath)) {
    console.error(`Input file not found for ${outputPath}`);
    return;
  }
  console.log(`Processing ${path.basename(inputPath)} -> ${outputPath}`);

  const image = sharp(inputPath);
  const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const buf = Buffer.from(data);

  let transparentPixels = 0;
  for (let i = 0; i < buf.length; i += channels) {
    const r = buf[i];
    const g = buf[i + 1];
    const b = buf[i + 2];

    const isMagenta = (r > 140 && g < 130 && b > 130 && (r + b) > g * 2.5);
    const isNearWhite = (r > 240 && g > 240 && b > 240);

    if (isMagenta || isNearWhite) {
      buf[i + 3] = 0;
      transparentPixels++;
    }
  }

  let processed = sharp(buf, { raw: { width, height, channels } }).trim();
  await processed.png().toFile(outputPath);
  console.log(`Saved ${outputPath} (cleared ${transparentPixels} bg pixels)`);
}

async function run() {
  await removeBackgroundAndSave(findLatest("pokemon_npc_guide"), path.join(OUT_DIR, "npc_guide.png"));
  await removeBackgroundAndSave(findLatest("pokemon_trees_tileset"), path.join(OUT_DIR, "tree_oak.png"));
  await removeBackgroundAndSave(findLatest("prof_lab_building"), path.join(OUT_DIR, "prof_lab.png"));
  await removeBackgroundAndSave(findLatest("frontend_gym_building"), path.join(OUT_DIR, "gym_frontend.png"));
  await removeBackgroundAndSave(findLatest("systems_gym_building"), path.join(OUT_DIR, "gym_systems.png"));
  await removeBackgroundAndSave(findLatest("pokemon_fountain"), path.join(OUT_DIR, "fountain.png"));
  await removeBackgroundAndSave(findLatest("pokemon_props"), path.join(OUT_DIR, "signpost.png"));
}

run().catch(console.error);
