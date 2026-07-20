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

            AddNine(script);
            AddClearing(script);
            AddDespair(script);
            Chapter2Events.AddTo(script); // Foothold shares the one event script
            CaseArc.AddTo(script);        // the courier's case (scenes-extra.js)
            CycloneNight.AddTo(script);   // the cyclone — Cold Fire's vehicle
            Chapter3Events.AddTo(script); // The Green Deep opens (ch3_open cluster)
            Chapter4Events.AddTo(script); // The Hum: the station, one building at a time
            return script;
        }

        // ---- the dark door — despair, offered once, at the bottom of the
        // night (scenes-quests.js ev_despair; v1 companion variants) --------
        static void AddDespair(StoryScript script)
        {
            script.Add(new StoryScene
            {
                Id = "ev_despair",
                Text = s => new List<string>
                {
                    "You can't sleep, and tonight you stop pretending the reason is noise.",
                    "It has been building for days — you've felt it the way you feel weather now: the tasks getting heavier while meaning nothing, the horizon you've stopped checking, the fire you feed out of habit rather than argument. Tonight it arrives whole and sits down across from you, patient, unhurried, like the island's other tide:",
                    "<i>What if you just… stopped keeping the days?</i>",
                    "Not dying. Nothing so decisive. Just — setting down the count. Letting the ledger blur. Walking into the green some morning without a plan to walk out, and letting the island fold over you the way it folded over every other made thing.",
                    s.Companion == "kavi"
                        ? "By the banked fire, Kavi shifts in sleep — one small warm fact against the whole enormous dark."
                        : "The fire ticks. The dark does not.",
                    "The night waits for your answer. It is not in a hurry. It is never in a hurry.",
                },
                Choices = new List<StoryChoice>
                {
                    new StoryChoice
                    {
                        Label = "Name one thing for the morning. Out loud. Then sleep.",
                        Sub = "One thing. That's the whole discipline. That's always been the whole discipline.",
                        Do = s => { s.Stat(Meter.Hope, 8); s.SetFlag("DESPAIR_REFUSED"); },
                    },
                    new StoryChoice
                    {
                        Label = "Stop keeping the days.",
                        Sub = "Set down the count. Let the green have the rest.",
                        Do = s => s.DeathCause = "despair",
                    },
                },
            });
        }

        /// <summary>The secret neighbor's condition — scenes-chapter1.js
        /// verbatim: the second pool visit, if she hasn't been met.</summary>
        public static bool NineIsDue(GameState s) =>
            s.TidePoolVisits == 2 && !(s.Met.TryGetValue("nine", out var m) && m);

        // ---- the tide pools' oldest question --------------------------------
        static void AddNine(StoryScript script)
        {
            script.Add(new StoryScene
            {
                Id = "ev_nine",
                Speaker = "Something in the pool",
                Text = _ => new List<string>
                {
                    "You're prying at an oyster when the rock beside your hand opens an eye.",
                    "The whole \"rock\" un-rocks itself in one impossible ripple — texture, color, certainty, all abandoned at once — and becomes an octopus the size of a cat, hanging in the pool's clear water, regarding you with a slotted golden eye that is doing, unmistakably, the same thing you're doing: <i>studying</i>.",
                    "She has been here before. You understand this suddenly and completely — the watched feeling, the moved rocks, the day you talked out loud to yourself at this pool for an hour. She was attending.",
                    "She reaches one arm out of the water — slow, deliberate, tip curled like a question mark — and taps the oyster you're holding. Then taps the rock. Then waits.",
                    "She is showing you where to strike it open. She has <i>opinions about your technique</i>.",
                },
                Choices = new List<StoryChoice>
                {
                    new StoryChoice
                    {
                        Label = "Follow her instructions exactly.",
                        Sub = "Be teachable.",
                        Do = s => { s.Meet("nine", 3); s.Stat(Meter.Hunger, 6); s.Stat(Meter.Hope, 4); s.AddRoute(RouteAxis.Depth, 2); },
                        Go = "ev_nine2",
                    },
                    new StoryChoice
                    {
                        Label = "Offer her the oyster instead.",
                        Sub = "Tribute for the professor.",
                        Do = s => { s.Meet("nine", 2); s.Stat(Meter.Hope, 3); s.AddRoute(RouteAxis.Depth, 2); },
                        Go = "ev_nine2",
                    },
                    new StoryChoice
                    {
                        Label = "Withdraw your hand slowly and give the pool some distance.",
                        Sub = "Respect. Also: those arms are strong and you are far from help.",
                        Do = s => { s.Meet("nine", 1); s.AddRoute(RouteAxis.Depth, 1); },
                        Go = "ev_nine2",
                    },
                },
            });
            script.Add(new StoryScene
            {
                Id = "ev_nine2",
                Speaker = "The neighbor",
                Text = _ => new List<string>
                {
                    "When the business of the oyster is concluded to her satisfaction, she settles back into the pool, pours herself into a crevice you'd have sworn was too small — and stops, one eye out, watching you go.",
                    "At the last moment, an arm rises above the water and traces one slow spiral in the air. It might be nothing. It might be a wave goodbye. It does not, in any way you can name, feel like nothing.",
                },
            });
        }

        /// <summary>The animals as the Clearing names them (COURTS, law #3).</summary>
        static readonly (string Animal, string Named)[] ClearingNames =
        {
            ("kavi", "the grey dog"),
            ("ipo", "the macaque"),
            ("vela", "the sea eagle"),
            ("buri", "the bearded pig"),
            ("moa", "the junglefowl hen"),
            ("nine", "the octopus"),
        };

        // ---- day 5, dusk: THE CLEARING OF EYES ----------------------------
        // V1 ships Kavi only (bible §8): the Clearing offers the grey dog or
        // the solo road. The other courtships arrive with their companions.
        static void AddClearing(StoryScript script)
        {
            script.Add(new StoryScene
            {
                Id = "clearing",
                Text = s =>
                {
                    var met = new List<string>();
                    foreach (var (animal, named) in ClearingNames)
                        if (s.Met.TryGetValue(animal, out var m) && m)
                            met.Add(named);
                    string company = met.Count > 0 ? string.Join("; ", met) : "the island itself, watching";
                    return new List<string>
                    {
                        "<i>THE CLEARING OF EYES</i>",
                        "Dusk, the fifth day. You sit by your camp doing the honest arithmetic at last: no search plane has come. No ship has turned. Whatever happens next, it happens <i>here</i>, and it happens to you — and five days of this island have taught you exactly how long your two hands are.",
                        "And as the light goes long and gold, you realize you have company. You've had company all along.",
                        "They are all, in their various ways, present: " + company + ". Wild lives, orbiting your small fire of a life these five days, each for their own reasons. Curious. Hungry. Lonely, maybe — you're projecting, probably — or maybe not.",
                        "Trust, out here, is the most expensive thing you can build, and you only have the hours to build it once. If you give your scarce time to one of them — food you can't spare, patience you can't spare, days you can't spare — one of these lives might tie itself to yours. For good.",
                        "<i>One.</i>",
                    };
                },
                Choices = new List<StoryChoice>
                {
                    new StoryChoice
                    {
                        Label = "The grey dog",
                        Sub = "Watchful. Burn-scarred. Cast out of his own pack — and choosing, maybe, to be near yours.",
                        When = s => s.Met.TryGetValue("kavi", out var m) && m,
                        Do = s => { s.Companion = "kavi"; s.SetFlag("CLEARING_DONE"); },
                        Go = "court_kavi",
                    },
                    new StoryChoice
                    {
                        Label = "No one. You will do this alone.",
                        Sub = "No mouths to feed but yours. No one to lose but yourself. The hardest road, and wholly your own.",
                        Do = s => { s.SetFlag("CLEARING_DONE"); s.SetFlag("SOLO_ROUTE"); s.AddRoute(RouteAxis.Roots, 1); },
                        Go = "court_none",
                    },
                },
            });

            script.Add(new StoryScene
            {
                Id = "court_kavi",
                Speaker = "The grey dog",
                Text = s => new List<string>
                {
                    "You take your food to the open sand between the camp and the treeline, sit down at his height, and wait.",
                    "It takes most of the evening. He circles twice at the dark's edge; sits; lies down; gets up; and finally crosses the distance the way a man crosses a rope bridge — committed and hating it — until two hundred pounds of storm-grey wild dog is standing an arm's length away, reading your face like a track.",
                    (s.Interest.TryGetValue("kavi", out var w) && w >= 3
                        ? "The crab you threw him, the low easy talk, the scrap in the dark — he has been running those numbers for days. Whatever total he reaches, it tips him: "
                        : "You have given him little enough reason. But whatever he was cast out of cost him more: ")
                    + "he takes the fish from the sand beside your hand, gravely, without snatching — and then he does not leave.",
                    "When you finally bank the fire and lie down, he arranges himself precisely at the edge of camp, back to you, scarred flank to the flames' dying warmth, facing the treeline. On guard. You fall asleep to the sound of a wild thing breathing between you and the dark, and far away — one last time that night — the pack sings without him.",
                    "He does not answer them.",
                },
                Choices = new List<StoryChoice>
                {
                    new StoryChoice
                    {
                        Label = "\"Kavi.\" You name him after the sound the reef makes at low tide.",
                        Sub = "Named things stay.",
                        Do = s =>
                        {
                            s.Warm("kavi", 2);
                            s.Stat(Meter.Hope, 6);
                            s.SetFlag("KAVI_NAMED");
                            CompanionLogic.InitTrust(s);
                        },
                        Go = "ch2_open",
                    },
                    new StoryChoice
                    {
                        Label = "Say nothing. Let him keep his own name a while longer.",
                        Sub = "He'll tell you when it's time.",
                        Do = s =>
                        {
                            s.Warm("kavi", 1);
                            s.AddRoute(RouteAxis.Depth, 1);
                            s.Stat(Meter.Hope, 4);
                            CompanionLogic.InitTrust(s);
                        },
                        Go = "ch2_open",
                    },
                },
            });

            script.Add(new StoryScene
            {
                Id = "court_none",
                Next = "ch2_open",
                NextLabel = "The morning after",
                Text = _ => new List<string>
                {
                    "You bank the fire alone, on purpose, and sit with the decision while the lagoon keeps its slow time.",
                    "It isn't coldness. It's arithmetic, and honesty: every mouth tied to yours is food you must find twice, every bond a hostage the island can take. You have watched this place for five days now. It is beautiful the way knives are beautiful. You will cross it faster alone, risk less, grieve less.",
                    "The grey dog sings somewhere inland with a pack that isn't his. The monkey's treetops go quiet. Small feet and large ones print the morning sand at the edges of your life, and you will let them stay at the edges: neighbors, all of them. Not family.",
                    "Alone, then. Unbroken, if you can manage it. The night is enormous, and you are exactly one person, and you find — checking, the way you'd check a knot — that this holds.",
                },
            });
        }
    }
}
