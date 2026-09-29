---
name: pokedex-fast-travel
description: Patterns for creating retro HTML/CSS dialogue boxes, modal overlays, and a Pokédex fast-travel navigation menu over a KAPLAY canvas. Use when building UI features.
---

# Pokédex & DOM Overlay Skill

When building portfolio UI components, follow these hybrid Canvas-DOM overlay patterns:

## 1. DOM Overlay Architecture
In `index.html`, place a full-screen `#ui-layer` container positioned absolutely over the game canvas:

```html
<div id="game-container">
  <canvas id="kaplay-canvas"></canvas>
  <div id="ui-layer">
    <!-- Pokédex Toggle Button -->
    <button id="pokedex-btn" class="retro-btn">📱 Pokédex Menu</button>
    
    <!-- Typewriter Dialogue Box -->
    <div id="dialogue-box" class="hidden">
      <p id="dialogue-text"></p>
      <span class="prompt-arrow">▼</span>
    </div>

    <!-- Pokédex / Fast-Travel Modal -->
    <div id="pokedex-modal" class="modal hidden">
      <div class="modal-content retro-frame">
        <h2>POKÉDEX — Fast Travel</h2>
        <ul id="project-list">
          <li data-target="gym-frontend">🏋️ Gym 1: Frontend Projects</li>
          <li data-target="gym-systems">⚡ Gym 2: Systems & Backend</li>
          <li data-target="lab-about">🔬 Professor's Lab: About & Resume</li>
        </ul>
        <button id="close-pokedex">Close (ESC)</button>
      </div>
    </div>
  </div>
</div>
```

## 2. CSS — Retro Overlay Styling
```css
#game-container {
  position: relative;
  display: inline-block;
}

#ui-layer {
  position: absolute;
  inset: 0;
  pointer-events: none; /* Pass clicks through to canvas by default */
}

/* Re-enable pointer events only on interactive UI elements */
#ui-layer button,
#ui-layer .modal {
  pointer-events: all;
}

/* Persistent Pokédex button — always visible top-right */
#pokedex-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  font-family: "Press Start 2P", monospace;
  font-size: 8px;
  background: #cc0000;
  color: #fff;
  border: 3px solid #fff;
  padding: 6px 10px;
  cursor: pointer;
  image-rendering: pixelated;
}

/* Dialogue box — bottom of screen */
#dialogue-box {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  width: 80%;
  background: #1a1a2e;
  border: 4px solid #e0e0e0;
  padding: 12px 16px;
  font-family: "Press Start 2P", monospace;
  font-size: 10px;
  color: #f0f0f0;
  line-height: 1.8;
}

.prompt-arrow {
  position: absolute;
  bottom: 6px;
  right: 12px;
  animation: blink 0.7s step-end infinite;
}

@keyframes blink {
  50% { opacity: 0; }
}

/* Pokédex modal — center screen */
.modal {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.6);
}

.retro-frame {
  background: #cc0000;
  border: 6px solid #fff;
  border-radius: 4px;
  padding: 24px;
  min-width: 280px;
  font-family: "Press Start 2P", monospace;
}

.retro-frame h2 {
  font-size: 10px;
  color: #fff;
  margin-bottom: 16px;
  text-align: center;
}

#project-list {
  list-style: none;
  padding: 0;
}

#project-list li {
  padding: 8px;
  color: #fff;
  font-size: 8px;
  cursor: pointer;
  border-bottom: 1px solid rgba(255,255,255,0.3);
}

#project-list li:hover {
  background: rgba(255,255,255,0.2);
}

.hidden { display: none !important; }
```

## 3. TypeScript — Dialogue Typewriter & Fast Travel
```typescript
// In src/ui.ts

// Zone spawn coordinates (update to match your Tiled map)
const ZONES: Record<string, { x: number; y: number }> = {
  "gym-frontend": { x: 320, y: 160 },
  "gym-systems":  { x: 640, y: 160 },
  "lab-about":    { x: 480, y: 320 },
};

/** Typewriter effect — renders text char-by-char */
export function showDialogue(text: string, onDone?: () => void) {
  const box = document.getElementById("dialogue-box")!;
  const p = document.getElementById("dialogue-text")!;
  box.classList.remove("hidden");
  p.textContent = "";

  let i = 0;
  const interval = setInterval(() => {
    p.textContent += text[i++];
    if (i >= text.length) {
      clearInterval(interval);
      onDone?.();
    }
  }, 40);
}

export function hideDialogue() {
  document.getElementById("dialogue-box")!.classList.add("hidden");
}

/** Pokédex fast-travel logic */
export function initPokedex(teleportFn: (x: number, y: number) => void) {
  const btn = document.getElementById("pokedex-btn")!;
  const modal = document.getElementById("pokedex-modal")!;
  const closeBtn = document.getElementById("close-pokedex")!;
  const list = document.getElementById("project-list")!;

  btn.addEventListener("click", () => modal.classList.remove("hidden"));
  closeBtn.addEventListener("click", () => modal.classList.add("hidden"));

  // ESC key to close
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") modal.classList.add("hidden");
  });

  list.querySelectorAll("li").forEach((li) => {
    li.addEventListener("click", () => {
      const target = li.dataset.target!;
      const zone = ZONES[target];
      if (zone) {
        modal.classList.add("hidden");
        teleportFn(zone.x, zone.y);
      }
    });
  });
}
```

## 4. Bridge KAPLAY → DOM (Custom Events)
Emit custom DOM events from KAPLAY trigger callbacks to decouple game logic from UI:

```typescript
// In KAPLAY trigger handler:
window.dispatchEvent(new CustomEvent("portfolio:enter-zone", {
  detail: { zone: "gym-frontend", message: "Welcome to Frontend Gym!" }
}));

// In src/ui.ts:
window.addEventListener("portfolio:enter-zone", (e: Event) => {
  const { message } = (e as CustomEvent).detail;
  showDialogue(message);
});
```

## Key Rules
- `#ui-layer` must have `pointer-events: none` so mouse clicks reach the KAPLAY canvas. Only re-enable on interactive DOM elements.
- Always keep the Pokédex button visible — it's the recruiter escape hatch.
- Use `Press Start 2P` Google Font for authentic retro pixel text.
- Dialogue box should dismiss on `Space`/`Enter` key press.
- Never render long text blocks on the KAPLAY canvas — always use DOM overlays.

## 📚 External References
See `references/RESOURCES.md` in this skill folder for:
- **NES.css** — pixel-art CSS framework for retro buttons, containers, speech bubbles
- **Google Fonts** — Press Start 2P, Silkscreen, Pixelify Sans import snippet + typography scale
- **Canvas → DOM bridge** pattern from GreNxNja/Game_Folio
- **NippleJS** — mobile virtual joystick setup and KAPLAY integration
- **Audio mute toggle** implementation
