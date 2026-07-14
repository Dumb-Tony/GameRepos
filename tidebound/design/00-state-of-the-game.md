# 00 · State of the Game — the Resumption Document

> **Purpose:** if the chat that built this game is ever lost, this document — together
> with the twelve design docs that follow it — is everything needed to pick up
> Tidebound with the same vision. It records what is BUILT (and how), where it
> deviates from the original design, the code and writing conventions, and the
> roadmap in priority order. Last updated: **2026-07-14** (Wayfinder v2 + Scars, Not Graves).

## 1. Project snapshot

- **Live game:** https://dumb-tony.github.io/GameRepos/tidebound/ (GitHub Pages, serves `main`)
- **Repo:** `Dumb-Tony/GameRepos`, game in `tidebound/`, design bible in `tidebound/design/`
- **Dev branch:** `claude/island-survival-vn-design-3iyhzk` — reset onto `origin/main` after every merge; work merges to main via PR (owner's standing permission)
- **Merged PRs:** #2 complete game · #3 art/memory/audio-v1 · #4 CLAUDE.md · #5 soundscape + TAB menu
- **Status:** playable start to finish (Prologue + 7 chapters, ~60–90 min/run), 26 art assets, full synthesized soundscape, in-game menu with save slots, cross-run memory
- **Art generation:** Higgsfield MCP → Recraft V4.1, ~156 credits used of 1336. Owner has approved using credits for game assets.

## 2. As built vs. as designed (the honest diff)

The design docs (01–12) describe the *full* game. The shipped v1 is a faithful but
compressed realization. Deviations a resuming developer must know:

| Designed | Built | Notes |
|---|---|---|
| ~100 in-game days | **34 days** (Ch1 d1–3 · Ch2 d4–9 · Ch3 d10–15 · Ch4 d16–21 · Ch5 d22–28 · Ch6 d29–33 · Ch7 d34) | Chapter *content* kept; day counts compressed. Expanding day ranges is pure tuning if desired. |
| 49 endings | **33 CORES endings** (RESCUE, STAY_OPEN, BROKER, HOME, VILLAGE, JOIN, KEEPER, COVENANT, TWO_WORLDS, SAIL_BLESSED, RYO_BOAT, LONG_SWIM, WHOLE_SKY, COCO, THREE_SPRINGS, LAST_PACK, TRICKSTER, ROSAS_RANSOM, OTHER_SIGNAL, FIRST_KAARI, + the Endings Expansion in ch7: REGRET, EMPTY_HORIZON, CARTOGRAPHER, REMAIN, HERMIT_HEIR, ILSA_ANSWER, DROWNED_DOOR, TIDE_PRICE, WIND_TAKES, SOUNDER, ROOSTER_DAWN, NINES_GARDEN, ALONE_UNBROKEN) + 8 death endings (thirst, hunger, injury, undertow, fever, grin, despair, dark) | Ending engine is parameterized — new endings = CORES entry (scenes-extra.js appends via TB.CORES) + convergence mapping. Now 37 cores: Phase-3 jokes (CRAB_TOWN, COCONUT_MOGUL), X3 The Loop (NG+), and S7 WHAT_REMAINS (via the Scars-Not-Graves peril arc — PERIL_HEALED/PERIL_SELFHEALED, not a death). Still unbuilt from design/09: D9/D10 death causes. C2 Good Boy is VETOED by the owner — companions never die; peril arcs are the sanctioned substitute. |
| Trust 0–100, 5 tiers, per-companion | ✅ As designed (`s.trust`, `TB.tier()`), plus `s.edda` and `s.ryo` human-relationship tracks | Never shown as numbers; behavioral text only. |
| Route points Signal/Roots/Depth | ✅ As designed (`s.route`) — steer Ch5 variant choice framing + Convergence options | |
| Island Regard | **`TB.regard()`** — computed from ~8 mercy/restraint/bond flags rather than a running counter | Gates Inner Green admission (≥4) and the keeper covenant. |
| Random event tables per region | **Scheduled events only** (`TB.SCHEDULE`: day/segment/when-clause) | Random tables are roadmap item 3. |
| Crafting tree (~70 recipes) | **Abstracted into camp actions** (shelter tiers 0–3, fire 0–1, food stores counter) | Full crafting is a possible later system; don't add without owner ask. |
| Collectibles (75) + almanac | **Glyph stones only** (3, as flags GLYPH1–3) | Roadmap item 4. |
| NG+ "Driftwood Loops" | **Cross-run memory v1**: `tidebound.meta.v1` records runs/endings/deaths; title gallery (X/14); déjà-vu lines in `falling` and `clearing` | Keepsake carry, X3 The Loop ending, run modifiers = roadmap. |
| Nine = secret companion | ✅ Tide pools twice before Day 3 | |
| Solo route | ✅ Full: Coco arc (COCO flag chain), ev2_solo, X4-style content folded into epilogues | |
| Companion-exclusive quests (design/03) | ✅ **Built** (scenes-quests.js): Old Bones, Troop Politics, The High Nests + hatchling, The Root Cellar + Kaari seed vault, The Flock + Edda's Rooster, Eight Arms Three Tricks + the reef-learns coda — plus heart scenes I/II, station beats, fear-arc peaks, toll crossings | Courier case arc, Rosa Dourada, listening vigil, temple time-slip, and the random-event layer live in scenes-extra.js. |

Everything else — companions' personalities/fears/loyalty arcs, Edda, Ryo, Naia,
Tekau, the Boar King and Old Grin, Halcyon/Vane/the Incident, the Hum/heartglass
lore, the Tidewell's meaning — is implemented as designed and the design docs
remain canonical for tone and facts.

## 3. Technical architecture (read before touching code)

**Stack:** plain HTML/CSS/JS, zero dependencies, no build step. Files:
`index.html` · `style.css` · `engine.js` (core) · `audio.js` (soundscape) ·
`menu.js` (TAB menu) · `runcard.js` (shareable run cards: `TB.RunCard.render(state)`
canvas 1080×1350 / `.download(state)` PNG, offered as 📜 choices on the `ending` and
`death` scenes; palettes per ending bg, deeds picked from the Ledger) ·
`loops.js` (Driftwood Loops NG+: store `tidebound.loops.v1` {loops, keepsake, know};
`TB.Loops.bank(state, keepsakeId?)` at every ending/death (guard flag LOOP_BANKED),
`applyNew(state)` stamps NGPLUS + KNOW_* + keepsake perk on fresh runs; scenes
`loops_menu` (title button when loops>0; modifiers set `state.mod` =
hard|silent|kind|chaos), `keepsake` (offered at endings), `ev_loop` grotto journal
(SCHEDULE d11 s1, NG+ only → LOOP_KNOWN → convergence gate → ending LOOP).
Modifier teeth: engine tickSegment (kind ×0.6 drains, hard = monsoon from ch4),
scenes-extra randomEvent (chaos 0.36 roll + rare ×3), ch1 clearing (silent = solo
only)) · `almanac.js` (Field Almanac, store `tidebound.almanac.v1` {seen, got},
CROSS-RUN by design: 25 species (18 with art incl. 11 new portraits; 7 "impossible"
Hum-lore entries masked as 🌀 dots until found) + 4 collectible sets — 10 glyph
stones (3 temple GLYPH + 7 STONE finds), 8 Vane pages (3 VANE_J + 5 PAGE finds),
6 Edda recipes (flag predicates), 9 photograph FRAGments (the courier's story).
Engine `_go` calls `TB.Almanac.note(sceneId)` for sightings + banks at
ending/death; finds arrive via scenes-extra POOL events rev_glyphstone /
rev_vanepage / rev_photofrag using reload-guarded `grantFor` (state.lastGrant).
Overlay: 📔 menu button, 5 tabs, set-completion lore cards.) ·
`map.js` (THE WAYFINDER v2: clickable SVG chart of Vessakai rendered INSIDE the
wayfinder scene's text (never overlaps buttons); 12 regions in `M.REGIONS`
{x,y,disc(),first[],fx1,deck[{t,fx}]}, fog-of-war via disc(), caldera
permanently locked ('It sends for them'); THE DOOR is the 🗺️ `#mapBtn` HUD
button — live only from camp/camp2 (`.mapBtnNo` shake elsewhere), no hub-list
entry; THE PICKER is the chart itself — region taps delegate through #textLog
→ `M.run(id)` → `TB.go('act_result')`; wayfinder choices are Fold-only;
`state.visits[region]` picks first-visit set-piece vs rotating deck, effects +
collectible geography (stones: fringe/deepgreen/river/grotto, pages: station,
frags: bay/bonebeach via Almanac.grantFor), s.out→act_result, tickSegment;
region-priority story mechanics ported OFF the chores list: deepgreen runs the
glyph pushes (GLYPH1→2→3, original ch3 prose, then deck), mangrove runs the
Grin scout (GRIN_SCOUTED), grove routes to the real `grove` scene once
GROVE_OPENED; the ch3Actions chores list keeps only true camp utilities
(Silverthread haul, crabs, tending); generated art `art/bg-map.webp` layers
over the painted SVG, degrading silently; chart paragraphs excluded from the
backlog history; in-panel CSS: `#mapSvg{aspect-ratio:440/320}`,
`#panel:has(#mapWrap){max-height:88dvh}` + `#textLog{flex:0 0 auto}`) ·
`scenes-peril.js` (SCARS, NOT GRAVES: `ev_peril` POOL event (w:4; gates
companion && trust≥50 && ch3–5 && once per run) — the companion takes a real,
species-specific hit (6 fully-written arcs in `PERIL`: boar charge, canopy
fall, squall crash, gore-line, hawk defense, king-low stranding); sets
`s.chInjured={day,tends}`, hope −6; a '🩹 Tend to X' ch3Actions decorator action
runs 3 distinct tending stages (bond +4 each) → `peril_whole` (PERIL_HEALED,
trust +10); untended, engine tickSegment quietly self-heals after 5 days
(PERIL_SELFHEALED). NOBODY DIES — owner's explicit order ("too attached to
Kavi"). Either scar flag + companion gates the 37th core WHAT_REMAINS at
convergence: choosing to stay because you nearly lost this once) ·
`scenes-prologue.js` · `scenes-chapter1..7.js`.
Global namespace `window.TB`. Cache-bust query `?v=N` on every asset — bump on release.

**Scene format** (registered via `TB.scene(id, def)`):
```js
{ bg: 'beach-day'|fn(s),        // backdrop class bg-<name>; drives art + ambience
  hud: false,                    // hide HUD (title/death only)
  who: {emoji,name,art?}|fn(s),  // portrait; art overrides the emoji->file map
  enter: fn(s),                  // MUST be reload-safe: guard with a flag
  text: [..]|fn(s)->[..],        // paragraphs; NEVER put effects in text fns
  choices: [..]|fn(s)-> [{t,sub,if,do,go}],
  next: 'id'|fn(s), nextLabel }  // linear scenes
```
**The three iron conventions** (violations caused every real bug so far):
1. All effects in choice `do` / `next` handlers or **flag-guarded** `enter` — never in `text` (text re-runs on reload).
2. Camp actions stash `s.out = {bg, text, go?}` then `go:'act_result'`; `act_result.next` = `s.out.go || TB.advance()`.
3. Nothing may call `TB.is()`/`TB.state` at script load time — only inside functions (static choice arrays are evaluated at load!).

**Time & flow:** day/segment clock (Dawn/Day/Dusk/Night), `TB.tickSegment()` applies
metabolic ticks (monsoon rates when `chapter===5`), `TB.advance()` routes: death →
scheduled event (`TB.SCHEDULE`, one-shot via `s.fired`) → chapter thresholds → night
→ camp. Ch1 uses `camp`/`night`; Ch2–5 `camp2`/`night2` (hub extended via the
`TB.ch3Actions` decorator chain); Ch6–7 are linear chains with explicit ticks.

**State:** `TB.state` — stats {health,hunger,thirst,energy,hope}, chapter/day/seg,
site (beach|fringe|overhang), trust/edda/ryo, route {signal,roots,depth}, plan
(sea|home|deep), inv, flags (the Ledger — write-once booleans, never GC'd),
companion, disease/injury, endingId. Autosave per scene to localStorage
`tidebound.save.v1` (skipped on title); manual slots `tidebound.slot1..3`; cross-run
`tidebound.meta.v1`; settings `tidebound.settings` + master mute `tidebound.snd`.
`loadSave()` migrates old saves — add defaults there when adding state fields.
**The 100-day calendar (`TB.CAL` in engine.js):** Ch1 days 1–5 (Clearing d5) ·
Ch2 6–18 · Ch3 19–35 · Ch4 36–52 · Ch5 (the Long Rain season) 53–70 · Ch6 71–85 ·
Ch7 93→100 (convergence enter pins day 100). ALL SCHEDULE entries use these
absolute days; safety nets in advance() use TB.CAL.chNend. Old (pre-100-day)
saves migrate in loadSave via `_cal` version stamp: newDay = NEW[ch] + (day −
OLD[ch]). Owner mandate: 100 days must feel like 100 NEW days. Delivered:
Phase 2 (25 living-island events, pool ~42), Phase 3 (seven bottles, black box
'Tell Voss we found it', star-iron, watcher's parcel, Crab Town action → 😂
CRAB_TOWN, nut counter → 😂 COCONUT_MOGUL; 36 cores), Phase 4
(`scenes-milestones.js`: d10 first rain, d25 first month, d30/45 Edda's story
(sets EDDA_GRAVES), d42 Great King Tide (the drowned stair), d48 Ryo's yarn,
d50 halfway vigil, d65 stillnight; + 3-stage fever-dream lore cycle via POOL,
w14 while fevered).
Settings include **color themes**: `theme` (text boxes — midnight/driftwood/lagoon/
ember/abyss) and `bars` (status-bar palette — island/tropic/seaglass/signal), picked
via swatches in the TAB menu (`menu.js` THEMES/BARS), stamped on
`<body data-theme data-bars>` by `TB.Audio.applySettings`, and realized as CSS
custom-property blocks at the top of `style.css`.
**QoL:** `tsize` (text size 85–120%, CSS var `--tscale`) and `type` (typewriter
reveal — engine `typeInto()` types plain+`<em>` text char-by-char, click snaps
complete, cancelled on scene change; other markup falls back to instant).
`TB.history` (session-only, cap 500) feeds the 📖 backlog overlay (menu button →
`#logOverlay`, grouped by day). `TB.continueGame` shows the generated `recap`
scene ("The story so far", in scenes-prologue.js: chapter name, companion,
freshest RECAP_DEEDS flags, lowest-stat warning) for saves with day ≥ 3, then
resumes `state._resume`.

**Art pipeline (important — sandbox egress is blocked to the CDN):** generated art
lives ONLY in flat `tidebound/art/`, referenced by filename. To add art: generate
via Higgsfield MCP (style prefix: *"Painterly stylized visual novel background art,
textured gouache brushwork, cinematic wide composition, soft volumetric light, no
people, no text, no watermark"* — Recraft V4.1, 2k 16:9 backgrounds / 1k 1:1
portraits), append `name.webp|rawUrl` to `art/manifest.txt`, push — the
`fetch-tidebound-art` workflow downloads/optimizes/commits (bg 1920w q82, char 512w
q85). Backdrops: CSS class `.bg-<name> .art {background-image}` over painted-CSS
fallback layers. Portraits: emoji→file map in engine + `who.art` override.
**Never download art in the sandbox; never Read image files into context.**

**Audio (`audio.js`):** all synthesized. Continuous layers (surf/wind/rain/river)
crossfade via `mixFor(bg, state)`; a 260ms scheduler sprinkles one-shots (birds dawn,
cicadas dusk, crickets/frogs night, gulls, drips, fire, thunder in Ch5) and renders
the **seven-beat hum** (7 low pulses + rest) where the lagoon glows. Animal calls in
`CALLS`, triggered per scene entry from portraits (engine's `animalCallFor`).
**Music:** a generative adaptive score (also in `audio.js`) — each scene maps to a
MOOD (title/day/night/storm/deep/ending/death) via `moodFor(bg, state)`; each mood
has a chord progression + pentatonic pluck scale + pacing (MIDI note numbers in
`MOODS`). Soft detuned-pad phrases with kalimba-ish plucks, then a rest so the
ambience breathes; title & ending moods carry a fixed motif. Own toggle
`settings.music`, bus `musBus`. `A.mood()` + `A._mchords` exist for tests.
Everything try/catch'd; starts on first gesture; honors settings + mute.

**Testing:** headless Chromium (playwright-core, executablePath
`/opt/pw-browsers/chromium-1194/chrome-linux/chrome`). Two harnesses (session
scratchpad, not committed): a strategy smoke suite and a "sane policy" driver
(drink<55/eat<45/rest<30, else random; **must prefer 'Continue —' buttons at end
cards or it restarts the game**). Green bar: 6 seeds reach endings or die honestly,
zero pageerrors/crash-banner. The crash banner shows scene id on any TB.go throw.

## 4. Ledger flags that matter downstream (selection)

Prologue: BRACED/HELPED_COURIER/SAW_ISLAND, SALV_* (5), BG_* (4) ·
Ch1: companion + interest, DIVED, FLARE_SPENT/HELD, SOS, SOLO_ROUTE ·
Ch2: SITE_*, NEST_BOX, KING_TRACKED/WALLED/TITHED, STORM_*, MOA_BOLTED/FOUND,
SMOKE_NOW/LATER/IGNORED, HEART1_* · Ch3: EDDA_MET/GROVE_OPENED, edda lore stages,
SALVE, FEVER_*, RIVER_KNOWN, GLYPH1-3, KING_SYMPATHY/KING2, GRIN_MET/SCOUTED,
GRIN_<method>, EAST_OPEN, HEART2_*, IPO_KEY, SHIP_PHOTO · Ch4: STATION_OPENED,
VANE_J1-3, DRAWER_KNOWN, E_WING_OPEN, TRANSMITTER/WIRE/FUEL, RADIO_STAGED, RECORDER,
RYO_MET (signal≥5 at d18), INCIDENT_FILES/FILES_BURNED/FILES_TO_EDDA, GULLET_MAP,
COMP4 gifts (DRILL_ROAD, VANE_FILM, TRAILER, SEEDS, KAVI_WARNING) ·
Ch5: plan, RADIO_DONE, WINDOW_PLAN, CONTACT_MADE, VESSEL_READY, FARM, FLOOD_*,
KING_FED/KING_ALLY/KING_REFUSED, GULLET1-2, SUNDERING_SEEN, WOUND_SEEN, NAIA_MET,
CYCLONE flags (VELA_MANTLED, KAVI_FIRE_NIGHT), EDDA_WINTER/TENDED, INNER_INVITED,
NAIA_TRUSTED/TERMS, HOME_NAMED + NAME_* · Ch6: TEMPLE_SEEN, TREMORS, INNER_GREEN/
INNER_PROBATION/RIM_ONLY, TIDEWELL_SILENCE/FEED/KEEP/WITNESS ·
Meta: META_RECORDED, META_K_* (per-ending/death).

## 5. Balance targets (don't retune casually — these survived playtesting)

Ticks/segment: hunger −6 (−8 monsoon), thirst −6 (overhang −8, monsoon −3),
energy −3/−4; injury −2 health, fever −1 health + energy cap 55. Coconuts +30/34
thirst; river +40. Night energy floor 45 + shelter×11 + fire×8. Trust: init
18+interest×5 (cap 45); tend +5, abilities +2, heart scenes +10; gates at 50
(heart I quality, toll crossings) and 75 (heart II). Deaths must always trace to
ignored warnings, never to RNG.

## 6. Roadmap (priority order — the vision for what's next)

1. **More endings** toward the designed 49 (design/09): first the secret set (X1
   First Kaari via glyphs+temple, X2 Rosa's Ransom — needs the treasure wreck &
   courier-case payoff content, X5 The Other Signal via CONTACT_MADE listening), the
   remaining companion finales (C1 Last Pack, C3 Trickster's Crown, C8 Three Springs
   with Nine's lifespan), and death-category expansion (D3/D4 despair & cave).
2. **Courier case payoff** — it's salvageable, Edda recognizes the crest
   (CASE_EDDA), Nine can retrieve it, but it never opens. Design intent: three
   opening methods, contents tie to Halcyon's sponsors + X2.
3. **Random event tables** per region/season with anti-repeat memory (design/08),
   incl. the rare wonder events (green flash, turtle hatching, whale migration).
4. **Collectibles & almanac** (design/10-11): remaining 27 glyph stones w/ lore
   text, Vane's 24 journal pages as findables, species almanac.
5. **NG+ full "Driftwood Loops"** (design/10): keepsake carry, X3 The Loop, run
   modifiers, Kaari recognition of loopers.
6. **Expand day counts** toward the designed 100 (more free days per chapter,
   more events to fill them) — only with more event content, else it pads.
7. Optional: generated ambience/music via Higgsfield `generate_audio` to layer
   over/replace synth; more portrait art (Ryo, Naia, Tekau — currently emoji).

## 7. Voice & style guide (the part that's hardest to recover)

- **Prose:** second person, present tense. Long sentences that land on short ones.
  Em-dashes for breath, italics (`<em>`) for the word that matters. The island is
  always slightly personified but NEVER speaks. Humor is dry, observational, kind —
  never snarky at the player. Emotional peaks earn their length; survival beats stay
  brisk.
- **Choices:** every option has a real upside and a real price shown or implied in
  the `sub`. No "correct" answers. Costs surface within two chapters. The game never
  says "+5 trust" — feedback is behavioral.
- **Characters in one line each:** Kavi = grief become loyalty (fears fire).
  Ipo = loneliness performing (fears dark). Vela = love as bookkeeping (fears
  storms). Buri = devotion without brakes (fears abandonment). Moa = courage as
  refusal (fears storms, arc inverts). Nine = attention as love, mortality as
  shadow (bound to water). Edda = tenderness sideways, insults as affection.
  Ryo = Signal personified, warmth deflecting grief. Naia = discipline losing to
  curiosity. The Boar King = veteran, not monster. Old Grin = toll, not villain.
- **Lore rules:** the Hum is 90% explicable (heartglass piezo + tides), the last
  10% stays ajar forever. "Tend the skin." The Kaari went IN. Endings resolve
  emotionally, never explain completely.
- **Endings:** core card + epilogue paragraphs assembled from the run's actual
  Ledger + "The Ledger Opens" report naming roads not taken. Tone tags from
  design/09 (🌅🍂🌑🌀😂).

## 8. Working agreements (also in /CLAUDE.md)

After EVERY work session: merge via PR (standing permission), reset the dev branch
onto main, and **post the live link in chat**: https://dumb-tony.github.io/GameRepos/tidebound/

## 9. How to resume from nothing

Give a fresh assistant: this file (or the repo), then say what you want built next.
The repo is the source of truth — `tidebound/design/` for vision, this doc for
state, the scene files themselves for voice reference (court_* scenes and the
heart scenes are the best style calibration). Verify changes with a headless-
Chromium full-run driver before merging; the game must always be completable.
