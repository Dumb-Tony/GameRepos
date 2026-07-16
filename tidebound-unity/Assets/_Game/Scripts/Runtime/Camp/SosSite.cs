using System.Collections.Generic;
using UnityEngine;

namespace Tidebound
{
    /// <summary>
    /// The stretch of open sand where SOS can be stamped in dark stones —
    /// the bay's one Signal lever. One-shot; the letters stay.
    /// </summary>
    public class SosSite : Interactable
    {
        [Tooltip("Enabled once the letters are stamped.")]
        public GameObject letters;

        public override string DisplayName => "Open sand, above the tide";

        public override bool IsAvailable(GameManager gm) => !gm.State.Is("SOS");

        public override void GetOptions(GameManager gm, List<InteractionOption> options)
        {
            options.Add(InteractionOption.Do("Stamp SOS into the beach",
                "Giant letters, dark stones. For whoever is looking. Energy −, hope +.",
                g => g.StampSos()));
        }

        void Update()
        {
            var gm = GameManager.Instance;
            if (gm == null || gm.State == null || letters == null) return;
            bool show = gm.State.Is("SOS");
            if (letters.activeSelf != show) letters.SetActive(show);
        }
    }
}
