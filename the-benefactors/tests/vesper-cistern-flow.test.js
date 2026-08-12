import test from "node:test";
import assert from "node:assert/strict";

import { DEDUCTIONS, DIALOGUES, GAME_CONTENT } from "../src/content/game-content.js";
import { applyEffects } from "../src/engine/events.js";
import { createInitialState } from "../src/engine/game-state.js";
import {
  connectEvidence,
  evaluateBoardDeductions,
  pinEvidence,
} from "../src/systems/evidence-board/evidence-board.js";

test("the Vesper cistern investigation proves Shepherd deliberately suppresses warnings", () => {
  let state = createInitialState();
  state.flags.provedVesperTransferRoute = true;
  state.completedDeductions.push("vesper_forecast_transfer");
  state = applyEffects(state, [
    { type: "unlockLocation", id: "vesper_western_cistern" },
    { type: "visitLocation", id: "vesper_western_cistern" },
    { type: "collectEvidence", id: "vesper_approach_file" },
    { type: "collectEvidence", id: "vesper_tide_cipher" },
    { type: "collectEvidence", id: "locker_44_courier_packet" },
    { type: "collectEvidence", id: "shepherd_forecast_index" },
    { type: "collectEvidence", id: "newsroom_cipher_clone" },
  ]);

  const cistern = GAME_CONTENT.locations.vesper_western_cistern;
  assert.match(cistern.sceneArt, /vesper-western-cistern\.webp$/);

  for (const hotspotId of [
    "vesper_manifest_case",
    "vesper_service_skiff",
    "vesper_cistern_reader",
  ]) {
    const hotspot = cistern.hotspots.find((entry) => entry.id === hotspotId);
    assert.ok(hotspot, `${hotspotId} should exist`);
    state = applyEffects(state, hotspot.effects);
  }

  state = applyEffects(
    state,
    DIALOGUES.vesper_archive_controller.nodes.truth.onEnter,
  );

  for (const hotspotId of [
    "vesper_disclosure_buffer",
    "vesper_cliff_camera",
  ]) {
    const hotspot = cistern.hotspots.find((entry) => entry.id === hotspotId);
    assert.ok(hotspot, `${hotspotId} should exist`);
    state = applyEffects(state, hotspot.effects);
  }

  const deduction = DEDUCTIONS.vesper_disclosure_control;
  for (const evidenceId of deduction.requiredEvidence) {
    assert.equal(state.evidence.collected.includes(evidenceId), true, evidenceId);
    state = pinEvidence(state, evidenceId);
  }
  for (const connection of deduction.requiredConnections) {
    state = connectEvidence(state, connection.a, connection.b, connection.type);
  }

  const result = evaluateBoardDeductions(state, DEDUCTIONS);
  assert.deepEqual(
    result.newlyCompleted.map((entry) => entry.id),
    ["vesper_disclosure_control"],
  );
  assert.equal(result.state.flags.provedVesperWithholdsWarnings, true);
  assert.equal(result.state.evidence.collected.includes("forecast_hall_access_plan"), true);
  assert.equal(result.state.progress.chapter, 14);
  assert.equal(result.state.progress.officeState, 20);
});
