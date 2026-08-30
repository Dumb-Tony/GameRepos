using NUnit.Framework;
using Tidebound.Narrative;

namespace Tidebound.Tests
{
    /// <summary>Buri, the second companion: courtship, tiers, and his voice through the chapters.</summary>
    public class BuriTests
    {
        static StoryScript Script => Chapter1Encounters.Build();

        static GameState BuriRun(int trust = 60)
        {
            var s = GameState.NewGame();
            s.Meet("buri", 2);
            s.Companion = "buri";
            s.SetFlag("CLEARING_DONE");
            s.Trust = trust;
            return s;
        }

        [Test]
        public void TheClearing_OffersTheBeardedPig()
        {
            var s = GameState.NewGame();
            s.Meet("buri", 1);
            bool offered = false;
            foreach (var c in Script.Get("clearing").AvailableChoices(s))
                if (c.Go == "court_buri") { c.Do(s); offered = true; }
            Assert.IsTrue(offered);
            Assert.AreEqual("buri", s.Companion);
        }

        [Test]
        public void TheCourtship_NamesHimAndSeedsTrust()
        {
            var s = GameState.NewGame();
            s.Meet("buri", 2); // the crab-rent interview, passed
            s.Companion = "buri";
            var name = Script.Get("court_buri").AvailableChoices(s)[0];
            name.Do(s);
            Assert.IsTrue(s.Is("BURI_NAMED"));
            Assert.AreEqual("ch2_open", name.Go);
            // trust seed: 18 + interest(2+2 from naming)*5 = 38, clamped 45
            Assert.AreEqual(38, s.Trust);
        }

        [Test]
        public void BuriHasAllFiveTiersOfVignettes()
        {
            foreach (TrustTier tier in System.Enum.GetValues(typeof(TrustTier)))
            {
                var lines = CompanionLogic.VignettesFor("buri", tier);
                Assert.AreEqual(3, lines.Count, tier.ToString());
            }
            StringAssert.Contains("tax collector", CompanionLogic.Vignette("buri", TrustTier.Wary, 0));
            StringAssert.Contains("into the sea", CompanionLogic.Vignette("buri", TrustTier.Kindred, 0));
            // the kavi legacy accessors still answer
            StringAssert.Contains("Kavi", CompanionLogic.Vignette(TrustTier.Wary, 0));
        }

        [Test]
        public void HisVoice_ThreadsTheChapters()
        {
            var s = BuriRun();
            var heart = string.Join("\n", Script.Get("ev3_heart2").Text(s));
            StringAssert.Contains("walks the perimeter", heart);
            Assert.AreEqual("Buri", Script.Get("ev3_heart2").SpeakerFor(s));

            var station = string.Join("\n", Script.Get("ev4_companion").Text(s));
            StringAssert.Contains("HALCYON STORES", station);
            Script.Get("ev4_companion").OnEnter(s);
            Assert.IsTrue(s.Is("TRAILER")); // hauling capacity you didn't have this morning

            var temple = string.Join("\n", Script.Get("ch6_temple").Text(s));
            StringAssert.Contains("he kneels", temple);
        }

        [Test]
        public void TheIslandsOwn_AcceptsTheTusker()
        {
            var s = BuriRun(trust: 95);
            s.SetFlag("TIDEWELL_WITNESS");
            bool offered = false;
            foreach (var c in Script.Get("convergence").AvailableChoices(s))
                if (c.Label.Contains("Walk Buri up the mountain")) { c.Do(s); offered = true; }
            Assert.IsTrue(offered);
            Assert.AreEqual("ISLANDS_OWN", s.EndingId);
            var (title, body) = Endings.Resolve(s);
            Assert.AreEqual("THE ISLAND'S OWN", title);
            StringAssert.Contains("Keeper Buri", string.Join("\n", body));
        }

        [Test]
        public void HisEpilogue_StaysOrCannotCome()
        {
            var stay = BuriRun();
            stay.EndingId = "HOME";
            StringAssert.Contains("warm boulder", string.Join("\n", Endings.Epilogue(stay)));

            var leave = BuriRun();
            leave.EndingId = "LONG_SWIM";
            StringAssert.Contains("does not watch you go", string.Join("\n", Endings.Epilogue(leave)));
        }
    }
}
