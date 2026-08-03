// src/map.ts
// ─── Tiled JSON map loading: ground tiles, collisions, triggers ───

import type { KAPLAYCtx } from "kaplay";

interface TiledLayer {
  name:    string;
  type:    string;
  data?:   number[];
  width?:  number;
  height?: number;
  objects?: TiledObject[];
}

interface TiledObject {
  id:         number;
  name:       string;
  x:          number;
  y:          number;
  width:      number;
  height:     number;
  properties?: Array<{ name: string; value: string | number | boolean }>;
}

interface TiledMap {
  layers: TiledLayer[];
}

export function loadTiledMap(k: KAPLAYCtx, mapData: TiledMap): void {
  const TILE_SIZE = 16;

  mapData.layers.forEach(layer => {

    // ── Ground / Decor tile layers ──
    if (layer.type === "tilelayer" && layer.data && layer.width) {
      layer.data.forEach((tileId, index) => {
        if (tileId === 0) return; // empty tile
        const x = (index % layer.width!) * TILE_SIZE;
        const y = Math.floor(index / layer.width!) * TILE_SIZE;

        k.add([
          k.sprite("tileset", { frame: tileId - 1 }),
          k.pos(x, y),
          k.z(layer.name === "Decor" ? 1 : 0),
        ]);
      });
    }

    // ── Collision layer ──
    if (layer.name === "Collisions" && layer.objects) {
      layer.objects.forEach(obj => {
        k.add([
          k.rect(obj.width, obj.height),
          k.pos(obj.x, obj.y),
          k.area(),
          k.body({ isStatic: true }),
          k.opacity(0),
          "solid",
        ]);
      });
    }

    // ── Trigger / Object layer ──
    if (layer.name === "Objects" && layer.objects) {
      layer.objects.forEach(obj => {
        const props: Record<string, string | number | boolean> = {};
        obj.properties?.forEach(p => { props[p.name] = p.value; });

        k.add([
          k.rect(obj.width, obj.height),
          k.pos(obj.x, obj.y),
          k.area(),
          k.opacity(0),
          {
            triggerName:  obj.name,
            triggerProps: props,
          },
          "trigger",
        ]);
      });
    }
  });
}
