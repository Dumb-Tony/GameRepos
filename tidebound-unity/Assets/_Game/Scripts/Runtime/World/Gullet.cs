namespace Tidebound
{
    /// <summary>
    /// The throat of the island: a drowned world that empties twice a day
    /// and resents it. Access is the tide's to give — slack water opens the
    /// gap behind the waterfall, the surge takes it back — and the season's
    /// three great lulls are the only windows wide enough to go deep.
    /// Pure, so the tests can hold the tide still.
    /// </summary>
    public static class Gullet
    {
        /// <summary>The season's great lulls (scenes-chapter5.js: the Descent's
        /// three descents, on the 56th, 60th and 66th days).</summary>
        public static readonly int[] GreatLulls = { 56, 60, 66 };

        /// <summary>Twice a day the throat empties: the turns of the tide.</summary>
        public static bool SlackWater(Segment seg) => seg == Segment.Dawn || seg == Segment.Dusk;

        /// <summary>A day the monsoon draws breath and the deep road opens.</summary>
        public static bool GreatLullDay(int day)
        {
            foreach (int d in GreatLulls)
                if (d == day) return true;
            return false;
        }

        /// <summary>Whether the gap is passable at all right now.</summary>
        public static bool MouthOpen(GameState s) => s != null && SlackWater(s.Seg);

        /// <summary>Whether today is wide enough for the throat itself.</summary>
        public static bool DeepRoadOpen(GameState s) =>
            s != null && MouthOpen(s) && GreatLullDay(s.Day);

        /// <summary>What the water is telling you — Vane's tables make it a
        /// number; without them it stays a reading of the grotto's breathing.</summary>
        public static string WaterReading(GameState s)
        {
            if (s == null) return "";
            bool mapped = s.Is("GULLET_MAP");
            if (DeepRoadOpen(s))
                return mapped
                    ? "Vane's tables give this lull its exact width, to the minute: the throat is open, and it is open LONG. This is the day the plan was for."
                    : "The grotto's breathing has gone long and slow and generous. Wider than you have ever felt it. Whatever the tables would have called this, your ears call it: go.";
            if (MouthOpen(s))
                return mapped
                    ? "Slack water, and Vane's tables agree: the gap is passable — for the shallow galleries only. The deep road wants a season-lull, and today is not one."
                    : "The water has gone quiet at the gap. Passable, you think, as far as the first galleries. No further; you can hear the surge still holding its shape somewhere below.";
            return "The throat is full and talking. The falls are loud, the gap is a mouth underwater, and every instinct you own agrees with the arithmetic: not now. The tide turns twice a day. Come back at one of them.";
        }
    }
}
