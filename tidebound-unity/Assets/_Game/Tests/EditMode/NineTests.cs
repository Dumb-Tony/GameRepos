using NUnit.Framework;
using Tidebound.Narrative;

namespace Tidebound.Tests
{
    /// <summary>Nine, the sixth and secret companion: found only by
    /// lingering, courted in her own language, and carrying the game's
    /// strangest gifts — a photograph with a bearing on it, a canister from
    /// a drowned throat, and endings measured in springs.</summary>
    public class NineTests
    {
        static StoryScript Script => Chapter1Encounters.Build();

        static GameState NineRun(int trust = 60)
        {
            var s = GameState.NewGame();
            s.Meet("nine", 2);
            s.Companion = "nine";
            s.SetFlag("CLEARING_DONE");
            s.Trust = trust;
            return s;
        }

        [Test]
        public void TheSecret_TakesTwoVisitsToThePools()
        {
            var s = GameState.NewGame();
            Assert.IsFalse(Chapter1Encounters.NineIsDue(s));
            s.TidePoolVisits = 1;
            Assert.IsFalse(Chapter1Encounters.NineIsDue(s));
            s.TidePoolVisits = 2;
            Assert.IsTrue(Chapter1Encounters.NineIsDue(s)); // most players never learn she exists
            s.Meet("nine", 1);
            Assert.IsFalse(Chapter1Encounters.NineIsDue(s));
        }

        [Test]
        public void TheClearing_OffersTheOctopus()
        {
            var s = GameState.NewGame();
            s.Meet("nine", 1);
            bool offered = false;
            foreach (var c in Script.Get("clearing").AvailableChoices(s))
                if (c.Go == "court_nine") { c.Do(s); offered = true; }
            Assert.IsTrue(offered);
            Assert.AreEqual("nine", s.Companion);
        }

        [Test]
        public void TheCourtship_NamesHerAndSeedsTrust()
        {
            var s = GameState.NewGame();
            s.Meet("nine", 2); // half the oyster, offered as tribute
            s.Companion = "nine";
            var name = Script.Get("court_nine").AvailableChoices(s)[0];
            name.Do(s);
            Assert.IsTrue(s.Is("NINE_NAMED"));
            Assert.AreEqual("ch2_open", name.Go);
            Assert.AreEqual(38, s.Trust); // 18 + (2+2)*5
        }

        [Test]
        public void NineHasAllFiveTiersOfVignettes()
        {
            foreach (TrustTier tier in System.Enum.GetValues(typeof(TrustTier)))
                Assert.AreEqual(3, CompanionLogic.VignettesFor("nine", tier).Count, tier.ToString());
            StringAssert.Contains("one eye out, noting", CompanionLogic.Vignette("nine", TrustTier.Wary, 0));
            StringAssert.Contains("like it matters", CompanionLogic.Vignette("nine", TrustTier.Kindred, 0));
        }

        [Test]
        public void HerVoice_ThreadsTheChapters()
        {
            var s = NineRun();
            var heart1 = string.Join("\n", Script.Get("ev2_heart").Text(s));
            StringAssert.Contains("I have been studying", heart1);
            Assert.AreEqual("Nine", Script.Get("ev2_heart").SpeakerFor(s));

            Script.Get("ev3_heart2").OnEnter(s);
            Assert.IsTrue(s.Is("SHIP_PHOTO")); // hope, with a bearing on it
            StringAssert.Contains("hope, with a bearing on it", string.Join("\n", Script.Get("ev3_heart2").Text(s)));

            Script.Get("ev4_companion").OnEnter(s);
            Assert.IsTrue(s.Is("VANE_FILM")); // the canister only the sea could reach
            StringAssert.Contains("film canister", string.Join("\n", Script.Get("ev4_companion").Text(s)));

            var temple = string.Join("\n", Script.Get("ch6_temple").Text(s));
            StringAssert.Contains("never once traveled away from her", temple);
        }

        [Test]
        public void TheSilverthread_WasAlwaysHerFrontDoor()
        {
            var s = NineRun();
            StringAssert.Contains("front door", string.Join("\n", Script.Get("ev3_river").Text(s)));
        }

        [Test]
        public void TheToll_CrossesTheBackDoorOfHisKingdom()
        {
            var s = NineRun();
            bool offered = false;
            foreach (var c in Script.Get("ch3_threshold").AvailableChoices(s))
                if (c.Go == "ch3_toll_nine") { c.Do(s); offered = true; }
            Assert.IsTrue(offered);
            Assert.IsTrue(s.Is("GRIN_MAPPED"));
            Assert.IsTrue(s.Is("EAST_OPEN"));
            StringAssert.Contains("ferryman's lamp", string.Join("\n", Script.Get("ch3_toll_nine").Text(s)));
        }

        [Test]
        public void TheGullet_SheKeepsTimeWithIt()
        {
            var s = NineRun(trust: 60);
            Script.Get("ev5_deep1").OnEnter(s);
            Assert.AreEqual(65, s.Trust); // she threads in from the reef side: +5
            StringAssert.Contains("keeps time with it", string.Join("\n", Script.Get("ev5_deep1").Text(s)));
        }

        [Test]
        public void TheIslandsOwn_AcceptsTheWatersOwnAttention()
        {
            var s = NineRun(trust: 95);
            s.SetFlag("TIDEWELL_FEED");
            bool offered = false;
            foreach (var c in Script.Get("convergence").AvailableChoices(s))
                if (c.Label.Contains("Walk Nine up")) { c.Do(s); offered = true; }
            Assert.IsTrue(offered);
            var (title, body) = Endings.Resolve(s);
            Assert.AreEqual("THE ISLAND'S OWN", title);
            StringAssert.Contains("Keeper Nine", string.Join("\n", body));
        }

        [Test]
        public void ThreeSpringsAndTheGarden_AreHerDoors()
        {
            var springs = NineRun(trust: 80);
            bool springsOffered = false;
            foreach (var c in Script.Get("convergence").AvailableChoices(springs))
                if (c.Label.Contains("Stay for her springs")) { c.Do(springs); springsOffered = true; }
            Assert.IsTrue(springsOffered);
            Assert.AreEqual("THREE_SPRINGS", springs.EndingId);

            var garden = NineRun(trust: 55);
            bool gardenOffered = false;
            foreach (var c in Script.Get("convergence").AvailableChoices(garden))
                if (c.Label.Contains("Rebuild your life at the tideline")) { c.Do(garden); gardenOffered = true; }
            Assert.IsTrue(gardenOffered);
            var (title, body) = Endings.Resolve(garden);
            Assert.AreEqual("NINE'S GARDEN", title);
            StringAssert.Contains("presidential pool", string.Join("\n", body));
        }

        [Test]
        public void HerEpilogue_FollowsTheHullOrSendsTheSpiral()
        {
            var stay = NineRun();
            stay.EndingId = "HOME";
            StringAssert.Contains("traces, unmistakably, a spiral", string.Join("\n", Endings.Epilogue(stay)));

            var leave = NineRun();
            leave.EndingId = "LONG_SWIM";
            StringAssert.Contains("the light of her, going down", string.Join("\n", Endings.Epilogue(leave)));
        }
    }
}
