function assertPuzzle(puzzle) {
  if (!puzzle || typeof puzzle !== "object" || Array.isArray(puzzle)) {
    throw new TypeError("Recording puzzle must be an object.");
  }
  if (!Array.isArray(puzzle.order)) {
    throw new TypeError("Recording puzzle order must be an array.");
  }
}

function directionStep(direction) {
  if (direction === "right" || direction === 1) return 1;
  if (direction === "left" || direction === -1) return -1;
  throw new RangeError(
    'Recording-fragment direction must be "left", "right", 1, or -1.',
  );
}

function nonNegativeInteger(value) {
  return Number.isInteger(value) && value >= 0 ? value : 0;
}

export function moveRecordingFragment(puzzle, fragmentId, direction) {
  assertPuzzle(puzzle);

  const order = [...puzzle.order];
  if (puzzle.completed) return { ...puzzle, order };

  const currentIndex = order.indexOf(fragmentId);
  if (currentIndex < 0) return { ...puzzle, order };

  const destinationIndex = currentIndex + directionStep(direction);
  if (destinationIndex < 0 || destinationIndex >= order.length) {
    return { ...puzzle, order };
  }

  [order[currentIndex], order[destinationIndex]] = [
    order[destinationIndex],
    order[currentIndex],
  ];

  return {
    ...puzzle,
    order,
  };
}

export function evaluateRecordingSequence(puzzle, solutionOrder) {
  assertPuzzle(puzzle);
  if (!Array.isArray(solutionOrder)) {
    throw new TypeError("Recording solution order must be an array.");
  }

  const order = [...puzzle.order];
  if (puzzle.completed) return { ...puzzle, order };

  const completed =
    order.length === solutionOrder.length &&
    order.every((fragmentId, index) => fragmentId === solutionOrder[index]);

  return {
    ...puzzle,
    order,
    attempts: nonNegativeInteger(puzzle.attempts) + 1,
    completed,
  };
}

export function revealRecordingHint(puzzle, maxHints) {
  assertPuzzle(puzzle);

  const order = [...puzzle.order];
  const cap = nonNegativeInteger(maxHints);
  const hintsRevealed = Math.min(
    nonNegativeInteger(puzzle.hintsRevealed),
    cap,
  );

  if (puzzle.completed || hintsRevealed >= cap) {
    return {
      ...puzzle,
      order,
      hintsRevealed,
    };
  }

  return {
    ...puzzle,
    order,
    hintsRevealed: hintsRevealed + 1,
  };
}
