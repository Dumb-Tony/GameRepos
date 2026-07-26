using System.IO;
using Newtonsoft.Json;
using UnityEngine;

namespace Tidebound
{
    /// <summary>
    /// Where the loops live between lives: one small JSON file beside the
    /// save, deliberately NOT deleted when a run is wiped — that is the
    /// whole point of it. The logic is all in DriftwoodLoops; this only
    /// moves it to and from a disk.
    /// </summary>
    public static class LoopStore
    {
        public static string Path =>
            System.IO.Path.Combine(Application.persistentDataPath, "tidebound-loops.json");

        public static LoopData Load()
        {
            try
            {
                if (File.Exists(Path))
                    return JsonConvert.DeserializeObject<LoopData>(File.ReadAllText(Path)) ?? new LoopData();
            }
            catch (System.Exception e)
            {
                Debug.LogWarning("[Tidebound] loops unreadable, starting the count again: " + e.Message);
            }
            return new LoopData();
        }

        public static void Save(LoopData data)
        {
            try
            {
                File.WriteAllText(Path, JsonConvert.SerializeObject(data, Formatting.Indented));
            }
            catch (System.Exception e)
            {
                Debug.LogWarning("[Tidebound] loops unwritable: " + e.Message);
            }
        }

        /// <summary>Bank a finished life and keep it.</summary>
        public static void BankRun(GameState s, string keepsakeId = null)
        {
            var data = Load();
            DriftwoodLoops.Bank(data, s, keepsakeId);
            Save(data);
        }

        /// <summary>Dress a fresh run in what the loops remember.</summary>
        public static void DressNewRun(GameState s) => DriftwoodLoops.ApplyNew(s, Load());
    }
}
