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
  background: [34, 85, 34],
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

// ── Player sprite (4×4 spritesheet: 4 cols × 4 rows) ─────────
// Source image is 1024×1024 → each frame is 256×256
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

// ── Game Scene ────────────────────────────────────────────────
k.scene("game", () => {

  // ══════════════════════════════════════════════════════════════
  //  PROGRAMMATIC PIXEL-ART MAP
  //  World size: 960 × 800 (60 × 50 tiles at 16px each)
  // ══════════════════════════════════════════════════════════════

  const W  = 960;
  const H  = 800;
  const TS = 16; // tile size

  // ── Helper: draw a solid rect tile ──────────────────────────
  function tile(x: number, y: number, w: number, h: number, color: ReturnType<typeof k.rgb>, z = 0) {
    return k.add([k.rect(w, h), k.pos(x, y), k.color(color), k.z(z)]);
  }

  // ── Helper: draw a text label ───────────────────────────────
  function label(x: number, y: number, text: string, size = 5, z = 5) {
    k.add([k.text(text, { size }), k.pos(x, y), k.color(255, 255, 255), k.z(z)]);
  }

  // ── Helper: solid wall block ────────────────────────────────
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
  //  GROUND LAYER — fill entire world with grass
  // ══════════════════════════════════════════════════════════════
  tile(0, 0, W, H, k.rgb(34, 102, 34), -2);

  // Grass texture — light dots in a grid pattern
  for (let gx = 0; gx < W; gx += TS * 2) {
    for (let gy = 0; gy < H; gy += TS * 2) {
      tile(gx + 2,  gy + 2,  2, 2, k.rgb(42, 115, 42), -1);
      tile(gx + 10, gy + 10, 2, 2, k.rgb(28, 92, 28),  -1);
    }
  }

  // ══════════════════════════════════════════════════════════════
  //  PATHS — cross-shaped dirt road network
  // ══════════════════════════════════════════════════════════════
  const PATH_COLOR  = k.rgb(180, 140, 90);
  const PEBBLE_COLOR = k.rgb(165, 128, 80);

  // Horizontal main path (center Y ≈ 400)
  tile(0,   385, W, 30, PATH_COLOR, 0);
  // Vertical main path (center X ≈ 480)
  tile(460, 0,   30, H, PATH_COLOR, 0);

  // Path pebble detail
  for (let px = 4; px < W; px += 32) {
    tile(px, 390, 4, 4, PEBBLE_COLOR, 1);
    tile(px + 16, 398, 3, 3, PEBBLE_COLOR, 1);
  }
  for (let py = 4; py < H; py += 32) {
    tile(465, py, 4, 4, PEBBLE_COLOR, 1);
    tile(474, py + 16, 3, 3, PEBBLE_COLOR, 1);
  }

  // ══════════════════════════════════════════════════════════════
  //  TOWN SQUARE — center of the map (around 400, 340)
  // ══════════════════════════════════════════════════════════════
  const TS_X = 340, TS_Y = 310, TS_W = 200, TS_H = 120;

  // Stone plaza base
  tile(TS_X, TS_Y, TS_W, TS_H, k.rgb(170, 160, 145), 1);
  // Plaza border
  tile(TS_X,              TS_Y,             TS_W, 4,  k.rgb(130, 120, 105), 2);
  tile(TS_X,              TS_Y + TS_H - 4,  TS_W, 4,  k.rgb(130, 120, 105), 2);
  tile(TS_X,              TS_Y,             4,  TS_H,  k.rgb(130, 120, 105), 2);
  tile(TS_X + TS_W - 4,   TS_Y,             4,  TS_H,  k.rgb(130, 120, 105), 2);

  // Center fountain
  tile(415, 345, 50, 40, k.rgb(100, 150, 200), 2); // water
  tile(420, 350, 40, 30, k.rgb(120, 175, 220), 2); // water shimmer
  tile(430, 355, 20, 20, k.rgb(140, 195, 235), 2);
  // Fountain border
  tile(413, 343, 54, 3, k.rgb(160, 140, 120), 3);
  tile(413, 380, 54, 3, k.rgb(160, 140, 120), 3);
  tile(413, 343, 3, 40, k.rgb(160, 140, 120), 3);
  tile(464, 343, 3, 40, k.rgb(160, 140, 120), 3);

  // Welcome sign (trigger visual)
  tile(348, 330, 24, 18, k.rgb(80, 55, 30), 3);   // post dark
  tile(350, 314, 60, 14, k.rgb(120, 85, 40), 3);   // sign board
  tile(352, 316, 56, 10, k.rgb(200, 170, 100), 3); // sign face
  label(353, 317, "WELCOME!", 4, 4);

  // NPC guide — small pixel figure
  tile(362, 350, 8, 12, k.rgb(255, 200, 150), 3); // head+body
  tile(360, 356, 12, 6, k.rgb(50, 100, 200), 3);  // shirt
  tile(362, 362, 3, 4, k.rgb(50, 50, 100), 3);    // leg L
  tile(367, 362, 3, 4, k.rgb(50, 50, 100), 3);    // leg R
  label(355, 342, "?", 8, 4);

  // Flowers around plaza
  const FLOWER_POSITIONS = [
    [TS_X + 8, TS_Y + 8], [TS_X + 180, TS_Y + 8],
    [TS_X + 8, TS_Y + 100], [TS_X + 180, TS_Y + 100],
  ];
  FLOWER_POSITIONS.forEach(([fx, fy]) => {
    tile(fx!, fy!, 6, 6, k.rgb(0, 160, 0), 2);
    tile(fx! + 1, fy! - 2, 4, 4, k.rgb(255, 80, 120), 3);
  });

  label(370, TS_Y + 6, "★ TOWN SQUARE", 5, 4);

  // ══════════════════════════════════════════════════════════════
  //  GYM 1 — FRONTEND CITY (top-right quadrant)
  // ══════════════════════════════════════════════════════════════
  const G1_X = 560, G1_Y = 60;

  // Zone ground (cobblestone)
  tile(G1_X, G1_Y, 300, 260, k.rgb(90, 100, 120), 1);
  for (let cx = G1_X; cx < G1_X + 300; cx += 20) {
    for (let cy = G1_Y; cy < G1_Y + 260; cy += 20) {
      tile(cx, cy, 19, 19, k.rgb(80, 90, 110), 1);
    }
  }

  // Gym 1 building — large blue structure
  const B1_X = 600, B1_Y = 100;
  tile(B1_X, B1_Y, 100, 80, k.rgb(40, 60, 140), 2);        // walls
  tile(B1_X + 4, B1_Y + 4, 92, 72, k.rgb(50, 75, 165), 2); // wall lighter
  // Roof
  tile(B1_X - 4, B1_Y - 8, 108, 16, k.rgb(30, 40, 100), 3);
  // Windows
  tile(B1_X + 10, B1_Y + 16, 22, 18, k.rgb(180, 220, 255), 2);
  tile(B1_X + 10, B1_Y + 16, 22, 2,  k.rgb(100, 150, 200), 3);
  tile(B1_X + 21, B1_Y + 16, 2,  18, k.rgb(100, 150, 200), 3);
  tile(B1_X + 68, B1_Y + 16, 22, 18, k.rgb(180, 220, 255), 2);
  tile(B1_X + 68, B1_Y + 16, 22, 2,  k.rgb(100, 150, 200), 3);
  tile(B1_X + 79, B1_Y + 16, 2,  18, k.rgb(100, 150, 200), 3);
  // Door
  tile(B1_X + 42, B1_Y + 52, 16, 28, k.rgb(80, 50, 20), 3);
  tile(B1_X + 44, B1_Y + 54, 12, 24, k.rgb(140, 100, 50), 3);
  // Sign
  tile(B1_X + 20, B1_Y + 42, 60, 8, k.rgb(200, 170, 80), 3);
  label(B1_X + 22, B1_Y + 43, ".NET+REACT GYM", 4, 4);

  // Building 2 — Quantum Lab
  const B2_X = 720, B2_Y = 100;
  tile(B2_X, B2_Y, 90, 80, k.rgb(80, 30, 120), 2);
  tile(B2_X + 4, B2_Y + 4, 82, 72, k.rgb(100, 40, 150), 2);
  tile(B2_X - 4, B2_Y - 8, 98, 16, k.rgb(60, 20, 90), 3);
  // Windows (star-shaped for quantum feel)
  tile(B2_X + 12, B2_Y + 16, 20, 18, k.rgb(220, 180, 255), 2);
  tile(B2_X + 58, B2_Y + 16, 20, 18, k.rgb(220, 180, 255), 2);
  // Door
  tile(B2_X + 37, B2_Y + 52, 16, 28, k.rgb(60, 20, 80), 3);
  tile(B2_X + 39, B2_Y + 54, 12, 24, k.rgb(120, 60, 160), 3);
  // Sign
  tile(B2_X + 8, B2_Y + 42, 74, 8, k.rgb(180, 140, 220), 3);
  label(B2_X + 10, B2_Y + 43, "QUANTUM RL LAB", 4, 4);

  // Gym 1 zone sign post
  tile(G1_X + 10, G1_Y + 10, 6, 20, k.rgb(80, 55, 30), 3);
  tile(G1_X + 8,  G1_Y + 4,  80, 12, k.rgb(60, 100, 180), 3);
  tile(G1_X + 10, G1_Y + 6,  76, 8,  k.rgb(80, 130, 220), 3);
  label(G1_X + 12, G1_Y + 7, "⚡ FRONTEND CITY", 4, 4);

  // Gym 1 collision walls
  wall(G1_X, G1_Y, 300, 8);
  wall(G1_X, G1_Y, 8, 260);
  wall(G1_X + 292, G1_Y, 8, 260);
  wall(B1_X - 2, B1_Y - 2, 104, 84); // building 1
  wall(B2_X - 2, B2_Y - 2, 94, 84);  // building 2

  // ══════════════════════════════════════════════════════════════
  //  GYM 2 — SYSTEMS HUB (bottom-right quadrant)
  // ══════════════════════════════════════════════════════════════
  const G2_X = 560, G2_Y = 450;

  // Zone ground (industrial gray)
  tile(G2_X, G2_Y, 300, 260, k.rgb(60, 65, 70), 1);
  // Grid lines
  for (let ix = G2_X; ix < G2_X + 300; ix += 32) {
    tile(ix, G2_Y, 2, 260, k.rgb(70, 76, 82), 2);
  }
  for (let iy = G2_Y; iy < G2_Y + 260; iy += 32) {
    tile(G2_X, iy, 300, 2, k.rgb(70, 76, 82), 2);
  }

  // BC ERP building
  const B3_X = 580, B3_Y = 490;
  tile(B3_X, B3_Y, 90, 70, k.rgb(120, 80, 30), 2);
  tile(B3_X + 3, B3_Y + 3, 84, 64, k.rgb(150, 100, 40), 2);
  tile(B3_X - 4, B3_Y - 8, 98, 14, k.rgb(90, 60, 20), 3);
  tile(B3_X + 10, B3_Y + 14, 20, 16, k.rgb(240, 200, 120), 2);
  tile(B3_X + 60, B3_Y + 14, 20, 16, k.rgb(240, 200, 120), 2);
  tile(B3_X + 38, B3_Y + 46, 14, 24, k.rgb(80, 50, 20), 3);
  tile(B3_X + 10, B3_Y + 36, 70, 8, k.rgb(220, 180, 80), 3);
  label(B3_X + 12, B3_Y + 37, "BC ERP HUB", 4, 4);

  // ClickHouse building
  const B4_X = 700, B4_Y = 490;
  tile(B4_X, B4_Y, 80, 70, k.rgb(180, 60, 30), 2);
  tile(B4_X + 3, B4_Y + 3, 74, 64, k.rgb(210, 75, 40), 2);
  tile(B4_X - 4, B4_Y - 8, 88, 14, k.rgb(140, 45, 20), 3);
  tile(B4_X + 10, B4_Y + 14, 18, 16, k.rgb(255, 200, 180), 2);
  tile(B4_X + 52, B4_Y + 14, 18, 16, k.rgb(255, 200, 180), 2);
  tile(B4_X + 34, B4_Y + 46, 12, 24, k.rgb(100, 30, 10), 3);
  tile(B4_X + 8,  B4_Y + 36, 64, 8, k.rgb(255, 160, 100), 3);
  label(B4_X + 10, B4_Y + 37, "CLICKHOUSE", 4, 4);

  // DB Infra building
  const B5_X = 640, B5_Y = 590;
  tile(B5_X, B5_Y, 100, 70, k.rgb(50, 100, 80), 2);
  tile(B5_X + 3, B5_Y + 3, 94, 64, k.rgb(65, 120, 95), 2);
  tile(B5_X - 4, B5_Y - 8, 108, 14, k.rgb(35, 75, 60), 3);
  tile(B5_X + 12, B5_Y + 14, 20, 16, k.rgb(150, 220, 180), 2);
  tile(B5_X + 68, B5_Y + 14, 20, 16, k.rgb(150, 220, 180), 2);
  tile(B5_X + 44, B5_Y + 46, 12, 24, k.rgb(30, 70, 50), 3);
  tile(B5_X + 10, B5_Y + 36, 80, 8, k.rgb(100, 200, 140), 3);
  label(B5_X + 12, B5_Y + 37, "DB INFRA", 4, 4);

  // Gym 2 zone sign
  tile(G2_X + 10, G2_Y + 10, 6, 20, k.rgb(80, 55, 30), 3);
  tile(G2_X + 8,  G2_Y + 4,  80, 12, k.rgb(160, 60, 30), 3);
  tile(G2_X + 10, G2_Y + 6,  76, 8,  k.rgb(200, 80, 40), 3);
  label(G2_X + 12, G2_Y + 7, "⚙ SYSTEMS HUB", 4, 4);

  // Gym 2 collision walls
  wall(G2_X, G2_Y, 300, 8);
  wall(G2_X, G2_Y, 8, 260);
  wall(G2_X + 292, G2_Y, 8, 260);
  wall(G2_X, G2_Y + 252, 300, 8);
  wall(B3_X - 2, B3_Y - 2, 94, 74);
  wall(B4_X - 2, B4_Y - 2, 84, 74);
  wall(B5_X - 2, B5_Y - 2, 104, 74);

  // ══════════════════════════════════════════════════════════════
  //  PROFESSOR'S LAB (bottom-left quadrant)
  // ══════════════════════════════════════════════════════════════
  const LAB_X = 60, LAB_Y = 450;

  // Zone ground (warm wooden floor)
  tile(LAB_X, LAB_Y, 400, 260, k.rgb(140, 100, 60), 1);
  // Wood floor plank lines
  for (let lx = LAB_X; lx < LAB_X + 400; lx += 24) {
    tile(lx, LAB_Y, 2, 260, k.rgb(120, 85, 50), 2);
  }
  for (let ly = LAB_Y; ly < LAB_Y + 260; ly += 8) {
    tile(LAB_X, ly, 400, 1, k.rgb(125, 88, 52), 2);
  }

  // Lab main building
  const LAB_BX = 100, LAB_BY = 480;
  tile(LAB_BX, LAB_BY, 240, 180, k.rgb(70, 50, 120), 2);
  tile(LAB_BX + 4, LAB_BY + 4, 232, 172, k.rgb(85, 65, 140), 2);
  // Roof
  tile(LAB_BX - 8, LAB_BY - 12, 256, 20, k.rgb(50, 35, 90), 3);
  // Roof diamond decoration
  for (let rd = 0; rd < 10; rd++) {
    tile(LAB_BX + 20 + rd * 22, LAB_BY - 12, 8, 8, k.rgb(180, 150, 255), 3);
  }
  // Windows (2×3 grid)
  [0, 1, 2].forEach(col => {
    [0, 1].forEach(row => {
      const wx = LAB_BX + 20 + col * 80;
      const wy = LAB_BY + 24 + row * 58;
      tile(wx, wy, 32, 28, k.rgb(180, 220, 255), 2);
      tile(wx + 15, wy, 2, 28, k.rgb(120, 160, 200), 3);
      tile(wx, wy + 13, 32, 2, k.rgb(120, 160, 200), 3);
    });
  });
  // Door (double door, grand entrance)
  tile(LAB_BX + 96, LAB_BY + 140, 48, 40, k.rgb(50, 30, 80), 3);
  tile(LAB_BX + 100, LAB_BY + 144, 20, 36, k.rgb(100, 70, 160), 3);
  tile(LAB_BX + 122, LAB_BY + 144, 20, 36, k.rgb(100, 70, 160), 3);
  tile(LAB_BX + 116, LAB_BY + 158, 8, 8, k.rgb(220, 200, 100), 3); // handles

  // Signs (outside the lab)
  const SIGN_DEFS = [
    { x: LAB_BX + 10, y: LAB_BY - 30, text: "ABOUT ME" },
    { x: LAB_BX + 90, y: LAB_BY - 30, text: "TECH STACK" },
    { x: LAB_BX + 180, y: LAB_BY - 30, text: "EDUCATION" },
  ];
  SIGN_DEFS.forEach(s => {
    tile(s.x + 6, s.y - 12, 4, 14, k.rgb(80, 55, 30), 3);
    tile(s.x, s.y, 72, 12, k.rgb(200, 170, 80), 3);
    tile(s.x + 2, s.y + 2, 68, 8, k.rgb(240, 210, 120), 3);
    label(s.x + 4, s.y + 3, s.text, 4, 4);
  });

  // Experience + Resume signs (further right)
  tile(LAB_BX + 20, LAB_BY + 200, 4, 14, k.rgb(80, 55, 30), 3);
  tile(LAB_BX + 10, LAB_BY + 210, 82, 12, k.rgb(200, 170, 80), 3);
  tile(LAB_BX + 12, LAB_BY + 212, 78, 8, k.rgb(240, 210, 120), 3);
  label(LAB_BX + 14, LAB_BY + 213, "EXPERIENCE", 4, 4);

  tile(LAB_BX + 130, LAB_BY + 200, 4, 14, k.rgb(80, 55, 30), 3);
  tile(LAB_BX + 120, LAB_BY + 210, 90, 12, k.rgb(220, 50, 50), 3);
  tile(LAB_BX + 122, LAB_BY + 212, 86, 8, k.rgb(255, 100, 100), 3);
  label(LAB_BX + 124, LAB_BY + 213, "↓ RESUME PDF", 4, 4);

  // Zone sign
  tile(LAB_X + 10, LAB_Y + 10, 6, 20, k.rgb(80, 55, 30), 3);
  tile(LAB_X + 8,  LAB_Y + 4,  100, 12, k.rgb(80, 50, 130), 3);
  tile(LAB_X + 10, LAB_Y + 6,  96,  8,  k.rgb(110, 70, 170), 3);
  label(LAB_X + 12, LAB_Y + 7, "🔬 PROF'S LAB", 4, 4);

  // Lab collision walls
  wall(LAB_X, LAB_Y, 400, 8);
  wall(LAB_X, LAB_Y, 8, 260);
  wall(LAB_X + 392, LAB_Y, 8, 260);
  wall(LAB_X, LAB_Y + 252, 400, 8);
  wall(LAB_BX - 2, LAB_BY - 2, 244, 184); // main building

  // ══════════════════════════════════════════════════════════════
  //  TREES — scattered across the world
  // ══════════════════════════════════════════════════════════════
  const TREE_POSITIONS = [
    // Top-left area
    [40, 60], [100, 40], [160, 80], [220, 50], [300, 70], [40, 140], [120, 160],
    // Top path edges
    [30, 220], [30, 260], [30, 300], [900, 220], [900, 260], [900, 300],
    // Bottom borders
    [30, 650], [30, 700], [30, 740], [900, 650], [900, 700], [900, 740],
    // Mid area between zones
    [520, 120], [520, 200], [520, 280], [520, 550], [520, 640], [520, 720],
  ];

  TREE_POSITIONS.forEach(([tx, ty]) => {
    // Trunk
    tile(tx! + 4, ty! + 16, 8, 12, k.rgb(100, 65, 20), 2);
    // Canopy (3 layers for depth)
    tile(tx! - 2,  ty! + 8,  20, 14, k.rgb(0, 110, 0),  3);
    tile(tx! - 4,  ty! + 2,  24, 12, k.rgb(0, 140, 0),  3);
    tile(tx!,      ty! - 4,  16, 12, k.rgb(0, 160, 0),  3);
    // Shadow
    tile(tx! + 1,  ty! + 26, 14, 4,  k.rgb(20, 70, 20), 2);
    // Wall for tree
    wall(tx! + 2, ty! + 14, 12, 14);
  });

  // ══════════════════════════════════════════════════════════════
  //  WORLD BORDER WALLS
  // ══════════════════════════════════════════════════════════════
  tile(0,   0,   W,  8,   k.rgb(50, 35, 20), 5); // top
  tile(0,   H-8, W,  8,   k.rgb(50, 35, 20), 5); // bottom
  tile(0,   0,   8,  H,   k.rgb(50, 35, 20), 5); // left
  tile(W-8, 0,   8,  H,   k.rgb(50, 35, 20), 5); // right
  wall(0, 0, W, 8);
  wall(0, H - 8, W, 8);
  wall(0, 0, 8, H);
  wall(W - 8, 0, 8, H);

  // ══════════════════════════════════════════════════════════════
  //  TRIGGER ZONES (invisible interaction areas)
  // ══════════════════════════════════════════════════════════════
  const triggers: Array<{ name: string; x: number; y: number; w: number; h: number }> = [
    // Town Square
    { name: "welcome-sign",          x: 348, y: 314, w: 64, h: 20 },
    { name: "npc-guide",             x: 356, y: 344, w: 24, h: 24 },
    // Gym 1 — Frontend City
    { name: "building-dotnet-react", x: B1_X + 40, y: B1_Y + 60, w: 20, h: 20 },
    { name: "building-quantum",      x: B2_X + 36, y: B2_Y + 60, w: 20, h: 20 },
    // Gym 2 — Systems Hub
    { name: "building-bc-erp",       x: B3_X + 36, y: B3_Y + 55, w: 20, h: 20 },
    { name: "building-clickhouse",   x: B4_X + 30, y: B4_Y + 55, w: 20, h: 20 },
    { name: "building-db-infra",     x: B5_X + 42, y: B5_Y + 55, w: 20, h: 20 },
    // Professor's Lab
    { name: "about-sign",            x: LAB_BX + 10, y: LAB_BY - 34, w: 72, h: 16 },
    { name: "tech-stack",            x: LAB_BX + 90, y: LAB_BY - 34, w: 72, h: 16 },
    { name: "education",             x: LAB_BX + 180, y: LAB_BY - 34, w: 72, h: 16 },
    { name: "experience",            x: LAB_BX + 10, y: LAB_BY + 207, w: 82, h: 16 },
    { name: "resume-download",       x: LAB_BX + 120, y: LAB_BY + 207, w: 90, h: 16 },
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
      .filter((t: any) => t.pos.dist(p.pos) < 40)
      .sort((a: any, b: any) => a.pos.dist(p.pos) - b.pos.dist(p.pos));

    if (nearby.length === 0) return;

    const trigger = nearby[0];
    window.dispatchEvent(new CustomEvent("portfolio:trigger", {
      detail: { name: trigger.triggerName },
    }));
  }

});
