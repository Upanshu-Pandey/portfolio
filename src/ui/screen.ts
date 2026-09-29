// src/ui/screen.ts
// ─── Screen sizing (crisp integer scaling), fades, area banner, title screen, HUD, touch pad ───

import { press, release, pushHandler, uiActive, type Button } from "../input.ts";
import { sfx, startMusic, toggleMute, onMuteChange } from "../audio.ts";
import { isMuted } from "../state.ts";
import { openMenu } from "./menu.ts";
import { openResume } from "./panel.ts";

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

// ── Full-page screen: expose the game-pixel size to CSS ─────────
/** In-game UI (text box, menus) is sized in game pixels; capped so it stays sensible on huge screens. */
export function initScreen(scale: number): void {
  document.documentElement.style.setProperty("--px", `${Math.min(scale, 4)}px`);
}

// ── Fade to black between maps ──────────────────────────────────
export function fade(to: 0 | 1, ms = 220): Promise<void> {
  const el = $("fade");
  el.style.transitionDuration = `${ms}ms`;
  el.style.opacity = String(to);
  return new Promise((r) => setTimeout(r, ms));
}

// ── Location banner ─────────────────────────────────────────────
let bannerTimer: ReturnType<typeof setTimeout> | null = null;
export function showBanner(name: string): void {
  const el = $("area-banner");
  el.textContent = name;
  el.classList.remove("show");
  void el.offsetWidth;          // restart the slide-in animation
  el.classList.add("show");
  if (bannerTimer) clearTimeout(bannerTimer);
  bannerTimer = setTimeout(() => el.classList.remove("show"), 2200);
}

// ── HUD buttons ─────────────────────────────────────────────────
export function initHud(): void {
  const sound = $("sound-btn");
  const paintSound = () => {
    sound.textContent = isMuted() ? "♪ OFF" : "♪ ON";
    sound.setAttribute("aria-pressed", String(!isMuted()));
  };
  paintSound();
  sound.addEventListener("click", () => toggleMute());
  onMuteChange(paintSound);

  $("menu-btn").addEventListener("click", () => {
    if (!uiActive()) void openMenu();
  });
}

// ── Title screen ────────────────────────────────────────────────
export function showTitle(onStart: () => void): void {
  const title = $("title");
  title.hidden = false;
  let started = false;

  const start = async () => {
    if (started) return;
    started = true;
    pop();
    sfx.confirm();
    startMusic();
    title.classList.add("leaving");
    await new Promise((r) => setTimeout(r, 400));
    title.hidden = true;
    onStart();
  };

  const pop = pushHandler((btn) => { if (btn === "a" || btn === "start") void start(); });
  $("title-start").addEventListener("click", () => void start());
  $("title-resume").addEventListener("click", async (e) => {
    e.stopPropagation();
    await openResume();
  });
}

// ── Touch controls (D-pad + A/B + START) ────────────────────────
export function initTouch(): void {
  const pad = $("dpad");
  let dir: Button | null = null;

  const setDir = (d: Button | null) => {
    if (d === dir) return;
    if (dir) release(dir);
    dir = d;
    if (d) press(d);
  };
  const fromPoint = (e: PointerEvent): Button | null => {
    const r = pad.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    if (Math.hypot(dx, dy) < r.width * 0.12) return null;
    return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up");
  };

  pad.addEventListener("pointerdown", (e) => { pad.setPointerCapture(e.pointerId); setDir(fromPoint(e)); e.preventDefault(); });
  pad.addEventListener("pointermove", (e) => { if (pad.hasPointerCapture(e.pointerId)) setDir(fromPoint(e)); });
  const end = () => setDir(null);
  pad.addEventListener("pointerup", end);
  pad.addEventListener("pointercancel", end);

  document.querySelectorAll<HTMLElement>("[data-btn]").forEach((el) => {
    const btn = el.dataset.btn as Button;
    el.addEventListener("pointerdown", (e) => { e.preventDefault(); el.classList.add("down"); press(btn); });
    const up = () => { el.classList.remove("down"); release(btn); };
    el.addEventListener("pointerup", up);
    el.addEventListener("pointerleave", up);
    el.addEventListener("pointercancel", up);
  });
}
