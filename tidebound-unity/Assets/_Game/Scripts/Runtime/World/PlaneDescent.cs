using UnityEngine;

namespace Tidebound
{
    /// <summary>
    /// The charter plane's last flight: a slow, unarguable descent toward
    /// the island — canon says the engines are fine and the instruments are
    /// drunk, so no fire, no spin, just a gentle wrongness. The prologue
    /// director parents the camera to this rig for the chase shot.
    /// </summary>
    public class PlaneDescent : MonoBehaviour
    {
        public Vector3 startPosition = new Vector3(-50f, 260f, -430f);
        public Vector3 endPosition = new Vector3(0f, 115f, -195f);
        [Tooltip("How long the full descent takes; the impact cut comes first.")]
        public float descentSeconds = 55f;
        public float wobbleDegrees = 5f;

        float _elapsed;

        void OnEnable()
        {
            _elapsed = 0f;
            transform.position = startPosition;
        }

        void Update()
        {
            _elapsed += Time.deltaTime;
            float k = Mathf.Clamp01(_elapsed / descentSeconds);
            k = k * k * (3f - 2f * k);
            transform.position = Vector3.Lerp(startPosition, endPosition, k);

            Vector3 dir = (endPosition - startPosition).normalized;
            float yaw = Mathf.Atan2(dir.x, dir.z) * Mathf.Rad2Deg;
            float pitch = Mathf.Lerp(3f, 14f, k);
            float roll = Mathf.Sin(_elapsed * 0.5f) * wobbleDegrees
                       + (Mathf.PerlinNoise(_elapsed * 0.3f, 0.5f) - 0.5f) * 4f;
            transform.rotation = Quaternion.Euler(pitch, yaw, roll);
        }
    }
}
