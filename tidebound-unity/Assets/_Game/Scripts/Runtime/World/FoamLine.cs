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

        [Tooltip("Each segment hugs the sand under it as the line washes up and down the slope.")]
        public bool conformToGround = true;
        [Tooltip("How far above the sand a conforming segment sits.")]
        public float groundClearance = 0.05f;
        [Tooltip("Segments never sink below this height — seaward of the sand they ride the water instead.")]
        public float minHeight = 0.07f;

        Vector3 _basePosition;
        Transform[] _segments;

        void Awake()
        {
            _basePosition = transform.position;
            _segments = new Transform[transform.childCount];
            for (int i = 0; i < _segments.Length; i++) _segments[i] = transform.GetChild(i);
        }

        void Update()
        {
            float t = Time.time * 2f * Mathf.PI;
            transform.position = _basePosition + new Vector3(
                0f,
                bobAmplitude * Mathf.Sin(t / (slidePeriod * 0.7f) + phase),
                slideAmplitude * Mathf.Sin(t / slidePeriod + phase));

            if (!conformToGround) return;
            foreach (var seg in _segments)
            {
                Vector3 p = seg.position;
                if (Physics.Raycast(new Vector3(p.x, p.y + 5f, p.z), Vector3.down, out var hit, 12f,
                        Physics.DefaultRaycastLayers, QueryTriggerInteraction.Ignore))
                    seg.position = new Vector3(p.x, Mathf.Max(hit.point.y + groundClearance, minHeight), p.z);
            }
        }
    }
}
