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
 *  - MUSIC: a generative adaptive score. Each scene maps to a MOOD
 *    (title/day/night/storm/deep/ending/death) with its own chord
 *    progression, pentatonic pluck scale, and pacing; soft pads play a
 *    phrase, kalimba-ish plucks decorate it, then the music rests and
 *    breathes before the next phrase. Own menu toggle (settings.music).
 *
 * All levels honor the settings in localStorage 'tidebound.settings'
 * and the master mute in 'tidebound.snd'. Everything is try/catch
 * guarded: audio must never break the game.
 * =================================================================== */
(function (G) {
  'use strict';
  const TB = (G.TB = G.TB || {});
  const A = (TB.Audio = {});

  let ctx = null, master = null, ambBus = null, sfxBus = null, musBus = null;
  const layers = {};       // name -> {gain, target}
  let schedTimer = null, humNext = 0, curMix = {}, curBgName = '';

  // ---- settings -------------------------------------------------------
  const DEFAULTS = { vol: 70, bright: 100, amb: true, sfx: true, music: true, rec: true, theme: 'midnight', bars: 'island', tsize: 100, type: false, kind: false };
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
    musOn = !!s.music;
    if (musBus) musBus.gain.setTargetAtTime(musOn ? 0.85 : 0, ctx ? ctx.currentTime : 0, 0.4);
    const bd = document.getElementById('backdrop');
    if (bd) bd.style.filter = 'brightness(' + (s.bright / 100) + ')';
    try {
      document.body.dataset.theme = s.theme; document.body.dataset.bars = s.bars;
      document.documentElement.style.setProperty('--tscale', (s.tsize || 100) / 100);
    } catch (e) {}
    try { if (TB.FX) TB.FX.refresh(); } catch (e) {}
    try { recScene(); } catch (e) {} // recorded beds honor the toggle immediately
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
      musBus = ctx.createGain(); musBus.gain.value = 0; musBus.connect(master);

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
    try { musTick(t); } catch (e) { /* music must never kill the game */ }
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
    curBgName = bgName; curS = s;
    curMix = mixFor(bgName, s);
    setMood(moodFor(bgName, s));
    if (!ctx) return;
    try { applyBeds(); } catch (e) {}
    try { recScene(); } catch (e) {}
  };
  // the four continuous synth beds; recorded ambience, when playing, takes
  // the foreground and the synth beds fall to a quarter underneath it
  function applyBeds() {
    const t = ctx.currentTime, duck = recCur ? 0.25 : 1;
    for (const name of ['surf', 'wind', 'rain', 'river']) {
      layers[name].gain.gain.setTargetAtTime((curMix[name] || 0) * duck, t, 1.2); // slow crossfade
    }
  }

  // ---- recorded ambience --------------------------------------------------
  // Real recorded beds (art/amb-*.m4a, fetched by the manifest workflow like
  // every other generated asset). One bed at a time, chosen by backdrop;
  // loops via WebAudio with trimmed loop points, crossfades on scene change,
  // rides ambBus (so the Ambience toggle + volume + mute all still rule it).
  // Anything without a bed — or any load failure — falls back to pure synth.
  const REC_LEVEL = { surf: 0.5, jungle: 0.5, night: 0.45, rain: 0.62, cave: 0.55 };
  const REC_FILE = { surf: 'amb-surf', jungle: 'amb-jungle', night: 'amb-night', rain: 'amb-rain', cave: 'amb-cave', theme: 'mus-title' };
  const recBufs = {}, recPending = {}, recDead = {};
  let recCur = null;   // { key, src, gain }
  let themeCur = null; // looping title track on the music bus
  let curS = null;     // the state setScene was last given (authoritative for bed choice)

  function recKeyFor(bg, s) {
    const ch = s ? s.chapter : 1, seg = s ? s.seg : 1;
    if (ch === 5 && bg !== 'gullet' && bg !== 'temple') return 'rain'; // the Long Rain outranks everything outdoors
    if (bg === 'gullet' || bg === 'temple') return 'cave';
    if (bg === 'jungle-night' || bg === 'beach-night') return 'night';
    if (seg === 3 && (bg === 'camp-fringe' || bg === 'jungle' || bg === 'grove' || bg === 'river' || bg === 'mangrove')) return 'night';
    if (bg === 'jungle' || bg === 'camp-fringe' || bg === 'grove' || bg === 'mangrove' || bg === 'station') return 'jungle';
    if (bg === 'title' || bg === 'beach-day' || bg === 'beach-dusk' || bg === 'tidepools' || bg === 'ocean-night') return 'surf';
    return null; // sky, river, cliffs, caldera: the synth beds carry those
  }
  function recLoad(key, cb) {
    if (recBufs[key]) { if (cb) cb(); return; }
    if (recDead[key] || recPending[key] || !ctx || typeof fetch !== 'function') return;
    if (location.protocol === 'file:') { recDead[key] = true; return; } // no fetch off disk — pure synth there
    recPending[key] = true;
    fetch('art/' + REC_FILE[key] + '.mp3')
      .then((r) => { if (!r.ok) throw new Error('http ' + r.status); return r.arrayBuffer(); })
      .then((ab) => ctx.decodeAudioData(ab))
      .then((buf) => { recBufs[key] = buf; delete recPending[key]; if (cb) cb(); })
      .catch(() => { recDead[key] = true; delete recPending[key]; }); // synth keeps the watch
  }
  function recStop() {
    if (!recCur) return;
    const c = recCur; recCur = null;
    try {
      c.gain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.5);
      setTimeout(() => { try { c.src.stop(); } catch (e) {} }, 1800);
    } catch (e) {}
  }
  function recPlay(key) {
    const buf = recBufs[key];
    const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
    src.loopStart = 0.06; src.loopEnd = Math.max(0.2, buf.duration - 0.06); // shave the edges off the seam
    const g = ctx.createGain(); g.gain.value = 0.0001;
    src.connect(g); g.connect(ambBus); src.start();
    g.gain.setTargetAtTime(REC_LEVEL[key] || 0.5, ctx.currentTime, 0.9);
    recCur = { key, src, gain: g };
  }
  function recScene() {
    if (!ctx) return;
    const on = A.settings().rec !== false;
    const key = on ? recKeyFor(curBgName, curS || TB.state) : null;
    if (!recCur || recCur.key !== key) {
      recStop();
      if (key) recLoad(key, () => {
        // only start if this bed is still the right one by the time it decodes
        if (!recCur && A.settings().rec !== false && recKeyFor(curBgName, curS || TB.state) === key) { recPlay(key); applyBeds(); }
      });
      if (key && recBufs[key] && !recCur) { recPlay(key); }
    }
    applyBeds();
    themeScene();
  }
  // the recorded title theme: loops on the music bus at the title screens,
  // and the generative score yields while it plays
  function themeScene() {
    const want = musOn && A.settings().rec !== false && musMood === 'title';
    if (themeCur && !want) {
      const c = themeCur; themeCur = null;
      try { c.gain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.6); setTimeout(() => { try { c.src.stop(); } catch (e) {} }, 2200); } catch (e) {}
      return;
    }
    if (!themeCur && want) recLoad('theme', () => {
      if (themeCur || !musOn || musMood !== 'title' || A.settings().rec === false) return;
      const src = ctx.createBufferSource(); src.buffer = recBufs.theme; src.loop = true;
      src.loopStart = 0.05; src.loopEnd = Math.max(0.2, recBufs.theme.duration - 0.05);
      const g = ctx.createGain(); g.gain.value = 0.0001;
      src.connect(g); g.connect(musBus); src.start();
      g.gain.setTargetAtTime(0.42, ctx.currentTime, 1.2);
      themeCur = { src, gain: g };
    });
  }
  A._rec = function () { return { cur: recCur && recCur.key, theme: !!themeCur, dead: Object.keys(recDead), have: Object.keys(recBufs) }; }; // for tests

  // ---- music ----------------------------------------------------------------
  // Chords/scales are MIDI note numbers. A phrase = the whole progression
  // played once on soft pads (plucks sprinkled over it, an optional motif
  // sung once at the top), then the music rests for `rest` seconds so the
  // island ambience gets the foreground back.
  const NOTE = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const MOODS = {
    title: { // the beach at golden hour — Am, F, C, G
      prog: [[57, 64, 69, 72], [53, 60, 65, 69], [48, 55, 64, 72], [55, 62, 67, 71]],
      scale: [69, 72, 74, 76, 79, 81], dur: 7, rest: 5, pad: 0.042, pluck: 0.10, plevel: 0.05,
      motif: [[76, 0], [74, 0.55], [72, 1.1], [69, 1.9], [72, 2.75], [74, 3.3], [81, 4.4]],
    },
    day: { // wandering — C, Am7, F, G
      prog: [[48, 60, 64, 67], [45, 57, 64, 67], [41, 57, 60, 65], [43, 59, 62, 67]],
      scale: [72, 74, 76, 79, 81, 84], dur: 6.5, rest: 16, pad: 0.034, pluck: 0.13, plevel: 0.045,
    },
    night: { // sparse, low, wide gaps
      prog: [[45, 57, 60, 64], [41, 53, 60, 65], [43, 55, 62, 67]],
      scale: [64, 67, 69, 72, 76], dur: 9, rest: 24, pad: 0.03, pluck: 0.05, plevel: 0.035,
    },
    storm: { // the long rain — Dm, Bb, Gm, A
      prog: [[50, 57, 62, 65], [46, 58, 62, 65], [43, 55, 58, 62], [45, 57, 61, 64]],
      scale: [62, 65, 69, 74], dur: 8, rest: 11, pad: 0.05, pluck: 0.04, plevel: 0.04,
    },
    deep: { // gullet/temple/caldera — rooted on A to sit inside the 54Hz hum
      prog: [[45, 57, 64, 71], [43, 55, 62, 71], [41, 53, 60, 69], [40, 52, 59, 67]],
      scale: [76, 79, 81, 83, 88], dur: 10, rest: 8, pad: 0.05, pluck: 0.07, plevel: 0.038,
    },
    ending: { // resolution — C, G/B, Am add9, F
      prog: [[48, 60, 64, 67], [47, 59, 62, 67], [45, 57, 64, 71], [41, 57, 60, 65]],
      scale: [72, 76, 79, 81, 84], dur: 7, rest: 4, pad: 0.05, pluck: 0.15, plevel: 0.05,
      motif: [[72, 0], [76, 0.5], [79, 1.05], [84, 1.9], [79, 2.75], [76, 3.3], [72, 4.2]],
    },
    death: { // a slow exhale, no plucks
      prog: [[45, 52, 60, 64], [41, 48, 57, 65], [43, 50, 58, 62]],
      scale: [], dur: 11, rest: 16, pad: 0.045, pluck: 0, plevel: 0,
    },
  };
  let musOn = true, musMood = '', musIdx = 0, musNext = 0, musPhraseEnd = 0;

  function moodFor(bg, s) {
    if (s && s.scene === 'death') return 'death';
    if (s && s.scene === 'ending') return 'ending';
    if (bg === 'title' || bg === 'sky' || bg === 'ocean-night') return 'title';
    if (s && s.chapter === 5) return 'storm';
    if (bg === 'gullet' || bg === 'temple' || bg === 'caldera') return 'deep';
    if (s && s.seg === 3) return 'night';
    return 'day';
  }
  function setMood(m) {
    if (m === musMood) return;
    musMood = m; musIdx = 0;
    // let the current pad tail ring out, then the new mood takes over;
    // death/ending answer the scene right away
    const soon = (m === 'death' || m === 'ending') ? 0.5 : 2.2;
    if (ctx) musNext = Math.min(musNext, ctx.currentTime + soon), musPhraseEnd = 0;
  }
  A.mood = function () { return musMood; }; // for tests

  function pad(t0, midi, dur, peak) {
    const f = NOTE(midi);
    const o1 = ctx.createOscillator(), o2 = ctx.createOscillator();
    const lp = ctx.createBiquadFilter(), g = ctx.createGain();
    o1.type = 'triangle'; o1.frequency.value = f;
    o2.type = 'sine'; o2.frequency.value = f * 1.004; // gentle chorus shimmer
    lp.type = 'lowpass'; lp.frequency.value = Math.min(1800, f * 4);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + dur * 0.35);
    g.gain.setValueAtTime(peak, t0 + dur * 0.6);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur * 1.15);
    o1.connect(lp); o2.connect(lp); lp.connect(g); g.connect(musBus);
    o1.start(t0); o2.start(t0);
    o1.stop(t0 + dur * 1.2 + 0.1); o2.stop(t0 + dur * 1.2 + 0.1);
  }
  function pluck(t0, midi, peak) { // kalimba-ish: pure tone + fast bright partial
    const f = NOTE(midi);
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine'; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(peak, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.9);
    const o2 = ctx.createOscillator(), g2 = ctx.createGain();
    o2.type = 'sine'; o2.frequency.value = f * 3.01;
    g2.gain.setValueAtTime(0.0001, t0);
    g2.gain.exponentialRampToValueAtTime(peak * 0.25, t0 + 0.008);
    g2.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.25);
    o.connect(g); g.connect(musBus); o2.connect(g2); g2.connect(musBus);
    o.start(t0); o.stop(t0 + 1.1); o2.start(t0); o2.stop(t0 + 0.4);
  }
  function musTick(t) {
    if (!musOn || !musMood) return;
    if (themeCur) return; // the recorded title theme has the floor
    const M = MOODS[musMood]; if (!M) return;
    if (t >= musNext) { // next chord of the phrase
      const chord = M.prog[musIdx];
      A._mchords = (A._mchords || 0) + 1; // debug/test counter
      for (const n of chord) pad(t + 0.05, n, M.dur, M.pad);
      if (musIdx === 0 && M.motif) for (const [n, dt] of M.motif) pluck(t + 0.6 + dt, n, M.plevel * 1.25);
      musIdx++;
      if (musIdx >= M.prog.length) { musIdx = 0; musNext = t + M.dur + M.rest; musPhraseEnd = t + M.dur * 1.1; }
      else { musNext = t + M.dur; musPhraseEnd = musNext + M.dur; }
    } else if (t < musPhraseEnd && M.pluck && Math.random() < M.pluck) {
      pluck(t + 0.02, M.scale[(Math.random() * M.scale.length) | 0], M.plevel);
    }
  }

  // ---- regional motifs -------------------------------------------------------------
  // Each Wayfinder region owns a short signature phrase — a handful of
  // plucks in its own character, played once per arrival (map.js calls
  // A.motif(regionId) from M.run). Rides the music bus, so it honors the
  // music toggle and the master mute. [midi, dt-seconds] pairs.
  const MOTIFS = {
    bay:       [[60, 0], [64, 0.3], [67, 0.6], [72, 1.05]],                 // home water: a rising arrival
    tidepools: [[84, 0], [81, 0.22], [84, 0.44], [88, 0.8]],                // quick curious dabs, high
    bonebeach: [[50, 0], [53, 0.55], [50, 1.1]],                            // hollow and sparse, like wind in ribs
    fringe:    [[64, 0], [67, 0.3], [69, 0.65], [67, 1.0]],                 // the familiar green, swaying
    deepgreen: [[52, 0], [55, 0.45], [58, 0.9], [57, 1.35]],                // a dark climb with a wrong turn
    cliffs:    [[67, 0], [74, 0.35], [79, 0.75]],                           // open fifths thrown to the wind
    river:     [[81, 0], [79, 0.18], [76, 0.36], [74, 0.54], [72, 0.72]],   // silver running downhill
    mangrove:  [[47, 0], [53, 0.6], [48, 1.2]],                             // swamp-slow, a tritone of patience
    grove:     [[62, 0], [66, 0.3], [69, 0.6], [74, 1.0]],                  // hearth-warm, Edda's kettle
    station:   [[70, 0], [70, 0.3], [69, 0.7], [70, 1.15]],                 // a machine remembering its one note
    grotto:    [[45, 0], [52, 0.55], [57, 1.1]],                            // deep, A-rooted, hum-adjacent
    caldera:   [[57, 0], [58, 0.5], [57, 1.0], [52, 1.6]],                  // solemn keening at the Crown
  };
  let lastMotifKey = '';
  A.motif = function (region) {
    if (!ctx || ctx.state !== 'running' || !musOn || !MOTIFS[region]) return;
    const s = TB.state;
    const key = region + '@' + (s ? s.day + '.' + s.seg : '');
    if (key === lastMotifKey) return; // one phrase per arrival, reload-safe
    lastMotifKey = key;
    try {
      const t = ctx.currentTime + 0.15;
      for (const [n, dt] of MOTIFS[region]) pluck(t + dt, n, 0.07);
    } catch (e) {}
  };
  A._motifs = MOTIFS; // for tests

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
  // ---- UI voice: tiny synthesized ticks on the sfx bus ----------------------
  // tap = a choice pressed (driftwood knock); open/close = overlays lifted and
  // set down (shell rise/fall); chime = a trophy landing. All honor the sfx
  // toggle, master mute, and volume — quiet by design.
  A.ui = function (kind) {
    if (!ctx || ctx.state !== 'running' || A.muted() || !A.settings().sfx) return;
    A._uiCount = (A._uiCount || 0) + 1; // for tests
    try {
      const t = ctx.currentTime + 0.01;
      if (kind === 'tap') {
        tone(sfxBus, 'sine', 620, 470, t, 0.045, 0.045);
        noiseHit(sfxBus, t, 0.025, 0.045, 2600, 'bandpass');
      } else if (kind === 'open') {
        tone(sfxBus, 'sine', 340, 560, t, 0.09, 0.04);
      } else if (kind === 'close') {
        tone(sfxBus, 'sine', 540, 330, t, 0.09, 0.035);
      } else if (kind === 'chime') {
        tone(sfxBus, 'sine', 659, 659, t, 0.28, 0.06);
        tone(sfxBus, 'sine', 988, 988, t + 0.14, 0.42, 0.05);
      } else if (kind === 'bond') { // warmer, lower: a bond deepening
        tone(sfxBus, 'sine', 523, 523, t, 0.3, 0.05);
        tone(sfxBus, 'sine', 659, 659, t + 0.16, 0.45, 0.045);
      }
    } catch (e) {}
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
