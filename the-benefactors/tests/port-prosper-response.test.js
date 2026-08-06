import test from "node:test";
import assert from "node:assert/strict";

import { createInitialState } from "../src/engine/game-state.js";
import {
  PORT_PROSPER_RESPONSES,
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
