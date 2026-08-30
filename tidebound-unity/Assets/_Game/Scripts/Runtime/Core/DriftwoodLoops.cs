using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace Tidebound
{
    /// <summary>What one finished life leaves in the next one's bones.</summary>
    public class LoopData
    {
        [JsonProperty("loops")] public int Loops;
        [JsonProperty("keepsake")] public string Keepsake;
        [JsonProperty("know")] public Dictionary<string, bool> Know = new Dictionary<string, bool>();

        public bool Knows(string flag) => Know.TryGetValue(flag, out var v) && v;
    }

    /// <summary>One heirloom: what it is, when a life has earned it, and
    /// what it does to the stranger who wakes on the beach holding it.</summary>
    public class Keepsake
    {
        public string Id;
        public string Name;
        public string Sub;
        public Func<GameState, bool> Available;
        public Action<GameState> Apply;
    }

    /// <summary>
    /// DRIFTWOOD LOOPS — the island remembers, and eventually so do you.
    /// Knowledge (not stuff) crosses between lives: banked at every ending
    /// and every death, applied to the next fresh run, which wakes stamped
    /// NGPLUS with the KNOW_* flags of everything a previous life truly
    /// learned. One keepsake — an object soaked in enough of a run to have
    /// become part of you — crosses with it. Ported from loops.js; pure, so
    /// the whole crossing is testable without touching a disk.
    /// </summary>
    public static class DriftwoodLoops
    {
        // ---- what a life leaves behind as KNOWING (loops.js KNOWLEDGE) ----
        public static readonly (string Flag, Func<GameState, bool> Learned)[] Knowledge =
        {
            ("KNOW_GRIN", s => s.Is("GRIN_MET")),
            ("KNOW_GULLET", s => s.Is("GULLET_MAP") || s.Is("GULLET1")),
            ("KNOW_EDDA", s => s.Is("EDDA_MET")),
            ("KNOW_NINE", s => s.Met.TryGetValue("nine", out var m) && m),
            ("KNOW_ROSA", s => s.Is("CHART_ROSA")),
            ("KNOW_SUNDERING", s => s.Is("VISION_SEEN")),
        };

        /// <summary>The crossing, made visible — one line per thing that carried.</summary>
        public static readonly Dictionary<string, string> KnowLines = new Dictionary<string, string>
        {
            ["KNOW_GRIN"] = "🐊 The mangroves have a landlord. Somewhere under your skin, you know his cold hour.",
            ["KNOW_GULLET"] = "🕳️ The dark under the island has a shape, and your hands remember its map.",
            ["KNOW_EDDA"] = "🍵 There is a woman on the mountain: tea, a shotgun, sixty years of knowing. Climb early.",
            ["KNOW_NINE"] = "🐙 Something in the tide pools sorts shells and keeps accounts. It will know you on sight.",
            ["KNOW_ROSA"] = "🗺️ On the north reef a drowned ship keeps her gold. Old ink marked the spot; the mark carried.",
            ["KNOW_SUNDERING"] = "🌋 You have seen the mountain break. In dreams you haven't had yet, it is still breaking.",
        };

        // ---- the heirlooms (loops.js KEEPSAKES) --------------------------
        public static readonly Keepsake[] Keepsakes =
        {
            new Keepsake
            {
                Id = "rope",
                Name = "🪢 A coil of good rope",
                Sub = "Every castaway's first wealth. You arrive already believing in yourself.",
                Available = _ => true,
                Apply = s => { s.Stat(Meter.Hope, 10); s.AddItem("multitool"); },
            },
            new Keepsake
            {
                Id = "tin",
                Name = "🩹 Edda's medicine tin",
                Sub = "Feverbark and salve, packed by hands that argued while they packed.",
                Available = s => s.Is("EDDA_MET"),
                Apply = s => { s.AddItem("medkit"); s.SetFlag("SALVE"); },
            },
            new Keepsake
            {
                Id = "chart",
                Name = "🗺️ The gullet chart",
                Sub = "A dead man's survey and your own marks. The under-island, pre-known.",
                Available = s => s.Is("GULLET_MAP") || s.Is("DEEP3") || s.Is("DIVED"),
                Apply = s => { s.SetFlag("GULLET_MAP"); s.AddRoute(RouteAxis.Depth, 4); },
            },
            new Keepsake
            {
                Id = "collar",
                Name = "🐕 Bosun's brass collar",
                Sub = "First of the line, last debt paid. Dogs know it on sight — and know you.",
                Available = s => s.Is("Q_KAVI_DONE") || (s.Companion == "kavi" && s.Trust >= 75),
                Apply = s => s.Warm("kavi", 3),
            },
            new Keepsake
            {
                Id = "seeds",
                Name = "🌾 A jar of the old colors",
                Sub = "The vault's rice, the impossible beans. Roots that arrive before you do.",
                Available = s => s.Is("KAARI_SEEDS") || s.Is("FARM") || s.Is("SEEDS"),
                Apply = s => { s.SetFlag("SEEDS"); s.AddRoute(RouteAxis.Roots, 4); },
            },
            new Keepsake
            {
                Id = "lamp",
                Name = "🏮 The covenant lamp",
                Sub = "It has been down to the pool. Some part of you never quite comes back up.",
                Available = s => s.Is("TIDEWELL_KEEP") || s.Is("TIDEWELL_WITNESS"),
                Apply = s => { s.Stat(Meter.Hope, 6); s.AddRoute(RouteAxis.Depth, 3); },
            },
        };

        public static Keepsake KeepsakeById(string id)
        {
            if (string.IsNullOrEmpty(id)) return null;
            foreach (var k in Keepsakes)
                if (k.Id == id) return k;
            return null;
        }

        public static List<Keepsake> AvailableKeepsakes(GameState s)
        {
            var list = new List<Keepsake>();
            if (s == null) return list;
            foreach (var k in Keepsakes)
                if (k.Available(s)) list.Add(k);
            return list;
        }

        /// <summary>
        /// Bank a finished life — once for the count, always for the
        /// knowledge. A keepsake is only recorded when one was chosen; the
        /// previous heirloom keeps its place until something replaces it.
        /// </summary>
        public static void Bank(LoopData data, GameState s, string keepsakeId = null)
        {
            if (data == null || s == null) return;
            if (!s.Is("LOOP_BANKED"))
            {
                data.Loops += 1;
                s.SetFlag("LOOP_BANKED");
            }
            foreach (var (flag, learned) in Knowledge)
                if (learned(s)) data.Know[flag] = true;
            if (KeepsakeById(keepsakeId) != null) data.Keepsake = keepsakeId;
        }

        /// <summary>Dress a fresh state in everything the loops remember.</summary>
        public static void ApplyNew(GameState s, LoopData data)
        {
            if (s == null || data == null || data.Loops <= 0) return;
            s.SetFlag("NGPLUS");
            s.LoopsLived = data.Loops;
            foreach (var pair in data.Know)
                if (pair.Value) s.SetFlag(pair.Key);
            var keepsake = KeepsakeById(data.Keepsake);
            if (keepsake != null)
            {
                keepsake.Apply(s);
                s.SetFlag("KEEPSAKE_" + data.Keepsake.ToUpperInvariant());
            }
        }

        /// <summary>The lines for what actually carried into this life.</summary>
        public static List<string> CarriedLines(GameState s)
        {
            var t = new List<string>();
            if (s == null) return t;
            foreach (var (flag, _) in Knowledge)
                if (s.Is(flag) && KnowLines.TryGetValue(flag, out var line)) t.Add(line);
            return t;
        }
    }
}
