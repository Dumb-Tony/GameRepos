using System.Collections.Generic;
using UnityEngine;

namespace Tidebound
{
    /// <summary>
    /// Being with the dog: share food, talk low, and — once the distance is
    /// his to stop keeping — pet him, and name him. One of each per
    /// segment; trust shows only as behavior, never as a number. Law #3:
    /// he is "the grey dog" until the naming.
    /// </summary>
    public class KaviInteractable : Interactable
    {
        public KaviController controller;

        int _lastFed = -1;
        int _lastTalked = -1;
        int _lastPetted = -1;

        public override string DisplayName =>
            GameManager.Instance != null && GameManager.Instance.State.Is("KAVI_NAMED")
                ? "Kavi"
                : "The grey dog";

        public override bool IsAvailable(GameManager gm) =>
            controller != null && controller.IsActiveCompanion;

        public override void GetOptions(GameManager gm, List<InteractionOption> options)
        {
            var s = gm.State;
            var profile = CompanionLogic.ProfileFor(s.Tier);

            if (CompanionLogic.CanRepeat(_lastFed, s))
                options.Add(InteractionOption.Do("Share food",
                    "Hunger is a door. Keep it open. Hunger −, trust grows.",
                    g =>
                    {
                        _lastFed = CompanionLogic.TotalSegment(g.State);
                        g.State.Bond(CompanionLogic.FeedBond);
                        g.State.Stat(Meter.Hunger, -4);
                        g.Toast("He takes it the way he took the first one: gravely, without snatching. Somewhere, a ledger updates.", ToastKind.Info);
                    }));
            else
                options.Add(InteractionOption.Locked("Share food",
                    "He's had his share this part of the day. Rationing is love, out here."));

            if (CompanionLogic.CanRepeat(_lastTalked, s))
                options.Add(InteractionOption.Do("Talk low, about nothing",
                    "The weather. The crab market. Anything.",
                    g =>
                    {
                        _lastTalked = CompanionLogic.TotalSegment(g.State);
                        g.State.Bond(CompanionLogic.TalkBond);
                        g.State.Stat(Meter.Hope, 1);
                        g.Toast("You talk, low and unhurried. One ear stays on you the whole time, which is more listening than most people manage.", ToastKind.Info);
                    }));

            if (!profile.AllowsTouch)
            {
                options.Add(InteractionOption.Locked("Pet him",
                    "Not yet. The distance is his to close."));
            }
            else if (!gm.State.Is("KAVI_NAMED"))
            {
                options.Add(InteractionOption.Do("\"Kavi.\" Name him, finally.",
                    "After the sound the reef makes at low tide. Named things stay.",
                    g =>
                    {
                        g.State.SetFlag("KAVI_NAMED");
                        g.State.Bond(CompanionLogic.NameBond);
                        g.State.Stat(Meter.Hope, 3);
                        g.Toast("\"Kavi.\" His ear flicks. He doesn't come — but he doesn't look away either. Named things stay.", ToastKind.Good);
                    }));
            }
            else if (CompanionLogic.CanRepeat(_lastPetted, s))
            {
                options.Add(InteractionOption.Do("Pet the storm-grey coat",
                    "Rougher than it looks. Warmer than it should be.",
                    g =>
                    {
                        _lastPetted = CompanionLogic.TotalSegment(g.State);
                        g.State.Bond(CompanionLogic.PetBond);
                        g.State.Stat(Meter.Hope, 2);
                        g.Toast("He allows it — then leans, very slightly, into your hand. Progress, measured in ounces.", ToastKind.Good);
                    }));
            }
        }
    }
}
