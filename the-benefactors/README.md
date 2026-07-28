# The Benefactors

An investigative noir point-and-click adventure about a local corruption story that opens into a global conspiracy.

This folder is intentionally isolated from the other games in `GameRepos`.

## Current status

**Milestone 0 — Foundation (complete)**

- Static HTML5 application shell
- Hash-based screen routing
- Centralized, serializable game state
- Data-driven conditions and effects
- Versioned local save system
- Player identity setup
- Title, home office, newsroom, and settings screens
- Accessibility preferences
- Automated state, condition, event, and save tests

**Milestone 1 — Exploration (complete)**

- Opening anonymous email and downloadable evidence
- Data-driven scalable exploration scenes
- Interactive scene hotspots
- City map with story-gated destinations
- Inventory and evidence pocket
- Newsroom, city hall, Vale residence, mayor's study, and hidden room
- First permit search action

**Milestone 2 — Dialogue (complete)**

- Data-driven branching dialogue engine
- Evidence-gated conversation choices
- Persistent conversation effects
- Lionel Price records-room conversation
- June Bell witness conversation

**Milestone 3 — Evidence board (complete)**

- Persistent evidence cards and positions
- Mouse dragging and keyboard card movement
- Six explained yarn relationships with distinct colors and line patterns
- Data-defined deduction recipes
- Two deductions that advance and complete the prologue

**Milestone 4 — Complete prologue vertical slice (complete)**

- Player name and pronoun setup
- Optional first-time-player tutorial
- Personalized opening cutscene
- Floorplan alignment puzzle with progressive hints
- Recording reconstruction puzzle with accessible captions and progressive hints
- Persistent puzzle and ending progress
- Final evidence-board breakthrough
- Seven-scene end-of-prologue sequence
- Full-sized, viewable evidence artifacts, including the circled gala photograph
- New Northstar lead at 1400 Harrow Street

**Milestone 5 — Polish (complete)**

- Three persistent manual case-file slots alongside autosave
- Load, overwrite, and delete controls with story-progress summaries
- Generated noir music, ambience, and interaction sounds through Web Audio
- Working mute, music, ambience, and effects settings
- Global M mute and H hotspot-assistance shortcuts
- Content warning, fiction/privacy notice, and credits screens
- Persistent reporter’s notebook with objective tracking and three-stage hints
- Responsive and high-contrast layouts for all new screens

**Prologue content now playable**

- Photograph the missing west wing
- Record June Bell's account of the nighttime deliveries
- Prove the declared construction did not happen
- Trigger Mayor Vale's disappearance
- Unlock and search the mayor's study
- Find the original floorplan and damaged recorder
- Align the floorplan to reveal the concealed stairway
- Reconstruct Mayor Vale's damaged message
- Prove the invoice was a deliberate distress signal
- Follow the anonymous delivery through the complete prologue ending
- Open every collected item as a full evidence artifact
- Inspect the invoice, email, permit, photographs, transcripts, floorplan, recorder, and new leads

## Run locally

Serve this directory with any static web server, then open `index.html`.

For example:

```bash
npx serve .
```

The game has no runtime dependencies and can also be served directly by GitHub Pages.

## Test

Requires a recent version of Node.js:

```bash
npm test
```

## Create a production build

```bash
npm run build
```

The build is written to `dist/`. The source folder itself remains directly deployable on GitHub Pages.

## Architecture

- `src/engine/` — reusable state, saves, conditions, events, and routing
- `src/content/` — authored game data
- `src/ui/` — screen rendering and interaction binding
- `src/systems/` — exploration and dialogue systems
- `tests/` — engine and persistence tests
- `docs/` — game design documentation

## Save data

Game progress is stored locally in the browser under a versioned key. Saves contain plain serializable data, not interface or DOM state.

## Scope rule

Work only inside `the-benefactors/` unless the user explicitly requests a repository-level change.
