using UnityEngine;

namespace Tidebound
{
    /// <summary>
    /// Nine in the world: the tide-bound chassis, and the last one. She
    /// never leaves the water — every target she is given is clamped into
    /// the shallows band along the tideline, so she paces you up and down
    /// the shore in the wave-wash and simply stops at the line where her
    /// world ends when you walk inland. Absence is a designed cost. While
    /// the books are open (Wary) she keeps to her gallery pool on the
    /// eastern shelf; later the nearest stretch of shore to you is hers.
    /// She glides — no gait bob; a slow surface sway instead.
    /// </summary>
    public class NineController : CompanionController
    {
        [Header("The tideline (her whole world)")]
        [Tooltip("The shallows band she exists in: z is clamped to this range.")]
        public float shoreZMin = -8f;
        public float shoreZMax = 3f;
        public Vector3 galleryPoolPoint = new Vector3(186f, 0f, 2f);
        public float surfaceLift = 0.08f;
        public float swayAmplitude = 0.05f;
        public float swaySeconds = 2.6f;

        protected override string CompanionId => "nine";

        float _swayPhase;

        void Reset()
        {
            trotSpeed = 2.6f;
            runSpeed = 5.5f;      // a jet, when she means it
            turnDegreesPerSecond = 300f;
            bobAmplitude = 0f;    // she does not stride; she pours
            bobFrequency = 0f;
        }

        Vector3 ClampToWater(Vector3 p)
        {
            p.z = Mathf.Clamp(p.z, shoreZMin, shoreZMax);
            return p;
        }

        protected override Vector3 FollowStation(TierProfile profile, Vector3 playerPos)
        {
            return ClampToWater(base.FollowStation(profile, playerPos));
        }

        protected override Vector3 PickRestSpot(GameManager gm, TierProfile profile, Vector3 playerPos)
        {
            if (gm.State.Tier == TrustTier.Wary) return galleryPoolPoint;
            // the nearest stretch of shore to wherever you are is hers
            return ClampToWater(base.PickRestSpot(gm, profile, playerPos));
        }

        protected override void MoveToward(Vector3 target, float speed)
        {
            target = ClampToWater(target);
            Vector3 to = target - transform.position;
            to.y = 0f;
            if (to.sqrMagnitude < 0.01f) return;
            Vector3 dir = to.normalized;
            transform.position += dir * (speed * Time.deltaTime);
            var wanted = Quaternion.LookRotation(dir, Vector3.up);
            transform.rotation = Quaternion.RotateTowards(transform.rotation, wanted, turnDegreesPerSecond * Time.deltaTime);
        }

        protected override void GroundClamp()
        {
            float ground = -1f;
            if (Physics.Raycast(transform.position + Vector3.up * 10f, Vector3.down, out var hit, 30f,
                    Physics.DefaultRaycastLayers, QueryTriggerInteraction.Ignore))
                ground = hit.point.y;
            _swayPhase += Time.deltaTime / Mathf.Max(0.1f, swaySeconds);
            float sway = Mathf.Sin(_swayPhase * Mathf.PI * 2f) * swayAmplitude;
            // ride the surface over deep water; sit in the pool over shelf rock
            float y = Mathf.Max(ground + surfaceLift, 0.04f) + sway;
            transform.position = new Vector3(transform.position.x, y, transform.position.z);
        }
    }
}
