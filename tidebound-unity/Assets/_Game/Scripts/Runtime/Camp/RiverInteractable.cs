using System.Collections.Generic;

namespace Tidebound
{
    /// <summary>
    /// The Silverthread's bank. Unnamed and inert until ev3_river names it
    /// (law #3); after that, the island's artery — the daily water tax dies
    /// here. Numbers are the VN's ch3 hub action.
    /// </summary>
    public class RiverInteractable : Interactable
    {
        public override string DisplayName =>
            GameManager.Instance != null && GameManager.Instance.State.Is("RIVER_KNOWN")
                ? "The Silverthread"
                : "Running water";

        public override bool IsAvailable(GameManager gm) => gm.State.Is("RIVER_KNOWN");

        public override void GetOptions(GameManager gm, List<InteractionOption> options)
        {
            options.Add(InteractionOption.Do("Haul water",
                "Cold, clean, and endless. Thirst ++, health +. Costs a stretch of the day.",
                g => g.HaulRiverWater()));
            if (gm.State.Count("water") < gm.canteenCap)
                options.Add(InteractionOption.Do("Fill the canteen",
                    "The artery, bottled. Drink it later, from the pack.",
                    g => g.FillCanteen()));
        }
    }
}
