import { createInitialState, GameStore } from "./engine/game-state.js?v=board-canvas-20260730c";
import { ScreenRouter } from "./engine/router.js?v=board-canvas-20260730c";
import { SaveSystem } from "./engine/save-system.js?v=board-canvas-20260730c";
import { AudioEngine } from "./systems/audio/audio-engine.js?v=board-canvas-20260730c";
import { GameApp } from "./ui/app.js?v=board-canvas-20260730c";

const root = document.querySelector("#app");
const saves = new SaveSystem();
const audio = new AudioEngine();
const settings = saves.loadSettings();
const store = new GameStore(saves.load() || createInitialState({}, settings));
const router = new ScreenRouter();
const app = new GameApp({ root, store, saves, router, audio });

app.start();
