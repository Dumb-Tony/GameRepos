import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(projectRoot, "dist");
const requiredFiles = [
  "index.html",
  "styles.css",
  "src/main.js",
  "src/engine/game-state.js",
  "src/engine/save-system.js",
  "src/engine/conditions.js",
  "src/engine/events.js",
  "src/engine/router.js",
  "src/content/game-content.js",
  "src/ui/app.js",
];

for (const file of requiredFiles) {
  await readFile(resolve(projectRoot, file));
}

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await cp(resolve(projectRoot, "src"), resolve(dist, "src"), { recursive: true });
await cp(resolve(projectRoot, "index.html"), resolve(dist, "index.html"));
await cp(resolve(projectRoot, "styles.css"), resolve(dist, "styles.css"));
await writeFile(
  resolve(dist, "build.json"),
  JSON.stringify(
    {
      name: "The Benefactors",
      milestone: 0,
      builtAt: new Date().toISOString(),
    },
    null,
    2,
  ),
);

console.log(`Static production build created at ${dist}`);

