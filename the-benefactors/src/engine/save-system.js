import {
  DEFAULT_SETTINGS,
  GAME_STATE_VERSION,
  createInitialState,
  isGameState,
} from "./game-state.js?v=complete-20260811a";

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
      characters: Object.fromEntries(
        Object.entries(candidate.characters || {}).map(([id, record]) => [
          id,
          {
            trust: Number(record?.trust) || 0,
            risk: Number(record?.risk) || 0,
            interactions: Number(record?.interactions) || 0,
            promises: [...new Set(record?.promises || [])],
            history: [...new Set(record?.history || [])],
            events: [...new Set(record?.events || [])],
            assistance: [...new Set(record?.assistance || [])],
          },
        ]),
      ),
      evidence: { ...fallback.evidence, ...candidate.evidence },
      board: {
        ...fallback.board,
        ...candidate.board,
        notes: { ...fallback.board.notes, ...candidate.board?.notes },
        view: { ...fallback.board.view, ...candidate.board?.view },
      },
      dialogue: { ...fallback.dialogue, ...candidate.dialogue },
      exploration: {
        ...fallback.exploration,
        ...candidate.exploration,
        observedHotspots: [
          ...new Set(candidate.exploration?.observedHotspots || []),
        ],
        completedInteractions: [
          ...new Set(candidate.exploration?.completedInteractions || []),
        ],
        fieldNotes: [...new Set(candidate.exploration?.fieldNotes || [])],
      },
      journal: {
        ...fallback.journal,
        ...candidate.journal,
        revealedHints: {
          ...fallback.journal.revealedHints,
          ...candidate.journal?.revealedHints,
        },
      },
      cinematics: {
        ...fallback.cinematics,
        ...candidate.cinematics,
        seen: [...new Set(candidate.cinematics?.seen || [])],
      },
      pressure: {
        ...fallback.pressure,
        ...candidate.pressure,
        events: [...new Set(candidate.pressure?.events || [])],
        countermeasures: [...new Set(candidate.pressure?.countermeasures || [])],
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

    if (legacyVersion < 14) {
      const columns = [2, 16, 30, 44, 58, 72, 86];
      migrated.evidence.pinned.forEach((evidenceId, index) => {
        migrated.board.cards[evidenceId] = {
          x: columns[index % columns.length],
          y: 7 + Math.floor(index / columns.length) * 19,
        };
      });
      migrated.board.layoutVersion = 2;
    }

    if (
      legacyVersion < 15 &&
      migrated.flags.provedBellwetherResponsePreplanned &&
      !migrated.progress.unlockedLocations.includes("university_lab_annex")
    ) {
      migrated.progress.unlockedLocations.push("university_lab_annex");
    }

    if (
      legacyVersion < 16 &&
      migrated.flags.provedBellwetherEngineered &&
      !migrated.progress.unlockedLocations.includes("verdant_conservation_office")
    ) {
      migrated.progress.unlockedLocations.push("verdant_conservation_office");
    }

    if (
      legacyVersion < 17 &&
      migrated.flags.provedVerdantTestRange &&
      !migrated.progress.unlockedLocations.includes("crownline_data_center")
    ) {
      migrated.progress.unlockedLocations.push("crownline_data_center");
    }

    if (
      legacyVersion < 18 &&
      migrated.flags.provedCrownlineGovernanceModel &&
      !migrated.progress.unlockedLocations.includes("greyhaven_executive_airfield")
    ) {
      migrated.progress.unlockedLocations.push("greyhaven_executive_airfield");
    }

    if (
      legacyVersion < 19 &&
      migrated.flags.provedRedoubtEvacuation &&
      !migrated.progress.unlockedLocations.includes("blackwater_point")
    ) {
      migrated.progress.unlockedLocations.push("blackwater_point");
    }

    if (
      legacyVersion < 20 &&
      migrated.flags.provedOrpheusSupplyRoute &&
      !migrated.progress.unlockedLocations.includes("orpheus_sublevel_harbor")
    ) {
      migrated.progress.unlockedLocations.push("orpheus_sublevel_harbor");
    }

    if (
      legacyVersion < 21 &&
      migrated.flags.provedOrpheusCommandCenter &&
      !migrated.progress.unlockedLocations.includes("orpheus_first_circle")
    ) {
      migrated.progress.unlockedLocations.push("orpheus_first_circle");
    }

    if (legacyVersion < 23) {
      const columns = [2, 16, 30, 44, 58, 72, 86];
      const rowCount = Math.max(
        1,
        Math.ceil(migrated.evidence.pinned.length / columns.length),
      );
      const rowGap =
        rowCount === 1 ? 0 : Math.min(19, 73 / (rowCount - 1));

      migrated.evidence.pinned.forEach((evidenceId, index) => {
        migrated.board.cards[evidenceId] = {
          x: columns[index % columns.length],
          y: 7 + Math.floor(index / columns.length) * rowGap,
        };
      });
      migrated.board.layoutVersion = 3;
    }

    if (
      legacyVersion < 25 &&
      migrated.flags.provedAsterHouseTriggerCell &&
      !migrated.progress.unlockedLocations.includes("port_prosper_signal_exchange")
    ) {
      migrated.progress.unlockedLocations.push("port_prosper_signal_exchange");
      migrated.progress.chapter = Math.max(migrated.progress.chapter, 10);
    }

    return migrated;
  }
}
