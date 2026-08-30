using System.Collections.Generic;
using Tidebound.Narrative;

namespace Tidebound
{
    /// <summary>
    /// Edda at her fence — the grove hub scene (scenes-chapter3.js 'grove')
    /// as a place you walk to. Options surface by priority (the prompt holds
    /// three): the sick get the cure first, the hurt get the wound seen to,
    /// and the well get her work, her plants, and — as regard earns it —
    /// her story, the stones' names, and the two mounds under the tree.
    /// Talks are free (the trek was the cost); labors charge segments.
    /// </summary>
    public class EddaInteractable : Interactable
    {
        public override string DisplayName => "Edda Voss";

        public override bool IsAvailable(GameManager gm) =>
            gm.State.Is("EDDA_MET") && gm.State.Is("GROVE_OPENED");

        public override void GetOptions(GameManager gm, List<InteractionOption> options)
        {
            var s = gm.State;

            if (s.Disease == "fever")
                options.Add(InteractionOption.Do("Ask for the cure",
                    "Feverbark, and no pride about it. Takes hours.",
                    g => g.VisitEdda("grove_cure", 1)));

            if (s.Injury != null)
                options.Add(InteractionOption.Do("Let her see to the wound",
                    "Sixty years of island medicine, and no bedside manner whatsoever.",
                    g => g.VisitEdda("grove_wound", 1)));

            options.Add(InteractionOption.Do("Work the terraces with her",
                "Earn with your back. She pays in food and thaw. Costs a stretch of the day.",
                g => g.VisitEdda("grove_work", 1)));

            if (options.Count < 3)
                options.Add(InteractionOption.Do("Learn her plants",
                    "The pharmacopoeia of sixty years. Some of it is life and death.",
                    g => g.VisitEdda("grove_plants")));

            if (options.Count < 3 && s.Has("case") && s.Edda >= 35 && !s.Is("CASE_EDDA"))
                options.Add(InteractionOption.Do("Show her the courier's case",
                    "She has been on this island sixty years. Maybe she's seen its like.",
                    g => g.VisitEdda("grove_case")));

            if (options.Count < 3 && s.Is("GEMS") && !CaseArc.KnowsGlass(s))
                options.Add(InteractionOption.Do("Show her the courier's cut stones",
                    "A dozen gems that hold your lamplight a half-beat too long.",
                    g => g.VisitEdda("grove_gems", 1)));

            if (options.Count < 3 && s.Edda >= 50 && !s.Is("EDDA_GRAVES"))
                options.Add(InteractionOption.Do("Ask about the two mounds under the flowering tree",
                    "Gently. You've waited to have the right to ask.",
                    g => g.VisitEdda("grove_graves")));

            if (options.Count < 3 && !s.Is("LORE_HALCYON"))
                options.Add(InteractionOption.Do("Ask about the island",
                    "The stones, the spiral, the ones who left. Every visit, she lets go of a little more.",
                    g => g.VisitEdda("grove_lore")));
        }
    }
}
