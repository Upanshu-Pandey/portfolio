// src/world/maps/index.ts
import type { MapDef, MapId } from "../types.ts";
import { town } from "./town.ts";
import { hall, platform, consultancy, observatory, house } from "./interiors.ts";

export const MAPS: Record<MapId, MapDef> = { town, hall, platform, consultancy, observatory, house };
