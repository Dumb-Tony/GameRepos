using System;
using System.Collections.Generic;
using NUnit.Framework;

namespace Tidebound.Tests
{
    /// <summary>
    /// SurvivalActions is a number-for-number port of the VN's chapter-1
    /// camp hub (scenes-chapter1.js) — these tests pin the exact deltas so
    /// a refactor can't silently retune the survival balance.
    /// </summary>
    public class SurvivalActionsTests
    {
        static Func<float> Rolls(params float[] values)
        {
            var q = new Queue<float>(values);
            return () => q.Dequeue();
        }

        // ---- coconuts: thirst +28, hunger +10, energy −8 ----------------
        [Test]
        public void Coconuts_PinnedDeltas()
        {
            var s = GameState.NewGame();
            s.Stats.Thirst = 50f;
            SurvivalActions.Coconuts(s);
            Assert.AreEqual(78f, s.Stats.Thirst);
            Assert.AreEqual(90f, s.Stats.Hunger);
            Assert.AreEqual(77f, s.Stats.Energy);
        }

        // ---- forage: energy −8, hunger +16, thirst +4 + two rolls --------
        [Test]
        public void Forage_QuietDay_PinnedDeltas()
        {
            var s = GameState.NewGame();
            SurvivalActions.Forage(s, Rolls(0.9f, 0.9f));
            Assert.AreEqual(77f, s.Stats.Energy);
            Assert.AreEqual(96f, s.Stats.Hunger);
            Assert.AreEqual(79f, s.Stats.Thirst);
            Assert.AreEqual(100f, s.Stats.Health);
            Assert.AreEqual(55f, s.Stats.Hope);
        }

        [Test]
        public void Forage_ThornVine_WithoutAKnife()
        {
            var s = GameState.NewGame();
            SurvivalActions.Forage(s, Rolls(0.1f));
            Assert.AreEqual(94f, s.Stats.Health); // −6
            Assert.AreEqual(53f, s.Stats.Hope);   // −2
        }

        [Test]
        public void Forage_AKnifeTurnsTheThornRollIntoAHornbill()
        {
            var s = GameState.NewGame();
            s.AddItem("knife");
            // first roll would be a thorn (0.1) but the knife guards; the
            // second roll (0.2 < 0.35) is the hornbill moment — VN call order
            SurvivalActions.Forage(s, Rolls(0.1f, 0.2f));
            Assert.AreEqual(100f, s.Stats.Health);
            Assert.AreEqual(58f, s.Stats.Hope); // +3
        }

        // ---- make fire: energy −12; p = 0.45 (+0.2 eng, +0.15 toolbox, +0.2 tried) ----
        [Test]
        public void MakeFire_Success_LightsTierOne()
        {
            var s = GameState.NewGame();
            var r = SurvivalActions.MakeFire(s, Rolls(0.44f));
            Assert.IsTrue(r.Success);
            Assert.AreEqual(1, s.Fire);
            Assert.AreEqual(73f, s.Stats.Energy); // −12
            Assert.AreEqual(63f, s.Stats.Hope);   // +8
            Assert.AreEqual(1, s.Route.Roots);
        }

        [Test]
        public void MakeFire_Failure_TeachesForNextTime()
        {
            var s = GameState.NewGame();
            var r = SurvivalActions.MakeFire(s, Rolls(0.46f));
            Assert.IsFalse(r.Success);
            Assert.AreEqual(0, s.Fire);
            Assert.AreEqual(51f, s.Stats.Hope); // −4
            Assert.IsTrue(s.Is("TRIED_FIRE"));
            // the retry: 0.45 + 0.2 = 0.65
            var retry = SurvivalActions.MakeFire(s, Rolls(0.64f));
            Assert.IsTrue(retry.Success);
        }

        [Test]
        public void MakeFire_LighterNeverFails()
        {
            var s = GameState.NewGame();
            s.AddItem("lighter");
            Assert.IsTrue(SurvivalActions.MakeFire(s, Rolls(0.999f)).Success);
        }

        [Test]
        public void MakeFire_EngineerToolboxAndPractice_StackToCertainty()
        {
            var s = GameState.NewGame();
            s.SetFlag("BG_ENGINEER");
            s.AddItem("toolbox");
            s.SetFlag("TRIED_FIRE");
            // 0.45 + 0.2 + 0.15 + 0.2 = 1.0
            Assert.IsTrue(SurvivalActions.MakeFire(s, Rolls(0.99f)).Success);
        }

        // ---- shelter: energy −14 (−10 engineer/toolbox), +1 tier, roots +2 ----
        [Test]
        public void BuildShelter_PinnedDeltas()
        {
            var s = GameState.NewGame();
            SurvivalActions.BuildShelter(s);
            Assert.AreEqual(71f, s.Stats.Energy);
            Assert.AreEqual(1, s.Shelter);
            Assert.AreEqual(2, s.Route.Roots);
        }

        [Test]
        public void BuildShelter_EngineerPaysLess()
        {
            var s = GameState.NewGame();
            s.SetFlag("BG_ENGINEER");
            SurvivalActions.BuildShelter(s);
            Assert.AreEqual(75f, s.Stats.Energy); // −10
        }

        // ---- cook: energy −6, hunger +26 (+36 cook), hope +5 (+8), thirst −2 ----
        [Test]
        public void CookMeal_PinnedDeltas()
        {
            var s = GameState.NewGame();
            s.Stats.Hunger = 50f;
            SurvivalActions.CookMeal(s);
            Assert.AreEqual(76f, s.Stats.Hunger);
            Assert.AreEqual(60f, s.Stats.Hope);
            Assert.AreEqual(79f, s.Stats.Energy);
            Assert.AreEqual(73f, s.Stats.Thirst);
        }

        [Test]
        public void CookMeal_TheLineCookDoesItBetter()
        {
            var s = GameState.NewGame();
            s.SetFlag("BG_COOK");
            s.Stats.Hunger = 40f;
            SurvivalActions.CookMeal(s);
            Assert.AreEqual(76f, s.Stats.Hunger); // +36
            Assert.AreEqual(63f, s.Stats.Hope);   // +8
        }

        // ---- rest: energy +16, hope +2, health +3 unless injured ------------
        [Test]
        public void Rest_PinnedDeltas()
        {
            var s = GameState.NewGame();
            s.Stats.Health = 80f;
            SurvivalActions.Rest(s);
            Assert.AreEqual(100f, s.Stats.Energy); // 85 + 16 clamps
            Assert.AreEqual(57f, s.Stats.Hope);
            Assert.AreEqual(83f, s.Stats.Health);
        }

        [Test]
        public void Rest_AnInjuryBlocksTheHealing()
        {
            var s = GameState.NewGame();
            s.Stats.Health = 80f;
            s.Injury = "laceration";
            SurvivalActions.Rest(s);
            Assert.AreEqual(80f, s.Stats.Health);
        }

        // ---- SOS: energy −8, hope +4, signal +3, flag --------------------------
        [Test]
        public void StampSos_PinnedDeltas()
        {
            var s = GameState.NewGame();
            SurvivalActions.StampSos(s);
            Assert.AreEqual(77f, s.Stats.Energy);
            Assert.AreEqual(59f, s.Stats.Hope);
            Assert.AreEqual(3, s.Route.Signal);
            Assert.IsTrue(s.Is("SOS"));
        }

        // ---- sleep: floor 45 + shelter*12 + fire*8; hope ±; ration nightcap ----
        [Test]
        public void Sleep_FloorScalesWithShelterAndFire()
        {
            var s = GameState.NewGame();
            s.Stats.Energy = 10f;
            s.Shelter = 1;
            s.Fire = 1;
            SurvivalActions.Sleep(s);
            Assert.AreEqual(65f, s.Stats.Energy); // 45 + 12 + 8
            Assert.AreEqual(56f, s.Stats.Hope);   // +1
        }

        [Test]
        public void Sleep_HighEnergyIsNotDraggedDownToTheFloor()
        {
            var s = GameState.NewGame();
            s.Stats.Energy = 90f;
            s.Shelter = 1;
            SurvivalActions.Sleep(s);
            Assert.AreEqual(90f, s.Stats.Energy);
        }

        [Test]
        public void Sleep_RoughCostsHope()
        {
            var s = GameState.NewGame();
            SurvivalActions.Sleep(s);
            Assert.AreEqual(45f, s.Stats.Energy);
            Assert.AreEqual(52f, s.Stats.Hope); // −3
        }

        [Test]
        public void Sleep_RationNightcap_WhenHungry()
        {
            var s = GameState.NewGame();
            s.AddItem("rations", 2);
            s.Stats.Hunger = 40f;
            SurvivalActions.Sleep(s);
            Assert.AreEqual(1, s.Count("rations"));
            Assert.AreEqual(65f, s.Stats.Hunger); // +25
        }

        [Test]
        public void Sleep_NoNightcap_WhenFedEnough()
        {
            var s = GameState.NewGame();
            s.AddItem("rations", 2);
            s.Stats.Hunger = 60f;
            SurvivalActions.Sleep(s);
            Assert.AreEqual(2, s.Count("rations"));
            Assert.AreEqual(60f, s.Stats.Hunger);
        }

        // ---- sleep order matches the VN: floor first, then the night tick -------
        [Test]
        public void SleepThenNightTick_WakesAtFloorMinusTheNightDrain()
        {
            var s = GameState.NewGame();
            s.Seg = Segment.Night;
            s.Stats.Energy = 5f;
            SurvivalActions.Sleep(s); // floor 45
            s.TickSegment();          // the night itself: energy −3
            Assert.AreEqual(42f, s.Stats.Energy);
            Assert.AreEqual(Segment.Dawn, s.Seg);
            Assert.AreEqual(1, s.Day);
        }
    }
}
