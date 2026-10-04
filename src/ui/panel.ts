// src/ui/panel.ts
// ─── Full-screen HTML panels: project log, project write-ups, info pages, résumé ───
// Text-heavy content lives here (DOM), never on the canvas.

import { pushHandler } from "../input.ts";
import { sfx } from "../audio.ts";
import { markSeen, isSeen } from "../state.ts";
import { asset } from "../config.ts";
import {
  PROFILE, PROJECTS, EXPERIENCE, EDUCATION, SKILLS, CATEGORY_COLORS,
  type PanelId, type Project,
} from "../content.ts";

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const categories = (p: Project) =>
  p.categories.map((t) => `<span class="cat" style="--cat:${CATEGORY_COLORS[t]}">${t}</span>`).join("");

export function resumeUrl(): string {
  return asset(PROFILE.resume);
}

/** Open the CV PDF in a new browser tab. Returns false if a popup blocker stopped it. */
export function openResumePdf(): boolean {
  const w = window.open(resumeUrl(), "_blank");
  if (!w) return false;
  w.opener = null;
  return true;
}

// ── HTML builders ───────────────────────────────────────────────

function projectHTML(p: Project): string {
  return `
    <header class="entry-head">
      <h2>${esc(p.title)}</h2>
      <div class="cats">${categories(p)}</div>
    </header>
    <p class="entry-when">${esc(p.when)}</p>
    ${p.body.map((b) => `<p>${esc(b)}</p>`).join("")}
    <h3>Highlights</h3>
    <ul class="bullets">${p.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>
    <div class="chips">${p.tags.map((t) => `<span>${esc(t)}</span>`).join("")}</div>
    ${p.pdf ? `<a class="pixel-btn" href="${asset(p.pdf.path)}" target="_blank" rel="noopener">${esc(p.pdf.label)}</a>` : ""}`;
}

function experienceHTML(): string {
  return `<ol class="timeline">${EXPERIENCE.map((job) => `
    <li><strong>${esc(job.org)}</strong><span class="when">${esc(job.when)}</span>
    <p class="roles">${job.roles.map((r) => `${esc(r.title)} <span class="when-inline">(${esc(r.when)})</span>`).join("<br>")}</p>
    <ul class="bullets">${job.points.map((pt) => `<li>${esc(pt)}</li>`).join("")}</ul></li>`).join("")}</ol>`;
}

function educationHTML(): string {
  return `<ol class="timeline">${EDUCATION.map((e) => `
    <li><strong>${esc(e.title)}</strong><span class="when">${esc(e.when)}</span>
    <p>${esc(e.org)}${e.note ? `<br>${esc(e.note)}` : ""}</p></li>`).join("")}</ol>`;
}

function skillsHTML(): string {
  return `<div class="skill-grid">${SKILLS.map((s) => `
    <section><h4>${esc(s.group)}</h4><div class="chips">${s.items.map((i) => `<span>${esc(i)}</span>`).join("")}</div></section>`).join("")}</div>`;
}

function contactHTML(): string {
  return `
    <ul class="contact">
      <li><span>EMAIL</span><a href="mailto:${PROFILE.email}">${PROFILE.email}</a></li>
      <li><span>LINKEDIN</span><a href="${PROFILE.linkedin}" target="_blank" rel="noopener">linkedin.com/in/upanshu-pandey</a></li>
      <li><span>BASED IN</span>${esc(PROFILE.location)}</li>
      <li><span>STATUS</span>${esc(PROFILE.status)}</li>
    </ul>
    <a class="pixel-btn" href="${resumeUrl()}" target="_blank" rel="noopener">Open CV (PDF)</a>`;
}

const INFO: Record<PanelId, { title: string; html: () => string }> = {
  about: { title: "About Upanshu", html: () => `<p class="lead">${esc(PROFILE.summary)}</p>${contactHTML()}` },
  skills: { title: "Tech Stack", html: skillsHTML },
  education: { title: "Education", html: educationHTML },
  experience: { title: "Experience", html: experienceHTML },
  contact: { title: "Contact", html: contactHTML },
};

function resumeHTML(): string {
  const stars = PROJECTS.map((p) =>
    `<span class="star ${isSeen(p.id) ? "on" : ""}" title="${esc(p.title)}">★</span>`).join("");
  return `
    <div class="card-id">
      <div class="card-avatar" aria-hidden="true"></div>
      <div>
        <div class="card-name">${esc(PROFILE.name)}</div>
        <div>${esc(PROFILE.title)}</div>
        <div>${esc(PROFILE.location)} · <b class="status">${esc(PROFILE.status)}</b></div>
        <div class="stars" aria-label="Projects viewed">${stars}</div>
      </div>
    </div>
    <p class="lead">${esc(PROFILE.summary)}</p>
    <h3>Experience</h3>${experienceHTML()}
    <h3>Projects</h3>
    <ul class="bullets">${PROJECTS.map((p) => `<li><strong>${esc(p.title)}</strong> · ${esc(p.short)}</li>`).join("")}</ul>
    <h3>Education</h3>${educationHTML()}
    <h3>Skills</h3>${skillsHTML()}
    <h3>Contact</h3>${contactHTML()}`;
}

// ── Panel shell ─────────────────────────────────────────────────

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

interface View {
  title: string;
  html: () => string;
  /** list items (for list views); re-read on every render so "seen" marks stay fresh */
  items?: () => { label: string; sub: string; mark?: string }[];
  onPick?: (i: number) => Promise<void>;
}

let depth = 0;

/** Show a view in the panel; resolves when the user backs out of it. */
function show(view: View): Promise<void> {
  const root = $("panel");
  const title = $("panel-title");
  const body = $("panel-body");
  depth++;
  root.hidden = false;
  document.body.classList.add("panel-open");

  return new Promise((resolve) => {
    let sel = 0;
    let busy = false;

    const render = () => {
      title.textContent = view.title;
      if (view.items) {
        body.innerHTML = `${view.html()}<ul class="log-list">${view.items().map((it, i) => `
          <li><button type="button" data-i="${i}">
            <span class="mark">${it.mark ?? ""}</span>
            <span class="label">${esc(it.label)}</span>
            <span class="sub">${esc(it.sub)}</span>
          </button></li>`).join("")}</ul>`;
        body.querySelectorAll<HTMLButtonElement>(".log-list button").forEach((b) =>
          b.addEventListener("click", () => pick(Number(b.dataset.i))));
        paint();
      } else {
        body.innerHTML = view.html();
      }
      body.scrollTop = 0;
    };

    const paint = () => {
      const buttons = body.querySelectorAll<HTMLButtonElement>(".log-list button");
      buttons.forEach((b, i) => b.classList.toggle("sel", i === sel));
      buttons[sel]?.scrollIntoView({ block: "nearest" });
    };

    const pick = async (i: number) => {
      if (busy || !view.onPick) return;
      busy = true;
      sel = i;
      sfx.confirm();
      await view.onPick(i);
      busy = false;
      render();
    };

    const close = () => {
      pop();
      $("panel-close").removeEventListener("click", onClose);
      root.removeEventListener("click", onBackdrop);
      root.removeEventListener("pointerdown", onDown);
      sfx.cancel();
      depth--;
      if (depth === 0) {
        root.hidden = true;
        document.body.classList.remove("panel-open");
      }
      resolve();
    };
    const onClose = () => { if (!busy) close(); };
    // Only a tap that both starts and ends on the backdrop closes it: the touch A button
    // opens panels on pointerdown, and its trailing click would otherwise land here.
    let downOnBackdrop = false;
    const onDown = (e: PointerEvent) => { downOnBackdrop = e.target === root; };
    const onBackdrop = (e: MouseEvent) => { if (e.target === root && downOnBackdrop && !busy) close(); };

    const pop = pushHandler((btn) => {
      if (btn === "b" || btn === "start") return close();
      if (view.items) {
        if (btn === "up" || btn === "down") {
          const n = view.items().length;
          sel = (sel + (btn === "up" ? -1 : 1) + n) % n;
          sfx.select();
          paint();
        } else if (btn === "a") void pick(sel);
      } else {
        if (btn === "up") body.scrollBy({ top: -60, behavior: "smooth" });
        else if (btn === "down") body.scrollBy({ top: 60, behavior: "smooth" });
        else if (btn === "a") close();
      }
    });

    $("panel-close").addEventListener("click", onClose);
    root.addEventListener("click", onBackdrop);
    root.addEventListener("pointerdown", onDown);
    sfx.open();
    render();
  });
}

// ── Public API ──────────────────────────────────────────────────

export function openProject(id: string): Promise<void> {
  const p = PROJECTS.find((x) => x.id === id);
  if (!p) return Promise.resolve();
  markSeen(p.id);
  return show({ title: "PROJECT LOG", html: () => projectHTML(p) });
}

function projectList(title: string, list: Project[], intro = ""): Promise<void> {
  return show({
    title,
    html: () => `${intro}<p class="log-count">VIEWED ${list.filter((p) => isSeen(p.id)).length} / ${list.length}</p>`,
    items: () => list.map((p) => ({ label: p.title, sub: p.short, mark: isSeen(p.id) ? "★" : "☆" })),
    onPick: (i) => openProject(list[i]!.id),
  });
}

export function openProjects(): Promise<void> {
  return projectList("PROJECT LOG", PROJECTS);
}

export function openHall(building: "web" | "systems"): Promise<void> {
  const name = building === "web" ? "WEB WORKSHOP" : "SYSTEMS WORKS";
  return projectList(name, PROJECTS.filter((p) => p.building === building));
}

export function openInfo(id: PanelId): Promise<void> {
  const info = INFO[id];
  return show({ title: info.title.toUpperCase(), html: info.html });
}

export function openResume(): Promise<void> {
  return show({ title: "RÉSUMÉ", html: resumeHTML });
}

export function panelOpen(): boolean {
  return depth > 0;
}
