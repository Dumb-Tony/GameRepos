using System.Collections.Generic;
using UnityEngine;

namespace Tidebound
{
    /// <summary>
    /// The fire pit: light it (VN odds), feed it driftwood, cook at it.
    /// Fuel burns one segment at a time (GameManager handles the tick);
    /// this component is the prompt and the visuals.
    /// </summary>
    public class CampfireInteractable : Interactable
    {
        [Tooltip("Enabled while the fire is lit.")]
        public GameObject flame;
        public Light fireLight;
        [Tooltip("Point-light intensity at full fuel / at embers.")]
        public float litIntensity = 2.2f;
        public float emberIntensity = 0.6f;

        public override string DisplayName => "The fire pit";

        public override void GetOptions(GameManager gm, List<InteractionOption> options)
        {
            var s = gm.State;
            if (s.Fire < 1)
            {
                if (s.Has(Items.Driftwood))
                    options.Add(InteractionOption.Do("Make fire",
                        s.Has("lighter")
                            ? "You have a lighter. This is the easiest it will ever be."
                            : "Friction and stubbornness. It may take more than one try. Energy −−",
                        g => g.MakeFire()));
                else
                    options.Add(InteractionOption.Locked("Make fire",
                        "You need driftwood. The wrack line provides."));
                return;
            }

            if (s.Has(Items.Driftwood))
                options.Add(InteractionOption.Do(
                    $"Feed the fire ({s.Count(Items.Driftwood)} driftwood)",
                    "Wood buys hours. The fire is a possession, not a button.",
                    g => g.FeedFire()));
            else
                options.Add(InteractionOption.Locked("Feed the fire",
                    "No driftwood left. The tide restocks the wrack line."));

            if (s.Stats.Hunger < 80)
                options.Add(InteractionOption.Do("Cook a real meal",
                    "Crab, limpets, figs, fire. Hunger ++, hope +. Takes time.",
                    g => g.CookMeal()));
        }

        void Update()
        {
            var gm = GameManager.Instance;
            if (gm == null || gm.State == null) return;
            bool lit = gm.State.Fire > 0;
            if (flame != null && flame.activeSelf != lit) flame.SetActive(lit);
            if (fireLight != null)
            {
                fireLight.enabled = lit;
                if (lit)
                {
                    float baseIntensity = FireLogic.IsEmbers(gm.State) ? emberIntensity : litIntensity;
                    // a cheap flicker so the fire reads alive on a greybox beach
                    fireLight.intensity = baseIntensity * (0.92f + 0.08f * Mathf.PerlinNoise(Time.time * 5f, 0.37f));
                }
            }
        }
    }

    /// <summary>Inventory keys the bay uses. VN keys stay VN keys.</summary>
    public static class Items
    {
        public const string Driftwood = "driftwood";
        public const string Rations = "rations";
    }
}
