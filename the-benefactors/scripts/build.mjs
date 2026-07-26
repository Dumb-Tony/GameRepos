import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  EVIDENCE,
  DIALOGUES,
  DEDUCTIONS,
  GAME_CONTENT,
  INVENTORY_ITEMS,
} from "../src/content/game-content.js";
import { assertValidGameContent } from "../src/engine/content-validation.js";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(projectRoot, "dist");
const requiredFiles = [
  "index.html",
  "styles.css",
  "src/main.js",
  "src/engine/game-state.js",
  "src/engine/save-system.js",
  "src/engine/conditions.js",
  "src/engine/content-validation.js",
  "src/engine/events.js",
  "src/engine/router.js",
  "src/content/game-content.js",
  "src/systems/exploration/scene-renderer.js",
  "src/systems/dialogue/dialogue-engine.js",
  "src/systems/evidence-board/evidence-board.js",
  "src/systems/evidence/evidence-renderer.js",
  "src/ui/app.js",
];

for (const file of requiredFiles) {
  await readFile(resolve(projectRoot, file));
}

assertValidGameContent({
  content: GAME_CONTENT,
  evidence: EVIDENCE,
  inventory: INVENTORY_ITEMS,
  dialogues: DIALOGUES,
  deductions: DEDUCTIONS,
});

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await cp(resolve(projectRoot, "src"), resolve(dist, "src"), { recursive: true });
await cp(resolve(projectRoot, "index.html"), resolve(dist, "index.html"));
await cp(resolve(projectRoot, "styles.css"), resolve(dist, "styles.css"));
await cp(
  resolve(projectRoot, ".openai"),
  resolve(dist, ".openai"),
  { recursive: true },
);

const deployedFiles = [
  "index.html",
  "styles.css",
  ...requiredFiles.filter((file) => file.startsWith("src/")),
];
const assets = {};
for (const file of deployedFiles) {
  const route = file === "index.html" ? "/index.html" : `/${file.replaceAll("\\", "/")}`;
  const body = await readFile(resolve(projectRoot, file), "utf8");
  const contentType = file.endsWith(".html")
    ? "text/html; charset=utf-8"
    : file.endsWith(".css")
      ? "text/css; charset=utf-8"
      : "text/javascript; charset=utf-8";
  assets[route] = { body, contentType };
}

const serverSource = `
const ASSETS = ${JSON.stringify(assets)};

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname === "/" ? "/index.html" : url.pathname;
    const asset = ASSETS[path];

    if (!asset) {
      return new Response("Not found", {
        status: 404,
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }

    return new Response(request.method === "HEAD" ? null : asset.body, {
      status: 200,
      headers: {
        "content-type": asset.contentType,
        "cache-control": path === "/index.html"
          ? "no-cache"
          : "public, max-age=300",
        "x-content-type-options": "nosniff",
        "referrer-policy": "same-origin",
      },
    });
  },
};
`;

await mkdir(resolve(dist, "server"), { recursive: true });
await writeFile(resolve(dist, "server", "index.js"), serverSource);
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
