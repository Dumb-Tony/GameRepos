import { applyEffects } from "../../engine/events.js";

const DEFAULT_POSITIONS = [
  { x: 12, y: 15 },
  { x: 42, y: 12 },
  { x: 70, y: 18 },
  { x: 23, y: 54 },
  { x: 55, y: 52 },
  { x: 76, y: 60 },
];

export function pinEvidence(state, evidenceId, position) {
  if (!state.evidence.collected.includes(evidenceId)) {
    throw new Error(`Cannot pin uncollected evidence: ${evidenceId}`);
  }

  const next = structuredClone(state);
  if (!next.evidence.pinned.includes(evidenceId)) {
    next.evidence.pinned.push(evidenceId);
  }
  const fallback = DEFAULT_POSITIONS[next.evidence.pinned.indexOf(evidenceId) % DEFAULT_POSITIONS.length];
  next.board.cards[evidenceId] = {
    ...fallback,
    ...position,
  };
  return next;
}

export function moveEvidence(state, evidenceId, position) {
  if (!state.evidence.pinned.includes(evidenceId)) return state;
  const next = structuredClone(state);
  next.board.cards[evidenceId] = {
    x: clamp(position.x, 0, 86),
    y: clamp(position.y, 0, 78),
  };
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
    const hasConnections = deduction.requiredConnections.every((required) =>
      next.board.connections.some(
        (connection) =>
          connection.type === required.type &&
          ((connection.a === required.a && connection.b === required.b) ||
            (connection.a === required.b && connection.b === required.a)),
      ),
    );

    if (hasEvidence && hasConnections) {
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

