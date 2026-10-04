# Upanshu Pandey: Retro RPG Portfolio · Handoff

> Give this file to an AI or collaborator to resume work with full context.
> Last updated: 2026-09-25

## Status
A full-page, GBA-era-style town explored tile by tile, with enterable buildings, NPCs, ledges, a main menu and HTML panels for all content. All art is authored in code. There are no franchise references (see `AGENTS.md`). It builds cleanly (`npm run build`) and deploys to GitHub Pages on push to `master`.

## About Upanshu (source of truth: `src/content.ts`)
| Field | Value |
|---|---|
| Name | Upanshu Pandey |
| Title | ERP Consultant · Full-Stack Developer |
| Location | Kathmandu, Nepal |
| Status | Open to new roles |
| Email | upanshupandey@gmail.com |
| LinkedIn | https://www.linkedin.com/in/upanshu-pandey-48a48b1a4/ |
| CV | `public/assets/resume/upanshu-pandey-cv.pdf`, built from `resume/cv.html` with `npm run cv` |
| Thesis | `public/assets/thesis/upanshu-pandey-qrl-thesis.pdf` (clean copy, no Turnitin pages) |

**Source of truth for facts:** the CV source `resume/cv.html`, the dissertation, and Upanshu's own work repos. Keep site content traceable to them, and describe clients generically, never by name.

**Experience:** Technical Consultant, Voyager Nepal (Oct 2024 – Jun 2026): AI analytics platform for BC/LS Retail (backend: NLP→ClickHouse SQL, RAG on Qdrant, Python ML service, Azure hosting (IIS + Azure SQL) then Docker Compose VPS deploy, Postgres migration; React front end; .NET identity + connector services), LS Retail BC 27 upgrade, Azure OpenAI chatbot in BC, Docker services, BC consultancy · Agile Solutions (Aug 2022 – Oct 2024): Jr. Technical Consultant, Associate Technical Consultant, Technical Trainee (IRD localisation/TDS, hospital NAV ↔ health insurance FHIR integration, warehouse extensions).
**Projects on the site:** Analytics Platform Front End, SaaS Platform (identity, connectors, admin), E-Commerce Website (Laravel), Quantum RL Circuit Optimizer (Web Workshop) · AI Analytics Platform, Business Central ERP Consulting, Databases & Infrastructure (Systems Works).
**Education:** BSc Computing (Hons), First Class, The British College (2020–2023) · A-Levels, GIHE (2017–2019).

## File map
```
src/
  main.ts            boot: pixel scale, input, art → KAPLAY, title → town
  config.ts          tile size, walk/run/hop timing, pickScale(), asset() base-path helper
  content.ts         profile, projects (building + categories), experience, education, skills
  input.ts           keyboard + touch → buttons, UI handler stack
  state.ts           viewed projects + mute (localStorage, fail-safe)
  audio.ts           Web Audio SFX + looping chiptune town theme
  art/
    pixel.ts         Pix RGBA buffer, grids, crop, dithered shading, lit clusters, 3×5 font
    palette.ts       5-shade hue-shifted ramps per material
    tiles.ts         terrain: grass, tall grass, autotiled path/plaza/water, pier, flowers, fence, ledge, walls, floors
    props.ts         trees, fountain, lamps, signs, building kit + 4 buildings, 3/4-view furniture
    characters.ts    16×32 walk sheets (cap/hair heads, long hair, lab coat) + outfits + drop shadow
    index.ts         bakes everything into KAPLAY sprites (ground + over layers per map)
  world/
    types.ts         MapDef / Interaction model
    tilemap.ts       ASCII + props → ground/over frames, forest margin, collision/ledge/talk grids
    scene.ts         grid movement, ledge hops, NPC idle, warps + fades, camera
    maps/town.ts, maps/interiors.ts, maps/index.ts
  ui/
    dialogue.ts      typewriter text box + YES/NO box
    panel.ts         Project Log, project write-ups, info panels, Résumé
    menu.ts          main menu, MAP travel, CV download
    interact.ts      runs an Interaction (dialogue → ask → follow-up)
    screen.ts        --px UI unit, fades, area banner, title, HUD, touch pad
scripts/preview-art.ts   renders art to PNG in Node (optional zoomed crop)
```

## Controls
Arrows/WASD move · Shift (or B) runs · Space/Enter/Z talk (A) · X/Backspace back (B) · Esc menu. On touch screens a translucent D-pad with A/B/MENU sits over the game.

## Testing note
KAPLAY pauses its loop while `document.visibilityState !== "visible"`. When driving a hidden or background browser tab from automation, the game will look stuck. That's expected; real visitors see it run normally.

## Ideas / next steps
- Personalise the flavour text (TV, mailbox, research notes).
- Add a GitHub/demo link field to `Project` if any project becomes public.
- More town detail: a second route, seasonal palette swap, NPC schedules.
