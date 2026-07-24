namespace Tidebound
{
    /// <summary>
    /// Moa in the world: the smallest chassis on the shared companion
    /// machinery — a fast, affronted trot, a quick tiny stride, and a
    /// sergeant's patrol radius. Offered any perch, she declines it and
    /// takes each tread on her own two feet (canon: the ten thousand
    /// stairs, marched).
    /// </summary>
    public class MoaController : CompanionController
    {
        protected override string CompanionId => "moa";

        void Reset()
        {
            trotSpeed = 2.8f;
            runSpeed = 5.2f;
            turnDegreesPerSecond = 540f;
            bobAmplitude = 0.03f;
            bobFrequency = 6.5f;
        }
    }
}
