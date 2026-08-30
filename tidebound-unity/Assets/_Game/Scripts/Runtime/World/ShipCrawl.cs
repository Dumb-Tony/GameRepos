using UnityEngine;

namespace Tidebound
{
    /// <summary>A single pale light, low on the water, crawling from south
    /// to north — far, terribly far, but real.</summary>
    public class ShipCrawl : MonoBehaviour
    {
        public float speed = 1.4f;

        Vector3 _startPosition;
        bool _cached;

        void OnEnable()
        {
            if (!_cached) { _startPosition = transform.position; _cached = true; }
            transform.position = _startPosition;
        }

        void Update() => transform.position += Vector3.right * (speed * Time.deltaTime);
    }
}
