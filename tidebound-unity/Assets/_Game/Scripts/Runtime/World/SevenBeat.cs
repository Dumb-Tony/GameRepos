using System;

namespace Tidebound
{
    /// <summary>
    /// The Hum's signature: seven beats, rising and falling, "like a chord
    /// hummed underwater." One cycle contains seven sub-pulses under one
    /// slow swell. Pure math, 0..1 in and out — the lagoon lights, and one
    /// day the radio and the audio port, all read from this same curve so
    /// the island only ever hums one rhythm.
    /// </summary>
    public static class SevenBeat
    {
        public const int Beats = 7;

        /// <summary>Evaluate the pulse envelope at a cycle phase in [0,1).</summary>
        public static float Evaluate(float phase01)
        {
            float p = phase01 - (float)Math.Floor(phase01);
            // the slow swell: silence at the cycle's edges, full in the middle
            float swell = (float)Math.Sin(p * Math.PI);
            swell *= swell;
            // seven beats riding it, each rising and falling from zero
            float beat = (float)(0.5 - 0.5 * Math.Cos(p * Beats * 2.0 * Math.PI));
            return swell * (0.25f + 0.75f * beat);
        }
    }
}
