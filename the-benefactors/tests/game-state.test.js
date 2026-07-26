import test from "node:test";
import assert from "node:assert/strict";

import {
  DEFAULT_SETTINGS,
  GameStore,
  createInitialState,
  isGameState,
} from "../src/engine/game-state.js";

test("creates a complete serializable initial state", () => {
  const state = createInitialState({
    firstName: "Nell",
    lastName: "Rowan",
    pronouns: "she",
  });

  assert.equal(state.player.firstName, "Nell");
  assert.equal(state.progress.currentLocation, "home_office");
  assert.equal(state.progress.currentScreen, "onboarding");
  assert.deepEqual(state.progress.opening, {
    tutorialChoice: null,
    tutorialStep: 0,
    tutorialCompleted: false,
    cutsceneStep: 0,
    cutsceneCompleted: false,
  });
  assert.equal(state.flags.heardOpeningMessage, false);
  assert.equal(state.progress.prologueEndingStep, 0);
  assert.equal(state.progress.prologueComplete, false);
  assert.deepEqual(state.puzzles.study_plan_alignment, {
    rotation: 90,
    attempts: 0,
    hintsRevealed: 0,
    completed: false,
  });
  assert.deepEqual(state.puzzles.vale_recording_reconstruction.order, [
    "vale_recording_rain",
    "vale_recording_clock",
    "vale_recording_freight",
  ]);
  assert.deepEqual(state.settings, DEFAULT_SETTINGS);
  assert.equal(isGameState(JSON.parse(JSON.stringify(state))), true);
});

test("GameStore snapshots cannot mutate internal state", () => {
  const store = new GameStore(createInitialState());
  const snapshot = store.getState();
  snapshot.flags.mayorMissing = true;

  assert.equal(store.getState().flags.mayorMissing, false);
});

test("GameStore publishes immutable updates", () => {
  const store = new GameStore(createInitialState());
  let receivedReason = "";
  store.subscribe((_state, reason) => {
    receivedReason = reason;
  });

  store.update((draft) => {
    draft.flags.openedAnonymousEmail = true;
  }, "opened-email");

  assert.equal(store.getState().flags.openedAnonymousEmail, true);
  assert.equal(receivedReason, "opened-email");
});
