using System.Collections.Generic;
using UnityEngine;

namespace Tidebound
{
    /// <summary>
    /// The flat ground above the tide line: build the lean-to, improve it,
    /// rest through daylight, sleep to dawn. Building costs the VN's energy
    /// plus a 3D material gate (driftwood — the gather loop is the point of
    /// having a beach). Visual tiers are children toggled by state.
    /// </summary>
    public class ShelterInteractable : Interactable
    {
        public const int Tier1Wood = 4;
        public const int Tier2Wood = 6;

        [Tooltip("Enabled at shelter tier 1 (the lean-to).")]
        public GameObject tier1Visual;
        [Tooltip("Enabled at shelter tier 2 (the hut). Tier 1 visual stays on underneath.")]
        public GameObject tier2Visual;

        public override string DisplayName
        {
            get
            {
                var s = GameManager.Instance != null ? GameManager.Instance.State : null;
                switch (s?.Shelter ?? 0)
                {
                    case 0: return "Flat ground above the tide line";
                    case 1: return "Your lean-to";
                    default: return "Your hut";
                }
            }
        }

        public override void GetOptions(GameManager gm, List<InteractionOption> options)
        {
            var s = gm.State;

            if (s.Shelter < 2)
            {
                int wood = s.Shelter == 0 ? Tier1Wood : Tier2Wood;
                string verb = s.Shelter == 0 ? "Build a shelter" : "Improve the shelter";
                if (s.Count(Items.Driftwood) >= wood)
                    options.Add(InteractionOption.Do(verb,
                        $"Hard labor now, better nights after. Energy −−, {wood} driftwood.",
                        g => g.BuildShelter(wood)));
                else
                    options.Add(InteractionOption.Locked(verb,
                        $"You need {wood} driftwood ({s.Count(Items.Driftwood)} carried). The wrack line provides."));
            }

            if (s.Seg == Segment.Dusk || s.Seg == Segment.Night)
                options.Add(InteractionOption.Do("Sleep until dawn", SleepDetail(s), g => g.SleepUntilDawn()));
            else
                options.Add(InteractionOption.Do("Rest in the shade",
                    "Do the bravest thing: recover. Energy +, takes time.", g => g.Rest()));
        }

        static string SleepDetail(GameState s)
        {
            if (s.Shelter > 0 && s.Fire > 0) return "Roof and fire. The night can do its worst politely.";
            if (s.Shelter > 0) return "No fire, but a roof. You'll wrap yourself in everything you own.";
            if (s.Fire > 0) return "No roof, but the fire holds a room-shaped piece of night open.";
            return "No roof. No fire. The stars will keep you honest. Hope −";
        }

        void Update()
        {
            var gm = GameManager.Instance;
            if (gm == null || gm.State == null) return;
            int tier = gm.State.Shelter;
            if (tier1Visual != null && tier1Visual.activeSelf != tier >= 1) tier1Visual.SetActive(tier >= 1);
            if (tier2Visual != null && tier2Visual.activeSelf != tier >= 2) tier2Visual.SetActive(tier >= 2);
        }
    }
}
