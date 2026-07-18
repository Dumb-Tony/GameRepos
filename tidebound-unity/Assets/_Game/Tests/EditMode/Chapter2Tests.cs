using NUnit.Framework;
using Tidebound.Narrative;

namespace Tidebound.Tests
{
    /// <summary>Chapter Two — Foothold: every ported effect pinned.</summary>
    public class Chapter2Tests
    {
        static StoryScript Script => Chapter1Encounters.Build();

        [Test]
        public void ChapterTwo_OpensOnceAndClaimsTheBeach()
        {
            var s = GameState.NewGame();
            var open = Script.Get("ch2_open");
            open.OnEnter(s);
            Assert.AreEqual(2, s.Chapter);

            var stay = open.AvailableChoices(s)[0];
            stay.Do(s);
            Assert.AreEqual("beach", s.Site);
            Assert.IsTrue(s.Is("SITE_BEACH"));
            Assert.AreEqual(1, s.Route.Signal);
            Assert.AreEqual("ch2_site", stay.Go);
        }

        [Test]
        public void TheCourtship_LeadsIntoChapterTwo()
        {
            var s = GameState.NewGame();
            s.Meet("kavi", 2);
            s.Companion = "kavi";
            var name = Script.Get("court_kavi").AvailableChoices(s)[0];
            Assert.AreEqual("ch2_open", name.Go);
            Assert.AreEqual("ch2_open", Script.Get("court_none").Next);
        }

        // ---- the raid --------------------------------------------------------
        [Test]
        public void BoarKing_Arrival_AppliesOnce_AndKaviSeesHim()
        {
            var s = GameState.NewGame();
            s.Companion = "kavi";
            var scene = Script.Get("ev2_boarking");
            scene.OnEnter(s);
            Assert.IsTrue(s.Is("KING_SEEN"));
            Assert.AreEqual(72f, s.Stats.Hunger); // 80 - 8, the rack eaten
            scene.OnEnter(s);
            Assert.AreEqual(72f, s.Stats.Hunger); // guarded
        }

        [Test]
        public void BoarKing_TheThreeTreatySolutions_PinnedEffects()
        {
            var track = GameState.NewGame();
            track.Companion = "kavi";
            Script.Get("ev2_boarking").AvailableChoices(track)[0].Do(track);
            Assert.IsTrue(track.Is("KING_TRACKED"));
            Assert.AreEqual(1, track.Route.Depth);
            Assert.AreEqual(3, track.Trust); // Kavi reads the manuscript

            var wall = GameState.NewGame();
            Script.Get("ev2_boarking").AvailableChoices(wall)[1].Do(wall);
            Assert.IsTrue(wall.Is("KING_WALLED"));
            Assert.AreEqual(2, wall.Route.Roots);
            Assert.AreEqual(79f, wall.Stats.Energy); // -6

            var tithe = GameState.NewGame();
            Script.Get("ev2_boarking").AvailableChoices(tithe)[2].Do(tithe);
            Assert.IsTrue(tithe.Is("KING_TITHED"));
            Assert.AreEqual(74f, tithe.Stats.Hunger); // -6
            Assert.AreEqual(57f, tithe.Stats.Hope);   // +2
        }

        [Test]
        public void BoarKing_TheHunt_Unbacked_MakesANotch()
        {
            var s = GameState.NewGame(); // no companion, however strong
            var hunt = Script.Get("ev2_boarking").AvailableChoices(s)[3];
            hunt.Do(s);
            Assert.AreEqual("boarking", s.DeathCause);
            Assert.IsNull(hunt.GoDynamic(s)); // straight to the run card
            Assert.AreEqual("THE BOAR KING", Endings.Resolve(s).Title);
        }

        [Test]
        public void BoarKing_TheHunt_BackedAndStrong_BecomesTenancy()
        {
            var s = GameState.NewGame();
            s.Companion = "kavi"; // health 100, energy 85: strong, rested, backed
            var hunt = Script.Get("ev2_boarking").AvailableChoices(s)[3];
            hunt.Do(s);
            Assert.IsNull(s.DeathCause);
            Assert.IsTrue(s.Is("KING_FACED"));
            Assert.AreEqual("laceration", s.Injury);
            Assert.AreEqual(70f, s.Stats.Health); // -30
            Assert.AreEqual(65f, s.Stats.Energy); // -20
            Assert.AreEqual(51f, s.Stats.Hope);   // -4
            Assert.AreEqual("ev2_boarkface", hunt.GoDynamic(s));
        }

        // ---- the smoke ---------------------------------------------------------
        [Test]
        public void Smoke_Answering_PinnedEffects()
        {
            var s = GameState.NewGame();
            var answer = Script.Get("ev2_smoke").AvailableChoices(s)[1];
            answer.Do(s);
            Assert.IsTrue(s.Is("SMOKE_SEEN"));
            Assert.IsTrue(s.Is("SMOKE_ANSWERED"));
            Assert.AreEqual(1, s.Route.Signal);
            Assert.AreEqual(81f, s.Stats.Energy); // -4
            Assert.AreEqual("ev2_smoke2", answer.Go);
        }

        // ---- the fifteenth morning ---------------------------------------------
        [Test]
        public void TheHeartBeat_BondsTen_Once()
        {
            var s = GameState.NewGame();
            s.Companion = "kavi";
            s.Trust = 55;
            var heart = Script.Get("ev2_heart");
            heart.OnEnter(s);
            Assert.AreEqual(65, s.Trust);       // +10
            Assert.AreEqual(63f, s.Stats.Hope); // +8
            heart.OnEnter(s);
            Assert.AreEqual(65, s.Trust); // guarded
        }

        [Test]
        public void TheHeartSchedule_SplitsOnTrustFifty()
        {
            var schedule = Chapter1Schedule.Build();
            var warm = GameState.NewGame();
            warm.Day = 15;
            warm.Seg = Segment.Dawn;
            warm.Companion = "kavi";
            warm.Trust = 50;
            Assert.AreEqual("ev2_heart", EventScheduler.Due(warm, schedule));
            warm.Trust = 49;
            Assert.AreEqual("ev2_heart_low", EventScheduler.Due(warm, schedule));
            warm.Companion = null;
            Assert.AreEqual("ev2_coco", EventScheduler.Due(warm, schedule));
        }

        // ---- the king tide --------------------------------------------------------
        [Test]
        public void KingTide_UnfortifiedCamp_PaysInStoresAndSleep()
        {
            var s = GameState.NewGame();
            s.Food = 1;
            s.AddItem("rations", 2);
            var tide = Script.Get("ev2_kingtide");
            tide.OnEnter(s);
            Assert.AreEqual(0, s.Food);
            Assert.AreEqual(1, s.Count("rations"));
            Assert.AreEqual(77f, s.Stats.Energy); // -8
            Assert.AreEqual(52f, s.Stats.Hope);   // -3
            tide.OnEnter(s);
            Assert.AreEqual(1, s.Count("rations")); // guarded
        }

        [Test]
        public void BoarKing_IsOnTheCalendar_DaySevenDawn()
        {
            var s = GameState.NewGame();
            s.Day = 7;
            s.Seg = Segment.Dawn;
            Assert.AreEqual("ev2_boarking", EventScheduler.Due(s, Chapter1Schedule.Build()));
        }
    }
}
