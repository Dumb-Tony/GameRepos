using System.Collections.Generic;

namespace Tidebound.Narrative
{
    /// <summary>
    /// Chapter Six — Ashes and Stairs (days 71–85): the rains break and
    /// the mountain opens. A LINEAR expedition — the Terrace of Steps,
    /// the Tidewell Temple, the time-slip for glyph-completers, the
    /// tremor ladder (pushing for the rim at night is MOTHER ASH, warned
    /// in the choice's own subtext), the Inner Green judged on the run's
    /// accumulated regard, and THE TIDEWELL's doors. Ported from
    /// scenes-chapter6.js; effects pinned by Chapter6Tests. V1
    /// adaptations: the VN's chain() mid-leg ticks are charged as one
    /// 10-segment sweep when the expedition dialogue closes (GameManager
    /// hooks CH6_DONE — the sweep runs the real drains and death
    /// checks); the trinkets economy isn't in v1, so OLD_THINGS_HOME /
    /// GEMS_RETURNED simply contribute nothing to regard yet; kavi/solo
    /// texts live now, the rest with their companions (Phase 7).
    /// </summary>
    public static class Chapter6Events
    {
        /// <summary>How the island has scored this run (TB.regard) — Inner Green admission and the keeper's door.</summary>
        public static int Regard(GameState s)
        {
            int r = 0;
            if (s.Is("KING_FED") || s.Is("KING_TITHED") || s.Is("KING_SYMPATHY")) r++;
            if (s.Is("EAST_OPEN") && !s.Is("GRIN_FOUGHT")) r++;
            if (s.Is("FILES_BURNED") || s.Is("FILES_TO_EDDA")) r++;
            if (s.Is("EDDA_WINTER") || s.Is("EDDA_TENDED")) r++;
            if (s.Trust >= 75) r++;
            if (s.Is("SUNDERING_SEEN")) r++;
            if (s.Is("NAIA_TRUSTED") || s.Is("NAIA_TERMS")) r++;
            if (s.Is("MOA_FOUND") || s.Is("VELA_MANTLED") || s.Is("HEART2_DONE")) r++;
            if (s.Is("TURTLES") || s.Is("TREASURE_LEFT")) r++;
            if (s.Is("OLD_THINGS_HOME")) r++;
            if (s.Is("GEMS_RETURNED")) r++;
            return r;
        }

        public static void AddTo(StoryScript script)
        {
            AddAscent(script);
            AddInner(script);
            AddTidewell(script);
        }

        // ---- the rains break; the climb ---------------------------------------
        static void AddAscent(StoryScript script)
        {
            script.Add(new StoryScene
            {
                Id = "ch6_open",
                OnEnter = s => { if (s.Chapter < 6) s.Chapter = 6; },
                Text = s =>
                {
                    var t = new List<string>
                    {
                        "<i>CHAPTER SIX — ASHES AND STAIRS</i>",
                        "On the seventy-first morning you wake to a wrongness and take a full minute to name it: <i>silence</i>. The drumming has stopped. The ceiling has lifted. The world stands rinsed and dripping and impossibly green under a sky you'd half forgotten, and the broken mountain — the whole chapter of it, crown to knee — stands clear against the washed blue like a door finally lit.",
                        s.Is("INNER_INVITED")
                            ? "And at your fire, waiting with two woven packs and the patience of a professional watcher: Naia. \"The rains end,\" she says, rising. \"The old ones remember your name. We walk.\" It is not entirely a request."
                            : "The mountain waits. Whatever the season decided in you, its proof lies up there — the temple the paintings promised, the caldera behind the broken crown, the source of the seven beats you've slept against for a month.",
                        s.Companion == "kavi"
                            ? "Kavi reads the pack you're loading and takes up position by the trailhead: coming. That was never going to be a discussion."
                            : s.Companion == "buri"
                                ? "Buri reads the pack you're loading and plants himself at the trailhead like a boulder that has decided to be luggage: coming. That was never going to be a discussion."
                                : "You bank the fire, square Coco on his shelf facing the mountain — someone should keep an eye on camp — and shoulder the pack alone.",
                    };
                    if (s.Is("RYO_MET"))
                        t.Add("Ryo talks himself out of coming at his own boat's gunwale: \"Mountains,\" he says, with a sailor's full contempt for gradients, \"are just waves that gave up. Somebody has to mind the sea things. Come back with a good story.\" His handshake says the rest of it.");
                    t.Add("You provision for five days on the mountain. How do you load?");
                    return t;
                },
                Choices = new List<StoryChoice>
                {
                    new StoryChoice
                    {
                        Label = "Heavy: full stores, full water, the whole kit.",
                        Sub = "Slow and certain. The mountain won't starve you.",
                        Do = s =>
                        {
                            s.Stat(Meter.Hunger, 25);
                            s.Stat(Meter.Thirst, 20);
                            s.Stat(Meter.Energy, -10);
                            if (s.Food > 0) s.Food = s.Food >= 2 ? s.Food - 2 : 0;
                            s.SetFlag("PACK_HEAVY");
                        },
                        Go = "ch6_terrace",
                    },
                    new StoryChoice
                    {
                        Label = "Light: speed, weapons, and trust in the trail.",
                        Sub = "Fast and hungry. Forage as you climb.",
                        Do = s => { s.Stat(Meter.Energy, 6); s.SetFlag("PACK_LIGHT"); },
                        Go = "ch6_terrace",
                    },
                },
            });

            script.Add(new StoryScene
            {
                Id = "ch6_terrace",
                Text = s => new List<string>
                {
                    "The first day is jungle, then the jungle changes its mind.",
                    "It happens underfoot before it happens to your eyes: the trail firms, levels, <i>squares</i> — and then the green opens and you are standing at the foot of the Terrace of Steps, and you stop walking because some things demand it.",
                    "Stairs. A processional stair twenty people wide, dry-laid, riding the mountain's knee in flight after flight after flight — hundreds of steps, thousands — each tread worn spoon-deep at its center by bare feet across centuries. Terraced fields step away from it on both sides to the edge of sight, walls holding, forms holding, a whole civilization's agriculture asleep under fifty generations of green.",
                    s.Is("GLYPH2")
                        ? "Your fallen terrace wall in the Green Deep was an outlying farm. This is the <i>capital</i>."
                        : "The stones you found in the Green Deep were margins. This is the text.",
                    s.Is("INNER_INVITED")
                        ? "Naia climbs beside you and watches you take it in with open, wolfish satisfaction — the pride of someone showing you their family's house. \"All this, ours,\" she says. \"Before the mountain broke. You walk on my grandmothers' road, castaway.\" She takes the spoon-worn center of each step, deliberately, and after the third flight, so do you."
                        : "You climb the worn centers of the steps — it feels wrong anywhere else — and the mountain accepts you upward, flight after flight, the sea unrolling behind you until your whole known world is a bright toy at the stair's foot.",
                    s.Companion == "kavi"
                        ? "Kavi climbs the stair the way he entered your camp two months ago: committed and hating it. This is not his country — no cover, no scent-map, stone underfoot instead of honest ground — and he does it anyway, one flight below you or one above, triangulating the whole climb around the fixed point of your back."
                        : s.Companion == "buri"
                            ? "Buri takes the ten thousand stairs as a personal enemy and defeats them one by one, with commentary. By the top of the fourth flight he has opinions about the Kaari's attitude to ramps."
                            : "You climb alone, and the stair does what enormous old things do to a person alone: it makes room for you. By the fortieth flight the rhythm of your boots on the spoon-worn stone is a kind of company in itself — yours, and everyone's who ever wore the stone into spoons.",
                    "You camp the first night on a terrace lip under the washed stars, the stair vanishing up into the dark above like an argument the mountain hasn't finished making.",
                },
                Next = "ch6_temple",
                NextLabel = "Climb on ➤",
            });

            script.Add(new StoryScene
            {
                Id = "ch6_temple",
                OnEnter = s =>
                {
                    if (s.Is("TEMPLE_SEEN")) return;
                    s.SetFlag("TEMPLE_SEEN");
                    s.AddRoute(RouteAxis.Depth, 2);
                },
                Text = s => new List<string>
                {
                    "The stair ends at the temple, and the temple ends at the sea — which is impossible, because you are eight hundred feet above it.",
                    "The Tidewell Temple is cut into the mountain's shoulder: a nave of standing stone open to the sky, walls carved past weathering with the spiral in every size — and half its floor is <i>water</i>. A pool, black and utterly clear, fills the nave's lower end, and the water breathes. Rises, falls. Seven beats. You watch it run its cycle three times before your mind accepts what your eyes and the last month have already agreed on: the pool is plumbed to the sea through the whole body of the mountain — the throat, the Gullet, the channels the Kaari drew — and it keeps the island's time here, at the top of everything, like a heart on an altar.",
                    "The Tidewell. Not a name. A <i>description</i>.",
                    s.Is("SUNDERING_SEEN")
                        ? "The murals here continue the Gallery of Hands — the same painters' tradition, later chapters: the survivors' descendants at this pool, generation after generation, and always one figure alone at the water's edge in a marked hood: a keeper. A guardian. The covenant, kept in unbroken sequence, right up to a final panel where the hooded figure stands facing OUT of the wall, at the viewer, hand extended. At you. The way every mural tradition ends when it hasn't ended."
                        : "Murals ring the nave in fading procession: boats, fields, the mountain breaking, the survivors walking into stone — and, repeated down the centuries of panels, one hooded figure alone at the pool's edge. A keeper. Generations of them. The last panel's keeper faces outward, hand extended, unfinished — or waiting.",
                    s.Companion == "kavi"
                        ? "Kavi will not enter the nave. He stops at the threshold stone, sits — the deliberate, formal sit he does at boundaries — and holds the door the whole time you're inside, facing out. Whatever this place is, his manners for it are older than training, older than packs: <i>you do not walk on graves. You watch over the ones who must.</i>"
                        : s.Companion == "buri"
                            ? "Buri stops dead at the nave's mouth, nose working the air with a thoroughness you know from boundary-stones and storm-mornings — and then he does the thing that makes your breath catch: he kneels. Forelegs folding, great head lowering, the way pigs fold to rest but slower, aimed, at the water. You stopped laughing at the old carved travel-charm weeks ago. His people have been coming here longer than yours."
                            : "You do not touch the water. Not yet. Some doors you knock on from a respectful distance first.",
                },
                Choices = new List<StoryChoice>
                {
                    new StoryChoice
                    {
                        Label = "Higher ➤",
                        GoDynamic = s => s.Is("GLYPH1") && s.Is("GLYPH2") && s.Is("GLYPH3") && !s.Is("VISION_SEEN")
                            ? "ch6_vision" : "ch6_tremor",
                    },
                },
            });

            script.Add(new StoryScene
            {
                Id = "ch6_vision",
                OnEnter = s =>
                {
                    if (s.Is("VISION_SEEN")) return;
                    s.SetFlag("VISION_SEEN");
                    s.AddRoute(RouteAxis.Depth, 3);
                    s.Stat(Meter.Hope, 4);
                },
                Text = _ => new List<string>
                {
                    "Before you leave the nave, the wall stops you.",
                    "You've been carrying the three glyph stones in your head for weeks — the spiral cut three ways, the re-carved line, the inlay that held your reflection late. And here, low on the temple's oldest course, where a casual eye slides past: all three marks TOGETHER, nested, a triple spiral the size of your spread hand — and worn into its center, polished by centuries of exactly this, a hollow.",
                    "At the height of your own palm. Like the one in the Gallery of Hands. You already know you're going to do it. You already know the island knows.",
                    "You place your hand in the hollow, at the turn of the tide —",
                    "— and you are standing on the Terrace of Steps under an UNBROKEN mountain, in air thick with a thousand cook-fires, and the sea below is full of wings: boats, hundreds of boats, sails like herons' wings, coming in to the first landing. Nine centuries deep. The arrival itself.",
                    "And on the great stair a woman turns — sea-speaker's hood, the spiral at her collar, the whole unfallen world at her back — and she looks AT you. Across everything. The way the pool looks at you. She is not surprised. She raises one hand, palm out: not a greeting. A <i>placing</i> — the gesture for setting a stone in a wall.",
                    "Then the tide turns fully, and you are on your knees in the drowned nave with your hand aching and the water running its seven beats, and eight hundred years of dust motes settling around you like something that has just moved through, going home.",
                },
                Next = "ch6_tremor",
                NextLabel = "Higher ➤",
            });

            script.Add(new StoryScene
            {
                Id = "ch6_tremor",
                OnEnter = s =>
                {
                    if (s.Is("TREMORS")) return;
                    s.SetFlag("TREMORS");
                    s.Stat(Meter.Hope, -4);
                },
                Text = s => new List<string>
                {
                    "The mountain moves on the third day.",
                    s.Companion == "kavi"
                        ? "Kavi knows first — a full minute first: he stops mid-stride, drops his head below his shoulders, and braces all four feet against ground that hasn't moved yet. Then the birds go up, every wing on the mountainside at once—"
                        : s.Companion == "buri"
                            ? "Buri knows first — a full minute first: he plants himself broadside across the trail ahead of you, an immovable roadblock with his snout to the stone, reading the mountain through his feet. Then the birds go up, every wing at once—"
                            : "The birds know first: every wing on the mountainside goes up at once, a rattling sheet of them against the blue—",
                    "Then the ground shrugs. Not violently — a long, muscular roll, like something enormous turning over in shallow sleep — but it goes ON, seven, eight, nine seconds, while the stair's ancient stones grate and settle and a slab of cliff lets go somewhere across the valley with a boom like the E-wing door.",
                    "Then stillness. Then, distinctly, twenty minutes later: again, smaller. And in the evening: again.",
                    "A ladder of tremors, climbing." + (s.Is("WOUND_SEEN")
                        ? " And you have seen the rungs' source with your own lamp: the guttering seam, the spiderweb crack around Halcyon's bore, the wound that never healed — flickering now in your memory in exact time with the ground's complaint. The island isn't stirring in its sleep. It's <i>favoring an injury</i>."
                        : s.Is("INCIDENT_FILES")
                            ? " Vane's last page stands up in your memory in her deliberate architecture: <i>If it ever begins skipping — I hope no one is here to read what that means.</i> You are here. You are reading it."
                            : " The skipping pulse, the stuttering lagoon, and now the ground itself. Whatever conversation the island has been having with itself all month, it is getting louder."),
                    s.Is("INNER_INVITED")
                        ? "Naia's face, through all of it, is the worst part: not surprised. Grim, and young, and <i>unsurprised</i>. \"Since the rains started,\" she says. \"Worse each week. It is why the old ones agreed to see you at all, castaway. Come. We are close — <i>at daylight</i>. The old ones wait for daylight. So does the mountain.\""
                        : "The summit is close now — a few hours' hard scramble, no more. The tremor ladder says the mountain would rather you didn't take them tonight.",
                },
                Choices = new List<StoryChoice>
                {
                    new StoryChoice
                    {
                        Label = "Camp on bedrock. Climb at first light.",
                        Sub = "The mountain has asked politely, three times, all day.",
                        Go = "ch6_inner",
                    },
                    new StoryChoice
                    {
                        Label = "Push for the rim tonight. The summit is CLOSE.",
                        Sub = "⚠️ A ladder of tremors, climbing, and crack-new rock in the dark. The people who live here wait for daylight, and they have four hundred years of reasons.",
                        Do = s => s.DeathCause = "ash",
                        GoDynamic = _ => null, // the run card takes it
                    },
                },
            });
        }

        // ---- the Inner Green, judged ------------------------------------------
        static void AddInner(StoryScript script)
        {
            script.Add(new StoryScene
            {
                Id = "ch6_inner",
                Speaker = "Tekau, Elder Speaker",
                OnEnter = s =>
                {
                    if (s.Is("INNER_JUDGED")) return;
                    s.SetFlag("INNER_JUDGED");
                    bool admitted = s.Is("INNER_INVITED") && Regard(s) >= 4;
                    if (admitted) { s.SetFlag("INNER_GREEN"); s.AddRoute(RouteAxis.Depth, 3); s.Stat(Meter.Hope, 8); }
                    else if (s.Is("INNER_INVITED")) { s.SetFlag("INNER_PROBATION"); s.AddRoute(RouteAxis.Depth, 2); }
                    else { s.SetFlag("RIM_ONLY"); s.AddRoute(RouteAxis.Depth, 2); }
                },
                Text = s =>
                {
                    var t = new List<string>
                    {
                        s.Companion == "kavi"
                            ? "The night on bedrock is long, and Kavi stands the whole of it — not sleeping, not pacing, just standing at the camp's uphill edge with his back to the fire, a grey wall between you and the mountain's bad mood. Twice the ground murmurs. Twice, without turning, he leans his weight back against your legs: <i>still here. Still held.</i>"
                            : s.Companion == "buri"
                                ? "Buri arranges himself uphill of your bedroll on the bare stone — windbreak, avalanche-break, two hundred pounds of deliberate placement — and sleeps in shifts you can hear change. When the ground murmurs after midnight he answers it: one low note through the stone under you, less a sound than a fact. The mountain has opinions. So does he."
                                : "The night on bedrock is the loneliest of the climb: no treeline, no surf, just you, a small fire guttering in thin air, and a mountain turning over in its sleep. Twice the ground murmurs and you sit up alone in the enormous dark — and find, both times, that what steadies you is the list itself: the fires built, the tolls paid, the hundred days of proof that you are harder to shake than ground.",
                        "The broken crown takes the last morning: a scramble up ash-slopes and rope-worn chimneys to the rim itself — and then the world ends, and starts over.",
                        "The caldera opens under you like a secret the size of a valley: two miles across, ringed in shattered crown-rock — and <i>green</i>. Not jungle-green: <i>garden</i>-green. Terraces, orchards, roofs of woven living trees, threads of smoke rising straight in the sheltered air, water gleaming in channels that run — you follow them with your eye and your breath goes — in spirals. A town. A living town, in the wound of the mountain, invisible to every chart, every plane, every year of the world since the seventeenth century.",
                        "The Inner Green. They went in. <i>They stayed in.</i>",
                    };
                    if (s.Is("INNER_GREEN"))
                    {
                        t.Add("They meet you on the rim path — a dozen of them, silent, watchful, dressed like Naia in the colors of the walls — and at their center an old man with a staff of black wood veined with "
                            + (CaseArc.KnowsGlass(s) ? "heartglass" : "a dark glass that holds your lamplight a half-beat too long")
                            + " and eyes like the Tidewell: Tekau, Elder Speaker, who looks at you for a long moment and then speaks in slow, rust-thick English, learned — you realize with a jolt — from the same decades of listening that taught Naia:");
                        t.Add("\"Castaway. Seventy days and more, the island has watched you.\" He begins, staff striking soft time on the stone, to recite — and it is your Ledger, spoken aloud on a mountaintop by a stranger: the fires you built and banked. The one you fed at your boundary. The toll you paid without blood. The graves you didn't disturb, the drawer you "
                            + (s.Is("FILES_BURNED") ? "burned" : s.Is("FILES_TO_EDDA") ? "carried, unopened, up a mountain" : "weighed")
                            + ", the hand you set in the hollow of a people you'd never met."
                            + (s.Companion == "kavi"
                                ? " And last, longest: \"…and the grey dog, who chose you, and stayed. The island speaks through its lives, castaway. That one's testimony outweighs the rest of this list.\""
                                : s.Companion == "buri"
                                    ? " And last, longest: \"…and the young tusker, who chose you, and stayed. The island speaks through its lives, castaway. That one's testimony outweighs the rest of this list.\""
                                    : ""));
                        t.Add("He lowers the staff. Behind him, Naia is not breathing. \"Come down,\" Tekau says simply, and turns. \"Guests eat first. It is a rule older than the mountain's temper.\"");
                        t.Add("You walk down into the Inner Green as the first outsider in three hundred and something years, and the town watches you pass with eyes like held questions — and children, at the edges, whose curiosity has already escaped custody entirely.");
                    }
                    else if (s.Is("INNER_PROBATION"))
                    {
                        t.Add("They meet you on the rim path — a dozen, silent — and their Speaker, an old man with a "
                            + (CaseArc.KnowsGlass(s) ? "heartglass-veined" : "glass-veined")
                            + " staff, hears Naia's long recitation of your month… and stops her, gently, with one raised hand, at the parts that weigh the other way: "
                            + (s.Is("GRIN_FOUGHT") ? "the blood you spilled in the landlord's water. " : "")
                            + (s.Is("INCIDENT_FILES") ? "The dead woman's drawer you opened against her asking. " : "")
                            + (s.Trust < 50 && s.Companion != null ? "The bond you let thin while you built. " : "")
                            + "The scales, his silence says, have not settled.");
                        t.Add("\"Not down,\" he says at last, in slow rust-thick English. \"Not yet. The mountain is troubled, and we are careful, and you are — new.\" He studies you, long and not unkindly. \"Stand at the water tonight, castaway. The Tidewell reads truer than lists. Then we will speak again.\"");
                        t.Add("You camp on the rim, above a hidden civilization and below the verdict, and Naia sits with you in the dark, furious on your behalf in two languages.");
                    }
                    else
                    {
                        t.Add("You lie flat on the rim-rock and watch the impossible town for an hour, heart hammering — and you are not surprised, somehow, when the watchers find you: three of them, rising out of the crown-rock where nothing was, spears grounded but present, faces closed.");
                        t.Add("No words reach across. They do not attack; they do not invite; they stand between you and the downward path with the settled patience of a wall, and one of them — youngest, fiercest, familiar in a way you can't place — points, once, back the way you came, and then, after a heartbeat's hesitation, at the temple below. <i>Not here. There.</i>");
                        t.Add("The island's people keep their door. But they have pointed you, unmistakably, at the water.");
                    }
                    return t;
                },
                Next = "ch6_threshold",
                NextLabel = "To the water ➤",
            });
        }

        // ---- THE TIDEWELL ------------------------------------------------------
        static void AddTidewell(StoryScript script)
        {
            script.Add(new StoryScene
            {
                Id = "ch6_threshold",
                Text = s => new List<string>
                {
                    "<i>THE TIDEWELL</i>",
                    "You come back down to the temple at dusk on the eighty-fourth day"
                        + (s.Is("INNER_GREEN") ? ", with Tekau and Naia and half the Inner Green's council standing back at the nave's edge — this part, their bearing says, is walked alone" : "")
                        + ", and the pool receives your lamplight and gives it back changed, seven beats at a time.",
                    "And standing at the water's edge, at the exact spot where fifty generations of painted keepers stood, you finally understand what this place is for. The knowledge doesn't arrive as words. It arrives the way the tide arrives — total, patient, indifferent to doubt: the pool is the island's <i>ear</i>. What is said here, in the old way, with a hand in the water at the turn of the tide, the island hears. The Kaari didn't worship here. They <i>governed</i> here — one keeper at a time, one covenant at a time.",
                    "The mountain grumbles, far below. The wound gutters at the bottom of everything. The water turns, and turns, and waits.",
                    "Three doors, castaway." + (s.Is("WOUND_SEEN") || s.Is("INCIDENT_FILES")
                        ? ""
                        : " (Two of them you can see the shape of; one, only its edges — this island still holds knowledge you didn't go and get.)"),
                },
                Choices = new List<StoryChoice>
                {
                    new StoryChoice
                    {
                        Label = "SILENCE IT. Guide the island to close the wound — and let the Hum die with it.",
                        Sub = "Compasses true. Radios clear. The world finds Vessakai within a decade — hospitals, harbors, and everything else the world brings. The lagoon never glows again.",
                        When = s => s.Is("WOUND_SEEN") || s.Is("INCIDENT_FILES"),
                        Do = s => { s.SetFlag("TIDEWELL_SILENCE"); s.AddRoute(RouteAxis.Signal, 2); s.AddRoute(RouteAxis.Depth, 1); s.SetFlag("CH6_DONE"); },
                        Go = "ch6_silence",
                    },
                    new StoryChoice
                    {
                        Label = "FEED IT. Give the island your strength to heal the wound — and keep the veil whole.",
                        Sub = "The Hum restored, the skipping ended, the island hidden as it has always been hidden. Every castaway after you arrives the way you did — and rescue stays a door the island holds shut.",
                        Do = s => { s.SetFlag("TIDEWELL_FEED"); s.AddRoute(RouteAxis.Depth, 2); s.AddRoute(RouteAxis.Roots, 1); s.SetFlag("CH6_DONE"); },
                        Go = "ch6_feed",
                    },
                    new StoryChoice
                    {
                        Label = "KEEP IT. Put your hand in the water and take the covenant: the island's keeper, for your lifetime.",
                        Sub = "Not a spell — a POST. Tend the skin, mind the wound, hold the balance between the veil and the world. The keepers' line, resumed after three centuries. With you.",
                        When = s => Regard(s) >= 4,
                        Do = s => { s.SetFlag("TIDEWELL_KEEP"); s.AddRoute(RouteAxis.Depth, 3); s.SetFlag("CH6_DONE"); },
                        Go = "ch6_keep",
                    },
                    new StoryChoice
                    {
                        Label = "WITNESS ONLY. Stand at the water, and choose not to choose for an island.",
                        Sub = "Some doors are too large for one season's standing. Leave the covenant to the people whose grandmothers built the pool.",
                        Do = s => { s.SetFlag("TIDEWELL_WITNESS"); s.AddRoute(RouteAxis.Roots, 1); s.SetFlag("CH6_DONE"); },
                        Go = "ch6_witness",
                    },
                },
            });

            script.Add(new StoryScene
            {
                Id = "ch6_silence",
                Text = _ => new List<string>
                {
                    "You kneel at the pool with the tide turning under your hand, and you show the island — the way the murals taught, image held behind the eyes like breath — the wound, and the bore, and the seam sealed, closed, HEALED: whole rock, silent rock, rock that no longer sings.",
                    "The water goes still. Wholly still, mid-beat — the first silence in that pool in ten thousand years — and the stillness spreads out and down and away from your hand, through the mountain, through the throat, along every glowing vein of the island's body like a held breath deciding.",
                    "Then, far below, you feel it begin: not violence. <i>Work.</i> A long, deep, grinding attention, turned at last — with your borrowed certainty for a lens — on its own oldest injury. The seam knitting. The song narrowing. The veil, thread by thread, beginning to thin.",
                    "You walk down the ten thousand stairs through an island already changing key. By the time you reach your beach the lagoon's glow is half what it was, and somewhere out past the horizon, on charts and instruments, a shape that was never there is quietly, patiently, beginning to exist.",
                    "The world is coming. You have chosen to be findable. Everything now happens in the light.",
                },
                Next = "ch6_end",
                NextLabel = "Chapter Six ends ➤",
            });
            script.Add(new StoryScene
            {
                Id = "ch6_feed",
                Text = _ => new List<string>
                {
                    "You kneel at the pool with the tide turning under your hand, and you offer the island the only medicine you've ever seen work on old wounds: <i>company</i>. Attention. The strength you'd spend on your own walls, pledged to its skin; your hours, its hours; keeper-work without the keeper's crown.",
                    "The water takes your hand the way the tide takes things — thorough, reading — and the seven-beat pulse comes up through your arm and settles into your own heartbeat like a second signature. Far below, the guttering steadies. Not healed — wounds this old don't heal on one dusk's pledge — but STEADIED, the flicker smoothing beat by beat, an injury finally splinted after fifty years of favoring.",
                    "The tremors stop that night. The lagoon, when you come down the mountain, burns brighter than you've ever seen it — the whole bay keeping time like a lit clock — and the veil over Vessakai, which had begun to fray, is whole.",
                    "The island stays hidden. The world stays out. And every plane and hull the Hum draws in from this night on arrives into YOUR care — the price of the veil, payable forever, first at your fire.",
                },
                Next = "ch6_end",
                NextLabel = "Chapter Six ends ➤",
            });
            script.Add(new StoryScene
            {
                Id = "ch6_keep",
                Text = s => new List<string>
                {
                    "You put your hand in the water at the turn of the tide, and you say yes.",
                    "What answers is not a voice. It is the island ARRIVING — the whole of it, at once, through your palm: every reef and root of it, the Green Deep's breathing dark, the Boar King's roads, Old Grin's patient channels, the wound's guttering ache, the Inner Green's two thousand sleeping heartbeats, the drowned fuselage, your own banked fire on your own far beach — all of it settling over your shoulders with the exact weight of the word you just gave. Not power. <i>Care.</i> A parish the size of a sea.",
                    s.Is("INNER_GREEN")
                        ? "Behind you, stone grates on stone: Tekau and the council, kneeling — not to you; with you, at the water their grandmothers kept. \"Three hundred years,\" the old man says quietly, \"we kept the pool and could not fill the post. It wanted what we could not give it: someone who chose this island freely, from the whole world's worth of elsewhere.\" A hand, old and dry and strong, closes on your shoulder. \"Keeper. There is a great deal of work.\""
                        : "And behind you, unbidden, the memory of the last mural stands up: the hooded figure, hand extended, facing out of the wall. Waiting three hundred years. You understand, finally, at whom.",
                    s.Companion == "kavi"
                        ? "Kavi watches you rise from the water, dripping, changed — and does the perfect thing, the companion's eternal thing: treats you exactly as before. Some posts are held alone. Yours, at least, comes with staff."
                        : "You rise from the water alone, dripping, changed — keeper of an island, population: every living thing on it, and one coconut.",
                    "The tremors gentle that same night — not cured; <i>attended</i>. There is, as the old man says, a great deal of work.",
                },
                Next = "ch6_end",
                NextLabel = "Chapter Six ends ➤",
            });
            script.Add(new StoryScene
            {
                Id = "ch6_witness",
                Text = _ => new List<string>
                {
                    "You stand at the water's edge a long time — long enough for the tide to turn twice under the lamplight — and you keep your hands at your sides.",
                    "It isn't fear, or not only. It's the oldest arithmetic you own, the one the island itself taught you: <i>take only what you can tend.</i> One season's standing does not tend an island. A keeper chosen by accident of shipwreck, deciding the fate of a veil that shelters two thousand living descendants — that isn't covenant. That's conquest with better manners.",
                    "So you witness. You let the pool read you — it does; you feel it file you, gently, like a glyph — and you step back, and you bow to the water because your body insists on doing SOMETHING, and you leave the covenant where you found it: with the people whose grandmothers built the pool.",
                    "On the rim path down, Naia falls in beside you, and after a mile she says, not looking at you: \"The old ones will hear what you didn't do.\" A pause. \"It will weigh more than everything you did.\"",
                },
                Next = "ch6_end",
                NextLabel = "Chapter Six ends ➤",
            });

            script.Add(new StoryScene
            {
                Id = "ch6_end",
                Text = s =>
                {
                    var t = new List<string>
                    {
                        "<i>END OF CHAPTER SIX — ASHES AND STAIRS</i>",
                        "Five days on the mountain, as the Ledger will keep them:",
                        "— The Terrace of Steps carried you up its grandmothers' road; the Tidewell Temple showed you the island's ear, and the unbroken line of painted keepers ending in an extended hand.",
                        "— The mountain moved beneath you, a ladder of tremors climbing"
                            + (s.Is("WOUND_SEEN") ? " — and you alone on this island have seen the rungs' source with your own lamp." : "."),
                        "— The Inner Green: " + (s.Is("INNER_GREEN")
                            ? "they opened their door. Tekau recited your month back to you on the rim, and you walked down into a town three centuries hidden as its first guest — and ate first, by a rule older than the mountain's temper."
                            : s.Is("INNER_PROBATION")
                                ? "you stood at the rim of a living secret and were weighed, and the scales did not settle. \"The Tidewell reads truer than lists.\""
                                : "you saw it from the rim — the garden in the wound, the roofs of living trees — and its watchers pointed you, unmistakably, at the water."),
                        "— And at the Tidewell: " + (s.Is("TIDEWELL_SILENCE")
                            ? "you chose the world. The wound closes; the Hum dies; the veil thins; Vessakai begins, quietly, to exist. Everything now happens in the light."
                            : s.Is("TIDEWELL_FEED")
                                ? "you chose the veil. The wound is splinted with your pledged strength; the lagoon burns like a lit clock; the island stays hidden — and everything the Hum reels in is yours to receive, forever."
                                : s.Is("TIDEWELL_KEEP")
                                    ? "you put your hand in the water and took the covenant. Keeper of Vessakai — the post refilled after three hundred years, with a parish the size of a sea and, as the old man says, a great deal of work."
                                    : "you witnessed, and chose not to choose for an island — and left the covenant with the people whose grandmothers built the pool. Naia says it will weigh more than everything you did."),
                        $"Route standings — Signal {s.Route.Signal} · Roots {s.Route.Roots} · Depth {s.Route.Depth}.",
                    };
                    return t;
                },
                Next = "ch7_open",
                NextLabel = "Continue — Chapter Seven: Convergence ➤",
            });
        }
    }
}
