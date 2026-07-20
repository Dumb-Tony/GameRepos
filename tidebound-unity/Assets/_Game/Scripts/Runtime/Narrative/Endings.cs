using System.Collections.Generic;

namespace Tidebound.Narrative
{
    /// <summary>
    /// The ending pipeline's canon: death titles (runcard.js DEATH_TITLES),
    /// epilogue prose, core endings (scenes-chapter7.js CORES — v1 ships
    /// THE EMPTY HORIZON), and the run summary. Pure; the RunCardUI renders
    /// it, tests pin it.
    /// </summary>
    public static class Endings
    {
        // ---- death titles: runcard.js verbatim -----------------------------
        static readonly Dictionary<string, string> DeathTitles = new Dictionary<string, string>
        {
            ["thirst"] = "THE DRIFTWOOD TONGUE",
            ["hunger"] = "HUNGER'S QUIET",
            ["undertow"] = "UNDERTOW",
            ["fever"] = "MARSH FEVER",
            ["despair"] = "THE GREEN SWALLOWS",
            ["dark"] = "THE LONG DARK",
            ["grin"] = "OLD GRIN",
            ["injury"] = "THE SMALL LOAN",
            ["boarking"] = "THE BOAR KING",
            ["fall"] = "THE FALL",
            ["coldfire"] = "COLD FIRE",
            ["ash"] = "MOTHER ASH",
        };

        static readonly Dictionary<string, string[]> DeathBodies = new Dictionary<string, string[]>
        {
            ["thirst"] = new[] { "You knew. The sticking tongue, the stopped sweat — the island said it plainly, and water was always the first law." },
            ["hunger"] = new[] { "It ends the way it warned you it would: not with pain but with a great soft quiet, and the sea still counting to itself." },
            ["injury"] = new[] { "Every cut out here is a small loan from a lender you don't know. Yours came due." },
            // Cold Fire's full framing — scenes-chapter1.js death scene, verbatim
            // (the strangers variant; Ryo arrives with chapter 4)
            ["coldfire"] = new[]
            {
                "No single moment killed you. That is the whole of this card, and the island would want it stated plainly: not the cyclone, not the cold, not the dark. What killed you was a season of small skipped choices arriving all at once to be paid — the shelter tier you meant to get to, the firewood store that stayed a plan, the overhang you didn't move to on Day 4 because the beach had a view.",
                "The storm only did the audit.",
                "They find the camp in the spring — strangers, whoever the sea sends — and the strange thing, the thing that stops them, is how CLOSE it all was: the half-built windbreak, the stacked stones, the good intentions legible in every unfinished thing. The island files it under its second-oldest heading: <i>tomorrow.</i>",
            },
            ["fever"] = new[] { "The fever finishes its argument. You had heard every word of it coming." },
            ["boarking"] = new[]
            {
                "You knew nothing about him yet, and he had plainly survived everything this island ever sent — the hunters, the traps, the years. His epilogue is his own ledger, kept in scar: four now, who thought the rent was negotiable.",
            },
            // the despair ending's full epilogue — scenes-chapter1.js death scene, verbatim
            ["despair"] = new[]
            {
                "You stop keeping the days, and the days, courteously, stop keeping you.",
                "It isn't dramatic. That was the appeal. You walk inland one bright morning without a plan to walk out, and the Green Deep receives you the way it received the terraces and the stones and every other made thing: patiently, greenly, without malice. For a while there are still habits — water found, fruit taken, a fire some nights. Then fewer. The count blurs, as requested. The paths you cut heal over behind you.",
                "The island does not judge it. The island has folded over grander surrenders than yours, and will again, and holds what it takes gently and forever.",
            },
        };

        // ---- core endings: scenes-chapter7.js CORES (v1 subset) --------------
        static readonly Dictionary<string, (string Title, string[] Body)> Cores =
            new Dictionary<string, (string, string[])>
            {
                ["EMPTY_HORIZON"] = ("THE EMPTY HORIZON", new[]
                {
                    "The raft is willing and the sea is not asked. You go because staying had begun to feel like drowning slowly, and the horizon promised — the way horizons do, to people at the end of themselves — that anywhere else was air.",
                    "Nine days. You will never tell anyone the true arithmetic of them: the water gone on the fourth, the sail gone on the fifth, the bargains you made aloud with no one in the white middle of the sixth. The freighter that finds you finds eleven stone of sunburn and salt with your name somewhere inside it, and the crew are kind, and the kindness is almost the worst part, because you know — you knew by the second dawn — that you had left a green and singing world with your fences half-mended and your fire still lit, for this.",
                    "You live. The word does its plain work and no more. Somewhere behind you an island the charts never held goes on without you, unfound, unfinished — and the one mercy the sea granted is that it let you carry out the knowing: it was never the island you were escaping.",
                }),
            };

        // Cold Fire without its cyclone (the plain cold-night exposure death,
        // a 3D-side cause) keeps the lean card — the audit framing belongs
        // to the storm that ran it
        static readonly string[] ColdFireExposure =
        {
            "No roof, no fire, and a night that kept every promise the dusk wind made.",
        };

        public static (string Title, string[] Body) Resolve(GameState s)
        {
            if (s.EndingId != null && Cores.TryGetValue(s.EndingId, out var core))
                return core;
            if (s.DeathCause != null)
            {
                string title = DeathTitles.TryGetValue(s.DeathCause, out var t) ? t : "THE ISLAND KEEPS";
                string[] body = DeathBodies.TryGetValue(s.DeathCause, out var b)
                    ? b
                    : new[] { "The island keeps what it catches." };
                if (s.DeathCause == "coldfire" && !s.Is("CYCLONE_APPLIED"))
                    body = ColdFireExposure;
                return (title, body);
            }
            return ("TIDEBOUND", new[] { "The story is still being written." });
        }

        /// <summary>Whether this run has reached any terminal state.</summary>
        public static bool RunIsOver(GameState s) => s.DeathCause != null || s.EndingId != null;

        // ---- the run summary: the island will remember it like this ----------
        static readonly Dictionary<string, string> BackgroundNames = new Dictionary<string, string>
        {
            ["medic"] = "a flight medic",
            ["photog"] = "a wildlife photographer",
            ["cook"] = "a line cook",
            ["engineer"] = "a marine engineer",
        };

        static readonly (string Flag, string Line)[] SummaryDeeds =
        {
            ("SOS", "Your SOS waits on the beach for eyes that fly."),
            ("FLARE_SPENT", "You spent your only flare on a far light that never turned. The island saw."),
            ("FLARE_HELD", "A ship's light crossed the horizon, and you held your only flare. The island saw that too."),
            ("HELPED_COURIER", "A stranger's photograph is still in your pocket. \"If it's the same island…\""),
            ("GLYPH_1", "You found the strokes that run seven to a row."),
            ("SQUALL_DRY", "A squall tested your roof, and your roof won."),
        };

        public static List<string> Summary(GameState s)
        {
            var lines = new List<string>();
            BackgroundNames.TryGetValue(s.Background ?? "", out var bg);
            lines.Add($"Day {s.Day}. You came here as {bg ?? "a stranger"}.");

            if (s.Companion == "kavi")
                lines.Add(s.Is("KAVI_NAMED")
                    ? "At your side, to the end of the story: Kavi, the storm-grey island dog."
                    : "At your side: the grey dog, who never told you his name.");
            else if (s.Is("SOLO_ROUTE"))
                lines.Add("You walked the solo route: you, the island, and whatever watched.");

            int walked = 0;
            foreach (var region in Regions.All)
                if (s.Is(Regions.SeenFlag(region.Id))) walked++;
            lines.Add($"You walked {walked} of the island's {Regions.All.Length} charted reaches.");

            foreach (var (flag, line) in SummaryDeeds)
                if (s.Is(flag)) lines.Add(line);

            // the case remembers its state (runcard.js roads / scenes-chapter7.js)
            if (s.Is("CASE_OPEN"))
                lines.Add("You opened the courier's case: a dozen impossible gems, a fifty-year hunt in typed pages, and a chart older than both.");
            else if (s.Has("case"))
                lines.Add("A locked courier's case kept its answer to the end.");

            lines.Add("Nothing is decided. Everything is remembered.");
            return lines;
        }

        // ---- the raft: the early door out (convergence chooser, adapted) ------
        public static StoryScript BuildRaftScript()
        {
            var script = new StoryScript();
            script.Add(new StoryScene
            {
                Id = "raft_launch",
                Text = s => new List<string>
                {
                    "The raft is done — driftwood lashed with everything you could spare, a mast that is mostly hope, the tarp for a sail if you brought one. It rides the shallows, tugging at its line like it has somewhere to be.",
                    "The horizon is empty. It has been empty every day you've checked and most of the days you didn't. Out there: shipping lanes, eventually, maybe. Here: a fire that's lit, fences half-mended, a green and singing world that has started, in ways you don't like to examine, to feel like a place you live.",
                    "The sea does not grade on intention. You know that.",
                },
                Choices = new List<StoryChoice>
                {
                    new StoryChoice
                    {
                        Label = "Push off. Go NOW — ready or not.",
                        Sub = "The Empty Horizon. The sea does not grade on intention. You're going anyway.",
                        Do = s => s.EndingId = "EMPTY_HORIZON",
                    },
                    new StoryChoice
                    {
                        Label = "Step back from the line. Not today.",
                        Sub = "The raft will wait. The island, apparently, was already waiting.",
                        Do = s => { s.SetFlag("RAFT_REFUSED"); s.Stat(Meter.Hope, 2); },
                    },
                },
            });
            return script;
        }
    }
}
