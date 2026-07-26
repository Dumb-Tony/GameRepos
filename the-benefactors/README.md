# The Benefactors

An investigative noir point-and-click adventure about a local corruption story that opens into a global conspiracy.

This folder is intentionally isolated from the other games in `GameRepos`.

## Current status

**Milestone 0 — Foundation**

- Static HTML5 application shell
- Hash-based screen routing
- Centralized, serializable game state
- Data-driven conditions and effects
- Versioned local save system
- Player identity setup
- Placeholder title, home office, newsroom, and settings screens
- Accessibility preferences
- Automated state, condition, event, and save tests

**Milestone 1 — Exploration (in progress)**

- Opening anonymous email and downloadable evidence
- Data-driven scalable exploration scenes
- Interactive scene hotspots
- City map with story-gated destinations
- Inventory and evidence pocket
- Placeholder newsroom, city hall, and Vale residence
- First permit search action

**Milestone 2 — Dialogue (started)**

- Data-driven branching dialogue engine
- Evidence-gated conversation choices
- Persistent conversation effects
- Lionel Price records-room conversation
- June Bell witness conversation

**Milestone 3 — Evidence board (started)**

- Persistent evidence cards and positions
- Mouse dragging and keyboard card movement
- Red, blue, yellow, and white yarn relationships
- Data-defined deduction recipes
- Two initial deductions tied to the invoice, permit, and witness statement

**Prologue content now playable**

- Photograph the missing west wing
- Record June Bell's account of the nighttime deliveries
- Prove the declared construction did not happen
- Trigger Mayor Vale's disappearance
- Unlock and search the mayor's study
- Find the original floorplan and damaged recorder
- Reveal the concealed stairway to the communications room
- Open every collected item as a full evidence artifact
- Inspect the invoice, email, permit, photograph, transcript, floorplan, and recorder

The recording reconstruction and complete end-of-prologue sequence are still in development.

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
