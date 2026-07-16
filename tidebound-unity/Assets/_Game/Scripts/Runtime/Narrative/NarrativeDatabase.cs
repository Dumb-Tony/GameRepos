using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;

namespace Tidebound.Narrative
{
    /// <summary>
    /// Parsed, indexed narrative content. Wraps NarrativeContent with the
    /// lookups gameplay code actually needs.
    /// </summary>
    public class NarrativeDatabase
    {
        public NarrativeContent Content { get; private set; }

        Dictionary<string, SceneRecord> _byId;

        public static NarrativeDatabase Parse(string json)
        {
            var content = JsonConvert.DeserializeObject<NarrativeContent>(json);
            var db = new NarrativeDatabase
            {
                Content = content,
                _byId = new Dictionary<string, SceneRecord>(),
            };
            foreach (var s in content.Scenes)
                db._byId[s.Id] = s;
            return db;
        }

        public int SceneCount => _byId.Count;

        public bool HasScene(string id) => _byId.ContainsKey(id);

        public SceneRecord GetScene(string id) =>
            _byId.TryGetValue(id, out var s) ? s : null;

        public IEnumerable<SceneRecord> ScenesFromFile(string file) =>
            Content.Scenes.Where(s => s.File == file);

        /// <summary>Scheduled events for a given day (optionally a segment).</summary>
        public IEnumerable<ScheduleEntry> ScheduledFor(int day, int? seg = null) =>
            Content.Schedule.Where(e => e.Day == day && (seg == null || e.Seg == null || e.Seg == seg));

        /// <summary>
        /// Static go/next targets that don't resolve to a known scene.
        /// Should stay empty; the importer and tests both check it.
        /// </summary>
        public List<string> UnresolvedTargets()
        {
            var missing = new SortedSet<string>();
            foreach (var s in Content.Scenes)
            {
                if (s.Next != null && !HasScene(s.Next)) missing.Add(s.Next);
                foreach (var c in s.Choices ?? Enumerable.Empty<ChoiceRecord>())
                    if (c.Go != null && !HasScene(c.Go)) missing.Add(c.Go);
            }
            return missing.ToList();
        }
    }
}
