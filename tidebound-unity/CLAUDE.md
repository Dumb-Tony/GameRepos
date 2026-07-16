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
│   ├── Scripts/Runtime/   Tidebound.Runtime (Core: GameState, SaveSystem;
│   │                      Narrative: models, database, SO asset)
│   ├── Scripts/Editor/    Tidebound.Editor (menu-item tooling)
│   ├── Tests/EditMode/    Tidebound.Tests.EditMode
│   ├── Data/Narrative/    tidebound-content.json (extracted VN content)
│   ├── Scenes/ Prefabs/ Art/ Settings/
└── Tools/                 Node tooling (content extractor)
```

- Namespace `Tidebound` (runtime), `Tidebound.Narrative`, `Tidebound.EditorTools`.
- Unity 6 LTS (6000.0.x), URP. Newtonsoft JSON for all serialization
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
  (creates/assigns the URP pipeline asset, linear color space).
- Tests (CLI): `Unity -batchmode -projectPath tidebound-unity -runTests
  -testPlatform EditMode -logFile - -testResults results.xml` (or the Test
  Runner window). Unity/graphics tooling can't run in the cloud sandbox —
  code must arrive compile-clean; the human runs tests and reports back.

## Phase status (bible §7)

- [x] Phase 0 — foundations: project scaffold, GameState + save/load,
      content extractor + narrative DB importer, tests. *(this commit)*
- [ ] Phase 1 — the day loop on one beach (vertical slice)
- [ ] Phase 2 — words (dialogue/journal UI, prologue)
- [ ] Phase 3 — the dog (Kavi; make-or-break)
- [ ] Phase 4 — the island (12-zone greybox generator, Wayfinder)
- [ ] Phase 5 — act 1–2 story + first three endings
- [ ] Phase 6 — depth passes per act · Phase 7 — companions, NG+, polish

V1 scope (bible §8): crash → Bay/Tide Pools/Fringe/Green Deep, full day
loop, Kavi only, chapters 1–2, the Boar King, five endings.
