export const GAME_STATE_VERSION = 3;

export const DEFAULT_SETTINGS = Object.freeze({
  textScale: 1,
  reducedMotion: false,
  highContrast: false,
  hotspotAssist: false,
  subtitles: true,
  musicVolume: 0.65,
  effectsVolume: 0.8,
  ambienceVolume: 0.75,
  muted: false,
});

export function createInitialState(player = {}, settings = {}) {
  const now = new Date().toISOString();

  return {
    version: GAME_STATE_VERSION,
    meta: {
      createdAt: now,
      updatedAt: now,
      playTimeSeconds: 0,
      lastSaveReason: "new-game",
    },
    player: {
      firstName: player.firstName?.trim() || "Alex",
      lastName: player.lastName?.trim() || "Rowan",
      pronouns: player.pronouns || "they",
      portrait: player.portrait || "portrait-1",
    },
    progress: {
      chapter: 1,
      officeState: 0,
      currentLocation: "home_office",
      currentScreen: "home",
      previousScreen: "title",
      unlockedLocations: ["home_office", "ledger_newsroom"],
    },
    flags: {
      openedAnonymousEmail: false,
      downloadedAttachments: false,
      visitedNewsroom: false,
      permitAcquired: false,
      mayorMissing: false,
    },
    inventory: ["press_credentials", "smartphone", "recorder", "notebook"],
    evidence: {
      collected: [],
      pinned: [],
      corroborated: [],
      discredited: [],
    },
    board: {
      cards: {},
      connections: [],
      zoom: 1,
      offset: { x: 0, y: 0 },
    },
    characters: {},
    dialogue: {
      activeDialogueId: null,
      activeNodeId: null,
      visitedNodes: [],
      completedDialogues: [],
    },
    completedDeductions: [],
    locationVisits: {
      home_office: 0,
      ledger_newsroom: 0,
      city_hall: 0,
      mayor_street: 0,
      mayor_study: 0,
      hidden_room: 0,
    },
    settings: {
      ...DEFAULT_SETTINGS,
      ...settings,
    },
  };
}

export function cloneState(state) {
  return structuredClone(state);
}

export function isGameState(value) {
  return Boolean(
    value &&
      typeof value === "object" &&
      Number.isInteger(value.version) &&
      value.meta &&
      value.player &&
      value.progress &&
      value.flags &&
      value.evidence &&
      value.board &&
      value.settings,
  );
}

export class GameStore {
  #state;
  #listeners = new Set();

  constructor(initialState = createInitialState()) {
    if (!isGameState(initialState)) {
      throw new TypeError("GameStore requires a valid game state.");
    }
    this.#state = cloneState(initialState);
  }

  getState() {
    return cloneState(this.#state);
  }

  replace(nextState, reason = "replace") {
    if (!isGameState(nextState)) {
      throw new TypeError("Cannot replace state with invalid data.");
    }
    this.#state = cloneState(nextState);
    this.#state.meta.updatedAt = new Date().toISOString();
    this.#state.meta.lastSaveReason = reason;
    this.#notify(reason);
    return this.getState();
  }

  update(recipe, reason = "update") {
    const draft = cloneState(this.#state);
    const result = recipe(draft) || draft;
    return this.replace(result, reason);
  }

  subscribe(listener) {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  #notify(reason) {
    const snapshot = this.getState();
    this.#listeners.forEach((listener) => listener(snapshot, reason));
  }
}
