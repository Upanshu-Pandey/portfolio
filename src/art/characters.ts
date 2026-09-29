// src/art/characters.ts
// ─── Overworld characters: 16×32 frames, 4 directions × 3 frames (stand, step A, step B) ───
// Sheet order: down0 down1 down2 up0 up1 up2 left0 left1 left2 right0 right1 right2
// Head (13 rows) sits on a body (13 rows); rows 0-5 are headroom so the sprite is ~26px tall.

import { Pix, hex, type RGBA } from "./pixel.ts";
import { RAMP, C, type Ramp } from "./palette.ts";

export const CHAR_W = 16;
export const CHAR_H = 32;
const HEAD_Y = 6;
const BODY_Y = 19;
export const DIRS = ["down", "up", "left", "right"] as const;
export type Dir = (typeof DIRS)[number];

// Keys: O outline · H/h/k hair (base/shade/shine) · A/a/q cap · S/s skin · E eye
//       C/c/d shirt (base/shade/shine) · P/p trousers · B shoes · W white

// ── Heads ───────────────────────────────────────────────────────
const CAP_DOWN = [
  ".....OOOOOO.....",
  "...OOqqAAAAOO...",
  "..OqqAAAAAAAaO..",
  "..OqAAAAWWAAaO..",
  ".OAAAAAAWWAAAaO.",
  ".OaaaaaaaaaaaaO.",
  ".OOhOOOOOOOOhOO.",
  ".OhHSSSSSSSSHhO.",
  ".OHSSSSSSSSSSHO.",
  ".OhSSESSSSESShO.",
  "..OSSESSSSESSO..",
  "..OsSSSSSSSSsO..",
  "...OOsSSSSsOO...",
];
const CAP_UP = [
  ".....OOOOOO.....",
  "...OOqqAAAAOO...",
  "..OqqAAAAAAAaO..",
  "..OqAAAAAAAAaO..",
  ".OAAAAAAAAAAAaO.",
  ".OaAAAAAAAAAaaO.",
  ".OhaaaaaaaaaahO.",
  ".OHHHHHHHHHHHhO.",
  ".OHkHHHHHHHkHhO.",
  ".OhHHHHHHHHHHhO.",
  "..OhHHHHHHHHhO..",
  "..OsShhhhhhSsO..",
  "...OOsSSSSsOO...",
];
const CAP_LEFT = [
  "......OOOOO.....",
  "....OOqqAAAOO...",
  "...OqqAAAAAAaO..",
  "...OqAAAAAAAaO..",
  "..OAAAAAAAAAAO..",
  "OOaaaaaaaaaaaaO.",
  ".OOOOSSSHhHHHhO.",
  "..OSSSSSHHHHHhO.",
  "..OSESSSsHHHHhO.",
  "..OSESSSShHHhO..",
  "..OSSSSSSShhO...",
  "...OsSSSSsOO....",
  "....OOsSsO......",
];
const HAIR_DOWN = [
  ".....OOOOOO.....",
  "...OOkHHHHHOO...",
  "..OkkHHHHHHHhO..",
  "..OkHHHHHHHHhO..",
  ".OHHHHHHHHHHHhO.",
  ".OHHHhHHHHhHHhO.",
  ".OhHhSSSSSShHhO.",
  ".OhHSSSSSSSSHhO.",
  ".OHSSSSSSSSSSHO.",
  ".OhSSESSSSESShO.",
  "..OSSESSSSESSO..",
  "..OsSSSSSSSSsO..",
  "...OOsSSSSsOO...",
];
const HAIR_UP = [
  ".....OOOOOO.....",
  "...OOkHHHHHOO...",
  "..OkkHHHHHHHhO..",
  "..OkHHHHHHHHhO..",
  ".OHHHHHHHHHHHhO.",
  ".OHkHHHHHHHkHhO.",
  ".OHHHHHHHHHHHhO.",
  ".OhHHHHHHHHHHhO.",
  ".OhHHHHHHHHHHhO.",
  ".OhhHHHHHHHHhhO.",
  "..OhhHHHHHHhhO..",
  "..OsShhhhhhSsO..",
  "...OOsSSSSsOO...",
];
const HAIR_LEFT = [
  "......OOOOO.....",
  "....OOkHHHHOO...",
  "...OkkHHHHHHhO..",
  "..OkHHHHHHHHhO..",
  "..OHHHHHHHHHHhO.",
  ".OHHHHHHHHHHHhO.",
  "..OhSSSHHHHHHhO.",
  "..OSSSSSHHHHHhO.",
  "..OSESSSsHHHHhO.",
  "..OSESSSShHHhO..",
  "..OSSSSSSShhO...",
  "...OsSSSSsOO....",
  "....OOsSsO......",
];

// ── Bodies ──────────────────────────────────────────────────────
const BODY_DOWN = [
  "...OOCCCCCCOO...",
  "..OdCCCCCCCCdO..",
  ".OdCCCCCCCCCCdO.",
  ".OCcCCCCCCCCcCO.",
  ".OCcCCCCCCCCcCO.",
  ".OSOcCCCCCCcOSO.",
  ".OSOccccccccOSO.",
  "..OOPPPPPPPPOO..",
  "...OPPPppPPPO...",
  "...OPPPOOPPPO...",
  "...OpPPOOPPpO...",
  "...OBBBOOBBBO...",
  "....OOO..OOO....",
];
const BODY_DOWN_STEP = [
  "...OOCCCCCCOO...",
  "..OdCCCCCCCCdO..",
  ".OdCCCCCCCCCCdO.",
  ".OCcCCCCCCCCcCO.",
  ".OCcCCCCCCCCcCO.",
  ".OSOcCCCCCCcOCO.",
  ".OSOccccccccOSO.",
  "..OOPPPPPPPPOSO.",
  "...OPPPppPPPOO..",
  "...OPPPOOPPPO...",
  "...OpPPOOBBBO...",
  "...OBBBO.OOO....",
  "....OOO.........",
];
const BODY_LEFT = [
  ".....OCCCCCO....",
  "....OCCCCCCCdO..",
  "....OCCcCCCCCdO.",
  "....OCCcCCCCCcO.",
  "....OCCcCCCCCcO.",
  "....OccSccccccO.",
  ".....OOOOOOOOO..",
  ".....OPPPPPpO...",
  ".....OPPPPPpO...",
  ".....OPPPPPpO...",
  ".....OPPOPPpO...",
  "....OBBBOBBBO...",
  ".....OOO.OOO....",
];
const BODY_LEFT_STEP = [
  ".....OCCCCCO....",
  "....OCCCCCCCdO..",
  "....OCSCCCCCCdO.",
  "...OSOcCCCCCCcO.",
  "....OOcCCCCCCcO.",
  "....OcccccccccO.",
  ".....OOOOOOOOO..",
  ".....OPPPPPpO...",
  "....OPPPOPPpO...",
  "...OPPPO.OPPpO..",
  "..OBBBO...OPPO..",
  "..OOOO....OBBBO.",
  "...........OOO..",
];

// ── Overlays: long hair, lab coat ──────────────────────────────
const LONG = {
  down: [".OhO........OhO.", ".OHO........OHO.", ".OHhO......OhHO.", "..OO........OO.."],
  up: ["..OHHHHHHHHHHO..", "..OhHHHHHHHHhO..", "..OhHHHHHHHHhO..", "...OhhhhhhhhO..."],
  left: ["........OHHhO...", "........OHHhO...", ".........OhO...."],
};
const COAT = {
  down: [
    "................",
    "...OWW....WWO...",
    "..OWWWW..WWWWO..",
    ".OwWWWW..WWWWvO.",
    ".OwWWWW..WWWWvO.",
    ".OSWWWW..WWWWSO.",
    ".OSWWWW..WWWWSO.",
    "..OWWWPPPPWWWO..",
    "..OwWWPppPWWvO..",
    "..OOOOPOOPOOOO..",
  ],
  up: [
    "................",
    "..OWWWWWWWWWWO..",
    ".OwWWWWWWWWWWvO.",
    ".OwWWWWWWWWWWvO.",
    ".OwWWWWvWWWWWvO.",
    ".OSWWWWvWWWWWSO.",
    ".OSWWWWvWWWWWSO.",
    "..OWWWWvWWWWWO..",
    "..OwWWWvWWWWvO..",
    "..OOOOOOOOOOOO..",
  ],
  left: [
    "................",
    ".....OWWCCWWO...",
    "....OwWWCCWWvO..",
    "....OwWWCCWWvO..",
    "....OwWWCCWWvO..",
    "....OwSWCCWWvO..",
    "....OWWWWWWWWO..",
    "....OWWPPPPWWO..",
    "....OwWPPPpWvO..",
    "....OOOPOPpOOO..",
  ],
};

export interface Outfit {
  head: "cap" | "hair";
  long?: boolean;
  coat?: boolean;
  hair: Ramp;
  shirt: Ramp;
  pants: Ramp;
  cap?: Ramp;
  skin?: Ramp;
  shoes?: RGBA;
}

function keyFor(o: Outfit): Record<string, RGBA> {
  const skin = o.skin ?? RAMP.skin, cap = o.cap ?? RAMP.red;
  return {
    O: C.ink, E: C.ink, W: RAMP.white[4],
    H: o.hair[3], h: o.hair[1], k: o.hair[4],
    A: cap[3], a: cap[1], q: cap[4],
    S: skin[3], s: skin[2],
    C: o.shirt[3], c: o.shirt[1], d: o.shirt[4],
    P: o.pants[3], p: o.pants[1],
    B: o.shoes ?? RAMP.wood[1],
  };
}

function frame(o: Outfit, dir: "down" | "up" | "left", step: boolean, flip: boolean): Pix {
  const k = keyFor(o);
  const p = new Pix(CHAR_W, CHAR_H);
  const head = o.head === "cap"
    ? { down: CAP_DOWN, up: CAP_UP, left: CAP_LEFT }[dir]
    : { down: HAIR_DOWN, up: HAIR_UP, left: HAIR_LEFT }[dir];
  const body = dir === "left" ? (step ? BODY_LEFT_STEP : BODY_LEFT) : step ? BODY_DOWN_STEP : BODY_DOWN;
  const bob = step ? 1 : 0;
  // lab coat goes over the body; long hair drapes over the shoulders
  p.grid(body, k, 0, BODY_Y, flip);
  if (o.coat) p.grid(COAT[dir], { ...k, W: RAMP.white[3], w: RAMP.white[4], v: RAMP.white[2] }, 0, BODY_Y, flip);
  p.grid(head, k, 0, HEAD_Y + bob, flip);
  if (o.long) p.grid(LONG[dir], k, 0, HEAD_Y + 11 + bob, flip);
  return p;
}

/** Build a 12-frame walk sheet (192×32). Step B mirrors step A, like the GBA games. */
export function buildCharacter(o: Outfit): Pix {
  return Pix.row([
    frame(o, "down", false, false), frame(o, "down", true, false), frame(o, "down", true, true),
    frame(o, "up", false, false), frame(o, "up", true, false), frame(o, "up", true, true),
    frame(o, "left", false, false), frame(o, "left", true, false), frame(o, "left", false, false),
    frame(o, "left", false, true), frame(o, "left", true, true), frame(o, "left", false, true),
  ]);
}

/** Soft oval shadow drawn under every actor. */
export function actorShadow(): Pix {
  const p = new Pix(16, 6);
  for (let y = 0; y < 6; y++)
    for (let x = 0; x < 16; x++)
      if (((x + 0.5 - 8) / 6.5) ** 2 + ((y + 0.5 - 3) / 2.2) ** 2 <= 1) p.px(x, y, C.shadow);
  return p;
}

// ── Cast ────────────────────────────────────────────────────────
const ramp = (...h: string[]) => h.map((x) => hex(x)) as unknown as Ramp;

const BROWN = ramp("#2a1818", "#4a2c20", "#6a4028", "#8a5634", "#b07a4c");
const BLACK = ramp("#101018", "#20202c", "#303040", "#44445a", "#6a6a84");
const GREY = ramp("#585868", "#8a8a98", "#b0b0bc", "#d0d0d8", "#f0f0f4");
const BLONDE = ramp("#6a4818", "#a07828", "#c8a038", "#e8c860", "#fff0a0");
const AUBURN = ramp("#40181c", "#78302c", "#a04834", "#c46840", "#e89c68");
const DENIM = ramp("#182448", "#283c70", "#3c5898", "#5476bc", "#88a8e0");
const CHARCOAL = ramp("#181c24", "#2c303c", "#404654", "#585e6e", "#808898");
const KHAKI = ramp("#4a3c24", "#6e5a34", "#8e7646", "#ac925a", "#d0b87e");

export const OUTFITS: Record<string, Outfit> = {
  player:    { head: "cap", hair: BROWN, cap: RAMP.red, shirt: RAMP.teal, pants: DENIM },
  pine:      { head: "hair", coat: true, hair: GREY, shirt: RAMP.navy, pants: KHAKI },
  aide:      { head: "hair", coat: true, long: true, hair: AUBURN, shirt: RAMP.pink, pants: CHARCOAL },
  guide:     { head: "hair", hair: BLACK, shirt: RAMP.orange, pants: KHAKI },
  mom:       { head: "hair", long: true, hair: AUBURN, shirt: RAMP.pink, pants: DENIM },
  leadWeb:   { head: "hair", hair: BLONDE, shirt: RAMP.navy, pants: CHARCOAL },
  leadSys:   { head: "hair", long: true, hair: BLACK, shirt: RAMP.orange, pants: CHARCOAL },
  kid:       { head: "cap", hair: BLACK, cap: RAMP.white, shirt: RAMP.yellow, pants: DENIM },
  walker:    { head: "hair", long: true, hair: BLONDE, shirt: RAMP.teal, pants: RAMP.red },
};
