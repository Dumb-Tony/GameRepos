using UnityEngine;

namespace Tidebound
{
    /// <summary>
    /// The Tidewell breathing: the temple pool rises and falls on the same
    /// seven-beat curve as the lagoon, because it is the same water and the
    /// same heart — plumbed to the sea through the whole body of the
    /// mountain. Eight hundred feet up, the island keeps its time here.
    /// </summary>
    public class TidewellPulse : MonoBehaviour
    {
        [Tooltip("Seconds per full seven-beat cycle — the lagoon's own pace.")]
        public float cycleSeconds = 11f;
        [Tooltip("How far the surface travels between the cycle's ebb and its full.")]
        public float riseMeters = 0.22f;

        Vector3 _restPosition;
        float _phase;

        void Awake() => _restPosition = transform.localPosition;

        void Update()
        {
            _phase += Time.deltaTime / Mathf.Max(0.1f, cycleSeconds);
            float pulse = SevenBeat.Evaluate(_phase);
            var p = _restPosition;
            p.y += pulse * riseMeters;
            transform.localPosition = p;
        }
    }
}
