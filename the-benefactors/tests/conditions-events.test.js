import test from "node:test";
import assert from "node:assert/strict";

import { evaluateCondition, filterAvailable } from "../src/engine/conditions.js";
import { applyEffects } from "../src/engine/events.js";
import { createInitialState } from "../src/engine/game-state.js";

test("evaluates composed content conditions", () => {
  const state = createInitialState();
  state.flags.openedAnonymousEmail = true;
  state.evidence.collected.push("invoice_northstar");

  assert.equal(
    evaluateCondition(
      {
        all: [
          { type: "flag", key: "openedAnonymousEmail" },
          { type: "hasEvidence", id: "invoice_northstar" },
          { not: { type: "flag", key: "mayorMissing" } },
        ],
      },
      state,
    ),
    true,
  );
});

test("filters unavailable authored content", () => {
  const state = createInitialState();
  const items = [
    { id: "always" },
    { id: "later", visibleWhen: { type: "flag", key: "mayorMissing" } },
  ];

  assert.deepEqual(
    filterAvailable(items, state).map((item) => item.id),
    ["always"],
  );
});

test("applies declarative effects without mutating source state", () => {
  const source = createInitialState();
  const next = applyEffects(source, [
    { type: "setFlag", key: "openedAnonymousEmail", value: true },
    { type: "collectEvidence", id: "invoice_northstar" },
    { type: "collectEvidence", id: "invoice_northstar" },
    { type: "unlockLocation", id: "city_hall" },
    { type: "unlockLocation", id: "city_hall" },
    { type: "visitLocation", id: "ledger_newsroom" },
  ]);

  assert.equal(source.flags.openedAnonymousEmail, false);
  assert.equal(next.flags.openedAnonymousEmail, true);
  assert.deepEqual(next.evidence.collected, ["invoice_northstar"]);
  assert.equal(next.progress.unlockedLocations.filter((id) => id === "city_hall").length, 1);
  assert.equal(next.locationVisits.ledger_newsroom, 1);
});
