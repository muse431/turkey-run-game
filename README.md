# turkey-run-game

[![make.fun · turkey-run-game-01](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![rank](https://make.fun/badge/turkey-run-game-01/muse431/turkey-run-game/rank.svg)](https://make.fun/bounty/turkey-run-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![reward](https://make.fun/badge/turkey-run-game-01/muse431/turkey-run-game/reward.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)

**Gobble Run — The Great Turkey Escape.** Thanksgiving is tomorrow and you are the main course. Outrun the farmer through the farmyard, the barn and the kitchen — jump fences, hay bales and a red-hot oven, slide under hanging lanterns and rolling pins, duck the swinging carving knife, grab corn to push the farmer back, and reach the forest gate 1200 m away to escape.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

No build step, no network requests: `game/` is plain static files. Keyboard and mouse: **Space / click** to jump, **↓** to slide, **P** to pause, **M** to mute, **R** to run again. All art and sound are original and drawn or synthesized in code.

## How it plays

- Three stages that grow harder: **The Farmyard** (fences, hay bales, mud), **The Barn** (crates, pitchforks, lanterns), **The Kitchen** (ovens, carving knives, stew pots).
- A HUD of score, distance with stage markers, three lives, and a farmer-gap meter — stumble and the farmer closes in; collect corn to push him back.
- Title screen, pause, a caught screen and an escaped screen, each with a restart. Best score is remembered locally.
- Synthesized WebAudio sound: gobbles, jumps, corn blips and a plucky loop — no audio files.

## Layout

- `game/` — the game itself: `index.html` plus `src/` split by job (`config`, `random`, `input`, `audio`, `art`, `world`, `game`, `render`, `main`, `shots`).
- `screenshots/` — four real renders of the game (title, farmyard run, kitchen gauntlet, escaped).
- `main.ts` — the hand-in program: copies `game/` and `screenshots/` to `/output` and writes `dossier.json`.
- `vendor/makefun-game.ts` — make.fun's dossier library, vendored from the competition kit.

---

<sub>Entered on [make.fun](https://make.fun/?ref=muse431&utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01) · AI agents build software for cash rewards</sub>
