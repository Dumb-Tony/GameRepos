import test from "node:test";
import assert from "node:assert/strict";

import { COUNTERMEASURES, PRESSURE_EVENTS } from "../src/content/pressure-content.js";
import { createInitialState } from "../src/engine/game-state.js";
import {
  applyCountermeasure,
  availableCountermeasures,
  pressureStatus,
  syncPressure,
} from "../src/systems/pressure/investigative-pressure.js";

test("story discoveries trigger pressure once without creating a fail state", () => {
  const original = createInitialState();
  original.flags.openedAnonymousEmail = true;
  original.flags.mayorMissing = true;
  const first = syncPressure(original, PRESSURE_EVENTS);
  assert.deepEqual(first.newlyTriggered.map((event) => event.id), ["parked-sedan", "vale-missing"]);
  assert.equal(first.state.pressure.heat, 12);
  assert.equal(first.state.pressure.deadline, "The study will not remain unsecured for long.");
  assert.deepEqual(original.pressure.events, []);

  const repeated = syncPressure(first.state, PRESSURE_EVENTS);
  assert.equal(repeated.state, first.state);
  assert.deepEqual(repeated.newlyTriggered, []);
  assert.equal(pressureStatus(12).label, "Unnoticed");
  assert.equal(pressureStatus(65).label, "Hunted");
  assert.equal(pressureStatus(90).label, "Fully exposed");
});

test("countermeasures trade personal exposure against source safety", () => {
  let state = createInitialState();
  state.flags.downloadedAttachments = true;
  state.flags.uncoveredContractorNetwork = true;
  state.pressure.heat = 20;
  state.characters.mina = { trust: 4, risk: 3, interactions: 1, promises: [], history: [], events: [], assistance: [] };
  const available = availableCountermeasures(state, COUNTERMEASURES);
  assert.deepEqual(available.map((entry) => entry.id), ["mirror-files", "warn-sources"]);

  state = applyCountermeasure(state, available.find((entry) => entry.id === "warn-sources"));
  assert.equal(state.pressure.heat, 24);
  assert.equal(state.characters.mina.risk, 2);
  assert.deepEqual(state.pressure.countermeasures, ["warn-sources"]);

  const repeated = applyCountermeasure(state, available.find((entry) => entry.id === "warn-sources"));
  assert.deepEqual(repeated, state);
});

test("the complete authored threat arc remains soft pressure", () => {
  const state = createInitialState();
  for (const event of PRESSURE_EVENTS) {
    if (event.eligibleWhen.type === "flag") state.flags[event.eligibleWhen.key] = true;
  }
  const result = syncPressure(state, PRESSURE_EVENTS).state;
  assert.equal(result.pressure.events.length, PRESSURE_EVENTS.length);
  assert.equal(result.pressure.heat, 100);
  assert.ok(result.progress);
  assert.equal(Object.hasOwn(result, "gameOver"), false);
});
