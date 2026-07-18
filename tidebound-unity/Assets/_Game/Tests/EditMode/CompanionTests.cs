using System.Linq;
using NUnit.Framework;
using Tidebound.Narrative;

namespace Tidebound.Tests
{
    /// <summary>
    /// The companion system: the VN's trust seed, the tier→behavior map,
    /// the Clearing of Eyes, and Kavi's courtship — all pinned.
    /// </summary>
    public class CompanionTests
    {
        // ---- trust init: 18 + interest*5, clamped 0..45, exactly once ----
        [Test]
        public void InitTrust_PinnedToTheVNFormula()
        {
            var s = GameState.NewGame();
            s.Companion = "kavi";
            s.Interest["kavi"] = 3;
            CompanionLogic.InitTrust(s);
            Assert.AreEqual(33, s.Trust); // 18 + 15
            Assert.IsTrue(s.Is("TRUST_INIT"));
        }

        [Test]
        public void InitTrust_ClampsAt45_AndRunsOnce()
        {
            var s = GameState.NewGame();
            s.Companion = "kavi";
            s.Interest["kavi"] = 10;
            CompanionLogic.InitTrust(s);
            Assert.AreEqual(45, s.Trust);
            s.Trust = 60;
            CompanionLogic.InitTrust(s); // no second seed
            Assert.AreEqual(60, s.Trust);
        }

        [Test]
        public void InitTrust_NeedsACompanion()
        {
            var s = GameState.NewGame();
            CompanionLogic.InitTrust(s);
            Assert.AreEqual(0, s.Trust);
            Assert.IsFalse(s.Is("TRUST_INIT"));
        }

        // ---- tiers are behavior: closer, warmer, touchable -----------------
        [Test]
        public void Profiles_CloseTheDistanceAsTrustGrows()
        {
            float last = float.MaxValue;
            foreach (TrustTier tier in System.Enum.GetValues(typeof(TrustTier)))
            {
                var p = CompanionLogic.ProfileFor(tier);
                Assert.Less(p.FollowDistance, last, tier.ToString());
                last = p.FollowDistance;
            }
            Assert.IsFalse(CompanionLogic.ProfileFor(TrustTier.Wary).Follows);
            Assert.IsTrue(CompanionLogic.ProfileFor(TrustTier.Watchful).Follows);
            Assert.IsFalse(CompanionLogic.ProfileFor(TrustTier.Watchful).AllowsTouch);
            Assert.IsTrue(CompanionLogic.ProfileFor(TrustTier.Warming).AllowsTouch);
            Assert.IsTrue(CompanionLogic.ProfileFor(TrustTier.Kindred).FiresideRest);
        }

        [Test]
        public void Vignettes_ExistForEveryTier_AndWrap()
        {
            foreach (TrustTier tier in System.Enum.GetValues(typeof(TrustTier)))
                Assert.AreEqual(3, CompanionLogic.VignettesFor(tier).Count, tier.ToString());
            Assert.AreEqual(CompanionLogic.Vignette(TrustTier.Wary, 0), CompanionLogic.Vignette(TrustTier.Wary, 3));
        }

        // ---- one bond action per segment -----------------------------------
        [Test]
        public void BondActions_OncePerSegment()
        {
            var s = GameState.NewGame();
            s.Day = 3;
            s.Seg = Segment.Day;
            int now = CompanionLogic.TotalSegment(s);
            Assert.IsTrue(CompanionLogic.CanRepeat(-1, s));
            Assert.IsFalse(CompanionLogic.CanRepeat(now, s));
            s.Seg = Segment.Dusk;
            Assert.IsTrue(CompanionLogic.CanRepeat(now, s));
        }

        // ---- the Clearing of Eyes --------------------------------------------
        static StoryScript Script => Chapter1Encounters.Build();

        [Test]
        public void Clearing_TheGreyDog_OnlyOffersHimselfIfMet()
        {
            var unmet = GameState.NewGame();
            Assert.AreEqual(1, Script.Get("clearing").AvailableChoices(unmet).Count); // solo only

            var met = GameState.NewGame();
            met.Meet("kavi", 1);
            Assert.AreEqual(2, Script.Get("clearing").AvailableChoices(met).Count);
        }

        [Test]
        public void Clearing_ChoosingKavi_BindsTheCompanion()
        {
            var s = GameState.NewGame();
            s.Meet("kavi", 2);
            var choice = Script.Get("clearing").AvailableChoices(s)[0];
            choice.Do(s);
            Assert.AreEqual("kavi", s.Companion);
            Assert.IsTrue(s.Is("CLEARING_DONE"));
            Assert.AreEqual("court_kavi", choice.Go);
        }

        [Test]
        public void Clearing_TheSoloRoad_PinnedEffects()
        {
            var s = GameState.NewGame();
            var choice = Script.Get("clearing").AvailableChoices(s)[0]; // solo is the only option unmet
            choice.Do(s);
            Assert.IsNull(s.Companion);
            Assert.IsTrue(s.Is("SOLO_ROUTE"));
            Assert.AreEqual(1, s.Route.Roots);
            Assert.AreEqual("court_none", choice.Go);
        }

        [Test]
        public void CourtKavi_Naming_PinnedEffects_AndTrustSeed()
        {
            var s = GameState.NewGame();
            s.Meet("kavi", 2);          // the courtship warmth so far
            s.Companion = "kavi";
            s.SetFlag("CLEARING_DONE");
            Script.Get("court_kavi").AvailableChoices(s)[0].Do(s);
            Assert.IsTrue(s.Is("KAVI_NAMED"));
            Assert.AreEqual(61f, s.Stats.Hope);       // 55 + 6
            Assert.AreEqual(4, s.Interest["kavi"]);   // 2 + 2
            Assert.AreEqual(38, s.Trust);             // 18 + 4*5
        }

        [Test]
        public void CourtKavi_DeferringTheName_PinnedEffects()
        {
            var s = GameState.NewGame();
            s.Meet("kavi", 0);
            s.Companion = "kavi";
            Script.Get("court_kavi").AvailableChoices(s)[1].Do(s);
            Assert.IsFalse(s.Is("KAVI_NAMED"));
            Assert.AreEqual(59f, s.Stats.Hope);       // 55 + 4
            Assert.AreEqual(1, s.Route.Depth);
            Assert.AreEqual(23, s.Trust);             // 18 + 1*5
        }

        [Test]
        public void CourtKavi_TextHonorsTheCourtship()
        {
            var warm = GameState.NewGame();
            warm.Interest["kavi"] = 3;
            Assert.IsTrue(Script.Get("court_kavi").Text(warm).Any(p => p.Contains("running those numbers")));

            var cold = GameState.NewGame();
            Assert.IsTrue(Script.Get("court_kavi").Text(cold).Any(p => p.Contains("little enough reason")));
        }

        [Test]
        public void TheClearing_IsOnTheCalendar_DayFiveDusk()
        {
            var s = GameState.NewGame();
            s.Day = 5;
            s.Seg = Segment.Dusk;
            Assert.AreEqual("clearing", EventScheduler.Due(s, Chapter1Schedule.Build()));
        }
    }
}
