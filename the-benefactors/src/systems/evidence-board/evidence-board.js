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

function reflowEvidence(next, orderedIds = next.evidence.pinned) {
  const totalCards = orderedIds.length;
  orderedIds.forEach((evidenceId, index) => {
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

export function arrangeEvidence(
  state,
  { mode = "chronology", evidence = {}, activeTheory = null } = {},
) {
  const next = structuredClone(state);
  const categoryOrder = [
    "document",
    "financial",
    "photograph",
    "recording",
    "location",
    "event",
  ];
  const pinnedOrder = new Map(
    next.evidence.pinned.map((evidenceId, index) => [evidenceId, index]),
  );
  const theoryOrder = new Map(
    (activeTheory?.requiredEvidence || []).map((evidenceId, index) => [
      evidenceId,
      index,
    ]),
  );
  const orderedIds = [...next.evidence.pinned].sort((a, b) => {
    if (mode === "type") {
      const categoryDifference =
        categoryOrder.indexOf(evidence[a]?.category) -
        categoryOrder.indexOf(evidence[b]?.category);
      if (categoryDifference) return categoryDifference;
      return (evidence[a]?.title || a).localeCompare(evidence[b]?.title || b);
    }
    if (mode === "theory") {
      const aTheory = theoryOrder.has(a);
      const bTheory = theoryOrder.has(b);
      if (aTheory !== bTheory) return aTheory ? -1 : 1;
      if (aTheory) return theoryOrder.get(a) - theoryOrder.get(b);
      const aAnnotated = Boolean(next.board.notes?.[a]);
      const bAnnotated = Boolean(next.board.notes?.[b]);
      if (aAnnotated !== bAnnotated) return aAnnotated ? -1 : 1;
    }
    return pinnedOrder.get(a) - pinnedOrder.get(b);
  });
  reflowEvidence(next, orderedIds);
  next.board.view ||= {};
  next.board.view.arrangement = mode;
  return next;
}

export function saveEvidenceNote(state, evidenceId, text) {
  if (!state.evidence.collected.includes(evidenceId)) {
    throw new Error(`Cannot annotate uncollected evidence: ${evidenceId}`);
  }
  const next = structuredClone(state);
  next.board.notes ||= {};
  const note = String(text || "").trim().slice(0, 500);
  if (note) next.board.notes[evidenceId] = note;
  else delete next.board.notes[evidenceId];
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
      next.evidence.corroborated ||= [];
      for (const evidenceId of deduction.requiredEvidence) {
        if (!next.evidence.corroborated.includes(evidenceId)) {
          next.evidence.corroborated.push(evidenceId);
        }
      }
      newlyCompleted.push(deduction);
    }
  }

  return { state: next, newlyCompleted };
}

export function evaluateConnectionFeedback(state, a, b, type, deductions) {
  const candidates = Object.values(deductions).filter((deduction) => {
    if (
      !(deduction.requiredDeductions || []).every((id) =>
        state.completedDeductions.includes(id),
      )
    ) {
      return false;
    }
    return deduction.requiredConnections.some(
      (connection) =>
        (connection.a === a && connection.b === b) ||
        (connection.a === b && connection.b === a),
    );
  });

  if (!candidates.length) {
    return {
      kind: "exploratory",
      title: "Exploratory connection",
      text:
        "The relationship is saved, but it does not currently support a testable theory. Add a note if this is a lead you want to revisit.",
      deductionId: null,
      expectedType: null,
    };
  }

  const deduction = candidates[0];
  const required = deduction.requiredConnections.find(
    (connection) =>
      (connection.a === a && connection.b === b) ||
      (connection.a === b && connection.b === a),
  );
  if (required.type !== type) {
    return {
      kind: "wrong-relationship",
      title: "Right clues, wrong claim",
      text: `This pair matters to “${deduction.title},” but the evidence supports a ${required.type} relationship here.`,
      deductionId: deduction.id,
      expectedType: required.type,
    };
  }

  const missingEvidence = deduction.requiredEvidence.filter(
    (id) => !state.evidence.collected.includes(id),
  );
  const remainingLinks = deduction.requiredConnections.filter(
    (connection) =>
      !state.board.connections.some(
        (candidate) =>
          candidate.type === connection.type &&
          ((candidate.a === connection.a && candidate.b === connection.b) ||
            (candidate.a === connection.b && candidate.b === connection.a)),
      ),
  ).length;
  return {
    kind: missingEvidence.length || remainingLinks ? "supports-theory" : "theory-ready",
    title: missingEvidence.length || remainingLinks ? "Theory strengthened" : "Theory proven",
    text: missingEvidence.length
      ? `This supports “${deduction.title}.” ${missingEvidence.length} required clue${missingEvidence.length === 1 ? " is" : "s are"} still missing.`
      : remainingLinks
        ? `This supports “${deduction.title}.” ${remainingLinks} required yarn link${remainingLinks === 1 ? " remains" : "s remain"}.`
        : `Every required clue and relationship now supports “${deduction.title}.”`,
    deductionId: deduction.id,
    expectedType: required.type,
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
