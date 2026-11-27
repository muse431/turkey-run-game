// Gobble Run — world: spawning, collisions, particles, distance.
// One clear job: everything that happens on the track — what appears,
// what hits the turkey, and what flies off when it does.

import { GROUND_Y, OBSTACLES, PICKUPS, PX_PER_METER, STAGES, TUNE } from './config.js';
import { chance, pick, range } from './random.js';

export class World {
  constructor(rng) {
    this.rng = rng;
    this.reset();
  }

  reset() {
    this.distance = 0; // metres
    this.speed = TUNE.baseSpeed;
    this.scroll = 0; // px scrolled, drives the parallax
    this.obstacles = []; // {kind, x, w, h, y, passed}
    this.pickups = []; // {kind, x, y, taken}
    this.particles = []; // {x, y, vx, vy, life, maxLife, color, size, kind}
    this.leaves = []; // ambient falling leaves
    this.nextSpawnX = 1000;
    this.lastSpawnKind = null;
    this.stageBanner = null; // {text, sub, until}
    this.stageIndex = 0;
    this.gateX = null; // forest gate appears near the goal
    for (let i = 0; i < 24; i++) this.leaves.push(this._newLeaf(true));
  }

  _newLeaf(anywhere) {
    return {
      x: this.rng() * 1280,
      y: anywhere ? this.rng() * 700 : -20,
      vx: -20 - this.rng() * 30,
      vy: 30 + this.rng() * 50,
      size: 5 + this.rng() * 7,
      color: ['#e8912d', '#c23b2e', '#e8b93b', '#7a9b3f'][Math.floor(this.rng() * 4)],
      spin: this.rng() * Math.PI * 2,
    };
  }

  currentStage() {
    return STAGES[this.stageIndex];
  }

  update(dt, player) {
    // Speed grows with distance, plus a bonus in the later stages.
    const stage = this.currentStage();
    const target = Math.min(
      TUNE.baseSpeed + (this.distance / 100) * TUNE.speedPer100m + (stage.speedBonus ?? 0),
      TUNE.maxSpeed,
    );
    this.speed += (target - this.speed) * Math.min(1, dt * 0.8);
    const dx = this.speed * dt;
    this.scroll += dx;
    this.distance += dx / PX_PER_METER;

    // Stage change: banner + fanfare flag for the game.
    const idx = STAGES.findIndex((s) => this.distance < s.to);
    const newIdx = idx === -1 ? STAGES.length - 1 : idx;
    if (newIdx !== this.stageIndex) {
      this.stageIndex = newIdx;
      this.stageBanner = { text: STAGES[newIdx].name, sub: STAGES[newIdx].sub, until: 2.6 };
      this.nextSpawnX = 1300; // a breath of clear track at every stage change
      return 'stage';
    }
    if (this.stageBanner) {
      this.stageBanner.until -= dt;
      if (this.stageBanner.until <= 0) this.stageBanner = null;
    }

    // Spawn obstacles ahead of the screen.
    this.nextSpawnX -= dx;
    if (this.nextSpawnX <= 0) this._spawn();

    // Move everything left, cull what left the screen.
    for (const o of this.obstacles) o.x -= dx;
    for (const p of this.pickups) p.x -= dx;
    this.obstacles = this.obstacles.filter((o) => o.x + o.w > -80);
    this.pickups = this.pickups.filter((p) => p.x > -60 && !p.taken);

    // The forest gate rolls in for the last 120 metres.
    if (this.distance > 1080 && this.gateX === null) this.gateX = 1500;
    if (this.gateX !== null) this.gateX -= dx;

    // Particles and leaves.
    for (const p of this.particles) {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 500 * dt;
    }
    this.particles = this.particles.filter((p) => p.life > 0);
    for (const leaf of this.leaves) {
      leaf.x += (leaf.vx - this.speed * 0.25) * dt;
      leaf.y += leaf.vy * dt;
      leaf.spin += dt * 2;
      if (leaf.y > 720 || leaf.x < -20) Object.assign(leaf, this._newLeaf(false));
    }
    return null;
  }

  _spawn() {
    const stage = this.currentStage();
    const kind = pick(this.rng, stage.obstacles.filter((k) => k !== this.lastSpawnKind));
    this.lastSpawnKind = kind;
    const def = OBSTACLES[kind];
    const x = 1280 + range(this.rng, 40, 180);
    const y = def.hangs ? GROUND_Y - 68 - def.h : GROUND_Y - def.h;
    // Hanging obstacles dangle low: their bottom edge sits at
    // GROUND_Y - 68, so a running turkey clips them but a sliding
    // turkey (hitbox top at GROUND_Y - 46) slips underneath.
    this.obstacles.push({ kind, x, y, w: def.w, h: def.h, passed: false, seed: this.rng() * 10 });

    // A pickup trail sometimes floats just past the obstacle.
    if (chance(this.rng, 0.55)) {
      const pk = chance(this.rng, 0.85) ? 'corn' : chance(this.rng, 0.6) ? 'pie' : 'feather';
      const n = pk === 'corn' ? 3 : 1;
      for (let i = 0; i < n; i++) {
        this.pickups.push({
          kind: pk,
          x: x + def.w + 90 + i * 56,
          y: pk === 'corn' ? GROUND_Y - 150 - (i % 2) * 40 : GROUND_Y - 170,
          taken: false,
        });
      }
    }
    this.nextSpawnX = range(this.rng, stage.spawnEveryMin, stage.spawnEveryMax);
  }

  // The turkey's hitbox: forgiving, smaller than the drawing.
  playerBox(player) {
    if (player.sliding) {
      return { x: player.x - 34, y: player.y - 46, w: 76, h: 46 };
    }
    return { x: player.x - 26, y: player.y - 88, w: 58, h: 88 };
  }

  checkCollisions(player) {
    const events = [];
    const box = this.playerBox(player);
    for (const o of this.obstacles) {
      const def = OBSTACLES[o.kind];
      // Shrink the obstacle box a little: near-misses should feel fair.
      const ox = o.x + 6;
      const oy = o.y + 6;
      const ow = o.w - 12;
      const oh = o.h - 12;
      if (!o.passed && o.x + o.w < player.x - 30) {
        o.passed = true;
        events.push({ type: 'cleared', score: def.score, label: def.label });
      }
      if (
        box.x < ox + ow &&
        box.x + box.w > ox &&
        box.y < oy + oh &&
        box.y + box.h > oy
      ) {
        if (!o.hit) {
          o.hit = true;
          events.push({ type: 'hit', obstacle: o.kind });
        }
      }
    }
    for (const p of this.pickups) {
      if (p.taken) continue;
      const def = PICKUPS[p.kind];
      const dx = p.x - (player.x + 10);
      const dy = p.y - (player.y - 55);
      if (dx * dx + dy * dy < 58 * 58) {
        p.taken = true;
        events.push({ type: 'pickup', kind: p.kind, score: def.score });
      }
    }
    return events;
  }

  burst(x, y, color, n = 14, kind = 'feather') {
    for (let i = 0; i < n; i++) {
      const a = this.rng() * Math.PI * 2;
      const v = 120 + this.rng() * 260;
      this.particles.push({
        x, y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v - 120,
        life: 0.5 + this.rng() * 0.6,
        maxLife: 1.1,
        color, size: 4 + this.rng() * 6, kind,
      });
    }
  }

  dust(x, y) {
    for (let i = 0; i < 5; i++) {
      this.particles.push({
        x: x - 20 + this.rng() * 30, y: y - 2,
        vx: -40 - this.rng() * 60, vy: -20 - this.rng() * 40,
        life: 0.3 + this.rng() * 0.3, maxLife: 0.6,
        color: '#d8c9a8', size: 5 + this.rng() * 5, kind: 'dust',
      });
    }
  }
}
