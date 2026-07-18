using System.Collections.Generic;
using UnityEngine;

namespace Tidebound
{
    /// <summary>
    /// The early door out. Lash a raft from driftwood at the tideline; when
    /// it's done, the sea offers THE EMPTY HORIZON — going now, ready or
    /// not. Building it is a Signal act; refusing the launch is its own
    /// small answer.
    /// </summary>
    public class RaftSite : Interactable
    {
        public const int WoodPerStage = 4;
        public const int StagesToFinish = 2;

        [Tooltip("Enabled per completed lashing stage.")]
        public GameObject stage1Visual;
        public GameObject stage2Visual;

        public override string DisplayName =>
            Stage(GameManager.Instance?.State) >= StagesToFinish ? "The raft" : "A raft, half-argued";

        static int Stage(GameState s)
        {
            if (s == null) return 0;
            if (s.Is("RAFT_STAGE_2")) return 2;
            if (s.Is("RAFT_STAGE_1")) return 1;
            return 0;
        }

        public override void GetOptions(GameManager gm, List<InteractionOption> options)
        {
            var s = gm.State;
            int stage = Stage(s);

            if (stage < StagesToFinish)
            {
                if (s.Count(Items.Driftwood) >= WoodPerStage)
                    options.Add(InteractionOption.Do(
                        stage == 0 ? "Start lashing a raft" : "Finish the raft",
                        $"Hard, honest work. Energy −−, {WoodPerStage} driftwood. The horizon is watching.",
                        g =>
                        {
                            g.State.AddItem(Items.Driftwood, -WoodPerStage);
                            g.State.SetFlag("RAFT_STAGE_" + (Stage(g.State) + 1));
                            g.State.Stat(Meter.Energy, -10);
                            g.State.AddRoute(RouteAxis.Signal, 2);
                            g.Toast(Stage(g.State) >= StagesToFinish
                                ? "The raft is done. It rides the shallows, tugging at its line like it has somewhere to be."
                                : "Driftwood bones, cord lashings, the beginning of an argument with the sea.", ToastKind.Info);
                            g.SaveNow();
                        }));
                else
                    options.Add(InteractionOption.Locked(
                        stage == 0 ? "Start lashing a raft" : "Finish the raft",
                        $"You need {WoodPerStage} driftwood ({s.Count(Items.Driftwood)} carried)."));
            }
            else
            {
                options.Add(InteractionOption.Do("Stand at the water with the raft's line in hand",
                    "The sea does not grade on intention.",
                    g => g.OfferRaftLaunch()));
            }
        }

        void Update()
        {
            var gm = GameManager.Instance;
            if (gm == null || gm.State == null) return;
            int stage = Stage(gm.State);
            if (stage1Visual != null && stage1Visual.activeSelf != stage >= 1) stage1Visual.SetActive(stage >= 1);
            if (stage2Visual != null && stage2Visual.activeSelf != stage >= 2) stage2Visual.SetActive(stage >= 2);
        }
    }
}
