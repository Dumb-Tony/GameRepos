import {
  DEFAULT_SETTINGS,
  GAME_STATE_VERSION,
  createInitialState,
  isGameState,
} from "./game-state.js";

export const SAVE_KEY = "the-benefactors.save.v1";
export const SETTINGS_KEY = "the-benefactors.settings.v1";

export class SaveSystem {
  constructor(storage = globalThis.localStorage) {
    this.storage = storage;
  }

  hasSave() {
    return this.storage.getItem(SAVE_KEY) !== null;
  }

  save(state, reason = "manual") {
    const snapshot = structuredClone(state);
    snapshot.meta.updatedAt = new Date().toISOString();
    snapshot.meta.lastSaveReason = reason;
    this.storage.setItem(SAVE_KEY, JSON.stringify(snapshot));
    this.saveSettings(snapshot.settings);
    return snapshot;
  }

  load() {
    const raw = this.storage.getItem(SAVE_KEY);
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw);
      return this.migrate(parsed);
    } catch {
      return null;
    }
  }

  deleteSave() {
    this.storage.removeItem(SAVE_KEY);
  }

  saveSettings(settings) {
    this.storage.setItem(
      SETTINGS_KEY,
      JSON.stringify({ ...DEFAULT_SETTINGS, ...settings }),
    );
  }

  loadSettings() {
    const raw = this.storage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };

    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  }

  migrate(candidate) {
    if (!candidate || typeof candidate !== "object") return null;
    if (candidate.version > GAME_STATE_VERSION) return null;

    if (candidate.version === GAME_STATE_VERSION && isGameState(candidate)) {
      return candidate;
    }

    const fallback = createInitialState(candidate.player, candidate.settings);
    return {
      ...fallback,
      ...candidate,
      version: GAME_STATE_VERSION,
      meta: { ...fallback.meta, ...candidate.meta },
      player: { ...fallback.player, ...candidate.player },
      progress: { ...fallback.progress, ...candidate.progress },
      flags: { ...fallback.flags, ...candidate.flags },
      evidence: { ...fallback.evidence, ...candidate.evidence },
      board: { ...fallback.board, ...candidate.board },
      locationVisits: {
        ...fallback.locationVisits,
        ...candidate.locationVisits,
      },
      settings: { ...DEFAULT_SETTINGS, ...candidate.settings },
    };
  }
}
