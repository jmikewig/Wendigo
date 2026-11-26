// Procedural 8-bit audio via Web Audio API — no external sound files.
export class AudioEngine {
  constructor() {
    this.musicOn = false;
    this.sfxOn = true;
  }

  init() {
    if (this.ctx) return;
    const C = window.AudioContext || window.webkitAudioContext;
    this.ctx = new C();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.6;
    this.master.connect(this.ctx.destination);
    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = this.musicOn ? 1 : 0;
    this.musicGain.connect(this.master);
    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.value = this.sfxOn ? 1 : 0;
    this.sfxGain.connect(this.master);
    const len = this.ctx.sampleRate * 2;
    this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = this.noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  }

  setMusicEnabled(on) {
    this.musicOn = !!on;
    if (this.musicGain) this.musicGain.gain.setTargetAtTime(this.musicOn ? 1 : 0, this.now, 0.03);
  }

  setSfxEnabled(on) {
    this.sfxOn = !!on;
    if (this.sfxGain) this.sfxGain.gain.setTargetAtTime(this.sfxOn ? 1 : 0, this.now, 0.03);
  }

  get now() { return this.ctx.currentTime; }

  _env(g, peak, attack, dur) {
    const t = this.now;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  }

  tone(freq, dur, type = 'square', vol = 0.12, slideTo = null, bus = 'sfx') {
    if (!this.ctx) return;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, this.now);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, this.now + dur);
    this._env(g, vol, 0.01, dur);
    o.connect(g).connect(bus === 'music' ? this.musicGain : this.sfxGain);
    o.start(); o.stop(this.now + dur + 0.05);
  }

  noise(dur, vol, type = 'lowpass', freq = 1000, slideTo = null) {
    if (!this.ctx) return;
    const s = this.ctx.createBufferSource();
    s.buffer = this.noiseBuf;
    const f = this.ctx.createBiquadFilter();
    f.type = type; f.frequency.setValueAtTime(freq, this.now);
    if (slideTo) f.frequency.exponentialRampToValueAtTime(slideTo, this.now + dur);
    const g = this.ctx.createGain();
    this._env(g, vol, 0.01, dur);
    s.connect(f).connect(g).connect(this.sfxGain);
    s.start(); s.stop(this.now + dur + 0.05);
  }

  // ---- SFX ----
  step() { this.noise(0.05, 0.06, 'lowpass', 500); }
  page() { this.noise(0.18, 0.18, 'highpass', 2500, 5000); }
  pickup() { this.tone(660, 0.08); setTimeout(() => this.tone(990, 0.14), 70); }
  creak() { this.tone(180, 0.5, 'sawtooth', 0.05, 120); }
  whoosh() { this.noise(0.45, 0.45, 'bandpass', 400, 3000); }
  ignite() {
    this.noise(0.9, 0.5, 'bandpass', 600, 2000);
    this.tone(90, 0.6, 'sawtooth', 0.22, 40);
  }
  shriek() {
    this.tone(1200, 0.9, 'sawtooth', 0.2, 280);
    this.tone(1750, 0.7, 'square', 0.08, 500);
    this.noise(0.9, 0.3, 'highpass', 2500);
  }
  stinger() {
    this.tone(55, 2.4, 'sawtooth', 0.3, 38);
    this.tone(58.3, 2.4, 'sawtooth', 0.25, 39);
    this.tone(82, 1.6, 'square', 0.08, 60);
  }

  // ---- Loops ----
  startWind() {
    if (!this.ctx || this.wind) return;
    const s = this.ctx.createBufferSource();
    s.buffer = this.noiseBuf; s.loop = true;
    const f = this.ctx.createBiquadFilter();
    f.type = 'lowpass'; f.frequency.value = 450; f.Q.value = 2;
    const lfo = this.ctx.createOscillator(); lfo.frequency.value = 0.13;
    const lg = this.ctx.createGain(); lg.gain.value = 250;
    lfo.connect(lg).connect(f.frequency);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, this.now);
    g.gain.exponentialRampToValueAtTime(0.22, this.now + 3);
    s.connect(f).connect(g).connect(this.sfxGain);
    s.start(); lfo.start();
    this.wind = g;
  }
  setWind(v) { if (this.wind) this.wind.gain.setTargetAtTime(v, this.now, 0.8); }

  startGrowl() {
    if (!this.ctx || this.growl) return;
    const g = this.ctx.createGain(); g.gain.value = 0;
    const f = this.ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 240;
    for (const hz of [46, 49.5]) {
      const o = this.ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = hz;
      o.connect(f); o.start();
    }
    const trem = this.ctx.createGain(); trem.gain.value = 0.6;
    const lfo = this.ctx.createOscillator(); lfo.frequency.value = 2.7;
    const lg = this.ctx.createGain(); lg.gain.value = 0.4;
    lfo.connect(lg).connect(trem.gain); lfo.start();
    f.connect(trem).connect(g).connect(this.sfxGain);
    this.growl = g;
  }
  setGrowl(v) { if (this.growl) this.growl.gain.setTargetAtTime(v, this.now, 0.25); }

  startMusic() {
    if (!this.ctx || this.musicTimer) return;
    const notes = [220, 261.6, 329.6, 392, 349.2, 329.6, 261.6, 246.9];
    let i = 0;
    this.musicTimer = setInterval(() => {
      this.tone(notes[i % notes.length], 0.4, 'triangle', 0.05, null, 'music');
      if (i % 8 === 0) this.tone(110, 2.2, 'triangle', 0.05, null, 'music');
      i++;
    }, 320);
  }
  stopMusic() { clearInterval(this.musicTimer); this.musicTimer = null; }
}
