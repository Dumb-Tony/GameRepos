using System.Collections.Generic;
using System.IO;
using Tidebound.Narrative;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace Tidebound
{
    public enum ToastKind { Info, Warning, Severe, Good }

    /// <summary>
    /// The run's conductor: owns the GameState, wires the clock, applies
    /// action time costs, watches the meters for warnings (law #1), levies
    /// the night exposure tax, autosaves at dawn, and routes death to the
    /// canonical death cards. Scene objects reach it via Instance.
    /// </summary>
    public class GameManager : MonoBehaviour
    {
        public static GameManager Instance { get; private set; }

        [Header("Wired by the scene builder")]
        public GameClock clock;
        public PlayerController player;
        public OrbitCamera cam;
        public PlayerInteractor interactor;
        public PrologueStageDirector prologueDirector;

        [Header("Time costs (segments) — pacing knobs, tune freely. The rule: " +
                "labors (hours of work) cost time; gestures (picking up a stick, " +
                "drinking, feeding the fire) are free — walking there was the cost.")]
        public float forageCost = 0.5f;
        public float coconutCost = 0.25f;
        public float makeFireCost = 0.4f;
        public float feedFireCost = 0f;
        public float cookCost = 0.5f;
        public float restCost = 0.5f;
        public float buildCost = 0.75f;
        public float drinkCost = 0f;
        public float gatherCost = 0f;
        public float sosCost = 0.5f;

        [Header("Exposure (the cold tax; warned at dusk)")]
        public float exposureHealth = 6f;
        public float exposureHope = 4f;

        public GameState State { get; private set; }
        public bool IsDead => State != null && State.DeathCause != null;
        public HudController Hud { get; private set; }
        public DialogueUI Dialogue { get; private set; }
        public JournalUI Journal { get; private set; }

        public bool DialogueActive { get; private set; }
        public bool JournalOpen { get; private set; }

        readonly WarningSystem _warnings = new WarningSystem();
        bool _sleeping;
        bool _collapsing;

        // ---- lifecycle ---------------------------------------------------
        void Awake()
        {
            Instance = this;
            State = LoadOrFresh();
            FireLogic.ReconcileAfterLoad(State);
            if (clock != null)
            {
                clock.State = State;
                clock.SyncToState();
                clock.SegmentTicked += OnSegmentTicked;
            }
            Hud = HudController.Create(this);
            Dialogue = DialogueUI.Create(this);
            Journal = JournalUI.Create(this);
        }

        void Start()
        {
            LockCursor(true);
            if (!State.Is("PROLOGUE_DONE"))
            {
                if (State.Day <= 0)
                {
                    // a fresh life: the crash, who you were, the salvage, the glow
                    System.Action onPrologueDone = () =>
                    {
                        State.SetFlag("PROLOGUE_DONE");
                        clock.SyncToState(); // night0 moved us to Day 1, Dawn
                        SaveNow();
                        Toast("WASD to move · Shift to run · E/F/C to act · J opens the Ledger · Esc frees the mouse.", ToastKind.Info);
                    };
                    if (prologueDirector != null) prologueDirector.PlayPrologue(this, onPrologueDone);
                    else Dialogue.Play(PrologueScript.Build(), PrologueScript.Start, onPrologueDone);
                }
                else
                {
                    // a save from before the prologue existed — don't replay it mid-run
                    State.SetFlag("PROLOGUE_DONE");
                }
            }
        }

        void OnDestroy()
        {
            if (Instance == this) Instance = null;
            if (clock != null) clock.SegmentTicked -= OnSegmentTicked;
        }

        void OnApplicationQuit() { if (!IsDead) SaveNow(); }

        void Update()
        {
            if (!DialogueActive)
            {
                if (GameInput.CancelPressed) LockCursor(false);
                else if (GameInput.AnyMouseButtonPressed && Cursor.lockState != CursorLockMode.Locked && !IsDead)
                    LockCursor(true);
            }

            if (IsDead)
            {
                if (GameInput.ConfirmPressed) Restart();
                return;
            }

            if (!DialogueActive && GameInput.JournalPressed) Journal.Toggle();
            if (DialogueActive || JournalOpen) return; // the world is frozen; nothing below applies

            foreach (var w in _warnings.Check(State.Stats))
                Toast(w.Message, w.Severe ? ToastKind.Severe : ToastKind.Warning);

            CheckCollapse();
            CheckDeath();
        }

        // ---- world freeze (dialogue / journal / death) ----------------------
        int _dialogueEndFrame = -1;

        /// <summary>The key that closed a dialogue must not also act in the world.</summary>
        public bool DialogueJustClosed => Time.frameCount == _dialogueEndFrame;

        public void SetDialogueActive(bool active)
        {
            DialogueActive = active;
            if (!active) _dialogueEndFrame = Time.frameCount;
            ApplyFreeze();
        }

        public void SetJournalOpen(bool open)
        {
            JournalOpen = open;
            ApplyFreeze();
        }

        void ApplyFreeze()
        {
            bool frozen = DialogueActive || JournalOpen || IsDead;
            if (clock != null) clock.paused = frozen;
            if (player != null) player.inputLocked = frozen;
            if (cam != null) cam.inputLocked = frozen;
            if (interactor != null) interactor.inputLocked = frozen;
            LockCursor(!(DialogueActive || IsDead)); // reading and dying free the mouse
            if (Hud != null) Hud.gameObject.SetActive(!DialogueActive);
        }

        // ---- the segment tick ---------------------------------------------
        void OnSegmentTicked(Segment seg)
        {
            // the turning of the light, narrated — the clock you can feel
            if (!_sleeping)
            {
                switch (seg)
                {
                    case Segment.Day: Toast("Midday. The sun stops being gentle about it.", ToastKind.Info); break;
                    case Segment.Dusk: Toast("Dusk. The light goes long and starts packing to leave.", ToastKind.Info); break;
                    case Segment.Night: Toast("Night settles in like it owns the place. It does.", ToastKind.Info); break;
                }
            }

            if (FireLogic.ConsumeSegment(State))
                Toast("The fire lets go. Grey threads. Gone.", ToastKind.Warning);
            else if (FireLogic.IsEmbers(State))
                Toast("The fire is down to embers. It dies within the hour untended.", ToastKind.Warning);

            if (WarningSystem.ExposureWarningDue(State, seg))
                Toast("The wind turns and the day's warmth leaves like a tide. No roof, no fire — tonight will cost you.", ToastKind.Warning);

            // the night was just consumed (we're at the new dawn)
            if (seg == Segment.Dawn)
            {
                if (!_sleeping && State.Fire <= 0 && State.Shelter <= 0)
                {
                    // awake, cold, and warned at dusk: the island collects
                    State.Stat(Meter.Health, -exposureHealth);
                    State.Stat(Meter.Hope, -exposureHope);
                    Toast("The night takes its tax in shivers. You watch the grey come up with your arms around your knees.", ToastKind.Severe);
                    if (State.Stats.Health <= 0f && State.DeathCause == null)
                        State.DeathCause = "coldfire";
                }
                if (State.DeathCause == null)
                {
                    Toast($"Day {State.Day}.", ToastKind.Info);
                    SaveNow();
                }
            }

            CheckDeath();
        }

        // ---- actions (interactables call these) ----------------------------
        public void Forage(ForagePoint point)
        {
            var r = SurvivalActions.Forage(State, () => Random.value);
            point.Deplete(State);
            AfterAction(r, forageCost);
        }

        public void Coconuts(ForagePoint point)
        {
            var r = SurvivalActions.Coconuts(State);
            point.Deplete(State);
            AfterAction(r, coconutCost);
        }

        public void GatherDriftwood(ForagePoint point)
        {
            State.AddItem(Items.Driftwood, 1);
            point.Deplete(State);
            AfterAction(ActionResult.Ok($"Salt-silvered, sun-dried, honest wood. ({State.Count(Items.Driftwood)} carried)"), gatherCost);
        }

        public void MakeFire()
        {
            var r = SurvivalActions.MakeFire(State, () => Random.value);
            if (r.Success)
            {
                State.AddItem(Items.Driftwood, -1); // the wood becomes the fire
                FireLogic.Light(State);
            }
            AfterAction(r, makeFireCost);
        }

        public void FeedFire()
        {
            if (!State.Has(Items.Driftwood) || State.Fire < 1) return;
            State.AddItem(Items.Driftwood, -1);
            FireLogic.Feed(State);
            AfterAction(ActionResult.Ok("The fire takes the wood the way the sea takes everything: gratefully, and asking for more."), feedFireCost);
        }

        public void CookMeal() => AfterAction(SurvivalActions.CookMeal(State), cookCost);

        public void BuildShelter(int woodCost)
        {
            if (State.Count(Items.Driftwood) < woodCost) return;
            State.AddItem(Items.Driftwood, -woodCost);
            AfterAction(SurvivalActions.BuildShelter(State), buildCost);
        }

        public void Rest() => AfterAction(SurvivalActions.Rest(State), restCost);

        public void Drink() => AfterAction(SurvivalActions.Drink(State), drinkCost);

        public void StampSos() => AfterAction(SurvivalActions.StampSos(State), sosCost);

        public void SleepUntilDawn()
        {
            if (State.Seg != Segment.Dusk && State.Seg != Segment.Night)
            {
                Toast("Daylight is too expensive to sleep through.", ToastKind.Info);
                return;
            }
            _sleeping = true;
            var r = SurvivalActions.Sleep(State);
            Toast(r.Line, ToastKind.Info);
            Hud.SleepFade(() =>
            {
                clock.SleepUntilDawn();
                _sleeping = false;
                if (!IsDead) Toast("You wake with the light, which out here is the only alarm that never lies.", ToastKind.Good);
                CheckDeath();
            });
        }

        void AfterAction(ActionResult r, float timeCost)
        {
            Toast(r.Line, r.Success ? ToastKind.Info : ToastKind.Warning);
            clock.SpendSegments(timeCost);
            CheckDeath();
        }

        // ---- collapse (design/04: Energy 0 skips a segment) -----------------
        void CheckCollapse()
        {
            if (_collapsing || _sleeping || State.Stats.Energy > 0f) return;
            _collapsing = true;
            Toast("The world goes soft at the edges. Your body files for bankruptcy — and wins.", ToastKind.Severe);
            clock.SpendSegments(1f);
            if (State.Stats.Energy < 30f) State.Stats.Energy = 30f;
            State.Stat(Meter.Hope, -4);
            if (!IsDead) Toast("You come back to yourself face-down in warm sand, no memory of choosing it.", ToastKind.Warning);
            _collapsing = false;
        }

        // ---- death (always traced to its cause) ------------------------------
        static readonly Dictionary<string, (string Title, string Line)> DeathCards =
            new Dictionary<string, (string, string)>
            {
                ["thirst"] = ("THE DRIFTWOOD TONGUE",
                    "You knew. The sticking tongue, the stopped sweat — the island said it plainly, and water was always the first law."),
                ["hunger"] = ("HUNGER'S QUIET",
                    "It ends the way it warned you it would: not with pain but with a great soft quiet, and the sea still counting to itself."),
                ["injury"] = ("THE SMALL LOAN",
                    "Every cut out here is a small loan from a lender you don't know. Yours came due."),
                ["coldfire"] = ("COLD FIRE",
                    "No roof, no fire, and a night that kept every promise the dusk wind made."),
                ["fever"] = ("MARSH FEVER",
                    "The fever finishes its argument. You had heard every word of it coming."),
            };

        public (string Title, string Line) DeathCard()
        {
            if (State.DeathCause != null && DeathCards.TryGetValue(State.DeathCause, out var card)) return card;
            return ("THE ISLAND KEEPS", "The island keeps what it catches.");
        }

        void CheckDeath()
        {
            if (!IsDead) return;
            ApplyFreeze();
            TryDeleteSave(); // the run is over; the next Enter starts a fresh tide
        }

        // ---- persistence -----------------------------------------------------
        static GameState FreshState()
        {
            // Day stays 0 (the VN's newState): the prologue's first-night
            // choice moves the clock to Day 1, Dawn — exactly as the VN does.
            var s = GameState.NewGame();
            s.CurrentScene = "bay";
            s.Site = "beach";
            return s;
        }

        static GameState LoadOrFresh()
        {
            var s = SaveSystem.Load(SaveSystem.SlotPath());
            return s == null || s.DeathCause != null ? FreshState() : s;
        }

        public void SaveNow() => SaveSystem.Save(State, SaveSystem.SlotPath());

        static void TryDeleteSave()
        {
            var path = SaveSystem.SlotPath();
            if (File.Exists(path)) File.Delete(path);
        }

        void Restart()
        {
            TryDeleteSave();
            var scene = SceneManager.GetActiveScene();
            if (scene.buildIndex >= 0) SceneManager.LoadScene(scene.buildIndex);
            else SceneManager.LoadScene(scene.name); // opened outside Build Settings
        }

        // ---- helpers ----------------------------------------------------------
        public void Toast(string message, ToastKind kind)
        {
            if (Hud != null) Hud.PushToast(message, kind);
            else Debug.Log($"[Tidebound] {kind}: {message}");
        }

        static void LockCursor(bool locked)
        {
            Cursor.lockState = locked ? CursorLockMode.Locked : CursorLockMode.None;
            Cursor.visible = !locked;
        }
    }
}
