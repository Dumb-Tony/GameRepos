import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function filesBelow(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? filesBelow(path) : [path];
  });
}

test("the shipped interface and authored text contain no mojibake", () => {
  const files = [
    ...filesBelow(resolve(projectRoot, "src")).filter((file) => file.endsWith(".js")),
    resolve(projectRoot, "index.html"),
    resolve(projectRoot, "styles.css"),
    resolve(projectRoot, "README.md"),
  ];
  const brokenText = /Ã|Â|â€|â†|�/u;
  for (const file of files) {
    assert.doesNotMatch(readFileSync(file, "utf8"), brokenText, file);
  }
});

test("every browser module import resolves and the final cache token is consistent", () => {
  const modules = filesBelow(resolve(projectRoot, "src")).filter((file) => file.endsWith(".js"));
  for (const file of modules) {
    const source = readFileSync(file, "utf8");
    for (const match of source.matchAll(/from\s+["'](\.[^"']+)["']/g)) {
      const [path] = match[1].split("?");
      assert.equal(existsSync(resolve(dirname(file), path)), true, `${file}: ${match[1]}`);
      if (match[1].includes("?v=")) assert.match(match[1], /\?v=interaction-clarity-20260827b$/);
    }
  }
  const index = readFileSync(resolve(projectRoot, "index.html"), "utf8");
  assert.equal((index.match(/interaction-clarity-20260827b/g) || []).length, 2);
});

test("the production build explicitly verifies every milestone system", () => {
  const build = readFileSync(resolve(projectRoot, "scripts/build.mjs"), "utf8");
  for (const path of [
    "src/content/cinematic-content.js",
    "src/content/relationship-content.js",
    "src/content/pressure-content.js",
    "src/systems/cinematics/chapter-interludes.js",
    "src/systems/relationships/relationships.js",
    "src/systems/pressure/investigative-pressure.js",
  ]) {
    assert.match(build, new RegExp(path.replaceAll("/", "\\/")));
  }
  assert.match(build, /release: "interaction-clarity-20260827b"/);
});
