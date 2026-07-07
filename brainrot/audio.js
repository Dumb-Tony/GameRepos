/* =====================================================================
 * audio.js — all sound is synthesized live with WebAudio (no files).
 * Notification pops, TikTok-ish blips, level-up stings, win/lose jingles,
 * plus a mellow lo-fi background loop.  Safe no-op without AudioContext.
 * =================================================================== */
(function (G) {
  'use strict';
  const BR = (G.BR = G.BR || {});

  class Audio {
    constructor() {
      this.ok = false; this.muted = false; this.musicOn = true;
      this.ctx = null; this.master = null; this.musicGain = null; this._musicTimer = null;
    }

    // Must be resumed from a user gesture (browser autoplay policy).
    ensure() {
      if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
      const AC = G.AudioContext || G.webkitAudioContext;
      if (!AC) return;
      try {
        this.ctx = new AC();
        this.master = this.ctx.createGain();
        this.master.gain.value = this.muted ? 0 : 0.6;
        this.master.connect(this.ctx.destination);
        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.value = 0.12;
        this.musicGain.connect(this.master);
        this.ok = true;
        if (this.musicOn) this._startMusic();
      } catch (e) { this.ok = false; }
    }

    setMuted(m) { this.muted = m; if (this.master) this.master.gain.value = m ? 0 : 0.6; }
    setMusic(on) {
      this.musicOn = on;
      if (!this.ok) return;
      if (on) this._startMusic(); else this._stopMusic();
    }

    // ---- one-shot voice helper ----------------------------------------
    _tone(freq, dur, type, gain, when) {
      if (!this.ok || this.muted) return;
      const t = (when || this.ctx.currentTime);
      const o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(gain || 0.3, t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(this.master);
      o.start(t); o.stop(t + dur + 0.02);
      return o;
    }

    // ---- named SFX ----------------------------------------------------
    pop() { if (!this.ok) return; const o = this._tone(520, 0.12, 'sine', 0.35);
      if (o) o.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.09); }
    click() { this._tone(300, 0.05, 'square', 0.12); }
    buy() { this.ensure(); const t = this.ctx && this.ctx.currentTime;
      [523, 659, 784].forEach((f, i) => this._tone(f, 0.16, 'triangle', 0.28, t + i * 0.05)); }
    viral() { this.ensure(); const t = this.ctx && this.ctx.currentTime;
      [660, 990, 1320].forEach((f, i) => this._tone(f, 0.14, 'sine', 0.3, t + i * 0.04)); }
    event(tone) {
      this.ensure();
      if (tone === 'good') this._tone(700, 0.14, 'sine', 0.25);
      else if (tone === 'bad') this._tone(240, 0.22, 'sawtooth', 0.22);
      else if (tone === 'chaos') { const t = this.ctx && this.ctx.currentTime;
        [400, 300, 520, 260].forEach((f, i) => this._tone(f, 0.1, 'square', 0.16, t + i * 0.05)); }
      else this._tone(440, 0.1, 'triangle', 0.18);
    }
    win() { this.ensure(); const t = this.ctx && this.ctx.currentTime;
      [523, 659, 784, 1047, 1319].forEach((f, i) => this._tone(f, 0.5, 'triangle', 0.3, t + i * 0.12)); }
    lose() { this.ensure(); const t = this.ctx && this.ctx.currentTime;
      [440, 370, 294, 220].forEach((f, i) => this._tone(f, 0.4, 'sawtooth', 0.25, t + i * 0.16)); }

    // ---- background music: slow arpeggio over a lo-fi chord cycle ------
    _startMusic() {
      if (!this.ok || this._musicTimer) return;
      const scale = [220, 262, 294, 330, 392, 440, 523];
      const chords = [[0, 2, 4], [3, 5, 0], [4, 6, 1], [1, 3, 5]];
      let step = 0;
      const tick = () => {
        if (!this.musicOn || !this.ok) return;
        const ch = chords[Math.floor(step / 4) % chords.length];
        const note = scale[ch[step % ch.length]];
        const t = this.ctx.currentTime;
        const o = this.ctx.createOscillator(), g = this.ctx.createGain();
        o.type = 'sine'; o.frequency.value = note * (step % 8 < 4 ? 1 : 0.5);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.5, t + 0.05);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
        o.connect(g); g.connect(this.musicGain); o.start(t); o.stop(t + 0.55);
        step++;
        this._musicTimer = setTimeout(tick, 340);
      };
      tick();
    }
    _stopMusic() { if (this._musicTimer) { clearTimeout(this._musicTimer); this._musicTimer = null; } }
  }
  BR.Audio = Audio;

})(typeof window !== 'undefined' ? window : globalThis);
