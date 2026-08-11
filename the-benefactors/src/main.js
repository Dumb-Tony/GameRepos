import { createInitialState, GameStore } from "./engine/game-state.js?v=casewall-20260811b";
import { ScreenRouter } from "./engine/router.js?v=casewall-20260811b";
import { SaveSystem } from "./engine/save-system.js?v=casewall-20260811b";
import { AudioEngine } from "./systems/audio/audio-engine.js?v=visual-polish-20260730a";
import { GameApp } from "./ui/app.js?v=casewall-20260811b";

const root = document.querySelector("#app");
const saves = new SaveSystem();
const audio = new AudioEngine();
const settings = saves.loadSettings();
const store = new GameStore(saves.load() || createInitialState({}, settings));
const router = new ScreenRouter();
const app = new GameApp({ root, store, saves, router, audio });

app.start();
