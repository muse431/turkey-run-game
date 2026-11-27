// Gobble Run — art: every sprite is drawn in code, no image files.
// One clear job: the turkey, the farmer, the obstacles, the pickups
// and the three stages' backdrops, all original vector art.

export function drawTurkey(ctx, x, y, opts = {}) {
  // x,y = feet position. opts: runPhase (0..1), sliding, hurt (flash), scale.
  const s = opts.scale ?? 1;
  const slide = !!opts.sliding;
  const phase = opts.runPhase ?? 0;
  const legSwing = Math.sin(phase * Math.PI * 2) * 14;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  if (opts.hurt && Math.floor(performance.now() / 90) % 2 === 0) ctx.globalAlpha = 0.35;

  // Tail fan: five proud feathers behind the body.
  ctx.save();
  ctx.translate(-26, -46);
  for (let i = -2; i <= 2; i++) {
    ctx.save();
    ctx.rotate((i * 0.42) + 0.15);
    ctx.fillStyle = i % 2 === 0 ? '#8a5a2b' : '#a06a33';
    ctx.beginPath();
    ctx.ellipse(0, -34, 11, 34, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#5d3a1a';
    ctx.beginPath();
    ctx.ellipse(0, -52, 5, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();

  // Legs: two orange sticks, scissoring while running, tucked when sliding.
  ctx.strokeStyle = '#e8912d';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  if (slide) {
    ctx.beginPath();
    ctx.moveTo(-6, -14);
    ctx.lineTo(16, 0);
    ctx.moveTo(6, -14);
    ctx.lineTo(26, 0);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(-8, -16);
    ctx.lineTo(-8 + legSwing, 0);
    ctx.moveTo(8, -16);
    ctx.lineTo(8 - legSwing, 0);
    ctx.stroke();
  }

  // Body: a plump brown oval, lower and longer while sliding.
  ctx.fillStyle = '#7c4a21';
  ctx.beginPath();
  ctx.ellipse(0, slide ? -26 : -42, slide ? 46 : 38, slide ? 24 : 34, slide ? -0.15 : 0, 0, Math.PI * 2);
  ctx.fill();
  // Belly highlight.
  ctx.fillStyle = '#a06a33';
  ctx.beginPath();
  ctx.ellipse(6, slide ? -20 : -34, 24, slide ? 15 : 20, 0, 0, Math.PI * 2);
  ctx.fill();

  // Wing, flapping a little with the run.
  const flap = Math.sin(phase * Math.PI * 2) * 4;
  ctx.fillStyle = '#5d3a1a';
  ctx.beginPath();
  ctx.ellipse(-6, -44 + flap * 0.4, 22, 13, -0.5, 0, Math.PI * 2);
  ctx.fill();

  if (!slide) {
    // Neck and head, bobbing ahead.
    ctx.strokeStyle = '#8a5a2b';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(26, -66);
    ctx.quadraticCurveTo(38, -88, 40, -96);
    ctx.stroke();
    // Head.
    ctx.fillStyle = '#c65a4a';
    ctx.beginPath();
    ctx.arc(42, -100, 13, 0, Math.PI * 2);
    ctx.fill();
    // Snood (the dangly bit) and beak.
    ctx.fillStyle = '#e23b2e';
    ctx.beginPath();
    ctx.ellipse(48, -92, 4, 8, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f2a93b';
    ctx.beginPath();
    ctx.moveTo(52, -102);
    ctx.lineTo(66, -97);
    ctx.lineTo(52, -94);
    ctx.closePath();
    ctx.fill();
    // Wide, worried eye.
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(46, -104, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1c1410';
    ctx.beginPath();
    ctx.arc(47, -104, 2.5, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Sliding: head low, beak forward, determined.
    ctx.fillStyle = '#c65a4a';
    ctx.beginPath();
    ctx.arc(44, -38, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f2a93b';
    ctx.beginPath();
    ctx.moveTo(52, -40);
    ctx.lineTo(64, -36);
    ctx.lineTo(52, -32);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(47, -42, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1c1410';
    ctx.beginPath();
    ctx.arc(48, -42, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function drawFarmer(ctx, x, y, opts = {}) {
  // x,y = feet position. opts: runPhase, reaching (lunging arms), scale.
  const s = opts.scale ?? 1;
  const phase = opts.runPhase ?? 0;
  const swing = Math.sin(phase * Math.PI * 2) * 12;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  // Legs and boots, mid-chase stride.
  ctx.strokeStyle = '#3a5a8c';
  ctx.lineWidth = 13;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-8, -70);
  ctx.lineTo(-8 + swing, 0);
  ctx.moveTo(8, -70);
  ctx.lineTo(8 - swing, 0);
  ctx.stroke();
  ctx.fillStyle = '#5d3a1a';
  ctx.fillRect(-14 + swing - 6, -10, 22, 10);
  ctx.fillRect(2 - swing - 6, -10, 22, 10);
  // Overalls body.
  ctx.fillStyle = '#3a5a8c';
  ctx.fillRect(-24, -138, 48, 72);
  ctx.fillStyle = '#2c4670';
  ctx.fillRect(-24, -138, 48, 12);
  // Red checked shirt arms, reaching forward when close.
  ctx.strokeStyle = '#c23b2e';
  ctx.lineWidth = 12;
  const reach = opts.reaching ? 26 : 8;
  ctx.beginPath();
  ctx.moveTo(-20, -128);
  ctx.lineTo(18 + reach, -104);
  ctx.moveTo(20, -128);
  ctx.lineTo(30 + reach, -92);
  ctx.stroke();
  // Hands.
  ctx.fillStyle = '#f2c89b';
  ctx.beginPath();
  ctx.arc(20 + reach, -103, 8, 0, Math.PI * 2);
  ctx.arc(32 + reach, -91, 8, 0, Math.PI * 2);
  ctx.fill();
  // Head, red with effort.
  ctx.fillStyle = '#f2c89b';
  ctx.beginPath();
  ctx.arc(4, -158, 20, 0, Math.PI * 2);
  ctx.fill();
  // Angry eyebrows and moustache.
  ctx.strokeStyle = '#3a2a1a';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-6, -166);
  ctx.lineTo(6, -162);
  ctx.moveTo(18, -166);
  ctx.lineTo(8, -162);
  ctx.stroke();
  ctx.fillStyle = '#8a6a3a';
  ctx.beginPath();
  ctx.ellipse(8, -148, 12, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  // Straw hat.
  ctx.fillStyle = '#e8c96a';
  ctx.beginPath();
  ctx.ellipse(4, -172, 34, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(4, -180, 20, 12, 0, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#c23b2e';
  ctx.fillRect(-16, -178, 40, 5);
  ctx.restore();
}

export function drawObstacle(ctx, kind, x, y, w, h, t = 0) {
  // x,y = top-left of the obstacle box; t = animation time (seconds).
  ctx.save();
  switch (kind) {
    case 'fence': {
      ctx.fillStyle = '#8a5a2b';
      ctx.fillRect(x, y + 8, w, 10);
      ctx.fillRect(x, y + h - 26, w, 10);
      ctx.fillStyle = '#6b4423';
      for (let i = 0; i < 3; i++) {
        const px = x + 4 + i * ((w - 8) / 3);
        ctx.fillRect(px, y, 8, h);
        ctx.beginPath();
        ctx.moveTo(px, y);
        ctx.lineTo(px + 4, y - 8);
        ctx.lineTo(px + 8, y);
        ctx.closePath();
        ctx.fill();
      }
      break;
    }
    case 'haybale': {
      ctx.fillStyle = '#e8b93b';
      ctx.beginPath();
      ctx.arc(x + w / 2, y + h / 2, w / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#c9972a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x + w / 2, y + h / 2, w / 2 - 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x + w / 2, y + h / 2, w / 2 - 18, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    case 'puddle': {
      ctx.fillStyle = '#6b4423';
      ctx.beginPath();
      ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#8a6a3a';
      ctx.beginPath();
      ctx.ellipse(x + w / 2 - 14, y + h / 2 - 3, w / 5, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'clothesline': {
      // A washing line strung between two poles; slide under the laundry.
      ctx.strokeStyle = '#3a2a1a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x - 10, y + 8);
      ctx.lineTo(x + w + 10, y + 8);
      ctx.stroke();
      const cloths = ['#e8e8f0', '#c23b2e', '#7a9b3f'];
      for (let i = 0; i < 3; i++) {
        const cx = x + 14 + i * ((w - 28) / 2);
        ctx.fillStyle = cloths[i % 3];
        ctx.beginPath();
        ctx.moveTo(cx - 16, y + 8);
        ctx.lineTo(cx + 16, y + 8);
        ctx.lineTo(cx + 12, y + h);
        ctx.lineTo(cx - 12, y + h);
        ctx.closePath();
        ctx.fill();
      }
      break;
    }
    case 'potrack': {
      // A kitchen rail with hanging pots; slide underneath.
      // Chains rise out of frame to the ceiling.
      ctx.strokeStyle = '#2c2c34';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x + 20, 0);
      ctx.lineTo(x + 20, y);
      ctx.moveTo(x + w - 20, 0);
      ctx.lineTo(x + w - 20, y);
      ctx.stroke();
      ctx.fillStyle = '#4a4a52';
      ctx.fillRect(x, y, w, 8);
      ctx.strokeStyle = '#2c2c34';
      ctx.lineWidth = 3;
      const pans = [46, 78, 110];
      for (const px of pans) {
        ctx.beginPath();
        ctx.moveTo(x + px, y + 8);
        ctx.lineTo(x + px, y + 18);
        ctx.stroke();
        ctx.fillStyle = '#3a3a44';
        ctx.beginPath();
        ctx.arc(x + px, y + 38, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#5a5a66';
        ctx.beginPath();
        ctx.arc(x + px, y + 38, 10, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 'crate': {
      ctx.fillStyle = '#b98a5e';
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = '#8a6a3a';
      ctx.lineWidth = 4;
      ctx.strokeRect(x + 2, y + 2, w - 4, h - 4);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + w, y + h);
      ctx.moveTo(x + w, y);
      ctx.lineTo(x, y + h);
      ctx.stroke();
      ctx.fillStyle = '#96683f';
      ctx.fillRect(x, y - 26, w * 0.8, 26);
      ctx.strokeRect(x, y - 26, w * 0.8, 26);
      break;
    }
    case 'pitchfork': {
      ctx.strokeStyle = '#7a7a7a';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(x + w / 2, y + h);
      ctx.lineTo(x + w / 2, y + 30);
      ctx.stroke();
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(x + w / 2 + i * 12, y + 30);
        ctx.lineTo(x + w / 2 + i * 12, y + 4);
        ctx.stroke();
      }
      ctx.fillStyle = '#8a5a2b';
      ctx.fillRect(x + w / 2 - 3, y + h - 46, 6, 46);
      break;
    }
    case 'lantern': {
      // Hangs from a rope above; the box is the lantern itself.
      ctx.strokeStyle = '#3a2a1a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x + w / 2, 0);
      ctx.lineTo(x + w / 2, y);
      ctx.stroke();
      ctx.fillStyle = '#2c2c34';
      ctx.fillRect(x, y, w, h);
      const glow = 0.75 + Math.sin(t * 6) * 0.25;
      ctx.fillStyle = `rgba(255, 190, 80, ${glow})`;
      ctx.beginPath();
      ctx.ellipse(x + w / 2, y + h / 2, w / 3, h / 3, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'oven': {
      // A squat iron oven with a glowing door and a chimney.
      ctx.fillStyle = '#4a4a52';
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = '#33333a';
      ctx.fillRect(x + w - 34, y - 34, 26, 34);
      const glow = 0.7 + Math.sin(t * 5) * 0.3;
      ctx.fillStyle = `rgba(255, 120, 30, ${glow})`;
      ctx.beginPath();
      ctx.roundRect(x + 18, y + h - 78, w - 36, 62, 8);
      ctx.fill();
      ctx.strokeStyle = '#22222a';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.roundRect(x + 18, y + h - 78, w - 36, 62, 8);
      ctx.stroke();
      ctx.fillStyle = '#c9c9d4';
      ctx.fillRect(x + w / 2 - 4, y + h - 60, 8, 26);
      ctx.fillStyle = '#e8e8f0';
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('HOT!', x + w / 2, y + 22);
      break;
    }
    case 'knife': {
      // A carving knife swinging down from above on a pivot.
      const swing = Math.sin(t * 3.2) * 0.55;
      ctx.save();
      ctx.translate(x + w / 2, y - 60);
      ctx.rotate(swing);
      ctx.fillStyle = '#5d3a1a';
      ctx.fillRect(-7, -30, 14, 44);
      ctx.fillStyle = '#dfe3ea';
      ctx.beginPath();
      ctx.moveTo(-9, 14);
      ctx.lineTo(9, 14);
      ctx.lineTo(4, 150);
      ctx.lineTo(0, 168);
      ctx.lineTo(-4, 150);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#9aa0ad';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 20);
      ctx.lineTo(0, 150);
      ctx.stroke();
      ctx.restore();
      break;
    }
    case 'pot': {
      ctx.fillStyle = '#3a3a44';
      ctx.beginPath();
      ctx.ellipse(x + w / 2, y + 14, w / 2, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(x, y + 10, w, h - 24);
      ctx.fillStyle = '#e8a33d';
      ctx.beginPath();
      ctx.ellipse(x + w / 2, y + 14, w / 2 - 8, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      // Bubbles.
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      const b = (Math.sin(t * 4) + 1) / 2;
      ctx.beginPath();
      ctx.arc(x + w / 2 - 16 + b * 30, y + 10, 4, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    default:
      break;
  }
  ctx.restore();
}

export function drawPickup(ctx, kind, x, y, t = 0) {
  const bob = Math.sin(t * 4 + x * 0.01) * 5;
  ctx.save();
  ctx.translate(x, y + bob);
  if (kind === 'corn') {
    ctx.fillStyle = '#f2c230';
    ctx.beginPath();
    ctx.ellipse(0, 0, 13, 20, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#c9972a';
    ctx.lineWidth = 2;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(-8 + i * 8, -14);
      ctx.lineTo(-8 + i * 8, 14);
      ctx.stroke();
    }
    ctx.fillStyle = '#7a9b3f';
    ctx.beginPath();
    ctx.ellipse(-8, 16, 8, 5, -0.6, 0, Math.PI * 2);
    ctx.ellipse(8, 16, 8, 5, 0.6, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'feather') {
    const glow = 0.6 + Math.sin(t * 5) * 0.4;
    ctx.fillStyle = `rgba(255, 215, 80, ${0.25 * glow})`;
    ctx.beginPath();
    ctx.arc(0, 0, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffd750';
    ctx.beginPath();
    ctx.ellipse(0, 0, 10, 22, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#c9972a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -20);
    ctx.lineTo(-6, 22);
    ctx.stroke();
  } else if (kind === 'pie') {
    ctx.fillStyle = '#e8912d';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, 22, -Math.PI * 0.75, Math.PI * 0.25);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fff3d6';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, 14, -Math.PI * 0.75, Math.PI * 0.25);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#c23b2e';
    ctx.beginPath();
    ctx.arc(-4, -2, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function drawForestGate(ctx, x, y) {
  // The escape: two pine trees and a gap of golden light.
  ctx.save();
  ctx.fillStyle = 'rgba(255, 220, 130, 0.85)';
  ctx.fillRect(x - 30, y - 260, 60, 260);
  ctx.fillStyle = '#2c5a2e';
  for (const dx of [-70, 70]) {
    ctx.beginPath();
    ctx.moveTo(x + dx, y - 300);
    ctx.lineTo(x + dx - 46, y - 180);
    ctx.lineTo(x + dx + 46, y - 180);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + dx, y - 260);
    ctx.lineTo(x + dx - 38, y - 150);
    ctx.lineTo(x + dx + 38, y - 150);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#5d3a1a';
    ctx.fillRect(x + dx - 8, y - 150, 16, 40);
    ctx.fillStyle = '#2c5a2e';
  }
  ctx.fillStyle = '#7a9b3f';
  ctx.font = 'bold 26px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('FREEDOM!', x, y - 300);
  ctx.restore();
}
