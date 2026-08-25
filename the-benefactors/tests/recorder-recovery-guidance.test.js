import test from "node:test";
import assert from "node:assert/strict";

import { CASEBOOK_STAGES } from "../src/content/casebook-content.js";
import { GAME_CONTENT } from "../src/content/game-content.js";

test("the damaged recorder gives a clear, continuous repair trail", () => {
  const recorder = GAME_CONTENT.locations.mayor_study.hotspots.find(
    (hotspot) => hotspot.id === "dictation-recorder",
  );
  const console = GAME_CONTENT.locations.hidden_room.hotspots.find(
    (hotspot) => hotspot.id === "dark-monitors",
  );
  const objective = CASEBOOK_STAGES.find((stage) => stage.id === "restore_recording");

  assert.match(recorder.nextStep, /western bookcase/i);
  assert.match(recorder.text, /need to pick it up/i);
  assert.equal(recorder.actionLabel, "Pick up the damaged recorder");
  assert.match(console.nextStep, /No replacement part is required/i);
  assert.equal(console.route, "recording");
  assert.equal(console.actionWhen.id, "vale_damaged_recording");
  assert.match(objective.objective, /dark-monitor recovery console/i);
});
