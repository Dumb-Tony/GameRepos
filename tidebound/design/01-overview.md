# 01 · Overview

## Elevator pitch

You survive a plane crash onto a vast tropical island that appears on no chart and
swallows every signal you send. In your first hours you may earn the trust of **one**
wild animal — a grieving island dog, a larcenous macaque, an aloof sea eagle, a reckless
bearded pig, an anxious junglefowl, or (if you find her) a curious reef octopus. That
single bond reshapes everything: where you can go, how you survive, what you learn about
the island's vanished civilization and the abandoned research station, and which of 48
endings you earn. You can escape, stay, die, transcend, or discover that the island has
been waiting for someone exactly like you.

## Fantasy & tone

- **Fantasy:** *"I built a life from nothing, and something wild chose to share it with me."*
- **Tone:** grounded survival with a slow-burn mystery underneath. Robinson Crusoe for
  the first act, *Lost* in the middle, and by the end something older and stranger.
  Warmth and dry humor throughout — the island is dangerous, never grimdark.
- **Perspective:** second-person VN prose ("You wake to the sound of the reef breathing")
  with illustrated backgrounds, character/animal sprites, and a survival HUD.

## The player character

The player names their castaway and picks **one background** during the prologue (framed
as "who were you, before?"). Backgrounds grant a perk, a starting item, a weakness, and
unique dialogue/insight throughout — another day-one choice with permanent texture.

| Background | Perk | Starting item | Weakness | Unique insight hooks |
|---|---|---|---|---|
| **Flight Medic** | Injuries heal 30% faster; can craft splints/poultices from Ch1 | Pocket med-kit (3 uses) | Poor fishing/hunting yields (−20%) | Reads Halcyon medical logs; diagnoses Edda's illness |
| **Wildlife Photographer** | Animals' *first* trust action is doubled; almanac entries auto-detail | Waterproof camera (broken lens → repairable) | Starts with lowest practical crafting tier | Recognizes species behavior; camera unlocks 3 secret events |
| **Line Cook** | +25% food value from cooking; never suffers food poisoning from cooked meals | Chef's knife (best starting tool) | Lowest starting Hope (the crash hit hard) | Identifies edible/toxic plants faster; Edda's recipe quests |
| **Marine Engineer** | Crafting/repair costs −20%; can attempt radio & raft work a chapter early | Multitool | Navigation penalty on land (gets lost in jungle more) | Reads Halcyon machinery; understands the Hum's hardware |

## Core stats

Player-facing meters (0–100):

| Stat | Depletes from | Restores from | At zero |
|---|---|---|---|
| **Health** | Injury, disease, starvation ticks | Rest, treatment, time | Death (ending) |
| **Hunger** | Time (faster when working) | Eating | Health drains; starvation ending risk |
| **Thirst** | Time (faster in heat) | Drinking safe water | Health drains fast; collapse events |
| **Energy** | Actions; poor sleep | Sleep, quality shelter, some foods | Forced collapse — you lose the next segment and may wake somewhere bad |
| **Hope** | Deaths witnessed, storms, setbacks, loneliness | Rare beauty events, companion moments, milestones, cooked meals, music | Despair spiral: bleakest dialogue options only, and two despair-only endings become reachable |

Hidden values: per-companion **Trust** (0–100), the three **route points** (Signal /
Roots / Depth), **Island Regard** (how the island itself "feels" about you — fed by
ecological choices), and the **Ledger** of boolean flags.

## The gameplay loop

**Micro-loop (one segment):** wake/status vignette → choose 1 action from the current
location's menu (forage, build, explore, tend companion, story action…) → prose scene
plays out with choices → stats update → transition.

**Daily loop (4 segments — Dawn, Day, Dusk, Night):** plan around weather forecast
(if you have a way to read it) → spend Dawn/Day/Dusk → Night is defensive by default
(sleep, watch, tend fire) unless a story event seizes it. Sleep quality (shelter tier ×
fire × companion presence) sets tomorrow's Energy.

**Chapter loop (roughly 10–20 days):** each chapter opens with a scripted story beat,
runs on player-directed days seeded with scripted + random events, and closes with a
**Threshold** — a major decision scene that locks flags, spends/awards route points, and
selects the next chapter's variant.

**Run loop (~100 days):** Prologue → Ch1–7 → ending + epilogue → unlock report ("the
Ledger opens") → New Game+ offer.

## Choice design rules

1. Every Threshold choice must have a visible upside *and* a cost that surfaces within
   two chapters. (Example: sharing your food cache with Kavi's returning pack costs you
   a week of security but flags `PACK_DEBT`, which later stops the pack from raiding
   your farm — and opens ending C1.)
2. At least one consequence per Threshold must be *delayed and surprising but fair* —
  foreshadowed, never arbitrary.
3. Small choices accumulate: route points come 1–3 at a time from dozens of minor
   decisions, so the player's *pattern of living* — not one dialog pick — decides which
   endings are natural.
4. The game never displays "Trust +5". Feedback is behavioral: the eagle lands closer;
   the dog sleeps touching your back for the first time.
5. Timed choices are reserved for danger scenes only (croc lunge, rockfall, storm surge).
