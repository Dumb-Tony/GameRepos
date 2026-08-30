using NUnit.Framework;
using Tidebound.Narrative;

namespace Tidebound.Tests
{
    /// <summary>Ipo, the fifth companion: the lighter's return, the audit
    /// tiers, the key from the hoard, the greatest performance of his career,
    /// and the fear-walk into the dark at knee height.</summary>
    public class IpoTests
    {
        static StoryScript Script => Chapter1Encounters.Build();

        static GameState IpoRun(int trust = 60)
        {
            var s = GameState.NewGame();
            s.Meet("ipo", 2);
            s.Companion = "ipo";
            s.SetFlag("CLEARING_DONE");
            s.Trust = trust;
            return s;
        }

        [Test]
        public void TheClearing_OffersTheMacaque()
        {
            var s = GameState.NewGame();
            s.Meet("ipo", 1);
            bool offered = false;
            foreach (var c in Script.Get("clearing").AvailableChoices(s))
                if (c.Go == "court_ipo") { c.Do(s); offered = true; }
            Assert.IsTrue(offered);
            Assert.AreEqual("ipo", s.Companion);
        }

        [Test]
        public void TheCourtship_ReturnsTheLighterAndSeedsTrust()
        {
            var s = GameState.NewGame();
            s.AddItem("lighter", -99); // the day-2 theft, still on the books
            s.Meet("ipo", 2);
            s.Companion = "ipo";
            var name = Script.Get("court_ipo").AvailableChoices(s)[0];
            name.Do(s);
            Assert.IsTrue(s.Is("IPO_NAMED"));
            Assert.IsTrue(s.Has("lighter")); // the bit that killed, given away for the encore
            Assert.AreEqual("ch2_open", name.Go);
            Assert.AreEqual(38, s.Trust); // 18 + (2+2)*5
        }

        [Test]
        public void IpoHasAllFiveTiersOfVignettes()
        {
            foreach (TrustTier tier in System.Enum.GetValues(typeof(TrustTier)))
                Assert.AreEqual(3, CompanionLogic.VignettesFor("ipo", tier).Count, tier.ToString());
            StringAssert.Contains("auditing your possessions", CompanionLogic.Vignette("ipo", TrustTier.Wary, 0));
            StringAssert.Contains("gravity of a priest", CompanionLogic.Vignette("ipo", TrustTier.Kindred, 0));
        }

        [Test]
        public void HisVoice_ThreadsTheChapters()
        {
            var s = IpoRun();
            var heart1 = string.Join("\n", Script.Get("ev2_heart").Text(s));
            StringAssert.Contains("paperwork is being finished on your scalp", heart1);
            Assert.AreEqual("Ipo", Script.Get("ev2_heart").SpeakerFor(s));

            Script.Get("ev3_heart2").OnEnter(s);
            Assert.IsTrue(s.Is("IPO_KEY")); // the hoard gives up the E-wing key
            StringAssert.Contains("HALCYON — E WING", string.Join("\n", Script.Get("ev3_heart2").Text(s)));

            Script.Get("ev4_companion").OnEnter(s);
            Assert.IsTrue(s.Is("RADIO_PARTS_BONUS"));
            StringAssert.Contains("quartermaster", string.Join("\n", Script.Get("ev4_companion").Text(s)));

            var temple = string.Join("\n", Script.Get("ch6_temple").Text(s));
            StringAssert.Contains("museum-goer's posture", temple);
        }

        [Test]
        public void TheKey_OpensTheEWing()
        {
            var s = IpoRun();
            s.SetFlag("IPO_KEY");
            Script.Get("station_ewing").OnEnter(s);
            Assert.IsTrue(s.Is("E_WING_OPEN")); // his ch3 gift pays off at the steel door
        }

        [Test]
        public void TheToll_PaysInAudacity()
        {
            var s = IpoRun();
            bool offered = false;
            foreach (var c in Script.Get("ch3_threshold").AvailableChoices(s))
                if (c.Go == "ch3_toll_ipo") { c.Do(s); offered = true; }
            Assert.IsTrue(offered);
            Assert.IsTrue(s.Is("GRIN_DISTRACTED"));
            Assert.IsTrue(s.Is("EAST_OPEN"));
            StringAssert.Contains("gypped for the first time in decades",
                string.Join("\n", Script.Get("ch3_toll_ipo").Text(s)));
        }

        [Test]
        public void TheGullet_FearWalkAtKneeHeight()
        {
            var s = IpoRun(trust: 60);
            Script.Get("ev5_deep1").OnEnter(s);
            Assert.AreEqual(68, s.Trust); // the fear-walk bond: +8
            StringAssert.Contains("bravest thing you have ever watched anyone do at knee height",
                string.Join("\n", Script.Get("ev5_deep1").Text(s)));
        }

        [Test]
        public void TheCyclone_MoraleOfficerNeverOffDuty()
        {
            var s = IpoRun();
            Script.Get("ev5_cyclone").OnEnter(s);
            StringAssert.Contains("Morale officer",
                string.Join("\n", Script.Get("ev5_cyclone").Text(s)));
        }

        [Test]
        public void TheTricksterCrown_IsOfferedAtKindredTrust()
        {
            var s = IpoRun(trust: 95);
            bool offered = false;
            foreach (var c in Script.Get("convergence").AvailableChoices(s))
                if (c.Label.Contains("building in the canopy")) { c.Do(s); offered = true; }
            Assert.IsTrue(offered);
            Assert.AreEqual("TRICKSTER", s.EndingId);
            // his fate IS the ending; the epilogue does not double-bill
            foreach (var line in Endings.Epilogue(s))
                StringAssert.DoesNotContain("highest palm", line);
        }

        [Test]
        public void TheIslandsOwn_AcceptsTheAuditor()
        {
            var s = IpoRun(trust: 95);
            s.SetFlag("TIDEWELL_FEED");
            bool offered = false;
            foreach (var c in Script.Get("convergence").AvailableChoices(s))
                if (c.Label.Contains("Walk Ipo up the mountain")) { c.Do(s); offered = true; }
            Assert.IsTrue(offered);
            var (title, body) = Endings.Resolve(s);
            Assert.AreEqual("THE ISLAND'S OWN", title);
            StringAssert.Contains("Keeper Ipo", string.Join("\n", body));
        }

        [Test]
        public void HisEpilogue_ClimbsThePalmOrKeepsTheTreasury()
        {
            var stay = IpoRun();
            stay.EndingId = "HOME";
            StringAssert.Contains("front row", string.Join("\n", Endings.Epilogue(stay)));

            var leave = IpoRun();
            leave.EndingId = "LONG_SWIM";
            StringAssert.Contains("highest palm", string.Join("\n", Endings.Epilogue(leave)));
        }
    }
}
