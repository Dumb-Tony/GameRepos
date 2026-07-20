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
