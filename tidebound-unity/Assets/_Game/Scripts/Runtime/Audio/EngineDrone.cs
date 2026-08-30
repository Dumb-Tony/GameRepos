using UnityEngine;

namespace Tidebound
{
    /// <summary>
    /// The charter plane's engines, synthesized: two slightly detuned low
    /// sines with a soft throb and a bed of filtered noise. Canon: the
    /// engines are fine — this must sound steady, not failing.
    /// </summary>
    [RequireComponent(typeof(AudioSource))]
    public class EngineDrone : MonoBehaviour
    {
        [Range(0f, 1f)] public float volume = 0.16f;

        readonly System.Random _rng = new System.Random(7);
        double _phaseA, _phaseB, _throbPhase;
        double _sampleRate;
        float _noiseLp;

        void Awake() => _sampleRate = AudioSettings.outputSampleRate;

        void OnAudioFilterRead(float[] data, int channels)
        {
            double stepA = 2.0 * System.Math.PI * 82.0 / _sampleRate;
            double stepB = 2.0 * System.Math.PI * 87.3 / _sampleRate;
            double stepT = 2.0 * System.Math.PI * 0.6 / _sampleRate;
            for (int i = 0; i < data.Length; i += channels)
            {
                _phaseA += stepA; if (_phaseA > System.Math.PI * 2) _phaseA -= System.Math.PI * 2;
                _phaseB += stepB; if (_phaseB > System.Math.PI * 2) _phaseB -= System.Math.PI * 2;
                _throbPhase += stepT; if (_throbPhase > System.Math.PI * 2) _throbPhase -= System.Math.PI * 2;

                float white = (float)(_rng.NextDouble() * 2.0 - 1.0);
                _noiseLp += 0.06f * (white - _noiseLp);

                float throb = 0.85f + 0.15f * (float)System.Math.Sin(_throbPhase);
                float sample = ((float)System.Math.Sin(_phaseA) * 0.5f
                              + (float)System.Math.Sin(_phaseB) * 0.35f
                              + _noiseLp * 0.8f) * throb * volume;
                for (int c = 0; c < channels; c++) data[i + c] = sample;
            }
        }
    }
}
