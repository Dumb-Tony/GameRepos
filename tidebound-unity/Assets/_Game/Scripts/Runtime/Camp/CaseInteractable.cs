using System.Collections.Generic;
using UnityEngine;

namespace Tidebound
{
    /// <summary>
    /// The courier's case, as an object in the world: it sits by the camp's
    /// flat stone from the moment you carry it there (salvaged in the
    /// prologue, or returned by the sea on day 8) and it stays after
    /// opening — bent or drilled or picked, but never less strange. The
    /// contemplation scene is the VN's case_scene; opening is a labor and
    /// costs time (GameManager.OpenCaseScene), looking is free.
    /// </summary>
    public class CaseInteractable : Interactable
    {
        [Tooltip("The case prop — visible only once the case is in your possession.")]
        public GameObject visual;

        public override string DisplayName => "The courier's case";

        public override bool IsAvailable(GameManager gm) =>
            gm.State != null && gm.State.Has("case");

        public override void GetOptions(GameManager gm, List<InteractionOption> options)
        {
            if (!gm.State.Is("CASE_OPEN"))
                options.Add(InteractionOption.Do("Consider the lock",
                    "Locked. Heavy. Not food. Still yours.",
                    g => g.OpenCaseScene()));
            else
                options.Add(InteractionOption.Locked("Opened",
                    "The gems, the dossier, the chart. None of it got less strange overnight."));
        }

        void Update()
        {
            var gm = GameManager.Instance;
            if (gm == null || gm.State == null || visual == null) return;
            bool present = gm.State.Has("case");
            if (visual.activeSelf != present) visual.SetActive(present);
        }
    }
}
