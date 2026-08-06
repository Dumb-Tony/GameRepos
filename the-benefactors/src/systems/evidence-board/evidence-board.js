import { applyEffects } from "../../engine/events.js";

const BOARD_COLUMNS = [2, 16, 30, 44, 58, 72, 86];
const BOARD_TOP = 7;
const BOARD_BOTTOM = 80;
const PREFERRED_ROW_GAP = 19;

function defaultPosition(index, totalCards = index + 1) {
  const rowCount = Math.max(
    1,
    Math.ceil(totalCards / BOARD_COLUMNS.length),
  );
  const rowGap =
    rowCount === 1
      ? 0
      : Math.min(
          PREFERRED_ROW_GAP,
          (BOARD_BOTTOM - BOARD_TOP) / (rowCount - 1),
        );

  return {
    x: BOARD_COLUMNS[index % BOARD_COLUMNS.length],
    y: BOARD_TOP + Math.floor(index / BOARD_COLUMNS.length) * rowGap,
  };
}

function reflowEvidence(next) {
  const totalCards = next.evidence.pinned.length;
  next.evidence.pinned.forEach((evidenceId, index) => {
    next.board.cards[evidenceId] = defaultPosition(index, totalCards);
  });
}

export function pinEvidence(state, evidenceId, position) {
  if (!state.evidence.collected.includes(evidenceId)) {
    throw new Error(`Cannot pin uncollected evidence: ${evidenceId}`);
  }

  const next = structuredClone(state);
  if (!next.evidence.pinned.includes(evidenceId)) {
    next.evidence.pinned.push(evidenceId);
  }
  const evidenceIndex = next.evidence.pinned.indexOf(evidenceId);
  const fallback = defaultPosition(evidenceIndex, next.evidence.pinned.length);

  if (position) {
    next.board.cards[evidenceId] = { ...fallback, ...position };
    return next;
  }

  if (next.board.cards[evidenceId]) return next;

  const positionIsOccupied = next.evidence.pinned.some((otherId) => {
    if (otherId === evidenceId) return false;
    const otherPosition = next.board.cards[otherId];
    return (
      otherPosition &&
      Math.abs(otherPosition.x - fallback.x) < 0.01 &&
      Math.abs(otherPosition.y - fallback.y) < 0.01
    );
  });
  const boardAlreadyOverflowed = next.evidence.pinned.some((otherId) => {
    const otherPosition = next.board.cards[otherId];
    return otherPosition && otherPosition.y > BOARD_BOTTOM;
  });

  if (positionIsOccupied || boardAlreadyOverflowed) {
    reflowEvidence(next);
  } else {
    next.board.cards[evidenceId] = fallback;
  }
  return next;
}

export function unpinEvidence(state, evidenceId) {
  if (!state.evidence.pinned.includes(evidenceId)) return state;
  const next = structuredClone(state);
  next.evidence.pinned = next.evidence.pinned.filter((id) => id !== evidenceId);
  return next;
}

export function moveEvidence(state, evidenceId, position) {
  if (!state.evidence.pinned.includes(evidenceId)) return state;
  const next = structuredClone(state);
  next.board.cards[evidenceId] = {
    x: clamp(position.x, 0, 86),
    y: clamp(position.y, 0, 80),
  };
  return next;
}

export function arrangeEvidence(state) {
  const next = structuredClone(state);
  reflowEvidence(next);
  return next;
}

export function connectEvidence(state, a, b, type = "confirmed") {
  if (a === b) return state;
  if (!state.evidence.pinned.includes(a) || !state.evidence.pinned.includes(b)) {
    throw new Error("Both evidence items must be pinned before connecting them.");
  }

  const next = structuredClone(state);
  const existing = next.board.connections.find(
    (connection) =>
      (connection.a === a && connection.b === b) ||
      (connection.a === b && connection.b === a),
  );

  if (existing) {
    existing.type = type;
  } else {
    next.board.connections.push({ a, b, type });
  }
  return next;
}

export function removeConnection(state, a, b) {
  const next = structuredClone(state);
  next.board.connections = next.board.connections.filter(
    (connection) =>
      !(
        (connection.a === a && connection.b === b) ||
        (connection.a === b && connection.b === a)
      ),
  );
  return next;
}

export function evaluateBoardDeductions(state, deductions) {
  let next = structuredClone(state);
  const newlyCompleted = [];

  for (const deduction of Object.values(deductions)) {
    if (next.completedDeductions.includes(deduction.id)) continue;

    const hasEvidence = deduction.requiredEvidence.every((id) =>
      next.evidence.collected.includes(id),
    );
    const hasPrerequisiteDeductions = (deduction.requiredDeductions || []).every(
      (id) => next.completedDeductions.includes(id),
    );
    const hasConnections = deduction.requiredConnections.every((required) =>
      next.board.connections.some(
        (connection) =>
          connection.type === required.type &&
          ((connection.a === required.a && connection.b === required.b) ||
            (connection.a === required.b && connection.b === required.a)),
      ),
    );

    if (hasEvidence && hasPrerequisiteDeductions && hasConnections) {
      next = applyEffects(next, [
        { type: "completeDeduction", id: deduction.id },
        ...(deduction.effects || []),
      ]);
      newlyCompleted.push(deduction);
    }
  }

  return { state: next, newlyCompleted };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
