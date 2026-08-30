using UnityEngine;

namespace Tidebound
{
    /// <summary>
    /// A companion in the world, shared machinery: trust tiers ARE the AI
    /// (Wary patrols a wide circle pretending not to be yours; Watchful
    /// follows at distance and rests watching you AND the treeline;
    /// Warming+ takes the fireside; Bonded shadows; Kindred is pack), the
    /// ported TIER_LINE vignettes surface as narration in earshot, and the
    /// rig self-gates on the Clearing's choice. Subclasses supply the
    /// companion id and their species' gait.
    /// </summary>
    public abstract class CompanionController : MonoBehaviour
    {
        [Header("Wired by the scene builder")]
        public GameObject model;
        public TailWag tailWag;

        [Header("Movement")]
        public float trotSpeed = 2.4f;
        public float runSpeed = 4.8f;
        public float turnDegreesPerSecond = 360f;
        [Tooltip("Gait bob: height of the step, and strides per meter-ish.")]
        public float bobAmplitude = 0.06f;
        public float bobFrequency = 3.2f;

        [Header("The world as they know it")]
        public Vector3 campPoint = new Vector3(0f, 0f, 15f);
        public Vector3 treelinePoint = new Vector3(12f, 0f, 72f);

        [Header("Vignettes (the VN's idle prose, as narration)")]
        public float vignetteMinSeconds = 100f;
        public float vignetteMaxSeconds = 200f;
        public float vignetteEarshot = 9f;

        bool _wasActive;
        float _nextVignetteAt;
        int _vignetteCursor;
        float _repathAt;
        Vector3 _restTarget;
        float _bobPhase;

        /// <summary>The companion id this rig answers to ("kavi", "buri", …).</summary>
        protected abstract string CompanionId { get; }

        public bool IsActiveCompanion
        {
            get
            {
                var gm = GameManager.Instance;
                return gm != null && gm.State != null
                       && gm.State.Companion == CompanionId && gm.State.Is("CLEARING_DONE");
            }
        }

        void Update()
        {
            var gm = GameManager.Instance;
            if (gm == null || gm.State == null || model == null) return;

            bool active = IsActiveCompanion && !gm.IsDead;
            if (model.activeSelf != active) model.SetActive(active);
            if (!active) { _wasActive = false; return; }

            if (!_wasActive)
            {
                _wasActive = true;
                _nextVignetteAt = Time.time + Random.Range(30f, 60f);
                _vignetteCursor = Random.Range(0, 99);
            }

            if (gm.DialogueActive || gm.JournalOpen) return; // the world holds its breath

            var profile = CompanionLogic.ProfileFor(gm.State.Tier);
            Vector3 playerPos = gm.player.transform.position;
            float playerDist = FlatDistance(transform.position, playerPos);

            if (profile.Follows && playerDist > profile.FollowTrigger)
            {
                Vector3 station = FollowStation(profile, playerPos);
                MoveToward(station, playerDist > profile.FollowTrigger * 1.8f ? runSpeed : trotSpeed);
            }
            else
            {
                if (Time.time >= _repathAt)
                {
                    _repathAt = Time.time + Random.Range(5f, 10f);
                    _restTarget = PickRestSpot(gm, profile, playerPos);
                }
                if (FlatDistance(transform.position, _restTarget) > 0.45f)
                    MoveToward(_restTarget, trotSpeed * 0.7f);
                else
                    FaceWhatMatters(profile, playerPos);
            }

            GroundClamp();

            if (tailWag != null)
                tailWag.wagging = profile.AllowsTouch && playerDist < 3.5f;

            if (Time.time >= _nextVignetteAt)
            {
                _nextVignetteAt = Time.time + Random.Range(vignetteMinSeconds, vignetteMaxSeconds);
                if (playerDist < vignetteEarshot)
                    gm.Toast(CompanionLogic.Vignette(CompanionId, gm.State.Tier, _vignetteCursor++), ToastKind.Info);
            }
        }

        /// <summary>Where to stand while keeping up. Ground species trail the
        /// player's wake; airborne ones may orbit instead.</summary>
        protected virtual Vector3 FollowStation(TierProfile profile, Vector3 playerPos)
        {
            Vector3 back = transform.position - playerPos;
            back.y = 0f;
            return playerPos + back.normalized * profile.FollowDistance;
        }

        protected virtual Vector3 PickRestSpot(GameManager gm, TierProfile profile, Vector3 playerPos)
        {
            switch (gm.State.Tier)
            {
                case TrustTier.Wary:
                {
                    Vector3 toTreeline = (treelinePoint - campPoint).normalized;
                    float angle = Random.Range(-70f, 70f);
                    Vector3 dir = Quaternion.Euler(0f, angle, 0f) * toTreeline;
                    return campPoint + dir * profile.FollowDistance;
                }
                case TrustTier.Watchful:
                {
                    Vector3 mid = Vector3.Lerp(campPoint, treelinePoint, 0.12f);
                    return mid + new Vector3(Random.Range(-1.5f, 1.5f), 0f, Random.Range(-1f, 1f));
                }
                case TrustTier.Warming:
                case TrustTier.Bonded:
                {
                    Vector3 anchor = gm.State.Fire > 0 ? campPoint : playerPos;
                    Vector2 r = Random.insideUnitCircle.normalized * Random.Range(1.5f, 2.4f);
                    return anchor + new Vector3(r.x, 0f, r.y);
                }
                default:
                {
                    Vector2 side = Random.insideUnitCircle.normalized * profile.FollowDistance;
                    return playerPos + new Vector3(side.x, 0f, side.y);
                }
            }
        }

        protected virtual void MoveToward(Vector3 target, float speed)
        {
            Vector3 to = target - transform.position;
            to.y = 0f;
            if (to.sqrMagnitude < 0.01f) return;
            Vector3 dir = to.normalized;
            transform.position += dir * (speed * Time.deltaTime);
            var wanted = Quaternion.LookRotation(dir, Vector3.up);
            transform.rotation = Quaternion.RotateTowards(transform.rotation, wanted, turnDegreesPerSecond * Time.deltaTime);

            // the gait bob so the slide reads as stride, not gliding
            _bobPhase += Time.deltaTime * speed * bobFrequency;
            var local = model.transform.localPosition;
            local.y = Mathf.Abs(Mathf.Sin(_bobPhase)) * bobAmplitude;
            model.transform.localPosition = local;
        }

        void FaceWhatMatters(TierProfile profile, Vector3 playerPos)
        {
            Vector3 focus = profile.Follows ? playerPos : treelinePoint;
            Vector3 to = focus - transform.position;
            to.y = 0f;
            if (to.sqrMagnitude < 0.01f) return;
            var wanted = Quaternion.LookRotation(to.normalized, Vector3.up);
            transform.rotation = Quaternion.RotateTowards(transform.rotation, wanted, (turnDegreesPerSecond * 0.4f) * Time.deltaTime);
        }

        protected virtual void GroundClamp()
        {
            if (Physics.Raycast(transform.position + Vector3.up * 4f, Vector3.down, out var hit, 12f,
                    Physics.DefaultRaycastLayers, QueryTriggerInteraction.Ignore))
                transform.position = new Vector3(transform.position.x, hit.point.y, transform.position.z);
        }

        protected static float FlatDistance(Vector3 a, Vector3 b)
        {
            a.y = 0f;
            b.y = 0f;
            return Vector3.Distance(a, b);
        }
    }

}
