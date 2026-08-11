# Working agreements for this repo

## Brainrot (brainrot/)

- **After every update, post the fresh playable link in chat** so the owner never
  has to look for it: https://dumb-tony.github.io/GameRepos/brainrot/
- Development happens on branch `claude/quirky-ride-wkwf19`, and changes are
  pushed to **both** that branch **and `main`** (GitHub Pages serves `main`, and
  the owner has given standing permission to push there directly). `main` also
  carries other projects' work, so merge onto the current `origin/main` rather
  than force-pushing.
- **Mobile is the primary platform** — most players are on a phone. Both
  orientations are first-class: portrait uses bottom-sheet panels, landscape
  uses slim side docks. Verify changes at phone sizes, not just desktop.
- **Bump the `?v=N` cache-bust on every release** (`sed -i 's/?v=N/?v=N+1/g'
  brainrot/index.html`) or players keep the stale cached build.
- House style: plain HTML/CSS/JS, no build step, no dependencies, `BR` global
  namespace, one concern per module. `build.js` bundles everything into a single
  shareable `brainrot.html` — keep its FILES list in sync with index.html's
  `<script>` tags (the build fails loudly if you don't).
- Generated art (Higgsfield) is optional and always behind a fallback: the
  sandbox cannot reach the CDN, so never assume an image loaded. The vector
  sprite atlas in `sprites.js` is the reliable default; HD art is opt-in.
- Verify with the headless harnesses in `scratchpad/` (they are gitignored, so
  recreate them if a container restart wipes them):
  `except.js` (640-run exception/stall sweep), `mobmatrix.js` (9-viewport
  layout), `pacing.js` / `variance.js` (balance), `eventcov.js` (event coverage).
  Screenshot with playwright-core + `/opt/pw-browsers/chromium-1194/...`.
- Accessibility is supported and should not regress: colour-blind palette,
  reduced motion, bigger text, focus rings, aria labels, a screen-reader live
  region. Settings live in `save.js` `settings` and persist.

## Tidebound (tidebound/)

- **After every work session on the game, post the fresh playable link in chat**
  so the owner never has to look for it:
  https://dumb-tony.github.io/GameRepos/tidebound/
  (GitHub Pages serves `main`; work is merged there via PR when a session's
  changes are done — the owner has given standing permission for this.)
- Development happens on branch `claude/island-survival-vn-design-3iyhzk`,
  which is reset onto `origin/main` after each merge.
- Generated art lives ONLY in `tidebound/art/` (one flat folder), referenced by
  filename; new assets are added as `name|url` lines in `tidebound/art/manifest.txt`
  and fetched/optimized by the `fetch-tidebound-art` workflow on push (the
  sandbox's egress cannot reach the art CDN — never try to download it locally).
  Do not read the image files back into context; trust the manifest.
- House style: plain HTML/CSS/JS, no build step, no dependencies. All scene
  effects go in choice `do` / `next` handlers or reload-guarded `enter` hooks,
  never in `text` functions.
- The game is an installable PWA (`tidebound/sw.js` + `manifest.webmanifest`):
  the service worker precaches every code file plus everything in
  `art/manifest.txt`. **On every release, bump `sw.js`'s `VERSION` in lockstep
  with index.html's `?v=` cache-bust** — and when adding a new code file,
  add it to sw.js's `CODE` list (art/audio need nothing: the manifest covers
  them).
- The design bible is `tidebound/design/` — treat it as the roadmap
  (49 endings designed, 41 CORES + 12 deaths implemented incl. NG+ ending
  The Loop, What Remains, The Island's Own, The Last Delivery, Keeper of the
  Light, and The Hum Silenced; secret/joke/death categories listed in `design/09-endings.md`,
  current status table in `design/00-state-of-the-game.md`).

## Tidebound Unity (tidebound-unity/)

- The 3D adventure-RPG adaptation of the VN. Development happens on branch
  `claude/visual-novel-3d-rpg-ss5ld2`. **One phase per conversation, commit
  every session.**
- Read `tidebound/design/UNITY-ADAPTATION.md` (the adaptation bible) and
  `tidebound-unity/CLAUDE.md` (project conventions) before touching it.
- The VN in `tidebound/` is the reference implementation and canon source —
  Unity sessions read it but never modify it.
- The "post the playable link" agreement above is for VN sessions only —
  Unity sessions don't post it.
