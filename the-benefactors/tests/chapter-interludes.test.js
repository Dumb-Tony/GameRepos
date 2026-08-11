import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { CHAPTER_INTERLUDES } from "../src/content/cinematic-content.js";
import { createInitialState } from "../src/engine/game-state.js";
import {
  advanceInterlude,
  beginInterlude,
  getCurrentInterlude,
  getPendingInterlude,
  skipInterlude,
} from "../src/systems/cinematics/chapter-interludes.js";

test("every chapter interlude is a complete three-beat illustrated story reel", () => {
  assert.equal(CHAPTER_INTERLUDES.length, 11);
  assert.deepEqual(CHAPTER_INTERLUDES.map((entry) => entry.order), [1,2,3,4,5,6,7,8,9,10,11]);
  for (const interlude of CHAPTER_INTERLUDES) {
    assert.equal(interlude.beats.length, 3, interlude.id);
    assert.ok(interlude.title);
    assert.ok(interlude.eligibleWhen);
    for (const beat of interlude.beats) {
      assert.ok(["transition", "montage", "intercept", "chapter"].includes(beat.kind));
      assert.ok(beat.title);
      assert.ok(beat.text || beat.variants);
      const imagePath = fileURLToPath(new URL(`../${beat.image.replace("./", "")}`, import.meta.url));
      assert.equal(existsSync(imagePath), true, `${interlude.id}: ${beat.image}`);
    }
  }
  assert.ok(CHAPTER_INTERLUDES.filter((entry) => entry.beats.some((beat) => beat.kind === "intercept")).length >= 7);
});

test("only the latest reached chapter prompts, then remains replayable", () => {
  let state = createInitialState();
  state.progress.prologueComplete = true;
  assert.equal(getPendingInterlude(state, CHAPTER_INTERLUDES).id, "northstar");

  state.flags.northstarRoutesToBrighterHorizon = true;
  assert.equal(getCurrentInterlude(state, CHAPTER_INTERLUDES).id, "foundation");
  assert.equal(getPendingInterlude(state, CHAPTER_INTERLUDES).id, "foundation");

  state = beginInterlude(state, "foundation");
  assert.equal(state.cinematics.step, 0);
  state = advanceInterlude(state, CHAPTER_INTERLUDES);
  state = advanceInterlude(state, CHAPTER_INTERLUDES);
  state = advanceInterlude(state, CHAPTER_INTERLUDES);
  assert.deepEqual(state.cinematics.seen, ["foundation"]);
  assert.equal(state.cinematics.activeId, null);
  assert.equal(getPendingInterlude(state, CHAPTER_INTERLUDES), null);

  const replay = beginInterlude(state, "foundation");
  const skipped = skipInterlude(replay, CHAPTER_INTERLUDES);
  assert.deepEqual(skipped.cinematics.seen, ["foundation"]);
  assert.equal(skipped.cinematics.activeId, null);
});

test("the consequence reel preserves all three player choices", () => {
  const reel = CHAPTER_INTERLUDES.find((entry) => entry.id === "consequences");
  assert.deepEqual(Object.keys(reel.beats[0].variants).sort(), ["publish", "stay", "warn"]);
});
