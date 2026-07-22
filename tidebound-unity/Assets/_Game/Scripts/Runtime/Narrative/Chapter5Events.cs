using System.Collections.Generic;

namespace Tidebound.Narrative
{
    /// <summary>
    /// Chapter Five — The Long Rain (days 53–70): the monsoon crucible.
    /// The season commits to one master plan — THE COUNTDOWN (sea), THE
    /// HOMESTEAD (roots), or THE DESCENT (depth) — and the chapter's spine
    /// runs that variant over shared monsoon survival, the cyclone night
    /// (CycloneNight.cs, already on the calendar), and Edda's failing
    /// season. Ported from scenes-chapter5.js; effects pinned by
    /// Chapter5Tests. V1 adaptations per precedent: no hard clock reset,
    /// tickSegment folded into effects. GameState.IsMonsoon keys off
    /// Chapter 5, so the survival drains turn monsoon by themselves.
    /// </summary>
    public static class Chapter5Events
    {
        /// <summary>Injected randomness (the deep-greed gamble) so tests stay deterministic.</summary>
        public static System.Func<float> Rng = () => UnityEngine.Random.value;

        public static void AddTo(StoryScript script)
        {
            AddOpen(script);
            AddCountdown(script);
            AddHomestead(script);
            AddDescent(script);
            AddEddaSeason(script);
            AddFinale(script);
        }

        // ---- day 53: the change of government --------------------------------
        static void AddOpen(StoryScript script)
        {
            script.Add(new StoryScene
            {
                Id = "ch5_open",
                OnEnter = s => { if (s.Chapter < 5) s.Chapter = 5; },
                Text = s => new List<string>
                {
                    "<i>CHAPTER FIVE — THE LONG RAIN</i>",
                    "It arrives on the fifty-third day, not as a storm but as a <i>change of government</i>: the southern wall walks ashore at dawn and the sky becomes a low grey ceiling that has no further interest in negotiation. Rain — warm, vertical, endless — becomes the medium you live in. The lagoon's glow blurs to a haze. Thunder moves in upstairs, permanently, like bad neighbors.",
                    "Edda's verdict, shouted cheerfully over the drumming when you last saw her: <i>\"Three weeks of this, castaway, give or take the mountain's mood. The rain solves your water and rots everything else. Whatever you meant to do with your season — you do it IN this, or not at all.\"</i>",
                    $"She's right, and you feel it: the monsoon is a crucible, and a crucible only shapes what commits. Your hands, your hours, your allies' strength — one master plan gets them. The Ledger's tally so far — Signal {s.Route.Signal} · Roots {s.Route.Roots} · Depth {s.Route.Depth} — leans where it leans. The choice is still yours.",
                },
                Choices = new List<StoryChoice>
                {
                    new StoryChoice
                    {
                        Label = "THE COUNTDOWN — the season bends toward leaving.",
                        Sub = "Voice, vessel, horizon: build the way out.",
                        Do = s => { s.Plan = "sea"; s.AddRoute(RouteAxis.Signal, 2); s.SetFlag("CH5_SEA"); },
                        Go = "ch5_committed",
                    },
                    new StoryChoice
                    {
                        Label = "THE HOMESTEAD — the season bends toward staying.",
                        Sub = "Farm, granary, hearth: build the life.",
                        Do = s => { s.Plan = "home"; s.AddRoute(RouteAxis.Roots, 2); s.SetFlag("CH5_HOME"); },
                        Go = "ch5_committed",
                    },
                    new StoryChoice
                    {
                        Label = "THE DESCENT — the season bends toward the answer.",
                        Sub = "The skipping pulse has a source. Find it.",
                        Do = s => { s.Plan = "deep"; s.AddRoute(RouteAxis.Depth, 2); s.SetFlag("CH5_DEEP"); },
                        Go = "ch5_committed",
                    },
                },
            });
            script.Add(new StoryScene
            {
                Id = "ch5_committed",
                Text = s => new List<string>
                {
                    s.Plan == "sea"
                        ? "The Countdown, then. You say it out loud to the rain, and the rain applauds without opinion. Every dry hour this season now has an owner: the voice, the vessel, the way out."
                        : s.Plan == "home"
                            ? "The Homestead, then. You say it to the rain, and the saying changes the rain: it stops being a siege and becomes, at a stroke, <i>irrigation</i>. Every wet hour this season now has an owner: the ground, and what you'll raise from it."
                            : "The Descent, then. You say it quietly, and the thunder upstairs rolls over once like something turning in its sleep. Every surge-lull this season now has an owner: the throat under the mountain, and the wound that's skipping.",
                    "The Long Rain has your answer. Now it gets to test it.",
                },
                NextLabel = "Into the season ➤",
            });
        }

        // ==================================================================
        //  VARIANT A — THE COUNTDOWN
        // ==================================================================
        static void AddCountdown(StoryScript script)
        {
            script.Add(new StoryScene
            {
                Id = "ev5_sea1",
                OnEnter = s =>
                {
                    if (s.Is("SEA1")) return;
                    s.SetFlag("SEA1");
                    if (s.Is("RADIO_STAGED"))
                    {
                        s.SetFlag("RADIO_DONE");
                        if (s.Is("PULSE2") || s.Is("RECORDER")) s.SetFlag("WINDOW_PLAN");
                    }
                    else s.SetFlag("BOAT_PUSH");
                    s.AddRoute(RouteAxis.Signal, 2);
                    s.Stat(Meter.Energy, -8);
                },
                Text = s => s.Is("RADIO_DONE")
                    ? new List<string>
                    {
                        "Assembly day. You cross at the cold hour with everything dry wrapped twice, and give the radio room the longest, most careful day of work you've done since the crash: transmitter seated and torqued, cable dressed and soldered, the generator fed its filtered fifty-year diesel and coaxed, coughing, shuddering, <i>running</i>.",
                        "At dusk you flip the main bus, and the console — dead since the year of the interrupted breakfast — lights amber and hums.",
                        "And that's the problem. Everything hums. You put on the operator's phones and sweep the bands and hear the island's field lying over every frequency like deep water: the seven-beat chorus, vast and total, drowning your little transmitter's voice in its own. You broadcast anyway, an hour of it. It's like shouting into the sea.",
                        s.Is("WINDOW_PLAN")
                            ? "But walking home along the loud dark shore, the thought arrives with the force of a shove: <i>the pulse skips now.</i> You've heard it. You've inked it on the drum. For those held black seconds, the island's voice stops — and a window with nothing in it will carry ANY voice. You stop dead in the rain, doing the beautiful arithmetic. You don't need to out-shout the Hum. You need to speak in its rests."
                            : "You walk home through the loud dark with the failure riding your shoulders, missing something — you can feel it, a thought that won't finish. The sea drums. The lagoon pulses its seven beats through the haze. Somewhere in that rhythm is a thing you know and haven't noticed you know.",
                    }
                    : new List<string>
                    {
                        "No station radio for this plan — the sea path you've chosen runs on hull and canvas. You give the day to the vessel: "
                            + (s.Is("RYO_MET")
                                ? "the Kingfisher's last two strakes, her fished mast, her patched suit of sails, Ryo working opposite you plank for plank with the monsoon drumming the upturned hull like impatience."
                                : "the raft — your raft, the third and by far the least embarrassing of your designs — lashed frame, sealed floats, a mast you can step alone, a steering oar you've learned to trust."),
                        "By dark the shape under the tarps is unmistakably a going-somewhere shape. The rain drums on it. You lie awake listening, doing sums about weather windows.",
                    },
            });
            script.Add(new StoryScene
            {
                Id = "ev5_sea2",
                Speaker = "Ryo Nakata",
                OnEnter = s =>
                {
                    if (s.Is("SEA2")) return;
                    s.SetFlag("SEA2");
                    s.SetFlag("VESSEL_READY");
                    s.AddRoute(RouteAxis.Signal, 2);
                    if (s.Is("RYO_MET")) s.Ryo = s.Ryo + 6 > 100 ? 100 : s.Ryo + 6;
                    s.Stat(Meter.Hope, 6);
                },
                Text = s => new List<string>
                {
                    s.Is("RYO_MET")
                        ? "The Kingfisher swims on the sixtieth day. You and Ryo walk her down the rollers into the lagoon between squalls and she takes the water like an apology accepted — low, patched, graceless, and <i>floating</i>, bailing-bucket dry through a full hour of sea trial inside the reef."
                        : "The raft swims on the sixtieth day. You walk her down the rollers between squalls and pole out into the lagoon, and she carries you — you, your weight, your gear-weight, a deliberate soaking capsize test and remount — through a full hour of trial inside the reef.",
                    s.Is("RYO_MET")
                        ? "Ryo brings her about at the reef gate and holds there a moment, bow to the open sea, canvas trembling, and you watch him look at the horizon the way the starving look at bread. \"After the rains,\" he says — steady, a promise to the boat as much as you. \"First fair window. She'll be ready. Will—\" and he doesn't finish it, again, and the question stands in the cockpit between you like a third sailor."
                        : "At the reef gate you hold a moment, bow to the open sea, and let yourself feel the full size of what a working vessel means: that door out there is no longer locked. Only closed, and weathered, and yours to choose.",
                    "The monsoon slams the window shut within the hour, of course. But the sea trial holds in your chest all day, bright as the flare you did or didn't fire: <i>it can be done.</i>",
                },
            });
            script.Add(new StoryScene
            {
                Id = "ev5_sea3",
                OnEnter = s =>
                {
                    if (s.Is("SEA3")) return;
                    s.SetFlag("SEA3");
                    if (s.Is("RADIO_DONE")) { s.SetFlag("CONTACT_MADE"); s.AddRoute(RouteAxis.Signal, 3); s.Stat(Meter.Hope, 10); }
                    else { s.SetFlag("LANE_SEEN"); s.AddRoute(RouteAxis.Signal, 2); s.Stat(Meter.Hope, 5); }
                },
                Text = s => s.Is("RADIO_DONE")
                    ? new List<string>
                    {
                        "The sixty-sixth night, you keep vigil at the radio with a flask of Edda's tea and the chart recorder's drum turning beside you like a patient heart"
                            + (s.Is("WINDOW_PLAN") ? ", waiting for the skip." : ", still hunting the thought you can't finish — until, past midnight, watching the needle draw its seventh tooth, it finishes itself: <i>the skips. Speak in the rests.</i>"),
                        "At 2:14 the needle drops flat.",
                        "You key the transmitter into dead air — <i>\"MAYDAY MAYDAY MAYDAY, this is survivor of downed aircraft, island position unknown, at least two souls, DO YOU COPY\"</i> — once, twice, the black window standing open around your voice like held breath—",
                        "—and the phones crackle, distant as another life, human as a heartbeat: <i>\"—station calling MAYDAY, copy you broken, say again your posi—\"</i>",
                        "The seventh beat slams back down over everything. The window closes. The Hum rolls on, vast and total, and you sit in the amber light with your pulse everywhere, having heard — for four seconds, for the first time in sixty-six days — <i>the world</i>.",
                        "They copied. Broken, but they copied. Someone, somewhere, has a bearing on a ghost — and every skip from now on is a door you know how to knock through.",
                    }
                    : new List<string>
                    {
                        "The sixty-seventh day you provision like a navigator: water in every vessel, smoked stores wrapped and wrapped again, the sea-anchor rigged, Edda's hand-drawn current notes (she'd pressed them on you with insults) sealed in wax against the chart-lack.",
                        "And at dusk, between squalls, the sea sends its answer to your season of work: far out, hull-down on the streaming horizon, running lights — a ship, real, the first since the flare-light of Day 3 — crossing south to north, oblivious, <i>there</i>.",
                        "You stand in the rain and watch it the whole way across, and this time it doesn't hollow you out. This time you have a vessel above the tideline and trial-hours in her log, and the sight files itself not as grief but as <i>traffic report</i>: the lane is out there. The lane is reachable. After the rains.",
                    },
            });
        }

        // ==================================================================
        //  VARIANT B — THE HOMESTEAD
        // ==================================================================
        static void AddHomestead(StoryScript script)
        {
            script.Add(new StoryScene
            {
                Id = "ev5_home1",
                OnEnter = s =>
                {
                    if (s.Is("HOME1")) return;
                    s.SetFlag("HOME1");
                    s.SetFlag("FARM");
                    s.AddRoute(RouteAxis.Roots, 3);
                    s.Stat(Meter.Energy, -12);
                    s.Stat(Meter.Hope, 6);
                },
                Text = s => new List<string>
                {
                    "Planting day. You choose your ground the way the season taught you: "
                        + (s.Is("GLYPH2")
                            ? "the old Kaari terrace, cleared back to its dry-laid wall — ground that was a farm before your language existed, drained and leveled by hands that knew this exact rain."
                            : "the high fringe flat behind camp, ditched and mounded against the wet."),
                    s.Is("SEEDS")
                        ? "Halcyon's seed cabinet gives up its dead and its living: half the foil packets are dust, but the heavy-foil rice runs a sprout test at nearly full strength, the beans wake up angry, and the feral tomatoes transplant like they've been waiting fifty years for staff."
                        : "Your stock is the island's own: taro crowns from the river margins, yam vines, seagrape cuttings, the breadfruit saplings you've been nursing — wild things half-tamed, like everything else you love here.",
                    "By dark it's in the ground — all of it, everything you have to bet, planted into the loudest, wettest, most generous season the sky owns. Farming, you realize, standing soaked and filthy in the last light, is just hope with drainage.",
                },
            });
            script.Add(new StoryScene
            {
                Id = "ev5_home2",
                OnEnter = s => { if (!s.Is("HOME2")) s.SetFlag("HOME2"); },
                Text = _ => new List<string>
                {
                    "On the sixtieth day the Silverthread stands up.",
                    "You hear it change in the night — the voice dropping an octave — and by grey dawn the river is twice itself, tea-brown and muscled, eating its banks in slabs. And it is reaching, with the season's first real malice, for everything you've built downslope of it.",
                    "You have one streaming morning to answer.",
                },
                Choices = new List<StoryChoice>
                {
                    new StoryChoice
                    {
                        Label = "Dike the farm — trench and mound the upslope line, hold the ground.",
                        Sub = "Brutal hours. The crop is the season.",
                        Do = s => { s.SetFlag("FLOOD_DIKED"); s.Stat(Meter.Energy, -16); s.AddRoute(RouteAxis.Roots, 2); },
                        Go = "ev5_home2_diked",
                    },
                    new StoryChoice
                    {
                        Label = "Save the stores first — the granary, the tools, the seed reserve.",
                        Sub = "The crop can be regrown from what you hold back. Nothing regrows the granary.",
                        Do = s => { s.SetFlag("FLOOD_STORES"); s.Stat(Meter.Energy, -12); },
                        Go = "ev5_home2_stores",
                    },
                },
            });
            script.Add(new StoryScene
            {
                Id = "ev5_home2_diked",
                Text = s => new List<string>
                {
                    "You dike. Hours of it, mud to the thighs, "
                        + (s.Is("RYO_MET") && s.Ryo >= 40 ? "Ryo opposite you matching you shovel for shovel and singing something filthy in three languages, " : "")
                        + "the river arriving even as you work — and the line <i>holds</i>. Brown water noses along your trench, sulks, and takes the old channel instead.",
                    "You stand on the mound at dusk, destroyed and victorious, watching your rows drink the flood's edges from behind their wall. The homestead just paid its first real tax and kept its first real ground.",
                },
            });
            script.Add(new StoryScene
            {
                Id = "ev5_home2_stores",
                Text = _ => new List<string>
                {
                    "You make the cold call: the stores. Everything portable goes up — the seed reserve, the smoked cache, the tools, load after streaming load to the high ground — while the river takes its bite of the low rows and chews.",
                    "By dusk the flood crests and falls short of ruin: a third of the planting drowned, the rest silt-fed and, Edda will tell you later, better for it. Your reserve is dry to the last packet. You lost a battle to armor the war, and you'd do it again.",
                },
            });
            script.Add(new StoryScene
            {
                Id = "ev5_home3",
                Speaker = "The Boar King",
                OnEnter = s => { if (!s.Is("HOME3")) s.SetFlag("HOME3"); },
                Text = _ => new List<string>
                {
                    "On the sixty-sixth dusk, the Boar King comes to the homestead — and this time is not like the other times.",
                    "He comes slow. He comes <i>light</i> — the monsoon has stripped him; the scar-plated bulk hangs on him now like borrowed armor, and the small furious eyes have gone hollow at the rims. The flood has drowned the tuber flats; the mast crop rotted early; the inland is starving its king.",
                    "He stops at your boundary — at the exact line of it, which he has never once honored before — and stands in the rain, swaying slightly, watching your fire and your fat granary. Not raiding. <i>Standing.</i> Asking, in the only grammar a king has left when the kingdom fails.",
                },
                Choices = new List<StoryChoice>
                {
                    new StoryChoice
                    {
                        Label = "Feed him. Openly, largely, from the winter stores.",
                        Sub = "It will cost real reserve. Some debts run ahead of reason.",
                        Do = s =>
                        {
                            s.SetFlag("KING_FED");
                            s.SetFlag("KING_ALLY");
                            if (s.Food > 0) s.Food = s.Food >= 2 ? s.Food - 2 : 0;
                            s.Stat(Meter.Hunger, -6);
                            s.AddRoute(RouteAxis.Roots, 2);
                            s.Stat(Meter.Hope, 6);
                        },
                        Go = "ev5_home3_fed",
                    },
                    new StoryChoice
                    {
                        Label = "Hold the line. Sympathy is not a food surplus.",
                        Sub = "The stores are the winter. The winter is everyone you feed already.",
                        Do = s => { s.SetFlag("KING_REFUSED"); s.AddRoute(RouteAxis.Roots, 1); },
                        Go = "ev5_home3_refused",
                    },
                },
            });
            script.Add(new StoryScene
            {
                Id = "ev5_home3_fed",
                Text = _ => new List<string>
                {
                    "You carry it out to him yourself — an armload of yams and flood-spoiled rice, laid on the boundary stone — and step back, and stand in the rain at a respectful distance while the old veteran eats like the starving eat: carefully, forcing slowness, dignity gripped in both tusks.",
                    "When he's done he does not leave. He raises the great scarred head and looks at you — a long, level, unhurried accounting — and then he walks the boundary of your homestead, once, the full circuit, and puts his shoulder against the biggest fence post gently, like a signature, and goes.",
                    "Whatever you just bought, it wasn't bought with yams.",
                },
            });
            script.Add(new StoryScene
            {
                Id = "ev5_home3_refused",
                Text = _ => new List<string>
                {
                    "You stand at the boundary with a brand in the rain and do not move, and you make yourself meet the hollow eyes while you do it. The arithmetic is what it is: the granary is Edda's winter, Ryo's recovery, your companion's meals, your own margin. Kings fall. Households don't have to fall with them.",
                    "He holds a long minute — the rain hammering both of you — and then turns and goes back into the failing dark, unhurried even now, and the last you see of him is the drenched grey rampart of his back.",
                    "You bar nothing that night. He was never going to charge. That, somehow, is the heaviest part to carry to bed.",
                },
            });
        }

        // ==================================================================
        //  VARIANT C — THE DESCENT
        // ==================================================================
        static void AddDescent(StoryScript script)
        {
            script.Add(new StoryScene
            {
                Id = "ev5_way1",
                Text = s => new List<string>
                {
                    "You wake on the fifty-sixth day already listening, and the river tells you before the sky does: the surge is easing. The first great lull of the season — the first of three, if the monsoon keeps its usual book — arrives at dusk.",
                    "This is what you chose when the rain began. The Descent: the throat under the mountain, the wound that skips, the plan every surge-lull now belongs to. So you spend the day the way a plan deserves — lamps trimmed and oiled, spare brand wrapped dry, chalk for the high-water marks, line coiled over one shoulder"
                        + (s.Companion != null ? ", your companion watching the kit come together and understanding, in the way of animals before weather, exactly what kind of day this is" : "")
                        + " — and at slack light you walk the river path upstream, to where the waterfall stands guard over the grotto's dark gap.",
                    "The grotto breathes at you. Slow, wet, seven to the exhale. Behind the falling water, the gap waits — and for one long moment you stand on the honest surface of the world with the kit on your back, and let yourself understand that you are about to leave it.",
                },
                Next = "ev5_deep1",
                NextLabel = "Behind the waterfall, and down ➤",
            });
            script.Add(new StoryScene
            {
                Id = "ev5_way2",
                Text = s => new List<string>
                {
                    "The second lull comes on the sixtieth morning, and this time you know the road.",
                    "You kit up in the grey first light — lamps, line, chalk, the dry-wrapped brand — and add what the first descent taught you to want: food you can eat one-handed, and a second coil of line, because the throat goes deeper than one coil's worth of trust. "
                        + (s.Is("GULLET_MAP")
                            ? "Vane's tide tables give you the lull's exact width, which is the difference between an expedition and a dare."
                            : "You gave yesterday's watch to the grotto's breathing, counting its exhales against the tide, and you think — think — you have the lull's width. It will have to do."),
                    "The waterfall is thinner today, the gap behind it wider, and the breathing from below has a new note in it — lower, more interested — as if the island noticed the chalk marks you left and has been reading them. You check the lamp once more than you need to, and go in.",
                },
                Next = "ev5_deep2",
                NextLabel = "Down the throat again ➤",
            });
            script.Add(new StoryScene
            {
                Id = "ev5_way3",
                Text = s => new List<string>
                {
                    "The sixty-sixth brings the season's deepest lull — the monsoon drawing one long breath before its last act — and you have known for two days what you would spend it on: the Heartroom. The wound itself. The bottom of the plan.",
                    "You pack like a person intending to come back: every lamp, both coils, the chalk worn to a stub, food, the med-roll"
                        + (s.Is("HEARTGLASS") ? ", and the heartglass spur, which has pulsed on your shelf like a kept promise since you carried it out" : "") + ". "
                        + (s.Companion != null
                            ? "At the fire, your companion does the arithmetic of the kit and stations themselves at the path's mouth — coming as far as the grotto, then keeping the surface, keeping the light, keeping the way home open. Someone has to hold the door."
                            : "You bank the fire high before you go — a light to come home to, lit by the only hands available for the job."),
                    "The river path, the waterfall, the breathing gap: familiar now, which the deep part of you knows enough to distrust. Third time down. Deepest line yet. The grotto exhales its seven-beat welcome, and you answer it out loud — \"yes, yes, I'm coming\" — and step through the water into the dark.",
                },
                Next = "ev5_deep3",
                NextLabel = "To the Heartroom ➤",
            });

            script.Add(new StoryScene
            {
                Id = "ev5_deep1",
                OnEnter = s =>
                {
                    if (s.Is("DEEP1")) return;
                    s.SetFlag("DEEP1");
                    s.SetFlag("GULLET1");
                    s.AddRoute(RouteAxis.Depth, 3);
                    s.Stat(Meter.Energy, -12);
                },
                Text = s => new List<string>
                {
                    "The Gullet takes you on the fifty-sixth day, at the surge-lull "
                        + (s.Is("GULLET_MAP") ? "Vane's tide tables name to the minute" : "you've gambled out of three days of watching the grotto breathe")
                        + ": behind the waterfall, through the gap, down the throat of the island.",
                    "It is a drowned world that empties twice a day and resents it. Walls sea-smoothed a hundred feet above the sea; galleries that boom with the far surge like a held word; and everywhere, threading the black rock in veins and lenses — <i>heartglass</i>, dark and glassy, catching your lamp and returning it a half-beat late, so that you walk in a crowd of your own delayed reflections.",
                    "The seven-beat pulse doesn't glow down here — it <i>sounds</i>: felt in the breastbone, in the water, in the rock under your palms, the island's voice heard at last from inside the instrument.",
                    "You go as deep as the lull allows and mark your high-water line like a debt, and climb out with the surge already talking behind you. Day one of the throat. It knows you were there.",
                },
            });
            script.Add(new StoryScene
            {
                Id = "ev5_deep2",
                OnEnter = s =>
                {
                    if (s.Is("DEEP2")) return;
                    s.SetFlag("DEEP2");
                    s.SetFlag("GULLET2");
                    s.SetFlag("SUNDERING_SEEN");
                    s.AddRoute(RouteAxis.Depth, 3);
                    s.Stat(Meter.Hope, 4);
                },
                Text = _ => new List<string>
                {
                    "The second descent finds the Gallery of Hands.",
                    "It opens off the main throat where the sea never quite reaches: a dry vault, breath-still, and your lamp goes up the wall and your heart goes with it — <i>paintings</i>. A ceiling of them, a cathedral of them, ochre and char and heartglass-dust that glitters as the light moves:",
                    "The mountain, whole, its crown unbroken, wearing its spiral like a badge. The sea drawn as a woman with seven arms. Boats — hundreds of boats, sails like wings, coming ashore in procession. Fields. Terraces. The island fat and worked and loved.",
                    "Then: the mountain <i>opening</i>. The crown shattering outward in painted fire, the sea-woman rearing, boats and fields going under a wave drawn with terrible honesty. And then the last panel, largest, the one they clearly built this vault to hold: the survivors — small painted rows of them, carrying children and fire and seed — walking not to their boats but <i>into the broken mountain itself</i>, into a painted door in the caldera's side, above a spiral drawn larger than everything, and around that spiral, hundreds upon hundreds of stenciled hands. Small hands. Large hands. Hands with missing fingers. A whole people, signing.",
                    "They didn't die. They didn't leave. <i>They went in.</i> And below the great spiral, in the stone itself, worn to a gloss by centuries of touching: one hand-hollow, at exactly the height of your own.",
                    "You stand a very long time in the drum of the far surge. Then you put your hand in the hollow, because there is no version of you that doesn't.",
                },
                Choices = new List<StoryChoice>
                {
                    new StoryChoice
                    {
                        Label = "Mark your line and climb out with the surge, as planned.",
                        Sub = "The tide-clock is the only law down here. Honor it.",
                        Do = s => s.AddRoute(RouteAxis.Depth, 1),
                    },
                    new StoryChoice
                    {
                        Label = "Press past the marked line. The lull might hold.",
                        Sub = "⚠️ The Gallery's painters drew the sea as a woman with seven arms. They knew her. You are gambling that she's slow today.",
                        Do = s =>
                        {
                            if (Rng() < 0.35f) { s.DeathCause = "dark"; return; }
                            s.SetFlag("HEARTGLASS");
                            s.SetFlag("DEEP_GREED_PAID");
                            s.AddRoute(RouteAxis.Depth, 2);
                            s.Stat(Meter.Energy, -12);
                        },
                        GoDynamic = s => s.DeathCause != null ? null : "ch5_deepgreed",
                    },
                },
            });
            script.Add(new StoryScene
            {
                Id = "ch5_deepgreed",
                Text = _ => new List<string>
                {
                    "Past the marked line the throat narrows and brightens at once — the heartglass veins thickening toward the seam's true body, the walls alive with your own delayed reflections — and there, in a surge-scoured pocket, you find what the wound has been shedding: a spur of heartglass the size of your forearm, fallen clean, pulsing its seven beats in your hands like a warm, slow instrument.",
                    "You are still wrapping it when the sea clears her throat below you.",
                    "The climb out is the worst twenty minutes of your island life: the lull failing early, the boom of the returning surge chasing you gallery by gallery, black water taking the marked line behind your heels — and then daylight, and the grotto's mouth, and your legs giving out on honest stone.",
                    "You have the spur. The sea, this once, let the gamble stand. You lie on your back listening to the throat roar shut below, and make the tide a promise you intend to keep about never, ever doing that again.",
                },
            });
            script.Add(new StoryScene
            {
                Id = "ev5_deep3",
                Speaker = "The watcher",
                OnEnter = s =>
                {
                    if (s.Is("DEEP3")) return;
                    s.SetFlag("DEEP3");
                    s.SetFlag("NAIA_MET");
                    s.SetFlag("WOUND_SEEN");
                    s.AddRoute(RouteAxis.Depth, 3);
                },
                Text = s => new List<string>
                {
                    "The third descent goes for the Heartroom — and the island has run out of patience with your progress.",
                    "You find the wound first. "
                        + (s.Is("GULLET_MAP") ? "It is exactly where Vane's pencil hatched it" : "You find it the way you'd find a wound blind: by the wrongness")
                        + ": a side gallery where the old bore comes down through the ceiling like a scar through skin — rusted casing, fifty years of mineral weep — and around it the heartglass seam is <i>cracked</i>. Not clean lamp-lit veins here: a spiderweb of fractures radiating from the bore, and the light in them doesn't pulse. It <i>gutters</i>. Runs its seven beats, drops one, stutters, resumes — the skip, found at its source, leaking around a wound that has never healed. The whole gallery flickers like a failing bulb the size of a room.",
                    "You are still standing in it, cold to the bones in a way the water doesn't explain, when the voice comes from the dark behind you — human, young, accented like nothing you've ever heard, in careful, furious English:",
                    "<i>\"Stop.\"</i>",
                    "She steps into your lamplight like she's been part of the dark all along — early twenties, barefoot on wet stone that has been cutting your boots, dressed in woven stuff the color of the walls, a heartglass lamp cold in one hand and a very functional bone knife loose in the other. And her face is a war: fear, discipline, and a curiosity so fierce it keeps breaking through the other two.",
                    "\"Edda's words,\" she says — tapping her own mouth: <i>explaining herself</i>, absurdly, in the middle of it. \"I learn from listening. Many years, listening her.\" The knife-hand gestures — controlled, precise — at the guttering wound, the bore, the whole flickering room. \"The last ones who touched — the island closed their door on them. You—\" and here the fury slips and the curiosity floods through, helpless, and she looks at you the way you looked at the Gallery of Hands: \"—<i>you</i> put your hand in the hollow. We watched. I watched. Since the first fire on your beach, castaway. Sixty-six days, I watch you.\" A breath. The knife goes away. \"So. Not further. Please. And — hello.\"",
                    "<i>The watcher has a face now.</i>",
                },
            });
        }

        // ==================================================================
        //  SHARED: Edda's failing season (day 63)
        // ==================================================================
        static void AddEddaSeason(StoryScript script)
        {
            script.Add(new StoryScene
            {
                Id = "ev5_edda",
                Speaker = "Edda Voss",
                OnEnter = s =>
                {
                    if (s.Is("EDDA_ILL")) return;
                    s.SetFlag("EDDA_ILL");
                    // she may be the patient, but she's still the doctor
                    if (s.Disease == "fever") { s.Disease = null; s.Stat(Meter.Health, 5); s.SetFlag("EDDA_CURED_YOU"); }
                },
                Text = s =>
                {
                    var t = new List<string>
                    {
                        "Word arrives on the sixty-third morning the island's way: Edda's smoke doesn't.",
                        "You're moving before you've finished noticing — up the streaming mountain path with your kit and your heart in your ears — and you find her not dead (the relief nearly sits you down in the mud) but <i>down</i>: feverish, rattling, furious about it, wrapped in blankets in a cold hut because she couldn't keep the fire fed and wouldn't burn her seed-drying racks. \"Wet season chest,\" she rasps, waving you off even as you build the fire up. \"Had it forty times. Die of it eventually. Not — <i>ffh</i> — today.\"",
                    };
                    if (s.Is("BG_MEDIC"))
                        t.Add("You do the exam over her objections, and your hands know what they're hearing: it's bronchitis riding old lungs, real but beatable — with warmth, steam, feverbark, and someone making her rest, none of which live up here alone with her.");
                    if (s.Is("EDDA_CURED_YOU"))
                        t.Add("And it costs her nothing, flat on her back, to diagnose YOU across the hut: \"Marsh fever. You're glowing with it, fool — sit DOWN.\" She directs the brewing of her own feverbark from the pillow, supervises your dose like a customs official, and visibly draws strength from having a patient worse off than herself. You both leave the morning better than you found it.");
                    return t;
                },
                Choices = new List<StoryChoice>
                {
                    new StoryChoice
                    {
                        Label = "Bring her down. She winters at your camp, and that's the end of the argument.",
                        Sub = "Your stores, your fire, your problem now. Family math.",
                        Do = s =>
                        {
                            s.SetFlag("EDDA_WINTER");
                            s.Edda = s.Edda + 10 > 100 ? 100 : s.Edda + 10;
                            s.Stat(Meter.Energy, -12);
                            s.AddRoute(RouteAxis.Roots, 2);
                        },
                        Go = "ev5_edda_down",
                    },
                    new StoryChoice
                    {
                        Label = "Winter her in place — provision the grove, split your weeks up the mountain.",
                        Sub = "Her ground, her pride, your legs. The costliest kindness.",
                        Do = s =>
                        {
                            s.SetFlag("EDDA_TENDED");
                            s.Edda = s.Edda + 7 > 100 ? 100 : s.Edda + 7;
                            s.Stat(Meter.Energy, -8);
                        },
                        Go = "ev5_edda_grove",
                    },
                },
            });
            script.Add(new StoryScene
            {
                Id = "ev5_edda_down",
                Text = _ => new List<string>
                {
                    "The argument lasts an hour and you win it by packing while she conducts it. The trip down takes the day — her on the travois past the worst stretches, radiating indignity, gripping your arm at the steep parts with a strength that tells you exactly how frightened she's actually been, alone up there, listening to her own chest.",
                    "By nightfall Edda Voss is installed at your fire in the driest corner of everything you own, criticizing the camp's layout in a voice already stronger, and something in the household clicks into place that you didn't know was loose. The rain drums on. The fire holds. The census of your kingdom is up one.",
                },
            });
            script.Add(new StoryScene
            {
                Id = "ev5_edda_grove",
                Text = _ => new List<string>
                {
                    "She won't leave the grove — you knew before you offered — so the grove learns to hold two. You wood her up for a month, rig her rain tanks to fill without hauling, drum the feverbark decoction into a routine even a mule-headed botanist honors, and build your week around the mountain path.",
                    "It costs you. Every third day, up and down through the streaming green, whatever the season is doing. And every third day she's stronger, and ruder, which is the same thing — and on the fourth visit there's tea already poured when you make the fence, and you both pretend that's always been true.",
                },
            });
        }

        // ==================================================================
        //  FINALES (day 69) and the end card
        // ==================================================================
        static void AddFinale(StoryScript script)
        {
            script.Add(new StoryScene
            {
                Id = "ch5_finale",
                Text = s =>
                {
                    if (s.Plan == "sea")
                        return new List<string>
                        {
                            "<i>THE PROMISE OF THE HORIZON</i>",
                            "Day sixty-nine. The season's work stands finished around you: "
                                + (s.Is("CONTACT_MADE")
                                    ? "a radio that has touched the world through the island's held breath — they COPIED you, broken but real, and every skip is a knockable door now"
                                    : "a vessel with trial-hours in her log and the shipping lane's address in your head")
                                + (s.Is("RYO_MET") ? ", and a sailor at your fire who looks at the horizon like a homeland" : "") + ".",
                            "The rains will end. The weather will open. And then the way out — the actual, buildable, sailable way out — will stand open in front of everything you've grown here: the camp, the ground, "
                                + (s.Companion == "kavi" ? "Kavi, " : "") + "Edda's mountain, the island's unfinished riddle.",
                            "You don't have to decide tonight who boards and who stays and what gets said to the world about a place that hides. But tonight, for the first time since the sky broke — <i>leaving is real.</i> Say what that feels like.",
                        };
                    if (s.Plan == "home")
                        return new List<string>
                        {
                            "<i>THE TABLE</i>",
                            "Day sixty-nine. You build the table first — that's the part you'll remember: a real table, riven hardwood on braced legs, under the big rain-fly, with benches. Then you cook everything the season can spare: smoked fish and roast yams, flood-silt greens, Halcyon rice, honey from the immortal jar. And they come to it: "
                                + BuildGuestList(s) + ".",
                            "The rain drums the fly. The fire holds. The food goes around, and around again, and somewhere in the second hour you look down the table at your <i>household</i> — castaway, the word stopped fitting weeks ago — and understand that the season's real crop was never in the ground.",
                            "A place like this should have a name. Yours to give.",
                        };
                    return new List<string>
                    {
                        "<i>THE WATCHER'S OFFER</i>",
                        "Day sixty-nine, and she comes to YOU — walks out of the dusk treeline into your firelight, hands open, the bone knife conspicuously absent: Naia, the watcher, standing in a castaway's camp for the first time in her life and cataloguing everything with those fierce curious eyes.",
                        "\"I spoke of you,\" she says, without preamble — she has clearly rehearsed on the walk. \"To the old ones. Long — <i>ffh</i> — long arguing.\" A quick glance at "
                            + (s.Companion == "kavi" ? "Kavi" : "your tidy, solitary fire")
                            + ", and something in her face you'd call, on anyone, respect. \"I say: this one, the island watched sixty-nine days, and the island is not angry. I say what you did.\" She counts on her fingers, your own Ledger recited back to you in broken English by a stranger: the tide pools, the fires, the graves-question you didn't ask Edda, the hand in the hollow. \"They listen. Slow — they are old — but they listen.\"",
                        "\"So: when the rains end. The mountain. The door you saw painted.\" She points, once, at the broken crown, lost in rain and dark, and the sentence she has practiced most comes out whole and quiet: <i>\"Come and stand before my people, castaway. Come and be decided.\"</i>",
                    };
                },
                Choices = new List<StoryChoice>
                {
                    // THE COUNTDOWN's answers
                    new StoryChoice
                    {
                        Label = "\"Like a door unlocking.\" The horizon is the plan. It was always the plan.",
                        Sub = "Signal, sworn.",
                        When = s => s.Plan == "sea",
                        Do = s => { s.SetFlag("FINALE_SEA_GO"); s.AddRoute(RouteAxis.Signal, 3); s.SetFlag("CH5_DONE"); },
                        Go = "ch5_end",
                    },
                    new StoryChoice
                    {
                        Label = "\"Like a door unlocking — in a house I'm no longer sure I want to leave.\"",
                        Sub = "Say the complicated true thing.",
                        When = s => s.Plan == "sea",
                        Do = s => { s.SetFlag("FINALE_SEA_TORN"); s.AddRoute(RouteAxis.Roots, 2); s.AddRoute(RouteAxis.Signal, 1); s.SetFlag("CH5_DONE"); },
                        Go = "ch5_end",
                    },
                    // THE HOMESTEAD's names
                    new StoryChoice
                    {
                        Label = "\"Rootstead.\"",
                        Sub = "For what the season proved: things put down here, hold.",
                        When = s => s.Plan == "home",
                        Do = s => { s.SetFlag("HOME_NAMED"); s.SetFlag("NAME_ROOTSTEAD"); s.AddRoute(RouteAxis.Roots, 3); s.SetFlag("CH5_DONE"); },
                        Go = "ch5_end",
                    },
                    new StoryChoice
                    {
                        Label = "\"Driftwood.\"",
                        Sub = "For what everyone at this table used to be.",
                        When = s => s.Plan == "home",
                        Do = s => { s.SetFlag("HOME_NAMED"); s.SetFlag("NAME_DRIFTWOOD"); s.AddRoute(RouteAxis.Roots, 3); s.SetFlag("CH5_DONE"); },
                        Go = "ch5_end",
                    },
                    new StoryChoice
                    {
                        Label = "\"The Landing.\"",
                        Sub = "For how everyone arrived — and the light you'll keep for whoever's next.",
                        When = s => s.Plan == "home",
                        Do = s => { s.SetFlag("HOME_NAMED"); s.SetFlag("NAME_LANDING"); s.AddRoute(RouteAxis.Roots, 2); s.AddRoute(RouteAxis.Signal, 1); s.SetFlag("CH5_DONE"); },
                        Go = "ch5_end",
                    },
                    // THE DESCENT's answers
                    new StoryChoice
                    {
                        Label = "\"I'll come. When the rains end, I'll stand and be decided.\"",
                        Sub = "The door in the painting, in this life. Yes.",
                        When = s => s.Plan == "deep",
                        Do = s => { s.SetFlag("INNER_INVITED"); s.SetFlag("NAIA_TRUSTED"); s.AddRoute(RouteAxis.Depth, 3); s.SetFlag("CH5_DONE"); },
                        Go = "ch5_end",
                    },
                    new StoryChoice
                    {
                        Label = "\"I'll come — and I want the truth of the wound first. All of it.\"",
                        Sub = "Terms. She'll respect them or she won't.",
                        When = s => s.Plan == "deep",
                        Do = s => { s.SetFlag("INNER_INVITED"); s.SetFlag("NAIA_TERMS"); s.AddRoute(RouteAxis.Depth, 3); s.SetFlag("CH5_DONE"); },
                        Go = "ch5_end",
                    },
                },
            });

            script.Add(new StoryScene
            {
                Id = "ch5_end",
                Text = s =>
                {
                    var t = new List<string>
                    {
                        "<i>END OF CHAPTER FIVE — THE LONG RAIN</i>",
                        "The crucible season, as the Ledger will keep it:",
                    };
                    if (s.Plan == "sea")
                        t.Add("— You gave the rains to THE COUNTDOWN: " + (s.Is("CONTACT_MADE")
                            ? "the radio lives, and through a skip in the island's voice, the world answered. Four seconds. They copied."
                            : "a vessel stands trialed above the tideline, and the shipping lane has an address.")
                            + (s.Is("RYO_MET") ? " Ryo's question — <i>will you?</i> — still stands in the cockpit, patient as the boat." : ""));
                    else if (s.Plan == "home")
                    {
                        t.Add("— You gave the rains to THE HOMESTEAD: the farm is in"
                            + (s.Is("FLOOD_DIKED") ? ", diked against the flood that came for it" : s.Is("FLOOD_STORES") ? ", a third drowned to keep the granary whole" : "")
                            + ", and on the sixty-ninth night you fed your whole strange household at a real table and named the place <i>"
                            + (s.Is("NAME_ROOTSTEAD") ? "Rootstead" : s.Is("NAME_DRIFTWOOD") ? "Driftwood" : "The Landing") + "</i>.");
                        t.Add("— The Boar King came to your boundary starving, and you " + (s.Is("KING_FED")
                            ? "fed him from the winter stores. He walked your fence line once, signed it with his shoulder, and the inland dark has an ally in it now."
                            : "held the line. He went back into the failing dark unhurried, and you carry the weight of the arithmetic."));
                    }
                    else
                        t.Add("— You gave the rains to THE DESCENT: the throat, the Gallery of Hands — <i>they went in</i> — and the wound itself, guttering around Halcyon's bore. And the dark finally introduced itself: Naia, watcher, sixty-nine days your shadow, who ended the season standing in your firelight saying <i>come and be decided</i>.");
                    t.Add("— The cyclone night: " + (s.Shelter >= 3
                        ? "your walls earned every hour you ever spent on them."
                        : "the sky took its tax in full, and you paid and rebuilt."));
                    t.Add("— Edda's season turned: " + (s.Is("EDDA_WINTER")
                        ? "she winters at your fire now, imperious and mending, and the household clicked around her like a joint finding its socket."
                        : s.Is("EDDA_TENDED")
                            ? "she winters in her grove on your legs and stubbornness, and there's tea already poured when you make the fence."
                            : "her smoke faltered once, and the mountain felt suddenly very far."));
                    if (s.Is("FILES_TO_EDDA"))
                        t.Add("— And one wet evening, by your shared fire, she opened Ilsa's drawer with you — her testimony filling the torn pages: the bore, the nine hours, the two she buried. <i>Tend the skin,</i> Vane wrote. Edda's translation: \"Don't be them, castaway. Don't ever be them.\"");
                    t.Add($"Route standings — Signal {s.Route.Signal} · Roots {s.Route.Roots} · Depth {s.Route.Depth}. Nothing is decided. Everything is remembered.");
                    return t;
                },
                Next = "ch6_open",
                NextLabel = "Continue — Chapter Six: Ashes and Stairs ➤",
            });
        }

        static string BuildGuestList(GameState s)
        {
            var guests = new List<string>();
            if (s.Is("EDDA_WINTER")) guests.Add("Edda, wrapped and imperious at the head");
            else if (s.Is("EDDA_TENDED")) guests.Add("Edda, down off her mountain for one night, under extreme protest, carried up the last stretch by dignity alone");
            if (s.Is("RYO_MET")) guests.Add("Ryo, who has made something with lime and sugarcane that should be illegal");
            if (s.Companion == "kavi") guests.Add("Kavi, at your side where the world belongs");
            return guests.Count > 0 ? string.Join("; ", guests) : "everyone the season gathered";
        }
    }
}
