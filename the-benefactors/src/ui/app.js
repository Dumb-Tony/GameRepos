import {
  EVIDENCE,
  DIALOGUES,
  GAME_CONTENT,
  INVENTORY_ITEMS,
} from "../content/game-content.js";
import { evaluateCondition } from "../engine/conditions.js";
import { applyEffects } from "../engine/events.js";
import { createInitialState } from "../engine/game-state.js";
import { renderExplorationScene } from "../systems/exploration/scene-renderer.js";
import {
  advanceDialogue,
  closeDialogue,
  getAvailableChoices,
  getDialogueNode,
  startDialogue,
} from "../systems/dialogue/dialogue-engine.js";

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
    this.notice = "";
    this.returnRoute = "title";
    this.activeOfficeNote = null;
    this.activeLocationNote = null;
    this.inventoryOpen = false;
  }

  start() {
    this.store.subscribe((state) => this.applyPreferences(state.settings));
    this.applyPreferences(this.store.getState().settings);
    this.router.start((route) => this.render(route));
  }

  render(route) {
    if (
      ["home", "location", "map", "laptop"].includes(route) &&
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
      settings: () => this.renderSettings(),
    };

    (renderers[route] || renderers.title)();
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
          <p class="build-mark">Milestone 0 · Foundation build</p>
        </section>
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
    const note = this.activeOfficeNote || GAME_CONTENT.officeHotspots[0];

    this.root.innerHTML = `
      <main id="game-main" class="screen game-screen office-screen">
        ${this.renderGameHeader(GAME_CONTENT.chapter, "Home office")}
        <section class="scene-frame" aria-label="Home office">
          <div class="office-room">
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
        this.notice = "New evidence added to the case file.";
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
                      <article><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.summary)}</p></article>
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
          <div class="character-portrait" aria-hidden="true">${escapeHtml(dialogue.portrait)}</div>
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

  renderToast() {
    return this.notice
      ? `<div class="toast" role="status">${escapeHtml(this.notice)}</div>`
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
      this.notice = "No readable save was found.";
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
    this.notice = "Case file saved.";
    this.render(this.router.current());
    window.setTimeout(() => {
      this.notice = "";
      if (this.router.current() !== "title") this.render(this.router.current());
    }, 1800);
  }

  applyPreferences(settings) {
    document.documentElement.style.setProperty("--text-scale", settings.textScale);
    document.documentElement.dataset.reducedMotion = String(settings.reducedMotion);
    document.documentElement.dataset.highContrast = String(settings.highContrast);
    document.documentElement.dataset.hotspotAssist = String(settings.hotspotAssist);
  }
}
