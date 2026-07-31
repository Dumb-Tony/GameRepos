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

test("Parcel Six evidence proves Verdant was a controlled crisis laboratory", () => {
  let state = createInitialState();
  state.flags.provedBellwetherEngineered = true;
  state.completedDeductions.push(
    "bellwether_response_preplanned",
    "bellwether_engineered_contamination",
  );
  state = applyEffects(state, [
    { type: "unlockLocation", id: "verdant_conservation_office" },
    { type: "visitLocation", id: "verdant_conservation_office" },
    { type: "collectEvidence", id: "verdant_preserve_gate_pass" },
    { type: "collectEvidence", id: "verdant_freezer_transfer_log" },
    { type: "collectEvidence", id: "annex_sample_chromatogram" },
  ]);

  state = applyEffects(state, DIALOGUES.tess_arlen.nodes.truth.onEnter);
  const parcel = GAME_CONTENT.locations.verdant_conservation_office;
  for (const hotspotId of [
    "verdant_public_notice",
    "parcel_quarantine_cages",
    "parcel_injection_rig",
    "crownline_telemetry_cabinet",
  ]) {
    state = applyEffects(
      state,
      parcel.hotspots.find((hotspot) => hotspot.id === hotspotId).effects,
    );
  }

  for (const evidenceId of DEDUCTIONS.verdant_test_range.requiredEvidence) {
    state = pinEvidence(state, evidenceId);
  }
  state = connectEvidence(
    state,
    "verdant_public_brochure",
    "parcel_six_mortality_log",
    "contradiction",
  );
  state = connectEvidence(
    state,
    "verdant_preserve_gate_pass",
    "verdant_freezer_transfer_log",
    "confirmed",
  );
  state = connectEvidence(
    state,
    "parcel_injection_rig_photo",
    "crownline_telemetry_manifest",
    "confirmed",
  );

  const result = evaluateBoardDeductions(state, DEDUCTIONS);
  state = result.state;

  assert.deepEqual(
    result.newlyCompleted.map((deduction) => deduction.id),
    ["verdant_test_range"],
  );
  assert.equal(state.flags.provedVerdantTestRange, true);
  assert.equal(state.evidence.collected.includes("crownline_service_badge"), true);
  assert.equal(
    state.progress.unlockedLocations.includes("crownline_data_center"),
    true,
  );
});
