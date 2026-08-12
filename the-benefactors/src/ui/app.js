import {
  EVIDENCE,
  DIALOGUES,
  DEDUCTIONS,
  GAME_CONTENT,
  INVENTORY_ITEMS,
} from "../content/game-content.js?v=vesper-cistern-20260812a";
import {
  CASEBOOK_PROGRESS,
  CASEBOOK_STAGES,
} from "../content/casebook-content.js?v=vesper-cistern-20260812a";
import { CHAPTER_INTERLUDES } from "../content/cinematic-content.js?v=vesper-cistern-20260812a";
import { CHARACTER_PROFILES } from "../content/relationship-content.js?v=vesper-cistern-20260812a";
import { COUNTERMEASURES, PRESSURE_EVENTS } from "../content/pressure-content.js?v=vesper-cistern-20260812a";
import { getInteractiveLocation } from "../content/exploration-content.js?v=vesper-cistern-20260812a";
import {
  CUTSCENE_BEATS,
  OPENING_MESSAGE,
  TUTORIAL_STEPS,
  YARN_RELATIONSHIPS,
} from "../content/onboarding-content.js?v=vesper-cistern-20260812a";
import {
  PROLOGUE_ENDING_BEATS,
  RECORDING_PUZZLE,
  STUDY_ALIGNMENT_PUZZLE,
} from "../content/prologue-content.js?v=vesper-cistern-20260812a";
import { evaluateCondition } from "../engine/conditions.js?v=vesper-cistern-20260812a";
import { applyEffects } from "../engine/events.js?v=vesper-cistern-20260812a";
import { createInitialState } from "../engine/game-state.js?v=vesper-cistern-20260812a";
import {
  getPlayerLanguage,
  interpolatePlayerText,
} from "../engine/player-language.js?v=vesper-cistern-20260812a";
import { PERSISTENT_GAME_ROUTES } from "../engine/router.js?v=vesper-cistern-20260812a";
import {
  getVisibleHotspots,
  renderExplorationScene,
} from "../systems/exploration/scene-renderer.js?v=vesper-cistern-20260812a";
import {
  completeInteraction,
  getFieldNoteEntries,
  getHotspotObservationText,
  hasObservedHotspot,
  inspectHotspot,
} from "../systems/exploration/exploration-progress.js?v=vesper-cistern-20260812a";
import { getInventoryToolContext } from "../systems/inventory/inventory-tools.js?v=vesper-cistern-20260812a";
import {
  PORT_PROSPER_RESPONSES,
  advancePortProsperAftermath,
  applyPortProsperResponse,
} from "../systems/decisions/port-prosper-response.js?v=vesper-cistern-20260812a";
import {
  advanceDialogue,
  closeDialogue,
  getAvailableChoices,
  getDialogueNode,
  startDialogue,
} from "../systems/dialogue/dialogue-engine.js?v=vesper-cistern-20260812a";
import {
  arrangeEvidence,
  connectEvidence,
  evaluateConnectionFeedback,
  evaluateBoardDeductions,
  moveEvidence,
  pinEvidence,
  removeConnection,
  saveEvidenceNote,
  unpinEvidence,
} from "../systems/evidence-board/evidence-board.js?v=vesper-cistern-20260812a";
import {
  getEvidencePresentation,
  renderEvidenceArtifact,
} from "../systems/evidence/evidence-renderer.js?v=vesper-cistern-20260812a";
import {
  evaluateStudyAlignment,
  revealPuzzleHint,
  rotateStudyPlan,
} from "../systems/puzzles/plan-alignment.js?v=vesper-cistern-20260812a";
import {
  evaluateRecordingSequence,
  moveRecordingFragment,
  revealRecordingHint,
} from "../systems/puzzles/recording-reconstruction.js?v=vesper-cistern-20260812a";
import { TransientNotice } from "./transient-notice.js?v=vesper-cistern-20260812a";
import {
  advanceInterlude,
  beginInterlude,
  getPendingInterlude,
  skipInterlude,
} from "../systems/cinematics/chapter-interludes.js?v=vesper-cistern-20260812a";
import {
  applyRelationshipMoment,
  exposureStatus,
  getRelationshipRecord,
  previewRelationshipMoment,
  relationshipStatus,
  requestSourceHelp,
} from "../systems/relationships/relationships.js?v=vesper-cistern-20260812a";
import {
  applyCountermeasure,
  availableCountermeasures,
  pressureStatus,
  syncPressure,
} from "../systems/pressure/investigative-pressure.js?v=vesper-cistern-20260812a";

const PORTRAITS = [
  { id: "portrait-1", label: "Portrait one", initials: "AR" },
  { id: "portrait-2", label: "Portrait two", initials: "JR" },
  { id: "portrait-3", label: "Portrait three", initials: "MR" },
];

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatSaveTimestamp(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown time";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export class GameApp {
  constructor({ root, store, saves, router, audio }) {
    this.root = root;
    this.store = store;
    this.saves = saves;
    this.router = router;
    this.audio = audio;
    this.notice = new TransientNotice({
      onExpire: () => {
        this.root.querySelector(".toast")?.remove();
      },
    });
    this.returnRoute = "title";
    this.activeOfficeNote = null;
    this.activeLocationNote = null;
    this.inventoryOpen = false;
    this.selectedBoardCards = [];
    this.boardConnectionType = "confirmed";
    this.boardCategoryFilter = "all";
    this.boardDensity = "compact";
    this.boardScroll = { left: 0, top: 0 };
    this.boardConnectionPanelOpen = false;
    this.boardWasDragged = false;
    this.boardLens = "all";
    this.activeBoardNoteId = null;
    this.activeDeductionId = null;
    this.tutorialHotspotFound = false;
    this.tutorialBoardCards = [];
    this.tutorialBoardConnected = false;
    this.activeEvidenceId = null;
    this.puzzleAnnouncement = "";
    this.activeRecordingFragmentId = null;
    this.activeInventoryToolId = null;
    this.inventoryMessage = "";
    this.pendingDeleteSlot = null;
    this.evidenceViewerActionsBound = false;
    this.inventoryActionsBound = false;
    this.lastCinematicCue = null;
  }

  start() {
    this.store.subscribe((state, reason) => {
      this.applyPreferences(state.settings);
      this.audio?.setSettings(state.settings);
      if (reason !== "pressure-sync") {
        const synchronized = syncPressure(state, PRESSURE_EVENTS);
        if (synchronized.newlyTriggered.length) {
          this.store.replace(synchronized.state, "pressure-sync");
          this.saves.save(this.store.getState(), "pressure-sync");
          this.notice.show(synchronized.newlyTriggered.at(-1).title);
        }
      }
    });
    const initialPressure = syncPressure(this.store.getState(), PRESSURE_EVENTS);
    if (initialPressure.newlyTriggered.length) {
      this.store.replace(initialPressure.state, "pressure-sync");
      this.saves.save(this.store.getState(), "pressure-sync");
    }
    this.applyPreferences(this.store.getState().settings);
    this.audio?.setSettings(this.store.getState().settings);
    this.root.addEventListener(
      "pointerdown",
      () => {
        this.audio?.unlock().catch?.(() => {});
      },
      { once: true, capture: true },
    );
    this.root.addEventListener("click", (event) => {
      if (event.target.closest?.("button")) this.audio?.playEffect("paper");
    });
    this.root.addEventListener("keydown", (event) => {
      if (event.key === "Tab") {
        const modal = this.root.querySelector('[aria-modal="true"]');
        if (modal) {
          const focusable = [...modal.querySelectorAll('button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), audio[controls], [tabindex="0"], [tabindex="-1"]')]
            .filter((element) => !element.hidden && element.getAttribute("aria-hidden") !== "true");
          const first = focusable[0];
          const last = focusable.at(-1);
          if (focusable.length && event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
            return;
          }
          if (focusable.length && !event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
            return;
          }
        }
      }
      if (
        event.key === "Escape" &&
        (this.activeBoardNoteId || this.activeDeductionId)
      ) {
        event.preventDefault();
        this.activeBoardNoteId = null;
        this.activeDeductionId = null;
        if (this.router.current() === "board") this.renderBoard();
        return;
      }
      if (event.key === "Escape" && this.activeEvidenceId) {
        event.preventDefault();
        this.activeEvidenceId = null;
        this.render(this.router.current());
        return;
      }
      if (
        event.key === "Escape" &&
        this.store.getState().dialogue.activeDialogueId
      ) {
        event.preventDefault();
        this.store.replace(closeDialogue(this.store.getState()), "close-dialogue-keyboard");
        this.saves.save(this.store.getState(), "close-dialogue-keyboard");
        this.renderLocation();
        return;
      }
      if (event.target.matches?.("input, textarea, select")) return;
      this.audio?.unlock().catch?.(() => {});
      if (event.key.toLowerCase() === "m") {
        event.preventDefault();
        this.toggleQuickSetting("muted", "Audio");
      }
      if (event.key.toLowerCase() === "h") {
        event.preventDefault();
        this.toggleQuickSetting("hotspotAssist", "Hotspot assistance");
      }
    });
    this.router.start((route) => this.render(route));
  }

  render(route) {
    const opening = this.store.getState().progress.opening;
    if (
      PERSISTENT_GAME_ROUTES.has(route) &&
      !["onboarding", "tutorial", "cutscene"].includes(route) &&
      !opening.cutsceneCompleted
    ) {
      const openingRoute = !opening.tutorialChoice
        ? "onboarding"
        : opening.tutorialChoice === "guided" && !opening.tutorialCompleted
          ? "tutorial"
          : "cutscene";
      this.router.navigate(openingRoute, { replace: true });
      return;
    }

    if (
      PERSISTENT_GAME_ROUTES.has(route) &&
      this.store.getState().progress.currentScreen !== route
    ) {
      this.store.update((draft) => {
        draft.progress.previousScreen = draft.progress.currentScreen;
        draft.progress.currentScreen = route;
      }, "screen-change");
    }

    const renderers = {
      title: () => this.renderTitle(),
      setup: () => this.renderSetup(),
      onboarding: () => this.renderOnboarding(),
      tutorial: () => this.renderTutorial(),
      cutscene: () => this.renderCutscene(),
      home: () => this.renderHome(),
      location: () => this.renderLocation(),
      map: () => this.renderMap(),
      laptop: () => this.renderLaptop(),
      board: () => this.renderBoard(),
      alignment: () => this.renderStudyAlignment(),
      recording: () => this.renderRecordingPuzzle(),
      "prologue-ending": () => this.renderPrologueEnding(),
      "port-prosper-decision": () => this.renderPortProsperDecision(),
      "case-files": () => this.renderCaseFiles(),
      notebook: () => this.renderNotebook(),
      "content-notice": () => this.renderContentNotice(),
      credits: () => this.renderCredits(),
      settings: () => this.renderSettings(),
    };

    this.audio?.setScene(route);
    (renderers[route] || renderers.title)();
    if (this.activeEvidenceId) {
      this.root.insertAdjacentHTML("beforeend", this.renderEvidenceViewer());
    }
    this.bindEvidenceViewerActions();
    this.bindInventoryActions();
    this.bindRecordingAudioActions();
    this.renderChapterInterlude(route);
    const modal = this.root.querySelector('[aria-modal="true"]');
    const focusTarget = modal
      ? modal.querySelector("[data-autofocus], h1[tabindex], h2[tabindex]") || modal
      : this.root.querySelector("h1, h2, [data-autofocus]");
    focusTarget?.focus?.();
  }

  renderChapterInterlude(route = this.router.current()) {
    const permittedRoutes = new Set(["home", "location", "map", "board", "case-files", "notebook"]);
    let state = this.store.getState();
    let interlude = CHAPTER_INTERLUDES.find(
      (entry) => entry.id === state.cinematics.activeId,
    );
    if (!interlude && permittedRoutes.has(route) && route !== "case-files") {
      interlude = getPendingInterlude(state, CHAPTER_INTERLUDES);
      if (
        interlude &&
        !state.dialogue.activeDialogueId &&
        !this.activeEvidenceId &&
        !this.activeDeductionId
      ) {
        state = beginInterlude(state, interlude.id);
        this.store.replace(state, `begin-interlude-${interlude.id}`);
        this.saves.save(state, `begin-interlude-${interlude.id}`);
      } else if (interlude) {
        return;
      }
    }
    if (!interlude || state.cinematics.activeId !== interlude.id) return;

    const step = Math.min(interlude.beats.length - 1, state.cinematics.step);
    const beat = interlude.beats[step];
    const text = beat.variants?.[state.progress.portProsperResponse] || beat.text;
    const cue = `${interlude.id}:${step}`;
    if (this.lastCinematicCue !== cue) {
      this.lastCinematicCue = cue;
      this.audio?.setScene("cinematic");
      this.audio?.playEffect(beat.kind === "intercept" ? "radio" : "chapter");
    }
    this.root.insertAdjacentHTML(
      "beforeend",
      `
        <div class="cinematic-scrim" data-cinematic-kind="${escapeHtml(beat.kind)}">
          <section class="chapter-interlude" role="dialog" aria-modal="true" aria-labelledby="interlude-title" tabindex="-1">
            <img class="interlude-image" src="${escapeHtml(beat.image)}" alt="" draggable="false" />
            <div class="interlude-grain" aria-hidden="true"></div>
            <header class="interlude-topline">
              <span>${escapeHtml(interlude.chapter)}</span>
              <button class="button button-ghost" data-skip-interlude>Skip scene</button>
            </header>
            <article class="interlude-copy">
              <p class="kicker">${escapeHtml(beat.label)}</p>
              <h1 id="interlude-title">${escapeHtml(beat.title)}</h1>
              ${beat.speaker ? `<p class="interlude-speaker"><span aria-hidden="true"></span>${escapeHtml(beat.speaker)}</p>` : ""}
              <p>${escapeHtml(text)}</p>
              ${beat.kind === "intercept" ? '<div class="interlude-waveform" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>' : ""}
            </article>
            <footer class="interlude-footer">
              <div class="interlude-progress" aria-label="Scene ${step + 1} of ${interlude.beats.length}">
                ${interlude.beats.map((_, index) => `<span class="${index === step ? "is-active" : ""}"></span>`).join("")}
              </div>
              <button class="button button-primary" data-advance-interlude>
                ${step === interlude.beats.length - 1 ? `Begin ${escapeHtml(interlude.title)}` : "Continue"}
              </button>
            </footer>
          </section>
        </div>
      `,
    );

    const finish = (skip = false) => {
      const next = skip
        ? skipInterlude(this.store.getState(), CHAPTER_INTERLUDES)
        : advanceInterlude(this.store.getState(), CHAPTER_INTERLUDES);
      const stillActive = Boolean(next.cinematics.activeId);
      this.store.replace(next, `${skip ? "skip" : "advance"}-interlude-${interlude.id}`);
      this.saves.save(this.store.getState(), `${skip ? "skip" : "advance"}-interlude-${interlude.id}`);
      if (!stillActive) this.lastCinematicCue = null;
      this.render(route);
    };
    const dialog = this.root.querySelector(".chapter-interlude");
    dialog?.querySelector("[data-advance-interlude]")?.addEventListener("click", () => finish(false));
    dialog?.querySelector("[data-skip-interlude]")?.addEventListener("click", () => finish(true));
    dialog?.addEventListener("keydown", (event) => {
      if (["Enter", "ArrowRight", " "].includes(event.key)) {
        event.preventDefault();
        finish(false);
      }
    });
    dialog?.focus();
  }

  renderTitle() {
    const canContinue = this.saves.hasSave();
    this.root.innerHTML = `
      <main id="game-main" class="screen title-screen">
        <div class="rain" aria-hidden="true"></div>
        <div class="title-vignette" aria-hidden="true">
          <span class="paper paper-a"></span>
          <span class="paper paper-b"></span>
          <span class="thread-line"></span>
          <span class="pin pin-a"></span>
          <span class="pin pin-b"></span>
        </div>
        <section class="title-card">
          <p class="kicker">An investigative noir adventure</p>
          <h1 tabindex="-1">${GAME_CONTENT.title}</h1>
          <p class="title-subtitle">${GAME_CONTENT.subtitle}</p>
          <div class="title-rule" aria-hidden="true"><span></span></div>
          <div class="menu-stack" aria-label="Main menu">
            <button class="button button-primary" data-action="new-game">Begin investigation</button>
            <button class="button button-secondary" data-action="continue" ${canContinue ? "" : "disabled"}>
              Continue
            </button>
            <button class="button button-secondary" data-action="case-files">Case files</button>
            <button class="button button-ghost" data-action="settings">Settings</button>
          </div>
          <nav class="title-utility-links" aria-label="Additional information">
            <button data-action="content-notice">Content & fiction notice</button>
            <span aria-hidden="true">·</span>
            <button data-action="credits">Credits</button>
          </nav>
          <p class="build-mark">Prologue · Playable vertical slice</p>
        </section>
        ${this.renderToast()}
      </main>
    `;

    this.bindActions({
      "new-game": () => this.router.navigate("setup"),
      continue: () => this.continueGame(),
      "case-files": () => {
        this.returnRoute = "title";
        this.router.navigate("case-files");
      },
      "content-notice": () => {
        this.returnRoute = "title";
        this.router.navigate("content-notice");
      },
      credits: () => {
        this.returnRoute = "title";
        this.router.navigate("credits");
      },
      settings: () => {
        this.returnRoute = "title";
        this.router.navigate("settings");
      },
    });
  }

  renderSetup() {
    const settings = this.saves.loadSettings();
    this.root.innerHTML = `
      <main id="game-main" class="screen setup-screen">
        <section class="panel setup-panel">
          <button class="back-button" data-action="back" aria-label="Back to title">← Back</button>
          <p class="kicker">Press credentials</p>
          <h1 tabindex="-1">Who is following the story?</h1>
          <p class="lede">You can change accessibility and audio options at any time.</p>
          <form id="identity-form" class="identity-form">
            <div class="field-row">
              <label>
                <span>First name</span>
                <input name="firstName" autocomplete="given-name" value="Alex" maxlength="24" required />
              </label>
              <label>
                <span>Last name</span>
                <input name="lastName" autocomplete="family-name" value="Rowan" maxlength="24" required />
              </label>
            </div>
            <fieldset>
              <legend>Pronouns</legend>
              <div class="choice-row">
                <label class="choice-chip"><input type="radio" name="pronouns" value="she" /> She / her</label>
                <label class="choice-chip"><input type="radio" name="pronouns" value="he" /> He / him</label>
                <label class="choice-chip"><input type="radio" name="pronouns" value="they" checked /> They / them</label>
              </div>
            </fieldset>
            <fieldset>
              <legend>Portrait</legend>
              <div class="portrait-row">
                ${PORTRAITS.map(
                  (portrait, index) => `
                    <label class="portrait-choice">
                      <input type="radio" name="portrait" value="${portrait.id}" ${index === 0 ? "checked" : ""} />
                      <span class="portrait portrait-${index + 1}" aria-hidden="true">${portrait.initials}</span>
                      <span class="sr-only">${portrait.label}</span>
                    </label>
                  `,
                ).join("")}
              </div>
            </fieldset>
            <button class="button button-primary button-wide" type="submit">Enter the office</button>
          </form>
        </section>
      </main>
    `;

    this.root.querySelector("[data-action='back']").addEventListener("click", () => {
      this.router.navigate("title");
    });
    this.root.querySelector("#identity-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      const state = createInitialState(
        {
          firstName: data.get("firstName"),
          lastName: data.get("lastName"),
          pronouns: data.get("pronouns"),
          portrait: data.get("portrait"),
        },
        settings,
      );
      this.store.replace(state, "new-game");
      this.resetEphemeralUi();
      this.saves.save(this.store.getState(), "new-game");
      this.router.navigate("onboarding");
    });
  }

  renderOnboarding() {
    const state = this.store.getState();
    const opening = state.progress.opening;

    if (opening.cutsceneCompleted) {
      this.router.navigate("home", { replace: true });
      return;
    }
    if (opening.tutorialChoice === "guided" && !opening.tutorialCompleted) {
      this.router.navigate("tutorial", { replace: true });
      return;
    }
    if (opening.tutorialCompleted) {
      this.router.navigate("cutscene", { replace: true });
      return;
    }

    this.root.innerHTML = `
      <main id="game-main" class="screen onboarding-screen">
        <img class="onboarding-backdrop" src="./assets/scenes/home-office.webp" alt="" draggable="false" />
        <div class="onboarding-shade" aria-hidden="true"></div>
        <section
          class="onboarding-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="onboarding-title"
        >
          <p class="kicker">Before the first lead</p>
          <h1 id="onboarding-title" tabindex="-1">Have you played The Benefactors before?</h1>
          <p class="onboarding-lede">
            A quick, optional walkthrough shows how to explore scenes, inspect evidence,
            revisit leads, and connect clues with yarn.
          </p>
          <div class="onboarding-options">
            <button class="onboarding-option is-recommended" data-action="start-tutorial">
              <span class="option-tag">Recommended for a first case</span>
              <strong>Play quick tutorial</strong>
              <small>Learn the essentials in about a minute.</small>
            </button>
            <button class="onboarding-option" data-action="skip-tutorial">
              <span class="option-tag">I know the ropes</span>
              <strong>Skip tutorial</strong>
              <small>Go straight to the opening story.</small>
            </button>
          </div>
          <p class="onboarding-footnote">
            You can still inspect every clue and revisit every location if you skip.
          </p>
        </section>
      </main>
    `;

    this.bindActions({
      "start-tutorial": () => {
        this.tutorialHotspotFound = false;
        this.tutorialBoardCards = [];
        this.tutorialBoardConnected = false;
        this.store.update((draft) => {
          draft.progress.opening.tutorialChoice = "guided";
          draft.progress.opening.tutorialStep = 0;
          draft.progress.currentScreen = "tutorial";
        }, "start-tutorial");
        this.saves.save(this.store.getState(), "start-tutorial");
        this.router.navigate("tutorial");
      },
      "skip-tutorial": () => {
        this.store.update((draft) => {
          draft.progress.opening.tutorialChoice = "skip";
          draft.progress.opening.tutorialCompleted = true;
          draft.progress.opening.cutsceneStep = 0;
          draft.progress.currentScreen = "cutscene";
        }, "skip-tutorial");
        this.saves.save(this.store.getState(), "skip-tutorial");
        this.router.navigate("cutscene");
      },
    });
  }

  renderTutorial() {
    const state = this.store.getState();
    const opening = state.progress.opening;

    if (opening.cutsceneCompleted) {
      this.router.navigate("home", { replace: true });
      return;
    }
    if (!opening.tutorialChoice) {
      this.router.navigate("onboarding", { replace: true });
      return;
    }
    if (opening.tutorialCompleted || opening.tutorialChoice === "skip") {
      this.router.navigate("cutscene", { replace: true });
      return;
    }

    const stepIndex = Math.max(
      0,
      Math.min(TUTORIAL_STEPS.length - 1, opening.tutorialStep),
    );
    const step = TUTORIAL_STEPS[stepIndex];
    const isLastStep = stepIndex === TUTORIAL_STEPS.length - 1;

    this.root.innerHTML = `
      <main id="game-main" class="screen tutorial-screen">
        <header class="tutorial-header">
          <div class="wordmark"><span>The</span> Benefactors</div>
          <button class="button button-ghost" data-action="skip-active-tutorial">Skip tutorial</button>
        </header>
        <section class="tutorial-shell" aria-labelledby="tutorial-title">
          <aside class="tutorial-progress" aria-label="Tutorial progress">
            <p class="kicker">Reporter’s field guide</p>
            <ol>
              ${TUTORIAL_STEPS.map(
                (item, index) => `
                  <li class="${index === stepIndex ? "is-current" : ""} ${index < stepIndex ? "is-complete" : ""}">
                    <span>${index < stepIndex ? "✓" : index + 1}</span>
                    <strong>${escapeHtml(item.title)}</strong>
                  </li>
                `,
              ).join("")}
            </ol>
          </aside>
          <article class="tutorial-card">
            <p class="kicker">Step ${stepIndex + 1} of ${TUTORIAL_STEPS.length}</p>
            <h1 id="tutorial-title" tabindex="-1">${escapeHtml(step.title)}</h1>
            <p class="tutorial-copy">${escapeHtml(step.text)}</p>
            ${step.keyboardHint ? `<p class="tutorial-keyboard">${escapeHtml(step.keyboardHint)}</p>` : ""}
            ${this.renderTutorialDemo(step)}
            <footer class="tutorial-actions">
              <button
                class="button button-ghost"
                data-action="tutorial-back"
                ${stepIndex === 0 ? "disabled" : ""}
              >Back</button>
              <button class="button button-primary" data-action="tutorial-next">
                ${isLastStep ? "Begin the story" : "Next"}
              </button>
            </footer>
          </article>
        </section>
      </main>
    `;

    this.bindActions({
      "skip-active-tutorial": () => this.finishTutorial("skip-active-tutorial"),
      "tutorial-back": () => {
        if (stepIndex === 0) return;
        this.store.update((draft) => {
          draft.progress.opening.tutorialStep = stepIndex - 1;
        }, "tutorial-back");
        this.saves.save(this.store.getState(), "tutorial-back");
        this.renderTutorial();
      },
      "tutorial-next": () => {
        if (isLastStep) {
          this.finishTutorial("complete-tutorial");
          return;
        }
        this.store.update((draft) => {
          draft.progress.opening.tutorialStep = stepIndex + 1;
        }, "tutorial-next");
        this.saves.save(this.store.getState(), "tutorial-next");
        this.renderTutorial();
      },
      "tutorial-hotspot": () => {
        this.tutorialHotspotFound = true;
        this.renderTutorial();
        this.root.querySelector("[data-action='tutorial-hotspot']")?.focus();
      },
      "tutorial-view-evidence": () => {
        this.activeEvidenceId = "invoice_northstar";
        this.render("tutorial");
      },
      "tutorial-connect": () => {
        if (this.tutorialBoardCards.length !== 2) return;
        this.tutorialBoardConnected = true;
        this.renderTutorial();
        this.root.querySelector("[data-action='tutorial-connect']")?.focus();
      },
      "tutorial-clear": () => {
        this.tutorialBoardCards = [];
        this.tutorialBoardConnected = false;
        this.renderTutorial();
      },
    });

    this.root.querySelectorAll("[data-tutorial-board-card]").forEach((card) => {
      card.addEventListener("click", () => {
        const id = card.dataset.tutorialBoardCard;
        const index = this.tutorialBoardCards.indexOf(id);
        if (index >= 0) {
          this.tutorialBoardCards.splice(index, 1);
          this.tutorialBoardConnected = false;
        } else if (this.tutorialBoardCards.length < 2) {
          this.tutorialBoardCards.push(id);
        }
        this.renderTutorial();
        this.root.querySelector(`[data-tutorial-board-card="${id}"]`)?.focus();
      });
    });
  }

  renderTutorialDemo(step) {
    if (step.id === "point-and-click") {
      return `
        <section class="tutorial-demo tutorial-scene-demo" aria-label="Practice finding a hotspot">
          <img src="./assets/scenes/home-office.webp" alt="" draggable="false" />
          <button
            class="tutorial-practice-hotspot ${this.tutorialHotspotFound ? "is-found" : ""}"
            data-action="tutorial-hotspot"
          >
            <span aria-hidden="true"></span>
            Answering machine
          </button>
          <p role="status" aria-live="polite">
            ${
              this.tutorialHotspotFound
                ? "<strong>Observation found:</strong> The red message light is blinking."
                : "Try it: select the highlighted object."
            }
          </p>
        </section>
      `;
    }

    if (step.id === "inspect-evidence") {
      return `
        <section class="tutorial-demo tutorial-evidence-demo">
          <article>
            <span class="practice-pin" aria-hidden="true"></span>
            <p>Municipal accessibility fund</p>
            <strong>Northstar invoice</strong>
            <small>Names, dates, amounts, and fine print may become leads.</small>
            <button class="evidence-view-button" data-action="tutorial-view-evidence">
              View sample evidence
            </button>
          </article>
          <p>Evidence is never consumed. Reopen it from the case file or the board at any time.</p>
        </section>
      `;
    }

    if (step.id === "revisit-scenes") {
      return `
        <section class="tutorial-demo tutorial-loop-demo" aria-label="The investigation loop">
          <div><span>1</span><strong>Choose a lead</strong><small>Open the city map.</small></div>
          <i aria-hidden="true">→</i>
          <div><span>2</span><strong>Investigate</strong><small>Observe, question, collect.</small></div>
          <i aria-hidden="true">→</i>
          <div><span>3</span><strong>Return home</strong><small>Review the case and revisit leads.</small></div>
        </section>
      `;
    }

    const selectedA = this.tutorialBoardCards.includes("practice-invoice");
    const selectedB = this.tutorialBoardCards.includes("practice-permit");
    return `
      <section class="tutorial-demo tutorial-board-demo">
        <div class="tutorial-yarn-legend" aria-label="Yarn color meanings">
          ${YARN_RELATIONSHIPS.map(
            (relationship) => `
              <div class="tutorial-yarn-key relationship-${relationship.id}">
                <i aria-hidden="true"></i>
                <span><strong>${escapeHtml(relationship.colorName)} · ${escapeHtml(relationship.label)}</strong><small>${escapeHtml(relationship.description)}</small></span>
              </div>
            `,
          ).join("")}
        </div>
        <div class="tutorial-mini-board">
          ${this.tutorialBoardConnected ? `<span class="tutorial-practice-yarn" aria-hidden="true"></span>` : ""}
          <button
            class="${selectedA ? "is-selected" : ""}"
            data-tutorial-board-card="practice-invoice"
            aria-pressed="${selectedA}"
          ><span>${selectedA ? this.tutorialBoardCards.indexOf("practice-invoice") + 1 : ""}</span><strong>Invoice</strong><small>$184,600 paid</small></button>
          <button
            class="${selectedB ? "is-selected" : ""}"
            data-tutorial-board-card="practice-permit"
            aria-pressed="${selectedB}"
          ><span>${selectedB ? this.tutorialBoardCards.indexOf("practice-permit") + 1 : ""}</span><strong>Permit</strong><small>Same west-wing job</small></button>
        </div>
        <div class="tutorial-board-controls">
          <p><strong>Blue · Financial</strong><span>Double yarn for a money trail.</span></p>
          <button
            class="button button-primary"
            data-action="tutorial-connect"
            ${this.tutorialBoardCards.length === 2 ? "" : "disabled"}
          >Tie practice yarn</button>
          <button
            class="button button-ghost"
            data-action="tutorial-clear"
            ${this.tutorialBoardCards.length ? "" : "disabled"}
          >Clear</button>
          <span role="status" aria-live="polite">
            ${
              this.tutorialBoardConnected
                ? "Connected. In the real case, the right relationship can unlock a deduction."
                : `${this.tutorialBoardCards.length} of 2 clues selected.`
            }
          </span>
        </div>
      </section>
    `;
  }

  renderCutscene() {
    const state = this.store.getState();
    const opening = state.progress.opening;

    if (opening.cutsceneCompleted) {
      this.router.navigate("home", { replace: true });
      return;
    }
    if (!opening.tutorialChoice) {
      this.router.navigate("onboarding", { replace: true });
      return;
    }
    if (opening.tutorialChoice === "guided" && !opening.tutorialCompleted) {
      this.router.navigate("tutorial", { replace: true });
      return;
    }

    const stepIndex = Math.max(
      0,
      Math.min(CUTSCENE_BEATS.length - 1, opening.cutsceneStep),
    );
    const beat = CUTSCENE_BEATS[stepIndex];
    const isMessageBeat = beat.id === "anonymous-call";
    const messagePlayed = state.flags.heardOpeningMessage;
    const language = getPlayerLanguage(state.player);
    const sceneImage =
      beat.id === "press-deadline"
        ? "./assets/scenes/newsroom.webp"
        : "./assets/scenes/home-office.webp";
    const personalizedText = interpolatePlayerText(beat.text, state.player);

    this.root.innerHTML = `
      <main id="game-main" class="screen cutscene-screen" data-cutscene-beat="${beat.id}">
        <img class="cutscene-backdrop" src="${sceneImage}" alt="" draggable="false" />
        <div class="cutscene-vignette" aria-hidden="true"></div>
        <header class="cutscene-header">
          <div class="wordmark"><span>The</span> Benefactors</div>
          <button class="button button-ghost" data-action="skip-cutscene">Skip cutscene</button>
        </header>
        <section class="cutscene-card" aria-labelledby="cutscene-title">
          <div class="cutscene-progress" aria-label="Opening scene progress">
            ${CUTSCENE_BEATS.map(
              (_item, index) => `<span class="${index <= stepIndex ? "is-active" : ""}"></span>`,
            ).join("")}
          </div>
          <p class="kicker">${escapeHtml(beat.eyebrow || "Greyhaven · After midnight")}</p>
          <h1 id="cutscene-title" tabindex="-1">
            ${
              beat.id === "press-deadline"
                ? "One story left"
                : beat.id === "past-due"
                  ? escapeHtml(language.fullName)
                  : beat.id === "answering-machine"
                    ? "Last shot"
                    : "Incoming message"
            }
          </h1>
          ${
            isMessageBeat
              ? `
                <div class="answering-machine-card ${messagePlayed ? "is-playing" : ""}">
                  <div class="machine-display" aria-hidden="true">
                    <span class="machine-light"></span>
                    <strong>${messagePlayed ? "PLAY" : "1 NEW"}</strong>
                    <small>${messagePlayed ? "00:19" : "--:--"}</small>
                  </div>
                  ${
                    messagePlayed
                      ? `
                        <div class="message-transcript" aria-live="polite">
                          <span class="speaker">${escapeHtml(beat.speaker)}</span>
                          <blockquote>“${escapeHtml(personalizedText)}”</blockquote>
                        </div>
                      `
                      : "<p>The caller blocked their number. The tape has not been played.</p>"
                  }
                </div>
              `
              : `
                <p class="cutscene-copy">${escapeHtml(personalizedText)}</p>
                ${beat.action ? `<p class="cutscene-action-prompt">${escapeHtml(beat.action)}</p>` : ""}
              `
          }
          <footer class="cutscene-actions">
            <span>${stepIndex + 1} / ${CUTSCENE_BEATS.length}</span>
            ${
              isMessageBeat
                ? messagePlayed
                  ? `<button class="button button-primary" data-action="finish-cutscene">Start the investigation</button>`
                  : `<button class="button button-primary" data-action="play-opening-message">Play the message</button>`
                : `<button class="button button-primary" data-action="advance-cutscene">${beat.id === "answering-machine" ? "Play the message" : "Continue"}</button>`
            }
          </footer>
        </section>
      </main>
    `;

    this.bindActions({
      "advance-cutscene": () => {
        this.store.update((draft) => {
          draft.progress.opening.cutsceneStep = Math.min(
            CUTSCENE_BEATS.length - 1,
            stepIndex + 1,
          );
          if (beat.id === "answering-machine") {
            draft.flags.heardOpeningMessage = true;
          }
        }, "advance-cutscene");
        this.saves.save(this.store.getState(), "advance-cutscene");
        this.renderCutscene();
      },
      "play-opening-message": () => {
        this.store.update((draft) => {
          draft.flags.heardOpeningMessage = true;
        }, "play-opening-message");
        this.saves.save(this.store.getState(), "play-opening-message");
        this.renderCutscene();
      },
      "finish-cutscene": () => this.completeOpening("complete-cutscene"),
      "skip-cutscene": () => this.completeOpening("skip-cutscene"),
    });
  }

  renderHome() {
    const state = this.store.getState();
    const playerName = `${escapeHtml(state.player.firstName)} ${escapeHtml(state.player.lastName)}`;
    const caseUpdate = state.flags.provedVesperWithholdsWarnings
      ? {
          title: "Eleven days of silence",
          text:
            "Vesper had an accurate Caligo flood forecast and buried it while the Benefactors assembled an intervention portfolio. The temporary auditor badge now opens the review hall where that decision was authorized.",
        }
      : state.flags.foundVesperWatchlist
        ? {
            title: "Shepherd is watching back",
            text:
              "The cistern evidence proves the hidden approach, suppressed warning queue, and active watchlist. Bring it to the case wall before climbing toward the Forecast Hall.",
          }
        : (state.locationVisits.vesper_western_cistern || 0) > 0
          ? {
              title: "The western cistern",
              text:
                "You reached Vesper inside the North Sound ferry's wake. Document the landing, clone the auditor badge, speak with archive controller Noor Aven, and inspect what the island's cameras are watching.",
            }
          : state.flags.provedVesperTransferRoute
      ? {
          title: "Forecast Island",
          text:
            "The Shepherd index proves Vesper Key does not predict catastrophe; it selects exploitable cities and writes their suffering into acquisition plans. The courier packet and tide route provide a way onto the island.",
        }
      : state.flags.foundShepherdForecastIndex
        ? {
            title: "The Shepherd archive",
            text:
              "Locker 44 held the false auditor packet, Vesper tide cipher, and Shepherd forecast index. Connect the courier trail to the Archipelago transfer order on the evidence board.",
          }
        : (state.locationVisits.port_prosper_eastern_terminal || 0) > 0
          ? {
              title: "Locker 44",
              text:
                "The Vesper courier is inside the eastern terminal. Copy the altered departure log, question Aya Sorn, identify the false auditor, and reach locker 44 without being made.",
            }
          : state.flags.provedSanctuaryChain
      ? {
          title: "Seven islands",
          text:
            "Port Prosper survived, but Meridian traced the breach, compromised the Ledger's source channel, and moved Shepherd's forecast archive from Orpheus into a seven-island sanctuary network. Vesper Key is next.",
        }
      : state.flags.foundArchipelagoTransferOrder
        ? {
            title: "The Archipelago Protocol",
            text:
              "The survival status, ghost relay, retaliation call, cloned newsroom cipher, island chart, and transfer order can prove what Meridian did after Aster House failed.",
          }
        : (state.locationVisits.port_prosper_signal_exchange || 0) > 0
          ? {
              title: "Six minutes of darkness",
              text:
                "Port Prosper's major systems held. Document the survival status, trace Relay 7, record the secure call, inspect the scorched cabinet, and recover the chart and transfer order.",
            }
          : state.progress.unlockedLocations.includes("port_prosper_signal_exchange")
            ? {
                title: "A city gets to wake up",
                text:
                  "The Aster countermeasure packet reached Port Prosper before 02:10. The Signal Exchange has preserved the one relay that still executed after the attack was stopped.",
              }
            : state.flags.provedAsterHouseTriggerCell
      ? {
          title: "Before 02:10",
          text:
            "Aster House's operators, credentials, timetable, and accounts are exposed. The countermeasure packet can stop Port Prosper from becoming the Benefactors' next case study.",
        }
      : state.flags.foundTriggerTeamDisbursementLedger
        ? {
            title: "The local hand",
            text:
              "Aster House's operations board, call sheet, purge order, and disbursement ledger can prove who will trigger the Port Prosper attack and who already paid them.",
          }
        : (state.locationVisits.aster_house || 0) > 0
          ? {
              title: "Aster House after midnight",
              text:
                "Document the illuminated operations board, copy the switchboard call sheet, search the open archive cabinet, and recover the disbursement ledger before the trigger team returns.",
            }
          : state.flags.identifiedAsterHouse
            ? {
                title: "The hand on the switch",
                text:
                  "The Port Prosper operation routes through Aster House, a Greyhaven crisis consultancy whose townhouse command cell is still active on Aldermere Row.",
              }
            : state.flags.warnedPortProsperQuietly
      ? {
          title: "The silent warning",
          text:
            "Port Prosper is quietly isolating its targeted systems. The First Circle still believes its operation is secret, giving you time to identify Meridian's local trigger team.",
        }
      : state.flags.publishedFirstCircleEvidence
        ? {
            title: "The story detonates",
            text:
              "The Benefactors files are mirrored worldwide. Meridian is denying everything, evacuating exposed principals, and destroying records before investigators can reach them.",
          }
        : state.flags.remainedUndercoverOnOrpheus
          ? {
              title: "Upstairs among the owners",
              text:
                "Your maintenance disguise still opens the residential wing. More conclusive leverage files wait upstairs, but Port Prosper's forty-eight-hour clock is still running.",
            }
          : state.flags.provedBenefactorsSelectCrises
      ? {
          title: "Forty-eight hours",
          text:
            "The First Circle selected Port Prosper and funded its collapse. You have their vote, their names, their plan, and a narrow chance to warn the city first.",
        }
      : state.flags.recordedFirstCircleVote &&
          state.flags.photographedFirstCircleRegistry &&
          state.flags.foundPortProsperPortfolio &&
          state.flags.foundCrisisInvestmentEscrow
        ? {
            title: "The owners",
            text:
              "The vote recording, seating registry, conversion portfolio, and escrow can prove the Benefactors select and profit from every manufactured crisis.",
          }
        : (state.locationVisits.orpheus_first_circle || 0) > 0
          ? {
              title: "The vote",
              text:
                "Record the live First Circle session, photograph its registry, copy the Port Prosper portfolio, and recover the sealed investment escrow.",
            }
          : state.flags.provedOrpheusCommandCenter
      ? {
          title: "The First Circle",
          text:
            "Orpheus is the Benefactors' command center. Their principals are meeting on Level 07 now to select and pre-position the next manufactured crisis.",
        }
      : state.flags.questionedAdrianMoss &&
          state.flags.photographedOrpheusArrivalRegistry &&
          state.flags.foundBenefactorClinicTransferOrder &&
          state.flags.photographedOrpheusSecurityWall &&
          state.flags.foundSublevelElevatorDirectory
        ? {
            title: "The people upstairs",
            text:
              "The arrival registry, clinic order, security wall, and elevator directory can prove Orpheus is a private command center rather than a refuge.",
          }
        : (state.locationVisits.orpheus_sublevel_harbor || 0) > 0
          ? {
              title: "The refuge beneath the island",
              text:
                "Show Adrian the maintenance badge and cold-chain manifest, then document the registry, clinic case, security wall, and elevator directory.",
            }
          : state.flags.provedOrpheusSupplyRoute
      ? {
          title: "Nineteen minutes to the island",
          text:
            "Blackwater is Orpheus's hidden lifeline. A maintenance credential and radar gap provide one way into the island's submerged service harbor.",
        }
      : state.flags.questionedTamsinPike &&
          state.flags.photographedBlackwaterLedger &&
          state.flags.foundOrpheusColdChainManifest &&
          state.flags.photographedIslandServiceLaunch &&
          state.flags.foundBlackwaterTideWindow
        ? {
            title: "The offshore lifeline",
            text:
              "The shadow ledger, cold-chain manifest, disguised launch, and tide window can prove how Redoubt supplies Orpheus outside every public record.",
          }
        : (state.locationVisits.blackwater_point || 0) > 0
          ? {
              title: "The island's hidden lifeline",
              text:
                "Show Tamsin the Orpheus service chart and cargo seal, then document the ledger, refrigerated container, launch, and tide locker.",
            }
          : state.flags.provedRedoubtEvacuation
      ? {
          title: "An island outside the map",
          text:
            "Redoubt evacuates Meridian's principals, archives, samples, and money to Orpheus. The island's disguised supply route begins at Blackwater Point.",
        }
      : state.flags.questionedEllisWard &&
          state.flags.photographedHangarManifest &&
          state.flags.photographedBenefactorBoarding &&
          state.flags.foundRedoubtCargoSeal &&
          state.flags.foundOrpheusRouteStrip
        ? {
            title: "The escape network",
            text:
              "The airfield statement, manifest, boarding photograph, cargo seal, and Orpheus route can prove who Redoubt saves when a manufactured crisis succeeds.",
          }
        : (state.locationVisits.greyhaven_executive_airfield || 0) > 0
          ? {
              title: "The first rescue",
              text:
                "Show Ellis the Hangar 4 credential and Redoubt flight log, then document the manifest, boarding party, cargo seal, and cockpit route.",
            }
          : state.flags.provedCrownlineGovernanceModel
      ? {
          title: "The trail leaves Greyhaven",
          text:
            "Crownline graded Bellwether as a successful transfer of public power. Redoubt moved Meridian's protected passengers through Hangar 4 toward Site Orpheus.",
        }
      : state.flags.questionedNiaKade &&
          state.flags.foundCrownlinePublicBrief &&
          state.flags.photographedCrisisDashboard &&
          state.flags.foundBellwetherScorecard &&
          state.flags.foundMeridianPriorityProtocol &&
          state.flags.foundRedoubtFlightSyncLog
        ? {
            title: "The conversion score",
            text:
              "Crownline's public brief, hidden scorecard, live dashboard, protected-assets protocol, and Redoubt schedule can prove what Bellwether was built to measure.",
          }
        : (state.locationVisits.crownline_data_center || 0) > 0
          ? {
              title: "A town reduced to numbers",
              text:
                "Show Nia the service badge and telemetry manifest, then inspect the operations wall, printer page, records cage, and freight scheduler.",
            }
          : state.flags.provedVerdantTestRange
      ? {
          title: "Someone watched the town fail",
          text:
            "Parcel Six was a controlled crisis laboratory, and Crownline received every live result. The service badge is your next way inside.",
        }
      : state.flags.questionedTessArlen &&
          state.flags.foundVerdantBrochure &&
          state.flags.foundParcelMortalityLog &&
          state.flags.photographedParcelInjectionRig &&
          state.flags.foundCrownlineTelemetryManifest
        ? {
            title: "The test range in the wetlands",
            text:
              "Tess's account, the hidden mortality log, injection rig, and Crownline telemetry route can expose what Parcel Six was built to do.",
          }
        : (state.locationVisits.verdant_conservation_office || 0) > 0
          ? {
              title: "The wetland that lies",
              text:
                "Show Tess the gate pass and sample analysis, then inspect the public board, quarantine cages, injection rig, and telemetry cabinet.",
            }
          : state.flags.provedBellwetherEngineered
      ? {
          title: "A demonstration disguised as a disaster",
          text:
            "VA-9 came from Verdant Parcel 6, Deepwell carried it to the bypass, and Meridian silenced the laboratory. Voss's gate pass is the next way in.",
        }
      : state.flags.foundAnnexSampleAnalysis &&
          state.flags.recordedMeridianFundingThreat &&
          state.flags.photographedWatershedInjectionMap &&
          state.flags.foundVerdantTransferLog
        ? {
            title: "A fingerprint inside the poison",
            text:
              "The duplicate analysis, funding threat, watershed map, and Verdant transfer log can prove Bellwether was engineered.",
          }
        : (state.locationVisits.university_lab_annex || 0) > 0
          ? {
              title: "Environmental Hold 6A",
              text:
                "Show Dr. Voss the field sample, then document the freezer analysis, saved voicemail, watershed map, and transfer clipboard.",
            }
          : state.flags.provedBellwetherResponsePreplanned
      ? {
          title: "The rescue was waiting",
          text:
            "Deepwell rehearsed the bypass, relief freight arrived early, and DW-4 remains in the taps. Dr. Voss kept a duplicate sample at the university river annex.",
        }
      : state.flags.foundDeepwellPumpLog &&
          state.flags.foundUniversityRejection &&
          state.flags.photographedBellwetherReliefCrates &&
          state.flags.loggedBellwetherTapSample
        ? {
            title: "Bellwether's impossible timeline",
            text:
              "Rina's account, the tap sample, early relief freight, and Deepwell service log belong on the evidence board.",
          }
        : (state.locationVisits.bellwether_relief_station || 0) > 0
          ? {
              title: "The people who stayed",
              text:
                "Question Rina, preserve a sample from Tap B-17, and inspect the relief freight, pump house, and community noticeboard.",
            }
          : state.flags.mappedContinuitySiteNetwork
      ? {
          title: "The solutions came first",
          text:
            "The foundation financed five hidden continuity sites through disposable contractors. Deepwell was funded before Bellwether's water failed.",
        }
      : state.flags.copiedMunicipalContractRegister &&
          state.flags.photographedContinuitySiteMap &&
          state.flags.foundArchiveDestructionOrder &&
          state.flags.foundBellwetherClipping
        ? {
            title: "Two ledgers, five hidden sites",
            text:
              "Harcourt's index, Register 09, the continuity map, and Wren's destruction order belong on the evidence board.",
          }
        : (state.locationVisits.municipal_archive || 0) > 0
          ? {
              title: "The city's second ledger",
              text:
                "Use Harcourt's request at the microfilm reader, then inspect the continuity map, destruction cage, and Deepwell file.",
            }
          : state.flags.foundHarcourtLedger
            ? {
                title: "Register 09",
                text:
                  "Harcourt's copied index names five program advances. Her request card opens the Municipal Records Archive basement.",
              }
            : state.flags.trustedByMinaHarcourt
              ? {
                  title: "The copy beneath the suitcase",
                  text:
                    "Mina kept her private reconciliation index and archive request beneath the half-packed suitcase.",
                }
              : (state.locationVisits.saltmere_apartment || 0) > 0
                ? {
                    title: "Someone searched Apartment 3C",
                    text:
                      "Photograph the opened files, then show Mina the Room B recording before whoever watched the building returns.",
                  }
                : state.flags.uncoveredContractorNetwork
      ? {
          title: "Northstar was a template",
          text:
            "Room B proves Brighter Horizon financed a network of disposable contractors. Former program accountant Mina Harcourt is the next lead at 26 Saltmere Walk.",
        }
      : state.flags.photographedContractorRoster &&
          state.flags.recordedRoomBConversation &&
          state.flags.foundAccountantForwardingSlip
        ? {
            title: "Five contractors, one program",
            text:
              "The Room B roster, recorded conversation, and Harcourt forwarding slip belong on the board beside the foundation’s disbursement report and Vale’s guest-list header.",
          }
        : (state.locationVisits.calder_grand_service_corridor || 0) > 0
          ? {
              title: "Behind the chandeliers",
              text:
                "Photograph the Room B contractor roster, record the conversation behind the salon door, and search the security desk for Harcourt’s forwarding address.",
            }
          : state.flags.foundGalaServicePass
            ? {
                title: "The door behind the benefit",
                text:
                  "Silas Wren’s dropped pass opens the Calder Grand service corridor. Follow Rook and Wren beyond the public ballroom.",
              }
            : state.flags.identifiedSilasWren
              ? {
                  title: "A guest without a seat",
                  text:
                    "Imani identified the circled man as Silas Wren. Photograph his meeting with Rook, recover the dropped operations pass, and follow the staff door.",
                }
              : (state.locationVisits.calder_grand_gala || 0) > 0
                ? {
                    title: "Invitation only",
                    text:
                      "The ballroom is public theater. Start with Imani at coat check, inspect the seating plan, question Rook, and watch the terrace.",
                  }
                : state.flags.brighterHorizonFundsNorthstar
      ? {
          title: "The charity created the contractor",
          text:
            "Brighter Horizon financed Northstar, administered its false identity, and routed the city’s reimbursement through Meridian. The Calder Grand benefit is the next opening.",
        }
      : state.flags.foundFoundationVisitorLog &&
          state.flags.foundFoundationDisbursementReport
        ? {
            title: "Two records, one invisible administrator",
            text:
              "The E. Marsh access log and duplicate $184,600 payment belong on the board beside Northstar’s invoice and courier manifest.",
          }
        : (state.locationVisits.brighter_horizon_office || 0) > 0
          ? {
              title: "Polished stone, careless paperwork",
              text:
                "Celia Orr knows the E. Marsh credential. Photograph the founders’ wall, inspect the visitor terminal, and recover the quarterly disbursement report.",
            }
          : state.flags.northstarRoutesToBrighterHorizon
      ? {
          title: "A charity collecting shell-company mail",
          text:
            "Northstar's courier trail ends at Brighter Horizon Foundation, 8 Calder Square. Its public office is now marked on the city map.",
        }
      : state.flags.foundNorthstarCourierManifest &&
          state.flags.photographedHarrowDirectory
        ? {
            title: "Northstar's empty office",
            text:
              "Suite 410 does not exist, but its mail does. Put the Harrow Street evidence beside the gala photograph on the board.",
          }
        : (state.locationVisits.northstar_harrow || 0) > 0
          ? {
              title: "Suite 410 does not exist",
              text:
                "The fourth floor ends at 409. Photograph the directory, question the manager, and find out who collects Northstar's mail.",
            }
          : state.progress.prologueComplete
            ? {
                title: "The next address",
                text:
                  "The gala photograph and Northstar’s Harrow Street address wait on the board. The renovation story is over. The larger one has begun.",
              }
      : state.flags.prologueEndingReady
        ? {
            title: "Three knocks at the door",
            text:
              "The final connection is proven. Someone outside knows you followed Vale’s trail. Open the evidence board when you are ready to answer.",
          }
        : state.flags.recordingReconstructed
          ? {
              title: "Vale left a trail",
              text:
                "The restored message belongs on the board beside the invoice, the missing addition, and the anonymous email.",
            }
          : state.flags.mayorMissing
            ? {
                title: "Mayor Vale is missing",
                text: "Mara’s message says the police completed a welfare check. Vale’s study is briefly unsecured—and now marked on the city map.",
              }
            : !state.flags.openedAnonymousEmail
              ? {
                  title: "The caller’s instruction",
                  text: "Check the laptop. Two anonymous files are waiting. Start with the invoice.",
                }
              : state.board.connections.length
                ? {
                    title: "The board is taking shape",
                    text: `${state.board.connections.length} yarn connection${state.board.connections.length === 1 ? "" : "s"} now ${state.board.connections.length === 1 ? "traces" : "trace"} the case. New evidence may change what the old clues mean.`,
                  }
                : GAME_CONTENT.officeHotspots[0];
    const openingMessageText = interpolatePlayerText(OPENING_MESSAGE, state.player);
    const officeHotspots = GAME_CONTENT.officeHotspots.map((hotspot) =>
      hotspot.id === "answering-machine"
        ? {
            ...hotspot,
            title: state.flags.heardOpeningMessage
              ? "Archived anonymous message"
              : hotspot.title,
            text: state.flags.heardOpeningMessage
              ? `“${openingMessageText}”`
              : hotspot.text,
          }
        : hotspot,
    );
    const note = this.activeOfficeNote || caseUpdate;

    this.root.innerHTML = `
      <main id="game-main" class="screen game-screen office-screen">
        ${this.renderGameHeader(this.chapterLabel(state), "Home office")}
        <section class="scene-frame" aria-label="Home office">
          <div class="office-room office-state-${state.progress.officeState} has-illustration">
            <img
              class="scene-backdrop office-backdrop"
              src="./assets/scenes/home-office.webp"
              alt=""
              draggable="false"
            />
            <div class="office-wall" aria-hidden="true"></div>
            <div class="window-view" aria-hidden="true">
              <span class="building building-one"></span>
              <span class="building building-two"></span>
              <span class="window-rain"></span>
            </div>
            <div class="evidence-board" aria-hidden="true">
              <span class="board-label">VALE / MUNICIPAL FUND</span>
              <span class="blank-card card-one"></span>
              <span class="blank-card card-two"></span>
              <span class="board-pin"></span>
            </div>
            <div class="city-map" aria-hidden="true"><span>GREYHAVEN</span></div>
            <div class="desk" aria-hidden="true">
              <span class="desk-lamp"></span>
              <span class="laptop"><i></i></span>
              <span class="phone"></span>
              <span class="coffee"></span>
              <span class="desk-paper"></span>
            </div>
            <div class="chair" aria-hidden="true"></div>
            ${officeHotspots.map(
              (hotspot) => `
                <button
                  class="scene-hotspot ${hotspot.className} ${
                    hotspot.id === "answering-machine" &&
                    !state.flags.heardOpeningMessage
                      ? "has-message"
                      : ""
                  }"
                  data-hotspot="${hotspot.id}"
                  aria-label="Examine ${hotspot.label}"
                  title="${hotspot.label}"
                ><span>${hotspot.label}</span></button>
              `,
            ).join("")}
          </div>
          <aside class="observation-card" aria-live="polite">
            <p class="observation-label">Observation</p>
            <h2>${escapeHtml(note.title)}</h2>
            <p>${escapeHtml(note.text)}</p>
            ${
              state.flags.provedBenefactorsSelectCrises &&
              !state.flags.portProsperDecisionMade
                ? '<button class="button button-primary" data-action="port-prosper-decision">Choose how to respond</button>'
                : state.flags.portProsperDecisionMade &&
                    !state.flags.portProsperFalloutSeen
                  ? '<button class="button button-primary" data-action="port-prosper-decision">Follow the consequences</button>'
                  : ""
            }
          </aside>
        </section>
        ${this.renderPressureDesk(state)}
        <footer class="game-toolbar">
          <div>
            <span class="toolbar-label">Journalist</span>
            <strong>${playerName}</strong>
          </div>
          <div class="toolbar-actions">
            <button class="tool-button" data-action="board">Evidence board</button>
            <button class="tool-button" data-action="map">City map</button>
            <button class="tool-button" data-action="notebook">Notebook</button>
            <button class="tool-button" data-action="inventory">Inventory</button>
            <button class="tool-button" data-action="save">Case files</button>
            <button class="tool-button" data-action="settings">Settings</button>
            <button class="tool-button" data-action="title">Main menu</button>
          </div>
        </footer>
        ${this.renderInventory(state)}
        ${this.renderToast()}
      </main>
    `;

    this.root.querySelectorAll("[data-hotspot]").forEach((button) => {
      button.addEventListener("click", () => {
        const hotspot = officeHotspots.find(
          (item) => item.id === button.dataset.hotspot,
        );
        if (hotspot.route) {
          this.router.navigate(hotspot.route);
          return;
        }
        if (hotspot.action === "play-opening-message") {
          if (!this.store.getState().flags.heardOpeningMessage) {
            this.store.update((draft) => {
              draft.flags.heardOpeningMessage = true;
            }, "play-opening-message");
            this.saves.save(this.store.getState(), "play-opening-message");
          }
          this.activeOfficeNote = {
            title: "Anonymous caller",
            text: `“${openingMessageText}”`,
          };
          this.renderHome();
          return;
        }
        this.activeOfficeNote = hotspot;
        this.renderHome();
      });
    });

    this.bindActions({
      map: () => this.router.navigate("map"),
      board: () => this.router.navigate("board"),
      notebook: () => this.openNotebook("home"),
      inventory: () => {
        this.inventoryOpen = !this.inventoryOpen;
        this.inventoryMessage = "";
        this.renderHome();
      },
      save: () => this.openCaseFiles("home"),
      settings: () => {
        this.returnRoute = "home";
        this.router.navigate("settings");
      },
      title: () => this.router.navigate("title"),
      "port-prosper-decision": () => this.router.navigate("port-prosper-decision"),
    });
    this.root.querySelectorAll("[data-countermeasure]").forEach((button) => {
      button.addEventListener("click", () => {
        const countermeasure = COUNTERMEASURES.find(
          (entry) => entry.id === button.dataset.countermeasure,
        );
        const next = applyCountermeasure(this.store.getState(), countermeasure);
        this.store.replace(next, `countermeasure-${countermeasure?.id || "unknown"}`);
        this.saves.save(this.store.getState(), `countermeasure-${countermeasure?.id || "unknown"}`);
        this.notice.show(`${countermeasure?.title || "Countermeasure"} completed.`);
        this.renderHome();
      });
    });
  }

  renderPressureDesk(state) {
    if (!state.pressure.events.length) return "";
    const status = pressureStatus(state.pressure.heat);
    const latestEvents = state.pressure.events
      .map((id) => PRESSURE_EVENTS.find((entry) => entry.id === id))
      .filter(Boolean)
      .slice(-3)
      .reverse();
    const measures = availableCountermeasures(state, COUNTERMEASURES);
    return `
      <section class="pressure-desk is-${status.className}" aria-labelledby="pressure-desk-title">
        <header>
          <div><p class="kicker">Threat desk · Soft pressure</p><h2 id="pressure-desk-title">${escapeHtml(status.label)}</h2></div>
          <div class="pressure-gauge"><span>Exposure</span><div><i style="width:${state.pressure.heat}%"></i></div><strong>${state.pressure.heat}</strong></div>
        </header>
        <p class="pressure-deadline"><span aria-hidden="true">◷</span>${escapeHtml(state.pressure.deadline)}</p>
        <div class="pressure-desk-grid">
          <div class="threat-feed">
            ${latestEvents.map((event) => `<article><span>${escapeHtml(event.title)}</span><p>${escapeHtml(event.text)}</p></article>`).join("")}
          </div>
          <div class="countermeasure-list">
            <p class="kicker">Available precautions</p>
            ${measures.length ? measures.map((entry) => `<button data-countermeasure="${entry.id}"><strong>${escapeHtml(entry.title)}</strong><span>${escapeHtml(entry.text)}</span><em>${entry.heat > 0 ? `Exposure +${entry.heat}` : `Exposure ${entry.heat}`}${entry.sourceRisk ? " · protects sources" : ""}</em></button>`).join("") : '<p class="pressure-clear">Every available precaution is already in place.</p>'}
          </div>
        </div>
        <footer>This meter changes story atmosphere and available precautions. It never locks exploration or creates a surprise game over.</footer>
      </section>
    `;
  }

  renderPortProsperDecision() {
    const state = this.store.getState();
    if (!state.flags.provedBenefactorsSelectCrises) {
      this.router.navigate("home", { replace: true });
      return;
    }

    const selected = state.progress.portProsperResponse
      ? PORT_PROSPER_RESPONSES[state.progress.portProsperResponse]
      : null;
    const aftermathStep = Number(state.progress.portProsperFalloutStep) || 0;
    const aftermathBeat = selected?.aftermath[aftermathStep] || null;
    const playerName = `${escapeHtml(state.player.firstName)} ${escapeHtml(state.player.lastName)}`;

    this.root.innerHTML = `
      <main id="game-main" class="screen decision-screen port-prosper-decision-screen">
        <div class="decision-backdrop" aria-hidden="true"></div>
        <section class="decision-shell" aria-labelledby="decision-title">
          <header class="decision-heading">
            <p class="kicker">Port Prosper · Forty-eight hours</p>
            <h1 id="decision-title" tabindex="-1">${selected ? escapeHtml(selected.title) : "What does the story require?"}</h1>
            <p>
              ${
                selected
                  ? escapeHtml(selected.consequence)
                  : "The next catastrophe is scheduled, funded, and waiting. Any response can save lives—but every response changes what the Benefactors do next."
              }
            </p>
          </header>
          ${
            selected
              ? `
                <article class="decision-result">
                  <p class="speaker">Decision recorded · ${playerName}</p>
                  <h2>${escapeHtml(selected.title)}</h2>
                  <p>${escapeHtml(selected.consequence)}</p>
                  ${
                    aftermathBeat
                      ? `
                        <div class="decision-aftermath">
                          <p class="kicker">${escapeHtml(aftermathBeat.label)}</p>
                          <h3>${escapeHtml(aftermathBeat.title)}</h3>
                          <p>${escapeHtml(aftermathBeat.text)}</p>
                        </div>
                        <button class="button button-primary" data-action="decision-aftermath">Continue</button>
                      `
                      : `
                        <div class="decision-aftermath is-complete">
                          <p class="kicker">New lead · Greyhaven</p>
                          <h3>Aster House</h3>
                          <p>The local trigger cell is exposed before Port Prosper's clock runs out. Its townhouse command post is now marked on the city map.</p>
                        </div>
                        <button class="button button-primary" data-action="decision-home">Return to the evidence board</button>
                      `
                  }
                </article>
              `
              : `
                <div class="decision-options">
                  ${Object.values(PORT_PROSPER_RESPONSES)
                    .map(
                      (response) => `
                        <article class="decision-option">
                          <p class="kicker">Irreversible choice</p>
                          <h2>${escapeHtml(response.title)}</h2>
                          <p>${escapeHtml(response.summary)}</p>
                          <button class="button button-primary" data-response-choice="${response.id}">Choose this response</button>
                        </article>
                      `,
                    )
                    .join("")}
                </div>
                <button class="button button-ghost decision-back" data-action="decision-back">Return to the office</button>
              `
          }
        </section>
      </main>
    `;

    this.root.querySelectorAll("[data-response-choice]").forEach((button) => {
      button.addEventListener("click", () => {
        const next = applyPortProsperResponse(
          this.store.getState(),
          button.dataset.responseChoice,
        );
        this.store.replace(next, `port-prosper-${button.dataset.responseChoice}`);
        this.saves.save(this.store.getState(), `port-prosper-${button.dataset.responseChoice}`);
        this.renderPortProsperDecision();
      });
    });

    this.bindActions({
      "decision-back": () => this.router.navigate("home"),
      "decision-aftermath": () => {
        const next = advancePortProsperAftermath(this.store.getState());
        this.store.replace(next, "port-prosper-aftermath");
        this.saves.save(this.store.getState(), "port-prosper-aftermath");
        this.renderPortProsperDecision();
      },
      "decision-home": () => {
        this.store.update((draft) => {
          draft.progress.currentScreen = "board";
          draft.progress.currentLocation = "home_office";
        }, "port-prosper-response-complete");
        this.saves.save(this.store.getState(), "port-prosper-response-complete");
        this.router.navigate("board");
      },
    });
  }

  renderLocation() {
    const state = this.store.getState();
    const location = getInteractiveLocation(
      GAME_CONTENT.locations[state.progress.currentLocation] ||
        GAME_CONTENT.locations.ledger_newsroom,
    );
    const note = this.activeLocationNote;
    const visibleHotspots = getVisibleHotspots(location, state);
    const observedCount = visibleHotspots.filter((hotspot) =>
      hasObservedHotspot(state, location.id, hotspot.id),
    ).length;
    const locationFieldNotes = (state.exploration?.fieldNotes || []).filter((key) =>
      key.startsWith(`${location.id}:`),
    ).length;
    const actionAvailable =
      note &&
      evaluateCondition(note.actionWhen, state) &&
      (note.dialogueId || note.route || note.effects);

    this.root.innerHTML = `
      <main id="game-main" class="screen game-screen location-screen">
        ${this.renderGameHeader(this.chapterLabel(state), location.name)}
        <section class="location-stage">
          ${renderExplorationScene(location, state, this.activeInventoryToolId)}
          <article class="location-copy">
            <p class="kicker">${escapeHtml(location.eyebrow)}</p>
            <h1 tabindex="-1">${escapeHtml(location.name)}</h1>
            <p>${escapeHtml(location.description)}</p>
            <div class="scene-progress" aria-label="Scene investigation progress">
              <span><strong>${observedCount}</strong> / ${visibleHotspots.length} details examined</span>
              <span><strong>${locationFieldNotes}</strong> field notes</span>
              <span>Visit <strong>${state.locationVisits[location.id] || 1}</strong></span>
            </div>
            ${
              note
                ? `
                  <div class="scene-inspection">
                    <span class="speaker">Observation</span>
                    <h2>${escapeHtml(note.title)}</h2>
                    <p>${escapeHtml(
                      note.resultShown ? note.resultText || note.text : note.text,
                    )}</p>
                    ${
                      note.fieldNote
                        ? `<p class="field-note-chip"><span>Field note</span>${escapeHtml(note.fieldNote)}</p>`
                        : ""
                    }
                    ${
                      note.toolId && INVENTORY_ITEMS[note.toolId]
                        ? `<p class="tool-use-chip"><span>${escapeHtml(INVENTORY_ITEMS[note.toolId].icon)}</span> Uses ${escapeHtml(INVENTORY_ITEMS[note.toolId].name)}</p>`
                        : ""
                    }
                    ${
                      actionAvailable
                        ? `<button class="button button-secondary" data-action="hotspot-action">${escapeHtml(note.actionLabel)}</button>`
                        : ""
                    }
                  </div>
                `
                : `
                  <div class="placeholder-dialogue">
                    <span class="speaker">Notebook</span>
                    <p>Select something in the scene to examine it.</p>
                  </div>
                `
            }
            <button class="button button-primary" data-action="map">Open city map</button>
          </article>
        </section>
        <footer class="game-toolbar">
          <div><span class="toolbar-label">Location</span><strong>${escapeHtml(location.name)}</strong></div>
          <div class="toolbar-actions">
            <button class="tool-button" data-action="inventory">Inventory</button>
            <button class="tool-button" data-action="notebook">Notebook</button>
            <button class="tool-button" data-action="home">Return home</button>
            <button class="tool-button" data-action="save">Case files</button>
            <button class="tool-button" data-action="settings">Settings</button>
          </div>
        </footer>
        ${this.renderInventory(state)}
        ${this.renderDialogue(state)}
        ${this.renderToast()}
      </main>
    `;

    this.root.querySelectorAll("[data-scene-hotspot]").forEach((button) => {
      button.addEventListener("click", () => {
        const hotspot = location.hotspots.find(
          (hotspot) => hotspot.id === button.dataset.sceneHotspot,
        );
        if (!hotspot) return;
        const wasObserved = hasObservedHotspot(
          this.store.getState(),
          location.id,
          hotspot.id,
        );
        this.activeLocationNote = {
          ...hotspot,
          text: getHotspotObservationText(this.store.getState(), location, hotspot),
          wasObserved,
        };
        if (!wasObserved || (hotspot.fieldNote && !this.store.getState().exploration.fieldNotes.includes(`${location.id}:${hotspot.id}`))) {
          const next = inspectHotspot(this.store.getState(), location, hotspot);
          this.store.replace(next, `inspect-${hotspot.id}`);
          this.saves.save(this.store.getState(), `inspect-${hotspot.id}`);
        }
        if (this.activeLocationNote?.toolId !== this.activeInventoryToolId) {
          this.activeInventoryToolId = null;
        }
        this.renderLocation();
      });
    });

    this.bindActions({
      "hotspot-action": () => {
        this.activeInventoryToolId = null;
        if (note.route) {
          this.puzzleAnnouncement = "";
          this.store.update((draft) => {
            draft.progress.previousScreen = "location";
            draft.progress.currentScreen = note.route;
          }, `open-${note.route}`);
          this.saves.save(this.store.getState(), `open-${note.route}`);
          this.router.navigate(note.route);
          return;
        }
        if (note.dialogueId) {
          this.notice.clear();
          let next = startDialogue(this.store.getState(), DIALOGUES, note.dialogueId);
          const openingNode = getDialogueNode(
            DIALOGUES,
            note.dialogueId,
            next.dialogue.activeNodeId,
          );
          next = applyEffects(next, openingNode.onEnter || []);
          this.store.replace(next, `dialogue-${note.dialogueId}`);
          this.saves.save(this.store.getState(), `dialogue-${note.dialogueId}`);
          this.renderLocation();
          return;
        }
        const evidenceBefore = new Set(this.store.getState().evidence.collected);
        let next = applyEffects(this.store.getState(), note.effects);
        next = completeInteraction(next, location.id, note.id);
        const addedEvidence = next.evidence.collected.some(
          (id) => !evidenceBefore.has(id),
        );
        this.store.replace(next, `hotspot-${note.id}`);
        this.saves.save(this.store.getState(), `hotspot-${note.id}`);
        this.activeLocationNote = { ...note, effects: null, resultShown: true };
        this.notice.show(
          addedEvidence
            ? "New evidence added to the case file."
            : "Field interaction recorded in your notebook.",
        );
        this.renderLocation();
      },
      map: () => this.router.navigate("map"),
      notebook: () => this.openNotebook("location"),
      inventory: () => {
        this.inventoryOpen = !this.inventoryOpen;
        this.inventoryMessage = "";
        this.renderLocation();
      },
      home: () => {
        this.activeOfficeNote = null;
        this.store.update((draft) => {
          draft.progress.currentLocation = "home_office";
          draft.progress.currentScreen = "home";
        }, "return-home");
        this.saves.save(this.store.getState(), "return-home");
        this.router.navigate("home");
      },
      save: () => this.openCaseFiles("location"),
      settings: () => {
        this.returnRoute = "location";
        this.router.navigate("settings");
      },
    });
    this.bindDialogueActions();
  }

  renderStudyAlignment() {
    const state = this.store.getState();
    if (!state.evidence.collected.includes(STUDY_ALIGNMENT_PUZZLE.requiredEvidenceId)) {
      this.store.update((draft) => {
        draft.progress.currentScreen = "location";
        draft.progress.currentLocation = "mayor_study";
      }, "alignment-missing-evidence");
      this.router.navigate("location", { replace: true });
      return;
    }

    const puzzle = state.puzzles[STUDY_ALIGNMENT_PUZZLE.id];
    const revealedHints = STUDY_ALIGNMENT_PUZZLE.hints.slice(
      0,
      puzzle.hintsRevealed,
    );
    const incorrectCopy =
      "The doorway lines cross the shelving. The orientation is still wrong.";
    const status = puzzle.completed
      ? STUDY_ALIGNMENT_PUZZLE.successCopy
      : this.puzzleAnnouncement ||
        `The plan is rotated ${puzzle.rotation} degrees. Compare the doorway, compass rose, and western bookcase.`;
    const statusState = puzzle.completed
      ? "success"
      : this.puzzleAnnouncement === incorrectCopy
        ? "error"
        : "neutral";

    this.root.innerHTML = `
      <main id="game-main" class="screen game-screen puzzle-screen alignment-screen">
        ${this.renderGameHeader(this.chapterLabel(state), "Mayor Vale’s study")}
        <section class="puzzle-shell" aria-labelledby="alignment-title">
          <header class="puzzle-heading">
            <div>
              <p class="kicker">${escapeHtml(STUDY_ALIGNMENT_PUZZLE.kicker)}</p>
              <h1 id="alignment-title" tabindex="-1">${escapeHtml(STUDY_ALIGNMENT_PUZZLE.title)}</h1>
              <p>${escapeHtml(STUDY_ALIGNMENT_PUZZLE.objective)}</p>
            </div>
            <span class="case-chip">${puzzle.completed ? "PASSAGE FOUND" : "DOCUMENT PUZZLE"}</span>
          </header>
          <div class="alignment-workspace">
            <div class="alignment-stage">
              <figure class="study-elevation">
                <img src="./assets/scenes/vale-study.webp" alt="" draggable="false" />
                <div
                  class="plan-sheet ${puzzle.completed ? "is-aligned" : ""}"
                  data-rotation="${puzzle.rotation}"
                  aria-hidden="true"
                >
                  <span class="plan-room" style="left:11%;top:16%;width:34%;height:29%">Study</span>
                  <span class="plan-room" style="left:48%;top:16%;width:38%;height:20%">Hall</span>
                  <span class="plan-room" style="left:48%;top:39%;width:38%;height:33%">Parlor</span>
                  <span class="plan-room" style="left:11%;top:49%;width:18%;height:32%">Service stair</span>
                  <span
                    class="plan-room is-target"
                    style="left:31%;top:49%;width:14%;height:32%"
                    ${puzzle.completed ? 'aria-current="true"' : ""}
                  >Western void</span>
                </div>
                <figcaption class="sr-only">
                  Original floorplan rotated ${puzzle.rotation} degrees over Vale’s study.
                  It marks the study, hall, parlor, service stair, and a western void.
                </figcaption>
              </figure>
            </div>
            <aside class="alignment-controls">
              <fieldset ${puzzle.completed ? "disabled" : ""}>
                <legend>Rotate the survey copy</legend>
                <button class="button button-secondary" data-action="rotate-plan-left" aria-label="Rotate plan counterclockwise">
                  ↶ Left
                </button>
                <button class="button button-secondary" data-action="rotate-plan-right" aria-label="Rotate plan clockwise">
                  Right ↷
                </button>
              </fieldset>
              <div
                class="puzzle-status"
                data-state="${statusState}"
                role="status"
                aria-live="polite"
              >${escapeHtml(status)}</div>
              <div class="puzzle-hints">
                <p class="kicker">Reporter’s notebook</p>
                ${
                  revealedHints.length
                    ? revealedHints
                        .map(
                          (hint) => `
                            <details open>
                              <summary>Hint ${hint.level}</summary>
                              <p>${escapeHtml(hint.text)}</p>
                            </details>
                          `,
                        )
                        .join("")
                    : "<p>No hints opened. The notebook never judges.</p>"
                }
                <button
                  class="button button-ghost"
                  data-action="alignment-hint"
                  ${puzzle.completed || puzzle.hintsRevealed >= STUDY_ALIGNMENT_PUZZLE.hints.length ? "disabled" : ""}
                >
                  ${puzzle.hintsRevealed ? "Reveal next hint" : "Open a hint"}
                </button>
              </div>
              ${
                puzzle.completed
                  ? `
                    <button class="button button-primary" data-action="descend-hidden-room">
                      Descend into the hidden room
                    </button>
                  `
                  : `
                    <button class="button button-primary" data-action="check-alignment">
                      Check alignment
                    </button>
                  `
              }
              <button class="button button-ghost" data-action="return-study">Return to the study</button>
            </aside>
          </div>
        </section>
      </main>
    `;

    const rotate = (direction, actionName) => {
      const current = this.store.getState();
      const nextPuzzle = rotateStudyPlan(
        current.puzzles[STUDY_ALIGNMENT_PUZZLE.id],
        direction,
      );
      current.puzzles[STUDY_ALIGNMENT_PUZZLE.id] = nextPuzzle;
      this.store.replace(current, "rotate-study-plan");
      this.saves.save(this.store.getState(), "rotate-study-plan");
      this.puzzleAnnouncement = `Plan rotated to ${nextPuzzle.rotation} degrees.`;
      this.renderStudyAlignment();
      this.root.querySelector(`[data-action="${actionName}"]`)?.focus();
    };

    this.bindActions({
      "rotate-plan-left": () => rotate("counterclockwise", "rotate-plan-left"),
      "rotate-plan-right": () => rotate("clockwise", "rotate-plan-right"),
      "alignment-hint": () => {
        const current = this.store.getState();
        current.puzzles[STUDY_ALIGNMENT_PUZZLE.id] = revealPuzzleHint(
          current.puzzles[STUDY_ALIGNMENT_PUZZLE.id],
          STUDY_ALIGNMENT_PUZZLE.hints.length,
        );
        this.store.replace(current, "alignment-hint");
        this.saves.save(this.store.getState(), "alignment-hint");
        this.puzzleAnnouncement = `Notebook hint ${current.puzzles[STUDY_ALIGNMENT_PUZZLE.id].hintsRevealed} opened.`;
        this.renderStudyAlignment();
        this.root.querySelector("[data-action='alignment-hint']")?.focus();
      },
      "check-alignment": () => {
        let current = this.store.getState();
        const before = current.puzzles[STUDY_ALIGNMENT_PUZZLE.id];
        const evaluated = evaluateStudyAlignment(
          before,
          STUDY_ALIGNMENT_PUZZLE.solutionRotation,
        );
        current.puzzles[STUDY_ALIGNMENT_PUZZLE.id] = evaluated;
        if (evaluated.completed && !before.completed) {
          current = applyEffects(
            current,
            STUDY_ALIGNMENT_PUZZLE.completionEffects,
          );
        }
        this.store.replace(current, "check-study-alignment");
        this.saves.save(this.store.getState(), "check-study-alignment");
        this.puzzleAnnouncement = evaluated.completed
          ? STUDY_ALIGNMENT_PUZZLE.successCopy
          : incorrectCopy;
        this.renderStudyAlignment();
        this.root
          .querySelector(
            evaluated.completed
              ? "[data-action='descend-hidden-room']"
              : "[data-action='check-alignment']",
          )
          ?.focus();
      },
      "descend-hidden-room": () => this.visitLocation("hidden_room"),
      "return-study": () => {
        this.store.update((draft) => {
          draft.progress.currentLocation = "mayor_study";
          draft.progress.currentScreen = "location";
        }, "return-study");
        this.saves.save(this.store.getState(), "return-study");
        this.router.navigate("location");
      },
    });
  }

  renderRecordingPuzzle() {
    const state = this.store.getState();
    if (!state.evidence.collected.includes(RECORDING_PUZZLE.requiredEvidenceId)) {
      this.store.update((draft) => {
        draft.progress.currentScreen = "location";
        draft.progress.currentLocation = "hidden_room";
      }, "recording-missing-evidence");
      this.router.navigate("location", { replace: true });
      return;
    }

    const puzzle = state.puzzles[RECORDING_PUZZLE.id];
    const fragmentById = new Map(
      RECORDING_PUZZLE.fragments.map((fragment) => [fragment.id, fragment]),
    );
    const revealedHints = RECORDING_PUZZLE.hints.slice(
      0,
      puzzle.hintsRevealed,
    );
    const status = puzzle.completed
      ? RECORDING_PUZZLE.successCopy
      : this.puzzleAnnouncement ||
        "The recovery deck is ready. Arrange all three fragments, then test the sequence.";
    const statusState = puzzle.completed
      ? "success"
      : this.puzzleAnnouncement === RECORDING_PUZZLE.incorrectCopy
        ? "error"
        : "neutral";

    this.root.innerHTML = `
      <main id="game-main" class="screen game-screen puzzle-screen recording-screen">
        ${this.renderGameHeader(this.chapterLabel(state), "Hidden communications room")}
        <section class="puzzle-shell" aria-labelledby="recording-title">
          <header class="puzzle-heading">
            <div>
              <p class="kicker">${escapeHtml(RECORDING_PUZZLE.kicker)}</p>
              <h1 id="recording-title" tabindex="-1">${escapeHtml(RECORDING_PUZZLE.title)}</h1>
              <p>${escapeHtml(RECORDING_PUZZLE.instruction)}</p>
            </div>
            <span class="case-chip">${puzzle.completed ? "AUDIO RESTORED" : "3 FRAGMENTS"}</span>
          </header>
          <div class="recording-workspace">
            <aside class="recording-console">
              <div>
                <p class="speaker">Recovery deck</p>
                <h2>Environmental continuity</h2>
              </div>
              <div class="waveform" aria-hidden="true">
                ${Array.from(
                  { length: 48 },
                  (_value, index) =>
                    `<i style="height:${18 + ((index * 23) % 58)}%"></i>`,
                ).join("")}
              </div>
              <p>
                The words are damaged at each cut. The background sounds are intact and
                fully captioned.
              </p>
              <div class="puzzle-hints">
                <p class="kicker">Reporter’s notebook</p>
                ${
                  revealedHints.length
                    ? revealedHints
                        .map(
                          (hint) => `
                            <details open>
                              <summary>Hint ${hint.level}</summary>
                              <p>${escapeHtml(hint.text)}</p>
                            </details>
                          `,
                        )
                        .join("")
                    : "<p>No hints opened. Read the room around Vale’s voice.</p>"
                }
                <button
                  class="button button-ghost"
                  data-action="recording-hint"
                  ${puzzle.completed || puzzle.hintsRevealed >= RECORDING_PUZZLE.hints.length ? "disabled" : ""}
                >
                  ${puzzle.hintsRevealed ? "Reveal next hint" : "Open a hint"}
                </button>
              </div>
              <button
                class="button button-primary"
                data-action="test-recording"
                ${puzzle.completed ? "disabled" : ""}
              >
                Test reconstruction
              </button>
              <button class="button button-ghost" data-action="return-hidden-room">
                Return to the hidden room
              </button>
            </aside>
            <section class="recording-timeline" aria-label="Recording reconstruction timeline">
              <ol aria-label="Reconstruction order">
                ${puzzle.order
                  .map((fragmentId, index) => {
                    const fragment = fragmentById.get(fragmentId);
                    if (!fragment) return "";
                    const isPlaying = this.activeRecordingFragmentId === fragment.id;
                    return `
                      <li
                        class="recording-fragment ${isPlaying ? "is-playing" : ""}"
                        data-recording-fragment="${fragment.id}"
                        data-position="${index + 1}"
                        tabindex="-1"
                        ${isPlaying ? 'aria-current="true"' : ""}
                      >
                        <p class="kicker">Position ${index + 1} of ${puzzle.order.length}</p>
                        <h3>${escapeHtml(fragment.label)}</h3>
                        <p class="audio-marker">${escapeHtml(fragment.caption)}</p>
                        ${
                          fragment.audio
                            ? `<audio
                                class="recording-audio"
                                data-recording-audio="${fragment.id}"
                                controls
                                preload="metadata"
                                src="${escapeHtml(fragment.audio)}"
                                aria-label="Play ${escapeHtml(fragment.label)} recording"
                              >Your browser cannot play this recording.</audio>`
                            : ""
                        }
                        <blockquote
                          id="fragment-transcript-${fragment.id}"
                          class="fragment-copy"
                          ${isPlaying ? "" : "hidden"}
                        >“${escapeHtml(fragment.transcript)}”</blockquote>
                        <div class="recording-fragment-controls">
                          <button
                            data-preview-fragment="${fragment.id}"
                            aria-expanded="${isPlaying}"
                            aria-controls="fragment-transcript-${fragment.id}"
                          >${isPlaying ? "Hide" : "Preview"} transcript</button>
                          <button
                            data-move-fragment="${fragment.id}"
                            data-direction="left"
                            ${puzzle.completed || index === 0 ? "disabled" : ""}
                          >Move earlier</button>
                          <button
                            data-move-fragment="${fragment.id}"
                            data-direction="right"
                            ${puzzle.completed || index === puzzle.order.length - 1 ? "disabled" : ""}
                          >Move later</button>
                        </div>
                      </li>
                    `;
                  })
                  .join("")}
              </ol>
              <div
                class="recording-status"
                data-state="${statusState}"
                role="status"
                aria-live="polite"
              >${escapeHtml(status)}</div>
              <article
                class="recording-transcript"
                ${puzzle.completed ? "" : "hidden"}
                aria-labelledby="recovered-message-title"
              >
                <p class="speaker">Recovered recording · Evelyn Vale</p>
                <h2 id="recovered-message-title" tabindex="-1">Forty-seven continuous seconds</h2>
                <audio
                  class="recording-audio recording-audio-restored"
                  data-recording-audio="restored"
                  controls
                  preload="metadata"
                  src="${escapeHtml(RECORDING_PUZZLE.recoveredAudio)}"
                  aria-label="Play Evelyn Vale's restored message"
                >Your browser cannot play the restored message.</audio>
                <blockquote>“${escapeHtml(RECORDING_PUZZLE.recoveredTranscript)}”</blockquote>
                <button class="button button-primary" data-action="take-recording-home">
                  Take the restored message home
                </button>
              </article>
            </section>
          </div>
        </section>
      </main>
    `;

    this.bindRecordingAudioActions();

    this.root.querySelectorAll("[data-preview-fragment]").forEach((button) => {
      button.addEventListener("click", () => {
        const fragmentId = button.dataset.previewFragment;
        const fragment = fragmentById.get(fragmentId);
        this.activeRecordingFragmentId =
          this.activeRecordingFragmentId === fragmentId ? null : fragmentId;
        this.puzzleAnnouncement = this.activeRecordingFragmentId
          ? `${fragment.label} transcript opened. ${fragment.transcript}`
          : `${fragment.label} transcript hidden.`;
        this.renderRecordingPuzzle();
        this.root
          .querySelector(`[data-preview-fragment="${fragmentId}"]`)
          ?.focus();
      });
    });

    this.root.querySelectorAll("[data-move-fragment]").forEach((button) => {
      button.addEventListener("click", () => {
        const current = this.store.getState();
        const fragmentId = button.dataset.moveFragment;
        const fragment = fragmentById.get(fragmentId);
        const direction = button.dataset.direction;
        const nextPuzzle = moveRecordingFragment(
          current.puzzles[RECORDING_PUZZLE.id],
          fragmentId,
          direction,
        );
        current.puzzles[RECORDING_PUZZLE.id] = nextPuzzle;
        this.store.replace(current, "move-recording-fragment");
        this.saves.save(this.store.getState(), "move-recording-fragment");
        const position = nextPuzzle.order.indexOf(fragmentId) + 1;
        this.puzzleAnnouncement = `${fragment.label} moved to position ${position} of ${nextPuzzle.order.length}.`;
        this.renderRecordingPuzzle();
        const preferredControl = this.root.querySelector(
          `[data-move-fragment="${fragmentId}"][data-direction="${direction}"]:not(:disabled)`,
        );
        const fallbackControl = this.root.querySelector(
          `[data-move-fragment="${fragmentId}"]:not(:disabled)`,
        );
        (preferredControl || fallbackControl)?.focus();
      });
    });

    this.bindActions({
      "recording-hint": () => {
        const current = this.store.getState();
        current.puzzles[RECORDING_PUZZLE.id] = revealRecordingHint(
          current.puzzles[RECORDING_PUZZLE.id],
          RECORDING_PUZZLE.hints.length,
        );
        this.store.replace(current, "recording-hint");
        this.saves.save(this.store.getState(), "recording-hint");
        this.puzzleAnnouncement = `Notebook hint ${current.puzzles[RECORDING_PUZZLE.id].hintsRevealed} opened.`;
        this.renderRecordingPuzzle();
        this.root.querySelector("[data-action='recording-hint']")?.focus();
      },
      "test-recording": () => {
        let current = this.store.getState();
        const before = current.puzzles[RECORDING_PUZZLE.id];
        const evaluated = evaluateRecordingSequence(
          before,
          RECORDING_PUZZLE.correctOrder,
        );
        current.puzzles[RECORDING_PUZZLE.id] = evaluated;
        if (evaluated.completed && !before.completed) {
          current = applyEffects(current, RECORDING_PUZZLE.completionEffects);
        }
        this.store.replace(current, "test-recording");
        this.saves.save(this.store.getState(), "test-recording");
        this.activeRecordingFragmentId = null;
        this.puzzleAnnouncement = evaluated.completed
          ? RECORDING_PUZZLE.successCopy
          : RECORDING_PUZZLE.incorrectCopy;
        this.renderRecordingPuzzle();
        this.root
          .querySelector(
            evaluated.completed
              ? "#recovered-message-title"
              : "[data-action='test-recording']",
          )
          ?.focus();
      },
      "take-recording-home": () => {
        this.store.update((draft) => {
          draft.progress.currentLocation = "home_office";
          draft.progress.previousScreen = "recording";
          draft.progress.currentScreen = "home";
        }, "recording-return-home");
        this.saves.save(this.store.getState(), "recording-return-home");
        this.activeOfficeNote = {
          title: "Vale left a trail",
          text:
            "The restored message belongs on the board beside the invoice, the missing addition, and the anonymous email.",
        };
        this.puzzleAnnouncement = "";
        this.router.navigate("home");
      },
      "return-hidden-room": () => {
        this.store.update((draft) => {
          draft.progress.currentLocation = "hidden_room";
          draft.progress.currentScreen = "location";
        }, "return-hidden-room");
        this.saves.save(this.store.getState(), "return-hidden-room");
        this.router.navigate("location");
      },
    });
  }

  renderPrologueEnding() {
    const state = this.store.getState();
    if (!state.flags.prologueEndingReady && !state.progress.prologueComplete) {
      this.store.update((draft) => {
        draft.progress.currentScreen = "board";
      }, "ending-not-ready");
      this.router.navigate("board", { replace: true });
      return;
    }

    const step = Math.max(
      0,
      Math.min(state.progress.prologueEndingStep, PROLOGUE_ENDING_BEATS.length - 1),
    );
    const beat = PROLOGUE_ENDING_BEATS[step];
    const isEnd = beat.type === "end";
    const nextLabel =
      beat.actionLabel ||
      (beat.type === "evidence"
        ? "Turn the photograph over"
        : beat.type === "lead"
          ? "Finish the prologue"
          : "Continue");

    const specialContent =
      beat.type === "evidence"
        ? `
          <figure class="ending-photo">
            <img
              src="./assets/evidence/gala-photograph.webp"
              alt="A formal humanitarian gala group photograph. A watchful man at the right edge is circled in dark red."
            />
            <figcaption>${escapeHtml(beat.caption)}</figcaption>
          </figure>
        `
        : beat.type === "lead"
          ? `<p class="ending-address">${escapeHtml(beat.label)}</p>`
          : "";

    this.root.innerHTML = `
      <main id="game-main" class="screen prologue-ending-screen">
        <img src="./assets/scenes/home-office.webp" alt="" />
        <article class="${isEnd ? "end-prologue-card" : "ending-card"}">
          <ol
            class="ending-progress"
            aria-label="Prologue ending progress: scene ${step + 1} of ${PROLOGUE_ENDING_BEATS.length}"
          >
            ${PROLOGUE_ENDING_BEATS.map(
              (_item, index) =>
                `<li ${index === step ? 'aria-current="step"' : ""}>Scene ${index + 1}</li>`,
            ).join("")}
          </ol>
          <p class="kicker">${isEnd ? "Case file 01" : "Home office · After midnight"}</p>
          <h1 tabindex="-1">${escapeHtml(beat.title || "The trail continues")}</h1>
          ${beat.text ? `<p>${escapeHtml(beat.text)}</p>` : ""}
          ${beat.subtitle ? `<p class="speaker">${escapeHtml(beat.subtitle)}</p>` : ""}
          ${specialContent}
          ${beat.footer ? `<p>${escapeHtml(beat.footer)}</p>` : ""}
          <footer>
            ${
              isEnd
                ? `
                  <button class="button button-primary" data-action="review-case-file">Review case file</button>
                  <button class="button button-secondary" data-action="ending-title">Return to title</button>
                `
                : `
                  <button class="button button-ghost" data-action="skip-prologue-ending">Skip to ending</button>
                  <button class="button button-primary" data-action="advance-prologue-ending">${escapeHtml(nextLabel)}</button>
                `
            }
          </footer>
        </article>
      </main>
    `;

    this.bindActions({
      "advance-prologue-ending": () => this.advancePrologueEnding(),
      "skip-prologue-ending": () => {
        let next = this.store.getState();
        for (const endingBeat of PROLOGUE_ENDING_BEATS) {
          next = applyEffects(next, endingBeat.completionEffects || []);
        }
        next.progress.prologueEndingStep = PROLOGUE_ENDING_BEATS.length - 1;
        next.progress.currentScreen = "prologue-ending";
        this.store.replace(next, "skip-prologue-ending");
        this.saves.save(this.store.getState(), "skip-prologue-ending");
        this.renderPrologueEnding();
        this.root.querySelector("h1")?.focus();
      },
      "review-case-file": () => {
        this.store.update((draft) => {
          draft.progress.currentLocation = "home_office";
          draft.progress.currentScreen = "board";
        }, "review-prologue-case");
        this.saves.save(this.store.getState(), "review-prologue-case");
        this.router.navigate("board");
      },
      "ending-title": () => {
        this.store.update((draft) => {
          draft.progress.currentLocation = "home_office";
          draft.progress.currentScreen = "home";
        }, "prologue-return-title");
        this.saves.save(this.store.getState(), "prologue-return-title");
        this.router.navigate("title");
      },
    });
  }

  advancePrologueEnding() {
    const current = this.store.getState();
    const nextStep = Math.min(
      current.progress.prologueEndingStep + 1,
      PROLOGUE_ENDING_BEATS.length - 1,
    );
    const nextBeat = PROLOGUE_ENDING_BEATS[nextStep];
    let next = applyEffects(current, nextBeat.completionEffects || []);
    next.progress.prologueEndingStep = nextStep;
    next.progress.currentScreen = "prologue-ending";
    this.store.replace(next, `prologue-ending-${nextBeat.id}`);
    this.saves.save(this.store.getState(), `prologue-ending-${nextBeat.id}`);
    this.renderPrologueEnding();
    this.root.querySelector("h1")?.focus();
  }

  renderMap() {
    const state = this.store.getState();
    const unlocked = new Set(state.progress.unlockedLocations);
    const locations = Object.values(GAME_CONTENT.locations).filter(
      (location) => location.id !== "home_office",
    );

    this.root.innerHTML = `
      <main id="game-main" class="screen game-screen map-screen">
        ${this.renderGameHeader(this.chapterLabel(state), "City map")}
        <section class="map-stage">
          <div class="map-paper" aria-label="Map of Greyhaven">
            <span class="river river-one" aria-hidden="true"></span>
            <span class="river river-two" aria-hidden="true"></span>
            <span class="map-grid" aria-hidden="true"></span>
            <span class="map-title">GREYHAVEN</span>
            ${locations
              .map((location) => {
                const isUnlocked = unlocked.has(location.id);
                return `
                  <button
                    class="map-pin ${isUnlocked ? "is-unlocked" : "is-locked"}"
                    style="left:${location.mapX}%;top:${location.mapY}%"
                    data-location="${location.id}"
                    ${isUnlocked ? "" : "disabled"}
                    aria-label="${isUnlocked ? `Travel to ${location.name}` : "Locked location"}"
                  >
                    <i aria-hidden="true"></i>
                    <span>${isUnlocked ? escapeHtml(location.name) : "Unknown"}</span>
                  </button>
                `;
              })
              .join("")}
          </div>
          <aside class="map-brief">
            <p class="kicker">Choose a lead</p>
            <h1 tabindex="-1">Greyhaven</h1>
            <p>
              Locations appear when the case gives you a reason to visit. Read the anonymous
              email on your laptop to open the first two leads.
            </p>
            <div class="lead-count">
              <strong>${unlocked.size - 1}</strong>
              <span>active destinations</span>
            </div>
            <button class="button button-secondary" data-action="home">Return home</button>
          </aside>
        </section>
        <footer class="game-toolbar">
          <div><span class="toolbar-label">Case map</span><strong>Greyhaven</strong></div>
          <div class="toolbar-actions">
            <button class="tool-button" data-action="inventory">Inventory</button>
            <button class="tool-button" data-action="notebook">Notebook</button>
            <button class="tool-button" data-action="save">Case files</button>
            <button class="tool-button" data-action="settings">Settings</button>
          </div>
        </footer>
        ${this.renderInventory(state)}
        ${this.renderToast()}
      </main>
    `;

    this.root.querySelectorAll("[data-location]:not(:disabled)").forEach((button) => {
      button.addEventListener("click", () => this.visitLocation(button.dataset.location));
    });
    this.bindActions({
      home: () => {
        this.activeOfficeNote = null;
        this.router.navigate("home");
      },
      notebook: () => this.openNotebook("map"),
      inventory: () => {
        this.inventoryOpen = !this.inventoryOpen;
        this.inventoryMessage = "";
        this.renderMap();
      },
      save: () => this.openCaseFiles("map"),
      settings: () => {
        this.returnRoute = "map";
        this.router.navigate("settings");
      },
    });
  }

  renderLaptop() {
    const state = this.store.getState();
    const opened = state.flags.openedAnonymousEmail;
    const downloaded = state.flags.downloadedAttachments;

    this.root.innerHTML = `
      <main id="game-main" class="screen laptop-screen">
        <section class="laptop-shell">
          <header class="mail-header">
            <button class="back-button" data-action="home">← Leave laptop</button>
            <strong>GREYMAIL</strong>
            <span>Secure connection: questionable</span>
          </header>
          <div class="mail-layout">
            <aside class="mail-list">
              <p class="kicker">Inbox · 1 unread</p>
              <button class="mail-item ${opened ? "" : "is-unread"}" data-action="open-email">
                <strong>(no sender)</strong>
                <span>Vale stole from the city.</span>
                <small>9:41 PM</small>
              </button>
            </aside>
            <article class="mail-message">
              ${
                opened
                  ? `
                    <header>
                      <p class="kicker">No subject</p>
                      <h1 tabindex="-1">Vale stole from the city.</h1>
                      <dl>
                        <div><dt>From</dt><dd>undisclosed</dd></div>
                        <div><dt>To</dt><dd>${escapeHtml(state.player.firstName.toLowerCase())}@greyhavenledger.test</dd></div>
                      </dl>
                    </header>
                    <div class="email-body">
                      <p>Mayor Vale diverted accessibility funds to build a private west wing.</p>
                      <p>The city paid Northstar Construction. Northstar does not exist.</p>
                      <p>Ask why the west wing must be ready before the <mark>Meridian guests</mark> arrive.</p>
                      <p class="email-signoff">Start with the invoice.</p>
                    </div>
                    <div class="attachments">
                      <button class="attachment" data-action="download" ${downloaded ? "disabled" : ""}>
                        <span class="attachment-icon">PDF</span>
                        <span><strong>northstar-invoice.pdf</strong><small>184 KB</small></span>
                      </button>
                      <button class="attachment" data-action="download" ${downloaded ? "disabled" : ""}>
                        <span class="attachment-icon">EML</span>
                        <span><strong>meridian-thread.eml</strong><small>12 KB</small></span>
                      </button>
                    </div>
                    ${downloaded ? `<p class="download-confirmation">Attachments added to your case file. City Hall and the Vale residence are now on the map.</p>` : ""}
                  `
                  : `
                    <div class="empty-mail">
                      <span>✉</span>
                      <p>Select the unread message.</p>
                    </div>
                  `
              }
            </article>
          </div>
        </section>
      </main>
    `;

    this.bindActions({
      home: () => {
        this.activeOfficeNote = null;
        this.router.navigate("home");
      },
      "open-email": () => {
        if (!opened) {
          const next = applyEffects(this.store.getState(), [
            { type: "setFlag", key: "openedAnonymousEmail", value: true },
          ]);
          this.store.replace(next, "open-anonymous-email");
          this.saves.save(this.store.getState(), "open-anonymous-email");
        }
        this.renderLaptop();
      },
      download: () => {
        const next = applyEffects(this.store.getState(), [
          { type: "setFlag", key: "downloadedAttachments", value: true },
          { type: "collectEvidence", id: "email_meridian" },
          { type: "collectEvidence", id: "invoice_northstar" },
          { type: "unlockLocation", id: "city_hall" },
          { type: "unlockLocation", id: "mayor_street" },
        ]);
        this.store.replace(next, "download-leak");
        this.saves.save(this.store.getState(), "download-leak");
        this.renderLaptop();
      },
    });
  }

  renderBoard() {
    const state = this.store.getState();
    const boardView = {
      density: "compact",
      categoryFilter: "all",
      lens: "all",
      arrangement: "chronology",
      ...(state.board.view || {}),
    };
    this.boardDensity = boardView.density;
    this.boardCategoryFilter = boardView.categoryFilter;
    this.boardLens = boardView.lens;
    const pinned = state.evidence.pinned
      .map((id) => EVIDENCE[id])
      .filter(Boolean);
    const unpinned = state.evidence.collected
      .filter((id) => !state.evidence.pinned.includes(id))
      .map((id) => EVIDENCE[id])
      .filter(Boolean);
    this.selectedBoardCards = this.selectedBoardCards.filter((id) =>
      state.evidence.pinned.includes(id),
    );
    const selectedItems = this.selectedBoardCards.map((id) => EVIDENCE[id]);
    const relationshipById = new Map(
      YARN_RELATIONSHIPS.map((relationship) => [relationship.id, relationship]),
    );
    const activeRelationship =
      relationshipById.get(this.boardConnectionType) || YARN_RELATIONSHIPS[0];
    const activeTheory =
      Object.values(DEDUCTIONS).find((deduction) => {
        if (state.completedDeductions.includes(deduction.id)) return false;
        const prerequisitesMet = (deduction.requiredDeductions || []).every((id) =>
          state.completedDeductions.includes(id),
        );
        const hasStarted = deduction.requiredEvidence.some((id) =>
          state.evidence.collected.includes(id),
        );
        return prerequisitesMet && hasStarted;
      }) || null;
    const corroboratedEvidence = new Set(state.evidence.corroborated || []);
    for (const deductionId of state.completedDeductions) {
      for (const evidenceId of DEDUCTIONS[deductionId]?.requiredEvidence || []) {
        corroboratedEvidence.add(evidenceId);
      }
    }
    const connectedEvidence = new Set(
      state.board.connections.flatMap((connection) => [connection.a, connection.b]),
    );
    const boardLensLabels = {
      all: "Everything",
      theory: "Active theory",
      unconnected: "Unconnected",
      annotated: "My notes",
      corroborated: "Corroborated",
    };
    const matchesBoardLens = (item) => {
      if (this.boardLens === "theory") {
        return Boolean(activeTheory?.requiredEvidence.includes(item.id));
      }
      if (this.boardLens === "unconnected") return !connectedEvidence.has(item.id);
      if (this.boardLens === "annotated") return Boolean(state.board.notes?.[item.id]);
      if (this.boardLens === "corroborated") return corroboratedEvidence.has(item.id);
      return true;
    };
    const boardLenses = Object.entries(boardLensLabels).map(([id, label]) => ({
      id,
      label,
      count: pinned.filter((item) => {
        if (id === "theory") return Boolean(activeTheory?.requiredEvidence.includes(item.id));
        if (id === "unconnected") return !connectedEvidence.has(item.id);
        if (id === "annotated") return Boolean(state.board.notes?.[item.id]);
        if (id === "corroborated") return corroboratedEvidence.has(item.id);
        return true;
      }).length,
    }));
    if (
      !boardLensLabels[this.boardLens] ||
      (this.boardLens === "theory" && !activeTheory)
    ) {
      this.boardLens = "all";
    }
    const activeTheoryConnections = (activeTheory?.requiredConnections || []).map(
      (required) => {
        const connection = state.board.connections.find(
          (candidate) =>
            (candidate.a === required.a && candidate.b === required.b) ||
            (candidate.a === required.b && candidate.b === required.a),
        );
        return {
          ...required,
          connection,
          complete: connection?.type === required.type,
          relationship:
            relationshipById.get(required.type) || {
              label: required.type,
              colorName: required.type,
            },
        };
      },
    );
    const missingTheoryEvidence = (activeTheory?.requiredEvidence || []).filter(
      (id) => !state.evidence.collected.includes(id),
    );
    const completedTheoryLinks = activeTheoryConnections.filter(
      (connection) => connection.complete,
    ).length;
    const boardCategoryLabels = {
      all: "All clues",
      document: "Documents",
      photograph: "Photos",
      recording: "Recordings",
      financial: "Money",
      location: "Locations",
      event: "Events",
    };
    const boardFilters = ["all", ...new Set(pinned.map((item) => item.category))]
      .filter((category) => boardCategoryLabels[category])
      .map((category) => ({
        id: category,
        label: boardCategoryLabels[category],
        count:
          category === "all"
            ? pinned.length
            : pinned.filter((item) => item.category === category).length,
      }));
    if (!boardFilters.some((filter) => filter.id === this.boardCategoryFilter)) {
      this.boardCategoryFilter = "all";
    }
    const boardDensityOptions = {
      detailed: {
        label: "Detailed",
        description: "Largest cards",
        canvasWidth: 1800,
        cardWidth: 12.5,
        cardHeight: 230,
        rowHeight: 275,
      },
      compact: {
        label: "Compact",
        description: "Best for casework",
        canvasWidth: 1500,
        cardWidth: 11.8,
        cardHeight: 205,
        rowHeight: 245,
      },
      overview: {
        label: "Overview",
        description: "See more at once",
        canvasWidth: 1250,
        cardWidth: 11.8,
        cardHeight: 130,
        rowHeight: 168,
      },
    };
    const boardDensity =
      boardDensityOptions[this.boardDensity] || boardDensityOptions.compact;
    const boardRows = Math.max(3, Math.ceil(pinned.length / 7));
    const corkboardHeight = Math.max(
      680,
      130 + boardRows * boardDensity.rowHeight,
    );
    const yarnAnchorX = boardDensity.cardWidth / 2;
    const yarnAnchorY = (14 / corkboardHeight) * 100;
    const boardCase = state.flags.provedVesperWithholdsWarnings
      ? {
          number: "17",
          title: "VESPER KEY / DISCLOSURE CONTROL",
          phase: "Suppression proven / Reach the Shepherd review hall",
        }
      : state.flags.foundVesperWatchlist
        ? {
            number: "17",
            title: "VESPER KEY / ELEVEN DAYS OF SILENCE",
            phase: "Connect the forecast, suppression order, and source watchlist",
          }
        : (state.locationVisits.vesper_western_cistern || 0) > 0
          ? {
              number: "17",
              title: "VESPER KEY / WESTERN CISTERN",
              phase: "Borrowed auditor cover / Twenty-four minutes remain",
            }
          : state.flags.provedVesperTransferRoute
      ? {
          number: "16",
          title: "VESPER KEY / FORECAST ISLAND",
          phase: "Shepherd archive exposed / Plan the island approach",
        }
      : state.flags.foundShepherdForecastIndex
        ? {
            number: "16",
            title: "VESPER KEY / SHEPHERD ARCHIVE",
            phase: "Connect the courier packet to Meridian's forecast transfer",
          }
        : (state.locationVisits.port_prosper_eastern_terminal || 0) > 0
          ? {
              number: "16",
              title: "EASTERN TERMINAL / LOCKER 44",
              phase: "Identify the courier / Intercept the Vesper packet",
            }
          : state.flags.provedSanctuaryChain
      ? {
          number: "15",
          title: "SANCTUARY CHAIN / VESPER KEY",
          phase: "Seven island nodes exposed / Intercept the 05:30 packet",
        }
      : state.flags.foundArchipelagoTransferOrder
        ? {
            number: "14",
            title: "ARCHIPELAGO PROTOCOL / RETALIATION",
            phase: "Connect the ghost relay, newsroom breach, and island transfer",
          }
        : (state.locationVisits.port_prosper_signal_exchange || 0) > 0
          ? {
              number: "14",
              title: "PORT PROSPER / SIX-MINUTE BREACH",
              phase: "Trace what escaped after the city survived",
            }
          : state.progress.unlockedLocations.includes("port_prosper_signal_exchange")
            ? {
                number: "14",
                title: "PORT PROSPER / AFTERMATH",
                phase: "Countermeasure delivered / Inspect Relay 7",
              }
            : state.flags.provedAsterHouseTriggerCell
      ? {
          number: "13",
          title: "PORT PROSPER / COUNTERMEASURE",
          phase: "Trigger cell exposed · Stop the 02:10 attack",
        }
      : state.flags.identifiedAsterHouse
        ? {
            number: "12",
            title: "ASTER HOUSE / TRIGGER CELL",
            phase: "Connect the local operators to the First Circle",
          }
        : state.flags.portProsperDecisionMade
      ? {
          number: "11",
          title: "PORT PROSPER / RESPONSE",
          phase: state.flags.warnedPortProsperQuietly
            ? "City warned · Source remains covert"
            : state.flags.publishedFirstCircleEvidence
              ? "Evidence public · Network evacuating"
              : "Deep cover maintained · Clock running",
        }
      : state.flags.provedBenefactorsSelectCrises
      ? {
          number: "10",
          title: "PORT PROSPER / FORTY-EIGHT HOURS",
          phase: "Warn the next city before the trigger",
        }
      : (state.locationVisits.orpheus_first_circle || 0) > 0
        ? {
            number: "09",
            title: "FIRST CIRCLE / CRISIS VOTE",
            phase: "Prove who selects and profits",
          }
        : state.flags.provedOrpheusCommandCenter
      ? {
          number: "09",
          title: "THE BENEFECTORS / FIRST CIRCLE",
          phase: "Next lead: Level 07 assembly hall",
        }
      : (state.locationVisits.orpheus_sublevel_harbor || 0) > 0
        ? {
            number: "08",
            title: "ORPHEUS / COMMAND CENTER",
            phase: "Expose what the island protects",
          }
        : state.flags.provedOrpheusSupplyRoute
      ? {
          number: "08",
          title: "ORPHEUS / ISLAND ACCESS",
          phase: "Next lead: North Reef service harbor",
        }
      : (state.locationVisits.blackwater_point || 0) > 0
        ? {
            number: "07",
            title: "BLACKWATER / OFFSHORE LIFELINE",
            phase: "Trace the concealed island crossing",
          }
        : state.flags.provedRedoubtEvacuation
      ? {
          number: "07",
          title: "ORPHEUS / OFFSHORE NETWORK",
          phase: "Next lead: Blackwater Point",
        }
      : (state.locationVisits.greyhaven_executive_airfield || 0) > 0
        ? {
            number: "06",
            title: "REDOUBT / HANGAR 4",
            phase: "Document the evacuation network",
          }
        : state.flags.provedCrownlineGovernanceModel
      ? {
          number: "06",
          title: "REDOUBT / SITE ORPHEUS",
          phase: "Next lead: Greyhaven Executive Airfield",
        }
      : state.flags.provedVerdantTestRange
      ? {
          number: "05",
          title: "CROWNLINE / RESPONSE MODEL",
          phase: "Next lead: Crownline Data Services",
        }
      : state.flags.provedBellwetherEngineered
      ? {
          number: "04",
          title: "VERDANT / WATERSHED TRIAL",
          phase: "Next lead: Conservation Parcel 6",
        }
      : state.flags.provedBellwetherResponsePreplanned
      ? {
          number: "03",
          title: "BELLWETHER / STAGED RELIEF",
          phase: "Next lead: University River Annex",
        }
      : state.flags.mappedContinuitySiteNetwork
        ? {
            number: "02",
            title: "MERIDIAN / CONTINUITY NETWORK",
            phase: "Tracing the manufactured crises",
          }
        : {
            number: "01",
            title: "VALE / ACCESSIBILITY FUND",
            phase: "Follow the Northstar paper trail",
          };
    const selectedConnection =
      this.selectedBoardCards.length === 2
        ? state.board.connections.find(
            (connection) =>
              (connection.a === this.selectedBoardCards[0] &&
                connection.b === this.selectedBoardCards[1]) ||
              (connection.a === this.selectedBoardCards[1] &&
                connection.b === this.selectedBoardCards[0]),
          )
        : null;
    const connectionStatus =
      pinned.length < 2
        ? "Pin at least two clues to create a connection."
        : this.selectedBoardCards.length === 0
          ? "Click “Select as clue 1” on any evidence card below."
          : this.selectedBoardCards.length === 1
            ? "Clue 1 selected. Click “Select as clue 2” on a different card."
            : selectedConnection
              ? `These clues are already connected as ${relationshipById.get(selectedConnection.type)?.label || selectedConnection.type}. You can update the yarn meaning.`
              : "Two clues selected. Use step 3 to tie the yarn.";
    const emptyBoardCopy = state.evidence.collected.length
      ? "Your evidence is in the tray. Use “Pin to board” to start arranging the case."
      : "Open the anonymous email and add its attachments to the case file.";

    this.root.innerHTML = `
      <main id="game-main" class="screen game-screen board-screen">
        ${this.renderGameHeader(this.chapterLabel(state), "Evidence board")}
        <section class="board-workspace">
          <section class="connection-builder ${this.boardConnectionPanelOpen ? "is-open" : "is-collapsed"}" aria-labelledby="connection-builder-title">
            <div class="connection-builder-heading">
              <p class="kicker">Tie the case together</p>
              <h1 id="connection-builder-title" tabindex="-1">Connect evidence</h1>
              <p>Choose what the yarn means, then use the selection controls printed on two evidence cards below.</p>
              <button
                class="connection-panel-toggle"
                data-action="toggle-connection-panel"
                aria-expanded="${this.boardConnectionPanelOpen}"
              >
                ${this.boardConnectionPanelOpen ? "Hide yarn desk" : "Open yarn desk"}
              </button>
            </div>
            <fieldset class="relationship-fieldset">
              <legend>1. Choose a relationship</legend>
              <div class="relationship-picker">
                ${YARN_RELATIONSHIPS.map(
                  (relationship) => `
                    <label class="relationship relationship-${relationship.id} ${this.boardConnectionType === relationship.id ? "is-active" : ""}">
                      <input
                        type="radio"
                        name="board-relationship"
                        value="${relationship.id}"
                        ${this.boardConnectionType === relationship.id ? "checked" : ""}
                      />
                      <span class="relationship-sample" aria-hidden="true"><i></i></span>
                      <span class="relationship-copy">
                        <strong>${escapeHtml(relationship.label)}</strong>
                        <small>${escapeHtml(relationship.colorName)} · ${escapeHtml(relationship.patternLabel)}</small>
                        <span>${escapeHtml(relationship.description)}</span>
                      </span>
                    </label>
                  `,
                ).join("")}
              </div>
            </fieldset>
            <div class="connection-selection">
              <p class="connection-step-label">2. Select two pinned clues</p>
              <div class="connection-slots">
                <div class="${selectedItems[0] ? "is-filled" : ""}">
                  <span>Clue 1</span>
                  <strong>${escapeHtml(selectedItems[0]?.title || "Not selected")}</strong>
                </div>
                <span aria-hidden="true">+</span>
                <div class="${selectedItems[1] ? "is-filled" : ""}">
                  <span>Clue 2</span>
                  <strong>${escapeHtml(selectedItems[1]?.title || "Not selected")}</strong>
                </div>
              </div>
              <p class="connection-status" role="status" aria-live="polite">${escapeHtml(connectionStatus)}</p>
              ${
                state.board.lastFeedback
                  ? `<aside class="connection-feedback feedback-${escapeHtml(state.board.lastFeedback.kind)}">
                      <strong>${escapeHtml(state.board.lastFeedback.title)}</strong>
                      <p>${escapeHtml(state.board.lastFeedback.text)}</p>
                    </aside>`
                  : ""
              }
              <p class="connection-step-label connection-final-step">3. Tie the yarn</p>
              <div class="connection-builder-actions">
                <button
                  class="button button-primary"
                  data-action="connect-selected"
                  ${this.selectedBoardCards.length === 2 ? "" : "disabled"}
                >
                  ${selectedConnection ? "Update connection" : "Connect evidence"}
                </button>
                <button
                  class="button button-ghost"
                  data-action="clear-board-selection"
                  ${this.selectedBoardCards.length ? "" : "disabled"}
                >
                  Clear selection
                </button>
              </div>
            </div>
          </section>
          <div
            class="board-canvas-scroll"
            tabindex="0"
            aria-label="Scrollable evidence-board canvas"
          >
          <div
            class="corkboard board-density-${this.boardDensity}"
            id="evidence-corkboard"
            aria-label="Interactive evidence board"
            style="--board-card-width:${boardDensity.cardWidth}%;--board-card-height:${boardDensity.cardHeight}px;min-width:${boardDensity.canvasWidth}px;min-height:${corkboardHeight}px"
          >
            <svg class="yarn-layer" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              ${state.board.connections
                .map((connection) => {
                  if (
                    !state.evidence.pinned.includes(connection.a) ||
                    !state.evidence.pinned.includes(connection.b)
                  ) {
                    return "";
                  }
                  const a = state.board.cards[connection.a];
                  const b = state.board.cards[connection.b];
                  if (!a || !b) return "";
                  const aEvidence = EVIDENCE[connection.a];
                  const bEvidence = EVIDENCE[connection.b];
                  const matchesFilters = (item) =>
                    item &&
                    (this.boardCategoryFilter === "all" ||
                      item.category === this.boardCategoryFilter) &&
                    matchesBoardLens(item);
                  const muted =
                    !matchesFilters(aEvidence) && !matchesFilters(bEvidence);
                  return `<line class="yarn yarn-${connection.type} ${muted ? "is-filter-muted" : ""}" x1="${a.x + yarnAnchorX}" y1="${a.y + yarnAnchorY}" x2="${b.x + yarnAnchorX}" y2="${b.y + yarnAnchorY}" />`;
                })
                .join("")}
            </svg>
            <div class="board-case-label">
              <span>ACTIVE CASE ${boardCase.number}</span>
              <strong>${escapeHtml(boardCase.title)}</strong>
              <small>${escapeHtml(boardCase.phase)}</small>
            </div>
            ${
              pinned.length
                ? pinned
                    .map((item) => {
                      const position = state.board.cards[item.id] || { x: 10, y: 10 };
                      const categoryMatch =
                        this.boardCategoryFilter === "all" ||
                        item.category === this.boardCategoryFilter;
                      const lensMatch = matchesBoardLens(item);
                      const filtersActive =
                        this.boardCategoryFilter !== "all" || this.boardLens !== "all";
                      const filterClass = !filtersActive
                        ? ""
                        : categoryMatch && lensMatch
                          ? "is-filter-match"
                          : "is-filter-muted";
                      const evidenceNote = state.board.notes?.[item.id] || "";
                      const corroborated = corroboratedEvidence.has(item.id);
                      const selectedIndex = this.selectedBoardCards.indexOf(item.id);
                      const selected = selectedIndex >= 0;
                      const selectionLabel = selected
                        ? `Deselect clue ${selectedIndex + 1}: ${item.title}`
                        : this.selectedBoardCards.length < 2
                          ? `Select ${item.title} as clue ${this.selectedBoardCards.length + 1}`
                          : `Two clues are already selected. Clear or connect them before selecting ${item.title}`;
                      const selectionPrompt = selected
                        ? `✓ Clue ${selectedIndex + 1} selected`
                        : this.selectedBoardCards.length < 2
                          ? `Select as clue ${this.selectedBoardCards.length + 1}`
                          : "Two clues selected";
                      return `
                        <article
                          class="evidence-card evidence-card--${item.artifact?.type || "document"} evidence-category-${item.category} evidence-presentation-${getEvidencePresentation(item).motif} ${selected ? "is-selected" : ""} ${corroborated ? "is-corroborated" : ""} ${evidenceNote ? "has-note" : ""} ${filterClass}"
                          style="left:${position.x}%;top:${position.y}%"
                          data-evidence-card-shell="${item.id}"
                          data-category="${item.category}"
                        >
                          <span class="evidence-drag-handle" data-drag-handle aria-hidden="true">
                            Move
                          </span>
                          <button
                            class="evidence-card-main"
                            data-board-card="${item.id}"
                            aria-pressed="${selected}"
                            aria-label="${escapeHtml(selectionLabel)}"
                          >
                            <span class="evidence-pin" aria-hidden="true"></span>
                            ${selected ? `<span class="evidence-selection-number" aria-hidden="true">${selectedIndex + 1}</span>` : ""}
                            <span
                              class="evidence-card-thumbnail"
                              aria-hidden="true"
                              ${item.artifact?.image ? `style="background-image:linear-gradient(rgba(12,18,16,.08),rgba(12,18,16,.2)),url('${item.artifact.image}')"` : ""}
                            ><i></i><i></i><i></i></span>
                            <span class="evidence-type-stamp" aria-hidden="true">${escapeHtml(getEvidencePresentation(item).stamp)}</span>
                            <span class="evidence-category">${escapeHtml(getEvidencePresentation(item).label)}</span>
                            ${corroborated ? '<span class="evidence-status-stamp">Corroborated</span>' : ""}
                            <strong>${escapeHtml(item.title)}</strong>
                            <small>${escapeHtml(item.summary)}</small>
                            ${evidenceNote ? `<span class="evidence-note-preview">“${escapeHtml(evidenceNote)}”</span>` : ""}
                            <span class="evidence-select-prompt">${escapeHtml(selectionPrompt)}</span>
                          </button>
                          <button class="evidence-view-button" data-view-evidence="${item.id}">
                            View evidence
                          </button>
                          <button class="evidence-note-button" data-edit-evidence-note="${item.id}">
                            ${evidenceNote ? "Edit my note" : "Add my note"}
                          </button>
                          <button
                            class="evidence-unpin-button"
                            data-unpin-evidence="${item.id}"
                            aria-label="Move ${escapeHtml(item.title)} back to the evidence tray"
                          >
                            Move to tray
                          </button>
                        </article>
                      `;
                    })
                    .join("")
                : `
                  <div class="empty-board">
                    <strong>The board is waiting.</strong>
                    <span>${escapeHtml(emptyBoardCopy)}</span>
                  </div>
                `
            }
          </div>
          </div>
          <aside class="board-sidebar">
            <p class="kicker">Casework</p>
            <h2>Case file</h2>
            <p class="board-help">
              Pin clues from the tray. Drag a card by its Move handle—or use its arrow keys—to
              arrange the investigation. Focus the corkboard and use arrow keys to move across the canvas.
            </p>
            <section class="board-density-panel" aria-labelledby="board-density-title">
              <p class="kicker" id="board-density-title">Card size</p>
              <div class="board-density-list">
                ${Object.entries(boardDensityOptions)
                  .map(
                    ([id, option]) => `
                      <button
                        class="board-density-button ${this.boardDensity === id ? "is-active" : ""}"
                        data-board-density="${id}"
                        aria-pressed="${this.boardDensity === id}"
                      >
                        <strong>${escapeHtml(option.label)}</strong>
                        <span>${escapeHtml(option.description)}</span>
                      </button>
                    `,
                  )
                  .join("")}
              </div>
            </section>
            <section class="board-arrangement-panel" aria-labelledby="board-arrangement-title">
              <p class="kicker" id="board-arrangement-title">Arrange the wall</p>
              <div class="board-arrangement-list">
                ${[
                  ["chronology", "Chronology", "Discovery order"],
                  ["type", "Evidence type", "Documents, photos, audio"],
                  ["theory", "Theory first", "Current proof at the top"],
                ]
                  .map(
                    ([id, label, description]) => `
                      <button
                        class="board-arrangement-button ${boardView.arrangement === id ? "is-active" : ""}"
                        data-board-arrange="${id}"
                        aria-pressed="${boardView.arrangement === id}"
                      >
                        <strong>${escapeHtml(label)}</strong>
                        <span>${escapeHtml(description)}</span>
                      </button>
                    `,
                  )
                  .join("")}
              </div>
            </section>
            <section class="board-lens-panel" aria-labelledby="board-lens-title">
              <p class="kicker" id="board-lens-title">Focus the investigation</p>
              <div class="board-filter-list">
                ${boardLenses
                  .map(
                    (lens) => `
                      <button
                        class="board-filter-button ${this.boardLens === lens.id ? "is-active" : ""}"
                        data-board-lens="${lens.id}"
                        aria-pressed="${this.boardLens === lens.id}"
                      >
                        <span>${escapeHtml(lens.label)}</span>
                        <strong>${lens.count}</strong>
                      </button>
                    `,
                  )
                  .join("")}
              </div>
            </section>
            <section class="board-filter-panel" aria-labelledby="board-filter-title">
              <p class="kicker" id="board-filter-title">Highlight by type</p>
              <div class="board-filter-list">
                ${boardFilters
                  .map(
                    (filter) => `
                      <button
                        class="board-filter-button ${this.boardCategoryFilter === filter.id ? "is-active" : ""}"
                        data-board-filter="${filter.id}"
                        aria-pressed="${this.boardCategoryFilter === filter.id}"
                      >
                        <span>${escapeHtml(filter.label)}</span>
                        <strong>${filter.count}</strong>
                      </button>
                    `,
                  )
                  .join("")}
              </div>
            </section>
            <section class="theory-desk" aria-labelledby="theory-desk-title">
              <div class="theory-desk-heading">
                <div>
                  <p class="kicker">Active theory</p>
                  <h3 id="theory-desk-title">${escapeHtml(activeTheory?.title || "No testable theory")}</h3>
                </div>
                ${
                  activeTheory
                    ? `<strong>${completedTheoryLinks}/${activeTheoryConnections.length}</strong>`
                    : ""
                }
              </div>
              ${
                activeTheory
                  ? `
                    <p class="theory-desk-copy">
                      ${missingTheoryEvidence.length
                        ? `${missingTheoryEvidence.length} required clue${missingTheoryEvidence.length === 1 ? "" : "s"} still missing.`
                        : "All required clues collected. Complete these yarn links:"}
                    </p>
                    <div class="theory-checklist">
                      ${activeTheoryConnections
                        .map(
                          (required) => `
                            <div class="theory-link ${required.complete ? "is-complete" : required.connection ? "is-wrong" : ""}">
                              <span aria-hidden="true">${required.complete ? "OK" : required.connection ? "!" : "·"}</span>
                              <p>
                                <strong>${escapeHtml(required.relationship.label)}</strong>
                                <small>${escapeHtml(EVIDENCE[required.a]?.title || required.a)} / ${escapeHtml(EVIDENCE[required.b]?.title || required.b)}</small>
                                ${required.connection && !required.complete ? `<em>Retie this pair as ${escapeHtml(required.relationship.label)}.</em>` : ""}
                              </p>
                            </div>
                          `,
                        )
                        .join("")}
                    </div>
                    ${
                      missingTheoryEvidence.length
                        ? `<details class="theory-missing"><summary>Missing evidence</summary><ul>${missingTheoryEvidence.map((id) => `<li>${escapeHtml(EVIDENCE[id]?.title || id)}</li>`).join("")}</ul></details>`
                        : ""
                    }
                  `
                  : "<p class=\"theory-desk-copy\">Keep investigating. The next defensible theory will appear here when you collect a relevant clue.</p>"
              }
            </section>
            ${
              state.flags.prologueEndingReady && !state.progress.prologueComplete
                ? `
                  <section class="case-breakthrough" aria-labelledby="breakthrough-title">
                    <p class="kicker">Case breakthrough</p>
                    <h3 id="breakthrough-title">Three knocks at the door</h3>
                    <p>Vale made the invoice conspicuous on purpose. Someone knows you followed her trail.</p>
                    <button class="button button-primary" data-action="begin-prologue-ending">
                      Answer the knock
                    </button>
                  </section>
                `
                : ""
            }
            <section class="evidence-tray">
              <p class="kicker">Evidence tray · ${unpinned.length}</p>
              ${
                unpinned.length
                  ? unpinned
                      .map(
                        (item) => `
                          <button
                            class="tray-item"
                            data-pin-evidence="${item.id}"
                            aria-label="Pin ${escapeHtml(item.title)} to the evidence board"
                          >
                            <span>＋</span>
                            <span><small>Pin to board</small><strong>${escapeHtml(item.title)}</strong></span>
                          </button>
                        `,
                      )
                      .join("")
                  : "<p class=\"tray-empty\">No unpinned evidence.</p>"
              }
            </section>
            <section class="connection-list">
              <p class="kicker">Yarn · ${state.board.connections.length}</p>
              ${
                state.board.connections.length
                  ? state.board.connections
                      .map(
                        (connection, index) => `
                          <div class="connection-row connection-row-${connection.type}">
                            <span>
                              <strong>${escapeHtml(relationshipById.get(connection.type)?.label || connection.type)}</strong>
                              ${escapeHtml(EVIDENCE[connection.a]?.title || connection.a)} ↔ ${escapeHtml(EVIDENCE[connection.b]?.title || connection.b)}
                            </span>
                            <button
                              data-remove-connection="${index}"
                              aria-label="Remove ${escapeHtml(relationshipById.get(connection.type)?.label || connection.type)} between ${escapeHtml(EVIDENCE[connection.a]?.title || connection.a)} and ${escapeHtml(EVIDENCE[connection.b]?.title || connection.b)}"
                            >×</button>
                          </div>
                        `,
                      )
                      .join("")
                  : "<p class=\"tray-empty\">No yarn tied yet.</p>"
              }
            </section>
            <section class="deduction-list">
              <p class="kicker">Deductions · ${state.completedDeductions.length}</p>
              ${
                state.completedDeductions.length
                  ? state.completedDeductions
                      .map(
                        (id) => `
                          <button class="deduction-report-button" data-view-deduction="${id}">
                            <span>Verified conclusion</span>
                            <strong>${escapeHtml(DEDUCTIONS[id]?.title || id)}</strong>
                            <span class="deduction-report-summary">${escapeHtml(DEDUCTIONS[id]?.journalText || "")}</span>
                            <em>Open deduction report</em>
                          </button>
                        `,
                      )
                      .join("")
                  : "<p class=\"tray-empty\">No theory is proven yet.</p>"
              }
            </section>
          </aside>
        </section>
        <footer class="game-toolbar">
          <div><span class="toolbar-label">Home office</span><strong>Evidence board</strong></div>
          <div class="toolbar-actions">
            <button class="tool-button" data-action="home">Step back</button>
            <button class="tool-button" data-action="map">City map</button>
            <button class="tool-button" data-action="notebook">Notebook</button>
            <button class="tool-button" data-action="save">Case files</button>
          </div>
        </footer>
        ${this.renderBoardNoteEditor(state)}
        ${this.renderDeductionViewer(state, relationshipById)}
        ${this.renderToast()}
      </main>
    `;

    const boardCanvas = this.root.querySelector(".board-canvas-scroll");
    if (boardCanvas) {
      boardCanvas.scrollLeft = this.boardScroll.left;
      boardCanvas.scrollTop = this.boardScroll.top;
      boardCanvas.addEventListener(
        "scroll",
        () => {
          this.boardScroll = {
            left: boardCanvas.scrollLeft,
            top: boardCanvas.scrollTop,
          };
        },
        { passive: true },
      );
    }

    this.root.querySelectorAll("[data-pin-evidence]").forEach((button) => {
      button.addEventListener("click", () => {
        const next = pinEvidence(this.store.getState(), button.dataset.pinEvidence);
        this.store.replace(next, "pin-evidence");
        this.saves.save(this.store.getState(), "pin-evidence");
        this.renderBoard();
      });
    });

    this.root.querySelectorAll("[data-unpin-evidence]").forEach((button) => {
      button.addEventListener("click", () => {
        const id = button.dataset.unpinEvidence;
        const next = unpinEvidence(this.store.getState(), id);
        this.selectedBoardCards = this.selectedBoardCards.filter(
          (selectedId) => selectedId !== id,
        );
        this.store.replace(next, "unpin-evidence");
        this.saves.save(this.store.getState(), "unpin-evidence");
        this.notice.show(`${EVIDENCE[id]?.title || "Evidence"} moved to the tray.`);
        this.renderBoard();
      });
    });

    this.root.querySelectorAll("[data-board-filter]").forEach((button) => {
      button.addEventListener("click", () => {
        this.boardCategoryFilter = button.dataset.boardFilter;
        this.store.update((draft) => {
          draft.board.view.categoryFilter = this.boardCategoryFilter;
        }, "board-category-filter");
        this.saves.save(this.store.getState(), "board-category-filter");
        this.renderBoard();
        this.root
          .querySelector(`[data-board-filter="${this.boardCategoryFilter}"]`)
          ?.focus();
      });
    });

    this.root.querySelectorAll("[data-board-density]").forEach((button) => {
      button.addEventListener("click", () => {
        this.boardDensity = button.dataset.boardDensity;
        this.store.update((draft) => {
          draft.board.view.density = this.boardDensity;
        }, "board-density");
        this.saves.save(this.store.getState(), "board-density");
        this.renderBoard();
        this.root
          .querySelector(`[data-board-density="${this.boardDensity}"]`)
          ?.focus();
      });
    });

    this.root.querySelectorAll("[data-board-lens]").forEach((button) => {
      button.addEventListener("click", () => {
        this.boardLens = button.dataset.boardLens;
        this.store.update((draft) => {
          draft.board.view.lens = this.boardLens;
        }, "board-lens");
        this.saves.save(this.store.getState(), "board-lens");
        this.renderBoard();
        this.root.querySelector(`[data-board-lens="${this.boardLens}"]`)?.focus();
      });
    });

    this.root.querySelectorAll("[data-board-arrange]").forEach((button) => {
      button.addEventListener("click", () => {
        const mode = button.dataset.boardArrange;
        const next = arrangeEvidence(this.store.getState(), {
          mode,
          evidence: EVIDENCE,
          activeTheory,
        });
        this.store.replace(next, `arrange-board-${mode}`);
        this.saves.save(this.store.getState(), `arrange-board-${mode}`);
        this.selectedBoardCards = [];
        this.notice.show(
          mode === "theory"
            ? "Current theory evidence moved to the top of the wall."
            : mode === "type"
              ? "Evidence grouped by type."
              : "Evidence restored to discovery order.",
        );
        this.renderBoard();
        this.root.querySelector(`[data-board-arrange="${mode}"]`)?.focus();
      });
    });

    this.root.querySelectorAll("[data-edit-evidence-note]").forEach((button) => {
      button.addEventListener("click", () => {
        this.activeBoardNoteId = button.dataset.editEvidenceNote;
        this.renderBoard();
        this.root.querySelector("#evidence-note-text")?.focus();
      });
    });

    this.root.querySelectorAll("[data-view-deduction]").forEach((button) => {
      button.addEventListener("click", () => {
        this.activeDeductionId = button.dataset.viewDeduction;
        this.renderBoard();
        this.root.querySelector(".deduction-viewer h1")?.focus();
      });
    });

    this.root.querySelectorAll("[data-close-board-note]").forEach((button) => {
      button.addEventListener("click", () => {
        this.activeBoardNoteId = null;
        this.renderBoard();
      });
    });
    this.root.querySelector("#evidence-note-form")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const evidenceId = this.activeBoardNoteId;
      const next = saveEvidenceNote(
        this.store.getState(),
        evidenceId,
        form.get("note"),
      );
      this.store.replace(next, `evidence-note-${evidenceId}`);
      this.saves.save(this.store.getState(), `evidence-note-${evidenceId}`);
      this.activeBoardNoteId = null;
      this.notice.show("Evidence note saved to the case wall.");
      this.renderBoard();
      this.root.querySelector(`[data-edit-evidence-note="${evidenceId}"]`)?.focus();
    });
    this.root.querySelector("[data-remove-evidence-note]")?.addEventListener("click", () => {
      const evidenceId = this.activeBoardNoteId;
      const next = saveEvidenceNote(this.store.getState(), evidenceId, "");
      this.store.replace(next, `remove-evidence-note-${evidenceId}`);
      this.saves.save(this.store.getState(), `remove-evidence-note-${evidenceId}`);
      this.activeBoardNoteId = null;
      this.notice.show("Evidence note removed.");
      this.renderBoard();
      this.root.querySelector(`[data-edit-evidence-note="${evidenceId}"]`)?.focus();
    });

    this.root.querySelectorAll("[data-close-deduction]").forEach((button) => {
      button.addEventListener("click", () => {
        const deductionId = this.activeDeductionId;
        this.activeDeductionId = null;
        this.renderBoard();
        this.root.querySelector(`[data-view-deduction="${deductionId}"]`)?.focus();
      });
    });

    boardCanvas?.addEventListener("keydown", (event) => {
      if (event.target !== boardCanvas) return;
      const horizontalStep = Math.max(180, boardCanvas.clientWidth * 0.55);
      const verticalStep = Math.max(180, boardCanvas.clientHeight * 0.7);
      const movement = {
        ArrowLeft: [-120, 0],
        ArrowRight: [120, 0],
        ArrowUp: [0, -120],
        ArrowDown: [0, 120],
        PageUp: [0, -verticalStep],
        PageDown: [0, verticalStep],
      }[event.key];
      if (movement) {
        event.preventDefault();
        boardCanvas.scrollBy({
          left: movement[0],
          top: movement[1],
          behavior: this.store.getState().settings.reducedMotion
            ? "auto"
            : "smooth",
        });
        return;
      }
      if (event.key === "Home" || event.key === "End") {
        event.preventDefault();
        boardCanvas.scrollTo({
          left: event.key === "Home" ? 0 : boardCanvas.scrollWidth,
          top: event.key === "Home" ? 0 : boardCanvas.scrollHeight,
          behavior: this.store.getState().settings.reducedMotion
            ? "auto"
            : "smooth",
        });
      } else if (event.key === "," || event.key === ".") {
        event.preventDefault();
        boardCanvas.scrollBy({
          left: event.key === "," ? -horizontalStep : horizontalStep,
          behavior: this.store.getState().settings.reducedMotion
            ? "auto"
            : "smooth",
        });
      }
    });

    this.root.querySelectorAll("input[name='board-relationship']").forEach((input) => {
      input.addEventListener("change", () => {
        this.boardConnectionType = input.value;
        this.renderBoard();
        this.root
          .querySelector(`input[name="board-relationship"][value="${input.value}"]`)
          ?.focus();
      });
    });

    this.root.querySelectorAll("[data-board-card]").forEach((card) => {
      card.addEventListener("click", () => {
        const id = card.dataset.boardCard;
        const selectedIndex = this.selectedBoardCards.indexOf(id);
        if (selectedIndex >= 0) {
          this.selectedBoardCards.splice(selectedIndex, 1);
        } else if (this.selectedBoardCards.length < 2) {
          this.selectedBoardCards.push(id);
        } else {
          this.notice.show("Two clues are already selected. Connect or clear them first.");
        }
        this.renderBoard();
        this.root.querySelector(`[data-board-card="${id}"]`)?.focus();
      });

      card.addEventListener("keydown", (event) => {
        const direction = {
          ArrowLeft: [-2, 0],
          ArrowRight: [2, 0],
          ArrowUp: [0, -2],
          ArrowDown: [0, 2],
        }[event.key];
        if (!direction) return;
        event.preventDefault();
        const current = this.store.getState().board.cards[card.dataset.boardCard];
        const next = moveEvidence(this.store.getState(), card.dataset.boardCard, {
          x: current.x + direction[0],
          y: current.y + direction[1],
        });
        this.store.replace(next, "move-evidence");
        this.saves.save(this.store.getState(), "move-evidence");
        this.renderBoard();
        this.root.querySelector(`[data-board-card="${card.dataset.boardCard}"]`)?.focus();
      });
    });

    this.bindBoardDrag();

    this.bindActions({
      "toggle-connection-panel": () => {
        this.boardConnectionPanelOpen = !this.boardConnectionPanelOpen;
        this.renderBoard();
        this.root.querySelector("[data-action='toggle-connection-panel']")?.focus();
      },
      "tidy-board": () => {
        const next = arrangeEvidence(this.store.getState());
        this.store.replace(next, "tidy-board");
        this.saves.save(this.store.getState(), "tidy-board");
        this.selectedBoardCards = [];
        this.notice.show("Evidence cards arranged.");
        this.renderBoard();
      },
      "begin-prologue-ending": () => {
        this.store.update((draft) => {
          draft.progress.currentLocation = "home_office";
          draft.progress.previousScreen = "board";
          draft.progress.currentScreen = "prologue-ending";
        }, "begin-prologue-ending");
        this.saves.save(this.store.getState(), "begin-prologue-ending");
        this.router.navigate("prologue-ending");
      },
      "connect-selected": () => {
        if (this.selectedBoardCards.length !== 2) return;
        const [a, b] = this.selectedBoardCards;
        const wasExisting = this.store
          .getState()
          .board.connections.some(
            (connection) =>
              (connection.a === a && connection.b === b) ||
              (connection.a === b && connection.b === a),
          );
        let next = connectEvidence(
          this.store.getState(),
          a,
          b,
          this.boardConnectionType,
        );
        const feedback = evaluateConnectionFeedback(
          next,
          a,
          b,
          this.boardConnectionType,
          DEDUCTIONS,
        );
        const result = evaluateBoardDeductions(next, DEDUCTIONS);
        next = result.state;
        next.board.lastFeedback = {
          ...feedback,
          a,
          b,
          type: this.boardConnectionType,
        };
        this.store.replace(next, "connect-evidence");
        this.saves.save(this.store.getState(), "connect-evidence");
        const relationship =
          relationshipById.get(this.boardConnectionType) || activeRelationship;
        const connectionNotice = `${relationship.label} ${wasExisting ? "updated" : "connected"}: ${EVIDENCE[a]?.title || a} and ${EVIDENCE[b]?.title || b}.`;
        if (result.newlyCompleted.length) {
          this.activeDeductionId = result.newlyCompleted[0].id;
        }
        this.selectedBoardCards = [];
        this.notice.show(
          result.newlyCompleted.length
            ? result.newlyCompleted[0].notification ||
                `Deduction: ${result.newlyCompleted[0].title}`
            : feedback.kind === "exploratory"
              ? connectionNotice
              : feedback.text,
        );
        this.renderBoard();
      },
      "clear-board-selection": () => {
        this.selectedBoardCards = [];
        this.renderBoard();
        this.root.querySelector("[data-board-card]")?.focus();
      },
    });

    this.root.querySelectorAll("[data-remove-connection]").forEach((button) => {
      button.addEventListener("click", () => {
        const connection =
          this.store.getState().board.connections[Number(button.dataset.removeConnection)];
        const next = removeConnection(
          this.store.getState(),
          connection.a,
          connection.b,
        );
        this.store.replace(next, "remove-connection");
        this.saves.save(this.store.getState(), "remove-connection");
        this.renderBoard();
      });
    });

    this.bindActions({
      home: () => {
        this.activeOfficeNote = null;
        this.router.navigate("home");
      },
      map: () => this.router.navigate("map"),
      notebook: () => this.openNotebook("board"),
      save: () => this.openCaseFiles("board"),
    });
  }

  renderBoardNoteEditor(state) {
    if (!this.activeBoardNoteId) return "";
    const evidence = EVIDENCE[this.activeBoardNoteId];
    if (!evidence || !state.evidence.collected.includes(evidence.id)) return "";
    const note = state.board.notes?.[evidence.id] || "";
    return `
      <div class="board-modal-scrim">
        <section class="board-note-editor" role="dialog" aria-modal="true" aria-labelledby="board-note-title" tabindex="-1">
          <button class="dialogue-close" data-close-board-note aria-label="Close evidence note">×</button>
          <p class="kicker">Reporter’s annotation</p>
          <h1 id="board-note-title">${escapeHtml(evidence.title)}</h1>
          <p>${escapeHtml(evidence.summary)}</p>
          <form id="evidence-note-form">
            <label for="evidence-note-text">What does this clue mean to you?</label>
            <textarea id="evidence-note-text" name="note" maxlength="500" rows="7" placeholder="Record a suspicion, question, name, or connection to revisit…">${escapeHtml(note)}</textarea>
            <div class="board-note-actions">
              <button class="button button-primary" type="submit">Save note</button>
              ${note ? '<button class="button button-ghost" type="button" data-remove-evidence-note>Remove note</button>' : ""}
              <button class="button button-ghost" type="button" data-close-board-note>Cancel</button>
            </div>
          </form>
        </section>
      </div>
    `;
  }

  renderDeductionViewer(state, relationshipById) {
    if (!this.activeDeductionId) return "";
    const deduction = DEDUCTIONS[this.activeDeductionId];
    if (!deduction || !state.completedDeductions.includes(deduction.id)) return "";
    const reportNumber = state.completedDeductions.indexOf(deduction.id) + 1;
    const unlockedLocations = (deduction.effects || [])
      .filter((effect) => effect.type === "unlockLocation")
      .map((effect) => GAME_CONTENT.locations[effect.id]?.name || effect.id);
    const rewardEvidence = (deduction.effects || [])
      .filter((effect) => effect.type === "collectEvidence")
      .map((effect) => EVIDENCE[effect.id]?.title || effect.id);
    const annotatedCount = deduction.requiredEvidence.filter(
      (id) => state.board.notes?.[id],
    ).length;
    return `
      <div class="board-modal-scrim deduction-viewer-scrim">
        <section class="deduction-viewer" role="dialog" aria-modal="true" aria-labelledby="deduction-viewer-title" tabindex="-1">
          <button class="dialogue-close" data-close-deduction aria-label="Close deduction report">×</button>
          <header>
            <p class="kicker">Verified deduction report · ${String(reportNumber).padStart(2, "0")}</p>
            <h1 id="deduction-viewer-title" tabindex="-1">${escapeHtml(deduction.title)}</h1>
            <p>${escapeHtml(deduction.journalText)}</p>
          </header>
          <div class="deduction-report-grid">
            <section>
              <p class="kicker">Corroborating file · ${deduction.requiredEvidence.length}</p>
              <ol class="deduction-evidence-list">
                ${deduction.requiredEvidence
                  .map(
                    (id) => `<li><span>Verified</span><strong>${escapeHtml(EVIDENCE[id]?.title || id)}</strong>${state.board.notes?.[id] ? `<small>My note: ${escapeHtml(state.board.notes[id])}</small>` : ""}</li>`,
                  )
                  .join("")}
              </ol>
            </section>
            <section>
              <p class="kicker">Reasoning chain · ${deduction.requiredConnections.length}</p>
              <ol class="deduction-link-list">
                ${deduction.requiredConnections
                  .map(
                    (connection) => `
                      <li>
                        <span>${escapeHtml(relationshipById.get(connection.type)?.label || connection.type)}</span>
                        <strong>${escapeHtml(EVIDENCE[connection.a]?.title || connection.a)}</strong>
                        <i aria-hidden="true">↔</i>
                        <strong>${escapeHtml(EVIDENCE[connection.b]?.title || connection.b)}</strong>
                      </li>
                    `,
                  )
                  .join("")}
              </ol>
              <aside class="deduction-impact">
                <p class="kicker">Case impact</p>
                <strong>${escapeHtml(
                  deduction.notification ||
                    "This conclusion is now part of the verified case chronology.",
                )}</strong>
                ${unlockedLocations.length ? `<p>Location opened: ${escapeHtml(unlockedLocations.join(", "))}</p>` : ""}
                ${rewardEvidence.length ? `<p>New lead: ${escapeHtml(rewardEvidence.join(", "))}</p>` : ""}
                ${annotatedCount ? `<p>${annotatedCount} personal evidence note${annotatedCount === 1 ? "" : "s"} preserved with this report.</p>` : ""}
              </aside>
            </section>
          </div>
          <footer>
            <button class="button button-primary" data-close-deduction>Return to the case wall</button>
          </footer>
        </section>
      </div>
    `;
  }

  renderNotebook() {
    const state = this.store.getState();
    const interactiveLocations = Object.fromEntries(
      Object.entries(GAME_CONTENT.locations).map(([id, location]) => [
        id,
        getInteractiveLocation(location),
      ]),
    );
    const fieldNotes = getFieldNoteEntries(state, interactiveLocations);
    const stage =
      CASEBOOK_STAGES.find((entry) => evaluateCondition(entry.activeWhen, state)) ||
      CASEBOOK_STAGES.at(-1);
    const revealed = Math.min(
      3,
      Number(state.journal.revealedHints[stage.id]) || 0,
    );
    const completedCount = CASEBOOK_PROGRESS.filter((entry) =>
      evaluateCondition(entry.when, state),
    ).length;
    const knownContacts = Object.values(CHARACTER_PROFILES)
      .filter((profile) => Object.hasOwn(state.characters, profile.id))
      .map((profile) => ({
        profile,
        record: getRelationshipRecord(state, profile),
      }));

    this.root.innerHTML = `
      <main id="game-main" class="screen notebook-screen">
        <section class="notebook-shell">
          <header class="notebook-heading">
            <button class="back-button" data-action="back" aria-label="Close notebook">← Back</button>
            <div>
              <p class="kicker">Reporter’s notebook</p>
              <h1 tabindex="-1">Current lead</h1>
            </div>
            <div class="notebook-progress-number">
              <strong>${completedCount}</strong>
              <span>of ${CASEBOOK_PROGRESS.length} case beats</span>
            </div>
          </header>
          <div class="notebook-spread">
            <article class="notebook-page objective-page">
              <p class="notebook-date">Greyhaven · Case 01</p>
              <span class="notebook-rule" aria-hidden="true"></span>
              <p class="kicker">Immediate objective</p>
              <h2>${escapeHtml(stage.title)}</h2>
              <p class="notebook-objective">${escapeHtml(stage.objective)}</p>
              <ol class="case-progress-list" aria-label="Case progress">
                ${CASEBOOK_PROGRESS.map((entry) => {
                  const complete = evaluateCondition(entry.when, state);
                  return `
                    <li class="${complete ? "is-complete" : ""}">
                      <span aria-hidden="true">${complete ? "✓" : "○"}</span>
                      <span>${escapeHtml(entry.label)}</span>
                    </li>
                  `;
                }).join("")}
              </ol>
            </article>
            <article class="notebook-page hints-page">
              <p class="notebook-date">If the trail goes cold</p>
              <span class="notebook-rule" aria-hidden="true"></span>
              <p class="kicker">Optional hints</p>
              <div class="case-hints" aria-live="polite">
                ${
                  revealed
                    ? stage.hints
                        .slice(0, revealed)
                        .map(
                          (hint, index) => `
                            <section>
                              <span>Hint ${index + 1}</span>
                              <p>${escapeHtml(hint)}</p>
                            </section>
                          `,
                        )
                        .join("")
                    : `
                      <div class="hints-sealed">
                        <strong>No hints opened</strong>
                        <p>The notebook never judges. Reveal only what you need.</p>
                      </div>
                    `
                }
              </div>
              <footer>
                <button class="button button-secondary" data-action="reveal-case-hint" ${revealed >= 3 ? "disabled" : ""}>
                  ${revealed ? "Reveal next hint" : "Open a hint"}
                </button>
                <span>${revealed} / 3 revealed</span>
              </footer>
            </article>
          </div>
          <section class="field-notes-page" aria-labelledby="field-notes-title">
            <header>
              <div>
                <p class="notebook-date">Optional observations</p>
                <h2 id="field-notes-title">Field notes</h2>
              </div>
              <strong>${fieldNotes.length}</strong>
            </header>
            <div class="field-note-list">
              ${
                fieldNotes.length
                  ? fieldNotes
                      .slice()
                      .reverse()
                      .map(
                        (entry) => `
                          <article>
                            <span>${escapeHtml(entry.locationName)}</span>
                            <h3>${escapeHtml(entry.title)}</h3>
                            <p>${escapeHtml(entry.text)}</p>
                          </article>
                        `,
                      )
                      .join("")
                  : `<p class="field-notes-empty">Examine incidental details in locations to preserve observations here. Field notes add context without crowding the evidence board.</p>`
              }
            </div>
          </section>
          <section class="source-network" aria-labelledby="source-network-title">
            <header>
              <div><p class="notebook-date">People remember</p><h2 id="source-network-title">Source network</h2></div>
              <strong>${knownContacts.length}</strong>
            </header>
            <p class="source-network-intro">Evidence earns credibility. Protection earns trust. Asking a source to help may expose them further.</p>
            <div class="source-network-grid">
              ${knownContacts.length ? knownContacts.map(({ profile, record }) => {
                const status = relationshipStatus(record);
                const canHelp = record.trust >= 3 && !record.assistance.includes(stage.id) && revealed < 3;
                return `
                  <article class="source-card is-${status.className}">
                    <div class="source-card-heading"><span>${escapeHtml(profile.name.split(" ").map((part) => part[0]).join(""))}</span><div><p>${escapeHtml(profile.role)}</p><h3>${escapeHtml(profile.name)}</h3></div></div>
                    <div class="source-meters">
                      <p><span>Relationship</span><strong>${escapeHtml(status.label)}</strong></p>
                      <div class="trust-track" aria-label="Trust ${record.trust} out of 5"><i style="width:${Math.max(0, record.trust) * 20}%"></i></div>
                      <p><span>Source safety</span><strong>${escapeHtml(exposureStatus(record))}</strong></p>
                    </div>
                    <p>${escapeHtml(profile.help)}</p>
                    ${record.promises.length ? `<small>Promise: ${escapeHtml(record.promises.at(-1))}</small>` : ""}
                    ${canHelp ? `<button class="button button-secondary" data-source-assist="${profile.id}">Ask for help <span>+ insight · + exposure</span></button>` : record.assistance.includes(stage.id) ? '<em>Already helped with this lead</em>' : ""}
                  </article>
                `;
              }).join("") : '<p class="field-notes-empty">Sources and allies will appear here after you speak with them.</p>'}
            </div>
          </section>
        </section>
        ${this.renderToast()}
      </main>
    `;

    this.bindActions({
      back: () => this.router.navigate(this.returnRoute),
      "reveal-case-hint": () => {
        this.store.update((draft) => {
          const current = Number(draft.journal.revealedHints[stage.id]) || 0;
          draft.journal.revealedHints[stage.id] = Math.min(3, current + 1);
        }, `reveal-hint-${stage.id}`);
        this.saves.save(this.store.getState(), `reveal-hint-${stage.id}`);
        this.audio?.playEffect("pin");
        this.renderNotebook();
        this.root.querySelector("[data-action='reveal-case-hint']")?.focus();
      },
    });
    this.root.querySelectorAll("[data-source-assist]").forEach((button) => {
      button.addEventListener("click", () => {
        const profile = Object.values(CHARACTER_PROFILES).find(
          (entry) => entry.id === button.dataset.sourceAssist,
        );
        const next = requestSourceHelp(this.store.getState(), profile, stage.id);
        this.store.replace(next, `source-help-${profile?.id || "unknown"}`);
        this.saves.save(this.store.getState(), `source-help-${profile?.id || "unknown"}`);
        this.notice.show(`${profile?.name || "A source"} offered a lead. Their exposure increased.`);
        this.renderNotebook();
      });
    });
  }

  renderCaseFiles() {
    const slots = this.saves.listSlots();
    const canSave = this.returnRoute !== "title";

    this.root.innerHTML = `
      <main id="game-main" class="screen case-files-screen">
        <section class="panel case-files-panel">
          <button class="back-button" data-action="back" aria-label="Close case files">← Back</button>
          <p class="kicker">Local case archive</p>
          <h1 tabindex="-1">Case files</h1>
          <p class="lede">
            Autosave protects the latest action. These three files let you preserve
            important moments on this device.
          </p>
          <div class="save-slot-grid">
            ${slots
              .map(({ slot, state, empty }) => {
                if (empty) {
                  return `
                    <article class="save-slot is-empty">
                      <div class="save-slot-number">0${slot}</div>
                      <div>
                        <p class="kicker">Manual file ${slot}</p>
                        <h2>Empty file</h2>
                        <p>No investigation has been stored here.</p>
                      </div>
                      <div class="save-slot-actions">
                        ${
                          canSave
                            ? `<button class="button button-primary" data-save-slot="${slot}">Save here</button>`
                            : `<span class="save-slot-empty-label">Available</span>`
                        }
                      </div>
                    </article>
                  `;
                }

                const playerName = `${state.player.firstName} ${state.player.lastName}`;
                return `
                  <article class="save-slot">
                    <div class="save-slot-number">0${slot}</div>
                    <div>
                      <p class="kicker">${escapeHtml(this.describeProgress(state))}</p>
                      <h2>${escapeHtml(playerName)}</h2>
                      <p>
                        ${state.evidence.collected.length} clues ·
                        ${state.completedDeductions.length} deductions ·
                        ${escapeHtml(formatSaveTimestamp(state.meta.updatedAt))}
                      </p>
                    </div>
                    <div class="save-slot-actions">
                      <button class="button button-secondary" data-load-slot="${slot}">Load</button>
                      ${
                        canSave
                          ? `<button class="button button-ghost" data-save-slot="${slot}">Overwrite</button>`
                          : ""
                      }
                      ${
                        this.pendingDeleteSlot === slot
                          ? `
                            <button class="save-delete is-confirming" data-delete-slot="${slot}" aria-label="Confirm deleting manual file ${slot}">Confirm delete</button>
                            <button class="button button-ghost" data-cancel-delete>Cancel</button>
                          `
                          : `<button class="save-delete" data-delete-slot="${slot}" aria-label="Delete manual file ${slot}">Delete</button>`
                      }
                    </div>
                  </article>
                `;
              })
              .join("")}
          </div>
          <p class="case-files-note">
            Saves remain in this browser. Clearing site data removes them.
          </p>
          <section class="cinematic-archive" aria-labelledby="cinematic-archive-title">
            <div>
              <p class="kicker">Story reel</p>
              <h2 id="cinematic-archive-title">Chapter interludes</h2>
              <p>Replay any chapter transition you have already reached.</p>
            </div>
            <div class="cinematic-archive-grid">
              ${CHAPTER_INTERLUDES.map((entry) => {
                const unlocked = this.store.getState().cinematics.seen.includes(entry.id);
                return `<button class="cinematic-reel ${unlocked ? "is-unlocked" : ""}" data-replay-interlude="${entry.id}" ${unlocked ? "" : "disabled"}><span>${escapeHtml(entry.chapter)}</span><strong>${unlocked ? escapeHtml(entry.title) : "Classified"}</strong></button>`;
              }).join("")}
            </div>
          </section>
        </section>
        ${this.renderToast()}
      </main>
    `;

    this.bindActions({
      back: () => this.router.navigate(this.returnRoute),
    });
    this.root.querySelectorAll("[data-save-slot]").forEach((button) => {
      button.addEventListener("click", () => {
        const slot = Number(button.dataset.saveSlot);
        this.saves.saveToSlot(slot, this.store.getState());
        this.notice.show(`Manual case file ${slot} saved.`);
        this.renderCaseFiles();
        this.root.querySelector(`[data-load-slot="${slot}"]`)?.focus();
      });
    });
    this.root.querySelectorAll("[data-load-slot]").forEach((button) => {
      button.addEventListener("click", () => {
        const slot = Number(button.dataset.loadSlot);
        const loaded = this.saves.loadSlot(slot);
        if (!loaded) {
          this.notice.show(`Manual case file ${slot} could not be read.`);
          this.renderCaseFiles();
          return;
        }
        this.resetEphemeralUi();
        this.store.replace(loaded, `load-manual-slot-${slot}`);
        this.saves.save(this.store.getState(), `load-manual-slot-${slot}`);
        this.router.navigate(loaded.progress.currentScreen || "home");
      });
    });
    this.root.querySelectorAll("[data-delete-slot]").forEach((button) => {
      button.addEventListener("click", () => {
        const slot = Number(button.dataset.deleteSlot);
        if (this.pendingDeleteSlot !== slot) {
          this.pendingDeleteSlot = slot;
          this.renderCaseFiles();
          this.root.querySelector(`[data-delete-slot="${slot}"]`)?.focus();
          return;
        }
        this.saves.deleteSlot(slot);
        this.pendingDeleteSlot = null;
        this.notice.show(`Manual case file ${slot} deleted.`);
        this.renderCaseFiles();
        this.root.querySelector(`[data-save-slot="${slot}"]`)?.focus();
      });
    });
    this.root.querySelector("[data-cancel-delete]")?.addEventListener("click", () => {
      const slot = this.pendingDeleteSlot;
      this.pendingDeleteSlot = null;
      this.renderCaseFiles();
      this.root.querySelector(`[data-delete-slot="${slot}"]`)?.focus();
    });
    this.root.querySelectorAll("[data-replay-interlude]").forEach((button) => {
      button.addEventListener("click", () => {
        const next = beginInterlude(this.store.getState(), button.dataset.replayInterlude);
        this.store.replace(next, `replay-interlude-${button.dataset.replayInterlude}`);
        this.saves.save(this.store.getState(), `replay-interlude-${button.dataset.replayInterlude}`);
        this.renderCaseFiles();
        this.renderChapterInterlude("case-files");
      });
    });
  }

  renderContentNotice() {
    this.root.innerHTML = `
      <main id="game-main" class="screen reading-screen">
        <article class="panel reading-panel">
          <button class="back-button" data-action="back" aria-label="Close content notice">← Back</button>
          <p class="kicker">Before opening the file</p>
          <h1 tabindex="-1">Content & fiction notice</h1>
          <p class="notice-lede">
            <em>The Benefactors</em> is a work of fiction. Its people, charities,
            companies, governments, scandals, and secret organizations are invented.
          </p>
          <section>
            <h2>Story content</h2>
            <p>
              The story contains corruption, intimidation, disappearance,
              manufactured disasters, abuse of public funds, and implied danger.
              It avoids graphic violence.
            </p>
          </section>
          <section>
            <h2>Player privacy</h2>
            <p>
              Your chosen character name and save files stay in this browser.
              The game has no accounts, analytics, advertising, or real-world news feed.
            </p>
          </section>
          <section>
            <h2>Accessibility</h2>
            <p>
              Subtitles, text scaling, high contrast, reduced motion, hotspot
              assistance, and separate audio levels are available in Settings.
              Press M to mute, H to toggle hotspot assistance, and Escape to close
              conversations or evidence viewers.
            </p>
          </section>
          <button class="button button-primary" data-action="back">Return to title</button>
        </article>
      </main>
    `;
    this.bindActions({ back: () => this.router.navigate(this.returnRoute) });
  }

  renderCredits() {
    this.root.innerHTML = `
      <main id="game-main" class="screen reading-screen credits-screen">
        <article class="panel reading-panel">
          <button class="back-button" data-action="back" aria-label="Close credits">← Back</button>
          <p class="kicker">The Greyhaven Ledger presents</p>
          <h1 tabindex="-1">The Benefactors</h1>
          <p class="credits-tagline">Every good lie leaves paperwork.</p>
          <div class="credits-list">
            <section>
              <span>Original concept & creative direction</span>
              <strong>The game’s creator</strong>
            </section>
            <section>
              <span>Design, writing & development collaboration</span>
              <strong>Created with OpenAI Codex</strong>
            </section>
            <section>
              <span>Technology</span>
              <strong>HTML · CSS · JavaScript · Web Audio</strong>
            </section>
            <section>
              <span>Release</span>
              <strong>Complete Investigation · August 2026</strong>
            </section>
          </div>
          <p class="credits-fiction">
            All characters and organizations are fictional. No real person or
            institution is portrayed or accused.
          </p>
          <button class="button button-primary" data-action="back">Return to title</button>
        </article>
      </main>
    `;
    this.bindActions({ back: () => this.router.navigate(this.returnRoute) });
  }

  renderSettings() {
    const state = this.store.getState();
    const settings = state.settings;

    this.root.innerHTML = `
      <main id="game-main" class="screen settings-screen">
        <section class="panel settings-panel">
          <button class="back-button" data-action="back" aria-label="Close settings">← Back</button>
          <p class="kicker">Preferences</p>
          <h1 tabindex="-1">Settings</h1>
          <p class="settings-help">
            Audio begins after your first click or key press. Press M to mute and
            H to toggle hotspot assistance anywhere in the game.
          </p>
          <form id="settings-form" class="settings-form">
            <label class="range-field">
              <span>Text size <output id="text-scale-value">${Math.round(settings.textScale * 100)}%</output></span>
              <input type="range" name="textScale" min="0.9" max="1.35" step="0.05" value="${settings.textScale}" />
            </label>
            <div class="settings-grid">
              ${this.renderToggle("subtitles", "Subtitles", settings.subtitles)}
              ${this.renderToggle("hotspotAssist", "Hotspot assistance", settings.hotspotAssist)}
              ${this.renderToggle("reducedMotion", "Reduced motion", settings.reducedMotion)}
              ${this.renderToggle("highContrast", "High contrast", settings.highContrast)}
              ${this.renderToggle("muted", "Mute all audio", settings.muted)}
            </div>
            <label class="range-field">
              <span>Music volume</span>
              <input type="range" name="musicVolume" min="0" max="1" step="0.05" value="${settings.musicVolume}" />
            </label>
            <label class="range-field">
              <span>Effects volume</span>
              <input type="range" name="effectsVolume" min="0" max="1" step="0.05" value="${settings.effectsVolume}" />
            </label>
            <label class="range-field">
              <span>Ambience volume</span>
              <input type="range" name="ambienceVolume" min="0" max="1" step="0.05" value="${settings.ambienceVolume}" />
            </label>
            <button class="button button-primary button-wide" type="submit">Save settings</button>
          </form>
        </section>
      </main>
    `;

    const form = this.root.querySelector("#settings-form");
    const scale = form.elements.textScale;
    scale.addEventListener("input", () => {
      this.root.querySelector("#text-scale-value").textContent =
        `${Math.round(Number(scale.value) * 100)}%`;
    });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      this.store.update((draft) => {
        draft.settings = {
          ...draft.settings,
          textScale: Number(data.get("textScale")),
          subtitles: data.has("subtitles"),
          hotspotAssist: data.has("hotspotAssist"),
          reducedMotion: data.has("reducedMotion"),
          highContrast: data.has("highContrast"),
          muted: data.has("muted"),
          musicVolume: Number(data.get("musicVolume")),
          effectsVolume: Number(data.get("effectsVolume")),
          ambienceVolume: Number(data.get("ambienceVolume")),
        };
      }, "settings");
      this.saves.saveSettings(this.store.getState().settings);
      if (this.saves.hasSave()) this.saves.save(this.store.getState(), "settings");
      this.router.navigate(this.returnRoute);
    });
    this.root.querySelector("[data-action='back']").addEventListener("click", () => {
      this.router.navigate(this.returnRoute);
    });
  }

  chapterLabel(state = this.store.getState()) {
    if (state.flags.provedVesperWithholdsWarnings) {
      return "Chapter 14 · Eleven Days of Silence";
    }
    if (
      state.progress.unlockedLocations.includes("vesper_western_cistern") ||
      (state.locationVisits.vesper_western_cistern || 0) > 0
    ) {
      return "Chapter 13 · The Western Cistern";
    }
    if (state.flags.provedVesperTransferRoute) {
      return "Chapter 12 · Forecast Island";
    }
    if (
      state.progress.unlockedLocations.includes("port_prosper_eastern_terminal") ||
      (state.locationVisits.port_prosper_eastern_terminal || 0) > 0
    ) {
      return "Chapter 11 · Locker 44";
    }
    if (
      state.flags.provedAsterHouseTriggerCell ||
      state.progress.unlockedLocations.includes("port_prosper_signal_exchange") ||
      (state.locationVisits.port_prosper_signal_exchange || 0) > 0
    ) {
      return "Chapter 10 · The Archipelago Protocol";
    }
    if (
      state.flags.identifiedAsterHouse ||
      state.progress.unlockedLocations.includes("aster_house") ||
      (state.locationVisits.aster_house || 0) > 0
    ) {
      return "Chapter 9 · The Trigger Cell";
    }
    if (state.flags.portProsperDecisionMade) {
      return "Chapter 8 · Consequences";
    }
    if (
      state.progress.unlockedLocations.includes("orpheus_first_circle") ||
      (state.locationVisits.orpheus_first_circle || 0) > 0
    ) {
      return "Chapter 7 · The First Circle";
    }
    if (
      state.progress.unlockedLocations.includes("orpheus_sublevel_harbor") ||
      (state.locationVisits.orpheus_sublevel_harbor || 0) > 0
    ) {
      return "Chapter 6 · The Island";
    }
    if (
      state.progress.unlockedLocations.includes("blackwater_point") ||
      (state.locationVisits.blackwater_point || 0) > 0
    ) {
      return "Chapter 5 · Orpheus";
    }
    if (
      state.progress.unlockedLocations.includes("greyhaven_executive_airfield") ||
      (state.locationVisits.greyhaven_executive_airfield || 0) > 0
    ) {
      return "Chapter 4 · Redoubt";
    }
    if (state.flags.mappedContinuitySiteNetwork) {
      return "Chapter 3 · The Pattern";
    }
    if (
      state.progress.unlockedLocations.includes("brighter_horizon_office") ||
      (state.locationVisits.brighter_horizon_office || 0) > 0
    ) {
      return "Chapter 2 · The Foundation";
    }
    return state.progress.prologueComplete
      ? "Chapter 1 · Follow Northstar"
      : GAME_CONTENT.chapter;
  }

  renderGameHeader(chapter, place) {
    const pressure = this.store.getState().pressure;
    const status = pressureStatus(pressure.heat);
    return `
      <header class="game-header">
        <div class="wordmark"><span>The</span> Benefactors</div>
        <div class="case-line"><span>${escapeHtml(chapter)}</span><strong>${escapeHtml(place)}</strong></div>
        ${pressure.events.length ? `<div class="header-pressure is-${status.className}" title="Investigative exposure: ${pressure.heat} out of 100"><span>${escapeHtml(status.label)}</span><i><b style="width:${pressure.heat}%"></b></i></div>` : ""}
      </header>
    `;
  }

  renderToggle(name, label, checked) {
    return `
      <label class="toggle">
        <input type="checkbox" name="${name}" ${checked ? "checked" : ""} />
        <span class="toggle-track" aria-hidden="true"><i></i></span>
        <span>${label}</span>
      </label>
    `;
  }

  renderInventory(state) {
    if (!this.inventoryOpen) return "";
    const collectedEvidence = state.evidence.collected
      .map((id) => EVIDENCE[id])
      .filter(Boolean);

    return `
      <aside class="inventory-drawer" aria-label="Inventory">
        <div class="drawer-heading">
          <div><p class="kicker">Carried items</p><h2>Inventory</h2></div>
          <button class="drawer-close" data-action="inventory" aria-label="Close inventory">×</button>
        </div>
        <div class="inventory-grid">
          ${state.inventory
            .map((id) => INVENTORY_ITEMS[id])
            .filter(Boolean)
            .map((item) => {
              const context = getInventoryToolContext(
                state,
                item.id,
                GAME_CONTENT.locations,
              );
              return `
                <button
                  class="inventory-item ${context.available ? "is-useful" : ""}"
                  data-use-inventory="${item.id}"
                  aria-label="${escapeHtml(context.actionLabel)} with ${escapeHtml(item.name)}"
                >
                  <span>${escapeHtml(item.icon)}</span>
                  <strong>${escapeHtml(item.name)}</strong>
                  <small>${escapeHtml(item.description || context.hint)}</small>
                  <em>${escapeHtml(context.actionLabel)}</em>
                </button>
              `;
            })
            .join("")}
        </div>
        ${
          this.inventoryMessage
            ? `<p class="inventory-message" role="status">${escapeHtml(this.inventoryMessage)}</p>`
            : ""
        }
        <div class="evidence-pocket">
          <p class="kicker">Case file · ${collectedEvidence.length}</p>
          ${
            collectedEvidence.length
              ? collectedEvidence
                  .map(
                    (item) => `
                      <button class="evidence-pocket-item" data-view-evidence="${item.id}">
                        <strong>${escapeHtml(item.title)}</strong>
                        <p>${escapeHtml(item.summary)}</p>
                        <span>View →</span>
                      </button>
                    `,
                  )
                  .join("")
              : "<p>No evidence collected yet.</p>"
          }
        </div>
      </aside>
      <div class="drawer-scrim" aria-hidden="true"></div>
    `;
  }

  renderDialogue(state) {
    const dialogueId = state.dialogue.activeDialogueId;
    if (!dialogueId) return "";

    const dialogue = DIALOGUES[dialogueId];
    const node = getDialogueNode(DIALOGUES, dialogueId, state.dialogue.activeNodeId);
    const choices = getAvailableChoices(node, state);
    const profile = CHARACTER_PROFILES[dialogueId];
    const relationship = profile ? getRelationshipRecord(state, profile) : null;
    const status = relationship ? relationshipStatus(relationship) : null;

    return `
      <div class="dialogue-scrim">
        <section class="dialogue-panel" role="dialog" aria-modal="true" aria-labelledby="dialogue-speaker" tabindex="-1">
          <button class="dialogue-close" data-action="close-dialogue" aria-label="End conversation">×</button>
          <div class="character-portrait" aria-hidden="true">
            ${
              dialogue.portraitAsset
                ? `<img src="${dialogue.portraitAsset}" alt="" draggable="false" decoding="async" onerror="this.hidden=true" />`
                : ""
            }
            <span>${escapeHtml(dialogue.portrait)}</span>
          </div>
          <div class="dialogue-content">
            ${profile ? `
              <div class="dialogue-relationship is-${status.className}">
                <span>${escapeHtml(profile.role)}</span>
                <strong>${escapeHtml(status.label)}</strong>
                <span>${escapeHtml(exposureStatus(relationship))}</span>
              </div>
            ` : ""}
            <p id="dialogue-speaker" class="speaker">${escapeHtml(node.speaker)}</p>
            <blockquote>${escapeHtml(node.text)}</blockquote>
            <div class="dialogue-choices">
              ${choices
                .map(
                  (choice) => {
                    const impact = profile ? previewRelationshipMoment(profile, node.id, choice) : null;
                    return `
                    <button class="dialogue-choice" data-dialogue-choice="${choice.id}">
                      ${choice.evidenceId ? `<span class="evidence-choice">Evidence</span>` : ""}
                      <span>${escapeHtml(choice.text)}</span>
                      ${impact && (impact.trust || impact.risk || impact.promise) ? `<small class="relationship-preview">${impact.trust > 0 ? "Builds trust" : impact.trust < 0 ? "Strains trust" : ""}${impact.risk ? `${impact.trust ? " · " : ""}Raises exposure` : ""}${impact.promise ? `${impact.trust || impact.risk ? " · " : ""}Makes a promise` : ""}</small>` : ""}
                    </button>
                  `},
                )
                .join("")}
            </div>
          </div>
        </section>
      </div>
    `;
  }

  bindDialogueActions() {
    const state = this.store.getState();
    const dialogueId = state.dialogue.activeDialogueId;
    if (!dialogueId) return;

    const node = getDialogueNode(DIALOGUES, dialogueId, state.dialogue.activeNodeId);
    const choices = getAvailableChoices(node, state);

    this.root.querySelector("[data-action='close-dialogue']")?.addEventListener("click", () => {
      this.store.replace(closeDialogue(this.store.getState()), "close-dialogue");
      this.saves.save(this.store.getState(), "close-dialogue");
      this.renderLocation();
    });

    this.root.querySelectorAll("[data-dialogue-choice]").forEach((button) => {
      button.addEventListener("click", () => {
        const choice = choices.find(
          (candidate) => candidate.id === button.dataset.dialogueChoice,
        );
        if (!choice) return;

        let next = applyEffects(this.store.getState(), choice.effects || []);
        next = advanceDialogue(next, dialogueId, choice);

        if (!choice.end) {
          const nextNode = getDialogueNode(
            DIALOGUES,
            dialogueId,
            next.dialogue.activeNodeId,
          );
          next = applyEffects(next, nextNode.onEnter || []);
        }

        next = applyRelationshipMoment(
          next,
          CHARACTER_PROFILES[dialogueId],
          node.id,
          choice,
        );

        this.store.replace(next, `dialogue-choice-${choice.id}`);
        this.saves.save(this.store.getState(), `dialogue-choice-${choice.id}`);
        this.renderLocation();
      });
    });
  }

  bindRecordingAudioActions() {
    const settings = this.store.getState().settings;
    const recordings = [...this.root.querySelectorAll("[data-recording-audio]")];
    const volume = Math.max(0, Math.min(1, Number(settings.effectsVolume) || 0));

    recordings.forEach((recording) => {
      if (recording.dataset.audioBound === "true") return;
      recording.dataset.audioBound = "true";
      recording.volume = volume;
      recording.muted = Boolean(settings.muted);
      recording.addEventListener("play", () => {
        recordings.forEach((other) => {
          if (other !== recording) other.pause();
          other.closest(".recording-fragment")?.classList.remove("is-audible");
        });
        recording.closest(".recording-fragment")?.classList.add("is-audible");
      });
      recording.addEventListener("pause", () => {
        recording.closest(".recording-fragment")?.classList.remove("is-audible");
      });
      recording.addEventListener("ended", () => {
        recording.closest(".recording-fragment")?.classList.remove("is-audible");
      });
    });
  }

  bindInventoryActions() {
    if (this.inventoryActionsBound) return;
    this.inventoryActionsBound = true;

    this.root.addEventListener("click", (event) => {
      const toolButton = event.target.closest?.("[data-use-inventory]");
      if (!toolButton) return;
      event.stopPropagation();
      this.useInventoryItem(toolButton.dataset.useInventory);
    });
  }

  useInventoryItem(itemId) {
    const state = this.store.getState();
    const item = INVENTORY_ITEMS[itemId];
    if (!item || !state.inventory.includes(itemId)) return;

    if (itemId === "notebook") {
      this.inventoryOpen = false;
      this.inventoryMessage = "";
      this.activeInventoryToolId = null;
      this.openNotebook(this.router.current());
      return;
    }

    const context = getInventoryToolContext(
      state,
      itemId,
      GAME_CONTENT.locations,
    );
    if (!context.available || !context.hotspotId) {
      this.inventoryMessage = context.hint;
      this.render(this.router.current());
      return;
    }

    const location = GAME_CONTENT.locations[state.progress.currentLocation];
    const hotspot = location?.hotspots?.find(
      (candidate) => candidate.id === context.hotspotId,
    );
    if (!hotspot) return;

    this.inventoryOpen = false;
    this.inventoryMessage = "";
    this.activeInventoryToolId = itemId;
    this.activeLocationNote = hotspot;
    this.notice.show(`${item.name} ready: ${hotspot.actionLabel}.`);
    this.renderLocation();
    this.root.querySelector("[data-action='hotspot-action']")?.focus();
  }

  renderEvidenceViewer() {
    const evidence = EVIDENCE[this.activeEvidenceId];
    if (!evidence) return "";
    const presentation = getEvidencePresentation(evidence);

    return `
      <div class="evidence-viewer-scrim">
        <section class="evidence-viewer" role="dialog" aria-modal="true" aria-labelledby="evidence-viewer-title" tabindex="-1">
          <header class="evidence-viewer-header">
            <div>
              <p class="kicker">${escapeHtml(presentation.label)} <span aria-hidden="true">/</span> ${escapeHtml(presentation.fileNumber)}</p>
              <h1 id="evidence-viewer-title">${escapeHtml(evidence.title)}</h1>
            </div>
            <button data-close-evidence aria-label="Close evidence viewer">×</button>
          </header>
          <div class="evidence-artifact-stage">
            ${renderEvidenceArtifact(evidence)}
          </div>
          <footer>
            <p>${escapeHtml(evidence.summary)}</p>
            <button class="button button-secondary" data-close-evidence>Return to investigation</button>
          </footer>
        </section>
      </div>
    `;
  }

  bindEvidenceViewerActions() {
    if (this.evidenceViewerActionsBound) return;
    this.evidenceViewerActionsBound = true;

    this.root.addEventListener("click", (event) => {
      const viewButton = event.target.closest?.("[data-view-evidence]");
      if (viewButton) {
        event.stopPropagation();
        this.activeEvidenceId = viewButton.dataset.viewEvidence;
        this.render(this.router.current());
        return;
      }

      if (event.target.closest?.("[data-close-evidence]")) {
        this.activeEvidenceId = null;
        this.render(this.router.current());
      }
    });
  }

  bindBoardDrag() {
    const board = this.root.querySelector("#evidence-corkboard");
    if (!board) return;

    this.root.querySelectorAll("[data-evidence-card-shell]").forEach((card) => {
      let start = null;

      card.addEventListener("pointerdown", (event) => {
        if (event.button !== 0) return;
        if (!event.target.closest("[data-drag-handle]")) return;
        this.boardWasDragged = false;
        const evidenceId = card.dataset.evidenceCardShell;
        const position = this.store.getState().board.cards[evidenceId];
        start = {
          pointerX: event.clientX,
          pointerY: event.clientY,
          cardX: position.x,
          cardY: position.y,
        };
        card.setPointerCapture(event.pointerId);
      });

      card.addEventListener("pointermove", (event) => {
        if (!start) return;
        const rect = board.getBoundingClientRect();
        const dx = ((event.clientX - start.pointerX) / rect.width) * 100;
        const dy = ((event.clientY - start.pointerY) / rect.height) * 100;
        if (Math.abs(dx) + Math.abs(dy) < 0.6) return;
        this.boardWasDragged = true;
        card.style.left = `${Math.max(0, Math.min(86, start.cardX + dx))}%`;
        card.style.top = `${Math.max(0, Math.min(80, start.cardY + dy))}%`;
      });

      card.addEventListener("pointerup", (event) => {
        if (!start) return;
        const rect = board.getBoundingClientRect();
        const dx = ((event.clientX - start.pointerX) / rect.width) * 100;
        const dy = ((event.clientY - start.pointerY) / rect.height) * 100;
        if (this.boardWasDragged) {
          const next = moveEvidence(
            this.store.getState(),
            card.dataset.evidenceCardShell,
            {
            x: start.cardX + dx,
            y: start.cardY + dy,
            },
          );
          this.store.replace(next, "drag-evidence");
          this.saves.save(this.store.getState(), "drag-evidence");
          this.boardWasDragged = false;
          this.renderBoard();
        }
        start = null;
      });

      card.addEventListener("pointercancel", () => {
        start = null;
        this.boardWasDragged = false;
      });
    });
  }

  renderToast() {
    if (this.store.getState().dialogue.activeDialogueId || this.activeEvidenceId) {
      return "";
    }
    return this.notice.value
      ? `
        <div class="toast" role="status" aria-live="polite">
          <span aria-hidden="true">+</span>
          <div>
            <small>Case file updated</small>
            <strong>${escapeHtml(this.notice.value)}</strong>
          </div>
        </div>
      `
      : "";
  }

  bindActions(actions) {
    Object.entries(actions).forEach(([name, handler]) => {
      this.root
        .querySelectorAll(`[data-action="${name}"]`)
        .forEach((element) => element.addEventListener("click", handler));
    });
  }

  continueGame() {
    const loaded = this.saves.load();
    if (!loaded) {
      this.notice.show("No readable save was found.");
      this.renderTitle();
      return;
    }
    this.resetEphemeralUi();
    this.store.replace(loaded, "continue");
    this.router.navigate(loaded.progress.currentScreen || "home");
  }

  visitLocation(id) {
    if (!this.store.getState().progress.unlockedLocations.includes(id)) return;
    this.activeLocationNote = null;
    const next = applyEffects(this.store.getState(), [
      { type: "visitLocation", id },
      ...(id === "ledger_newsroom"
        ? [{ type: "setFlag", key: "visitedNewsroom", value: true }]
        : []),
      { type: "setPath", path: "progress.currentScreen", value: "location" },
    ]);
    this.store.replace(next, "travel");
    this.saves.save(this.store.getState(), "travel");
    this.router.navigate("location");
  }

  openCaseFiles(returnRoute = this.router.current()) {
    this.returnRoute = returnRoute;
    this.router.navigate("case-files");
  }

  openNotebook(returnRoute = this.router.current()) {
    this.returnRoute = returnRoute;
    this.router.navigate("notebook");
  }

  describeProgress(state) {
    if (state.flags.provedVesperWithholdsWarnings) return "Chapter 14 · Eleven Days of Silence";
    if (
      state.progress.unlockedLocations.includes("vesper_western_cistern") ||
      (state.locationVisits.vesper_western_cistern || 0) > 0
    ) return "Chapter 13 · The Western Cistern";
    if (state.flags.provedVesperTransferRoute) return "Chapter 12 · Forecast Island";
    if (
      state.progress.unlockedLocations.includes("port_prosper_eastern_terminal") ||
      (state.locationVisits.port_prosper_eastern_terminal || 0) > 0
    ) return "Chapter 11 · Locker 44";
    if (state.flags.provedSanctuaryChain) return "Chapter 10 · The Archipelago Protocol";
    if (state.flags.provedAsterHouseTriggerCell) return "Chapter 10 · Port Prosper survives";
    if (state.flags.identifiedAsterHouse) return "Chapter 9 · The Trigger Cell";
    if (state.flags.portProsperDecisionMade) return "Chapter 8 · Consequences";
    if (state.flags.provedBenefactorsSelectCrises) return "Chapter 7 · The First Circle";
    if (state.flags.provedOrpheusCommandCenter) return "Chapter 6 · The Island";
    if (state.flags.provedOrpheusSupplyRoute) return "Chapter 5 · Orpheus";
    if (state.flags.provedRedoubtEvacuation) return "Chapter 4 · Redoubt";
    if (state.flags.mappedContinuitySiteNetwork) return "Chapter 3 · The Pattern";
    if (state.flags.northstarRoutesToBrighterHorizon) return "Chapter 2 · The Foundation";
    if (state.progress.prologueComplete) return "Chapter 1 · Follow Northstar";
    if (state.flags.prologueEndingReady) return "Final deduction ready";
    if (state.flags.recordingReconstructed) return "Vale’s message restored";
    if (state.flags.foundWallCavity) return "Hidden room discovered";
    if (state.flags.mayorMissing) return "Mayor Vale missing";
    if (state.completedDeductions.length) return "The missing addition";
    if (state.flags.downloadedAttachments) return "Following Northstar";
    return "Opening lead";
  }

  toggleQuickSetting(key, label) {
    this.store.update((draft) => {
      draft.settings[key] = !draft.settings[key];
    }, `toggle-${key}`);
    this.saves.saveSettings(this.store.getState().settings);
    if (this.saves.hasSave()) {
      this.saves.save(this.store.getState(), `toggle-${key}`);
    }
    const enabled = this.store.getState().settings[key];
    this.notice.show(`${label} ${enabled ? "on" : "off"}.`);
    this.render(this.router.current());
  }

  finishTutorial(reason) {
    this.store.update((draft) => {
      draft.progress.opening.tutorialCompleted = true;
      draft.progress.opening.cutsceneStep = 0;
      draft.progress.currentScreen = "cutscene";
    }, reason);
    this.saves.save(this.store.getState(), reason);
    this.router.navigate("cutscene");
  }

  completeOpening(reason) {
    this.store.update((draft) => {
      draft.flags.heardOpeningMessage = true;
      draft.progress.opening.cutsceneCompleted = true;
      draft.progress.currentScreen = "home";
      draft.progress.previousScreen = "cutscene";
    }, reason);
    this.saves.save(this.store.getState(), reason);
    this.activeOfficeNote = {
      title: "The caller’s instruction",
      text: "Check the laptop. Two anonymous files are waiting. Start with the invoice.",
    };
    this.router.navigate("home");
  }

  resetEphemeralUi() {
    this.notice.clear();
    this.activeOfficeNote = null;
    this.activeLocationNote = null;
    this.inventoryOpen = false;
    this.selectedBoardCards = [];
    this.boardConnectionType = "confirmed";
    this.boardCategoryFilter = "all";
    this.boardDensity = "compact";
    this.boardScroll = { left: 0, top: 0 };
    this.boardConnectionPanelOpen = false;
    this.boardWasDragged = false;
    this.boardLens = "all";
    this.activeBoardNoteId = null;
    this.activeDeductionId = null;
    this.tutorialHotspotFound = false;
    this.tutorialBoardCards = [];
    this.tutorialBoardConnected = false;
    this.activeEvidenceId = null;
    this.puzzleAnnouncement = "";
    this.activeRecordingFragmentId = null;
    this.activeInventoryToolId = null;
    this.inventoryMessage = "";
    this.pendingDeleteSlot = null;
    this.lastCinematicCue = null;
  }

  applyPreferences(settings) {
    document.documentElement.style.setProperty("--text-scale", settings.textScale);
    document.documentElement.dataset.reducedMotion = String(settings.reducedMotion);
    document.documentElement.dataset.highContrast = String(settings.highContrast);
    document.documentElement.dataset.hotspotAssist = String(settings.hotspotAssist);
  }
}
