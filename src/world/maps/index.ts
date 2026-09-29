// src/world/maps/index.ts
import type { MapDef, MapId } from "../types.ts";
import { town } from "./town.ts";
import { lab, webWorkshop, systemsWorks, house } from "./interiors.ts";

export const MAPS: Record<MapId, MapDef> = { town, lab, webWorkshop, systemsWorks, house };
