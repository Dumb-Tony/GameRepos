using System.Collections.Generic;

namespace Tidebound
{
    /// <summary>
    /// The east bank past Old Grin's channel: the swallowed service road up
    /// to Station Halcyon. An expedition costs part of a day, one building
    /// at a time (scenes-chapter4.js hub action); it retires when the
    /// station is stripped — the Wayfinder's station region covers returns.
    /// </summary>
    public class StationTrailhead : Interactable
    {
        static bool StationDone(GameState s) =>
            s.Is("STATION_MESS") && s.Is("VANE_J3") && s.Is("RADIO_SURVEYED") &&
            s.Is("E_WING_OPEN") && s.Is("FUEL") && s.Is("WIRE") && s.Is("RADIO_STAGED");

        public override string DisplayName => "The swallowed service road";

        public override bool IsAvailable(GameManager gm) =>
            gm.State.Is("STATION_OPENED") && !StationDone(gm.State);

        public override void GetOptions(GameManager gm, List<InteractionOption> options)
        {
            options.Add(InteractionOption.Do("Expedition to Station Halcyon",
                "The crossing, the rise, and one building's worth of daylight. Energy −.",
                g =>
                {
                    g.State.Stat(Meter.Energy, -6);
                    g.VisitEdda("station", 1);
                }));
        }
    }
}
