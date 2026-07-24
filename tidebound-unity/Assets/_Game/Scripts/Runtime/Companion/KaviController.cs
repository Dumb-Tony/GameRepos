namespace Tidebound
{
    /// <summary>
    /// Kavi in the world — the storm-grey chassis on the shared companion
    /// machinery (CompanionController): Wary patrols the wide circle
    /// pretending not to be yours; Watchful follows at five paces;
    /// Warming+ takes the fireside; Bonded shadows; Kindred is pack.
    /// Serialized fields (model, tailWag, points, gait) live on the base
    /// under the same names, so the scene's existing rig keeps its wiring.
    /// </summary>
    public class KaviController : CompanionController
    {
        protected override string CompanionId => "kavi";
    }
}
