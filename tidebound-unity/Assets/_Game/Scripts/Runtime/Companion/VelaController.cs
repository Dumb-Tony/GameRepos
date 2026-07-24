using UnityEngine;

namespace Tidebound
{
    /// <summary>
    /// Vela in the world: the first airborne chassis on the shared companion
    /// machinery. She does not trail your wake — she rides the wind above
    /// you in slow orbit when you move, and when you stop she returns to a
    /// perch and resumes the audit. Low trust keeps her on the far snag;
    /// the dead palm at camp's edge is the nearer post she concedes later.
    /// No gait bob: flight banks instead of striding.
    /// </summary>
    public class VelaController : CompanionController
    {
        [Header("Flight")]
        public float flightAltitude = 7f;
        public float perchHeight = 2.4f;
        public float climbSpeed = 5f;
        public float orbitRadius = 5f;
        public float orbitDegreesPerSecond = 45f;

        [Header("Perches (wired by the scene builder)")]
        public Vector3 farSnagPoint = new Vector3(-14f, 0f, 2f);
        public Vector3 campPerchPoint = new Vector3(4f, 0f, 12f);

        protected override string CompanionId => "vela";

        float _orbitAngle;
        bool _airborne;

        void Reset()
        {
            trotSpeed = 5f;
            runSpeed = 9f;
            turnDegreesPerSecond = 160f;
            bobAmplitude = 0f;   // she does not bob; she banks
            bobFrequency = 0f;
        }

        // While following she holds a moving station on a slow circle above
        // you — "stationed off your shoulder like a second thought."
        protected override Vector3 FollowStation(TierProfile profile, Vector3 playerPos)
        {
            _orbitAngle += orbitDegreesPerSecond * Time.deltaTime;
            float radius = Mathf.Max(orbitRadius, profile.FollowDistance);
            Vector3 offset = Quaternion.Euler(0f, _orbitAngle, 0f) * Vector3.forward * radius;
            return playerPos + offset;
        }

        // Rest is a perch, not a patch of sand: the far snag while the books
        // are open, the dead palm inside camp once the word "inside" passes.
        protected override Vector3 PickRestSpot(GameManager gm, TierProfile profile, Vector3 playerPos)
        {
            return gm.State.Tier == TrustTier.Wary ? farSnagPoint : campPerchPoint;
        }

        protected override void MoveToward(Vector3 target, float speed)
        {
            Vector3 to = target - transform.position;
            to.y = 0f;
            if (to.sqrMagnitude >= 0.01f)
            {
                Vector3 dir = to.normalized;
                transform.position += dir * (speed * Time.deltaTime);
                var wanted = Quaternion.LookRotation(dir, Vector3.up);
                transform.rotation = Quaternion.RotateTowards(transform.rotation, wanted, turnDegreesPerSecond * Time.deltaTime);
            }
            // long legs of travel are flown; the final approach is a landing
            _airborne = to.sqrMagnitude > 4f;
        }

        protected override void GroundClamp()
        {
            float ground = 0f;
            if (Physics.Raycast(transform.position + Vector3.up * 40f, Vector3.down, out var hit, 80f,
                    Physics.DefaultRaycastLayers, QueryTriggerInteraction.Ignore))
                ground = hit.point.y;
            float wantedY = ground + (_airborne ? flightAltitude : perchHeight);
            float y = Mathf.MoveTowards(transform.position.y, wantedY, climbSpeed * Time.deltaTime);
            transform.position = new Vector3(transform.position.x, y, transform.position.z);
        }
    }
}
