// src/ui.ts
// ─── DOM UI: dialogue box, project modals, Pokédex, audio ───

import type { KAPLAYCtx } from "kaplay";
import { MODAL_CONTENT, TRIGGER_DIALOGUE } from "./content";

// ── Retro Web Audio SFX Synthesizer ─────────────────────────────

let audioCtx: AudioContext | null = null;
let isMuted = false;

function getAudioContext(): AudioContext | null {
  if (isMuted) return null;
  if (!audioCtx && typeof window !== "undefined") {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function playTypewriterBlip(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(480 + Math.random() * 60, ctx.currentTime);
    gain.gain.setValueAtTime(0.015, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.03);
  } catch {}
}

export function playModalOpenSFX(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(523.25, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch {}
}

export function playTeleportSFX(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(880, ctx.currentTime + 0.18);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.22);
  } catch {}
}

// ── Dialogue Box ──────────────────────────────────────────────

let dialogueTyping = false;
let dialogueInterval: ReturnType<typeof setInterval> | null = null;
let onDialogueDone: (() => void) | null = null;

export function showDialogue(key: string, done?: () => void): void {
  const text = TRIGGER_DIALOGUE[key] ?? key;
  onDialogueDone = done ?? null;

  const box  = document.getElementById("dialogue-box")!;
  const para = document.getElementById("dialogue-text")!;

  box.classList.remove("hidden");
  para.textContent = "";

  if (dialogueInterval) clearInterval(dialogueInterval);

  let i = 0;
  dialogueTyping = true;
  dialogueInterval = setInterval(() => {
    if (i < text.length) {
      para.textContent += text[i++];
      if (i % 2 === 0) playTypewriterBlip();
    } else {
      clearInterval(dialogueInterval!);
      dialogueInterval = null;
      dialogueTyping = false;
    }
  }, 35);
}

export function dismissDialogue(): void {
  const box  = document.getElementById("dialogue-box")!;
  const para = document.getElementById("dialogue-text")!;

  // If still typing — skip to full text first
  if (dialogueTyping && dialogueInterval) {
    clearInterval(dialogueInterval);
    dialogueInterval = null;
    dialogueTyping = false;
    // show remaining text
    const key = para.dataset.key ?? "";
    const fullText = TRIGGER_DIALOGUE[key] ?? "";
    if (fullText) para.textContent = fullText;
    return; // wait for second SPACE to dismiss
  }

  box.classList.add("hidden");
  para.textContent = "";
  onDialogueDone?.();
  onDialogueDone = null;
}

export function isDialogueOpen(): boolean {
  return !document.getElementById("dialogue-box")!.classList.contains("hidden");
}

// ── Project Modal ─────────────────────────────────────────────

export function openProjectModal(triggerName: string): void {
  const data = MODAL_CONTENT[triggerName];
  if (!data) return;

  const modal   = document.getElementById("project-modal")!;
  const zoneTag = document.getElementById("modal-zone-tag")!;
  const title   = document.getElementById("modal-title")!;
  const body    = document.getElementById("modal-body")!;
  const tags    = document.getElementById("modal-tags")!;

  zoneTag.textContent = data.zone;
  title.textContent   = data.title;
  body.textContent    = data.body;

  tags.innerHTML = data.tags
    .map(t => `<span class="tag">${t}</span>`)
    .join("");

  playModalOpenSFX();
  modal.classList.remove("hidden");
}

export function closeProjectModal(): void {
  document.getElementById("project-modal")!.classList.add("hidden");
}

// ── Pokédex Fast-Travel ───────────────────────────────────────

export function initPokedex(teleportFn: (zone: string) => void): void {
  const openBtn  = document.getElementById("pokedex-btn")!;
  const modal    = document.getElementById("pokedex-modal")!;
  const closeBtn = document.getElementById("pokedex-close")!;
  const items    = document.querySelectorAll<HTMLElement>(".pokedex-item");

  const open  = () => {
    playModalOpenSFX();
    modal.classList.remove("hidden");
  };
  const close = () => modal.classList.add("hidden");

  openBtn.addEventListener("click", open);
  closeBtn.addEventListener("click", close);
  modal.querySelector(".modal-backdrop")!.addEventListener("click", close);

  items.forEach(item => {
    item.addEventListener("click", () => {
      const zone = item.dataset.zone!;
      close();
      playTeleportSFX();
      teleportFn(zone);
    });
  });

  // ESC key toggles Pokédex (or closes any open modal)
  window.addEventListener("keydown", e => {
    if (e.key !== "Escape") return;
    if (!document.getElementById("pokedex-modal")!.classList.contains("hidden")) {
      close();
    } else if (!document.getElementById("project-modal")!.classList.contains("hidden")) {
      closeProjectModal();
    } else {
      open();
    }
  });
}

// ── Project modal close button ────────────────────────────────

export function initProjectModal(): void {
  const closeBtn  = document.getElementById("modal-close")!;
  const backdrop  = document.querySelector("#project-modal .modal-backdrop")!;

  closeBtn.addEventListener("click",  closeProjectModal);
  backdrop.addEventListener("click",  closeProjectModal);
}

// ── Audio Toggle ──────────────────────────────────────────────

export function initAudioToggle(k: KAPLAYCtx): void {
  const btn  = document.getElementById("audio-btn")!;

  btn.addEventListener("click", () => {
    isMuted = !isMuted;
    k.volume(isMuted ? 0 : 1);
    btn.textContent = isMuted ? "🔇 MUTED" : "🔊";
    btn.setAttribute("aria-label", isMuted ? "Unmute audio" : "Mute audio");
  });
}

// ── Resume Download ───────────────────────────────────────────

export function triggerResumeDownload(): void {
  playModalOpenSFX();
  const a = document.createElement("a");
  a.href     = "/assets/resume/upanshu-pandey-cv.pdf";
  a.download = "Upanshu-Pandey-CV.pdf";
  a.click();
}

// ── Loading Screen ────────────────────────────────────────────

export function updateLoadingBar(pct: number): void {
  const bar = document.getElementById("loading-bar") as HTMLProgressElement | null;
  if (bar) bar.value = Math.min(100, Math.round(pct));
}

export function hideLoadingScreen(): void {
  const screen = document.getElementById("loading-screen")!;
  screen.classList.add("fade-out");
  setTimeout(() => screen.remove(), 700);
}

// ── Canvas → DOM event bridge ─────────────────────────────────

export function setupEventBridge(): void {
  window.addEventListener("portfolio:trigger", (e: Event) => {
    const { name } = (e as CustomEvent<{ name: string }>).detail;

    if (name === "resume-download") {
      showDialogue(name, triggerResumeDownload);
      return;
    }

    if (name === "welcome-sign" || name === "npc-guide" || name === "about-sign") {
      showDialogue(name);
      return;
    }

    // Triggers that have both dialogue + a modal
    if (TRIGGER_DIALOGUE[name]) {
      showDialogue(name, () => {
        if (MODAL_CONTENT[name]) openProjectModal(name);
      });
    }
  });
}

