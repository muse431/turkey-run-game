// Gobble Run — sound: everything is synthesized with WebAudio,
// no audio files. One clear job: gobbles, boings, thuds and a
// plucky little banjo-ish loop, all generated in code.

export class Sound {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this._musicTimer = null;
    this._musicStep = 0;
    // A cheerful autumn run, in C major pentatonic, one bar loops.
    this._melody = [523, 659, 784, 659, 880, 784, 659, 587, 523, 587, 659, 784];
  }

  ensure() {
    if (!this.ctx) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AC();
      } catch {
        this.ctx = null;
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  _tone(freq, dur, type, vol, when = 0, slideTo = null) {
    if (this.muted || !this.ensure()) return;
    const t0 = this.ctx.currentTime + when;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  jump() {
    this._tone(300, 0.16, 'sine', 0.16, 0, 620);
  }

  land() {
    this._tone(140, 0.08, 'triangle', 0.1, 0, 90);
  }

  slide() {
    this._tone(500, 0.18, 'sawtooth', 0.05, 0, 180);
  }

  corn() {
    this._tone(880, 0.07, 'sine', 0.14);
    this._tone(1318, 0.09, 'sine', 0.12, 0.06);
  }

  feather() {
    [660, 880, 1108, 1318].forEach((f, i) => this._tone(f, 0.12, 'sine', 0.12, i * 0.07));
  }

  hit() {
    this._tone(160, 0.25, 'sawtooth', 0.22, 0, 55);
    this._tone(90, 0.3, 'square', 0.14, 0.02, 40);
  }

  // The turkey's signature: two quick low gobbles.
  gobble() {
    this._tone(220, 0.09, 'square', 0.1, 0, 160);
    this._tone(200, 0.09, 'square', 0.1, 0.11, 150);
    this._tone(240, 0.12, 'square', 0.09, 0.23, 170);
  }

  stageClear() {
    [523, 659, 784, 1046].forEach((f, i) => this._tone(f, 0.16, 'triangle', 0.14, i * 0.09));
  }

  caught() {
    [392, 330, 262, 196].forEach((f, i) => this._tone(f, 0.3, 'sawtooth', 0.12, i * 0.16));
  }

  escaped() {
    [523, 659, 784, 1046, 1318, 1568].forEach((f, i) =>
      this._tone(f, 0.22, 'triangle', 0.13, i * 0.1),
    );
  }

  startMusic() {
    if (this._musicTimer || this.muted) return;
    this._musicTimer = setInterval(() => {
      if (this.muted) return;
      const note = this._melody[this._musicStep % this._melody.length];
      this._tone(note, 0.22, 'triangle', 0.045);
      if (this._musicStep % 4 === 2) this._tone(note / 2, 0.3, 'sine', 0.05);
      this._musicStep += 1;
    }, 240);
  }

  stopMusic() {
    if (this._musicTimer) {
      clearInterval(this._musicTimer);
      this._musicTimer = null;
    }
  }
}
