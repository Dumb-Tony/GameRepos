# Dirty Boy Devs brand assets

Shared branding for all games in this repo.

| File | What it is |
|---|---|
| `dirty-boy-mascot.glb` | The Dirty Boy mascot as a textured 3D model (GLB, ~30k tris, PBR maps). Logo on the back of the shirt, "DIRTY BOY DEVS" text on the front. Drop it into any engine that reads glTF/GLB (Three.js, Godot, Unity, Unreal). |
| `dirty-boy-front.png` | Front reference render (text on chest). |
| `dirty-boy-back.png` | Back reference render (logo between the shoulder blades). |
| `dirty-boy-devs-logo.png` | The round couch/TV "Dirty Boy Devs Gaming Co." emblem. |

Assets are listed as `name|url` lines in `manifest.txt` and downloaded by
the `fetch-brand-assets` GitHub Actions workflow on push (the authoring
sandbox cannot reach the CDN). To add an asset, append a manifest line and
push — CI commits the file here.

## Quick Three.js usage

```js
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
new GLTFLoader().load('brand/dirty-boy-mascot.glb', (gltf) => {
  scene.add(gltf.scene);
});
```
