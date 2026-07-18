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
                Speaker = "Kavi",
                OnEnter = s =>
                {
                    if (s.Is("HEART1_DONE")) return;
                    s.SetFlag("HEART1_DONE");
                    s.Bond(10);
                    s.Stat(Meter.Hope, 8);
                },
                Text = _ => new List<string>
                {
                    "It happens on the fifteenth morning, without announcement: Kavi crosses the camp, lies down against your leg, and rolls — deliberately, watching your face — to bare the burned flank. The scar tissue is slick and hairless, older than your acquaintance, shaped like a long paw of flame.",
                    "You rest your hand on it, light as you know how. He exhales — a long, unbuilding breath, years going out of it — and sleeps, there, under the hand on his worst place.",
                    "Whatever cast him out and whatever burned him, he has decided you are not it.",
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
                Text = _ => new List<string>
                {
                    "On the fifteenth morning you catch the grey dog watching you from the old first distance — the day-three distance — and you feel the gap you haven't closed.",
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
