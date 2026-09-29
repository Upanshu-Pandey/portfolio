// src/ui/dialogue.ts
// ─── GBA-style text box with typewriter, paging and a YES/NO choice box ───

import { pushHandler, type Button } from "../input.ts";
import { sfx } from "../audio.ts";

const CHAR_MS = 22;

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

/** Type one page into the box. Resolves when the full page is visible. */
function typePage(text: string, el: HTMLElement): { done: Promise<void>; skip: () => void } {
  el.textContent = "";
  let i = 0;
  let timer: ReturnType<typeof setInterval> | null = null;
  let resolve!: () => void;
  const done = new Promise<void>((r) => (resolve = r));
  const finish = () => {
    if (timer) clearInterval(timer);
    timer = null;
    el.textContent = text;
    resolve();
  };
  timer = setInterval(() => {
    if (i >= text.length) return finish();
    el.textContent += text[i];
    if (i % 2 === 0 && text[i]!.trim()) sfx.blip();
    i++;
  }, CHAR_MS);
  return { done, skip: finish };
}

/** Show pages of dialogue. A/B advances; the first press completes a page still being typed. */
export function say(pages: string[]): Promise<void> {
  const box = $("dialogue");
  const text = $("dialogue-text");
  const arrow = $("dialogue-arrow");
  box.hidden = false;

  return new Promise((resolve) => {
    let page = 0;
    let typing = false;
    let current: ReturnType<typeof typePage> | null = null;

    const start = () => {
      typing = true;
      arrow.hidden = true;
      const t = (current = typePage(pages[page] ?? "", text));
      t.done.then(() => {
        if (current !== t) return;
        typing = false;
        arrow.hidden = false;
      });
    };

    const advance = () => {
      if (typing) return current?.skip();
      page++;
      if (page >= pages.length) {
        pop();
        box.removeEventListener("click", advance);
        box.hidden = true;
        return resolve();
      }
      sfx.select();
      start();
    };

    const pop = pushHandler((btn: Button) => {
      if (btn === "a" || btn === "b") advance();
    });
    box.addEventListener("click", advance);
    start();
  });
}

/** Ask a question with a choice box. Resolves with the chosen index (B = last option). */
export async function ask(question: string, options = ["YES", "NO"]): Promise<number> {
  await typeHold(question);
  const box = $("choice");
  box.innerHTML = options.map((o, i) => `<button type="button" data-i="${i}">${o}</button>`).join("");
  box.hidden = false;
  const buttons = [...box.querySelectorAll("button")];
  let sel = 0;
  const paint = () => buttons.forEach((b, i) => b.classList.toggle("sel", i === sel));
  paint();

  return new Promise((resolve) => {
    const finish = (i: number) => {
      pop();
      box.hidden = true;
      $("dialogue").hidden = true;
      (i === options.length - 1 ? sfx.cancel : sfx.confirm)();
      resolve(i);
    };
    const pop = pushHandler((btn) => {
      if (btn === "up" || btn === "down") {
        sel = (sel + (btn === "up" ? -1 : 1) + options.length) % options.length;
        sfx.select();
        paint();
      } else if (btn === "a") finish(sel);
      else if (btn === "b" || btn === "start") finish(options.length - 1);
    });
    buttons.forEach((b, i) => b.addEventListener("click", () => finish(i)));
  });
}

/** Type a single page and keep the box open without waiting for a press. */
function typeHold(text: string): Promise<void> {
  const box = $("dialogue");
  box.hidden = false;
  $("dialogue-arrow").hidden = true;
  const t = typePage(text, $("dialogue-text"));
  const pop = pushHandler((btn) => { if (btn === "a" || btn === "b") t.skip(); });
  return t.done.then(pop);
}
