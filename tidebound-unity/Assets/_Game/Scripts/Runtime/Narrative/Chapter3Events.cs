using System.Collections.Generic;

namespace Tidebound.Narrative
{
    /// <summary>
    /// Chapter Three — The Green Deep: the chapter turn and the three doors
    /// into Edda's mountain, branching on the Smoke decision made at the
    /// chapter-two threshold. Ported from scenes-chapter3.js (ch3_open
    /// cluster); effects pinned by Chapter3Tests. V1 adaptations, per the
    /// chapter-two precedent: the VN's hard clock reset (day 19 dawn) is
    /// dropped — the calendar already stands there after ch2_threshold —
    /// and the VN's mid-dialogue TB.tickSegment() calls are folded into
    /// the scenes' stat effects rather than advancing the clock inside a
    /// dialogue. The VN's "start a new run" option on the ch2 card is not
    /// carried (run resets belong to the RunCardUI flow). The grove trek
    /// destination itself (terrain, Wayfinder pin, hub actions, and the
    /// ev3_* calendar) is next session's work — this session banks
    /// GROVE_OPENED and the meeting.
    /// </summary>
    public static class Chapter3Events
    {
        /// <summary>Edda's first-impression chemistry with your companion (scenes-chapter3.js eddaChem). Solo: she respects self-reliance.</summary>
        public static int EddaChem(GameState s)
        {
            switch (s.Companion)
            {
                case "kavi": return 5;
                case "moa": return 6;
                case "nine": return 8;
                case "vela": return 3;
                case "buri": return 0;
                case "ipo": return -8;
                default: return 4;
            }
        }

        static int Clamp100(int v) => v < 0 ? 0 : v > 100 ? 100 : v;

        public static void AddTo(StoryScript script)
        {
            AddOpen(script);
            AddEddaNow(script);
            AddEddaLater(script);
            AddOpenSignal(script);
            AddAfterScenes(script);
            AddRiver(script);
            AddEddaVisit(script);
            AddFever(script);
            AddGrin(script);
        }

        // ---- day 20, dusk: the Silverthread ---------------------------------
        static void AddRiver(StoryScript script)
        {
            script.Add(new StoryScene
            {
                Id = "ev3_river",
                OnEnter = s =>
                {
                    if (s.Is("RIVER_KNOWN")) return;
                    s.SetFlag("RIVER_KNOWN");
                    s.Stat(Meter.Thirst, 40);
                    s.Stat(Meter.Hope, 8);
                    s.AddRoute(RouteAxis.Roots, 1);
                },
                Text = _ => new List<string>
                {
                    "You hear it before you see it — a sound your body identifies faster than your mind, older than either: <i>running water</i>. Real, cold, moving water.",
                    "The Silverthread comes down out of the mountain's shadow through a green ravine, wide as a road, clear as glass over amber stones. Fish hang in the current like held breath. The banks are cut clay, grey and thick. Upstream, the water sounds bigger — falls, somewhere up in the folded country.",
                    "You drink like a horse, laugh at nothing, and drink again. The daily arithmetic of coconuts and rain-catch — the tax your every plan has paid since Day 1 — just fell over dead.",
                    "The island has an artery, and now you hold it.",
                },
            });
        }

        // ---- day 21, dawn: Edda comes down (the signal road) -----------------
        static void AddEddaVisit(StoryScript script)
        {
            script.Add(new StoryScene
            {
                Id = "ev3_eddavisit",
                Speaker = "Edda Voss",
                OnEnter = s =>
                {
                    if (s.Is("EDDA_MET")) return;
                    s.SetFlag("EDDA_MET");
                    s.SetFlag("GROVE_OPENED");
                    s.SetFlag("LORE_FEVERBARK");
                    s.SetFlag("SALVE");
                    s.Edda = Clamp100(10 + EddaChem(s));
                },
                Text = s => new List<string>
                {
                    "On the twenty-first morning there is a woman in your camp.",
                    "Not arriving — <i>in</i> it: standing at your fire ring with a shotgun broken open over one arm and the proprietary air of a health inspector, an old woman, weathered as driftwood, with a long grey braid and eyes that have finished three audits since you sat up.",
                    "\"Twenty-one days,\" she says, without preamble. \"Twenty-one days of watching you signal an empty sea and ignore a lit fire on a mountain. I came down to see if you were proud, stupid, or dying.\" A glance at your camp — the stores, the defenses, "
                        + (s.Companion == "kavi" ? "Kavi, whom she takes in with one long unreadable look" : "your tidy solitary arrangements")
                        + ". \"Hm. Not dying.\"",
                    "\"Edda Voss. Up the mountain, past the third ridge, the fire you've been snubbing. Marshmint for the flies, feverbark for the fever you're courting, camped where you're camped — I'll leave cuttings.\" She snaps the shotgun closed, business concluded. \"The sea's deaf, castaway. The mountain isn't. When you're done being proud, the path is marked.\"",
                    "She is gone into the treeline before your manners finish rebooting.",
                },
            });
        }

        // ---- day 22, dusk: marsh fever --------------------------------------
        static void AddFever(StoryScript script)
        {
            script.Add(new StoryScene
            {
                Id = "ev3_fever",
                OnEnter = s =>
                {
                    if (s.Disease != null || s.Is("FEVER_STRUCK")) return;
                    s.SetFlag("FEVER_STRUCK");
                    s.Disease = "fever";
                    s.Stat(Meter.Energy, -15);
                    s.Stat(Meter.Hope, -6);
                },
                Text = _ => new List<string>
                {
                    "It starts as a headache with ambitions.",
                    "By dusk you're cold in the tropics — cold from the inside, teeth chattering in air like soup — and then the pendulum swings and you're burning, wringing wet, joints full of ground glass. You know this catalogue. You've been paying the fringe's little dusk tax in bites for a week, and the bill has come due.",
                    "<i>Marsh fever.</i> It will not leave on its own. Left to run, it will take your strength, then your hours, then everything else — and there is a cure on this island, in a grey-barked tree on an old woman's mountain, if you can get to it.",
                },
            });
        }

        // ---- day 24, dusk: Old Grin, introduced ------------------------------
        static void AddGrin(StoryScript script)
        {
            script.Add(new StoryScene
            {
                Id = "ev3_grin1",
                OnEnter = s =>
                {
                    if (s.Is("GRIN_MET")) return;
                    s.SetFlag("GRIN_MET");
                    s.Stat(Meter.Hope, -3);
                    s.AddRoute(RouteAxis.Depth, 1);
                },
                Text = s => new List<string>
                {
                    "You take the day east, following Edda's hand-drawn line toward the mangroves — the drowned forest that guards the island's other half — to see the East Passage for yourself.",
                    s.Companion == "kavi"
                        ? "Kavi stops you. Flat stop: a shoulder against your knee, hackles in a ridge, a growl pitched below hearing — aimed at a stretch of tea-dark water you'd already put your next footstep beside."
                        : "Some assembly of small wrongnesses stops you — the herons all facing one way, the crabs gone from a socketed log, a silence with a shape to it.",
                    "And the log in the channel opens an eye.",
                    "It is not a log. It was never a log. It is six meters of saltwater crocodile, moss-backed and patient as geology, lying in the one channel every crossing of the East Passage must use — and it has been watching you since before you knew there was anything to watch. It does not lunge. It does something worse: it settles, minutely, into perfect comfort. <i>No hurry</i>, says every line of it. <i>You'll be back. They always come back. I am always here.</i>",
                    "You withdraw with great correctness, heart hammering, and the mangroves let you go — this time, the courtesy of a landlord who prefers his tenants to understand the lease before signing.",
                },
            });
        }

        // ---- day 19: the chapter turn --------------------------------------
        static void AddOpen(StoryScript script)
        {
            script.Add(new StoryScene
            {
                Id = "ch3_open",
                OnEnter = s =>
                {
                    if (s.Chapter >= 3) return; // reload guard
                    s.Chapter = 3;
                },
                Text = _ => new List<string>
                {
                    "<i>CHAPTER THREE — THE GREEN DEEP</i>",
                    "Day nineteen. The island stops being a shore with a mystery behind it, and becomes a <i>country</i>: the deep jungle, the silver river that drains the broken mountain, the drowned tangle of the mangroves in the east — and, on the mountain's knee, a garden, a grove, and the woman who has kept them for sixty years.",
                },
                Choices = new List<StoryChoice>
                {
                    new StoryChoice
                    {
                        Label = "Begin ➤",
                        GoDynamic = s => s.Is("SMOKE_NOW") ? "ch3_edda_now"
                            : s.Is("SMOKE_LATER") ? "ch3_edda_later"
                            : "ch3_open_signal",
                    },
                },
            });
        }

        // ---- SMOKE_NOW: you slept on her floor ------------------------------
        static void AddEddaNow(StoryScript script)
        {
            script.Add(new StoryScene
            {
                Id = "ch3_edda_now",
                Speaker = "Edda Voss",
                Text = s =>
                {
                    var t = new List<string>
                    {
                        "You spent what was left of the night on the floor of a stranger's hut, under a stranger's blanket, with a shotgun standing in the corner like a chaperone. In the morning there is tea — bitter as a verdict, steaming — pushed into your hands without a word.",
                        "By daylight her domain explains itself: a grove cut into the mountain's knee, terraced and tended — beds of greens and root crops, fruit trees pruned low against wind, drying racks, rain tanks, a garden that is really a <i>system</i>, decades deep. Two low mounds sit at its edge under a flowering tree, kept clear of weeds. You don't ask. She watches you not ask, and something in her ledger moves.",
                        "\"Edda,\" she says finally, like a door opening a hand's width. \"Voss. You'll be wanting three things —\" she counts them off with the teacup, \"— my food, my knowledge, and my company. You may earn the first two.\"",
                    };
                    t.Add(s.Companion == "kavi"
                        ? "Then her eyes find Kavi, sitting grave and grey at the fence line, and she nods once, dog to woman, woman to dog, two watchful professionals recognizing each other. \"The pariah,\" she says. \"The pack put him out two springs back. He chose better this time.\""
                        : "She studies you a while, alone as you are, and something like approval crosses the old face. \"No pets, no partners, no nonsense. You'll either die quick or do well. I've seen both.\"");
                    return t;
                },
                Choices = new List<StoryChoice>
                {
                    new StoryChoice
                    {
                        Label = "\"Thank you. For the blanket, and for not shooting me.\"",
                        Sub = "Start with the honest ledger.",
                        Do = s =>
                        {
                            s.SetFlag("EDDA_MET");
                            s.Edda = Clamp100(20 + EddaChem(s));
                            s.Stat(Meter.Hope, 5);
                        },
                        Go = "ch3_after_open",
                    },
                    new StoryChoice
                    {
                        Label = "\"Sixty years. You were here before the station, or with it?\"",
                        Sub = "You noticed the word she didn't say.",
                        Do = s =>
                        {
                            s.SetFlag("EDDA_MET");
                            s.SetFlag("EDDA_PRESSED");
                            s.Edda = Clamp100(14 + EddaChem(s));
                            s.AddRoute(RouteAxis.Depth, 2);
                        },
                        Go = "ch3_after_press",
                    },
                },
            });
        }

        // ---- SMOKE_LATER: the noon appointment ------------------------------
        static void AddEddaLater(StoryScript script)
        {
            script.Add(new StoryScene
            {
                Id = "ch3_edda_later",
                Speaker = "Edda Voss",
                Text = s => new List<string>
                {
                    "You come at noon. You come slow. " + (s.Companion == "buri"
                        ? "You do what can be done about the pig smell, which is: nothing."
                        : "You come presentable, insofar as the island allows."),
                    "The grove takes your breath before its keeper does: terraces cut into the mountain's knee, beds and orchards and rain tanks, sixty years of system disguised as a garden. She is waiting at the fence with two cups already poured, which tells you she watched your whole approach and most of your week.",
                    "\"You read the note, followed the instructions, and brought a gift.\" She inspects your offering, then you, over it. \"Manners. From the <i>sea</i>. Wonders will never.\" The tea is bitter as a verdict. You are, you understand, being admitted on probation.",
                    "\"Edda Voss. Botanist, once. Keeper of this, now.\" A nod at the mountain, the grove, possibly the entire island. \"You'll want food and knowledge. Earn them. Company's not on offer —\" the old eyes flick over your shoulder, at your companion or your solitude, and soften by one degree, \"— you seem to have arranged your own.\"",
                },
                Choices = new List<StoryChoice>
                {
                    new StoryChoice
                    {
                        Label = "Ask what a botanist is still doing here, sixty years on.",
                        Sub = "The question under all the others.",
                        Do = s =>
                        {
                            s.SetFlag("EDDA_MET");
                            s.Edda = Clamp100(28 + EddaChem(s));
                            s.AddRoute(RouteAxis.Depth, 1);
                        },
                        Go = "ch3_after_open",
                    },
                    new StoryChoice
                    {
                        Label = "Ask nothing. Drink the tea. Let her set the pace.",
                        Sub = "Sixty years alone: she'll talk when talking is hers.",
                        Do = s =>
                        {
                            s.SetFlag("EDDA_MET");
                            s.SetFlag("EDDA_PATIENT");
                            s.Edda = Clamp100(32 + EddaChem(s));
                            s.Stat(Meter.Hope, 4);
                        },
                        Go = "ch3_after_open",
                    },
                },
            });
        }

        // ---- SMOKE_IGNORED: you chose the sea -------------------------------
        static void AddOpenSignal(StoryScript script)
        {
            script.Add(new StoryScene
            {
                Id = "ch3_open_signal",
                Text = _ => new List<string>
                {
                    "You chose the sea, and the sea is where your hours go: the pyre maintained, the mirror drilled at any glint of the horizon, the SOS re-blacked after every tide.",
                    "The mountain, for its part, says nothing. The thread of smoke rises every morning, banked and patient, a neighbor you've decided not to have.",
                    "The island, however, was not consulted about your decision — and the island has plans for your week.",
                },
                NextLabel = "Begin the day ➤",
            });
        }

        // ---- the walk down the mountain -------------------------------------
        static void AddAfterScenes(StoryScript script)
        {
            script.Add(new StoryScene
            {
                Id = "ch3_after_open",
                OnEnter = s =>
                {
                    if (s.Is("GROVE_OPENED")) return;
                    s.SetFlag("GROVE_OPENED");
                    s.Stat(Meter.Hunger, 12);
                    s.SetFlag("LORE_FEVERBARK");
                },
                Text = _ => new List<string>
                {
                    "The rest of the morning is a masterclass disguised as chores. She walks you down the terraces naming what you've been eating wrong and what you haven't dared eat at all: which fig is dinner and which is three days of regret, the vine whose pith is water, the bark — she taps a tall straight tree at the grove's edge — \"for fever. Marsh fever. You'll want to know that one, where you're camped.\"",
                    "You leave with a basket you didn't earn and instructions you didn't ask for, and the path down the mountain feels shorter than it did coming up.",
                    "<i>Edda's grove is open to you now — the trek costs part of a day, and pays it back with interest.</i>",
                },
            });
            script.Add(new StoryScene
            {
                Id = "ch3_after_press",
                Speaker = "Edda Voss",
                OnEnter = s =>
                {
                    if (s.Is("GROVE_OPENED")) return;
                    s.SetFlag("GROVE_OPENED");
                    s.SetFlag("LORE_FEVERBARK");
                },
                Text = _ => new List<string>
                {
                    "The word lands the way thrown words do. The cup stops halfway to her mouth. The grove is very quiet, in the way of gardens and courtrooms.",
                    "\"Before it. With it. <i>After</i> it,\" she says at last, each word placed like a stone. \"And that's the whole of that conversation until I know you considerably better — or you find the place yourself, which I'd advise against doing stupidly.\" She stands, brushing earth from her knees, audience concluded.",
                    "But at the fence, as you leave, she stops you with two fingers on your arm and — grudging, exact — points out the tall straight tree at the grove's edge. \"Feverbark. For the marsh fever, if the fringe bugs have been at you. Whatever else you think you've learned here today, learn that one.\"",
                    "<i>Edda's grove is open to you now — warily.</i>",
                },
            });
        }
    }
}
