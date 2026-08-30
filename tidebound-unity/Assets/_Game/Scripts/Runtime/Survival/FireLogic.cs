using System;

namespace Tidebound
{
    /// <summary>
    /// The 3D fire's fuel bookkeeping. The VN's fire is a camp tier that
    /// never burns down; the 3D adaptation makes it a possession to maintain
    /// (design/04: "fire is a possession to maintain, not a button").
    /// Fuel is measured in segments of burn time and lives in
    /// GameState.FireFuel so it saves. Pure logic — the CampfireInteractable
    /// is the world-facing skin.
    /// </summary>
    public static class FireLogic
    {
        /// <summary>Segments of burn time one piece of driftwood buys.</summary>
        public const float FuelPerFeed = 2f;

        /// <summary>The pit holds only so much wood.</summary>
        public const float MaxFuel = 6f;

        /// <summary>At or below this the fire is visibly embers — warn (law #1).</summary>
        public const float EmberThreshold = 1f;

        /// <summary>Fuel granted when a fire is first lit.</summary>
        public const float FuelOnLight = 2f;

        public static bool IsEmbers(GameState s) => s.Fire > 0 && s.FireFuel <= EmberThreshold;

        /// <summary>
        /// Burn one segment of fuel. Returns true if the fire died this
        /// segment. No-op while the fire is out.
        /// </summary>
        public static bool ConsumeSegment(GameState s)
        {
            if (s.Fire <= 0) return false;
            s.FireFuel = Math.Max(0f, s.FireFuel - 1f);
            if (s.FireFuel > 0f) return false;
            s.Fire = 0;
            return true;
        }

        public static void Feed(GameState s)
        {
            s.FireFuel = Math.Min(MaxFuel, s.FireFuel + FuelPerFeed);
        }

        public static void Light(GameState s)
        {
            s.FireFuel = Math.Max(s.FireFuel, FuelOnLight);
        }

        /// <summary>
        /// A VN save (or an old save) can carry Fire ≥ 1 with no fuel key —
        /// grant the lit fire a margin instead of snuffing it on load.
        /// </summary>
        public static void ReconcileAfterLoad(GameState s)
        {
            if (s.Fire > 0 && s.FireFuel <= 0f) s.FireFuel = FuelOnLight;
        }
    }
}
