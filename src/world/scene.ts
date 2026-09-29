// src/world/scene.ts
// ─── The one KAPLAY scene: any map, tile-grid movement, NPCs, ledges, warps, camera ───

import type { KAPLAYCtx, GameObj, SpriteComp, PosComp, ZComp, OpacityComp } from "kaplay";
import { TILE, WALK_TIME, RUN_TIME, TURN_GRACE, HOP_TIME } from "../config.ts";
import { DIRS, type Dir } from "../art/characters.ts";
import { getMap } from "../art/index.ts";
import { MAPS } from "./maps/index.ts";
import type { MapId, NpcDef } from "./types.ts";
import { isHeld, uiActive, pushHandler, setWorldHandler, releaseAll, type Button } from "../input.ts";
import { sfx } from "../audio.ts";
import { runInteraction } from "../ui/interact.ts";
import { openMenu } from "../ui/menu.ts";
import { fade, showBanner } from "../ui/screen.ts";

const STEP: Record<Dir, [number, number]> = { down: [0, 1], up: [0, -1], left: [-1, 0], right: [1, 0] };
const OPPOSITE: Record<Dir, Dir> = { down: "up", up: "down", left: "right", right: "left" };

type Sprite = GameObj<SpriteComp | PosComp | ZComp>;
type Plain = GameObj<PosComp | ZComp | OpacityComp>;

interface Actor {
  obj: Sprite;
  shadow: Plain;
  x: number;              // current tile
  y: number;
  dir: Dir;
  moving: boolean;
  tx: number;             // target tile while moving
  ty: number;
  t: number;              // 0..1 progress of the current step
  stepTime: number;
  hop: boolean;           // jumping down a ledge
  foot: boolean;          // alternates which foot steps forward
}

export interface GoArgs { map: MapId; spawn: string }

let transitioning = false;

/** Fade out, switch map, fade in. Input is locked for the duration. */
export async function goTo(k: KAPLAYCtx, args: GoArgs): Promise<void> {
  if (transitioning) return;
  transitioning = true;
  const pop = pushHandler(() => {});
  releaseAll();
  await fade(1);
  k.go("map", args);
  await new Promise((r) => setTimeout(r, 60));
  await fade(0);
  pop();
  transitioning = false;
}

export function registerMapScene(k: KAPLAYCtx): void {
  k.scene("map", ({ map: mapId, spawn }: GoArgs) => {
    const def = MAPS[mapId];
    const built = getMap(mapId);
    const mw = built.w * TILE, mh = built.h * TILE;
    const M = built.margin * TILE;

    // ── Ground layer (pre-rendered, 3 animation frames, incl. forest margin) ──
    const ground = k.add([k.sprite(`map-${mapId}`, { frame: 0 }), k.pos(-M, -M), k.z(0)]);
    const over = k.add([k.sprite(`over-${mapId}`, { frame: 0 }), k.pos(-M, -M), k.z(1000)]);
    let animT = 0;
    const ANIM = [0, 1, 2, 1];
    k.onUpdate(() => {
      animT += k.dt();
      ground.frame = over.frame = ANIM[Math.floor(animT / 0.4) % ANIM.length]!;
    });

    // ── Actors ──
    const makeActor = (sheet: string, x: number, y: number, dir: Dir): Actor => {
      const shadow = k.add([k.sprite("shadow"), k.pos(0, 0), k.z(5), k.opacity(1)]) as unknown as Plain;
      const obj = k.add([k.sprite(`char-${sheet}`, { frame: 0 }), k.pos(0, 0), k.z(10)]) as Sprite;
      const a: Actor = { obj, shadow, x, y, dir, moving: false, tx: x, ty: y, t: 0, stepTime: WALK_TIME, hop: false, foot: false };
      place(a);
      return a;
    };

    const place = (a: Actor) => {
      const e = a.moving ? a.t : 0;
      const fx = a.x + (a.tx - a.x) * e;
      const fy = a.y + (a.ty - a.y) * e;
      const lift = a.hop ? Math.sin(Math.PI * e) * 10 : 0;
      a.obj.pos.x = Math.round(fx * TILE);
      a.obj.pos.y = Math.round(fy * TILE - 16 - lift);     // 32px sprite: feet on the tile's bottom edge
      a.obj.z = 10 + fy;
      a.shadow.pos.x = a.obj.pos.x;
      a.shadow.pos.y = Math.round(fy * TILE) + 12;
      const stepping = a.moving && (a.hop ? a.t < 0.8 : a.t < 0.5);
      a.obj.frame = DIRS.indexOf(a.dir) * 3 + (stepping ? (a.foot ? 1 : 2) : 0);
    };

    const npcs: { a: Actor; def: NpcDef; timer: number }[] = def.npcs.map((n) => ({
      a: makeActor(n.outfit, n.x, n.y, n.dir),
      def: n,
      timer: 1 + Math.random() * 3,
    }));

    const start = def.spawns[spawn] ?? Object.values(def.spawns)[0]!;
    const player = makeActor("player", start.x, start.y, start.dir);

    // tall-grass overlay hides the player's feet
    const grassOver = k.add([k.sprite("grass-over"), k.pos(0, 0), k.z(11), k.opacity(0)]) as unknown as Plain;

    // ── Collision ──
    const inBounds = (x: number, y: number) => x >= 0 && y >= 0 && x < built.w && y < built.h;
    const occupied = (x: number, y: number, self?: Actor) =>
      [player, ...npcs.map((n) => n.a)].some((a) =>
        a !== self && ((a.x === x && a.y === y) || (a.moving && a.tx === x && a.ty === y)));
    const blocked = (x: number, y: number, self?: Actor) =>
      !inBounds(x, y) || built.solid[built.idx(x, y)]! || occupied(x, y, self);

    const begin = (a: Actor, tx: number, ty: number, time: number, hop = false) => {
      a.moving = true;
      a.tx = tx;
      a.ty = ty;
      a.t = 0;
      a.stepTime = time;
      a.hop = hop;
      a.foot = !a.foot;
    };

    const tryStep = (a: Actor, dir: Dir, stepTime: number): boolean => {
      a.dir = dir;
      const [dx, dy] = STEP[dir];
      const nx = a.x + dx, ny = a.y + dy;
      // one-way ledge: only the player, only downward, landing two tiles below
      if (a === player && dir === "down" && inBounds(nx, ny) && built.ledge[built.idx(nx, ny)] && !blocked(nx, ny + 1, a)) {
        begin(a, nx, ny + 1, HOP_TIME, true);
        sfx.hop();
        return true;
      }
      if (blocked(nx, ny, a)) return false;
      begin(a, nx, ny, stepTime);
      return true;
    };

    const advance = (a: Actor, dt: number): boolean => {
      if (!a.moving) return false;
      a.t += dt / a.stepTime;
      if (a.t < 1) return false;
      a.x = a.tx;
      a.y = a.ty;
      a.moving = false;
      a.hop = false;
      a.t = 0;
      return true;     // arrived
    };

    // ── Player control ──
    let turnUntil = 0;
    let lastBump = 0;
    let wasWalking = false;
    const heldDir = (): Dir | null => {
      for (const d of ["up", "down", "left", "right"] as const) if (isHeld(d)) return d;
      return null;
    };

    const onArrive = () => {
      const warp = def.warps.find((w) => w.x === player.x && w.y === player.y);
      if (!warp) return false;
      sfx.door();
      void goTo(k, { map: warp.to, spawn: warp.spawn });
      return true;
    };

    k.onUpdate(() => {
      const dt = k.dt();
      const now = k.time();

      if (advance(player, dt) && onArrive()) { place(player); return; }

      if (!player.moving && !uiActive() && !transitioning) {
        const d = heldDir();
        if (d) {
          const run = isHeld("b");
          if (d !== player.dir && now >= turnUntil && !wasWalking) {
            player.dir = d;                     // tap = turn in place
            turnUntil = now + TURN_GRACE;
          } else if (now >= turnUntil) {
            if (!tryStep(player, d, run ? RUN_TIME : WALK_TIME) && now - lastBump > 0.35) {
              sfx.bump();
              lastBump = now;
            }
          }
        }
      }
      wasWalking = player.moving;
      place(player);

      // tall-grass overlay follows the player's (landing) tile
      const late = player.moving && player.t > 0.5;
      const gx = late ? player.tx : player.x, gy = late ? player.ty : player.y;
      grassOver.opacity = !player.hop && inBounds(gx, gy) && built.tallGrass[built.idx(gx, gy)] ? 1 : 0;
      grassOver.pos.x = player.obj.pos.x;
      grassOver.pos.y = player.obj.pos.y + 16;
      grassOver.z = player.obj.z + 0.5;

      // NPCs idle: occasionally look around or take a step near home
      for (const n of npcs) {
        advance(n.a, dt);
        if (!uiActive() && n.def.wander && !n.a.moving) {
          n.timer -= dt;
          if (n.timer <= 0) {
            n.timer = 1.5 + Math.random() * 3;
            const d = DIRS[Math.floor(Math.random() * 4)]!;
            const [dx, dy] = STEP[d];
            const nx = n.a.x + dx, ny = n.a.y + dy;
            if (Math.random() < 0.5 && Math.abs(nx - n.def.x) <= 1 && Math.abs(ny - n.def.y) <= 1) tryStep(n.a, d, WALK_TIME * 1.3);
            else n.a.dir = d;
          }
        }
        place(n.a);
      }

      // camera: follow, clamped to the playable map; centred when the map is smaller than the view
      const vw = k.width(), vh = k.height();
      const px = player.obj.pos.x + 8, py = Math.round(player.shadow.pos.y) - 4;
      const cx = mw <= vw ? mw / 2 : Math.min(Math.max(px, vw / 2), mw - vw / 2);
      const cy = mh <= vh ? mh / 2 : Math.min(Math.max(py, vh / 2), mh - vh / 2);
      k.setCamPos(Math.round(cx), Math.round(cy));
    });

    // ── A button: talk to whatever the player faces ──
    const interact = () => {
      if (player.moving || transitioning) return;
      const [dx, dy] = STEP[player.dir];
      const fx = player.x + dx, fy = player.y + dy;
      const npc = npcs.find((n) => (n.a.x === fx && n.a.y === fy) || (n.a.moving && n.a.tx === fx && n.a.ty === fy));
      if (npc) {
        npc.a.dir = OPPOSITE[player.dir];
        place(npc.a);
        void runInteraction(npc.def.talk);
        return;
      }
      if (!inBounds(fx, fy)) return;
      const talk = built.talk.get(built.idx(fx, fy));
      if (talk) void runInteraction(talk);
    };

    setWorldHandler((btn: Button) => {
      if (btn === "a") interact();
      else if (btn === "start") void openMenu();
    });

    if (document.body.classList.contains("playing")) showBanner(def.name);
  });
}
