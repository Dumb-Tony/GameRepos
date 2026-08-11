import { evaluateCondition } from "../../engine/conditions.js?v=vesper-20260811b";
import { hasObservedHotspot } from "./exploration-progress.js?v=vesper-20260811b";

export function getVisibleHotspots(location, state) {
  return (location.hotspots || []).filter((hotspot) =>
    evaluateCondition(hotspot.visibleWhen, state),
  );
}

export function renderExplorationScene(location, state, activeToolId = null) {
  const hotspots = getVisibleHotspots(location, state);

  return `
    <div class="authored-scene ${location.sceneClass || ""} ${location.sceneArt ? "has-illustration" : ""}" aria-label="${location.name}">
      ${
        location.sceneArt
          ? `<img class="scene-backdrop" src="${location.sceneArt}" alt="" draggable="false" />`
          : ""
      }
      <div class="scene-atmosphere" aria-hidden="true"></div>
      <div class="scene-set-dressing" aria-hidden="true"></div>
      ${hotspots
        .map(
          (hotspot) => `
            <button
              class="scene-hotspot authored-hotspot ${hasObservedHotspot(state, location.id, hotspot.id) ? "is-observed" : ""} ${activeToolId && hotspot.toolId === activeToolId ? "is-tool-target" : ""}"
              style="left:${hotspot.x}%;top:${hotspot.y}%;width:${hotspot.width}%;height:${hotspot.height}%"
              data-scene-hotspot="${hotspot.id}"
              aria-label="${hasObservedHotspot(state, location.id, hotspot.id) ? "Re-examine" : "Examine"} ${hotspot.label}"
            ><span>${hasObservedHotspot(state, location.id, hotspot.id) ? "✓ " : ""}${hotspot.label}</span></button>
          `,
        )
        .join("")}
    </div>
  `;
}
