import test from "node:test";
import assert from "node:assert/strict";

import { GAME_CONTENT, DIALOGUES } from "../src/content/game-content.js";
import {
  EXPLORATION_DETAIL_OVERRIDES,
  EXTRA_LOCATION_HOTSPOTS,
  getInteractiveLocation,
} from "../src/content/exploration-content.js";
import { evaluateCondition } from "../src/engine/conditions.js";
import { createInitialState } from "../src/engine/game-state.js";
import {
  completeInteraction,
  getFieldNoteEntries,
  getHotspotObservationText,
  hasObservedHotspot,
  inspectHotspot,
} from "../src/systems/exploration/exploration-progress.js";
import { getInventoryToolContext } from "../src/systems/inventory/inventory-tools.js";

test("every playable location offers a persistent optional field observation", () => {
  for (const [locationId, baseLocation] of Object.entries(GAME_CONTENT.locations)) {
    if (locationId === "home_office") continue;
    const location = getInteractiveLocation(baseLocation);
    assert.equal(
      location.hotspots.some((hotspot) => hotspot.fieldNote),
      true,
      `${locationId} has no field-note discovery`,
    );
    assert.equal(
      location.hotspots.some((hotspot) => hotspot.revisitText),
      true,
      `${locationId} has no revisit-specific observation`,
    );
  }
});

test("early locations gain richer hotspot density and tool targets", () => {
  const minimums = {
    ledger_newsroom: 5,
    city_hall: 5,
    mayor_street: 5,
    mayor_study: 5,
    hidden_room: 5,
  };
  for (const [locationId, minimum] of Object.entries(minimums)) {
    const location = getInteractiveLocation(GAME_CONTENT.locations[locationId]);
    assert.ok(location.hotspots.length >= minimum, `${locationId} remains too sparse`);
  }

  const toolIds = new Set(
    Object.values(GAME_CONTENT.locations)
      .map(getInteractiveLocation)
      .flatMap((location) => location.hotspots || [])
      .map((hotspot) => hotspot.toolId)
      .filter(Boolean),
  );
  assert.deepEqual(
    [...toolIds].sort(),
    ["press_credentials", "recorder", "smartphone"],
  );
});

test("observations, field notes, and completed interactions persist immutably", () => {
  const state = createInitialState();
  const location = getInteractiveLocation(GAME_CONTENT.locations.ledger_newsroom);
  const hotspot = location.hotspots.find((item) => item.id === "newsroom-copy-desk");
  const inspected = inspectHotspot(state, location, hotspot);

  assert.equal(hasObservedHotspot(state, location.id, hotspot.id), false);
  assert.equal(hasObservedHotspot(inspected, location.id, hotspot.id), true);
  assert.deepEqual(state.exploration.fieldNotes, []);
  assert.deepEqual(inspected.exploration.fieldNotes, ["ledger_newsroom:newsroom-copy-desk"]);

  const completed = completeInteraction(inspected, location.id, hotspot.id);
  assert.equal(
    evaluateCondition({ type: "interactionComplete", id: hotspot.id }, completed),
    true,
  );
  assert.equal(evaluateCondition(hotspot.actionWhen, completed), false);
});

test("revisits reveal new observations instead of repeating first-visit copy", () => {
  const location = getInteractiveLocation(GAME_CONTENT.locations.city_hall);
  const hotspot = location.hotspots.find((item) => item.id === "records-policy");
  const firstVisit = createInitialState();
  firstVisit.locationVisits.city_hall = 1;
  const returnVisit = structuredClone(firstVisit);
  returnVisit.locationVisits.city_hall = 2;

  assert.equal(getHotspotObservationText(firstVisit, location, hotspot), hotspot.text);
  assert.equal(
    getHotspotObservationText(returnVisit, location, hotspot),
    EXPLORATION_DETAIL_OVERRIDES["records-policy"].revisitText,
  );
});

test("field notes resolve back to their authored location and observation", () => {
  const state = createInitialState();
  const locations = Object.fromEntries(
    Object.entries(GAME_CONTENT.locations).map(([id, location]) => [
      id,
      getInteractiveLocation(location),
    ]),
  );
  const location = locations.hidden_room;
  const hotspot = location.hotspots.find((item) => item.id === "hidden-wall-calendar");
  const inspected = inspectHotspot(state, location, hotspot);
  const notes = getFieldNoteEntries(inspected, locations);

  assert.equal(notes.length, 1);
  assert.equal(notes[0].locationName, "Hidden Communications Room");
  assert.match(notes[0].text, /second-Thursday schedule/);
});

test("new conversations are reachable and the inventory finds new scene uses", () => {
  assert.ok(DIALOGUES.mara_field_editor);
  assert.ok(DIALOGUES.port_prosper_engineer);
  const portProsper = getInteractiveLocation(
    GAME_CONTENT.locations.port_prosper_signal_exchange,
  );
  assert.equal(
    portProsper.hotspots.filter(
      (hotspot) => hotspot.dialogueId === "port_prosper_engineer",
    ).length,
    3,
  );

  const newsroom = createInitialState();
  newsroom.progress.currentScreen = "location";
  newsroom.progress.currentLocation = "ledger_newsroom";
  const recorder = getInventoryToolContext(
    newsroom,
    "recorder",
    GAME_CONTENT.locations,
  );
  assert.equal(recorder.hotspotId, "newsroom-police-scanner");

  const cityHall = createInitialState();
  cityHall.progress.currentScreen = "location";
  cityHall.progress.currentLocation = "city_hall";
  cityHall.flags.lionelNamedMarsh = true;
  const credentials = getInventoryToolContext(
    cityHall,
    "press_credentials",
    GAME_CONTENT.locations,
  );
  assert.equal(credentials.hotspotId, "finance-dropbox");
});

test("extra hotspot ids and geometry remain valid", () => {
  const ids = new Set();
  for (const hotspots of Object.values(EXTRA_LOCATION_HOTSPOTS)) {
    for (const hotspot of hotspots) {
      assert.equal(ids.has(hotspot.id), false, `duplicate ${hotspot.id}`);
      ids.add(hotspot.id);
      for (const field of ["x", "y", "width", "height"]) {
        assert.equal(typeof hotspot[field], "number");
        assert.ok(hotspot[field] >= 0 && hotspot[field] <= 100);
      }
      if (hotspot.dialogueId) assert.ok(DIALOGUES[hotspot.dialogueId]);
    }
  }
});
