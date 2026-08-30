using NUnit.Framework;

namespace Tidebound.Tests
{
    /// <summary>
    /// Canon: "seven beats, rising and falling." The island hums exactly
    /// one rhythm — pin it so every system that reads this curve agrees.
    /// </summary>
    public class SevenBeatTests
    {
        [Test]
        public void StaysInRange_AndRestsAtTheCycleEdges()
        {
            for (int i = 0; i <= 1000; i++)
            {
                float v = SevenBeat.Evaluate(i / 1000f);
                Assert.GreaterOrEqual(v, 0f);
                Assert.LessOrEqual(v, 1f);
            }
            Assert.Less(SevenBeat.Evaluate(0f), 0.01f);
            Assert.Less(SevenBeat.Evaluate(0.999f), 0.02f);
        }

        [Test]
        public void OneCycle_HasExactlySevenPulses()
        {
            const int n = 2000;
            var samples = new float[n + 1];
            for (int i = 0; i <= n; i++) samples[i] = SevenBeat.Evaluate(i / (float)n);

            int peaks = 0;
            for (int i = 1; i < n; i++)
                if (samples[i] > samples[i - 1] && samples[i] > samples[i + 1])
                    peaks++;
            Assert.AreEqual(SevenBeat.Beats, peaks);
        }

        [Test]
        public void PhaseWraps()
        {
            Assert.AreEqual(SevenBeat.Evaluate(0.3f), SevenBeat.Evaluate(1.3f), 0.0001f);
            Assert.AreEqual(SevenBeat.Evaluate(0.3f), SevenBeat.Evaluate(-0.7f), 0.0001f);
        }
    }
}
