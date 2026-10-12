// src/world/maps/interiors.ts
// ─── Building interiors: Town Hall, The Platform, Consultancy Office, Observatory, Upanshu's House ───
// Each building answers a different question (who / flagship product / client work / own work),
// so no two objects open the same write-up.
// Legend: W wall  _ floor  M exit mat (warp back to town)

import { RAMP, type Ramp } from "../../art/palette.ts";
import type { Interaction, MapDef, PropDef } from "../types.ts";
import { PROJECTS } from "../../content.ts";

const project = (id: string) => PROJECTS.find((pr) => pr.id === id)!;

/** Platform station: a teaser line, then the offer to open the full write-up. */
function station(id: string, x: number, y: number, glow: Ramp): PropDef {
  const p = project(id);
  return {
    kind: "kiosk", x, y, opts: { glow },
    talk: {
      say: [`The screen reads:\n${p.title.toUpperCase()}`, `${p.short}.`],
      then: { kind: "project", id },
      ask: "Read about this part?",
    },
  };
}

/** Consultancy case file: client and brief, then the offer to open the file. */
function caseFile(id: string, x: number, y: number, glow: Ramp): PropDef {
  const p = project(id);
  return {
    kind: "cabinet", x, y, opts: { glow },
    talk: {
      say: [`A case file is labelled:\n${p.title.toUpperCase()}`, `CLIENT: ${p.client}.`],
      then: { kind: "project", id },
      ask: "Open the case file?",
    },
  };
}

/** Town Hall timeline frame, hung on the back wall (talks from the floor tile below). */
function portrait(x: number, glow: Ramp, say: string[], follow?: Omit<Interaction, "say">): PropDef {
  return { kind: "portrait", x, y: 0, opts: { glow }, talk: { say, ...follow } };
}

const room = (w: number, h: number, matX: number) => [
  "W".repeat(w), "W".repeat(w),
  ...Array.from({ length: h - 3 }, () => "_".repeat(w)),
  "_".repeat(matX) + "M" + "_".repeat(w - matX - 1),
];

// ── Town Hall: who is Upanshu? Mayor, career timeline, skills, CV ──
export const hall: MapDef = {
  id: "hall",
  name: "Town Hall",
  outdoor: false,
  theme: { wall: RAMP.cream, wallpaper: "panel", floor: "check", floorRamp: RAMP.white, floorAlt: RAMP.stone, trim: RAMP.red },
  tiles: room(13, 10, 6),
  props: [
    // the career timeline runs left → right along the back wall
    portrait(0, RAMP.teal, ["The first frame on the wall. 2017 – 2019:\nA-LEVELS at GIHE, Kathmandu.", "The frames continue along the wall →"]),
    { kind: "diploma", x: 2, y: 0,
      talk: { say: ["A framed diploma. 2020 – 2023:\nBSc (Hons) Computing, The British College.\nFIRST CLASS HONOURS!"], then: { kind: "panel", id: "education" }, ask: "View EDUCATION?" } },
    portrait(4, RAMP.orange, ["AUG 2022 · AGILE SOLUTIONS\nTechnical Trainee."]),
    portrait(6, RAMP.orange, ["DEC 2022 · AGILE SOLUTIONS\nAssociate Technical Consultant."]),
    portrait(8, RAMP.orange, ["JUN 2023 · AGILE SOLUTIONS\nJr. Technical Consultant."]),
    portrait(10, RAMP.purple, ["OCT 2024 – JUN 2026 · VOYAGER NEPAL\nTechnical Consultant."],
      { then: { kind: "panel", id: "experience" }, ask: "View the full EXPERIENCE?" }),
    { kind: "portrait", x: 12, y: 0, opts: { empty: true },
      talk: {
        say: ["An empty frame with a brass label:\n\"RESERVED: NEXT ROLE\"", "Upanshu is open to new roles."],
        then: { kind: "panel", id: "contact" },
        ask: "See contact details?",
      } },
    ...[11, 12].map((x): PropDef => ({
      kind: "bookshelf", x, y: 3,
      talk: { say: ["The town records list every tool Upanshu\nuses, and where in town he used it."], then: { kind: "panel", id: "skills" }, ask: "Read the TECH STACK?" },
    })),
    { kind: "rug", x: 5, y: 3 },
    { kind: "desk", x: 1, y: 4, opts: { item: "cv" },
      talk: { say: ["A laptop and a freshly printed stack of\npages. The top one reads \"CV\"."], then: { kind: "resume" }, ask: "Open Upanshu's CV (PDF)?" } },
    { kind: "plant", x: 0, y: 7 },
    { kind: "plant", x: 12, y: 7 },
  ],
  npcs: [
    {
      id: "mayor", outfit: "mayor", x: 6, y: 4, dir: "down",
      talk: {
        say: [
          "Welcome to the TOWN HALL! I'm the mayor.\nThis town is named after its most\ninteresting resident.",
          "That's UPANSHU PANDEY: a Technical\nConsultant and Full-Stack Developer\nfrom Kathmandu, Nepal.",
          "His career hangs on the wall behind me,\nleft to right. And he's open to\nnew roles!",
        ],
        then: { kind: "panel", id: "about" },
        ask: "Read Upanshu's profile?",
      },
    },
  ],
  warps: [{ x: 6, y: 9, to: "town", spawn: "hall" }],
  spawns: { door: { x: 6, y: 8, dir: "up" } },
};

// ── The Platform: the flagship product, one station per part ──
export const platform: MapDef = {
  id: "platform",
  name: "The Platform",
  outdoor: false,
  theme: { wall: RAMP.stone, wallpaper: "panel", floor: "tile", floorRamp: RAMP.metal, trim: RAMP.orange },
  tiles: room(13, 12, 6),
  props: [
    ...[0, 1].map((x): PropDef => ({ kind: "server", x, y: 1,
      talk: { say: ["Racks of containers: ClickHouse, Qdrant,\nRedis, the ML service…\nEvery status light is green."] } })),
    { kind: "banner", x: 3, y: 0, opts: { glow: RAMP.purple, label: "AI" } },
    { kind: "window", x: 6, y: 0 },
    { kind: "banner", x: 8, y: 0, opts: { glow: RAMP.orange, label: "DATA" } },
    { kind: "plant", x: 12, y: 1 },
    { kind: "rug", x: 5, y: 3 },
    station("nl-query", 1, 5, RAMP.purple),
    station("rag", 3, 5, RAMP.purple),
    station("ml-service", 9, 5, RAMP.pink),
    station("saas-features", 11, 5, RAMP.orange),
    station("platform-services", 1, 8, RAMP.teal),
    station("front-end", 3, 8, RAMP.navy),
    station("data-backend", 9, 8, RAMP.orange),
    station("deployment", 11, 8, RAMP.teal),
  ],
  npcs: [
    {
      id: "engineer", outfit: "engineer", x: 6, y: 4, dir: "down",
      talk: {
        say: [
          "Welcome to THE PLATFORM!\nThis whole building is one product.",
          "An AI analytics platform for Business\nCentral: it reads a client's ERP data and\nanswers questions in plain English.",
          "Upanshu was a core developer on it. Each\nstation covers one part he built, or I\ncan give you the overview.",
        ],
        then: { kind: "building", id: "platform" },
        ask: "See the overview?",
      },
    },
  ],
  warps: [{ x: 6, y: 11, to: "town", spawn: "platform" }],
  spawns: { door: { x: 6, y: 10, dir: "up" } },
};

// ── Consultancy Office: client work as case files ──
export const consultancy: MapDef = {
  id: "consultancy",
  name: "Consultancy Office",
  outdoor: false,
  theme: { wall: RAMP.wall, wallpaper: "diamond", floor: "wood", floorRamp: RAMP.plank, trim: RAMP.navy },
  tiles: room(11, 10, 5),
  props: [
    caseFile("retail-group", 1, 1, RAMP.orange),
    caseFile("health-insurance", 2, 1, RAMP.red),
    caseFile("ird-localisation", 3, 1, RAMP.yellow),
    { kind: "window", x: 5, y: 0 },
    caseFile("warehouse-ext", 7, 1, RAMP.teal),
    caseFile("integrations", 8, 1, RAMP.navy),
    caseFile("amc-support", 9, 1, RAMP.purple),
    { kind: "plant", x: 0, y: 1 },
    { kind: "plant", x: 10, y: 1 },
    { kind: "desk", x: 7, y: 5, opts: { item: "papers" },
      talk: { say: ["A meeting table covered in requirement\ndocuments. Every page is annotated."] } },
    { kind: "sofa", x: 0, y: 6, talk: { say: ["The waiting area. There's a well-thumbed\nBusiness Central manual on the cushion."] } },
    { kind: "plant", x: 10, y: 7 },
  ],
  npcs: [
    {
      id: "consultant", outfit: "consultant", x: 5, y: 3, dir: "down",
      talk: {
        say: [
          "Welcome to the CONSULTANCY OFFICE!",
          "This is Upanshu's client work on Business\nCentral: upgrades, integrations,\nlocalisation and support.",
          "Each cabinet holds one case file, or I\ncan show you all of them.",
        ],
        then: { kind: "building", id: "consultancy" },
        ask: "See every case file?",
      },
    },
  ],
  warps: [{ x: 5, y: 9, to: "town", spawn: "consultancy" }],
  spawns: { door: { x: 5, y: 8, dir: "up" } },
};

// ── Observatory: academic and personal projects ──
export const observatory: MapDef = {
  id: "observatory",
  name: "Observatory",
  outdoor: false,
  theme: { wall: RAMP.navy, wallpaper: "plain", floor: "wood", floorRamp: RAMP.wood, trim: RAMP.yellow },
  tiles: room(9, 8, 4),
  props: [
    ...[0, 1].map((x): PropDef => ({ kind: "bookshelf", x, y: 1,
      talk: { say: ["Books on quantum computing and\nreinforcement learning, bristling\nwith bookmarks."] } })),
    { kind: "window", x: 4, y: 0 },
    { kind: "pc", x: 7, y: 1,
      talk: {
        say: ["The PC is running a Laravel web shop:\nfilters, a cart and online checkout.", "A personal project of Upanshu's."],
        then: { kind: "project", id: "ecommerce" },
        ask: "Read about the E-COMMERCE site?",
      } },
    { kind: "telescope", x: 3, y: 3,
      talk: {
        say: [
          "A big brass telescope. A label on it reads:\n\"QUANTUM RL CIRCUIT OPTIMIZER\"",
          "Upanshu's dissertation: an RL agent that\nlearns quantum circuits for a hidden\nbit string.",
        ],
        then: { kind: "project", id: "quantum" },
        ask: "Read about the project?",
      } },
    { kind: "desk", x: 0, y: 5, opts: { item: "papers" },
      talk: {
        say: ["A bound copy of the dissertation:\n\"Quantum Reinforcement Learning for\nQuantum Circuit Optimization\"", "It was graded FIRST CLASS."],
        then: { kind: "pdf", path: "assets/thesis/upanshu-pandey-qrl-thesis.pdf", fallback: "quantum" },
        ask: "Read the thesis (PDF)?",
      } },
    { kind: "plant", x: 8, y: 5 },
  ],
  npcs: [
    {
      id: "stargazer", outfit: "stargazer", x: 6, y: 4, dir: "down", wander: true,
      talk: {
        say: [
          "Shh… the stars are out.",
          "This is where Upanshu keeps his own work:\nhis First Class dissertation and a\npersonal project.",
        ],
        then: { kind: "building", id: "observatory" },
        ask: "See both projects?",
      },
    },
  ],
  warps: [{ x: 4, y: 7, to: "town", spawn: "observatory" }],
  spawns: { door: { x: 4, y: 6, dir: "up" } },
};

// ── Upanshu's House: the one place to get in touch ──
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
