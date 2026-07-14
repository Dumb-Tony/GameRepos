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
- The design bible is `tidebound/design/` — treat it as the roadmap
  (49 endings designed, 41 CORES + 12 deaths implemented incl. NG+ ending
  The Loop, What Remains, The Island's Own, The Last Delivery, Keeper of the
  Light, and The Hum Silenced; secret/joke/death categories listed in `design/09-endings.md`,
  current status table in `design/00-state-of-the-game.md`).
