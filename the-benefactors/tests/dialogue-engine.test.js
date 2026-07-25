import test from "node:test";
import assert from "node:assert/strict";

import { DIALOGUES } from "../src/content/game-content.js";
import { applyEffects } from "../src/engine/events.js";
import { createInitialState } from "../src/engine/game-state.js";
import {
  advanceDialogue,
  getAvailableChoices,
  getDialogueNode,
  startDialogue,
} from "../src/systems/dialogue/dialogue-engine.js";

test("starts dialogue at its authored start node", () => {
  const state = startDialogue(createInitialState(), DIALOGUES, "lionel_records");

  assert.equal(state.dialogue.activeDialogueId, "lionel_records");
  assert.equal(state.dialogue.activeNodeId, "intro");
  assert.deepEqual(state.dialogue.visitedNodes, ["lionel_records.intro"]);
});

test("evidence gates dialogue choices", () => {
  const state = createInitialState();
  const intro = getDialogueNode(DIALOGUES, "lionel_records", "intro");

  assert.equal(
    getAvailableChoices(intro, state).some((choice) => choice.id === "show-invoice"),
    false,
  );

  state.evidence.collected.push("invoice_northstar");
  assert.equal(
    getAvailableChoices(intro, state).some((choice) => choice.id === "show-invoice"),
    true,
  );
});

test("conversation effects become persistent evidence", () => {
  let state = startDialogue(createInitialState(), DIALOGUES, "june_window");
  const intro = getDialogueNode(DIALOGUES, "june_window", "intro");
  const direct = intro.choices.find((choice) => choice.id === "direct");
  state = advanceDialogue(state, "june_window", direct);

  const construction = getDialogueNode(
    DIALOGUES,
    "june_window",
    state.dialogue.activeNodeId,
  );
  state = applyEffects(state, construction.onEnter);

  assert.equal(state.flags.juneSawDeliveries, true);
  assert.equal(state.evidence.collected.includes("june_statement"), true);
});

