# 🎮 Upanshu's 2D Pokémon-Style RPG Portfolio — Beginner-Friendly Guide & Learning Roadmap

Welcome! This document breaks down **everything about your portfolio website project** in simple, plain English. It explains how the codebase works, what every file and folder does, and gives you a curated list of web learning resources so you can master the skills to build, modify, and extend this project yourself!

---

## 📌 1. Project Overview & Core Concept

Your portfolio is built as a **2D top-down RPG game** inspired by classic 16-bit Pokémon games (FireRed / Emerald). 

Instead of a traditional static webpage, recruiters and visitors control a character walking around a pixel-art town with 4 distinct zones:
1. **Town Square (Spawn Point)**: Stone plaza, fountain, welcome sign, and NPC guide.
2. **Gym 1 (Frontend City)**: Buildings for Web Applications (.NET + React) & Quantum RL Lab.
3. **Gym 2 (Systems Hub)**: Buildings for Business Central ERP, ClickHouse Analytics, & DB Infrastructure.
4. **Professor's Lab**: About Me, Tech Stack, Education, Work Experience, & Downloadable PDF Resume.

### 🏛️ The Hybrid Architecture (Canvas + DOM)
A major principle of this project is **Canvas + DOM Separation**:
- **Game World (Canvas)**: Built using **KAPLAY.js** (an HTML5 2D game engine). It handles player velocity, 4-directional walk animations, camera smooth-following, sprite rendering, and collision walls.
- **Text & UI Overlays (DOM)**: Dense project descriptions, skill tags, retro dialogue boxes, and downloadable CV links are rendered in standard **HTML/CSS** on top of the canvas using **NES.css**. This ensures text is sharp, readable, responsive, accessible, and searchable by recruiters.
- **Recruiter Fast-Path (Pokédex Menu)**: Recruiters can press `ESC` or click the persistent **Pokédex** button (`📕 POKÉDEX`) at the top-right to instantly teleport to any map zone or open resume details without walking!

---

## 📁 2. Folder & File Breakdown Explained Simply

Here is every file and directory in your project directory:

```
Portfolio/
├── index.html                  📄 HTML shell (Canvas + Retro DOM UI Overlays)
├── package.json                ⚙️ Node dependencies & build scripts
├── tsconfig.json               ⚙️ TypeScript configuration
├── vite.config.ts              ⚙️ Vite build settings
├── AGENTS.md                   🤖 AI agent rules and project guidelines
├── HANDOFF.md                  📝 Project status & technical history
├── PROJECT_LEARNING_GUIDE.md   📘 Beginner guide & roadmap (this document)
├── scripts/
│   ├── process-sprite.mjs      🖼️ Node script to remove magenta background from player sprite
│   └── process-assets.mjs      🖼️ Node script to process & trim generated pixel-art PNGs
├── public/
│   └── assets/
│       ├── resume/             📄 Downloadable CV PDF (upanshu-pandey-cv.pdf)
│       └── sprites/            🎨 Pixel art PNG images (player, buildings, trees, fountain)
└── src/
    ├── main.ts                 🚀 Game engine entry point (KAPLAY map, collision walls, triggers)
    ├── player.ts               🏃 Player movement, animations, joystick, & camera
    ├── ui.ts                   🖥️ Retro dialogue box, modals, Pokédex menu, & Web Audio SFX
    ├── content.ts              📖 Written project descriptions, education, & resume text
    ├── zones.ts                📍 Coordinates table for teleportation & fast-travel
    ├── counter.ts              🧪 Example Vite starter file
    └── style.css               🎨 Retro styling (NES.css overrides, fonts, layout)
```

### Detailed Breakdown of Key Source Files:

#### 1. [`index.html`](file:///E:/Github/Personal%20Projects/Portfolio/index.html)
* **What it does**: The HTML skeleton of the app.
* **Key sections**:
  * Loads retro Google Fonts (`Press Start 2P`, `Silkscreen`, `Pixelify Sans`) and `NES.css`.
  * Contains `<canvas id="kaplay-canvas">` where KAPLAY draws the 2D world.
  * Contains `<div id="ui-layer">` which houses the retro dialogue box, project detail modal, Pokédex fast-travel menu drawer, audio toggle button, and mobile touch joystick zone (`#joystick-zone`).

#### 2. [`src/main.ts`](file:///E:/Github/Personal%20Projects/Portfolio/src/main.ts)
* **What it does**: The heart of the 2D game world!
* **Key functions**:
  * Initializes the KAPLAY engine (`kaplay({ canvas, width: 480, height: 270, scale: 2 })`).
  * Loads all sprite PNGs (`player`, `tree_oak`, `npc_guide`, `prof_lab`, `gym_frontend`, `gym_systems`, `fountain`, `signpost`).
  * Constructs the ground layers (vibrant grass, sand paths, stone plaza, wood decking, industrial grid).
  * Spawns buildings, signposts, trees, fountain, and the NPC guide sprite.
  * Sets up solid collision walls (`wall(...)` and `Polygon` shapes) so the player cannot walk through buildings or outer world borders.
  * Listens for `Spacebar` or `Enter` key presses to trigger interactions when near signs or NPCs.

#### 3. [`src/player.ts`](file:///E:/Github/Personal%20Projects/Portfolio/src/player.ts)
* **What it does**: Controls player spawning, movement physics, animations, and camera.
* **Key functions**:
  * `spawnPlayer()`: Adds the player sprite to KAPLAY, configures 4-way WASD/Arrow key movement (speed = 90), attaches a feet-only collision box (`k.area`), and locks the camera (`k.camPos`) onto the player.
  * `initMobileJoystick()`: Uses **NippleJS** to render a virtual touch joystick on mobile screens (`< 768px`).
  * `teleportPlayer()`: Instant teleport function used by the Pokédex menu.

#### 4. [`src/ui.ts`](file:///E:/Github/Personal%20Projects/Portfolio/src/ui.ts)
* **What it does**: Manages all HTML/CSS UI overlays and sound effects.
* **Key functions**:
  * `showDialogue()`: Plays a retro typewriter animation printing text character-by-character into the dialogue box.
  * `openModal()` / `closeModal()`: Opens NES.css styled project description popups.
  * `initPokedex()`: Powers the Pokédex fast-travel drawer so users can click any zone to teleport.
  * `initAudioToggle()`: Contains a custom **Web Audio API synthesizer** that generates retro 8-bit sound effects (typewriter blips, modal open chimes, teleport SFX) without needing external audio files.

#### 5. [`src/content.ts`](file:///E:/Github/Personal%20Projects/Portfolio/src/content.ts)
* **What it does**: The single source of truth for all text content.
* **Content stored**: Descriptions for Voyager Nepal & Agile Solutions work experience, Business Central ERP, ClickHouse analytics, .NET + React apps, Quantum RL dissertation, education at British College, skills summary, and downloadable CV PDF.

#### 6. [`src/zones.ts`](file:///E:/Github/Personal%20Projects/Portfolio/src/zones.ts)
* **What it does**: Stores `(X, Y)` map coordinates for the 4 zones (`town-square`, `gym-frontend`, `gym-systems`, `lab-about`) so the Pokédex menu knows exactly where to teleport the player.

#### 7. [`src/style.css`](file:///E:/Github/Personal%20Projects/Portfolio/src/style.css)
* **What it does**: Styles the DOM overlays with pixel-art NES.css themes, glassmorphism backdrops, responsive media queries, retro font styling, and touch joystick positioning.

#### 8. [`scripts/process-assets.mjs`](file:///E:/Github/Personal%20Projects/Portfolio/scripts/process-assets.mjs)
* **What it does**: A Node.js helper script using the `sharp` library. It scans generated pixel-art images, automatically strips magenta/white chromakey background colors to create pure transparent PNGs, and trims excess padding.

---

## 📚 3. Curated Learning Roadmap & Web Resources

To build or customize a 2D RPG portfolio like this, here are the essential skills and top free resources to learn them:

### 🌐 Skill 1: Modern HTML5, CSS3 & NES.css
Learn how DOM elements overlay a canvas, how retro fonts work, and how NES.css creates 8-bit UI containers and buttons.
* 📖 **[MDN Web Docs — HTML & CSS Basics](https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web)**: The gold standard for web development fundamentals.
* 🎨 **[NES.css Official Documentation](https://nostalgic-css.github.io/NES.css/)**: Learn how to use NES.css classes like `nes-btn`, `nes-container`, and `nes-dialog`.
* 🔤 **[Google Fonts (Press Start 2P & Silkscreen)](https://fonts.google.com/)**: Free retro pixel fonts.

### ⚡ Skill 2: TypeScript & Vite
TypeScript adds strong type checking to JavaScript, making game logic predictable and bug-free. Vite is the fast dev server and bundler.
* 🚀 **[Vite Official Getting Started Guide](https://vitejs.dev/guide/)**: Understand how Vite serves your code locally with hot-module replacement.
* 📘 **[TypeScript in 5 Minutes](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html)**: Quick intro to TypeScript types, interfaces, and functions.

### 🕹️ Skill 3: 2D Web Game Development with KAPLAY.js
KAPLAY.js (the official open-source successor to Kaboom.js) makes 2D game loops, sprite animations, and collisions easy.
* 📖 **[KAPLAY.js Official Documentation](https://kaplayjs.com/)**: Complete API reference for `kaplay()`, `add()`, `sprite()`, `area()`, `body()`, and `scene()`.
* 🧪 **[KAPLAYground (Interactive Code Examples)](https://play.kaplayjs.com/)**: Over 90 live interactive browser code snippets demonstrating player movement, map loading, and physics.
* 🎥 **[JSLegendDev Game Dev with JavaScript & KAPLAY (YouTube)](https://www.youtube.com/@JSLegendDev)**: Excellent crash courses and tutorials on building 2D web games.

### 🎨 Skill 4: 2D Pixel Art & Asset Pipeline
Understand how 16x16 tilesets, spritesheets, and walk cycles work.
* 🏰 **[Kenney.nl Free 2D Asset Packs](https://kenney.nl)**: Thousands of free, CC0 public domain 2D tilesets (Tiny Town, RPG urban sets, characters).
* 🧙‍♂️ **[Universal LPC Spritesheet Generator](https://sanderfrenken.github.io/Universal-LPC-Spritesheet-Character-Generator/)**: Create custom 4-way top-down walk cycle character spritesheets.
* 🖌️ **[Aseprite](https://www.aseprite.org/)**: The premier pixel art editor and animated sprite tool.

### 🔊 Skill 5: Web Audio API & Sound Synth
Learn how to create retro sound effects directly in code without loading `.mp3` files.
* 🎵 **[MDN Web Audio API Guide](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)**: Learn how `AudioContext`, `OscillatorNode`, and `GainNode` create sound synth blips.
* 🎼 **[BeepBox Chiptune Tracker](https://www.beepbox.co/)**: In-browser tool for composing retro 8-bit background music.

---

## 🛠️ 4. How To Run & Experiment With Your Project

### 1. Run the Development Server
Open your terminal in the project folder and run:
```bash
npm run dev
```
Open `http://localhost:5173/` in your browser. Any change you save in `src/` will instantly update on screen!

### 2. Test Production Build
To check if your code compiles without TypeScript errors:
```bash
npm run build
```

### 3. How to Make Common Customizations
* **Edit Project Text**: Open [`src/content.ts`](file:///E:/Github/Personal%20Projects/Portfolio/src/content.ts) and modify any text string inside `CONTENT_DATA`.
* **Add a New Building or Sign**: Open [`src/main.ts`](file:///E:/Github/Personal%20Projects/Portfolio/src/main.ts), add a sprite or tile, and add an entry to the `triggers` array.
* **Adjust Character Movement**: Open [`src/player.ts`](file:///E:/Github/Personal%20Projects/Portfolio/src/player.ts) and tweak `SPEED` or `TARGET_PX`.

---

> 💡 *This file serves as a complete reference for your portfolio project. You can review it anytime to understand how the components fit together or when learning the underlying web technologies!*
