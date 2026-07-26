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
            AddKing2(script);
            AddPulse(script);
            AddHearts2(script);
            AddThreshold(script);
            AddGroveVisits(script);
            AddFeverBurnout(script);
        }

        // ---- the medic's road out of the fever (ch3Actions) -------------------
        static void AddFeverBurnout(StoryScript script)
        {
            script.Add(new StoryScene
            {
                Id = "camp_fever_burnout",
                OnEnter = s =>
                {
                    if (s.Disease != "fever") return;
                    s.AddItem("medkit", -2);
                    s.Disease = null;
                    s.Stat(Meter.Health, -5);
                    s.Stat(Meter.Hope, 4);
                },
                Text = _ => new List<string>
                {
                    "You treat yourself the way you'd treat a stranger: ruthlessly. Fluids on schedule, the kit's antipyretics split and rationed, cold compresses through the worst of the spikes, and no heroics about staying on your feet.",
                    "It takes a day you can't spare and most of the kit. On the far side of it you are wrung out, five pounds lighter — and <i>clear</i>. The fever's hooks are out.",
                },
            });
        }

        // ---- the grove, visitable (the VN's 'grove' hub scene, split into
        // ---- one scene per visit purpose; EddaInteractable offers them) ------
        static void AddGroveVisits(StoryScript script)
        {
            script.Add(new StoryScene
            {
                Id = "grove_work",
                Speaker = "Edda Voss",
                OnEnter = s =>
                {
                    s.Edda = Clamp100(s.Edda + 7);
                    s.Stat(Meter.Hunger, 14);
                    s.Stat(Meter.Energy, -6);
                    s.AddRoute(RouteAxis.Roots, 1);
                },
                Text = _ => new List<string>
                {
                    "You weed, stake, haul and mulch to her exacting standard, and somewhere in the second hour the instruction stops being suspicious and becomes — teaching. Real teaching, decades deep, poured into the first hands that have turned up to receive it.",
                    "\"You'll do,\" she says at the end, loading your basket with more than you earned, and looks appalled at herself all the way to the fence.",
                },
            });
            script.Add(new StoryScene
            {
                Id = "grove_plants",
                Speaker = "Edda Voss",
                OnEnter = s =>
                {
                    if (s.Is("SALVE")) s.SetFlag("PLANTS_AGAIN");
                    s.Edda = Clamp100(s.Edda + 3);
                    s.SetFlag("LORE_PLANTS");
                    s.SetFlag("SALVE");
                },
                Text = s => new List<string>
                {
                    "She walks you through the beds like a general reviewing troops: the fever-tree and how to strip its bark without killing it; the fat-leafed aloe-kin for burns; bittergreen for guts; and a grey-green shrub whose crushed leaves smell like medicine feels.",
                    s.Is("PLANTS_AGAIN")
                        ? "You take fresh cuttings and better instructions, and the almanac in your head gains pages."
                        : "\"Marshmint,\" she says. \"Rub it on at dusk and the biting flies will dine elsewhere.\" You take cuttings. Your evenings — and your blood — just got considerably safer.",
                },
            });
            script.Add(new StoryScene
            {
                Id = "grove_wound",
                Speaker = "Edda Voss",
                OnEnter = s =>
                {
                    s.Injury = null;
                    s.Edda = Clamp100(s.Edda + 3);
                    s.Stat(Meter.Health, 8);
                },
                Text = _ => new List<string>
                {
                    "She unwraps your dressing, pronounces your field medicine \"ambitious,\" and redoes all of it: the wound irrigated with something that hisses, packed with honey and a moss you now know by name, bound in boiled cloth.",
                    "\"Keep it dry, which on this island in this season is a joke, so keep it CLEAN.\" She flicks your ear like a schoolmistress. \"You heal fast, castaway. Stop giving it so much to do.\"",
                },
            });
            script.Add(new StoryScene
            {
                Id = "grove_cure",
                Speaker = "Edda Voss",
                OnEnter = s =>
                {
                    s.Disease = null;
                    s.Edda = Clamp100(s.Edda + 4);
                    s.Stat(Meter.Health, 5);
                    s.Stat(Meter.Hope, 6);
                },
                Text = _ => new List<string>
                {
                    "She takes one look at your eyes and the conversation is over — you are steered into shade, dosed with a decoction so bitter your ancestors flinch, wrapped, watered, and ordered to sleep like it's a chore assignment.",
                    "You surface hours later, soaked through and ravenous, with the fever's grip broken and an old woman pretending to garden nearby, exactly within earshot. \"Three more doses,\" she says, not looking up, pressing a paper of stripped bark into your kit. \"And move your camp off that fringe at dusk, fool.\"",
                },
            });
            script.Add(new StoryScene
            {
                Id = "grove_lore",
                Speaker = "Edda Voss",
                OnEnter = s =>
                {
                    s.AddRoute(RouteAxis.Depth, 1);
                    int stage = s.Is("EDDA_LORE2") ? 3 : s.Is("EDDA_LORE1") ? 2 : 1;
                    if (stage == 1) s.SetFlag("EDDA_LORE1");
                    else if (stage == 2) s.SetFlag("EDDA_LORE2");
                    else
                    {
                        s.SetFlag("EDDA_LORE3");
                        if (s.Edda >= 55) { s.SetFlag("LORE_HALCYON"); s.AddRoute(RouteAxis.Depth, 2); }
                    }
                },
                Text = s =>
                {
                    if (s.Is("EDDA_LORE3"))
                        return s.Is("LORE_HALCYON")
                            ? new List<string>
                            {
                                "She's quiet so long you think the door has shut. Then: \"You'll have noticed your compass is a liar and your radio drowned. There's a reason, and it's not spirits, whatever I let fools believe. It's in the rock. It sings in the rock, seven beats — you've seen the lagoon keep time to it.\"",
                                "\"There was a station, once. East side, past the mangroves — past that damned crocodile. People with instruments and funding and no sense at all, come to find out what sings.\" Her jaw sets like mortar. \"I was the youngest of them. The bark you take your fever cure from is a tree I planted in nineteen sixty-nine.\"",
                                "\"They drilled it. The rock. The song. And the island—\" she stops, and finishes with her voice hoarse: \"—<i>answered</i>. Two graves under my flowering tree, and I stayed. That's the whole story you're getting today, and more than the world ever got.\"",
                            }
                            : new List<string>
                            {
                                "She studies you over the tea. \"No,\" she says at last, gently enough. \"The rest of it isn't a story I hand to acquaintances. Earn your way past the fence and ask again.\"",
                            };
                    if (s.Is("EDDA_LORE2"))
                        return new List<string>
                        {
                            "\"Where did they go.\" She looks at the mountain a long time. \"The mountain broke — you've seen the crown. The east half of the island tore, the sea came in over the fields, ash for years after. The stones stop being cut about then. Every book would tell you they died or sailed away.\"",
                            "She pulls a weed with great attention. \"Books,\" she says, \"have never once walked up my mountain and looked in the caldera. That's all I'll say, and I've already said more of it than I meant to.\"",
                        };
                    return new List<string>
                    {
                        "\"You've found the stones, then.\" Not a question. \"There are thirty on this island that I know, and I don't claim to know them all. The people who cut them were farmers and sailors — better sailors than anyone who's wrecked here since, which is every one of us.\"",
                        "\"The spiral?\" She traces one in the air, exactly right. \"It's the island. The way in, the way down, the way the water moves under it. They didn't worship this place, whatever a fool would tell you. They <i>kept</i> it. There's a difference. I'd know.\"",
                    };
                },
            });
            script.Add(new StoryScene
            {
                Id = "grove_gems",
                Speaker = "Edda Voss",
                OnEnter = s =>
                {
                    if (s.Is("GEMS_NAMED")) return;
                    s.SetFlag("GEMS_NAMED");
                    s.Edda = Clamp100(s.Edda + 2);
                    s.AddRoute(RouteAxis.Depth, 1);
                },
                Text = _ => new List<string>
                {
                    "You unroll the lead-lined pouch on her table, and Edda Voss looks at the dozen cut stones for a long, level moment — and then, notably, does <i>not</i> touch them.",
                    "\"Heartglass,\" she says. \"The mountain's own. It runs in veins under this island, down where the survey drilled — alive, for any definition of the word that will stretch. Cutting cores of it was the station's sin, and the island answered it.\" A nod at the pouch. \"Someone kept the habit. Someone out in the world has been cutting it into <i>trinkets</i>.\"",
                    "She pushes the pouch back across the table with one knuckle, lead-side in. \"Keep it wrapped. And when you finally see it living in the rock, castaway — you'll understand why I didn't touch it.\"",
                },
            });
            script.Add(new StoryScene
            {
                Id = "grove_case",
                Speaker = "Edda Voss",
                OnEnter = s =>
                {
                    if (s.Is("CASE_EDDA")) return;
                    s.SetFlag("CASE_EDDA");
                    s.AddRoute(RouteAxis.Depth, 2);
                },
                Text = _ => new List<string>
                {
                    "You unwrap the courier's case and set it on her table, and Edda Voss goes still in a way you have not seen her go still.",
                    "\"Where,\" she says quietly, \"did you get that.\" Not the case, you realize — she's not looking at the case. She's looking at the small stamped crest by the lock, half worn away, that you'd taken for a maker's mark.",
                    "She turns it to the light with one finger, like it might wake. \"This crest belonged to the people who funded the station,\" she says at last. \"It stopped existing — publicly — in nineteen eighty. And a man was carrying this over the island last week.\" She pushes it back across the table as if returning something to a fire. \"Don't open that near me. And don't open it stupidly. Some locks are the only honest warning you get.\"",
                },
            });
            script.Add(new StoryScene
            {
                Id = "grove_graves",
                Speaker = "Edda Voss",
                OnEnter = s =>
                {
                    if (s.Is("EDDA_GRAVES")) return;
                    s.SetFlag("EDDA_GRAVES");
                    s.Edda = Clamp100(s.Edda + 5);
                    s.Stat(Meter.Hope, 2);
                },
                Text = _ => new List<string>
                {
                    "She doesn't answer for a long time, and you let the silence do its work, the way she taught you without teaching.",
                    "\"Ilsa,\" she says finally. \"Doctor Ilsa Vane. The best mind ever wasted on this island, and the only person I've loved past the age of reason. The tree is hers; she chose it herself, at the end. Faces the sea, because she never did stop watching for the ship that would take her results home.\"",
                    "A pause. Your eye moves to the second, smaller mound, and the old woman almost — almost — smiles. \"Aleksander,\" she says. \"A rooster. Absolute tyrant. Ilsa's, then mine, then neither of ours; he owned us both and crowed like the sun answered to him personally, seventeen years.\" She stands, briskly, gathering cups. \"That's enough archaeology for one visit.\"",
                },
            });
        }

        // ---- day 27: the Boar King, continued --------------------------------
        static void AddKing2(StoryScript script)
        {
            script.Add(new StoryScene
            {
                Id = "ev3_king2",
                OnEnter = s =>
                {
                    if (s.Is("KING2_APPLIED")) return;
                    s.SetFlag("KING2_APPLIED");
                    if (s.Is("KING_TITHED")) { s.Stat(Meter.Hunger, -4); s.AddRoute(RouteAxis.Roots, 1); }
                    else if (s.Is("KING_TRACKED")) { s.AddRoute(RouteAxis.Depth, 2); s.SetFlag("KING_SYMPATHY"); }
                    else if (s.Is("KING_WALLED")) { s.AddRoute(RouteAxis.Roots, 1); s.Stat(Meter.Hope, 3); }
                    else { s.Stat(Meter.Energy, -8); if (s.Food > 0) s.Food -= 1; }
                },
                Text = s =>
                {
                    if (s.Is("KING_TITHED")) return new List<string>
                    {
                        "Mid-morning, the treeline delivers a state visit.",
                        "The Boar King walks the edge of your camp in full daylight — unhurried, enormous, scar-plated — and does not touch one stake, one store, one stone. He inspects the boundary like a magistrate reviewing a treaty, pauses at the spot where you leave the offerings, and looks at you for a long, level moment across the clearing.",
                        "Then he is gone, at his own pace, the jungle closing behind him like a door with good hinges.",
                        "The tithe holds. You are, apparently, the first neighbor in some time to grasp the concept of rent.",
                    };
                    if (s.Is("KING_TRACKED")) return new List<string>
                    {
                        "You go back along his road, deeper this time, to the wallow the trail promised — a mud pan the size of a house floor, generations deep, walled with rubbing-posts polished like furniture.",
                        "And at its edge, half-grown into a strangler fig: more snare wire. Old, rusted, industrial — not castaway improvisation. Dozens of loops of it, and among them, pressed into the fig's grown-over bark, small tusked skulls. Young ones. A sounder's worth.",
                        "You stand a while in the quiet, recalculating your monster. Something with instruments and funding came to this island once, and it snared and it took, and one scar-plated survivor has been at war with the smell of people ever since. He is not a monster. He is a <i>veteran</i>.",
                    };
                    if (s.Is("KING_WALLED")) return new List<string>
                    {
                        "He tests the wall on the thirteenth day — once, at dawn, a shuddering headlong blow you feel through the ground and your teeth — and the wall, your wall, groans and <i>holds</i>.",
                        "Through the stakes you watch him back off three paces and regard the structure: not enraged, you realize, but assessing, the way you'd assess weather. Then he screams at the jungle — a sound like sheet metal tearing, purely for the record — and departs.",
                        "The message is received in both directions: you will not be moved cheaply; he has not conceded the ground. The treaty is the wall itself.",
                    };
                    return new List<string>
                    {
                        "He comes back on the thirteenth day, at dusk, and this time you're in camp to meet it: the Boar King, scar-plated and enormous, testing your boundary with the confidence of prior success.",
                        "What follows is loud, close, and expensive — pans beaten, brands waved, one stake splintered, one store scattered — before he withdraws into the dark, unhurried even in retreat, promising nothing.",
                        "You rebuild by firelight, doing the honest math: he is a fact of the inland, like weather, and your policy toward him — wall, war, or tribute — is still unwritten. Facts don't wait forever.",
                    };
                },
            });
        }

        // ---- day 28, night: the pulse skips ----------------------------------
        static void AddPulse(StoryScript script)
        {
            script.Add(new StoryScene
            {
                Id = "ev3_pulse",
                OnEnter = s =>
                {
                    if (s.Is("PULSE_SKIPPED")) return;
                    s.SetFlag("PULSE_SKIPPED");
                    s.AddRoute(RouteAxis.Depth, s.Companion == "nine" ? 2 : 1);
                },
                Text = s => new List<string>
                {
                    "You wake at the black bottom of the night with no idea why — and then you have exactly an idea why, and it raises the hair on your arms:",
                    "<i>The lagoon missed a beat.</i>",
                    "Thirteen nights you have slept against that slow glow, seven beats, rising and falling, reliable as your own pulse. Tonight, once — you'd testify to it — the whole bay went dark on the sixth beat, held its breath for a count that felt like the island listening, and resumed.",
                    s.Companion == "kavi"
                        ? "Kavi is sitting bolt upright beside you, ears full forward — at the water. Not the treeline. The <i>water</i>."
                        : s.Companion == "moa"
                            ? "Moa is awake in her box, utterly silent, feathers slicked flat — and facing the lagoon, which she has never once considered worth her professional attention before."
                            : s.Companion == "nine"
                                ? "And down at the tideline, half out of the water in the returning glow, Nine is watching — not the lagoon. <i>You.</i> As if the interesting question isn't what the island just did, but whether you finally noticed."
                                : "Nothing else stirs. The reef breathes. The palms tick. Whatever counted that pause, it wasn't counting for your benefit.",
                },
            });
        }

        // ---- day 31: the second hearts ---------------------------------------
        static void AddHearts2(StoryScript script)
        {
            script.Add(new StoryScene
            {
                Id = "ev3_heart2",
                SpeakerDynamic = s => s.Companion == "buri" ? "Buri" : s.Companion == "moa" ? "Moa" : s.Companion == "vela" ? "Vela" : s.Companion == "ipo" ? "Ipo" : s.Companion == "nine" ? "Nine" : "Kavi",
                OnEnter = s =>
                {
                    if (s.Is("HEART2_DONE")) return;
                    s.SetFlag("HEART2_DONE");
                    s.Bond(10);
                    s.Stat(Meter.Hope, 8);
                    if (s.Companion == "ipo") { s.SetFlag("IPO_KEY"); s.AddRoute(RouteAxis.Depth, 2); }
                    if (s.Companion == "nine") { s.SetFlag("SHIP_PHOTO"); s.AddRoute(RouteAxis.Depth, 2); s.AddRoute(RouteAxis.Signal, 1); }
                },
                Text = s =>
                {
                    if (s.Companion == "nine")
                        return new List<string>
                        {
                            "On the fourteenth low tide Nine leads you out — deliberately, surfacing and waiting, surfacing and waiting — along the reef line to the drop-off where the sunk fuselage lies blue and quiet in three fathoms, and she goes down into it, into the drowned dark you cannot follow, and is gone a long two minutes.",
                            "She comes back up with her arms full and lays it on the coral shelf between you like a verdict: the courier's photograph" + (s.Has("photo") ? " — its twin; the copy he kept" : "") + ", bleached but legible: a shoreline. A broken-crowned mountain. <i>This island</i> — photographed from the deck of a departing ship, dated in fountain pen, decades before your crash.",
                            "Someone left this place, once, the ordinary way, and lived to file the picture. Nine holds the proof flat under one arm against the current, and watches you with her slotted golden eye, and you would swear on the wreck below that she knows exactly what she has just given you: <i>hope, with a bearing on it</i>.",
                        };
                    if (s.Companion == "ipo")
                        return new List<string>
                        {
                            "On the fourteenth day Ipo takes your hand — actually takes it, both of his around one finger, pulling with intent — and leads you up through the canopy roads to a hollow in a strangler fig, and shows you the single most valuable thing he owns: <i>everything</i>.",
                            "The hoard. Years of it: bottle glass sorted by color, a doll's porcelain hand, coins green with age, your long-mourned second-best fishhook (you let it pass), and — your breath stops — a flat steel key on a rotted lanyard, stamped with letters gone black with age: <i>HALCYON — E WING</i>.",
                            "He watches your face as you take it in, vibrating with pride, and then makes the gesture you know: <i>take</i>. Anything. All of it. The whole treasury, opened to the audience of one.",
                        };
                    if (s.Companion == "buri")
                        return new List<string>
                        {
                            "On the fourteenth day you finally understand what Buri does at dusk when he vanishes toward the treeline: he walks the perimeter. Your perimeter. All of it — beach line, water path, forage trail — nose down, unhurried, thorough as a nightwatchman, before galloping back to collapse into your fire's light.",
                            "Tonight you follow, and at the treeline you find his work: every fence-gap rubbed with his scent, every approach marked, the whole map of your small kingdom re-signed, nightly, in the only ink the inland dark respects: <i>occupied. Defended. His.</i>",
                            "He finds you watching and grins his whole pig grin, tail going, absurd and mighty. You walk the last of the rounds together, landlord and enforcer, and the night makes way.",
                        };
                    if (s.Companion == "vela")
                        return new List<string>
                        {
                            "On the fourteenth morning, on the high stone, Vela does the impossible thing.",
                            "She steps close — closer than transaction, closer than the blind-side courtesy — and lowers her head, and presses it to your chest, and <i>leaves it there</i>. One breath. Three. Wind-cold feathers and forty knots of muscle standing utterly still against your heartbeat, letting itself be — for exactly as long as she permits — held.",
                            "Then it's over, and she's three feet away tidying a wing like nothing occurred, and the sea and you both know better than to remark on it. Some payments aren't in fish. The books have gone somewhere past balance, into whatever birds keep instead of love.",
                        };
                    if (s.Companion == "moa")
                        return new List<string>
                        {
                            "On the fourteenth night a sound comes off the treeline — a real one, heavy, close, wrong — and before your hand finds the spear, before courage could be expected from anything that ought to have the size for it, two pounds of copper feathers has planted itself between you and the dark, wings mantled to twice her size, screaming defiance in a voice to strip paint.",
                            "The sound retreats. Whatever it was weighed a hundred times what she does, and it retreated, from her, because retreat was simpler than whatever she was promising.",
                            "She stands guard, quivering, magnificent, until you gather her in — heart hammering against your palm like a fast little engine — and she scolds you, at length, for the disorderly state of your defenses. You accept the review in full. Brave feather. Bravest on the island.",
                        };
                    return new List<string>
                    {
                        "On the fourteenth night the pack sings inland, the old ragged chorus, and you feel Kavi lift his head against your knee the way he does — and then, for the first time in your acquaintance, he answers.",
                        "He sings from beside your fire — long, rough, unpracticed, a voice with two springs of rust in it — and the inland chorus stumbles, recalibrates around the new bearing, and answers back. He sings his position. He sings it from <i>here</i>.",
                        "When it's done he looks at you, embarrassed as a dog can be, and thumps his tail once. You have just been declared, to the entire island, in the only language that ever mattered to him.",
                    };
                },
            });
            script.Add(new StoryScene
            {
                Id = "ev3_heart2_low",
                SpeakerDynamic = s => s.Companion == "buri" ? "Buri" : s.Companion == "moa" ? "Moa" : s.Companion == "vela" ? "Vela" : s.Companion == "ipo" ? "Ipo" : s.Companion == "nine" ? "Nine" : "Kavi",
                OnEnter = s =>
                {
                    if (s.Is("HEART2_LOW")) return;
                    s.SetFlag("HEART2_LOW");
                    s.Bond(3);
                },
                Text = s => new List<string>
                {
                    (s.Companion == "buri" ? "Buri" : s.Companion == "moa" ? "Moa" : s.Companion == "vela" ? "Vela" : s.Companion == "ipo" ? "Ipo" : s.Companion == "nine" ? "Nine" : "Kavi") + " is still here. That's not nothing — out here, staying is the first vow and the hardest. But on the fourteenth morning you catch yourself narrating your plans to the fire instead of to them, and you feel the shape of the distance you've kept.",
                    "The wild keeps honest books. Walls, water, smoke, survival — all fair entries. But the bond is a crop like any other on this island: it grows exactly as much as you tend it, and the season does not wait.",
                },
            });
            script.Add(new StoryScene
            {
                Id = "ev3_coco2",
                OnEnter = s =>
                {
                    if (s.Is("COCO_SHELF")) return;
                    s.SetFlag("COCO_SHELF");
                    s.Stat(Meter.Hope, 5);
                    s.AddRoute(RouteAxis.Roots, 1);
                },
                Text = _ => new List<string>
                {
                    "On the fourteenth morning you build Coco a shelf.",
                    "It isn't much — a flat of driftwood lashed at eye height, out of the rain, with a view of the fire, the works, and the sea. He presides. You find, arranging him, that you've started angling his face toward whatever you're working on, for the supervision.",
                    "You are aware of what this is. You have decided it's <i>working</i>, which out here is the only review that counts. Morale infrastructure, you note in the day's mental log, and Coco — three pores of him, weathered and constant — declines, with perfect tact, to comment.",
                },
            });
        }

        // ---- day 35: OLD GRIN'S TOLL (the chapter threshold) ------------------
        static void AddThreshold(StoryScript script)
        {
            script.Add(new StoryScene
            {
                Id = "ch3_threshold",
                Text = s =>
                {
                    string why = s.Route.Signal >= s.Route.Roots && s.Route.Signal >= s.Route.Depth
                        ? "Because the east is where the answers to <i>leaving</i> live: Edda's station had a radio once, and radios have parts, and parts can be made to speak."
                        : s.Route.Roots >= s.Route.Depth
                            ? "Because the east is where the old terraces run richest — seed stock, tools, ground that remembers farming — everything a real foothold becomes a real <i>home</i> with."
                            : "Because the east is where the island keeps its locked drawers: the station, the stones, the answers under the answers.";
                    return new List<string>
                    {
                        "<i>OLD GRIN'S TOLL</i>",
                        "Day thirty-five. You stand at the mangrove edge with your kit weighed and your reasons rehearsed. " + why,
                        "Between you and all of it: the East Passage — one crossing, one channel, one landlord. He is there now. He is always there. Six meters of patience in tea-dark water, older than Edda, undefeated by everyone who ever carried better equipment than yours into this swamp.",
                        "The toll gets paid one way or another. Choose the currency.",
                    };
                },
                Choices = new List<StoryChoice>
                {
                    new StoryChoice
                    {
                        Label = "Pay him in meat. Bait the far channel and cross behind his back.",
                        Sub = "Costs your smoked reserve (2 stores). Undignified, effective, honest.",
                        When = s => s.Food >= 2,
                        Do = s => { s.Food -= 2; s.SetFlag("GRIN_BAITED"); s.SetFlag("EAST_OPEN"); },
                        Go = "ch3_toll_baited",
                    },
                    new StoryChoice
                    {
                        Label = "The dawn window. Cross while the cold still owns him.",
                        Sub = "Your scouting: first light, low tide, a lethargic landlord.",
                        When = s => s.Is("GRIN_SCOUTED"),
                        Do = s => { s.SetFlag("GRIN_TIMED"); s.SetFlag("EAST_OPEN"); },
                        Go = "ch3_toll_timed",
                    },
                    new StoryChoice
                    {
                        Label = "Cross under Kavi's watch. Slow, loud, and unblinking.",
                        Sub = "Predator etiquette: you are not prey if you never once act it.",
                        When = s => s.Companion == "kavi" && s.Trust >= 50,
                        Do = s => { s.SetFlag("GRIN_STANDOFF"); s.SetFlag("EAST_OPEN"); s.Bond(4); },
                        Go = "ch3_toll_kavi",
                    },
                    new StoryChoice
                    {
                        Label = "Cross at Buri's shoulder. A two-body convoy.",
                        Sub = "Make the meal too expensive. He has never once lost this argument.",
                        When = s => s.Companion == "buri" && s.Trust >= 50,
                        Do = s => { s.SetFlag("GRIN_CONVOY"); s.SetFlag("EAST_OPEN"); s.Bond(4); },
                        Go = "ch3_toll_buri",
                    },
                    new StoryChoice
                    {
                        Label = "Cross under Vela's overwatch.",
                        Sub = "Nothing moves in that channel that she won't call first.",
                        When = s => s.Companion == "vela" && s.Trust >= 50,
                        Do = s => { s.SetFlag("GRIN_OVERWATCH"); s.SetFlag("EAST_OPEN"); s.Bond(4); },
                        Go = "ch3_toll_vela",
                    },
                    new StoryChoice
                    {
                        Label = "Ipo's diversion. The greatest performance of his career.",
                        Sub = "A monkey, a mudbank, and professional-grade audacity.",
                        When = s => s.Companion == "ipo" && s.Trust >= 50,
                        Do = s => { s.SetFlag("GRIN_DISTRACTED"); s.SetFlag("EAST_OPEN"); s.Bond(5); },
                        Go = "ch3_toll_ipo",
                    },
                    new StoryChoice
                    {
                        Label = "Nine's chart. She's already mapped his kingdom from below.",
                        Sub = "Cross where the water says he never goes.",
                        When = s => s.Companion == "nine" && s.Trust >= 50,
                        Do = s => { s.SetFlag("GRIN_MAPPED"); s.SetFlag("EAST_OPEN"); s.Bond(4); s.AddRoute(RouteAxis.Depth, 1); },
                        Go = "ch3_toll_nine",
                    },
                    new StoryChoice
                    {
                        Label = "Fight him for it.",
                        Sub = "Spear, fire, and the worst idea available. It might even work — but hurt or weakened, he will collect you like rent.",
                        Do = s =>
                        {
                            if (s.Stats.Health < 35f) { s.DeathCause = "grin"; return; }
                            s.SetFlag("GRIN_FOUGHT");
                            s.SetFlag("EAST_OPEN");
                            s.Injury = "laceration";
                            s.Stat(Meter.Health, -25);
                            s.Stat(Meter.Hope, 4);
                        },
                        GoDynamic = s => s.DeathCause != null ? null : "ch3_toll_fight",
                    },
                    new StoryChoice
                    {
                        Label = "Turn back. The east can wait; the toll's too rich today.",
                        Sub = "Live castaways get to change their minds later.",
                        Do = s => { s.SetFlag("GRIN_UNRESOLVED"); s.AddRoute(RouteAxis.Roots, 1); },
                        Go = "ch3_end_stay",
                    },
                },
            });

            AddToll(script, "ch3_toll_baited",
                "You lay your smoked reserve on the far mudbank at slack tide, upwind and obvious, and it costs you exactly what food costs on an island: everything it took to make. Then you wait in the roots, not breathing, while six meters of appetite makes its unhurried, regal way toward the free meal.",
                "You cross the channel with your heart in your ears while the landlord dines. It is the least heroic thing you have ever done flawlessly. From the far bank you watch him finish, settle, and slide one eye across the water to where you now stand — and the eye holds no grudge at all. Rent was paid. The lease is stamped. Business is business in the mangrove country.");
            AddToll(script, "ch3_toll_timed",
                "First light, low tide. You come to the ford exactly on the schedule the swamp taught you, and there he is — hauled out on his mud throne, grey-cold and logy, a king at his most constitutional.",
                "You cross the channel at a steady wade, close enough to count his teeth if your eyes had dared leave the far bank, and the cold holds him like a law of physics. By the time the sun finds the water you are east of everything, standing in country no castaway footprint has touched in fifty years, shaking slightly, entirely whole.");
            AddToll(script, "ch3_toll_kavi",
                "Kavi teaches you the crossing the way the wild taught him: <i>never once be prey</i>. You enter the ford side by side, slow as ceremony, loud as ownership — no darting, no freezing, no scent of flight — while he holds the water's edge with his eyes and a growl pitched to travel through mud and bone.",
                "Old Grin surfaces at thirty feet and considers you both: the upright thing that isn't running, the grey thing that isn't backing down, the whole expensive, unprofitable prospect of it. Patience does arithmetic. Arithmetic says wait for cheaper. He sinks like a decision, and you walk — walk — up the eastern bank.");
            AddToll(script, "ch3_toll_nine",
                "Nine's chart is drawn in patience: three nights of her moving through the drowned kingdom below while you slept, and this morning, in the wet sand, the result — channels, depths, and one line, traced twice, through backwaters where the water runs too thin and root-choked for six meters of anything.",
                "You cross the East Passage without ever entering his country at all — waist-deep in nursery channels among mudskippers and fiddler crabs, guided turn by turn by a russet arm surfacing ahead of you like a ferryman's lamp. From the last pool she watches you climb the eastern bank, and the slotted eye holds something you'd call, in anyone else, professional satisfaction.");
            AddToll(script, "ch3_toll_ipo",
                "What Ipo does at the East Passage will be, you are certain, the standard against which you measure audacity for the rest of your life.",
                "He crosses the canopy alone to the far bank, descends to the mud in full view, and <i>heckles</i> the largest predator on the island — hurling sticks, shrieking abuse, performing a strut so insolent it has structure — until Old Grin, in the nearest thing a crocodile has to exasperation, commits his whole terrible length up the far mudbank after him. Ipo ascends a root like smoke going up a chimney. You cross the emptied channel at a dead sprint.",
                "He rejoins you east of the water, swaggering fit to dislocate something, and accepts his fee — the whole fig ration, prepaid — like a professional. Somewhere behind you, the landlord subsides into his channel, gypped for the first time in decades.");
            AddToll(script, "ch3_toll_buri",
                "Buri crosses the ford the way a bulldozer crosses an objection. You go with him, hip against his shoulder, one fist in his bristles, a two-body convoy displacing water and doubt in equal measure.",
                "Old Grin rises once, measures the proposition — two hundred pounds of tusked, furious calcium with a human attachment, all of it radiating expense — and declines the meal with the dignity of a king who was, of course, never hungry in the first place. Buri screams one entirely unnecessary victory scream at the settling water. You do not tell him it was unnecessary. It wasn't, quite.");
            AddToll(script, "ch3_toll_vela",
                "You cross on Vela's word and nothing else — and it is enough. She holds station over the channel, riding the swamp's bad air in flat circles, and twice her cry cracks across the water and you stop dead mid-ford, thigh-deep, while something vast realigns itself invisibly below the tea-dark surface.",
                "Twice the cry softens. Twice you move. It takes an hour to cross two hundred yards, on a bird's syllables, and when your boots find the eastern bank the relief arrives with a strange gift inside it: the knowledge that you just trusted your one life, entirely, to her — and that she took the weight like it was nothing at all.");
            AddToll(script, "ch3_toll_fight",
                "You fight him for it, because the island has not yet taught you everything, and this lesson enrolls you the hard way.",
                "It is fast and enormous and wrong — the lunge like the ground itself moving, the fire-hardened spear finding the one soft seam above the foreleg more by fate than skill, the tail-blow that takes your legs and opens your side on the mangrove roots. There is a white interval you never fully recover the order of. Then you are on the eastern bank, bleeding, alive, and six meters of affronted antiquity is withdrawing into deep water with your spear standing in its shoulder like a flag it intends to keep.",
                "You have crossed. You are torn open and lighter one spear, and something tells you the ledger between you and the landlord now has a standing entry — but you have crossed, on your own terms, which were terrible terms, which were yours.");

            script.Add(new StoryScene
            {
                Id = "ch3_east",
                Text = s =>
                {
                    var t = new List<string>
                    {
                        "The eastern country opens from the first rise like a held breath released: fold on fold of green running down to a coast you've never seen, wilder than yours, wreck-strewn — and climbing the far light, unmistakable, <i>made</i>:",
                        "A mast. Steel, guyed, red-rusted, standing crooked above the canopy miles off — an antenna mast, the tallest human thing on the island, marking a compound of pale rooftops half-drowned in green.",
                        s.Is("LORE_HALCYON")
                            ? "Edda's station. <i>The</i> station — the one that drilled the singing rock and dug two graves under her flowering tree. Her whole warning stands in the air between you and it, and so does everything the place must still hold: tools, records, machines. A radio."
                            : "A station. Buildings, order, purpose — decades abandoned by the look of the mast's lean, and utterly out of place, like finding a filing cabinet in a cathedral. Who measured this island, and what did they find, and why did they stop?",
                    };
                    if (s.Is("IPO_KEY"))
                        t.Add("In your pocket, the flat steel key from Ipo's hoard seems suddenly heavier: <i>HALCYON — E WING</i>.");
                    t.Add("The light is going. You mark the bearing, build a dry camp on the high ground, and sit a long time watching the mast rust against the sunset, tomorrow already knocking.");
                    return t;
                },
                Next = "ch3_end",
                NextLabel = "Chapter Three ends ➤",
            });
            script.Add(new StoryScene
            {
                Id = "ch3_end_stay",
                Text = _ => new List<string>
                {
                    "You look at the tea-dark water a long time, and then you turn around.",
                    "Not defeat — <i>policy</i>. The east has waited fifty years; it will wait for a better-provisioned, better-informed, better-armed version of you. Live castaways get to change their minds. Drowned ones file no appeals.",
                    "The walk home is long, and the mast you never saw stands in your imagination taller than any real one could — but your fire, when you reach it, is your fire, and the west half of an island is still an island.",
                    "Old Grin keeps his toll, uncollected. The east keeps its answers. Everyone's patience, on this island, is very long.",
                },
                Next = "ch3_end",
                NextLabel = "Chapter Three ends ➤",
            });
            script.Add(new StoryScene
            {
                Id = "ch3_end",
                Text = s =>
                {
                    var t = new List<string>
                    {
                        "<i>END OF CHAPTER THREE — THE GREEN DEEP</i>",
                        "The Ledger fills another page. These weeks, as the island will remember them:",
                    };
                    t.Add("— Edda Voss: " + (s.Edda >= 60
                        ? "the fence is open, the tea is poured without asking, and the teaching has begun in earnest. Sixty years of island, cracking open for you."
                        : s.Edda >= 35
                            ? "probation continues, but she feeds you while insulting you now, which you've learned to bank as affection."
                            : s.Is("EDDA_MET")
                                ? "wary, watchful, unconvinced. She has buried better-prepared castaways than you."
                                : "still a thread of smoke on a mountain you haven't climbed."));
                    if (s.Is("EDDA_GRAVES"))
                        t.Add("— You know about Ilsa now. And Aleksander. Two mounds under a flowering tree, and the shape of what staying sixty years actually costs.");
                    if (s.Is("LORE_HALCYON"))
                        t.Add("— She told you about the station. About the drilling, and the answer, and the graves. The east half of this island has a wound in it with a roof over it.");
                    t.Add("— The Silverthread " + (s.Is("RIVER_KNOWN")
                        ? "runs through your daily life now. The water problem, that old tyrant, is dead."
                        : "still runs unfound in the mountain's shadow."));
                    if (s.Disease == "fever")
                        t.Add("— ⚠️ The marsh fever is still in your blood, and it is not idling. Edda's bark or a medic's discipline — soon.");
                    else if (s.Is("FEVER_STRUCK"))
                        t.Add("— You caught the marsh fever, and you beat it. The fringe's dusk tax has been renegotiated.");
                    t.Add("— The Boar King: " + (s.Is("KING_TITHED")
                        ? "the treaty holds. He inspected your boundary like a magistrate and touched nothing. Rent, it turns out, is a language."
                        : s.Is("KING_SYMPATHY")
                            ? "you found the wallow, the industrial snare-wire, the small skulls. Your monster is a veteran of someone else's war."
                            : s.Is("KING_WALLED")
                                ? "he tested your wall once, at dawn, and your wall won. The treaty is the wall itself."
                                : "still unfinished business, circling."));
                    t.Add("— And Old Grin's Toll: " + (s.Is("GRIN_BAITED")
                        ? "paid in smoked meat, crossed in cold blood. Business is business."
                        : s.Is("GRIN_TIMED")
                            ? "dodged entirely — you crossed at the dawn window while the cold held him. The swamp respects homework."
                            : s.Is("GRIN_STANDOFF")
                                ? "faced down, side by side with Kavi, at a walk. Never once prey."
                                : s.Is("GRIN_MAPPED")
                                ? "never owed — Nine walked you through the back door of his kingdom."
                                : s.Is("GRIN_DISTRACTED")
                                ? "paid by Ipo, in the single greatest performance of his career. He will never let you forget it."
                                : s.Is("GRIN_CONVOY")
                                    ? "declined — Buri made the meal too expensive. One unnecessary victory scream was screamed."
                                    : s.Is("GRIN_OVERWATCH")
                                        ? "crossed on Vela's syllables alone. You bet your life on her word and she took the weight."
                                        : s.Is("GRIN_FOUGHT")
                                            ? "paid in blood — some his, more yours. You crossed on your own terrible terms, and the ledger between you has a standing entry now."
                                            : "refused. The east keeps its answers, and the landlord keeps his channel. For now."));
                    if (s.Is("EAST_OPEN"))
                        t.Add("— The east is open. A rusted mast stands above the far canopy, and under it, everything Halcyon left behind."
                            + (s.Is("IPO_KEY") ? " The key in your pocket says E WING." : ""));
                    t.Add($"Route leanings — Signal {s.Route.Signal} · Roots {s.Route.Roots} · Depth {s.Route.Depth}. Nothing is decided. Everything is remembered.");
                    return t;
                },
                Next = "ch4_open",
                NextLabel = "Continue — Chapter Four: The Hum ➤",
            });
        }

        static void AddToll(StoryScript script, string id, params string[] paragraphs)
        {
            var text = new List<string>(paragraphs);
            script.Add(new StoryScene
            {
                Id = id,
                Text = _ => text,
                Next = "ch3_east",
                NextLabel = "The east opens ➤",
            });
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
                Text = s => new List<string>
                {
                    "You hear it before you see it — a sound your body identifies faster than your mind, older than either: <i>running water</i>. Real, cold, moving water.",
                    "The Silverthread comes down out of the mountain's shadow through a green ravine, wide as a road, clear as glass over amber stones. Fish hang in the current like held breath. The banks are cut clay, grey and thick. Upstream, the water sounds bigger — falls, somewhere up in the folded country.",
                    s.Companion == "nine"
                        ? "Fresh water is not Nine's country and she isn't here — but you find her mark anyway: at the river mouth where salt meets sweet, arranged on a flat stone above the tideline, a neat pile of freshwater mussel shells. Pointed upstream. She has known about this river the whole time, and has apparently been waiting, with some exasperation, for you to find the front door."
                        : "You drink like a horse, laugh at nothing, and drink again. The daily arithmetic of coconuts and rain-catch — the tax your every plan has paid since Day 1 — just fell over dead.",
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
                        : s.Companion == "buri"
                            ? "Then her eyes find Buri, asleep against your leg, and she snorts. \"The tide brings me a castaway with a <i>pig</i>. Fatten it through monsoon and it'll winter you better than a smokehouse.\" You decide not to translate for Buri."
                            : s.Companion == "moa"
                                ? "Then her eyes find Moa, riding your basket like copper cargo, and something happens to the old face that it clearly wasn't warned about — a softening, quickly arrested. \"…You keep fowl,\" she says, in an entirely different voice, and pours Moa a saucer of water like it's nothing at all."
                                : s.Companion == "vela"
                                    ? "Then a shadow crosses the grove — Vela, wheeling once overhead, checking — and Edda tracks her with genuine respect. \"The old sea eagle. Blind-eyed. She's buried two mates and raised nine broods off Kestrel Cliffs. If she's keeping accounts with you, mind you stay solvent.\""
                                    : s.Companion == "ipo"
                                        ? "Then her eyes find Ipo, who is halfway into her seed basket, and the temperature drops forty degrees. \"And <i>that</i>,\" she says, with feeling, \"stays outside the fence, or I shoot it and we both pretend I didn't enjoy it.\""
                                        : s.Companion == "nine"
                                            ? "Then you mention — carefully, testing — what lives in your tide pools and works your reef, and Edda Voss puts down her cup. \"Sixty years,\" she says slowly, \"I have waited for one of them to pick a person. Describe her. Slowly. Leave nothing out.\""
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
