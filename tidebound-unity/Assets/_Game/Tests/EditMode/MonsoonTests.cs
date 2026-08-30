using NUnit.Framework;

namespace Tidebound.Tests
{
    /// <summary>The Long Rain as a season the world actually runs: dry before
    /// it, committed through it, the cyclone at the top of the arc, and the
    /// silence on the seventy-first morning.</summary>
    public class MonsoonTests
    {
        [Test]
        public void TheDrySeason_IsDry()
        {
            for (int day = 1; day < Monsoon.FirstFronts; day++)
                Assert.AreEqual(0f, Monsoon.IntensityOnDay(day), 1e-4f, "day " + day);
        }

        [Test]
        public void TheFirstFronts_LeanOnTheHorizonBeforeTheSeasonCommits()
        {
            for (int day = Monsoon.FirstFronts; day < Monsoon.SeasonStart; day++)
            {
                float v = Monsoon.IntensityOnDay(day);
                Assert.Greater(v, 0f, "day " + day);
                Assert.Less(v, 0.5f, "day " + day); // a warning, not the season
            }
        }

        [Test]
        public void TheSeason_BuildsTowardTheCyclone()
        {
            float prev = Monsoon.IntensityOnDay(Monsoon.SeasonStart);
            Assert.GreaterOrEqual(prev, 0.5f);
            for (int day = Monsoon.SeasonStart + 1; day < Monsoon.CycloneNight; day++)
            {
                float v = Monsoon.IntensityOnDay(day);
                Assert.GreaterOrEqual(v, prev, "day " + day);
                prev = v;
            }
        }

        [Test]
        public void TheCycloneNight_IsTheSeasonsFist()
        {
            Assert.AreEqual(1f, Monsoon.IntensityOnDay(Monsoon.CycloneNight), 1e-4f);
            // and nothing else in the season reaches it
            for (int day = 1; day <= 100; day++)
                if (day != Monsoon.CycloneNight)
                    Assert.Less(Monsoon.IntensityOnDay(day), 1f, "day " + day);
        }

        [Test]
        public void TheSeason_LetsGoBeforeItEnds()
        {
            float atSixtySeven = Monsoon.IntensityOnDay(67);
            float atLastDay = Monsoon.IntensityOnDay(Monsoon.SeasonEnd);
            Assert.Less(atLastDay, atSixtySeven);   // tapering
            Assert.Greater(atLastDay, 0f);          // but still raining on the last wet day
        }

        [Test]
        public void TheSeventyFirstMorning_TheDrummingStops()
        {
            Assert.Greater(Monsoon.IntensityOnDay(Monsoon.SeasonEnd), 0f);
            for (int day = Monsoon.SeasonEnd + 1; day <= 120; day++)
                Assert.AreEqual(0f, Monsoon.IntensityOnDay(day), 1e-4f, "day " + day);
        }

        [Test]
        public void RainingTracksTheCurve_AndSurvivesANullRun()
        {
            var dry = GameState.NewGame();
            dry.Day = 20;
            Assert.IsFalse(Monsoon.Raining(dry));

            var wet = GameState.NewGame();
            wet.Day = Monsoon.CycloneNight;
            Assert.IsTrue(Monsoon.Raining(wet));
            Assert.AreEqual(1f, Monsoon.Intensity(wet), 1e-4f);

            Assert.AreEqual(0f, Monsoon.Intensity(null), 1e-4f);
            Assert.IsFalse(Monsoon.Raining(null));
        }
    }
}
