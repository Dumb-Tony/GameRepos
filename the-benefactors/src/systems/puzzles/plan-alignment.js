const VALID_ROTATIONS = Object.freeze([0, 90, 180, 270]);

function assertPuzzle(puzzle) {
  if (!puzzle || typeof puzzle !== "object" || Array.isArray(puzzle)) {
    throw new TypeError("Study-plan puzzle must be an object.");
  }
}

function assertRotation(rotation, label) {
  if (!VALID_ROTATIONS.includes(rotation)) {
    throw new RangeError(`${label} must be one of 0, 90, 180, or 270.`);
  }
}

function directionStep(direction) {
  if (direction === "clockwise" || direction === "right" || direction === 1) {
    return 90;
  }
  if (
    direction === "counterclockwise" ||
    direction === "left" ||
    direction === -1
  ) {
    return -90;
  }
  throw new RangeError(
    'Study-plan direction must be "clockwise", "counterclockwise", "left", "right", 1, or -1.',
  );
}

function nonNegativeInteger(value) {
  return Number.isInteger(value) && value >= 0 ? value : 0;
}

export function rotateStudyPlan(puzzle, direction) {
  assertPuzzle(puzzle);
  assertRotation(puzzle.rotation, "Study-plan rotation");

  if (puzzle.completed) return { ...puzzle };

  const rotation = (puzzle.rotation + directionStep(direction) + 360) % 360;
  return {
    ...puzzle,
    rotation,
  };
}

export function evaluateStudyAlignment(puzzle, solutionRotation) {
  assertPuzzle(puzzle);
  assertRotation(puzzle.rotation, "Study-plan rotation");
  assertRotation(solutionRotation, "Study-plan solution rotation");

  if (puzzle.completed) return { ...puzzle };

  return {
    ...puzzle,
    attempts: nonNegativeInteger(puzzle.attempts) + 1,
    completed: puzzle.rotation === solutionRotation,
  };
}

export function revealPuzzleHint(puzzle, maxHints) {
  assertPuzzle(puzzle);

  const cap = nonNegativeInteger(maxHints);
  const hintsRevealed = Math.min(
    nonNegativeInteger(puzzle.hintsRevealed),
    cap,
  );

  if (puzzle.completed || hintsRevealed >= cap) {
    return {
      ...puzzle,
      hintsRevealed,
    };
  }

  return {
    ...puzzle,
    hintsRevealed: hintsRevealed + 1,
  };
}
