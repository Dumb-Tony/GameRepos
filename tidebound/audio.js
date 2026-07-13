/* =====================================================================
 * audio.js — Tidebound soundscape. Everything is synthesized with
 * WebAudio (no assets, matching the repo's no-dependency style).
 *
 * Two halves:
 *  - AMBIENCE: continuous layers (surf, wind, rain, river, drips, the
 *    seven-beat hum) crossfaded per scene backdrop + time of day, plus
 *    a scheduler that sprinkles one-shots (birdsong, crickets, frogs,
 *    cicadas, fire crackle, monsoon thunder).
 *  - CALLS: stylized animal one-shots when a creature's portrait
 *    appears (companions, wild encounters, the Boar King).
 *
 * All levels honor the settings in localStorage 'tidebound.settings'
 * and the master mute in 'tidebound.snd'. Everything is try/catch
 * guarded: audio must never break the game.
 * =================================================================== */
(function (G) {
  'use strict';
  const TB = (G.TB = G.TB || {});
  const A = (TB.Audio = {});

  let ctx = null, master = null, ambBus = null, sfxBus = null;
  const layers = {};       // name -> {gain, target}
  let schedTimer = null, humNext = 0, curMix = {}, curBgName = '';

  // ---- settings -------------------------------------------------------
  const DEFAULTS = { vol: 70, bright: 100, amb: true, sfx: true, theme: 'midnight', bars: 'island' };
  A.settings = function () {
    try { return Object.assign({}, DEFAULTS, JSON.parse(localStorage.getItem('tidebound.settings') || '{}')); }
    catch (e) { return Object.assign({}, DEFAULTS); }
  };
  A.saveSettings = function (s) { try { localStorage.setItem('tidebound.settings', JSON.stringify(s)); } catch (e) {} };
  A.muted = function () { try { return localStorage.getItem('tidebound.snd') === 'off'; } catch (e) { return false; } };

  A.applySettings = function () {
    const s = A.settings();
    if (master) master.gain.setTargetAtTime(A.muted() ? 0 : (s.vol / 100) * 0.9, ctx.currentTime, 0.1);
    if (ambBus) ambBus.gain.setTargetAtTime(s.amb ? 1 : 0, ctx ? ctx.currentTime : 0, 0.1);
    if (sfxBus) sfxBus.gain.setTargetAtTime(s.sfx ? 1 : 0, ctx ? ctx.currentTime : 0, 0.1);
    const bd = document.getElementById('backdrop');
    if (bd) bd.style.filter = 'brightness(' + (s.bright / 100) + ')';
    try { document.body.dataset.theme = s.theme; document.body.dataset.bars = s.bars; } catch (e) {}
  };

  // ---- graph ------------------------------------------------------------
  function noiseBuffer(color) {
    const len = ctx.sampleRate * 3, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      if (color === 'brown') { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
      else if (color === 'pink') { last = 0.98 * last + 0.02 * w; d[i] = (last * 3 + w * 0.3) * 0.8; }
      else d[i] = w * 0.6;
    }
    return buf;
  }
  function mkLayer(name, build) {
    const g = ctx.createGain(); g.gain.value = 0; g.connect(ambBus);
    build(g);
    layers[name] = { gain: g };
  }

  A.ensure = function () {
    if (ctx || !window.AudioContext) return;
    try {
      ctx = new AudioContext();
      master = ctx.createGain(); master.connect(ctx.destination);
      ambBus = ctx.createGain(); ambBus.connect(master);
      sfxBus = ctx.createGain(); sfxBus.connect(master);

      // -- continuous layers --
      mkLayer('surf', (out) => {
        const src = ctx.createBufferSource(); src.buffer = noiseBuffer('brown'); src.loop = true;
        const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 420;
        const sw = ctx.createGain(); sw.gain.value = 0.75;
        const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 0.09; lg.gain.value = 0.3;
        lfo.connect(lg); lg.connect(sw.gain); lfo.start();
        src.connect(lp); lp.connect(sw); sw.connect(out); src.start();
      });
      mkLayer('wind', (out) => {
        const src = ctx.createBufferSource(); src.buffer = noiseBuffer('pink'); src.loop = true;
        const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 500; bp.Q.value = 0.6;
        const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 0.05; lg.gain.value = 250;
        lfo.connect(lg); lg.connect(bp.frequency); lfo.start();
        src.connect(bp); bp.connect(out); src.start();
      });
      mkLayer('rain', (out) => {
        const src = ctx.createBufferSource(); src.buffer = noiseBuffer('white'); src.loop = true;
        const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 1000;
        const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 7000;
        src.connect(hp); hp.connect(lp); lp.connect(out); src.start();
      });
      mkLayer('river', (out) => {
        const src = ctx.createBufferSource(); src.buffer = noiseBuffer('white'); src.loop = true;
        const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 900; bp.Q.value = 0.4;
        const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 0.7; lg.gain.value = 0.15;
        const sw = ctx.createGain(); sw.gain.value = 0.8;
        lfo.connect(lg); lg.connect(sw.gain); lfo.start();
        src.connect(bp); bp.connect(sw); sw.connect(out); src.start();
      });
      mkLayer('hum', (out) => { out._isHum = true; }); // pulses scheduled below
      layers.hum.osc = null;

      A.applySettings();
      schedTimer = setInterval(tick, 260);
    } catch (e) { ctx = null; }
  };

  // ---- one-shot helpers ----------------------------------------------------
  function env(node, t0, a, hold, r, peak) {
    node.gain.setValueAtTime(0.0001, t0);
    node.gain.exponentialRampToValueAtTime(peak, t0 + a);
    node.gain.setValueAtTime(peak, t0 + a + hold);
    node.gain.exponentialRampToValueAtTime(0.0001, t0 + a + hold + r);
  }
  function tone(bus, type, f0, f1, t0, dur, peak, bendCurve) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t0);
    if (f1 && f1 !== f0) o.frequency[bendCurve || 'exponentialRampToValueAtTime'](f1, t0 + dur);
    env(g, t0, Math.min(0.02, dur / 4), dur * 0.4, dur * 0.6, peak);
    o.connect(g); g.connect(bus); o.start(t0); o.stop(t0 + dur * 2 + 0.1);
  }
  function noiseHit(bus, t0, dur, peak, freq, type) {
    const src = ctx.createBufferSource(); src.buffer = noiseBuffer('white'); src.loop = true;
    const f = ctx.createBiquadFilter(); f.type = type || 'bandpass'; f.frequency.value = freq; f.Q.value = 1.2;
    const g = ctx.createGain();
    env(g, t0, 0.005, dur * 0.3, dur * 0.7, peak);
    src.connect(f); f.connect(g); g.connect(bus); src.start(t0); src.stop(t0 + dur * 2 + 0.1);
  }

  // ---- the ambience scheduler (sprinkled one-shots + the 7-beat hum) ---------
  function tick() {
    if (!ctx || ctx.state !== 'running') return;
    const t = ctx.currentTime, m = curMix;
    try {
      if (m.birds && Math.random() < 0.055 * m.birds) { // little gliss whistles
        const f = 1400 + Math.random() * 1600, n = 2 + ((Math.random() * 3) | 0);
        for (let i = 0; i < n; i++) tone(ambBus, 'sine', f * (1 + Math.random() * 0.3), f * (0.7 + Math.random() * 0.6), t + i * 0.14, 0.09, 0.05 * m.birds);
      }
      if (m.crickets && Math.random() < 0.16 * m.crickets) { // pip-pip-pip groups
        const f = 3900 + Math.random() * 700;
        for (let i = 0; i < 4; i++) tone(ambBus, 'sine', f, f, t + i * 0.07, 0.03, 0.03 * m.crickets);
      }
      if (m.cicadas && Math.random() < 0.05 * m.cicadas) { // sustained dry buzz
        const g = ctx.createGain(), o = ctx.createOscillator(), trem = ctx.createOscillator(), tg = ctx.createGain();
        o.type = 'square'; o.frequency.value = 4800 + Math.random() * 900;
        trem.frequency.value = 26; tg.gain.value = 0.5; trem.connect(tg); tg.connect(g.gain);
        env(g, t, 0.3, 1.4, 0.9, 0.016 * m.cicadas);
        o.connect(g); g.connect(ambBus); o.start(t); trem.start(t); o.stop(t + 3); trem.stop(t + 3);
      }
      if (m.frogs && Math.random() < 0.09 * m.frogs) { // low double croak
        tone(ambBus, 'square', 190, 150, t, 0.09, 0.035 * m.frogs);
        tone(ambBus, 'square', 180, 140, t + 0.16, 0.11, 0.03 * m.frogs);
      }
      if (m.drips && Math.random() < 0.11 * m.drips) { // cave plink
        const f = 900 + Math.random() * 1400;
        tone(ambBus, 'sine', f, f * 0.6, t, 0.05, 0.05 * m.drips);
        tone(ambBus, 'sine', f * 0.99, f * 0.6, t + 0.22, 0.04, 0.018 * m.drips); // faint echo
      }
      if (m.fire && Math.random() < 0.35 * m.fire) noiseHit(ambBus, t, 0.02 + Math.random() * 0.02, 0.03 * m.fire, 2400 + Math.random() * 2000);
      if (m.thunder && Math.random() < 0.012 * m.thunder) noiseHit(ambBus, t, 1.6 + Math.random(), 0.12 * m.thunder, 90, 'lowpass');
      if (m.gulls && Math.random() < 0.03 * m.gulls) { // far seabirds
        const f = 900 + Math.random() * 300;
        for (let i = 0; i < 2; i++) tone(ambBus, 'sawtooth', f * 1.4, f, t + i * 0.25, 0.16, 0.014 * m.gulls);
      }
      // the seven-beat hum: seven soft low pulses, then the rest
      if (m.hum && t > humNext - 0.3) {
        const base = 54, step = 0.62;
        for (let i = 0; i < 7; i++) {
          const t0 = Math.max(t, humNext) + i * step;
          tone(ambBus, 'sine', base, base, t0, 0.34, 0.09 * m.hum);
          tone(ambBus, 'sine', base * 2.01, base * 2.01, t0, 0.3, 0.028 * m.hum);
        }
        humNext = Math.max(t, humNext) + 7 * step + 2.4;
      }
    } catch (e) { /* never let ambience kill the game */ }
  }

  // ---- scene mixing ------------------------------------------------------------
  // continuous layer levels + scheduler densities per backdrop, seasoned by segment
  function mixFor(bg, s) {
    const seg = s ? s.seg : 1, ch = s ? s.chapter : 1;
    const dawnish = seg === 0, dayish = seg === 1, dusk = seg === 2, night = seg === 3;
    const M = { surf: 0, wind: 0, rain: 0, river: 0, hum: 0, birds: 0, crickets: 0, cicadas: 0, frogs: 0, drips: 0, fire: 0, gulls: 0, thunder: 0 };
    switch (bg) {
      case 'title': M.surf = 0.55; M.hum = 0.35; M.gulls = 0.4; break;
      case 'sky': M.wind = 0.9; break;
      case 'ocean-night': M.wind = 0.5; M.surf = 0.5; break;
      case 'beach-day': case 'beach-dusk': M.surf = 0.85; M.gulls = 0.8; M.birds = dawnish ? 0.7 : 0.3; M.cicadas = dusk ? 0.8 : 0.15; M.wind = 0.15; break;
      case 'beach-night': M.surf = 0.7; M.crickets = 0.7; M.hum = 0.5; break;
      case 'tidepools': M.surf = 0.7; M.gulls = 0.7; M.birds = 0.2; break;
      case 'camp-fringe': case 'grove': M.birds = night ? 0 : dawnish ? 1 : 0.6; M.cicadas = dusk ? 1 : 0.25; M.crickets = night ? 0.8 : 0; M.wind = 0.12; M.surf = 0.12; break;
      case 'jungle': M.birds = night ? 0 : 0.9; M.cicadas = 0.5; M.crickets = night ? 0.9 : 0; M.wind = 0.1; break;
      case 'jungle-night': M.crickets = 1; M.frogs = 0.5; M.hum = 0.15; M.wind = 0.1; break;
      case 'cliff-camp': case 'caldera': M.wind = 0.85; M.gulls = 0.6; M.birds = 0.15; M.surf = 0.15; break;
      case 'river': M.river = 1; M.birds = night ? 0 : 0.5; M.crickets = night ? 0.7 : 0; break;
      case 'mangrove': M.frogs = 0.8; M.cicadas = 0.5; M.drips = 0.25; M.wind = 0.1; M.birds = 0.25; break;
      case 'station': M.wind = 0.45; M.cicadas = 0.4; M.birds = 0.25; M.drips = 0.12; break;
      case 'gullet': M.drips = 0.9; M.hum = 1; M.surf = 0.25; break;
      case 'temple': M.wind = 0.4; M.hum = 0.9; M.drips = 0.25; break;
      default: M.surf = 0.5; break;
    }
    if (s && s.fire && (bg === 'beach-night' || bg === 'jungle-night' || (night && (bg === 'camp-fringe' || bg === 'cliff-camp')))) M.fire = 0.8;
    if (ch === 5 && bg !== 'gullet' && bg !== 'temple') { M.rain = 0.65; M.thunder = 0.8; M.birds *= 0.3; M.cicadas = 0; M.gulls = 0; }
    return M;
  }

  A.setScene = function (bgName, s) {
    curBgName = bgName;
    curMix = mixFor(bgName, s);
    if (!ctx) return;
    try {
      const t = ctx.currentTime;
      for (const name of ['surf', 'wind', 'rain', 'river']) {
        layers[name].gain.gain.setTargetAtTime(curMix[name] || 0, t, 1.2); // slow crossfade
      }
    } catch (e) {}
  };

  // ---- animal calls ---------------------------------------------------------------
  const CALLS = {
    kavi: (t) => { // two soft woofs
      noiseHit(sfxBus, t, 0.09, 0.22, 260, 'lowpass'); tone(sfxBus, 'sawtooth', 220, 120, t, 0.1, 0.1);
      noiseHit(sfxBus, t + 0.28, 0.11, 0.2, 240, 'lowpass'); tone(sfxBus, 'sawtooth', 200, 110, t + 0.28, 0.12, 0.09);
    },
    ipo: (t) => { for (let i = 0; i < 5; i++) tone(sfxBus, 'square', 1100 + Math.random() * 500, 1600 + Math.random() * 400, t + i * 0.11, 0.06, 0.06); },
    vela: (t) => { tone(sfxBus, 'sine', 2300, 950, t, 0.5, 0.09); tone(sfxBus, 'sine', 2250, 1000, t + 0.6, 0.35, 0.055); },
    buri: (t) => { // wet double grunt
      tone(sfxBus, 'sawtooth', 130, 70, t, 0.16, 0.14); noiseHit(sfxBus, t, 0.14, 0.1, 300, 'lowpass');
      tone(sfxBus, 'sawtooth', 150, 75, t + 0.3, 0.2, 0.13); noiseHit(sfxBus, t + 0.3, 0.18, 0.1, 280, 'lowpass');
    },
    moa: (t) => { for (let i = 0; i < 4; i++) { const f = 640 - i * 40; tone(sfxBus, 'square', f, f * 0.8, t + i * 0.16, 0.07, 0.07); noiseHit(sfxBus, t + i * 0.16, 0.03, 0.03, 1800); } },
    nine: (t) => { for (let i = 0; i < 3; i++) tone(sfxBus, 'sine', 240 + i * 60, 460 + i * 90, t + i * 0.2, 0.13, 0.06); },
    boarking: (t) => { // slower, cavernous
      tone(sfxBus, 'sawtooth', 90, 50, t, 0.35, 0.16); noiseHit(sfxBus, t, 0.3, 0.12, 180, 'lowpass');
      tone(sfxBus, 'sawtooth', 100, 55, t + 0.55, 0.4, 0.15); noiseHit(sfxBus, t + 0.55, 0.35, 0.12, 170, 'lowpass');
    },
    grin: (t) => { noiseHit(sfxBus, t, 0.7, 0.1, 350, 'lowpass'); tone(sfxBus, 'sawtooth', 70, 45, t + 0.1, 0.5, 0.08); }, // low hiss-rumble
    hawk: (t) => { tone(sfxBus, 'sawtooth', 2800, 1400, t, 0.3, 0.06); },
  };
  let lastCallKey = '';
  A.call = function (species, sceneId) {
    if (!ctx || ctx.state !== 'running' || !CALLS[species]) return;
    const key = species + '@' + sceneId;
    if (key === lastCallKey) return; // one call per scene entry
    lastCallKey = key;
    try { CALLS[species](ctx.currentTime + 0.15); } catch (e) {}
  };

  A.toggleMute = function () {
    try { localStorage.setItem('tidebound.snd', A.muted() ? 'on' : 'off'); } catch (e) {}
    A.ensure(); if (ctx && ctx.state === 'suspended') ctx.resume();
    A.applySettings();
    const b = document.getElementById('sndBtn'); if (b) b.textContent = A.muted() ? '🔇' : '🔊';
  };
  A.kick = function () { // first user gesture
    A.ensure(); if (ctx && ctx.state === 'suspended') ctx.resume();
    A.applySettings(); A.setScene(curBgName || 'title', TB.state);
  };
})(window);
