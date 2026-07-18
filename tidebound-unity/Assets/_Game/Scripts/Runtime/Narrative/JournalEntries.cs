using System.Collections.Generic;

namespace Tidebound.Narrative
{
    /// <summary>
    /// The Ledger, rendered as prose: who you were, what you know, what
    /// you've done, what you carry. Pure — feeds the JournalUI and the
    /// tests. Law #3 applies: nothing undiscovered is ever named here.
    /// Route points never appear (the world reacts; numbers don't).
    /// </summary>
    public static class JournalEntries
    {
        static readonly Dictionary<string, string> BackgroundLines = new Dictionary<string, string>
        {
            ["medic"] = "You were a flight medic, before. Steady hands, other people's worst days.",
            ["photog"] = "You were a wildlife photographer, before. Patience as a profession.",
            ["cook"] = "You were a line cook, before. Twelve years of heat and knives.",
            ["engineer"] = "You were a marine engineer, before. If it's broken, it's a puzzle.",
        };

        /// <summary>Deed flags → Ledger prose, in the order they're listed.</summary>
        static readonly (string Flag, string Line)[] Deeds =
        {
            ("BRACED", "You met the crash with your body ready. It saved you the worst."),
            ("HELPED_COURIER", "You freed the courier from his chain. He paid in a photograph and a warning: it can be left."),
            ("SAW_ISLAND", "From the air you memorized the island's shape — a bay, a river mouth, a mountain with a broken crown."),
            ("COMPASS_SPINS", "Your compass turns all the way around, pointing at everything. The lagoon glows at night — seven slow beats."),
            ("TRIED_FIRE", "Fire has refused you once. The wood will be drier tomorrow. So will you."),
            ("SOS", "Giant letters of dark stone wait on the beach for anyone looking."),
            ("SQUALL_DRY", "A squall tested your roof. Your roof won."),
            ("FIRE_DROWNED", "A squall drowned your first fire without a sound."),
            ("FLARE_SPENT", "You spent the flare on a ship that never turned. The horizon owes you one answer."),
            ("FLARE_HELD", "A ship crossed the horizon and you held the flare. You stopped waiting; you started preparing."),
        };

        /// <summary>The locals, as the VN's known-list keeps them (engine.js) —
        /// descriptive lines only; real names wait to be earned (law #3).</summary>
        static readonly (string Animal, string Line)[] Locals =
        {
            ("kavi", "A grey dog watches you from the treeline."),
            ("ipo", "A monkey owes you a lighter."),
            ("vela", "A sea eagle paid you in fish."),
            ("buri", "A bearded pig knows where you sleep."),
            ("moa", "A junglefowl hen is still alive because of you."),
            ("nine", "Something in the tide pools has been watching you back."),
        };

        static readonly (string Flag, string Line)[] Salvage =
        {
            ("SALV_flaregun", "the flare gun, one argument with the horizon"),
            ("SALV_medkit", "the first-aid kit"),
            ("SALV_toolbox", "the pilot's toolbox"),
            ("SALV_rations", "the rations and the folded tarpaulin"),
            ("SALV_case", "the courier's locked case, heavy as a bad conscience"),
        };

        /// <summary>Item keys → shown names (engine.js item names, emoji dropped).</summary>
        static readonly (string Key, string Name)[] ItemNames =
        {
            ("driftwood", "Driftwood"),
            ("rations", "Tinned rations"),
            ("medkit", "First-aid kit"),
            ("knife", "Chef's knife"),
            ("multitool", "Multitool"),
            ("camera", "Camera (cracked lens)"),
            ("lighter", "Lighter"),
            ("flaregun", "Flare gun"),
            ("toolbox", "Pilot's toolbox"),
            ("tarp", "Tarpaulin"),
            ("case", "The courier's case (locked)"),
            ("photo", "A stranger's photograph"),
        };

        public static List<string> Build(GameState s)
        {
            var lines = new List<string>
            {
                $"<b>THE LEDGER — Day {s.Day}</b>",
            };

            if (s.Background != null && BackgroundLines.TryGetValue(s.Background, out var who))
            {
                lines.Add("");
                lines.Add(who);
            }

            // ---- what you know (survival state, in the VN's voice) ----------
            lines.Add("");
            lines.Add("<b>What you know</b>");
            lines.Add(s.Fire >= 1
                ? "You have fire." + (s.Fire > 1 ? " A proper hearth, even." : "")
                : "You have no fire.");
            lines.Add(s.Shelter >= 2 ? "Your shelter is snug and storm-braced."
                : s.Shelter == 1 ? "Your lean-to stands — barely a roof, but yours."
                : "You still have no shelter worth the word.");

            // ---- deeds -------------------------------------------------------
            var deeds = new List<string>();
            foreach (var (flag, line) in Deeds)
                if (s.Is(flag)) deeds.Add(line);

            var salvaged = new List<string>();
            foreach (var (flag, line) in Salvage)
                if (s.Is(flag)) salvaged.Add(line);
            if (salvaged.Count > 0)
                deeds.Insert(0, "From the sinking fuselage you saved " + string.Join(", and ", salvaged) + ".");

            if (deeds.Count > 0)
            {
                lines.Add("");
                lines.Add("<b>What you've done</b>");
                lines.AddRange(deeds);
            }

            // ---- the locals ---------------------------------------------------
            var locals = new List<string>();
            foreach (var (animal, line) in Locals)
                if (s.Met.TryGetValue(animal, out var met) && met)
                    locals.Add(line);
            if (locals.Count > 0)
            {
                lines.Add("");
                lines.Add("<b>The locals</b>");
                lines.AddRange(locals);
            }

            // ---- what you carry ----------------------------------------------
            var carried = new List<string>();
            foreach (var (key, name) in ItemNames)
            {
                int n = s.Count(key);
                if (n > 0) carried.Add(n > 1 ? $"{name} × {n}" : name);
            }
            if (carried.Count > 0)
            {
                lines.Add("");
                lines.Add("<b>What you carry</b>");
                lines.Add(string.Join(" · ", carried));
            }

            return lines;
        }
    }
}
