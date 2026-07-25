using UnityEngine;

namespace Tidebound
{
    /// <summary>
    /// Ipo in the world: the canopy chassis on the shared companion
    /// machinery. He does not walk anywhere — he travels in bursts: a
    /// scampering dash, a dead stop to audit the situation, another dash.
    /// While the books are still open (Wary) he keeps to the palm canopy
    /// above camp, auditing your possessions from height; once he has moved
    /// in, the ground — rearranged to his taste — is his. Warming+ rides
    /// close, a small showman working a one-person parade.
    /// </summary>
    public class IpoController : CompanionController
    {
        [Header("Canopy")]
        public Vector3 canopyPerchPoint = new Vector3(4f, 0f, 20f);
        public float perchHeight = 3.2f;
        public float climbSpeed = 4f;

        [Header("The scamper (dash, then audit, then dash)")]
        public float dashSeconds = 0.55f;
        public float pauseSeconds = 0.4f;

        protected override string CompanionId => "ipo";

        float _gaitClock;
        bool _aloft;

        void Reset()
        {
            trotSpeed = 3.4f;
            runSpeed = 6.2f;
            turnDegreesPerSecond = 720f;
            bobAmplitude = 0.05f;
            bobFrequency = 7f;
        }

        // Wary: the trees. Everything after: the camp is his now.
        protected override Vector3 PickRestSpot(GameManager gm, TierProfile profile, Vector3 playerPos)
        {
            return gm.State.Tier == TrustTier.Wary
                ? canopyPerchPoint
                : base.PickRestSpot(gm, profile, playerPos);
        }

        protected override void MoveToward(Vector3 target, float speed)
        {
            _gaitClock += Time.deltaTime;
            float cycle = dashSeconds + pauseSeconds;
            bool dashing = (_gaitClock % cycle) < dashSeconds;
            if (dashing)
                base.MoveToward(target, speed * 1.6f); // the dash makes up for the audits
            // else: a dead stop, mid-route, to reassess. It reads as exactly what it is.

            Vector3 flat = target - transform.position;
            flat.y = 0f;
            _aloft = TowardCanopy(target) && flat.sqrMagnitude < 36f; // climbing the last stretch
        }

        protected override void GroundClamp()
        {
            float ground = transform.position.y;
            if (Physics.Raycast(transform.position + Vector3.up * 20f, Vector3.down, out var hit, 40f,
                    Physics.DefaultRaycastLayers, QueryTriggerInteraction.Ignore))
                ground = hit.point.y;
            bool perched = TowardCanopy(transform.position) && AtPerch();
            float wantedY = ground + (_aloft || perched ? perchHeight : 0f);
            float y = Mathf.MoveTowards(transform.position.y, wantedY, climbSpeed * Time.deltaTime);
            transform.position = new Vector3(transform.position.x, y, transform.position.z);
        }

        bool TowardCanopy(Vector3 point)
        {
            var gm = GameManager.Instance;
            if (gm == null || gm.State == null || gm.State.Tier != TrustTier.Wary) return false;
            Vector3 d = point - canopyPerchPoint;
            d.y = 0f;
            return d.sqrMagnitude < 9f;
        }

        bool AtPerch()
        {
            Vector3 d = transform.position - canopyPerchPoint;
            d.y = 0f;
            return d.sqrMagnitude < 1f;
        }
    }
}
