import test from "node:test";
import assert from "node:assert/strict";

import { GAME_CONTENT } from "../src/content/game-content.js";
import { applyEffects } from "../src/engine/events.js";
import { createInitialState } from "../src/engine/game-state.js";
import { SaveSystem } from "../src/engine/save-system.js";

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

test("opening leak unlocks leads and city hall yields permit evidence", () => {
  let state = createInitialState({ firstName: "Alex" });

  state = applyEffects(state, [
    { type: "setFlag", key: "openedAnonymousEmail", value: true },
    { type: "setFlag", key: "downloadedAttachments", value: true },
    { type: "collectEvidence", id: "email_meridian" },
    { type: "collectEvidence", id: "invoice_northstar" },
    { type: "unlockLocation", id: "city_hall" },
    { type: "unlockLocation", id: "mayor_street" },
  ]);

  assert.equal(state.flags.openedAnonymousEmail, true);
  assert.deepEqual(state.evidence.collected, [
    "email_meridian",
    "invoice_northstar",
  ]);
  assert.equal(state.progress.unlockedLocations.includes("city_hall"), true);
  assert.equal(state.progress.unlockedLocations.includes("mayor_street"), true);

  const terminal = GAME_CONTENT.locations.city_hall.hotspots.find(
    (hotspot) => hotspot.id === "records-terminal",
  );
  state = applyEffects(state, terminal.effects);

  assert.equal(state.flags.permitAcquired, true);
  assert.equal(state.evidence.collected.includes("permit_summary"), true);

  const saves = new SaveSystem(new MemoryStorage());
  saves.save(state, "permit-acquired");
  const restored = saves.load();

  assert.equal(restored.flags.permitAcquired, true);
  assert.equal(restored.evidence.collected.includes("permit_summary"), true);
});

test("study clues reveal the concealed stairway", () => {
  let state = createInitialState();
  state.flags.mayorMissing = true;
  state.progress.unlockedLocations.push("mayor_study");
  const study = GAME_CONTENT.locations.mayor_study;
  const frame = study.hotspots.find(
    (hotspot) => hotspot.id === "crooked-photograph",
  );
  const recorder = study.hotspots.find(
    (hotspot) => hotspot.id === "dictation-recorder",
  );
  const bookcase = study.hotspots.find(
    (hotspot) => hotspot.id === "western-bookcase",
  );

  state = applyEffects(state, frame.effects);
  state = applyEffects(state, recorder.effects);
  state = applyEffects(state, bookcase.effects);

  assert.equal(state.flags.foundStudyFloorplan, true);
  assert.equal(state.flags.foundValeRecording, true);
  assert.equal(state.flags.foundWallCavity, true);
  assert.equal(state.evidence.collected.includes("study_floorplan"), true);
  assert.equal(
    state.evidence.collected.includes("vale_damaged_recording"),
    true,
  );
  assert.equal(
    state.progress.unlockedLocations.includes("hidden_room"),
    true,
  );
});
