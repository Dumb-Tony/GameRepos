using System.Collections.Generic;
using UnityEngine;

namespace Tidebound
{
    /// <summary>
    /// Ryo Nakata by your fire, and the Kingfisher above the tideline —
    /// both invisible until the sea delivers them (ev4_ryo sets RYO_MET).
    /// Options are the VN's ch4 hub actions: tend him while he knits,
    /// then work the boat with him, stage by stage. Both are labors.
    /// </summary>
    public class RyoCamp : Interactable
    {
        [Tooltip("The sailor's greybox, by the fire (shown once RYO_MET).")]
        public GameObject ryoRig;
        [Tooltip("The Kingfisher's hulk above the tideline (shown once RYO_MET).")]
        public GameObject hullRig;

        public override string DisplayName => "Ryo Nakata";

        public override bool IsAvailable(GameManager gm) => gm.State.Is("RYO_MET");

        public override void GetOptions(GameManager gm, List<InteractionOption> options)
        {
            if (gm.State.Ryo < 40)
                options.Add(InteractionOption.Do("Tend to Ryo",
                    "Water, food, fresh dressings, and someone to talk at. He's a talker. Takes time.",
                    g => g.VisitEdda("ryo_tend", 1)));
            else
                options.Add(InteractionOption.Do("Work the Kingfisher with Ryo",
                    "Two sets of hands on a broken boat. He talks the whole time. It helps. Energy −.",
                    g => g.VisitEdda("ryo_boat", 1)));
        }

        void Update()
        {
            var gm = GameManager.Instance;
            if (gm == null || gm.State == null) return;
            bool met = gm.State.Is("RYO_MET");
            if (ryoRig != null && ryoRig.activeSelf != met) ryoRig.SetActive(met);
            if (hullRig != null && hullRig.activeSelf != met) hullRig.SetActive(met);
        }
    }
}
