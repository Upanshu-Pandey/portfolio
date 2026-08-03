# 2D Pokémon-Style Portfolio — Workspace Guidelines

## Project Vision
An interactive 2D top-down RPG portfolio built in KAPLAY.js where visitors control a character walking around a pixel-art town. Interacting with buildings, signposts, and NPCs opens modern HTML/CSS project modals and resume details.

## Tech Stack & Tooling
- **Game Engine:** KAPLAY.js (TypeScript / HTML5 Canvas)
- **Build Tool:** Vite + TypeScript
- **Map Editor:** Tiled Map Editor or LDtk (16x16 grid, exported as JSON)
- **UI System:** Hybrid Canvas (Game world) + DOM Overlay (Modals, Pokédex menu, dialogue text)

## Critical Architecture Principles

### 1. Canvas + DOM Separation
- Keep game logic, player velocity, and collision bounds inside the KAPLAY canvas context.
- Render text-dense project descriptions, live demo links, and contact forms inside absolute HTML/CSS modal overlays (`#ui-layer`). Never draw long paragraph text onto the canvas directly.

### 2. Recruiter Fast-Path Rule (Non-Negotiable)
- Recruiters should never be forced to walk across the map if they are short on time.
- Always maintain a persistent **Pokédex / Fast-Travel** button in the top corner (or mapped to `ESC`).
- Opening the Pokédex opens an HTML list view letting users teleport directly to any map zone or open a plain text resume modal instantly.

### 3. Code Style & Performance
- Use modular TypeScript files (`player.ts`, `ui.ts`, `map.ts`).
- Keep map assets light by utilizing reusable 16x16 tile sheets instead of massive static background images.

## Map Zones
- **Town Square (Spawn Point):** Brief welcome sign & control instructions.
- **Gym 1 (Frontend City):** Web applications and interactive client projects.
- **Gym 2 (Systems Hub):** Backend architectures, CLI tools, and algorithms.
- **Professor's Lab:** About Me, Tech Stack summary, and downloadable PDF resume.

## Execution Phases

### Phase 1: Environment & Project Setup
- Initialize Vite project with vanilla TypeScript template.
- Install KAPLAY (`npm install kaplay`).
- Set up skills and directory structure.

### Phase 2: World Design & Asset Assembly
- Download 16x16 top-down pixel-art tileset and character walk-cycle sprite sheet (Kenney.nl).
- Create map in Tiled/LDtk with 4 main zones.
- Add `Collisions` and `Objects` layers; export as `town-map.json` → `public/assets/maps/`.

### Phase 3: Engine Programming
- WASD/Arrow key movement with directional animations in `src/player.ts`.
- Smooth camera tracking locked onto player.
- Tiled JSON map loading with static collision enforcement.
- Proximity listeners (`Spacebar`/`Enter`) on trigger zones.

### Phase 4: Retro UI & Pokédex Fast-Travel
- Retro dialogue box with typewriter animation in `src/ui.ts`.
- Project detail modals triggered by entering buildings/signposts.
- Pokédex Fast-Travel menu (`ESC` toggle) for instant zone teleportation.

### Phase 5: Mobile Polish & Production Deploy
- Virtual D-Pad touch controls for `< 768px` screens.
- Audio Mute/Unmute toggle.
- Production build and deploy to Vercel/Netlify/GitHub Pages.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
