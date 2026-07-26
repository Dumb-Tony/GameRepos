import { createInitialState, GameStore } from "./engine/game-state.js?v=onboarding-20260726b";
import { ScreenRouter } from "./engine/router.js?v=onboarding-20260726b";
import { SaveSystem } from "./engine/save-system.js?v=onboarding-20260726b";
import { GameApp } from "./ui/app.js?v=onboarding-20260726b";

const root = document.querySelector("#app");
const saves = new SaveSystem();
const settings = saves.loadSettings();
const store = new GameStore(saves.load() || createInitialState({}, settings));
const router = new ScreenRouter();
const app = new GameApp({ root, store, saves, router });

app.start();
