using UnityEngine;

namespace Tidebound
{
    /// <summary>
    /// Gentle Perlin-driven sway for fronds, canopies, and bushes — the
    /// cheapest possible wind. Each instance phases itself off its world
    /// position so the greenery never moves in unison.
    /// </summary>
    public class SwayInWind : MonoBehaviour
    {
        [Tooltip("Maximum lean, in degrees.")]
        public float degrees = 4f;
        public float speed = 0.5f;

        Quaternion _baseRotation;
        float _phase;

        void Awake()
        {
            _baseRotation = transform.localRotation;
            _phase = (transform.position.x + transform.position.z) * 0.7f;
        }

        void Update()
        {
            float t = Time.time * speed + _phase;
            float a = (Mathf.PerlinNoise(t, 0.3f) - 0.5f) * 2f * degrees;
            float b = (Mathf.PerlinNoise(0.7f, t * 0.8f) - 0.5f) * 2f * degrees * 0.6f;
            transform.localRotation = _baseRotation * Quaternion.Euler(a, 0f, b);
        }
    }
}
