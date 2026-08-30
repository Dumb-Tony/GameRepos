using System.Collections.Generic;
using UnityEngine;

namespace Tidebound
{
    /// <summary>
    /// A one-shot point of quiet lore — a glyph stone, a wallow, a cairn.
    /// Reading it sets a flag, feeds Depth, and speaks its prose once.
    /// Law #3: the display name stays descriptive.
    /// </summary>
    public class LoreStone : Interactable
    {
        public string displayName = "A standing stone";
        public string optionLabel = "Look closer";
        public string optionSub = "";
        public string flag = "GLYPH_1";
        [TextArea] public string prose = "";
        public int depthRoute = 1;

        public override string DisplayName => displayName;

        public override bool IsAvailable(GameManager gm) => !gm.State.Is(flag);

        public override void GetOptions(GameManager gm, List<InteractionOption> options)
        {
            options.Add(InteractionOption.Do(optionLabel, optionSub, g =>
            {
                g.State.SetFlag(flag);
                g.State.AddRoute(RouteAxis.Depth, depthRoute);
                g.Toast(prose, ToastKind.Info);
                g.SaveNow();
            }));
        }
    }
}
