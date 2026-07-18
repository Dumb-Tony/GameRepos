using UnityEngine;

namespace Tidebound
{
    /// <summary>
    /// Kavi in the world. Trust tiers ARE his AI: Wary patrols a wide
    /// circle around camp pretending not to be yours; Watchful follows at
    /// five paces and rests where he can watch both you and the treeline;
    /// Warming+ takes the fireside; Bonded shadows you; Kindred is pack.
    /// The ported TIER_LINE vignettes surface as occasional narration when
    /// you're near him. Self-gating: the rig only shows once the Clearing
    /// has chosen him.
    /// </summary>
    public class KaviController : MonoBehaviour
    {
        [Header("Wired by the scene builder")]
        public GameObject model;
        public TailWag tailWag;

        [Header("Movement")]
        public float trotSpeed = 2.4f;
        public float runSpeed = 4.8f;
        public float turnDegreesPerSecond = 360f;

        [Header("The world as he knows it")]
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

        public bool IsActiveCompanion
        {
            get
            {
                var gm = GameManager.Instance;
                return gm != null && gm.State != null
                       && gm.State.Companion == "kavi" && gm.State.Is("CLEARING_DONE");
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
                // catch up to station, faster the further behind he's fallen
                Vector3 toDog = transform.position - playerPos;
                toDog.y = 0f;
                Vector3 station = playerPos + toDog.normalized * profile.FollowDistance;
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
                    gm.Toast(CompanionLogic.Vignette(gm.State.Tier, _vignetteCursor++), ToastKind.Info);
            }
        }

        Vector3 PickRestSpot(GameManager gm, TierProfile profile, Vector3 playerPos)
        {
            var tier = gm.State.Tier;
            switch (tier)
            {
                case TrustTier.Wary:
                {
                    // the wide circle around camp, biased toward the exit
                    Vector3 toTreeline = (treelinePoint - campPoint).normalized;
                    float angle = Random.Range(-70f, 70f);
                    Vector3 dir = Quaternion.Euler(0f, angle, 0f) * toTreeline;
                    return campPoint + dir * profile.FollowDistance;
                }
                case TrustTier.Watchful:
                {
                    // where he can see both you and the treeline
                    Vector3 mid = Vector3.Lerp(campPoint, treelinePoint, 0.12f);
                    return mid + new Vector3(Random.Range(-1.5f, 1.5f), 0f, Random.Range(-1f, 1f));
                }
                case TrustTier.Warming:
                case TrustTier.Bonded:
                {
                    // the fireside, when there is one; near you otherwise
                    Vector3 anchor = gm.State.Fire > 0 ? campPoint : playerPos;
                    Vector2 r = Random.insideUnitCircle.normalized * Random.Range(1.5f, 2.4f);
                    return anchor + new Vector3(r.x, 0f, r.y);
                }
                default:
                {
                    // pack: beside you
                    Vector2 side = Random.insideUnitCircle.normalized * profile.FollowDistance;
                    return playerPos + new Vector3(side.x, 0f, side.y);
                }
            }
        }

        void MoveToward(Vector3 target, float speed)
        {
            Vector3 to = target - transform.position;
            to.y = 0f;
            if (to.sqrMagnitude < 0.01f) return;
            Vector3 dir = to.normalized;
            transform.position += dir * (speed * Time.deltaTime);
            var wanted = Quaternion.LookRotation(dir, Vector3.up);
            transform.rotation = Quaternion.RotateTowards(transform.rotation, wanted, turnDegreesPerSecond * Time.deltaTime);

            // a light trot-bob so the slide reads as gait, not gliding
            _bobPhase += Time.deltaTime * speed * 3.2f;
            var local = model.transform.localPosition;
            local.y = Mathf.Abs(Mathf.Sin(_bobPhase)) * 0.06f;
            model.transform.localPosition = local;
        }

        void FaceWhatMatters(TierProfile profile, Vector3 playerPos)
        {
            // settled: face the player if he's yours, the treeline if he's not
            Vector3 focus = profile.Follows ? playerPos : treelinePoint;
            Vector3 to = focus - transform.position;
            to.y = 0f;
            if (to.sqrMagnitude < 0.01f) return;
            var wanted = Quaternion.LookRotation(to.normalized, Vector3.up);
            transform.rotation = Quaternion.RotateTowards(transform.rotation, wanted, (turnDegreesPerSecond * 0.4f) * Time.deltaTime);
        }

        void GroundClamp()
        {
            if (Physics.Raycast(transform.position + Vector3.up * 4f, Vector3.down, out var hit, 12f,
                    Physics.DefaultRaycastLayers, QueryTriggerInteraction.Ignore))
                transform.position = new Vector3(transform.position.x, hit.point.y, transform.position.z);
        }

        static float FlatDistance(Vector3 a, Vector3 b)
        {
            a.y = 0f;
            b.y = 0f;
            return Vector3.Distance(a, b);
        }
    }
}
