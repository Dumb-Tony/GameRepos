using UnityEngine;

namespace Tidebound
{
    /// <summary>
    /// The Long Rain, outside the cutscenes: a world-scale rain volume that
    /// rides above the player wherever they go, thickening and thinning on
    /// the season's curve, with the sky pressed down over it — dimmer sun,
    /// greyer ambient, fog closed in. Chapter five should be a place you
    /// live in, not a slideshow you read about.
    /// </summary>
    public class MonsoonWeather : MonoBehaviour
    {
        [Header("Wired by the scene builder")]
        public ParticleSystem rain;
        public SunCycle sun;

        [Header("The volume overhead")]
        public float rainHeight = 16f;
        [Tooltip("Drops per second at the season's full weight.")]
        public float maxEmission = 2600f;

        [Header("The sky, pressed down")]
        public float clearFogDensity = 0.0035f;
        public float stormFogDensity = 0.02f;
        [Tooltip("How much of the sun the season takes at full weight.")]
        public float maxOvercast = 0.72f;
        [Tooltip("Seconds to cross-fade when the weather changes.")]
        public float fadeSeconds = 6f;

        float _current;
        ParticleSystem.EmissionModule _emission;
        bool _ready;

        void Awake()
        {
            if (rain != null)
            {
                _emission = rain.emission;
                _ready = true;
            }
            RenderSettings.fogDensity = clearFogDensity;
        }

        void Update()
        {
            var gm = GameManager.Instance;
            if (!_ready || gm == null || gm.State == null) return;

            float target = Monsoon.Intensity(gm.State);
            _current = Mathf.MoveTowards(_current, target, Time.deltaTime / Mathf.Max(0.1f, fadeSeconds));

            // the volume follows you: the rain is always overhead, never a place
            if (gm.player != null)
            {
                Vector3 p = gm.player.transform.position;
                transform.position = new Vector3(p.x, p.y + rainHeight, p.z);
            }

            bool wet = _current > 0.01f;
            if (rain.gameObject.activeSelf != wet) rain.gameObject.SetActive(wet);
            if (wet) _emission.rateOverTime = maxEmission * _current;

            RenderSettings.fogDensity = Mathf.Lerp(clearFogDensity, stormFogDensity, _current);
            if (sun != null) sun.overcast = maxOvercast * _current;
        }
    }
}
