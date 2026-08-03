# Reference Resources — KAPLAY RPG Loader

Curated external references for implementing KAPLAY.js game engine features.
All URLs verified and confirmed working.

---

## 📦 Open-Source Code Repositories

### chriscourses/pokemon-style-game
- **URL:** https://github.com/chriscourses/pokemon-style-game
- **Use for:** Clean vanilla JS & Canvas implementation of Gen 3 Pokémon mechanics.
- **Key patterns to borrow:**
  - Grid-based movement (snap-to-tile) vs. free-floating movement
  - Battle encounter transition overlays (black flash + scene switch)
  - Collision map encoded as a flat 2D array (0 = walkable, 1 = solid)
  - Dialogue box that pauses player movement while text is rendering

### GreNxNja/Game_Folio
- **URL:** https://github.com/GreNxNja/Game_Folio
- **Use for:** Open-source 2D RPG portfolio template (Vite + JS). Study how HTML modals are triggered from canvas events.
- **Key patterns:**
  - `window.dispatchEvent(new CustomEvent(...))` bridge from canvas → DOM
  - Zone-based modal rendering keyed by object name from Tiled
  - Project data stored as plain JS objects, rendered into modal innerHTML

### JSLegendDev — GitHub Profile
- **URL:** https://github.com/JSLegendDev
- **YouTube:** https://www.youtube.com/@JSLegendDev
- **Use for:** KAPLAY.js / Kaboom.js tutorials — RPG map loading, dialogue handlers, collision boundaries.
- **Confirmed repos on profile:**
  - `Duck-Hunt-KAPLAY` — A partial recreation of Duck Hunt using the KAPLAY library (confirmed live)
  - Search profile for "kaplay" or "kaboom" for additional RPG examples
- **Key YouTube content to watch:**
  - "Build a 2D RPG Game with Kaboom.js" — covers `loadSpriteAtlas`, trigger zones, dialogue
  - Tiled JSON loading patterns for top-down games

### KAPLAY Official Examples
- **URL:** https://github.com/kaplayjs/kaplay/tree/master/examples
- **Branch:** `master` (not `main` — the `/main/` URL returns 404)
- **Use for:** Official snippets covering sprite animations, camera, scenes, collisions, and more.
- **🌟 Critical examples to study for this project** (all confirmed in the `examples/` directory):

| File | Direct URL | What It Covers |
|---|---|---|
| `rpg.js` | https://github.com/kaplayjs/kaplay/blob/master/examples/rpg.js | Top-down RPG movement — most relevant |
| `tiled.js` | https://github.com/kaplayjs/kaplay/blob/master/examples/tiled.js | Tiled JSON map loading |
| `movement.js` | https://github.com/kaplayjs/kaplay/blob/master/examples/movement.js | Player movement patterns |
| `camera.js` | https://github.com/kaplayjs/kaplay/blob/master/examples/camera.js | `camPos()`, camera tracking |
| `spriteAnim.js` | https://github.com/kaplayjs/kaplay/blob/master/examples/spriteAnim.js | Named sprite animations |
| `spriteatlas.js` | https://github.com/kaplayjs/kaplay/blob/master/examples/spriteatlas.js | Sprite atlas loading |
| `scenes.js` | https://github.com/kaplayjs/kaplay/blob/master/examples/scenes.js | `scene()` and `go()` scene switching |
| `collision.js` | https://github.com/kaplayjs/kaplay/blob/master/examples/collision.js | `area()` + `body()` collisions |
| `audio.js` | https://github.com/kaplayjs/kaplay/blob/master/examples/audio.js | `loadSound()`, `play()` |
| `pauseMenu.js` | https://github.com/kaplayjs/kaplay/blob/master/examples/pauseMenu.js | Pause/resume pattern |
| `patrol.js` | https://github.com/kaplayjs/kaplay/blob/master/examples/patrol.js | NPC patrol movement |
| `button.js` | https://github.com/kaplayjs/kaplay/blob/master/examples/button.js | Virtual buttons (for mobile D-Pad) |
| `vn.js` | https://github.com/kaplayjs/kaplay/blob/master/examples/vn.js | Visual novel dialogue system |

---

## 🗺️ Map Editor

### Tiled Map Editor
- **URL:** https://www.mapeditor.org/
- **Docs:** https://doc.mapeditor.org/en/stable/
- **Use for:** Visually paint terrain layers, define collision zones, place trigger objects.
- **Key Tiled concepts:**
  - **Tile Layers** → Ground, Decor (exported as `data` flat arrays)
  - **Object Layers** → Invisible trigger rectangles with `name` and custom `properties`
  - **Custom Properties** → Add `dialogueText`, `modalType`, `zoneName` to trigger objects
- **Export setting:**
  ```
  File → Export As → JSON map files
  ✓ Embed tilesets
  Output: public/assets/maps/town-map.json
  ```

---

## 🎮 KAPLAY API Quick Reference

| Function | Purpose |
|---|---|
| `k.loadSprite(name, url, { sliceX, sliceY, anims })` | Load spritesheet with named animations |
| `k.loadSpriteAtlas(url, atlas)` | Load tileset atlas for map tiles |
| `k.add([...components])` | Spawn a game object |
| `k.body({ isStatic: true })` | Make collision object immovable |
| `k.area()` | Add collision detection |
| `k.camPos(vec2)` | Move the camera |
| `k.onKeyDown(key, fn)` | Continuous key held callback |
| `k.onKeyPress(key, fn)` | Single key press callback |
| `k.onCollide(tag1, tag2, fn)` | Collision handler between tags |
| `k.scene(name, fn)` | Define a named scene |
| `k.go(sceneName, data)` | Switch to a scene |
| `k.vec2(x, y)` | Create a 2D vector |
| `k.tween(from, to, secs, fn)` | Smooth interpolation animation |

### Zone Teleportation Pattern
```typescript
export const ZONES = {
  "town-square":   k.vec2(80,  80),
  "gym-frontend":  k.vec2(320, 160),
  "gym-systems":   k.vec2(640, 160),
  "lab-about":     k.vec2(480, 320),
} as const;

export function teleportPlayer(player: GameObj, zoneName: keyof typeof ZONES) {
  player.pos = ZONES[zoneName];
  k.camPos(player.pos);
}
```

---

## 🎨 Free Sprite & Tileset Sources

| Source | URL | License | Best For |
|---|---|---|---|
| Kenney.nl (Tiny Town) | https://kenney.nl/assets/tiny-town | CC0 | Buildings, roads, trees, 16×16 |
| LimeZu Modern Interiors | https://limezu.itch.io/ | Free/Paid | Office desk, computer sprites |
| OpenGameArt.org | https://opengameart.org/ | CC0/CC-BY | Massive library — search "top-down 16x16" |
| CraftPix Free Section | https://craftpix.net/freebies/ | Free | NPC characters, town props |

### LPC Universal Character Generator (Custom Player Sprite)
- **URL:** https://sanderfrenken.github.io/Universal-LPC-Spritesheet-Character-Generator/
- **Use for:** Generates a 4-directional walk-cycle PNG without any manual pixel art.
- **Export config:** Downloads as a 4×4 grid — use `sliceX: 4, sliceY: 4` in KAPLAY.
- **Note:** Previous URL (liberatedpixelcup.github.io) was outdated — use the `sanderfrenken` fork above.

---

## ✏️ Pixel Art Editing Tools

| Tool | URL | Use For |
|---|---|---|
| LibreSprite | https://libresprite.github.io/ | Desktop editor (free Aseprite fork), edit 16×16 tiles & animate walk-cycles |
| Piskel | https://www.piskelapp.com/ | Browser-based, quick color edits on character sprites |
| Free Texture Packer | https://free-tex-packer.ftpp.pw/ | Combine PNGs into a sprite sheet + JSON coordinates |

---

## 🎵 Audio & Sound Effects

| Tool | URL | Use For |
|---|---|---|
| BeepBox.co | https://www.beepbox.co/ | Compose custom 8-bit background music loops in browser |
| ChipTone | https://www.sfbgames.com/chiptone/ | Visual synth for retro SFX (door opens, menu pings, footsteps) |
| Freesound.org | https://freesound.org/ | Royalty-free ambience (search: "chiptune loop", "8bit click") |

### Loading Audio in KAPLAY
```typescript
k.loadSound("bgm", "/assets/audio/town-theme.mp3");
k.loadSound("sfx-interact", "/assets/audio/interact.wav");

// Play looping background music
k.play("bgm", { loop: true, volume: 0.4 });

// Play one-shot SFX on interaction
k.play("sfx-interact");
```
