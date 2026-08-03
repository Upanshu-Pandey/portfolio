---
name: kaplay-rpg-loader
description: Guidelines and code patterns for loading Tiled/LDtk JSON maps, setting up 4-way WASD character movement, tile collisions, and trigger zones in KAPLAY.js. Use when building game loop code.
---

# KAPLAY.js 2D RPG Loader Skill

When asked to generate or modify 2D overworld game code, follow these exact KAPLAY.js patterns:

## 1. Engine Initialization & Asset Loading
```typescript
import kaplay from "kaplay";

const k = kaplay({
  global: false,
  width: 640,
  height: 360,
  scale: 2,
  letterbox: true,
  background: [30, 30, 40],
});

// Load sprite sheet with 4-direction animations
k.loadSprite("player", "/assets/sprites/player.png", {
  sliceX: 4,
  sliceY: 4,
  anims: {
    "idle-down": 0,
    "walk-down": { from: 0, to: 3, loop: true, speed: 8 },
    "idle-up": 4,
    "walk-up": { from: 4, to: 7, loop: true, speed: 8 },
    "idle-left": 8,
    "walk-left": { from: 8, to: 11, loop: true, speed: 8 },
    "idle-right": 12,
    "walk-right": { from: 12, to: 15, loop: true, speed: 8 },
  },
});

// Load Tiled JSON map and tileset
k.loadSpriteAtlas("/assets/tilesets/town.png", { /* atlas config */ });
```

## 2. Map Loading from Tiled JSON
```typescript
// In src/map.ts
export function loadMap(k: KAPLAYCtx, mapData: TiledMap) {
  const TILE_SIZE = 16;

  mapData.layers.forEach((layer) => {
    if (layer.name === "Ground" || layer.name === "Decor") {
      layer.data.forEach((tileId, index) => {
        if (tileId === 0) return;
        const x = (index % layer.width) * TILE_SIZE;
        const y = Math.floor(index / layer.width) * TILE_SIZE;
        k.add([k.sprite("tileset", { frame: tileId - 1 }), k.pos(x, y), k.z(0)]);
      });
    }

    if (layer.name === "Collisions") {
      layer.objects?.forEach((obj) => {
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

    if (layer.name === "Objects") {
      layer.objects?.forEach((obj) => {
        k.add([
          k.rect(obj.width, obj.height),
          k.pos(obj.x, obj.y),
          k.area(),
          k.opacity(0),
          { triggerName: obj.name, triggerProps: obj.properties },
          "trigger",
        ]);
      });
    }
  });
}
```

## 3. Player Movement & Collision
```typescript
// In src/player.ts
export function spawnPlayer(k: KAPLAYCtx, spawnPos: Vec2) {
  const SPEED = 80;

  const player = k.add([
    k.sprite("player", { anim: "idle-down" }),
    k.pos(spawnPos),
    k.area({ shape: new k.Rect(k.vec2(0, 8), 14, 8) }), // Feet hitbox only
    k.body(),
    k.anchor("center"),
    k.z(10),
    "player",
  ]);

  k.onUpdate(() => {
    const vel = k.vec2(0, 0);
    if (k.isKeyDown("left") || k.isKeyDown("a")) { vel.x = -SPEED; player.play("walk-left"); }
    else if (k.isKeyDown("right") || k.isKeyDown("d")) { vel.x = SPEED; player.play("walk-right"); }
    else if (k.isKeyDown("up") || k.isKeyDown("w")) { vel.y = -SPEED; player.play("walk-up"); }
    else if (k.isKeyDown("down") || k.isKeyDown("s")) { vel.y = SPEED; player.play("walk-down"); }
    else { player.play(player.getCurAnim()?.name.replace("walk", "idle") ?? "idle-down"); }
    player.move(vel);
    k.camPos(player.pos);
  });

  return player;
}
```

## 4. Trigger Zone Interaction
```typescript
k.onKeyPress("space", () => {
  const player = k.get("player")[0];
  const nearbyTriggers = k.get("trigger").filter(
    (t) => t.pos.dist(player.pos) < 24
  );
  if (nearbyTriggers.length > 0) {
    const trigger = nearbyTriggers[0];
    showDialogue(trigger.triggerName, trigger.triggerProps);
  }
});
```

## Key Rules
- Always keep tile collisions **static bodies** so the player doesn't push them.
- Use a **feet-only hitbox** (bottom 8px of the sprite) for natural depth illusion.
- Emit a DOM custom event (`window.dispatchEvent(new CustomEvent(...))`) to bridge KAPLAY triggers → HTML UI overlays.
- Store zone spawn coordinates in a `ZONES` constant for Pokédex fast-travel teleportation.

## 📚 External References
See `references/RESOURCES.md` in this skill folder for:
- Curated GitHub repos to study (chriscourses/pokemon-style-game, KAPLAY official examples, GreNxNja/Game_Folio)
- KAPLAY API quick reference table
- Free sprite & tileset sources (Kenney.nl, LPC Character Generator, OpenGameArt)
- Pixel art editing tools (LibreSprite, Piskel, Free Texture Packer)
- Audio tools (BeepBox, ChipTone, Freesound)
