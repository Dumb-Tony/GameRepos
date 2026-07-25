import test from "node:test";
import assert from "node:assert/strict";

import { createInitialState } from "../src/engine/game-state.js";
import { SAVE_KEY, SaveSystem } from "../src/engine/save-system.js";

class MemoryStorage {
  values = new Map();

  getItem(key) {
    return this.values.has(key) ? this.values.get(key) : null;
  }

  setItem(key, value) {
    this.values.set(key, String(value));
  }

  removeItem(key) {
    this.values.delete(key);
  }
}

test("round-trips a versioned save", () => {
  const storage = new MemoryStorage();
  const saves = new SaveSystem(storage);
  const state = createInitialState({ firstName: "Inez" });
  state.flags.visitedNewsroom = true;

  saves.save(state, "test");
  const loaded = saves.load();

  assert.equal(saves.hasSave(), true);
  assert.equal(loaded.player.firstName, "Inez");
  assert.equal(loaded.flags.visitedNewsroom, true);
  assert.equal(loaded.meta.lastSaveReason, "test");
});

test("returns null for corrupted or future saves", () => {
  const storage = new MemoryStorage();
  const saves = new SaveSystem(storage);

  storage.setItem(SAVE_KEY, "{broken");
  assert.equal(saves.load(), null);

  storage.setItem(SAVE_KEY, JSON.stringify({ version: 999 }));
  assert.equal(saves.load(), null);
});

test("deletes an existing save", () => {
  const storage = new MemoryStorage();
  const saves = new SaveSystem(storage);
  saves.save(createInitialState());
  saves.deleteSave();

  assert.equal(saves.hasSave(), false);
});

