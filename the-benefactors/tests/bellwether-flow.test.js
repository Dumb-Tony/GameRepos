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

test("Bellwether evidence proves the relief operation was staged in advance", () => {
  let state = createInitialState();
  state.flags.mappedContinuitySiteNetwork = true;
  state.completedDeductions.push("continuity_site_network");
  state = applyEffects(state, [
    { type: "unlockLocation", id: "bellwether_relief_station" },
    { type: "visitLocation", id: "bellwether_relief_station" },
    { type: "collectEvidence", id: "program_advance_index" },
    { type: "collectEvidence", id: "bellwether_water_clipping" },
  ]);

  state = applyEffects(state, DIALOGUES.rina_mercer.nodes.timeline.onEnter);
  const station = GAME_CONTENT.locations.bellwether_relief_station;
  for (const hotspotId of [
    "bellwether_public_tap",
    "relief_crate_stack",
    "deepwell_pump_hatch",
    "community_noticeboard",
  ]) {
    state = applyEffects(
      state,
      station.hotspots.find((hotspot) => hotspot.id === hotspotId).effects,
    );
  }

  for (const evidenceId of [
    "program_advance_index",
    "bellwether_water_clipping",
    "rina_mercer_statement",
    "bellwether_tap_sample",
    "relief_crate_photo",
    "deepwell_pump_service_log",
  ]) {
    state = pinEvidence(state, evidenceId);
  }
  state = connectEvidence(
    state,
    "bellwether_water_clipping",
    "relief_crate_photo",
    "contradiction",
  );
  state = connectEvidence(
    state,
    "program_advance_index",
    "deepwell_pump_service_log",
    "financial",
  );
  state = connectEvidence(
    state,
    "rina_mercer_statement",
    "bellwether_tap_sample",
    "confirmed",
  );

  const result = evaluateBoardDeductions(state, DEDUCTIONS);
  state = result.state;

  assert.deepEqual(
    result.newlyCompleted.map((deduction) => deduction.id),
    ["bellwether_response_preplanned"],
  );
  assert.equal(state.flags.provedBellwetherResponsePreplanned, true);
  assert.equal(state.evidence.collected.includes("university_lab_referral"), true);
  assert.equal(
    state.progress.unlockedLocations.includes("university_lab_annex"),
    true,
  );
});
