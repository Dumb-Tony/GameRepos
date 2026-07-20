using System;
using System.Collections.Generic;

namespace Tidebound.Narrative
{
    /// <summary>One zone of Vessakai: its canon prose and its 3D footprint.</summary>
    public class RegionDef
    {
        public string Id;
        public string Name;
        public string Sub;
        /// <summary>First-visit set-piece paragraphs (map.js `first`).</summary>
        public string[] First;
        /// <summary>First-visit effects (map.js `fx1`).</summary>
        public Action<GameState> FirstEffects;
        /// <summary>Return-visit finds (map.js `deck`, almanac hooks trimmed).</summary>
        public (string Text, Action<GameState> Fx)[] Deck;
        /// <summary>Position on the parchment chart (map.js x/y).</summary>
        public float ChartX, ChartY;
    }

    /// <summary>
    /// The v1 island: Castaway Bay, the Tide Pools (east, per the chart),
    /// the Jungle Fringe, the Green Deep. Names and prose are map.js
    /// machine truth; the world-coordinate footprint is the 3D adaptation.
    /// Law #3: a region is named nowhere until its seen-flag is set.
    /// </summary>
    public static class Regions
    {
        public static string SeenFlag(string id) => "REGION_SEEN_" + id;

        /// <summary>Which region a world position lies in.</summary>
        public static string IdAt(float x, float z)
        {
            if (z > 230f && x > 40f) return "grove"; // the mountain's knee
            if (z > 150f) return "deepgreen";
            if (z > 78f) return "fringe";
            if (x > 115f && z < 70f) return "tidepools";
            return "bay";
        }

        public static RegionDef Get(string id)
        {
            foreach (var r in All)
                if (r.Id == id) return r;
            throw new KeyNotFoundException($"Unknown region '{id}'.");
        }

        public static readonly RegionDef[] All =
        {
            new RegionDef
            {
                Id = "bay",
                Name = "Castaway Bay",
                Sub = "Your beach — but have you ever walked ALL of it?",
                ChartX = 220f, ChartY = 266f,
                First = new[]
                {
                    "You give your own bay the expedition it never got: end to end, headland to headland, at a surveyor's pace instead of a survivor's. It takes the whole stretch of the day's light, and it repays it: the freshwater seep you'd half-forgotten, the honey-hole in the reef where the mullet stack at slack tide, the wind-shadow behind the second dune where a fire would never gutter.",
                    "Strange, to be introduced to your own address. The bay has been keeping things for you all along — it was only waiting for you to stop sprinting past them.",
                },
                FirstEffects = s => { s.AddRoute(RouteAxis.Roots, 2); s.Stat(Meter.Hope, 4); },
                Deck = new (string, Action<GameState>)[]
                {
                    ("The wrack line is a market today: good cordage off some far wreck, a float, a hatch-board worth planking. You beachcomb the morning into real wealth.",
                        s => { s.Stat(Meter.Hope, 3); s.AddRoute(RouteAxis.Roots, 1); }),
                    ("You work the reef's honey-hole at slack tide and come home heavy: fish for today, fish for the rack, and one insolent oyster for dessert.",
                        s => { s.Stat(Meter.Hunger, 14); s.Food += 1; }),
                },
            },
            new RegionDef
            {
                Id = "tidepools",
                Name = "The Tide Pools",
                Sub = "Cities at low tide. Citizens with opinions.",
                ChartX = 314f, ChartY = 258f,
                First = new[]
                {
                    "You take the pools as a naturalist instead of a scavenger, working the terraces from the barnacle line to the drop-off, and the pools return the compliment by showing off: anemones like buried fireworks, a decorator crab in this season's kelp, the moray pretending fury from its crevice, and in the last pool before deep water, sorted shells and stacked stones — the gallery, curated by eight patient arms you don't see today, that see you.",
                    "You leave a whelk shell at the gallery's edge, dealer's courtesy. Tomorrow it will be part of the exhibition, or the price of admission. With curators, who can say.",
                },
                FirstEffects = s => { s.TidePoolVisits += 1; s.AddRoute(RouteAxis.Depth, 2); },
                Deck = new (string, Action<GameState>)[]
                {
                    ("Low tide bares the far terraces and you go out to the raw edge, where the pools stop being cities and start being embassies of the deep: things with too many arms and lamplight skins, conducting their business in an inch of sky-water.",
                        s => { s.TidePoolVisits += 1; s.AddRoute(RouteAxis.Depth, 2); }),
                    ("You harvest with a curator's restraint — limpets here, an urchin there, never twice from one pool — and the reef, which keeps accounts, lets you see the octopus garden's new acquisition on your way in: your own lost sinker, displayed prominently.",
                        s => { s.Stat(Meter.Hunger, 12); s.TidePoolVisits += 1; }),
                },
            },
            new RegionDef
            {
                Id = "fringe",
                Name = "The Jungle Fringe",
                Sub = "Where beach and green negotiate. Everything begins here.",
                ChartX = 220f, ChartY = 214f,
                First = new[]
                {
                    "You walk the whole treeline for once — not foraging, MAPPING: where the game trails enter, where the fig trees stand, where the land drinks and where it drains. The fringe resolves from a green wall into a green DOOR, hinged in a dozen places you now have names for.",
                    "By dusk you can close your eyes and walk it in your head. That's the whole difference between lost and living somewhere: the map moves inside.",
                },
                FirstEffects = s => { s.AddRoute(RouteAxis.Roots, 2); s.Stat(Meter.Hope, 3); },
                Deck = new (string, Action<GameState>)[]
                {
                    ("You run your trapline of knowledge along the fringe: which fig is dropping, which trail is fresh, what the ants are voting. The bag comes home respectable and the map inside gets another hinge.",
                        s => { s.Stat(Meter.Hunger, 12); s.AddRoute(RouteAxis.Roots, 1); }),
                    ("A hornbill works the crowns above you the whole way out and back, your loud unlovely escort, tithing figs.",
                        s => s.Stat(Meter.Hunger, 8)),
                },
            },
            new RegionDef
            {
                Id = "deepgreen",
                Name = "The Green Deep",
                Sub = "The interior. It does not negotiate.",
                ChartX = 224f, ChartY = 164f,
                First = new[]
                {
                    "Past the fringe the jungle stops negotiating. The canopy closes like a lid; the light goes green and submarine; the paths are game-made and answer to game logic. You push in a careful spiral, marking your line, and the Green Deep permits it the way the sea permits swimmers — provisionally, on its terms, with its own ideas about depth.",
                    "You come out with your line intact, your legs shaking pleasantly, and a new respect for every creature that calls the interior a neighborhood. Something paced you for the middle third. It never showed itself. That, you understand, was the whole message: <i>seen. tolerated. counted.</i>",
                },
                FirstEffects = s => { s.AddRoute(RouteAxis.Depth, 2); s.AddRoute(RouteAxis.Roots, 1); s.Stat(Meter.Energy, -4); },
                Deck = new (string, Action<GameState>)[]
                {
                    ("You push a new spoke into the spiral and the interior pays in kind: a stand of wild ginger, a water-vine gallery, and one clearing where every tree is hung with orchids like a room decorated for someone.",
                        s => { s.Stat(Meter.Hunger, 8); s.Stat(Meter.Hope, 3); }),
                    ("Boar-sign, old and new, and a wallow like a crater: you are traversing the King's home counties, and you do it with your tread soft and your tithe-arithmetic ready.",
                        s => s.AddRoute(RouteAxis.Depth, 1)),
                },
            },
            new RegionDef
            {
                Id = "grove",
                Name = "Edda's Grove",
                Sub = "Tea, insults, and the best-tended ground on the island.",
                ChartX = 288f, ChartY = 110f,
                First = new[]
                {
                    "You climb to the grove without an errand for once, and Edda — after establishing at length that you have no errand, and auditing the concept — puts you to WORK, which you slowly understand is the honor: the beds weeded side by side, the seedlings pricked out, the compost turned, two people keeping ground together in the oldest arrangement there is.",
                    "Tea happens when the work says so, not the clock. You leave with greens, a cutting she pretends is nothing, and the strange warm cargo of having been, for one afternoon, somebody's help rather than somebody's problem.",
                },
                FirstEffects = s =>
                {
                    s.Edda = Math.Min(100, s.Edda + 6);
                    s.Stat(Meter.Hope, 4);
                    s.Stat(Meter.Hunger, 8);
                },
                Deck = new (string, Action<GameState>)[]
                {
                    ("A grove day: labor, tea, and Edda's running commentary on your technique, your posture, your generation, and — once, sidelong, almost inaudible — your progress, which is apparently 'not entirely hopeless.' You float home.",
                        s => { s.Edda = Math.Min(100, s.Edda + 5); s.Stat(Meter.Hope, 4); }),
                    ("She teaches with her hands today more than her mouth: graft, tie, seal, the old orchard-craft. You catch her watching you repeat it, and her face doing arithmetic about the future she won't name.",
                        s => { s.Edda = Math.Min(100, s.Edda + 5); s.AddRoute(RouteAxis.Roots, 2); }),
                    ("You trade the day's catch for the garden's surplus and the island's best gossip (the junglefowl are feuding; the bees have expanded; the mountain, she says, glancing up without stopping her hands, is 'talkative lately').",
                        s => { s.Stat(Meter.Hunger, 12); s.Edda = Math.Min(100, s.Edda + 3); }),
                },
            },
        };
    }
}
