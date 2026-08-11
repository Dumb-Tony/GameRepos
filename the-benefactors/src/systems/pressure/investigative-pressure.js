import { evaluateCondition } from "../../engine/conditions.js";

function clamp(value) {
  return Math.max(0, Math.min(100, Number(value) || 0));
}

function clampSourceRisk(value) {
  return Math.max(0, Math.min(5, Number(value) || 0));
}

export function pressureStatus(heat = 0) {
  if (heat < 15) return { label: "Unnoticed", className: "quiet" };
  if (heat < 35) return { label: "Watched", className: "watched" };
  if (heat < 60) return { label: "Pressured", className: "pressured" };
  if (heat < 80) return { label: "Hunted", className: "hunted" };
  return { label: "Fully exposed", className: "exposed" };
}

export function syncPressure(state, events) {
  const next = structuredClone(state);
  const newlyTriggered = events.filter(
    (event) =>
      !next.pressure.events.includes(event.id) &&
      evaluateCondition(event.eligibleWhen, next),
  );
  if (!newlyTriggered.length) return { state, newlyTriggered: [] };
  for (const event of newlyTriggered) {
    next.pressure.events.push(event.id);
    next.pressure.heat = clamp(next.pressure.heat + event.heat);
    next.pressure.deadline = event.deadline;
    next.pressure.lastEvent = event.id;
  }
  return { state: next, newlyTriggered };
}

export function availableCountermeasures(state, countermeasures) {
  return countermeasures.filter(
    (entry) =>
      !state.pressure.countermeasures.includes(entry.id) &&
      evaluateCondition(entry.availableWhen, state),
  );
}

export function applyCountermeasure(state, countermeasure) {
  if (!countermeasure || state.pressure.countermeasures.includes(countermeasure.id)) {
    return state;
  }
  if (!evaluateCondition(countermeasure.availableWhen, state)) return state;
  const next = structuredClone(state);
  next.pressure.countermeasures.push(countermeasure.id);
  next.pressure.heat = clamp(next.pressure.heat + countermeasure.heat);
  next.pressure.lastCountermeasure = countermeasure.id;
  if (countermeasure.sourceRisk) {
    Object.values(next.characters).forEach((record) => {
      record.risk = clampSourceRisk(record.risk + countermeasure.sourceRisk);
    });
  }
  return next;
}
