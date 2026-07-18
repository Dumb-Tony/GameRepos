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

        [Tooltip("When an action spends time, the clock sweeps forward at this many segments per real second — a visible time-lapse (sun arcs, light changes) instead of an instant jump.")]
        [Range(0.1f, 4f)] public float timeLapseSpeed = 0.6f;

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

        float _pendingSpend01; // queued action time, drained as a visible sweep

        /// <summary>True while an action's time cost is sweeping by.</summary>
        public bool IsFastForwarding => _pendingSpend01 > 0f;

        void Update()
        {
            if (paused || State == null || State.DeathCause != null) return;
            float delta01 = Time.deltaTime / (dayLengthMinutes * 60f);
            if (_pendingSpend01 > 0f)
            {
                float step = Mathf.Min(_pendingSpend01,
                    timeLapseSpeed * DayClock.SegmentLength01 * Time.deltaTime);
                _pendingSpend01 -= step;
                delta01 += step;
            }
            AdvanceNormalized(delta01);
        }

        /// <summary>
        /// An action's time cost, in segments (1.0 = a whole segment).
        /// Queued, not instant — Update sweeps it by at timeLapseSpeed so
        /// spent time reads as time passing, not teleporting.
        /// </summary>
        public void SpendSegments(float segments) =>
            _pendingSpend01 += Mathf.Max(0f, segments) * DayClock.SegmentLength01;

        /// <summary>Jump to the next dawn (behind the sleep fade). Returns segments ticked.</summary>
        public int SleepUntilDawn()
        {
            _pendingSpend01 = 0f;
            return AdvanceNormalized(_clock.FractionUntilNextDawn);
        }

        int AdvanceNormalized(float delta01)
        {
            if (State == null) return 0;
            int crossings = _clock.Advance(delta01);
            for (int i = 0; i < crossings; i++)
            {
                State.TickSegment();
                SegmentTicked?.Invoke(State.Seg);
                if (State.DeathCause != null) { _pendingSpend01 = 0f; break; } // the island stops counting
            }
            return crossings;
        }
    }
}
