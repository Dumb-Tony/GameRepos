import test from "node:test";
import assert from "node:assert/strict";

import {
  PERSISTENT_GAME_ROUTES,
  ScreenRouter,
  VALID_ROUTES,
} from "../src/engine/router.js";

class FakeWindow {
  location = { hash: "" };
  listeners = new Map();
  history = {
    replaceState: (_state, _title, hash) => {
      this.location.hash = hash;
    },
  };

  addEventListener(name, listener) {
    this.listeners.set(name, listener);
  }
}

test("opening screens are valid persistent routes", () => {
  for (const route of ["onboarding", "tutorial", "cutscene"]) {
    assert.equal(VALID_ROUTES.has(route), true);
    assert.equal(PERSISTENT_GAME_ROUTES.has(route), true);
  }
});

test("router accepts opening screens and falls back from unknown routes", () => {
  const windowObject = new FakeWindow();
  const router = new ScreenRouter(windowObject);

  router.navigate("tutorial");
  assert.equal(router.current(), "tutorial");

  router.navigate("not-a-screen");
  assert.equal(router.current(), "title");
});
