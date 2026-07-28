import { createInitialState, GameStore } from "./engine/game-state.js?v=polish-20260727b";
import { ScreenRouter } from "./engine/router.js?v=polish-20260727b";
import { SaveSystem } from "./engine/save-system.js?v=polish-20260727b";
import { AudioEngine } from "./systems/audio/audio-engine.js?v=polish-20260727b";
import { GameApp } from "./ui/app.js?v=polish-20260727b";

const root = document.querySelector("#app");
const saves = new SaveSystem();
const audio = new AudioEngine();
const settings = saves.loadSettings();
const store = new GameStore(saves.load() || createInitialState({}, settings));
const router = new ScreenRouter();
const app = new GameApp({ root, store, saves, router, audio });

app.start();
