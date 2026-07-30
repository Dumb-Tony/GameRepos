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

test("the river-annex evidence proves Bellwether was engineered", () => {
  let state = createInitialState();
  state.flags.provedBellwetherResponsePreplanned = true;
  state.completedDeductions.push(
    "continuity_site_network",
    "bellwether_response_preplanned",
  );
  state = applyEffects(state, [
    { type: "unlockLocation", id: "university_lab_annex" },
    { type: "visitLocation", id: "university_lab_annex" },
    { type: "collectEvidence", id: "bellwether_tap_sample" },
    { type: "collectEvidence", id: "university_lab_rejection" },
    { type: "collectEvidence", id: "university_lab_referral" },
  ]);

  state = applyEffects(state, DIALOGUES.elian_voss.nodes.analysis.onEnter);
  const annex = GAME_CONTENT.locations.university_lab_annex;
  for (const hotspotId of [
    "annex_sample_freezer",
    "annex_reel_recorder",
    "annex_watershed_map",
    "annex_transfer_clipboard",
  ]) {
    state = applyEffects(
      state,
      annex.hotspots.find((hotspot) => hotspot.id === hotspotId).effects,
    );
  }

  for (const evidenceId of [
    "bellwether_tap_sample",
    "university_lab_rejection",
    "annex_sample_chromatogram",
    "meridian_funding_voicemail",
    "watershed_injection_map",
    "verdant_freezer_transfer_log",
  ]) {
    state = pinEvidence(state, evidenceId);
  }
  state = connectEvidence(
    state,
    "bellwether_tap_sample",
    "annex_sample_chromatogram",
    "confirmed",
  );
  state = connectEvidence(
    state,
    "university_lab_rejection",
    "meridian_funding_voicemail",
    "coverup",
  );
  state = connectEvidence(
    state,
    "watershed_injection_map",
    "verdant_freezer_transfer_log",
    "confirmed",
  );

  const result = evaluateBoardDeductions(state, DEDUCTIONS);
  state = result.state;

  assert.deepEqual(
    result.newlyCompleted.map((deduction) => deduction.id),
    ["bellwether_engineered_contamination"],
  );
  assert.equal(state.flags.provedBellwetherEngineered, true);
  assert.equal(state.evidence.collected.includes("verdant_preserve_gate_pass"), true);
  assert.equal(
    state.progress.unlockedLocations.includes("verdant_conservation_office"),
    true,
  );
});
