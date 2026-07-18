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

        [Tooltip("Each patch hugs the sand under it as the line washes up and down the slope.")]
        public bool conformToGround = true;
        [Tooltip("How far above the sand a conforming patch sits.")]
        public float groundClearance = 0.05f;
        [Tooltip("Patches never sink below this height — seaward of the sand they ride the water instead.")]
        public float minHeight = 0.07f;

        [Tooltip("How much patches swell on the wash-in and shrink toward nothing on the retreat. 0 = rigid.")]
        [Range(0f, 1f)] public float pulseAmount = 0.6f;

        Vector3 _basePosition;
        Transform[] _patches;
        Vector3[] _baseScales;
        float[] _patchPhase;

        void Awake()
        {
            _basePosition = transform.position;
            int n = transform.childCount;
            _patches = new Transform[n];
            _baseScales = new Vector3[n];
            _patchPhase = new float[n];
            for (int i = 0; i < n; i++)
            {
                _patches[i] = transform.GetChild(i);
                _baseScales[i] = _patches[i].localScale;
                _patchPhase[i] = (i * 2.399f) % (2f * Mathf.PI); // golden-angle scatter
            }
        }

        void Update()
        {
            float t = Time.time * 2f * Mathf.PI;
            transform.position = _basePosition + new Vector3(
                0f,
                bobAmplitude * Mathf.Sin(t / (slidePeriod * 0.7f) + phase),
                slideAmplitude * Mathf.Sin(t / slidePeriod + phase));

            for (int i = 0; i < _patches.Length; i++)
            {
                var patch = _patches[i];

                // swell with the wash, each patch slightly out of step, so
                // foam appears and dissolves instead of translating rigidly
                float swell = Mathf.Sin(t / slidePeriod + phase + _patchPhase[i] * 0.45f) * 0.5f + 0.5f;
                patch.localScale = _baseScales[i] * (1f - pulseAmount + pulseAmount * swell);

                if (!conformToGround) continue;
                Vector3 p = patch.position;
                if (Physics.Raycast(new Vector3(p.x, p.y + 5f, p.z), Vector3.down, out var hit, 12f,
                        Physics.DefaultRaycastLayers, QueryTriggerInteraction.Ignore))
                    patch.position = new Vector3(p.x, Mathf.Max(hit.point.y + groundClearance, minHeight), p.z);
            }
        }
    }
}
