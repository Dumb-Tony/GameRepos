using NUnit.Framework;

namespace Tidebound.Tests
{
    public class GameStateTests
    {
        [Test]
        public void NewGame_MatchesVnStartingState()
        {
            var s = GameState.NewGame();
            Assert.AreEqual(0, s.Day);
            Assert.AreEqual(Segment.Dawn, s.Seg);
            Assert.AreEqual(1, s.Chapter);
            Assert.AreEqual(100f, s.Stats.Health);
            Assert.AreEqual(80f, s.Stats.Hunger);
            Assert.AreEqual(75f, s.Stats.Thirst);
            Assert.AreEqual(85f, s.Stats.Energy);
            Assert.AreEqual(55f, s.Stats.Hope);
            Assert.AreEqual(0, s.Trust);
            Assert.IsNull(s.Companion);
            Assert.IsNull(s.DeathCause);
            Assert.IsEmpty(s.Flags);
        }

        [Test]
        public void Stat_ClampsToZeroAndHundred()
        {
            var s = GameState.NewGame();
            s.Stat(Meter.Hope, +500f);
            Assert.AreEqual(100f, s.Stats.Hope);
            s.Stat(Meter.Health, -500f);
            Assert.AreEqual(0f, s.Stats.Health);
        }

        [Test]
        public void Stat_RoundsLikeTheVn()
        {
            var s = GameState.NewGame();
            s.Stat(Meter.Hope, +0.4f); // 55.4 → rounds to 55
            Assert.AreEqual(55f, s.Stats.Hope);
            s.Stat(Meter.Hope, +0.7f); // 55.7 → rounds to 56
            Assert.AreEqual(56f, s.Stats.Hope);
        }

        [Test]
        public void Flags_TheLedger()
        {
            var s = GameState.NewGame();
            Assert.IsFalse(s.Is("COMPASS_SPINS"));
            s.SetFlag("COMPASS_SPINS");
            Assert.IsTrue(s.Is("COMPASS_SPINS"));
            s.SetFlag("COMPASS_SPINS", false);
            Assert.IsFalse(s.Is("COMPASS_SPINS"));
        }

        [Test]
        public void Inventory_AddRemoveFloorsAtZero()
        {
            var s = GameState.NewGame();
            s.AddItem("cordage");
            Assert.IsTrue(s.Has("cordage"));
            Assert.AreEqual(1, s.Count("cordage"));
            s.AddItem("cordage", -5);
            Assert.IsFalse(s.Has("cordage"));
            Assert.AreEqual(0, s.Count("cordage"));
        }

        [TestCase(0, TrustTier.Wary)]
        [TestCase(24, TrustTier.Wary)]
        [TestCase(25, TrustTier.Watchful)]
        [TestCase(49, TrustTier.Watchful)]
        [TestCase(50, TrustTier.Warming)]
        [TestCase(74, TrustTier.Warming)]
        [TestCase(75, TrustTier.Bonded)]
        [TestCase(99, TrustTier.Bonded)]
        [TestCase(100, TrustTier.Kindred)]
        public void TrustTiers_MatchVnThresholds(int trust, TrustTier expected)
        {
            var s = GameState.NewGame();
            s.Bond(trust);
            Assert.AreEqual(expected, s.Tier);
        }

        [Test]
        public void Bond_ClampsToZeroAndHundred()
        {
            var s = GameState.NewGame();
            s.Bond(150);
            Assert.AreEqual(100, s.Trust);
            s.Bond(-999);
            Assert.AreEqual(0, s.Trust);
        }

        [Test]
        public void Route_AccumulatesAndReportsDominant()
        {
            var s = GameState.NewGame();
            s.AddRoute(RouteAxis.Signal, 2);
            s.AddRoute(RouteAxis.Depth, 5);
            s.AddRoute(RouteAxis.Roots, 1);
            Assert.AreEqual(2, s.Route.Signal);
            Assert.AreEqual(1, s.Route.Roots);
            Assert.AreEqual(5, s.Route.Depth);
            Assert.AreEqual(RouteAxis.Depth, s.Route.Dominant);
        }

        [Test]
        public void MeetAndWarm_TrackCourtship()
        {
            var s = GameState.NewGame();
            s.Meet("kavi", 1);
            s.Warm("kavi", 2);
            Assert.IsTrue(s.Met["kavi"]);
            Assert.AreEqual(3, s.Interest["kavi"]);
        }
    }
}
