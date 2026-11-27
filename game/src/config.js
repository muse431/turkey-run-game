// Gobble Run — configuration: tuning, stages, obstacles, palette.
// One clear job: every number the game balances on lives here.

export const VIEW_W = 1280;
export const VIEW_H = 800;
export const GROUND_Y = 668; // top of the ground strip
export const PLAYER_X = 300; // turkey's fixed screen x
export const PX_PER_METER = 12; // world scroll speed maps to metres

export const GOAL_DISTANCE = 1200; // metres to the forest gate

export const TUNE = {
  baseSpeed: 430, // px per second at the start line
  speedPer100m: 26, // px/s gained every 100 m survived
  maxSpeed: 780,
  gravity: 2200,
  jumpVelocity: -950,
  slideTime: 0.55, // seconds a slide lasts
  coyoteTime: 0.09, // late-jump forgiveness after leaving the ground
  jumpBuffer: 0.12, // early-jump forgiveness before landing
  invulnerableTime: 1.4, // seconds of mercy after a hit
  farmerStartGap: 90, // metres between turkey and farmer at the start
  farmerMaxGap: 120,
  farmerGainOnHit: 24, // metres the farmer closes on every hit
  farmerGainPerSecond: 0.35, // he never stops walking
  farmerPushCorn: 2.5, // metres of breathing room per corn cob
  farmerPushFeather: 12,
  cornScore: 10,
  featherScore: 50,
  pieScore: 25,
  distanceScorePerMeter: 1,
  startLives: 3,
  spawnLead: 1400, // spawn obstacles this far ahead of the screen
  minGapPx: 300, // smallest gap between two obstacles
};

// The escape runs through three places, each harder than the last.
export const STAGES = [
  {
    id: 'farmyard',
    name: 'THE FARMYARD',
    sub: 'Dawn — the farmer is already awake',
    from: 0,
    to: 400,
    skyTop: '#ffd9a0',
    skyMid: '#ffb37a',
    skyBot: '#ff9e5e',
    ground: '#c98a3d',
    groundDark: '#a86f2c',
    accent: '#7a9b3f',
    obstacles: ['fence', 'haybale', 'puddle', 'clothesline', 'fence', 'haybale'],
    spawnEveryMin: 520,
    spawnEveryMax: 720,
  },
  {
    id: 'barn',
    name: 'THE BARN',
    sub: 'Dusk — pitchforks, crates and hanging lanterns',
    from: 400,
    to: 800,
    skyTop: '#3a2a55',
    skyMid: '#6b3a5e',
    skyBot: '#c96a4a',
    ground: '#5e3d24',
    groundDark: '#472c18',
    accent: '#e8a33d',
    obstacles: ['crate', 'pitchfork', 'lantern', 'haybale', 'crate', 'pitchfork'],
    spawnEveryMin: 500,
    spawnEveryMax: 700,
    speedBonus: 40,
  },
  {
    id: 'kitchen',
    name: 'THE KITCHEN',
    sub: 'Night — the oven is hot and the knife is out',
    from: 800,
    to: 1200,
    skyTop: '#f7e3c0',
    skyMid: '#f2c98f',
    skyBot: '#e8a56a',
    ground: '#b98a5e',
    groundDark: '#96683f',
    accent: '#c23b2e',
    obstacles: ['oven', 'knife', 'pot', 'potrack', 'oven', 'knife'],
    spawnEveryMin: 480,
    spawnEveryMax: 680,
    speedBonus: 80,
  },
];

// Every obstacle: what it looks like, how big it is, how to beat it.
export const OBSTACLES = {
  fence: { w: 46, h: 96, beat: 'jump', label: 'Fence', score: 5 },
  haybale: { w: 110, h: 84, beat: 'jump', label: 'Hay bale', score: 5 },
  puddle: { w: 100, h: 26, beat: 'jump', label: 'Mud puddle', score: 5 },
  clothesline: { w: 150, h: 56, beat: 'slide', label: 'Clothesline', score: 5, hangs: true },
  crate: { w: 96, h: 104, beat: 'jump', label: 'Crate stack', score: 8 },
  pitchfork: { w: 30, h: 150, beat: 'jump', label: 'Pitchfork', score: 8 },
  lantern: { w: 54, h: 60, beat: 'slide', label: 'Hanging lantern', score: 8, hangs: true },
  oven: { w: 150, h: 132, beat: 'jump', label: 'Hot oven', score: 12, hot: true },
  knife: { w: 40, h: 170, beat: 'jump', label: 'Carving knife', score: 12, swings: true },
  pot: { w: 100, h: 92, beat: 'jump', label: 'Stew pot', score: 12 },
  potrack: { w: 150, h: 64, beat: 'slide', label: 'Hanging pot rack', score: 12, hangs: true },
};

export const PICKUPS = {
  corn: { w: 44, h: 44, score: TUNE.cornScore, label: 'Corn' },
  feather: { w: 46, h: 46, score: TUNE.featherScore, label: 'Golden feather' },
  pie: { w: 48, h: 40, score: TUNE.pieScore, label: 'Pumpkin pie' },
};

// Farmer catch-up: how close he is drawn, in screen pixels, per metre of gap.
export function farmerScreenX(gapMeters) {
  // gap 0 -> right on the turkey's tail; gap 120 -> off the left edge.
  return PLAYER_X - 150 - gapMeters * 6.5;
}

export function stageAt(distanceMeters) {
  for (const s of STAGES) {
    if (distanceMeters < s.to) return s;
  }
  return STAGES[STAGES.length - 1];
}

export function stageIndexAt(distanceMeters) {
  return STAGES.indexOf(stageAt(distanceMeters));
}
