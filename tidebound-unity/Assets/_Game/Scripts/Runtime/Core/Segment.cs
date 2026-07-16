namespace Tidebound
{
    /// <summary>
    /// The four segments of a Tidebound day. Serialized as ints 0-3 to
    /// match the VN's state (engine.js TB.SEGS: Dawn, Day, Dusk, Night).
    /// </summary>
    public enum Segment
    {
        Dawn = 0,
        Day = 1,
        Dusk = 2,
        Night = 3,
    }
}
