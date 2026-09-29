// src/art/palette.ts
// ─── Shared palette: 5-shade, hue-shifted ramps per material (GBA-era style) ───
// Each ramp runs dark → light: [0 outline/deepest, 1 shadow, 2 base-dark, 3 base, 4 highlight].
// Shadows lean cool (blue/purple), highlights lean warm, which is what makes GBA-era art glow.

import { hex, type RGBA } from "./pixel.ts";

export type Ramp = readonly [RGBA, RGBA, RGBA, RGBA, RGBA];

const r = (...h: string[]) => h.map((x) => hex(x)) as unknown as Ramp;

export const RAMP = {
  grass:   r("#2a6048", "#3f8a3e", "#5aac48", "#7cc85a", "#b0e478"),
  tall:    r("#1c4838", "#2c6c38", "#46923e", "#68b44c", "#98d468"),
  leaf:    r("#183c38", "#26603a", "#3c8a3c", "#5cb04a", "#98d86a"),
  bark:    r("#3a2428", "#5a3a2c", "#7e5434", "#a47444", "#c89a60"),
  path:    r("#8a6a48", "#b08e5e", "#cfae78", "#e6cc94", "#f6e6b8"),
  sand:    r("#9a7e58", "#c0a270", "#dcc088", "#eed8a0", "#fbf0c8"),
  water:   r("#284888", "#3868c0", "#5090e0", "#78b8f0", "#d0f0ff"),
  stone:   r("#4a4a5c", "#7a7a88", "#a2a2aa", "#c8c8c8", "#ececE4"),
  brick:   r("#6a4a4a", "#9a6c60", "#bc8c78", "#d8ac94", "#f0d0b8"),
  wood:    r("#40242a", "#6a4030", "#945e3c", "#bc8450", "#e0b070"),
  plank:   r("#6a4830", "#9a6c44", "#c0925c", "#dab078", "#f0d09c"),
  wall:    r("#6c6878", "#a8a4ac", "#d0ccc8", "#ecE8e0", "#fcfaf4"),
  cream:   r("#7a6858", "#b4a088", "#d8c8a8", "#efe4c8", "#fdf8e8"),
  roofRed: r("#4c1c2c", "#8a2c34", "#c04840", "#e07050", "#f8a878"),
  roofSlate: r("#283050", "#3c4c78", "#5870a0", "#7898c0", "#a8c4e0"),
  roofTeal: r("#18404c", "#206870", "#2c9490", "#48bcb0", "#88e0d0"),
  roofSteel: r("#303440", "#50586a", "#727c8e", "#98a2b2", "#c8d0dc"),
  glass:   r("#283c6c", "#3c64a0", "#5c94d0", "#90c4ec", "#e0f4ff"),
  metal:   r("#2c303c", "#4c5262", "#727a8a", "#9ca4b2", "#d4dae2"),
  red:     r("#501828", "#902838", "#d04848", "#f07868", "#ffb8a0"),
  yellow:  r("#6a4818", "#b07c20", "#e0b030", "#f8d858", "#fff4a8"),
  pink:    r("#6a2848", "#b04878", "#e070a0", "#f8a0c0", "#ffd8e8"),
  white:   r("#686c80", "#a0a4b8", "#d0d4e0", "#f0f0f4", "#ffffff"),
  purple:  r("#302050", "#50387c", "#7858a8", "#a080cc", "#d0b8f0"),
  teal:    r("#104040", "#1c6868", "#2c9a94", "#50c4b4", "#a0f0e0"),
  orange:  r("#5a2818", "#a04820", "#d87030", "#f09c48", "#ffd090"),
  skin:    r("#5a3028", "#9c5840", "#d08a60", "#f0b88a", "#fce0c0"),
  navy:    r("#141c38", "#202c58", "#34447c", "#4c64a4", "#7c98d0"),
} as const;

/** Legacy single colours, used by UI-ish art (text plates, LEDs) and outlines. */
export const C = {
  ink:     hex("#202838"),
  inkSoft: hex("#404858"),
  white:   hex("#ffffff"),
  shadow:  hex("#10182c", 70),
  shadowSoft: hex("#10182c", 40),
  light:   hex("#fff8d0", 70),
  void:    hex("#101018"),
} as const;

/** Map ramp digits '0'-'4' in a grid to colours, plus any extra keys. */
export function key(ramp: Ramp, extra: Record<string, RGBA> = {}): Record<string, RGBA> {
  return { "0": ramp[0], "1": ramp[1], "2": ramp[2], "3": ramp[3], "4": ramp[4], ...extra };
}

/** Build a grid key from `[ramp, shade]` pairs or plain colours. */
export function keys(map: Record<string, readonly [Ramp, number] | RGBA>): Record<string, RGBA> {
  const out: Record<string, RGBA> = {};
  for (const [k, v] of Object.entries(map)) out[k] = v.length === 2 ? (v[0] as Ramp)[v[1] as number]! : (v as RGBA);
  return out;
}
