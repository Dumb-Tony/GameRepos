using System.Collections.Generic;
using UnityEngine;

namespace Tidebound
{
    /// <summary>
    /// Being with the macaque: share the fig ration, be the audience (his
    /// actual currency — he never wanted your food; he wanted a front row),
    /// and sit for grooming once the profile allows touch, because grooming
    /// is not payment among his kind. It is membership. One of each per
    /// segment. Law #3: he is "the macaque" until the courtship names him —
    /// and the professional's salute names nothing.
    /// </summary>
    public class IpoInteractable : Interactable
    {
        public IpoController controller;

        int _lastFed = -1;
        int _lastShow = -1;
        int _lastGroomed = -1;

        public override string DisplayName =>
            GameManager.Instance != null && GameManager.Instance.State.Is("IPO_NAMED")
                ? "Ipo"
                : "The macaque";

        public override bool IsAvailable(GameManager gm) =>
            controller != null && controller.IsActiveCompanion;

        public override void GetOptions(GameManager gm, List<InteractionOption> options)
        {
            var s = gm.State;
            var profile = CompanionLogic.ProfileFor(s.Tier);

            if (CompanionLogic.CanRepeat(_lastFed, s))
                options.Add(InteractionOption.Do("Share the fig ration",
                    "Crabs, figs, anything stolen. He prefers the last category, but will forgive provenance.",
                    g =>
                    {
                        _lastFed = CompanionLogic.TotalSegment(g.State);
                        g.State.Bond(CompanionLogic.FeedBond);
                        g.State.Stat(Meter.Hunger, -2);
                        g.Toast("He accepts the fig with the weary grace of a star taking a modest fee, eats half, and hides the rest somewhere on your own person for later. You will find it. Eventually.", ToastKind.Info);
                    }));
            else
                options.Add(InteractionOption.Locked("Share the fig ration",
                    "He's been paid this part of the day. His rider is strict about over-feeding the talent."));

            if (CompanionLogic.CanRepeat(_lastShow, s))
                options.Add(InteractionOption.Do("Take the front row",
                    "He doesn't want food from you. He wants an audience. He has always wanted an audience.",
                    g =>
                    {
                        _lastShow = CompanionLogic.TotalSegment(g.State);
                        g.State.Bond(CompanionLogic.TalkBond);
                        g.State.Stat(Meter.Hope, 2);
                        g.Toast("The repertoire runs long today: the hanging-by-one-foot bit, the coconut impression, one entirely new piece about a crab. You laugh where laughing is due, and the sound of it does something visible to him, like sun on a plant.", ToastKind.Info);
                    }));

            if (!profile.AllowsTouch)
            {
                options.Add(InteractionOption.Locked("Sit for grooming",
                    "Not yet. Membership is not sold at the door; it is conferred."));
            }
            else if (CompanionLogic.CanRepeat(_lastGroomed, s))
            {
                options.Add(InteractionOption.Do("Sit for grooming",
                    "Terrible tenderness, total concentration, and the paperwork finished on your scalp.",
                    g =>
                    {
                        _lastGroomed = CompanionLogic.TotalSegment(g.State);
                        g.State.Bond(CompanionLogic.PetBond);
                        g.State.Stat(Meter.Hope, 2);
                        g.Toast("He takes your ear in one hand for security and grooms your hair strand by strand, finding you acceptable. Grooming is not payment among his kind. It is membership. You sit very still, absurdly moved.", ToastKind.Good);
                    }));
            }
        }
    }
}
