// src/zones.ts
// ─── Zone definitions: spawn coordinates & Pokédex metadata ───
// Coordinates match the programmatic map in src/main.ts

export interface Zone {
  label: string;
  sub:   string;
  x:     number;
  y:     number;
}

export const ZONES: Record<string, Zone> = {
  "town-square": {
    label: "Town Square",
    sub:   "Spawn · Welcome",
    x:     440,   // center of the stone plaza
    y:     370,
  },
  "gym-frontend": {
    label: "Gym 1 — Frontend City",
    sub:   "Web & Full-Stack Projects",
    x:     680,   // between the two Gym 1 buildings
    y:     200,
  },
  "gym-systems": {
    label: "Gym 2 — Systems Hub",
    sub:   "ERP · Backend · Data",
    x:     700,   // center of Gym 2 zone
    y:     590,
  },
  "lab-about": {
    label: "Professor's Lab",
    sub:   "About · Skills · Resume",
    x:     220,   // front of the lab building
    y:     640,
  },
};
