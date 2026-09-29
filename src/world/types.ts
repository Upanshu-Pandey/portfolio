// src/world/types.ts
// ─── Map data model: ASCII terrain + props, NPCs, warps and interactions ───

import type { Dir } from "../art/characters.ts";
import type { PropOpts } from "../art/props.ts";
import type { Theme } from "../art/tiles.ts";
import type { PanelId } from "../content.ts";

export type { Dir };
export type MapId = "town" | "lab" | "webWorkshop" | "systemsWorks" | "house";

/** What happens after the dialogue, behind a YES/NO prompt. */
export type Follow =
  | { kind: "project"; id: string }
  | { kind: "hall"; building: "web" | "systems" }
  | { kind: "panel"; id: PanelId }
  | { kind: "resume" }
  | { kind: "menu" };

export interface Interaction {
  say: string[];            // dialogue pages (\n = line break within a page)
  then?: Follow;
  ask?: string;             // prompt shown with the YES/NO box
}

export interface PropDef {
  kind: string;
  x: number;
  y: number;
  opts?: PropOpts;
  talk?: Interaction;       // interacting with any solid tile of the prop
}

export interface NpcDef {
  id: string;
  outfit: string;
  x: number;
  y: number;
  dir: Dir;
  talk: Interaction;
  wander?: boolean;         // look around / step within 1 tile of home
}

export interface MapDef {
  id: MapId;
  name: string;
  outdoor: boolean;
  theme?: Theme;
  tiles: string[];
  props: PropDef[];
  npcs: NpcDef[];
  /** Interaction spots with no art of their own (e.g. on a wall). */
  spots?: { x: number; y: number; talk: Interaction }[];
  warps: { x: number; y: number; to: MapId; spawn: string }[];
  spawns: Record<string, { x: number; y: number; dir: Dir }>;
}
