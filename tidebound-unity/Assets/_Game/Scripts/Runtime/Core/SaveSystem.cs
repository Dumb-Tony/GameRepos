using System.IO;
using Newtonsoft.Json;
using UnityEngine;

namespace Tidebound
{
    /// <summary>
    /// JSON save/load. Pure string round-trip (unit-testable) plus thin
    /// file helpers. Slot files live in Application.persistentDataPath.
    /// </summary>
    public static class SaveSystem
    {
        public const int FormatVersion = 1;

        static readonly JsonSerializerSettings Settings = new JsonSerializerSettings
        {
            Formatting = Formatting.Indented,
            NullValueHandling = NullValueHandling.Include,
            // dictionaries/lists replace defaults instead of merging into them
            ObjectCreationHandling = ObjectCreationHandling.Replace,
        };

        public static string ToJson(GameState state) =>
            JsonConvert.SerializeObject(new SaveFile { Version = FormatVersion, State = state }, Settings);

        public static GameState FromJson(string json)
        {
            var file = JsonConvert.DeserializeObject<SaveFile>(json, Settings);
            return file?.State;
        }

        public static void Save(GameState state, string path)
        {
            var dir = Path.GetDirectoryName(path);
            if (!string.IsNullOrEmpty(dir)) Directory.CreateDirectory(dir);
            File.WriteAllText(path, ToJson(state));
        }

        public static GameState Load(string path) =>
            File.Exists(path) ? FromJson(File.ReadAllText(path)) : null;

        public static bool HasSave(string path) => File.Exists(path);

        public static string SlotPath(int slot = 0) =>
            Path.Combine(Application.persistentDataPath, $"tidebound-save-{slot}.json");

        class SaveFile
        {
            [JsonProperty("version")] public int Version;
            [JsonProperty("state")] public GameState State;
        }
    }
}
