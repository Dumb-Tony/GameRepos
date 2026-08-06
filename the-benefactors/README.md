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

**Milestone 6 — Follow Northstar (complete)**

- New illustrated location at 1400 Harrow Street
- Building-manager interview with evidence-gated questions
- Fictitious Suite 410 contradiction and courier-route evidence
- Three new viewable evidence artifacts and one case conclusion
- Evidence-board deduction linking Northstar to Brighter Horizon
- Updated notebook objectives, hints, map route, and save migration

**Milestone 7 — The Foundation (complete)**

- New illustrated Brighter Horizon office at 8 Calder Square
- Evidence-driven interview with foundation receptionist Celia Orr
- Donor-wall photograph, visitor-access log, and financial report
- Board deduction proving Brighter Horizon financed and administered Northstar
- Calder Grand benefit invitation as the next story lead
- Updated notebook progression and migration for completed Northstar saves

**Milestone 8 — Calder Grand infiltration (complete)**

- Invitation-only gala ballroom and staff service corridor
- Evidence-driven conversations with Imani Kade and Cassian Rook
- Identification of Silas Wren, the circled gala guest
- Seating plan, terrace photograph, service pass, and full evidence artifacts
- Room B contractor roster, covert recording, and Mina Harcourt forwarding lead
- Board deduction proving Northstar was one of several disposable contractors
- Updated notebook progression and migration for completed foundation saves

**Milestone 9 — The continuity network (complete)**

- Mina Harcourt's searched apartment at 26 Saltmere Walk
- Evidence-gated interview with Brighter Horizon's former program accountant
- Harcourt's private advance ledger and restricted archive request
- Municipal Records Archive basement and Emergency Register 09
- Continuity-site map, destruction order, and Bellwether water-crisis lead
- Three-connection Act II deduction proving the charity financed hidden emergency infrastructure
- Updated notebook progression and migration for completed gala saves

**Milestone 10 — Bellwether (complete)**

- New illustrated Bellwether relief station and contaminated-water investigation
- Evidence-gated interview with community organizer Rina Mercer
- Field sample, pre-positioned relief freight, Deepwell bypass log, and suppressed lab request
- Three-connection deduction proving the public rescue was staged before the crisis
- Greyhaven University river-annex lead for the next chapter
- Evidence-board category highlights, expandable layout, and reversible card tray
- Scrollable large-format corkboard with Detailed, Compact, and Overview card sizes
- Seven-column automatic layout tested with forty-two pinned clues
- Updated notebook progression and migration for completed continuity-network saves

**Milestone 11 — The River Annex (complete)**

- New illustrated environmental laboratory beneath Greyhaven University's south floodgate
- Evidence-driven interview with Dr. Elian Voss
- Duplicate Bellwether sample analysis, preserved funding threat, watershed route, and transfer log
- Board deduction proving Bellwether was an engineered Meridian demonstration
- Verdant Conservation Parcel 6 lead for the next investigation
- Collapsible yarn desk, live case-status strip, photographic clue thumbnails, and distinct clue-type treatments
- Updated notebook progression and migration for completed Bellwether saves

**Milestone 12 — Verdant Parcel Six (complete)**

- New illustrated conservation parcel hiding a fenced watershed test range
- Evidence-gated interview with erased field ecologist Tess Arlen
- Public recovery brochure, concealed mortality log, VA-9 injection rig, and Crownline telemetry manifest
- Active-theory board checklist showing exact clue pairs, yarn meanings, missing evidence, and incorrectly tied yarn
- Three-connection deduction proving Verdant conducted controlled crisis experiments
- Crownline Data Services lead for the next chapter
- Updated notebook progression and migration for completed river-annex saves

**Milestone 13 — Crownline Data Center (complete)**

- New illustrated after-hours data center with security lobby, server hall, operations bay, records cage, and freight scheduler
- Evidence-gated interview with overnight systems operator Nia Kade
- Bellwether crisis dashboard, governance scorecard, protected-assets protocol, and Redoubt flight log
- Three-connection deduction proving Crownline measured the transfer of public authority to Meridian
- Greyhaven Executive Airfield and concealed Site Orpheus lead for the next chapter
- Updated notebook progression and migration for completed Verdant saves

**Milestone 14 — Evidence room visual pass (complete)**

- Every photographic clue now uses grounded, painterly neo-noir artwork instead of geometric placeholders
- Rebuilt evidence board with a wood frame, tactile cork, paper textures, masking tape, pushpins, and stronger depth
- Photo cards now read as pinned instant prints and open into a full-size physical evidence viewer
- Yarn styles are visually distinct and attach directly to the pushpins
- Added automated coverage requiring every authored photograph to provide a real WebP image and descriptive alt text

**Milestone 15 — Noir case wall and full progression audit (complete)**

- Reworked the evidence room into a low-lit charcoal case wall with warm task lighting, dark wood, aged paper, and restrained brass details
- Improved compact-window behavior so the case file stacks below the board instead of being cropped
- Verified pinning, tray storage, card density, evidence filters, automatic arrangement, full evidence viewing, and persistent yarn
- Added a continuous leak-to-Crownline playthrough test covering all ten deductions and an autosave round trip after every chapter handoff
- Kept the Mayor Vale survey sheet centered and visible at every rotation and responsive breakpoint

**Milestone 16 — Field tools and recovered audio (complete)**

- Added playable audio to all three damaged-recorder fragments and the fully reconstructed Vale message
- Added transcript support alongside the recordings so story-critical dialogue remains accessible
- Turned the notebook, press credentials, smartphone, and recorder into contextual scene tools
- Highlighted matching hotspots and surfaced clear tool-use prompts from the inventory
- Added validation and automated coverage for recording assets and every inventory-tool interaction

**Milestone 17 — Hangar 4 (complete)**

- Extended the investigation to Greyhaven Executive Airfield after the Crownline deduction
- Added a painterly neo-noir Hangar 4 scene, Ellis Ward interrogation, and four sequential apron discoveries
- Added a three-connection evidence-board deduction proving Redoubt evacuates Meridian's protected principals and archives
- Revealed Site Orpheus as a private island supplied through the disguised Blackwater Point maintenance pier
- Added casebook guidance, home-office progression, save migration, and a full leak-to-Hangar-4 automated playthrough

**Milestone 18 — Blackwater Point (complete)**

- Followed Redoubt's flight trail to the covert coastal supply line serving Site Orpheus
- Added a painterly rain-soaked pier scene, Tamsin Pike interrogation, and four sequential dockside discoveries
- Added a board deduction proving Blackwater hides Orpheus passengers, biological archives, and private medical cargo from civil records
- Recovered a nineteen-minute radar gap and maintenance credential for entering the island's submerged harbor
- Extended casebook guidance, office progression, save migration, and the complete automated playthrough to the Orpheus approach

**Milestone 19 — Orpheus Sublevel Harbor (complete)**

- Entered Site Orpheus through its concealed sea-cavern harbor beneath North Reef
- Added a painterly island command-center scene, Adrian Moss interrogation, and four sequential harbor discoveries
- Revealed the private longevity clinic, leverage archive, protected residences, and First Circle assembly above the dock
- Added a four-connection deduction proving Orpheus is the Benefactors' operational headquarters rather than a humanitarian refuge
- Recovered a First Circle invitation showing the society is selecting its next target on Level 07
- Extended save migration, casebook guidance, office progression, and the full leak-to-Orpheus automated playthrough

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
