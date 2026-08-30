using UnityEngine;

namespace Tidebound
{
    /// <summary>
    /// One flare. It climbs with a sound like torn cloth (someday), hangs
    /// over the lagoon painting everything in emergency, sinks, and dies.
    /// Self-disables when spent.
    /// </summary>
    public class FlareBurst : MonoBehaviour
    {
        public float climbSeconds = 1.6f;
        public float apexHeight = 55f;
        public float lifeSeconds = 9f;

        Light _light;
        Vector3 _origin;
        float _elapsed;
        bool _cached;

        void OnEnable()
        {
            if (!_cached)
            {
                _origin = transform.position;
                _light = GetComponentInChildren<Light>();
                _cached = true;
            }
            _elapsed = 0f;
            transform.position = _origin;
        }

        void Update()
        {
            _elapsed += Time.deltaTime;
            float climb = Mathf.Clamp01(_elapsed / climbSeconds);
            climb = 1f - (1f - climb) * (1f - climb); // decelerating rise
            float sink = Mathf.Max(0f, _elapsed - climbSeconds) * 1.2f;
            transform.position = _origin + Vector3.up * (apexHeight * climb - sink);

            if (_light != null)
            {
                float fade = Mathf.Clamp01(1f - _elapsed / lifeSeconds);
                _light.intensity = (5f + Mathf.PerlinNoise(Time.time * 9f, 0.2f) * 2f) * fade;
            }

            if (_elapsed >= lifeSeconds) gameObject.SetActive(false);
        }
    }
}
