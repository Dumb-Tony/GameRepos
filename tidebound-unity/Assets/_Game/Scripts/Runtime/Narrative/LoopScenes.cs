using System.Collections.Generic;

namespace Tidebound.Narrative
{
    /// <summary>
    /// The crossing between lives (loops.js): WHAT CARRIES, played when a
    /// stranger who has never seen this island wakes already humming with
    /// it, and THE KEEPSAKE, offered at the edge of a finished life. The
    /// Driftwood Loops menu and the run modifiers arrive with their own
    /// session; these two scenes are the crossing itself.
    ///
    /// The crossing precedes the crash, so `loop_arrival` belongs to the
    /// PROLOGUE script (it hands off to `falling`); the keepsake belongs to
    /// the encounters script, where lives end.
    /// </summary>
    public static class LoopScenes
    {
        /// <summary>WHAT CARRIES — the crossing, ahead of the fall — and the
        /// DRIFTWOOD LOOPS menu that precedes it once a life has been lived.</summary>
        public static void AddArrivalTo(StoryScript prologue)
        {
            prologue.Add(new StoryScene
            {
                Id = "loops_menu",
                Text = s =>
                {
                    int lives = s.LoopsLived;
                    var t = new List<string>
                    {
                        "<i>🌀 DRIFTWOOD LOOPS</i>",
                        "The island remembers " + lives + (lives == 1 ? " life" : " lives")
                            + " of yours. And you — in the way of dreams, and water, and songs you know before the second verse — are starting to remember it back.",
                        "Knowledge carries. Names, paths, terms, the shape of the dark under the mountain — whatever you have truly learned arrives with you, humming under the skin of a stranger who has never seen this island before.",
                        "Begin again — or begin again <i>differently</i>. The loops permit conditions.",
                    };
                    return t;
                },
                Choices = BuildLoopsMenuChoices(),
            });

            prologue.Add(new StoryScene
            {
                Id = "loop_arrival",
                Text = s =>
                {
                    var t = new List<string>
                    {
                        "<i>🌀 WHAT CARRIES</i>",
                        "Between one life and the next there is a crossing — water, and a hum, and the strange freight inspection of dreams. Nothing you owned makes it. What you <i>know</i> rides free.",
                    };
                    var carried = DriftwoodLoops.CarriedLines(s);
                    if (carried.Count > 0) t.AddRange(carried);
                    else
                        t.Add("This time the crossing is nearly empty: a hum under the skin, a sense of green off the port bow, the certainty of a song one verse before it starts. It is enough. It has to be.");

                    foreach (var keepsake in DriftwoodLoops.Keepsakes)
                        if (s.Is("KEEPSAKE_" + keepsake.Id.ToUpperInvariant()))
                        {
                            t.Add("🎁 And in your pack, impossibly: <i>" + NameOnly(keepsake.Name)
                                + "</i> — soaked in enough of a life you can't remember to have become part of you.");
                            break;
                        }

                    var condition = RunModifiers.CrossingLineFor(s);
                    if (condition != null) t.Add(condition);
                    return t;
                },
                Next = PrologueScript.Start,
                NextLabel = "🛫 Cross ➤",
            });
        }

        public static void AddTo(StoryScript script)
        {
            // ---- NG+ only: the grotto journal, in your own handwriting ----
            script.Add(new StoryScene
            {
                Id = "ev_loop",
                OnEnter = s =>
                {
                    if (s.Is("LOOP_KNOWN")) return;
                    s.SetFlag("LOOP_KNOWN");
                    s.AddRoute(RouteAxis.Depth, 3);
                    s.Stat(Meter.Hope, -4);
                },
                Text = _ => new List<string>
                {
                    "You find the grotto because you were sure — sure the way you are sure of your own name — that it would be behind the third fall of vines past the tide pools, and it is, and you stand in its blue-green light with your certainty curdling into something colder.",
                    "There is a dry shelf above the waterline. There is a tin box on the shelf. There is a journal in the box, swollen with salt and years, and the handwriting in it is <i>yours</i>.",
                    "Not similar. Yours. The loops of the g's, the crossed-out second thoughts, the little ledger columns you have kept since Day 1 — kept since Day 1 of <i>which life?</i> — and the last entry, dated no date, reads: <i>\"The island remembers. I keep arriving. If you are reading this — and you are; I remember reading it — then listen: the seventh beat is a door closing so gently it sounds like a heart. Count the lives. Ask the pool who is counting WITH you.\"</i>",
                    "You put the journal back, because — you understand this with the deep, terrible calm of the water finding its level — you have put it back before.",
                },
            });

            script.Add(new StoryScene
            {
                Id = "keepsake",
                Text = _ => new List<string>
                {
                    "<i>🎁 THE KEEPSAKE</i>",
                    "At the edge of this life, the island makes its strange arithmetic plain: nothing you own crosses the water. But one thing you <i>made true</i> — one object soaked in enough of this run to have become part of you — will find its way into the next stranger's pack, impossibly, and hum there.",
                    "Choose what carries.",
                },
                Choices = BuildKeepsakeChoices(),
            });
        }

        static List<StoryChoice> BuildLoopsMenuChoices()
        {
            var choices = new List<StoryChoice>
            {
                new StoryChoice
                {
                    Label = "🌀 Begin the next loop",
                    Sub = "Everything you know, nothing you owned. The standard crossing.",
                    Do = s => s.RunModifier = null,
                    Go = "loop_arrival",
                },
            };
            foreach (var modifier in RunModifiers.All)
            {
                var m = modifier; // capture per iteration
                choices.Add(new StoryChoice
                {
                    Label = m.Name,
                    Sub = m.Sub,
                    Do = s => s.RunModifier = m.Id,
                    Go = "loop_arrival",
                });
            }
            return choices;
        }

        static List<StoryChoice> BuildKeepsakeChoices()
        {
            var choices = new List<StoryChoice>();
            foreach (var keepsake in DriftwoodLoops.Keepsakes)
            {
                var k = keepsake; // capture per iteration
                choices.Add(new StoryChoice
                {
                    Label = k.Name,
                    Sub = k.Sub,
                    When = s => k.Available(s),
                    Do = s => { s.SetFlag("KEEPSAKE_CHOSEN"); LoopStore.BankRun(s, k.Id); },
                });
            }
            choices.Add(new StoryChoice
            {
                Label = "🌊 Nothing. Let the sea have all of it.",
                Sub = "Knowledge still carries. Objects were never the point.",
                Do = s => { s.SetFlag("KEEPSAKE_CHOSEN"); LoopStore.BankRun(s); },
            });
            return choices;
        }

        /// <summary>"🪢 A coil of good rope" → "A coil of good rope".</summary>
        static string NameOnly(string name)
        {
            int space = name.IndexOf(' ');
            return space >= 0 ? name.Substring(space + 1) : name;
        }
    }
}
