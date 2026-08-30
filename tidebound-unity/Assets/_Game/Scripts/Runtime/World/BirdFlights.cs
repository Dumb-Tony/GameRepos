using System.Collections.Generic;
using UnityEngine;

namespace Tidebound
{
    /// <summary>
    /// Every minute or two a bird — sometimes a small flock — crosses the
    /// sky and is gone. Birds are spawned procedurally at runtime (thin
    /// dark slivers, no scene objects, no colliders) and despawn offshore.
    /// The sky having occasional business is half of what makes a place
    /// feel inhabited.
    /// </summary>
    public class BirdFlights : MonoBehaviour
    {
        public Material birdMaterial;
        public Vector2 secondsBetweenFlights = new Vector2(35f, 110f);
        public Vector2 altitudeRange = new Vector2(22f, 40f);
        public Vector2 speedRange = new Vector2(7f, 12f);
        [Range(0f, 1f)] public float flockChance = 0.4f;

        float _nextAt;
        readonly List<(Transform bird, Vector3 velocity)> _birds = new List<(Transform, Vector3)>();

        void Start() => Schedule();

        void Schedule() =>
            _nextAt = Time.time + Random.Range(secondsBetweenFlights.x, secondsBetweenFlights.y);

        void Update()
        {
            if (Time.time >= _nextAt) { Spawn(); Schedule(); }

            for (int i = _birds.Count - 1; i >= 0; i--)
            {
                var (bird, velocity) = _birds[i];
                if (bird == null) { _birds.RemoveAt(i); continue; }
                bird.position += velocity * Time.deltaTime
                                 + Vector3.up * (Mathf.Sin(Time.time * 2f + i) * 0.02f);
                if (Mathf.Abs(bird.position.x) > 160f)
                {
                    Destroy(bird.gameObject);
                    _birds.RemoveAt(i);
                }
            }
        }

        void Spawn()
        {
            int flock = Random.value < flockChance ? Random.Range(2, 5) : 1;
            float dir = Random.value < 0.5f ? 1f : -1f;
            float y = Random.Range(altitudeRange.x, altitudeRange.y);
            float z = Random.Range(-20f, 70f);
            float speed = Random.Range(speedRange.x, speedRange.y);

            for (int i = 0; i < flock; i++)
            {
                var go = GameObject.CreatePrimitive(PrimitiveType.Cube);
                go.name = "Bird";
                Destroy(go.GetComponent<Collider>());
                if (birdMaterial != null) go.GetComponent<MeshRenderer>().sharedMaterial = birdMaterial;
                go.transform.localScale = new Vector3(0.9f, 0.06f, 0.25f);
                go.transform.position = new Vector3(-dir * 150f - i * 3f * dir, y + i * 0.6f, z + i * 1.5f);
                go.transform.SetParent(transform, true);
                _birds.Add((go.transform, new Vector3(dir * speed, 0f, Random.Range(-0.5f, 0.5f))));
            }
        }
    }
}
