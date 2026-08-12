import test from "node:test";
import assert from "node:assert/strict";

import { DEDUCTIONS, EVIDENCE } from "../src/content/game-content.js";
import { createInitialState } from "../src/engine/game-state.js";
import {
  arrangeEvidence,
  connectEvidence,
  evaluateConnectionFeedback,
  evaluateBoardDeductions,
  moveEvidence,
  pinEvidence,
  saveEvidenceNote,
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

test("organizes evidence by type or current theory without changing pin history", () => {
  const state = createInitialState();
  state.evidence.collected.push(
    "port_prosper_survival_status",
    "invoice_northstar",
    "crisis_investment_escrow",
  );
  state.evidence.pinned = [...state.evidence.collected];

  const byType = arrangeEvidence(state, {
    mode: "type",
    evidence: EVIDENCE,
  });
  assert.deepEqual(byType.evidence.pinned, state.evidence.pinned);
  assert.deepEqual(byType.board.cards.invoice_northstar, { x: 2, y: 7 });
  assert.deepEqual(byType.board.cards.crisis_investment_escrow, { x: 16, y: 7 });
  assert.deepEqual(byType.board.cards.port_prosper_survival_status, { x: 30, y: 7 });
  assert.equal(byType.board.view.arrangement, "type");

  const activeTheory = {
    requiredEvidence: ["crisis_investment_escrow", "invoice_northstar"],
  };
  const byTheory = arrangeEvidence(state, {
    mode: "theory",
    evidence: EVIDENCE,
    activeTheory,
  });
  assert.deepEqual(byTheory.board.cards.crisis_investment_escrow, { x: 2, y: 7 });
  assert.deepEqual(byTheory.board.cards.invoice_northstar, { x: 16, y: 7 });
});

test("saves, trims, limits, and removes player-authored evidence notes", () => {
  const state = createInitialState();
  state.evidence.collected.push("invoice_northstar");
  const noted = saveEvidenceNote(
    state,
    "invoice_northstar",
    `  ${"paper trail ".repeat(80)}  `,
  );

  assert.equal(state.board.notes.invoice_northstar, undefined);
  assert.equal(noted.board.notes.invoice_northstar.length, 500);
  const cleared = saveEvidenceNote(noted, "invoice_northstar", "   ");
  assert.equal(cleared.board.notes.invoice_northstar, undefined);
  assert.throws(
    () => saveEvidenceNote(state, "permit_summary", "Not collected"),
    /Cannot annotate uncollected evidence/,
  );
});

test("connection feedback distinguishes proof, wrong yarn, and exploration", () => {
  let state = createInitialState();
  state.evidence.collected.push("invoice_northstar", "permit_summary");
  state = pinEvidence(state, "invoice_northstar");
  state = pinEvidence(state, "permit_summary");

  const wrong = evaluateConnectionFeedback(
    state,
    "invoice_northstar",
    "permit_summary",
    "suspicion",
    DEDUCTIONS,
  );
  assert.equal(wrong.kind, "wrong-relationship");
  assert.equal(wrong.expectedType, "financial");

  state = connectEvidence(
    state,
    "invoice_northstar",
    "permit_summary",
    "financial",
  );
  const ready = evaluateConnectionFeedback(
    state,
    "invoice_northstar",
    "permit_summary",
    "financial",
    DEDUCTIONS,
  );
  assert.equal(ready.kind, "theory-ready");

  const exploratory = evaluateConnectionFeedback(
    state,
    "invoice_northstar",
    "email_meridian",
    "suspicion",
    DEDUCTIONS,
  );
  assert.equal(exploratory.kind, "exploratory");
});

test("completed deductions mark their entire evidence file corroborated", () => {
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
  assert.deepEqual(
    [...result.state.evidence.corroborated].sort(),
    ["invoice_northstar", "permit_summary"],
  );
});

test("every authored deduction has a reasoning chain and persistent case impact", () => {
  assert.equal(Object.keys(DEDUCTIONS).length, 19);
  for (const deduction of Object.values(DEDUCTIONS)) {
    assert.ok(deduction.title, `${deduction.id} needs a conclusion`);
    assert.ok(deduction.journalText, `${deduction.id} needs a written rationale`);
    assert.ok(deduction.requiredEvidence.length >= 2, `${deduction.id} needs corroboration`);
    assert.ok(deduction.requiredConnections.length >= 1, `${deduction.id} needs yarn logic`);
    assert.ok(deduction.effects?.length >= 1, `${deduction.id} must change the case`);
  }
});
