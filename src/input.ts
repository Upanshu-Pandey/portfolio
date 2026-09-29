// src/input.ts
// ─── Unified input: keyboard + on-screen touch buttons → GBA-style buttons ───
// UI layers push a handler onto a stack; the top handler receives button presses.
// While any handler is on the stack the overworld is frozen (player can't move).

export type Button = "up" | "down" | "left" | "right" | "a" | "b" | "start";
export type Handler = (btn: Button) => void;

const KEYMAP: Record<string, Button> = {
  ArrowUp: "up", KeyW: "up",
  ArrowDown: "down", KeyS: "down",
  ArrowLeft: "left", KeyA: "left",
  ArrowRight: "right", KeyD: "right",
  Space: "a", Enter: "a", NumpadEnter: "a", KeyZ: "a",
  KeyX: "b", Backspace: "b", ShiftLeft: "b", ShiftRight: "b",
  Escape: "start", KeyM: "start",
};

const held = new Set<Button>();
const stack: Handler[] = [];
let worldHandler: Handler | null = null;
let firstInput: (() => void) | null = null;

export function isHeld(btn: Button): boolean {
  return held.has(btn);
}

/** True while dialogue, menus or modals own the controls. */
export function uiActive(): boolean {
  return stack.length > 0;
}

/** Push a UI handler; returns a function that removes it. */
export function pushHandler(h: Handler): () => void {
  stack.push(h);
  return () => {
    const i = stack.lastIndexOf(h);
    if (i >= 0) stack.splice(i, 1);
  };
}

export function setWorldHandler(h: Handler): void {
  worldHandler = h;
}

export function onFirstInput(fn: () => void): void {
  firstInput = fn;
}

export function press(btn: Button): void {
  if (firstInput) { const f = firstInput; firstInput = null; f(); }
  const wasHeld = held.has(btn);
  held.add(btn);
  if (wasHeld) return;
  const top = stack[stack.length - 1];
  if (top) top(btn);
  else worldHandler?.(btn);
}

export function release(btn: Button): void {
  held.delete(btn);
}

export function releaseAll(): void {
  held.clear();
}

export function initKeyboard(): void {
  window.addEventListener("keydown", (e) => {
    const btn = KEYMAP[e.code];
    if (!btn) return;
    // let people type in form fields / use modifier shortcuts normally
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    e.preventDefault();
    if (e.repeat) return;
    press(btn);
  });
  window.addEventListener("keyup", (e) => {
    const btn = KEYMAP[e.code];
    if (btn) release(btn);
  });
  window.addEventListener("blur", releaseAll);
}
