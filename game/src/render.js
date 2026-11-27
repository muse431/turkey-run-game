// Gobble Run — render: everything the player sees, in one place.
// One clear job: backgrounds, track, actors, HUD and every screen.

import { GOAL_DISTANCE, GROUND_Y, OBSTACLES, STAGES, TUNE, VIEW_H, VIEW_W } from './config.js';
import { STATES } from './game.js';
import { drawFarmer, drawForestGate, drawObstacle, drawPickup, drawTurkey } from './art.js';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  draw(game, dt) {
    const ctx = this.ctx;
    const world = game.world;
    const stage = STAGES[world.stageIndex];
    ctx.save();
    if (game.shake > 0) {
      const m = game.shake * 22;
      ctx.translate((Math.random() - 0.5) * m, (Math.random() - 0.5) * m);
    }
    this._drawSky(ctx, stage, game.time);
    this._drawBackdrop(ctx, stage, world.scroll);
    this._drawGround(ctx, stage, world.scroll);
    this._drawLeaves(ctx, world.leaves);
    if (world.gateX !== null) drawForestGate(ctx, world.gateX, GROUND_Y + 110);
    for (const p of world.pickups) {
      drawPickup(ctx, p.kind, p.x, p.y, game.time);
    }
    for (const o of world.obstacles) {
      drawObstacle(ctx, o.kind, o.x, o.y, o.w, o.h, game.time + o.seed);
    }
    this._drawParticles(ctx, world.particles);
    // The farmer, chasing from behind.
    const danger = game.dangerLevel();
    drawFarmer(ctx, game.farmerX(), GROUND_Y + 110, {
      runPhase: game.player.runPhase,
      reaching: danger === 1,
      scale: 1.15,
    });
    drawTurkey(ctx, game.player.x, game.player.y, {
      runPhase: game.player.runPhase,
      sliding: game.player.sliding,
      hurt: game.time < game.player.invulnerableUntil,
    });
    ctx.restore();

    if (game.state === STATES.PLAYING || game.state === STATES.PAUSED) {
      this._drawHud(ctx, game);
    }
    if (world.stageBanner && game.state === STATES.PLAYING) {
      this._drawBanner(ctx, world.stageBanner);
    }
    if (game.flash && game.state === STATES.PLAYING) {
      this._drawFlash(ctx, game.flash.text);
    }
    if (danger === 1 && game.state === STATES.PLAYING) {
      this._drawDanger(ctx, game.time);
    }
    if (game.state === STATES.TITLE) this._drawTitle(ctx, game);
    if (game.state === STATES.PAUSED) this._drawPaused(ctx);
    if (game.state === STATES.CAUGHT) this._drawEnd(ctx, game, false);
    if (game.state === STATES.ESCAPED) this._drawEnd(ctx, game, true);
  }

  _drawSky(ctx, stage, t) {
    const g = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
    g.addColorStop(0, stage.skyTop);
    g.addColorStop(0.55, stage.skyMid);
    g.addColorStop(1, stage.skyBot);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, VIEW_W, GROUND_Y);
    // Sun or moon, low and warm.
    const sunX = 1060;
    const sunY = 120;
    ctx.fillStyle = stage.id === 'barn' ? '#f2e3c0' : '#fff3c0';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 52, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255, 240, 180, 0.35)';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 74, 0, Math.PI * 2);
    ctx.fill();
    // Drifting clouds.
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    for (let i = 0; i < 3; i++) {
      const cx = ((i * 480 + t * 12) % (VIEW_W + 300)) - 150;
      const cy = 70 + i * 55;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 70, 20, 0, 0, Math.PI * 2);
      ctx.ellipse(cx + 44, cy + 8, 50, 16, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  _drawBackdrop(ctx, stage, scroll) {
    // Far hills.
    ctx.fillStyle = stage.id === 'kitchen' ? '#d8a86a' : '#8a6a3a';
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    for (let x = 0; x <= VIEW_W; x += 80) {
      const h = 60 + Math.sin((x + scroll * 0.2) * 0.006) * 26;
      ctx.lineTo(x, GROUND_Y - h);
    }
    ctx.lineTo(VIEW_W, GROUND_Y);
    ctx.closePath();
    ctx.fill();

    if (stage.id === 'farmyard') {
      // A red barn and a windmill on the horizon.
      const bx = 900 - ((scroll * 0.3) % 1600);
      ctx.fillStyle = '#a03a2e';
      ctx.fillRect(bx, GROUND_Y - 150, 150, 150);
      ctx.fillStyle = '#7a2a20';
      ctx.beginPath();
      ctx.moveTo(bx - 12, GROUND_Y - 150);
      ctx.lineTo(bx + 75, GROUND_Y - 210);
      ctx.lineTo(bx + 162, GROUND_Y - 150);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fff3d6';
      ctx.fillRect(bx + 60, GROUND_Y - 90, 30, 90);
      // Fence posts marching past.
      ctx.fillStyle = '#8a5a2b';
      for (let x = -((scroll * 0.6) % 90); x < VIEW_W; x += 90) {
        ctx.fillRect(x, GROUND_Y - 52, 10, 52);
      }
      ctx.fillRect(0, GROUND_Y - 46, VIEW_W, 8);
    } else if (stage.id === 'barn') {
      // Barn interior: beams and hanging lanterns.
      ctx.fillStyle = 'rgba(40, 24, 16, 0.55)';
      ctx.fillRect(0, 0, VIEW_W, 90);
      ctx.fillStyle = '#4a3220';
      for (let x = -((scroll * 0.5) % 220); x < VIEW_W; x += 220) {
        ctx.fillRect(x, 0, 26, 130);
      }
      ctx.fillStyle = 'rgba(255, 190, 80, 0.9)';
      for (let x = 120 - ((scroll * 0.5) % 440); x < VIEW_W; x += 440) {
        ctx.beginPath();
        ctx.arc(x, 150, 16, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Kitchen: a window with the night outside, shelves and a clock.
      ctx.fillStyle = '#f7e3c0';
      ctx.fillRect(0, 0, VIEW_W, 240);
      ctx.fillStyle = '#2c3a5e';
      ctx.fillRect(90, 50, 220, 150);
      ctx.fillStyle = '#f2e3c0';
      ctx.beginPath();
      ctx.arc(250, 110, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#8a6a3a';
      ctx.lineWidth = 6;
      ctx.strokeRect(90, 50, 220, 150);
      ctx.beginPath();
      ctx.moveTo(200, 50);
      ctx.lineTo(200, 200);
      ctx.moveTo(90, 125);
      ctx.lineTo(310, 125);
      ctx.stroke();
      ctx.fillStyle = '#8a5a2b';
      ctx.fillRect(880, 120, 340, 14);
      ctx.fillStyle = '#c23b2e';
      ctx.beginPath();
      ctx.arc(930, 100, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#e8b93b';
      ctx.fillRect(1010, 84, 34, 36);
      ctx.fillStyle = '#7a9b3f';
      ctx.fillRect(1090, 88, 30, 32);
    }
  }

  _drawGround(ctx, stage, scroll) {
    ctx.fillStyle = stage.ground;
    ctx.fillRect(0, GROUND_Y, VIEW_W, VIEW_H - GROUND_Y);
    ctx.fillStyle = stage.groundDark;
    ctx.fillRect(0, GROUND_Y, VIEW_W, 10);
    // Scrolling tufts and stones.
    ctx.fillStyle = stage.accent;
    for (let x = -((scroll) % 130); x < VIEW_W; x += 130) {
      ctx.beginPath();
      ctx.moveTo(x, GROUND_Y + 40);
      ctx.lineTo(x + 8, GROUND_Y + 22);
      ctx.lineTo(x + 16, GROUND_Y + 40);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    for (let x = -((scroll * 1.3) % 210); x < VIEW_W; x += 210) {
      ctx.beginPath();
      ctx.ellipse(x, GROUND_Y + 96, 26, 6, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  _drawLeaves(ctx, leaves) {
    for (const leaf of leaves) {
      ctx.save();
      ctx.translate(leaf.x, leaf.y);
      ctx.rotate(leaf.spin);
      ctx.fillStyle = leaf.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, leaf.size, leaf.size * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  _drawParticles(ctx, particles) {
    for (const p of particles) {
      const a = Math.max(0, p.life / p.maxLife);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = p.color;
      if (p.kind === 'feather') {
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, p.size, p.size * 0.45, p.life * 3, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  _drawHud(ctx, game) {
    const world = game.world;
    // Top bar: a warm wooden plank.
    ctx.fillStyle = 'rgba(60, 32, 12, 0.72)';
    roundRect(ctx, 16, 14, VIEW_W - 32, 64, 14);
    ctx.fill();
    // Score.
    ctx.fillStyle = '#fff3d6';
    ctx.font = 'bold 30px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`SCORE ${Math.floor(game.score)}`, 34, 56);
    // Distance bar with stage markers.
    const barX = 330;
    const barW = 560;
    const frac = Math.min(1, world.distance / GOAL_DISTANCE);
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    roundRect(ctx, barX, 30, barW, 16, 8);
    ctx.fill();
    ctx.fillStyle = '#ffd750';
    roundRect(ctx, barX, 30, barW * frac, 16, 8);
    ctx.fill();
    ctx.fillStyle = '#fff3d6';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      `${Math.floor(world.distance)} m / ${GOAL_DISTANCE} m  ·  ${game.stageName()}`,
      barX + barW / 2,
      66,
    );
    // Stage ticks.
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    for (const s of STAGES) {
      const tx = barX + (s.from / GOAL_DISTANCE) * barW;
      ctx.fillRect(tx, 26, 2, 24);
    }
    // Lives: three hearts.
    for (let i = 0; i < TUNE.startLives; i++) {
      const hx = VIEW_W - 130 + i * 44;
      const hy = 46;
      ctx.fillStyle = i < game.lives ? '#e23b2e' : 'rgba(255,255,255,0.25)';
      ctx.beginPath();
      ctx.moveTo(hx, hy + 10);
      ctx.bezierCurveTo(hx - 16, hy - 6, hx - 8, hy - 18, hx, hy - 6);
      ctx.bezierCurveTo(hx + 8, hy - 18, hx + 16, hy - 6, hx, hy + 10);
      ctx.fill();
    }
    // Farmer gap meter, bottom-left: how far behind he is.
    const gapFrac = game.farmerGap / TUNE.farmerMaxGap;
    ctx.fillStyle = 'rgba(60, 32, 12, 0.72)';
    roundRect(ctx, 16, VIEW_H - 58, 300, 42, 12);
    ctx.fill();
    ctx.fillStyle = '#fff3d6';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('FARMER', 30, VIEW_H - 32);
    ctx.fillStyle = gapFrac > 0.5 ? '#7a9b3f' : gapFrac > 0.25 ? '#e8a33d' : '#e23b2e';
    roundRect(ctx, 110, VIEW_H - 44, 180 * gapFrac, 14, 7);
    ctx.fill();
    ctx.fillStyle = '#fff3d6';
    ctx.textAlign = 'right';
    ctx.fillText(`${Math.floor(game.farmerGap)} m`, 304, VIEW_H - 32);
    // Controls hint, bottom-right.
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('SPACE jump · ↓ slide · P pause · M mute', VIEW_W - 18, VIEW_H - 20);
  }

  _drawBanner(ctx, banner) {
    const a = Math.min(1, banner.until);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = 'rgba(60, 32, 12, 0.8)';
    roundRect(ctx, VIEW_W / 2 - 300, 180, 600, 110, 16);
    ctx.fill();
    ctx.fillStyle = '#ffd750';
    ctx.font = 'bold 44px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(banner.text, VIEW_W / 2, 228);
    ctx.fillStyle = '#fff3d6';
    ctx.font = '20px sans-serif';
    ctx.fillText(banner.sub, VIEW_W / 2, 264);
    ctx.restore();
  }

  _drawFlash(ctx, text) {
    ctx.save();
    ctx.fillStyle = '#ffd750';
    ctx.font = 'bold 30px sans-serif';
    ctx.textAlign = 'center';
    ctx.strokeStyle = 'rgba(60,32,12,0.9)';
    ctx.lineWidth = 5;
    ctx.strokeText(text, VIEW_W / 2, 150);
    ctx.fillText(text, VIEW_W / 2, 150);
    ctx.restore();
  }

  _drawDanger(ctx, t) {
    const pulse = 0.1 + 0.08 * Math.sin(t * 8);
    const g = ctx.createRadialGradient(
      VIEW_W / 2, VIEW_H / 2, VIEW_H * 0.35,
      VIEW_W / 2, VIEW_H / 2, VIEW_H * 0.75,
    );
    g.addColorStop(0, 'rgba(194, 59, 46, 0)');
    g.addColorStop(1, `rgba(194, 59, 46, ${pulse})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    ctx.fillStyle = '#e23b2e';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    // Top-centre, under the HUD, clear of the flash line below it.
    ctx.fillText("HE'S RIGHT BEHIND YOU!", VIEW_W / 2, 112);
  }

  _panel(ctx, x, y, w, h) {
    ctx.fillStyle = 'rgba(48, 26, 10, 0.88)';
    roundRect(ctx, x, y, w, h, 20);
    ctx.fill();
    ctx.strokeStyle = '#e8a33d';
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  _drawTitle(ctx, game) {
    ctx.fillStyle = 'rgba(30, 16, 6, 0.45)';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    this._panel(ctx, VIEW_W / 2 - 400, 110, 800, 520);
    ctx.fillStyle = '#ffd750';
    ctx.font = 'bold 84px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GOBBLE RUN', VIEW_W / 2, 210);
    ctx.fillStyle = '#fff3d6';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText('The Great Turkey Escape', VIEW_W / 2, 258);
    ctx.font = '20px sans-serif';
    ctx.fillStyle = '#f2c89b';
    ctx.fillText('Thanksgiving is tomorrow. You are the main course.', VIEW_W / 2, 300);
    ctx.fillText('Outrun the farmer. Dodge the oven. Duck the carving knife.', VIEW_W / 2, 330);
    ctx.fillStyle = '#fff3d6';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('SPACE / CLICK — jump      ↓ — slide under', VIEW_W / 2, 396);
    ctx.fillText('Corn pushes the farmer back · Golden feather = +1 life', VIEW_W / 2, 428);
    ctx.fillText('Reach the forest gate, 1200 m away, and you are free.', VIEW_W / 2, 460);
    const blink = Math.sin(game.time * 4) > -0.2;
    if (blink) {
      ctx.fillStyle = '#ffd750';
      ctx.font = 'bold 32px sans-serif';
      ctx.fillText('▶  CLICK OR PRESS ENTER TO RUN', VIEW_W / 2, 540);
    }
    ctx.fillStyle = '#f2c89b';
    ctx.font = '18px sans-serif';
    ctx.fillText(`Best score: ${game.best}`, VIEW_W / 2, 596);
    ctx.fillText('A tiny original game — no turkeys were harmed in the making.', VIEW_W / 2, 622);
  }

  _drawPaused(ctx) {
    ctx.fillStyle = 'rgba(30, 16, 6, 0.55)';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    ctx.fillStyle = '#fff3d6';
    ctx.font = 'bold 64px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', VIEW_W / 2, VIEW_H / 2 - 10);
    ctx.font = '24px sans-serif';
    ctx.fillText('The farmer waits for no turkey. Press P to keep running.', VIEW_W / 2, VIEW_H / 2 + 40);
  }

  _drawEnd(ctx, game, escaped) {
    const s = game.endStats;
    ctx.fillStyle = escaped ? 'rgba(20, 50, 20, 0.55)' : 'rgba(40, 10, 6, 0.6)';
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    this._panel(ctx, VIEW_W / 2 - 400, 130, 800, 500);
    if (escaped) {
      ctx.fillStyle = '#7ad06a';
      ctx.font = 'bold 76px sans-serif';
      ctx.fillText('YOU ESCAPED!', VIEW_W / 2, 230);
      ctx.fillStyle = '#fff3d6';
      ctx.font = '22px sans-serif';
      ctx.fillText('Through the forest gate, into the wild — no dinner for you,', VIEW_W / 2, 282);
      ctx.fillText('farmer. The turkey lives to gobble another day.', VIEW_W / 2, 312);
    } else {
      ctx.fillStyle = '#e23b2e';
      ctx.font = 'bold 76px sans-serif';
      ctx.fillText('CAUGHT!', VIEW_W / 2, 230);
      ctx.fillStyle = '#fff3d6';
      ctx.font = '22px sans-serif';
      ctx.fillText('The farmer got you. The oven was already hot.', VIEW_W / 2, 282);
      ctx.fillText('Thanksgiving dinner is served — and it is you.', VIEW_W / 2, 312);
    }
    ctx.fillStyle = '#ffd750';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText(`SCORE  ${s.score}`, VIEW_W / 2, 386);
    ctx.fillStyle = '#fff3d6';
    ctx.font = '22px sans-serif';
    ctx.fillText(`Distance: ${s.distance} m   ·   Corn: ${s.corn}`, VIEW_W / 2, 428);
    if (s.isNewBest) {
      ctx.fillStyle = '#ffd750';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('★ NEW BEST SCORE! ★', VIEW_W / 2, 470);
    } else {
      ctx.fillStyle = '#f2c89b';
      ctx.font = '20px sans-serif';
      ctx.fillText(`Best: ${s.best}`, VIEW_W / 2, 470);
    }
    const blink = Math.sin(game.time * 4) > -0.2;
    if (blink) {
      ctx.fillStyle = '#ffd750';
      ctx.font = 'bold 30px sans-serif';
      ctx.fillText('▶  PRESS R OR CLICK TO RUN AGAIN', VIEW_W / 2, 556);
    }
  }
}
