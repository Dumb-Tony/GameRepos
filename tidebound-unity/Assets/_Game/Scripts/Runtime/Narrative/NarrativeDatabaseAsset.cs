using UnityEngine;

namespace Tidebound.Narrative
{
    /// <summary>
    /// ScriptableObject wrapper the game references at runtime. Kept thin
    /// on purpose: the JSON stays the single source of truth (re-runnable
    /// extractor), this asset just points at it and caches the parse.
    /// Created/updated via Tidebound ▸ Narrative ▸ Import Content JSON.
    /// </summary>
    [CreateAssetMenu(fileName = "NarrativeDatabase", menuName = "Tidebound/Narrative Database")]
    public class NarrativeDatabaseAsset : ScriptableObject
    {
        [Tooltip("tidebound-content.json produced by Tools/extract-vn-content.mjs")]
        public TextAsset sourceJson;

        NarrativeDatabase _db;

        public NarrativeDatabase Database
        {
            get
            {
                if (_db == null && sourceJson != null)
                    _db = NarrativeDatabase.Parse(sourceJson.text);
                return _db;
            }
        }

        /// <summary>Drop the cached parse (editor re-imports).</summary>
        public void Invalidate() => _db = null;
    }
}
