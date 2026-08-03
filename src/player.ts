// src/player.ts
// ─── Player spawning, WASD movement, animation, camera ───

import type { KAPLAYCtx, GameObj } from "kaplay";
import nipplejs from "nipplejs";

const SPEED = 90;

let joystick = { x: 0, y: 0 };

export function initMobileJoystick(): void {
  if (window.innerWidth > 768) return;

  const zone = document.getElementById("joystick-zone")!;
  const manager = nipplejs.create({
    zone,
    mode:        "dynamic",
    restOpacity: 0.5,
    color:       "#cc0000",
    size:        80,
  });

  (manager as any).on("move", (_: unknown, data: any) => {
    if (!data.vector) return;
    joystick = { x: data.vector.x, y: data.vector.y };
  });
  (manager as any).on("end", () => { joystick = { x: 0, y: 0 }; });
}

export function spawnPlayer(k: KAPLAYCtx, spawnX: number, spawnY: number): GameObj {
  // The sprite is 1024×1024 for a 4×4 grid → each frame is 256×256 px
  // We scale it down to 16px wide at game resolution via the scale component
  const FRAME_PX = 256; // actual pixels per frame in the PNG
  const TARGET_PX = 16; // desired on-screen size (in KAPLAY game units)
  const S = TARGET_PX / FRAME_PX;

  const player = k.add([
    k.sprite("player", { anim: "idle-down" }),
    k.pos(spawnX, spawnY),
    k.scale(S),
    // Feet-only hitbox for natural depth illusion
    // In game units after scaling: 12×6 box at bottom of sprite
    k.area({ shape: new k.Rect(k.vec2(-6, 4), 12, 6) }),
    k.body(),
    k.anchor("center"),
    k.z(10),
    "player",
  ]);

  let lastDir = "down";

  k.onUpdate(() => {
    let vx = 0;
    let vy = 0;

    // ── Keyboard input ──
    if (k.isKeyDown("left")  || k.isKeyDown("a"))  { vx = -SPEED; lastDir = "left";  }
    if (k.isKeyDown("right") || k.isKeyDown("d"))  { vx =  SPEED; lastDir = "right"; }
    if (k.isKeyDown("up")    || k.isKeyDown("w"))  { vy = -SPEED; lastDir = "up";    }
    if (k.isKeyDown("down")  || k.isKeyDown("s"))  { vy =  SPEED; lastDir = "down";  }

    // ── Joystick input (mobile) — overrides keyboard ──
    if (joystick.x !== 0 || joystick.y !== 0) {
      vx = joystick.x * SPEED;
      vy = -joystick.y * SPEED; // NippleJS Y is inverted vs canvas Y
      if      (Math.abs(vx) > Math.abs(vy)) lastDir = vx > 0 ? "right" : "left";
      else if (vy !== 0)                    lastDir = vy > 0 ? "down"  : "up";
    }

    // ── Play animation ──
    const moving = vx !== 0 || vy !== 0;
    const anim   = moving ? `walk-${lastDir}` : `idle-${lastDir}`;
    if (player.getCurAnim()?.name !== anim) player.play(anim);

    player.move(vx, vy);

    // ── Camera follows player ──
    k.camPos(player.pos);
  });

  return player;
}

export function teleportPlayer(player: GameObj, k: KAPLAYCtx, x: number, y: number): void {
  player.pos = k.vec2(x, y);
  k.camPos(player.pos);
}
