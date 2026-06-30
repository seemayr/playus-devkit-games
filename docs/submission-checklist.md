# Submission Checklist

Before opening a PR, check:

- The game lives in `games/<your-game-id>`.
- `playus.configure({ gameId })` uses the same id as the folder.
- `ready()` fires after required assets are loaded.
- `started()` fires when the run really begins.
- `score()` is sent only on meaningful live leaderboard changes, not every frame.
- `finished(finalScore)` fires exactly once.
- The final score is a finite, exact number.
- Time values are sent as seconds, not milliseconds.
- Lower-is-better scores are sent as negative values.
- The game has a clear end.
- Required assets are bundled locally.
- Gameplay-affecting randomness uses seeded random.
- The framework/runtime is lean enough for mobile WebViews.
- The game works in the local tester.

Do not worry about localization, language switching, or final host audio controls. Playus handles those during internal integration.
