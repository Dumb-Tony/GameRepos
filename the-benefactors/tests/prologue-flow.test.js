import test from "node:test";
import assert from "node:assert/strict";

import {
  DEDUCTIONS,
  GAME_CONTENT,
} from "../src/content/game-content.js";
import {
  PROLOGUE_ENDING_BEATS,
  RECORDING_PUZZLE,
  STUDY_ALIGNMENT_PUZZLE,
} from "../src/content/prologue-content.js";
import { applyEffects } from "../src/engine/events.js";
import { createInitialState } from "../src/engine/game-state.js";
import { SaveSystem } from "../src/engine/save-system.js";
import {
  connectEvidence,
  evaluateBoardDeductions,
  pinEvidence,
} from "../src/systems/evidence-board/evidence-board.js";
import { evaluateStudyAlignment } from "../src/systems/puzzles/plan-alignment.js";
import { evaluateRecordingSequence } from "../src/systems/puzzles/recording-reconstruction.js";

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
  assert.equal(bookcase.route, "alignment");
  state.puzzles.study_plan_alignment.rotation =
    STUDY_ALIGNMENT_PUZZLE.solutionRotation;
  state.puzzles.study_plan_alignment = evaluateStudyAlignment(
    state.puzzles.study_plan_alignment,
    STUDY_ALIGNMENT_PUZZLE.solutionRotation,
  );
  state = applyEffects(state, STUDY_ALIGNMENT_PUZZLE.completionEffects);

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

test("reconstructs Vale's recording, proves the distress signal, and saves the ending", () => {
  let state = createInitialState();
  state.completedDeductions.push("witness_contradiction");
  state = applyEffects(state, [
    { type: "collectEvidence", id: "email_meridian" },
    { type: "collectEvidence", id: "invoice_northstar" },
    { type: "collectEvidence", id: "photo_west_wall" },
    { type: "collectEvidence", id: "vale_damaged_recording" },
  ]);

  state.puzzles.vale_recording_reconstruction.order = [
    ...RECORDING_PUZZLE.correctOrder,
  ];
  state.puzzles.vale_recording_reconstruction = evaluateRecordingSequence(
    state.puzzles.vale_recording_reconstruction,
    RECORDING_PUZZLE.correctOrder,
  );
  state = applyEffects(state, RECORDING_PUZZLE.completionEffects);

  assert.equal(state.flags.recordingReconstructed, true);
  assert.equal(state.flags.heardValeRecording, true);
  assert.equal(
    state.evidence.collected.includes("vale_reconstructed_message"),
    true,
  );

  for (const evidenceId of [
    "email_meridian",
    "invoice_northstar",
    "photo_west_wall",
    "vale_reconstructed_message",
  ]) {
    state = pinEvidence(state, evidenceId);
  }
  state = connectEvidence(
    state,
    "invoice_northstar",
    "photo_west_wall",
    "contradiction",
  );
  state = connectEvidence(
    state,
    "email_meridian",
    "vale_reconstructed_message",
    "confirmed",
  );

  const deductionResult = evaluateBoardDeductions(state, DEDUCTIONS);
  state = deductionResult.state;

  assert.deepEqual(
    deductionResult.newlyCompleted.map((deduction) => deduction.id),
    ["vale_distress_signal"],
  );
  assert.equal(state.flags.confirmedMeridianLead, true);
  assert.equal(state.flags.prologueEndingReady, true);
  assert.equal(state.evidence.collected.includes("northstar_address"), false);

  for (const beat of PROLOGUE_ENDING_BEATS) {
    state = applyEffects(state, beat.completionEffects || []);
  }
  state.progress.prologueEndingStep = PROLOGUE_ENDING_BEATS.length - 1;
  state.progress.currentScreen = "prologue-ending";

  assert.equal(state.progress.prologueComplete, true);
  assert.equal(state.flags.receivedGalaPhotograph, true);
  assert.equal(state.flags.northstarAddressIdentified, true);
  assert.equal(state.evidence.collected.includes("northstar_address"), true);
  assert.equal(
    state.evidence.collected.includes("meridian_gala_photograph"),
    true,
  );
  assert.equal(
    state.progress.unlockedLocations.includes("northstar_harrow"),
    true,
  );

  const saves = new SaveSystem(new MemoryStorage());
  saves.save(state, "prologue-complete");
  const restored = saves.load();

  assert.equal(restored.progress.prologueComplete, true);
  assert.equal(
    restored.evidence.collected.includes("meridian_gala_photograph"),
    true,
  );
});
