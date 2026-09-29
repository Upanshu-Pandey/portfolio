// src/audio.ts
// ─── Chiptune SFX + a tiny looping town theme, synthesised with Web Audio ───
// Nothing plays until the first user input (browser autoplay rules).

import { isMuted, setMuted } from "./state.ts";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;

function audio(): AudioContext | null {
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = isMuted() ? 0 : 1;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

function tone(freq: number, dur: number, type: OscillatorType, vol: number, when = 0, slideTo?: number): void {
  const a = audio();
  if (!a || !master || isMuted()) return;
  const t = a.currentTime + when;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(master);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

export const sfx = {
  blip:    () => tone(620 + Math.random() * 40, 0.025, "square", 0.018),
  select:  () => tone(880, 0.04, "square", 0.03),
  confirm: () => { tone(660, 0.06, "square", 0.04); tone(990, 0.08, "square", 0.04, 0.06); },
  cancel:  () => tone(440, 0.08, "square", 0.035, 0, 300),
  open:    () => { tone(523, 0.07, "square", 0.035); tone(784, 0.1, "square", 0.035, 0.07); },
  bump:    () => tone(110, 0.09, "square", 0.05, 0, 70),
  hop:     () => tone(260, 0.16, "square", 0.04, 0, 520),
  door:    () => { tone(392, 0.07, "square", 0.04); tone(330, 0.07, "square", 0.04, 0.08); tone(262, 0.12, "square", 0.04, 0.16); },
  warp:    () => tone(300, 0.3, "triangle", 0.07, 0, 1200),
  jingle:  () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.12, "square", 0.04, i * 0.1)),
};

// ── Background music ────────────────────────────────────────────
// Eighth-note steps; 0 = rest. MIDI note numbers.
const LEAD = [
  72, 0, 76, 79, 0, 76, 79, 81,   79, 0, 76, 72, 0, 74, 76, 0,
  77, 0, 81, 84, 0, 81, 79, 77,   76, 0, 79, 0, 74, 0, 0, 0,
  72, 0, 76, 79, 0, 76, 79, 81,   79, 0, 84, 0, 83, 81, 79, 0,
  77, 0, 76, 0, 74, 0, 79, 0,     72, 0, 0, 0, 0, 0, 0, 0,
];
const BASS = [ // quarter notes
  48, 43, 48, 43,  48, 43, 48, 43,  41, 48, 41, 48,  43, 50, 43, 50,
  48, 43, 48, 43,  52, 48, 52, 48,  41, 48, 43, 50,  48, 43, 48, 0,
];
const STEP = 60 / 132 / 2;   // 132 BPM eighths
const midi = (n: number) => 440 * 2 ** ((n - 69) / 12);

let bgmTimer: ReturnType<typeof setInterval> | null = null;
let step = 0;
let nextTime = 0;

export function startMusic(): void {
  const a = audio();
  if (!a || bgmTimer) return;
  step = 0;
  nextTime = a.currentTime + 0.1;
  bgmTimer = setInterval(() => {
    if (!ctx) return;
    while (nextTime < ctx.currentTime + 0.25) {
      const when = nextTime - ctx.currentTime;
      const lead = LEAD[step % LEAD.length]!;
      if (lead) tone(midi(lead), STEP * 1.6, "square", 0.022, when);
      if (step % 2 === 0) {
        const bass = BASS[(step / 2) % BASS.length]!;
        if (bass) tone(midi(bass), STEP * 1.8, "triangle", 0.06, when);
      }
      step++;
      nextTime += STEP;
    }
  }, 60);
}

const muteListeners: ((muted: boolean) => void)[] = [];

export function onMuteChange(fn: (muted: boolean) => void): void {
  muteListeners.push(fn);
}

export function toggleMute(): boolean {
  const m = !isMuted();
  setMuted(m);
  muteListeners.forEach((fn) => fn(m));
  if (master && ctx) master.gain.setValueAtTime(m ? 0 : 1, ctx.currentTime);
  if (!m) { audio(); startMusic(); }
  return m;
}
