import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(resolve(projectRoot, "styles.css"), "utf8");

test("large displays use the full viewport without breaking authored scene geometry", () => {
  const largeScreenRules = css.slice(css.indexOf("/* Large and ultrawide displays"));

  assert.match(largeScreenRules, /@media \(min-width: 1501px\)/);
  assert.match(largeScreenRules, /\.game-header,[\s\S]*\.location-stage,[\s\S]*width: 100%/);
  assert.match(largeScreenRules, /height: max\(640px, calc\(100dvh - 180px\)\)/);
  assert.match(largeScreenRules, /aspect-ratio: 16 \/ 9/);
  assert.match(largeScreenRules, /calc\(\(100dvh - 180px\) \* 16 \/ 9\)/);
  assert.match(largeScreenRules, /\.location-stage \.location-copy[\s\S]*flex: 1 1 380px/);
});
