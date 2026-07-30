import { createInitialState, GameStore } from "./engine/game-state.js?v=bellwether-20260730b";
import { ScreenRouter } from "./engine/router.js?v=bellwether-20260730b";
import { SaveSystem } from "./engine/save-system.js?v=bellwether-20260730b";
import { AudioEngine } from "./systems/audio/audio-engine.js?v=bellwether-20260730b";
import { GameApp } from "./ui/app.js?v=bellwether-20260730b";

const root = document.querySelector("#app");
const saves = new SaveSystem();
const audio = new AudioEngine();
const settings = saves.loadSettings();
const store = new GameStore(saves.load() || createInitialState({}, settings));
const router = new ScreenRouter();
const app = new GameApp({ root, store, saves, router, audio });

app.start();
