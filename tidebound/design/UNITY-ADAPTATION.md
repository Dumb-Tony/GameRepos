# TIDEBOUND → UNITY · The Adaptation Bible

*A handoff document for turning Tidebound (browser visual novel) into a 3D
adventure RPG in Unity. Written for a fresh Claude session working inside a
new Unity project — read this file first, then pull canon from the sources
below as each phase needs it.*

---

## 0. How to use this document

You (the new Claude session) are adapting, not porting. The VN's job was to
tell this story in prose; the 3D game's job is to let the player *live on the
island*. Keep the story, the cast, the systems, and the tone. Replace the
delivery.

**The canon lives in two places:**

| Source | What it's the truth for |
|---|---|
| `tidebound/design/01-overview.md` … `12-future.md` | Story, characters, lore, endings, events, survival balance, voice. Written as a writers' bible — quote it, trust it. |
| `tidebound/*.js` (the shipped game) | The *machine-readable* truth: every scene's prose (`TB.scene(id, …)` registrations across `scenes-*.js`), the event calendar (`TB.SCHEDULE`), every flag, the 12 map regions (`map.js` `M.REGIONS`), trinket catalog (`trinkets.js`), species (`almanac.js`), endings (`scenes-chapter7.js` + `endingId` sites). |
| `tidebound/design/07-voice…` §7 of `00-state-of-the-game.md` | The voice & style guide. The single hardest thing to recover if lost. All new prose must pass it. |

**Two iron rules carried over from the VN — they are design law, not code:**
1. **Deaths must trace to ignored warnings.** The island always warns once.
   No random deaths, no gotchas. In 3D this matters *more* (physics kills).
2. **Companions never die.** They can be hurt, scared, and scarred
   (the peril/nursing arc), but the pet never dies. Non-negotiable.

And one rule from the recent lore-order work: **undiscovered stays unnamed.**
Companion names are player-given; NPCs, places, and heartglass are only ever
named in dialogue/UI after the player learns them. Carry this into every
quest journal entry and map label you write.

---

## 1. The pitch (unchanged)

You wash ashore on an island no chart admits exists. One hundred days. You may
earn the trust of exactly **one** wild animal — the game's defining decision.
Three pulls shape every day: **Signal** (get home), **Roots** (make a home),
**Depth** (the island has a heart, and it's listening). The island hides
itself behind the Hum — a piezoelectric mineral seam (heartglass) that bends
compasses and drowns radios — and it is inhabited: a hermit botanist who
stayed fifty years, a sailor the Hum reeled in, a hidden civilization in the
caldera, and two apex beasts with opinions about your expansion. It ends one
of 49 ways.

**Genre translation:** narrative survival-adventure RPG. Think *Firewatch's*
writing + a light *Valheim/Subnautica* survival loop + one *Fable*-grade
companion — NOT a combat RPG. There is almost no combat in Tidebound; the
Boar King and Old Grin are *negotiations* (territory, tribute, timing,
respect), and the best "boss" outcomes are the ones where nothing fights.

---

## 2. The world as 3D space

The Wayfinder's 12 regions become zones. The island reads as one landmass:
beaches ring it, jungle fills it, the river cuts it, the broken volcano
crowns it. Verticality is the depth axis literally — beach (sea level) →
jungle shelf → river gorge → station plateau → cliffs → caldera rim.

| Zone | Biome / feel | Gameplay role | Signature POIs |
|---|---|---|---|
| Castaway Bay | Bright sand, wreck debris | Home base, tutorial, camp building | Your camp, the wreck offshore, boundary stone |
| The Tide Pools | Reef shelf, low-tide maze | Foraging, Nine's domain, tide-clock play | Pool cities, the drop-off, sunken fuselage |
| Bone Beach | Grey storm shore | Beachcombing economy (trinkets), crab colony | Wrack line, crab town, courier's cairn point |
| The Jungle Fringe | Beach/jungle ecotone | Early forage, first warnings | Clearing (companion courtship), smoke sightline |
| The Green Deep | Dark interior jungle | Danger tier 2, Boar King's country | Wallow, glyph stones, fig hoard tree |
| Kestrel Cliffs | Wind, guano, forty visible meters of consequence | Vela's domain, climbing/egg risk | High nests, ledge, fire-tower |
| The River & Ford | Gorge, tea-dark water | The one honest road inland; Old Grin's toll | The ford, Silverthread falls, upriver stones |
| The Mangroves | Drowned forest, half water half secret | Danger tier 2 east, stealth/water traversal | Grin's channel, glyph stone, east passage |
| Edda's Grove | Terraced garden on the mountain's knee | Quest/social hub, medicine, lore | Her house, the graves, boundary stones |
| Station Halcyon | 1970s outpost, abandoned mid-breakfast | Dungeon-lite: exploration, radio questline | Mess, Vane's office, radio room, **the E wing** |
| The Grotto ("the Gullet") | Sea-cave system, bioluminescent | The underworld: tide-clock dungeon, heartglass | Breathing gap, glow galleries, the wound |
| The Broken Crown | Caldera — **locked** | Endgame only. "It sends for them." | Temple, Tidewell, the Inner Green (hidden town) |

**3D-specific guidance:** build it as one openable world but *gate like the
VN gates* — Old Grin IS the east gate, the Boar King IS the interior gate,
the tremors gate the crown. The island can physically exist from day one;
what opens it is knowledge and standing, not keys. The Hum gives you a
diegetic reason the minimap/compass is unreliable — lean in: navigation by
landmark and hand-drawn chart (import the VN's parchment Wayfinder as the
in-game map item).

---

## 3. The cast

**The player** — background chosen in the crash flashback (Flight Medic /
Wildlife Photographer / Line Cook / Marine Engineer), each a perk package
(medicine / tracking-observation / food economy / repair-engineering) and a
reason nobody's waiting too hard back home.

**The six companions** (full arcs in `03-companions.md`; quests in
`scenes-quests.js`): Kavi the pariah dog, Ipo the macaque showman, Vela the
one-eyed sea eagle, Buri the young bearded pig, Moa the junglefowl hen, Nine
the octopus (secret: earned by visiting the tide pools twice before day 3).
Trust runs Wary → Watchful → Warming → Bonded → Kindred. **In 3D, trust tiers
are the companion's AI behavior set** — how close they idle, whether they
follow inland, whether they alert (each companion's warning sense is a
gameplay ability: Kavi smells predators, Vela sees weather, Moa hears the
mountain, Nine reads the water, Ipo steals/retrieves, Buri hauls). One
companion per run. The courtship (end of act 1) is the character-creation
moment that matters most.

**The humans:** Edda Voss (74, flinty, the mentor-gatekeeper; her failing
health is the game's clock-that-isn't-the-monsoon), Ryo Nakata (sailor,
arrives mid-game if your Signal is loud, boat-building ally), Naia (Kaari
scout, watching from day one — let sharp-eyed players *see* her in 3D long
before her reveal), Tekau (Elder Speaker), M. (the other castaway — radio
voice only, the vigil correspondence arc), Dr. Ilsa Vane (dead; the journals
are the lore spine), the courier (dead before the game starts; his case,
photograph, and cairn are the game's emotional throughline).

**The beasts:** the Boar King (scarred veteran; keeps his own ledger of the
four who thought rent was negotiable) and Old Grin (the crocodile landlord of
the ford; eight distinct canonical ways to pay/dodge/win his toll — each is a
quest solution, keep all eight).

---

## 4. Systems, translated

| VN system | Unity translation |
|---|---|
| 5 meters (health/hunger/thirst/energy/hope) | Same. **Hope is the one to keep** — it's the genre difference. Feed it with beauty, finds, companion moments; drain it with rain, losses, monotony. |
| Day = 3 segments (dawn/midday/dusk) + night | Real-time day cycle that *pauses inside conversations*; actions cost segment-fractions. ~15–20 min per day feels right. 100-day calendar with the monsoon arriving act 3. |
| Route points (Signal/Roots/Depth) | Invisible alignment axes fed by deeds (salvage vs. build vs. delve). Never shown as numbers; shown as the world reacting (Ryo notices your mast; Edda notices your garden; the island notices *you*). |
| The Ledger (flags) | The quest/journal system. The VN's flag glossary (§4 of `00-state-of-the-game.md`) is your quest-state checklist — every flag is a beat that must be earnable in 3D. |
| Trinkets (23-item catalog) | Ground-loot beachcombing economy, `trinkets.js` verbatim — each has prose and some have Edda payoffs (she's a vendor who pays in lore and skills, not currency). |
| Almanac / glyphs / Vane pages / photo fragments | Collectible sets with set-completion lore payoffs. Cross-run by design. |
| The Hum & heartglass | Environmental storytelling + a literal audio system (the seven-beat pulse) + the compass-spin mechanic. The lagoon glows at night. Radios drown until the seam is understood. |
| Weather / monsoon / cyclone | Act-3 world-state change (rain systems, flooded ford, the cyclone night as a scripted survival sequence with shelter-tier stakes). |
| NG+ (Driftwood Loops) | Keep it: cross-run memory, keepsakes, déjà-vu whispers, The Loop ending. It's cheap in 3D (save data) and it's the game's soul. |
| 49 endings | Keep the *resolution logic* (deaths → secrets → Tidewell → companion finales → route-dominant → fallback) even if v1 ships a subset. |

---

## 5. The story spine (acts)

Seven chapters over ~100 days — full beat lists in `02-story.md`:

1. **Ashore** (d1–5): survive, meet the animals, **the Clearing** (choose one companion — or none).
2. **Foothold** (d6–18): camp tiers, smoke inland, the Boar King treaty, first heartglass hints. Threshold: the trek decision.
3. **The Green** (d19–35): Edda, the river, Old Grin's toll, glyphs, east passage.
4. **Halcyon** (d36–50): the station "dungeon," Vane's journals, the E wing, Ryo, the radio list.
5. **The Long Rain** (d51–70): monsoon; route-variant chapter (Countdown / Homestead / Descent); the cyclone; Naia contact.
6. **Ashes & Stairs** (d71–85): the temple, the tremor ladder, the caldera, the Inner Green, the Tidewell.
7. **Convergence** (d86–100): the choice. Endings.

Adaptation note: VN scenes divide into **hub actions** (→ repeatable
world activities), **scheduled events** (→ scripted encounters on the
calendar), **random events** (→ ambient encounter tables per region/season),
and **threshold scenes** (→ main-quest set pieces). `TB.SCHEDULE` in the JS
is literally your act-structure spreadsheet.

---

## 6. Getting the content out (do this early)

The prose is the game's crown jewels — thousands of authored paragraphs.
Don't retype it; **extract it**. First technical task for any Claude session:
write a small Node script that loads the `scenes-*.js` files (they register
into a mock `TB`), walks every scene/choice/event, and dumps
`tidebound-content.json` (scene id → prose, choices, flags read/set, schedule
day). That JSON becomes the Unity project's narrative database (import to
ScriptableObjects or load at runtime). Prose written as second-person
present-tense VN text won't all fit 3D delivery — triage each beat into:
**keep as dialogue**, **keep as journal/letter text**, **convert to ambient
event**, or **retire (the 3D world shows it instead)**.

---

## 7. THE BUILD ORDER — step by step, shaped to what Claude does well

**The honest constraints first.** Claude in a Unity project is excellent at:
C# gameplay systems, state machines, save systems, data pipelines, editor
tooling, shaders-by-code, tests, and writing/importing narrative content.
Claude **cannot click the Unity editor** — it can't drag prefabs, paint
terrain, or eyeball a scene. So the strategy that works is:

> **Make everything code-driven.** Prefer procedural/editor-script scene
> setup over hand-placed objects. Have Claude write `EditorWindow`/menu-item
> tools ("Build Castaway Bay greybox", "Place region POIs from JSON") so the
> scene itself is *generated* and Claude can iterate on it. You (the human)
> do the visual judgment calls and asset-store shopping; Claude does
> everything expressible as code or data.

Art guidance: greybox everything (ProBuilder/primitives) until systems are
fun. Then asset-store/Synty-style stylized packs — do NOT attempt realism;
the VN's painted-storybook tone translates to chunky stylized 3D. Companions
are the one place to spend real asset money: the dog must be lovable.

### Phase 0 — Foundations *(one session)*
- New Unity project (**URP**, latest LTS). Git + Unity `.gitignore` +
  `.gitattributes` (LFS for binaries) from the first commit.
- Write the Unity repo's `CLAUDE.md`: project conventions, folder layout
  (`Assets/_Game/{Scripts,Data,Scenes,Prefabs,Art}`), "code-driven scenes"
  rule, test command, and a pointer to this file and the design docs
  (copy `tidebound/design/` into the Unity repo, or add the GameRepos repo
  to the session).
- Core data model: `GameState` (day, segment, meters, flags dictionary,
  route points, companion + trust), JSON save/load, and the narrative
  database importer (Phase 6's extractor output). Unit tests from day one
  (Unity Test Framework) — Claude is good at these; use them.

### Phase 1 — The day loop on one beach *(the vertical slice, 2–3 sessions)*
- Greybox Castaway Bay only. First-or-third person controller (recommend
  third — you'll want to *see* yourself next to the dog).
- The clock: dawn/midday/dusk/night, lighting cycle, actions cost time.
- Meters + camp: fire (lit/fed/dead), shelter tier 1, forage points, water,
  sleep. The starve/thirst/exposure fail states — each with its warning
  first (rule 1).
- One interaction system (gaze/proximity prompt) reused for everything
  ever after.
- **Definition of done: it is mildly fun to just survive three days on an
  empty grey beach.** If it isn't, fix that before adding anything.

### Phase 2 — Words *(1–2 sessions)*
- Dialogue/narration UI (the VN's soul — typewriter text, choices with
  consequence subtext). Journal (the Ledger) UI.
- Run the content extractor against the VN; import chapter 1's beats.
- The crash prologue + background choice, playable start to camp.

### Phase 3 — The dog *(2–3 sessions; the make-or-break phase)*
- ONE companion: Kavi. Follow AI, idle behaviors per trust tier, the
  courtship sequence (feeding, patience, the naming), his warning sense
  (predator proximity → visible hackles + growl toward threat), pet/tend
  interactions, his campfire idle life.
- Trust tiers changing observable behavior is the whole feature. The VN's
  90 idle vignettes (scenes-chapter2.js `TIER_LINE`) are your behavior spec —
  translate each vignette into an *observable 3D behavior*, not text.
- **Definition of done: someone who watches you play asks about the dog.**

### Phase 4 — The island *(2–4 sessions)*
- Editor tool that generates the whole-island greybox from a region JSON
  (positions from `map.js`). All 12 zones traversable, gates in place
  (Grin blocks the ford — as a visible, terrifying, *waitable* presence;
  Boar King contests the Green Deep).
- The Wayfinder as the in-game map item (the parchment chart art from the
  VN, fog-of-war by discovery). Compass that spins near heartglass.
- Region ambient-event tables (port the VN's random events per region).

### Phase 5 — Act 1–2 story *(2–3 sessions)*
- Chapters 1–2 fully playable as quests: the smoke inland, the clearing,
  camp tiers, the Boar King treaty (track/wall/tithe — all three
  solutions), first glyph stone, the case washing ashore.
- First three endings wired end-to-end so the *ending pipeline* exists:
  one death (Cold Fire), one early escape (The Empty Horizon), the
  despair ending (The Green Swallows). Run-card summary screen on ending.

### Phase 6 — Depth passes *(repeat per act, one act per 1–2 sessions)*
- Act 3 (Edda, the grove, Old Grin's eight solutions, the river) → act 4
  (Station Halcyon as an explorable interior — Claude writes interior
  generation tooling too) → act 5 (monsoon world-state + Ryo + radio) →
  act 6 (grotto tide-clock dungeon, temple, caldera) → act 7 (convergence
  + ending roster expansion).
- After each act: a playtest build. Cut scope forward, not quality
  backward.

### Phase 7 — The other five companions, NG+, polish
- Each companion is a Phase-3-sized effort (cheaper now the systems
  exist). Then Driftwood Loops, the almanac/trophies meta, audio (the
  VN's recorded ambience + the seven-beat Hum port directly), and the
  ending roster toward 49.

### What to ask Claude, per session — the workflow rules
1. **One phase (or less) per conversation.** Point each new session at
   `CLAUDE.md` + this file + the one design doc the phase needs. Don't ask
   any session to "build the game."
2. **Commit and push every session.** Claude sessions end; git doesn't.
3. Ask for **editor tooling before content** whenever placement is involved.
4. Ask for **tests with every system** (meters, clock, save, trust math).
5. When something must look/feel right (camera, dog animation timing,
   lighting), have Claude expose it as tweakable inspector parameters and
   tune it yourself — that division of labor is 10× faster than describing
   feel in words.
6. Keep the VN running in a browser tab as the reference implementation —
   "make it feel like the VN's X" is a legitimate, checkable spec.

---

## 8. Scope: the version-1 island

The full adaptation above is months of sessions. Ship a **v1** first and let
it teach you:

> **V1 = the crash, Castaway Bay + Tide Pools + Jungle Fringe + the Green
> Deep, the full day loop, Kavi only, chapters 1–2, the Boar King, five
> endings.** Everything in it built on systems that scale to the rest.

That's Phases 0–5. It is a complete, shippable, emotionally whole game —
"you, a dog, a beach, and a hundred days" — and every phase after it is
addition, not rework.

---

*Canon questions → `tidebound/design/`. Machine truth → the JS. Tone →
the voice guide, always the voice guide. And the two laws: the island
always warns once, and the dog does not die.*
