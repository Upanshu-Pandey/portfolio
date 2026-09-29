---
name: ui-overlays
description: How the portfolio's DOM UI works — retro text box, YES/NO prompts, main menu with quick travel, Project Log/Résumé panels and the input handler stack. Use when building or changing UI in src/ui.
---

# DOM UI: dialogue, main menu, panels

## Input stack (`src/input.ts`)
- Buttons: `up down left right a b start`. Keys: arrows/WASD, Space/Enter/Z = A, X/Backspace/Shift = B, Esc/M = START.
- `pushHandler(fn)` returns a `pop()`. Only the top handler receives presses. With an empty stack, presses go to the world (A = interact, START = menu).
- Every UI surface must push a handler while open and pop it on close, otherwise the player walks behind the UI.

## Building blocks
- `say(pages)` (`src/ui/dialogue.ts`): typewriter box. A/B completes a page, then advances.
- `ask(question, options)`: shows the question, then the choice box. Resolves an index; B picks the last option.
- `runInteraction(i)` (`src/ui/interact.ts`): `say` → optional `ask` → follow-up (`project | hall | panel | resume | menu`).
- `openMenu()` (`src/ui/menu.ts`): main menu. MAP lists `DESTINATIONS` and calls the travel callback (`goTo` with a fade).
- Panels (`src/ui/panel.ts`): `openProject`, `openHall`, `openProjects`, `openInfo(PanelId)`, `openResume`. Views are `{ title, html(), items?(), onPick? }`, and list views re-render after a child view closes.

## Styling (`src/style.css`)
- In-game UI is sized with `calc(var(--px) * N)`, where `--px` (set in `initScreen`) is one game pixel, capped at 4px. On touch layouts `--touch-h` lifts bottom boxes above the controls.
- Panels are full-viewport and use rem/px sizes for readability.
- The recruiter fast path must stay: the `#hud` MENU button, ESC, and the title-screen résumé button.
