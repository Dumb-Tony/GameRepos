using System;
using UnityEngine;

namespace Tidebound
{
    /// <summary>
    /// Drives the DayClock from real time and applies the VN's segment
    /// drains (GameState.TickSegment) at every boundary. Actions spend
    /// segment-fractions through SpendSegments; sleeping fast-forwards to
    /// dawn. Day length is a feel parameter — tune it in the inspector.
    /// </summary>
    public class GameClock : MonoBehaviour
    {
        [Tooltip("Real minutes one full in-game day takes. The bible suggests 15–20.")]
        [Range(4f, 40f)] public float dayLengthMinutes = 16f;

        [Tooltip("Freeze the passage of time (dialogue, death, menus).")]
        public bool paused;

        /// <summary>Injected by GameManager before the first Update.</summary>
        [NonSerialized] public GameState State;

        readonly DayClock _clock = new DayClock();
        public DayClock Clock => _clock;

        /// <summary>Fired after each TickSegment with the new segment.</summary>
        public event Action<Segment> SegmentTicked;

        /// <summary>Align the continuous clock to the saved segment.</summary>
        public void SyncToState()
        {
            if (State != null) _clock.Time01 = (int)State.Seg * DayClock.SegmentLength01;
        }

        void Update()
        {
            if (paused || State == null || State.DeathCause != null) return;
            AdvanceNormalized(Time.deltaTime / (dayLengthMinutes * 60f));
        }

        /// <summary>An action's time cost, in segments (1.0 = a whole segment).</summary>
        public void SpendSegments(float segments) => AdvanceNormalized(segments * DayClock.SegmentLength01);

        /// <summary>Fast-forward to the next dawn. Returns segments ticked.</summary>
        public int SleepUntilDawn() => AdvanceNormalized(_clock.FractionUntilNextDawn);

        int AdvanceNormalized(float delta01)
        {
            if (State == null) return 0;
            int crossings = _clock.Advance(delta01);
            for (int i = 0; i < crossings; i++)
            {
                State.TickSegment();
                SegmentTicked?.Invoke(State.Seg);
                if (State.DeathCause != null) break; // the island stops counting
            }
            return crossings;
        }
    }
}
