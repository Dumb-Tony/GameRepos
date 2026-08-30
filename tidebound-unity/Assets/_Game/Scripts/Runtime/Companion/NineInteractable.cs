using System.Collections.Generic;
using UnityEngine;

namespace Tidebound
{
    /// <summary>
    /// Being with the octopus: bring a live crab (she wants the hunt), give
    /// her your full attention (affection, for her, IS attention — she
    /// watches and copies), and offer your wrist once the profile allows
    /// touch: she reads you like a letter. One of each per segment. Law #3:
    /// she is "the octopus" until the courtship names her — and tracing the
    /// spiral back names nothing, in her own language.
    /// </summary>
    public class NineInteractable : Interactable
    {
        public NineController controller;

        int _lastFed = -1;
        int _lastWatched = -1;
        int _lastRead = -1;

        public override string DisplayName =>
            GameManager.Instance != null && GameManager.Instance.State.Is("NINE_NAMED")
                ? "Nine"
                : "The octopus";

        public override bool IsAvailable(GameManager gm) =>
            controller != null && controller.IsActiveCompanion;

        public override void GetOptions(GameManager gm, List<InteractionOption> options)
        {
            var s = gm.State;
            var profile = CompanionLogic.ProfileFor(s.Tier);

            if (CompanionLogic.CanRepeat(_lastFed, s))
                options.Add(InteractionOption.Do("Bring a live crab",
                    "Live — she wants the hunt. The brief, expert, upsetting demonstration is included.",
                    g =>
                    {
                        _lastFed = CompanionLogic.TotalSegment(g.State);
                        g.State.Bond(CompanionLogic.FeedBond);
                        g.State.Stat(Meter.Hunger, -2);
                        g.Toast("She takes the crab the way she does everything: as a correction to your assumptions about matter. Meal concluded, one slotted eye stays on you a beat longer than commerce requires.", ToastKind.Info);
                    }));
            else
                options.Add(InteractionOption.Locked("Bring a live crab",
                    "The pool has eaten this part of the day. She hunts her own hours; so should you."));

            if (CompanionLogic.CanRepeat(_lastWatched, s))
                options.Add(InteractionOption.Do("Watch, and be watched",
                    "Affection, for her, is attention. She copies what you do. She has been studying.",
                    g =>
                    {
                        _lastWatched = CompanionLogic.TotalSegment(g.State);
                        g.State.Bond(CompanionLogic.TalkBond);
                        g.State.Stat(Meter.Hope, 1);
                        g.Toast("You work at the pool's edge and she watches with one slotted eye, and copies — a knot, a gesture, the way you sort what you carry. Somewhere under the glitter, minutes are being taken.", ToastKind.Info);
                    }));

            if (!profile.AllowsTouch)
            {
                options.Add(InteractionOption.Locked("Offer your wrist",
                    "Not yet. She reads by touch, and she has not yet decided you are worth the reading."));
            }
            else if (CompanionLogic.CanRepeat(_lastRead, s))
            {
                options.Add(InteractionOption.Do("Offer your wrist",
                    "She reads the world by touch. What it feels like is being read.",
                    g =>
                    {
                        _lastRead = CompanionLogic.TotalSegment(g.State);
                        g.State.Bond(CompanionLogic.PetBond);
                        g.State.Stat(Meter.Hope, 2);
                        g.Toast("She takes your wrist — gently, thoroughly, reading — and today she doesn't let go when she's done. You stay until the tide asks you to leave.", ToastKind.Good);
                    }));
            }
        }
    }
}
