using NUnit.Framework;
using Tidebound.Narrative;

namespace Tidebound.Tests
{
    /// <summary>The island's throat, and the tide that owns the door: slack
    /// water twice a day for the shallow galleries, the season's three great
    /// lulls for the deep road, and the surge saying no the rest of the time.</summary>
    public class GulletTests
    {
        static StoryScript Script => Chapter1Encounters.Build();

        static GameState At(int day, Segment seg)
        {
            var s = GameState.NewGame();
            s.Day = day;
            s.Seg = seg;
            return s;
        }

        [Test]
        public void TheTideOpensTheGapTwiceADay()
        {
            Assert.IsTrue(Gullet.SlackWater(Segment.Dawn));
            Assert.IsTrue(Gullet.SlackWater(Segment.Dusk));
            Assert.IsFalse(Gullet.SlackWater(Segment.Day));
            Assert.IsFalse(Gullet.SlackWater(Segment.Night));
        }

        [Test]
        public void TheMouth_AnswersToTheTideAndNothingElse()
        {
            Assert.IsTrue(Gullet.MouthOpen(At(20, Segment.Dawn)));  // any day, at slack
            Assert.IsFalse(Gullet.MouthOpen(At(20, Segment.Night)));
            Assert.IsFalse(Gullet.MouthOpen(null));
        }

        [Test]
        public void TheDeepRoad_NeedsASeasonLullAndTheTideTogether()
        {
            foreach (int lull in Gullet.GreatLulls)
            {
                Assert.IsTrue(Gullet.DeepRoadOpen(At(lull, Segment.Dusk)), "lull " + lull);
                // the right day is not enough; the surge still has to be down
                Assert.IsFalse(Gullet.DeepRoadOpen(At(lull, Segment.Day)), "lull " + lull);
            }
            // and slack water on an ordinary day only buys the shallow galleries
            Assert.IsTrue(Gullet.MouthOpen(At(57, Segment.Dawn)));
            Assert.IsFalse(Gullet.DeepRoadOpen(At(57, Segment.Dawn)));
        }

        [Test]
        public void TheGreatLulls_AreTheDescentsOwnDays()
        {
            // scenes-chapter5.js schedules the three descents on exactly these
            CollectionAssert.AreEqual(new[] { 56, 60, 66 }, Gullet.GreatLulls);
            foreach (var id in new[] { "ev5_way1", "ev5_way2", "ev5_way3", "ev5_deep1", "ev5_deep2", "ev5_deep3" })
                Assert.IsTrue(Script.Has(id), id);
        }

        [Test]
        public void TheWaterReading_TellsYouWhichKindOfDayItIs()
        {
            StringAssert.Contains("not now", Gullet.WaterReading(At(56, Segment.Night)));
            StringAssert.Contains("first galleries", Gullet.WaterReading(At(57, Segment.Dawn)));
            StringAssert.Contains("long and slow and generous", Gullet.WaterReading(At(56, Segment.Dusk)));
        }

        [Test]
        public void VanesTables_MakeTheReadingAMeasurement()
        {
            var guessing = At(56, Segment.Dusk);
            var mapped = At(56, Segment.Dusk);
            mapped.SetFlag("GULLET_MAP");

            StringAssert.Contains("your ears call it", Gullet.WaterReading(guessing));
            StringAssert.Contains("to the minute", Gullet.WaterReading(mapped));
            Assert.AreNotEqual(Gullet.WaterReading(guessing), Gullet.WaterReading(mapped));
        }

        [Test]
        public void TheHeartglass_AnswersLateOnPurpose()
        {
            // the whole descent turns on the lag: the stone gives your lamp
            // back a half-beat behind the island's own pulse
            const float lag = 0.5f / SevenBeat.Beats;
            float onTime = SevenBeat.Evaluate(0.4f);
            float late = SevenBeat.Evaluate(0.4f - lag);
            Assert.That(late, Is.Not.EqualTo(onTime).Within(1e-3f));
            // and it is the SAME curve, only behind it
            Assert.AreEqual(onTime, SevenBeat.Evaluate(0.4f - lag + lag), 1e-5f);
        }
    }
}
