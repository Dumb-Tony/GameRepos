using System;

namespace Tidebound
{
    /// <summary>
    /// The continuous face of the VN's four-segment day: normalized time
    /// 0..1 where segment i occupies [i*0.25, (i+1)*0.25). Pure model — the
    /// GameClock MonoBehaviour feeds it real seconds and turns boundary
    /// crossings into GameState.TickSegment() calls, so the discrete drains
    /// stay exactly the VN's while the sun moves smoothly.
    /// </summary>
    public class DayClock
    {
        public const int SegmentsPerDay = 4;
        public const float SegmentLength01 = 1f / SegmentsPerDay;

        float _time01;

        /// <summary>Normalized time of day in [0, 1). 0 is the start of Dawn.</summary>
        public float Time01
        {
            get => _time01;
            set => _time01 = Wrap(value);
        }

        public Segment CurrentSegment =>
            (Segment)Math.Min(SegmentsPerDay - 1, (int)(_time01 / SegmentLength01));

        /// <summary>0..1 progress through the current segment.</summary>
        public float SegmentProgress =>
            (_time01 - (int)CurrentSegment * SegmentLength01) / SegmentLength01;

        /// <summary>
        /// Normalized time until the next dawn (the next 1.0 wrap), in (0, 1].
        /// </summary>
        public float FractionUntilNextDawn => 1f - _time01;

        /// <summary>
        /// Normalized time to the next segment boundary, in (0, 0.25] —
        /// for advancing sleep one interruptible segment at a time.
        /// </summary>
        public float FractionUntilNextBoundary
        {
            get
            {
                int next = (int)Math.Floor(_time01 / SegmentLength01) + 1;
                float frac = next * SegmentLength01 - _time01;
                return frac <= 0f ? SegmentLength01 : frac;
            }
        }

        /// <summary>
        /// Advance by a fraction of a day and report how many segment
        /// boundaries were crossed (each crossing = one TickSegment for the
        /// caller to apply). Time wraps; crossings count the wrap too.
        /// </summary>
        public int Advance(float delta01)
        {
            if (delta01 <= 0f) return 0;
            int before = (int)Math.Floor(_time01 / SegmentLength01);
            int after = (int)Math.Floor((_time01 + delta01) / SegmentLength01);
            _time01 = Wrap(_time01 + delta01);
            return after - before;
        }

        static float Wrap(float t)
        {
            t -= (float)Math.Floor(t);
            // guard the float edge case where t == 1.0 survives the floor
            return t >= 1f ? 0f : t < 0f ? 0f : t;
        }
    }
}
