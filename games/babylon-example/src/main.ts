import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import {
  createTapToStartOverlay,
  playus,
  sound,
} from '@playus';
import '@playus/styles.css';
import './style.css';

const GAME_ID = 'babylon-example';
const TARGET_SCORE = 5;

playus.configure({ gameId: GAME_ID });

let score = 0;
let hasStarted = false;
let hasFinished = false;
let cube: Mesh;

document.body.innerHTML = `
  <div class="playus-game-root babylon-game">
    <canvas id="renderCanvas" aria-label="Babylon Playus example"></canvas>
    <div class="score" id="score">0</div>
  </div>
`;

const canvas = getElement<HTMLCanvasElement>('renderCanvas');
const scoreElement = getElement<HTMLDivElement>('score');

try {
  const engine = new Engine(canvas, true, {
    antialias: true,
    stencil: false,
    preserveDrawingBuffer: false,
  });
  const scene = createScene(engine);

  createTapToStartOverlay({
    text: 'Tap to start',
    mode: 'dismiss-only',
    onStart: startGame,
  });

  sound.preload(['positive-input', 'level-complete']);
  canvas.addEventListener('pointerdown', hitCube);

  let hasSentReady = false;
  engine.runRenderLoop(() => {
    cube.rotation.x += engine.getDeltaTime() * 0.00055;
    cube.rotation.y += engine.getDeltaTime() * 0.0009;
    scene.render();

    if (!hasSentReady && scene.isReady()) {
      hasSentReady = true;
      playus.game.ready();
    }
  });

  window.addEventListener('resize', () => engine.resize());
} catch (error) {
  playus.game.error({
    code: 'INIT_FAILED',
    message: error instanceof Error ? error.message : String(error),
  });
}

function createScene(engine: Engine): Scene {
  const scene = new Scene(engine);
  scene.clearColor = Color4.FromHexString('#11141cff');

  new ArcRotateCamera(
    'camera',
    Math.PI / 4,
    Math.PI / 3,
    4.4,
    Vector3.Zero(),
    scene,
  );

  const light = new HemisphericLight('light', new Vector3(0.2, 1, 0.4), scene);
  light.intensity = 1.25;

  cube = MeshBuilder.CreateBox('score-cube', { size: 1.45 }, scene);
  cube.material = createCubeMaterial(scene);

  return scene;
}

function createCubeMaterial(scene: Scene): StandardMaterial {
  const material = new StandardMaterial('cube-material', scene);
  material.diffuseColor = Color3.FromHexString('#8ed7b5');
  material.specularColor = Color3.FromHexString('#ffffff');
  return material;
}

function startGame() {
  if (hasStarted || hasFinished) return;

  hasStarted = true;
  playus.game.started();
  playus.game.score(score);
}

function hitCube() {
  if (!hasStarted || hasFinished) return;

  score += 1;
  scoreElement.textContent = String(score);
  playus.game.score(score);
  playus.device.haptic('tap');
  sound.play('positive-input', { volume: 0.55 });

  cube.scaling.setAll(1.08);
  window.setTimeout(() => cube.scaling.setAll(1), 90);

  if (score >= TARGET_SCORE) {
    finishGame();
  }
}

function finishGame() {
  if (hasFinished) return;

  hasFinished = true;
  playus.device.haptic('success');
  sound.play('level-complete', { volume: 0.7 });
  playus.game.finished(score);
}

function getElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing #${id}.`);
  return element as T;
}
