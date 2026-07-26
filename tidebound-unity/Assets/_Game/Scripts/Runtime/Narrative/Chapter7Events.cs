using System.Collections.Generic;

namespace Tidebound.Narrative
{
    /// <summary>
    /// Chapter Seven — Convergence: the aftermath week (its face set by the
    /// Tidewell's door), then THE CONVERGENCE — the run's final choice,
    /// assembled from the whole Ledger. Every option sets an EndingId and
    /// ends the dialogue; the RunCardUI renders the core, the epilogue,
    /// and THE LEDGER OPENS (Endings.cs). Ported from scenes-chapter7.js;
    /// guards are verbatim — options whose systems don't exist yet in v1
    /// (trinkets, the fire-tower, the vigils, NG+, other companions)
    /// simply never surface until those flags can be set, exactly as the
    /// VN's own gates behave.
    /// </summary>
    public static class Chapter7Events
    {
        static string HomeName(GameState s) =>
            s.Is("NAME_ROOTSTEAD") ? "Rootstead" :
            s.Is("NAME_DRIFTWOOD") ? "Driftwood" :
            s.Is("NAME_LANDING") ? "The Landing" : "the homestead";

        public static void AddTo(StoryScript script)
        {
            AddOpen(script);
            AddConvergence(script);
        }

        // ---- the aftermath week ----------------------------------------------
        static void AddOpen(StoryScript script)
        {
            script.Add(new StoryScene
            {
                Id = "ch7_open",
                OnEnter = s => { if (s.Chapter < 7) s.Chapter = 7; },
                Text = s =>
                {
                    var t = new List<string>
                    {
                        "<i>CHAPTER SEVEN — CONVERGENCE</i>",
                        "The week after the mountain is the strangest of your life, and you measure strangeness differently now.",
                    };
                    if (s.Is("TIDEWELL_SILENCE"))
                    {
                        t.Add("The island changes key around you, day by day: the lagoon's glow fading like a lamp turned down slow, the compass needle settling — actually settling, trembling toward a true and ordinary north — and on the sixth morning, high and glinting and impossible, an aircraft alters course. A wing dips. Someone, seven miles up, has seen an island that was never there before, and somewhere in the world a chart is being corrected, and after the chart, ships.");
                        t.Add("You have perhaps days. The world is coming, with everything the world brings, and every life on this island — yours, Edda's, the Green's two thousand — is about to be found with you.");
                    }
                    else if (s.Is("TIDEWELL_FEED"))
                    {
                        t.Add("The island settles around your pledge like a patient after the splint: the tremors gone, the lagoon burning its seven beats brighter than you've ever seen, the veil whole and deep. The world will not come. The world CANNOT come — you gave your strength to that certainty at the top of the mountain.");
                        t.Add("Which leaves, standing quietly at the center of everything you've built, the question the island cannot answer for you: inside the veil you saved — what now, castaway? The hundred days come due.");
                    }
                    else if (s.Is("TIDEWELL_KEEP"))
                    {
                        t.Add("You learn the post the way you learned everything here: by doing it wrong slightly less each day. The parish reports in constantly now — you feel the reef's weather and the Green Deep's hunger and the wound's slow knitting the way you feel your own pulse — and the work is real: a fouled channel worried loose, a sick heronry visited, the Boar King's wallow (you know now, always, exactly where he is) given its wide respectful margin.");
                        t.Add("But the covenant, you're finding, binds the island to you as much as you to it — and it leaves your two feet free. Keepers walked to their own choices, the murals say. The hundred days come due, keeper. Where do you keep FROM?");
                    }
                    else
                    {
                        t.Add("You come down the ten thousand stairs having chosen not to choose, and find the island — you'd swear it — treating you more gently for it: the tremors easing on their own, the pulse steadier, as if the Tidewell's reading of you settled something the mountain had been asking. Naia was right. The not-doing weighed.");
                        t.Add("But your own question kept every step of the way down with you, patient as tide, and it is waiting at your fire when you arrive: the hundred days come due. What does the castaway of Vessakai do with the life they built?");
                    }
                    if (s.Companion == "kavi")
                        t.Add("Kavi — who climbed a mountain for you, or with you; the distinction stopped existing weeks ago — resumes the old routines at your side and watches you think. Whatever you choose, the choosing has an audience now, and the audience has a stake.");
                    return t;
                },
                Next = "convergence",
                NextLabel = "The hundred days come due ➤",
            });
        }

        // ---- THE CONVERGENCE --------------------------------------------------
        static bool Kindred(GameState s) => s.Companion != null && s.Trust >= 90;

        static bool Perfect(GameState s) =>
            Kindred(s) && Chapter6Events.Regard(s) >= 6 && s.Edda >= 60 &&
            (s.Is("INNER_GREEN") || s.Is("TIDEWELL_KEEP") || s.Is("TIDEWELL_WITNESS"));

        static StoryChoice End(string label, string sub, string endingId,
            System.Func<GameState, bool> when = null, System.Func<GameState, string> dynamicId = null)
        {
            return new StoryChoice
            {
                Label = label,
                Sub = sub,
                When = when,
                Do = s => s.EndingId = dynamicId != null ? dynamicId(s) : endingId,
                GoDynamic = _ => null, // the dialogue ends; the run card takes it
            };
        }

        static void AddConvergence(StoryScript script)
        {
            script.Add(new StoryScene
            {
                Id = "convergence",
                Text = s => new List<string>
                {
                    "<i>THE CONVERGENCE</i>",
                    "You give it the honest setting: dusk, the tideline, the whole bright toy of your world laid out — the camp"
                        + (s.Is("HOME_NAMED") ? " (no: <i>" + HomeName(s) + "</i>; it earned the name)" : "")
                        + ", the smoke of your fire"
                        + (s.Is("EDDA_WINTER") ? ", Edda's second smoke beside it" : "")
                        + (s.Is("RYO_MET") ? ", the Kingfisher's patched mast against the sky" : "")
                        + ", the mountain behind everything with its broken crown and its kept secrets.",
                    "One hundred days ago the sea threw you onto this sand with a lighter and a photograph. Tonight the island — hidden or found, kept or keeping — waits on your word.",
                    "Choose the rest of your life, castaway.",
                },
                Choices = new List<StoryChoice>
                {
                    // ---- the world found (TIDEWELL_SILENCE) ----
                    End("Meet the ships. Go home — and carry the island's story carefully.",
                        "The Found Shore. Rescue, return, and everything after.",
                        null, s => s.Is("TIDEWELL_SILENCE"),
                        s => s.Stats.Hope <= 25f ? "REGRET" : "RESCUE"),
                    End("Stay as the world arrives. Be the one who was here first.",
                        "The First Citizen. Homestead deed and all.",
                        "STAY_OPEN", s => s.Is("TIDEWELL_SILENCE")),
                    End("Stand between the world and the Inner Green. Someone must translate.",
                        "The Interpreter. The hardest job the new charts will create.",
                        "BROKER", s => s.Is("TIDEWELL_SILENCE") && (s.Is("INNER_GREEN") || s.Is("NAIA_TRUSTED"))),

                    // ---- the covenant kept (TIDEWELL_KEEP) ----
                    End("Keep the island. This is the post, and the post is home.",
                        "Guardian of the Deep.",
                        null, s => s.Is("TIDEWELL_KEEP"),
                        s => s.Is("INNER_GREEN") ? "COVENANT" : "KEEPER"),
                    End("Keep the island — and keep the window. A voice through the skips, forever.",
                        "Keeper of the Window. Hidden, and not alone.",
                        "TWO_WORLDS", s => s.Is("TIDEWELL_KEEP") && s.Is("CONTACT_MADE")),

                    // ---- inside the veil (FEED or WITNESS) ----
                    End("Stay. This is home now — dig the roots all the way down.",
                        "The life you built, chosen twice.",
                        null, s => !s.Is("TIDEWELL_SILENCE") && !s.Is("TIDEWELL_KEEP"),
                        s => s.Is("RYO_MET") && (s.Is("EDDA_WINTER") || s.Is("EDDA_TENDED")) ? "VILLAGE" : "HOME"),
                    End("Go up the mountain for good. The Green has a door with your name on it.",
                        "The Inner Green. First outsider; last outsider.",
                        "JOIN", s => !s.Is("TIDEWELL_SILENCE") && !s.Is("TIDEWELL_KEEP") && s.Is("INNER_GREEN")),
                    End("Sail — with the island's blessing, and the right of return.",
                        "The Whole Sky. Everything, held with open hands.",
                        "WHOLE_SKY", s => !s.Is("TIDEWELL_SILENCE") && !s.Is("TIDEWELL_KEEP")
                            && (s.Is("VESSEL_READY") || s.Is("CONTACT_MADE")) && Perfect(s)),
                    End("Sail with Ryo when the fair season opens.",
                        "Two Sails Out. The Kingfisher keeps her promise.",
                        "RYO_BOAT", s => !s.Is("TIDEWELL_SILENCE") && !s.Is("TIDEWELL_KEEP")
                            && (s.Is("VESSEL_READY") || s.Is("CONTACT_MADE")) && !Perfect(s)
                            && s.Is("RYO_MET") && s.Ryo >= 40),
                    End("Sail. Through the veil's one window, out, and away.",
                        "Two tickets — or the Long Swim, alone, the way you arrived.",
                        null, s => !s.Is("TIDEWELL_SILENCE") && !s.Is("TIDEWELL_KEEP")
                            && (s.Is("VESSEL_READY") || s.Is("CONTACT_MADE")) && !Perfect(s)
                            && !(s.Is("RYO_MET") && s.Ryo >= 40),
                        s => Kindred(s) ? "SAIL_BLESSED" : s.Stats.Hope <= 25f ? "REGRET" : "LONG_SWIM"),
                    End("Lash a raft anyway. Go NOW — ready or not.",
                        "The sea does not grade on intention. You know that. You're going anyway.",
                        "EMPTY_HORIZON", s => !s.Is("TIDEWELL_SILENCE") && !s.Is("TIDEWELL_KEEP")
                            && !s.Is("VESSEL_READY") && !s.Is("CONTACT_MADE")),
                    End("And when the rescue you once called for comes — hide until it leaves.",
                        "Remain, willingly. Say it out loud so the island hears you mean it.",
                        "REMAIN", s => !s.Is("TIDEWELL_SILENCE") && !s.Is("TIDEWELL_KEEP")
                            && (s.Is("CONTACT_MADE") || s.Is("SOS"))),
                    End("Carry the covenant lamp down to the wound. And stay with it.",
                        "The Tide Price. Someone holds the seam. It was always going to be someone.",
                        "TIDE_PRICE", s => (s.Is("HEARTGLASS") || s.Is("HEART2_LOW"))
                            && (s.Is("TIDEWELL_WITNESS") || s.Is("TIDEWELL_FEED"))),
                    End("Walk Kavi up the mountain. The post was never yours to fill.",
                        "The Island's Own. A keeper is the one still kneeling — and you know who never left.",
                        "ISLANDS_OWN", s => s.Companion == "kavi" && Kindred(s) && (s.Is("TIDEWELL_WITNESS") || s.Is("TIDEWELL_FEED"))),
                    End("Walk Buri up the mountain. The post was never yours to fill.",
                        "The Island's Own. A keeper is the one still kneeling — and you know who never left.",
                        "ISLANDS_OWN", s => s.Companion == "buri" && Kindred(s) && (s.Is("TIDEWELL_WITNESS") || s.Is("TIDEWELL_FEED"))),
                    End("Walk Moa up the mountain. The post was never yours to fill.",
                        "The Island's Own. A keeper is the one still kneeling — and you know who never left.",
                        "ISLANDS_OWN", s => s.Companion == "moa" && Kindred(s) && (s.Is("TIDEWELL_WITNESS") || s.Is("TIDEWELL_FEED"))),
                    End("Walk Vela up the mountain. The post was never yours to fill.",
                        "The Island's Own. A keeper is the one still kneeling — and you know who never left.",
                        "ISLANDS_OWN", s => s.Companion == "vela" && Kindred(s) && (s.Is("TIDEWELL_WITNESS") || s.Is("TIDEWELL_FEED"))),
                    End("Walk Ipo up the mountain. The post was never yours to fill.",
                        "The Island's Own. A keeper is the one still kneeling — and you know who never left.",
                        "ISLANDS_OWN", s => s.Companion == "ipo" && Kindred(s) && (s.Is("TIDEWELL_WITNESS") || s.Is("TIDEWELL_FEED"))),
                    End("Let Ipo show you what he's been building in the canopy.",
                        "He has been hinting for WEEKS.",
                        "TRICKSTER", s => !s.Is("TIDEWELL_SILENCE") && s.Companion == "ipo" && s.Trust >= 90),
                    End("Walk Nine up through the drowned channels. The post was never yours to fill.",
                        "The Island's Own. A keeper is the one still kneeling — and you know who never left.",
                        "ISLANDS_OWN", s => s.Companion == "nine" && Kindred(s) && (s.Is("TIDEWELL_WITNESS") || s.Is("TIDEWELL_FEED"))),
                    End("Stay for her springs — every one she has left.",
                        "Octopuses are lanterns, not hearths. You always knew the shape of this route.",
                        "THREE_SPRINGS", s => !s.Is("TIDEWELL_SILENCE") && s.Companion == "nine" && s.Trust >= 75),
                    End("Rebuild your life at the tideline. On her terms, in her hours.",
                        "Nine's Garden. Half your world drowned; none of it lonely.",
                        "NINES_GARDEN", s => !s.Is("TIDEWELL_SILENCE") && s.Companion == "nine" && s.Trust >= 50),
                    End("Walk to Kestrel Cliffs at first light. And open your hand.",
                        "The wind has been asking after her all season. You've heard it too.",
                        "WIND_TAKES", s => !s.Is("TIDEWELL_SILENCE") && s.Companion == "vela" && s.Trust >= 75),

                    // ---- the Locked Things ----
                    End("Leave RICH — the Rosa's gold, the cut stones, the whole ransom.",
                        "The world out there prices everything. Arrive holding the prices.",
                        "ROSAS_RANSOM", s => (s.Is("TREASURE_SOME") || s.Is("TREASURE_ALL") || s.Is("GEMS"))
                            && (s.Is("VESSEL_READY") || s.Is("CONTACT_MADE") || s.Is("TIDEWELL_SILENCE"))),
                    End("Leave as the courier — two deliveries, then done.",
                        "The Last Delivery. The dossier to the deep; the photograph to a pier called KAI—.",
                        "LAST_DELIVERY", s => s.Is("CASE_OPEN") && s.Is("COURIER_RESTED")
                            && (s.Is("VESSEL_READY") || s.Is("CONTACT_MADE") || s.Is("TIDEWELL_SILENCE"))),
                    End("Keep the light. Give your stay to the sea's strays.",
                        "Keeper of the Light. Somebody used to burn it for the collected. Somebody does again.",
                        "LIGHTKEEPER", s => s.Is("TOWER_BUILT") && !s.Is("TIDEWELL_SILENCE")),
                    End("Go down one last time — and break the seam.",
                        "⚠️ The Hum Silenced. Every compass true, every radio clear, every door open. Nothing that is done down there can be undone.",
                        "HUM_SILENCED", s => !s.Is("TIDEWELL_SILENCE")
                            && (s.Is("WOUND_SEEN") || s.Is("HEARTGLASS") || s.Is("GULLET2") || s.Is("SUNDERING_SEEN"))
                            && s.Route.Depth >= 15),
                    End("Live as what the sea-speaker made you: a placed stone.",
                        "The last mural was a mirror. Vessa-tau.",
                        "FIRST_KAARI", s => s.Is("VISION_SEEN") && (s.Is("TIDEWELL_KEEP") || s.Is("TIDEWELL_WITNESS"))),
                    End("Go where Kavi's other half lives. The pack.",
                        "Where one of you goes, both of you go.",
                        "LAST_PACK", s => !s.Is("TIDEWELL_SILENCE") && s.Companion == "kavi" && s.Trust >= 90),
                    End("Stay — you nearly lost this once. You know what it's worth now.",
                        "What Remains. Home is a heartbeat you can check on.",
                        "WHAT_REMAINS", s => !s.Is("TIDEWELL_SILENCE") && s.Companion != null
                            && (s.Is("PERIL_HEALED") || s.Is("PERIL_SELFHEALED"))),
                    End("Accept what Edda has been trying to give you all season.",
                        "The grove, the graves, and the last thing she never told Vane.",
                        "HERMIT_HEIR", s => !s.Is("TIDEWELL_SILENCE") && s.Is("EDDA_MET") && s.Edda >= 60
                            && (s.Is("EDDA_GRAVES") || s.Is("EDDA_WINTER"))),
                    End("Finish Vane's instrument. Take Ilsa's last measurement — and give it home.",
                        "Understanding as an act of love, not disclosure.",
                        "ILSA_ANSWER", s => !s.Is("TIDEWELL_SILENCE")
                            && s.Is("VANE_J1") && s.Is("VANE_J2") && s.Is("VANE_J3") && s.Edda >= 45),
                    End("Wait for the king tide. Then go down, under the Tidewell, to the door.",
                        "The sea keeps one room no map admits to. You've known for weeks.",
                        "DROWNED_DOOR", s => !s.Is("TIDEWELL_SILENCE")
                            && (s.Companion == "nine" || s.Route.Depth >= 22)
                            && (s.Is("GULLET_MAP") || s.Is("DEEP3") || s.Is("DIVED"))),
                    End("Leave — and come back heavy: expedition, instruments, the whole found world.",
                        "The Cartographer's Return. Some doors punish knocking.",
                        "CARTOGRAPHER", s => !s.Is("TIDEWELL_SILENCE") && !s.Is("TIDEWELL_KEEP")
                            && (s.Is("VESSEL_READY") || s.Is("CONTACT_MADE")) && s.Route.Depth >= 18
                            && (s.Is("VISION_SEEN") || s.Is("GULLET_MAP") || s.Is("HEARTGLASS"))),
                    End("Stand at the tideline alone and claim the whole of it.",
                        "No companion, no covenant, no rescue. Just the life you built with two hands.",
                        "ALONE_UNBROKEN", s => s.Companion == null && s.Stats.Hope >= 75f && s.Is("HOME3")),
                },
            });
        }
    }
}
