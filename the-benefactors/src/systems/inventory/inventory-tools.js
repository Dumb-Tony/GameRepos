import { evaluateCondition } from "../../engine/conditions.js?v=fullscreen-20260825a";
import { getInteractiveLocation } from "../../content/exploration-content.js?v=fullscreen-20260825a";

const IDLE_HINTS = Object.freeze({
  press_credentials: "Useful when an official needs a reason to answer questions.",
  smartphone: "Useful anywhere a scene or document needs to be photographed or copied.",
  recorder: "Useful near recoverable audio or a conversation that cannot be heard openly.",
  notebook: "Open the notebook to review objectives, leads, deductions, and hints.",
});

export function getInventoryToolContext(state, itemId, locations) {
  if (itemId === "notebook") {
    return {
      available: true,
      actionLabel: "Open notebook",
      hint: IDLE_HINTS.notebook,
      hotspotId: null,
    };
  }

  if (state.progress.currentScreen !== "location") {
    return {
      available: false,
      actionLabel: "No use here",
      hint: IDLE_HINTS[itemId] || "No immediate use for this item here.",
      hotspotId: null,
    };
  }

  const location = getInteractiveLocation(locations[state.progress.currentLocation]);
  const matching = (location?.hotspots || []).filter(
    (hotspot) =>
      hotspot.toolId === itemId &&
      evaluateCondition(hotspot.visibleWhen, state),
  );
  const opportunity = matching.find((hotspot) =>
    evaluateCondition(hotspot.actionWhen, state),
  );

  if (opportunity) {
    return {
      available: true,
      actionLabel: opportunity.actionLabel || `Use at ${opportunity.label}`,
      hint: `Useful here: ${opportunity.title || opportunity.label}.`,
      hotspotId: opportunity.id,
    };
  }

  return {
    available: false,
    actionLabel: matching.length ? "Already used here" : "No use here",
    hint: matching.length
      ? `You have already used this tool at ${location.name}.`
      : IDLE_HINTS[itemId] || "No immediate use for this item here.",
    hotspotId: null,
  };
}
