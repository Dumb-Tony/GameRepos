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

test("Hangar 4 evidence exposes Redoubt's evacuation network", () => {
  let state = createInitialState();
  state.flags.provedCrownlineGovernanceModel = true;
  state.completedDeductions.push(
    "verdant_test_range",
    "crownline_governance_model",
  );
  state = applyEffects(state, [
    { type: "unlockLocation", id: "greyhaven_executive_airfield" },
    { type: "visitLocation", id: "greyhaven_executive_airfield" },
    { type: "collectEvidence", id: "executive_airfield_credential" },
    { type: "collectEvidence", id: "redoubt_flight_sync_log" },
    { type: "collectEvidence", id: "meridian_priority_protocol" },
  ]);

  state = applyEffects(state, DIALOGUES.ellis_ward.nodes.truth.onEnter);
  const airfield = GAME_CONTENT.locations.greyhaven_executive_airfield;
  for (const hotspotId of [
    "hangar_dispatch_clipboard",
    "redoubt_boarding_line",
    "redoubt_cargo_scale",
    "orpheus_cockpit_pouch",
  ]) {
    state = applyEffects(
      state,
      airfield.hotspots.find((hotspot) => hotspot.id === hotspotId).effects,
    );
  }

  for (const evidenceId of DEDUCTIONS.redoubt_evacuation_network.requiredEvidence) {
    state = pinEvidence(state, evidenceId);
  }
  for (const connection of DEDUCTIONS.redoubt_evacuation_network.requiredConnections) {
    state = connectEvidence(
      state,
      connection.a,
      connection.b,
      connection.type,
    );
  }

  const result = evaluateBoardDeductions(state, DEDUCTIONS);
  state = result.state;

  assert.deepEqual(
    result.newlyCompleted.map((deduction) => deduction.id),
    ["redoubt_evacuation_network"],
  );
  assert.equal(state.flags.provedRedoubtEvacuation, true);
  assert.equal(state.evidence.collected.includes("orpheus_service_chart"), true);
  assert.equal(state.progress.chapter, 4);
  assert.equal(state.progress.officeState, 11);
});
