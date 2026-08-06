/* =====================================================================
 * animations.js — the FX overlay (particles + floating text + confetti).
 * Drawn on a separate canvas above the map so the sim never blocks on it.
 * Browser-only; capped particle budget keeps it smooth.
 * =================================================================== */
(function (G) {
  'use strict';
  const BR = (G.BR = G.BR || {});
  const MAX = 420; // hard particle cap

  class FX {
    constructor() { this.parts = []; this.texts = []; this.shake = 0; this._shakeMax = 0; this._shakeT = 0; }

    _room() { return this.parts.length < MAX; }

    // ---- screen shake -------------------------------------------------
    // amp = pixels of displacement. Decays over `dur`. Additive-ish: a bigger
    // incoming shake wins so a small tap can't cut a big one short.
    addShake(amp, dur) {
      amp = Math.min(amp || 6, 14);              // keep it tasteful, never nauseating
      if (amp <= this.shake) return;
      this.shake = amp; this._shakeMax = amp; this._shakeT = dur || 0.4;
    }
    // Current (x,y) offset to translate the scene by. Call once per frame.
    shakeOffset(t) {
      if (this.shake <= 0) return { x: 0, y: 0 };
      const a = this.shake;
      return { x: Math.sin(t * 53.1) * a, y: Math.cos(t * 61.7) * a * 0.8 };
    }
    _updateShake(dt) {
      if (this.shake <= 0) return;
      this._shakeT -= dt;
      if (this._shakeT <= 0) { this.shake = 0; return; }
      // ease out so it settles smoothly
      this.shake = this._shakeMax * Math.max(0, this._shakeT / (this._shakeT + dt * 6));
      this.shake *= 0.88;
      if (this.shake < 0.15) this.shake = 0;
    }

    // Radial spark burst (used when a country jumps a brainrot stage, etc).
    burst(x, y, color, count) {
      count = count || 14;
      for (let i = 0; i < count && this._room(); i++) {
        const a = (i / count) * Math.PI * 2 + Math.random() * 0.4;
        const sp = 40 + Math.random() * 120;
        this.parts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
          life: 0.6 + Math.random() * 0.5, max: 1.1, r: 2 + Math.random() * 3, color, g: 60 });
      }
    }

    // Floating emoji that drifts up and fades (viral moment / meme pop).
    emojiPop(x, y, emoji) {
      this.texts.push({ x, y, text: emoji, color: null, size: 30, life: 1.1, max: 1.1, vy: -34, font: 'serif' });
    }

    // Floating +number readout.
    floatText(x, y, text, color) {
      this.texts.push({ x, y, text, color: color || '#a8d93a', size: 15, life: 1.0, max: 1.0, vy: -40, font: 'Inter, system-ui, sans-serif' });
    }

    // Celebration shower on win.
    confetti(w, h) {
      const cols = ['#a8d93a', '#8a7ff0', '#ff5a5a', '#f2c94c', '#43c6ac', '#ff00e6'];
      for (let i = 0; i < 160 && this._room(); i++) {
        this.parts.push({ x: Math.random() * w, y: -10 - Math.random() * h * 0.5,
          vx: (Math.random() - 0.5) * 60, vy: 60 + Math.random() * 140,
          life: 3 + Math.random() * 2, max: 5, r: 3 + Math.random() * 4,
          color: cols[(Math.random() * cols.length) | 0], g: 120, spin: Math.random() * 6, square: true });
      }
    }

    // A single firework: radial spray of sparks that arc and fade.
    firework(x, y, color) {
      const n = 26;
      for (let i = 0; i < n && this._room(); i++) {
        const a = (i / n) * Math.PI * 2 + Math.random() * 0.2;
        const sp = 90 + Math.random() * 150;
        this.parts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 30,
          life: 0.9 + Math.random() * 0.7, max: 1.6, r: 1.8 + Math.random() * 2.6, color, g: 140 });
      }
    }

    // Full win sequence: confetti + staged fireworks + a shockwave of shake.
    // Scheduled internally so it unfolds over ~2.5s instead of one flat burst.
    celebrate(w, h, opts) {
      opts = opts || {};
      const cols = opts.colors || ['#ffd85c', '#ff4bd8', '#4be7ff', '#5ffbe0', '#b57bff', '#ff8be6'];
      this.confetti(w, h);
      this.addShake(11, 0.7);
      // first volley immediately, then a few more staggered across the screen
      const pop = (i) => {
        const x = w * (0.15 + Math.random() * 0.7), y = h * (0.16 + Math.random() * 0.4);
        this.firework(x, y, cols[i % cols.length]);
        this.addShake(5, 0.25);
      };
      pop(0);
      this._celebT = [];
      for (let i = 1; i < 7; i++) {
        this._celebT.push(setTimeout(() => { pop(i); if (i === 3) this.confetti(w, h); }, i * 340));
      }
    }
    // Cancel any in-flight celebration timers (new game / leaving the screen).
    stopCelebrate() { (this._celebT || []).forEach(clearTimeout); this._celebT = []; }

    update(dt) {
      this._updateShake(dt);
      for (let i = this.parts.length - 1; i >= 0; i--) {
        const p = this.parts[i];
        p.life -= dt; if (p.life <= 0) { this.parts.splice(i, 1); continue; }
        p.vy += (p.g || 60) * dt;
        p.x += p.vx * dt; p.y += p.vy * dt;
        if (p.spin) p.spin += dt * 8;
      }
      for (let i = this.texts.length - 1; i >= 0; i--) {
        const t = this.texts[i];
        t.life -= dt; if (t.life <= 0) { this.texts.splice(i, 1); continue; }
        t.y += t.vy * dt; t.vy *= 0.94;
      }
    }

    render(ctx) {
      for (const p of this.parts) {
        const a = Math.max(0, p.life / p.max);
        ctx.globalAlpha = a;
        ctx.fillStyle = p.color;
        if (p.square) {
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.spin || 0);
          ctx.fillRect(-p.r, -p.r, p.r * 2, p.r * 2); ctx.restore();
        } else {
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
        }
      }
      for (const t of this.texts) {
        const a = Math.max(0, t.life / t.max);
        ctx.globalAlpha = a;
        ctx.font = `700 ${t.size}px ${t.font}`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        if (t.color) {
          ctx.fillStyle = t.color;
          ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 3;
          ctx.strokeText(t.text, t.x, t.y); ctx.fillText(t.text, t.x, t.y);
        } else {
          ctx.fillText(t.text, t.x, t.y);
        }
      }
      ctx.globalAlpha = 1;
    }

    clear() { this.stopCelebrate(); this.parts.length = 0; this.texts.length = 0; this.shake = 0; this._shakeT = 0; }
  }
  BR.FX = FX;

})(typeof window !== 'undefined' ? window : globalThis);
