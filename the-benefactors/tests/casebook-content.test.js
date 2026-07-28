import test from "node:test";
import assert from "node:assert/strict";

import {
  CASEBOOK_PROGRESS,
  CASEBOOK_STAGES,
} from "../src/content/casebook-content.js";
import { evaluateCondition } from "../src/engine/conditions.js";
import { createInitialState } from "../src/engine/game-state.js";

function activeStage(state) {
  return CASEBOOK_STAGES.find((stage) =>
    evaluateCondition(stage.activeWhen, state),
  );
}

test("every casebook stage has a three-level hint path", () => {
  assert.equal(CASEBOOK_STAGES.length >= 8, true);
  for (const stage of CASEBOOK_STAGES) {
    assert.equal(stage.hints.length, 3, stage.id);
    assert.equal(stage.hints.every(Boolean), true, stage.id);
  }
  assert.equal(CASEBOOK_PROGRESS.length, 7);
});

test("casebook objective advances with investigation state", () => {
  const state = createInitialState();
  assert.equal(activeStage(state).id, "opening_lead");

  state.flags.downloadedAttachments = true;
  assert.equal(activeStage(state).id, "city_records");

  state.flags.permitAcquired = true;
  state.flags.photographedWestWall = true;
  state.evidence.collected.push("june_statement");
  assert.equal(activeStage(state).id, "prove_missing_addition");

  state.completedDeductions.push("deduction_missing_addition");
  assert.equal(activeStage(state).id, "study_search");

  state.flags.foundWallCavity = true;
  state.flags.recordingReconstructed = true;
  state.flags.prologueEndingReady = true;
  state.progress.prologueComplete = true;
  assert.equal(activeStage(state).id, "northstar");
});
