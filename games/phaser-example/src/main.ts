import Phaser from 'phaser';
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

const GAME_ID = 'phaser-example';
const TARGET_SCORE = 5;

playus.configure({ gameId: GAME_ID });

const random = createSeededRandom(getGameSeed());

class MainScene extends Phaser.Scene {
  private target!: Phaser.GameObjects.Arc;
  private scoreText!: Phaser.GameObjects.Text;
  private score = 0;
  private hasStarted = false;
  private hasFinished = false;

  constructor() {
    super('main');
  }

  create() {
    const { width, height } = this.scale;

    this.scoreText = this.add.text(width / 2, height * 0.14, '0', {
      fontFamily: 'Unbounded, system-ui, sans-serif',
      fontSize: `${Math.min(92, width * 0.22)}px`,
      fontStyle: '900',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.target = this.add.circle(0, 0, 54, 0x8ed7b5)
      .setStrokeStyle(8, 0xffffff, 0.85)
      .setInteractive();

    this.target.on('pointerdown', () => this.hitTarget());
    this.target.setPosition(width / 2, height / 2);

    createTapToStartOverlay({
      text: 'Tap to start',
      mode: 'dismiss-only',
      onStart: () => this.startGame(),
    });

    sound.preload(['positive-input', 'level-complete']);
    playus.game.ready();
  }

  private startGame() {
    if (this.hasStarted || this.hasFinished) return;

    this.hasStarted = true;
    playus.game.started();
    playus.game.score(this.score);
  }

  private hitTarget() {
    if (!this.hasStarted || this.hasFinished) return;

    this.score += 1;
    this.scoreText.setText(String(this.score));
    playus.game.score(this.score);
    playus.device.haptic('tap');
    sound.play('positive-input', { volume: 0.55 });

    if (this.score >= TARGET_SCORE) {
      this.finishGame();
      return;
    }

    this.moveTarget();
  }

  private moveTarget() {
    const padding = 84;
    this.target.x = seededBetween(random, padding, this.scale.width - padding);
    this.target.y = seededBetween(random, padding + 110, this.scale.height - padding);
  }

  private finishGame() {
    if (this.hasFinished) return;

    this.hasFinished = true;
    playus.device.haptic('success');
    sound.play('level-complete', { volume: 0.7 });
    playus.game.finished(this.score);
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: '#172027',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: MainScene,
});
