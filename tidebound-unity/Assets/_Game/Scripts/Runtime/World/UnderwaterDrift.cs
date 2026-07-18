using System.Collections.Generic;
using UnityEngine;

namespace Tidebound
{
    /// <summary>
    /// The between-place after the impact: dense blue dark, rising bubbles,
    /// a slow sink. Overrides fog/ambient while enabled (and asks the sun
    /// to stand down); restores everything on disable. The prologue
    /// director parents the camera inside.
    /// </summary>
    public class UnderwaterDrift : MonoBehaviour
    {
        public SunCycle sun;
        public float sinkSpeed = 0.35f;
        public Color waterColor = new Color(0.01f, 0.05f, 0.09f);
        public float fogDensity = 0.09f;

        readonly List<Transform> _bubbles = new List<Transform>();
        readonly List<Transform> _debris = new List<Transform>();
        Transform _fuselage;
        bool _savedFog;
        float _savedDensity;
        Color _savedFogColor, _savedAmbient;
        FogMode _savedMode;

        void OnEnable()
        {
            _savedFog = RenderSettings.fog;
            _savedMode = RenderSettings.fogMode;
            _savedDensity = RenderSettings.fogDensity;
            _savedFogColor = RenderSettings.fogColor;
            _savedAmbient = RenderSettings.ambientLight;

            RenderSettings.fog = true;
            RenderSettings.fogMode = FogMode.Exponential;
            RenderSettings.fogDensity = fogDensity;
            RenderSettings.fogColor = waterColor;
            RenderSettings.ambientLight = waterColor * 1.6f;
            if (sun != null) sun.suppressed = true;

            if (_bubbles.Count == 0)
                foreach (Transform child in transform)
                {
                    if (child.name == "Bubble") _bubbles.Add(child);
                    else if (child.name.StartsWith("Debris") || child.name.StartsWith("Paper")) _debris.Add(child);
                    else if (child.name == "Fuselage") _fuselage = child;
                }
        }

        void OnDisable()
        {
            RenderSettings.fog = _savedFog;
            RenderSettings.fogMode = _savedMode;
            RenderSettings.fogDensity = _savedDensity;
            RenderSettings.fogColor = _savedFogColor;
            RenderSettings.ambientLight = _savedAmbient;
            if (sun != null) sun.suppressed = false;
        }

        void Update()
        {
            transform.position += Vector3.down * (sinkSpeed * Time.deltaTime);
            foreach (var b in _bubbles)
            {
                b.position += Vector3.up * ((0.4f + (b.GetSiblingIndex() % 5) * 0.12f) * Time.deltaTime);
                if (b.localPosition.y > 6f)
                    b.localPosition = new Vector3(b.localPosition.x, -6f, b.localPosition.z);
            }
            // the wreck outruns you into the dark; small things tumble slowly
            if (_fuselage != null)
            {
                _fuselage.position += Vector3.down * (0.5f * Time.deltaTime);
                _fuselage.Rotate(2.2f * Time.deltaTime, 0.8f * Time.deltaTime, 0f, Space.World);
            }
            for (int i = 0; i < _debris.Count; i++)
            {
                var d = _debris[i];
                d.position += Vector3.down * (0.08f * Time.deltaTime);
                d.Rotate((6f + i * 2f) * Time.deltaTime, (4f + i) * Time.deltaTime, 3f * Time.deltaTime);
            }
        }
    }
}
