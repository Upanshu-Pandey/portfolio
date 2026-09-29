// src/main.ts
// ─── Boot: screen + input + UI, bake art, start KAPLAY, title screen → town ───

import "./style.css";
import kaplay from "kaplay";
import { pickScale } from "./config.ts";
import { initKeyboard } from "./input.ts";
import { loadArt } from "./art/index.ts";
import { registerMapScene, goTo } from "./world/scene.ts";
import { initMenu } from "./ui/menu.ts";
import { initScreen, initHud, initTouch, showTitle, showBanner } from "./ui/screen.ts";

const SCALE = pickScale();
initScreen(SCALE);
initKeyboard();
initTouch();
initHud();

const k = kaplay({
  canvas: document.getElementById("game") as HTMLCanvasElement,
  scale: SCALE,             // full-page canvas; the view grows with the window
  crisp: true,
  texFilter: "nearest",
  spriteAtlasPadding: 2,
  loadingScreen: false,
  burp: false,
  global: false,
  background: [16, 16, 24],
  debug: import.meta.env.DEV,
  // our own input layer handles keys; stop KAPLAY from grabbing focus/scroll
  focus: false,
});

loadArt(k);
registerMapScene(k);
initMenu((d) => void goTo(k, { map: d.map, spawn: d.spawn }));

k.onLoad(() => {
  k.go("map", { map: "town", spawn: "start" });
  document.body.classList.remove("booting");
  showTitle(() => {
    document.body.classList.add("playing");
    showBanner("Upanshu Town");
  });
});
