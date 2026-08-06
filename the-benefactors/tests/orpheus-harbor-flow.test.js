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

test("Orpheus harbor evidence exposes the Benefactors' command center", () => {
  let state = createInitialState();
  state.flags.provedOrpheusSupplyRoute = true;
  state.completedDeductions.push(
    "redoubt_evacuation_network",
    "orpheus_supply_route",
  );
  state = applyEffects(state, [
    { type: "unlockLocation", id: "orpheus_sublevel_harbor" },
    { type: "visitLocation", id: "orpheus_sublevel_harbor" },
    { type: "collectEvidence", id: "orpheus_maintenance_badge" },
    { type: "collectEvidence", id: "orpheus_cold_chain_manifest" },
    { type: "collectEvidence", id: "island_service_launch_photo" },
    { type: "collectEvidence", id: "blackwater_tide_window" },
  ]);

  state = applyEffects(state, DIALOGUES.adrian_moss.nodes.truth.onEnter);
  const harbor = GAME_CONTENT.locations.orpheus_sublevel_harbor;
  for (const hotspotId of [
    "orpheus_arrival_desk",
    "benefactor_clinic_case",
    "orpheus_security_console",
    "orpheus_freight_elevator",
  ]) {
    state = applyEffects(
      state,
      harbor.hotspots.find((hotspot) => hotspot.id === hotspotId).effects,
    );
  }

  for (const evidenceId of DEDUCTIONS.orpheus_command_center.requiredEvidence) {
    state = pinEvidence(state, evidenceId);
  }
  for (const connection of DEDUCTIONS.orpheus_command_center.requiredConnections) {
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
    ["orpheus_command_center"],
  );
  assert.equal(state.flags.provedOrpheusCommandCenter, true);
  assert.equal(state.evidence.collected.includes("first_circle_invitation"), true);
  assert.equal(state.progress.chapter, 6);
  assert.equal(state.progress.officeState, 13);
});
