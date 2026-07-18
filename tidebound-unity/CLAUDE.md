# Tidebound Unity — working agreements

3D narrative survival-adventure RPG adaptation of the Tidebound VN.
**Read `../tidebound/design/UNITY-ADAPTATION.md` first, every session** — it is
the adaptation bible (pitch, zones, cast, systems translation, build order).
Canon lives in `../tidebound/design/` (writers' bible) and `../tidebound/*.js`
(machine truth). Voice guide: `../tidebound/design/07-voice…` + §7 of
`00-state-of-the-game.md` — all new prose must pass it.

## Design law (non-negotiable)

1. **Deaths must trace to ignored warnings.** The island always warns once.
2. **Companions never die.** Hurt, scared, scarred — never dead.
3. **Undiscovered stays unnamed.** Names appear in UI/journal only after the
   player learns them.

## Workflow

- **One phase (or less) per conversation** (build order in the bible §7).
  Commit and push every session. Branch: `claude/visual-novel-3d-rpg-ss5ld2`.
- **Everything code-driven.** Claude can't click the editor: scene setup,
  placement, and configuration are editor scripts/menu items under
  `Tidebound ▸ …` that the human runs. Feel-tuning is exposed as inspector
  parameters for the human to adjust — never hardcode a feel guess.
- **Tests with every system.** EditMode tests in `Assets/_Game/Tests/EditMode`.
- Greybox until fun; stylized packs later; no realism. Companions get the
  real asset budget.
- No binary assets from the cloud sandbox (git-lfs isn't installed there).
  `.gitattributes` already routes binaries to LFS — run `git lfs install`
  locally before committing the first binary.

## Layout

```
tidebound-unity/
├── Assets/_Game/
│   ├── Scripts/Runtime/   Tidebound.Runtime (Core: GameState, SaveSystem,
│   │                      GameManager; World: DayClock/GameClock/SunCycle;
│   │                      Survival: SurvivalActions (VN-pinned), FireLogic,
│   │                      WarningSystem; Player: controller/camera/input;
│   │                      Interaction: Interactable + PlayerInteractor;
│   │                      Camp: fire/shelter/forage/water/SOS; UI: HUD;
│   │                      Narrative: models, database, SO asset)
│   ├── Scripts/Editor/    Tidebound.Editor (menu-item tooling, scene builders)
│   ├── Tests/EditMode/    Tidebound.Tests.EditMode
│   ├── Data/Narrative/    tidebound-content.json (extracted VN content)
│   ├── Scenes/ Prefabs/ Art/ Settings/
└── Tools/                 Node tooling (content extractor)
```

- Namespace `Tidebound` (runtime), `Tidebound.Narrative`, `Tidebound.EditorTools`.
- Unity 6000.5.x (the owner's installed editor — `ProjectSettings/
  ProjectVersion.txt` is the truth; don't pin package versions the editor
  will fight), URP. Newtonsoft JSON for all serialization
  (dictionaries). JSON keys match the VN's state keys (`seg`, `stats`,
  `flags`…) — keep it that way; a VN-save import must stay possible.
- `GameState.TickSegment()` is a **faithful port** of engine.js drains, and
  `ClockTests` pins the exact numbers. Don't "fix" the balance in code;
  balance changes are design decisions made against `design/04-survival.md`.

## Commands

- Extract VN content: `node Tools/extract-vn-content.mjs` (deterministic;
  re-run whenever the VN changes, then in Unity:
  **Tidebound ▸ Narrative ▸ Import Content JSON**).
- First open on a new machine: **Tidebound ▸ Setup ▸ Configure Project**
  (creates/assigns the URP pipeline asset, linear color space, forces Active
  Input Handling to Input Manager — restart the editor once if it says so).
- **No Input System package.** Input goes through `GameInput`, which has a
  legacy-backend path (active) and a new-backend path (dormant). The
  com.unity.inputsystem package download kept corrupting on the owner's
  network, so it was removed — don't re-add it without checking with them.
- Build the vertical slice: **Tidebound ▸ Scenes ▸ Build Castaway Bay
  (Greybox)** — generates `Scenes/CastawayBay.unity` deterministically
  (seed 42) with terrain, camp, forage points, player, camera, sun, and all
  systems wired. Re-run freely; the scene file is overwritten. Then Play:
  WASD + mouse, Shift run, E/F/C interact, Esc frees the cursor.
- Tests (CLI): `Unity -batchmode -projectPath tidebound-unity -runTests
  -testPlatform EditMode -logFile - -testResults results.xml` (or the Test
  Runner window). Unity/graphics tooling can't run in the cloud sandbox —
  code must arrive compile-clean; the human runs tests and reports back.

## Phase status (bible §7)

- [x] Phase 0 — foundations: project scaffold, GameState + save/load,
      content extractor + narrative DB importer, tests.
- [~] Phase 1 — the day loop on one beach (vertical slice). *Session 1
      (this commit): continuous clock over the VN's four segments + sun/
      lighting cycle; third-person controller + orbit camera (backend-
      agnostic input); THE interaction system (proximity prompt, E/F/C
      options); camp systems — fire (light/feed/dies, fuel in segments),
      shelter tiers, forage/coconut/driftwood points, freshwater trickle,
      SOS site, rest + sleep-to-dawn (VN energy-floor formula); warning
      system (law #1) incl. dusk exposure warning + cold tax; collapse at
      Energy 0; code-built HUD (meters/prompt/toasts/death cards with
      canonical DEATH_TITLES); dawn autosave; Castaway Bay greybox builder;
      43 new EditMode tests. Hub-action deltas are pinned to scenes-chapter1.js
      — SurvivalActionsTests guards them. Session 2 (playtest feedback):
      action time costs sweep as a visible time-lapse (GameClock.
      timeLapseSpeed) instead of jumping; HUD day-progress bar with segment
      dividers that flares during the sweep; segment-change narration;
      time-cost rule — labors cost segments, gestures (pick up, drink,
      feed the fire) are free, walking there is their cost.
      Session 3 (the beach felt dead): ambience pass, all code-only — sea
      bob + tide (SeaMotion) with sliding foam strips, 12 skittering crabs
      (CrabAI), occasional bird flights, Perlin wind-sway on fronds/
      canopies/bushes, synthesized shore/wind audio + fire crackle
      (OnAudioFilterRead, zero audio files), palms 8→14, driftwood 10→16.
      Remaining for the phase: keep tuning the feel knobs (day length,
      costs, camera) until surviving three days is mildly fun.*
- [~] Phase 2 — words. *Session 1 (this commit): story runtime
      (StoryScript/StoryScene/StoryChoice/StoryPlayback — pure, headless-
      testable), rich-text-safe Typewriter, code-built DialogueUI
      (typewriter paragraphs, choices with consequence subtext, click or
      1–4 keys, world freezes + HUD steps aside), the full crash prologue
      ported scene-for-scene from scenes-prologue.js (falling → courier →
      who-you-were → ashore → two-of-five salvage → night0 → ch1_open;
      every effect pinned by PrologueScriptTests), Ledger journal on J
      (JournalEntries pure + JournalUI sheet; route numbers never shown),
      GameManager freeze/cursor orchestration. New games now begin at the
      crash. Session 2 (make it cinematic): PrologueStageDirector stages
      the prologue as a filmed sequence — chase shot of a greybox plane
      actually descending (PlaneDescent + synthesized EngineDrone), hard
      cut to the sinking blue dark (UnderwaterDrift), the real shore at
      dusk with the fuselage dying on the reef, the lagoon's seven-beat
      glow (SevenBeat pure curve + LagoonGlow — which keeps glowing on
      later nights once COMPASS_SPINS is set), fades between stages
      (DialogueUI owns the screen fader), dialogue in a lower-third panel
      (DialogueStyle) so the world plays above the words, and you wake at
      the waterline at dawn. Detail pass (owner: "add as many details as
      you can, look good later"): horizon-filling OpenOcean plane,
      permanent DistantIsland massif with the broken crown (visible from
      the beach through thinned fog), 22 clouds + sister-island
      silhouettes during the descent (aerial haze replaces beach fog in
      the air; crash staged at midday light), underwater debris field
      (sinking fuselage, tumbling cushions/papers, surface glow overhead),
      reef wreck wing/cargo, permanent shore flotsam (cushions, suitcase,
      fuel slick), lagoon glow 9 discs, camera far plane 3000.
      Remaining: chapter-1 scheduled encounters (Vela, the howls, the
      squall) as world events, journal quest hooks.*
- [ ] Phase 3 — the dog (Kavi; make-or-break)
- [ ] Phase 4 — the island (12-zone greybox generator, Wayfinder)
- [ ] Phase 5 — act 1–2 story + first three endings
- [ ] Phase 6 — depth passes per act · Phase 7 — companions, NG+, polish

V1 scope (bible §8): crash → Bay/Tide Pools/Fringe/Green Deep, full day
loop, Kavi only, chapters 1–2, the Boar King, five endings.
