import test from "node:test";
import assert from "node:assert/strict";

import { DEDUCTIONS } from "../src/content/game-content.js";
import { createInitialState } from "../src/engine/game-state.js";
import {
  connectEvidence,
  evaluateBoardDeductions,
  moveEvidence,
  pinEvidence,
} from "../src/systems/evidence-board/evidence-board.js";

test("pins and moves collected evidence without mutating source", () => {
  const source = createInitialState();
  source.evidence.collected.push("invoice_northstar");
  const pinned = pinEvidence(source, "invoice_northstar", { x: 19, y: 22 });
  const moved = moveEvidence(pinned, "invoice_northstar", { x: 40, y: 44 });

  assert.deepEqual(source.evidence.pinned, []);
  assert.deepEqual(pinned.board.cards.invoice_northstar, { x: 19, y: 22 });
  assert.deepEqual(moved.board.cards.invoice_northstar, { x: 40, y: 44 });
});

test("completes a data-defined deduction from the correct yarn connection", () => {
  let state = createInitialState();
  state.evidence.collected.push("invoice_northstar", "permit_summary");
  state = pinEvidence(state, "invoice_northstar");
  state = pinEvidence(state, "permit_summary");
  state = connectEvidence(
    state,
    "invoice_northstar",
    "permit_summary",
    "financial",
  );

  const result = evaluateBoardDeductions(state, DEDUCTIONS);

  assert.equal(result.newlyCompleted[0].id, "northstar_payment");
  assert.equal(result.state.flags.connectedInvoiceToPermit, true);
  assert.equal(
    result.state.completedDeductions.includes("northstar_payment"),
    true,
  );
});

test("does not complete a deduction with the wrong relationship", () => {
  let state = createInitialState();
  state.evidence.collected.push("invoice_northstar", "permit_summary");
  state = pinEvidence(state, "invoice_northstar");
  state = pinEvidence(state, "permit_summary");
  state = connectEvidence(
    state,
    "invoice_northstar",
    "permit_summary",
    "suspicion",
  );

  const result = evaluateBoardDeductions(state, DEDUCTIONS);
  assert.deepEqual(result.newlyCompleted, []);
});

test("missing-west-wing deduction unlocks Mayor Vale's study", () => {
  let state = createInitialState();
  state.evidence.collected.push(
    "permit_summary",
    "june_statement",
    "photo_west_wall",
  );
  state = pinEvidence(state, "permit_summary");
  state = pinEvidence(state, "june_statement");
  state = pinEvidence(state, "photo_west_wall");
  state = connectEvidence(
    state,
    "permit_summary",
    "june_statement",
    "contradiction",
  );
  state = connectEvidence(
    state,
    "permit_summary",
    "photo_west_wall",
    "contradiction",
  );

  const result = evaluateBoardDeductions(state, DEDUCTIONS);

  assert.equal(
    result.newlyCompleted.some(
      (deduction) => deduction.id === "witness_contradiction",
    ),
    true,
  );
  assert.equal(result.state.flags.mayorMissing, true);
  assert.equal(
    result.state.progress.unlockedLocations.includes("mayor_study"),
    true,
  );
});
