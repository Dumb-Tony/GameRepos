const VALID_ROUTES = new Set([
  "title",
  "setup",
  "home",
  "location",
  "map",
  "laptop",
  "board",
  "settings",
]);

export class ScreenRouter {
  #listener = null;
  #fallback = "title";

  constructor(windowObject = globalThis.window) {
    this.window = windowObject;
  }

  start(listener, fallback = "title") {
    this.#listener = listener;
    this.#fallback = fallback;
    this.window.addEventListener("hashchange", () => this.#emit());
    this.#emit();
  }

  navigate(route, { replace = false } = {}) {
    const safeRoute = VALID_ROUTES.has(route) ? route : this.#fallback;
    const hash = `#/${safeRoute}`;

    if (replace) {
      this.window.history.replaceState(null, "", hash);
      this.#emit();
      return;
    }

    if (this.window.location.hash === hash) {
      this.#emit();
    } else {
      this.window.location.hash = hash;
    }
  }

  current() {
    const route = this.window.location.hash.replace(/^#\/?/, "");
    return VALID_ROUTES.has(route) ? route : this.#fallback;
  }

  #emit() {
    this.#listener?.(this.current());
  }
}
