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
- **Work in the dedicated worktree `C:\Dev\GameRepos-claude`** (created
  2026-07-20), which holds this branch permanently; the owner uses GitHub
  Desktop on `C:\Dev\GameRepos` for the other game, so that checkout's
  branch flips mid-session. The Unity editor for dev sessions opens
  `C:\Dev\GameRepos-claude\tidebound-unity`. Never `git switch` the main
  checkout; the worktree pin also stops Desktop from taking this branch.
  **Owner's rule: this branch only — NEVER touch the `GPT-Unity` branch**
  (no checkouts, no commits, no edits; it is the owner's other game).
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
- [x] Phase 5 finale verified live (local Unity MCP session): the
      fortified-camp / courier's-case / cyclone commit compiled clean on
      first contact with the editor and the full EditMode suite passed
      210/210 first try (was 190 — the finale's 20 new tests included).
      Build Castaway Bay regenerated the scene with Tier3_Fortified
      (palisade + raised cache) and the CourierCase prop; 0 errors,
      only known-benign warnings (Input Manager deprecation notice —
      deliberate, see "No Input System package"). This commit carries
      the regenerated scene, re-serialized materials, and the finale
      scripts' fresh .cs.meta files.
- [~] Chapter Three — The Green Deep. *Session 1 (this commit): the
      chapter turn — ch3_open ported from scenes-chapter3.js with its
      three doors (branch on the Smoke decision): the night meeting on
      Edda's floor (SMOKE_NOW), the noon appointment with the note
      (SMOKE_LATER), and the signal-keeper's cold open (SMOKE_IGNORED);
      both meeting scenes' choices with the full Edda-meter math
      (base + eddaChem companion chemistry; kavi/solo live, the rest of
      the map ported for later companions), EDDA_PRESSED/EDDA_PATIENT,
      Depth route pays; the walk-down scenes (ch3_after_open with the
      unearned basket +12 hunger, ch3_after_press warily) banking
      GROVE_OPENED + LORE_FEVERBARK once each; ch2_end's card now
      continues into ch3_open (the VN's "start a new run" option stays
      with RunCardUI, v1 adaptation); VN mid-dialogue tickSegment calls
      folded into effects per the ch2 precedent. 10 new tests.
      Session 2: the grove is a PLACE — the terrain grows the mountain's
      knee (northeast rise whose slope quantizes into cut terraces near
      the grove), BuildEddasGrove in the scene builder (fence ring with
      a south gate, the hut with the shotgun by the door, rain tanks,
      drying rack, six planted terrace beds, the flowering tree over the
      two kept graves, the feverbark at the edge, boundary stones, the
      marked path up from the interior, and a greybox EddaRig for the
      stage director to borrow later; the Green Deep's wild trunks now
      skip her fenced ground); grove region in Regions.cs (map.js
      verbatim: first-visit workday, Edda+6 fx1, the three-card deck)
      with IdAt footprint x>40 z>230, auto-pinned on the Wayfinder once
      seen (law #3); and the first four ev3 calendar events ported +
      scheduled — ev3_river d20 dusk (RIVER_KNOWN, thirst +40, the
      artery), ev3_eddavisit d21 dawn on the signal road (coldest door:
      edda 10+chem, GROVE_OPENED + LORE_FEVERBARK + SALVE — she leaves
      cuttings), ev3_fever d22 dusk (guard is the VN's; FEVER_SEED
      stays dormant until fringe camping arrives), ev3_grin1 d24 dusk
      (GRIN_MET, the log that was never a log). 7 new tests.
      Session 3 (the back half): ev3_king2 d27 day — all four Boar King
      continuations (the state visit, the wallow's snare-wire and small
      skulls → KING_SYMPATHY, the wall that holds, the expensive
      unresolved return) with KING2_APPLIED effects pinned; ev3_pulse
      d28 night (the lagoon misses a beat; Kavi watches the WATER);
      the d31 hearts — ev3_heart2 (Kavi answers the pack from beside
      your fire, bond +10), ev3_heart2_low, ev3_coco2 (the shelf);
      and OLD GRIN'S TOLL, ch3_threshold d35 dusk, with the v1
      currencies — bait the far channel (2 stores), the dawn window
      (GRIN_SCOUTED), Kavi's predator-etiquette standoff (trust 50+),
      the fight (health < 35 = deathCause grin, the warning in the
      choice's own subtext, per law #1; survivors take a laceration
      and −25 health), or turn back (policy, not defeat) — each toll
      with its full canon text into ch3_east (the mast, LORE_HALCYON /
      IPO_KEY conditionals ported for later) or ch3_end_stay, then the
      ch3_end Ledger card remembering Edda's regard tiers, the fever,
      the King, the toll, and the east. 8 new tests (234 total).
      Session 4: EDDA IS VISITABLE — the VN's 'grove' hub scene split
      into per-purpose story scenes (grove_work / plants with the
      one-time marshmint speech / wound / cure / the three-stage lore
      ask ending in the Halcyon story at regard 55+ or a refusal that
      keeps the door open / gems naming the heartglass via
      CaseArc.KnowsGlass / the case and its crest / the graves: Ilsa
      and Aleksander), offered by EddaInteractable at the EddaRig
      (priority order, cure and wound first, max-3 prompt; talks free,
      labors charge segments via GameManager.VisitEdda); the
      SILVERTHREAD is real — a carved ravine down the west interior
      (Height + RiverX), water strips and amber stones, no trunks
      mid-channel, and a hauling bank (RiverInteractable, unnamed
      until ev3_river fires — law #3) with the VN's haul numbers via
      GameManager.HaulRiverWater. 7 new tests (241 total). Verified
      via CLI batchmode; scene rebuilt clean.
      Session 5 (CHAPTER THREE COMPLETE for v1): the MANGROVE EAST is
      a place — tea-dark standing water between root cathedrals (34
      trunk clusters with prop-root tripods), one clear channel, the
      claw-marked buttress, and OLD GRIN himself, permanent furniture
      lying mostly submerged in the crossing (six meters, moss-backed,
      two Flame eyes; the director only aims at him, never hides
      him); mangrove region ported from map.js (first-visit, fx1,
      deck; almanac hooks trimmed) with its IdAt footprint; STAGING
      for every ch3 beat — ch3_open against the crown, the river
      reveal (GroundAt shots), Edda IN the camp (EddaCampRig with the
      broken-open shotgun, built hidden by the fire ring), the fever,
      the channel shot for grin1/threshold, king2 branching (wallow
      for the tracked, rig at the treeline otherwise), the night bay
      for the pulse, the grove fence for every grove_* visit, toll-
      crossing sub-beats, and the ch3_east reveal that shows the
      EastMastRig (rusted mast + rooftops at x640, hidden until the
      crossing so the reveal stays a reveal); the medic's burn-it-out
      fever self-cure (camp_fever_burnout scene + CampfireInteractable
      option, medkit −2, guarded to fever only). Region pins updated
      to 6. 2 new tests (243 total). Verified via CLI batchmode;
      scene rebuilt clean with all rigs serialized.
      Chapter remainder deferred to later phases by design: grove
      seasonal variants (monsoon dressing belongs to ch5), Rumors
      integration, and non-Kavi companion variants arrive with their
      companions (Phase 7).*
- [~] Chapter Four — The Hum. *Session 1 (this commit): the chapter
      turn under the monsoon warning (ch4_open, branch on EAST_OPEN);
      Edda's escort across the ford for toll-refusers (GRIN_ESCORTED,
      edda +5) or the west locked by choice (WEST_LOCKED — the whole
      west-variant season stays reachable); STATION HALCYON's arrival
      (STATION_OPENED once, the held breath fifty years long,
      kavi/solo variants) and the station itself as a room-per-
      expedition hub: the interrupted mess (2 stores, hope −2),
      Vane's journals rationed in three stages (VANE_J1-3 +
      DRAWER_KNOWN: "burn unread"), the radio room's list (signal +2,
      engineer/lay variants), the E WING — defeated doors don't
      re-ask until tomorrow (EwingTry, new GameState key), opened by
      Ipo's key or the engineer's hinge-work (TRANSMITTER, HEARTGLASS,
      INCIDENT_HINTED, GEMS_LINKED when the courier's stones were a
      riddle), the generator shed (FUEL), the cable sweep (WIRE), and
      staging the radio when the list closes (RADIO_STAGED, hope +6,
      "an engineering question"); ch3_end now continues into ch4_open;
      StationTrailhead cairn on the east bank runs the expedition
      (energy −6, one segment, retires when the station is stripped);
      stage shots for the turn, her fence, the ford escort, and the
      yard under the mast (EastMastRig shown). 11 new tests (254).
      Session 2 (CHAPTER FOUR COMPLETE for v1): the ev4 calendar —
      the chart recorder d38 (the March 1979 nine-hour flatline, the
      scar in the rhythm) with the west-variant wreck drift (fresh
      timber, half a nameplate, WIRE parity for the never-crossed);
      RYO NAKATA d40 when Signal ≥ 5 (the sail out of the southern
      haze, generous triage vs the cold strip of the Kingfisher, the
      ryo meter live, "there are two castaways on Vessakai now") or
      the seven-mile contrail for the quiet (ev4_noryo's two answers);
      Kavi's station warning d44 (the crack at the E wing's
      foundation); ev4_pulse2 d47 (twice in one night, the recorder
      comparison closing your throat); and VANE'S QUESTION d52 — open
      the drawer (the full Incident: the bore site, the throat,
      Ostrander and Kim, "tend the skin", GULLET_MAP banked for act
      3), burn it unread (the line in the updraft), or carry it up
      the mountain (sixty years taking its coat off, edda +8) — plus
      THE VIGIL for west-locked runs (sea/ground/east season plans)
      into the ch4_end Ledger card that remembers the station, the
      radio list, the journals, the recorder, Ryo, and the question.
      Ryo lives at the fire (RyoCamp interactable + rigs hidden until
      RYO_MET: tend him below 40, then the Kingfisher's three
      boat-work stages toward the held argument); stage shots for
      every beat. 8 new tests (262 total). Verified via CLI; scene
      rebuilt with RyoRig + KingfisherHull serialized.
      Deferred by design: the station as walkable terrain (framed
      shots carry v1), other companions' station gifts (Phase 7),
      Ryo's radio-list arc (chapter 5's monsoon story).*
- [~] Chapter Five — The Long Rain. *Session 1 (this commit, the whole
      story spine): ch5_open d53 — the change of government, the three
      master plans (COUNTDOWN/HOMESTEAD/DESCENT, GameState.Plan new
      key, route pays, IsMonsoon turns the drains by itself) and the
      committed echo; THE COUNTDOWN — assembly day (RADIO_DONE, the
      WINDOW_PLAN insight when the recorder/pulse2 taught you the
      skips) or the vessel push, the sixtieth-day sea trial
      (VESSEL_READY, Ryo's unfinished question), and the sixty-sixth
      night: MAYDAY through the skip — four seconds of the world,
      CONTACT_MADE — or the shipping lane as traffic report; THE
      HOMESTEAD — planting day (FARM, Kaari terrace/seed-cabinet
      variants), the Silverthread flood (dike the farm or save the
      stores), and the starving Boar King at the boundary (feed him:
      KING_ALLY and the shoulder-signed fence post; refuse: the
      heaviest arithmetic); THE DESCENT — three surge-lulls down the
      Gullet (GULLET1, the sounding pulse), the Gallery of Hands
      (SUNDERING_SEEN: they went IN), the deep-greed gamble (injected
      Rng, 35% THE LONG DARK death, else the heartglass spur), and
      the Heartroom's guttering wound where NAIA steps into the
      lamplight (NAIA_MET, "come and be decided" at the finale);
      shared: ev5_edda d63 — her smoke doesn't rise; she cures her
      feverish visitor from the pillow first (EDDA_CURED_YOU), winter
      her down at camp or in place; the three finales (the horizon's
      promise, THE TABLE with the household guest list and the three
      names, the watcher's offer) into the ch5_end Ledger card;
      ch4_end continues into ch5_open; full calendar d56-d69 with
      plan guards; monsoon stage dressing (rain + weather override)
      on every ch5 shot. 11 new tests (273 total). Verified via CLI.
      Remaining: the Gullet as a walkable place + Naia's rig, the
      permanent monsoon world dressing (rain outside cutscenes),
      grove monsoon flavor, ev5 companion cyclone beats (Phase 7).*
- [~] Chapter Six — Ashes and Stairs. *Session 1 (this commit, the
      whole chapter): the rains break (ch6_open d71, Naia at the fire
      for the invited, Ryo minding the sea things, heavy/light pack);
      the LINEAR ascent — the Terrace of Steps (grandmothers' road,
      spoon-worn centers), the Tidewell Temple (TEMPLE_SEEN, the
      breathing pool plumbed through the mountain, the keepers' murals
      ending in an extended hand), the time-slip for glyph-completers
      (ch6_vision: the unbroken mountain, the arrival, the placing
      gesture), the tremor ladder (camp on bedrock, or push at night
      and MOTHER ASH collects you — warned in the subtext, law #1);
      the INNER GREEN judged on TB.regard ported as
      Chapter6Events.Regard (11 ledger lines; trinkets lines dormant
      until that economy exists) — admitted (Tekau recites your month,
      guests eat first), probation (the scales don't settle), or the
      rim and the pointed spear; and THE TIDEWELL's doors — SILENCE
      (gated on wound knowledge; the veil thins, the world comes),
      FEED (the veil holds, every reeled-in soul yours to receive),
      KEEP (gated regard ≥ 4; the covenant, the post refilled after
      three hundred years), WITNESS (choose not to choose; "it will
      weigh more than everything you did") — each with its full canon
      resolution into the ch6_end Ledger card. The expedition's five
      days charge as a 10-segment sweep when the chain closes
      (GameManager hooks CH6_DONE — real drains, honest death
      checks). ch5_end continues in; ascent staging against the
      crown. 8 new tests (281 total). Verified via CLI.
      Remaining: the temple/caldera as places (framed shots carry
      v1), Naia's rig, other companions' mountain beats (Phase 7).*
- [x] Chapter Seven — Convergence (THE STORY SPINE IS COMPLETE:
      prologue → chapters 1–7 → endings, crash to card). *ch7_open —
      the aftermath week, its face set by the Tidewell's door (the
      found world's countdown, the veil's quiet, the keeper's parish,
      the witness's gentler island); THE CONVERGENCE at the hundredth
      dusk — the full option assembly ported with every VN guard
      verbatim (options whose systems aren't in v1 — trinkets, the
      fire-tower, vigils, NG+, other companions — stay dormant until
      their flags can exist, exactly as the VN gates them): the Found
      Shore / the Regret at low hope, the First Citizen, the
      Interpreter, Guardian of the Deep / the Covenant Passed, Keeper
      of the Window, Rootstead / Driftwood Rising, the Inner Green,
      the Whole Sky (kindred + regard 6 + edda 60 + standing), Two
      Sails Out, Two Tickets / the Long Swim, the Empty Horizon,
      Remain Willingly, the Tide Price, THE ISLAND'S OWN (Keeper
      Kavi), the Hum Silenced (depth 15+, warned), the Cartographer's
      Return, the Hermit's Heir, Ilsa's Answer, the Drowned Door,
      What Remains, Alone Unbroken, and more; every choice sets
      EndingId and hands the run to the RunCardUI. Endings.cs grew
      27 CORES verbatim (unwritten VN cores fall back to ROOTSTEAD,
      mirroring `CORES[id] || CORES.HOME`), the parameterized
      EPILOGUE engine (Kavi's stay/leave fates, Edda's three
      farewells, Ryo the harbormaster, the King's held treaty, the
      name that outlives its plans, the Green's counting songs), and
      THE LEDGER OPENS report (days, entries, routes, trust tier,
      roads not taken). RunCardUI appends epilogue + ledger to ending
      cards; deaths keep their lean cards. 10 new tests (291 total).
      Verified via CLI.*
- [~] Phase 7 — companions. *Session 1: BURI, end to end — the
      Clearing offers the bearded pig (court_buri ported verbatim:
      the doubled dinner, the three circles, the orchestral snoring;
      BURI_NAMED, trust seed through the shared formula); the
      companion machinery refactored into CompanionController (shared
      trust-tier AI — serialized field names preserved so the scene's
      Kavi rig keeps its wiring; KaviController and BuriController
      are now thin species chassis: Buri trots slower, strides
      heavier); CompanionLogic grows per-companion TIER_LINE
      vignettes (Buri's five tiers verbatim: tax collector →
      woodpile fixture → two hundred pounds of NO → honor guard →
      the two-person wallow) behind back-compatible accessors;
      BuriInteractable (share food / talk at him / lean into the
      lean); BuildBuriCompanion greybox (barrel body, beard, tusks,
      tail helicopter via TailWag) self-gated like Kavi's; his VOICE
      threads the chapters (StoryScene.SpeakerDynamic added for
      per-companion nameplates): Edda's smokehouse verdict, the d31
      perimeter-walk heart, the HALCYON STORES trailer at d44
      (TRAILER + roots, feeding ch5's dike), planting-day plowing,
      the Boar King send-off, the mountain — stairs-as-enemy, the
      kneel at the nave, the broadside tremor warning, the bedrock
      windbreak — Tekau's "young tusker" testimony, THE ISLAND'S OWN
      accepts Keeper Buri (per-companion core body), his epilogue
      fates (stays: the warm boulder; leaves: he does not watch you
      go), SOUNDER's gate live. 6 new tests (304 total), verified
      via the SYNCHRONOUS TestRunner (runSynchronously: works
      unfocused, instantly — the method of record for MCP sessions).
      Scene rebuilt with BuriCompanion serialized.
      Session 2: MOA, end to end on the same machinery — the Clearing
      offers the copper hen (court_moa verbatim: the perimeter
      patrol, the ruined-hawk morning filed as precedent, MOA_NAMED,
      the shared trust seed); MoaController chassis (fast affronted
      trot 2.8/5.2, snap turns at 540°/s, quick tiny bob — she
      declines every perch and marches); MoaVignettes five tiers
      verbatim (wound like a spring → the briefing → exactly one
      gathering → blanketed-feet sentry → her flock); MoaInteractable
      (scatter grubs / receive the briefing / gather her in);
      BuildMoaCompanion greybox (copper body, comb, beak, tail
      feathers on TailWag) self-gated; her voice threads the
      chapters: the lap-step d31 heart, mantled-to-twice-her-size,
      the greenhouse seed cabinet at d44 (SEEDS + roots, paying off
      as ev5's planting inspector-general), Edda's blanketed feet,
      the sergeant's march up the ten thousand stairs, the rigid
      flat-note tremor warning, Tekau's "small brave hen", THE
      ISLAND'S OWN accepts Keeper Moa (six ounces of copper
      courage), epilogues (REMAIN: head of the column; stays: Moa
      rules; leaves: carried to Edda's grove). 7 new tests (311
      total, all green, synchronous runner). Scene rebuilt with
      MoaCompanion serialized. Field note: a hand-written .cs.meta
      left MoaController out of the compile graph (CS0246 from its
      referencer while the file sat in the ADB) — deleting the meta
      and letting Unity mint it fixed the import; compiles also only
      pump while the editor has focus (focused it via Win32 from the
      session).
      Session 3: VELA, end to end, on the game's FIRST FLIGHT CHASSIS —
      CompanionController opened four virtual seams (FollowStation /
      PickRestSpot / MoveToward / GroundClamp) so species can replace
      locomotion, not just tune it; VelaController orbits the player
      in slow circles while you move (FollowStation advances an orbit
      angle), perches when you stop (far snag at Wary, the dead palm
      inside camp after), flies at altitude and lands on approach
      (airborne flag decays into a landing; no bob — she banks).
      The Clearing offers the sea eagle (court_vela verbatim: the
      mullet on the high rock, the blind side offered, and the second
      choice that NAMES NOTHING — VELA_NAMED only if you name her);
      VelaVignettes five tiers verbatim (books open → announcing
      arrivals → your left side → fish by decree → mantling the
      camp); VelaInteractable (lay a fish on the high rock / stand in
      the open / and the touch LOCKED until Kindred — she cannot be
      hugged until the very end of her arc, and the game makes you
      feel it); BuildVelaCompanion greybox (white belly, storm-dark
      mantle, one amber eye, one sea-glass blind). Her voice threads
      everything: the credit-extension heart, the head-to-chest
      heart2, Edda's "mind you stay solvent," the toll crossed on
      her syllables alone (GRIN_OVERWATCH — and ch3_toll_buri's
      convoy crossing backfilled while in there), the mast sentry
      post, the radio-room WIRE gift, the DRILL_ROAD find (depth 2,
      lighting the descent's sub via new StoryChoice.SubDynamic),
      the cyclone that shows her whole heart once (VELA_MANTLED at
      75+ or the empty snag), escort formation up the stairs, the
      stillest pillar in the temple, landing ON you at the tremor,
      the sentry wall at bedrock, Tekau's "old blind-eyed queen of
      the cliffs." Endings: THE WIND TAKES HER ported whole (her
      exclusive — the open hand at Kestrel Cliffs, trust 75+),
      ISLANDS_OWN accepts Keeper Vela (a ledger AS a heart),
      epilogues (leaving: reef-gate escort one mile beyond; staying:
      she outlives every actuarial table). 10 new tests (321 total,
      all green first run, synchronous runner). Scene rebuilt with
      VelaCompanion serialized.
      Session 4: IPO, end to end, on the CANOPY CHASSIS — IpoController
      moves in dash-and-audit bursts (a scamper, a dead stop to
      reassess, another scamper — MoveToward gates the base step on a
      dash/pause clock), keeps to the palm canopy above camp while
      Wary (PickRestSpot sends him aloft; GroundClamp climbs the last
      stretch), and owns the ground after. The Clearing offers the
      macaque (court_ipo verbatim: the front row, the whole
      repertoire, and THE LIGHTER RETURNED — AddItem restores the
      day-2 theft, the salute choice names nothing); IpoVignettes
      five tiers verbatim (auditing your possessions → moved into
      camp → shoulder parade → tribute with ceremony → grooming with
      the gravity of a priest); IpoInteractable (share the fig ration
      / take the front row — an audience is his actual currency /
      sit for grooming at AllowsTouch: membership, not payment). His
      voice threads everything: the grooming heart (adopted, the
      paperwork finished on your scalp), Edda's shotgun verdict
      ("stays outside the fence"), the HOARD heart2 that surrenders
      the HALCYON E-WING KEY (IPO_KEY + depth 2 — the door's oldest
      gate finally has its supplier; CaseArc's case_open_ipo went
      live for free), the toll paid in the greatest performance of
      his career (GRIN_DISTRACTED), the lab-block quartermaster trove
      (RADIO_PARTS_BONUS + signal), the Gullet FEAR-WALK (he leads
      into his own terror at knee height, bond +8), the cyclone spent
      inside your shirt (morale officer, never off duty), the Hum
      harmonized on the stairs, the museum-goer's temple, the
      inside-the-jacket tremor, the bedrock fistful of your shirt,
      Tekau's "laughing thief." Endings: TRICKSTER offered at trust
      90+ (core unwritten in the VN — falls back per parity, fate
      covered by companionCovered), ISLANDS_OWN accepts Keeper Ipo
      (the seven beats LAUGH), epilogues (leaving: the highest palm
      and the lighter back in your pack, paid in full; staying:
      troop, treasury, audience — you, forever, front row). 11 new
      tests (332 total, all green first run, synchronous runner).
      Scene rebuilt with IpoCompanion serialized.
      Session 5: NINE, end to end — THE COMPANION ROSTER IS COMPLETE
      (all six of the Clearing's candidates courtable, plus the solo
      road). The TIDE-BOUND CHASSIS is the last one: NineController
      clamps every target she is ever given into the shallows band
      along the tideline (z ∈ [shoreZMin, shoreZMax]) — she paces
      you up the shore in the wave-wash and simply STOPS at the line
      where her world ends when you walk inland (absence is a
      designed cost, now literal in the sim); Wary keeps her at the
      gallery pool on the eastern shelf; she pours rather than
      strides (no bob — a slow surface sway, riding the water over
      depth and sitting in the pools over shelf rock). The discovery
      gate was already live (TidePoolVisits == 2 → NineIsDue);
      court_nine ported verbatim (the crab, the arm-tip light as a
      thought, the spiral traced in the sand — answering in her
      language names nothing); NineVignettes five tiers verbatim
      (one eye out, noting → trading at market rate → reading your
      pulse like a letter → the puzzle school → your button in her
      gallery); NineInteractable (bring a live crab / watch, and be
      watched — affection, for her, IS attention / offer your wrist
      at AllowsTouch). Her voice threads everything: the Mimic heart
      (the kelp copying your fire-tending coax), Edda putting down
      her cup ("Sixty years I have waited for one of them to pick a
      person"), the ev3 pulse where she watches YOU and not the
      lagoon, the SHIP_PHOTO heart2 (the courier's photograph raised
      from the fuselage — hope, with a bearing on it), the
      Silverthread that was always her front door, the toll never
      owed (GRIN_MAPPED — the back door of his kingdom), the
      VANE_FILM canister from the station's drowned throat, the lit
      Gullet where she keeps time with the island (bond +5), the
      cyclone spiral in the storm's rearranged sand, the tideline
      goodbye before the mountain and the pools you check anyway,
      the impossible reunion IN the Tidewell pool, Tekau's
      "nine-armed daughter of the tide." Endings: THREE_SPRINGS
      offered at trust 75+ (core unwritten in the VN — falls back
      per parity), NINES_GARDEN ported whole at trust 50+ (the
      presidential pool), ISLANDS_OWN accepts Keeper Nine (the
      covenant keeps what keeps it — mortality lifting off your
      friend like weather), epilogues (leaving: she follows the hull
      to the reef gate and the light of her goes down; staying:
      three springs come due, and the island sends what it sends no
      one). companionCovered brought to full VN parity (+
      THREE_SPRINGS, NINES_GARDEN, ROOSTER_DAWN). 11 new tests (343
      total). Scene rebuilt with NineCompanion serialized.
      FIELD NOTE — the MCP bridge mid-session attached itself to the
      OTHER open Unity editor (the GPT-side project, 1-connection
      plan limit, sticky pipe): verification switched to the CLI
      fallback — copy Assets/Packages/ProjectSettings to scratch,
      batchmode -runTests there (the open editor holds the real
      project's lock), -executeMethod the scene builder in the copy,
      and copy the rebuilt scene back. ALWAYS probe
      Application.productName via RunCommand before trusting the
      bridge when two editors are open.*
- [ ] Phase 6 — depth passes per act · world-side depth for chapters
      4–7 (station/temple/caldera as places, Naia's rig, monsoon
      world dressing) · NG+, polish

V1 scope (bible §8): crash → Bay/Tide Pools/Fringe/Green Deep, full day
loop, Kavi only, chapters 1–2, the Boar King, five endings.
