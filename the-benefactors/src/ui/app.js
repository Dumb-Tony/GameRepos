import {
  EVIDENCE,
  DIALOGUES,
  DEDUCTIONS,
  GAME_CONTENT,
  INVENTORY_ITEMS,
} from "../content/game-content.js?v=noir-20260726b";
import { evaluateCondition } from "../engine/conditions.js";
import { applyEffects } from "../engine/events.js";
import { createInitialState } from "../engine/game-state.js";
import { renderExplorationScene } from "../systems/exploration/scene-renderer.js?v=noir-20260726b";
import {
  advanceDialogue,
  closeDialogue,
  getAvailableChoices,
  getDialogueNode,
  startDialogue,
} from "../systems/dialogue/dialogue-engine.js";
import {
  connectEvidence,
  evaluateBoardDeductions,
  moveEvidence,
  pinEvidence,
  removeConnection,
} from "../systems/evidence-board/evidence-board.js";
import { renderEvidenceArtifact } from "../systems/evidence/evidence-renderer.js";
import { TransientNotice } from "./transient-notice.js?v=noir-20260726b";

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

export class GameApp {
  constructor({ root, store, saves, router }) {
    this.root = root;
    this.store = store;
    this.saves = saves;
    this.router = router;
    this.notice = new TransientNotice({
      onExpire: () => {
        this.root.querySelector(".toast")?.remove();
      },
    });
    this.returnRoute = "title";
    this.activeOfficeNote = null;
    this.activeLocationNote = null;
    this.inventoryOpen = false;
    this.selectedBoardCard = null;
    this.boardConnectionType = "confirmed";
    this.boardWasDragged = false;
    this.activeEvidenceId = null;
    this.evidenceViewerActionsBound = false;
  }

  start() {
    this.store.subscribe((state) => this.applyPreferences(state.settings));
    this.applyPreferences(this.store.getState().settings);
    this.router.start((route) => this.render(route));
  }

  render(route) {
    if (
      ["home", "location", "map", "laptop", "board"].includes(route) &&
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
      home: () => this.renderHome(),
      location: () => this.renderLocation(),
      map: () => this.renderMap(),
      laptop: () => this.renderLaptop(),
      board: () => this.renderBoard(),
      settings: () => this.renderSettings(),
    };

    (renderers[route] || renderers.title)();
    if (this.activeEvidenceId) {
      this.root.insertAdjacentHTML("beforeend", this.renderEvidenceViewer());
    }
    this.bindEvidenceViewerActions();
    this.root.querySelector("h1, h2, [data-autofocus]")?.focus?.();
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
            <button class="button button-ghost" data-action="settings">Settings</button>
          </div>
          <p class="build-mark">Prologue · Development build</p>
        </section>
        ${this.renderToast()}
      </main>
    `;

    this.bindActions({
      "new-game": () => this.router.navigate("setup"),
      continue: () => this.continueGame(),
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
      this.saves.save(this.store.getState(), "new-game");
      this.router.navigate("home");
    });
  }

  renderHome() {
    const state = this.store.getState();
    const playerName = `${escapeHtml(state.player.firstName)} ${escapeHtml(state.player.lastName)}`;
    const caseUpdate = state.flags.mayorMissing
      ? {
          title: "Mayor Vale is missing",
          text: "Mara’s message says the police completed a welfare check. Vale’s study is briefly unsecured—and now marked on the city map.",
        }
      : GAME_CONTENT.officeHotspots[0];
    const note = this.activeOfficeNote || caseUpdate;

    this.root.innerHTML = `
      <main id="game-main" class="screen game-screen office-screen">
        ${this.renderGameHeader(GAME_CONTENT.chapter, "Home office")}
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
            ${GAME_CONTENT.officeHotspots.map(
              (hotspot) => `
                <button
                  class="scene-hotspot ${hotspot.className}"
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
          </aside>
        </section>
        <footer class="game-toolbar">
          <div>
            <span class="toolbar-label">Journalist</span>
            <strong>${playerName}</strong>
          </div>
          <div class="toolbar-actions">
            <button class="tool-button" data-action="board">Evidence board</button>
            <button class="tool-button" data-action="map">City map</button>
            <button class="tool-button" data-action="inventory">Inventory</button>
            <button class="tool-button" data-action="save">Save</button>
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
        const hotspot = GAME_CONTENT.officeHotspots.find(
          (item) => item.id === button.dataset.hotspot,
        );
        if (hotspot.route) {
          this.router.navigate(hotspot.route);
          return;
        }
        this.activeOfficeNote = hotspot;
        this.renderHome();
      });
    });

    this.bindActions({
      map: () => this.router.navigate("map"),
      board: () => this.router.navigate("board"),
      inventory: () => {
        this.inventoryOpen = !this.inventoryOpen;
        this.renderHome();
      },
      save: () => this.manualSave(),
      settings: () => {
        this.returnRoute = "home";
        this.router.navigate("settings");
      },
      title: () => this.router.navigate("title"),
    });
  }

  renderLocation() {
    const state = this.store.getState();
    const location =
      GAME_CONTENT.locations[state.progress.currentLocation] ||
      GAME_CONTENT.locations.ledger_newsroom;
    const note = this.activeLocationNote;
    const actionAvailable =
      note &&
      (note.dialogueId ||
        (note.effects && evaluateCondition(note.actionWhen, state)));

    this.root.innerHTML = `
      <main id="game-main" class="screen game-screen location-screen">
        ${this.renderGameHeader(GAME_CONTENT.chapter, location.name)}
        <section class="location-stage">
          ${renderExplorationScene(location, state)}
          <article class="location-copy">
            <p class="kicker">${escapeHtml(location.eyebrow)}</p>
            <h1 tabindex="-1">${escapeHtml(location.name)}</h1>
            <p>${escapeHtml(location.description)}</p>
            ${
              note
                ? `
                  <div class="scene-inspection">
                    <span class="speaker">Observation</span>
                    <h2>${escapeHtml(note.title)}</h2>
                    <p>${escapeHtml(note.resultText || note.text)}</p>
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
            <button class="tool-button" data-action="home">Return home</button>
            <button class="tool-button" data-action="save">Save</button>
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
        this.activeLocationNote = location.hotspots.find(
          (hotspot) => hotspot.id === button.dataset.sceneHotspot,
        );
        this.renderLocation();
      });
    });

    this.bindActions({
      "hotspot-action": () => {
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
        const next = applyEffects(this.store.getState(), note.effects);
        this.store.replace(next, `hotspot-${note.id}`);
        this.saves.save(this.store.getState(), `hotspot-${note.id}`);
        this.activeLocationNote = { ...note, effects: null };
        this.notice.show("New evidence added to the case file.");
        this.renderLocation();
      },
      map: () => this.router.navigate("map"),
      inventory: () => {
        this.inventoryOpen = !this.inventoryOpen;
        this.renderLocation();
      },
      home: () => {
        this.store.update((draft) => {
          draft.progress.currentLocation = "home_office";
          draft.progress.currentScreen = "home";
        }, "return-home");
        this.saves.save(this.store.getState(), "return-home");
        this.router.navigate("home");
      },
      save: () => this.manualSave(),
      settings: () => {
        this.returnRoute = "location";
        this.router.navigate("settings");
      },
    });
    this.bindDialogueActions();
  }

  renderMap() {
    const state = this.store.getState();
    const unlocked = new Set(state.progress.unlockedLocations);
    const locations = Object.values(GAME_CONTENT.locations).filter(
      (location) => location.id !== "home_office",
    );

    this.root.innerHTML = `
      <main id="game-main" class="screen game-screen map-screen">
        ${this.renderGameHeader(GAME_CONTENT.chapter, "City map")}
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
            <button class="tool-button" data-action="save">Save</button>
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
      home: () => this.router.navigate("home"),
      inventory: () => {
        this.inventoryOpen = !this.inventoryOpen;
        this.renderMap();
      },
      save: () => this.manualSave(),
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
      home: () => this.router.navigate("home"),
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
    const pinned = state.evidence.pinned
      .map((id) => EVIDENCE[id])
      .filter(Boolean);
    const unpinned = state.evidence.collected
      .filter((id) => !state.evidence.pinned.includes(id))
      .map((id) => EVIDENCE[id])
      .filter(Boolean);

    this.root.innerHTML = `
      <main id="game-main" class="screen game-screen board-screen">
        ${this.renderGameHeader(GAME_CONTENT.chapter, "Evidence board")}
        <section class="board-workspace">
          <div class="corkboard" id="evidence-corkboard" aria-label="Interactive evidence board">
            <svg class="yarn-layer" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              ${state.board.connections
                .map((connection) => {
                  const a = state.board.cards[connection.a];
                  const b = state.board.cards[connection.b];
                  if (!a || !b) return "";
                  return `<line class="yarn yarn-${connection.type}" x1="${a.x + 7}" y1="${a.y + 10}" x2="${b.x + 7}" y2="${b.y + 10}" />`;
                })
                .join("")}
            </svg>
            <div class="board-case-label">
              <span>ACTIVE CASE 01</span>
              <strong>VALE / MUNICIPAL ACCESSIBILITY FUND</strong>
            </div>
            ${
              pinned.length
                ? pinned
                    .map((item) => {
                      const position = state.board.cards[item.id] || { x: 10, y: 10 };
                      const selected = this.selectedBoardCard === item.id;
                      return `
                        <article
                          class="evidence-card evidence-card--${item.artifact?.type || "document"} ${selected ? "is-selected" : ""}"
                          style="left:${position.x}%;top:${position.y}%"
                          data-evidence-card-shell="${item.id}"
                        >
                          <button
                            class="evidence-card-main"
                            data-board-card="${item.id}"
                            aria-pressed="${selected}"
                          >
                            <span class="evidence-pin" aria-hidden="true"></span>
                            <span class="evidence-card-thumbnail" aria-hidden="true"></span>
                            <span class="evidence-category">${escapeHtml(item.category)}</span>
                            <strong>${escapeHtml(item.title)}</strong>
                            <small>${escapeHtml(item.summary)}</small>
                          </button>
                          <button class="evidence-view-button" data-view-evidence="${item.id}">
                            View evidence
                          </button>
                        </article>
                      `;
                    })
                    .join("")
                : `
                  <div class="empty-board">
                    <strong>The board is waiting.</strong>
                    <span>Open the anonymous email and add its attachments to the case file.</span>
                  </div>
                `
            }
          </div>
          <aside class="board-sidebar">
            <p class="kicker">Casework</p>
            <h1 tabindex="-1">Connections</h1>
            <p class="board-help">
              Pin evidence, choose a yarn meaning, then select two cards. Drag cards or use
              the arrow keys to arrange the case.
            </p>
            <div class="relationship-picker" role="group" aria-label="Yarn relationship">
              ${[
                ["confirmed", "Red", "Confirmed connection"],
                ["financial", "Blue", "Financial relationship"],
                ["suspicion", "Yellow", "Suspicion"],
                ["contradiction", "White", "Contradiction"],
              ]
                .map(
                  ([type, color, label]) => `
                    <button
                      class="relationship relationship-${type} ${this.boardConnectionType === type ? "is-active" : ""}"
                      data-relationship="${type}"
                      title="${label}"
                    ><i aria-hidden="true"></i><span>${color}</span></button>
                  `,
                )
                .join("")}
            </div>
            <section class="evidence-tray">
              <p class="kicker">Evidence tray · ${unpinned.length}</p>
              ${
                unpinned.length
                  ? unpinned
                      .map(
                        (item) => `
                          <button class="tray-item" data-pin-evidence="${item.id}">
                            <span>＋</span>
                            <strong>${escapeHtml(item.title)}</strong>
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
                          <div class="connection-row">
                            <span>${escapeHtml(EVIDENCE[connection.a]?.title || connection.a)} ↔ ${escapeHtml(EVIDENCE[connection.b]?.title || connection.b)}</span>
                            <button data-remove-connection="${index}" aria-label="Remove connection">×</button>
                          </div>
                        `,
                      )
                      .join("")
                  : "<p class=\"tray-empty\">Select two cards to connect them.</p>"
              }
            </section>
            <section class="deduction-list">
              <p class="kicker">Deductions · ${state.completedDeductions.length}</p>
              ${
                state.completedDeductions.length
                  ? state.completedDeductions
                      .map(
                        (id) => `
                          <article>
                            <strong>${escapeHtml(DEDUCTIONS[id]?.title || id)}</strong>
                            <p>${escapeHtml(DEDUCTIONS[id]?.journalText || "")}</p>
                          </article>
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
            <button class="tool-button" data-action="save">Save</button>
          </div>
        </footer>
        ${this.renderToast()}
      </main>
    `;

    this.root.querySelectorAll("[data-pin-evidence]").forEach((button) => {
      button.addEventListener("click", () => {
        const next = pinEvidence(this.store.getState(), button.dataset.pinEvidence);
        this.store.replace(next, "pin-evidence");
        this.saves.save(this.store.getState(), "pin-evidence");
        this.renderBoard();
      });
    });

    this.root.querySelectorAll("[data-relationship]").forEach((button) => {
      button.addEventListener("click", () => {
        this.boardConnectionType = button.dataset.relationship;
        this.renderBoard();
      });
    });

    this.root.querySelectorAll("[data-board-card]").forEach((card) => {
      card.addEventListener("click", () => {
        if (this.boardWasDragged) {
          this.boardWasDragged = false;
          return;
        }
        const id = card.dataset.boardCard;
        if (!this.selectedBoardCard) {
          this.selectedBoardCard = id;
          this.renderBoard();
          return;
        }
        if (this.selectedBoardCard === id) {
          this.selectedBoardCard = null;
          this.renderBoard();
          return;
        }

        let next = connectEvidence(
          this.store.getState(),
          this.selectedBoardCard,
          id,
          this.boardConnectionType,
        );
        const result = evaluateBoardDeductions(next, DEDUCTIONS);
        next = result.state;
        this.store.replace(next, "connect-evidence");
        this.saves.save(this.store.getState(), "connect-evidence");
        this.selectedBoardCard = null;
        this.notice.show(
          result.newlyCompleted.length
            ? result.newlyCompleted[0].notification ||
                `Deduction: ${result.newlyCompleted[0].title}`
            : "Evidence connected.",
        );
        this.renderBoard();
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
      home: () => this.router.navigate("home"),
      map: () => this.router.navigate("map"),
      save: () => this.manualSave(),
    });
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

  renderGameHeader(chapter, place) {
    return `
      <header class="game-header">
        <div class="wordmark"><span>The</span> Benefactors</div>
        <div class="case-line"><span>${escapeHtml(chapter)}</span><strong>${escapeHtml(place)}</strong></div>
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
            .map(
              (item) => `
                <article class="inventory-item">
                  <span>${item.icon}</span>
                  <strong>${escapeHtml(item.name)}</strong>
                </article>
              `,
            )
            .join("")}
        </div>
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

    return `
      <div class="dialogue-scrim">
        <section class="dialogue-panel" role="dialog" aria-modal="true" aria-labelledby="dialogue-speaker">
          <button class="dialogue-close" data-action="close-dialogue" aria-label="End conversation">×</button>
          <div class="character-portrait" aria-hidden="true">
            ${
              dialogue.portraitAsset
                ? `<img src="${dialogue.portraitAsset}" alt="" draggable="false" onerror="this.hidden=true" />`
                : ""
            }
            <span>${escapeHtml(dialogue.portrait)}</span>
          </div>
          <div class="dialogue-content">
            <p id="dialogue-speaker" class="speaker">${escapeHtml(node.speaker)}</p>
            <blockquote>${escapeHtml(node.text)}</blockquote>
            <div class="dialogue-choices">
              ${choices
                .map(
                  (choice) => `
                    <button class="dialogue-choice" data-dialogue-choice="${choice.id}">
                      ${choice.evidenceId ? `<span class="evidence-choice">Evidence</span>` : ""}
                      <span>${escapeHtml(choice.text)}</span>
                    </button>
                  `,
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

        this.store.replace(next, `dialogue-choice-${choice.id}`);
        this.saves.save(this.store.getState(), `dialogue-choice-${choice.id}`);
        this.renderLocation();
      });
    });
  }

  renderEvidenceViewer() {
    const evidence = EVIDENCE[this.activeEvidenceId];
    if (!evidence) return "";

    return `
      <div class="evidence-viewer-scrim">
        <section class="evidence-viewer" role="dialog" aria-modal="true" aria-labelledby="evidence-viewer-title">
          <header class="evidence-viewer-header">
            <div>
              <p class="kicker">${escapeHtml(evidence.category)}</p>
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
        if (event.target.closest("[data-view-evidence]")) return;
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
        card.style.left = `${Math.max(0, Math.min(82, start.cardX + dx))}%`;
        card.style.top = `${Math.max(0, Math.min(66, start.cardY + dy))}%`;
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
          this.renderBoard();
        }
        start = null;
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
    this.store.replace(loaded, "continue");
    this.router.navigate(loaded.progress.currentScreen || "home");
  }

  visitLocation(id) {
    if (!this.store.getState().progress.unlockedLocations.includes(id)) return;
    this.activeLocationNote = null;
    const next = applyEffects(this.store.getState(), [
      { type: "visitLocation", id },
      { type: "setFlag", key: "visitedNewsroom", value: true },
      { type: "setPath", path: "progress.currentScreen", value: "location" },
    ]);
    this.store.replace(next, "travel");
    this.saves.save(this.store.getState(), "travel");
    this.router.navigate("location");
  }

  manualSave() {
    this.saves.save(this.store.getState(), "manual");
    this.notice.show("Case file saved.");
    this.render(this.router.current());
  }

  applyPreferences(settings) {
    document.documentElement.style.setProperty("--text-scale", settings.textScale);
    document.documentElement.dataset.reducedMotion = String(settings.reducedMotion);
    document.documentElement.dataset.highContrast = String(settings.highContrast);
    document.documentElement.dataset.hotspotAssist = String(settings.hotspotAssist);
  }
}
