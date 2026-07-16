using System.Linq;
using Tidebound.Narrative;
using UnityEditor;
using UnityEngine;

namespace Tidebound.EditorTools
{
    /// <summary>
    /// Imports the extractor's tidebound-content.json into the
    /// NarrativeDatabaseAsset the game references. Re-run after every
    /// `node Tools/extract-vn-content.mjs`.
    /// </summary>
    public static class NarrativeImporter
    {
        const string JsonPath = "Assets/_Game/Data/Narrative/tidebound-content.json";
        const string AssetPath = "Assets/_Game/Data/Narrative/NarrativeDatabase.asset";

        [MenuItem("Tidebound/Narrative/Import Content JSON")]
        public static void Import()
        {
            var json = AssetDatabase.LoadAssetAtPath<TextAsset>(JsonPath);
            if (json == null)
            {
                Debug.LogError($"[Tidebound] No TextAsset at {JsonPath}. " +
                               "Run `node Tools/extract-vn-content.mjs` first.");
                return;
            }

            // parse first — a bad file must never be wired into the asset
            var db = NarrativeDatabase.Parse(json.text);
            var unresolved = db.UnresolvedTargets()
                .Except(db.Content.Meta.UnknownGoTargets ?? Enumerable.Empty<string>().ToList())
                .ToList();
            if (unresolved.Count > 0)
                Debug.LogWarning("[Tidebound] Unresolved scene targets: " + string.Join(", ", unresolved));

            var asset = AssetDatabase.LoadAssetAtPath<NarrativeDatabaseAsset>(AssetPath);
            if (asset == null)
            {
                asset = ScriptableObject.CreateInstance<NarrativeDatabaseAsset>();
                AssetDatabase.CreateAsset(asset, AssetPath);
            }

            asset.sourceJson = json;
            asset.Invalidate();
            EditorUtility.SetDirty(asset);
            AssetDatabase.SaveAssets();

            Debug.Log($"[Tidebound] Narrative imported: {db.SceneCount} scenes, " +
                      $"{db.Content.Schedule.Count} scheduled events, " +
                      $"{db.Content.Regions?.Count ?? 0} regions, " +
                      $"{db.Content.Trinkets?.Count ?? 0} trinkets, " +
                      $"{db.Content.Species?.Count ?? 0} species, " +
                      $"{db.Content.Endings?.Count ?? 0} endings → {AssetPath}");
        }
    }
}
