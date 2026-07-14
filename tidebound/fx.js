/* Tidebound — fx.js — VISIBLE WEATHER: what the island does, you now see.
 *
 * A pointer-transparent layer appended INSIDE #backdrop (above the painted
 * scene and the generated art, below the HUD and the panel):
 *   · monsoon rain sheets + occasional lightning strobes — same gate as the
 *     audio in audio.js mixFor: chapter 5 (or the NG+ 'hard' modifier from
 *     chapter 4), never in the gullet or the temple
 *   · fireflies drifting on jungle nights
 *   · the lagoon's seven-beat glow at beach-night (and a deeper, bluer
 *     breathing in the gullet/temple), pulsed on the same 0.62s step +
 *     2.4s rest rhythm as the hum in audio.js
 *
 * Honors the menu toggle (settings.wfx). When the setting has never been
 * touched, it defaults to ON unless the player asked their OS for reduced
 * motion — but an explicit toggle-on is always respected.
 * The engine calls TB.FX.setScene(bg, state) from setBackdrop.
 */
(function () {
  'use strict';
  const TB = window.TB;
  const FX = (TB.FX = {});
  let built = false, boltTimer = null, lastBg = null, lastState = null;

  function build() {
    if (built) return;
    const bd = document.getElementById('backdrop');
    if (!bd) return;
    const host = document.createElement('div');
    host.id = 'fx';
    host.setAttribute('aria-hidden', 'true');
    host.innerHTML = '<div id="fxGlow"></div><div id="fxRain"></div><div id="fxRain2"></div><div id="fxBolt"></div><div id="fxFlies"></div>';
    bd.appendChild(host);
    const flies = host.querySelector('#fxFlies');
    for (let i = 0; i < 14; i++) {
      const f = document.createElement('span');
      f.className = 'fxFly';
      f.style.left = (6 + Math.random() * 88).toFixed(1) + '%';
      f.style.top = (16 + Math.random() * 66).toFixed(1) + '%';
      f.style.setProperty('--dx', (Math.random() * 130 - 65).toFixed(0) + 'px');
      f.style.setProperty('--dy', (-10 - Math.random() * 70).toFixed(0) + 'px');
      f.style.animationDuration = (7 + Math.random() * 7).toFixed(1) + 's';
      f.style.animationDelay = (-Math.random() * 12).toFixed(1) + 's';
      flies.appendChild(f);
    }
    built = true;
  }

  FX.enabled = function () {
    const st = TB.Audio ? TB.Audio.settings() : {};
    if ('wfx' in st) return !!st.wfx;
    try { return !window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
    catch (e) { return true; }
  };

  // what the sky is doing over this backdrop — mirrors audio.js mixFor
  function weatherFor(bg, s) {
    const ch = s ? s.chapter : 1;
    const monsoon = (ch === 5 || (s && s.mod === 'hard' && ch >= 4)) &&
      bg !== 'gullet' && bg !== 'temple' && bg !== 'title';
    const glow = bg === 'beach-night' ? 'sea'
      : (bg === 'gullet' || bg === 'temple') ? 'deep' : null;
    return { rain: monsoon, flies: bg === 'jungle-night' && !monsoon, glow };
  }

  FX.setScene = function (bg, s) {
    lastBg = bg || 'beach-day'; lastState = s;
    build();
    const host = document.getElementById('fx');
    if (!host) return;
    const w = FX.enabled() ? weatherFor(lastBg, s) : { rain: false, flies: false, glow: null };
    host.classList.toggle('fxRainOn', !!w.rain);
    host.classList.toggle('fxFliesOn', !!w.flies);
    host.classList.toggle('fxGlowOn', !!w.glow);
    host.classList.toggle('fxGlowDeep', w.glow === 'deep');
    if (w.rain && !boltTimer) armBolt();
  };

  // re-apply after a settings change (audio.js applySettings calls this)
  FX.refresh = function () { if (lastBg) FX.setScene(lastBg, lastState); };

  function armBolt() {
    boltTimer = setTimeout(function () {
      boltTimer = null;
      const host = document.getElementById('fx');
      if (!host || !host.classList.contains('fxRainOn')) return; // sky cleared
      const b = document.getElementById('fxBolt');
      if (b) { b.classList.remove('flash'); void b.offsetWidth; b.classList.add('flash'); }
      armBolt();
    }, 7000 + Math.random() * 14000);
  }
})();
