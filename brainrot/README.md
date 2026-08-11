# 🧠💥 Brainrot: Rise of the Meme

A satirical **Plague Inc.-style strategy game**: infect the world with terminal
internet brainrot before humanity's *Touch-Grass Campaign* (The Cure) hits 100%.

**Play:** https://dumb-tony.github.io/GameRepos/brainrot/

Plain HTML/CSS/JS — no build step, no dependencies, no install. Open
`index.html` and it runs.

---

## How it plays

Pick where patient zero starts, then spend **Virality** on three evolution
trees while the world tries to cure itself:

| Tree | Role |
|---|---|
| **Transmission** | Reach — how far and how fast the rot spreads |
| **Symptoms** | Income & speed, but they raise Severity (which feeds The Cure) |
| **Abilities** | Pure defence — stall The Cure, beat censorship and borders |

The core tension is Plague Inc's: **spread quietly first, then turn up the
volume.** Severity is what makes the world notice you and fund the cure.

Rot spreads country-to-country along a real land/sea/air link graph, so every
outbreak has a traceable path. Governments notice, close borders, and pull the
app from their stores. Rich, censored, infected countries generate the Cure's
research power — so where you start changes both your speed and your risk.

## Architecture

Modules load in order via `<script>` tags and share one `BR` global. The
simulation is DOM-free so it can run headless for testing.

| File | Responsibility |
|---|---|
| `config.js` | All tuning constants, difficulties, palettes, asset URLs |
| `sprites.js` | Vector icon atlas (+ optional HD sprite sheet) |
| `audio.js` | WebAudio synthesis — every sound is generated, no files. Haptics |
| `animations.js` | FX overlay: particles, floating text, confetti, screen shake |
| `countries.js` | Country roster & `Country` unit, infection stages, palettes, the "why is this resisting?" read |
| `worldmap.js` | Natural Earth country outlines |
| `upgrades.js` | The three evolution trees and effect folding |
| `events.js` | Random world events & government responses (phase-gated) |
| `world.js` | The spread simulation (pure) + map rendering |
| `save.js` | Persistence, achievements, lifetime stats, settings |
| `genes.js` | Rot Genes (meta-progression unlocked by achievements) |
| `ui.js` | All DOM/canvas presentation, input, overlays |
| `game.js` | Orchestrator: economy, Cure race, win/lose, the two loops |

`build.js` inlines everything into a single self-contained `brainrot.html`
(and an artifact variant). Keep its `FILES` list in sync with `index.html` —
the build fails loudly if a module is missing.

```bash
node brainrot/build.js     # -> brainrot.html (single shareable file)
```

## Design notes

- **Spread is a graph, not a mesh.** Countries seed *linked* neighbours only,
  gated by an export threshold and distance falloff, so the rot can't teleport
  across the planet early.
- **Legibility.** Tapping a country tells you *why* it resists and which
  upgrade counters it — the game teaches its own strategy.
- **Mobile-first.** Portrait uses bottom sheets; landscape uses slim side docks;
  the map keeps its true 2:1 aspect and is pinch/zoom/pannable.
- **Accessibility.** Colour-blind palette (Okabe-Ito), reduced motion, bigger
  text, keyboard focus rings, aria labels, screen-reader live region.
- **Installable.** A web manifest + icons make it a fullscreen PWA
  ("Add to Home Screen" on iOS; Fullscreen API on Android).

## Testing

Headless harnesses live in `../scratchpad/` (gitignored). They mock
`localStorage` and drive the real simulation:

- `except.js` — 640 full runs across difficulties; asserts zero exceptions and
  that every run reaches a terminal state
- `mobmatrix.js` — 9 viewports (phones, tablets, desktop); asserts the map has
  a real drawable area and the UI is reachable
- `pacing.js` / `variance.js` — balance: rot-per-minute by phase, dead air,
  win rates and outcome volatility
- `eventcov.js` — every event fires and phase-gating holds

Screenshots use `playwright-core` with the preinstalled Chromium at
`/opt/pw-browsers/chromium-1194/chrome-linux/chrome`.

---

*Original parody. Mechanics inspired by the genre; all art, code, text and
audio are generated for this project.*
