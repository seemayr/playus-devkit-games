import {
  createSeededRandom,
  createTapToStartOverlay,
  getGameSeed,
  playus,
  seededBetween,
  sound,
} from '@playus';
import '@playus/styles.css';
import './style.css';

const GAME_ID = 'starter-game';
const TARGET_SCORE = 5;

playus.configure({ gameId: GAME_ID });

const random = createSeededRandom(getGameSeed());
let score = 0;
let hasStarted = false;
let hasFinished = false;
let target = createTarget();

document.body.innerHTML = `
  <div class="playus-game-root starter-game">
    <div class="score" id="score">0</div>
    <button class="target" id="target" type="button" aria-label="Target"></button>
  </div>
`;

const targetButton = getElement<HTMLButtonElement>('target');
const scoreElement = getElement<HTMLDivElement>('score');

positionTarget();
targetButton.addEventListener('pointerdown', handleTargetTap);

createTapToStartOverlay({
  text: 'Tap to start',
  mode: 'dismiss-only',
  onStart: startGame,
});

sound.preload(['positive-input', 'level-complete']);
playus.game.ready();

function startGame() {
  if (hasStarted || hasFinished) return;

  hasStarted = true;
  playus.game.started();
  playus.game.score(score);
}

function handleTargetTap() {
  if (!hasStarted || hasFinished) return;

  score += 1;
  target = createTarget();
  positionTarget();
  scoreElement.textContent = String(score);
  playus.game.score(score);
  playus.device.haptic('tap');
  sound.play('positive-input', { volume: 0.5 });

  if (score >= TARGET_SCORE) {
    finishGame();
  }
}

function finishGame() {
  if (hasFinished) return;

  hasFinished = true;
  sound.play('level-complete', { volume: 0.7 });
  playus.device.haptic('success');
  playus.game.finished(score);
}

function createTarget() {
  return {
    x: seededBetween(random, 16, 84),
    y: seededBetween(random, 24, 78),
  };
}

function positionTarget() {
  targetButton.style.left = `${target.x}%`;
  targetButton.style.top = `${target.y}%`;
}

function getElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing #${id}.`);
  return element as T;
}
