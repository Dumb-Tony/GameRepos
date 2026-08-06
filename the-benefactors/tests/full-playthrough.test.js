import test from "node:test";
import assert from "node:assert/strict";

import { DEDUCTIONS } from "../src/content/game-content.js";
import { applyEffects } from "../src/engine/events.js";
import { createInitialState } from "../src/engine/game-state.js";
import { SaveSystem } from "../src/engine/save-system.js";
import {
  connectEvidence,
  evaluateBoardDeductions,
  pinEvidence,
} from "../src/systems/evidence-board/evidence-board.js";

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

test("the complete authored investigation can progress from the leak to Orpheus", () => {
  const deductionOrder = Object.keys(DEDUCTIONS);
  const saves = new SaveSystem(new MemoryStorage());
  let state = createInitialState({ firstName: "Alex" });

  for (const deductionId of deductionOrder) {
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

  assert.deepEqual(state.completedDeductions, deductionOrder);
  assert.equal(state.flags.provedCrownlineGovernanceModel, true);
  assert.equal(state.flags.provedRedoubtEvacuation, true);
  assert.equal(state.flags.provedOrpheusSupplyRoute, true);
  assert.equal(
    state.evidence.collected.includes("orpheus_maintenance_badge"),
    true,
  );
  assert.equal(state.board.connections.length >= 27, true);
});
