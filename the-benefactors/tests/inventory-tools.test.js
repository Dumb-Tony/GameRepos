import test from "node:test";
import assert from "node:assert/strict";

import { GAME_CONTENT } from "../src/content/game-content.js";
import { applyEffects } from "../src/engine/events.js";
import { createInitialState } from "../src/engine/game-state.js";
import { getInventoryToolContext } from "../src/systems/inventory/inventory-tools.js";

function atLocation(id) {
  const state = createInitialState();
  state.progress.currentScreen = "location";
  state.progress.currentLocation = id;
  return state;
}

test("inventory tools expose useful contextual actions", () => {
  const cityHall = atLocation("city_hall");
  const credentials = getInventoryToolContext(
    cityHall,
    "press_credentials",
    GAME_CONTENT.locations,
  );
  assert.equal(credentials.available, true);
  assert.equal(credentials.hotspotId, "clerk-window");

  const residence = atLocation("mayor_street");
  const camera = getInventoryToolContext(
    residence,
    "smartphone",
    GAME_CONTENT.locations,
  );
  assert.equal(camera.available, true);
  assert.equal(camera.hotspotId, "vale-house");

  const hiddenRoom = applyEffects(atLocation("hidden_room"), [
    { type: "collectEvidence", id: "vale_damaged_recording" },
  ]);
  const recorder = getInventoryToolContext(
    hiddenRoom,
    "recorder",
    GAME_CONTENT.locations,
  );
  assert.equal(recorder.available, true);
  assert.equal(recorder.hotspotId, "dark-monitors");
});

test("used tools report completion and the notebook works everywhere", () => {
  const photographed = applyEffects(atLocation("mayor_street"), [
    { type: "collectEvidence", id: "photo_west_wall" },
  ]);
  const camera = getInventoryToolContext(
    photographed,
    "smartphone",
    GAME_CONTENT.locations,
  );
  assert.equal(camera.available, false);
  assert.equal(camera.actionLabel, "Already used here");

  const notebook = getInventoryToolContext(
    createInitialState(),
    "notebook",
    GAME_CONTENT.locations,
  );
  assert.equal(notebook.available, true);
  assert.equal(notebook.actionLabel, "Open notebook");
});
