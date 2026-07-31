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

test("Crownline evidence proves Bellwether measured the transfer of public power", () => {
  let state = createInitialState();
  state.flags.provedVerdantTestRange = true;
  state.completedDeductions.push(
    "bellwether_engineered_contamination",
    "verdant_test_range",
  );
  state = applyEffects(state, [
    { type: "unlockLocation", id: "crownline_data_center" },
    { type: "visitLocation", id: "crownline_data_center" },
    { type: "collectEvidence", id: "crownline_service_badge" },
    { type: "collectEvidence", id: "crownline_telemetry_manifest" },
  ]);

  state = applyEffects(state, DIALOGUES.nia_kade.nodes.truth.onEnter);
  const crownline = GAME_CONTENT.locations.crownline_data_center;
  for (const hotspotId of [
    "crownline_lobby_directory",
    "crownline_operations_wall",
    "crownline_printer_cache",
    "crownline_records_cage",
    "crownline_freight_scheduler",
  ]) {
    state = applyEffects(
      state,
      crownline.hotspots.find((hotspot) => hotspot.id === hotspotId).effects,
    );
  }

  for (const evidenceId of DEDUCTIONS.crownline_governance_model.requiredEvidence) {
    state = pinEvidence(state, evidenceId);
  }
  state = connectEvidence(
    state,
    "crownline_public_continuity_brief",
    "bellwether_response_scorecard",
    "contradiction",
  );
  state = connectEvidence(
    state,
    "crownline_telemetry_manifest",
    "crownline_crisis_dashboard_photo",
    "confirmed",
  );
  state = connectEvidence(
    state,
    "meridian_priority_protocol",
    "redoubt_flight_sync_log",
    "financial",
  );

  const result = evaluateBoardDeductions(state, DEDUCTIONS);
  state = result.state;

  assert.deepEqual(
    result.newlyCompleted.map((deduction) => deduction.id),
    ["crownline_governance_model"],
  );
  assert.equal(state.flags.provedCrownlineGovernanceModel, true);
  assert.equal(
    state.evidence.collected.includes("executive_airfield_credential"),
    true,
  );
});
