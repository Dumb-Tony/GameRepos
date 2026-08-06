import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { RECORDING_PUZZLE } from "../src/content/prologue-content.js";
import { EVIDENCE } from "../src/content/game-content.js";

test("every Vale recording has a playable WAV asset", async () => {
  const paths = [
    ...RECORDING_PUZZLE.fragments.map((fragment) => fragment.audio),
    RECORDING_PUZZLE.recoveredAudio,
  ];

  assert.equal(paths.length, 4);
  for (const relativePath of paths) {
    assert.match(relativePath, /^\.\/assets\/audio\/.+\.wav$/);
    const bytes = await readFile(new URL(`../${relativePath.slice(2)}`, import.meta.url));
    assert.equal(bytes.subarray(0, 4).toString("ascii"), "RIFF");
    assert.equal(bytes.subarray(8, 12).toString("ascii"), "WAVE");
    assert.equal(bytes.length > 100_000, true);
  }
});

test("the First Circle vote has a playable WAV asset", async () => {
  const relativePath = EVIDENCE.first_circle_vote_recording.artifact.audio;
  assert.match(relativePath, /^\.\/assets\/audio\/.+\.wav$/);
  const bytes = await readFile(new URL(`../${relativePath.slice(2)}`, import.meta.url));
  assert.equal(bytes.subarray(0, 4).toString("ascii"), "RIFF");
  assert.equal(bytes.subarray(8, 12).toString("ascii"), "WAVE");
  assert.equal(bytes.length > 100_000, true);
});
