# Tidebound — Game Design Document

> Working title: **TIDEBOUND** · Genre: **branching survival visual novel** · Platform: **browser (no install)**
> One player. One island. One companion. One hundred days. Forty-nine ways it can end.

This GDD is split into twelve documents so it can double as the production bible when
scripting and coding begin. Read them in order the first time; afterwards each stands alone.

> **The game is now built.** Start with
> [`00-state-of-the-game.md`](00-state-of-the-game.md) — the resumption document:
> what's implemented vs. designed, code conventions, balance targets, the voice
> guide, and the roadmap. The docs below remain canonical for vision and lore.

## Design pillars (the five laws)

Every mechanic, scene, and line of dialogue must serve at least one of these, and no
feature may violate one to serve another.

1. **Every important choice trades something away.** There are no "correct" options —
   only prices. Salvaging the flare gun means leaving the medkit in a sinking fuselage.
   Taming the eagle means never having a hunter at your side. The game never scores
   choices as good/bad; it *remembers* them.
2. **The companion is the biggest branch in the game.** Chosen in the first hour, felt in
   the last minute. Companions are not tools with legs — they are characters with fears,
   grudges, senses of humor, and loyalty arcs. Two playthroughs with different companions
   should feel like different games *and* different friendships.
3. **The island is a character.** It has a history, a metabolism, moods, and an agenda.
   Weather, wildlife, ruins, and the Hum are all expressions of one coherent place.
4. **Survival is drama, not spreadsheet.** Meters exist to generate story pressure
   (a rumbling stomach makes a risky choice tempting), not to be micro-optimized.
   Time is spent in day-segments, not real-time ticks.
5. **The second playthrough is a first playthrough.** Route exclusivity, companion
   exclusivity, randomized encounters, and New Game+ recognition mean the game is
   designed to be finished four to eight times, not once.

## Glossary

| Term | Meaning |
|------|---------|
| **Segment** | One quarter of a day (Dawn / Day / Dusk / Night). The unit of time and action. |
| **The Ledger** | The hidden record of every meaningful choice. Flags never expire. |
| **Route points** | Three accumulating currencies — **Signal** (drive to escape), **Roots** (drive to belong), **Depth** (drive to understand) — that steer chapter variants and endings. |
| **Trust** | Per-companion 0–100 bond value with five tiers. |
| **Hope** | The player's morale stat. Gates dialogue options and several endings. |
| **The Hum** | The island's electromagnetic anomaly — the reason ships and planes end up here, and the spine of the mystery. |
| **Heart scene** | A hand-authored companion story scene unlocked at a trust threshold. |
| **The Kaari** | The vanished (…or not) civilization that once ruled the island. |
| **Halcyon** | The abandoned 1970s research station, and the project that built it. |
| **Driftwood Loop** | A New Game+ cycle. The island remembers; eventually, so do you. |

## Scope snapshot

- ~100 in-game days, 7 chapters + prologue + epilogue system
- 6 tameable companions (one secret) + a full solo route
- 17 island regions, ~14 gated by choices or companion abilities
- 3 major routes × companion overlays → chapter-level divergence (Chapter 5 exists in three wholly different versions)
- 49 endings (8 escape, 7 settlement, 7 mystery, 10 death, 8 companion, 5 secret, 3 joke, 1 perfect)
- ~70 crafting recipes, 40+ resources, 58-species almanac, 75 collectibles
