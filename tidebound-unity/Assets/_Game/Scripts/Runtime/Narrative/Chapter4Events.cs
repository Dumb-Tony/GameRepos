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
