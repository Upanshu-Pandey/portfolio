// src/main.ts
// ─── Entry point: KAPLAY init, asset loading, game scene ───

import "./style.css";
import kaplay from "kaplay";
import {
  initPokedex,
  initProjectModal,
  initAudioToggle,
  setupEventBridge,
  updateLoadingBar,
  hideLoadingScreen,
  dismissDialogue,
  isDialogueOpen,
} from "./ui";
import { spawnPlayer, teleportPlayer, initMobileJoystick } from "./player";
import { ZONES } from "./zones";

// ── KAPLAY initialization ─────────────────────────────────────
const k = kaplay({
  global:     false,
  canvas:     document.getElementById("kaplay-canvas") as HTMLCanvasElement,
  width:      480,
  height:     270,
  scale:      2,
  letterbox:  true,
  background: [34, 110, 34],
  crisp:      true,
});

// ── Wire up DOM UI ────────────────────────────────────────────
setupEventBridge();
initProjectModal();
initMobileJoystick();
initPokedex((zoneName) => {
  const zone   = ZONES[zoneName];
  const player = k.get("player")[0];
  if (player && zone) teleportPlayer(player, k, zone.x, zone.y);
});
initAudioToggle(k);

k.onLoad(() => {
  updateLoadingBar(100);
  setTimeout(() => {
    hideLoadingScreen();
    k.go("game");
  }, 300);
});

// ── Asset Loading ─────────────────────────────────────────────

// Player sprite (4×4 spritesheet)
k.loadSprite("player", "/assets/sprites/player.png", {
  sliceX: 4,
  sliceY: 4,
  anims: {
    "idle-down":  0,
    "walk-down":  { from: 0,  to: 3,  loop: true, speed: 8 },
    "idle-up":    4,
    "walk-up":    { from: 4,  to: 7,  loop: true, speed: 8 },
    "idle-left":  8,
    "walk-left":  { from: 8,  to: 11, loop: true, speed: 8 },
    "idle-right": 12,
    "walk-right": { from: 12, to: 15, loop: true, speed: 8 },
  },
});

// Pokemon style GBA Environment Sprites
k.loadSprite("tree_oak",     "/assets/sprites/tree_oak.png");
k.loadSprite("npc_guide",    "/assets/sprites/npc_guide.png");
k.loadSprite("prof_lab",     "/assets/sprites/prof_lab.png");
k.loadSprite("gym_frontend", "/assets/sprites/gym_frontend.png");
k.loadSprite("gym_systems",  "/assets/sprites/gym_systems.png");
k.loadSprite("fountain",     "/assets/sprites/fountain.png");
k.loadSprite("signpost",     "/assets/sprites/signpost.png");

// ── Game Scene ────────────────────────────────────────────────
k.scene("game", () => {

  // ══════════════════════════════════════════════════════════════
  //  WORLD DIMENSIONS (960 × 800)
  // ══════════════════════════════════════════════════════════════
  const W  = 960;
  const H  = 800;
  const TS = 16;

  // ── Helper: draw a solid rect tile ──────────────────────────
  function tile(x: number, y: number, w: number, h: number, color: ReturnType<typeof k.rgb>, z = 0) {
    return k.add([k.rect(w, h), k.pos(x, y), k.color(color), k.z(z)]);
  }

  // ── Helper: draw text label ──────────────────────────────────
  function label(x: number, y: number, text: string, size = 5, z = 5, col = [255, 255, 255]) {
    k.add([k.text(text, { size }), k.pos(x, y), k.color(col[0]!, col[1]!, col[2]!), k.z(z)]);
  }

  // ── Helper: solid wall collider ─────────────────────────────
  function wall(x: number, y: number, w: number, h: number) {
    k.add([
      k.rect(w, h),
      k.pos(x, y),
      k.area(),
      k.body({ isStatic: true }),
      k.opacity(0),
      "solid",
    ]);
  }

  // ══════════════════════════════════════════════════════════════
  //  GROUND LAYER — Vibrant Pokemon GBA Grass
  // ══════════════════════════════════════════════════════════════
  tile(0, 0, W, H, k.rgb(45, 125, 45), -2);

  // Checkerboard & tuft grass detailing
  for (let gx = 0; gx < W; gx += TS * 2) {
    for (let gy = 0; gy < H; gy += TS * 2) {
      tile(gx, gy, TS, TS, k.rgb(40, 118, 40), -2);
      tile(gx + 4, gy + 4, 3, 4, k.rgb(60, 150, 50), -1);
      tile(gx + 20, gy + 18, 4, 3, k.rgb(32, 95, 32), -1);
    }
  }

  // ══════════════════════════════════════════════════════════════
  //  PATHS — Sandy dirt paths with cobblestone edges
  // ══════════════════════════════════════════════════════════════
  const PATH_COLOR   = k.rgb(210, 170, 110);
  const EDGE_COLOR   = k.rgb(170, 130, 85);
  const PEBBLE_COLOR = k.rgb(150, 115, 70);

  // Main paths
  tile(0, 380, W, 40, PATH_COLOR, 0);   // Horizontal main road
  tile(450, 0, 40, H, PATH_COLOR, 0);   // Vertical main road

  // Road edges
  tile(0, 377, W, 3, EDGE_COLOR, 1);
  tile(0, 420, W, 3, EDGE_COLOR, 1);
  tile(447, 0, 3, H, EDGE_COLOR, 1);
  tile(490, 0, 3, H, EDGE_COLOR, 1);

  // Pebbles along paths
  for (let px = 8; px < W; px += 28) {
    tile(px, 386, 3, 3, PEBBLE_COLOR, 1);
    tile(px + 12, 408, 4, 3, PEBBLE_COLOR, 1);
  }
  for (let py = 8; py < H; py += 28) {
    tile(456, py, 3, 3, PEBBLE_COLOR, 1);
    tile(478, py + 14, 4, 3, PEBBLE_COLOR, 1);
  }

  // ══════════════════════════════════════════════════════════════
  //  TOWN SQUARE — Center Plaza with Ornate Fountain & NPC Guide
  // ══════════════════════════════════════════════════════════════
  const TS_X = 330, TS_Y = 290, TS_W = 220, TS_H = 150;

  // Stone Plaza Paving
  tile(TS_X, TS_Y, TS_W, TS_H, k.rgb(190, 180, 160), 1);
  // Plaza border bricks
  tile(TS_X - 4, TS_Y - 4, TS_W + 8, 5, k.rgb(140, 125, 100), 2);
  tile(TS_X - 4, TS_Y + TS_H - 1, TS_W + 8, 5, k.rgb(140, 125, 100), 2);
  tile(TS_X - 4, TS_Y - 4, 5, TS_H + 8, k.rgb(140, 125, 100), 2);
  tile(TS_X + TS_W - 1, TS_Y - 4, 5, TS_H + 8, k.rgb(140, 125, 100), 2);

  // Decorative inner plaza grid lines
  for (let px = TS_X; px < TS_X + TS_W; px += 20) {
    tile(px, TS_Y, 1, TS_H, k.rgb(175, 165, 145), 1);
  }
  for (let py = TS_Y; py < TS_Y + TS_H; py += 20) {
    tile(TS_X, py, TS_W, 1, k.rgb(175, 165, 145), 1);
  }

  // Town Square Header Tag
  tile(TS_X + 45, TS_Y + 6, 130, 14, k.rgb(60, 40, 20), 4);
  tile(TS_X + 47, TS_Y + 8, 126, 10, k.rgb(230, 190, 110), 4);
  label(TS_X + 52, TS_Y + 10, "★ TOWN SQUARE ★", 4, 5, [60, 40, 20]);

  // Center Ornate Pokemon Fountain Sprite
  // fountain.png original: 922×927 -> Scale 0.075 => ~69×69 px
  k.add([
    k.sprite("fountain"),
    k.pos(440, 365),
    k.anchor("center"),
    k.scale(0.075),
    k.z(3),
  ]);

  // Water shimmer effect over fountain
  k.add([
    k.rect(34, 34),
    k.pos(440, 365),
    k.anchor("center"),
    k.color(100, 200, 255),
    k.opacity(0.25),
    k.z(4),
  ]);

  // Octagon polygon collider for smooth circular fountain collisions (KAPLAY supports polygon and rect)
  const fr = 24;
  const fc = 17; // 24 * cos(45 deg)
  k.add([
    k.pos(440, 365),
    k.area({
      shape: new k.Polygon([
        k.vec2(fr, 0),
        k.vec2(fc, fc),
        k.vec2(0, fr),
        k.vec2(-fc, fc),
        k.vec2(-fr, 0),
        k.vec2(-fc, -fc),
        k.vec2(0, -fr),
        k.vec2(fc, -fc),
      ]),
    }),
    k.body({ isStatic: true }),
    "solid",
  ]);

  // Welcome Signpost Prop
  // signpost.png: 813×502 -> Scale 0.045 => ~36×22 px
  k.add([
    k.sprite("signpost"),
    k.pos(355, 330),
    k.scale(0.045),
    k.anchor("center"),
    k.z(3),
  ]);
  tile(338, 312, 60, 12, k.rgb(70, 45, 20), 4);
  tile(340, 314, 56, 8, k.rgb(240, 200, 120), 4);
  label(344, 316, "WELCOME!", 4, 5, [70, 45, 20]);

  // Pokemon Professor NPC Guide Sprite
  // npc_guide.png: 512×830 -> Scale 0.035 => ~18×29 px
  k.add([
    k.sprite("npc_guide"),
    k.pos(365, 365),
    k.anchor("center"),
    k.scale(0.035),
    k.z(4),
  ]);
  // NPC solid collision
  wall(356, 355, 18, 20);

  // Animated prompt indicator overhead NPC
  const npcPrompt = k.add([
    k.text("?", { size: 9 }),
    k.pos(365, 342),
    k.anchor("center"),
    k.color(255, 220, 50),
    k.z(5),
  ]);
  let promptTimer = 0;
  k.onUpdate(() => {
    promptTimer += k.dt() * 4;
    npcPrompt.pos.y = 342 + Math.sin(promptTimer) * 2;
  });

  // Flower Beds in Town Square corners
  const FLOWERS = [
    [TS_X + 12, TS_Y + 20],  [TS_X + 26, TS_Y + 20],
    [TS_X + 180, TS_Y + 20], [TS_X + 194, TS_Y + 20],
    [TS_X + 12, TS_Y + 125], [TS_X + 26, TS_Y + 125],
    [TS_X + 180, TS_Y + 125],[TS_X + 194, TS_Y + 125],
  ];
  FLOWERS.forEach(([fx, fy], idx) => {
    tile(fx!, fy!, 8, 8, k.rgb(35, 110, 35), 2);
    const flowerCol = idx % 2 === 0 ? k.rgb(255, 90, 140) : k.rgb(255, 220, 60);
    tile(fx! + 2, fy! + 2, 4, 4, flowerCol, 3);
  });

  // ══════════════════════════════════════════════════════════════
  //  GYM 1 — FRONTEND CITY (top-right quadrant)
  // ══════════════════════════════════════════════════════════════
  const G1_X = 570, G1_Y = 50;

  // Courtyard Cobblestone Base
  tile(G1_X, G1_Y, 320, 280, k.rgb(105, 115, 135), 1);
  for (let cx = G1_X; cx < G1_X + 320; cx += 16) {
    for (let cy = G1_Y; cy < G1_Y + 280; cy += 16) {
      tile(cx, cy, 15, 15, k.rgb(95, 105, 125), 1);
    }
  }

  // Zone Header Sign
  tile(G1_X + 10, G1_Y + 10, 110, 16, k.rgb(20, 40, 90), 4);
  tile(G1_X + 12, G1_Y + 12, 106, 12, k.rgb(50, 120, 220), 4);
  label(G1_X + 16, G1_Y + 16, "⚡ FRONTEND CITY", 4, 5, [255, 255, 255]);

  // Building 1 — Frontend .NET + React Gym Sprite
  // gym_frontend.png: 880×916 -> Scale 0.12 => ~105×110 px
  const B1_X = 600, B1_Y = 100;
  k.add([
    k.sprite("gym_frontend"),
    k.pos(B1_X + 50, B1_Y + 50),
    k.anchor("center"),
    k.scale(0.11),
    k.z(3),
  ]);
  // Building 1 Sign Tag
  tile(B1_X + 5, B1_Y + 102, 90, 12, k.rgb(20, 50, 100), 4);
  label(B1_X + 8, B1_Y + 105, ".NET+REACT GYM", 4, 5, [255, 220, 100]);
  wall(B1_X, B1_Y, 100, 95); // collision

  // Building 2 — Quantum RL Research Facility
  const B2_X = 740, B2_Y = 100;
  tile(B2_X, B2_Y, 95, 85, k.rgb(75, 30, 125), 2);
  tile(B2_X + 4, B2_Y + 4, 87, 77, k.rgb(95, 45, 155), 2);
  tile(B2_X - 4, B2_Y - 8, 103, 16, k.rgb(55, 20, 95), 3);
  // Glowing Quantum Window
  tile(B2_X + 15, B2_Y + 18, 24, 20, k.rgb(200, 160, 255), 3);
  tile(B2_X + 56, B2_Y + 18, 24, 20, k.rgb(200, 160, 255), 3);
  // Entrance door
  tile(B2_X + 40, B2_Y + 56, 16, 29, k.rgb(50, 20, 70), 3);
  // Quantum Lab Sign Tag
  tile(B2_X + 6, B2_Y + 92, 84, 12, k.rgb(60, 20, 90), 4);
  label(B2_X + 10, B2_Y + 95, "QUANTUM RL LAB", 4, 5, [220, 180, 255]);
  wall(B2_X - 2, B2_Y - 2, 99, 89); // collision

  // ══════════════════════════════════════════════════════════════
  //  GYM 2 — SYSTEMS HUB (bottom-right quadrant)
  // ══════════════════════════════════════════════════════════════
  const G2_X = 570, G2_Y = 450;

  // Industrial Steel Base
  tile(G2_X, G2_Y, 320, 280, k.rgb(65, 70, 75), 1);
  for (let ix = G2_X; ix < G2_X + 320; ix += 32) {
    tile(ix, G2_Y, 2, 280, k.rgb(80, 85, 92), 2);
  }
  for (let iy = G2_Y; iy < G2_Y + 280; iy += 32) {
    tile(G2_X, iy, 320, 2, k.rgb(80, 85, 92), 2);
  }

  // Zone Header Sign
  tile(G2_X + 10, G2_Y + 10, 110, 16, k.rgb(100, 30, 10), 4);
  tile(G2_X + 12, G2_Y + 12, 106, 12, k.rgb(200, 70, 30), 4);
  label(G2_X + 16, G2_Y + 16, "⚙ SYSTEMS HUB", 4, 5, [255, 255, 255]);

  // Building 1 — Business Central ERP Gym Sprite
  // gym_systems.png: 880×865 -> Scale 0.11 => ~96×95 px
  const B3_X = 590, B3_Y = 490;
  k.add([
    k.sprite("gym_systems"),
    k.pos(B3_X + 48, B3_Y + 48),
    k.anchor("center"),
    k.scale(0.11),
    k.z(3),
  ]);
  tile(B3_X + 4, B3_Y + 98, 88, 12, k.rgb(100, 40, 10), 4);
  label(B3_X + 8, B3_Y + 101, "BC ERP HUB", 4, 5, [255, 200, 100]);
  wall(B3_X, B3_Y, 96, 95);

  // Building 2 — ClickHouse Analytics Hub
  const B4_X = 720, B4_Y = 490;
  tile(B4_X, B4_Y, 85, 75, k.rgb(180, 70, 30), 2);
  tile(B4_X + 3, B4_Y + 3, 79, 69, k.rgb(210, 85, 40), 2);
  tile(B4_X - 4, B4_Y - 8, 93, 14, k.rgb(140, 50, 20), 3);
  tile(B4_X + 12, B4_Y + 16, 20, 16, k.rgb(255, 210, 180), 3);
  tile(B4_X + 53, B4_Y + 16, 20, 16, k.rgb(255, 210, 180), 3);
  tile(B4_X + 36, B4_Y + 48, 14, 27, k.rgb(100, 35, 10), 3);
  tile(B4_X + 2, B4_Y + 80, 81, 12, k.rgb(140, 50, 20), 4);
  label(B4_X + 6, B4_Y + 83, "CLICKHOUSE", 4, 5, [255, 210, 150]);
  wall(B4_X - 2, B4_Y - 2, 89, 79);

  // Building 3 — DB & Infra Center
  const B5_X = 640, B5_Y = 600;
  tile(B5_X, B5_Y, 110, 75, k.rgb(45, 95, 75), 2);
  tile(B5_X + 3, B5_Y + 3, 104, 69, k.rgb(60, 115, 90), 2);
  tile(B5_X - 4, B5_Y - 8, 118, 14, k.rgb(30, 70, 55), 3);
  tile(B5_X + 15, B5_Y + 16, 22, 16, k.rgb(160, 230, 190), 3);
  tile(B5_X + 73, B5_Y + 16, 22, 16, k.rgb(160, 230, 190), 3);
  tile(B5_X + 48, B5_Y + 48, 14, 27, k.rgb(25, 60, 45), 3);
  tile(B5_X + 12, B5_Y + 80, 86, 12, k.rgb(30, 70, 55), 4);
  label(B5_X + 16, B5_Y + 83, "DB INFRA", 4, 5, [180, 240, 200]);
  wall(B5_X - 2, B5_Y - 2, 114, 79);

  // ══════════════════════════════════════════════════════════════
  //  PROFESSOR'S LAB (bottom-left quadrant)
  // ══════════════════════════════════════════════════════════════
  const LAB_X = 50, LAB_Y = 450;

  // Warm Hardwood Decking Base
  tile(LAB_X, LAB_Y, 410, 280, k.rgb(145, 105, 65), 1);
  for (let lx = LAB_X; lx < LAB_X + 410; lx += 20) {
    tile(lx, LAB_Y, 2, 280, k.rgb(125, 88, 52), 2);
  }
  for (let ly = LAB_Y; ly < LAB_Y + 280; ly += 10) {
    tile(LAB_X, ly, 410, 1, k.rgb(130, 92, 55), 2);
  }

  // Zone Header Sign
  tile(LAB_X + 10, LAB_Y + 10, 110, 16, k.rgb(60, 30, 90), 4);
  tile(LAB_X + 12, LAB_Y + 12, 106, 12, k.rgb(110, 60, 170), 4);
  label(LAB_X + 16, LAB_Y + 16, "🔬 PROF'S LAB", 4, 5, [255, 255, 255]);

  // Main Professor Laboratory Building Sprite
  // prof_lab.png: 922×640 -> Scale 0.18 => ~165×115 px
  const LAB_BX = 80, LAB_BY = 480;
  k.add([
    k.sprite("prof_lab"),
    k.pos(LAB_BX + 100, LAB_BY + 65),
    k.anchor("center"),
    k.scale(0.18),
    k.z(3),
  ]);
  wall(LAB_BX + 10, LAB_BY + 10, 180, 110); // collision

  // Interactive Signposts (outside the lab)
  const LAB_SIGNS = [
    { x: LAB_BX + 10,  y: LAB_BY - 32, labelText: "ABOUT ME" },
    { x: LAB_BX + 95,  y: LAB_BY - 32, labelText: "TECH STACK" },
    { x: LAB_BX + 180, y: LAB_BY - 32, labelText: "EDUCATION" },
  ];

  LAB_SIGNS.forEach(s => {
    // signpost sprite prop
    k.add([
      k.sprite("signpost"),
      k.pos(s.x + 36, s.y + 6),
      k.scale(0.04),
      k.anchor("center"),
      k.z(3),
    ]);
    tile(s.x, s.y, 72, 12, k.rgb(70, 45, 20), 4);
    tile(s.x + 2, s.y + 2, 68, 8, k.rgb(240, 200, 120), 4);
    label(s.x + 4, s.y + 4, s.labelText, 4, 5, [70, 45, 20]);
  });

  // Experience Sign
  k.add([
    k.sprite("signpost"),
    k.pos(LAB_BX + 45, LAB_BY + 190),
    k.scale(0.04),
    k.anchor("center"),
    k.z(3),
  ]);
  tile(LAB_BX + 10, LAB_BY + 185, 78, 12, k.rgb(70, 45, 20), 4);
  tile(LAB_BX + 12, LAB_BY + 187, 74, 8, k.rgb(240, 200, 120), 4);
  label(LAB_BX + 14, LAB_BY + 189, "EXPERIENCE", 4, 5, [70, 45, 20]);

  // Resume PDF Sign (Bright Red accent)
  k.add([
    k.sprite("signpost"),
    k.pos(LAB_BX + 165, LAB_BY + 190),
    k.scale(0.04),
    k.anchor("center"),
    k.z(3),
  ]);
  tile(LAB_BX + 125, LAB_BY + 185, 88, 12, k.rgb(160, 20, 20), 4);
  tile(LAB_BX + 127, LAB_BY + 187, 84, 8, k.rgb(240, 70, 70), 4);
  label(LAB_BX + 129, LAB_BY + 189, "↓ RESUME PDF", 4, 5, [255, 255, 255]);

  // ══════════════════════════════════════════════════════════════
  //  TREES — Pokemon Oak Trees Scattered Across Map
  // ══════════════════════════════════════════════════════════════
  // tree_oak.png: 1004×1004 -> Scale 0.045 => ~45×45 px
  const OAK_TREES = [
    // Top-left forest grove
    [30, 40],   [90, 30],   [150, 60],  [210, 35],  [270, 65],  [330, 40],
    [30, 120],  [90, 150],  [160, 130], [220, 160], [280, 120],
    // Top border along path
    [30, 220],  [30, 280],  [910, 220], [910, 280],
    // Mid zone upper dividers
    [520, 100], [520, 180], [520, 260],
    // Outer perimeter bottom border
    [30, 730],  [120, 740], [240, 740], [360, 740], [480, 740],
    [600, 740], [720, 740], [840, 740], [910, 730],
  ];

  OAK_TREES.forEach(([tx, ty]) => {
    // Shadow under tree
    tile(tx! - 16, ty! + 12, 32, 10, k.rgb(25, 75, 25), 1);
    // Tree sprite
    k.add([
      k.sprite("tree_oak"),
      k.pos(tx!, ty!),
      k.anchor("center"),
      k.scale(0.045),
      k.z(4),
    ]);
    // Tight Trunk Collider (allows smooth movement around trees)
    wall(tx! - 6, ty! + 4, 12, 8);
  });

  // ══════════════════════════════════════════════════════════════
  //  WORLD BORDER WALLS
  // ══════════════════════════════════════════════════════════════
  tile(0, 0, W, 8, k.rgb(40, 25, 15), 5);
  tile(0, H - 8, W, 8, k.rgb(40, 25, 15), 5);
  tile(0, 0, 8, H, k.rgb(40, 25, 15), 5);
  tile(W - 8, 0, 8, H, k.rgb(40, 25, 15), 5);
  wall(0, 0, W, 8);
  wall(0, H - 8, W, 8);
  wall(0, 0, 8, H);
  wall(W - 8, 0, 8, H);

  // ══════════════════════════════════════════════════════════════
  //  TRIGGER ZONES (Interaction Areas)
  // ══════════════════════════════════════════════════════════════
  const triggers: Array<{ name: string; x: number; y: number; w: number; h: number }> = [
    // Town Square
    { name: "welcome-sign",          x: 338, y: 310, w: 60, h: 20 },
    { name: "npc-guide",             x: 355, y: 350, w: 25, h: 30 },
    // Gym 1 — Frontend City
    { name: "building-dotnet-react", x: B1_X + 35, y: B1_Y + 80, w: 30, h: 25 },
    { name: "building-quantum",      x: B2_X + 35, y: B2_Y + 70, w: 30, h: 25 },
    // Gym 2 — Systems Hub
    { name: "building-bc-erp",       x: B3_X + 30, y: B3_Y + 75, w: 30, h: 25 },
    { name: "building-clickhouse",   x: B4_X + 28, y: B4_Y + 65, w: 30, h: 25 },
    { name: "building-db-infra",     x: B5_X + 40, y: B5_Y + 65, w: 30, h: 25 },
    // Professor's Lab
    { name: "about-sign",            x: LAB_BX + 10, y: LAB_BY - 36, w: 72, h: 18 },
    { name: "tech-stack",            x: LAB_BX + 95, y: LAB_BY - 36, w: 72, h: 18 },
    { name: "education",             x: LAB_BX + 180, y: LAB_BY - 36, w: 72, h: 18 },
    { name: "experience",            x: LAB_BX + 10, y: LAB_BY + 180, w: 78, h: 20 },
    { name: "resume-download",       x: LAB_BX + 125, y: LAB_BY + 180, w: 88, h: 20 },
  ];

  triggers.forEach(t => {
    k.add([
      k.rect(t.w, t.h),
      k.pos(t.x, t.y),
      k.area(),
      k.opacity(0),
      k.z(2),
      { triggerName: t.name },
      "trigger",
    ]);
  });

  // ── Spawn player ──────────────────────────────────────────────
  const spawnZone = ZONES["town-square"];
  spawnPlayer(k, spawnZone.x, spawnZone.y);

  // ── SPACE / ENTER → interact ──────────────────────────────────
  k.onKeyPress("space", handleInteract);
  k.onKeyPress("enter", handleInteract);

  function handleInteract() {
    if (isDialogueOpen()) {
      dismissDialogue();
      return;
    }

    const p = k.get("player")[0];
    if (!p) return;

    const nearby = k.get("trigger")
      .filter((t: any) => t.pos.dist(p.pos) < 45)
      .sort((a: any, b: any) => a.pos.dist(p.pos) - b.pos.dist(p.pos));

    if (nearby.length === 0) return;

    const trigger = nearby[0];
    window.dispatchEvent(new CustomEvent("portfolio:trigger", {
      detail: { name: trigger.triggerName },
    }));
  }

});
