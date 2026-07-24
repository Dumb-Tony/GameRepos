using NUnit.Framework;
using Tidebound.Narrative;

namespace Tidebound.Tests
{
    /// <summary>Moa, the third companion: courtship, tiers, and two pounds of voice through the chapters.</summary>
    public class MoaTests
    {
        static StoryScript Script => Chapter1Encounters.Build();

        static GameState MoaRun(int trust = 60)
        {
            var s = GameState.NewGame();
            s.Meet("moa", 2);
            s.Companion = "moa";
            s.SetFlag("CLEARING_DONE");
            s.Trust = trust;
            return s;
        }

        [Test]
        public void TheClearing_OffersTheCopperHen()
        {
            var s = GameState.NewGame();
            s.Meet("moa", 1);
            bool offered = false;
            foreach (var c in Script.Get("clearing").AvailableChoices(s))
                if (c.Go == "court_moa") { c.Do(s); offered = true; }
            Assert.IsTrue(offered);
            Assert.AreEqual("moa", s.Companion);
        }

        [Test]
        public void TheCourtship_NamesHerAndSeedsTrust()
        {
            var s = GameState.NewGame();
            s.Meet("moa", 2); // the ruined hawk morning, filed
            s.Companion = "moa";
            var name = Script.Get("court_moa").AvailableChoices(s)[0];
            name.Do(s);
            Assert.IsTrue(s.Is("MOA_NAMED"));
            Assert.AreEqual("ch2_open", name.Go);
            Assert.AreEqual(38, s.Trust); // 18 + (2+2)*5
        }

        [Test]
        public void MoaHasAllFiveTiersOfVignettes()
        {
            foreach (TrustTier tier in System.Enum.GetValues(typeof(TrustTier)))
                Assert.AreEqual(3, CompanionLogic.VignettesFor("moa", tier).Count, tier.ToString());
            StringAssert.Contains("wound like a spring", CompanionLogic.Vignette("moa", TrustTier.Wary, 0));
            StringAssert.Contains("her flock", CompanionLogic.Vignette("moa", TrustTier.Kindred, 0));
        }

        [Test]
        public void HerVoice_ThreadsTheChapters()
        {
            var s = MoaRun();
            var heart1 = string.Join("\n", Script.Get("ev2_heart").Text(s));
            StringAssert.Contains("steps into your lap", heart1);
            Assert.AreEqual("Moa", Script.Get("ev2_heart").SpeakerFor(s));

            var heart2 = string.Join("\n", Script.Get("ev3_heart2").Text(s));
            StringAssert.Contains("mantled to twice her size", heart2);

            var station = string.Join("\n", Script.Get("ev4_companion").Text(s));
            StringAssert.Contains("greenhouse", station);
            Script.Get("ev4_companion").OnEnter(s);
            Assert.IsTrue(s.Is("SEEDS")); // the inheritance, claimed

            var temple = string.Join("\n", Script.Get("ch6_temple").Text(s));
            StringAssert.Contains("sergeant's march", temple);
        }

        [Test]
        public void SeedsFeedTheHomestead()
        {
            var s = MoaRun();
            s.SetFlag("STATION_OPENED");
            Script.Get("ev4_companion").OnEnter(s);
            var planting = string.Join("\n", Script.Get("ev5_home1").Text(s));
            StringAssert.Contains("seed cabinet", planting); // her ch4 gift pays off in ch5
            StringAssert.Contains("inspector-general", planting);
        }

        [Test]
        public void TheIslandsOwn_AcceptsTheSmallestKeeper()
        {
            var s = MoaRun(trust: 95);
            s.SetFlag("TIDEWELL_FEED");
            bool offered = false;
            foreach (var c in Script.Get("convergence").AvailableChoices(s))
                if (c.Label.Contains("Walk Moa up the mountain")) { c.Do(s); offered = true; }
            Assert.IsTrue(offered);
            var (title, body) = Endings.Resolve(s);
            Assert.AreEqual("THE ISLAND'S OWN", title);
            StringAssert.Contains("Keeper Moa", string.Join("\n", body));
        }

        [Test]
        public void HerEpilogue_RemainsRulesOrIsCarriedToTheGrove()
        {
            var remain = MoaRun();
            remain.EndingId = "REMAIN";
            StringAssert.Contains("head of the column", string.Join("\n", Endings.Epilogue(remain)));

            var stay = MoaRun();
            stay.EndingId = "HOME";
            StringAssert.Contains("Moa rules", string.Join("\n", Endings.Epilogue(stay)));

            var leave = MoaRun();
            leave.EndingId = "LONG_SWIM";
            StringAssert.Contains("Edda's grove", string.Join("\n", Endings.Epilogue(leave)));
        }
    }
}
