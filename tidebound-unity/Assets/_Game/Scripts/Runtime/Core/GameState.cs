using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace Tidebound
{
    /// <summary>
    /// The whole game in one serializable object — a faithful port of the
    /// VN's state (engine.js TB.newState). JSON property names match the
    /// VN's keys so saves stay human-readable and a VN-save import remains
    /// possible later.
    ///
    /// Meters are floats internally (the VN's segment drains produce
    /// fractional values under the Kind Tide modifier); UI rounds.
    /// </summary>
    [Serializable]
    public class GameState
    {
        // ---- clock & story position ---------------------------------
        [JsonProperty("scene")] public string CurrentScene = "title";
        [JsonProperty("day")] public int Day;
        [JsonProperty("seg")] public Segment Seg = Segment.Dawn;
        [JsonProperty("chapter")] public int Chapter = 1;

        // ---- meters ---------------------------------------------------
        [JsonProperty("stats")] public Meters Stats = new Meters();

        // ---- identity & humans ---------------------------------------
        /// <summary>Background: "medic" | "photog" | "cook" | "engineer".</summary>
        [JsonProperty("bgnd")] public string Background;
        [JsonProperty("edda")] public int Edda;
        [JsonProperty("ryo")] public int Ryo;

        // ---- the Ledger -----------------------------------------------
        [JsonProperty("flags")] public Dictionary<string, bool> Flags = new Dictionary<string, bool>();
        [JsonProperty("inv")] public Dictionary<string, int> Inventory = new Dictionary<string, int>();
        [JsonProperty("route")] public RoutePoints Route = new RoutePoints();
        [JsonProperty("fired")] public Dictionary<string, bool> FiredEvents = new Dictionary<string, bool>();

        // ---- companion -------------------------------------------------
        /// <summary>Companion id: kavi | ipo | vela | buri | moa | nine — or null.</summary>
        [JsonProperty("companion")] public string Companion;
        /// <summary>Hidden trust 0-100. Never shown as a number.</summary>
        [JsonProperty("trust")] public int Trust;
        [JsonProperty("tierSeen")] public int TierSeen;
        [JsonProperty("met")] public Dictionary<string, bool> Met = new Dictionary<string, bool>();
        /// <summary>Courtship warmth per animal (act-1 interest).</summary>
        [JsonProperty("interest")] public Dictionary<string, int> Interest = new Dictionary<string, int>();
        /// <summary>Day the companion was hurt (peril arc), or null. Companions never die.</summary>
        [JsonProperty("chInjured")] public CompanionInjury CompanionInjured;

        // ---- camp & survival -------------------------------------------
        [JsonProperty("site")] public string Site;
        [JsonProperty("fire")] public int Fire;
        /// <summary>
        /// Segments of fuel left in the fire. Unity-only key (the 3D fire
        /// burns down in real time; the VN's fire is a tier). Absent in VN
        /// saves — defaults to 0 and the campfire re-grants a margin on load.
        /// </summary>
        [JsonProperty("fireFuel")] public float FireFuel;
        [JsonProperty("shelter")] public int Shelter;
        [JsonProperty("food")] public int Food;
        [JsonProperty("injury")] public string Injury;
        [JsonProperty("disease")] public string Disease;
        [JsonProperty("pools")] public int TidePoolVisits;
        /// <summary>Day of the last defeated E-wing attempt (a beaten door doesn't re-ask until tomorrow).</summary>
        [JsonProperty("ewingTry")] public int EwingTry = -1;
        [JsonProperty("deathCause")] public string DeathCause;
        /// <summary>Core ending id (scenes-chapter7.js CORES key), or null.</summary>
        [JsonProperty("endingId")] public string EndingId;

        // ---- NG+ ---------------------------------------------------------
        /// <summary>Run modifier: "hard" | "silent" | "kind" | "chaos" — or null.</summary>
        [JsonProperty("mod")] public string RunModifier;

        /// <summary>Save-format version (VN calendar v2 = the 100-day calendar).</summary>
        [JsonProperty("_cal")] public int CalendarVersion = 2;

        // ================================================================
        public static GameState NewGame()
        {
            return new GameState
            {
                CurrentScene = "title",
                Day = 0,
                Seg = Segment.Dawn,
                Chapter = 1,
                Stats = new Meters(),
            };
        }

        // ---- meters (TB.stat: apply, round, clamp) -----------------------
        public float GetStat(Meter m) => Stats.Get(m);

        public void Stat(Meter m, float delta)
        {
            Stats.Set(m, Clamp((float)Math.Round(Stats.Get(m) + delta), 0f, 100f));
        }

        // ---- flags (TB.flag / TB.is) -------------------------------------
        public void SetFlag(string key, bool value = true) => Flags[key] = value;

        public bool Is(string key) => Flags.TryGetValue(key, out var v) && v;

        // ---- inventory (TB.item / TB.has) --------------------------------
        public void AddItem(string key, int delta = 1)
        {
            Inventory.TryGetValue(key, out var n);
            n = Math.Max(0, n + delta);
            if (n == 0) Inventory.Remove(key);
            else Inventory[key] = n;
        }

        public bool Has(string key) => Inventory.TryGetValue(key, out var n) && n > 0;

        public int Count(string key) => Inventory.TryGetValue(key, out var n) ? n : 0;

        // ---- route (TB.route) ---------------------------------------------
        public void AddRoute(RouteAxis axis, int delta)
        {
            switch (axis)
            {
                case RouteAxis.Signal: Route.Signal += delta; break;
                case RouteAxis.Roots: Route.Roots += delta; break;
                case RouteAxis.Depth: Route.Depth += delta; break;
            }
        }

        // ---- companion trust (TB.bond / TB.tier / TB.meet / TB.warm) ------
        public void Bond(int delta) => Trust = (int)Clamp(Trust + delta, 0, 100);

        public TrustTier Tier =>
            Trust >= 100 ? TrustTier.Kindred :
            Trust >= 75 ? TrustTier.Bonded :
            Trust >= 50 ? TrustTier.Warming :
            Trust >= 25 ? TrustTier.Watchful :
            TrustTier.Wary;

        public void Meet(string animal, int warmth = 0)
        {
            Met[animal] = true;
            Warm(animal, warmth);
        }

        public void Warm(string animal, int delta)
        {
            Interest.TryGetValue(animal, out var w);
            Interest[animal] = w + delta;
        }

        // ---- the clock (TB.tickSegment, faithful port) ---------------------
        /// <summary>
        /// The Long Rain: chapter 5, or a chapter early on the Hard Season
        /// NG+ modifier.
        /// </summary>
        [JsonIgnore]
        public bool IsMonsoon => Chapter == 5 || (RunModifier == "hard" && Chapter >= 4);

        /// <summary>
        /// Advance one segment of the day, applying survival drains exactly
        /// as the VN does. Segment wraps Night → Dawn and increments Day.
        /// Sets DeathCause when health bottoms out — the caller routes to
        /// the death scene; nothing here kills silently (the island always
        /// warns first via low-meter UI, which is the caller's job).
        /// </summary>
        public void TickSegment()
        {
            bool monsoon = IsMonsoon;
            float k = RunModifier == "kind" ? 0.6f : 1f;

            Stats.Hunger = Clamp(Stats.Hunger - (monsoon ? 8f : 6f) * k, 0f, 100f);
            Stats.Thirst = Clamp(Stats.Thirst - (monsoon ? 3f : Site == "overhang" ? 8f : 6f) * k, 0f, 100f);
            Stats.Energy = Clamp(Stats.Energy - (monsoon ? 4f : 3f) * k, 0f, 100f);

            if (Stats.Hunger == 0f) Stats.Health = Clamp(Stats.Health - 8f * k, 0f, 100f);
            if (Stats.Thirst == 0f) Stats.Health = Clamp(Stats.Health - 12f * k, 0f, 100f);
            if (Injury != null) Stats.Health = Clamp(Stats.Health - 2f, 0f, 100f);

            // an untended companion heals on the wild's own schedule — nobody dies
            if (CompanionInjured != null && Day - CompanionInjured.Day >= 5)
            {
                CompanionInjured = null;
                SetFlag("PERIL_SELFHEALED");
            }

            if (Disease == "fever")
            {
                Stats.Health = Clamp(Stats.Health - 1f, 0f, 100f);
                if (Stats.Energy > 55f) Stats.Energy = 55f;
            }

            if (Stats.Health <= 0f && DeathCause == null)
            {
                DeathCause = Disease == "fever" ? "fever"
                    : Stats.Thirst == 0f ? "thirst"
                    : Stats.Hunger == 0f ? "hunger"
                    : "injury";
            }

            if (Seg == Segment.Night)
            {
                Seg = Segment.Dawn;
                Day += 1;
            }
            else
            {
                Seg += 1;
            }
        }

        public static float Clamp(float v, float a, float b) => Math.Max(a, Math.Min(b, v));
    }

    /// <summary>The five meters, 0-100. VN starting values.</summary>
    [Serializable]
    public class Meters
    {
        [JsonProperty("health")] public float Health = 100f;
        [JsonProperty("hunger")] public float Hunger = 80f;
        [JsonProperty("thirst")] public float Thirst = 75f;
        [JsonProperty("energy")] public float Energy = 85f;
        [JsonProperty("hope")] public float Hope = 55f;

        public float Get(Meter m)
        {
            switch (m)
            {
                case Meter.Health: return Health;
                case Meter.Hunger: return Hunger;
                case Meter.Thirst: return Thirst;
                case Meter.Energy: return Energy;
                default: return Hope;
            }
        }

        public void Set(Meter m, float v)
        {
            switch (m)
            {
                case Meter.Health: Health = v; break;
                case Meter.Hunger: Hunger = v; break;
                case Meter.Thirst: Thirst = v; break;
                case Meter.Energy: Energy = v; break;
                default: Hope = v; break;
            }
        }
    }

    /// <summary>Signal / Roots / Depth. Invisible; the world reacts instead.</summary>
    [Serializable]
    public class RoutePoints
    {
        [JsonProperty("signal")] public int Signal;
        [JsonProperty("roots")] public int Roots;
        [JsonProperty("depth")] public int Depth;

        [JsonIgnore]
        public RouteAxis Dominant =>
            Signal >= Roots && Signal >= Depth ? RouteAxis.Signal :
            Roots >= Depth ? RouteAxis.Roots : RouteAxis.Depth;
    }

    /// <summary>The peril arc's bookkeeping. Companions never die.</summary>
    [Serializable]
    public class CompanionInjury
    {
        [JsonProperty("day")] public int Day;
    }
}
