using NUnit.Framework;
using Tidebound.Narrative;

namespace Tidebound.Tests
{
    /// <summary>Chapter Four session 1 — the turn, the escort, and the station, pinned to scenes-chapter4.js.</summary>
    public class Chapter4Tests
    {
        static StoryScript Script => Chapter1Encounters.Build();

        // ---- the chapter turn ------------------------------------------------
        [Test]
        public void ChapterThreeCard_ContinuesIntoChapterFour()
        {
            Assert.AreEqual("ch4_open", Script.Get("ch3_end").Next);
        }

        [Test]
        public void ChapterTurn_BranchesOnTheEast()
        {
            var open = Script.Get("ch4_open");
            var s = GameState.NewGame();
            s.Chapter = 3;
            open.OnEnter(s);
            Assert.AreEqual(4, s.Chapter);

            var go = open.AvailableChoices(s)[0].GoDynamic;
            Assert.AreEqual("ch4_west_offer", go(s)); // the toll refused: her offer
            s.SetFlag("EAST_OPEN");
            Assert.AreEqual("ch4_arrive", go(s));
        }

        [Test]
        public void EddasEscort_OpensTheEast()
        {
            var s = GameState.NewGame();
            s.Edda = 40;
            var cross = Script.Get("ch4_west_offer").AvailableChoices(s)[0];
            cross.Do(s);
            Assert.IsTrue(s.Is("GRIN_ESCORTED"));
            Assert.IsTrue(s.Is("EAST_OPEN"));
            Assert.AreEqual(45, s.Edda);
            Assert.AreEqual("ch4_escort", cross.Go);
            Assert.AreEqual("ch4_arrive", Script.Get("ch4_escort").Next);
        }

        [Test]
        public void StayingWest_LocksTheSeason()
        {
            var s = GameState.NewGame();
            var stay = Script.Get("ch4_west_offer").AvailableChoices(s)[1];
            stay.Do(s);
            Assert.IsTrue(s.Is("WEST_LOCKED"));
            Assert.AreEqual(1, s.Route.Roots);
            Assert.IsFalse(s.Is("EAST_OPEN"));
        }

        [Test]
        public void Arrival_OpensTheStationOnce()
        {
            var s = GameState.NewGame();
            var arrive = Script.Get("ch4_arrive");
            arrive.OnEnter(s);
            Assert.IsTrue(s.Is("STATION_OPENED"));
            Assert.AreEqual(1, s.Route.Depth);
            arrive.OnEnter(s);
            Assert.AreEqual(1, s.Route.Depth); // once
        }

        // ---- the station, one building at a time -----------------------------
        [Test]
        public void Station_OffersTheUnstrippedRooms()
        {
            var s = GameState.NewGame();
            s.SetFlag("STATION_OPENED");
            var options = Script.Get("station").AvailableChoices(s);
            // mess, Vane, radio, E wing, fuel, wire, home — staging not yet
            Assert.AreEqual(7, options.Count);

            s.SetFlag("STATION_MESS");
            s.EwingTry = s.Day; // beaten door doesn't re-ask today
            options = Script.Get("station").AvailableChoices(s);
            Assert.AreEqual(5, options.Count);
        }

        [Test]
        public void MessHall_PaysInStoresAndCostsALittleHope()
        {
            var s = GameState.NewGame();
            float hope = s.Stats.Hope;
            Script.Get("station_mess").OnEnter(s);
            Assert.IsTrue(s.Is("STATION_MESS"));
            Assert.AreEqual(2, s.Food);
            Assert.AreEqual(hope - 2, s.Stats.Hope);
        }

        [Test]
        public void VanesJournals_RationedInThreeStages()
        {
            var s = GameState.NewGame();
            var vane = Script.Get("station_vane");
            vane.OnEnter(s);
            Assert.IsTrue(s.Is("VANE_J1"));
            vane.OnEnter(s);
            Assert.IsTrue(s.Is("VANE_J2"));
            vane.OnEnter(s);
            Assert.IsTrue(s.Is("VANE_J3"));
            Assert.IsTrue(s.Is("DRAWER_KNOWN")); // burn unread
            Assert.AreEqual(3, s.Route.Depth);   // one per reading
        }

        [Test]
        public void EWing_DefeatsTheUnequipped_UntilTomorrow()
        {
            var s = GameState.NewGame();
            s.Day = 40;
            Script.Get("station_ewing").OnEnter(s);
            Assert.IsFalse(s.Is("E_WING_OPEN"));
            Assert.AreEqual(40, s.EwingTry);

            // the hub hides the door for the rest of the day
            s.SetFlag("STATION_OPENED");
            foreach (var c in Script.Get("station").AvailableChoices(s))
                Assert.AreNotEqual("station_ewing", c.Go);
        }

        [Test]
        public void EWing_OpensToTheEngineer_AndLinksTheGems()
        {
            var s = GameState.NewGame();
            s.SetFlag("BG_ENGINEER");
            s.AddItem("toolbox", 1);
            s.SetFlag("GEMS_MYSTERY");
            Script.Get("station_ewing").OnEnter(s);
            Assert.IsTrue(s.Is("E_WING_OPEN"));
            Assert.IsTrue(s.Is("TRANSMITTER"));
            Assert.IsTrue(s.Is("HEARTGLASS")); // the naming rule now knows the word
            Assert.IsTrue(s.Is("GEMS_LINKED"));
            Assert.AreEqual(2, s.Route.Depth);
        }

        [Test]
        public void TheList_FinishesIntoAStagedRadio()
        {
            var s = GameState.NewGame();
            s.SetFlag("STATION_OPENED");
            Script.Get("station_radio").OnEnter(s);
            Script.Get("station_fuel").OnEnter(s);
            Script.Get("station_wire").OnEnter(s);
            s.SetFlag("TRANSMITTER"); // the E wing's prize

            bool offered = false;
            foreach (var c in Script.Get("station").AvailableChoices(s))
                if (c.Go == "station_stage") offered = true;
            Assert.IsTrue(offered);

            float hope = s.Stats.Hope;
            Script.Get("station_stage").OnEnter(s);
            Assert.IsTrue(s.Is("RADIO_STAGED"));
            Assert.AreEqual(4, s.Route.Signal); // 2 survey + 2 staging
            Assert.AreEqual(hope + 6, s.Stats.Hope);
        }
    }
}
