import {
  DEFAULT_SETTINGS,
  GAME_STATE_VERSION,
  createInitialState,
  isGameState,
} from "./game-state.js?v=board-canvas-20260730a";

export const SAVE_KEY = "the-benefactors.save.v1";
export const SETTINGS_KEY = "the-benefactors.settings.v1";
export const MANUAL_SAVE_PREFIX = "the-benefactors.manual.v1";
export const MANUAL_SAVE_SLOTS = 3;

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

  manualSaveKey(slot) {
    const normalizedSlot = Number(slot);
    if (
      !Number.isInteger(normalizedSlot) ||
      normalizedSlot < 1 ||
      normalizedSlot > MANUAL_SAVE_SLOTS
    ) {
      throw new RangeError(`Manual save slot must be between 1 and ${MANUAL_SAVE_SLOTS}.`);
    }
    return `${MANUAL_SAVE_PREFIX}.${normalizedSlot}`;
  }

  saveToSlot(slot, state) {
    const snapshot = structuredClone(state);
    snapshot.meta.updatedAt = new Date().toISOString();
    snapshot.meta.lastSaveReason = `manual-slot-${slot}`;
    this.storage.setItem(this.manualSaveKey(slot), JSON.stringify(snapshot));
    this.save(snapshot, `manual-slot-${slot}`);
    return snapshot;
  }

  loadSlot(slot) {
    const raw = this.storage.getItem(this.manualSaveKey(slot));
    if (!raw) return null;

    try {
      return this.migrate(JSON.parse(raw));
    } catch {
      return null;
    }
  }

  deleteSlot(slot) {
    this.storage.removeItem(this.manualSaveKey(slot));
  }

  listSlots() {
    return Array.from({ length: MANUAL_SAVE_SLOTS }, (_, index) => {
      const slot = index + 1;
      const state = this.loadSlot(slot);
      return {
        slot,
        state,
        empty: !state,
      };
    });
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

    const legacyVersion = Number(candidate.version) || 0;
    const fallback = createInitialState(candidate.player, candidate.settings);
    const migrated = {
      ...fallback,
      ...candidate,
      version: GAME_STATE_VERSION,
      meta: { ...fallback.meta, ...candidate.meta },
      player: { ...fallback.player, ...candidate.player },
      progress: {
        ...fallback.progress,
        ...candidate.progress,
        opening: {
          ...fallback.progress.opening,
          ...candidate.progress?.opening,
        },
      },
      flags: { ...fallback.flags, ...candidate.flags },
      evidence: { ...fallback.evidence, ...candidate.evidence },
      board: { ...fallback.board, ...candidate.board },
      dialogue: { ...fallback.dialogue, ...candidate.dialogue },
      journal: {
        ...fallback.journal,
        ...candidate.journal,
        revealedHints: {
          ...fallback.journal.revealedHints,
          ...candidate.journal?.revealedHints,
        },
      },
      puzzles: {
        ...fallback.puzzles,
        ...candidate.puzzles,
        study_plan_alignment: {
          ...fallback.puzzles.study_plan_alignment,
          ...candidate.puzzles?.study_plan_alignment,
        },
        vale_recording_reconstruction: {
          ...fallback.puzzles.vale_recording_reconstruction,
          ...candidate.puzzles?.vale_recording_reconstruction,
        },
      },
      locationVisits: {
        ...fallback.locationVisits,
        ...candidate.locationVisits,
      },
      settings: { ...DEFAULT_SETTINGS, ...candidate.settings },
    };

    if (legacyVersion < 6) {
      migrated.progress.opening = {
        tutorialChoice: "skip",
        tutorialStep: 0,
        tutorialCompleted: true,
        cutsceneStep: 0,
        cutsceneCompleted: true,
      };
      migrated.flags.heardOpeningMessage = true;
    }

    if (legacyVersion < 7 && migrated.flags.foundWallCavity) {
      migrated.puzzles.study_plan_alignment = {
        ...migrated.puzzles.study_plan_alignment,
        rotation: 270,
        completed: true,
      };
    }

    if (
      legacyVersion < 9 &&
      migrated.progress.prologueComplete &&
      !migrated.progress.unlockedLocations.includes("northstar_harrow")
    ) {
      migrated.progress.unlockedLocations.push("northstar_harrow");
    }

    if (
      legacyVersion < 10 &&
      migrated.flags.northstarRoutesToBrighterHorizon &&
      !migrated.progress.unlockedLocations.includes("brighter_horizon_office")
    ) {
      migrated.progress.unlockedLocations.push("brighter_horizon_office");
    }

    if (
      legacyVersion < 11 &&
      migrated.flags.brighterHorizonFundsNorthstar &&
      !migrated.progress.unlockedLocations.includes("calder_grand_gala")
    ) {
      migrated.progress.unlockedLocations.push("calder_grand_gala");
    }

    if (
      legacyVersion < 12 &&
      migrated.flags.uncoveredContractorNetwork &&
      !migrated.progress.unlockedLocations.includes("saltmere_apartment")
    ) {
      migrated.progress.unlockedLocations.push("saltmere_apartment");
    }

    if (
      legacyVersion < 13 &&
      migrated.flags.mappedContinuitySiteNetwork &&
      !migrated.progress.unlockedLocations.includes("bellwether_relief_station")
    ) {
      migrated.progress.unlockedLocations.push("bellwether_relief_station");
    }

    return migrated;
  }
}
