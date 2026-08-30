using UnityEngine;

namespace Tidebound
{
    /// <summary>
    /// Third-person character motor: camera-relative movement, smooth
    /// facing, simple gravity. No jump — the bay has no ledges and law #1
    /// says no physics gotchas. Exhaustion shows in the body: running needs
    /// energy, and an empty tank slows the walk.
    /// </summary>
    [RequireComponent(typeof(CharacterController))]
    public class PlayerController : MonoBehaviour
    {
        [Header("Speeds")]
        public float walkSpeed = 3.4f;
        public float runSpeed = 6f;
        [Tooltip("Below this Energy the run is gone and the walk drags.")]
        public float exhaustedBelowEnergy = 12f;
        [Range(0.3f, 1f)] public float exhaustedWalkFactor = 0.8f;

        [Header("Feel")]
        public float acceleration = 14f;
        public float turnSmoothTime = 0.12f;
        public float gravity = -20f;

        /// <summary>Wired by the scene builder.</summary>
        public Transform cameraTransform;
        public GameManager gm;

        /// <summary>Set true during sleep fades / death.</summary>
        [HideInInspector] public bool inputLocked;

        CharacterController _cc;
        Vector3 _planarVelocity;
        float _verticalVelocity;
        float _turnVelocity;

        void Awake() => _cc = GetComponent<CharacterController>();

        void Update()
        {
            Vector2 move = inputLocked ? Vector2.zero : GameInput.Move;
            bool exhausted = gm != null && gm.State != null &&
                             gm.State.Stats.Energy <= exhaustedBelowEnergy;
            bool run = GameInput.RunHeld && !exhausted;

            Vector3 dir = Vector3.zero;
            if (move.sqrMagnitude > 0.001f && cameraTransform != null)
            {
                Vector3 fwd = cameraTransform.forward; fwd.y = 0f; fwd.Normalize();
                Vector3 right = cameraTransform.right; right.y = 0f; right.Normalize();
                dir = (fwd * move.y + right * move.x).normalized;
            }

            float speed = run ? runSpeed : walkSpeed * (exhausted ? exhaustedWalkFactor : 1f);
            _planarVelocity = Vector3.MoveTowards(_planarVelocity, dir * speed, acceleration * Time.deltaTime);

            if (dir.sqrMagnitude > 0.001f)
            {
                float targetYaw = Mathf.Atan2(dir.x, dir.z) * Mathf.Rad2Deg;
                float yaw = Mathf.SmoothDampAngle(transform.eulerAngles.y, targetYaw, ref _turnVelocity, turnSmoothTime);
                transform.rotation = Quaternion.Euler(0f, yaw, 0f);
            }

            _verticalVelocity = _cc.isGrounded ? -2f : _verticalVelocity + gravity * Time.deltaTime;
            _cc.Move((_planarVelocity + Vector3.up * _verticalVelocity) * Time.deltaTime);
        }
    }
}
