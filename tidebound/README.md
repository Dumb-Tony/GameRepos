# 🌊 Tidebound

*A branching survival visual novel about a castaway, an island that doesn't appear on any chart, and the one animal who chooses to stay.*

**Status: 🎮 Playable — Prologue + Chapters 1–2** (companion choice, base-site
threshold, trust system, the Boar King, the first storm, the smoke on the mountain).
Open `index.html` in a browser — no build step, no dependencies. Generated art lives
in [`art/`](art/) (see `art/manifest.txt`; fetched/optimized by the
`fetch-tidebound-art` GitHub workflow).

The complete Game Design Document lives in [`design/`](design/):

| # | Document | Contents |
|---|----------|----------|
| 00 | [Index & how to read this GDD](design/README.md) | Navigation, glossary, design pillars at a glance |
| 01 | [Overview](design/01-overview.md) | Concept, pillars, player backgrounds, gameplay loop, core stats |
| 02 | [Story & Branching](design/02-story.md) | Story summary, chapter structure, route system, branch diagram |
| 03 | [Companions](design/03-companions.md) | The six companions: personality, fears, trust, abilities, arcs |
| 04 | [Survival Systems](design/04-survival.md) | Hunger, thirst, energy, weather, injury, disease, fire, shelter |
| 05 | [The Island](design/05-island.md) | Exploration map, all regions, access gating |
| 06 | [Characters](design/06-characters.md) | Humans, ancestors, antagonist beasts |
| 07 | [Crafting & Resources](design/07-crafting.md) | Full resource catalog and recipe tree |
| 08 | [Events](design/08-events.md) | Scripted, random, rare, weather, and companion events |
| 09 | [Endings](design/09-endings.md) | All 49 endings with requirements and tone |
| 10 | [Replayability](design/10-replayability.md) | Hidden routes, secrets, New Game+ ("Driftwood Loops") |
| 11 | [Worldbuilding & Lore](design/11-worldbuilding.md) | Island history, the Hum, ecosystems, collectibles |
| 12 | [Future Expansions](design/12-future.md) | Post-launch ideas |

Planned tech (later phase): plain HTML/CSS/JS, no build step, no dependencies — same
conventions as the other games in this repo.
