# Game Contract

The public contract is intentionally small.

## Required Flow

1. Configure the game id.
2. Load required assets.
3. Call `ready()`.
4. Wait for the player to start.
5. Call `started()`.
6. Send score updates when they matter for the live leaderboard.
7. Call `finished(finalScore)` exactly once.

```ts
import { playus } from '@playus';

playus.configure({ gameId: 'my-game' });

async function setup() {
  await loadRequiredAssets();
  playus.game.ready();
}

function startRun() {
  playus.game.started();
}

function updateScore(score: number) {
  playus.game.score(score);
}

function finishRun(finalScore: number) {
  playus.game.finished(finalScore);
}
```

## Ready

Call `ready()` when the game can be shown and played without waiting on required assets.

Good examples:

- Phaser textures loaded in `preload()`.
- Babylon models loaded and the first scene is ready.
- Required JSON/config files have loaded.

Do not call `ready()` while the first playable frame still depends on a pending required fetch.

## Started

Call `started()` when the run actually begins. Usually this is the first real player input after the tap-to-start overlay.

```ts
import { createTapToStartOverlay } from '@playus';

createTapToStartOverlay({
  mode: 'dismiss-only',
  onStart: startGame,
});
```

Use `dismiss-only` when the first tap should only close the hint. Use `pass-first-input` when that tap should also count as gameplay input.

## Score

Every game must finish with one numeric score. You only send the numeric value through the bridge. Playus assigns the final score type and display rules internally.

Supported Playus score types are:

- seconds
- points
- errors
- percent
- levels

Send `score(score)` when the live score meaningfully changes. These updates are used for the live leaderboard, so they should be useful but not noisy.

For time-based games, do not send a new millisecond value every frame. Send updates at sensible points instead, for example full seconds or another visible score step.

Send score values in the real score unit:

- seconds as seconds, not milliseconds: `500ms` is `0.5`, not `500`
- points as points
- errors as error counts
- percentages as percent values
- levels as level numbers

Playus compares all leaderboard values with the same `>` operator and displays scores as positive values. If a smaller score is better, send it as a negative number:

```ts
const elapsedSeconds = 4.82;
playus.game.score(-4);
playus.game.finished(-elapsedSeconds);
```

Negative values are only the ranking format for lower-is-better games. Do not design games around real negative scores.

## Finished

Call `finished(finalScore)` once when the run is over. Use the final, exact score here, even if live `score()` updates were rounded or throttled.

```ts
const elapsedSeconds = 4.827;

playus.game.score(-4);
playus.game.finished(-elapsedSeconds);
```

Playus handles the final result UI internally.

## Seeded Random

Use seeded randomness when randomness changes gameplay, difficulty, layout, or scoring opportunity.

```ts
import {
  createSeededRandom,
  getGameSeed,
  seededBetween,
  seededFloatBetween,
  seededShuffle,
} from '@playus';

const random = createSeededRandom(getGameSeed());
const x = seededBetween(random, 20, 300);
const speed = seededFloatBetween(random, 0.8, 1.4);
const order = seededShuffle(random, ['a', 'b', 'c']);
```

The tester sends hash parameters like this:

```txt
#groupgame=dev-abc123&playcontext=dev
```

`getGameSeed()` combines `groupgame` and `playcontext`. Cosmetic particles and tiny visual-only variations may use `Math.random()`.

## Timing

For custom game loops, clamp large frame gaps before applying movement or physics.

```ts
import { clampGameplayDeltaMs, clampGameplayDeltaSeconds } from '@playus';

const deltaMs = clampGameplayDeltaMs(now - lastFrameAt);
const deltaSeconds = clampGameplayDeltaSeconds(deltaMs / 1000);
```

## Sounds And Haptics

Sounds and haptics are optional, but useful for touch feedback.

```ts
import { playus, sound } from '@playus';

sound.preload(['positive-input', 'level-complete']);
sound.play('positive-input', { volume: 0.5 });

playus.device.haptic('tap');
playus.device.haptic('success');
```

The devkit uses simple generated tones so you can test calls without Playus production assets. Playus may swap or tune sounds during internal integration.

Do not build a custom mute setting or host audio control flow. Playus handles final audio policy during internal integration.

## Error

Use `error({ code, message })` only when the game cannot initialize or cannot continue because of a real runtime failure.
