using System.Collections.Generic;

namespace Tidebound.Narrative
{
    /// <summary>
    /// THE COURIER'S CASE — the locked-thing arc, ported from
    /// scenes-extra.js: the contemplation scene, the three openings (Ipo's
    /// audience — live since Phase 7 session 4, the engineer's drill,
    /// the smashing) and the contents that recolor the whole story: the
    /// gems, the dossier, the chart. V1 adaptations, noted inline: the
    /// scene is reachable from chapter 2 (the VN parks it in the chapter-3
    /// camp hub, which v1 doesn't have yet); if the case wasn't salvaged
    /// from the fuselage the sea returns it on day 8 — the adaptation
    /// bible's "the case washing ashore" (§Phase 5); and leaving it closed
    /// pays its Roots point once (the VN charges a segment per visit, our
    /// contemplation is free — no farming). Edda's confirmation and the
    /// Rosa Dourada dive stay in chapter 3+ where they belong; their flags
    /// (DOSSIER, CHART_ROSA, CHART_TORN) are banked here for them.
    /// </summary>
    public static class CaseArc
    {
        /// <summary>
        /// scenes-extra.js TB.knowsGlass — lore keeps its order: the player
        /// only reads the WORD heartglass once this run has actually met
        /// the stuff. Otherwise the gems stay a mystery until the island —
        /// or Edda — supplies the name.
        /// </summary>
        public static bool KnowsGlass(GameState s) =>
            s.Is("HEARTGLASS") || s.Is("GULLET1") || s.Is("GULLET2") ||
            s.Is("GULLET_MAP") || s.Is("WOUND_SEEN") || s.Is("KNOW_GULLET") ||
            s.Is("GEMS_NAMED");

        // ---- the contents: scenes-extra.js CASE_CONTENTS, verbatim ---------
        static List<string> CaseContents(GameState s) => new List<string>
        {
            "Inside, packed in fifty-year-old felt, three things.",
            KnowsGlass(s)
                ? "First: a lead-lined pouch, surgeon-stitched, and inside it — your breath goes somewhere else — <i>gems</i>. A dozen of them, cut and polished: dark, glassy, catching your lamp and holding it a half-beat too long. Heartglass. You know it the moment the light lags. Someone, somewhere off this island, has been CUTTING it. Faceted like diamonds. Sold, presumably, like them. They are the most beautiful wrong thing you have ever held."
                : "First: a lead-lined pouch, surgeon-stitched, and inside it — your breath goes somewhere else — <i>gems</i>. A dozen of them, cut and polished: dark, glassy, catching your lamp and holding it a half-beat too long — a delay your eye insists on and your reason can't explain. Not diamond, not obsidian, not anything you own a name for. Someone, somewhere, has been cutting these. Sold, presumably, like diamonds. They are the most beautiful question you have ever held.",
            "Second: a dossier in a waxed envelope, typed pages and photostats under the crest from the lock. You read it twice. The sponsors never stopped existing — they renamed. And they never stopped looking: the file is a fifty-year hunt for \"Site 9,\" compiled from satellite anomaly maps, shipping-lane reports, and — page after page — testimony from people who LEFT this island and lived. The ship photo's twin is here, catalogued. The courier wasn't traveling with the case. The courier was <i>delivering himself</i>: an agent, riding the one aircraft their models said the island would take.",
            "Third: an oilskin chart of Vessakai itself — crude, pre-Halcyon, older than everything — annotated in two centuries of different hands. And on the north reef, in the oldest ink of all, a wreck is marked with a word and a cross: <i>ROSA DOURADA. GOLD.</i>",
        };

        // ---- the loot, applied once whichever way the lock lost -------------
        static void Loot(GameState s)
        {
            if (s.Is("CASE_LOOT")) return;
            s.SetFlag("CASE_LOOT");
            s.SetFlag("GEMS");
            s.SetFlag("DOSSIER");
            s.SetFlag("CHART_ROSA");
            s.AddRoute(RouteAxis.Depth, 2);
            s.AddRoute(RouteAxis.Signal, 1);
            if (!KnowsGlass(s)) s.SetFlag("GEMS_MYSTERY");
        }

        public static void AddTo(StoryScript script)
        {
            // ---- day 8, dawn: the sea returns what wasn't saved -------------
            // (v1 adaptation — bible §Phase 5, "the case washing ashore".
            // The salvage's Depth point travels with the case, not the choice.)
            script.Add(new StoryScene
            {
                Id = "ev2_case_ashore",
                OnEnter = s =>
                {
                    if (s.Is("CASE_ASHORE")) return;
                    s.SetFlag("CASE_ASHORE");
                    s.AddItem("case");
                    s.AddRoute(RouteAxis.Depth, 1);
                },
                Text = _ => new List<string>
                {
                    "Day eight's walk of the wrack line stops you mid-stride: half-buried at the tide's highest reach, sea-scoured and shut, lies a shape you last saw chained to a shaking wrist in a falling plane.",
                    "The courier's case. Eight days the sea has carried it — reefs, undertow, the whole drowned arithmetic between the fuselage and here — and it has set it down at your feet without a scratch on the lock.",
                    "<i>\"If it's the same island — you'll want to know it can be left.\"</i>",
                    "You carry it up the beach. It is exactly as heavy as a question.",
                },
            });

            // ---- the contemplation: scenes-extra.js case_scene ---------------
            script.Add(new StoryScene
            {
                Id = "case_scene",
                Text = s => new List<string>
                {
                    "You set the courier's case on the flat stone in good light and look at it properly, maybe for the first time: marine steel, lead-heavy for its size, the worn crest by the lock"
                        + (s.Is("CASE_EDDA")
                            ? " that stopped Edda Voss mid-sentence — the mark of the people who funded Halcyon, on an object that crossed the sky with you fifty years after they \"stopped existing.\""
                            : " — a maker's mark, you'd assumed, though it's drawn like something that means more."),
                    "The courier's voice, from the falling plane: <i>\"If it's the same island — you'll want to know it can be left.\"</i>",
                    "The lock is serious. The question is how serious you are.",
                },
                Choices = new List<StoryChoice>
                {
                    new StoryChoice
                    {
                        Label = "Give Ipo the audience of his life.",
                        Sub = "The finest fingers on the island, and a lock with a reputation.",
                        When = s => s.Companion == "ipo" && s.Trust >= 50,
                        Do = s => { s.SetFlag("CASE_OPEN"); s.Bond(4); },
                        Go = "case_open_ipo",
                    },
                    new StoryChoice
                    {
                        Label = "Defeat it properly: drill the lock body.",
                        Sub = "Two patient hours. Locks are just puzzles that think highly of themselves.",
                        When = s => s.Is("BG_ENGINEER") && s.Has("toolbox"),
                        Do = s => { s.SetFlag("CASE_OPEN"); s.Stat(Meter.Energy, -8); },
                        Go = "case_open_drill",
                    },
                    new StoryChoice
                    {
                        Label = "Smash it open. Enough mystery.",
                        Sub = "Brutal and certain — but whatever's fragile in there answers to physics too.",
                        Do = s =>
                        {
                            s.SetFlag("CASE_OPEN");
                            s.SetFlag("CHART_TORN");
                            s.Stat(Meter.Energy, -10);
                        },
                        Go = "case_open_smash",
                    },
                    new StoryChoice
                    {
                        Label = "Leave it closed. Today isn't the day.",
                        Sub = "The dead woman's drawer taught you patience about locked things.",
                        Do = s =>
                        {
                            if (s.Is("CASE_WAITED")) return; // once — see class note
                            s.SetFlag("CASE_WAITED");
                            s.AddRoute(RouteAxis.Roots, 1);
                        },
                    },
                },
            });

            // ---- the three openings ------------------------------------------
            script.Add(new StoryScene
            {
                Id = "case_open_ipo",
                Speaker = "Ipo",
                OnEnter = Loot,
                Text = s =>
                {
                    var t = new List<string>
                    {
                        "Ipo approaches the case the way a maestro approaches a difficult hall: one slow circuit, tapping; a period of theatrical limbering; and then twenty minutes of the most focused work you have ever seen from any living thing — one ear pressed flat to the steel, fingers reading the lock's small resistances like braille.",
                        "The CLACK of it opening is followed by a bow. You applaud. It is expected, and deserved.",
                    };
                    t.AddRange(CaseContents(s));
                    return t;
                },
            });
            script.Add(new StoryScene
            {
                Id = "case_open_drill",
                OnEnter = Loot,
                Text = s =>
                {
                    var t = new List<string>
                    {
                        "You do it the engineer's way: brace, center-punch, and two patient hours of hand-drill work through the lock body, resting the bit, saving the toolbox's last good edges. The lock surrenders like an argument running out of premises.",
                    };
                    t.AddRange(CaseContents(s));
                    return t;
                },
            });
            script.Add(new StoryScene
            {
                Id = "case_open_smash",
                OnEnter = Loot,
                Text = s =>
                {
                    var t = new List<string>
                    {
                        "You wedge it against the boundary stone and put the heavy end of your resolve through the hinge line, again, again — the case dying hard, the way things built by serious people do — until it yawns open, bent and beaten.",
                    };
                    t.AddRange(CaseContents(s));
                    t.Add("The smashing had a price: the old oilskin chart took the worst of the final blow — torn through, a corner gone entirely, half its annotations lost to the tear. The wreck-mark survives. Much of what two centuries of hands wrote AROUND it did not.");
                    return t;
                },
            });
        }
    }
}
