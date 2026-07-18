using System.Collections.Generic;

namespace Tidebound.Narrative
{
    /// <summary>
    /// The six chapter-one encounters plus the squall and the ship's light,
    /// ported scene-for-scene from scenes-chapter1.js. Effects are machine
    /// truth (Chapter1EncounterTests pins them). The VN's returns to
    /// 'camp'/'night' map to null — the overlay lifts and the world is
    /// simply there. ev_nine (the tide pools) waits for its zone; the
    /// Clearing of Eyes waits for Phase 3, where the companion choice
    /// deserves its full weight.
    /// </summary>
    public static class Chapter1Encounters
    {
        public static StoryScript Build()
        {
            var script = new StoryScript();

            // ---- day 1, dusk: the sea eagle's payment ----------------------
            script.Add(new StoryScene
            {
                Id = "ev_vela",
                Speaker = "A sea eagle",
                Text = _ => new List<string>
                {
                    "Something falls out of the sky and lands at your feet with a wet slap.",
                    "It is half a fish. A good fish — was a good fish. You look up into the gold light and find her: a white-bellied sea eagle the size of a mistake, banking once over your camp on wings you can hear.",
                    "She lands on the dead palm at the edge of camp and regards you with one fierce amber eye. The other, you notice, is pale as sea-glass — blind. She does not look at you like a beggar. She looks at you like an accountant.",
                    "Earlier — you'd barely registered it — a monitor lizard had been nosing up the beach toward the point, and your blundering around the tide pools turned it back. Below her nest, you realize. The fish is not a gift.",
                    "It's a <i>payment</i>.",
                },
                Choices = new List<StoryChoice>
                {
                    new StoryChoice
                    {
                        Label = "Cook and eat it. Honor the transaction.",
                        Sub = "She's watching. Somehow this feels like the right answer.",
                        Do = s => { s.Meet("vela", 1); s.Stat(Meter.Hunger, 14); s.Stat(Meter.Hope, 3); },
                    },
                    new StoryChoice
                    {
                        Label = "Eat half. Leave half on the high rock, and step back.",
                        Sub = "Open a ledger of your own.",
                        Do = s => { s.Meet("vela", 2); s.Stat(Meter.Hunger, 7); s.Stat(Meter.Hope, 2); },
                    },
                    new StoryChoice
                    {
                        Label = "Just watch her until she tires of you.",
                        Sub = "Patience is a profession too.",
                        Do = s =>
                        {
                            s.Meet("vela", s.Is("BG_PHOTOG") ? 2 : 1);
                            s.Stat(Meter.Hope, 2);
                            if (s.Is("BG_PHOTOG")) s.SetFlag("VELA_STUDIED");
                        },
                    },
                },
            });

            // ---- day 1, night: eyes at the treeline -------------------------
            script.Add(new StoryScene
            {
                Id = "ev_howls",
                Speaker = "Eyes at the treeline",
                Text = _ => new List<string>
                {
                    "You wake — or half-wake — to singing.",
                    "Far inland, a pack of something is howling: ragged, many-voiced, rising and falling against the lagoon's slow pulse of light. Wild dogs. The island has wild dogs.",
                    "And one of them is <i>here</i>. At the treeline, at the exact edge of the dark, two eyes catch the glow — low, steady, unblinking. A big dog, storm-grey where the light touches, standing apart from the far chorus and pointedly not joining it.",
                    "It does not come closer. It does not leave. It watches you the way you'd watch weather.",
                },
                Choices = new List<StoryChoice>
                {
                    new StoryChoice
                    {
                        Label = "Toss a scrap of food halfway to the treeline, then lie back down.",
                        Sub = "A word in a language every stray knows.",
                        Do = s => { s.Meet("kavi", 2); s.Stat(Meter.Hunger, -4); },
                    },
                    new StoryChoice
                    {
                        Label = "Sit up and watch back. Calm, both hands visible.",
                        Sub = "Not prey, not threat. Just… neighbors.",
                        Do = s => { s.Meet("kavi", 1); s.Stat(Meter.Hope, 1); },
                    },
                    new StoryChoice
                    {
                        Label = "It's a wild animal. Keep your food, mind your fire, go to sleep.",
                        Sub = "Sentiment is a luxury item.",
                        Do = s => { s.Meet("kavi", 0); s.AddRoute(RouteAxis.Roots, 1); },
                    },
                },
            });

            // ---- day 2, dawn: the lighter thief ------------------------------
            script.Add(new StoryScene
            {
                Id = "ev_ipo",
                Speaker = "A macaque, delighted with himself",
                Text = s => new List<string>
                {
                    "You wake to tiny hands going through your pockets.",
                    "The thief is a young macaque with a scruffy coat and the eyes of a card sharp, sitting on your chest with tremendous self-possession. Before you're even fully upright he springs away down the beach — and he has, you realize with a lurch, <i>your lighter</i>.",
                    s.Fire > 0
                        ? "You have fire already banked in its ring, which is the only reason this is a comedy and not a catastrophe."
                        : "You do not have a fire yet. The full arithmetic of what he's just taken lands on you like cold water.",
                    "He stops a stone's throw away, holds the lighter up to the sun, turns it over, and then looks back at you. Deliberately. He is not fleeing. He is <i>waiting for the show</i>.",
                },
                Choices = new List<StoryChoice>
                {
                    new StoryChoice
                    {
                        Label = "Chase him. That lighter is survival.",
                        Sub = "You will not win. Some things you do anyway.",
                        Do = s =>
                        {
                            s.AddItem("lighter", -99); s.Meet("ipo", 1);
                            s.Stat(Meter.Energy, -8); s.Stat(Meter.Hope, 1); s.SetFlag("LIGHTER_GONE");
                        },
                        Go = "ev_ipo2",
                    },
                    new StoryChoice
                    {
                        Label = "Sit down, hold out a fig, and applaud.",
                        Sub = "He wants an audience? Fine. Negotiate like it's theater.",
                        Do = s =>
                        {
                            s.AddItem("lighter", -99); s.Meet("ipo", 2);
                            s.Stat(Meter.Hunger, -3); s.Stat(Meter.Hope, 3); s.SetFlag("LIGHTER_GONE");
                        },
                        Go = "ev_ipo3",
                    },
                    new StoryChoice
                    {
                        Label = "Curse all monkeys, comprehensively, and let it go.",
                        Sub = "Chasing him burns energy you can't spare.",
                        Do = s => { s.AddItem("lighter", -99); s.Meet("ipo", 0); s.SetFlag("LIGHTER_GONE"); },
                    },
                },
            });
            script.Add(new StoryScene
            {
                Id = "ev_ipo2",
                Speaker = "The thief",
                Text = _ => new List<string>
                {
                    "What follows is not a chase so much as a demonstration. He flows up a palm trunk like poured water, drops behind you, lets you get within an arm's length twice — exactly twice, the showman — and finishes on a branch just out of reach, hanging upside down, watching you wheeze.",
                    "He clicks the lighter. A tiny flame. His eyes go wide with the purest scientific joy you have ever seen on any face, on any species.",
                    "You sit down in the sand, utterly beaten, and — it surprises you — laugh. He chirps back. It sounds suspiciously like applause.",
                },
            });
            script.Add(new StoryScene
            {
                Id = "ev_ipo3",
                Speaker = "The thief",
                Text = _ => new List<string>
                {
                    "He watches you sit. Watches the fig. Sidles three steps closer, wildly casual, examining the sky, the sea, his own fingernails.",
                    "Then in one liquid movement the fig is gone from your hand and he's ten feet away eating it — lighter in the other fist, because he is not an amateur and this was never a <i>trade</i>.",
                    "But he stays while he eats. That close, curious, one eye always on you. When he finally swaggers off up the beach he looks back twice, and the second look lasts longer.",
                },
            });

            // ---- day 3, dusk: the squall --------------------------------------
            script.Add(new StoryScene
            {
                Id = "ev_squall",
                OnEnter = s =>
                {
                    if (s.Is("SQUALL_APPLIED")) return; // never double-apply
                    s.SetFlag("SQUALL_APPLIED");
                    if (s.Shelter >= 1)
                    {
                        s.Stat(Meter.Hope, 5); s.Stat(Meter.Thirst, 10); s.SetFlag("SQUALL_DRY");
                    }
                    else if (s.Has("tarp"))
                    {
                        s.Stat(Meter.Thirst, 10);
                    }
                    else
                    {
                        s.Stat(Meter.Energy, -10); s.Stat(Meter.Hope, -6); s.Stat(Meter.Thirst, 12);
                        if (s.Fire > 0) { s.Fire = 0; s.FireFuel = 0f; s.SetFlag("FIRE_DROWNED"); }
                    }
                },
                Text = s =>
                {
                    var t = new List<string>
                    {
                        "The sky goes from gold to green-black in the time it takes to notice. The reef stops breathing and starts <i>hissing</i>. Then the squall arrives all at once, a wall of warm rain marching up the lagoon like it has an appointment.",
                    };
                    if (s.Shelter >= 1)
                        t.Add("You get under your roof as the world turns to white noise. The thatch drums; the trench runs; the structure — <i>your</i> structure — holds. You sit in the dry dark grinning like an idiot at fifteen square feet of victory.");
                    else if (s.Has("tarp"))
                        t.Add("No shelter — but the tarp. You wrap yourself and your supplies in it and crouch against a palm while the squall does its worst, a human parcel, damp at the seams but whole.");
                    else
                        t.Add("There is nowhere to be but in it. The rain hits blood-warm and hammering, and in ninety seconds you are as wet as the ocean and colder than you've been since the crash. Your fire dies without a sound, like something giving up.");
                    return t;
                },
            });

            // ---- day 3, night: the auditor -------------------------------------
            script.Add(new StoryScene
            {
                Id = "ev_buri",
                Speaker = "A bearded pig, uninvited",
                Text = s => new List<string>
                {
                    "You wake to the sound of your camp being <i>audited</i>.",
                    "The auditor is a bearded pig — young, bristled, built like a barrel that learned to run — and he is going through your supplies with the joyful thoroughness of a customs officer who has decided to keep everything.",
                    s.Has("rations")
                        ? "He has found the rations. He is wearing one tin's worth of your future on his snout and looking for the opener, which is to say, stepping on the rest."
                        : "There is precious little to steal, which does not discourage him. He upends what there is on principle, snuffling with the satisfaction of a job well done.",
                    "He notices you noticing him. He does not run. He looks at you, sand and larceny all over his face, with an expression of total moral innocence.",
                },
                Choices = new List<StoryChoice>
                {
                    new StoryChoice
                    {
                        Label = "Charge at him, yelling, arms wide.",
                        Sub = "This is YOUR beach. Establish that.",
                        Do = s =>
                        {
                            s.Meet("buri", 1); s.Stat(Meter.Energy, -6);
                            if (s.Has("rations")) s.AddItem("rations", -1);
                        },
                        Go = "ev_buri2",
                    },
                    new StoryChoice
                    {
                        Label = "Toss him something and watch him work.",
                        Sub = "Feed the invasion. See what it does.",
                        Do = s =>
                        {
                            s.Meet("buri", 2);
                            if (s.Has("rations")) s.AddItem("rations", -1); else s.Stat(Meter.Hunger, -5);
                            s.Stat(Meter.Hope, 3);
                        },
                        Go = "ev_buri3",
                    },
                    new StoryChoice
                    {
                        Label = "Guard what matters and wait him out.",
                        Sub = "He's two hundred pounds of appetite. Pick your battles.",
                        Do = s => { s.Meet("buri", 1); if (s.Has("rations")) s.AddItem("rations", -1); },
                        Go = "ev_buri4",
                    },
                },
            });
            script.Add(new StoryScene
            {
                Id = "ev_buri2",
                Speaker = "The auditor",
                Text = _ => new List<string>
                {
                    "He holds his ground for exactly one and a half seconds of your charge, then wheels and gallops for the treeline with a squeal that is ninety percent outrage and ten percent glee, tail up like a flag.",
                    "At the trees he stops, turns, and looks back at you — not afraid, you notice. <i>Interested.</i> You have the unsettling impression you've just introduced yourself.",
                },
            });
            script.Add(new StoryScene
            {
                Id = "ev_buri3",
                Speaker = "The auditor",
                Text = _ => new List<string>
                {
                    "He inhales your offering, then — instead of leaving — flops down at the edge of the firelight's memory with a seismic grunt, entirely at home, and dozes off mid-chew.",
                    "You sit awake a while, robbed and somehow charmed, listening to a wild pig snore in your camp like a drunk uncle. In the morning he is gone, and every crab within fifty yards of camp has been excavated and eaten, which — you suspect — he considered rent.",
                },
            });
            script.Add(new StoryScene
            {
                Id = "ev_buri4",
                Speaker = "The auditor",
                Text = _ => new List<string>
                {
                    "You plant yourself over what matters and let him have the rest of his inspection. He works around you with perfect professional courtesy, taking what isn't nailed down, testing what is.",
                    "At last he stands a moment in the lagoon-glow, looks at you — a long, frank, appraising look, one settler to another — and trots off up the beach with his spoils. You have the strong feeling this was a first visit, not a last one.",
                },
            });

            // ---- day 4, dawn: the hawk and the hen ------------------------------
            script.Add(new StoryScene
            {
                Id = "ev_moa",
                Speaker = "A junglefowl hen",
                Text = _ => new List<string>
                {
                    "Dawn arrives pre-shattered: the jungle edge explodes with alarm calls, and a scatter of junglefowl — small, copper-and-flame, absurdly beautiful — bursts from the fringe onto the open sand, panicked past sense.",
                    "The reason rides down the morning air behind them: a hawk, stooping, wings shut like a decision.",
                    "The flock makes the treeline. One hen doesn't — she's cut off, flat to the sand in the open, frozen the way prey freezes when the plan runs out. The hawk banks around for its second pass.",
                    "It happens to be banking over <i>your</i> beach.",
                },
                Choices = new List<StoryChoice>
                {
                    new StoryChoice
                    {
                        Label = "Charge out roaring, waving both arms at the sky.",
                        Sub = "Ruin a hawk's morning. Cost: dignity, some energy.",
                        Do = s => { s.Meet("moa", 2); s.Stat(Meter.Energy, -4); s.Stat(Meter.Hope, 3); },
                        Go = "ev_moa2",
                    },
                    new StoryChoice
                    {
                        Label = "Throw a stone — high, to spoil the stoop, not to hit.",
                        Sub = "Precision sympathy.",
                        Do = s => s.Meet("moa", 2),
                        Go = "ev_moa2",
                    },
                    new StoryChoice
                    {
                        Label = "Stand still. This is the island's business, not yours.",
                        Sub = "The hawk is hungry too. Nothing here is a villain.",
                        Do = s => { s.Meet("moa", 0); s.AddRoute(RouteAxis.Depth, 1); },
                        Go = "ev_moa3",
                    },
                },
            });
            script.Add(new StoryScene
            {
                Id = "ev_moa2",
                Speaker = "The survivor",
                Text = _ => new List<string>
                {
                    "The hawk aborts with an offended flare of wings and rows away down the shore to find a breakfast with less commotion attached.",
                    "The hen stays frozen a long moment more — then unfreezes all at once and sprints, not for the treeline, but into the shadow of <i>your camp</i>, where she stands behind a water gourd, vibrating, one bright eye fixed on you.",
                    "She stays an hour. She inspects everything. She leaves the way queens leave. And that evening, back at the jungle edge, you notice she has not gone far at all.",
                },
            });
            script.Add(new StoryScene
            {
                Id = "ev_moa3",
                Speaker = "The survivor",
                Text = _ => new List<string>
                {
                    "The stoop misses — barely, a spray of sand and one copper feather — and the hawk climbs away empty. The hen finds her legs and streaks for cover.",
                    "All day you catch her at the fringe, watching your camp from under the ferns. You watched. She noticed. What she concludes from that is apparently still being decided.",
                },
            });

            // ---- day 4, midday: the grey dog, by daylight ------------------------
            script.Add(new StoryScene
            {
                Id = "ev_kavi2",
                Speaker = "The grey dog",
                Text = _ => new List<string>
                {
                    "Midday. You look up from your work and the grey dog from the treeline is simply <i>there</i>, thirty feet away in the open, as if he's been assigned to you.",
                    "By daylight he's bigger than the dark suggested, and thinner than he should be — ribs like a hull under the storm-grey coat, and an old scar of a burn along one flank where the fur grows wrong. He is hunting crabs, and he is terrible at it: too big, too slow on the turn, dignity everywhere.",
                    "He catches you watching. Stops. And instead of melting back into the trees, he sits — deliberately, facing half away, giving you his scarred side and one watchful eye.",
                    "Far off, faint, the pack sings its daytime song. His ear turns toward it. The rest of him doesn't.",
                },
                Choices = new List<StoryChoice>
                {
                    new StoryChoice
                    {
                        Label = "Toss him your next crab, underhand, easy.",
                        Sub = "Hunger is a door. Open it.",
                        Do = s => { s.Warm("kavi", 3); s.Met["kavi"] = true; s.Stat(Meter.Hunger, -4); },
                        Go = "ev_kavi3",
                    },
                    new StoryChoice
                    {
                        Label = "Sit down at his height and talk. Low, unhurried, about nothing.",
                        Sub = "The weather. The crab market. Anything.",
                        Do = s =>
                        {
                            s.Warm("kavi", s.Is("BG_PHOTOG") ? 3 : 2);
                            s.Met["kavi"] = true;
                            s.Stat(Meter.Hope, 2);
                        },
                        Go = "ev_kavi3",
                    },
                    new StoryChoice
                    {
                        Label = "Nod to him and keep working.",
                        Sub = "Two professionals, sharing a beach.",
                        Do = s => { s.Warm("kavi", 1); s.Met["kavi"] = true; s.AddRoute(RouteAxis.Roots, 1); },
                        Go = "ev_kavi3",
                    },
                },
            });
            script.Add(new StoryScene
            {
                Id = "ev_kavi3",
                Speaker = "The grey dog",
                Text = _ => new List<string>
                {
                    "He doesn't come closer. That, you sense, is not on today's agenda, and pushing would end the meeting. But the watchful eye softens by some canine degree, and when he finally rises and pads back toward the treeline, he stops once and looks back at you over the scarred shoulder.",
                    "It is not a beggar's look, and not a stray's. It's the look of someone who has been let down by his own kind and is running the numbers on yours.",
                },
            });

            // ---- day 4, dusk: the light on the horizon (needs the flare gun) -----
            script.Add(new StoryScene
            {
                Id = "ev_lights",
                Text = _ => new List<string>
                {
                    "Dusk, day four. You're coaxing the evening chores along when your whole body freezes before your mind knows why.",
                    "A light. Out on the darkening horizon — a single pale light, low on the water, crawling from south to north. A ship. Far, terribly far, but <i>real</i>: the first human-made thing you've seen move since the crash.",
                    "The flare gun is in your hand before you remember crossing the camp. One flare. One argument with the horizon. At this distance, in this light… maybe they're looking this way. Maybe nobody's on deck at all.",
                    "You will only get to make this argument once.",
                },
                Choices = new List<StoryChoice>
                {
                    new StoryChoice
                    {
                        Label = "Fire it. Now, high, while there's any chance at all.",
                        Sub = "This is what it's FOR.",
                        Do = s =>
                        {
                            s.AddItem("flaregun", -1); s.SetFlag("FLARE_SPENT");
                            s.AddRoute(RouteAxis.Signal, 4); s.Stat(Meter.Hope, -8);
                        },
                        Go = "ev_lights2",
                    },
                    new StoryChoice
                    {
                        Label = "Lower the gun. Not this one. Not a maybe.",
                        Sub = "Save the argument for a ship that can hear it.",
                        Do = s => { s.SetFlag("FLARE_HELD"); s.AddRoute(RouteAxis.Signal, 1); s.Stat(Meter.Hope, 2); },
                        Go = "ev_lights3",
                    },
                },
            });
            script.Add(new StoryScene
            {
                Id = "ev_lights2",
                Text = _ => new List<string>
                {
                    "The flare goes up with a sound like torn cloth and hangs over the lagoon, a small red sun, painting the whole beach in emergency. You stand in its light with your arms raised, shouting at the sea.",
                    "The light on the horizon crawls on, south to north, unchanged, until it isn't there anymore. The flare hisses into the water. The dark comes back all at once.",
                    "The island lagoon glows on, seven slow beats, as it always has and always will, entirely unimpressed by red.",
                },
            });
            script.Add(new StoryScene
            {
                Id = "ev_lights3",
                Text = _ => new List<string>
                {
                    "You watch the light the whole way north, gun heavy at your side, doing the cold arithmetic again and again and getting the same cold answer. It was never going to see you.",
                    "When it's gone you exhale, holster the argument you didn't spend, and notice your hands are shaking. Not with regret, you decide. With change: some part of you just stopped waiting to be found and started planning to be <i>ready</i>.",
                },
            });

            return script;
        }
    }
}
