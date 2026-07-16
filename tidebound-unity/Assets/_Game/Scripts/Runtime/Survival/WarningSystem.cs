using System.Collections.Generic;

namespace Tidebound
{
    /// <summary>
    /// Design law #1: deaths must trace to ignored warnings — the island
    /// always warns once. This watches the meters and fires each warning
    /// exactly once per decline: a watch fires when its meter crosses its
    /// threshold and re-arms only after the meter recovers past the re-arm
    /// point. Severe warnings fire at zero, when health has started paying.
    /// Pure logic; the GameManager routes warnings to the HUD.
    /// </summary>
    public class WarningSystem
    {
        public struct Warning
        {
            public string Id;
            public string Message;
            public bool Severe;
        }

        class Watch
        {
            public string Id;
            public Meter Meter;
            public float Threshold;
            public float Rearm;
            public string Message;
            public bool Severe;
            public bool Armed = true;
        }

        readonly List<Watch> _watches = new List<Watch>
        {
            new Watch { Id = "hunger_low", Meter = Meter.Hunger, Threshold = 25, Rearm = 35,
                Message = "Your stomach has stopped asking politely. Eat something soon." },
            new Watch { Id = "hunger_zero", Meter = Meter.Hunger, Threshold = 0, Rearm = 10, Severe = true,
                Message = "Nothing left to burn. Your body starts spending what it can't repay." },
            new Watch { Id = "thirst_low", Meter = Meter.Thirst, Threshold = 25, Rearm = 35,
                Message = "Your tongue sticks. Water, before anything else." },
            new Watch { Id = "thirst_zero", Meter = Meter.Thirst, Threshold = 0, Rearm = 10, Severe = true,
                Message = "You've stopped sweating. That isn't relief — that is the last warning." },
            new Watch { Id = "energy_low", Meter = Meter.Energy, Threshold = 15, Rearm = 30,
                Message = "Your legs vote to sit down. Overrule them much longer and they'll stop asking." },
            new Watch { Id = "health_low", Meter = Meter.Health, Threshold = 30, Rearm = 45, Severe = true,
                Message = "You're hurt worse than you're admitting. Tend to yourself, or the island finishes the sentence." },
        };

        /// <summary>
        /// Check the meters; returns the warnings that fired just now
        /// (usually none). Call as often as you like — arming makes it
        /// idempotent between crossings.
        /// </summary>
        public List<Warning> Check(Meters m)
        {
            List<Warning> fired = null;
            foreach (var w in _watches)
            {
                float v = m.Get(w.Meter);
                if (w.Armed && v <= w.Threshold)
                {
                    w.Armed = false;
                    (fired ??= new List<Warning>()).Add(new Warning { Id = w.Id, Message = w.Message, Severe = w.Severe });
                }
                else if (!w.Armed && v >= w.Rearm)
                {
                    w.Armed = true;
                }
            }
            return fired ?? Empty;
        }

        static readonly List<Warning> Empty = new List<Warning>();

        /// <summary>
        /// The dusk exposure warning: no roof, no fire, night coming. The
        /// cold tax at the night tick must never surprise the player.
        /// </summary>
        public static bool ExposureWarningDue(GameState s, Segment newSegment) =>
            newSegment == Segment.Dusk && s.Fire <= 0 && s.Shelter <= 0;
    }
}
