# 🎮 Upanshu Pandey — 2D RPG Portfolio: Full Context & Handoff Document

> Give this file to the AI to resume working with complete context.
> Last updated: 2026-07-28

---

## 📌 Project Overview

A **2D Pokémon-style RPG portfolio** built with **KAPLAY.js + Vite + TypeScript**.
Visitors control a character walking around a pixel-art town. Interacting with buildings
and signs opens HTML/CSS modals showing projects, skills, and resume details.

**Live dev server:** `http://localhost:5173/` (run `npm run dev` to start)
**Project folder:** `/home/Upanshu/portfolio`

---

## 👤 About Upanshu

| Field | Value |
|---|---|
| **Name** | Upanshu Pandey |
| **Location** | Lazimpat, Kathmandu, Nepal 🇳🇵 |
| **Email** | upanshupandey@gmail.com |
| **Phone** | +977-9840175287 |
| **LinkedIn** | https://www.linkedin.com/in/upanshu-pandey-48a48b1a4/ |
| **CV file** | `/home/Upanshu/Downloads/Upanshu Pandey CV.pdf` |

### Education
| Degree | Institution | Year |
|---|---|---|
| BSc Computing (Hons) — **First Class Honours** | The British College (Leeds Beckett affiliated) | 2020–2023 |
| A-Levels | GIHE | 2017–2019 |

### Work Experience
| Role | Company | Period |
|---|---|---|
| Technical Consultant | Voyager Nepal | Oct 2024 – Jun 2026 |
| Jr. Technical Consultant | Agile Solutions | Jun 2023 – Oct 2024 |
| Associate Technical Consultant | Agile Solutions | Dec 2022 – Jun 2023 |
| Technical Trainee | Agile Solutions | Aug 2022 – Nov 2022 |

### Key Skills
- **ERP:** Microsoft Business Central (AL / C-AL), SQL Server, REST APIs, IRD integration, POS sync
- **Full-Stack:** .NET (C#) backend, React (TypeScript) frontend
- **Data:** ClickHouse OLAP, PL/SQL, database triggers
- **Academic:** Python, Qiskit, TensorFlow, Streamlit (quantum RL dissertation)
- **Infra:** Git/GitHub, SSL certificates, Windows Server On-Premise

### Projects (No public GitHub repos — all modals are description-focused)
1. **Full-Stack .NET + React App** — built at Voyager Nepal with ClickHouse analytics
2. **Quantum RL Circuit Optimizer** — BSc dissertation, First Class, Qiskit + PPO + Streamlit
3. **Business Central ERP Customizations** — AL extensions, APIs, client deployments
4. **ClickHouse Analytics** — schema design, SQL queries, .NET integration
5. **DB & Server Engineering** — SQL Server, triggers, SSL, On-Premise Windows Server

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Game Engine | KAPLAY.js (TypeScript) |
| Build Tool | Vite |
| Map Editor | Tiled Map Editor (16×16 grid, exports JSON) |
| UI System | Hybrid: KAPLAY canvas + DOM overlay |
| Retro UI | NES.css framework |
| Fonts | Press Start 2P · Silkscreen · Pixelify Sans (Google Fonts) |
| Mobile Controls | NippleJS virtual joystick |

---

## 🗺️ Map Zones (4 total)

| Zone | Key | Placeholder Coords | Contents |
|---|---|---|---|
| 🏘️ Town Square | `town-square` | x:200, y:200 | Welcome sign + NPC guide |
| 🏋️ Gym 1 — Frontend City | `gym-frontend` | x:500, y:150 | .NET+React app · Quantum RL |
| ⚡ Gym 2 — Systems Hub | `gym-systems` | x:700, y:350 | Business Central · ClickHouse · DB Infra |
| 🔬 Professor's Lab | `lab-about` | x:150, y:400 | About · Tech Stack · Education · Experience · Resume |

> ⚠️ Coordinates are placeholders. Update `src/zones.ts` once Tiled map is designed.

---

## 📍 All 12 Trigger Points

| Trigger Key | Zone | Type |
|---|---|---|
| `welcome-sign` | Town Square | Dialogue only |
| `npc-guide` | Town Square | Dialogue only |
| `building-dotnet-react` | Gym 1 | Dialogue → Modal |
| `building-quantum` | Gym 1 | Dialogue → Modal |
| `building-bc-erp` | Gym 2 | Dialogue → Modal |
| `building-clickhouse` | Gym 2 | Dialogue → Modal |
| `building-db-infra` | Gym 2 | Dialogue → Modal |
| `about-sign` | Prof's Lab | Dialogue only |
| `tech-stack` | Prof's Lab | Dialogue → Modal |
| `education` | Prof's Lab | Dialogue → Modal |
| `experience` | Prof's Lab | Dialogue → Modal |
| `resume-download` | Prof's Lab | Dialogue → PDF download |

All content is written in `src/content.ts`. No GitHub links or live demo URLs — all description-focused.

---

## 📁 File Structure

```
portfolio/
├── index.html                  ✅ HTML shell (canvas + all UI overlays)
├── src/
│   ├── main.ts                 ✅ KAPLAY init, game scene, trigger handler
│   ├── player.ts               ✅ WASD movement, NippleJS joystick, camera
│   ├── map.ts                  ✅ Tiled JSON loader (collisions + triggers)
│   ├── ui.ts                   ✅ Dialogue, modals, Pokédex, audio, loading screen
│   ├── content.ts              ✅ All 12 modal descriptions + typewriter dialogue
│   ├── zones.ts                ✅ Zone coordinates for fast-travel
│   └── style.css               ✅ Full retro CSS (NES.css + custom)
├── public/assets/
│   ├── maps/                   ❌ EMPTY — needs town-map.json (Tiled export)
│   ├── sprites/                ❌ EMPTY — needs player.png (4×4 spritesheet)
│   ├── tilesets/               ❌ EMPTY — needs town.png (16×16 tileset)
│   ├── audio/                  ❌ EMPTY — needs bgm + SFX files
│   └── resume/                 ❌ EMPTY — needs upanshu-pandey-cv.pdf
├── AGENTS.md                   ✅ Project guidelines for AI agents
├── .agents/skills/
│   ├── kaplay-rpg-loader/
│   │   ├── SKILL.md            ✅ KAPLAY engine patterns
│   │   └── references/RESOURCES.md  ✅ All verified resource URLs
│   └── pokedex-fast-travel/
│       ├── SKILL.md            ✅ UI overlay patterns
│       └── references/RESOURCES.md  ✅ NES.css, fonts, NippleJS docs
└── package.json                ✅ kaplay + nipplejs installed
```

---

## ✅ What's Done

- [x] Vite + TypeScript project initialized (migrated from Astro)
- [x] KAPLAY.js + NippleJS installed
- [x] All source files written (`main.ts`, `player.ts`, `map.ts`, `ui.ts`, `content.ts`, `zones.ts`)
- [x] Full CSS written (retro styling, NES.css, fonts, responsive)
- [x] All modal content written (description-focused, no GitHub links)
- [x] Pokédex fast-travel fully wired
- [x] SPACE/ENTER interaction + dialogue system working
- [x] Audio mute toggle wired
- [x] Loading screen with progress bar
- [x] NippleJS mobile joystick wired (shows on < 768px)
- [x] Skills + references setup in `.agents/skills/`
- [x] Dev server running at http://localhost:5173/
- [x] **Generated 4x4 player walk-cycle spritesheet with pure RGBA transparency (`public/assets/sprites/player.png`)**
- [x] **Created sharp node script (`scripts/process-sprite.mjs`) for chromakey pixel manipulation**
- [x] **Phase 4 Visual Overhaul (Pokémon GBA Style)**:
  - Upgraded raw shape primitives to high-quality GBA Pokémon style 16-bit pixel art sprite assets:
    - `npc_guide.png`: Pokemon professor guide sprite with animated overhead indicator (`?`).
    - `fountain.png`: Detailed GBA plaza stone fountain sprite with water shimmer effect.
    - `tree_oak.png`: Pokémon GBA style oak trees with soft base shadows & trunk depth colliders.
    - `prof_lab.png`: Professor Oak style Laboratory building sprite.
    - `gym_frontend.png`: Futuristic Electric/Gold Gym building sprite.
    - `gym_systems.png`: Industrial Metallic/Rust Gym building sprite.
    - `signpost.png`: Retro wooden notice board signposts.
  - Enhanced ground layer with vibrant multi-shaded green grass tufts, sand paths with cobblestone borders, stone plaza paving, and hardwood lab decking in `src/main.ts`.
  - Built `scripts/process-assets.mjs` using `sharp` to process chromakey transparency and trim sprite padding.
- [x] **Fixed KAPLAY font rendering issue on signs (removed broken font property)**
- [x] **Installed system clipboard tools (`wl-clipboard` & `xclip`)**
- [x] **Phase 3 Assets & Resume**: Placed CV PDF (`public/assets/resume/upanshu-pandey-cv.pdf`) and wired resume download trigger.
- [x] **Phase 3 Audio Integration**: Built retro Web Audio SFX synth system for typewriter blips, modal open chimes, teleport SFX, and audio mute toggle state in `src/ui.ts`.

---

## 🔜 What's NOT Done (Next Steps in Order)

### Phase 4 — Testing & Polish

- [ ] Verify CV PDF downloads correctly when interacting with the Resume sign
- [ ] Test all 12 trigger interactions & dialogue box flows
- [ ] Test Pokédex fast-travel to all 4 zones
- [ ] Test mobile controls (< 768px) with NippleJS virtual joystick
- [ ] Test ESC key shortcut (toggles Pokédex / closes open modals)

- [x] **Phase 5 Production CI/CD**: Created `vite.config.ts` (relative base path) and `.github/workflows/deploy.yml` for automated GitHub Pages build & deployment upon git push.

---


### Phase 5 — Production Deployment

- [x] Configured GitHub Actions CI/CD (`.github/workflows/deploy.yml`)
- [x] Configured Vite base path (`vite.config.ts`)
- [ ] Push latest changes to `origin/master` to trigger automated deployment to GitHub Pages (`https://Upanshu-Pandey.github.io/portfolio/`).


---

## 🔗 Key Resource URLs (All Verified)

| Resource | URL |
|---|---|
| KAPLAY.js docs | https://kaplayjs.com/ |
| KAPLAY examples | https://github.com/kaplayjs/kaplay/tree/master/examples |
| KAPLAY `rpg.js` example | https://github.com/kaplayjs/kaplay/blob/master/examples/rpg.js |
| KAPLAY `tiled.js` example | https://github.com/kaplayjs/kaplay/blob/master/examples/tiled.js |
| Tiled Map Editor | https://www.mapeditor.org/ |
| LPC Character Generator | https://sanderfrenken.github.io/Universal-LPC-Spritesheet-Character-Generator/ |
| Kenney.nl Tiny Town | https://kenney.nl/assets/tiny-town |
| NES.css | https://nostalgic-css.github.io/NES.css/ |
| NippleJS | https://yoannmoinet.github.io/nipplejs/ |
| Google Fonts (all 3) | Press Start 2P · Silkscreen · Pixelify Sans |
| BeepBox (BGM) | https://www.beepbox.co/ |
| ChipTone (SFX) | https://www.sfbgames.com/chiptone/ |
| Freesound | https://freesound.org/ |
| chriscourses reference | https://github.com/chriscourses/pokemon-style-game |
| Game_Folio reference | https://github.com/GreNxNja/Game_Folio |

---

## ⚙️ Dev Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🧠 Architecture Notes

- **Canvas + DOM separation:** Game logic lives in KAPLAY canvas. Text/modals live in `#ui-layer` DOM overlay.
- **Event bridge:** KAPLAY triggers fire `window.dispatchEvent(new CustomEvent("portfolio:trigger", { detail: { name } }))` → caught in `src/ui.ts`
- **`pointer-events: none`** on `#ui-layer` by default — only re-enabled on buttons and modals so clicks reach the canvas.
- **Recruiter fast-path (non-negotiable):** Pokédex button always visible top-right, ESC key always opens it.
- **Mobile:** NippleJS joystick appears on screens < 768px via CSS `@media` query.
- **Fonts:** `Press Start 2P` for labels/dialogue (small), `Silkscreen` for body text (readable), `Pixelify Sans` for headings.
