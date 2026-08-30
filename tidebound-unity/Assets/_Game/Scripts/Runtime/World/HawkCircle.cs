using UnityEngine;

namespace Tidebound
{
    /// <summary>The hawk banking around for its second pass — a dark sliver
    /// circling a point, always facing along its arc.</summary>
    public class HawkCircle : MonoBehaviour
    {
        public Vector3 center;
        public float radius = 9f;
        public float height = 11f;
        public float speed = 0.7f;

        float _angle;

        void OnEnable() => _angle = 0f;

        void Update()
        {
            _angle += speed * Time.deltaTime;
            var pos = center + new Vector3(
                Mathf.Cos(_angle) * radius,
                height + Mathf.Sin(_angle * 0.5f) * 1.5f,
                Mathf.Sin(_angle) * radius);
            Vector3 tangent = new Vector3(-Mathf.Sin(_angle), 0f, Mathf.Cos(_angle));
            transform.SetPositionAndRotation(pos, Quaternion.LookRotation(tangent, Vector3.up));
        }
    }
}
