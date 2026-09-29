// src/ui/menu.ts
// ─── Main menu (ESC / MENU button): the recruiter fast path ───
// PROJECTS · RÉSUMÉ · MAP (quick travel) · CV download · sound

import { pushHandler } from "../input.ts";
import { sfx, toggleMute } from "../audio.ts";
import { isMuted } from "../state.ts";
import { openProjects, openResume, downloadResume } from "./panel.ts";
import { say } from "./dialogue.ts";
import type { MapId } from "../world/types.ts";

export interface Destination { label: string; map: MapId; spawn: string }

export const DESTINATIONS: Destination[] = [
  { label: "TOWN SQUARE", map: "town", spawn: "square" },
  { label: "PINE RESEARCH LAB", map: "lab", spawn: "door" },
  { label: "WEB WORKSHOP", map: "webWorkshop", spawn: "door" },
  { label: "SYSTEMS WORKS", map: "systemsWorks", spawn: "door" },
  { label: "UPANSHU'S HOUSE", map: "house", spawn: "door" },
];

interface Item { label: () => string; hint: string; run: () => Promise<boolean | void> | boolean | void }

let travel: (d: Destination) => void = () => {};
let open = false;

export function initMenu(onTravel: (d: Destination) => void): void {
  travel = onTravel;
}

export function menuOpen(): boolean {
  return open;
}

export async function getCv(): Promise<void> {
  downloadResume();
  sfx.jingle();
  await say(["Upanshu's CV is on its way!\n(Check your downloads.)"]);
}

/** Show a list menu in the box; resolves with the picked index or -1. */
function list(items: { label: string; hint?: string }[], title: string, start = 0): Promise<number> {
  const box = document.getElementById("start-menu")!;
  const hint = document.getElementById("menu-hint")!;
  box.hidden = false;
  let sel = start;

  const render = () => {
    box.innerHTML = `<div class="menu-title">${title}</div>` + items.map((it, i) =>
      `<button type="button" class="${i === sel ? "sel" : ""}" data-i="${i}">${it.label}</button>`).join("");
    box.querySelectorAll<HTMLButtonElement>("button").forEach((b) =>
      b.addEventListener("click", () => finish(Number(b.dataset.i))));
    const h = items[sel]?.hint;
    hint.hidden = !h;
    hint.textContent = h ?? "";
  };

  let finish!: (i: number) => void;
  const done = new Promise<number>((resolve) => {
    finish = (i) => {
      pop();
      box.hidden = true;
      hint.hidden = true;
      resolve(i);
    };
  });
  const pop = pushHandler((btn) => {
    if (btn === "up" || btn === "down") {
      sel = (sel + (btn === "up" ? -1 : 1) + items.length) % items.length;
      sfx.select();
      render();
    } else if (btn === "a") finish(sel);
    else if (btn === "b" || btn === "start") finish(-1);
  });
  render();
  return done;
}

export async function openMenu(): Promise<void> {
  if (open) return;
  open = true;
  sfx.open();

  const items: Item[] = [
    { label: () => "PROJECTS", hint: "Every project, with full write-ups.", run: () => openProjects() },
    { label: () => "RÉSUMÉ", hint: "The whole résumé on one page.", run: () => openResume() },
    { label: () => "MAP", hint: "Travel straight to any building.", run: async () => {
      const i = await list([...DESTINATIONS.map((d) => ({ label: d.label })), { label: "BACK" }], "TRAVEL TO…");
      if (i < 0 || i >= DESTINATIONS.length) return;
      sfx.warp();
      travel(DESTINATIONS[i]!);
      return true;   // close the menu
    } },
    { label: () => "GET CV (PDF)", hint: "Download Upanshu's CV.", run: async () => { await getCv(); return true; } },
    { label: () => `SOUND: ${isMuted() ? "OFF" : "ON"}`, hint: "Toggle music and sound effects.", run: () => { toggleMute(); } },
    { label: () => "EXIT", hint: "Back to exploring.", run: () => true },
  ];

  let sel = 0;
  for (;;) {
    const i = await list(items.map((it) => ({ label: it.label(), hint: it.hint })), "MENU", sel);
    if (i < 0 || i === items.length - 1) { sfx.cancel(); break; }
    sel = i;
    sfx.confirm();
    if (await items[i]!.run()) break;
  }
  open = false;
}
