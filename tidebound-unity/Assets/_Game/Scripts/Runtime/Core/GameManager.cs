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
        public float tidePoolCost = 0.4f;
        public float caseOpenCost = 0.5f; // "two patient hours" — charged only if the lock loses

        [Header("Exposure (the cold tax; warned at dusk)")]
        public float exposureHealth = 6f;
        public float exposureHope = 4f;

        [Header("Story pacing")]
        [Tooltip("Real seconds of ordinary play between story events, so encounters never stack back-to-back. Sleep interruptions bypass this — being woken IS the event.")]
        public float eventGapSeconds = 25f;
        public EncounterStageDirector encounterDirector;

        public GameState State { get; private set; }
        public bool IsDead => State != null && State.DeathCause != null;
        /// <summary>Death or a chosen ending — every terminal state.</summary>
        public bool RunOver => State != null && Endings.RunIsOver(State);
        public HudController Hud { get; private set; }
        public DialogueUI Dialogue { get; private set; }
        public JournalUI Journal { get; private set; }
        public WayfinderUI Wayfinder { get; private set; }
        public InventoryUI Inventory { get; private set; }

        public bool DialogueActive { get; private set; }
        public bool JournalOpen { get; private set; }
        public bool MapOpen { get; private set; }
        public bool InventoryOpen { get; private set; }

        readonly WarningSystem _warnings = new WarningSystem();
        bool _sleeping;
        bool _collapsing;

        // ---- the story calendar ------------------------------------------
        readonly List<ScheduledEvent> _schedule = Chapter1Schedule.Build();
        readonly Queue<string> _eventQueue = new Queue<string>();
        StoryScript _encounters;
        StoryScript Encounters => _encounters ??= Chapter1Encounters.Build();
        float _nextEventAllowedAt;
        bool _resumeSleepAfterEvent;

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
            Wayfinder = WayfinderUI.Create(this);
            Inventory = InventoryUI.Create(this);
            RunCardUI.Create(this);
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
                        State.SetFlag(Regions.SeenFlag("bay")); // home isn't an expedition
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
                    State.SetFlag(Regions.SeenFlag("bay"));
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

            if (RunOver)
            {
                if (!DialogueActive) // an ending chosen inside a dialogue closes first
                {
                    ApplyFreeze();
                    TryDeleteSave();
                    if (GameInput.ConfirmPressed) Restart();
                }
                return;
            }

            if (!DialogueActive && GameInput.JournalPressed)
            {
                if (MapOpen) Wayfinder.Close();
                if (InventoryOpen) Inventory.Close();
                Journal.Toggle();
            }
            if (!DialogueActive && GameInput.MapPressed)
            {
                if (JournalOpen) Journal.Close();
                if (InventoryOpen) Inventory.Close();
                Wayfinder.Toggle();
            }
            if (!DialogueActive && GameInput.InventoryPressed)
            {
                if (JournalOpen) Journal.Close();
                if (MapOpen) Wayfinder.Close();
                Inventory.Toggle();
            }
            if (DialogueActive || JournalOpen || MapOpen || InventoryOpen) return; // the world is frozen; nothing below applies

            // a scheduled encounter waits until the world can hold it — and
            // keeps a breath of ordinary play between encounters, unless we
            // were just woken FOR it
            if (!_sleeping && _eventQueue.Count > 0 && State.Is("PROLOGUE_DONE")
                && (_resumeSleepAfterEvent || Time.time >= _nextEventAllowedAt))
            {
                var eventId = _eventQueue.Dequeue();
                if (encounterDirector != null) encounterDirector.Begin(eventId);
                Dialogue.Play(Encounters, eventId, () =>
                {
                    if (encounterDirector != null) encounterDirector.End();
                    OnEventFinished();
                }, DialogueStyle.LowerThird);
                return;
            }

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

        public void SetMapOpen(bool open)
        {
            MapOpen = open;
            ApplyFreeze();
        }

        public void SetInventoryOpen(bool open)
        {
            InventoryOpen = open;
            ApplyFreeze();
        }

        void ApplyFreeze()
        {
            bool frozen = DialogueActive || JournalOpen || MapOpen || InventoryOpen || RunOver;
            if (clock != null) clock.paused = frozen;
            if (player != null) player.inputLocked = frozen;
            if (cam != null) cam.inputLocked = frozen;
            if (interactor != null) interactor.inputLocked = frozen;
            LockCursor(!(DialogueActive || InventoryOpen || RunOver)); // reading, rummaging, and endings free the mouse
            if (Hud != null) Hud.gameObject.SetActive(!DialogueActive && !RunOver);
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

            // the calendar: fire-once story events, exactly the VN's rule
            var due = EventScheduler.Due(State, _schedule);
            if (due != null)
            {
                EventScheduler.MarkFired(State, due);
                _eventQueue.Enqueue(due);
            }

            // the dark door: offered once, at the bottom of the night
            if (seg == Segment.Night && State.Stats.Hope <= 12f)
                QueueStoryEvent("ev_despair");

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

        public void WorkTidePools(ForagePoint point)
        {
            var r = SurvivalActions.TidePools(State);
            if (point != null) point.Deplete(State);
            AfterAction(r, tidePoolCost);
            // the secret neighbor: twice into the pools, and the rock opens an eye
            if (Chapter1Encounters.NineIsDue(State)) QueueStoryEvent("ev_nine");
        }

        /// <summary>Queue a story event outside the calendar (fires once ever).</summary>
        public void QueueStoryEvent(string sceneId)
        {
            if (State.FiredEvents.TryGetValue(sceneId, out var fired) && fired) return;
            EventScheduler.MarkFired(State, sceneId);
            _eventQueue.Enqueue(sceneId);
        }

        /// <summary>
        /// The courier's case, considered at the flat stone (repeatable until
        /// opened). Looking is free; opening is a labor — if the lock lost
        /// this session, the time is charged when the dialogue closes.
        /// </summary>
        public void OpenCaseScene()
        {
            bool wasOpen = State.Is("CASE_OPEN");
            if (encounterDirector != null) encounterDirector.Begin("case_scene");
            Dialogue.Play(Encounters, "case_scene", () =>
            {
                if (encounterDirector != null) encounterDirector.End();
                if (!wasOpen && State.Is("CASE_OPEN")) clock.SpendSegments(caseOpenCost);
                SaveNow();
                CheckDeath();
            }, DialogueStyle.LowerThird);
        }

        /// <summary>
        /// A grove visit scene, played at Edda's fence (Chapter 3). Talks are
        /// free — the trek up the mountain was their cost; labors (the
        /// terraces, the cure) charge segments when the dialogue closes.
        /// </summary>
        public void VisitEdda(string sceneId, int laborSegments = 0)
        {
            if (encounterDirector != null) encounterDirector.Begin(sceneId);
            Dialogue.Play(Encounters, sceneId, () =>
            {
                if (encounterDirector != null) encounterDirector.End();
                if (laborSegments > 0) clock.SpendSegments(laborSegments);
                SaveNow();
                CheckDeath();
            }, DialogueStyle.LowerThird);
        }

        /// <summary>The Silverthread: haul water (scenes-chapter3.js ch3Actions numbers).</summary>
        public void HaulRiverWater()
        {
            State.Stat(Meter.Thirst, 40);
            State.Stat(Meter.Energy, State.Site == "overhang" ? -10 : -6);
            State.Stat(Meter.Health, 2);
            Toast("Cold, clean, and endless. The island's artery is yours now.", ToastKind.Good);
            clock.SpendSegments(1);
            SaveNow();
        }

        /// <summary>The raft's question, asked properly (repeatable until answered).</summary>
        public void OfferRaftLaunch()
        {
            Dialogue.Play(Endings.BuildRaftScript(), "raft_launch", () => SaveNow(), DialogueStyle.LowerThird);
        }

        public void Drink() => AfterAction(SurvivalActions.Drink(State), drinkCost);

        [Tooltip("How much water the pack can carry (vessels' worth). Feel knob.")]
        public int canteenCap = 3;

        /// <summary>Fill at a source — a gesture, free (walking there was the cost).</summary>
        public void FillCanteen()
        {
            Toast(SurvivalActions.FillCanteen(State, canteenCap).Line, ToastKind.Good);
            SaveNow();
        }

        /// <summary>Drink carried water straight from the pack — a gesture, free.</summary>
        public void DrinkFromPack()
        {
            Toast(SurvivalActions.DrinkFromPack(State).Line, ToastKind.Good);
            if (Inventory != null && Inventory.IsOpen) Inventory.Open(); // refresh the sheet's counts
            SaveNow();
        }

        public void StampSos() => AfterAction(SurvivalActions.StampSos(State), sosCost);

        public void SleepUntilDawn()
        {
            if (State.Seg != Segment.Dusk && State.Seg != Segment.Night)
            {
                Toast("Daylight is too expensive to sleep through.", ToastKind.Info);
                return;
            }
            var r = SurvivalActions.Sleep(State);
            Toast(r.Line, ToastKind.Info);
            BeginSleepAdvance();
        }

        /// <summary>
        /// Sleep one segment at a time behind the fade. A queued story event
        /// wakes the sleeper mid-night (the VN's "you wake to…" scenes are
        /// written for exactly this); when the event ends, sleep resumes.
        /// </summary>
        void BeginSleepAdvance()
        {
            _sleeping = true;
            Hud.SleepFade(() =>
            {
                for (int guard = 0; guard < DayClock.SegmentsPerDay + 1; guard++)
                {
                    clock.AdvanceOneBoundary();
                    if (IsDead || State.Seg == Segment.Dawn || _eventQueue.Count > 0) break;
                }
                _sleeping = false;
                _resumeSleepAfterEvent = !IsDead && State.Seg != Segment.Dawn && _eventQueue.Count > 0;
                if (!IsDead && State.Seg == Segment.Dawn && _eventQueue.Count == 0)
                    Toast("You wake with the light, which out here is the only alarm that never lies.", ToastKind.Good);
                CheckDeath();
            });
        }

        void OnEventFinished()
        {
            // the mountain expedition's five days, charged when the ch6 chain
            // closes — the sweep runs the real drains and honest death checks
            // (the VN's chain() ticks, summed; bible-noted v1 adaptation)
            if (State.Is("CH6_DONE") && !State.Is("CH6_CHARGED"))
            {
                State.SetFlag("CH6_CHARGED");
                clock.SpendSegments(10f);
            }
            SaveNow();
            _nextEventAllowedAt = Time.time + eventGapSeconds;
            if (_resumeSleepAfterEvent && !IsDead)
            {
                _resumeSleepAfterEvent = false;
                if (State.Seg != Segment.Dawn)
                {
                    Toast("Sleep takes you back, eventually.", ToastKind.Info);
                    BeginSleepAdvance();
                }
            }
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

        // ---- death (always traced to its cause; epilogues live in Endings) ---
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
            // the island remembers: a stranger who has never seen this place
            // wakes already humming with whatever a past life truly learned
            LoopStore.DressNewRun(s);
            return s;
        }

        static GameState LoadOrFresh()
        {
            var s = SaveSystem.Load(SaveSystem.SlotPath());
            return s == null || Endings.RunIsOver(s) ? FreshState() : s;
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
