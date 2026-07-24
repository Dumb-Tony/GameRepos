using System.Collections.Generic;

namespace Tidebound
{
    /// <summary>
    /// The bay's freshwater trickle at the rocks — the one safe source on
    /// this beach. Risky water and boiling arrive with the river (Phase 4+,
    /// design/04's water table).
    /// </summary>
    public class WaterSource : Interactable
    {
        public override string DisplayName => "A freshwater trickle";

        public override void GetOptions(GameManager gm, List<InteractionOption> options)
        {
            options.Add(InteractionOption.Do("Drink",
                "Cold from the rock. Thirst ++.",
                g => g.Drink()));
            if (gm.State.Count("water") < gm.canteenCap)
                options.Add(InteractionOption.Do("Fill the canteen",
                    "Carried water is carried time. Drink it later, from the pack.",
                    g => g.FillCanteen()));
        }
    }
}
