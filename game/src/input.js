// Gobble Run — input: keyboard and mouse, one clear job.
// Keys are edge-triggered (pressed this frame) so a held key cannot
// double-jump; the game polls `pressed()` once per frame and clears it.

const GAME_KEYS = {
  jump: ['Space', 'ArrowUp', 'KeyW'],
  slide: ['ArrowDown', 'KeyS'],
  start: ['Enter', 'Space'],
  restart: ['KeyR', 'Enter', 'Space'],
  pause: ['KeyP', 'Escape'],
  mute: ['KeyM'],
};

export class Input {
  constructor(canvas) {
    this._down = new Set();
    this._pressed = new Set();
    this._click = null; // {x, y} in canvas pixels, consumed once
    this._clickQueued = false;
    this._anyKey = false;

    window.addEventListener('keydown', (e) => {
      if (GAME_KEYS.jump.includes(e.code) || GAME_KEYS.slide.includes(e.code)) {
        e.preventDefault(); // keep Space/arrows from scrolling the page
      }
      if (!e.repeat) {
        this._down.add(e.code);
        this._pressed.add(e.code);
        this._anyKey = true;
      }
    });
    window.addEventListener('keyup', (e) => this._down.delete(e.code));
    window.addEventListener('blur', () => this._down.clear());

    canvas.addEventListener('pointerdown', (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      this._click = {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
      this._clickQueued = true;
      this._anyKey = true;
    });
  }

  // True only on the frame the key went down.
  pressed(action) {
    return GAME_KEYS[action].some((code) => this._pressed.has(code));
  }

  held(action) {
    return GAME_KEYS[action].some((code) => this._down.has(code));
  }

  // A mouse/touch tap, returned once then cleared.
  click() {
    if (!this._clickQueued) return null;
    this._clickQueued = false;
    return this._click;
  }

  // Any key or click this frame (used to dismiss the title screen).
  anyPressed() {
    return this._anyKey || this._pressed.size > 0 || this._clickQueued;
  }

  endFrame() {
    this._pressed.clear();
    this._anyKey = false;
  }
}
