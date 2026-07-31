import { createInitialState, GameStore } from "./engine/game-state.js?v=crownline-20260730a";
import { ScreenRouter } from "./engine/router.js?v=crownline-20260730a";
import { SaveSystem } from "./engine/save-system.js?v=crownline-20260730a";
import { AudioEngine } from "./systems/audio/audio-engine.js?v=crownline-20260730a";
import { GameApp } from "./ui/app.js?v=crownline-20260730a";

const root = document.querySelector("#app");
const saves = new SaveSystem();
const audio = new AudioEngine();
const settings = saves.loadSettings();
const store = new GameStore(saves.load() || createInitialState({}, settings));
const router = new ScreenRouter();
const app = new GameApp({ root, store, saves, router, audio });

app.start();
