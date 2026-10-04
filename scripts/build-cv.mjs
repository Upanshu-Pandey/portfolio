// scripts/build-cv.mjs
// ─── Print resume/cv.html → public/assets/resume/upanshu-pandey-cv.pdf with headless Chrome/Edge ───
// Usage: npm run cv   (set CHROME=/path/to/browser to override the auto-detected one)

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const src = resolve("resume/cv.html");
const out = resolve("public/assets/resume/upanshu-pandey-cv.pdf");

const candidates = [
  process.env.CHROME,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);

const browser = candidates.find((p) => existsSync(p));
if (!browser) {
  console.error("No Chrome/Edge found. Set CHROME=/path/to/browser.");
  process.exit(1);
}

execFileSync(browser, [
  "--headless=new",
  "--disable-gpu",
  "--no-pdf-header-footer",
  `--print-to-pdf=${out}`,
  pathToFileURL(src).href,
], { stdio: "inherit" });

console.log(`CV written to ${out}`);
