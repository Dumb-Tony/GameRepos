import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { GAME_CONTENT } from "../src/content/game-content.js";
import { TUTORIAL_STEPS } from "../src/content/onboarding-content.js";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const appSource = readFileSync(resolve(projectRoot, "src/ui/app.js"), "utf8");

test("the tutorial teaches inspect-then-act interaction before fieldwork", () => {
  const step = TUTORIAL_STEPS.find((entry) => entry.id === "point-and-click");
  assert.match(step.text, /separate highlighted action/i);
  assert.match(step.text, /pick up evidence, talk, use a tool, or continue/i);
});

test("every actionable scene hotspot has a player-facing action label", () => {
  for (const location of Object.values(GAME_CONTENT.locations)) {
    for (const hotspot of location.hotspots || []) {
      const isActionable = hotspot.dialogueId || hotspot.route || hotspot.effects;
      if (!isActionable) continue;
      assert.ok(
        hotspot.actionLabel?.trim(),
        `${location.id}:${hotspot.id} needs an action label`,
      );
    }
  }
});

test("scene observations announce and focus newly revealed actions", () => {
  assert.match(appSource, /Action available/);
  assert.match(appSource, /scene-action-button/);
  assert.match(appSource, /querySelector\("\[data-action='hotspot-action'\]"\)[\s\S]*focus\(\)/);
});
