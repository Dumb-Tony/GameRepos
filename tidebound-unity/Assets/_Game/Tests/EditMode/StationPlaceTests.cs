using NUnit.Framework;
using Tidebound.Narrative;

namespace Tidebound.Tests
{
    /// <summary>Station Halcyon as a walkable place: every hub room has its
    /// scene, and the walk-up doors keep the hub's exact gating truths.</summary>
    public class StationPlaceTests
    {
        static StoryScript Script => Chapter1Encounters.Build();

        [Test]
        public void EveryStationRoom_HasItsScene()
        {
            foreach (var id in new[]
                     {
                         "station", "station_mess", "station_vane", "station_radio",
                         "station_ewing", "station_fuel", "station_wire", "station_stage",
                     })
                Assert.IsTrue(Script.Has(id), id);
        }

        [Test]
        public void Doors_StaySilentUntilTheEastOpens()
        {
            var s = GameState.NewGame();
            Assert.IsFalse(StationPlace.DoorShows(s, "STATION_MESS"));
            s.SetFlag("STATION_OPENED");
            Assert.IsTrue(StationPlace.DoorShows(s, "STATION_MESS"));
        }

        [Test]
        public void Doors_RetireWithTheirRooms()
        {
            var s = GameState.NewGame();
            s.SetFlag("STATION_OPENED");
            Assert.IsTrue(StationPlace.DoorShows(s, "WIRE"));
            s.SetFlag("WIRE");
            Assert.IsFalse(StationPlace.DoorShows(s, "WIRE"));
        }

        [Test]
        public void TheEWing_SulksUntilTomorrowAfterADefeat()
        {
            var s = GameState.NewGame();
            s.SetFlag("STATION_OPENED");
            s.Day = 44;
            Assert.IsFalse(StationPlace.EwingRestingToday(s));
            s.EwingTry = 44; // the door won today
            Assert.IsTrue(StationPlace.EwingRestingToday(s));
            s.Day = 45; // fresh ideas
            Assert.IsFalse(StationPlace.EwingRestingToday(s));
            s.SetFlag("E_WING_OPEN"); // an opened door never sulks
            s.EwingTry = 45;
            Assert.IsFalse(StationPlace.EwingRestingToday(s));
        }

        [Test]
        public void Staging_WaitsForTheWholeList()
        {
            var s = GameState.NewGame();
            s.SetFlag("STATION_OPENED");
            Assert.IsFalse(StationPlace.StageReady(s));
            s.SetFlag("RADIO_SURVEYED");
            s.SetFlag("TRANSMITTER");
            s.SetFlag("WIRE");
            Assert.IsFalse(StationPlace.StageReady(s)); // fuel still missing
            s.SetFlag("FUEL");
            Assert.IsTrue(StationPlace.StageReady(s));
            s.SetFlag("RADIO_STAGED");
            Assert.IsFalse(StationPlace.StageReady(s)); // done is done
        }
    }
}
