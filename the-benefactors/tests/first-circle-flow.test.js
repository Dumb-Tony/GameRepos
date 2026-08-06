import test from "node:test";
import assert from "node:assert/strict";

import {
  DEDUCTIONS,
  GAME_CONTENT,
} from "../src/content/game-content.js";
import { applyEffects } from "../src/engine/events.js";
import { createInitialState } from "../src/engine/game-state.js";
import {
  connectEvidence,
  evaluateBoardDeductions,
  pinEvidence,
} from "../src/systems/evidence-board/evidence-board.js";

test("First Circle evidence proves the Benefactors select and finance crises", () => {
  let state = createInitialState();
  state.flags.provedOrpheusCommandCenter = true;
  state.completedDeductions.push(
    "orpheus_supply_route",
    "orpheus_command_center",
  );
  state = applyEffects(state, [
    { type: "unlockLocation", id: "orpheus_first_circle" },
    { type: "visitLocation", id: "orpheus_first_circle" },
    { type: "collectEvidence", id: "first_circle_invitation" },
    { type: "collectEvidence", id: "adrian_moss_statement" },
    { type: "collectEvidence", id: "orpheus_security_wall_photo" },
    { type: "collectEvidence", id: "benefactor_clinic_transfer_order" },
  ]);

  const assembly = GAME_CONTENT.locations.orpheus_first_circle;
  for (const hotspotId of [
    "first_circle_live_vote",
    "first_circle_seating_registry",
    "port_prosper_portfolio",
    "crisis_investment_escrow",
  ]) {
    state = applyEffects(
      state,
      assembly.hotspots.find((hotspot) => hotspot.id === hotspotId).effects,
    );
  }

  for (const evidenceId of DEDUCTIONS.benefactors_select_crises.requiredEvidence) {
    state = pinEvidence(state, evidenceId);
  }
  for (const connection of DEDUCTIONS.benefactors_select_crises.requiredConnections) {
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
    ["benefactors_select_crises"],
  );
  assert.equal(state.flags.provedBenefactorsSelectCrises, true);
  assert.equal(state.evidence.collected.includes("port_prosper_warning_file"), true);
  assert.equal(state.progress.chapter, 7);
  assert.equal(state.progress.officeState, 14);
});
