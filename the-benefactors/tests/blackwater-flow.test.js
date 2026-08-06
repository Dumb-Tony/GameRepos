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

test("Blackwater evidence exposes Orpheus's concealed supply route", () => {
  let state = createInitialState();
  state.flags.provedRedoubtEvacuation = true;
  state.completedDeductions.push(
    "crownline_governance_model",
    "redoubt_evacuation_network",
  );
  state = applyEffects(state, [
    { type: "unlockLocation", id: "blackwater_point" },
    { type: "visitLocation", id: "blackwater_point" },
    { type: "collectEvidence", id: "orpheus_service_chart" },
    { type: "collectEvidence", id: "redoubt_cargo_seal" },
    { type: "collectEvidence", id: "orpheus_route_strip" },
  ]);

  state = applyEffects(state, DIALOGUES.tamsin_pike.nodes.truth.onEnter);
  const pier = GAME_CONTENT.locations.blackwater_point;
  for (const hotspotId of [
    "blackwater_shadow_ledger",
    "orpheus_cold_container",
    "orpheus_service_launch",
    "blackwater_tide_locker",
  ]) {
    state = applyEffects(
      state,
      pier.hotspots.find((hotspot) => hotspot.id === hotspotId).effects,
    );
  }

  for (const evidenceId of DEDUCTIONS.orpheus_supply_route.requiredEvidence) {
    state = pinEvidence(state, evidenceId);
  }
  for (const connection of DEDUCTIONS.orpheus_supply_route.requiredConnections) {
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
    ["orpheus_supply_route"],
  );
  assert.equal(state.flags.provedOrpheusSupplyRoute, true);
  assert.equal(state.evidence.collected.includes("orpheus_maintenance_badge"), true);
  assert.equal(state.progress.chapter, 5);
  assert.equal(state.progress.officeState, 12);
});
