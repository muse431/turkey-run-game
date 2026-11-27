// Gobble Run — shots: deterministic scenes for the screenshots.
// One clear job: given ?shot=<name>, put the game into a fixed,
// good-looking state (title, a farmyard jump, the kitchen gauntlet,
// the caught screen, the escaped screen) so every screenshot is a
// real render of the game itself, reproducible from its seed.

import { GROUND_Y, OBSTACLES, TUNE } from './config.js';
import { STATES } from './game.js';

function placeObstacle(game, kind, x, extra = {}) {
  const def = OBSTACLES[kind];
  const y = def.hangs ? GROUND_Y - 190 - def.h : GROUND_Y - def.h;
  game.world.obstacles.push({ kind, x, y, w: def.w, h: def.h, passed: false, seed: 1.5, ...extra });
}

function placePickup(game, kind, x, y) {
  game.world.pickups.push({ kind, x, y, taken: false });
}

function startPlaying(game, distance, lives, farmerGap) {
  game.startRun();
  game.world.distance = distance;
  game.world.stageIndex = distance < 400 ? 0 : distance < 800 ? 1 : 2;
  game.lives = lives;
  game.farmerGap = farmerGap;
  game.score = Math.floor(distance * 1.4);
  game._corn = 12;
}

export function applyShotScene(game, shot, seed) {
  switch (shot) {
    case 'title': {
      game.state = STATES.TITLE;
      game.best = 2480;
      break;
    }
    case 'farm': {
      // Mid-run in the farmyard: jumping a fence, corn ahead, farmer near.
      startPlaying(game, 180, 3, 22);
      game.player.y = GROUND_Y - 120;
      game.player.vy = -320;
      game.player.grounded = false;
      placeObstacle(game, 'fence', 390);
      placeObstacle(game, 'haybale', 700);
      placePickup(game, 'corn', 560, GROUND_Y - 150);
      placePickup(game, 'corn', 616, GROUND_Y - 190);
      placePickup(game, 'corn', 672, GROUND_Y - 150);
      placePickup(game, 'pie', 1150, GROUND_Y - 170);
      game.world.nextSpawnX = 99999; // keep the staged scene intact
      break;
    }
    case 'kitchen': {
      // The kitchen gauntlet: oven ahead, knife swinging, farmer close.
      startPlaying(game, 940, 2, 18);
      game.player.y = GROUND_Y - 60;
      game.player.vy = -500;
      game.player.grounded = false;
      placeObstacle(game, 'oven', 520);
      placeObstacle(game, 'knife', 830);
      placeObstacle(game, 'pot', 1060);
      placePickup(game, 'feather', 700, GROUND_Y - 220);
      placePickup(game, 'corn', 980, GROUND_Y - 150);
      game.world.nextSpawnX = 99999;
      break;
    }
    case 'caught': {
      startPlaying(game, 512, 1, 0);
      game._finish(false);
      game.endStats = { score: 1840, distance: 512, corn: 21, escaped: false, best: 2480, isNewBest: false };
      break;
    }
    case 'escaped': {
      startPlaying(game, 1200, 2, 74);
      game._finish(true);
      game.endStats = { score: 3120, distance: 1200, corn: 34, escaped: true, best: 3120, isNewBest: true };
      break;
    }
    default: {
      game.state = STATES.TITLE;
      break;
    }
  }
  // Freeze the staged scene: the loop still runs, but nothing spawns.
  if (shot === 'farm' || shot === 'kitchen') {
    game.world.nextSpawnX = 99999;
  }
}
