using System;
using System.Collections.Generic;

namespace Tidebound.Narrative
{
    /// <summary>
    /// The crash prologue, ported scene-for-scene from the VN
    /// (scenes-prologue.js): falling → the courier → who-you-were →
    /// ashore → the two-of-five salvage threshold → the first night →
    /// the chapter-one opener. Prose and effects are machine truth —
    /// PrologueScriptTests pins every delta. The VN's title menu and its
    /// NG+ déjà-vu line are not ported yet (no meta-progress in 3D).
    /// </summary>
    public static class PrologueScript
    {
        public const string Start = "falling";

        // the five salvage bundles — VN BUNDLES verbatim, emoji dropped
        // (the runtime font has no glyphs for them)
        static readonly (string Key, string Label, string Sub)[] Bundles =
        {
            ("flaregun", "The flare gun",
                "One flare. One argument with the horizon. You will only get to make it once."),
            ("medkit", "The first-aid kit",
                "Bandages, antiseptic, painkillers. Three real treatments between you and infection."),
            ("toolbox", "The pilot's toolbox",
                "Pliers, saw blade, wire, tape. Every camp job gets easier; some become possible."),
            ("rations", "Rations and a tarpaulin",
                "Four tinned meals and a sheet of sky-proof plastic. The gentlest first week on offer."),
            ("case", "The courier's case",
                "Locked. Heavy. Chained to nothing now. You have no idea what's in it, and it isn't food."),
        };

        public static StoryScript Build()
        {
            var script = new StoryScript();

            // ---- the crash ------------------------------------------------
            script.Add(new StoryScene
            {
                Id = "falling",
                Text = _ => new List<string>
                {
                    "The seatbelt light comes on over the middle of nowhere.",
                    "You are one of four passengers on a charter hop between islands whose names you learned yesterday. Below the wing there is ocean, and then more ocean, and then — you sit up — <i>green</i>. An island. A big one. It isn't on the seat-pocket map.",
                    "Up front, the pilot taps the compass. Taps it again. The needle turns like it's looking for something it lost. The radio gives out a long, low tone that rises and falls, seven beats, like a chord hummed underwater. It does not sound like static.",
                    "The engines are fine. The instruments are drunk. The plane begins, gently and unarguably, to descend.",
                    "Someone behind you starts to pray. The man across the aisle — a quiet passenger with a battered courier case chained to his wrist — looks at the island, not the water, and says, to nobody: <i>\"There you are.\"</i>",
                    "The descent stops being gentle. In the last minute, you—",
                },
                Choices = new List<StoryChoice>
                {
                    new StoryChoice
                    {
                        Label = "Brace, and breathe, and count the seconds.",
                        Sub = "Stay calm. Whatever comes, meet it with your body ready.",
                        Do = s => { s.SetFlag("BRACED"); s.Stat(Meter.Hope, 4); },
                        Go = "whowere",
                    },
                    new StoryChoice
                    {
                        Label = "Help the courier — he can't get his case unchained.",
                        Sub = "A stranger's trouble is still trouble.",
                        Do = s => { s.SetFlag("HELPED_COURIER"); s.AddItem("photo"); s.Stat(Meter.Hope, 2); },
                        Go = "falling_courier",
                    },
                    new StoryChoice
                    {
                        Label = "Look out the window. Memorize everything.",
                        Sub = "The shape of a bay. A river mouth. A mountain with a broken crown.",
                        Do = s => { s.SetFlag("SAW_ISLAND"); s.AddRoute(RouteAxis.Depth, 1); },
                        Go = "whowere",
                    },
                },
            });

            script.Add(new StoryScene
            {
                Id = "falling_courier",
                Text = _ => new List<string>
                {
                    "The chain won't give. His hands are shaking too badly for the little key; yours aren't much better, but between you the cuff opens on the second try.",
                    "He doesn't thank you. He presses something into your palm — a photograph, soft at the corners, folded and refolded — and closes your fingers over it with both of his.",
                    "<i>\"If it's the same island,\"</i> he says, which is not a sentence that means anything, <i>\"you'll want to know it can be left.\"</i>",
                    "Then the water comes up to meet the windows.",
                },
                Next = "whowere",
            });

            // ---- who you were ---------------------------------------------
            script.Add(new StoryScene
            {
                Id = "whowere",
                Text = _ => new List<string>
                {
                    "Cold. Roar. Salt. Somewhere between the impact and the dark, your life does the thing lives are said to do — but it doesn't flash. It settles, like sand, on one picture.",
                    "Who were you, before?",
                },
                Choices = new List<StoryChoice>
                {
                    new StoryChoice
                    {
                        Label = "A flight medic.",
                        Sub = "Steady hands, other people's worst days. You keep a pocket kit even off duty. (Wounds heal faster; poor hunter.)",
                        Do = s => { s.Background = "medic"; s.AddItem("medkit", 1); s.SetFlag("BG_MEDIC"); },
                        Go = "ashore",
                    },
                    new StoryChoice
                    {
                        Label = "A wildlife photographer.",
                        Sub = "Patience as a profession. You read animals the way others read faces. (Animals warm to you faster; clumsy hands.)",
                        Do = s => { s.Background = "photog"; s.AddItem("camera"); s.SetFlag("BG_PHOTOG"); },
                        Go = "ashore",
                    },
                    new StoryChoice
                    {
                        Label = "A line cook.",
                        Sub = "Twelve years of heat and knives. You can make anything edible. (Better meals, iron stomach; the crash hit your spirits hardest.)",
                        Do = s => { s.Background = "cook"; s.AddItem("knife"); s.Stat(Meter.Hope, -8); s.SetFlag("BG_COOK"); },
                        Go = "ashore",
                    },
                    new StoryChoice
                    {
                        Label = "A marine engineer.",
                        Sub = "If it's broken, it's a puzzle. You were flying home from a rig. (Building and fire come easier; you get lost on land.)",
                        Do = s => { s.Background = "engineer"; s.AddItem("multitool"); s.SetFlag("BG_ENGINEER"); },
                        Go = "ashore",
                    },
                },
            });

            // ---- ashore -----------------------------------------------------
            script.Add(new StoryScene
            {
                Id = "ashore",
                Text = s => new List<string>
                {
                    "You wake with your cheek in wet sand and your legs still in the ocean, being pulled at, patiently, like the water hasn't decided whether to keep you.",
                    s.Is("BRACED")
                        ? "You ache everywhere, but everything answers when you call it. Bracing saved you the worst."
                        : "Your ribs light up when you cough. Nothing broken — probably — but the sea did not handle you kindly.",
                    "The beach is long and white and utterly empty. Behind it, jungle rises in green terraces toward a mountain with a broken crown"
                        + (s.Is("SAW_ISLAND")
                            ? " — the one you memorized from the air. You know, roughly, the shape of this island. That already feels like wealth."
                            : "."),
                    "Of the plane, the pilot, the praying woman, the courier — there is a floating seat cushion, a slick of fuel rainbowing the shallows, and silence.",
                    "You have a working lighter in one zipped pocket"
                        + (s.Has("photo") ? ", a stranger's photograph in the other," : "")
                        + " and the clothes you nearly died in.",
                    "Out on the reef, caught on the coral shelf like a moth on a pin, is the broken rear half of the fuselage. It is visibly, slowly, going under.",
                },
                Next = "salvage",
                NextLabel = "Wade out to the wreck",
            });

            // ---- the salvage threshold: take two of five --------------------
            script.Add(new StoryScene
            {
                Id = "salvage",
                Text = _ => new List<string>
                {
                    "The water over the reef is chest-deep and losing its light. The fuselage groans on the coral with every swell, a sound like a door asking to be closed.",
                    "Inside, in the cold tilting dark, you find what the ocean hasn't claimed: five things worth carrying. The hull shifts under your feet. The math is brutal and simple — <i>two trips' worth of arms, no third trip.</i>",
                    "You take—",
                },
                Choices = BundleChoices(second: false),
            });
            script.Add(new StoryScene
            {
                Id = "salvage2",
                Text = _ => new List<string>
                {
                    "One bundle safe above the tideline. The fuselage is lower in the water already; the swell breaks over the doorway now, insistent.",
                    "One more. Choose.",
                },
                Choices = BundleChoices(second: true),
            });

            // ---- the first night --------------------------------------------
            script.Add(new StoryScene
            {
                Id = "night0",
                Text = s => new List<string>
                {
                    "By the time you're ashore with the second load, the reef holds nothing but reef. The fuselage is gone as completely as if you'd imagined it. Day one of — something — ends with you shivering above the tideline, too tired to be afraid properly.",
                    "Then the lagoon begins to glow.",
                    "Soft blue-green light blooms in the water, in slow pulses — seven beats, rising and falling. The same rhythm the radio drowned in. You watch the whole bay breathe light like something enormous is sleeping under it, and despite everything — the cold, the dead, the distance from every mapped thing — it is the most beautiful thing you have ever seen.",
                    s.Is("HELPED_COURIER")
                        ? "You think of the courier's photograph in your pocket. <i>If it's the same island.</i> You are starting to suspect it is."
                        : "The compass on your zipper pull turns, slowly, all the way around, pointing at everything. Fine, you think. I'll find my own north.",
                },
                Choices = new List<StoryChoice>
                {
                    new StoryChoice
                    {
                        Label = "Watch the water until sleep takes you.",
                        Sub = "Beauty is also a resource.",
                        Do = s =>
                        {
                            s.Stat(Meter.Hope, 6);
                            s.AddRoute(RouteAxis.Depth, 1);
                            s.SetFlag("COMPASS_SPINS");
                            s.Day = 1;
                            s.Seg = Segment.Dawn;
                            s.Stat(Meter.Energy, 15);
                        },
                        Go = "ch1_open",
                    },
                    new StoryChoice
                    {
                        Label = "Turn your back on it and sleep. Tomorrow is a working day.",
                        Sub = "Wonder doesn't boil water.",
                        Do = s =>
                        {
                            s.AddRoute(RouteAxis.Roots, 1);
                            s.SetFlag("COMPASS_SPINS");
                            s.Day = 1;
                            s.Seg = Segment.Dawn;
                            s.Stat(Meter.Energy, 22);
                        },
                        Go = "ch1_open",
                    },
                },
            });

            // ---- chapter one opens (scenes-chapter1.js ch1_open) -------------
            script.Add(new StoryScene
            {
                Id = "ch1_open",
                Text = s => new List<string>
                {
                    "<i>CHAPTER ONE — THE FIRST FIRE</i>",
                    "Morning arrives the way it will arrive every day from now on: without an alarm, without mercy, and more beautiful than anything has a right to be.",
                    "Rule one of being alive out here writes itself before breakfast, mostly because there is no breakfast: <i>water, fire, shelter, food — in whatever order the island allows.</i>",
                    "Three days, you tell yourself. Search parties, transponders, somebody's satellite. Three days of doing everything right, and this becomes a story you tell."
                        + (s.Is("COMPASS_SPINS")
                            ? " The spinning compass in your pocket has opinions about that plan. You choose not to consult it."
                            : ""),
                    "And you are not alone. All morning the island watches you — a shape in the treeline, a shadow under the tide pools, wings riding the thermal off the point. You are new here, and the locals are curious.",
                },
                Next = null, // the overlay lifts; the beach is yours
                NextLabel = "Begin the day",
            });

            // WHAT CARRIES — the NG+ crossing that precedes the fall
            LoopScenes.AddArrivalTo(script);

            return script;
        }

        static List<StoryChoice> BundleChoices(bool second)
        {
            var list = new List<StoryChoice>();
            foreach (var (key, label, sub) in Bundles)
            {
                string k = key;
                list.Add(new StoryChoice
                {
                    Label = label,
                    Sub = sub,
                    When = s => !s.Is("SALV_" + k),
                    Do = s =>
                    {
                        s.SetFlag("SALV_" + k);
                        if (k == "rations") { s.AddItem("rations", 4); s.AddItem("tarp"); }
                        else if (k == "medkit") { s.AddItem("medkit", 3); }
                        else { s.AddItem(k); }
                        if (k == "case") s.AddRoute(RouteAxis.Depth, 1);
                    },
                    Go = second ? "night0" : "salvage2",
                });
            }
            return list;
        }
    }
}
