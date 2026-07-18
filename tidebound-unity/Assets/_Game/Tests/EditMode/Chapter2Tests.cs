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

        // ---- day 9: the stick on the woodpile --------------------------------
        [Test]
        public void TheBond_AndTheSoloKnot_PinnedOnceEach()
        {
            var bond = GameState.NewGame();
            bond.Companion = "kavi";
            bond.Trust = 30;
            var scene = Script.Get("ev2_bond");
            scene.OnEnter(bond);
            Assert.AreEqual(34, bond.Trust);       // +4
            Assert.AreEqual(58f, bond.Stats.Hope); // +3
            scene.OnEnter(bond);
            Assert.AreEqual(34, bond.Trust); // guarded

            var solo = GameState.NewGame();
            Script.Get("ev2_solo").OnEnter(solo);
            Assert.AreEqual(57f, solo.Stats.Hope);
            Assert.AreEqual(1, solo.Route.Roots);
        }

        // ---- day 11: the first storm -------------------------------------------
        [Test]
        public void Storm_TheKaviChoice_OnlyExistsWithKavi()
        {
            var alone = GameState.NewGame();
            Assert.AreEqual(2, Script.Get("ev2_storm").AvailableChoices(alone).Count);

            var together = GameState.NewGame();
            together.Companion = "kavi";
            var choices = Script.Get("ev2_storm").AvailableChoices(together);
            Assert.AreEqual(3, choices.Count);
            choices[2].Do(together);
            Assert.IsTrue(together.Is("STORM_COMPANION"));
            Assert.AreEqual(6, together.Trust); // things can be rebuilt
        }

        [Test]
        public void Storm_UnsavedFireDrowns_UnsavedStoresScatter()
        {
            var s = GameState.NewGame();
            s.Fire = 1;
            s.FireFuel = 3f;
            s.Food = 2;
            s.AddItem("rations", 1);
            s.SetFlag("STORM_COMPANION"); // saved the dog, not the camp
            var storm2 = Script.Get("ev2_storm2");
            storm2.OnEnter(s);
            Assert.AreEqual(0, s.Fire);
            Assert.IsTrue(s.Is("FIRE_DROWNED2"));
            Assert.AreEqual(1, s.Food);
            Assert.IsFalse(s.Has("rations"));
            Assert.AreEqual(73f, s.Stats.Energy); // -12, no real walls
            Assert.AreEqual(50f, s.Stats.Hope);   // -5
            Assert.AreEqual(95f, s.Stats.Health); // -5
            storm2.OnEnter(s);
            Assert.AreEqual(1, s.Food); // guarded
        }

        [Test]
        public void Storm_KeepingTheFire_TestsKavi()
        {
            var s = GameState.NewGame();
            s.Companion = "kavi";
            s.Fire = 1;
            s.SetFlag("STORM_FIRE");
            Script.Get("ev2_storm2").OnEnter(s);
            Assert.AreEqual(1, s.Fire); // the ember lives
            Assert.IsTrue(s.Is("KAVI_FIRE_TEST"));
        }

        // ---- day 18: the threshold ------------------------------------------------
        [Test]
        public void Threshold_ThreeRoads_EachWriteTheirFlags()
        {
            var now = GameState.NewGame();
            var scene = Script.Get("ch2_threshold");
            var c = scene.AvailableChoices(now);
            c[0].Do(now);
            Assert.IsTrue(now.Is("SMOKE_NOW"));
            Assert.AreEqual(2, now.Route.Depth);
            Assert.AreEqual("ch2_end_trek", c[0].Go);

            var later = GameState.NewGame();
            scene.AvailableChoices(later)[1].Do(later);
            Assert.IsTrue(later.Is("SMOKE_LATER"));
            Assert.AreEqual(2, later.Route.Roots);

            var ignored = GameState.NewGame();
            scene.AvailableChoices(ignored)[2].Do(ignored);
            Assert.IsTrue(ignored.Is("SMOKE_IGNORED"));
            Assert.AreEqual(2, ignored.Route.Signal);
        }

        [Test]
        public void TheChapterEndCard_RemembersEveryThread()
        {
            var s = GameState.NewGame();
            s.Companion = "kavi";
            s.Trust = 55; // Warming → "bonded to you" band per the VN's five words
            s.SetFlag("HEART1_DONE");
            s.SetFlag("KING_TITHED");
            s.SetFlag("KAVI_FIRE_TEST");
            s.SetFlag("SMOKE_NOW");
            var text = string.Join("\n", Script.Get("ch2_end").Text(s));
            StringAssert.Contains("FOOTHOLD", text);
            StringAssert.Contains("Kavi the island dog", text);
            StringAssert.Contains("fifteenth morning", text);
            StringAssert.Contains("accepts your tribute", text);
            StringAssert.Contains("inside his own fear", text);
            StringAssert.Contains("shotgun that never quite lowered", text);
        }

        [Test]
        public void TheThreshold_IsOnTheCalendar_DayEighteenDusk()
        {
            var s = GameState.NewGame();
            s.Day = 18;
            s.Seg = Segment.Dusk;
            Assert.AreEqual("ch2_threshold", EventScheduler.Due(s, Chapter1Schedule.Build()));
            s.Day = 11;
            Assert.AreEqual("ev2_storm", EventScheduler.Due(s, Chapter1Schedule.Build()));
        }
    }
}
