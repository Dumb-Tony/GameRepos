using UnityEngine;

namespace Tidebound
{
    /// <summary>
    /// Synthesized fire crackle: random pops of decaying noise. Lives on
    /// the campfire's Flame object, so it starts and stops with the fire.
    /// OnAudioFilterRead output isn't spatialized, so Update computes a
    /// distance falloff on the main thread and the audio thread applies it.
    /// </summary>
    [RequireComponent(typeof(AudioSource))]
    public class FireCrackle : MonoBehaviour
    {
        [Range(0f, 1f)] public float volume = 0.4f;
        [Tooltip("Beyond this distance the fire is inaudible.")]
        public float audibleRange = 13f;

        readonly System.Random _rng = new System.Random(99);
        float _envelope;
        double _nextPopIn;
        double _sampleRate;
        volatile float _distanceFactor;

        void Awake() => _sampleRate = AudioSettings.outputSampleRate;

        void Update()
        {
            var cam = Camera.main;
            if (cam == null) { _distanceFactor = 0f; return; }
            float d = Vector3.Distance(cam.transform.position, transform.position);
            float f = Mathf.Clamp01(1f - d / audibleRange);
            _distanceFactor = f * f;
        }

        void OnAudioFilterRead(float[] data, int channels)
        {
            double dt = 1.0 / _sampleRate;
            float fall = _distanceFactor * volume;
            for (int i = 0; i < data.Length; i += channels)
            {
                _nextPopIn -= dt;
                if (_nextPopIn <= 0.0)
                {
                    _envelope = 0.25f + (float)_rng.NextDouble() * 0.75f;
                    _nextPopIn = 0.03 + _rng.NextDouble() * 0.28;
                }
                _envelope *= 0.9992f; // ~40 ms decay per pop
                float white = (float)(_rng.NextDouble() * 2.0 - 1.0);
                float sample = white * _envelope * fall * 0.5f;
                for (int c = 0; c < channels; c++) data[i + c] = sample;
            }
        }
    }
}
