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
      this.ok = false; this.muted = false; this.musicOn = true; this.haptics = true;
      this.ctx = null; this.master = null; this.musicGain = null; this._musicTimer = null;
    }

    setHaptics(on) { this.haptics = !!on; }
    // Fire a device vibration (mobile only; a no-op elsewhere). Independent of
    // the audio mute so you can play silently but still feel the taps.
    haptic(pattern) {
      if (!this.haptics) return;
      try { if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(pattern); } catch (e) {}
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
        // Soft limiter on the master bus. The meme SFX are authored at wildly
        // different peaks (0.12 … 0.7) and several can overlap during a chaotic
        // stretch, which clipped and made the loud ones jarring. This evens them
        // out and protects the output without hand-tuning every sound.
        let out = this.ctx.destination;
        try {
          const comp = this.ctx.createDynamicsCompressor();
          comp.threshold.value = -18; comp.knee.value = 24; comp.ratio.value = 8;
          comp.attack.value = 0.004; comp.release.value = 0.18;
          comp.connect(this.ctx.destination); out = comp; this.comp = comp;
        } catch (e) {}
        this.master.connect(out);
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

    // ---- richer synthesis helpers for the meme SFX --------------------
    _now() { return this.ctx ? this.ctx.currentTime : 0; }
    _sweep(f0, f1, dur, type, peak, when) {
      if (!this.ok || this.muted) return;
      const t = when != null ? when : this._now();
      const o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type = type || 'sawtooth'; o.frequency.setValueAtTime(f0, t);
      o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak || 0.3, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(this.master); o.start(t); o.stop(t + dur + 0.02); return o;
    }
    _noise(dur, peak, filterType, filterFreq, when) {
      if (!this.ok || this.muted) return;
      const t = when != null ? when : this._now();
      const len = Math.max(1, Math.floor(this.ctx.sampleRate * dur));
      const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      const n = this.ctx.createBufferSource(); n.buffer = buf;
      const f = this.ctx.createBiquadFilter(); f.type = filterType || 'bandpass'; f.frequency.value = filterFreq || 1200;
      const g = this.ctx.createGain(); g.gain.setValueAtTime(peak || 0.2, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      n.connect(f); f.connect(g); g.connect(this.master); n.start(t); n.stop(t + dur + 0.02);
    }

    // ---- meme SFX (original synths that EVOKE the sound, no sampled clips) --
    _mVineBoom() { const t = this._now(); this._sweep(150, 42, 0.55, 'sine', 0.46, t); this._sweep(95, 30, 0.55, 'triangle', 0.26, t); }
    _mBruh() { const t = this._now(); this._sweep(210, 105, 0.32, 'sawtooth', 0.35, t); this._sweep(140, 80, 0.32, 'square', 0.14, t); }
    _mAirhorn() { const t = this._now(); [0, 0.16, 0.32].forEach((d) => { this._sweep(258, 292, 0.15, 'sawtooth', 0.3, t + d); this._sweep(387, 438, 0.15, 'sawtooth', 0.14, t + d); }); }
    _mRizz() { const t = this._now(); this._sweep(300, 620, 0.42, 'sine', 0.32, t); this._sweep(450, 930, 0.42, 'triangle', 0.14, t); }
    _mSkibidi() { const t = this._now(); [640, 980, 620, 1220, 520, 900].forEach((f, i) => this._tone(f, 0.06, 'square', 0.24, t + i * 0.075)); }
    _mOhio() { const t = this._now(); this._sweep(320, 110, 0.6, 'sawtooth', 0.3, t); this._noise(0.6, 0.07, 'lowpass', 500, t); }
    _mGyatt() { const t = this._now(); this._sweep(130, 58, 0.4, 'sine', 0.46, t); this._noise(0.12, 0.13, 'lowpass', 200, t); }
    _mWobble() {
      const t = this._now(), o = this.ctx.createOscillator(), f = this.ctx.createBiquadFilter(), lfo = this.ctx.createOscillator(), lg = this.ctx.createGain(), g = this.ctx.createGain();
      o.type = 'sawtooth'; o.frequency.value = 104; f.type = 'lowpass'; f.frequency.value = 420;
      lfo.type = 'sine'; lfo.frequency.value = 9; lg.gain.value = 340; lfo.connect(lg); lg.connect(f.frequency);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.3, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
      o.connect(f); f.connect(g); g.connect(this.master); o.start(t); lfo.start(t); o.stop(t + 0.52); lfo.stop(t + 0.52);
    }
    _mSparkle() { const t = this._now(); [1250, 1600, 2050, 2600].forEach((f, i) => this._tone(f, 0.12, 'sine', 0.16, t + i * 0.05)); }
    _mRobot() { const t = this._now(); [420, 420, 300, 520, 300].forEach((f, i) => this._tone(f, 0.055, 'square', 0.2, t + i * 0.065)); }
    _mZombie() { const t = this._now(); this._sweep(88, 38, 0.75, 'sawtooth', 0.4, t); this._noise(0.75, 0.13, 'lowpass', 420, t); }
    _mCash() { const t = this._now(); [1568, 2093].forEach((f, i) => this._tone(f, 0.12, 'triangle', 0.25, t + i * 0.07)); }
    _mSad() { const t = this._now(); [330, 294, 262, 233].forEach((f, i) => this._sweep(f, f * 0.93, 0.24, 'sawtooth', 0.24, t + i * 0.2)); }
    _mBell() { const t = this._now(); this._tone(880, 0.5, 'sine', 0.28, t); this._tone(1320, 0.5, 'sine', 0.12, t); }

    // Map each upgrade to the meme sound that best fits it.
    buyUpgrade(u) {
      this.ensure(); if (!this.ok || this.muted) { return; }
      const MAP = {
        slang_skibidi: '_mSkibidi', shortvid: '_mSkibidi', slang_ohio: '_mOhio', slang_rizz: '_mRizz', trendsurf: '_mRizz',
        slang_gyatt: '_mGyatt', slang_fanum: '_mBruh', podcast: '_mBruh',
        slang_sigma: '_mBell', slang_delulu: '_mSparkle', slang_mid: '_mBruh', braindead: '_mVineBoom', edits: '_mSkibidi', tics: '_mWobble', hyperfix: '_mWobble',
        reaction: '_mVineBoom', ragebait: '_mAirhorn', algo: '_mAirhorn', influencer: '_mAirhorn', news: '_mAirhorn', streamer: '_mAirhorn',
        aislop: '_mRobot', npc: '_mRobot', botfarm: '_mRobot', modresist: '_mRobot', modresist2: '_mRobot', sockpuppets: '_mRobot', algocapture: '_mRobot', discord: '_mRobot', vpn: '_mRobot', firewall: '_mRobot',
        doomscroll: '_mWobble', fragment: '_mWobble', brainfog: '_mWobble', detach: '_mWobble', nosentences: '_mWobble', obfuscate: '_mWobble', astroturf: '_mWobble', deepfake: '_mWobble', remix: '_mWobble', memoryhole: '_mWobble', griefarmy: '_mWobble',
        combo_sor: '_mSparkle', combo_looksmax: '_mSparkle', combo_sigma: '_mBell', combo_delulu: '_mSparkle', multiling: '_mSparkle', translate: '_mSparkle', offgrid: '_mSparkle', satellite: '_mSparkle', emoji: '_mSparkle', qrgraffiti: '_mSkibidi',
        collapse: '_mZombie', terminal: '_mZombie', parasocial: '_mSad',
        boomer: '_mCash', smarttv: '_mCash', cryptogrift: '_mCash', mobilegame: '_mSkibidi', asmr: '_mRizz',
      };
      const fn = MAP[u.id] || (u.tree === 'symptom' ? '_mVineBoom' : u.tree === 'ability' ? '_mRobot' : '_mSkibidi');
      try { this[fn](); } catch (e) { this.buy(); }
    }

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
