import test from "node:test";
import assert from "node:assert/strict";

import {
  EVIDENCE,
  DIALOGUES,
  GAME_CONTENT,
  INVENTORY_ITEMS,
} from "../src/content/game-content.js";
import { validateGameContent } from "../src/engine/content-validation.js";

test("authored game content has valid ids, references, and coordinates", () => {
  assert.deepEqual(
    validateGameContent({
      content: GAME_CONTENT,
      evidence: EVIDENCE,
      inventory: INVENTORY_ITEMS,
      dialogues: DIALOGUES,
    }),
    [],
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
  });

  assert.equal(
    errors.some((error) => error.includes('missing evidence "missing_evidence"')),
    true,
  );
});
