using System;
using System.Collections.Generic;

namespace Tidebound
{
    /// <summary>
    /// What a trust tier LOOKS like — the VN's TIER_LINE vignettes
    /// translated into behavior numbers. In 3D, trust is never a bar: it's
    /// how close he idles, whether he follows, where he sleeps.
    /// </summary>
    public struct TierProfile
    {
        /// <summary>Preferred distance he keeps when following/idling near you.</summary>
        public float FollowDistance;
        /// <summary>He starts moving when you get this far away.</summary>
        public float FollowTrigger;
        /// <summary>Whether he follows you around at all (Wary: he patrols instead).</summary>
        public bool Follows;
        /// <summary>Whether he rests by the fire (Warming and up).</summary>
        public bool FiresideRest;
        /// <summary>Whether petting is on the table.</summary>
        public bool AllowsTouch;
    }

    /// <summary>
    /// Companion machine truth and adaptation constants. Trust init is the
    /// VN's exact formula (scenes-chapter2.js); tier thresholds live in
    /// GameState.Tier. The 3D bond actions (feed/talk/pet) are adaptation
    /// values pinned by tests — the VN's spend-time hub action was worth 5.
    /// </summary>
    public static class CompanionLogic
    {
        // ---- the VN's trust seed: 18 + interest*5, clamped 0..45, once ----
        public static void InitTrust(GameState s)
        {
            if (s.Companion == null || s.Is("TRUST_INIT")) return;
            s.SetFlag("TRUST_INIT");
            s.Interest.TryGetValue(s.Companion, out int warmth);
            s.Trust = (int)GameState.Clamp(18 + warmth * 5, 0, 45);
        }

        // ---- 3D bond actions (per segment each; the walk over is free) ----
        public const int FeedBond = 3;
        public const int TalkBond = 1;
        public const int PetBond = 2;
        public const int NameBond = 2;

        /// <summary>One use per action per segment: compare total segments.</summary>
        public static int TotalSegment(GameState s) => s.Day * DayClock.SegmentsPerDay + (int)s.Seg;

        public static bool CanRepeat(int lastTotalSegment, GameState s) =>
            TotalSegment(s) > lastTotalSegment;

        // ---- tier → observable behavior --------------------------------
        public static TierProfile ProfileFor(TrustTier tier)
        {
            switch (tier)
            {
                case TrustTier.Wary: // patrols a wide circle, pretending not to be yours
                    return new TierProfile { FollowDistance = 10f, FollowTrigger = 16f, Follows = false, FiresideRest = false, AllowsTouch = false };
                case TrustTier.Watchful: // lies where he can see both you and the treeline
                    return new TierProfile { FollowDistance = 5.5f, FollowTrigger = 9f, Follows = true, FiresideRest = false, AllowsTouch = false };
                case TrustTier.Warming: // sleeps touching your back; brings inventory
                    return new TierProfile { FollowDistance = 3.2f, FollowTrigger = 6f, Follows = true, FiresideRest = true, AllowsTouch = true };
                case TrustTier.Bonded: // moves when you move, like a shadow that learned tactics
                    return new TierProfile { FollowDistance = 1.9f, FollowTrigger = 4f, Follows = true, FiresideRest = true, AllowsTouch = true };
                default: // Kindred: you are pack
                    return new TierProfile { FollowDistance = 1.3f, FollowTrigger = 3f, Follows = true, FiresideRest = true, AllowsTouch = true };
            }
        }

        // ---- the vignettes: scenes-chapter2.js TIER_LINE.kavi, verbatim ----
        static readonly string[][] KaviVignettes =
        {
            new[]
            {
                "Kavi patrols a wide circle around camp, pretending not to be yours.",
                "Kavi has excavated a shallow day-bed at the exact radius where leaving would be easy. He uses it facing you.",
                "Kavi accepts a fish head at arm's length, retreats three lengths to eat it, and watches you the whole time like a debt he's deciding whether to honor.",
            },
            new[]
            {
                "Kavi lies where he can see both you and the treeline.",
                "Kavi has begun escorting you to the waterline and back — five paces behind, eyes out, pretending it's his own errand.",
                "Something moved in the fringe an hour ago. You know because Kavi stood, took two stiff steps toward it, and placed himself exactly on the line between it and you.",
            },
            new[]
            {
                "Kavi sleeps touching your back now. It happened without negotiation.",
                "Kavi brings a stick and drops it two paces off — not for throwing, you eventually understand. It's inventory. He's contributing.",
                "You wake from a doze to find Kavi's chin resting on your ankle, eyes open, on duty. He looks away the moment you notice, deeply casual about it.",
            },
            new[]
            {
                "Kavi moves when you move, like a shadow that learned tactics.",
                "Kavi has opinions about your route now — a low huff for the fringe path after rain, one ear flat for the rocks at low tide. You've learned to consult him.",
                "When you laugh at something, Kavi's tail answers from wherever he is, like a second voice agreeing sight unseen.",
            },
            new[]
            {
                "Kavi is not a wild dog who tolerates you. You are pack.",
                "On the ridge at dusk the pack sings, and Kavi answers from beside your fire — one long note that means, as best you can translate it: <i>accounted for, both of us.</i>",
                "Kavi sleeps flat on his side now, belly to the fire, paws twitching through some running dream — the sleep of an animal with a sentry he trusts. The sentry is you.",
            },
        };

        public static IReadOnlyList<string> VignettesFor(TrustTier tier) => KaviVignettes[(int)tier];

        public static string Vignette(TrustTier tier, int index)
        {
            var list = KaviVignettes[(int)tier];
            return list[Math.Abs(index) % list.Length];
        }
    }
}
