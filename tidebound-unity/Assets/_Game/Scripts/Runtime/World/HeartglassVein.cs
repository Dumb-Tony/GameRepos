using UnityEngine;

namespace Tidebound
{
    /// <summary>
    /// Heartglass in the black rock: it carries the island's seven beats like
    /// everything else — but it gives your lamp back a HALF-BEAT LATE, which
    /// is the detail the whole descent turns on. You walk down there in a
    /// crowd of your own delayed reflections. The lag is the point; the
    /// phase offset is what makes the stone feel awake.
    /// </summary>
    public class HeartglassVein : MonoBehaviour
    {
        [Tooltip("Seconds per full seven-beat cycle — the lagoon's own pace.")]
        public float cycleSeconds = 11f;
        [Tooltip("How far behind the island's pulse this vein answers, in beats.")]
        public float lagBeats = 0.5f;
        public float minScale = 0.85f;
        public float maxScale = 1.12f;

        Vector3 _restScale;
        float _phase;

        void Awake()
        {
            _restScale = transform.localScale;
            // each vein starts somewhere of its own, so a gallery never blinks in unison
            _phase = Random.value;
        }

        void Update()
        {
            _phase += Time.deltaTime / Mathf.Max(0.1f, cycleSeconds);
            float lag = lagBeats / SevenBeat.Beats;
            float pulse = SevenBeat.Evaluate(_phase - lag);
            transform.localScale = _restScale * Mathf.Lerp(minScale, maxScale, pulse);
        }
    }
}
