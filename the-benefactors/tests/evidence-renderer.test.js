import test from "node:test";
import assert from "node:assert/strict";

import { EVIDENCE } from "../src/content/game-content.js";
import { renderEvidenceArtifact } from "../src/systems/evidence/evidence-renderer.js";

test("renders the full Northstar invoice artifact", () => {
  const html = renderEvidenceArtifact(EVIDENCE.invoice_northstar);

  assert.match(html, /NS-8841/);
  assert.match(html, /Structural excavation and reinforcement/);
  assert.match(html, /\$184,600\.00/);
  assert.match(html, /Clearing Account 7719/);
});

test("renders every collected evidence type as a substantive artifact", () => {
  for (const evidence of Object.values(EVIDENCE)) {
    const html = renderEvidenceArtifact(evidence);
    assert.equal(html.includes("No visual record is available"), false, evidence.id);
    assert.equal(html.length > 300, true, evidence.id);
  }
});

