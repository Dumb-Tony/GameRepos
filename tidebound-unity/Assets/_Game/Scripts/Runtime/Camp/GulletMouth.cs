using System.Collections.Generic;

namespace Tidebound
{
    /// <summary>
    /// The grotto behind the waterfall, upstream where the Silverthread comes
    /// out of the mountain's shadow: the island's throat, and the one door in
    /// the game the TIDE owns. Reading the water always works; stepping
    /// through the gap only at slack; and the descents themselves stay the
    /// story's — the world holds the door, chapter five walks you down it.
    /// </summary>
    public class GulletMouth : Interactable
    {
        public override string DisplayName =>
            GameManager.Instance != null && GameManager.Instance.State.Is("GULLET_SEEN")
                ? "The Gullet's mouth"
                : "A gap behind the waterfall";

        public override void GetOptions(GameManager gm, List<InteractionOption> options)
        {
            var s = gm.State;

            options.Add(InteractionOption.Do("Read the water",
                "The grotto breathes. Slow, wet, seven to the exhale — and it tells you what it will allow.",
                g =>
                {
                    if (!g.State.Is("GULLET_WATCHED"))
                    {
                        g.State.SetFlag("GULLET_WATCHED");
                        g.State.AddRoute(RouteAxis.Depth, 1);
                    }
                    g.Toast(Gullet.WaterReading(g.State), ToastKind.Info);
                }));

            if (Gullet.MouthOpen(s))
                options.Add(InteractionOption.Do("Step through the gap",
                    Gullet.DeepRoadOpen(s)
                        ? "Slack water on a season-lull: the road goes all the way down today."
                        : "As far as the first galleries, and no further. Mark your high water and come back up.",
                    g =>
                    {
                        bool first = !g.State.Is("GULLET_SEEN");
                        g.State.SetFlag("GULLET_SEEN");
                        g.State.AddRoute(RouteAxis.Depth, first ? 2 : 1);
                        g.State.Stat(Meter.Energy, -6);
                        g.Toast(first
                            ? "You go through the falling water into a drowned world sea-smoothed a hundred feet above the sea, and everywhere in the black rock — veins and lenses of heartglass, catching your lamp and returning it a half-beat late, so that you walk in a crowd of your own delayed reflections. You mark your high water in chalk like a debt, and climb out with the surge already talking behind you."
                            : "You go in as far as your chalk allows, add a mark, and listen to the galleries boom with the far surge like a held word. The throat knows you were here.", ToastKind.Good);
                        if (g.clock != null) g.clock.SpendSegments(1f);
                        g.SaveNow();
                    }));
            else
                options.Add(InteractionOption.Locked("Step through the gap",
                    "The throat is full. The gap is a mouth underwater, and the surge is not negotiating. The tide turns twice a day."));
        }
    }
}
