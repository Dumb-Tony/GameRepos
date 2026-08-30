using UnityEngine;

namespace Tidebound
{
    /// <summary>The tail answers from wherever he is. Wags when told to;
    /// stills otherwise. The single cheapest line of body language there is.</summary>
    public class TailWag : MonoBehaviour
    {
        public float wagDegrees = 28f;
        public float wagSpeed = 9f;
        [HideInInspector] public bool wagging;

        Quaternion _baseRotation;

        void Awake() => _baseRotation = transform.localRotation;

        void Update()
        {
            transform.localRotation = wagging
                ? _baseRotation * Quaternion.Euler(0f, Mathf.Sin(Time.time * wagSpeed) * wagDegrees, 0f)
                : Quaternion.RotateTowards(transform.localRotation, _baseRotation, 180f * Time.deltaTime);
        }
    }
}
