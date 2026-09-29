// src/art/index.ts
// ─── Bake all code-authored art into KAPLAY sprites at boot ───

import type { KAPLAYCtx } from "kaplay";
import { Pix } from "./pixel.ts";
import { buildCharacter, actorShadow, OUTFITS, CHAR_W, CHAR_H } from "./characters.ts";
import { tallGrassOverlay } from "./tiles.ts";
import { renderMap, FRAMES, type BuiltMap } from "../world/tilemap.ts";
import { MAPS } from "../world/maps/index.ts";
import type { MapId } from "../world/types.ts";

function toCanvas(p: Pix): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = p.w;
  c.height = p.h;
  c.getContext("2d")!.putImageData(new ImageData(p.data, p.w, p.h), 0, 0);
  return c;
}

const built = new Map<MapId, BuiltMap>();

export function getMap(id: MapId): BuiltMap {
  return built.get(id)!;
}

export function loadArt(k: KAPLAYCtx): void {
  for (const [name, outfit] of Object.entries(OUTFITS)) {
    const sheet = buildCharacter(outfit);
    k.loadSprite(`char-${name}`, toCanvas(sheet), { sliceX: 12 });
    if (name === "player") {
      // front-facing frame doubles as the résumé portrait
      const portrait = new Pix(CHAR_W, CHAR_H).blit(sheet, 0, 0);
      document.documentElement.style.setProperty("--portrait", `url(${toCanvas(portrait).toDataURL()})`);
    }
  }

  k.loadSprite("grass-over", toCanvas(tallGrassOverlay()));
  k.loadSprite("shadow", toCanvas(actorShadow()));

  for (const map of Object.values(MAPS)) {
    const b = renderMap(map);
    built.set(map.id, b);
    k.loadSprite(`map-${map.id}`, toCanvas(Pix.col(b.frames)), { sliceY: FRAMES });
    k.loadSprite(`over-${map.id}`, toCanvas(Pix.col(b.over)), { sliceY: FRAMES });
  }
}
