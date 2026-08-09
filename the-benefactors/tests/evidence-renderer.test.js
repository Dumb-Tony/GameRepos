import test from "node:test";
import assert from "node:assert/strict";

import { EVIDENCE } from "../src/content/game-content.js";
import {
  getEvidencePresentation,
  renderEvidenceArtifact,
} from "../src/systems/evidence/evidence-renderer.js";

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
    const presentation = getEvidencePresentation(evidence);
    assert.match(html, new RegExp(`evidence-presentation-${presentation.motif}`), evidence.id);
    assert.match(html, new RegExp(presentation.stamp), evidence.id);
    assert.match(html, new RegExp(presentation.fileNumber), evidence.id);
  }
});

test("memo evidence uses distinct, non-color-only case-file families", () => {
  const memoFamilies = new Set(
    Object.values(EVIDENCE)
      .filter((evidence) => evidence.artifact?.type === "memo")
      .map((evidence) => getEvidencePresentation(evidence).motif),
  );

  assert.deepEqual(
    [...memoFamilies].sort(),
    ["access", "document", "event", "financial", "lead", "location", "organization"],
  );

  for (const evidence of Object.values(EVIDENCE).filter(
    (item) => item.artifact?.type === "memo",
  )) {
    const presentation = getEvidencePresentation(evidence);
    const html = renderEvidenceArtifact(evidence);
    assert.match(html, new RegExp(`artifact-memo--${presentation.motif}`), evidence.id);
    assert.match(html, new RegExp(presentation.label), evidence.id);
  }
});

test("every authored evidence photograph uses a real image asset", () => {
  const photographs = Object.values(EVIDENCE).filter(
    (evidence) => evidence.artifact?.type === "photo",
  );

  assert.equal(photographs.length > 0, true);
  for (const evidence of photographs) {
    assert.match(evidence.artifact.image || "", /^\.\/assets\/.+\.webp$/, evidence.id);
    assert.equal(Boolean(evidence.artifact.alt), true, evidence.id);
    assert.equal(
      renderEvidenceArtifact(evidence).includes("photo-unavailable"),
      false,
      evidence.id,
    );
  }
});
