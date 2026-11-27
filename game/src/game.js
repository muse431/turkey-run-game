// Gobble Run — game: the state machine and the turkey itself.
// One clear job: title / playing / paused / caught / escaped, the
// turkey's jump-slide physics, score, lives and the farmer's gap.

import { GOAL_DISTANCE, GROUND_Y, PLAYER_X, STAGES, TUNE, farmerScreenX } from './config.js';
import { World } from './world.js';
import { Sound } from './audio.js';
import { mulberry32 } from './random.js';

export const STATES = {
  TITLE: 'title',
  PLAYING: 'playing',
  PAUSED: 'paused',
  CAUGHT: 'caught',
  ESCAPED: 'escaped',
};

export class Game {
  constructor(seed = 20261127) {
    this.rng = mulberry32(seed);
    this.world = new World(this.rng);
    this.sound = new Sound();
    this.state = STATES.TITLE;
    this.best = 0;
    try {
      this.best = Number(window.localStorage.getItem('gobble-run-best') ?? 0) || 0;
    } catch {
      this.best = 0;
    }
    this._resetRun();
  }

  _resetRun() {
    this.player = {
      x: PLAYER_X,
      y: GROUND_Y,
      vy: 0,
      grounded: true,
      sliding: false,
      slideUntil: 0,
      coyoteUntil: 0,
      jumpBufferUntil: 0,
      runPhase: 0,
      invulnerableUntil: 0,
    };
    this.score = 0;
    this._corn = 0;
    this.lives = TUNE.startLives;
    this.farmerGap = TUNE.farmerStartGap;
    this.time = 0;
    this.shake = 0;
    this.flash = null; // {text, until} floating feedback
    this.endStats = null;
    this.world.reset();
    this.world.rng = this.rng;
  }

  startRun() {
    this._resetRun();
    this.state = STATES.PLAYING;
    this.sound.ensure();
    this.sound.gobble();
    this.sound.startMusic();
  }

  togglePause() {
    if (this.state === STATES.PLAYING) {
      this.state = STATES.PAUSED;
      this.sound.stopMusic();
    } else if (this.state === STATES.PAUSED) {
      this.state = STATES.PLAYING;
      this.sound.startMusic();
    }
  }

  _finish(escaped) {
    this.state = escaped ? STATES.ESCAPED : STATES.CAUGHT;
    this.sound.stopMusic();
    if (escaped) this.sound.escaped();
    else this.sound.caught();
    const finalScore = Math.floor(this.score + this.world.distance);
    this.endStats = {
      score: finalScore,
      distance: Math.floor(this.world.distance),
      corn: this._corn,
      escaped,
      best: Math.max(this.best, finalScore),
      isNewBest: finalScore > this.best,
    };
    if (finalScore > this.best) {
      this.best = finalScore;
      try {
        window.localStorage.setItem('gobble-run-best', String(finalScore));
      } catch {
        /* best score is a nicety, not a requirement */
      }
    }
  }

  update(dt, input) {
    this.time += dt;
    if (this.state === STATES.TITLE) {
      this._updateTitle(dt, input);
      return;
    }
    if (this.state === STATES.PAUSED) {
      if (input.pressed('pause') || input.pressed('start')) this.togglePause();
      return;
    }
    if (this.state === STATES.CAUGHT || this.state === STATES.ESCAPED) {
      if (input.pressed('restart') || input.click()) this.startRun();
      return;
    }
    // PLAYING
    if (input.pressed('pause')) {
      this.togglePause();
      return;
    }
    if (input.pressed('mute')) this.sound.toggleMute();

    const p = this.player;
    p.runPhase += dt * (this.world.speed / 220);

    // Jump: buffered, with coyote time, so it always feels responsive.
    if (input.pressed('jump')) p.jumpBufferUntil = this.time + TUNE.jumpBuffer;
    if (p.grounded && this.time <= p.jumpBufferUntil) {
      p.vy = TUNE.jumpVelocity;
      p.grounded = false;
      p.jumpBufferUntil = 0;
      p.sliding = false;
      this.sound.jump();
      this.world.dust(p.x, GROUND_Y);
    }
    // Slide: only on the ground, for a fixed beat.
    if (input.pressed('slide') && p.grounded) {
      p.sliding = true;
      p.slideUntil = this.time + TUNE.slideTime;
      this.sound.slide();
    }
    if (p.sliding && this.time >= p.slideUntil) p.sliding = false;
    if (input.held('slide') && p.grounded && !p.sliding) {
      p.sliding = true;
      p.slideUntil = this.time + TUNE.slideTime;
    }

    // Gravity and landing.
    if (!p.grounded) {
      p.vy += TUNE.gravity * dt;
      p.y += p.vy * dt;
      if (p.y >= GROUND_Y) {
        p.y = GROUND_Y;
        p.vy = 0;
        p.grounded = true;
        this.sound.land();
        this.world.dust(p.x, GROUND_Y);
      }
    } else {
      p.coyoteUntil = this.time + TUNE.coyoteTime;
    }

    // Click / tap also jumps while playing.
    if (input.click() && p.grounded) {
      p.vy = TUNE.jumpVelocity;
      p.grounded = false;
      this.sound.jump();
    }

    const stageEvent = this.world.update(dt, p);

    // The farmer never stops walking.
    this.farmerGap = Math.max(0, this.farmerGap - TUNE.farmerGainPerSecond * dt);

    for (const ev of this.world.checkCollisions(p)) {
      if (ev.type === 'cleared') {
        this.score += ev.score;
      } else if (ev.type === 'pickup') {
        this._corn = (this._corn ?? 0) + (ev.kind === 'corn' ? 1 : 0);
        this.score += ev.score;
        this.farmerGap = Math.min(
          TUNE.farmerMaxGap,
          this.farmerGap + (ev.kind === 'feather' ? TUNE.farmerPushFeather : TUNE.farmerPushCorn),
        );
        if (ev.kind === 'feather') {
          this.lives = Math.min(TUNE.startLives, this.lives + 1);
          this.flash = { text: '+1 LIFE! GOLDEN FEATHER!', until: this.time + 1.6 };
          this.sound.feather();
        } else if (ev.kind === 'pie') {
          this.flash = { text: 'PUMPKIN PIE! +25', until: this.time + 1.2 };
          this.sound.corn();
        } else {
          this.sound.corn();
        }
        this.world.burst(p.x + 20, p.y - 60, ev.kind === 'feather' ? '#ffd750' : '#f2c230', 8, 'spark');
      } else if (ev.type === 'hit') {
        if (this.time < p.invulnerableUntil) continue;
        this.lives -= 1;
        this.farmerGap = Math.max(0, this.farmerGap - TUNE.farmerGainOnHit);
        p.invulnerableUntil = this.time + TUNE.invulnerableTime;
        this.shake = 0.35;
        this.world.burst(p.x, p.y - 50, '#ffffff', 16, 'feather');
        this.sound.hit();
        this.flash = {
          text: this.lives > 0 ? 'OUCH! THE FARMER IS CLOSER!' : '',
          until: this.time + 1.4,
        };
        if (this.lives <= 0) {
          this._finish(false);
          return;
        }
      }
    }

    if (stageEvent === 'stage') {
      this.sound.stageClear();
      this.score += 50;
      this.flash = { text: '+50 STAGE BONUS', until: this.time + 1.6 };
    }

    // Distance score ticks up as the turkey runs.
    this.score += (this.world.speed * dt) / 12;

    if (this.farmerGap <= 0) {
      this._finish(false);
      return;
    }
    if (this.world.distance >= GOAL_DISTANCE) {
      this._finish(true);
    }
    if (this.shake > 0) this.shake = Math.max(0, this.shake - dt);
    if (this.flash && this.time > this.flash.until) this.flash = null;
  }

  _updateTitle(dt, input) {
    this.world.scroll += 60 * dt;
    for (const leaf of this.world.leaves) {
      leaf.x += (leaf.vx - 15) * dt;
      leaf.y += leaf.vy * dt;
      leaf.spin += dt * 2;
      if (leaf.y > 720 || leaf.x < -20) Object.assign(leaf, this.world._newLeaf(false));
    }
    if (input.pressed('start') || input.click()) this.startRun();
  }

  farmerX() {
    return farmerScreenX(this.farmerGap);
  }

  stageName() {
    return STAGES[this.world.stageIndex].name;
  }

  dangerLevel() {
    // 0 = safe, 1 = the farmer is breathing down the turkey's neck.
    if (this.farmerGap > 60) return 0;
    if (this.farmerGap > 30) return 0.5;
    return 1;
  }
}
