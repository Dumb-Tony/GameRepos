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

test("Calder Grand infiltration exposes Brighter Horizon's contractor network", () => {
  let state = createInitialState();
  state.progress.prologueComplete = true;
  state.flags.brighterHorizonFundsNorthstar = true;
  state.completedDeductions.push(
    "vale_distress_signal",
    "northstar_mail_route",
    "foundation_funded_northstar",
  );
  state = applyEffects(state, [
    { type: "unlockLocation", id: "calder_grand_gala" },
    { type: "visitLocation", id: "calder_grand_gala" },
    { type: "collectEvidence", id: "calder_gala_invitation" },
    { type: "collectEvidence", id: "meridian_gala_photograph" },
    { type: "collectEvidence", id: "meridian_guest_list_header" },
    { type: "collectEvidence", id: "foundation_disbursement_report" },
  ]);

  const gala = GAME_CONTENT.locations.calder_grand_gala;
  const seatingPlan = gala.hotspots.find(
    (hotspot) => hotspot.id === "gala_seating_plan",
  );
  const terrace = gala.hotspots.find(
    (hotspot) => hotspot.id === "silas_wren_terrace",
  );
  const pass = gala.hotspots.find(
    (hotspot) => hotspot.id === "dropped_service_pass",
  );

  state = applyEffects(state, DIALOGUES.gala_attendant.nodes.wren.onEnter);
  state = applyEffects(state, DIALOGUES.cassian_rook_gala.nodes.northstar.onEnter);
  state = applyEffects(state, seatingPlan.effects);
  state = applyEffects(state, terrace.effects);
  state = applyEffects(state, pass.effects);

  assert.equal(state.flags.identifiedSilasWren, true);
  assert.equal(state.flags.questionedCassianRook, true);
  assert.equal(state.flags.foundGalaServicePass, true);
  assert.equal(
    state.progress.unlockedLocations.includes("calder_grand_service_corridor"),
    true,
  );

  state = applyEffects(state, [
    { type: "visitLocation", id: "calder_grand_service_corridor" },
  ]);
  const corridor = GAME_CONTENT.locations.calder_grand_service_corridor;
  for (const hotspotId of [
    "contractor_roster",
    "room_b_door",
    "service_security_desk",
  ]) {
    const hotspot = corridor.hotspots.find((item) => item.id === hotspotId);
    state = applyEffects(state, hotspot.effects);
  }

  for (const evidenceId of [
    "foundation_disbursement_report",
    "gala_contractor_roster",
    "meridian_guest_list_header",
    "room_b_conversation",
  ]) {
    state = pinEvidence(state, evidenceId);
  }
  state = connectEvidence(
    state,
    "foundation_disbursement_report",
    "gala_contractor_roster",
    "financial",
  );
  state = connectEvidence(
    state,
    "meridian_guest_list_header",
    "room_b_conversation",
    "confirmed",
  );

  const result = evaluateBoardDeductions(state, DEDUCTIONS);
  state = result.state;

  assert.deepEqual(
    result.newlyCompleted.map((deduction) => deduction.id),
    ["room_b_contractor_network"],
  );
  assert.equal(state.flags.uncoveredContractorNetwork, true);
  assert.equal(state.evidence.collected.includes("accountant_forwarding_slip"), true);
});
