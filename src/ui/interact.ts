// src/ui/interact.ts
// ─── Run an Interaction: dialogue pages, then an optional YES/NO follow-up ───

import type { Interaction } from "../world/types.ts";
import { say, ask } from "./dialogue.ts";
import { openProject, openHall, openInfo } from "./panel.ts";
import { openMenu, getCv } from "./menu.ts";

let busy = false;

export async function runInteraction(i: Interaction): Promise<void> {
  if (busy) return;
  busy = true;
  try {
    await say(i.say);
    if (!i.then) return;
    if ((await ask(i.ask ?? "Read more?")) !== 0) return;
    const f = i.then;
    switch (f.kind) {
      case "project": await openProject(f.id); break;
      case "hall":    await openHall(f.building); break;
      case "panel":   await openInfo(f.id); break;
      case "resume":  await getCv(); break;
      case "menu":    await openMenu(); break;
    }
  } finally {
    busy = false;
  }
}
