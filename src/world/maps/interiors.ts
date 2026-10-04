// src/world/maps/interiors.ts
// ─── Building interiors: Pine Research Lab, Web Workshop, Systems Works, Upanshu's House ───
// Legend: W wall  _ floor  M exit mat (warp back to town)

import { RAMP, type Ramp } from "../../art/palette.ts";
import type { MapDef, PropDef } from "../types.ts";
import { PROJECTS } from "../../content.ts";

/** Project kiosk: a teaser line, then the offer to open the full write-up. */
function kiosk(id: string, x: number, y: number, glow: Ramp): PropDef {
  const p = PROJECTS.find((pr) => pr.id === id)!;
  return {
    kind: "kiosk", x, y, opts: { glow },
    talk: {
      say: [`The screen reads:\n${p.title.toUpperCase()}`, `${p.short}.`],
      then: { kind: "project", id },
      ask: "Read the full write-up?",
    },
  };
}

const plaqueTalk = { say: ["A brass plaque on a stone plinth:\n\"THANK YOU FOR VISITING!\""] };

const room = (w: number, h: number, matX: number) => [
  "W".repeat(w), "W".repeat(w),
  ...Array.from({ length: h - 3 }, () => "_".repeat(w)),
  "_".repeat(matX) + "M" + "_".repeat(w - matX - 1),
];

export const lab: MapDef = {
  id: "lab",
  name: "Pine Research Lab",
  outdoor: false,
  theme: { wall: RAMP.wall, wallpaper: "panel", floor: "tile", floorRamp: RAMP.white, trim: RAMP.teal },
  tiles: room(13, 10, 6),
  props: [
    { kind: "window", x: 4, y: 0 },
    { kind: "window", x: 8, y: 0 },
    { kind: "diploma", x: 10, y: 0,
      talk: { say: ["A framed diploma:\nBSc (Hons) Computing, The British College.\nFIRST CLASS HONOURS!"], then: { kind: "panel", id: "education" }, ask: "View EDUCATION?" } },
    ...[0, 1, 2].map((x): PropDef => ({
      kind: "bookshelf", x, y: 1,
      talk: { say: ["The shelves are packed with books on AL,\n.NET, React, SQL, ClickHouse… and Qiskit?"], then: { kind: "panel", id: "skills" }, ask: "Read the TECH STACK?" },
    })),
    ...[4, 5].map((x): PropDef => ({
      kind: "server", x, y: 1,
      talk: { say: ["These racks are simulating quantum circuits.\nIt's Upanshu's dissertation project!"], then: { kind: "project", id: "quantum" }, ask: "Read about the project?" },
    })),
    { kind: "pc", x: 8, y: 1,
      talk: { say: ["Upanshu's work history is on the PC.\nFrom TRAINEE all the way to CONSULTANT."], then: { kind: "panel", id: "experience" }, ask: "View EXPERIENCE?" } },
    { kind: "plant", x: 12, y: 1 },
    { kind: "rug", x: 5, y: 3 },
    { kind: "desk", x: 5, y: 5, opts: { item: "cv" },
      talk: { say: ["A laptop and a freshly printed stack of\npages. The top one reads \"CV\"."], then: { kind: "resume" }, ask: "Open Upanshu's CV (PDF)?" } },
    { kind: "desk", x: 9, y: 6, opts: { item: "papers" },
      talk: { say: ["Research notes on columnar databases.\nA sticky note says: \"ORDER BY matters!\""] } },
    { kind: "plant", x: 0, y: 7 },
    { kind: "plant", x: 12, y: 7 },
  ],
  npcs: [
    {
      id: "pine", outfit: "pine", x: 6, y: 3, dir: "down",
      talk: {
        say: [
          "Ah, a visitor! Welcome to my lab.\nI'm DR. PINE. I keep an eye on this town's\nmost interesting resident.",
          "That's UPANSHU PANDEY: a Technical\nConsultant and Full-Stack Developer\nfrom Kathmandu, Nepal.",
          "Nearly four years of ERP systems,\nbackend APIs and modern web apps…\nand he's open to new roles!",
        ],
        then: { kind: "panel", id: "about" },
        ask: "Read Upanshu's profile?",
      },
    },
    {
      id: "aide", outfit: "aide", x: 1, y: 5, dir: "right", wander: true,
      talk: {
        say: ["I'm DR. PINE's research assistant.\nWant to get in touch with Upanshu?"],
        then: { kind: "panel", id: "contact" },
        ask: "Show contact details?",
      },
    },
  ],
  warps: [{ x: 6, y: 9, to: "town", spawn: "lab" }],
  spawns: { door: { x: 6, y: 8, dir: "up" } },
};

export const webWorkshop: MapDef = {
  id: "webWorkshop",
  name: "Web Workshop",
  outdoor: false,
  theme: { wall: RAMP.cream, wallpaper: "diamond", floor: "wood", floorRamp: RAMP.plank, trim: RAMP.navy },
  tiles: room(11, 12, 5),
  props: [
    { kind: "banner", x: 2, y: 0, opts: { glow: RAMP.teal, label: "WEB" } },
    { kind: "banner", x: 7, y: 0, opts: { glow: RAMP.navy, label: "DEV" } },
    { kind: "window", x: 5, y: 0 },
    { kind: "plant", x: 0, y: 1 },
    { kind: "plant", x: 10, y: 1 },
    { kind: "rug", x: 4, y: 2 },
    kiosk("fullstack", 2, 4, RAMP.teal),
    kiosk("quantum", 8, 4, RAMP.purple),
    kiosk("ecommerce", 8, 7, RAMP.orange),
    { kind: "sofa", x: 0, y: 7, talk: { say: ["A comfy sofa for code reviews.\nThere's a rubber duck between the cushions."] } },
    { kind: "pc", x: 10, y: 7, talk: { say: ["The screen shows a pull request:\n\"Refactor API client. 214 additions,\n391 deletions.\" Nice."] } },
    { kind: "plinth", x: 3, y: 9, talk: plaqueTalk },
    { kind: "plinth", x: 7, y: 9, talk: plaqueTalk },
  ],
  npcs: [
    {
      id: "leadWeb", outfit: "leadWeb", x: 5, y: 3, dir: "down",
      talk: {
        say: [
          "Welcome to the WEB WORKSHOP!\nI'm the lead engineer around here.",
          "This is where the web and full-stack work\nlives: C# and React apps, a Laravel store…\nand even a quantum-computing experiment!",
          "Each kiosk covers one project,\nor I can show you the whole list.",
        ],
        then: { kind: "hall", building: "web" },
        ask: "See this workshop's projects?",
      },
    },
  ],
  warps: [{ x: 5, y: 11, to: "town", spawn: "webWorkshop" }],
  spawns: { door: { x: 5, y: 10, dir: "up" } },
};

export const systemsWorks: MapDef = {
  id: "systemsWorks",
  name: "Systems Works",
  outdoor: false,
  theme: { wall: RAMP.stone, wallpaper: "panel", floor: "tile", floorRamp: RAMP.metal, trim: RAMP.orange },
  tiles: room(11, 12, 5),
  props: [
    { kind: "banner", x: 2, y: 0, opts: { glow: RAMP.orange, label: "ERP" } },
    { kind: "banner", x: 7, y: 0, opts: { glow: RAMP.navy, label: "AI" } },
    { kind: "rug", x: 4, y: 2 },
    kiosk("bc-erp", 2, 4, RAMP.orange),
    kiosk("aurora", 8, 4, RAMP.purple),
    kiosk("infra", 2, 7, RAMP.teal),
    ...[8, 9, 10].map((x): PropDef => ({ kind: "server", x, y: 7,
      talk: { say: ["A rack of servers hums quietly.\nEvery status light is green."] } })),
    { kind: "plinth", x: 3, y: 9, talk: plaqueTalk },
    { kind: "plinth", x: 7, y: 9, talk: plaqueTalk },
  ],
  npcs: [
    {
      id: "leadSys", outfit: "leadSys", x: 5, y: 3, dir: "down",
      talk: {
        say: [
          "You found SYSTEMS WORKS!",
          "We handle ERP, AI and infrastructure here:\nBusiness Central, the Aurora BI platform,\nDocker services and SQL Server.",
          "It's not flashy, but it's what keeps\nproduction running!",
        ],
        then: { kind: "hall", building: "systems" },
        ask: "See this workshop's projects?",
      },
    },
  ],
  warps: [{ x: 5, y: 11, to: "town", spawn: "systemsWorks" }],
  spawns: { door: { x: 5, y: 10, dir: "up" } },
};

export const house: MapDef = {
  id: "house",
  name: "Upanshu's House",
  outdoor: false,
  theme: { wall: RAMP.cream, wallpaper: "stripe", floor: "wood", floorRamp: RAMP.plank, trim: RAMP.wood },
  tiles: room(9, 7, 4),
  props: [
    { kind: "window", x: 3, y: 0 },
    { kind: "window", x: 6, y: 0 },
    { kind: "bed", x: 0, y: 1, talk: { say: ["Upanshu's bed. It's neatly made.\nProbably."] } },
    { kind: "pc", x: 2, y: 1, talk: { say: ["Upanshu's PC. The terminal reads:\n$ git commit -m \"final_final_v2\""] } },
    { kind: "counter", x: 4, y: 1, talk: { say: ["A kettle and a tin of tea leaves.\nThe fuel behind many late-night builds."] } },
    { kind: "tv", x: 7, y: 1, talk: { say: ["A documentary about the Himalayas.\nIt's paused on a view of Everest."] } },
    { kind: "fridge", x: 8, y: 1 },
    { kind: "rug", x: 3, y: 3 },
  ],
  npcs: [
    {
      id: "mom", outfit: "mom", x: 6, y: 3, dir: "left",
      talk: {
        say: [
          "Oh, hello! You must be here about Upanshu.",
          "He's out looking for his next role.\nIf you'd like to reach him, I have\nall his details right here.",
        ],
        then: { kind: "panel", id: "contact" },
        ask: "See contact details?",
      },
    },
  ],
  warps: [{ x: 4, y: 6, to: "town", spawn: "house" }],
  spawns: { door: { x: 4, y: 5, dir: "up" } },
};
