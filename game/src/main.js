// Gobble Run — main: boot the canvas, run the loop, wire the pieces.
// One clear job: start the game, step it every frame, and hand the
// screenshot driver a deterministic scene when ?shot= is set.

import { VIEW_H, VIEW_W } from './config.js';
import { Game } from './game.js';
import { Input } from './input.js';
import { Renderer } from './render.js';
import { applyShotScene } from './shots.js';

const canvas = document.getElementById('game');
canvas.width = VIEW_W;
canvas.height = VIEW_H;

const params = new URLSearchParams(window.location.search);
const seed = Number(params.get('seed') ?? 20261127) || 20261127;

const game = new Game(seed);
const input = new Input(canvas);
const renderer = new Renderer(canvas);

// Debug hook for play-testing: lets an automated driver read the
// live state (state, score, distance, lives) without touching the UI.
window.__game = game;

let last = performance.now();
let frames = 0;

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  // Screenshot mode freezes the staged scene: the loop renders but
  // never steps the game, so the turkey stays mid-jump and no staged
  // obstacle can hit it before the shutter.
  if (!params.has('shot')) game.update(dt, input);
  renderer.draw(game, dt);
  input.endFrame();
  frames += 1;
  // Screenshot mode: after the scene has settled for two frames,
  // tell the driver the shot is ready.
  if (params.has('shot') && frames >= 3) {
    window.__shotReady = true;
  }
  requestAnimationFrame(frame);
}

// In screenshot mode the scene is staged before the first frame.
if (params.has('shot')) {
  applyShotScene(game, params.get('shot'), seed);
}

requestAnimationFrame(frame);
