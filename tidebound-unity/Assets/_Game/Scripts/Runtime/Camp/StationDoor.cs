using System.Collections.Generic;

namespace Tidebound
{
    /// <summary>
    /// The gating truths of Station Halcyon's rooms, kept pure so the tests
    /// can hold them still: a door shows once the east is open and its room
    /// is unstripped; the E wing sulks until tomorrow after defeating you;
    /// the radio stages only when the whole list is finished.
    /// </summary>
    public static class StationPlace
    {
        public static bool DoorShows(GameState s, string doneFlag) =>
            s.Is("STATION_OPENED") && (string.IsNullOrEmpty(doneFlag) || !s.Is(doneFlag));

        /// <summary>The heavy door beat you today; it doesn't re-ask until tomorrow.</summary>
        public static bool EwingRestingToday(GameState s) =>
            !s.Is("E_WING_OPEN") && s.EwingTry == s.Day;

        public static bool StageReady(GameState s) =>
            s.Is("RADIO_SURVEYED") && s.Is("TRANSMITTER") && s.Is("WIRE") && s.Is("FUEL")
            && !s.Is("RADIO_STAGED");
    }

    /// <summary>
    /// A walk-up door on one of Station Halcyon's buildings: the same rooms
    /// the trailhead expedition reaches by menu (scenes-chapter4.js hub),
    /// entered in place. Each door plays its room's scene and spends the
    /// building's worth of daylight; stripped rooms go quiet. The compound
    /// answers to nobody until chapter 4 opens the east.
    /// </summary>
    public class StationDoor : Interactable
    {
        public string doorName = "A station door";
        public string optionLabel = "Go in";
        public string optionSub = "";
        public string sceneId = "";
        [UnityEngine.Tooltip("The flag that marks this room stripped; hides the door's option.")]
        public string doneFlag = "";
        [UnityEngine.Tooltip("The E wing's daily defeat: locked until tomorrow after a failed try.")]
        public bool ewingDayGate;
        [UnityEngine.Tooltip("The radio room also offers staging once the parts list is finished.")]
        public bool stageDoor;

        public override string DisplayName => doorName;

        public override bool IsAvailable(GameManager gm) =>
            StationPlace.DoorShows(gm.State, doneFlag)
            || (stageDoor && gm.State.Is("STATION_OPENED") && StationPlace.StageReady(gm.State));

        public override void GetOptions(GameManager gm, List<InteractionOption> options)
        {
            var s = gm.State;
            if (StationPlace.DoorShows(s, doneFlag))
            {
                if (ewingDayGate && StationPlace.EwingRestingToday(s))
                    options.Add(InteractionOption.Locked(optionLabel,
                        "It defeated you once today already. Tomorrow, with fresh ideas."));
                else
                    options.Add(InteractionOption.Do(optionLabel, optionSub,
                        g =>
                        {
                            g.State.Stat(Meter.Energy, -2);
                            g.VisitEdda(sceneId, 1);
                        }));
            }
            if (stageDoor && StationPlace.StageReady(s))
                options.Add(InteractionOption.Do("Stage the radio for assembly",
                    "Transmitter, cable, fuel: the list is finished. Set the room to rights.",
                    g => g.VisitEdda("station_stage", 1)));
        }
    }
}
