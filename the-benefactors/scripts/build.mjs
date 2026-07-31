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
import {
  PROLOGUE_ENDING_BEATS,
  RECORDING_PUZZLE,
  STUDY_ALIGNMENT_PUZZLE,
} from "../src/content/prologue-content.js";
import { assertValidGameContent } from "../src/engine/content-validation.js";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = resolve(projectRoot, "dist");
const imageAssetFiles = [
  "assets/scenes/home-office.webp",
  "assets/scenes/newsroom.webp",
  "assets/scenes/city-hall.webp",
  "assets/scenes/vale-street.webp",
  "assets/scenes/vale-study.webp",
  "assets/scenes/hidden-room.webp",
  "assets/scenes/lionel-price.webp",
  "assets/scenes/june-bell.webp",
  "assets/scenes/northstar-harrow.webp",
  "assets/scenes/brighter-horizon-office.webp",
  "assets/scenes/calder-grand-gala.webp",
  "assets/scenes/calder-grand-service-corridor.webp",
  "assets/scenes/bellwether-relief-station.webp",
  "assets/scenes/university-river-annex.webp",
  "assets/scenes/verdant-conservation-parcel.webp",
  "assets/scenes/crownline-data-center.webp",
  "assets/social/benefactors-social.webp",
  "assets/evidence/gala-photograph.webp",
];
const requiredFiles = [
  "index.html",
  "styles.css",
  "src/main.js",
  "src/engine/game-state.js",
  "src/engine/player-language.js",
  "src/engine/save-system.js",
  "src/engine/conditions.js",
  "src/engine/content-validation.js",
  "src/engine/events.js",
  "src/engine/router.js",
  "src/content/game-content.js",
  "src/content/casebook-content.js",
  "src/content/onboarding-content.js",
  "src/content/prologue-content.js",
  "src/systems/exploration/scene-renderer.js",
  "src/systems/dialogue/dialogue-engine.js",
  "src/systems/evidence-board/evidence-board.js",
  "src/systems/evidence/evidence-renderer.js",
  "src/systems/audio/audio-engine.js",
  "src/systems/puzzles/plan-alignment.js",
  "src/systems/puzzles/recording-reconstruction.js",
  "src/ui/app.js",
  "src/ui/transient-notice.js",
  ...imageAssetFiles,
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
  studyAlignment: STUDY_ALIGNMENT_PUZZLE,
  recordingPuzzle: RECORDING_PUZZLE,
  endingBeats: PROLOGUE_ENDING_BEATS,
});

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await cp(resolve(projectRoot, "src"), resolve(dist, "src"), { recursive: true });
await cp(resolve(projectRoot, "index.html"), resolve(dist, "index.html"));
await cp(resolve(projectRoot, "styles.css"), resolve(dist, "styles.css"));
await cp(resolve(projectRoot, "assets"), resolve(dist, "assets"), { recursive: true });
await cp(
  resolve(projectRoot, ".openai"),
  resolve(dist, ".openai"),
  { recursive: true },
);

const deployedFiles = [
  "index.html",
  "styles.css",
  ...imageAssetFiles,
  ...requiredFiles.filter((file) => file.startsWith("src/")),
];
const assets = {};
for (const file of deployedFiles) {
  const route = file === "index.html" ? "/index.html" : `/${file.replaceAll("\\", "/")}`;
  const binary = file.endsWith(".webp");
  const source = await readFile(resolve(projectRoot, file), binary ? undefined : "utf8");
  const contentType = file.endsWith(".html")
    ? "text/html; charset=utf-8"
    : file.endsWith(".css")
      ? "text/css; charset=utf-8"
      : file.endsWith(".webp")
        ? "image/webp"
      : "text/javascript; charset=utf-8";
  assets[route] = {
    body: binary ? source.toString("base64") : source,
    contentType,
    encoding: binary ? "base64" : "utf8",
  };
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

    const body = asset.encoding === "base64"
      ? Uint8Array.from(atob(asset.body), (character) => character.charCodeAt(0))
      : asset.body;

    return new Response(request.method === "HEAD" ? null : body, {
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
      milestone: 5,
      builtAt: new Date().toISOString(),
    },
    null,
    2,
  ),
);

console.log(`Static production build created at ${dist}`);
