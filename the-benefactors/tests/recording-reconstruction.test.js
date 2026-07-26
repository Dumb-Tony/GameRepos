import test from "node:test";
import assert from "node:assert/strict";

import {
  evaluateRecordingSequence,
  moveRecordingFragment,
  revealRecordingHint,
} from "../src/systems/puzzles/recording-reconstruction.js";

const SOLUTION = Object.freeze(["clock", "train", "rain"]);

function createPuzzle(overrides = {}) {
  return {
    order: ["rain", "clock", "train"],
    attempts: 0,
    hintsRevealed: 0,
    completed: false,
    ...overrides,
  };
}

function permutations(values) {
  if (values.length <= 1) return [values];
  return values.flatMap((value, index) =>
    permutations(values.filter((_item, itemIndex) => itemIndex !== index)).map(
      (rest) => [value, ...rest],
    ),
  );
}

test("moves a recording fragment one position without mutating its source", () => {
  const original = createPuzzle();
  const movedLeft = moveRecordingFragment(original, "clock", "left");
  const movedRight = moveRecordingFragment(movedLeft, "clock", 1);

  assert.deepEqual(original.order, ["rain", "clock", "train"]);
  assert.deepEqual(movedLeft.order, ["clock", "rain", "train"]);
  assert.deepEqual(movedRight.order, original.order);
  assert.notEqual(movedLeft.order, original.order);
});

test("recording fragment movement is bounds-safe", () => {
  const original = createPuzzle();
  const firstLeft = moveRecordingFragment(original, "rain", "left");
  const lastRight = moveRecordingFragment(original, "train", "right");
  const missing = moveRecordingFragment(original, "unknown", "left");

  assert.deepEqual(firstLeft.order, original.order);
  assert.deepEqual(lastRight.order, original.order);
  assert.deepEqual(missing.order, original.order);
  assert.notEqual(firstLeft.order, original.order);
  assert.notEqual(lastRight.order, original.order);
  assert.notEqual(missing.order, original.order);
});

test("only the exact sequence succeeds across all six permutations", () => {
  const orders = permutations([...SOLUTION]);
  assert.equal(orders.length, 6);

  for (const order of orders) {
    const result = evaluateRecordingSequence(createPuzzle({ order }), SOLUTION);
    assert.equal(result.attempts, 1, order.join(","));
    assert.equal(
      result.completed,
      order.every((fragmentId, index) => fragmentId === SOLUTION[index]),
      order.join(","),
    );
  }
});

test("failed recording attempts increment until the exact order is submitted", () => {
  const original = createPuzzle({ attempts: 4 });
  const failed = evaluateRecordingSequence(original, SOLUTION);
  const rearranged = {
    ...failed,
    order: [...SOLUTION],
  };
  const completed = evaluateRecordingSequence(rearranged, SOLUTION);

  assert.equal(original.attempts, 4);
  assert.equal(failed.attempts, 5);
  assert.equal(failed.completed, false);
  assert.equal(completed.attempts, 6);
  assert.equal(completed.completed, true);
});

test("successful recording evaluation is idempotent and locks movement", () => {
  const completed = evaluateRecordingSequence(
    createPuzzle({ order: [...SOLUTION] }),
    SOLUTION,
  );
  const evaluatedAgain = evaluateRecordingSequence(completed, SOLUTION);
  const movedAfterSuccess = moveRecordingFragment(completed, "train", "left");

  assert.equal(completed.attempts, 1);
  assert.deepEqual(evaluatedAgain, completed);
  assert.deepEqual(movedAfterSuccess, completed);
  assert.notEqual(evaluatedAgain, completed);
  assert.notEqual(evaluatedAgain.order, completed.order);
  assert.notEqual(movedAfterSuccess.order, completed.order);
});

test("recording hints increment immutably and stop at the cap", () => {
  const original = createPuzzle();
  const first = revealRecordingHint(original, 2);
  const second = revealRecordingHint(first, 2);
  const capped = revealRecordingHint(second, 2);

  assert.equal(original.hintsRevealed, 0);
  assert.equal(first.hintsRevealed, 1);
  assert.equal(second.hintsRevealed, 2);
  assert.equal(capped.hintsRevealed, 2);
  assert.notEqual(first.order, original.order);
});

test("recording hints respect zero and completed-puzzle caps", () => {
  assert.equal(revealRecordingHint(createPuzzle(), 0).hintsRevealed, 0);
  assert.equal(
    revealRecordingHint(
      createPuzzle({ completed: true, hintsRevealed: 1 }),
      3,
    ).hintsRevealed,
    1,
  );
});

test("rejects invalid recording orders, solutions, and directions", () => {
  assert.throws(
    () => moveRecordingFragment({ order: null }, "clock", "left"),
    TypeError,
  );
  assert.throws(
    () => moveRecordingFragment(createPuzzle(), "clock", "up"),
    RangeError,
  );
  assert.throws(
    () => evaluateRecordingSequence(createPuzzle(), null),
    TypeError,
  );
});
