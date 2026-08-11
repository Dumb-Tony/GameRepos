import test from "node:test";
import assert from "node:assert/strict";

import { DIALOGUES } from "../src/content/game-content.js";
import { CHARACTER_PROFILES } from "../src/content/relationship-content.js";
import { createInitialState } from "../src/engine/game-state.js";
import {
  applyRelationshipMoment,
  exposureStatus,
  getRelationshipRecord,
  previewRelationshipMoment,
  relationshipStatus,
  requestSourceHelp,
} from "../src/systems/relationships/relationships.js";

test("every relationship profile maps to a real conversation and useful support", () => {
  assert.ok(Object.keys(CHARACTER_PROFILES).length >= 15);
  for (const [dialogueId, profile] of Object.entries(CHARACTER_PROFILES)) {
    assert.ok(DIALOGUES[dialogueId], dialogueId);
    assert.ok(profile.id);
    assert.ok(profile.name);
    assert.ok(profile.role);
    assert.ok(profile.help);
  }
});

test("evidence, discretion, promises, and exposure build a persistent source relationship", () => {
  const profile = CHARACTER_PROFILES.lionel_records;
  let state = createInitialState();
  const evidenceChoice = {
    id: "show-permit",
    next: "defensive",
    evidenceId: "permit_summary",
  };
  assert.deepEqual(previewRelationshipMoment(profile, "denial", evidenceChoice), {
    trust: 2,
    risk: 1,
    promise: null,
  });
  state = applyRelationshipMoment(state, profile, "denial", evidenceChoice);
  state = applyRelationshipMoment(state, profile, "defensive", {
    id: "protect",
    next: "protected",
  });

  const relationship = getRelationshipRecord(state, profile);
  assert.equal(relationship.trust, 4);
  assert.equal(relationship.risk, 1);
  assert.deepEqual(relationship.promises, ["Keep Lionel out of the story"]);
  assert.equal(relationshipStatus(relationship).label, "Trusted");
  assert.equal(exposureStatus(relationship), "Exposed");

  const repeated = applyRelationshipMoment(state, profile, "defensive", {
    id: "protect",
    next: "protected",
  });
  assert.deepEqual(repeated.characters.lionel, state.characters.lionel);
});

test("a trusted source can reveal one lead once at the cost of exposure", () => {
  const profile = CHARACTER_PROFILES.mara_field_editor;
  let state = createInitialState();
  state.characters.mara = {
    trust: 4,
    risk: 0,
    interactions: 2,
    promises: [],
    history: [],
    events: [],
    assistance: [],
  };
  state = requestSourceHelp(state, profile, "intercept_vesper_packet");
  assert.equal(state.journal.revealedHints.intercept_vesper_packet, 1);
  assert.equal(state.characters.mara.risk, 1);
  assert.deepEqual(state.characters.mara.assistance, ["intercept_vesper_packet"]);

  const repeated = requestSourceHelp(state, profile, "intercept_vesper_packet");
  assert.deepEqual(repeated, state);
});
