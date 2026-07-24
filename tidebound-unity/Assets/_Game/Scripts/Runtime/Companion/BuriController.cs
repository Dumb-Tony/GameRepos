namespace Tidebound
{
    /// <summary>
    /// Buri in the world: the same trust-tier AI on a heavier chassis —
    /// slower trot, deliberate stride, and a heart the size of a barrel.
    /// The builder wires his gait; Reset seeds the pig-shaped defaults.
    /// </summary>
    public class BuriController : CompanionController
    {
        protected override string CompanionId => "buri";

        void Reset()
        {
            trotSpeed = 1.9f;
            runSpeed = 3.6f;
            turnDegreesPerSecond = 220f;
            bobAmplitude = 0.045f;
            bobFrequency = 2.2f;
        }
    }
}
