using System.Collections.Generic;

namespace Tidebound.Narrative
{
    /// <summary>
    /// The ending pipeline's canon: death titles (runcard.js DEATH_TITLES),
    /// epilogue prose, core endings (scenes-chapter7.js CORES — v1 ships
    /// THE EMPTY HORIZON), and the run summary. Pure; the RunCardUI renders
    /// it, tests pin it.
    /// </summary>
    public static class Endings
    {
        // ---- death titles: runcard.js verbatim -----------------------------
        static readonly Dictionary<string, string> DeathTitles = new Dictionary<string, string>
        {
            ["thirst"] = "THE DRIFTWOOD TONGUE",
            ["hunger"] = "HUNGER'S QUIET",
            ["undertow"] = "UNDERTOW",
            ["fever"] = "MARSH FEVER",
            ["despair"] = "THE GREEN SWALLOWS",
            ["dark"] = "THE LONG DARK",
            ["grin"] = "OLD GRIN",
            ["injury"] = "THE SMALL LOAN",
            ["boarking"] = "THE BOAR KING",
            ["fall"] = "THE FALL",
            ["coldfire"] = "COLD FIRE",
            ["ash"] = "MOTHER ASH",
        };

        static readonly Dictionary<string, string[]> DeathBodies = new Dictionary<string, string[]>
        {
            ["thirst"] = new[] { "You knew. The sticking tongue, the stopped sweat — the island said it plainly, and water was always the first law." },
            ["hunger"] = new[] { "It ends the way it warned you it would: not with pain but with a great soft quiet, and the sea still counting to itself." },
            ["injury"] = new[] { "Every cut out here is a small loan from a lender you don't know. Yours came due." },
            // Cold Fire's full framing — scenes-chapter1.js death scene, verbatim
            // (the strangers variant; Ryo arrives with chapter 4)
            ["coldfire"] = new[]
            {
                "No single moment killed you. That is the whole of this card, and the island would want it stated plainly: not the cyclone, not the cold, not the dark. What killed you was a season of small skipped choices arriving all at once to be paid — the shelter tier you meant to get to, the firewood store that stayed a plan, the overhang you didn't move to on Day 4 because the beach had a view.",
                "The storm only did the audit.",
                "They find the camp in the spring — strangers, whoever the sea sends — and the strange thing, the thing that stops them, is how CLOSE it all was: the half-built windbreak, the stacked stones, the good intentions legible in every unfinished thing. The island files it under its second-oldest heading: <i>tomorrow.</i>",
            },
            ["fever"] = new[] { "The fever finishes its argument. You had heard every word of it coming." },
            ["boarking"] = new[]
            {
                "You knew nothing about him yet, and he had plainly survived everything this island ever sent — the hunters, the traps, the years. His epilogue is his own ledger, kept in scar: four now, who thought the rent was negotiable.",
            },
            // the despair ending's full epilogue — scenes-chapter1.js death scene, verbatim
            ["despair"] = new[]
            {
                "You stop keeping the days, and the days, courteously, stop keeping you.",
                "It isn't dramatic. That was the appeal. You walk inland one bright morning without a plan to walk out, and the Green Deep receives you the way it received the terraces and the stones and every other made thing: patiently, greenly, without malice. For a while there are still habits — water found, fruit taken, a fire some nights. Then fewer. The count blurs, as requested. The paths you cut heal over behind you.",
                "The island does not judge it. The island has folded over grander surrenders than yours, and will again, and holds what it takes gently and forever.",
            },
        };

        // ---- core endings: scenes-chapter7.js CORES ---------------------------
        // The VN's own dictionary is incomplete on purpose: ending ids without
        // a written core (LAST_PACK, FIRST_KAARI, ROSAS_RANSOM, …) fall back
        // to the HOME core, exactly as `CORES[s.endingId] || CORES.HOME` does.
        // v1 ports the cores reachable on the kavi/solo island; the rest
        // arrive with their systems (Phase 7 / the expansions).
        static readonly Dictionary<string, (string Title, string[] Body)> Cores =
            new Dictionary<string, (string, string[])>
            {
                ["EMPTY_HORIZON"] = ("THE EMPTY HORIZON", new[]
                {
                    "The raft is willing and the sea is not asked. You go because staying had begun to feel like drowning slowly, and the horizon promised — the way horizons do, to people at the end of themselves — that anywhere else was air.",
                    "Nine days. You will never tell anyone the true arithmetic of them: the water gone on the fourth, the sail gone on the fifth, the bargains you made aloud with no one in the white middle of the sixth. The freighter that finds you finds eleven stone of sunburn and salt with your name somewhere inside it, and the crew are kind, and the kindness is almost the worst part, because you know — you knew by the second dawn — that you had left a green and singing world with your fences half-mended and your fire still lit, for this.",
                    "You live. The word does its plain work and no more. Somewhere behind you an island the charts never held goes on without you, unfound, unfinished — and the one mercy the sea granted is that it let you carry out the knowing: it was never the island you were escaping.",
                }),
                ["RESCUE"] = ("THE FOUND SHORE", new[]
                {
                    "The ship comes on the ninth day of the found world — grey-hulled, astonished, its whole rail lined with binoculars — and you meet it standing in the surf of your own beach, burned dark and rope-muscled, with one hundred days in your beard and your Ledger by heart.",
                    "The rescue is chaos and paperwork and satellite phones, and you move through it strangely calm: you have negotiated with a crocodile; a coast guard lieutenant holds no terrors. You tell the truth carefully — the crash, the survival, the old woman on the mountain who declines (with a shotgun's eloquence) to be rescued — and you keep what needs keeping, and when the ship turns for home the island stands behind you on the horizon: found, charted, changed forever — and still, in the ways that matter, keeping its own counsel.",
                    "You go home. Home is strange now — soft floors, loud rooms, water that arrives by pipe like a miracle nobody worships. You are, the doctors say, remarkably well. You are, you know privately, remarkably DIFFERENT: you own a compass that points true and you check it, some nights, hoping faintly that it's started to lie.",
                }),
                ["STAY_OPEN"] = ("THE FIRST CITIZEN", new[]
                {
                    "The world arrives in stages — survey ship, science teams, one bewildered consular officer — and finds, established on the southern shore with fortifications, agriculture, and opinions: <i>you</i>.",
                    "You stay. Not marooned now — a resident. First resident: when the charts are drawn and the claims are argued (they are argued; you decline to care), your beach is grandfathered around you, and the maps that finally name this island mark, in small letters at the southern bay, your fire.",
                    "The world builds a research station (a new one; you made them site it far from the old) and a small pier, and the world is mostly, blessedly, not interested in one weathered settler. You trade fish for coffee. You give the newcomers unbearably accurate advice. You are, within three years, a legend they tell arriving scientists: the one who was here when it lit up on the charts. The one the island kept first.",
                }),
                ["BROKER"] = ("THE INTERPRETER", new[]
                {
                    "The world finds the island; you make sure it finds you first — standing on the beach beside its first landing party with the sun-dark authority of a hundred days and the words that will bend the next century: <i>\"Before you walk inland, there are people here. And I speak for them until they choose to speak.\"</i>",
                    "The years that follow are the hardest, best work of your life: treaties where there were never treaties, charts with a two-mile hole held blank at the caldera by international agreement and your unsleeping vigilance, journalists turned away, one government humiliated publicly and precisely when it tried to fly a survey drone over the crown. Tekau calls you, in Kaari, a word that means \"the hinge.\" Naia — councilwoman Naia, now, her English no longer halting — stands beside you at every table.",
                    "The Inner Green chooses its own pace into the found world: slow, sovereign, on terms carved — like everything they make — to last. The hinge holds. The door opens only as far as its people push it.",
                }),
                ["HOME"] = ("ROOTSTEAD", new[]
                {
                    "You stay. It isn't even a decision by the time you say it out loud — it's a description, the way the Tidewell is a description: this is home; you are held.",
                    "The seasons take up their great wheel. The farm doubles, then learns to feed the soil that feeds it. The house grows rooms the way trees grow rings — the good table at the center of everything, the fire that has not fully died since the day you first coaxed it. You keep the calendar by the lagoon's pulse and the junglefowl's politics, and the day you catch yourself unable to remember what month the world would call it, you laugh alone in your rows for ten minutes.",
                    "You are not waiting for anything. That's the crop that took longest: a life so present-tense that rescue, arriving now, would knock like a stranger at a full table.",
                }),
                ["VILLAGE"] = ("DRIFTWOOD RISING", new[]
                {
                    "It begins as a household and becomes, before you quite ratify it, a town.",
                    "The island keeps reeling in its shipwrecked — a fishing crew the next wet season, two sailors the year after, once an entire capsized dive charter, indignant and dripping — and now, when the sea delivers them, there is a light on the southern shore, and a table, and Edda's medicine, and Ryo's boatyard, and your Ledger of everything this island will and will not forgive. Some stay. The stayers build.",
                    "Driftwood, the charts would call it, if any charts could find it: population thirty-one and irregular, government by table, economy of salvage and generosity. You never named yourself anything in it, and it never needed you to. Everyone knows whose fire was first.",
                }),
                ["JOIN"] = ("THE INNER GREEN", new[]
                {
                    "You go up the ten thousand stairs one last time as a visitor, and never again as one.",
                    "They give you a house at the terrace-edge where the morning comes first, and work — real work, no guest's ceremony: irrigation to mind, walls to keep, and (Tekau insists, to your alarm and then your life's strange joy) TEACHING: the world's words, the world's ways, banked like fire against the day the veil is ever tested. Naia's children learn your language sitting on your steps. You learn theirs badly, to general delight.",
                    "You dream in Kaari within two years. You stand at the Tidewell festivals in the keeper's line with everyone else, one more pair of hands the island counted and kept. Of the world you came from you miss, in the end, exactly two things — and you could no longer say what they were, only that the missing has become part of the shape of a whole and honored life.",
                }),
                ["KEEPER"] = ("GUARDIAN OF THE DEEP", new[]
                {
                    "The post is real, and you keep it.",
                    "Your years take the shape of the island's: monsoon and dry, spawn and bloom, the wound under the mountain knitting by slow degrees under your attention like a fire banked just so. You know the reef's moods now the way you knew streets once. The Boar King dies old, in his wallow, and you sit with him; Old Grin outlives everything, as was always his policy, and the two of you maintain, at the ford, a courtesy of long standing.",
                    "Sailors' stories grow up around your sea like coral: an island that isn't there, and something in it that decides. They're wrong about every detail and right about the whole. The island hides; the keeper tends; the lagoon keeps its seven beats against the dark, brighter every year — and if some nights the post is lonely past all telling, it is never once, in all your years, unloved.",
                }),
                ["COVENANT"] = ("THE COVENANT PASSED", new[]
                {
                    "Keeper — but never alone. That is the covenant as the Inner Green restores it, whole, around you: the post filled and the people back at the pool.",
                    "They rebuild the temple stair within the year. The festivals return to the nave — the first in three centuries, Tekau weeping openly and denying it in the same breath — and your keeping becomes what the murals always showed: one hooded figure at the water, and a whole civilization at their back. Naia trains beside you at the pool; her daughter, years on, trains beside her; the line that waited three hundred years for one freely-choosing stranger will never again be one deep.",
                    "Edda, in her last spring, comes up the mountain on a chair the Green carries — furious about it, radiant — to see the pool kept properly before the end. \"Well,\" she says at the water's edge, sixty years of exile resolving in her face like weather clearing. \"Well. Ilsa. Look at this.\"",
                }),
                ["TWO_WORLDS"] = ("KEEPER OF THE WINDOW", new[]
                {
                    "You keep the island — and once a night, in the skip's held black seconds, the island lets you keep a voice.",
                    "It becomes the strangest correspondence on Earth: four seconds at a time, station to station across a veil no chart can pierce, with an operator somewhere in the found world who has learned your rhythm and keeps your secret because you asked and because — she says, in four-second installments spread over a month — nobody in her life has ever needed her at 2:14 a.m. as reliably as you. News comes in over years like sediment: elections, seasons, her daughter's wedding. Your reports go out: sailors saved, storms coming, once a drifting yacht steered to safe harbor by \"an anonymous coastal station\" that seven navies never found.",
                    "The island permits it, you understand eventually, because the island LIKES it: a keeper who holds the door closed and the window open. Hidden, and not alone. It was always possible. It just needed someone to be both.",
                }),
                ["SAIL_BLESSED"] = ("TWO TICKETS OUT", new[]
                {
                    "You sail on the first fair morning of the dry season, through the reef gate at slack tide, with your whole hundred days stowed and lashed — and your companion aboard, because that was the one term the horizon was never getting you without.",
                    "The crossing takes nine days and tries to kill you twice, in the old sea's old ways, and fails: you are not who the sky dropped here. When the shipping lane finally lifts a hull over the horizon, your flare — the last one, kept a hundred days for exactly this — goes up like a promise kept.",
                    "The world takes you back with paperwork and wonder. It has no category for what stands beside you on the rescue deck — quarantine is discussed, briefly, by people who have not yet met the animal in question — and it adjusts, as the world does. You live near the sea, after. You were always going to. And some nights, on the right wind, you both go down to the water and stand very still, listening for a rhythm the charts never found.",
                }),
                ["RYO_BOAT"] = ("TWO SAILS OUT", new[]
                {
                    "The Kingfisher goes out through the reef gate on the first fair morning of the dry season, patched and graceless and singing at every seam, with two castaways aboard who between them owe the sea nothing at all.",
                    "Ryo cries at the wheel for the first hour and blames the salt. The crossing is his masterpiece: eleven days threaded through weather you'd never have read alone, to a shipping lane, to a stunned freighter, to a harbor where a man who lost everything to the sailing dream brings his salvaged boat and his salvaged self alongside, very gently, and just sits there awhile with his hands on the wheel.",
                    "You stay friends the way crew stay friends: permanently, at any distance. The Kingfisher, rebuilt properly, does eventually finish a circumnavigation — you fly out for the last leg — and if her log's middle chapter reads like myth, the two of you have long since stopped arguing with anyone about it. You know where the island is. It knows where you are. Everyone keeps the arrangement.",
                }),
                ["LONG_SWIM"] = ("THE LONG SWIM", new[]
                {
                    "You go alone, the way you arrived.",
                    "The raft holds. The window in the veil lets you through — you feel it happen, a pressure lifting off the compass at dusk on the second day, like a hand opening — and after that it is only the ocean, the old honest enormous ocean, and you, for eleven days that burn off everything inessential that a hundred island days hadn't already claimed.",
                    "The tanker that finds you gives you a bunk and a phone and the world back. You take it. You use it well — you find, to your surprise, that you know how to live now, anywhere, which was perhaps the island's parting gift or perhaps its point. But you left the fire banked and the door unlatched, wherever it was you left them, and on quiet nights for the rest of your life the seventh beat of anything — music, rain, a heart — turns your head toward the sea.",
                }),
                ["WHOLE_SKY"] = ("THE WHOLE SKY", new[]
                {
                    "You leave with the island's blessing, which is a thing no chart, no science, and no story you'll ever tell can hold: the Tidewell read your going and APPROVED it, and the veil opens for your sail like a hand ushering you through.",
                    "And you come back. That is the whole of the miracle, the ending past the endings: the world takes you in, hears what you choose to tell, gives you your life — and every year, when the dry season opens, a small weathered boat threads a passage that exists for no other hull on Earth, and the island rises green off the bow, and they are all on the beach. The old woman with the braid, straighter-backed than her years allow, pretending she wasn't watching for the sail since dawn. The sailor and his boatyard flags. The watcher-turned-friend, waving from the surf like the girl she never got to be. And at the water's edge, before everyone, first into the shallows —",
                    "— your companion, who never doubted, because you promised, and the island keeps the promises of those it keeps.",
                    "Two lives, held with open hands, and the whole sky between them yours.",
                }),
                ["REGRET"] = ("THE REGRET", new[]
                {
                    "You leave because leaving is offered, which is not the same as wanting to go, and you know it in the boat, and you know it on the ship, and you know it — with a completeness that has its own terrible calm — at a window in a city, years later, watching rain.",
                    "You are fine. That's the cruelty of it: the world took you back without a seam, gave you the job and the noise and the rooms, and nothing is wrong, and you never found out. What the grove would have told you. What the seventh beat was counting toward. Who you were becoming there, in the last light, before you traded that person for a berth and a hot shower — you left in the low season of your own heart, and low seasons, you understand now, are exactly when the island does its quietest work.",
                    "Some nights you take out the lighter — they let you keep the lighter — and turn it over, and put it away. The island is still there. It is not on any chart. Neither, entirely, are you.",
                }),
                ["CARTOGRAPHER"] = ("THE CARTOGRAPHER'S RETURN", new[]
                {
                    "You leave with coordinates in your head and depth in your bones, and you do the thing you swore in the boat you'd decide about later: you tell. Carefully, credibly, to serious people with serious funding — and eighteen months later you stand at the rail of a research vessel threading the exact latitudes of your hundred days, with sonar and satellites and a hold full of instruments, coming back heavy.",
                    "The island is not where it was. It is not anywhere. Three weeks of grid-search find seamounts the charts already knew, a horizon scrubbed clean, and — on the last night, on every instrument at once, for four seconds — a rhythm. Seven beats. The oceanographers call it an anomaly. You call it, privately, what it is: a door being not slammed but <i>held</i>, politely, from the inside, by something that read your intentions across two thousand miles of open water and found them wanting.",
                    "You go back to your life as the world's leading expert on a place that declines to exist. The expedition's data is sealed in three archives. Your compass, on quiet nights, still points true — and you understand at last that it was never lying before. It was telling you where you were welcome. It has stopped.",
                }),
                ["REMAIN"] = ("REMAIN, WILLINGLY", new[]
                {
                    "The ship comes exactly as you once begged it to: grey hull, white water, the horn's long civilized bellow rolling across your bay like the answer to every prayer you sent up from the early fires. And you take your kit, and your quiet heart, and you walk up into the treeline, and you hide.",
                    "They search for two days — you did the arithmetic; you left them a cold camp and no graves, and the sea keeps drowning's secrets cheap — and from the green shade you watch strangers grieve you carefully, write you down, and go. The horn sounds once more off the reef, long and fading. You stand in the surf of your own beach and listen to your old life leave without you, and what fills you is not loss. It has taken you one hundred days to learn its true name: it is <i>arrival</i>.",
                    "The island does not remark on it. The tide comes in on schedule; the junglefowl resume their parliament; your fire takes on the second match. But that night the lagoon runs its seven beats so bright the wet sand holds the light after each pulse — and you have lived here long enough to know a door being bolted from your side of it, at your word, forever, gently. You asked to stay. Everything heard you.",
                }),
                ["HERMIT_HEIR"] = ("THE HERMIT'S HEIR", new[]
                {
                    "She does it without ceremony, because ceremony was Aleksander's department: one grey morning she puts the grove's ledger in your hands — seed-lines and grave-lines and forty years of weather in a hand that stopped being neat decades ago — and says, \"Well. Somebody competent had better,\" and that is the whole of the bequest, and both of you pretend your eyes are fine.",
                    "You learn the grove the way she demands: by argument. Which trees forgive pruning and which hold grudges; where Ilsa is, and Aleksander, and the small stone with no name that she will explain exactly once, near the end, in nine words that reorganize everything you thought you knew about her exile. She teaches you the last thing she never told Vane — not the science; the <i>reason</i> — and when she goes, in her sleep, in her chair, facing the sea, the island loses its oldest secret-keeper and does not lose the secrets.",
                    "You keep the grove. Tea still happens at the hour tea happened; her mug stays on its hook and works better there than anywhere else you could put it. In her tenth spring gone, a seedling she never told you about comes up flowering between the graves, and you sit down on the cold ground and laugh and grieve at once — supervised, you are certain, from somewhere with a good view of the sea.",
                }),
                ["ILSA_ANSWER"] = ("ILSA'S ANSWER", new[]
                {
                    "Vane's instrument takes you a season to finish: her journals' impossible diagrams, your salvaged parts, Edda at your shoulder disagreeing with a dead woman's handwriting in a voice that keeps catching. It is a listening device. It was always a listening device — not to find the Hum. To <i>resolve</i> it. Ilsa's question, the one the island took her before she could ask properly: not \"what is it\" but \"what is it FOR.\"",
                    "You take the measurement on a king-tide midnight at the temple pool, the needle-drum turning, the seven beats coming up the mountain's bones — and the instrument does what thirty years of Halcyon's money never could, because it was built the way she designed it: to listen the way you listen to a heart, not a suspect. And the answer resolves out of the noise so simply that you and Edda sit in silence for a long time afterward. You will not write it here. It is two words. Ilsa, dying, guessed both of them.",
                    "You give the finished work — instrument, journals, answer — not to the world but home: to Edda, who carries it up the mountain herself, and to the Kaari, who receive it the way one receives back a borrowed grief. Understanding as an act of love, not disclosure. Somewhere in the Green's keeping-house, a machine built by three castaways across sixty years listens to the island being alive, and is at peace, and so — at very long last — is everyone who built it.",
                }),
                ["DROWNED_DOOR"] = ("THE DROWNED DOOR", new[]
                {
                    "The king tide opens the way at slack water, exactly as the maps you were never shown promised: below the Tidewell, below the temple's drowned nave, a stair going down where stairs have no business, lit — you stopped pretending otherwise weeks ago — for you.",
                    "What is at the bottom of the stair is written exactly once, in no language, on the inside of your understanding, in the four minutes before the tide turns. You will spend the rest of your life failing to repeat it and declining to try. It is not a machine and not a god and not a garden, and it is a little like all three, and it knows your name the way the Hum knows it — seventh, softly — and it shows you, unmistakably, that you were expected.",
                    "You surface at dawn into a world with one more room in it than anyone will ever believe, and you live differently afterward — not transformed; <i>oriented</i>, the way a needle is oriented, quietly, all the time, toward something true that nobody else can see. The door does not open for you twice. It does not need to. Some things you visit once and then simply, permanently, know the way home to.",
                }),
                ["TIDE_PRICE"] = ("THE TIDE PRICE", new[]
                {
                    "The wound under the mountain is losing, and everyone who can read the island knows it: the tremors climbing their ladder, the lagoon's beats arrhythmic, the heartglass seam bleeding light like a lamp burning its last oil. The covenant lamp has to go down — all the way down, to the seam itself — and it has to be carried, and the carrier stays. The murals are unambiguous. Someone holds the seam. It was always going to be someone.",
                    "You go because you can, which is the whole of the reason and always was: no lineage, no sanction, just a castaway the island fed and taught and kept, paying the only bill that was ever going to come due for all of it. The descent takes a day. The lamp knows the way. And at the seam — hands on the wounded glass, the island's whole pulse coming up your arms — you feel the price taken and the payment <i>received</i>: the tremors easing, the beats steadying, two thousand lives above you unclenching in a night, forever.",
                    "The epilogue is not yours; that is the point of the price. It belongs to the ones on the beaches and the terraces: to the fires that keep burning, the boats that come home, the festivals that return year on year to a lagoon that pulses seven and true. They tell your story in the counting songs — the hundredth-day stranger who carried the lamp — and every king tide, at the temple pool, someone leaves a light burning all night at the waterline. You are not there to see it. You are not entirely not.",
                }),
                ["WHAT_REMAINS"] = ("WHAT REMAINS", new[]
                {
                    "You stay because of the afternoon you almost didn't get to. That's the whole ledger of it: once, in the middle of these hundred days, the island reached out and nearly took the one warm life it had lent you — and then, for reasons you nursed into being with boiled water and your two hands and every hour you had, it didn't. The scar is right there. You can rest your hand on it. You do, more than you'd admit.",
                    "People who have never almost lost anything talk about home as a place. You know better now: home is a heartbeat you can check on. So you dig in — the farm, the fences, the fire — but you do it differently than the pure homesteaders do, with a kind of attention that never fully stands down. You count noses at dusk. You keep the med-basket stocked past reason. When the weather turns, you turn with it, early, always, toward wherever your family of one-plus-whatever is standing.",
                    "It makes for a smaller life than the mountain offered and a larger one than the sea did: measured not in acres or endings but in every ordinary evening that arrives with everyone still in it. The island nearly taught you the other lesson, the hard one. You built a whole beautiful stubborn decade out of the reprieve instead — and if some nights you hold on a little too long at the fire, well. The one you hold has never once complained.",
                }),
                ["ALONE_UNBROKEN"] = ("ALONE, UNBROKEN", new[]
                {
                    "No companion ever chose you, or you never chose one — the clearing had its afternoon, and you walked home alone, and the island watched what you did with that. What you did with that was: everything. Every fence, every filter, every fire, every yard of thatch and every jar of stores, one pair of hands, one stubborn ledger-keeping heart, one hundred days.",
                    "This is the hardest ordinary life on the island and you built it without witnesses — which means you built it without the thing witnesses provide, the cheap fuel of being seen — and so the island, which measures such things exactly, paid you in the rarer coin: competence that answers to no one, quiet that stopped being empty somewhere around Day 60, and a self so thoroughly yours that rescue, rescue itself, has become a thing you could take or leave. You know which. You knew at dusk tonight, at the tideline, when the choosing came due and your heart came back level.",
                    "The epilogue is one image, because it only needs one: sunrise, the good chair, the sea doing its two-a-day miracle, and on the shelf at your elbow a coconut with a painted face, who has heard the whole of it, every word, and who regards the both of you this morning — survivor and survivor — with what you have long since stopped pretending isn't pride.",
                }),
                ["HUM_SILENCED"] = ("THE HUM SILENCED", new[]
                {
                    "You go down at the lull with the drill-bar across your back and the lamp you know how to trust, past the Gallery of Hands, past your own high-water marks, to the seam where the island keeps its voice.",
                    "You have thought about it for thirty days and the thinking changes nothing at the bottom: the seam is a hand's width of living light in black stone, and it is the veil, and the fog, and the spun compasses, and the drowned radios, and the door that will not stay found — and one honest hour with a steel bar ends it. You take the hour.",
                    "The heartglass does not shatter like glass. It goes out like a note — one long descending tone through the rock, through the water, through the soles of your feet, falling and falling until it passes under hearing, and then the Gullet is only a cave, and the water in it is only water, and the dark behind your lamp is only dark.",
                    "On the surface: the lagoon lies flat and ordinary under the stars. Your compass needle crosses the beach and settles, trembling, on true north, and stays. The radio, when you kneel to it at the station, is clear from band to band — no skips, no sevens, just the open, crowded, human static of the whole talking world.",
                    "The freighter takes nine days. The helicopter, after it, forty minutes. Rescue, once the island can be pointed at, is a logistics problem, and the world is very good at logistics.",
                    "Within the year there is an anchorage. Within the decade, a chart with a name on it that is not Vessakai, and flights twice a week, and a resort brochure that calls the caldera \"dramatic.\" The Inner Green empties inland one moonless night before the first surveyors reach the rim — four hundred people into the folded country, and where they go the world never learns, because the world stopped being the kind of thing that couldn't find them, and they knew it first.",
                    "Edda does not come down to see you off.",
                    "Every compass you ever own again points true.",
                }),
            };

        // Cold Fire without its cyclone (the plain cold-night exposure death,
        // a 3D-side cause) keeps the lean card — the audit framing belongs
        // to the storm that ran it
        static readonly string[] ColdFireExposure =
        {
            "No roof, no fire, and a night that kept every promise the dusk wind made.",
        };

        // THE ISLAND'S OWN: the VN's function-valued core — the water's
        // ACCEPT verdict is written per companion (scenes-chapter7.js).
        static readonly Dictionary<string, string> IslandsOwnAccept = new Dictionary<string, string>
        {
            ["kavi"] = "It sees a dog descended from the drowned, grief braided into loyalty and both worn like a working harness — a creature that has spent every night of a hundred keeping watch over the one thing the sea gave him to keep. The seven beats pause. Recount. <i>Accept.</i> Keeper Kavi takes the post the way he took your camp: quietly, entirely, forever. The ridge songs change that very night — the whole pack singing the new covenant down the length of the island — and the island, for the first time in four hundred years, sings something back.",
            ["buri"] = "It sees devotion that never once stopped to ask what it would cost — a warm boulder that walked through a gore-line, a heart that audits the camps at night to be sure everyone is still where he left them. The seven beats pause. Recount. <i>Accept.</i> Keeper Buri does for the island what he did for your acre: everything, twice, with his whole chest — and the old treaties of the inland dark put roots down around him the way a forest roots around a spring.",
            ["moa"] = "It sees six ounces of copper courage that has never yielded a path in her life — the smallest keeper any mural will ever show, and the murals <i>will</i> show her; you live to watch the Kaari cut the first one. The seven beats pause. Recount. <i>Accept.</i> Keeper Moa stands her watch the way she stood every one of yours: entirely. In the years after, storms are observed — measured, Ryo insists, logged — to go <i>around</i>.",
        };

        static (string, string[]) BuildIslandsOwn(GameState s)
        {
            string accept = IslandsOwnAccept.TryGetValue(s.Companion ?? "kavi", out var a)
                ? a : IslandsOwnAccept["kavi"];
            return ("THE ISLAND'S OWN", new[]
            {
                "You had it wrong for weeks, and the wrongness only shows itself on the stair: the covenant stood open like a door nobody fit, and you kept measuring <i>yourself</i> against the frame. But the stone on the fifth landing says it plainly, has said it all along. A keeper is not chosen. A keeper is the one still kneeling when the tide has asked everyone else to leave.",
                "You know somebody like that. You have known them for exactly one hundred days.",
                "So you climb the broken mountain one last time, the two of you, dusk going to dark going to the pool's own light — and at the Tidewell you do the introducing the old way, the way the murals show it: name, and debt, and gift. And then you shut your mouth, castaway, and let the water look.",
                accept,
                "And you? You stay — obviously, permanently, gladly. You are the keeper's person: no mural has a rank for it yet, and one day one will. You build your fire at the mountain's foot and learn the work from the outside — the rounds you can share, the errands a keeper without thumbs prefers delegated — and on clear nights the two of you sit at the pool's lip in the seven-beat light, the island's own and the island's guest, neither of you ever entirely off duty again. Neither of you, not once, ever wanting to be.",
            });
        }

        public static (string Title, string[] Body) Resolve(GameState s)
        {
            if (s.EndingId == "ISLANDS_OWN")
                return BuildIslandsOwn(s);
            if (s.EndingId != null && Cores.TryGetValue(s.EndingId, out var core))
                return core;
            if (s.EndingId != null)
                return Cores["HOME"]; // the VN's own fallback: unwritten cores read as ROOTSTEAD
            if (s.DeathCause != null)
            {
                string title = DeathTitles.TryGetValue(s.DeathCause, out var t) ? t : "THE ISLAND KEEPS";
                string[] body = DeathBodies.TryGetValue(s.DeathCause, out var b)
                    ? b
                    : new[] { "The island keeps what it catches." };
                if (s.DeathCause == "coldfire" && !s.Is("CYCLONE_APPLIED"))
                    body = ColdFireExposure;
                return (title, body);
            }
            return ("TIDEBOUND", new[] { "The story is still being written." });
        }

        /// <summary>Whether this run has reached any terminal state.</summary>
        public static bool RunIsOver(GameState s) => s.DeathCause != null || s.EndingId != null;

        // ---- the parameterized epilogue (scenes-chapter7.js epilogue) --------
        // Lines assemble from this run's specific flags; only the ledger lines
        // whose systems exist in v1 are ported — the rest arrive with them.
        static bool Leaving(string id) =>
            id == "RESCUE" || id == "SAIL_BLESSED" || id == "RYO_BOAT" || id == "LONG_SWIM" ||
            id == "ROSAS_RANSOM" || id == "REGRET" || id == "EMPTY_HORIZON" || id == "CARTOGRAPHER" ||
            id == "COCONUT_MOGUL" || id == "LAST_DELIVERY" || id == "HUM_SILENCED";

        public static List<string> Epilogue(GameState s)
        {
            var t = new List<string>();
            string id = s.EndingId;
            if (id == null) return t;
            bool leaving = Leaving(id);
            bool companionCovered = id == "ISLANDS_OWN" || id == "LAST_PACK" || id == "SOUNDER";

            if (id == "ISLANDS_OWN" && s.Is("EDDA_MET"))
                t.Add("— Edda hears it before you finish saying it — she always hears it — and sets down the pestle and looks at you for a long, still moment. \"Forty years,\" she says at last, \"I wondered what that pool was holding the post open <i>for</i>. It was never waiting for a better human.\" A snort, at herself, at everything. \"It was waiting for you to introduce them.\" She takes tea up the mountain every new moon after. She is, every time, received.");
            if (id == "TIDE_PRICE")
            {
                if (s.Companion == "kavi")
                    t.Add("— Kavi keeps the temple stair for nine days past all sense — the Kaari bring food, and are studied, and are permitted — and then walks down the mountain and takes up your fire, and tends it, in the way of his kind, for the rest of a long and honored life. The Green feeds that fire forever. Nobody on the island calls it anything but yours.");
                if (s.Is("EDDA_MET"))
                    t.Add("— Edda plants a tree at the temple pool with her own hands, which she lets exactly two people help with, and argues with your memory every day of her remaining springs the way she argues with everything she cannot do without.");
                t.Add("— And the lagoon runs seven beats and true, year upon year upon year — which is the receipt, and the monument, and the point.");
                return t;
            }
            if (s.Companion == "kavi" && !companionCovered)
            {
                if (leaving && id != "SAIL_BLESSED" && id != "WHOLE_SKY")
                    t.Add("— Kavi watches your boat from the tideline until it is nothing, and then — the pack has long since made its peace — turns inland, to the wild that always held his other half. Some nights, sailors becalmed off an uncharted sea swear they hear a dog singing.");
                else if (!leaving)
                    t.Add("— Kavi grows grey-muzzled at your fire, patriarch of a line of half-wild pups who own the middle distance of your every horizon. He sleeps touching your back to the end of his days, and he is buried on the hill with honors, and the pack sings over it, and you finally, fully, sing back.");
            }
            else if (s.Companion == "buri" && !companionCovered)
            {
                if (leaving && id != "SAIL_BLESSED" && id != "WHOLE_SKY")
                    t.Add("— Buri cannot come — you know it, he knows it, and the last morning he leans his whole warm mass against you one final time and then, with the dignity of a king, does not watch you go. The homestead is his now. Heaven help anything that raids it.");
                else if (!leaving)
                    t.Add("— Buri anchors your world like a warm boulder for years upon years, foreman of every project, uncle to every arriving creature, undefeated in the field of enthusiastic destruction. He dies old, in the sun, mid-nap, entirely certain of his welcome everywhere — the only fate he would have accepted.");
            }
            else if (s.Companion == "moa" && !companionCovered)
            {
                if (id == "REMAIN")
                    t.Add("— Moa stood with you in the treeline while your old life called your name across the water — a small copper hen, holding still because you were holding still, on duty because you were on watch. When the horn faded she looked up at you once, and led the way home, down the path, at the head of the column, as if the choosing had been jointly ratified. As far as she was ever concerned, it had been. You never once told the story without stopping at that part.");
                else if (leaving && id != "SAIL_BLESSED" && id != "WHOLE_SKY")
                    t.Add("— Moa you carry to Edda's grove yourself, the night before — the one goodbye you couldn't do at a tideline. The old woman takes the basket without a word, and the small copper hen stands on her wrist facing the sea, and between the two of them your leaving is, at last, permitted.");
                else if (!leaving)
                    t.Add("— Moa rules. There is no other verb: the flock she founds owns your acres, her descendants carry her copper and her courage, and she herself lives to a preposterous age, storm-proof to the end, and dies on Edda's old blanket, on duty. You bury the bravest heart you ever met under the good tree, with a full parade.");
            }
            else if (s.Companion == null && id != "ALONE_UNBROKEN")
                t.Add("— You did the whole of it alone — the solo route, the hardest road on the island — and the Ledger marks it in the old way: <i>Alone, unbroken.</i>");
            if (s.Is("EDDA_MET") && id != "HERMIT_HEIR" && id != "ISLANDS_OWN")
                t.Add("— Edda: " + (leaving
                    ? "she refuses rescue, refuses goodbye ceremonies, and presses on you at the last a wax-sealed letter \"for the world, if it must have one\" — which proves to contain, in full, her resignation from Project Halcyon, dated 1979, effective immediately, tone scorching. You deliver it. It is framed, eventually, in an archive. She'd hate that, and know it was funny."
                    : s.Edda >= 60
                        ? "her last years are warm ones — your fire and her grove, tea and insults, the drawer's weight finally shared. She dies in her garden in her ninetieth spring, mid-argument with a seedling, and is buried under the flowering tree between Ilsa and Aleksander, where all three of them can supervise the sea."
                        : "her mountain keeps her to the end, flinty and sovereign, and the island is never told a better secret-keeper."));
            if (s.Is("RYO_MET") && id != "RYO_BOAT")
                t.Add("— Ryo: " + (leaving
                    ? "he sails out beside you as far as the veil, then — to your shout of protest across the water — puts the Kingfisher's helm over and turns BACK, laughing, pointing at the island like a man pointing at a keeper's post. \"Somebody has to mind the sea things!\" The island's harbormaster. It suits him better than arriving anywhere ever did."
                    : "he never does sail for the world — the boatyard, the salvage, the arrivals who need a sailor's hands; the island gave him the thing the circumnavigation was for, and he knows it. The Kingfisher goes out and comes back, out and comes back, like a tide with a name."));
            if (s.Is("KING_ALLY") || s.Is("KING_FED"))
                t.Add("— The Boar King holds the treaty to the end of his old age, and the inland dark holds it after him: nothing with tusks ever again crosses your boundary uninvited. Rent, it turned out, was a language. You both spoke it.");
            if (s.Is("HOME_NAMED") && !leaving)
                t.Add("— " + (s.Is("NAME_ROOTSTEAD") ? "Rootstead" : s.Is("NAME_DRIFTWOOD") ? "Driftwood" : "The Landing")
                    + " outlives every plan you had for it. Names hold, on this island. The island heard you give it.");
            if (s.Is("INNER_GREEN") && leaving)
                t.Add("— The Inner Green keeps your name in its counting songs: the first guest, who ate first, and left, and kept the secret whole. Naia's letters — carried out once a year by means she declines to explain — find you anywhere you live, forever.");
            return t;
        }

        // ---- THE LEDGER OPENS (scenes-chapter7.js ledgerReport) ---------------
        public static List<string> LedgerReport(GameState s)
        {
            var roads = new List<string>();
            if (!s.Is("TIDEWELL_KEEP") && Chapter6Events.Regard(s) >= 4) roads.Add("a covenant went untaken at a mountain pool");
            if (s.Companion != "nine") roads.Add("something in the tide pools watched a castaway who never looked twice");
            if (!s.Is("E_WING_OPEN") && s.Is("STATION_OPENED")) roads.Add("a steel door in the east kept its room");
            if (s.Has("case") && !s.Is("CASE_OPEN")) roads.Add("a locked courier's case kept its answer to the end");
            if (!s.Is("INNER_GREEN")) roads.Add("a hidden town fed its fires unvisited");
            if (!s.Is("CONTACT_MADE")) roads.Add("a radio's four-second window opened for no one");
            if (s.Companion != null) roads.Add("five other wild lives waited at a clearing that only ever chose one");
            string tier = s.Trust >= 100 ? "kindred" : s.Trust >= 75 ? "devoted" : s.Trust >= 50 ? "bonded" : s.Trust >= 25 ? "tolerant" : "wary";
            string companionName = s.Companion == "kavi" ? "Kavi" : s.Companion == "buri" ? "Buri" : s.Companion == "moa" ? "Moa" : s.Companion;
            return new List<string>
            {
                "<i>— THE LEDGER OPENS —</i>",
                $"Run of {s.Day} days · {s.Flags.Count} entries in the Ledger · Signal {s.Route.Signal} / Roots {s.Route.Roots} / Depth {s.Route.Depth}"
                    + (s.Companion != null ? $" · Companion: {companionName} (trust {tier})" : " · Solo route"),
                "Roads not taken this life: " + string.Join("; ", roads.GetRange(0, roads.Count < 3 ? roads.Count : 3)) + ".",
                "The island is long, and other lives through it are still yours to try.",
            };
        }

        // ---- the run summary: the island will remember it like this ----------
        static readonly Dictionary<string, string> BackgroundNames = new Dictionary<string, string>
        {
            ["medic"] = "a flight medic",
            ["photog"] = "a wildlife photographer",
            ["cook"] = "a line cook",
            ["engineer"] = "a marine engineer",
        };

        static readonly (string Flag, string Line)[] SummaryDeeds =
        {
            ("SOS", "Your SOS waits on the beach for eyes that fly."),
            ("FLARE_SPENT", "You spent your only flare on a far light that never turned. The island saw."),
            ("FLARE_HELD", "A ship's light crossed the horizon, and you held your only flare. The island saw that too."),
            ("HELPED_COURIER", "A stranger's photograph is still in your pocket. \"If it's the same island…\""),
            ("GLYPH_1", "You found the strokes that run seven to a row."),
            ("SQUALL_DRY", "A squall tested your roof, and your roof won."),
        };

        public static List<string> Summary(GameState s)
        {
            var lines = new List<string>();
            BackgroundNames.TryGetValue(s.Background ?? "", out var bg);
            lines.Add($"Day {s.Day}. You came here as {bg ?? "a stranger"}.");

            if (s.Companion == "kavi")
                lines.Add(s.Is("KAVI_NAMED")
                    ? "At your side, to the end of the story: Kavi, the storm-grey island dog."
                    : "At your side: the grey dog, who never told you his name.");
            else if (s.Is("SOLO_ROUTE"))
                lines.Add("You walked the solo route: you, the island, and whatever watched.");

            int walked = 0;
            foreach (var region in Regions.All)
                if (s.Is(Regions.SeenFlag(region.Id))) walked++;
            lines.Add($"You walked {walked} of the island's {Regions.All.Length} charted reaches.");

            foreach (var (flag, line) in SummaryDeeds)
                if (s.Is(flag)) lines.Add(line);

            // the case remembers its state (runcard.js roads / scenes-chapter7.js)
            if (s.Is("CASE_OPEN"))
                lines.Add("You opened the courier's case: a dozen impossible gems, a fifty-year hunt in typed pages, and a chart older than both.");
            else if (s.Has("case"))
                lines.Add("A locked courier's case kept its answer to the end.");

            lines.Add("Nothing is decided. Everything is remembered.");
            return lines;
        }

        // ---- the raft: the early door out (convergence chooser, adapted) ------
        public static StoryScript BuildRaftScript()
        {
            var script = new StoryScript();
            script.Add(new StoryScene
            {
                Id = "raft_launch",
                Text = s => new List<string>
                {
                    "The raft is done — driftwood lashed with everything you could spare, a mast that is mostly hope, the tarp for a sail if you brought one. It rides the shallows, tugging at its line like it has somewhere to be.",
                    "The horizon is empty. It has been empty every day you've checked and most of the days you didn't. Out there: shipping lanes, eventually, maybe. Here: a fire that's lit, fences half-mended, a green and singing world that has started, in ways you don't like to examine, to feel like a place you live.",
                    "The sea does not grade on intention. You know that.",
                },
                Choices = new List<StoryChoice>
                {
                    new StoryChoice
                    {
                        Label = "Push off. Go NOW — ready or not.",
                        Sub = "The Empty Horizon. The sea does not grade on intention. You're going anyway.",
                        Do = s => s.EndingId = "EMPTY_HORIZON",
                    },
                    new StoryChoice
                    {
                        Label = "Step back from the line. Not today.",
                        Sub = "The raft will wait. The island, apparently, was already waiting.",
                        Do = s => { s.SetFlag("RAFT_REFUSED"); s.Stat(Meter.Hope, 2); },
                    },
                },
            });
            return script;
        }
    }
}
