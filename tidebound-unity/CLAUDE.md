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

- **As of Phase 5 complete: ONE local session does everything.** Development
  happens in a single Claude session on the owner's machine
  (`C:\Dev\GameRepos`) with Unity MCP connected — write the code, run the
  EditMode suite and the scene builder live in the editor, fix what breaks,
  then commit and push the same session. Branch:
  `claude/phase-1-setup-klievx` (the project's active line; push nowhere
  else). Cloud sessions are fallback-only and must not assume they can run
  Unity — if one is ever used, it leaves testing to the next local session.
- **One phase (or less) per conversation** (build order in the bible §7).
  Commit and push every session.
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
  Runner window). Local sessions run tests through Unity MCP directly and
  fix failures in the same sitting; only a cloud fallback session needs the
  old rule (arrive compile-clean, let the next local session verify).

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
      Session 3: the story calendar — EventScheduler (VN firing rule:
      exact day+segment, once, when-guarded, missed-is-missed) +
      Chapter1Schedule + all eight chapter-1 encounters ported effect-for-
      effect (Vela's payment, the howls, Ipo and the lighter, the squall
      with its idempotent OnEnter, Buri's audit, the hawk and the hen,
      the grey dog by daylight, the ship's light / flare choice), played
      as lower-third dialogues queued at segment ticks (they wait out
      sleep/dialogue); StoryScene grew Speaker + OnEnter; the Ledger
      grew "The locals" (descriptive names only — law #3) and squall/
      flare deeds. Session 4 (owner: encounters should play like
      cutscenes, and never back-to-back): EncounterStageDirector stages
      every event with greybox actors and framed shots — Vela perched on
      a permanent dead palm (fish at your feet), the dog at the treeline
      with glow-lit eyes / sitting in the open by day, Ipo with the
      lighter, a real rain particle system + storm-dark override for the
      squall, Buri nose-down in the supplies, the hawk circling the hen,
      the ship's light crawling (ShipCrawl) and a rising FlareBurst if
      spent. Pacing: sleep advances one segment at a time and story
      events WAKE the sleeper (then sleep resumes); a real-time
      eventGapSeconds (default 25) keeps ordinary play between queued
      events. Remaining for Phase 2: nothing — ev_nine needs the Tide
      Pools zone (Phase 4) and the Clearing of Eyes belongs to the
      companion phase (Phase 3).*
- [~] Phase 3 — the dog. *Session 1 (this commit): CompanionLogic (pure —
      the VN's trust seed 18+interest×5 once, tier→behavior TierProfile
      map, bond-action values + once-per-segment rule, all 15 TIER_LINE
      vignettes ported verbatim as the behavior spec); KaviController
      (self-gating rig: Wary patrols the wide circle pretending not to be
      yours, Watchful follows at five paces and rests watching you AND the
      treeline, Warming+ takes the fireside, Bonded shadows, Kindred is
      pack; trot-bob, ground clamp, tier vignettes as ambient narration,
      TailWag from Warming up); KaviInteractable (share food / talk low /
      pet / name him — trust always behavior, never numbers); the CLEARING
      OF EYES on the calendar (day 5 dusk; v1 offers the grey dog or the
      solo road) with court_kavi + court_none ported and staged (the met
      animals gathered at dusk, then the dog crossing the distance);
      journal companion line; persistent greybox Kavi rig with the burn
      scar. 13 new tests. Remaining: the warning sense needs a predator
      (Phase 4-5), peril/nursing arc, feel pass on follow AI — the bar is
      "someone watching asks about the dog".*
- [~] Phase 4 — the island. *Session 1 (this commit; interleaved with
      Phase 3 so the dog has somewhere to go): the v1 island — terrain
      grows to 360×400m; the Tide Pools open EAST (per the chart): rock
      shelf, pool cities, three workable TidePool points (VN numbers via
      SurvivalActions.TidePools) and the gallery at the drop-off where
      Nine waits (pools==2 && unmet, machine truth; ev_nine/ev_nine2
      ported + staged with the rock-that-opens-an-eye rig); the Jungle
      Fringe becomes a walkable ecotone band; the Green Deep interior —
      collidable trunk maze under a closed canopy, the fig hoard tree,
      the glyph stone and the wallow (LoreStone); Regions.cs ports map.js
      names/subs/first-visit prose/fx1/deck for all four zones;
      RegionTracker plays first-visit set pieces + daily deck draws +
      Kavi's huff at the interior's light-line; the WAYFINDER on M
      (fog-of-war chart at canon positions, spinning compass); journal
      "Where you've been"; the bay auto-seen (home isn't an expedition);
      mountains pushed back beyond the interior. 8 new tests. Remaining:
      Bone Beach + trinkets, gates as presences (Grin/Boar King, Phase 5),
      compass-spin near heartglass.*
- [x] Phase 5 — act 1–2 story + first three endings. *Session 1 (this
      commit): THE ENDING PIPELINE, end to end — GameState.EndingId (VN
      key), Endings.cs (runcard.js DEATH_TITLES complete, epilogue prose,
      CORES v1: THE EMPTY HORIZON verbatim, run summary builder), and
      RunCardUI: one full-screen terminal card for every death AND ending
      (title, canon epilogue, the island's memory of the run, Enter for
      another tide) — replaces the HUD's old death panel. The three v1
      endings live: COLD FIRE (exposure death, already wired), THE EMPTY
      HORIZON (RaftSite on the west beach: two lashing stages of 4
      driftwood, then the launch question with canon subtext — refusable),
      THE GREEN SWALLOWS (ev_despair ported from scenes-quests.js with
      kavi/solo variants; offered once when Hope ≤ 12 at nightfall; refuse
      = hope +8 + DESPAIR_REFUSED, accept = deathCause despair with the
      full Green Swallows epilogue). GameManager: RunOver covers both
      terminal kinds; ended saves discard on load. 11 new tests.
      Session 2 (Foothold): Chapter2Events.cs — ch2_open (chapter turn +
      claim-the-beach; other camp sites arrive with their zones), THE
      BOAR KING's raid d7 dawn with all four answers (track/wall/tithe
      per the treaty brief, plus the hunt: backed-and-strong survives at
      a price via GoDynamic routing, otherwise deathCause boarking → THE
      BOAR KING card with his ledger epilogue), the smoke inland d13
      (SMOKE_SEEN/ANSWERED/WARY; staged as a cloud thread against the
      crown), the fifteenth-morning hearts (ev2_heart kavi bond+10 /
      heart_low / coco, trust-gated schedule), the king tide d16 (beach
      camps pay in stores and sleep). StoryChoice.GoDynamic added (the
      VN's function-valued go). Boar King rig (movable, broken tusk,
      scar plate) staged at the treeline and at his wallow. 10 new
      tests. Session 3 (Foothold complete): ev2_bond (the stick on the
      woodpile, +4) / ev2_solo (the knot holds) d9 dusk; the first storm
      d11 dusk — protect stores / fire / Kavi (bond +6), storm2's full
      consequence matrix (walls hold at shelter 2+, unsaved fire drowns,
      unsaved stores scatter, KAVI_FIRE_TEST when the ember lives);
      ch2_threshold d18 dusk — THE SMOKE's three roads (go now / prepare
      / choose the sea), each with its full end scene (the lantern-braid-
      shotgun meeting staged with a LanternShape rig in the deep green,
      E's bark-strip note, the two silent fires) into the ch2_end Ledger
      card that remembers every thread (site, tier words, King stance,
      storm, smoke — route leanings shown, as the VN's chapter cards
      canonically do). 7 new tests. Session 4 (Phase 5 COMPLETE):
      shelter tier 3 — the VN's "Fortify the camp" (ch2 camp works;
      same cost formula, cap rises to 3 in chapter 2, palisade + raised-
      cache greybox visual, threshold/king-tide payoffs now reachable);
      THE COURIER'S CASE (CaseArc.cs from scenes-extra.js: contemplation
      scene with the three openings — Ipo's audience dormant until Ipo,
      the engineer's drill, the chart-tearing smash — CASE_CONTENTS with
      the knowsGlass naming rule, loot flags banked for ch3's Edda scene
      and ch4's Rosa dive; a camp CaseInteractable by the fire's flat
      stone, opening charged as a labor; v1 adaptation per the bible:
      the sea returns an unsalvaged case on day 8, ev2_case_ashore);
      COLD FIRE'S CYCLONE FRAMING (CycloneNight.cs from scenes-
      chapter5.js: ev5_cyclone on the calendar d58 night, tier taken
      BEFORE the death door is measured exactly as the VN does, flee-or-
      stay with the warning in plain text, staged with the storm rig;
      the full "the storm only did the audit" epilogue — while the plain
      exposure death keeps its lean card via a CYCLONE_APPLIED gate).
      Fixed en route: StoryPlayback now treats a fully When-filtered
      choice list as a continue scene (the fortified camp's cyclone
      would have soft-locked the dialogue). Ledger + run-summary case/
      cyclone lines. 17 new tests. Phase 5 done — next: Phase 6 depth
      passes / Chapter Three: Edda's mountain.*
- [x] Shakedown (first live-editor session, via Unity MCP): everything
      built blind in Phases 0–5 ran in a real Unity 6000.5 editor for the
      first time. Zero compile errors. Full EditMode suite executed for
      the first time ever: 190 tests, 189 passed, one failure —
      SurvivalActionsTests.Sleep_RoughCostsHope assumed Sleep SETS energy
      to the floor; the VN (scenes-chapter1.js sleep: floor = 45 +
      shelter*12 + fire*8, lift-only) says it only raises energy, and
      SurvivalActions.Sleep ports that faithfully, so the TEST was fixed
      (energy now dropped to 20 first so the floor-lift is actually
      exercised). Rerun: 190/190. Tidebound ▸ Scenes ▸ Build Castaway Bay
      (Greybox) ran clean — scene built and saved, 0 errors, 0 warnings.
      Committed alongside: first-editor-launch fallout (long-missing
      .cs.meta files, builder-generated materials now referenced by the
      saved scene, package resolves incl. the owner's newly installed
      Unity AI/MCP packages, real-editor scene re-serialization).
- [ ] Phase 6 — depth passes per act · Phase 7 — companions, NG+, polish

V1 scope (bible §8): crash → Bay/Tide Pools/Fringe/Green Deep, full day
loop, Kavi only, chapters 1–2, the Boar King, five endings.
