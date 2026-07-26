import { createInitialState, GameStore } from "./engine/game-state.js?v=prologue-20260726a";
import { ScreenRouter } from "./engine/router.js?v=prologue-20260726a";
import { SaveSystem } from "./engine/save-system.js?v=prologue-20260726a";
import { GameApp } from "./ui/app.js?v=prologue-20260726c";

const root = document.querySelector("#app");
const saves = new SaveSystem();
const settings = saves.loadSettings();
const store = new GameStore(saves.load() || createInitialState({}, settings));
const router = new ScreenRouter();
const app = new GameApp({ root, store, saves, router });

app.start();
