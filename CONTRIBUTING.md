# Contributing A Game

Thanks for building a Playus game.

## How To Submit

1. Create a new folder under `games/<your-game-id>`.
2. Start from `games/starter-game` or one of the examples.
3. Keep your game short, portrait-first, and easy to understand.
4. Bundle required assets locally in your game folder.
5. Test it in the local tester.
6. If you add a new framework or runtime, explain why it is a good mobile WebView fit.
7. Open a PR with only your game and any docs needed to understand it.

## What We Review

- The game sends `ready`, `started`, `score`, and `finished` at the right time.
- Live score updates are meaningful for a leaderboard and are not sent every frame.
- The final score is a single exact number in the real score unit.
- The game ends clearly.
- Required assets are local and load before `ready()`.
- Gameplay randomness is seeded when it affects fairness.
- The framework/runtime choice is lean enough for mobile WebViews.
- The code is simple enough for Playus to adapt internally.

## What Not To Include

- Login, accounts, networking, analytics, ads, or payments.
- A custom leaderboard or result/upload screen.
- External runtime data fetches required for the game to work.
- Heavy engine exports unless Playus agreed to the tradeoff first.
- Localization systems, language switchers, or host mute controls.
- Obfuscated or minified source code.
- Internal Playus host assumptions.

Playus may make integration changes after accepting a game.
