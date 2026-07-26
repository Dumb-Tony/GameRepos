import test from "node:test";
import assert from "node:assert/strict";

import {
  EVIDENCE,
  DIALOGUES,
  DEDUCTIONS,
  GAME_CONTENT,
  INVENTORY_ITEMS,
} from "../src/content/game-content.js";
import {
  PROLOGUE_ENDING_BEATS,
  RECORDING_PUZZLE,
  STUDY_ALIGNMENT_PUZZLE,
} from "../src/content/prologue-content.js";
import { validateGameContent } from "../src/engine/content-validation.js";

test("authored game content has valid ids, references, and coordinates", () => {
  assert.deepEqual(
    validateGameContent({
      content: GAME_CONTENT,
      evidence: EVIDENCE,
      inventory: INVENTORY_ITEMS,
      dialogues: DIALOGUES,
      deductions: DEDUCTIONS,
      studyAlignment: STUDY_ALIGNMENT_PUZZLE,
      recordingPuzzle: RECORDING_PUZZLE,
      endingBeats: PROLOGUE_ENDING_BEATS,
    }),
    [],
  );
});

test("content validation checks location puzzle routes", () => {
  const content = structuredClone(GAME_CONTENT);
  content.locations.mayor_study.hotspots.find(
    (hotspot) => hotspot.id === "western-bookcase",
  ).route = "missing-puzzle";

  const errors = validateGameContent({
    content,
    evidence: EVIDENCE,
    inventory: INVENTORY_ITEMS,
    dialogues: DIALOGUES,
    deductions: DEDUCTIONS,
  });

  assert.equal(
    errors.some((error) =>
      error.includes('references missing route "missing-puzzle"'),
    ),
    true,
  );
});

test("content validation checks recording fragment orders and ending evidence", () => {
  const recordingPuzzle = structuredClone(RECORDING_PUZZLE);
  recordingPuzzle.correctOrder[2] = "missing-fragment";
  const endingBeats = structuredClone(PROLOGUE_ENDING_BEATS);
  endingBeats[4].evidenceId = "missing-evidence";

  const errors = validateGameContent({
    content: GAME_CONTENT,
    evidence: EVIDENCE,
    inventory: INVENTORY_ITEMS,
    dialogues: DIALOGUES,
    deductions: DEDUCTIONS,
    studyAlignment: STUDY_ALIGNMENT_PUZZLE,
    recordingPuzzle,
    endingBeats,
  });

  assert.equal(
    errors.some((error) => error.includes("invalid solution order")),
    true,
  );
  assert.equal(
    errors.some((error) =>
      error.includes('references missing evidence "missing-evidence"'),
    ),
    true,
  );
});

test("content validation reports broken evidence references", () => {
  const content = structuredClone(GAME_CONTENT);
  content.locations.city_hall.hotspots[0].effects.push({
    type: "collectEvidence",
    id: "missing_evidence",
  });

  const errors = validateGameContent({
    content,
    evidence: EVIDENCE,
    inventory: INVENTORY_ITEMS,
    dialogues: DIALOGUES,
    deductions: DEDUCTIONS,
  });

  assert.equal(
    errors.some((error) => error.includes('missing evidence "missing_evidence"')),
    true,
  );
});

test("content validation checks home-office routes", () => {
  const content = structuredClone(GAME_CONTENT);
  content.officeHotspots[0].route = "missing-screen";

  const errors = validateGameContent({
    content,
    evidence: EVIDENCE,
    inventory: INVENTORY_ITEMS,
    dialogues: DIALOGUES,
    deductions: DEDUCTIONS,
  });

  assert.equal(
    errors.some((error) =>
      error.includes('references missing route "missing-screen"'),
    ),
    true,
  );
});
