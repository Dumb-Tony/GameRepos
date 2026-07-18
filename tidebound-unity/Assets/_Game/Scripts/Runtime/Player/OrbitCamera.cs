using UnityEngine;

namespace Tidebound
{
    /// <summary>
    /// Mouse-orbit follow camera with a collision spherecast so the beach
    /// rocks never swallow the view. Everything that decides the feel is an
    /// inspector parameter — tune by hand, don't hardcode a guess.
    /// </summary>
    public class OrbitCamera : MonoBehaviour
    {
        public Transform target;

        [Header("Orbit")]
        public Vector2 lookSensitivity = new Vector2(0.14f, 0.10f);
        public float minPitch = -25f;
        public float maxPitch = 70f;
        [Tooltip("Starting angles: x = pitch, y = yaw.")]
        public Vector2 startAngles = new Vector2(16f, 0f);
        [Tooltip("How quickly the camera settles toward where you point it, in seconds. 0 = rigid 1:1; higher = floatier.")]
        [Range(0f, 0.3f)] public float rotationSmoothTime = 0.08f;

        [Header("Framing")]
        public float distance = 4.6f;
        public float followHeight = 1.6f;
        [Tooltip("How fast the camera relaxes to the wanted distance after a collision push-in.")]
        public float distanceRelaxSpeed = 6f;

        [Header("Collision")]
        public float collisionRadius = 0.25f;
        public LayerMask collisionMask = Physics.DefaultRaycastLayers;

        [HideInInspector] public bool inputLocked;

        float _yaw, _pitch, _targetYaw, _targetPitch, _yawVelocity, _pitchVelocity, _currentDistance;

        void Start()
        {
            _pitch = _targetPitch = startAngles.x;
            _yaw = _targetYaw = target != null ? target.eulerAngles.y + startAngles.y : startAngles.y;
            _currentDistance = distance;
        }

        void LateUpdate()
        {
            if (target == null) return;

            if (!inputLocked && Cursor.lockState == CursorLockMode.Locked)
            {
                Vector2 look = GameInput.Look;
                _targetYaw += look.x * lookSensitivity.x;
                _targetPitch = Mathf.Clamp(_targetPitch - look.y * lookSensitivity.y, minPitch, maxPitch);
            }

            // ease toward the pointed direction instead of snapping to it
            if (rotationSmoothTime > 0f)
            {
                _yaw = Mathf.SmoothDampAngle(_yaw, _targetYaw, ref _yawVelocity, rotationSmoothTime);
                _pitch = Mathf.SmoothDamp(_pitch, _targetPitch, ref _pitchVelocity, rotationSmoothTime);
            }
            else
            {
                _yaw = _targetYaw;
                _pitch = _targetPitch;
            }

            var rot = Quaternion.Euler(_pitch, _yaw, 0f);
            Vector3 pivot = target.position + Vector3.up * followHeight;
            float wanted = distance;

            if (Physics.SphereCast(pivot, collisionRadius, rot * Vector3.back, out var hit,
                    distance, collisionMask, QueryTriggerInteraction.Ignore))
                wanted = Mathf.Max(0.5f, hit.distance - 0.05f);

            _currentDistance = wanted < _currentDistance
                ? wanted // snap in so geometry never clips
                : Mathf.MoveTowards(_currentDistance, wanted, distanceRelaxSpeed * Time.deltaTime);

            transform.SetPositionAndRotation(pivot + rot * Vector3.back * _currentDistance, rot);
        }
    }
}
