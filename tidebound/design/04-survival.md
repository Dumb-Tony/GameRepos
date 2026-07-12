# 04 · Survival Systems

> **Design law #4:** survival is drama, not spreadsheet. Every meter exists to make
> choices harder and scenes tenser. Numbers below are tuning targets, not gospel.

## Time model

Days divide into four **segments** — Dawn / Day / Dusk / Night. Most actions cost one
segment. Night defaults to sleep unless the player (or the island) decides otherwise.
Meters tick per segment, modified by weather, activity, and season. A full run is ~100
days; chapters gate on both days and story flags so slow players aren't punished, only
weathered.

## The five meters

Detailed in [01-overview.md](01-overview.md). System interactions that matter:

- **Hunger & Thirst** drain faster in heat, during heavy labor, and with fever.
  Below 25, both start draining **Health** and impose choice-narrowing: some dialogue
  and action options gray out with the note *"you're too hungry to think straight"* —
  scarcity literally shrinks your options, the core survival-drama trick.
- **Energy** shapes yields: foraging/hunting/crafting outcomes roll against Energy
  bands. Working exhausted isn't forbidden — it's just worse, and riskier (injury
  chance up). Collapse (Energy 0) skips a segment and triggers a "where/when you wake"
  event table that ranges from embarrassing to genuinely dangerous.
- **Hope** is the VN meter. High Hope unlocks generous/brave dialogue options and the
  beauty-event bonuses; low Hope unlocks bleak options *and two despair-only endings*
  (D3, E5 variant) — despair is a valid, authored path, not a fail-state.
- **Health** is the only meter whose zero is final.

## Water 💧

| Source | Risk | Notes |
|---|---|---|
| Coconuts | None | Renewable but finite per grove per week |
| Rain catch (tarp/crafted) | None | Weather-dependent; monsoon = surplus, dry season = trickle |
| Silverthread river | Low | Boil to be safe; upstream cleaner than mouth |
| Jungle pools / swamp | High | Parasites & marsh fever vectors; boiling helps, filtering better |
| The Spring (Moa or exploration find) | None | The island's one perfect source; a strategic location |
| Halcyon cistern | None once repaired | Marine Engineer repairs early; big Roots infrastructure |

Boiling requires fire + container (clay pot recipe is an early crafting milestone).
Drinking risky water is always *allowed* — thirst at 10 will make you consider it —
and consequences roll invisibly (disease incubates for days: cause and effect separated
enough to hurt, close enough to learn).

## Food 🍖 — hunting, fishing, foraging, farming

- **Foraging:** region-specific tables (see [07-crafting.md](07-crafting.md)). Fruit
  spoils in days; the almanac records what's safe. Toxic lookalikes exist (Line Cook
  background and Edda's teaching mitigate).
- **Fishing:** tiers — hand/tidepool → spear → rod → trap → net. Reef fishing yields
  best but risks weather and Old Grin's cousin, the reef shark event. Vela and Nine
  each transform fishing differently.
- **Hunting:** requires tools + skill events; prey table by region. Hunting is loud —
  overhunting a region visibly empties it for weeks (Island Regard down; the island
  notices). Kavi transforms this system.
- **Farming:** from Ch3, cleared plots + Kaari terrace restoration. Crops: taro, yam,
  banana, sugarcane, Halcyon's heirloom rice (seed cache find). Farming is the Roots
  route's engine: slow, compounding, storm-vulnerable. Buri plows; Moa pest-controls.
- **Cooking:** fire tier × recipe → food value, safety, Hope bonuses. Communal meals
  (Edda/Ryo/companion) are scripted Hope events — the game's hearth-scenes.

## Fire 🔥

Fire is a *possession* to maintain, not a button. Tiers: **ember pouch → campfire →
hearth → signal pyre → kiln/forge**. Rain and storms attack it; the ember pouch (early
recipe) lets you carry fire like the treasure it is. Fire gates cooking, boiling,
pottery, tool-hardening, night safety, and the Signal route's pyre network. Kavi's
fear complicates all of it. Losing fire completely in monsoon season is a genuine
mid-game crisis with its own scripted event (*The Cold Week*).

## Shelter & base-building 🏠

Base site chosen in Ch2 (beach / jungle fringe / cliff overhang) — each with tradeoffs
in tide risk, disease exposure, water distance, and defense. Shelter upgrades:
**lean-to → hut → fortified hut → homestead → settlement structures** (granary, coop,
pen, smoker, watchtower, Edda's winter room, Ryo's boathouse). Shelter tier × fire ×
companion presence = sleep quality = next-day Energy. Storms damage structures by tier —
monsoon season is a maintenance war the Homestead variant leans into.

## Weather ⛅ & seasons

Two seasons across the 100 days: **Dry** (Ch1–4, punctuated by squalls) and **Monsoon**
(Ch5–6, the Long Rain) easing into the volatile post-storm calm of Ch7. Daily weather
rolls from season tables: clear / overcast / squall / storm / **cyclone** (scripted
Ch5 apex + rare random). Weather modifies every system (travel risk, fire, fishing,
mood, companion behavior — Vela grounds, Moa panics, Nine thrives). Forecast access —
Moa, Vela, or Halcyon's barometer — is a genuine strategic asset. Microclimates per
region (the caldera makes its own weather; the swamp never quite dries).

## Injury 🩹

Injuries come typed, not as generic HP loss:

| Injury | Typical cause | Untreated risk | Treatment |
|---|---|---|---|
| Laceration | Tools, terrain, fauna | Infection → fever | Clean water wash, poultice, stitches (medkit/Flight Medic) |
| Sprain/Fracture | Falls, cliffs, Buri enthusiasm | Mobility loss (travel costs double) | Splint, rest days |
| Bite/Gore | Boar King, Old Grin, snake | Infection ×2, venom track | Antivenom herbs (Edda knows), poultice |
| Burn | Fire handling, volcano | Infection, Kavi trust complication | Aloe-analog salve |
| Concussion | Storm debris, falls | Segment-loss blackouts | Rest, monitoring (companion/ally scenes) |

Injuries are also *story states*: NPCs and companions react, some actions lock, and a
few scenes exist only while hurt (being nursed by Edda; Ipo bringing you increasingly
absurd "medicine").

## Disease 🤒

Incubation-delayed, cause-obscured (until the almanac/Edda teach you):

- **Marsh fever** (malaria-analog; swamp/dusk mosquito exposure) — the big one; Edda's
  cinchona-analog grove is the cure and a quest.
- **Gut sickness** (bad water/food) — common, survivable, miserable; tanks Energy/Thirst.
- **Wound fever** (untreated injury) — the killer of careless players.
- **Heatstroke** (Dry-season labor without water/shade) — collapse events.
- **The Grey Cough** (Halcyon's dust; rare) — mystery-flavored, ties to the Incident lore.

Disease endings (D2) are authored, not cheap: multi-day declines with choices,
delirium scenes (some hide lore — fever dreams are canon glimpses of the island's
memory), and rescue possibilities if trust/relationships were built.

## System interlock example (why choices ripple)

Sharing your smoked fish with Kavi's starving pack (Ch5) → your protein cache halves →
you fish the reef in marginal weather to compensate → storm roll → raft damage or
injury risk → but `PACK_DEBT` set → Ch6 night raids never target your camp → and the
Ch7 pyre-lighting scene has six wolves' worth of silhouettes on the ridge behind you.
One generous choice: one week of hunger, one permanent ally, one changed ending image.
Every major system is plumbed to the Ledger like this.
