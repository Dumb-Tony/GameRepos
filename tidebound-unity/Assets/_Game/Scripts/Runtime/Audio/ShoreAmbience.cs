using UnityEngine;

namespace Tidebound
{
    /// <summary>
    /// The sound of the place, synthesized — no audio files: low-passed
    /// noise swelling on a slow wave cycle over a steady wind bed.
    /// OnAudioFilterRead runs on the audio thread, so everything there is
    /// plain math on local state; the tunables are read as plain floats.
    /// </summary>
    [RequireComponent(typeof(AudioSource))]
    public class ShoreAmbience : MonoBehaviour
    {
        [Range(0f, 1f)] public float waveVolume = 0.18f;
        [Range(0f, 1f)] public float windVolume = 0.08f;
        [Tooltip("Seconds per wave swell.")]
        public float wavePeriod = 9f;

        readonly System.Random _rng = new System.Random(1234);
        float _rumble;   // deep low-pass state
        float _hiss;     // lighter low-pass state
        float _swellPhase;
        double _sampleRate;

        void Awake() => _sampleRate = AudioSettings.outputSampleRate;

        void OnAudioFilterRead(float[] data, int channels)
        {
            float period = Mathf.Max(2f, wavePeriod);
            float phaseStep = (float)(1.0 / (_sampleRate * period));
            for (int i = 0; i < data.Length; i += channels)
            {
                float white = (float)(_rng.NextDouble() * 2.0 - 1.0);
                _rumble += 0.02f * (white - _rumble);
                _hiss += 0.10f * (white - _hiss);

                _swellPhase += phaseStep;
                if (_swellPhase > 1f) _swellPhase -= 1f;
                float swell = Mathf.Sin(_swellPhase * 2f * Mathf.PI) * 0.5f + 0.5f;
                swell *= swell; // waves arrive, then drag back quietly

                float sample = _rumble * 6f * swell * waveVolume
                             + _hiss * 2.5f * windVolume;
                for (int c = 0; c < channels; c++) data[i + c] = sample;
            }
        }
    }
}
