using System.Collections.Generic;

namespace Tidebound.Narrative
{
    /// <summary>
    /// Chapter Two — Foothold: the opener, the Boar King's raid and its
    /// four answers (track / wall / tithe / the hunt that makes notches),
    /// the smoke inland, the fifteenth-morning heart beats, and the king
    /// tide. Ported from scenes-chapter2.js; effects pinned by tests.
    /// V1 adaptations noted inline: the site choice offers only the beach
    /// (the other camps arrive with their zones), the boar-hunt's segment
    /// tick is folded into its wounds, and chapter two opens the evening
    /// of the Clearing rather than hard-resetting the clock to day 6 dawn.
    /// </summary>
    public static class Chapter2Events
    {
        public static void AddTo(StoryScript script)
        {
            AddOpener(script);
            AddBoarKing(script);
            AddSmoke(script);
            AddHearts(script);
            AddKingTide(script);
            AddBondAndSolo(script);
            AddStorm(script);
            AddThreshold(script);
        }

        // ---- day 9, dusk: the stick on the woodpile ------------------------
        static void AddBondAndSolo(StoryScript script)
        {
            script.Add(new StoryScene
            {
                Id = "ev2_bond",
                Speaker = "Kavi",
                OnEnter = s =>
                {
                    if (s.Is("BOND1_DONE")) return;
                    s.SetFlag("BOND1_DONE");
                    s.Bond(4);
                    s.Stat(Meter.Hope, 3);
                },
                Text = _ => new List<string>
                {
                    "At dusk Kavi does something new: he brings you a stick. Not to throw — he's no one's puppy — he lays it on your woodpile. Then another. He has watched you gather wood for a week and more, worked out that it matters, and decided to be implicated.",
                    "You say thank you like it's normal. He looks away like it's nothing. The woodpile grows all week.",
                },
            });
            script.Add(new StoryScene
            {
                Id = "ev2_solo",
                OnEnter = s =>
                {
                    if (s.Is("SOLO1_DONE")) return;
                    s.SetFlag("SOLO1_DONE");
                    s.Stat(Meter.Hope, 2);
                    s.AddRoute(RouteAxis.Roots, 1);
                },
                Text = _ => new List<string>
                {
                    "At dusk the wild dogs sing inland, and the macaque troop answers from the canopy, and the junglefowl mutter their roll-call at the fringe — the whole island talking around you, through you, past you.",
                    "You chose this. You re-choose it now, deliberately, the way you check a knot: alone travels lighter, risks less, grieves nothing. The knot holds.",
                    "It holds. You bank the fire and tell the dark, out loud, just to hear a voice: \"Just us, then.\" The dark, companionably, does not answer.",
                },
            });
        }

        // ---- day 11, dusk: the first storm -----------------------------------
        static void AddStorm(StoryScript script)
        {
            script.Add(new StoryScene
            {
                Id = "ev2_storm",
                Text = _ => new List<string>
                {
                    "It comes up the sea with almost no warning: a bruise-green wall off the southern horizon, dragging rain like a dropped curtain, and under it the water going the color of slate and bad news.",
                    "This is no squall. This is the island's first real argument with you: a night of it, at least. You have one part of one hour, and everything you own is about to be weather.",
                    "You can't save it all. What do you protect <i>first</i>?",
                },
                Choices = new List<StoryChoice>
                {
                    new StoryChoice
                    {
                        Label = "The stores — food, tools, tinder, everything dry.",
                        Sub = "Property survives; comfort takes its chances.",
                        Do = s => s.SetFlag("STORM_STORES"),
                        Go = "ev2_storm2",
                    },
                    new StoryChoice
                    {
                        Label = "The fire — bank it deep, wall it, keep the ember alive.",
                        Sub = "Losing fire in what's coming could cost days.",
                        Do = s => s.SetFlag("STORM_FIRE"),
                        Go = "ev2_storm2",
                    },
                    new StoryChoice
                    {
                        Label = "Kavi — get him under cover before anything.",
                        Sub = "Things can be rebuilt.",
                        When = s => s.Companion == "kavi",
                        Do = s => { s.SetFlag("STORM_COMPANION"); s.Bond(6); },
                        Go = "ev2_storm2",
                    },
                },
            });
            script.Add(new StoryScene
            {
                Id = "ev2_storm2",
                OnEnter = s =>
                {
                    if (s.Is("STORM_APPLIED")) return;
                    s.SetFlag("STORM_APPLIED");
                    if (s.Shelter >= 2) { s.Stat(Meter.Hope, 2); s.Stat(Meter.Energy, -4); }
                    else { s.Stat(Meter.Energy, -12); s.Stat(Meter.Hope, -5); s.Stat(Meter.Health, -5); }
                    if (!s.Is("STORM_FIRE") && s.Fire > 0)
                    {
                        s.Fire = 0;
                        s.FireFuel = 0f;
                        s.SetFlag("FIRE_DROWNED2");
                    }
                    if (!s.Is("STORM_STORES"))
                    {
                        if (s.Food > 0) s.Food -= 1;
                        if (s.Has("rations")) s.AddItem("rations", -1);
                    }
                    if (s.Companion == "kavi" && s.Is("STORM_FIRE")) s.SetFlag("KAVI_FIRE_TEST");
                },
                Text = s =>
                {
                    var t = new List<string>
                    {
                        s.Shelter >= 2
                            ? "The storm lands on your camp like a thrown sea. The shelter — braced, double-thatched, trench-drained — bends, drums, leaks in two places, and <i>holds</i>. You spend the night with your back against the good main post, keeping company with your own competence."
                            : "The storm dismantles your camp with the indifference of an auditor. The lean-to lasts an hour; the rest of the night is warm rain, cold wind, and endurance arithmetic, crouched in the ruins holding what you can.",
                    };
                    if (s.Is("FIRE_DROWNED2"))
                        t.Add("Somewhere in the middle of it, the fire dies. You feel it go — a change in the dark behind you — and file the cost under morning.");
                    if (!s.Is("STORM_STORES"))
                        t.Add("Dawn's inventory: the storm fed itself from your stores. Some of what you'd put by is simply <i>elsewhere</i> now, distributed across a mile of soaked beach.");
                    if (s.Companion == "kavi")
                        t.Add(s.Is("KAVI_FIRE_TEST")
                            ? "And Kavi meets his oldest enemy: you kept the fire alive, so all night the wind throws its light around like a threat, and all night he shakes at the far edge of the shelter, ears flat, eyes white-rimmed — and does not run. Stays, at the exact distance his fear allows, watching over you from inside it."
                            : "Kavi presses against you the whole night through, storm-steady — thunder holds no history for him. It's only the fire he fears, and tonight there is none to fear.");
                    return t;
                },
                NextLabel = "Endure until morning",
            });
        }

        // ---- day 18, dusk: THE SMOKE (the chapter threshold) -------------------
        static void AddThreshold(StoryScript script)
        {
            script.Add(new StoryScene
            {
                Id = "ch2_threshold",
                Text = s => new List<string>
                {
                    "<i>THE SMOKE</i>",
                    "Dusk, day eighteen. Two weeks of foothold behind you: "
                        + (s.Shelter >= 3 ? "a fortified camp" : "a working camp") + ", "
                        + (s.Companion != null
                            ? "a bond growing real enough to plan around"
                            : "a solitude you've built into a structure")
                        + ", and inland — patient, banked, unanswered — <i>that fire</i>.",
                    "You've run every version of it. A castaway like you, decades deeper. A hermit who chose this. Someone the island keeps. Someone the island <i>couldn't get rid of</i>. Every version knows things that would take you years and cost you fingers to learn alone.",
                    "Every version also watched your smoke for thirteen days and never came.",
                    "The monsoon months are out there past the horizon somewhere, and knowledge has a season too. What do you do about the fire on the mountain?",
                },
                Choices = new List<StoryChoice>
                {
                    new StoryChoice
                    {
                        Label = "Go now. Tonight. Walk into the dark and knock.",
                        Sub = "Bold, fast, and first impressions can't be rehearsed. The jungle at night is nobody's friend.",
                        Do = s => { s.SetFlag("SMOKE_NOW"); s.AddRoute(RouteAxis.Depth, 2); s.SetFlag("CLEARING_DONE2"); },
                        Go = "ch2_end_trek",
                    },
                    new StoryChoice
                    {
                        Label = "Prepare first. Go at first light, provisioned and presentable.",
                        Sub = "Slower, safer, and whoever it is has waited years — they'll wait a night.",
                        Do = s => { s.SetFlag("SMOKE_LATER"); s.AddRoute(RouteAxis.Roots, 2); s.SetFlag("CLEARING_DONE2"); },
                        Go = "ch2_end_fort",
                    },
                    new StoryChoice
                    {
                        Label = "Let the mountain keep its hermit. Your fire talks to the SEA.",
                        Sub = "Strangers are a risk and rescue is a bearing. Double down on the signal.",
                        Do = s => { s.SetFlag("SMOKE_IGNORED"); s.AddRoute(RouteAxis.Signal, 2); s.SetFlag("CLEARING_DONE2"); },
                        Go = "ch2_end_signal",
                    },
                },
            });

            script.Add(new StoryScene
            {
                Id = "ch2_end_trek",
                Speaker = "A lantern, a braid, a shotgun",
                Text = s => new List<string>
                {
                    "You bank your fire, "
                        + (s.Companion == "kavi" ? "whistle Kavi to heel" : "square your shoulders alone")
                        + ", and walk into the jungle at night, following a bearing and a resolve that both feel thinner with every dark mile.",
                    "The jungle at night is a rumor of itself — root and drip and eyeshine — and you are deep in it, past the point of sensible return, when the smell of woodsmoke arrives like a hand out of the dark.",
                    "Then the light. Not a campfire: a <i>lantern</i>, swinging knee-high, coming down the slope toward you through the trees with the unhurried gait of someone on their own ground. It stops at conversational distance. Above it: a weathered face, a long grey braid, eyes that have finished their assessment before you've started yours.",
                    "Below it, held with the casual competence of long habit: the twin dark circles of a shotgun's mouth.",
                    "\"Well,\" says a voice rusty with disuse, in the tone of a woman finding a pig in her garden. \"It talks, walks at night like a fool, and smells of the sea. Sixty years I've kept this island's one quiet mountain—\" the lantern lifts; the old eyes rake you, your companion, your empty hands, \"—and the tide brings me <i>another one</i>.\"",
                    "The shotgun, you notice, has not been raised. It has also, you notice, not been lowered.",
                    "<i>To be continued.</i>",
                },
                Next = "ch2_end",
                NextLabel = "Chapter Two ends",
            });
            script.Add(new StoryScene
            {
                Id = "ch2_end_fort",
                Text = _ => new List<string>
                {
                    "You spend the last light preparing like it's a state visit, because it might be: food packed as gift and as ballast, fire triple-banked, camp secured, your one salvageable shirt made as presentable as sea and jungle allow.",
                    "You go up at first light, provisioned, rested, and deliberate — and find, an hour along the inland trail, that the mountain has been ahead of you the whole time: laid on a flat stone in the middle of your path, arranged so you cannot possibly miss it, a single dried sprig of some herb you don't know, and beneath it, weighted, a strip of bark with charcoal writing in a firm, old-fashioned hand.",
                    "\"<i>If you must come — come at noon, come slow, and don't bring the pig smell if you can help it. — E.</i>\"",
                    "You stand there in the green light, holding the first written words you've seen since the crash, laughing and unnerved in equal measure. Whoever E is: they've known where your camp is all along. They knew you'd come today. And they have opinions.",
                    "<i>To be continued.</i>",
                },
                Next = "ch2_end",
                NextLabel = "Chapter Two ends",
            });
            script.Add(new StoryScene
            {
                Id = "ch2_end_signal",
                Text = _ => new List<string>
                {
                    "You choose the sea. Whatever the mountain knows, it isn't a way home — and you have finite hours, finite hands, and one horizon that matters.",
                    "You spend the eighteenth night building your answer to it: the signal pyre rebuilt taller on the point, tinder-dry under its rain cap, ready to turn one match into a pillar visible from the shipping lanes you have to believe are out there. Your SOS renewed. Your mirror-glass angled and stacked.",
                    "And yet, banking your fire at midnight, you catch yourself looking inland one more time. The thread of the mountain's smoke is invisible in the dark — but somewhere up there it burns, tended by hands that saw your fire and chose the same silence you're choosing now.",
                    "Two fires on one island, each deciding the other can wait. The island keeps its own counsel about how that usually goes.",
                    "<i>To be continued.</i>",
                },
                Next = "ch2_end",
                NextLabel = "Chapter Two ends",
            });

            script.Add(new StoryScene
            {
                Id = "ch2_end",
                Text = s =>
                {
                    var t = new List<string>
                    {
                        "<i>END OF CHAPTER TWO — FOOTHOLD</i>",
                        "The Ledger turns another page. These weeks, as the island will remember them:",
                        "— You chose your ground: <i>the crash beach, eyes on the horizon</i>.",
                    };
                    if (s.Companion == "kavi")
                    {
                        string[] tierWords =
                        {
                            "wary of you still", "tolerating you, and pretending otherwise",
                            "bonded to you — it shows in everything",
                            "devoted to you past all argument", "kindred",
                        };
                        t.Add("— Kavi the island dog is " + tierWords[(int)s.Tier] + "."
                            + (s.Is("HEART1_DONE") ? " The fifteenth morning happened. Neither of you will mention it. Both of you are changed by it." : ""));
                    }
                    else
                    {
                        t.Add("— You are alone by choice, and the choice still holds."
                            + (s.Is("COCO_TALKED") ? " Coco has been briefed on all major decisions." : ""));
                    }
                    t.Add("— The Boar King " + (s.Is("KING_TITHED")
                        ? "accepts your tribute. For now. Negotiations continue."
                        : s.Is("KING_TRACKED")
                            ? "is known to you now — his roads, his scars, his snapped traps. Knowledge with teeth in it."
                            : s.Is("KING_WALLED")
                                ? "found your walls raised against him. The inland dark took note."
                                : "came in the night and taught you the rent."));
                    t.Add("— The first storm " + (s.Shelter >= 2 ? "tested your walls and lost." : "took its tax in full.")
                        + (s.Is("KAVI_FIRE_TEST") ? " Kavi kept watch all night from inside his own fear." : ""));
                    t.Add("— And the smoke: " + (s.Is("SMOKE_NOW")
                        ? "you walked into the night and met a lantern, a braid, and a shotgun that never quite lowered. Her name starts with E, and Chapter Three belongs to her mountain."
                        : s.Is("SMOKE_LATER")
                            ? "you prepared first — and the mountain left you a note. \"Come at noon. Come slow.\" Signed E. Chapter Three has an appointment."
                            : "you turned your back on it and fed your signal instead. The mountain's fire burns on, unanswered, patient. Chapter Three will not wait forever."));
                    t.Add($"Route leanings — Signal {s.Route.Signal} · Roots {s.Route.Roots} · Depth {s.Route.Depth}. Nothing is decided. Everything is remembered.");
                    return t;
                },
                // The VN offers "start a new run" here too; v1 keeps run resets
                // on the RunCardUI flow, so the card continues into chapter 3.
                Next = "ch3_open",
                NextLabel = "Continue — Chapter Three: The Green Deep ➤",
            });
        }

        // ---- CHAPTER TWO — FOOTHOLD -----------------------------------------
        static void AddOpener(StoryScript script)
        {
            script.Add(new StoryScene
            {
                Id = "ch2_open",
                OnEnter = s => { if (s.Chapter < 2) s.Chapter = 2; },
                Text = s => new List<string>
                {
                    "<i>CHAPTER TWO — FOOTHOLD</i>",
                    "The next dawn comes different. Not easier — different: the difference between falling and standing somewhere. You have fire"
                        + (s.Fire > 0 ? "" : " — well, you've had fire, and will again")
                        + ", a roof of sorts, five days of hard schooling, and "
                        + (s.Companion == "kavi"
                            ? "Kavi, watching you wake with the expression of a colleague waiting on a decision."
                            : "nobody to consult but yourself, which at least keeps meetings short."),
                    "And a decision is due. The crash beach was where you washed up, not where you chose. If this is going to be a <i>camp</i> — a base, a foothold, the address of your survival — it's time to claim the ground on purpose.",
                },
                Choices = new List<StoryChoice>
                {
                    new StoryChoice
                    {
                        Label = "Stay on the crash beach. Claim it.",
                        Sub = "Best view of the sea and the sky — nothing passes without you seeing it. But storms and tides own this ground, and everything inland is a hike.",
                        Do = s => { s.Site = "beach"; s.SetFlag("SITE_BEACH"); s.AddRoute(RouteAxis.Signal, 1); },
                        Go = "ch2_site",
                    },
                },
            });
            script.Add(new StoryScene
            {
                Id = "ch2_site",
                Text = _ => new List<string>
                {
                    "You stay. It costs nothing to stay, which is its own kind of trap — but you've thought it through: the beach is where rescue looks, where wrecks wash in, where the horizon is a fact instead of a rumor. You spend the morning making the accident of your camp into a decision: fire ring rebuilt above the spring-tide line, stores lashed higher.",
                    "The sea watches you do it, patient as arithmetic. You have chosen to live with a large, moody neighbor.",
                },
            });
        }

        // ---- THE BOAR KING ----------------------------------------------------
        static void AddBoarKing(StoryScript script)
        {
            script.Add(new StoryScene
            {
                Id = "ev2_boarking",
                OnEnter = s =>
                {
                    if (s.Is("BOARKING_APPLIED")) return;
                    s.SetFlag("BOARKING_APPLIED");
                    if (s.Companion == "kavi") s.SetFlag("KING_SEEN");
                    if (s.Stats.Hunger > 30f) s.Stat(Meter.Hunger, -8);
                },
                Text = s =>
                {
                    var t = new List<string> { "You wake on day seven to a camp that has been <i>edited</i>." };
                    if (s.Companion == "kavi")
                    {
                        t.Add("You saw him, in the night — because Kavi saw him first. The growl woke you like a hand on the shoulder: low, continuous, deadly serious. And there at the treeline, filling it, stood the biggest boar you have ever seen or heard credibly described — grey-black, plated in scar, one tusk broken to a fighting stump, watching your camp with small, furious, <i>calculating</i> eyes.");
                        t.Add("It did not charge. That was somehow worse. It took two steps in, took the measure of the resistance, ate your entire drying rack — deliberately, watching you the whole time — and withdrew like a landlord who'll be back for the rest.");
                    }
                    else
                    {
                        t.Add("The drying rack is kindling. The forage cache is a crater with your gathering bag at the bottom of it, licked flat. Whatever visited in the night was enormous — the prints are the size of your two fists together, deep as a post-hole — and contemptuous: your palisade stakes weren't breached, they were <i>walked through</i>.");
                        t.Add("At the treeline, on a torn sapling, a single coarse grey-black bristle, thick as fishing line. Something owns the inland dark, and it has just informed you of the rent.");
                    }
                    return t;
                },
                Choices = new List<StoryChoice>
                {
                    new StoryChoice
                    {
                        Label = "Track it. Know your enemy before it knows you're worth knowing.",
                        Sub = "Dangerous knowledge — the useful kind.",
                        Do = s =>
                        {
                            s.SetFlag("KING_TRACKED");
                            s.AddRoute(RouteAxis.Depth, 1);
                            if (s.Companion == "kavi") s.Bond(3);
                        },
                        Go = "ev2_boarking2",
                    },
                    new StoryChoice
                    {
                        Label = "Rebuild stronger. Let the jungle keep its monsters if it keeps them out there.",
                        Sub = "Roots, defenses, and the long game.",
                        Do = s => { s.AddRoute(RouteAxis.Roots, 2); s.Stat(Meter.Energy, -6); s.SetFlag("KING_WALLED"); },
                        Go = "ev2_boarking3",
                    },
                    new StoryChoice
                    {
                        Label = "Leave an offering at the treeline. Some tolls are cheaper paid.",
                        Sub = "Feed the mountain and it may not come to dine.",
                        Do = s =>
                        {
                            s.Stat(Meter.Hunger, -6);
                            s.SetFlag("KING_TITHED");
                            s.AddRoute(RouteAxis.Depth, 1);
                            s.Stat(Meter.Hope, 2);
                        },
                        Go = "ev2_boarking4",
                    },
                    new StoryChoice
                    {
                        Label = "Hunt it down today. End this before it begins.",
                        Sub = "WARNING: you know nothing about it yet, and it has plainly survived everything this island ever sent. Strong, rested, and backed, you might live to learn better. Otherwise this is how castaways become notches.",
                        Do = s =>
                        {
                            bool backed = s.Companion == "kavi";
                            if (backed && s.Stats.Health >= 60f && s.Stats.Energy >= 45f)
                            {
                                s.SetFlag("KING_FACED");
                                s.Injury = "laceration";
                                s.Stat(Meter.Health, -30);
                                s.Stat(Meter.Energy, -20);
                                s.Stat(Meter.Hope, -4);
                                s.AddRoute(RouteAxis.Depth, 1);
                            }
                            else s.DeathCause = "boarking";
                        },
                        GoDynamic = s => s.DeathCause != null ? null : "ev2_boarkface",
                    },
                },
            });

            script.Add(new StoryScene
            {
                Id = "ev2_boarkface",
                Speaker = "The Boar King",
                Text = _ => new List<string>
                {
                    "You find him because he lets you. That much is clear within the first hundred meters of the trail: the prints get fresher too fast, the rooting-sign too neat, and then the jungle opens into a wallow-clearing and he is simply THERE, facing you, having chosen the ground, the light, and the moment you'd arrive.",
                    "What follows is not a fight. It is an audit with tusks. Kavi's speed is the only reason it isn't an execution — twice the grey shape cuts the charge's angle, screaming pack-fury, buying you the half-seconds your spear-arm needs to matter at all—",
                    "And then, having opened your leg to the bone-ache and flattened your spear-side into the mud — having established, beyond appeal, exactly what he could do — the Boar King stops. Steps back. Looks at the two of you, bleeding and defiant and DONE, with those small calculating eyes, and delivers his verdict: one long breath out through the scarred snout, contempt and something else. Something almost like marking a ledger: <i>paid enough.</i>",
                    "He walks away unhurried. He does not look back. You have learned the only thing the trail was ever going to teach: the inland dark has a landlord, the rent is real, and today — at a price you'll be repaying for a week — he chose to make you a tenant instead of a notch.",
                },
            });
            script.Add(new StoryScene
            {
                Id = "ev2_boarking2",
                Text = s => new List<string>
                {
                    (s.Companion == "kavi"
                        ? "Kavi takes the trail like it's a manuscript, and reads you the terrible parts. "
                        : "You follow the post-hole prints inland, slowly, loudly enough to be honest about it. ")
                    + "The trail is a road — <i>his</i> road, worn deep by years, running from a wallow the size of a pond up toward the grass highlands. Along it: trees stripped of bark at shoulder height, old snare-wire grown into scar tissue on a tusk-scraped trunk, and once — you stop and look for a long time — the rusted spring-arm of a man-made trap, snapped clean.",
                    "He is old. He has been hunted before, by people with better equipment than yours, and he has outlived every one of them. Whatever this is going to be between you, it will not be simple, and it will not be quick.",
                },
            });
            script.Add(new StoryScene
            {
                Id = "ev2_boarking3",
                Text = _ => new List<string>
                {
                    "You spend the morning turning damage into design: stakes reset and angled out, the cache raised beyond even a rearing giant's reach, brush cleared so nothing crosses open ground unseen. It costs sweat you'd budgeted elsewhere. It buys you the first camp you'd bet on.",
                    "The jungle watches you work. Fine. Let the message travel: this ground is spoken for.",
                },
            });
            script.Add(new StoryScene
            {
                Id = "ev2_boarking4",
                Text = _ => new List<string>
                {
                    "You leave a mound of tubers and windfall figs at the treeline, where the post-hole prints turn back into the dark. It feels absurd, tithing to a pig. It also feels — you can't shake this — <i>correct</i>, the way paying respect on a border always is.",
                    "In the morning the mound is gone, taken neatly, without one further stake disturbed. A receipt, of sorts. Negotiations are open.",
                },
            });
        }

        // ---- THE SMOKE INLAND -------------------------------------------------
        static void AddSmoke(StoryScript script)
        {
            script.Add(new StoryScene
            {
                Id = "ev2_smoke",
                Text = _ => new List<string>
                {
                    "Day thirteen, mid-morning, you're working with your eyes down when the back of your neck reports before your mind does: <i>something in the sky has changed.</i>",
                    "Inland, above the deep green — up where the land climbs toward the broken mountain — a thread of smoke stands in the washed air. Thin. Grey. Vertical. <i>Banked</i>.",
                    "A wildfire sprawls and browns. A signal fire billows and dies. This does neither. This is a <i>kept</i> fire, a hearth fire, tended by hands that have tended it so long it burns with table manners.",
                    "You are not alone on this island. You never were.",
                },
                Choices = new List<StoryChoice>
                {
                    new StoryChoice
                    {
                        Label = "Take a bearing. Mark it against the mountain. Say nothing to the horizon.",
                        Sub = "Knowledge first. Decisions later.",
                        Do = s => { s.SetFlag("SMOKE_SEEN"); s.AddRoute(RouteAxis.Depth, 1); },
                    },
                    new StoryChoice
                    {
                        Label = "Build your own fire high and smoky. Answer.",
                        Sub = "Whoever they are, let them know the island gained a resident.",
                        Do = s =>
                        {
                            s.SetFlag("SMOKE_SEEN");
                            s.SetFlag("SMOKE_ANSWERED");
                            s.AddRoute(RouteAxis.Signal, 1);
                            s.Stat(Meter.Energy, -4);
                        },
                        Go = "ev2_smoke2",
                    },
                    new StoryChoice
                    {
                        Label = "Feel the cold thing under the wonder: strangers are a risk.",
                        Sub = "You've built too much to gamble it on company.",
                        Do = s => { s.SetFlag("SMOKE_SEEN"); s.SetFlag("SMOKE_WARY"); s.AddRoute(RouteAxis.Roots, 1); },
                    },
                },
            });
            script.Add(new StoryScene
            {
                Id = "ev2_smoke2",
                Text = _ => new List<string>
                {
                    "You feed your fire green fronds until it climbs the sky in fat grey coils that can be read for miles: <i>here. Alive. Talking.</i>",
                    "You watch the inland thread for an answer until the light goes. It burns on exactly as before — steady, banked, indifferent — like a person who has heard the question perfectly well and gone back to their book.",
                    "Somehow that non-answer tells you more than smoke ever could: whoever is up there has seen castaways' fires before. And has opinions about them.",
                },
            });
        }

        // ---- the fifteenth morning ---------------------------------------------
        static void AddHearts(StoryScript script)
        {
            script.Add(new StoryScene
            {
                Id = "ev2_heart",
                SpeakerDynamic = s => s.Companion == "buri" ? "Buri" : s.Companion == "moa" ? "Moa" : "Kavi",
                OnEnter = s =>
                {
                    if (s.Is("HEART1_DONE")) return;
                    s.SetFlag("HEART1_DONE");
                    s.Bond(10);
                    s.Stat(Meter.Hope, 8);
                },
                Text = s =>
                {
                    if (s.Companion == "buri")
                        return new List<string>
                        {
                            "On the fifteenth morning Buri is missing at breakfast — until you follow the sound of industrious ruin and find him at the treeline, digging like a machine, and beside the crater a mound of truffles the size of your two hands.",
                            "He has been at it since first light. When you arrive he steps back from the mound and looks up at you, filthy, beaming, and it is unmistakably a <i>presentation</i>: for the crab you shared, for the rack he cost you, for every meal since. Restitution, pig-style, with interest.",
                            "You eat one raw right there, and his tail helicopter is the happiest thing on the island.",
                        };
                    if (s.Companion == "moa")
                        return new List<string>
                        {
                            "On the fifteenth morning you sit down by the fire and Moa, without ceremony, steps into your lap, turns twice, and folds herself down like a small copper cat. And sleeps. In daylight. In the open.",
                            "You know what daylight sleep costs a prey animal — she has spent every hour of her life on watch, and she is spending this one <i>off duty, on you</i>, because somewhere in her fast small heart it has been settled that you watch well enough for two.",
                            "You sit unmoving until your legs die of pins, and consider it the best lease you've ever signed.",
                        };
                    return new List<string>
                    {
                        "It happens on the fifteenth morning, without announcement: Kavi crosses the camp, lies down against your leg, and rolls — deliberately, watching your face — to bare the burned flank. The scar tissue is slick and hairless, older than your acquaintance, shaped like a long paw of flame.",
                        "You rest your hand on it, light as you know how. He exhales — a long, unbuilding breath, years going out of it — and sleeps, there, under the hand on his worst place.",
                        "Whatever cast him out and whatever burned him, he has decided you are not it.",
                    };
                },
            });
            script.Add(new StoryScene
            {
                Id = "ev2_heart_low",
                OnEnter = s =>
                {
                    if (s.Is("HEART1_LOW")) return;
                    s.SetFlag("HEART1_LOW");
                    s.Bond(3);
                },
                Text = s => new List<string>
                {
                    "On the fifteenth morning you catch " + (s.Companion == "buri" ? "the young pig" : s.Companion == "moa" ? "the copper hen" : "the grey dog") + " watching you from the old first distance — the day-three distance — and you feel the gap you haven't closed.",
                    "Trust, out here, is the most expensive thing you can build, and you've been spending your hours on walls and stores and smoke instead. Fair choices. Survivable choices. But the wild keeps honest books: you get exactly the bond you feed.",
                    "There is still time. There is not unlimited time.",
                },
            });
            script.Add(new StoryScene
            {
                Id = "ev2_coco",
                OnEnter = s =>
                {
                    if (s.Is("COCO_TALKED")) return;
                    s.SetFlag("COCO_TALKED");
                    s.SetFlag("COCO");
                    s.Stat(Meter.Hope, 4);
                },
                Text = _ => new List<string>
                {
                    "On the fifteenth morning you find yourself explaining your fortification plan — out loud, with gestures — to the coconut with the face.",
                    "It has three dark pores arranged like a face, and the face — you would swear this before a court — looks <i>interested</i>. You set it upright on the flat stone. \"Don't just sit there,\" you tell it, and get back to work, oddly heartened.",
                    "This is either perfectly healthy or the opposite, and you have decided, executively, not to look into it.",
                },
            });
        }

        // ---- the king tide -------------------------------------------------------
        static void AddKingTide(StoryScript script)
        {
            script.Add(new StoryScene
            {
                Id = "ev2_kingtide",
                OnEnter = s =>
                {
                    if (s.Is("KINGTIDE_APPLIED")) return;
                    s.SetFlag("KINGTIDE_APPLIED");
                    if (s.Shelter < 3)
                    {
                        if (s.Food > 0) s.Food -= 1;
                        s.Stat(Meter.Energy, -8);
                        s.Stat(Meter.Hope, -3);
                        if (s.Has("rations")) s.AddItem("rations", -1);
                    }
                    else s.Stat(Meter.Hope, 3);
                },
                Text = s => new List<string>
                {
                    "You wake mid-dark to a wrong sound: water where water has never reached. The moon is huge and low, and under it the sea has quietly claimed twenty extra feet of the world — a king tide, sliding silver fingers up the beach and <i>into your camp</i>.",
                    s.Shelter >= 3
                        ? "And it finds your stores exactly where you put them: up, lashed, on the raised platform your fortifying built. The tide noses around the posts like a thief reading a locked door, and withdraws with nothing. You go back to sleep listening to your own foresight hold."
                        : "You spend a soaked, moonlit hour hauling your life uphill by armfuls while the sea works through what you don't save. It is patient, thorough, and completely without malice, which somehow makes it worse.",
                },
            });
        }
    }
}
