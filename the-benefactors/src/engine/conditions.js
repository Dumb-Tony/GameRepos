function readPath(source, path) {
  return path.split(".").reduce((value, key) => value?.[key], source);
}

export function evaluateCondition(condition, state) {
  if (!condition) return true;

  if (Array.isArray(condition)) {
    return condition.every((entry) => evaluateCondition(entry, state));
  }

  if (condition.all) {
    return condition.all.every((entry) => evaluateCondition(entry, state));
  }

  if (condition.any) {
    return condition.any.some((entry) => evaluateCondition(entry, state));
  }

  if (condition.not) {
    return !evaluateCondition(condition.not, state);
  }

  switch (condition.type) {
    case "flag":
      return state.flags[condition.key] === (condition.equals ?? true);
    case "path":
      return readPath(state, condition.path) === condition.equals;
    case "hasEvidence":
      return state.evidence.collected.includes(condition.id);
    case "deductionComplete":
      return state.completedDeductions.includes(condition.id);
    case "hasInventory":
      return state.inventory.includes(condition.id);
    case "visited":
      return (state.locationVisits[condition.location] || 0) >= (condition.atLeast || 1);
    case "hotspotObserved":
      return (state.exploration?.observedHotspots || []).some((key) =>
        condition.location
          ? key === `${condition.location}:${condition.id}`
          : key.endsWith(`:${condition.id}`),
      );
    case "interactionComplete":
      return (state.exploration?.completedInteractions || []).some((key) =>
        condition.location
          ? key === `${condition.location}:${condition.id}`
          : key.endsWith(`:${condition.id}`),
      );
    default:
      throw new Error(`Unknown condition type: ${condition.type}`);
  }
}

export function filterAvailable(items, state) {
  return items.filter((item) => evaluateCondition(item.visibleWhen, state));
}
