import test from "node:test";
import assert from "node:assert/strict";

import { createInitialState } from "../src/engine/game-state.js";
import {
  PORT_PROSPER_RESPONSES,
  advancePortProsperAftermath,
  applyPortProsperResponse,
} from "../src/systems/decisions/port-prosper-response.js";

test("all Port Prosper responses create distinct persistent consequences", () => {
  const evidenceIds = new Set();
  for (const response of Object.values(PORT_PROSPER_RESPONSES)) {
    const source = createInitialState();
    source.flags.provedBenefactorsSelectCrises = true;
    const next = applyPortProsperResponse(source, response.id);

    assert.equal(source.progress.portProsperResponse, null);
    assert.equal(next.progress.portProsperResponse, response.id);
    assert.equal(next.flags.portProsperDecisionMade, true);
    assert.equal(next.flags[response.flag], true);
    assert.equal(next.evidence.collected.includes(response.evidenceId), true);
    assert.equal(next.progress.chapter, 8);
    assert.equal(next.progress.officeState, 15);
    evidenceIds.add(response.evidenceId);
  }
  assert.equal(evidenceIds.size, 3);
});

test("the Port Prosper response is gated and cannot be replaced", () => {
  const source = createInitialState();
  assert.throws(
    () => applyPortProsperResponse(source, "warn"),
    /must be proven/,
  );

  source.flags.provedBenefactorsSelectCrises = true;
  const warned = applyPortProsperResponse(source, "warn");
  const attemptedReplacement = applyPortProsperResponse(warned, "publish");
  assert.equal(attemptedReplacement, warned);
  assert.equal(attemptedReplacement.progress.portProsperResponse, "warn");
  assert.equal(attemptedReplacement.flags.publishedFirstCircleEvidence, false);
});

test("every response has a three-beat aftermath that converges on Aster House", () => {
  for (const response of Object.values(PORT_PROSPER_RESPONSES)) {
    let state = createInitialState();
    state.flags.provedBenefactorsSelectCrises = true;
    state = applyPortProsperResponse(state, response.id);

    assert.equal(response.aftermath.length, 3);
    for (let step = 0; step < response.aftermath.length; step += 1) {
      state = advancePortProsperAftermath(state);
      assert.equal(state.progress.portProsperFalloutStep, step + 1);
    }

    assert.equal(state.flags.portProsperFalloutSeen, true);
    assert.equal(state.flags.identifiedAsterHouse, true);
    assert.equal(state.evidence.collected.includes("aster_house_trace"), true);
    assert.equal(state.progress.unlockedLocations.includes("aster_house"), true);
    assert.equal(advancePortProsperAftermath(state), state);
  }
});

test("aftermath cannot begin before the player chooses a response", () => {
  assert.throws(
    () => advancePortProsperAftermath(createInitialState()),
    /must be chosen/,
  );
});
