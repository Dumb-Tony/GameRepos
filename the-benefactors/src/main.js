import { createInitialState, GameStore } from "./engine/game-state.js";
import { ScreenRouter } from "./engine/router.js";
import { SaveSystem } from "./engine/save-system.js";
import { GameApp } from "./ui/app.js?v=noir-20260726";

const root = document.querySelector("#app");
const saves = new SaveSystem();
const settings = saves.loadSettings();
const store = new GameStore(createInitialState({}, settings));
const router = new ScreenRouter();
const app = new GameApp({ root, store, saves, router });

app.start();
