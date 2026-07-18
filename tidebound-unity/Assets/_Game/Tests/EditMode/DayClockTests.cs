using NUnit.Framework;

namespace Tidebound.Tests
{
    /// <summary>
    /// The continuous clock must agree exactly with the VN's discrete
    /// four-segment day: every 0.25 crossing is one TickSegment, no more,
    /// no fewer, wraps included.
    /// </summary>
    public class DayClockTests
    {
        [Test]
        public void SmallAdvance_CrossesNothing()
        {
            var c = new DayClock();
            Assert.AreEqual(0, c.Advance(0.1f));
            Assert.AreEqual(Segment.Dawn, c.CurrentSegment);
        }

        [Test]
        public void CrossingABoundary_CountsOnce()
        {
            var c = new DayClock { Time01 = 0.2f };
            Assert.AreEqual(1, c.Advance(0.1f));
            Assert.AreEqual(Segment.Day, c.CurrentSegment);
        }

        [Test]
        public void OneFullSegment_FromABoundary_CountsOnce()
        {
            var c = new DayClock();
            Assert.AreEqual(1, c.Advance(0.25f));
            Assert.AreEqual(Segment.Day, c.CurrentSegment);
        }

        [Test]
        public void AWholeDay_CountsFourCrossings_AndWraps()
        {
            var c = new DayClock { Time01 = 0.1f };
            Assert.AreEqual(4, c.Advance(1f));
            Assert.AreEqual(Segment.Dawn, c.CurrentSegment);
            Assert.AreEqual(0.1f, c.Time01, 0.0001f);
        }

        [Test]
        public void SegmentMapping_MatchesTheVN()
        {
            var c = new DayClock();
            c.Time01 = 0.0f; Assert.AreEqual(Segment.Dawn, c.CurrentSegment);
            c.Time01 = 0.3f; Assert.AreEqual(Segment.Day, c.CurrentSegment);
            c.Time01 = 0.6f; Assert.AreEqual(Segment.Dusk, c.CurrentSegment);
            c.Time01 = 0.8f; Assert.AreEqual(Segment.Night, c.CurrentSegment);
        }

        [Test]
        public void FractionUntilNextDawn_TicksTheNightIntoMorning()
        {
            var c = new DayClock { Time01 = 0.8f }; // mid-Night
            int crossings = c.Advance(c.FractionUntilNextDawn);
            Assert.AreEqual(1, crossings); // exactly the Night→Dawn tick
            Assert.AreEqual(0f, c.Time01, 0.0001f);
            Assert.AreEqual(Segment.Dawn, c.CurrentSegment);
        }

        [Test]
        public void SleepingFromDusk_CostsTwoTicks()
        {
            var c = new DayClock { Time01 = 0.6f };
            Assert.AreEqual(2, c.Advance(c.FractionUntilNextDawn));
        }

        [Test]
        public void OneBoundaryAtATime_LetsTheNightInterrupt()
        {
            var c = new DayClock { Time01 = 0.6f }; // mid-Dusk
            Assert.AreEqual(1, c.Advance(c.FractionUntilNextBoundary));
            Assert.AreEqual(Segment.Night, c.CurrentSegment);
            Assert.AreEqual(1, c.Advance(c.FractionUntilNextBoundary));
            Assert.AreEqual(Segment.Dawn, c.CurrentSegment); // wrapped to morning
        }

        [Test]
        public void FractionUntilNextBoundary_FromABoundary_IsAWholeSegment()
        {
            var c = new DayClock { Time01 = 0.25f };
            Assert.AreEqual(0.25f, c.FractionUntilNextBoundary, 0.0001f);
        }

        [Test]
        public void ManySmallSteps_NeverDropACrossing()
        {
            // 1/1024 is exactly representable, so 1024 steps sum to exactly
            // one day — no float-accumulation ambiguity in the assertion
            var c = new DayClock();
            int total = 0;
            for (int i = 0; i < 1024; i++) total += c.Advance(1f / 1024f);
            Assert.AreEqual(4, total);
            Assert.AreEqual(0f, c.Time01, 0.0001f);
        }

        [Test]
        public void ClockAndGameState_StayInLockstep()
        {
            var c = new DayClock();
            var s = GameState.NewGame();
            for (int i = 0; i < 40; i++)
            {
                int crossings = c.Advance(0.13f);
                for (int k = 0; k < crossings; k++) s.TickSegment();
                Assert.AreEqual(c.CurrentSegment, s.Seg, $"desync after step {i}");
            }
        }
    }
}
