using NUnit.Framework;
using Tidebound.Narrative;

namespace Tidebound.Tests
{
    /// <summary>Vela, the fourth companion: courtship, tiers, the overwatch
    /// crossing, the cyclone's one glimpse of her heart, and the ending only
    /// she carries — the open hand at Kestrel Cliffs.</summary>
    public class VelaTests
    {
        static StoryScript Script => Chapter1Encounters.Build();

        static GameState VelaRun(int trust = 60)
        {
            var s = GameState.NewGame();
            s.Meet("vela", 2);
            s.Companion = "vela";
            s.SetFlag("CLEARING_DONE");
            s.Trust = trust;
            return s;
        }

        [Test]
        public void TheClearing_OffersTheSeaEagle()
        {
            var s = GameState.NewGame();
            s.Meet("vela", 1);
            bool offered = false;
            foreach (var c in Script.Get("clearing").AvailableChoices(s))
                if (c.Go == "court_vela") { c.Do(s); offered = true; }
            Assert.IsTrue(offered);
            Assert.AreEqual("vela", s.Companion);
        }

        [Test]
        public void TheCourtship_NamesHerAndSeedsTrust()
        {
            var s = GameState.NewGame();
            s.Meet("vela", 2); // half the fish left on the high rock — a ledger of your own
            s.Companion = "vela";
            var name = Script.Get("court_vela").AvailableChoices(s)[0];
            name.Do(s);
            Assert.IsTrue(s.Is("VELA_NAMED"));
            Assert.AreEqual("ch2_open", name.Go);
            Assert.AreEqual(38, s.Trust); // 18 + (2+2)*5
        }

        [Test]
        public void VelaHasAllFiveTiersOfVignettes()
        {
            foreach (TrustTier tier in System.Enum.GetValues(typeof(TrustTier)))
                Assert.AreEqual(3, CompanionLogic.VignettesFor("vela", tier).Count, tier.ToString());
            StringAssert.Contains("books open", CompanionLogic.Vignette("vela", TrustTier.Wary, 0));
            StringAssert.Contains("mantles over your camp", CompanionLogic.Vignette("vela", TrustTier.Kindred, 0));
        }

        [Test]
        public void HerVoice_ThreadsTheChapters()
        {
            var s = VelaRun();
            var heart1 = string.Join("\n", Script.Get("ev2_heart").Text(s));
            StringAssert.Contains("extend you <i>credit</i>", heart1);
            Assert.AreEqual("Vela", Script.Get("ev2_heart").SpeakerFor(s));

            var heart2 = string.Join("\n", Script.Get("ev3_heart2").Text(s));
            StringAssert.Contains("presses it to your chest", heart2);

            var station = string.Join("\n", Script.Get("ev4_companion").Text(s));
            StringAssert.Contains("service road", station);
            Script.Get("ev4_companion").OnEnter(s);
            Assert.IsTrue(s.Is("DRILL_ROAD")); // the drill's road, seen from the sky

            var temple = string.Join("\n", Script.Get("ch6_temple").Text(s));
            StringAssert.Contains("highest broken pillar", temple);
        }

        [Test]
        public void TheWireAndTheRoad_PayForward()
        {
            var s = VelaRun();
            Script.Get("station_radio").OnEnter(s);
            Assert.IsTrue(s.Is("WIRE")); // the antenna coil, an account settled
            StringAssert.Contains("antenna wire", string.Join("\n", Script.Get("station_radio").Text(s)));

            s.SetFlag("DRILL_ROAD");
            StoryChoice descent = null;
            foreach (var c in Script.Get("ch5_open").Choices)
                if (c.Label.StartsWith("THE DESCENT")) descent = c;
            Assert.IsNotNull(descent);
            StringAssert.Contains("Vela's road points at the bore site", descent.SubFor(s));
        }

        [Test]
        public void TheCyclone_ShowsHerWholeHeartOnce()
        {
            var devoted = VelaRun(trust: 80);
            Script.Get("ev5_cyclone").OnEnter(devoted);
            Assert.IsTrue(devoted.Is("VELA_MANTLED"));
            StringAssert.Contains("mantled over it like it's a nest",
                string.Join("\n", Script.Get("ev5_cyclone").Text(devoted)));

            var distant = VelaRun(trust: 60);
            Script.Get("ev5_cyclone").OnEnter(distant);
            Assert.IsFalse(distant.Is("VELA_MANTLED"));
            StringAssert.Contains("gone before the front hit",
                string.Join("\n", Script.Get("ev5_cyclone").Text(distant)));
        }

        [Test]
        public void TheToll_CrossesOnHerSyllables()
        {
            var s = VelaRun();
            bool offered = false;
            foreach (var c in Script.Get("ch3_threshold").AvailableChoices(s))
                if (c.Go == "ch3_toll_vela") { c.Do(s); offered = true; }
            Assert.IsTrue(offered);
            Assert.IsTrue(s.Is("GRIN_OVERWATCH"));
            Assert.IsTrue(s.Is("EAST_OPEN"));
            StringAssert.Contains("on a bird's syllables",
                string.Join("\n", Script.Get("ch3_toll_vela").Text(s)));
        }

        [Test]
        public void TheWindTakesHer()
        {
            var s = VelaRun(trust: 80);
            bool offered = false;
            foreach (var c in Script.Get("convergence").AvailableChoices(s))
                if (c.Label.Contains("Kestrel Cliffs")) { c.Do(s); offered = true; }
            Assert.IsTrue(offered);
            var (title, body) = Endings.Resolve(s);
            Assert.AreEqual("THE WIND TAKES HER", title);
            StringAssert.Contains("circling is for birds with doubts", string.Join("\n", body));
            // her fate is the ending itself; the epilogue does not double-bill
            foreach (var line in Endings.Epilogue(s))
                StringAssert.DoesNotContain("reef gate", line);
        }

        [Test]
        public void TheIslandsOwn_AcceptsTheKeeperOfTheSky()
        {
            var s = VelaRun(trust: 95);
            s.SetFlag("TIDEWELL_FEED");
            bool offered = false;
            foreach (var c in Script.Get("convergence").AvailableChoices(s))
                if (c.Label.Contains("Walk Vela up the mountain")) { c.Do(s); offered = true; }
            Assert.IsTrue(offered);
            var (title, body) = Endings.Resolve(s);
            Assert.AreEqual("THE ISLAND'S OWN", title);
            StringAssert.Contains("Keeper Vela", string.Join("\n", body));
        }

        [Test]
        public void HerEpilogue_EscortsOrOutlivesTheTables()
        {
            var stay = VelaRun();
            stay.EndingId = "HOME";
            StringAssert.Contains("actuarial table", string.Join("\n", Endings.Epilogue(stay)));

            var leave = VelaRun();
            leave.EndingId = "LONG_SWIM";
            StringAssert.Contains("reef gate", string.Join("\n", Endings.Epilogue(leave)));
        }
    }
}
