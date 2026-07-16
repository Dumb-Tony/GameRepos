using System.Collections.Generic;
using UnityEngine;

namespace Tidebound
{
    /// <summary>
    /// A repeatable world resource: a seagrape thicket, a coconut palm, or
    /// a piece of driftwood on the wrack line. Used points hide their visual
    /// and regrow after a number of segments (the tide restocks nightly, the
    /// green a little slower). Regrow timers are runtime-only — nodes reset
    /// on load, which is generosity, not a bug, at this phase.
    /// </summary>
    public class ForagePoint : Interactable
    {
        public enum Kind { Berries, Coconut, Driftwood }

        public Kind kind = Kind.Berries;
        [Tooltip("Segments until this point is usable again. 4 = one full day.")]
        public int regrowSegments = 4;
        [Tooltip("Hidden while the point is depleted.")]
        public GameObject visual;

        int _availableAtTotalSegment;

        static int TotalSegment(GameState s) => s.Day * DayClock.SegmentsPerDay + (int)s.Seg;

        bool Regrown(GameState s) => TotalSegment(s) >= _availableAtTotalSegment;

        public override string DisplayName
        {
            get
            {
                switch (kind)
                {
                    case Kind.Coconut: return "A coconut palm";
                    case Kind.Driftwood: return "Driftwood";
                    default: return "The treeline";
                }
            }
        }

        public override bool IsAvailable(GameManager gm) => Regrown(gm.State);

        public override void GetOptions(GameManager gm, List<InteractionOption> options)
        {
            switch (kind)
            {
                case Kind.Berries:
                    options.Add(InteractionOption.Do("Forage the treeline",
                        "Fruit, crabs, grubs if you're honest with yourself. Energy −, food +.",
                        g => g.Forage(this)));
                    break;
                case Kind.Coconut:
                    options.Add(InteractionOption.Do("Coconuts — drink and eat",
                        "The palms provide. Costs energy, buys you the rest.",
                        g => g.Coconuts(this)));
                    break;
                case Kind.Driftwood:
                    options.Add(InteractionOption.Do("Gather driftwood",
                        "The sea's lumberyard restocks nightly.",
                        g => g.GatherDriftwood(this)));
                    break;
            }
        }

        /// <summary>Called by the GameManager after a successful use.</summary>
        public void Deplete(GameState s)
        {
            _availableAtTotalSegment = TotalSegment(s) + Mathf.Max(1, regrowSegments);
        }

        void Update()
        {
            var gm = GameManager.Instance;
            if (gm == null || gm.State == null || visual == null) return;
            bool show = Regrown(gm.State);
            if (visual.activeSelf != show) visual.SetActive(show);
        }
    }
}
