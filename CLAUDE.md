# Working agreements for this repo

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
