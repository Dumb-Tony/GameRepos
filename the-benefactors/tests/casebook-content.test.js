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
  assert.equal(CASEBOOK_PROGRESS.length, 19);
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

  state.completedDeductions.push("witness_contradiction");
  assert.equal(activeStage(state).id, "study_search");

  state.flags.foundWallCavity = true;
  state.flags.recordingReconstructed = true;
  state.flags.prologueEndingReady = true;
  state.progress.prologueComplete = true;
  assert.equal(activeStage(state).id, "visit_northstar");

  state.locationVisits.northstar_harrow = 1;
  assert.equal(activeStage(state).id, "investigate_northstar");

  state.flags.photographedHarrowDirectory = true;
  state.flags.questionedHarrowManager = true;
  state.flags.foundNorthstarCourierManifest = true;
  assert.equal(activeStage(state).id, "connect_northstar");

  state.flags.northstarRoutesToBrighterHorizon = true;
  assert.equal(activeStage(state).id, "visit_foundation");

  state.locationVisits.brighter_horizon_office = 1;
  assert.equal(activeStage(state).id, "investigate_foundation");

  state.flags.photographedFoundationDonorWall = true;
  state.flags.questionedFoundationReceptionist = true;
  state.flags.foundFoundationVisitorLog = true;
  state.flags.foundFoundationDisbursementReport = true;
  assert.equal(activeStage(state).id, "connect_foundation");

  state.flags.brighterHorizonFundsNorthstar = true;
  assert.equal(activeStage(state).id, "attend_calder_gala");

  state.locationVisits.calder_grand_gala = 1;
  assert.equal(activeStage(state).id, "identify_silas_wren");

  state.flags.identifiedSilasWren = true;
  state.flags.photographedGalaSeatingPlan = true;
  state.flags.questionedCassianRook = true;
  state.evidence.collected.push("gala_terrace_photo");
  assert.equal(activeStage(state).id, "enter_service_corridor");

  state.locationVisits.calder_grand_service_corridor = 1;
  assert.equal(activeStage(state).id, "investigate_room_b");

  state.flags.photographedContractorRoster = true;
  state.flags.recordedRoomBConversation = true;
  state.flags.foundAccountantForwardingSlip = true;
  assert.equal(activeStage(state).id, "connect_contractor_network");

  state.flags.uncoveredContractorNetwork = true;
  assert.equal(activeStage(state).id, "accountant_lead");
});
