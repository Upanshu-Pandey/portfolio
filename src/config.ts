// src/config.ts
// ─── Shared constants ───

export const TILE = 16;
export const WALK_TIME = 0.24;      // seconds per tile
export const RUN_TIME = 0.13;
export const HOP_TIME = 0.42;       // ledge jump (two tiles)
export const TURN_GRACE = 0.09;     // tap shorter than this = turn in place

/**
 * Pixel scale for the full-page view. Aim for at least a GBA-sized view (240×160 game px);
 * integer scales keep pixels perfectly square, narrow phones fall back to ~11 tiles across.
 */
export function pickScale(w = window.innerWidth, h = window.innerHeight): number {
  const gba = Math.min(w / 240, h / 160);
  if (gba >= 3) return Math.floor(gba);
  return Math.max(1.5, Math.max(gba, Math.min(w / 176, h / 176)));
}

/** Resolve a public asset path against Vite's base (works under /portfolio/ on GitHub Pages). */
export function asset(path: string): string {
  return import.meta.env.BASE_URL + path.replace(/^\//, "");
}
