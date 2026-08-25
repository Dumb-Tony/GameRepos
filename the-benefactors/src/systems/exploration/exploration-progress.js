import { cloneState } from "../../engine/game-state.js?v=fullscreen-20260825a";

export function hotspotKey(locationId, hotspotId) {
  return `${locationId}:${hotspotId}`;
}

export function hasObservedHotspot(state, locationId, hotspotId) {
  return (state.exploration?.observedHotspots || []).includes(
    hotspotKey(locationId, hotspotId),
  );
}

export function inspectHotspot(currentState, location, hotspot) {
  const state = cloneState(currentState);
  state.exploration ||= {
    observedHotspots: [],
    completedInteractions: [],
    fieldNotes: [],
  };
  const key = hotspotKey(location.id, hotspot.id);
  if (!state.exploration.observedHotspots.includes(key)) {
    state.exploration.observedHotspots.push(key);
  }
  if (hotspot.fieldNote && !state.exploration.fieldNotes.includes(key)) {
    state.exploration.fieldNotes.push(key);
  }
  return state;
}

export function completeInteraction(currentState, locationId, hotspotId) {
  const state = cloneState(currentState);
  state.exploration ||= {
    observedHotspots: [],
    completedInteractions: [],
    fieldNotes: [],
  };
  const key = hotspotKey(locationId, hotspotId);
  if (!state.exploration.completedInteractions.includes(key)) {
    state.exploration.completedInteractions.push(key);
  }
  return state;
}

export function isInteractionComplete(state, hotspotId, locationId = null) {
  const completed = state.exploration?.completedInteractions || [];
  return locationId
    ? completed.includes(hotspotKey(locationId, hotspotId))
    : completed.some((key) => key.endsWith(`:${hotspotId}`));
}

export function getHotspotObservationText(state, location, hotspot) {
  const visits = state.locationVisits?.[location.id] || 0;
  return visits >= 2 && hotspot.revisitText ? hotspot.revisitText : hotspot.text;
}

export function getFieldNoteEntries(state, locations) {
  const entries = [];
  for (const key of state.exploration?.fieldNotes || []) {
    const separator = key.indexOf(":");
    const locationId = key.slice(0, separator);
    const hotspotId = key.slice(separator + 1);
    const location = locations[locationId];
    const hotspot = location?.hotspots?.find((candidate) => candidate.id === hotspotId);
    if (!location || !hotspot?.fieldNote) continue;
    entries.push({
      key,
      locationId,
      hotspotId,
      locationName: location.name,
      title: hotspot.title || hotspot.label,
      text: hotspot.fieldNote,
    });
  }
  return entries;
}
