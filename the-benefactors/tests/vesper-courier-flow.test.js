import test from "node:test";
import assert from "node:assert/strict";

import { DEDUCTIONS, DIALOGUES, GAME_CONTENT } from "../src/content/game-content.js";
import { applyEffects } from "../src/engine/events.js";
import { createInitialState } from "../src/engine/game-state.js";
import {
  connectEvidence,
  evaluateBoardDeductions,
  pinEvidence,
} from "../src/systems/evidence-board/evidence-board.js";

test("the eastern-terminal surveillance chain exposes Vesper's Shepherd archive", () => {
  let state = createInitialState();
  state.flags.provedSanctuaryChain = true;
  state.completedDeductions.push("sanctuary_chain_protocol");
  state = applyEffects(state, [
    { type: "unlockLocation", id: "port_prosper_eastern_terminal" },
    { type: "visitLocation", id: "port_prosper_eastern_terminal" },
    { type: "collectEvidence", id: "vesper_key_dead_drop" },
    { type: "collectEvidence", id: "sanctuary_chain_chart" },
    { type: "collectEvidence", id: "archipelago_transfer_order" },
  ]);

  const terminal = GAME_CONTENT.locations.port_prosper_eastern_terminal;
  assert.match(terminal.sceneArt, /port-prosper-eastern-terminal\.webp$/);

  const departure = terminal.hotspots.find(
    (entry) => entry.id === "eastern_terminal_departure_board",
  );
  state = applyEffects(state, departure.effects);

  const ayaStatement = DIALOGUES.terminal_dispatcher.nodes.courier.onEnter;
  state = applyEffects(state, ayaStatement);

  for (const hotspotId of [
    "eastern_terminal_bag_tag",
    "eastern_terminal_security_mirror",
    "eastern_terminal_locker_44",
    "eastern_terminal_tide_card",
    "eastern_terminal_shepherd_index",
  ]) {
    const hotspot = terminal.hotspots.find((entry) => entry.id === hotspotId);
    assert.ok(hotspot, `${hotspotId} should exist`);
    state = applyEffects(state, hotspot.effects);
  }

  const deduction = DEDUCTIONS.vesper_forecast_transfer;
  for (const evidenceId of deduction.requiredEvidence) {
    assert.equal(
      state.evidence.collected.includes(evidenceId),
      true,
      `${evidenceId} should be collected before the board deduction`,
    );
    state = pinEvidence(state, evidenceId);
  }
  for (const connection of deduction.requiredConnections) {
    state = connectEvidence(state, connection.a, connection.b, connection.type);
  }

  const result = evaluateBoardDeductions(state, DEDUCTIONS);
  assert.deepEqual(
    result.newlyCompleted.map((entry) => entry.id),
    ["vesper_forecast_transfer"],
  );
  assert.equal(result.state.flags.provedVesperTransferRoute, true);
  assert.equal(result.state.evidence.collected.includes("vesper_approach_file"), true);
  assert.equal(result.state.progress.chapter, 12);
  assert.equal(result.state.progress.officeState, 19);
});
