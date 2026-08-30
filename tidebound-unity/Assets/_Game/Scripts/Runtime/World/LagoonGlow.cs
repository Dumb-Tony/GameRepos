using System.Collections.Generic;
using UnityEngine;

namespace Tidebound
{
    /// <summary>
    /// The bay breathing light: teal glow in the water pulsing the Hum's
    /// seven-beat rhythm. Self-gating — visible when forced by the prologue
    /// director (the first night), and afterwards on any night once
    /// COMPASS_SPINS is set, because canon says the lagoon glows at night
    /// and the player should get to keep that.
    /// </summary>
    public class LagoonGlow : MonoBehaviour
    {
        [Tooltip("Seconds per full seven-beat cycle.")]
        public float cycleSeconds = 11f;
        public float maxLightIntensity = 3.2f;
        [Tooltip("The prologue forces the glow on regardless of time or flags.")]
        public bool forceOn;

        readonly List<Light> _lights = new List<Light>();
        readonly List<Transform> _discs = new List<Transform>();
        readonly List<Vector3> _discScales = new List<Vector3>();
        bool _visible = true;

        void Awake()
        {
            GetComponentsInChildren(true, _lights);
            foreach (Transform child in transform)
                if (child.name == "GlowDisc")
                {
                    _discs.Add(child);
                    _discScales.Add(child.localScale);
                }
        }

        bool ShouldGlow()
        {
            if (forceOn) return true;
            var gm = GameManager.Instance;
            if (gm == null || gm.State == null || gm.clock == null) return false;
            if (!gm.State.Is("COMPASS_SPINS")) return false;
            float t = gm.clock.Clock.Time01;
            return t >= 0.76f || t < 0.02f; // deep night
        }

        void Update()
        {
            bool glow = ShouldGlow();
            if (glow != _visible)
            {
                _visible = glow;
                foreach (var d in _discs) d.gameObject.SetActive(glow);
                foreach (var l in _lights) l.enabled = glow;
            }
            if (!glow) return;

            float pulse = SevenBeat.Evaluate(Time.time / Mathf.Max(2f, cycleSeconds));
            foreach (var l in _lights) l.intensity = maxLightIntensity * (0.15f + 0.85f * pulse);
            for (int i = 0; i < _discs.Count; i++)
            {
                float k = 0.85f + 0.25f * pulse;
                _discs[i].localScale = new Vector3(_discScales[i].x * k, _discScales[i].y, _discScales[i].z * k);
            }
        }
    }
}
