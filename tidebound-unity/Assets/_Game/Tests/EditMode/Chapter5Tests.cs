using NUnit.Framework;
using Tidebound.Narrative;

namespace Tidebound.Tests
{
    /// <summary>Chapter Five — The Long Rain: the crucible's three plans, pinned to scenes-chapter5.js.</summary>
    public class Chapter5Tests
    {
        static StoryScript Script => Chapter1Encounters.Build();

        [Test]
        public void ChapterFourCard_ContinuesIntoTheLongRain()
        {
            Assert.AreEqual("ch5_open", Script.Get("ch4_end").Next);
        }

        [Test]
        public void TheSeason_CommitsToOnePlan()
        {
            var s = GameState.NewGame();
            s.Chapter = 4;
            var open = Script.Get("ch5_open");
            open.OnEnter(s);
            Assert.AreEqual(5, s.Chapter);
            Assert.IsTrue(s.IsMonsoon); // the drains turn monsoon by themselves

            var descent = open.AvailableChoices(s)[2];
            descent.Do(s);
            Assert.AreEqual("deep", s.Plan);
            Assert.IsTrue(s.Is("CH5_DEEP"));
            Assert.AreEqual(2, s.Route.Depth);
        }

        [Test]
        public void Countdown_AssemblyFindsTheWindowPlan()
        {
            var s = GameState.NewGame();
            s.SetFlag("RADIO_STAGED");
            s.SetFlag("RECORDER");
            Script.Get("ev5_sea1").OnEnter(s);
            Assert.IsTrue(s.Is("RADIO_DONE"));
            Assert.IsTrue(s.Is("WINDOW_PLAN")); // speak in the rests

            var vessel = GameState.NewGame(); // no staged radio: the hull instead
            Script.Get("ev5_sea1").OnEnter(vessel);
            Assert.IsTrue(vessel.Is("BOAT_PUSH"));
            Assert.IsFalse(vessel.Is("RADIO_DONE"));
        }

        [Test]
        public void Countdown_ContactThroughTheSkip()
        {
            var s = GameState.NewGame();
            s.SetFlag("RADIO_STAGED");
            s.SetFlag("PULSE2");
            Script.Get("ev5_sea1").OnEnter(s);
            float hope = s.Stats.Hope;
            Script.Get("ev5_sea3").OnEnter(s);
            Assert.IsTrue(s.Is("CONTACT_MADE")); // four seconds of the world
            Assert.AreEqual(hope + 10, s.Stats.Hope);

            var lane = GameState.NewGame(); // vessel path: the traffic report
            Script.Get("ev5_sea3").OnEnter(lane);
            Assert.IsTrue(lane.Is("LANE_SEEN"));
            Assert.IsFalse(lane.Is("CONTACT_MADE"));
        }

        [Test]
        public void Homestead_PlantsAndAnswersTheFlood()
        {
            var s = GameState.NewGame();
            Script.Get("ev5_home1").OnEnter(s);
            Assert.IsTrue(s.Is("FARM"));
            Assert.AreEqual(3, s.Route.Roots);

            var flood = Script.Get("ev5_home2");
            flood.OnEnter(s);
            var dike = flood.AvailableChoices(s)[0];
            dike.Do(s);
            Assert.IsTrue(s.Is("FLOOD_DIKED"));
            Assert.AreEqual("ev5_home2_diked", dike.Go);
        }

        [Test]
        public void Homestead_TheStarvingKing()
        {
            var s = GameState.NewGame();
            s.Food = 4;
            var king = Script.Get("ev5_home3");
            var feed = king.AvailableChoices(s)[0];
            feed.Do(s);
            Assert.IsTrue(s.Is("KING_FED"));
            Assert.IsTrue(s.Is("KING_ALLY"));
            Assert.AreEqual(2, s.Food);

            var refuse = GameState.NewGame();
            king.AvailableChoices(refuse)[1].Do(refuse);
            Assert.IsTrue(refuse.Is("KING_REFUSED"));
            Assert.IsFalse(refuse.Is("KING_ALLY"));
        }

        [Test]
        public void Descent_ThreeLullsToTheWatcher()
        {
            var s = GameState.NewGame();
            Assert.AreEqual("ev5_deep1", Script.Get("ev5_way1").Next);
            Script.Get("ev5_deep1").OnEnter(s);
            Assert.IsTrue(s.Is("GULLET1"));
            Assert.AreEqual(3, s.Route.Depth);

            Script.Get("ev5_deep2").OnEnter(s);
            Assert.IsTrue(s.Is("SUNDERING_SEEN")); // they went in

            Script.Get("ev5_deep3").OnEnter(s);
            Assert.IsTrue(s.Is("NAIA_MET"));
            Assert.IsTrue(s.Is("WOUND_SEEN"));
        }

        [Test]
        public void DeepGreed_TheGambleAndTheCollection()
        {
            var greedy = GameState.NewGame();
            Script.Get("ev5_deep2").OnEnter(greedy);
            var press = Script.Get("ev5_deep2").AvailableChoices(greedy)[1];

            Chapter5Events.Rng = () => 0.9f; // the sea is slow today
            press.Do(greedy);
            Assert.IsTrue(greedy.Is("HEARTGLASS"));
            Assert.IsTrue(greedy.Is("DEEP_GREED_PAID"));
            Assert.AreEqual("ch5_deepgreed", press.GoDynamic(greedy));

            var unlucky = GameState.NewGame();
            Script.Get("ev5_deep2").OnEnter(unlucky);
            Chapter5Events.Rng = () => 0.1f; // she was not
            press.Do(unlucky);
            Assert.AreEqual("dark", unlucky.DeathCause);
            Assert.IsNull(press.GoDynamic(unlucky));
            Chapter5Events.Rng = () => UnityEngine.Random.value;
        }

        [Test]
        public void EddasSeason_SheTreatsHerVisitorFirst()
        {
            var s = GameState.NewGame();
            s.Disease = "fever";
            var edda = Script.Get("ev5_edda");
            edda.OnEnter(s);
            Assert.IsTrue(s.Is("EDDA_ILL"));
            Assert.IsNull(s.Disease); // the patient is still the doctor
            Assert.IsTrue(s.Is("EDDA_CURED_YOU"));

            var down = edda.AvailableChoices(s)[0];
            down.Do(s);
            Assert.IsTrue(s.Is("EDDA_WINTER"));
        }

        [Test]
        public void Finale_AnswersItsOwnPlan()
        {
            var sea = GameState.NewGame();
            sea.Plan = "sea";
            Assert.AreEqual(2, Script.Get("ch5_finale").AvailableChoices(sea).Count);

            var home = GameState.NewGame();
            home.Plan = "home";
            var names = Script.Get("ch5_finale").AvailableChoices(home);
            Assert.AreEqual(3, names.Count);
            names[0].Do(home);
            Assert.IsTrue(home.Is("NAME_ROOTSTEAD"));
            Assert.IsTrue(home.Is("CH5_DONE"));

            var deep = GameState.NewGame();
            deep.Plan = "deep";
            var offers = Script.Get("ch5_finale").AvailableChoices(deep);
            Assert.AreEqual(2, offers.Count);
            offers[0].Do(deep);
            Assert.IsTrue(deep.Is("INNER_INVITED"));
        }

        [Test]
        public void Schedule_RunsTheVariantSpine()
        {
            var schedule = Chapter1Schedule.Build();
            var s = GameState.NewGame();
            s.Plan = "deep";

            s.Day = 56; s.Seg = Segment.Dusk;
            Assert.AreEqual("ev5_way1", EventScheduler.Due(s, schedule));
            s.Day = 58; s.Seg = Segment.Night;
            Assert.AreEqual("ev5_cyclone", EventScheduler.Due(s, schedule));
            s.Day = 63; s.Seg = Segment.Dawn;
            Assert.AreEqual("ev5_edda", EventScheduler.Due(s, schedule));
            s.Day = 69; s.Seg = Segment.Dusk;
            Assert.AreEqual("ch5_finale", EventScheduler.Due(s, schedule));

            s.Plan = "home";
            s.Day = 66; s.Seg = Segment.Dusk;
            Assert.AreEqual("ev5_home3", EventScheduler.Due(s, schedule));
        }
    }
}
