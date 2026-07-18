using System;

namespace Tidebound
{
    public struct ActionResult
    {
        public bool Success;
        public string Line;

        public static ActionResult Ok(string line) => new ActionResult { Success = true, Line = line };
        public static ActionResult Fail(string line) => new ActionResult { Success = false, Line = line };
    }

    /// <summary>
    /// The Castaway Bay hub actions, ported number-for-number from the VN
    /// (scenes-chapter1.js camp hub). These deltas are machine truth — don't
    /// retune them here; balance changes are design decisions made against
    /// design/04-survival.md. The 3D layer (interactables) adds material
    /// gating and time costs on top; this class stays VN-pure.
    /// Randomness is injected so tests are deterministic.
    /// </summary>
    public static class SurvivalActions
    {
        // ---- 🥥 Coconuts — drink and eat --------------------------------
        public static ActionResult Coconuts(GameState s)
        {
            s.Stat(Meter.Thirst, 28);
            s.Stat(Meter.Hunger, 10);
            s.Stat(Meter.Energy, -8);
            return ActionResult.Ok("The palms provide. Milk first, then the white meat, scraped with a shell.");
        }

        // ---- 🌿 Forage the treeline --------------------------------------
        public static ActionResult Forage(GameState s, Func<float> rng)
        {
            s.Stat(Meter.Energy, -8);
            s.Stat(Meter.Hunger, 16);
            s.Stat(Meter.Thirst, 4);
            // two independent rolls, exactly the VN's call order
            if (rng() < 0.3f && !s.Has("knife") && !s.Has("multitool"))
            {
                s.Stat(Meter.Health, -6);
                s.Stat(Meter.Hope, -2);
                return ActionResult.Ok("A thorn vine opens the back of your hand — shallow, but out here every cut is a small loan from a lender you don't know yet.");
            }
            if (rng() < 0.35f)
            {
                s.Stat(Meter.Hope, 3);
                return ActionResult.Ok("A hornbill crosses the canopy like a thrown hatchet, and for a moment you forget to be a castaway and are merely somewhere astonishing.");
            }
            return ActionResult.Ok("Seagrapes, a crab that objects, pale figs the birds have been at first — the birds know their business, so you trust their leavings.");
        }

        // ---- 🔥 Make fire --------------------------------------------------
        public static ActionResult MakeFire(GameState s, Func<float> rng)
        {
            s.Stat(Meter.Energy, -12);
            float p = s.Has("lighter")
                ? 1f
                : 0.45f
                  + (s.Is("BG_ENGINEER") ? 0.2f : 0f)
                  + (s.Has("toolbox") ? 0.15f : 0f)
                  + (s.Is("TRIED_FIRE") ? 0.2f : 0f);
            if (rng() < p)
            {
                s.Fire = 1;
                s.Stat(Meter.Hope, 8);
                s.AddRoute(RouteAxis.Roots, 1);
                return ActionResult.Ok("Smoke, then a coal, then a flame you shield with your whole body like a newborn. You have fire.");
            }
            s.SetFlag("TRIED_FIRE");
            s.Stat(Meter.Hope, -4);
            return ActionResult.Fail("Friction, stubbornness, blisters — and no coal. Tomorrow the wood will be drier. So will you.");
        }

        // ---- ⛺ Build / improve the shelter -------------------------------
        public static ActionResult BuildShelter(GameState s)
        {
            s.Stat(Meter.Energy, s.Has("toolbox") || s.Is("BG_ENGINEER") ? -10 : -14);
            s.Shelter += 1;
            s.AddRoute(RouteAxis.Roots, 2);
            return ActionResult.Ok(s.Shelter >= 2
                ? "Walls that mean it, a roof that argues with rain and wins. It is starting to look suspiciously like a home."
                : "A lean-to above the tide line: driftwood bones, frond skin. Hard labor now, better nights after.");
        }

        // ---- 🆘 Stamp SOS into the beach -----------------------------------
        public static ActionResult StampSos(GameState s)
        {
            s.Stat(Meter.Energy, -8);
            s.Stat(Meter.Hope, 4);
            s.AddRoute(RouteAxis.Signal, 3);
            s.SetFlag("SOS");
            return ActionResult.Ok("Giant letters, dark stones, read best from the sky. For whoever is looking.");
        }

        // ---- 🍲 Cook a real meal (fire ≥ 1, hunger < 80) --------------------
        public static ActionResult CookMeal(GameState s)
        {
            bool cook = s.Is("BG_COOK");
            s.Stat(Meter.Energy, -6);
            s.Stat(Meter.Hunger, cook ? 36 : 26);
            s.Stat(Meter.Hope, cook ? 8 : 5);
            s.Stat(Meter.Thirst, -2);
            return ActionResult.Ok("Crab, limpets, figs, fire. Food that argues you're still a person.");
        }

        // ---- 😴 Rest in the shade -------------------------------------------
        public static ActionResult Rest(GameState s)
        {
            s.Stat(Meter.Energy, 16);
            s.Stat(Meter.Hope, 2);
            s.Stat(Meter.Health, s.Injury != null ? 0 : 3);
            return ActionResult.Ok("You do the bravest thing: recover.");
        }

        // ---- 🐚 Work the tide pools (VN camp hub, verbatim) -----------------
        public static ActionResult TidePools(GameState s)
        {
            s.Stat(Meter.Energy, -6);
            s.Stat(Meter.Hunger, 8);
            s.Stat(Meter.Thirst, -2);
            s.TidePoolVisits += 1;
            s.AddRoute(RouteAxis.Depth, 1);
            return ActionResult.Ok("Shellfish, and whatever else lives in the shallows' little worlds. Something in the far pool was watching you work. Probably a rock.");
        }

        // ---- 💧 Drink at the trickle (3D adaptation; the bay's safe source) --
        public static ActionResult Drink(GameState s)
        {
            s.Stat(Meter.Thirst, 18);
            return ActionResult.Ok("Cold from the rock, tasting faintly of stone and moss. The island's one free gift.");
        }

        // ---- Sleep — the VN's night handler, minus the segment tick ---------
        /// <summary>
        /// Applies the ration nightcap, the energy floor (45 + shelter*12 +
        /// fire*8) and the hope swing. The caller then ticks the clock to
        /// dawn — same order as the VN (floor first, then the night drain).
        /// </summary>
        public static ActionResult Sleep(GameState s)
        {
            if (s.Has("rations") && s.Stats.Hunger < 55)
            {
                s.AddItem("rations", -1);
                s.Stat(Meter.Hunger, 25);
            }
            float floor = 45 + s.Shelter * 12 + s.Fire * 8;
            if (s.Stats.Energy < floor) s.Stats.Energy = floor;
            s.Stat(Meter.Hope, s.Shelter > 0 || s.Fire > 0 ? 1 : -3);
            return ActionResult.Ok(s.Shelter > 0 || s.Fire > 0
                ? "Sleep takes you the way the tide takes things: completely, and without asking."
                : "You dig a body-shaped trench in sand still warm from the day and learn what the stars look like at 3 a.m.");
        }
    }
}
