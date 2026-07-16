using NUnit.Framework;

namespace Tidebound.Tests
{
    /// <summary>The 3D fire: fuel in segments, embers before death (law #1).</summary>
    public class FireLogicTests
    {
        static GameState Lit(float fuel)
        {
            var s = GameState.NewGame();
            s.Fire = 1;
            s.FireFuel = fuel;
            return s;
        }

        [Test]
        public void Light_GrantsTheStartingMargin()
        {
            var s = GameState.NewGame();
            s.Fire = 1;
            FireLogic.Light(s);
            Assert.AreEqual(FireLogic.FuelOnLight, s.FireFuel);
        }

        [Test]
        public void Feed_AddsFuel_UpToTheCap()
        {
            var s = Lit(5.5f);
            FireLogic.Feed(s);
            Assert.AreEqual(FireLogic.MaxFuel, s.FireFuel);
        }

        [Test]
        public void ConsumeSegment_BurnsOneSegmentOfFuel()
        {
            var s = Lit(3f);
            Assert.IsFalse(FireLogic.ConsumeSegment(s));
            Assert.AreEqual(2f, s.FireFuel);
            Assert.AreEqual(1, s.Fire);
        }

        [Test]
        public void TheFireWarnsAsEmbers_BeforeItDies()
        {
            var s = Lit(2f);
            FireLogic.ConsumeSegment(s);       // 2 → 1: embers now
            Assert.IsTrue(FireLogic.IsEmbers(s));
            Assert.AreEqual(1, s.Fire);        // still alive — one segment to act
            Assert.IsTrue(FireLogic.ConsumeSegment(s)); // 1 → 0: dies
            Assert.AreEqual(0, s.Fire);
        }

        [Test]
        public void ConsumeSegment_IsANoOpWhileUnlit()
        {
            var s = GameState.NewGame();
            Assert.IsFalse(FireLogic.ConsumeSegment(s));
            Assert.AreEqual(0f, s.FireFuel);
        }

        [Test]
        public void ReconcileAfterLoad_GivesAVnSaveFireItsMargin()
        {
            var s = GameState.NewGame();
            s.Fire = 1; // a VN save has no fireFuel key → 0
            FireLogic.ReconcileAfterLoad(s);
            Assert.AreEqual(FireLogic.FuelOnLight, s.FireFuel);
        }

        [Test]
        public void FireFuel_SurvivesTheSaveRoundTrip()
        {
            var s = Lit(3f);
            var back = SaveSystem.FromJson(SaveSystem.ToJson(s));
            Assert.AreEqual(3f, back.FireFuel);
            Assert.AreEqual(1, back.Fire);
        }
    }
}
