using System.Collections.Generic;
using UnityEngine;

namespace Tidebound
{
    /// <summary>
    /// Being with the pig: share food (his native language), talk (he
    /// listens with his whole body), and lean back when he leans. One of
    /// each per segment; trust shows only as behavior. Law #3: he is "the
    /// bearded pig" until the courtship names him.
    /// </summary>
    public class BuriInteractable : Interactable
    {
        public BuriController controller;

        int _lastFed = -1;
        int _lastTalked = -1;
        int _lastLeaned = -1;

        public override string DisplayName =>
            GameManager.Instance != null && GameManager.Instance.State.Is("BURI_NAMED")
                ? "Buri"
                : "The bearded pig";

        public override bool IsAvailable(GameManager gm) =>
            controller != null && controller.IsActiveCompanion;

        public override void GetOptions(GameManager gm, List<InteractionOption> options)
        {
            var s = gm.State;
            var profile = CompanionLogic.ProfileFor(s.Tier);

            if (CompanionLogic.CanRepeat(_lastFed, s))
                options.Add(InteractionOption.Do("Share food",
                    "His native language, spoken fluently. Hunger −, trust grows.",
                    g =>
                    {
                        _lastFed = CompanionLogic.TotalSegment(g.State);
                        g.State.Bond(CompanionLogic.FeedBond);
                        g.State.Stat(Meter.Hunger, -4);
                        g.Toast("It vanishes in one biblical inhalation, and then he checks the empty stone twice, establishing the facts of the case. The tail helicopter renders the verdict.", ToastKind.Info);
                    }));
            else
                options.Add(InteractionOption.Locked("Share food",
                    "He's eaten his share this part of the day. He disagrees, but he's eaten it."));

            if (CompanionLogic.CanRepeat(_lastTalked, s))
                options.Add(InteractionOption.Do("Talk at him while you work",
                    "He listens with his whole body, which is a lot of listening.",
                    g =>
                    {
                        _lastTalked = CompanionLogic.TotalSegment(g.State);
                        g.State.Bond(CompanionLogic.TalkBond);
                        g.State.Stat(Meter.Hope, 1);
                        g.Toast("You narrate the day's plan and he grunts at the load-bearing points, a colleague signing off on the minutes.", ToastKind.Info);
                    }));

            if (!profile.AllowsTouch)
            {
                options.Add(InteractionOption.Locked("Lean on him",
                    "Not yet. He still files you under 'reliable caterer.'"));
            }
            else if (CompanionLogic.CanRepeat(_lastLeaned, s))
            {
                options.Add(InteractionOption.Do("Lean into the lean",
                    "He braces for it without looking. He counts on that.",
                    g =>
                    {
                        _lastLeaned = CompanionLogic.TotalSegment(g.State);
                        g.State.Bond(CompanionLogic.PetBond);
                        g.State.Stat(Meter.Hope, 2);
                        g.Toast("Two hundred pounds of warm freight settles against your hip, and for a minute the island holds still around the both of you.", ToastKind.Good);
                    }));
            }
        }
    }
}
