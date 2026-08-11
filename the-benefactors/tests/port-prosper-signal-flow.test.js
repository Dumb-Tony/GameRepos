import test from "node:test";
import assert from "node:assert/strict";

import { DEDUCTIONS, GAME_CONTENT } from "../src/content/game-content.js";
import { applyEffects } from "../src/engine/events.js";
import { createInitialState } from "../src/engine/game-state.js";
import {
  connectEvidence,
  evaluateBoardDeductions,
  pinEvidence,
} from "../src/systems/evidence-board/evidence-board.js";

test("Port Prosper survives and exposes Meridian's Sanctuary Chain", () => {
  let state = createInitialState();
  state.flags.provedAsterHouseTriggerCell = true;
  state.completedDeductions.push("aster_house_trigger_cell");
  state = applyEffects(state, [
    { type: "unlockLocation", id: "port_prosper_signal_exchange" },
    { type: "visitLocation", id: "port_prosper_signal_exchange" },
    { type: "collectEvidence", id: "port_prosper_countermeasure_packet" },
    { type: "collectEvidence", id: "port_prosper_trigger_call_sheet" },
    { type: "collectEvidence", id: "orpheus_service_chart" },
  ]);

  const exchange = GAME_CONTENT.locations.port_prosper_signal_exchange;
  for (const hotspotId of [
    "port_prosper_status_wall",
    "port_prosper_ghost_relay",
    "port_prosper_secure_phone",
    "port_prosper_burned_cabinet",
    "port_prosper_records_cart",
    "port_prosper_transfer_folder",
  ]) {
    const hotspot = exchange.hotspots.find((entry) => entry.id === hotspotId);
    assert.ok(hotspot, `${hotspotId} should exist`);
    state = applyEffects(state, hotspot.effects);
  }

  const deduction = DEDUCTIONS.sanctuary_chain_protocol;
  for (const evidenceId of deduction.requiredEvidence) {
    state = pinEvidence(state, evidenceId);
  }
  for (const connection of deduction.requiredConnections) {
    state = connectEvidence(state, connection.a, connection.b, connection.type);
  }

  const result = evaluateBoardDeductions(state, DEDUCTIONS);

  assert.deepEqual(
    result.newlyCompleted.map((entry) => entry.id),
    ["sanctuary_chain_protocol"],
  );
  assert.equal(result.state.flags.provedSanctuaryChain, true);
  assert.equal(
    result.state.evidence.collected.includes("vesper_key_dead_drop"),
    true,
  );
  assert.equal(result.state.progress.officeState, 18);
});
