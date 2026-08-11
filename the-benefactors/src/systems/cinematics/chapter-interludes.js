import { evaluateCondition } from "../../engine/conditions.js";

export function getCurrentInterlude(state, interludes) {
  return interludes
    .filter((entry) => evaluateCondition(entry.eligibleWhen, state))
    .sort((a, b) => b.order - a.order)[0] || null;
}

export function getPendingInterlude(state, interludes) {
  const current = getCurrentInterlude(state, interludes);
  if (!current || state.cinematics.seen.includes(current.id)) return null;
  return current;
}

export function beginInterlude(state, interludeId) {
  const next = structuredClone(state);
  next.cinematics.activeId = interludeId;
  next.cinematics.step = 0;
  return next;
}

export function advanceInterlude(state, interludes) {
  const active = interludes.find((entry) => entry.id === state.cinematics.activeId);
  if (!active) return state;
  const next = structuredClone(state);
  if (next.cinematics.step < active.beats.length - 1) {
    next.cinematics.step += 1;
    return next;
  }
  if (!next.cinematics.seen.includes(active.id)) next.cinematics.seen.push(active.id);
  next.cinematics.activeId = null;
  next.cinematics.step = 0;
  return next;
}

export function skipInterlude(state, interludes) {
  const active = interludes.find((entry) => entry.id === state.cinematics.activeId);
  if (!active) return state;
  const next = structuredClone(state);
  if (!next.cinematics.seen.includes(active.id)) next.cinematics.seen.push(active.id);
  next.cinematics.activeId = null;
  next.cinematics.step = 0;
  return next;
}
