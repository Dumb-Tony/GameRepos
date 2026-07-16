using System;
using System.Collections.Generic;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Tidebound.Narrative
{
    /// <summary>
    /// Typed mirror of tidebound-content.json — the dump produced by
    /// Tools/extract-vn-content.mjs from the shipped VN. Unknown/extra
    /// fields are preserved via [JsonExtensionData] so re-running a newer
    /// extractor never breaks parsing.
    /// </summary>
    [Serializable]
    public class NarrativeContent
    {
        [JsonProperty("format")] public int Format;
        [JsonProperty("meta")] public NarrativeMeta Meta;
        /// <summary>Chapter boundaries by day (engine.js TB.CAL).</summary>
        [JsonProperty("calendar")] public Dictionary<string, int> Calendar;
        [JsonProperty("segments")] public List<string> Segments;
        [JsonProperty("scenes")] public List<SceneRecord> Scenes;
        [JsonProperty("schedule")] public List<ScheduleEntry> Schedule;
        [JsonProperty("regions")] public Dictionary<string, RegionRecord> Regions;
        [JsonProperty("trinkets")] public List<TrinketRecord> Trinkets;
        [JsonProperty("species")] public List<SpeciesRecord> Species;
        /// <summary>Ending cores keyed by id (scenes-chapter7.js CORES). Loose:
        /// the entries are prose-rich and evolving.</summary>
        [JsonProperty("endings")] public JObject Endings;
    }

    [Serializable]
    public class NarrativeMeta
    {
        [JsonProperty("source")] public string Source;
        [JsonProperty("sourceVersion")] public int? SourceVersion;
        [JsonProperty("files")] public List<string> Files;
        [JsonProperty("sceneCount")] public int SceneCount;
        [JsonProperty("scheduleCount")] public int ScheduleCount;
        /// <summary>go/next targets owned by engine/menu files the extractor
        /// doesn't load. Empty today; a test guards that it stays empty.</summary>
        [JsonProperty("unknownGoTargets")] public List<string> UnknownGoTargets;
        [JsonProperty("note")] public string Note;
    }

    [Serializable]
    public class SceneRecord
    {
        [JsonProperty("id")] public string Id;
        /// <summary>Source file in the VN (e.g. "scenes-chapter1.js").</summary>
        [JsonProperty("file")] public string File;
        [JsonProperty("bg")] public string Bg;
        [JsonProperty("bgDynamic")] public bool BgDynamic;
        [JsonProperty("who")] public JToken Who;
        [JsonProperty("hasEnter")] public bool HasEnter;
        [JsonProperty("enterEffects")] public EffectsRecord EnterEffects;
        /// <summary>True when the VN computes this prose from state; the dump
        /// holds one representative evaluation and the JS holds the rest.</summary>
        [JsonProperty("textDynamic")] public bool TextDynamic;
        [JsonProperty("text")] public List<string> Text;
        [JsonProperty("textFlagsRead")] public List<string> TextFlagsRead;
        [JsonProperty("choicesDynamic")] public bool ChoicesDynamic;
        [JsonProperty("choices")] public List<ChoiceRecord> Choices;
        [JsonProperty("next")] public string Next;
        [JsonProperty("nextDynamic")] public bool NextDynamic;
        [JsonProperty("nextResolved")] public string NextResolved;
        [JsonProperty("nextLabel")] public string NextLabel;

        [JsonExtensionData] public IDictionary<string, JToken> Extra;
    }

    [Serializable]
    public class ChoiceRecord
    {
        /// <summary>Choice label (the VN's `t`).</summary>
        [JsonProperty("t")] public string Label;
        /// <summary>Consequence subtext (the VN's `sub`).</summary>
        [JsonProperty("sub")] public string Sub;
        [JsonProperty("conditional")] public bool Conditional;
        [JsonProperty("conditionFlagsRead")] public List<string> ConditionFlagsRead;
        [JsonProperty("effects")] public EffectsRecord Effects;
        [JsonProperty("go")] public string Go;
        [JsonProperty("goDynamic")] public bool GoDynamic;
        [JsonProperty("goResolved")] public string GoResolved;

        [JsonExtensionData] public IDictionary<string, JToken> Extra;
    }

    /// <summary>What a handler did to state when evaluated once.</summary>
    [Serializable]
    public class EffectsRecord
    {
        [JsonProperty("flagsRead")] public List<string> FlagsRead;
        [JsonProperty("flagsSet")] public Dictionary<string, bool> FlagsSet;
        [JsonProperty("stats")] public Dictionary<string, float> Stats;
        [JsonProperty("route")] public Dictionary<string, int> Route;
        [JsonProperty("items")] public Dictionary<string, int> Items;
        [JsonProperty("bond")] public int Bond;
        [JsonProperty("meets")] public List<string> Meets;
        /// <summary>Day segments this action consumed (tickSegment calls).</summary>
        [JsonProperty("segments")] public int Segments;
    }

    [Serializable]
    public class ScheduleEntry
    {
        [JsonProperty("day")] public int? Day;
        [JsonProperty("seg")] public int? Seg;
        [JsonProperty("sceneId")] public string SceneId;
        /// <summary>True when the VN guards this event with a `when` predicate.</summary>
        [JsonProperty("conditional")] public bool Conditional;
    }

    [Serializable]
    public class RegionRecord
    {
        [JsonProperty("name")] public string Name;
        [JsonProperty("e")] public string Emoji;
        [JsonProperty("x")] public float X;
        [JsonProperty("y")] public float Y;
        [JsonProperty("bg")] public string Bg;
        [JsonProperty("sub")] public string Sub;
        /// <summary>First-visit set-piece prose.</summary>
        [JsonProperty("first")] public List<string> First;
        /// <summary>Rotating return-visit finds (loose shape).</summary>
        [JsonProperty("deck")] public JArray Deck;

        [JsonExtensionData] public IDictionary<string, JToken> Extra;
    }

    [Serializable]
    public class TrinketRecord
    {
        [JsonProperty("id")] public string Id;
        [JsonProperty("e")] public string Emoji;
        [JsonProperty("name")] public string Name;
        [JsonProperty("short")] public string Short;
        /// <summary>Find source: shore | mud | green …</summary>
        [JsonProperty("src")] public string Source;
        [JsonProperty("line")] public string Line;

        [JsonExtensionData] public IDictionary<string, JToken> Extra;
    }

    [Serializable]
    public class SpeciesRecord
    {
        [JsonProperty("id")] public string Id;
        [JsonProperty("e")] public string Emoji;
        [JsonProperty("name")] public string Name;
        [JsonProperty("art")] public string Art;
        [JsonProperty("blurb")] public string Blurb;

        [JsonExtensionData] public IDictionary<string, JToken> Extra;
    }
}
