import test from "node:test";
import assert from "node:assert/strict";

import {
  DEDUCTIONS,
  DIALOGUES,
  GAME_CONTENT,
} from "../src/content/game-content.js";
import { applyEffects } from "../src/engine/events.js";
import { createInitialState } from "../src/engine/game-state.js";
import {
  connectEvidence,
  evaluateBoardDeductions,
  pinEvidence,
} from "../src/systems/evidence-board/evidence-board.js";

test("Harrow Street evidence exposes Northstar's Brighter Horizon mail route", () => {
  let state = createInitialState();
  state.progress.prologueComplete = true;
  state.completedDeductions.push("vale_distress_signal");
  state = applyEffects(state, [
    { type: "unlockLocation", id: "northstar_harrow" },
    { type: "visitLocation", id: "northstar_harrow" },
    { type: "collectEvidence", id: "northstar_address" },
    { type: "collectEvidence", id: "meridian_gala_photograph" },
  ]);

  const location = GAME_CONTENT.locations.northstar_harrow;
  const directory = location.hotspots.find(
    (hotspot) => hotspot.id === "harrow_directory",
  );
  const manifest = location.hotspots.find(
    (hotspot) => hotspot.id === "northstar_mail_cart",
  );
  state = applyEffects(state, directory.effects);
  state = applyEffects(state, manifest.effects);
  state = applyEffects(state, DIALOGUES.harrow_manager.nodes.northstar.onEnter);

  assert.equal(state.locationVisits.northstar_harrow, 1);
  assert.equal(state.flags.photographedHarrowDirectory, true);
  assert.equal(state.flags.questionedHarrowManager, true);
  assert.equal(state.flags.foundNorthstarCourierManifest, true);
  assert.equal(state.evidence.collected.includes("harrow_directory_photo"), true);
  assert.equal(state.evidence.collected.includes("harrow_manager_statement"), true);
  assert.equal(state.evidence.collected.includes("northstar_courier_manifest"), true);

  for (const evidenceId of [
    "northstar_address",
    "harrow_directory_photo",
    "northstar_courier_manifest",
    "meridian_gala_photograph",
  ]) {
    state = pinEvidence(state, evidenceId);
  }
  state = connectEvidence(
    state,
    "northstar_address",
    "harrow_directory_photo",
    "contradiction",
  );
  state = connectEvidence(
    state,
    "northstar_courier_manifest",
    "meridian_gala_photograph",
    "confirmed",
  );

  const result = evaluateBoardDeductions(state, DEDUCTIONS);
  state = result.state;

  assert.deepEqual(
    result.newlyCompleted.map((deduction) => deduction.id),
    ["northstar_mail_route"],
  );
  assert.equal(state.flags.northstarRoutesToBrighterHorizon, true);
  assert.equal(state.progress.officeState, 3);
  assert.equal(
    state.evidence.collected.includes("brighter_horizon_connection"),
    true,
  );
});
