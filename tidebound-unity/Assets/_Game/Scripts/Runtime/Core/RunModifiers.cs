using System.Collections.Generic;

namespace Tidebound
{
    /// <summary>One condition the loops permit.</summary>
    public class RunModifier
    {
        public string Id;
        public string Name;
        public string Sub;
        /// <summary>The line the crossing adds when this life comes in under it.</summary>
        public string CrossingLine;
    }

    /// <summary>
    /// The conditions the Driftwood Loops permit (loops.js run modifiers).
    /// Their teeth live where they bite: kind softens the drains and hard
    /// brings the Long Rain a chapter early (both in GameState.TickSegment /
    /// IsMonsoon and the weather curve), silent empties the Clearing.
    ///
    /// CHAOS is deliberately absent: its teeth are the VN's random-event
    /// roll, which this port doesn't have yet. A menu option that does
    /// nothing is a lie, so it waits for the system it modifies.
    /// </summary>
    public static class RunModifiers
    {
        public const string Hard = "hard";
        public const string Silent = "silent";
        public const string Kind = "kind";

        public static readonly RunModifier[] All =
        {
            new RunModifier
            {
                Id = Hard,
                Name = "⛈️ Hard Season",
                Sub = "The Long Rain comes a chapter early. The island tests what you think you know.",
                CrossingLine = "⛈️ And this life comes in under a low sky: the Long Rain is early, and it is not waiting for you to be ready.",
            },
            new RunModifier
            {
                Id = Silent,
                Name = "🤫 Silent Island",
                Sub = "No eyes at the clearing. The solo route, enforced — the wild keeps its distance this loop.",
                CrossingLine = "🤫 And the wild keeps its distance this time. The island will be only, entirely, yours.",
            },
            new RunModifier
            {
                Id = Kind,
                Name = "🕯️ Kind Tide",
                Sub = "Story mode: the meters soften. The island tells its tale with gentler hands.",
                CrossingLine = "🕯️ And the tide is kind: the meters soften, and the island tells its tale with gentler hands.",
            },
        };

        public static RunModifier ById(string id)
        {
            if (string.IsNullOrEmpty(id)) return null;
            foreach (var m in All)
                if (m.Id == id) return m;
            return null;
        }

        public static string CrossingLineFor(GameState s)
        {
            var mod = s == null ? null : ById(s.RunModifier);
            return mod?.CrossingLine;
        }

        /// <summary>Silent Island: the wild keeps its distance, so the
        /// Clearing offers the solo road and nothing else.</summary>
        public static bool ClearingIsSoloOnly(GameState s) =>
            s != null && s.RunModifier == Silent;

        /// <summary>How much of the day's drain this life actually takes
        /// (GameState.TickSegment owns the application; this names it).</summary>
        public static float DrainScale(GameState s) =>
            s != null && s.RunModifier == Kind ? 0.6f : 1f;
    }
}
