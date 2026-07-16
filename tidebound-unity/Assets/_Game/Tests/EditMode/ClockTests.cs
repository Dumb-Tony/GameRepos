using NUnit.Framework;

namespace Tidebound.Tests
{
    /// <summary>
    /// TickSegment is a faithful port of engine.js — these tests pin the
    /// VN's exact drain numbers so a refactor can't silently change the
    /// survival balance.
    /// </summary>
    public class ClockTests
    {
        [Test]
        public void Tick_AppliesBaselineDrains()
        {
            var s = GameState.NewGame();
            s.TickSegment();
            Assert.AreEqual(74f, s.Stats.Hunger);  // 80 - 6
            Assert.AreEqual(69f, s.Stats.Thirst);  // 75 - 6
            Assert.AreEqual(82f, s.Stats.Energy);  // 85 - 3
            Assert.AreEqual(100f, s.Stats.Health); // untouched while fed/watered
            Assert.AreEqual(Segment.Day, s.Seg);
            Assert.AreEqual(0, s.Day);
        }

        [Test]
        public void FourTicks_WrapNightToDawnAndAdvanceDay()
        {
            var s = GameState.NewGame();
            for (int i = 0; i < 4; i++) s.TickSegment();
            Assert.AreEqual(Segment.Dawn, s.Seg);
            Assert.AreEqual(1, s.Day);
        }

        [Test]
        public void OverhangSite_DrainsThirstFaster()
        {
            var s = GameState.NewGame();
            s.Site = "overhang";
            s.TickSegment();
            Assert.AreEqual(67f, s.Stats.Thirst); // 75 - 8
        }

        [Test]
        public void Monsoon_Chapter5ChangesTheDrains()
        {
            var s = GameState.NewGame();
            s.Chapter = 5;
            Assert.IsTrue(s.IsMonsoon);
            s.TickSegment();
            Assert.AreEqual(72f, s.Stats.Hunger);  // 80 - 8 (food scarce)
            Assert.AreEqual(72f, s.Stats.Thirst);  // 75 - 3 (water everywhere)
            Assert.AreEqual(81f, s.Stats.Energy);  // 85 - 4 (everything heavier)
        }

        [Test]
        public void HardModifier_StartsTheMonsoonAChapterEarly()
        {
            var s = GameState.NewGame();
            s.Chapter = 4;
            Assert.IsFalse(s.IsMonsoon);
            s.RunModifier = "hard";
            Assert.IsTrue(s.IsMonsoon);
        }

        [Test]
        public void KindModifier_SoftensDrainsTo60Percent()
        {
            var s = GameState.NewGame();
            s.RunModifier = "kind";
            s.TickSegment();
            Assert.AreEqual(76.4f, s.Stats.Hunger, 0.001f); // 80 - 6*0.6
        }

        [Test]
        public void Starvation_DrainsHealthOnceHungerBottomsOut()
        {
            var s = GameState.NewGame();
            s.Stats.Hunger = 0f;
            s.TickSegment();
            Assert.AreEqual(92f, s.Stats.Health); // -8
        }

        [Test]
        public void Dehydration_DrainsHealthHarder()
        {
            var s = GameState.NewGame();
            s.Stats.Thirst = 0f;
            s.TickSegment();
            Assert.AreEqual(88f, s.Stats.Health); // -12
        }

        [Test]
        public void InjuryAndFever_EachTakeTheirToll()
        {
            var s = GameState.NewGame();
            s.Injury = "laceration";
            s.Disease = "fever";
            s.TickSegment();
            Assert.AreEqual(97f, s.Stats.Health); // -2 injury, -1 fever
            Assert.AreEqual(55f, s.Stats.Energy); // the fever's ceiling
        }

        [Test]
        public void Death_TracesToItsCause_ThirstBeforeHunger()
        {
            var s = GameState.NewGame();
            s.Stats.Health = 5f;
            s.Stats.Thirst = 0f;
            s.Stats.Hunger = 0f;
            s.TickSegment();
            Assert.AreEqual(0f, s.Stats.Health);
            Assert.AreEqual("thirst", s.DeathCause);
        }

        [Test]
        public void Death_FeverTakesPriorityAsCause()
        {
            var s = GameState.NewGame();
            s.Stats.Health = 1f;
            s.Stats.Thirst = 0f;
            s.Disease = "fever";
            s.TickSegment();
            Assert.AreEqual("fever", s.DeathCause);
        }

        [Test]
        public void Death_CauseIsOnlyWrittenOnce()
        {
            var s = GameState.NewGame();
            s.Stats.Health = 1f;
            s.Stats.Hunger = 0f;
            s.TickSegment();
            var first = s.DeathCause;
            s.Stats.Thirst = 0f;
            s.TickSegment();
            Assert.AreEqual(first, s.DeathCause);
        }

        [Test]
        public void CompanionInjury_SelfHealsAfterFiveDays_NobodyDies()
        {
            var s = GameState.NewGame();
            s.Day = 6;
            s.CompanionInjured = new CompanionInjury { Day = 1 };
            s.TickSegment();
            Assert.IsNull(s.CompanionInjured);
            Assert.IsTrue(s.Is("PERIL_SELFHEALED"));
        }
    }
}
