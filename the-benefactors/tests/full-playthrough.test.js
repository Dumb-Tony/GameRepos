import test from "node:test";
import assert from "node:assert/strict";

import { DEDUCTIONS } from "../src/content/game-content.js";
import { CHAPTER_INTERLUDES } from "../src/content/cinematic-content.js";
import { applyEffects } from "../src/engine/events.js";
import { createInitialState } from "../src/engine/game-state.js";
import { SaveSystem } from "../src/engine/save-system.js";
import {
  advancePortProsperAftermath,
  applyPortProsperResponse,
} from "../src/systems/decisions/port-prosper-response.js";
import {
  connectEvidence,
  evaluateBoardDeductions,
  pinEvidence,
  saveEvidenceNote,
} from "../src/systems/evidence-board/evidence-board.js";
import {
  advanceInterlude,
  beginInterlude,
} from "../src/systems/cinematics/chapter-interludes.js";

class MemoryStorage {
  values = new Map();

  getItem(key) {
    return this.values.has(key) ? this.values.get(key) : null;
  }

  setItem(key, value) {
    this.values.set(key, String(value));
  }

  removeItem(key) {
    this.values.delete(key);
  }
}

test("the complete authored investigation can progress from the leak through the Sanctuary Chain", () => {
  const deductionOrder = Object.keys(DEDUCTIONS);
  const saves = new SaveSystem(new MemoryStorage());
  let state = createInitialState({ firstName: "Alex" });

  for (const deductionId of deductionOrder.filter(
    (id) => !["aster_house_trigger_cell", "sanctuary_chain_protocol"].includes(id),
  )) {
    const deduction = DEDUCTIONS[deductionId];

    state = applyEffects(
      state,
      deduction.requiredEvidence.map((id) => ({ type: "collectEvidence", id })),
    );
    for (const evidenceId of deduction.requiredEvidence) {
      state = pinEvidence(state, evidenceId);
    }
    for (const connection of deduction.requiredConnections) {
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
      result.newlyCompleted.map((completed) => completed.id),
      [deductionId],
      `${deductionId} should be the only newly completed deduction`,
    );

    saves.save(state, `playthrough-${deductionId}`);
    state = saves.load();
    assert.equal(
      state.completedDeductions.includes(deductionId),
      true,
      `${deductionId} should survive an autosave round trip`,
    );
  }

  state = saveEvidenceNote(
    state,
    "invoice_northstar",
    "The first false invoice remains the spine of the whole case.",
  );

  state = applyPortProsperResponse(state, "warn");
  for (let step = 0; step < 3; step += 1) {
    state = advancePortProsperAftermath(state);
  }

  const asterDeduction = DEDUCTIONS.aster_house_trigger_cell;
  state = applyEffects(
    state,
    asterDeduction.requiredEvidence.map((id) => ({ type: "collectEvidence", id })),
  );
  for (const evidenceId of asterDeduction.requiredEvidence) {
    state = pinEvidence(state, evidenceId);
  }
  for (const connection of asterDeduction.requiredConnections) {
    state = connectEvidence(
      state,
      connection.a,
      connection.b,
      connection.type,
    );
  }
  state = evaluateBoardDeductions(state, DEDUCTIONS).state;

  const sanctuaryDeduction = DEDUCTIONS.sanctuary_chain_protocol;
  state = applyEffects(
    state,
    sanctuaryDeduction.requiredEvidence.map((id) => ({ type: "collectEvidence", id })),
  );
  for (const evidenceId of sanctuaryDeduction.requiredEvidence) {
    state = pinEvidence(state, evidenceId);
  }
  for (const connection of sanctuaryDeduction.requiredConnections) {
    state = connectEvidence(
      state,
      connection.a,
      connection.b,
      connection.type,
    );
  }
  state = evaluateBoardDeductions(state, DEDUCTIONS).state;

  for (const interlude of CHAPTER_INTERLUDES) {
    state = beginInterlude(state, interlude.id);
    for (let beat = 0; beat < interlude.beats.length; beat += 1) {
      state = advanceInterlude(state, CHAPTER_INTERLUDES);
    }
    saves.save(state, `playthrough-interlude-${interlude.id}`);
    state = saves.load();
  }

  saves.save(state, "playthrough-port-prosper-response");
  state = saves.load();

  assert.deepEqual(state.completedDeductions, deductionOrder);
  assert.equal(state.flags.provedCrownlineGovernanceModel, true);
  assert.equal(state.flags.provedRedoubtEvacuation, true);
  assert.equal(state.flags.provedOrpheusSupplyRoute, true);
  assert.equal(state.flags.provedOrpheusCommandCenter, true);
  assert.equal(state.flags.provedBenefactorsSelectCrises, true);
  assert.equal(state.flags.warnedPortProsperQuietly, true);
  assert.equal(state.flags.identifiedAsterHouse, true);
  assert.equal(state.flags.provedAsterHouseTriggerCell, true);
  assert.equal(state.flags.provedSanctuaryChain, true);
  assert.deepEqual(
    state.cinematics.seen,
    CHAPTER_INTERLUDES.map((entry) => entry.id),
  );
  assert.equal(
    state.evidence.collected.includes("port_prosper_warning_receipt"),
    true,
  );
  assert.equal(state.evidence.collected.includes("vesper_key_dead_drop"), true);
  assert.equal(state.board.connections.length >= 35, true);
  const requiredEvidence = new Set(
    Object.values(DEDUCTIONS).flatMap((deduction) => deduction.requiredEvidence),
  );
  assert.equal(
    [...requiredEvidence].every((id) => state.evidence.corroborated.includes(id)),
    true,
    "every clue used in a completed deduction should be corroborated",
  );
  assert.equal(
    state.board.notes.invoice_northstar,
    "The first false invoice remains the spine of the whole case.",
  );
});
