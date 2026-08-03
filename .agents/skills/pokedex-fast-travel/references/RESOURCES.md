# Reference Resources — Pokédex UI & DOM Overlay

Curated external references for retro UI, web fonts, and canvas-DOM bridge patterns.
All URLs verified and confirmed working.

---

## 🎨 Retro CSS Frameworks

### NES.css
- **Demo Site:** https://nostalgic-css.github.io/NES.css/
- **GitHub:** https://github.com/nostalgic-css/NES.css
- **npm:** `npm install nes.css`
- **Use for:** Authentic 8-bit pixel-art styled buttons, containers, dialogue boxes, and progress bars without writing all retro CSS from scratch.
- **CDN import (add to `index.html` `<head>`):**
```html
<link href="https://unpkg.com/nes.css/css/nes.min.css" rel="stylesheet" />
```
- **Key components for this project:**

| Class | What It Renders |
|---|---|
| `nes-container is-rounded` | Panel with pixel border — perfect for project modals |
| `nes-btn is-primary` | Red retro pixel button |
| `nes-btn is-error` | Close/dismiss button (X) |
| `nes-btn is-success` | Green button (audio mute toggle) |
| `nes-balloon from-left` | Pokémon-style speech bubble (NPC dialogue) |
| `nes-progress` | HP-style progress bar — use for skill proficiency |
| `nes-icon heart` | Pixel heart icon (stars, coins, etc.) |
| `nes-text is-primary` | Coloured pixel text |

> **⚠️ Font note:** NES.css expects `Press Start 2P` to be loaded separately. Include the Google Font import or it falls back to system fonts.

---

## 🔤 Google Fonts — Retro Typography

### Verified Font URLs
| Font | Specimen Page | CSS Name |
|---|---|---|
| Press Start 2P | https://fonts.google.com/specimen/Press+Start+2P | `'Press Start 2P', monospace` |
| Silkscreen | https://fonts.google.com/specimen/Silkscreen | `'Silkscreen', monospace` |
| Pixelify Sans | https://fonts.google.com/specimen/Pixelify+Sans | `'Pixelify Sans', sans-serif` |

### Single import link (add to `<head>`)
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Silkscreen:wght@400;700&family=Pixelify+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### Recommended Typography Scale
```css
:root {
  --font-pixel:    'Press Start 2P', monospace;   /* Pokémon dialogue, logo, labels */
  --font-readable: 'Silkscreen', monospace;        /* Project descriptions, body text */
  --font-heading:  'Pixelify Sans', sans-serif;    /* Zone titles, modal headings */
}

.dialogue-text  { font-family: var(--font-pixel);    font-size: 10px; line-height: 1.8; }
.modal-heading  { font-family: var(--font-heading);  font-size: 22px; font-weight: 700; }
.project-body   { font-family: var(--font-readable); font-size: 13px; line-height: 1.6; }
.ui-label       { font-family: var(--font-pixel);    font-size: 7px;  letter-spacing: 1px; }
```

> **Why 3 fonts?**
> - `Press Start 2P` is iconic but very small at normal sizes — keep it for labels/dialogue only.
> - `Silkscreen` is much more readable at 12–14px — use it for longer project descriptions.
> - `Pixelify Sans` looks modern and polished for big headings.

---

## 🖼️ Modal Architecture — Canvas → DOM Bridge

### Key Pattern from GreNxNja/Game_Folio
The most reliable approach for triggering HTML modals from KAPLAY canvas events:

```typescript
// --- In src/triggers.ts (KAPLAY side) ---
function onZoneEnter(zoneName: string, props: Record<string, string>) {
  window.dispatchEvent(new CustomEvent("portfolio:zone-enter", {
    detail: { zone: zoneName, ...props }
  }));
}

// --- In src/ui.ts (DOM side) ---
window.addEventListener("portfolio:zone-enter", (e: Event) => {
  const { zone, title, description, demoUrl, repoUrl } = (e as CustomEvent).detail;
  openProjectModal({ zone, title, description, demoUrl, repoUrl });
});
```

### Project Modal HTML Structure (using NES.css)
```html
<div id="project-modal" class="modal hidden" role="dialog" aria-modal="true">
  <div class="nes-container is-rounded modal-content">
    <button id="modal-close" class="nes-btn is-error close-btn">✕</button>
    <h2 id="modal-title" class="modal-title"></h2>
    <p id="modal-description" class="modal-body"></p>
    <div class="modal-actions">
      <a id="modal-demo" class="nes-btn is-primary" target="_blank" rel="noopener">▶ Live Demo</a>
      <a id="modal-repo" class="nes-btn is-default" target="_blank" rel="noopener">⌨ View Code</a>
    </div>
  </div>
</div>
```

---

## 📱 Mobile Controls — NippleJS

### NippleJS Virtual Joystick
- **Demo & Docs:** https://yoannmoinet.github.io/nipplejs/
- **GitHub:** https://github.com/yoannmoinet/nipplejs
- **npm:** `npm install nipplejs`
- **Description:** "A vanilla virtual joystick for touch capable interfaces" — v1.0, actively maintained.
- **Use for:** Smooth floating touch joystick for mobile players — superior UX vs. static D-Pad buttons.

```typescript
import nipplejs from "nipplejs";

export function initMobileControls(onMove: (x: number, y: number) => void) {
  if (window.innerWidth > 768) return; // Skip on desktop

  const zone = document.getElementById("joystick-zone")!;
  const manager = nipplejs.create({
    zone,
    mode: "dynamic",       // Joystick spawns where the finger lands
    restOpacity: 0.5,
    color: "#cc0000",      // Match Pokédex red
    size: 80,
  });

  manager.on("move", (_, data) => {
    if (!data.vector) return;
    onMove(data.vector.x, data.vector.y); // x/y range: -1.0 to 1.0
  });

  manager.on("end", () => onMove(0, 0)); // Stop movement on finger lift
}
```

**Integrating with the KAPLAY player loop:**
```typescript
// In src/player.ts
let joystick = { x: 0, y: 0 };
initMobileControls((x, y) => { joystick = { x, y }; });

k.onUpdate(() => {
  let vx = 0, vy = 0;

  // Keyboard input
  if (k.isKeyDown("left")  || k.isKeyDown("a")) vx = -SPEED;
  if (k.isKeyDown("right") || k.isKeyDown("d")) vx =  SPEED;
  if (k.isKeyDown("up")    || k.isKeyDown("w")) vy = -SPEED;
  if (k.isKeyDown("down")  || k.isKeyDown("s")) vy =  SPEED;

  // Joystick input (mobile) — overrides keyboard if active
  if (joystick.x !== 0 || joystick.y !== 0) {
    vx = joystick.x * SPEED;
    vy = -joystick.y * SPEED; // NippleJS Y is inverted vs canvas Y
  }

  player.move(k.vec2(vx, vy));
});
```

**Required HTML (inside `#ui-layer`):**
```html
<div id="joystick-zone"></div>
```

**Required CSS:**
```css
#joystick-zone {
  display: none; /* Hidden on desktop */
  position: absolute;
  bottom: 24px;
  left: 24px;
  width: 120px;
  height: 120px;
}

@media (max-width: 768px) {
  #joystick-zone { display: block; }
  #pokedex-btn   { font-size: 6px; padding: 4px 8px; top: 6px; right: 6px; }
}
```

---

## 🔊 Audio Mute Toggle

```typescript
// In src/ui.ts
export function initAudioToggle(k: KAPLAYCtx) {
  const btn = document.getElementById("audio-btn")!;
  let muted = false;

  btn.addEventListener("click", () => {
    muted = !muted;
    k.volume(muted ? 0 : 1);
    btn.textContent = muted ? "🔇" : "🔊";
    btn.setAttribute("aria-label", muted ? "Unmute audio" : "Mute audio");
  });
}
```

```html
<button id="audio-btn" class="nes-btn is-success retro-corner-btn"
        aria-label="Mute audio" title="Toggle sound">🔊</button>
```

---

## 🌐 Pixel Art Tools (Manual Download)

| Tool | URL | Use For |
|---|---|---|
| LibreSprite | https://libresprite.github.io/ | Desktop pixel art editor, free Aseprite fork |
| Piskel | https://www.piskelapp.com/ | Browser-based quick sprite edits |
| Free Texture Packer | https://free-tex-packer.ftpp.pw/ | Pack multiple PNGs into one sprite sheet + JSON |
