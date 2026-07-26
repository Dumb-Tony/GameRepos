import test from "node:test";
import assert from "node:assert/strict";

import {
  evaluateStudyAlignment,
  revealPuzzleHint,
  rotateStudyPlan,
} from "../src/systems/puzzles/plan-alignment.js";

function createPuzzle(overrides = {}) {
  return {
    rotation: 0,
    attempts: 0,
    hintsRevealed: 0,
    completed: false,
    ...overrides,
  };
}

test("rotates through every valid study-plan orientation without mutation", () => {
  const original = createPuzzle();
  const ninety = rotateStudyPlan(original, "clockwise");
  const oneEighty = rotateStudyPlan(ninety, "right");
  const twoSeventy = rotateStudyPlan(oneEighty, 1);
  const zero = rotateStudyPlan(twoSeventy, "clockwise");

  assert.equal(original.rotation, 0);
  assert.deepEqual(
    [ninety.rotation, oneEighty.rotation, twoSeventy.rotation, zero.rotation],
    [90, 180, 270, 0],
  );
  assert.notEqual(ninety, original);
});

test("rotates counterclockwise and wraps from zero to 270", () => {
  const left = rotateStudyPlan(createPuzzle(), "counterclockwise");
  const back = rotateStudyPlan(left, -1);

  assert.equal(left.rotation, 270);
  assert.equal(back.rotation, 180);
});

test("alignment evaluation increments attempts and completes only when correct", () => {
  const original = createPuzzle({ rotation: 90, attempts: 2 });
  const incorrect = evaluateStudyAlignment(original, 270);
  const rotated = rotateStudyPlan(incorrect, "counterclockwise");
  const correct = evaluateStudyAlignment(rotated, 0);

  assert.equal(original.attempts, 2);
  assert.equal(incorrect.attempts, 3);
  assert.equal(incorrect.completed, false);
  assert.equal(correct.attempts, 4);
  assert.equal(correct.completed, true);
});

test("successful alignment is idempotent and locks rotation", () => {
  const completed = evaluateStudyAlignment(
    createPuzzle({ rotation: 180 }),
    180,
  );
  const evaluatedAgain = evaluateStudyAlignment(completed, 180);
  const rotatedAfterSuccess = rotateStudyPlan(completed, "clockwise");

  assert.equal(completed.attempts, 1);
  assert.deepEqual(evaluatedAgain, completed);
  assert.deepEqual(rotatedAfterSuccess, completed);
  assert.notEqual(evaluatedAgain, completed);
  assert.notEqual(rotatedAfterSuccess, completed);
});

test("study-plan hints increment immutably and stop at the cap", () => {
  const original = createPuzzle();
  const first = revealPuzzleHint(original, 2);
  const second = revealPuzzleHint(first, 2);
  const capped = revealPuzzleHint(second, 2);

  assert.equal(original.hintsRevealed, 0);
  assert.equal(first.hintsRevealed, 1);
  assert.equal(second.hintsRevealed, 2);
  assert.equal(capped.hintsRevealed, 2);
});

test("study-plan hints respect zero and completed-puzzle caps", () => {
  assert.equal(revealPuzzleHint(createPuzzle(), 0).hintsRevealed, 0);
  assert.equal(
    revealPuzzleHint(
      createPuzzle({ completed: true, hintsRevealed: 1 }),
      3,
    ).hintsRevealed,
    1,
  );
});

test("rejects invalid study-plan rotations and directions", () => {
  assert.throws(
    () => rotateStudyPlan(createPuzzle({ rotation: 45 }), "clockwise"),
    RangeError,
  );
  assert.throws(() => rotateStudyPlan(createPuzzle(), "up"), RangeError);
  assert.throws(
    () => evaluateStudyAlignment(createPuzzle(), 45),
    RangeError,
  );
});
