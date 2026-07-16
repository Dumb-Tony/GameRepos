namespace Tidebound
{
    /// <summary>
    /// Companion trust tiers. Trust is a hidden 0-100 value; tiers are the
    /// only thing the player ever perceives (as behavior, never numbers).
    /// Thresholds from engine.js TB.tier(): 25 / 50 / 75 / 100.
    /// </summary>
    public enum TrustTier
    {
        Wary = 0,
        Watchful = 1,
        Warming = 2,
        Bonded = 3,
        Kindred = 4,
    }
}
