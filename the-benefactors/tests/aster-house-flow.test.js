import test from "node:test";
import assert from "node:assert/strict";

import { DEDUCTIONS, GAME_CONTENT } from "../src/content/game-content.js";
import { applyEffects } from "../src/engine/events.js";
import { createInitialState } from "../src/engine/game-state.js";
import {
  advancePortProsperAftermath,
  applyPortProsperResponse,
} from "../src/systems/decisions/port-prosper-response.js";
import {
  connectEvidence,
  evaluateBoardDeductions,
  pinEvidence,
} from "../src/systems/evidence-board/evidence-board.js";

test("Aster House evidence exposes the local Port Prosper trigger cell", () => {
  let state = createInitialState();
  state.flags.provedBenefactorsSelectCrises = true;
  state.completedDeductions.push("benefactors_select_crises");
  state = applyEffects(state, [
    { type: "collectEvidence", id: "first_circle_vote_recording" },
    { type: "collectEvidence", id: "port_prosper_conversion_portfolio" },
    { type: "collectEvidence", id: "crisis_investment_escrow" },
  ]);
  state = applyPortProsperResponse(state, "warn");
  for (let step = 0; step < 3; step += 1) {
    state = advancePortProsperAftermath(state);
  }
  state = applyEffects(state, [{ type: "visitLocation", id: "aster_house" }]);

  const asterHouse = GAME_CONTENT.locations.aster_house;
  for (const hotspotId of [
    "aster_operations_board",
    "aster_switchboard",
    "aster_archive_cabinet",
    "aster_operations_table",
  ]) {
    const hotspot = asterHouse.hotspots.find((entry) => entry.id === hotspotId);
    assert.ok(hotspot, `${hotspotId} should exist`);
    state = applyEffects(state, hotspot.effects);
  }

  const deduction = DEDUCTIONS.aster_house_trigger_cell;
  for (const evidenceId of deduction.requiredEvidence) {
    state = pinEvidence(state, evidenceId);
  }
  for (const connection of deduction.requiredConnections) {
    state = connectEvidence(state, connection.a, connection.b, connection.type);
  }

  const result = evaluateBoardDeductions(state, DEDUCTIONS);

  assert.deepEqual(
    result.newlyCompleted.map((entry) => entry.id),
    ["aster_house_trigger_cell"],
  );
  assert.equal(result.state.flags.provedAsterHouseTriggerCell, true);
  assert.equal(
    result.state.evidence.collected.includes("port_prosper_countermeasure_packet"),
    true,
  );
  assert.equal(result.state.progress.officeState, 17);
  assert.equal(result.state.progress.chapter, 10);
  assert.equal(
    result.state.progress.unlockedLocations.includes("port_prosper_signal_exchange"),
    true,
  );
});
