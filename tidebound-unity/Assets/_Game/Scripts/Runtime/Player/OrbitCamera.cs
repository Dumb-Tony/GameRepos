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

        [Header("Framing")]
        public float distance = 4.6f;
        public float followHeight = 1.6f;
        [Tooltip("How fast the camera relaxes to the wanted distance after a collision push-in.")]
        public float distanceRelaxSpeed = 6f;

        [Header("Collision")]
        public float collisionRadius = 0.25f;
        public LayerMask collisionMask = Physics.DefaultRaycastLayers;

        [HideInInspector] public bool inputLocked;

        float _yaw, _pitch, _currentDistance;

        void Start()
        {
            _pitch = startAngles.x;
            _yaw = target != null ? target.eulerAngles.y + startAngles.y : startAngles.y;
            _currentDistance = distance;
        }

        void LateUpdate()
        {
            if (target == null) return;

            if (!inputLocked && Cursor.lockState == CursorLockMode.Locked)
            {
                Vector2 look = GameInput.Look;
                _yaw += look.x * lookSensitivity.x;
                _pitch = Mathf.Clamp(_pitch - look.y * lookSensitivity.y, minPitch, maxPitch);
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
