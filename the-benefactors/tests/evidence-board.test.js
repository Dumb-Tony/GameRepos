import test from "node:test";
import assert from "node:assert/strict";

import { DEDUCTIONS, EVIDENCE } from "../src/content/game-content.js";
import { createInitialState } from "../src/engine/game-state.js";
import {
  arrangeEvidence,
  connectEvidence,
  evaluateBoardDeductions,
  moveEvidence,
  pinEvidence,
  unpinEvidence,
} from "../src/systems/evidence-board/evidence-board.js";

test("arranges a crowded evidence board without stacking its first forty-two cards", () => {
  const state = createInitialState();
  state.evidence.pinned = Array.from({ length: 42 }, (_, index) => `clue-${index}`);
  const arranged = arrangeEvidence(state);
  const positions = state.evidence.pinned.map(
    (evidenceId) => `${arranged.board.cards[evidenceId].x},${arranged.board.cards[evidenceId].y}`,
  );

  assert.equal(new Set(positions).size, 42);
  assert.deepEqual(state.board.cards, {});
});

test("keeps every current evidence card visible when pinned sequentially", () => {
  let state = createInitialState();
  state.evidence.collected = Object.keys(EVIDENCE);

  for (const evidenceId of state.evidence.collected) {
    state = pinEvidence(state, evidenceId);
  }

  const positions = state.evidence.pinned.map((evidenceId) => {
    const position = state.board.cards[evidenceId];
    assert.ok(position.x >= 0 && position.x <= 86, `${evidenceId} x is visible`);
    assert.ok(position.y >= 0 && position.y <= 80, `${evidenceId} y is visible`);
    return `${position.x.toFixed(4)},${position.y.toFixed(4)}`;
  });

  assert.equal(new Set(positions).size, state.evidence.pinned.length);
});

test("pins and moves collected evidence without mutating source", () => {
  const source = createInitialState();
  source.evidence.collected.push("invoice_northstar");
  const pinned = pinEvidence(source, "invoice_northstar", { x: 19, y: 22 });
  const moved = moveEvidence(pinned, "invoice_northstar", { x: 40, y: 44 });

  assert.deepEqual(source.evidence.pinned, []);
  assert.deepEqual(pinned.board.cards.invoice_northstar, { x: 19, y: 22 });
  assert.deepEqual(moved.board.cards.invoice_northstar, { x: 40, y: 44 });
});

test("keeps taller evidence cards within the corkboard", () => {
  const source = createInitialState();
  source.evidence.collected.push("invoice_northstar");
  const pinned = pinEvidence(source, "invoice_northstar");
  const moved = moveEvidence(pinned, "invoice_northstar", { x: 100, y: 100 });

  assert.deepEqual(moved.board.cards.invoice_northstar, { x: 86, y: 80 });
});

test("moves pinned evidence back to the tray without erasing its yarn history", () => {
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

  const unpinned = unpinEvidence(state, "invoice_northstar");

  assert.equal(unpinned.evidence.pinned.includes("invoice_northstar"), false);
  assert.equal(unpinned.evidence.collected.includes("invoice_northstar"), true);
  assert.equal(unpinned.board.connections.length, 1);
  assert.deepEqual(unpinned.board.cards.invoice_northstar, { x: 2, y: 7 });
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

test("updates an existing pair instead of creating duplicate yarn", () => {
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
  state = connectEvidence(
    state,
    "permit_summary",
    "invoice_northstar",
    "financial",
  );

  assert.equal(state.board.connections.length, 1);
  assert.equal(state.board.connections[0].type, "financial");
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

test("final distress-signal deduction waits for its prerequisite deduction", () => {
  let state = createInitialState();
  state.evidence.collected.push(
    "invoice_northstar",
    "photo_west_wall",
    "email_meridian",
    "vale_reconstructed_message",
  );
  for (const evidenceId of state.evidence.collected) {
    state = pinEvidence(state, evidenceId);
  }
  state = connectEvidence(
    state,
    "invoice_northstar",
    "photo_west_wall",
    "contradiction",
  );
  state = connectEvidence(
    state,
    "email_meridian",
    "vale_reconstructed_message",
    "confirmed",
  );

  const blocked = evaluateBoardDeductions(state, DEDUCTIONS);
  assert.equal(
    blocked.newlyCompleted.some(
      (deduction) => deduction.id === "vale_distress_signal",
    ),
    false,
  );

  state.completedDeductions.push("witness_contradiction");
  const completed = evaluateBoardDeductions(state, DEDUCTIONS);
  assert.equal(
    completed.newlyCompleted.some(
      (deduction) => deduction.id === "vale_distress_signal",
    ),
    true,
  );
});
