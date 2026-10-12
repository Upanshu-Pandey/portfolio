// src/ui/interact.ts
// ─── Run an Interaction: dialogue pages, then an optional YES/NO follow-up ───

import type { Interaction } from "../world/types.ts";
import { asset } from "../config.ts";
import { say, ask } from "./dialogue.ts";
import { openProject, openBuilding, openInfo } from "./panel.ts";
import { openMenu, getCv, getPdf } from "./menu.ts";

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
      case "project":  await openProject(f.id); break;
      case "building": await openBuilding(f.id); break;
      case "panel":    await openInfo(f.id); break;
      case "resume":   await getCv(); break;
      case "pdf":      await getPdf(asset(f.path), f.fallback); break;
      case "menu":     await openMenu(); break;
    }
  } finally {
    busy = false;
  }
}
