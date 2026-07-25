import { cloneState } from "./game-state.js";

function addUnique(list, value) {
  if (!list.includes(value)) list.push(value);
}

export function applyEffects(currentState, effects = []) {
  const state = cloneState(currentState);

  for (const effect of effects) {
    switch (effect.type) {
      case "setFlag":
        state.flags[effect.key] = effect.value;
        break;
      case "setPath": {
        const parts = effect.path.split(".");
        const finalKey = parts.pop();
        const target = parts.reduce((value, key) => value[key], state);
        target[finalKey] = effect.value;
        break;
      }
      case "collectEvidence":
        addUnique(state.evidence.collected, effect.id);
        break;
      case "addInventory":
        addUnique(state.inventory, effect.id);
        break;
      case "removeInventory":
        state.inventory = state.inventory.filter((id) => id !== effect.id);
        break;
      case "completeDeduction":
        addUnique(state.completedDeductions, effect.id);
        break;
      case "visitLocation":
        state.progress.currentLocation = effect.id;
        state.locationVisits[effect.id] = (state.locationVisits[effect.id] || 0) + 1;
        break;
      default:
        throw new Error(`Unknown effect type: ${effect.type}`);
    }
  }

  return state;
}

