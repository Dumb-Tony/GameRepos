using System;
using System.Collections.Generic;

namespace Tidebound.Narrative
{
    /// <summary>
    /// The runtime shape of an authored story sequence — the 3D-native
    /// mirror of a VN scene: paragraphs (possibly state-dependent),
    /// then either branching choices with consequence subtext or a single
    /// continue. Pure C# (no UnityEngine) so tests can walk entire
    /// sequences and pin their effects, exactly like ClockTests pins drains.
    /// </summary>
    public class StoryScene
    {
        public string Id;
        /// <summary>The VN's `who` — shown as a header. Law #3: descriptive
        /// names only until the player learns real ones.</summary>
        public string Speaker;
        /// <summary>The VN's function-valued `who` (per-companion nameplates).
        /// When set, wins over Speaker.</summary>
        public Func<GameState, string> SpeakerDynamic;

        /// <summary>The nameplate for this state (dynamic wins).</summary>
        public string SpeakerFor(GameState s) => SpeakerDynamic != null ? SpeakerDynamic(s) : Speaker;
        /// <summary>The VN's `enter` — effects applied once on scene entry.
        /// Guard with a flag if re-entry must not double-apply.</summary>
        public Action<GameState> OnEnter;
        /// <summary>Paragraphs for this scene, resolved against state.</summary>
        public Func<GameState, List<string>> Text;
        /// <summary>Branching choices; null/empty = continue-style scene.</summary>
        public List<StoryChoice> Choices;
        /// <summary>Continue target for choice-less scenes (null = the end).</summary>
        public string Next;
        public string NextLabel = "Continue";

        public List<StoryChoice> AvailableChoices(GameState s)
        {
            if (Choices == null) return null;
            var list = new List<StoryChoice>();
            foreach (var c in Choices)
                if (c.When == null || c.When(s))
                    list.Add(c);
            return list;
        }
    }

    public class StoryChoice
    {
        /// <summary>The VN's `t` — what you do.</summary>
        public string Label;
        /// <summary>The VN's `sub` — what it might cost. Always show it.</summary>
        public string Sub;
        /// <summary>The VN's conditional choice guard.</summary>
        public Func<GameState, bool> When;
        /// <summary>The VN's `do` — effects on state.</summary>
        public Action<GameState> Do;
        /// <summary>The VN's `go` — next scene id (null = the end).</summary>
        public string Go;
        /// <summary>Dynamic destination (the VN's function-valued `go`);
        /// wins over Go when set. Returning null ends the story.</summary>
        public Func<GameState, string> GoDynamic;
    }

    /// <summary>A named bag of scenes with an entry check.</summary>
    public class StoryScript
    {
        readonly Dictionary<string, StoryScene> _scenes = new Dictionary<string, StoryScene>();

        public IEnumerable<StoryScene> All => _scenes.Values;

        public void Add(StoryScene scene) => _scenes[scene.Id] = scene;

        public StoryScene Get(string id) =>
            _scenes.TryGetValue(id, out var s)
                ? s
                : throw new KeyNotFoundException($"Story scene '{id}' is not in the script.");

        public bool Has(string id) => _scenes.ContainsKey(id);
    }

    /// <summary>
    /// Walks a script against a GameState: current scene, its resolved
    /// paragraphs and options, and the transitions. The UI renders this;
    /// tests drive it headless.
    /// </summary>
    public class StoryPlayback
    {
        readonly StoryScript _script;
        readonly GameState _state;

        public StoryScene Current { get; private set; }
        public bool Finished { get; private set; }
        /// <summary>Options captured at scene entry (stable for the UI).</summary>
        public List<StoryChoice> Options { get; private set; }

        public StoryPlayback(StoryScript script, GameState state, string startId)
        {
            _script = script;
            _state = state;
            Enter(startId);
        }

        public List<string> Paragraphs() => Current.Text(_state);

        /// <summary>Pick an option by index into Options.</summary>
        public void Choose(int index)
        {
            var choice = Options[index];
            choice.Do?.Invoke(_state);
            Enter(choice.GoDynamic != null ? choice.GoDynamic(_state) : choice.Go);
        }

        /// <summary>Advance a continue-style scene.</summary>
        public void Continue() => Enter(Current.Next);

        void Enter(string id)
        {
            if (id == null)
            {
                Finished = true;
                Current = null;
                Options = null;
                return;
            }
            Current = _script.Get(id);
            Current.OnEnter?.Invoke(_state);
            Options = Current.AvailableChoices(_state);
            // every choice When-filtered away = a continue-style scene (the
            // VN's choices() returning [] shows nextLabel — same rule here)
            if (Options != null && Options.Count == 0) Options = null;
        }
    }
}
