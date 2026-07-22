using System.Collections.Generic;

namespace Tidebound.Narrative
{
    /// <summary>
    /// Chapter Four — The Hum (days 36–52): the chapter turn under a
    /// monsoon warning, Edda's escort across the ford for toll-refusers
    /// (or the west locked by choice), Station Halcyon's arrival, and the
    /// station itself — one building per expedition: the interrupted mess,
    /// Dr. Vane's rationed journals, the radio room's list, the E wing and
    /// what it kept, fuel, cable, and the staged radio. Ported from
    /// scenes-chapter4.js; effects pinned by Chapter4Tests. V1 adaptations
    /// per precedent: no hard clock reset (the calendar stands at day 36
    /// after ch3), VN mid-dialogue tickSegment folded into the expedition's
    /// labor charge, kavi/solo texts live now (other companions with Phase
    /// 7), and the buri door-breach waits for Buri.
    /// </summary>
    public static class Chapter4Events
    {
        static bool RadioReady(GameState s) =>
            s.Is("RADIO_SURVEYED") && s.Is("TRANSMITTER") && s.Is("WIRE") && s.Is("FUEL");

        public static void AddTo(StoryScript script)
        {
            AddOpen(script);
            AddArrive(script);
            AddStation(script);
            AddRecorder(script);
            AddWestWreck(script);
            AddRyo(script);
            AddCompanionBeat(script);
            AddPulse2(script);
            AddThreshold(script);
            AddRyoActions(script);
        }

        // ---- the sailor by your fire (the VN's ch4 hub actions) ---------------
        static void AddRyoActions(StoryScript script)
        {
            script.Add(new StoryScene
            {
                Id = "ryo_tend",
                Speaker = "Ryo Nakata",
                OnEnter = s =>
                {
                    s.Ryo = s.Ryo + 7 > 100 ? 100 : s.Ryo + 7;
                    s.Stat(Meter.Hunger, -4);
                    s.Stat(Meter.Hope, 2);
                },
                Text = s => new List<string>
                {
                    s.Ryo >= 40
                        ? "Today he makes it to sitting, then to standing, then — against direct orders — to the waterline, where he stands swaying like a mast in a swell, looking at the sea that nearly kept him. \"Right,\" he says, color coming back over three long breaths. \"Right. So. Introductions: Ryo Nakata, late of the sloop <i>Kingfisher</i>, currently of your fire pit. I owe you a life. I pay debts in boat-work and terrible cooking.\""
                        : "He drifts in and out, and talks in both states — fragments of course headings, an argument with someone named for a bird, and once, clearly, with total conviction: \"the compass didn't break, the compass was <i>answered</i>.\" You change the dressings and keep the water coming. He's knitting. Slowly.",
                },
            });
            script.Add(new StoryScene
            {
                Id = "ryo_boat",
                Speaker = "Ryo Nakata",
                OnEnter = s =>
                {
                    s.Ryo = s.Ryo + 3 > 100 ? 100 : s.Ryo + 3;
                    s.Stat(Meter.Energy, -8);
                    s.AddRoute(RouteAxis.Signal, 2);
                    s.SetFlag("BOAT_WORKED");
                    if (!s.Is("BOAT1")) s.SetFlag("BOAT1");
                    else if (!s.Is("BOAT2")) s.SetFlag("BOAT2");
                    else s.SetFlag("BOAT3");
                },
                Text = s =>
                {
                    if (s.Is("BOAT1") && !s.Is("BOAT2"))
                        return new List<string>
                        {
                            "The Kingfisher lies canted on the sand above the tideline where the sea spat her out — mast snapped a meter up, hull stove along two strakes, rudder gone. Ryo walks her like a surgeon rounding on family. \"She'll swim,\" he says at last, hand flat on the hull. \"Not soon. Not cheap. But she'll swim.\" You start with the mud, the weed, and the list: timber, pitch, cordage, canvas, luck.",
                        };
                    if (s.Is("BOAT2") && !s.Is("BOAT3"))
                        return new List<string>
                        {
                            "Strake by strake, the hull closes. Ryo works and talks — the circumnavigation that was supposed to fix his life, the marriage it cost before it started, the night the compass spun and the radio filled with a sound \"like a choir underwater — you know it, I've seen you know it.\" You know it.",
                            "He's Signal to the bone, your sailor: every plank he fits is aimed at the horizon. He assumes — kindly, completely — that you're coming. You notice yourself not answering.",
                        };
                    return new List<string>
                    {
                        "The Kingfisher looks like a boat again. Patched, graceless, mast fished with island hardwood and half her canvas — but a boat, above the tideline, pointed at the sea like a held argument.",
                        "\"Monsoon first,\" Ryo says, reading the southern sky the way Edda reads it. \"Nobody sane crosses in what's coming. But after — first fair season after —\" he doesn't finish. He looks at you instead, the question standing between you, patient as the boat.",
                    };
                },
            });
        }

        // ---- day 52: VANE'S QUESTION / THE VIGIL -----------------------------
        static void AddThreshold(StoryScript script)
        {
            script.Add(new StoryScene
            {
                Id = "ch4_threshold",
                Text = s => new List<string>
                {
                    "<i>VANE'S QUESTION</i>",
                    "Day fifty-two. You come back to the small ordered office one more time"
                        + (s.Is("DRAWER_KNOWN") ? "" : " — and this time, kneeling to steady yourself against the desk, you find what your earlier visits missed: a steel bottom drawer, locked, labeled in a firm hand gone brown with age: <i>\"If found: burn unread. — I.V.\"</i>")
                        + ", because the drawer has been standing in the corner of your mind for days like a held note.",
                    "You know what's in it. Not the details — the <i>shape</i>: the torn pages. The Incident. What the drill did and what answered it; what stopped the island's heart for nine hours in March 1979 and dug two graves under Edda's flowering tree. The one chapter of this place's story that its own chronicler decided no one should read.",
                    "She asked. In her own hand, knowing she'd likely be dead when it was found, she <i>asked</i>.",
                    "The lock is fifty years old and your pry-bar is right there. So is the station's fire barrel. So is the long path up a mountain to a woman who was there.",
                },
                Choices = new List<StoryChoice>
                {
                    new StoryChoice
                    {
                        Label = "Open it. The island's heart is skipping — you need what she knew.",
                        Sub = "Her wishes against your survival, and the survival of whatever's coming. Depth calls.",
                        Do = s => { s.SetFlag("INCIDENT_FILES"); s.AddRoute(RouteAxis.Depth, 3); s.SetFlag("CH4_DONE"); },
                        Go = "ch4_opened",
                    },
                    new StoryChoice
                    {
                        Label = "Burn it unread. She earned the last word on her own work.",
                        Sub = "Some locks are the only honest warning you get. Let the dead keep their door.",
                        Do = s => { s.SetFlag("FILES_BURNED"); s.Stat(Meter.Hope, 5); s.AddRoute(RouteAxis.Roots, 1); s.SetFlag("CH4_DONE"); },
                        Go = "ch4_burned",
                    },
                    new StoryChoice
                    {
                        Label = "Carry it up the mountain, unopened, to the one person with the right to choose.",
                        Sub = "Not your door. Not your dead. Edda was there.",
                        Do = s =>
                        {
                            s.SetFlag("FILES_TO_EDDA");
                            s.Edda = s.Edda + 8 > 100 ? 100 : s.Edda + 8;
                            s.AddRoute(RouteAxis.Depth, 1);
                            s.AddRoute(RouteAxis.Roots, 1);
                            s.SetFlag("CH4_DONE");
                        },
                        Go = "ch4_carried",
                    },
                },
            });

            script.Add(new StoryScene
            {
                Id = "ch4_opened",
                OnEnter = s => s.SetFlag("GULLET_MAP"),
                Text = _ => new List<string>
                {
                    "The lock was fifty years old. The pry-bar is not. You read it all by lamplight, cross-legged on her office floor, and Dr. Ilsa Vane — dead before your parents met — talks to you for three hours in a hand that degrades, page by page, from architecture into scrawl.",
                    "The drill reached the resonant stratum on the 9th of March, 1979, at a site up the mountain's eastern flank — <i>her map is here</i>, folded, exact: the service road, the bore site, and below it, hatched in urgent pencil, a cave system she names only \"the throat.\" The core came up at 04:11. The Hum stopped at 04:11. Nine hours of silence — her own log of those hours is the scrawl: instruments dead, the sea \"wrong,\" birds rafting offshore in their thousands, and every person at the station reporting the same pressure behind the sternum, \"like a word being withheld.\"",
                    "At 13:06 the Hum resumed, changed. The bore site did not resume anything: the throat flooded — tidal, violent, impossible by her own hydrology — and it took Ostrander and Kim, and it was three days before the sea gave them back.",
                    "Her last full page, in architecture again, deliberate: <i>\"Conclusion, for whoever ignored my drawer: the system is not a resonance. It is a HOMEOSTASIS. It regulates — I no longer speculate as to what. We put a hole in it, and it closed the hole with my colleagues inside, and then it went back to its work, which was never about us. Do not touch the throat. Tend the skin. If it ever begins skipping — I hope no one is here to read what that means. — I.V.\"</i>",
                    "You sit a long time with the map on your knees and the lamp burning down, in the office of a woman who hoped you'd never exist. The island's pulse, out beyond the walls, runs its seven beats. Skips. Resumes.",
                },
                Next = "ch4_end",
                NextLabel = "Chapter Four ends ➤",
            });
            script.Add(new StoryScene
            {
                Id = "ch4_burned",
                Text = _ => new List<string>
                {
                    "You carry the drawer out whole and burn it in the station's rusted fire barrel at dusk, unopened, standing witness the way you'd stand at a graveside — because that's what it is.",
                    "It takes an hour to become ash, and you spend the hour arguing with yourself and losing on both sides, which is how you know the choice was real: everything in that steel might have been the answer to the skipping pulse, the coming season, the whole gathering weight — and it was hers, and she asked, and the asking was the last thing on this island she was able to do.",
                    "The flames catch the folder-edges and for one moment — you will never be sure — a fold of paper opens in the updraft and shows you a single line of her architecture before it blackens: <i>\"…tend the skin…\"</i>",
                    "You walk home along the glowing lagoon with the words for company. Whatever the island needs from you, you'll learn it the way she'd have preferred: from the island.",
                },
                Next = "ch4_end",
                NextLabel = "Chapter Four ends ➤",
            });
            script.Add(new StoryScene
            {
                Id = "ch4_carried",
                Speaker = "Edda Voss",
                Text = _ => new List<string>
                {
                    "You carry the steel drawer up the mountain unopened — a full day, the weight of it stupid and correct on your back — and set it on Edda's table without one word, label upward.",
                    "She looks at it for a long time. Sixty years pass over the old face in no particular order.",
                    "\"You found her drawer,\" she says finally. \"You read her label. And you carried it up my mountain — <i>unopened</i> — to a woman you've known three weeks.\" She sits down slowly across from it, and does something you have never seen and will never see again: takes off her competence, entirely, like a coat. \"Ilsa wrote that label expecting strangers. She didn't plan for there being anyone left who loved her.\"",
                    "She rests her hand flat on the steel. \"I know what's in it. I helped live it. When the monsoon's down on us and there's fire enough and tea enough — come up the mountain, castaway. We'll open it together, and I'll tell you what the pages don't say. You've earned the parts I have to say out loud.\"",
                    "The walk home is dark and long and you don't mind one step of it.",
                },
                Next = "ch4_end",
                NextLabel = "Chapter Four ends ➤",
            });

            script.Add(new StoryScene
            {
                Id = "ch4_threshold_west",
                Text = s => new List<string>
                {
                    "<i>THE VIGIL</i>",
                    "Day fifty-two. The monsoon wall stands in the south like a verdict being drafted, and your west-side kingdom is as ready as hands can make it: stores deep, walls braced, water solved"
                        + (s.Is("RYO_MET") ? ", a mending sailor by your fire with a boat above the tideline" : "") + ".",
                    "What you don't have is the east: the station, its tools, its answers — the road not crossed. The season about to close will decide more than weather: it decides what kind of castaway comes out the other side of it.",
                    "You give the last clear evening to the choice.",
                },
                Choices = new List<StoryChoice>
                {
                    new StoryChoice
                    {
                        Label = "The sea. Boat, raft, signal — everything bends toward leaving.",
                        Sub = "Commit the season to the horizon.",
                        Do = s => { s.SetFlag("WEST_PLAN_SEA"); s.AddRoute(RouteAxis.Signal, 3); s.SetFlag("CH4_DONE"); },
                        Go = "ch4_end",
                    },
                    new StoryChoice
                    {
                        Label = "The ground. This is home now; build like you mean it.",
                        Sub = "Commit the season to the roots.",
                        Do = s => { s.SetFlag("WEST_PLAN_HOME"); s.AddRoute(RouteAxis.Roots, 3); s.SetFlag("CH4_DONE"); },
                        Go = "ch4_end",
                    },
                    new StoryChoice
                    {
                        Label = "Admit it: the east has been in your dreams all week. Cross when the weather allows.",
                        Sub = "Edda's dawn-window offer stands. Late is not never.",
                        Do = s => { s.SetFlag("WEST_PLAN_EAST"); s.AddRoute(RouteAxis.Depth, 2); s.SetFlag("CH4_DONE"); },
                        Go = "ch4_end",
                    },
                },
            });

            script.Add(new StoryScene
            {
                Id = "ch4_end",
                Text = s =>
                {
                    var t = new List<string>
                    {
                        "<i>END OF CHAPTER FOUR — THE HUM</i>",
                        "The Ledger's pages are filling faster now. Days thirty-six through fifty-two:",
                    };
                    if (s.Is("STATION_OPENED"))
                    {
                        t.Add("— Station Halcyon stands open: the interrupted breakfast, the stores"
                            + (s.Is("E_WING_OPEN")
                                ? ", and the E wing — the crated transmitter, and the seventh rack, and stone that holds your reflection a half-beat late"
                                : ", and an E-wing door still keeping the station's one locked thought") + ".");
                        var parts = new List<string>();
                        if (s.Is("TRANSMITTER")) parts.Add("transmitter");
                        if (s.Is("WIRE")) parts.Add("cable");
                        if (s.Is("FUEL")) parts.Add("fuel");
                        t.Add("— The radio: " + (s.Is("RADIO_STAGED")
                            ? "staged and one day's assembly from a voice. The monsoon will decide when that day comes."
                            : parts.Count > 0
                                ? string.Join(", ", parts) + " in hand — the list is " + (parts.Count == 3 ? "finished, awaiting assembly." : "still open.")
                                : "a surveyed ruin with good bones and an empty list."));
                        t.Add("— Vane's journals: " + (s.Is("VANE_J3")
                            ? "read to the torn pages. The drill, the objection overruled, and a locked drawer labeled in her hand."
                            : s.Is("VANE_J1")
                                ? "begun — a mind meeting its one great question."
                                : "still squared to the blotter, waiting."));
                        if (s.Is("RECORDER"))
                            t.Add("— The chart recorder gave the Hum a body: decades of steady teeth, one nine-hour flatline in March 1979 — and now, in your own nights, the skipping has begun again.");
                    }
                    else
                    {
                        t.Add("— You kept the west, and made it a kingdom: " + (s.Is("WEST_PLAN_SEA")
                            ? "aimed, plank by plank, at the horizon."
                            : s.Is("WEST_PLAN_HOME")
                                ? "built, post by post, into a home."
                                : "with your eyes, at last, turning east."));
                        if (s.Is("WRECK_DRIFT"))
                            t.Add("— The sea sent you a broken boat's bones, fresh-painted, and the arithmetic that came with them.");
                    }
                    if (s.Is("RYO_MET"))
                        t.Add("— Ryo Nakata, late of the sloop Kingfisher, sleeps by your fire. Two castaways now"
                            + (s.Ryo >= 40
                                ? ", and a boat above the tideline being argued back toward the sea."
                                : ". He owes you a life and has announced his currencies: boat-work and terrible cooking."));
                    else
                        t.Add("— A jet crossed your sky seven miles up, straight as a ruled line, and taught you the size of the silence you live in.");
                    if (s.Is("COMP4_DONE") && s.Companion == "kavi")
                        t.Add("— Kavi's station gift: a warning, filed by nose, about what sleeps under the E wing.");
                    t.Add("— And Vane's Question: " + (s.Is("INCIDENT_FILES")
                        ? "you opened her drawer. The Incident has a shape now — the bore site, the throat, the nine silent hours, and her last instruction: <i>tend the skin.</i> Her map is in your kit."
                        : s.Is("FILES_BURNED")
                            ? "you burned it unread, standing witness, and one line escaped in the updraft: <i>tend the skin.</i> The dead keep their door; you keep the words."
                            : s.Is("FILES_TO_EDDA")
                                ? "you carried the drawer up the mountain unopened, and watched sixty years take its coat off. When the rains are down, you'll open it together."
                                : "deferred — the drawer keeps, and the season won't."));
                    t.Add($"Route leanings — Signal {s.Route.Signal} · Roots {s.Route.Roots} · Depth {s.Route.Depth}. Nothing is decided. Everything is remembered.");
                    t.Add("<i>Chapter Five: The Long Rain — in development. The island continues; so can you.</i>");
                    return t;
                },
                NextLabel = "Back to the island",
            });
        }

        // ---- day 38, dusk: the chart recorder ---------------------------------
        static void AddRecorder(StoryScript script)
        {
            script.Add(new StoryScene
            {
                Id = "ev4_recorder",
                OnEnter = s =>
                {
                    if (s.Is("RECORDER")) return;
                    s.SetFlag("RECORDER");
                    s.AddRoute(RouteAxis.Depth, 2);
                },
                Text = _ => new List<string>
                {
                    "In the lab block, under a dust sheet that comes away like a held breath, you find the station's patient heart: a chart recorder — clockwork-driven, mains-free, built in an age that trusted springs — and a cabinet of its paper drums, decades of them, filed by year.",
                    "You wind it, because you have to know. It ticks. It <i>draws</i>: a fine inked needle laying down, in real time, the thing you've slept against for twenty nights — rise, rise, rise, seven teeth to the wave, then the rest. The Hum, made visible. The island's pulse on paper.",
                    "Then you pull the old drums, and the cabinet stops being an instrument and becomes an archive of a heartbeat: 1969, steady. 1973, steady. 1978, steady, page after page, teeth after teeth—",
                    "—and the drum for March 1979 has a gap in it. Not a fault. A <i>silence</i>: the needle drops flat mid-page and stays flat for nine hours, and when the pulse resumes, its shape is changed — a new harmonic riding the seventh beat that every drum before lacks and every night since (you check your own memory of the lagoon, and your skin prickles) has carried.",
                    "Something happened in March 1979 that stopped the island's heart for nine hours. And you have slept, every night since the crash, against the scar in the rhythm.",
                },
            });
        }

        // ---- day 38, dusk (west variant): the sea sends wreckage --------------
        static void AddWestWreck(StoryScript script)
        {
            script.Add(new StoryScene
            {
                Id = "ev4_west_wreck",
                OnEnter = s =>
                {
                    if (s.Is("WRECK_DRIFT")) return;
                    s.SetFlag("WRECK_DRIFT");
                    s.AddRoute(RouteAxis.Signal, 1);
                    s.SetFlag("WIRE"); // rigging wire — the west's answer to the cable sweep
                },
                Text = _ => new List<string>
                {
                    "The turning season's first gift arrives on the morning tide: wreckage — fresh wreckage, pale unweathered timber, a shattered transom board with paint still glossy in the grain, half a nameplate: <i>—NGFISHER</i>.",
                    "A boat broke up out there, and not long ago. You walk the tideline for an hour collecting what the sea deals out: good planks, a tangle of rigging wire, a sea-anchor, one deck shoe.",
                    "You stack the salvage above the tideline and stand a while looking at the horizon that sent it, doing the arithmetic you can't not do: somewhere out there, recently, was a sailor.",
                },
            });
        }

        // ---- day 40: the sail out of the southern haze ------------------------
        static void AddRyo(StoryScript script)
        {
            script.Add(new StoryScene
            {
                Id = "ev4_ryo",
                Speaker = "Ryo Nakata",
                Text = _ => new List<string>
                {
                    "The sail comes out of the southern haze mid-morning — wrong, everything about it wrong: canvas half-down and dragging, hull low, a course that isn't a course but a long helpless curve committed to the current. Drawn, you realize with a cold clarity, exactly the way your plane was drawn. The island is reeling something in again.",
                    "She takes the outer reef with a crack you feel in your teeth, lurches, and comes over it on the surge — a small sloop, dismasted at the spreaders, and a figure in her cockpit slumped over the tiller, moving just enough to be alive.",
                    "You go into the lagoon after her. Of course you do. The last thirty meters you swim, and haul yourself over her counter into ankle-deep water and wreckage, and the sailor — sun-flayed, salt-crusted, a week past his last full water ration by the cracked look of him — opens one eye and takes you in: the castaway beard, the island behind you, the whole impossible fact of a human being.",
                    "\"…Huh,\" he manages, in a voice like a dry hinge. \"The chart said... there's no island here.\"",
                    "\"The chart's wrong about a lot,\" you say, and get your shoulder under him.",
                },
                Choices = new List<StoryChoice>
                {
                    new StoryChoice
                    {
                        Label = "Camp, water, and triage — everything you have, all at once.",
                        Sub = "He's badly dehydrated and worse-burned. Spend the day on him.",
                        Do = s =>
                        {
                            s.SetFlag("RYO_MET");
                            s.Ryo = 20 + (s.Is("BG_MEDIC") ? 12 : 0);
                            s.Stat(Meter.Energy, -10);
                            s.Stat(Meter.Hope, 6);
                            s.AddRoute(RouteAxis.Signal, 1);
                        },
                        Go = "ev4_ryo2",
                    },
                    new StoryChoice
                    {
                        Label = "Stabilize him — but strip and secure the boat before the tide takes it back.",
                        Sub = "Cold arithmetic: the sailor keeps; the salvage might not.",
                        Do = s =>
                        {
                            s.SetFlag("RYO_MET");
                            s.SetFlag("KINGFISHER_STRIPPED");
                            s.Ryo = 12;
                            s.Food += 1;
                            s.AddItem("rations", 2);
                            s.AddRoute(RouteAxis.Signal, 2);
                            s.Stat(Meter.Energy, -12);
                        },
                        Go = "ev4_ryo2",
                    },
                },
            });
            script.Add(new StoryScene
            {
                Id = "ev4_ryo2",
                Speaker = "Ryo Nakata",
                Text = s => new List<string>
                {
                    s.Ryo >= 20
                        ? "You spend the day the generous way: shade, water in sips on a schedule, salve for the burns, broth at dusk. By firelight he surfaces long enough to hold the mug himself and take a slow inventory — the camp, the fire, "
                            + (s.Companion == "kavi" ? "Kavi (whom he regards with frank delight: \"oh, <i>excellent</i>, I've died and it's weird\")" : "your tidy solitary kingdom")
                            + " — and something in the wrecked sunburnt face relaxes past gratitude into simple wonder."
                        : "You do the triage cold and fast — water, shade, wounds — and then leave him sleeping to fight the tide for his boat, and the tide makes you pay for every plank and tin of it. By the time the Kingfisher is stripped and her hulk dragged above the high-water line, it's dusk, you're wrung out, and your patient is awake, watching you stack his life's salvage by firelight with an expression you can't fully read.",
                    "\"Ryo,\" he rasps, eventually, by way of everything. \"Nakata. That was — <i>is</i> — the Kingfisher. We were going around the world, her and me.\" A long pause, the fire ticking. \"The compass spun three days ago. Radio drowned in a sound like — like a choir, underwater. And then there was an island where no island is.\" His eyes find yours, and the question in them is the first entirely sane thing he's said: \"You too?\"",
                    "\"Me too,\" you say, and his laugh — cracked, exhausted, real — is the first human laugh you've heard since the sky broke, and it does something to your chest you weren't ready for.",
                    "<i>There are two castaways on Vessakai now.</i>",
                },
            });
            script.Add(new StoryScene
            {
                Id = "ev4_noryo",
                Text = _ => new List<string>
                {
                    "Mid-morning, a sound you'd stopped listening for: engines. High, faint, real — a contrail hardening out of the blue, a passenger jet crossing the island's sky seven miles up, straight as a ruled line, utterly indifferent.",
                    "You stand with your neck craned in the middle of your SOS — your beautiful, huge, invisible-from-seven-miles SOS — and watch three hundred sleeping people cross your sky at ruinous speed, and the contrail's dissolve feels like a door drawn shut with great gentleness.",
                    "The island's field bends instruments, Edda says. Whatever corridors the world flies, they thread past this place like water past a stone. Nobody up there is looking down. Nobody down here is on the charts.",
                },
                Choices = new List<StoryChoice>
                {
                    new StoryChoice
                    {
                        Label = "Let it hurt, then bank it as fuel.",
                        Sub = "Every plank, every signal, every plan — aimed at that corridor.",
                        Do = s => { s.Stat(Meter.Hope, -4); s.AddRoute(RouteAxis.Signal, 2); },
                    },
                    new StoryChoice
                    {
                        Label = "Watch it go, and notice: you didn't reach for the flare thought first.",
                        Sub = "The island under your feet felt — present. That's new.",
                        Do = s => { s.Stat(Meter.Hope, 2); s.AddRoute(RouteAxis.Roots, 2); },
                    },
                },
            });
        }

        // ---- day 44, dusk: the companion's station beat -----------------------
        static void AddCompanionBeat(StoryScript script)
        {
            script.Add(new StoryScene
            {
                Id = "ev4_companion",
                Speaker = "Kavi",
                OnEnter = s =>
                {
                    if (s.Is("COMP4_DONE")) return;
                    s.SetFlag("COMP4_DONE");
                    s.Bond(4);
                    if (s.Companion == "kavi") { s.SetFlag("KAVI_WARNING"); s.AddRoute(RouteAxis.Depth, 1); }
                },
                Text = _ => new List<string>
                {
                    "Kavi has kept his stiff-legged truce with the compound for days — but today, at the E wing's corner, he stops and will not be moved. Not at the door: at the <i>foundation</i>, where a hairline crack runs down into earth, and out of it, faint past your senses, comes whatever he has been smelling since the first hour.",
                    "He looks from the crack to you — the long, grave, weighing look — and then deliberately, unmistakably, he steps between you and it. Whatever is under this station, in the rock the drill touched: his nose files it with fire, floods, and the Boar King. <i>Things that end packs.</i>",
                },
            });
        }

        // ---- day 47, night: the pulse, again ----------------------------------
        static void AddPulse2(StoryScript script)
        {
            script.Add(new StoryScene
            {
                Id = "ev4_pulse2",
                OnEnter = s =>
                {
                    if (s.Is("PULSE2")) return;
                    s.SetFlag("PULSE2");
                    s.AddRoute(RouteAxis.Depth, 2);
                },
                Text = s => new List<string>
                {
                    "It happens twice tonight.",
                    "You're awake for both — you've started half-listening in your sleep, the way you once listened for a phone — and there is no mistaking it now: the lagoon runs its seven beats, drops the seventh, holds a black beat too long, and resumes. And then, an hour before dawn, again.",
                    s.Is("RECORDER")
                        ? "In the morning you cross to the station without eating and pull the night's drum off the chart recorder, and there it is in patient ink, twice: the needle's held flatline — longer, both times, than the skip you found from three nights ago. You set the drum beside March 1979's and the comparison closes your throat: the same signature. Smaller, but the same. Whatever stopped the island's heart for nine hours that year is <i>clearing its throat</i>."
                        : "You lie awake till dawn with your hand flat on the sand, feeling for a pulse the way you would at a bedside, telling yourself islands do not have arrhythmias, and knowing — with the animal certainty this place has been teaching you since Day 1 — that something, somewhere under the mountain, is changing its mind.",
                    "The monsoon wall stands higher in the south every day. Whatever season is coming, it isn't only weather.",
                },
            });
        }

        // ---- day 36: the chapter turn ----------------------------------------
        static void AddOpen(StoryScript script)
        {
            script.Add(new StoryScene
            {
                Id = "ch4_open",
                OnEnter = s => { if (s.Chapter < 4) s.Chapter = 4; },
                Text = _ => new List<string>
                {
                    "<i>CHAPTER FOUR — THE HUM</i>",
                    "Day thirty-six. The air has changed. You noticed it first at dawn — a heaviness riding in off the southern sea, a taste like coins — and Edda's word for it, delivered with a weather-eye and no comfort at all, was: <i>\"Monsoon's coming. Weeks, not months. Whatever you mean to do about that mast, castaway, the sky won't hold the door forever.\"</i>",
                },
                Choices = new List<StoryChoice>
                {
                    new StoryChoice
                    {
                        Label = "Begin ➤",
                        GoDynamic = s => s.Is("EAST_OPEN") ? "ch4_arrive" : "ch4_west_offer",
                    },
                },
            });
            script.Add(new StoryScene
            {
                Id = "ch4_west_offer",
                Speaker = "Edda Voss",
                Text = _ => new List<string>
                {
                    "She hears out your account of the mangrove ford — the channel, the landlord, the turning back — with the expression of a woman grading a paper that started well.",
                    "\"Sensible,\" she allows. \"And useless. Everything the next season of your life needs is east of that water — the station's tools, its tins, and its troubles, which you'll hear about when you've seen the place.\" She stands, takes up her walking staff and, after a moment's deliberation, the shotgun.",
                    "\"I've crossed that ford twice a year for sixty years. There's an hour at first light when the old devil is cold to his bones and fussy about work. Be at my fence at the wrong end of tomorrow's dawn and I'll walk you over like a school crossing.\" A pause, and the ghost of a grim smile. \"Or stay west and keep your whole skin. I've buried people I liked better for choices I respected less.\"",
                },
                Choices = new List<StoryChoice>
                {
                    new StoryChoice
                    {
                        Label = "Be at her fence before dawn.",
                        Sub = "Cross under sixty years of know-how.",
                        Do = s =>
                        {
                            s.SetFlag("GRIN_ESCORTED");
                            s.SetFlag("EAST_OPEN");
                            s.Edda = s.Edda + 5 > 100 ? 100 : s.Edda + 5;
                        },
                        Go = "ch4_escort",
                    },
                    new StoryChoice
                    {
                        Label = "Stay west. Whole skin, your fire, your horizon.",
                        Sub = "The station keeps. Your plans are here.",
                        Do = s =>
                        {
                            s.SetFlag("WEST_LOCKED");
                            s.AddRoute(RouteAxis.Roots, 1);
                        },
                        Go = "ch4_west_open",
                    },
                },
            });
            script.Add(new StoryScene
            {
                Id = "ch4_escort",
                Speaker = "Edda Voss",
                Text = _ => new List<string>
                {
                    "The crossing, with Edda Voss conducting, is almost insultingly uneventful.",
                    "She reads the water like a page — \"there; he's at the larder channel, hear the herons sulk\" — walks you into the ford at the cold hour at an unhurried march, and pauses mid-channel, thigh-deep, to point out a medicinal moss on a root as if the largest predator on the island were not eighty yards downstream digesting the dawn.",
                    "On the east bank she hands you a strip of dried fish like a schoolteacher paying out a sweet. \"There. Now you know the hour and the manner of it, and can stop being dramatic about a crocodile.\" Her face turns up the rise, toward where the mast leans against the sky, and closes like a door. \"The station's yours to pick over. I don't go past this bank anymore. Mind the E wing — and mind what you feel like doing, in there. The place has a way of making suggestions.\"",
                    "She is back across the water before the sun properly finds it.",
                },
                Next = "ch4_arrive",
                NextLabel = "Up the rise ➤",
            });
            script.Add(new StoryScene
            {
                Id = "ch4_west_open",
                Text = _ => new List<string>
                {
                    "West it is. You feel the decision settle — not defeat: <i>selection</i>. One coastline, one camp, one horizon, tended to a polish while the weather turns.",
                    "The mast will stand in your mind's east all season, rusting its questions. You've traded them for certainties you can hold: hull-wood, stores, the vigil. The island shrugs and deals to the hand you've kept.",
                },
                NextLabel = "To work ➤",
            });
        }

        // ---- the arrival ------------------------------------------------------
        static void AddArrive(StoryScript script)
        {
            script.Add(new StoryScene
            {
                Id = "ch4_arrive",
                OnEnter = s =>
                {
                    if (s.Is("STATION_OPENED")) return;
                    s.SetFlag("STATION_OPENED");
                    s.AddRoute(RouteAxis.Depth, 1);
                },
                Text = s => new List<string>
                {
                    "Station Halcyon, at the end of its swallowed service road, is a held breath fifty years long.",
                    "Six pale prefab buildings on concrete pads, roofs green with moss-load, arranged around a yard the jungle has reclaimed to knee height. The mast leans over it all, guys slack, red rust weeping down its lattice into the trees. A flagless pole. A generator shed with its door ajar exactly as wide as a person leaving in a hurry. And painted on the largest building, ghost-letters under fifty wet seasons: <i>HALCYON RESEARCH STATION — SITE 9</i>.",
                    "The mess hall's louvered windows hang open. Through them: a long table, chairs pushed back — <i>pushed back</i>, not tucked — crockery still at the places. Whatever ended this place ended it between one spoonful and the next.",
                    s.Companion == "kavi"
                        ? "At the yard's edge Kavi stops, nose working, and a ridge of fur stands along his spine from collar to tail. He comes with you — he chooses to, visibly — but he walks the whole compound stiff-legged, placing himself always between you and the low white building at the yard's far end. The one with the heavy door. The E wing."
                        : "You stand alone at the yard's edge a long moment, the way you've learned to at thresholds, and let the place finish saying its one long silent sentence before you interrupt.",
                    "<i>Station Halcyon is open to you now — an expedition costs part of a day, one building at a time.</i>",
                },
            });
        }

        // ---- the station: one building per expedition -------------------------
        static void AddStation(StoryScript script)
        {
            script.Add(new StoryScene
            {
                Id = "station",
                Text = s =>
                {
                    var t = new List<string>
                    {
                        "The yard receives you with its fifty-year quiet. The mast ticks in the wind overhead.",
                    };
                    var done = new List<string>();
                    if (s.Is("STATION_MESS")) done.Add("mess");
                    if (s.Is("VANE_J1")) done.Add("Vane's office begun");
                    if (s.Is("RADIO_SURVEYED")) done.Add("radio room surveyed");
                    if (s.Is("E_WING_OPEN")) done.Add("E wing opened");
                    if (s.Is("FUEL")) done.Add("fuel drained");
                    if (done.Count > 0)
                        t.Add("<i>Progress: " + string.Join(" · ", done)
                            + (RadioReady(s) ? " · 📻 all radio parts in hand" : "") + ".</i>");
                    t.Add("Where does today's daylight go?");
                    return t;
                },
                Choices = new List<StoryChoice>
                {
                    new StoryChoice
                    {
                        Label = "The mess hall",
                        Sub = "The interrupted breakfast. And fifty-year-old stores, some of which are immortal.",
                        When = s => !s.Is("STATION_MESS"),
                        Go = "station_mess",
                    },
                    new StoryChoice
                    {
                        Label = "Dr. Vane's office",
                        Sub = "The lead researcher's room. Her journals are still on the desk. You've been rationing them like water.",
                        When = s => !s.Is("VANE_J3"),
                        Go = "station_vane",
                    },
                    new StoryChoice
                    {
                        Label = "The radio room",
                        Sub = "The mast is standing. What's at the bottom of it?",
                        When = s => !s.Is("RADIO_SURVEYED"),
                        Go = "station_radio",
                    },
                    new StoryChoice
                    {
                        Label = "The E wing",
                        Sub = "The heavy door. Sealed, steel, and not asking to be opened.",
                        When = s => !s.Is("E_WING_OPEN") && s.EwingTry != s.Day,
                        Go = "station_ewing",
                    },
                    new StoryChoice
                    {
                        Label = "The generator shed",
                        Sub = "If anything still holds fuel, it's here.",
                        When = s => !s.Is("FUEL"),
                        Go = "station_fuel",
                    },
                    new StoryChoice
                    {
                        Label = "Salvage sweep for cable",
                        Sub = "The compound is veined with wire. Most is powder. Some isn't.",
                        When = s => !s.Is("WIRE"),
                        Go = "station_wire",
                    },
                    new StoryChoice
                    {
                        Label = "Stage the radio for assembly",
                        Sub = "Transmitter, cable, fuel: the list is finished. Set the room to rights.",
                        When = s => RadioReady(s) && !s.Is("RADIO_STAGED"),
                        Go = "station_stage",
                    },
                    new StoryChoice
                    {
                        Label = "Head home with the day's haul",
                        Sub = "The crossing doesn't improve after dark.",
                    },
                },
            });

            script.Add(new StoryScene
            {
                Id = "station_mess",
                OnEnter = s =>
                {
                    if (s.Is("STATION_MESS")) return;
                    s.SetFlag("STATION_MESS");
                    s.Food += 2;
                    s.Stat(Meter.Hunger, 15);
                    s.Stat(Meter.Hope, -2);
                },
                Text = _ => new List<string>
                {
                    "You make yourself walk the long table first, out of some respect you can't name: eight places, eight mugs, porridge fossilized in the bowls, a fork laid down mid-motion across a plate. A newspaper — Manila, March 1979 — folded to the crossword, three answers in. Nobody cleared breakfast. Nobody ever cleared breakfast.",
                    "The storeroom behind it is the real haul: swollen tins you leave, and sound ones you don't — sealed rice in wax-dipped drums, tinned fish with labels gone but seams true, salt, and a catering jar of honey, perfectly, eerily immortal. You pack out all your arms will carry and thank the dead in the doorway, quietly, because it feels owed.",
                },
            });

            script.Add(new StoryScene
            {
                Id = "station_vane",
                OnEnter = s =>
                {
                    s.AddRoute(RouteAxis.Depth, 1);
                    int stage = s.Is("VANE_J2") ? 3 : s.Is("VANE_J1") ? 2 : 1;
                    if (stage == 1) s.SetFlag("VANE_J1");
                    else if (stage == 2) s.SetFlag("VANE_J2");
                    else { s.SetFlag("VANE_J3"); s.SetFlag("DRAWER_KNOWN"); }
                },
                Text = s =>
                {
                    if (s.Is("VANE_J3"))
                        return new List<string>
                        {
                            "<i>\"Jan '79. They've sent the drill. Over my objection, over my resignation — tendered, refused, apparently I'm 'essential to continuity.' The committee wants a core of the resonant stratum. E wing is being fitted for the samples. Edda won't speak at meals. The island has been unusually quiet, which the junior staff find reassuring and I find like the pause a wave makes at the top of its arc.\"</i>",
                            "The next page — you turn to it with your pulse in your ears — is torn out. The stubs of five more torn pages follow. Then nothing but blank paper to the endboard.",
                            "And below the desk, catching your knee as you stand: the bottom drawer. Steel. Locked. Labeled in her hand, in letters gone brown:",
                            "<i>\"If found: burn unread. — I.V.\"</i>",
                        };
                    if (s.Is("VANE_J2"))
                        return new List<string>
                        {
                            "<i>\"Sept '74. Six years of data and the shape of it frightens me, quietly, at night. The field is not geological noise. It is COHERENT. It couples to the tides — the sea winds the island like a watch, twice daily, through channels in the rock we've mapped by their song. The locals' stones — the spirals — are DIAGRAMS. Whoever cut them understood this system better than my funding committee ever will.\"</i>",
                            "<i>\"…And it hides us. I've stopped pretending otherwise in my own journal. Charts miss this island because the field bends every instrument that looks at it. The question my sponsors keep cabling — CAN IT BE REPRODUCED — is the wrong question. The right one is: what is it FOR? Systems this elegant are always for something. — I.V.\"</i>",
                        };
                    return new List<string>
                    {
                        "The office is small, ordered, and hers: I. VANE, PhD on the door in machine tape, a spider-plant's skeleton in a pot, and on the desk — squared to the blotter, waiting fifty years for a reader — a stack of clothbound journals in a firm, fast hand.",
                        "<i>\"March '68. Site 9 at last. The anomaly is real — not instrument error, not the pilots' ghost stories. The island sits inside a standing electromagnetic field with a periodicity I can set my watch by: seven pulses, then rest. The birds navigate by it. The plankton bloom to it. My compass spins like a debutante. I have never been so happy in my professional life. — I.V.\"</i>",
                        "You read until the light moves. She loved it here. It's in every line: a mind meeting its one great question.",
                    };
                },
            });

            script.Add(new StoryScene
            {
                Id = "station_radio",
                OnEnter = s =>
                {
                    if (s.Is("RADIO_SURVEYED")) return;
                    s.SetFlag("RADIO_SURVEYED");
                    s.AddRoute(RouteAxis.Signal, 2);
                },
                Text = s => new List<string>
                {
                    "The radio room is a ruin with good bones. Console gutted by fifty wet seasons, mice in the wiring loom, the operator's chair rusted mid-swivel — but the mast feed runs true up the wall and out, and the antenna, for all its lean, is <i>up</i>.",
                    s.Is("BG_ENGINEER")
                        ? "You read the wreck the way Vane read her instruments, and the verdict is: solvable. Three absences stand between this room and a working transmitter: the transmitter itself (the console's is corrosion in a box — but stations like this kept spares, crated, in secure storage: the E wing, if anywhere), heavy antenna cable to replace the perished run, and fuel for the generator. Parts, cable, fuel. A list. Lists can be finished."
                        : "You're no radio engineer, but the shape of the problem shows even to you: the console's heart is corroded past prayer — a spare would live in secure storage, which means the E wing; the fat cable to the mast crumbles in your hand — salvage might replace it; and none of it means anything without generator fuel. Parts, cable, fuel. A list. You can work a list.",
                },
            });

            script.Add(new StoryScene
            {
                Id = "station_ewing",
                OnEnter = s =>
                {
                    if (s.Is("E_WING_OPEN")) return;
                    bool key = s.Is("IPO_KEY");
                    bool eng = s.Is("BG_ENGINEER") && s.Has("toolbox");
                    if (!key && !eng) { s.EwingTry = s.Day; return; }
                    s.SetFlag("E_WING_OPEN");
                    s.SetFlag("TRANSMITTER");
                    s.SetFlag("HEARTGLASS");
                    s.SetFlag("INCIDENT_HINTED");
                    s.AddRoute(RouteAxis.Depth, 2);
                    if (s.Is("GEMS_MYSTERY") && !s.Is("GEMS_LINKED")) s.SetFlag("GEMS_LINKED");
                },
                Text = s =>
                {
                    if (!s.Is("E_WING_OPEN"))
                        return new List<string>
                        {
                            "The E wing door is a slab of marine steel in a reinforced frame, and it defeats you — today. Pry-bar bends, hinges hold, and the building stands blank-walled and windowless, keeping the station's one locked thought.",
                            "There will be a way in — a key in this compound, a stronger lever, a better idea. The door isn't going anywhere. Neither, something tells you, is what's behind it.",
                        };
                    var t = new List<string>
                    {
                        s.Is("IPO_KEY")
                            ? "The flat steel key from Ipo's hoard turns in the lock like it was oiled yesterday — fifty years of jungle and the tumblers still know their business. (Somewhere in the canopy roads, a small showman's reputation compounds further.)"
                            : "You defeat it the engineer's way: not the lock but the hinges, drifted out pin by rusted pin over two patient hours, until the whole slab swings backward against its own intentions.",
                        "Inside, the E wing is two rooms and a chill that has no business surviving the tropics. The first room is storage, and it pays the whole expedition: a spare transmitter, crated, greased, sealed — <i>intact</i>. Tools. Cable ties. A drum of desiccant that did its job for fifty years.",
                        "The second room is the reason for the door.",
                        "Core samples, racked like wine. Grey stone, unremarkable — except the seventh rack, double-strapped, its samples sleeved in lead-lined canvas. You unwrap one to the wrist and stop: the stone is <i>glassy</i>, dark, threaded with veins that catch your lamp and hold it a half-beat too long — the exact wrongness of the third glyph stone's inlay, the exact color of your reflection arriving late.",
                        "It is warm. Not sun-warm. <i>Pulse</i>-warm. Seven beats. You wrap it back with more care than you've handled anything since the crash, and you take one — the smallest — because Vane's clipped sample-log ends with a line you can't unread: <i>\"After yesterday, all further sectioning suspended. It isn't inert. It was never inert. — I.V.\"</i>",
                    };
                    if (s.Is("GEMS_LINKED"))
                        t.Add("And with the sample's warmth still in your palm, two and two arrive at last: <i>the courier's gems.</i> The cut stones in the lead-lined pouch — they are THIS. Someone carried cores like these off the island, and somewhere out in the world, has never stopped cutting.");
                    return t;
                },
            });

            script.Add(new StoryScene
            {
                Id = "station_fuel",
                OnEnter = s => s.SetFlag("FUEL"),
                Text = s => new List<string>
                {
                    "The shed is rust and shadows and the fifty-year smell of diesel gone to varnish — but the main tank was built like a battleship, and when you sound it, it answers: a quarter full, settled and stratified, but <i>fuel</i>.",
                    s.Is("BG_ENGINEER")
                        ? "You crack the drain, run off the water and sludge, and decant the good middle draw into every vessel you've got. It'll burn. The old donkey-engine might even survive burning it, once you've rebuilt its filters, which you catalogue by lamplight with something dangerously like joy."
                        : "You draw it off the way the fading stencilled instructions insist — slowly, from the middle, wasting the top and bottom — and carry out enough to matter. Whether the generator will forgive fifty years and rough fuel is tomorrow's question, but it is at least now a question.",
                },
            });

            script.Add(new StoryScene
            {
                Id = "station_wire",
                OnEnter = s => s.SetFlag("WIRE"),
                Text = _ => new List<string>
                {
                    "You spend the daylight stripping the compound's veins: conduit runs, junction boxes, the lightning-ground off the water tower. Powder, powder, verdigris, powder — and then, under the eaves of the lab block where the sun never reached, a full run of armored antenna cable, jacket cracked but copper bright as the day it shipped.",
                    "You coil it out over your shoulder — heavier than it has any right to be, in every sense. Another line through the list.",
                },
            });

            script.Add(new StoryScene
            {
                Id = "station_stage",
                OnEnter = s =>
                {
                    if (s.Is("RADIO_STAGED")) return;
                    s.SetFlag("RADIO_STAGED");
                    s.AddRoute(RouteAxis.Signal, 2);
                    s.Stat(Meter.Hope, 6);
                },
                Text = _ => new List<string>
                {
                    "You spend the day doing the careful, unglamorous work that separates a pile of parts from a machine: console gutted and cleaned, the new cable run dressed up the wall and out to the mast's feed, the crated transmitter unpacked, inventoried, seated. Fuel filtered and staged at the shed.",
                    "By dusk the radio room looks like what it is: a held breath, one long day's assembly from a voice. The monsoon sky to the south stands like a wall. Whatever you're going to say to the world — and whether — the saying of it has become, for the first time since the crash, an <i>engineering</i> question.",
                    "<i>The radio can be finished when the moment comes. That moment is a story for the next chapter.</i>",
                },
            });
        }
    }
}
