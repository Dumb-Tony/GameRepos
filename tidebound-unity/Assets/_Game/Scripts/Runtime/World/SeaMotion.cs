using UnityEngine;

namespace Tidebound
{
    /// <summary>
    /// The sea breathes: a slow vertical bob (swell) plus a longer push
    /// toward and away from the sand (tide). Because the beach slopes, the
    /// moving plane makes the visible waterline creep up and down the sand
    /// with no mesh animation at all.
    /// </summary>
    public class SeaMotion : MonoBehaviour
    {
        [Tooltip("Vertical swell height in meters.")]
        public float bobAmplitude = 0.07f;
        public float bobPeriod = 6f;
        [Tooltip("How far the tide pushes up the beach, in meters.")]
        public float tideAmplitude = 1.6f;
        public float tidePeriod = 28f;

        Vector3 _basePosition;

        void Awake() => _basePosition = transform.position;

        void Update()
        {
            float y = Mathf.Sin(Time.time * 2f * Mathf.PI / bobPeriod) * bobAmplitude;
            float z = Mathf.Sin(Time.time * 2f * Mathf.PI / tidePeriod) * tideAmplitude;
            transform.position = _basePosition + new Vector3(0f, y, z);
        }
    }
}
