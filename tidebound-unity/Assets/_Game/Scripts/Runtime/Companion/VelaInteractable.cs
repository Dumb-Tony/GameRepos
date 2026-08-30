using System.Collections.Generic;
using UnityEngine;

namespace Tidebound
{
    /// <summary>
    /// Being with the sea eagle: lay a fish on the high rock, stand in the
    /// open and expect nothing (the entire etiquette), and — only at the very
    /// end of her arc, because the writing never lets her become a pet — the
    /// one permitted touch. One of each per segment. Law #3: she is "the sea
    /// eagle" until the courtship names her — and her second courtship choice
    /// names nothing at all, which she'd call correct.
    /// </summary>
    public class VelaInteractable : Interactable
    {
        public VelaController controller;

        int _lastFed = -1;
        int _lastTalked = -1;
        int _lastTouched = -1;

        public override string DisplayName =>
            GameManager.Instance != null && GameManager.Instance.State.Is("VELA_NAMED")
                ? "Vela"
                : "The sea eagle";

        public override bool IsAvailable(GameManager gm) =>
            controller != null && controller.IsActiveCompanion;

        public override void GetOptions(GameManager gm, List<InteractionOption> options)
        {
            var s = gm.State;

            if (CompanionLogic.CanRepeat(_lastFed, s))
                options.Add(InteractionOption.Do("Lay a fish on the high rock",
                    "Whole, untouched, ten paces back. Feed the account; let the books speak.",
                    g =>
                    {
                        _lastFed = CompanionLogic.TotalSegment(g.State);
                        g.State.Bond(CompanionLogic.FeedBond);
                        g.State.Stat(Meter.Hunger, -3);
                        g.Toast("She makes you wait long enough to establish that waiting is happening, then drops in one silent falling arc and eats — never once taking the amber eye off you. Payment received. Books balanced.", ToastKind.Info);
                    }));
            else
                options.Add(InteractionOption.Locked("Lay a fish on the high rock",
                    "The account has been fed this part of the day. She does not extend hours."));

            if (CompanionLogic.CanRepeat(_lastTalked, s))
                options.Add(InteractionOption.Do("Stand in the open with her",
                    "Empty-handed, in plain view, expecting nothing. The entire etiquette.",
                    g =>
                    {
                        _lastTalked = CompanionLogic.TotalSegment(g.State);
                        g.State.Bond(CompanionLogic.TalkBond);
                        g.State.Stat(Meter.Hope, 1);
                        g.Toast(g.State.Tier >= TrustTier.Bonded
                            ? "She sidles along the rock and turns her head to study you with the pale eye — the blind one, the one she shows nothing. The most reluctant gift on earth, offered again."
                            : "She regards you from the high wood with one fierce amber eye. Not a beggar's look. An accountant's. You are, you understand, being carried on the books — provisionally, pending review.", ToastKind.Info);
                    }));

            if (s.Tier < TrustTier.Kindred)
            {
                options.Add(InteractionOption.Locked("Reach for her",
                    "No. She is not a pet, and she has never once let you forget it. Whatever birds keep instead of love, it is not held in the hand."));
            }
            else if (CompanionLogic.CanRepeat(_lastTouched, s))
            {
                options.Add(InteractionOption.Do("Reach for her",
                    "The impossible thing, permitted at last — for exactly as long as she allows.",
                    g =>
                    {
                        _lastTouched = CompanionLogic.TotalSegment(g.State);
                        g.State.Bond(CompanionLogic.PetBond);
                        g.State.Stat(Meter.Hope, 2);
                        g.Toast("She steps close — closer than transaction — and presses her wind-cold head once against your jaw. One second. Two. Then she's three feet away tidying a wing like nothing occurred, and you both know better than to remark on it.", ToastKind.Good);
                    }));
            }
        }
    }
}
