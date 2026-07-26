using System.Collections.Generic;

namespace Tidebound
{
    /// <summary>
    /// The gating truths of the mountain's country, kept pure so the tests
    /// can hold them still. The stair is walkable scenery from the first
    /// day you find it; the ASCENT — the chapter-six climb — only opens
    /// when the rains break, and closes behind you once the Tidewell has
    /// been answered.
    /// </summary>
    public static class MountainPlace
    {
        /// <summary>The chapter-six climb: the rains are down, the mountain waits.</summary>
        public static bool AscentOpen(GameState s) =>
            s.Is("CH5_DONE") && !s.Is("CH6_DONE") && s.DeathCause == null;

        /// <summary>The murals and the rim only read once you've stood there.</summary>
        public static bool TempleReached(GameState s) => s.Is("TEMPLE_SEEN");

        /// <summary>The caldera's lip is a viewpoint only after the judging.</summary>
        public static bool RimReached(GameState s) =>
            s.Is("INNER_GREEN") || s.Is("INNER_PROBATION") || s.Is("RIM_ONLY");
    }

    /// <summary>
    /// The stair's foot above Edda's grove: where the walk into the
    /// mountain's country begins. Taking it plays chapter six's ascent —
    /// the terrace, the temple, the tremor ladder, the judging at the rim —
    /// the same chain the story chapter runs, entered on your own feet.
    /// </summary>
    public class MountainTrailhead : Interactable
    {
        public override string DisplayName => "The stair into the mountain's country";

        public override bool IsAvailable(GameManager gm) => MountainPlace.AscentOpen(gm.State);

        public override void GetOptions(GameManager gm, List<InteractionOption> options)
        {
            options.Add(InteractionOption.Do("Climb the ten thousand stairs",
                "Five days on the mountain: the terrace, the temple, and whatever is behind the broken crown.",
                g => g.VisitEdda("ch6_open", 1)));
        }
    }
}
