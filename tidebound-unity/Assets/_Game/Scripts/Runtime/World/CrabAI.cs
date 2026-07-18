using UnityEngine;

namespace Tidebound
{
    /// <summary>
    /// A tiny crab: sidles between spots near its home patch, pauses to be
    /// a crab about it, and skitters away when the castaway looms. Walks
    /// sideways because it is a crab. Ambient life only — no interaction,
    /// no colliders, no harm (the island's small citizens are set dressing
    /// until the almanac says otherwise).
    /// </summary>
    public class CrabAI : MonoBehaviour
    {
        public float wanderRadius = 4f;
        public float walkSpeed = 0.5f;
        public float fleeSpeed = 2.8f;
        [Tooltip("Skitter when the player gets this close…")]
        public float fleeDistance = 2.4f;
        [Tooltip("…and calm down again at this range.")]
        public float calmDistance = 5f;

        Vector3 _home;
        Vector3 _target;
        float _pauseUntil;
        bool _fleeing;
        float _seed;

        void Start()
        {
            _home = transform.position;
            _seed = (transform.position.x * 13.7f + transform.position.z * 7.1f) % 10f;
            PickTarget();
        }

        void Update()
        {
            var gm = GameManager.Instance;
            Transform player = gm != null && gm.player != null ? gm.player.transform : null;
            Vector3 pos = transform.position;
            float playerDist = player != null ? Vector3.Distance(pos, player.position) : 999f;

            if (_fleeing) { if (playerDist > calmDistance) _fleeing = false; }
            else if (playerDist < fleeDistance) _fleeing = true;

            Vector3 move = Vector3.zero;
            if (_fleeing && player != null)
            {
                Vector3 away = pos - player.position;
                away.y = 0f;
                if (away.sqrMagnitude > 0.001f) move = away.normalized * fleeSpeed;
            }
            else if (Time.time >= _pauseUntil)
            {
                Vector3 to = _target - pos;
                to.y = 0f;
                if (to.magnitude < 0.15f)
                {
                    _pauseUntil = Time.time + 0.8f + Mathf.PerlinNoise(_seed, Time.time * 0.1f) * 2.4f;
                    PickTarget();
                }
                else move = to.normalized * walkSpeed;
            }

            if (move.sqrMagnitude > 0.0001f)
            {
                pos += move * Time.deltaTime;
                // face perpendicular to travel: crabs commit to the bit
                transform.rotation = Quaternion.LookRotation(Quaternion.Euler(0f, 90f, 0f) * move.normalized, Vector3.up);
            }

            if (Physics.Raycast(pos + Vector3.up * 4f, Vector3.down, out var hit, 10f,
                    Physics.DefaultRaycastLayers, QueryTriggerInteraction.Ignore))
                pos.y = hit.point.y + 0.06f;
            transform.position = pos;
        }

        void PickTarget()
        {
            Vector2 r = Random.insideUnitCircle * wanderRadius;
            _target = _home + new Vector3(r.x, 0f, r.y);
        }
    }
}
