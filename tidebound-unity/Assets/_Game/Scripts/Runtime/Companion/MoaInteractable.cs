using System.Collections.Generic;
using UnityEngine;

namespace Tidebound
{
    /// <summary>
    /// Being with the hen: scatter grubs, receive the briefing, and — once
    /// the perimeter has contracted to you personally — gather her in. One
    /// of each per segment; trust shows only as behavior. Law #3: she is
    /// "the copper hen" until the courtship names her.
    /// </summary>
    public class MoaInteractable : Interactable
    {
        public MoaController controller;

        int _lastFed = -1;
        int _lastTalked = -1;
        int _lastGathered = -1;

        public override string DisplayName =>
            GameManager.Instance != null && GameManager.Instance.State.Is("MOA_NAMED")
                ? "Moa"
                : "The copper hen";

        public override bool IsAvailable(GameManager gm) =>
            controller != null && controller.IsActiveCompanion;

        public override void GetOptions(GameManager gm, List<InteractionOption> options)
        {
            var s = gm.State;
            var profile = CompanionLogic.ProfileFor(s.Tier);

            if (CompanionLogic.CanRepeat(_lastFed, s))
                options.Add(InteractionOption.Do("Scatter grubs",
                    "A little nearer each time. Trust grows the slow way, which is the only way.",
                    g =>
                    {
                        _lastFed = CompanionLogic.TotalSegment(g.State);
                        g.State.Bond(CompanionLogic.FeedBond);
                        g.State.Stat(Meter.Hunger, -2);
                        g.Toast("She shuttles between the fern-shadow and the food, wound like a spring — and every time, she comes back. That is the whole of her.", ToastKind.Info);
                    }));
            else
                options.Add(InteractionOption.Locked("Scatter grubs",
                    "She's been fed this part of the day. The ration book is strict; she'd approve."));

            if (CompanionLogic.CanRepeat(_lastTalked, s))
                options.Add(InteractionOption.Do("Receive the briefing",
                    "A low running commentary as she patrols. Attendance is assumed.",
                    g =>
                    {
                        _lastTalked = CompanionLogic.TotalSegment(g.State);
                        g.State.Bond(CompanionLogic.TalkBond);
                        g.State.Stat(Meter.Hope, 1);
                        g.Toast("You crouch and listen to the day's report, delivered one bright eye at a time. The camp's affairs are, apparently, in order — barely.", ToastKind.Info);
                    }));

            if (!profile.AllowsTouch)
            {
                options.Add(InteractionOption.Locked("Gather her in",
                    "Not yet. The perimeter hasn't contracted to you."));
            }
            else if (CompanionLogic.CanRepeat(_lastGathered, s))
            {
                options.Add(InteractionOption.Do("Gather her in",
                    "A heart hammering against your palm like a fast little engine.",
                    g =>
                    {
                        _lastGathered = CompanionLogic.TotalSegment(g.State);
                        g.State.Bond(CompanionLogic.PetBond);
                        g.State.Stat(Meter.Hope, 2);
                        g.Toast("She allows exactly one gathering, scolds you for the disorderly state of your defenses, and resumes patrol. You accept the review in full.", ToastKind.Good);
                    }));
            }
        }
    }
}
