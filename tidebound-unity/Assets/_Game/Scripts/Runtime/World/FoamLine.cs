using UnityEngine;

namespace Tidebound
{
    /// <summary>
    /// A pale strip riding the waterline, sliding up and down the sand out
    /// of phase with its siblings — the greybox stand-in for surf wash.
    /// </summary>
    public class FoamLine : MonoBehaviour
    {
        [Tooltip("How far the strip slides up/down the beach, in meters.")]
        public float slideAmplitude = 1.8f;
        public float slidePeriod = 7f;
        [Tooltip("Phase offset so multiple lines don't move in lockstep.")]
        public float phase;
        public float bobAmplitude = 0.03f;

        Vector3 _basePosition;

        void Awake() => _basePosition = transform.position;

        void Update()
        {
            float t = Time.time * 2f * Mathf.PI;
            transform.position = _basePosition + new Vector3(
                0f,
                bobAmplitude * Mathf.Sin(t / (slidePeriod * 0.7f) + phase),
                slideAmplitude * Mathf.Sin(t / slidePeriod + phase));
        }
    }
}
