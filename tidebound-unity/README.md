# Tidebound (Unity)

3D narrative survival-adventure RPG adaptation of the
[Tidebound visual novel](https://dumb-tony.github.io/GameRepos/tidebound/).
You wash ashore on an island no chart admits exists. One hundred days. One
companion. Forty-nine ways it ends.

## Opening the project

1. Install **Unity 6 LTS** (any `6000.0.x` or newer) with the *Universal RP*
   feature set via Unity Hub.
2. `git clone` this repo, then in Unity Hub: **Add → `tidebound-unity/`**.
   First import resolves packages and compiles — takes a few minutes.
3. Run **Tidebound ▸ Setup ▸ Configure Project (URP + Player)** once.
4. Run **Tidebound ▸ Narrative ▸ Import Content JSON** once to build the
   narrative database asset from the extracted VN content.

## Tests

Window ▸ General ▸ **Test Runner** ▸ EditMode ▸ Run All. Everything should
be green; if it isn't, that's a bug worth reporting.

## For contributors (human or Claude)

Working agreements live in [`CLAUDE.md`](CLAUDE.md); the adaptation plan is
[`../tidebound/design/UNITY-ADAPTATION.md`](../tidebound/design/UNITY-ADAPTATION.md).
Before committing binary assets, `git lfs install` (the `.gitattributes`
already routes binaries to LFS).
