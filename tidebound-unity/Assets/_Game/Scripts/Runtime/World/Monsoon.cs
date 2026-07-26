using UnityEngine;

namespace Tidebound
{
    /// <summary>
    /// The Long Rain as a curve. Chapter five is a season, not a cutscene:
    /// the first fronts arrive ahead of it, the sky closes over the middle
    /// weeks, the cyclone night is the fist at the top of the arc, and on
    /// the seventy-first morning the drumming stops and the ceiling lifts.
    /// Pure day-in, intensity-out, so the tests can hold the whole season.
    /// </summary>
    public static class Monsoon
    {
        /// <summary>The first fronts, ahead of the season proper (ch4's warning).</summary>
        public const int FirstFronts = 51;
        /// <summary>Chapter five opens; the rains commit.</summary>
        public const int SeasonStart = 53;
        /// <summary>The cyclone's outer arm — the season's true fist.</summary>
        public const int CycloneNight = 58;
        /// <summary>The last wet day; on the 71st you wake to silence.</summary>
        public const int SeasonEnd = 70;

        /// <summary>How hard it is raining on this day, 0..1.</summary>
        public static float IntensityOnDay(int day)
        {
            if (day < FirstFronts || day > SeasonEnd) return 0f;
            if (day < SeasonStart) return 0.18f;                 // the sky leaning on the horizon
            if (day == CycloneNight) return 1f;                  // rain traveling flat
            if (day < CycloneNight)                              // building
                return Mathf.Lerp(0.5f, 0.85f, (day - SeasonStart) / (float)(CycloneNight - SeasonStart));
            if (day <= 66) return 0.85f;                         // the drowning middle
            return Mathf.Lerp(0.75f, 0.4f, (day - 66) / (float)(SeasonEnd - 66)); // the season letting go
        }

        public static float Intensity(GameState s) => s == null ? 0f : IntensityOnDay(s.Day);

        public static bool Raining(GameState s) => Intensity(s) > 0.01f;
    }
}
