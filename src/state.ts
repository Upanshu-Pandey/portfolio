// src/state.ts
// ─── Small persisted state: projects viewed and sound preference ───
// localStorage can be unavailable (private mode, blocked storage) — always degrade gracefully.

const KEY = "upanshu-portfolio:v1";

interface Saved {
  seen: string[];
  muted: boolean;
}

function load(): Saved {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { seen: [], muted: false, ...JSON.parse(raw) };
  } catch { /* storage unavailable */ }
  return { seen: [], muted: false };
}

const saved = load();

function save(): void {
  try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch { /* ignore */ }
}

export function markSeen(id: string): void {
  if (!saved.seen.includes(id)) { saved.seen.push(id); save(); }
}

export function isSeen(id: string): boolean {
  return saved.seen.includes(id);
}

export function isMuted(): boolean {
  return saved.muted;
}

export function setMuted(m: boolean): void {
  saved.muted = m;
  save();
}
