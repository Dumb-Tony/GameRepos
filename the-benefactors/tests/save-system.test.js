import test from "node:test";
import assert from "node:assert/strict";

import {
  GAME_STATE_VERSION,
  createInitialState,
} from "../src/engine/game-state.js";
import {
  MANUAL_SAVE_SLOTS,
  SAVE_KEY,
  SaveSystem,
} from "../src/engine/save-system.js";

class MemoryStorage {
  values = new Map();

  getItem(key) {
    return this.values.has(key) ? this.values.get(key) : null;
  }

  setItem(key, value) {
    this.values.set(key, String(value));
  }

  removeItem(key) {
    this.values.delete(key);
  }
}

test("round-trips a versioned save", () => {
  const storage = new MemoryStorage();
  const saves = new SaveSystem(storage);
  const state = createInitialState({ firstName: "Inez" });
  state.flags.visitedNewsroom = true;

  saves.save(state, "test");
  const loaded = saves.load();

  assert.equal(saves.hasSave(), true);
  assert.equal(loaded.player.firstName, "Inez");
  assert.equal(loaded.flags.visitedNewsroom, true);
  assert.equal(loaded.meta.lastSaveReason, "test");
});

test("returns null for corrupted or future saves", () => {
  const storage = new MemoryStorage();
  const saves = new SaveSystem(storage);

  storage.setItem(SAVE_KEY, "{broken");
  assert.equal(saves.load(), null);

  storage.setItem(SAVE_KEY, JSON.stringify({ version: 999 }));
  assert.equal(saves.load(), null);
});

test("deletes an existing save", () => {
  const storage = new MemoryStorage();
  const saves = new SaveSystem(storage);
  saves.save(createInitialState());
  saves.deleteSave();

  assert.equal(saves.hasSave(), false);
});

test("stores, lists, loads, and deletes three manual case files", () => {
  const storage = new MemoryStorage();
  const saves = new SaveSystem(storage);
  const state = createInitialState({ firstName: "Nia" });
  state.flags.openedAnonymousEmail = true;

  saves.saveToSlot(2, state);
  const slots = saves.listSlots();

  assert.equal(slots.length, MANUAL_SAVE_SLOTS);
  assert.equal(slots[0].empty, true);
  assert.equal(slots[1].empty, false);
  assert.equal(slots[1].state.player.firstName, "Nia");
  assert.equal(saves.loadSlot(2).flags.openedAnonymousEmail, true);
  assert.equal(saves.hasSave(), true);

  saves.deleteSlot(2);
  assert.equal(saves.loadSlot(2), null);
});

test("rejects manual save slots outside the supported range", () => {
  const saves = new SaveSystem(new MemoryStorage());
  assert.throws(() => saves.loadSlot(0), RangeError);
  assert.throws(() => saves.saveToSlot(4, createInitialState()), RangeError);
});

test("migrates an older save with new progress defaults", () => {
  const storage = new MemoryStorage();
  const saves = new SaveSystem(storage);
  const legacy = createInitialState({ firstName: "Vale" });
  legacy.version = 1;
  delete legacy.progress.unlockedLocations;
  delete legacy.flags.downloadedAttachments;
  delete legacy.dialogue;
  storage.setItem(SAVE_KEY, JSON.stringify(legacy));

  const migrated = saves.load();

  assert.equal(migrated.version, GAME_STATE_VERSION);
  assert.deepEqual(migrated.progress.unlockedLocations, [
    "home_office",
    "ledger_newsroom",
  ]);
  assert.equal(migrated.flags.downloadedAttachments, false);
  assert.deepEqual(migrated.dialogue.completedDialogues, []);
  assert.equal(migrated.progress.opening.tutorialChoice, "skip");
  assert.equal(migrated.progress.opening.tutorialCompleted, true);
  assert.equal(migrated.progress.opening.cutsceneCompleted, true);
  assert.equal(migrated.flags.heardOpeningMessage, true);
  assert.equal(migrated.progress.prologueEndingStep, 0);
  assert.equal(migrated.progress.prologueComplete, false);
  assert.equal(migrated.puzzles.study_plan_alignment.completed, false);
});

test("normalizes a current-version save missing opening state", () => {
  const storage = new MemoryStorage();
  const saves = new SaveSystem(storage);
  const incomplete = createInitialState({ firstName: "Morgan" });
  delete incomplete.progress.opening;
  storage.setItem(SAVE_KEY, JSON.stringify(incomplete));

  const migrated = saves.load();

  assert.equal(migrated.version, GAME_STATE_VERSION);
  assert.equal(migrated.progress.opening.tutorialCompleted, false);
  assert.equal(migrated.progress.opening.cutsceneCompleted, false);
  assert.deepEqual(migrated.puzzles.vale_recording_reconstruction.order, [
    "vale_recording_rain",
    "vale_recording_clock",
    "vale_recording_freight",
  ]);
});

test("migrates an unlocked legacy stairway without replaying alignment", () => {
  const storage = new MemoryStorage();
  const saves = new SaveSystem(storage);
  const legacy = createInitialState();
  legacy.version = 6;
  legacy.flags.foundWallCavity = true;
  legacy.progress.unlockedLocations.push("hidden_room");
  delete legacy.puzzles;
  storage.setItem(SAVE_KEY, JSON.stringify(legacy));

  const migrated = saves.load();

  assert.equal(migrated.puzzles.study_plan_alignment.completed, true);
  assert.equal(migrated.puzzles.study_plan_alignment.rotation, 270);
  assert.equal(
    migrated.progress.unlockedLocations.includes("hidden_room"),
    true,
  );
});

test("migrates Milestone 5 saves with an empty persistent notebook", () => {
  const storage = new MemoryStorage();
  const saves = new SaveSystem(storage);
  const previous = createInitialState({ firstName: "Sam" });
  previous.version = 7;
  delete previous.journal;
  storage.setItem(SAVE_KEY, JSON.stringify(previous));

  const migrated = saves.load();

  assert.equal(migrated.version, GAME_STATE_VERSION);
  assert.deepEqual(migrated.journal.revealedHints, {});
  assert.equal(migrated.player.firstName, "Sam");
});

test("unlocks Harrow Street for completed Milestone 5 saves", () => {
  const storage = new MemoryStorage();
  const saves = new SaveSystem(storage);
  const previous = createInitialState({ firstName: "Rae" });
  previous.version = 8;
  previous.progress.prologueComplete = true;
  previous.progress.unlockedLocations =
    previous.progress.unlockedLocations.filter(
      (locationId) => locationId !== "northstar_harrow",
    );
  storage.setItem(SAVE_KEY, JSON.stringify(previous));

  const migrated = saves.load();

  assert.equal(migrated.version, GAME_STATE_VERSION);
  assert.equal(
    migrated.progress.unlockedLocations.includes("northstar_harrow"),
    true,
  );
});

test("unlocks Calder Square for completed Northstar saves", () => {
  const storage = new MemoryStorage();
  const saves = new SaveSystem(storage);
  const previous = createInitialState({ firstName: "Avery" });
  previous.version = 9;
  previous.flags.northstarRoutesToBrighterHorizon = true;
  previous.progress.unlockedLocations =
    previous.progress.unlockedLocations.filter(
      (locationId) => locationId !== "brighter_horizon_office",
    );
  storage.setItem(SAVE_KEY, JSON.stringify(previous));

  const migrated = saves.load();

  assert.equal(migrated.version, GAME_STATE_VERSION);
  assert.equal(
    migrated.progress.unlockedLocations.includes("brighter_horizon_office"),
    true,
  );
});

test("unlocks the Calder Grand for completed foundation saves", () => {
  const storage = new MemoryStorage();
  const saves = new SaveSystem(storage);
  const previous = createInitialState({ firstName: "Jordan" });
  previous.version = 10;
  previous.flags.brighterHorizonFundsNorthstar = true;
  previous.progress.unlockedLocations =
    previous.progress.unlockedLocations.filter(
      (locationId) => locationId !== "calder_grand_gala",
    );
  storage.setItem(SAVE_KEY, JSON.stringify(previous));

  const migrated = saves.load();

  assert.equal(migrated.version, GAME_STATE_VERSION);
  assert.equal(
    migrated.progress.unlockedLocations.includes("calder_grand_gala"),
    true,
  );
});

test("unlocks Saltmere Walk for completed gala saves", () => {
  const storage = new MemoryStorage();
  const saves = new SaveSystem(storage);
  const previous = createInitialState({ firstName: "Taylor" });
  previous.version = 11;
  previous.flags.uncoveredContractorNetwork = true;
  previous.progress.unlockedLocations =
    previous.progress.unlockedLocations.filter(
      (locationId) => locationId !== "saltmere_apartment",
    );
  storage.setItem(SAVE_KEY, JSON.stringify(previous));

  const migrated = saves.load();

  assert.equal(migrated.version, GAME_STATE_VERSION);
  assert.equal(
    migrated.progress.unlockedLocations.includes("saltmere_apartment"),
    true,
  );
});

test("unlocks Bellwether for completed continuity-network saves", () => {
  const storage = new MemoryStorage();
  const saves = new SaveSystem(storage);
  const previous = createInitialState({ firstName: "Morgan" });
  previous.version = 12;
  previous.flags.mappedContinuitySiteNetwork = true;
  previous.progress.unlockedLocations =
    previous.progress.unlockedLocations.filter(
      (locationId) => locationId !== "bellwether_relief_station",
    );
  storage.setItem(SAVE_KEY, JSON.stringify(previous));

  const migrated = saves.load();

  assert.equal(migrated.version, GAME_STATE_VERSION);
  assert.equal(
    migrated.progress.unlockedLocations.includes("bellwether_relief_station"),
    true,
  );
});

test("reflows legacy evidence cards onto the expanded seven-column board", () => {
  const storage = new MemoryStorage();
  const saves = new SaveSystem(storage);
  const previous = createInitialState({ firstName: "Casey" });
  previous.version = 13;
  previous.board.layoutVersion = 1;
  previous.evidence.pinned = Array.from(
    { length: 8 },
    (_, index) => `legacy-clue-${index}`,
  );
  previous.evidence.pinned.forEach((evidenceId) => {
    previous.board.cards[evidenceId] = { x: 4, y: 8 };
  });
  storage.setItem(SAVE_KEY, JSON.stringify(previous));

  const migrated = saves.load();

  assert.equal(migrated.board.layoutVersion, 2);
  assert.deepEqual(migrated.board.cards["legacy-clue-0"], { x: 2, y: 7 });
  assert.deepEqual(migrated.board.cards["legacy-clue-6"], { x: 86, y: 7 });
  assert.deepEqual(migrated.board.cards["legacy-clue-7"], { x: 2, y: 26 });
});

test("unlocks the university annex for completed Bellwether saves", () => {
  const storage = new MemoryStorage();
  const saves = new SaveSystem(storage);
  const previous = createInitialState({ firstName: "Robin" });
  previous.version = 14;
  previous.flags.provedBellwetherResponsePreplanned = true;
  previous.progress.unlockedLocations =
    previous.progress.unlockedLocations.filter(
      (locationId) => locationId !== "university_lab_annex",
    );
  storage.setItem(SAVE_KEY, JSON.stringify(previous));

  const migrated = saves.load();

  assert.equal(migrated.version, GAME_STATE_VERSION);
  assert.equal(
    migrated.progress.unlockedLocations.includes("university_lab_annex"),
    true,
  );
});

test("unlocks Verdant Parcel Six for completed river-annex saves", () => {
  const storage = new MemoryStorage();
  const saves = new SaveSystem(storage);
  const previous = createInitialState({ firstName: "Robin" });
  previous.version = 15;
  previous.flags.provedBellwetherEngineered = true;
  previous.progress.unlockedLocations =
    previous.progress.unlockedLocations.filter(
      (locationId) => locationId !== "verdant_conservation_office",
    );
  storage.setItem(SAVE_KEY, JSON.stringify(previous));

  const migrated = saves.load();

  assert.equal(migrated.version, GAME_STATE_VERSION);
  assert.equal(
    migrated.progress.unlockedLocations.includes("verdant_conservation_office"),
    true,
  );
});

test("unlocks Crownline for completed Verdant saves", () => {
  const storage = new MemoryStorage();
  const saves = new SaveSystem(storage);
  const previous = createInitialState({ firstName: "Robin" });
  previous.version = 16;
  previous.flags.provedVerdantTestRange = true;
  previous.progress.unlockedLocations =
    previous.progress.unlockedLocations.filter(
      (locationId) => locationId !== "crownline_data_center",
    );
  storage.setItem(SAVE_KEY, JSON.stringify(previous));

  const migrated = saves.load();

  assert.equal(migrated.version, GAME_STATE_VERSION);
  assert.equal(
    migrated.progress.unlockedLocations.includes("crownline_data_center"),
    true,
  );
});

test("unlocks the executive airfield for completed Crownline saves", () => {
  const storage = new MemoryStorage();
  const saves = new SaveSystem(storage);
  const previous = createInitialState({ firstName: "Robin" });
  previous.version = 17;
  previous.flags.provedCrownlineGovernanceModel = true;
  previous.progress.unlockedLocations =
    previous.progress.unlockedLocations.filter(
      (locationId) => locationId !== "greyhaven_executive_airfield",
    );
  storage.setItem(SAVE_KEY, JSON.stringify(previous));

  const migrated = saves.load();

  assert.equal(migrated.version, GAME_STATE_VERSION);
  assert.equal(
    migrated.progress.unlockedLocations.includes("greyhaven_executive_airfield"),
    true,
  );
});

test("unlocks Blackwater Point for completed Hangar 4 saves", () => {
  const storage = new MemoryStorage();
  const saves = new SaveSystem(storage);
  const previous = createInitialState({ firstName: "Robin" });
  previous.version = 18;
  previous.flags.provedRedoubtEvacuation = true;
  previous.progress.unlockedLocations =
    previous.progress.unlockedLocations.filter(
      (locationId) => locationId !== "blackwater_point",
    );
  storage.setItem(SAVE_KEY, JSON.stringify(previous));

  const migrated = saves.load();

  assert.equal(migrated.version, GAME_STATE_VERSION);
  assert.equal(
    migrated.progress.unlockedLocations.includes("blackwater_point"),
    true,
  );
});

test("unlocks the Orpheus harbor for completed Blackwater saves", () => {
  const storage = new MemoryStorage();
  const saves = new SaveSystem(storage);
  const previous = createInitialState({ firstName: "Robin" });
  previous.version = 19;
  previous.flags.provedOrpheusSupplyRoute = true;
  previous.progress.unlockedLocations =
    previous.progress.unlockedLocations.filter(
      (locationId) => locationId !== "orpheus_sublevel_harbor",
    );
  storage.setItem(SAVE_KEY, JSON.stringify(previous));

  const migrated = saves.load();

  assert.equal(migrated.version, GAME_STATE_VERSION);
  assert.equal(
    migrated.progress.unlockedLocations.includes("orpheus_sublevel_harbor"),
    true,
  );
});
