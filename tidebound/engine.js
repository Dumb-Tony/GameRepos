/* =====================================================================
 * engine.js — Tidebound core. Scene runner, state, ledger, day/segment
 * clock, meters HUD, kit overlay, save/load. Scenes live in the
 * scenes-*.js files and register themselves via TB.scene(id, def).
 *
 * Scene definition:
 *   TB.scene('id', {
 *     bg: 'beach-day',              // backdrop class (bg-<name>)
 *     hud: false,                   // hide HUD (title screens etc.)
 *     who: {emoji,name} | fn(s),    // optional portrait
 *     enter: fn(s),                 // side effects on entry
 *     text: [..] | fn(s)->[..],     // paragraphs, revealed one per click
 *     choices: [..] | fn(s)->[..],  // {t, sub?, if?, do?, go}  go: id|fn
 *     next: 'id' | fn(s),           // used when there are no choices
 *     nextLabel: 'Continue ➤',
 *   })
 * =================================================================== */
(function (G) {
  'use strict';
  const TB = (G.TB = G.TB || {});
  const SAVE_KEY = 'tidebound.save.v1';
  TB.SAVE_KEY = SAVE_KEY;
  const $ = (id) => document.getElementById(id);

  TB.SCENES = {};
  TB.SCHEDULE = [];         // filled by chapter files: {d, s, id, when?:fn}
  TB.SEGS = ['🌅 Dawn', '☀️ Day', '🌇 Dusk', '🌙 Night'];
  TB.clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  TB.scene = function (id, def) { def.id = id; TB.SCENES[id] = def; };

  // ---- state ---------------------------------------------------------
  TB.newState = function () {
    return {
      scene: 'title', day: 0, seg: 0, hudOn: false,
      chapter: 1, site: null, trust: 0, edda: 0, disease: null, ryo: 0,
      stats: { health: 100, hunger: 80, thirst: 75, energy: 85, hope: 55 },
      bgnd: null,                       // background: medic|photog|cook|engineer
      inv: {},                          // item -> count (booleans as 1)
      flags: {},                        // the Ledger
      met: {},                          // animal -> true
      interest: {},                     // animal -> courtship warmth
      route: { signal: 0, roots: 0, depth: 0 },
      companion: null,
      fire: 0, shelter: 0,              // camp tiers 0..2
      food: 0,                          // preserved food units
      injury: null,                     // null | 'laceration'
      pools: 0,                         // tide-pool visits (Nine gate)
      fired: {},                        // scheduled events already run
      deathCause: null,
      mod: null,                        // NG+ run modifier: hard|silent|kind|chaos
    };
  };

  // ---- state helpers (used heavily by scene files) --------------------
  TB.stat = function (k, d) {
    const s = TB.state.stats;
    s[k] = TB.clamp(Math.round(s[k] + d), 0, 100);
    TB.renderHud();
  };
  TB.item = function (k, d) {
    const inv = TB.state.inv;
    inv[k] = Math.max(0, (inv[k] || 0) + (d === undefined ? 1 : d));
    if (!inv[k]) delete inv[k];
  };
  TB.has = (k) => (TB.state.inv[k] || 0) > 0;
  TB.flag = function (k, v) { TB.state.flags[k] = v === undefined ? true : v; };
  TB.is = (k) => !!TB.state.flags[k];
  TB.route = function (k, d) { TB.state.route[k] += d; };
  TB.meet = function (k, warmth) {
    TB.state.met[k] = true;
    TB.state.interest[k] = (TB.state.interest[k] || 0) + (warmth || 0);
  };
  TB.warm = function (k, d) { TB.state.interest[k] = (TB.state.interest[k] || 0) + d; };
  // Companion trust (0-100). Never shown as a number — only as behavior.
  TB.bond = function (d) { TB.state.trust = TB.clamp(TB.state.trust + d, 0, 100); };
  TB.tier = function () { const t = TB.state.trust; return t >= 100 ? 4 : t >= 75 ? 3 : t >= 50 ? 2 : t >= 25 ? 1 : 0; };

  // ---- the clock -------------------------------------------------------
  // Consumes one segment: base metabolic tick, then starvation/thirst harm.
  TB.tickSegment = function () {
    const s = TB.state;
    // the Long Rain: water everywhere, food scarce, everything heavier.
    // Hard Season (NG+ modifier) starts it a chapter early; Kind Tide softens all drains.
    const monsoon = s.chapter === 5 || (s.mod === 'hard' && s.chapter >= 4);
    const k = s.mod === 'kind' ? 0.6 : 1;
    s.stats.hunger = TB.clamp(s.stats.hunger - (monsoon ? 8 : 6) * k, 0, 100);
    s.stats.thirst = TB.clamp(s.stats.thirst - (monsoon ? 3 : s.site === 'overhang' ? 8 : 6) * k, 0, 100);
    s.stats.energy = TB.clamp(s.stats.energy - (monsoon ? 4 : 3) * k, 0, 100);
    if (s.stats.hunger === 0) s.stats.health = TB.clamp(s.stats.health - 8 * k, 0, 100);
    if (s.stats.thirst === 0) s.stats.health = TB.clamp(s.stats.health - 12 * k, 0, 100);
    if (s.injury) s.stats.health = TB.clamp(s.stats.health - 2, 0, 100);
    if (s.disease === 'fever') {
      s.stats.health = TB.clamp(s.stats.health - 1, 0, 100);
      if (s.stats.energy > 55) s.stats.energy = 55; // the fever's ceiling
    }
    if (s.stats.health <= 0 && !s.deathCause) {
      s.deathCause = s.disease === 'fever' ? 'fever' : s.stats.thirst === 0 ? 'thirst' : s.stats.hunger === 0 ? 'hunger' : 'injury';
    }
    s.seg += 1;
    if (s.seg > 3) { s.seg = 0; s.day += 1; }
    TB.renderHud();
  };

  // Where does the story go after an action consumes a segment?
  // Priority: death → scheduled event → chapter thresholds → night → camp.
  TB.advance = function () {
    const s = TB.state;
    if (s.deathCause) return 'death';
    for (const ev of TB.SCHEDULE) {
      if (ev.d === s.day && ev.s === s.seg && !s.fired[ev.id] && (!ev.when || ev.when(s))) {
        s.fired[ev.id] = true;
        return ev.id;
      }
    }
    if (s.chapter === 1) {
      if (s.day === 3 && s.seg === 3 && !TB.is('CLEARING_DONE')) return 'clearing';
      if (s.day > 3) return 'slice_end'; // safety net; courtship normally hands off to ch2
    }
    if (s.chapter === 2 && s.day > 9) return 'ch2_end'; // safety net; the Smoke threshold normally ends the chapter
    if (s.chapter === 3 && s.day > 15) return 'ch3_end'; // safety net; Old Grin's Toll normally ends the chapter
    if (s.chapter === 4 && s.day > 21) return 'ch4_end'; // safety net; Vane's Question normally ends the chapter
    if (s.chapter === 5 && s.day > 28) return 'ch5_end'; // safety net; each variant's finale normally ends the chapter
    if (s.chapter >= 6) return s.deathCause ? 'death' : 'ch6_open'; // chapters 6+ are linear chains; advance() shouldn't be reached
    if (s.seg === 3) return s.chapter >= 2 ? 'night2' : 'night';
    if (TB.randomEvent) { const ev = TB.randomEvent(s); if (ev) return ev; } // the living island
    return s.chapter >= 2 ? 'camp2' : 'camp';
  };

  // ---- save / load ----------------------------------------------------
  TB.save = function () {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(TB.state)); } catch (e) { /* private mode */ }
  };
  TB.loadSave = function () {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const st = JSON.parse(raw);
      if (!st || !TB.SCENES[st.scene]) return null;
      // migrate saves from before later chapters existed
      st.chapter = st.chapter || 1; st.trust = st.trust || 0; st.site = st.site || null;
      st.edda = st.edda || 0; st.disease = st.disease || null; st.ryo = st.ryo || 0;
      st.mod = st.mod || null;
      return st;
    } catch (e) { return null; }
  };
  TB.wipe = function () { try { localStorage.removeItem(SAVE_KEY); } catch (e) {} };
  TB.hasSave = function () { return !!TB.loadSave(); };

  // ---- cross-run memory: the island remembers -------------------------
  const META_KEY = 'tidebound.meta.v1';
  TB.meta = function () {
    try { return JSON.parse(localStorage.getItem(META_KEY)) || { runs: 0, endings: {}, deaths: {} }; }
    catch (e) { return { runs: 0, endings: {}, deaths: {} }; }
  };
  TB.recordEnd = function (kind, id) {
    const s = TB.state, m = TB.meta();
    if (!s.flags.META_RECORDED) { s.flags.META_RECORDED = true; m.runs += 1; }
    const key = 'META_K_' + kind + ':' + id;
    if (!s.flags[key]) {
      s.flags[key] = true;
      if (kind === 'ending') m.endings[id] = (m.endings[id] || 0) + 1;
      else m.deaths[id] = (m.deaths[id] || 0) + 1;
    }
    try { localStorage.setItem(META_KEY, JSON.stringify(m)); } catch (e) {}
  };

  // Ambient audio & animal calls live in audio.js (TB.Audio); the in-game
  // menu (TAB) lives in menu.js (TB.Menu). The engine only sends hooks.

  // ---- rendering -------------------------------------------------------
  let queue = [];       // paragraphs waiting to be revealed
  let currentDef = null;

  TB.renderHud = function () {
    const s = TB.state;
    $('hud').classList.toggle('hidden', !s.hudOn);
    if (!s.hudOn) return;
    $('hudDay').textContent = 'Day ' + s.day;
    $('hudSeg').textContent = TB.SEGS[s.seg];
    for (const k of ['health', 'hunger', 'thirst', 'energy', 'hope']) {
      $('m' + k[0].toUpperCase() + k.slice(1)).style.width = s.stats[k] + '%';
    }
  };

  function setBackdrop(name) {
    $('backdrop').className = 'bg-' + (name || 'beach-day');
    if (TB.Audio) TB.Audio.setScene(name || 'beach-day', TB.state);
  }

  // which stylized call a scene should make when its portrait appears
  const CALL_BY_EMOJI = { '🐕': 'kavi', '🐒': 'ipo', '🦅': 'vela', '🐗': 'buri', '🐔': 'moa', '🐙': 'nine' };
  function animalCallFor(def, who, sceneId) {
    if (/^(ev3_grin|ch3_toll)/.test(sceneId)) return 'grin';
    if (sceneId === 'ev_moa') return 'hawk';
    if (!who) return null;
    if (who.art === 'char-boarking') return 'boarking';
    return CALL_BY_EMOJI[who.emoji] || null;
  }

  // Generated art lives ONLY in art/ (one flat folder), referenced by
  // filename here — backdrops via CSS classes, portraits via this map.
  // Missing files degrade gracefully to the CSS-painted scene / emoji.
  const PORTRAIT_ART = { '🐕': 'char-kavi', '🐒': 'char-ipo', '🦅': 'char-vela', '🐗': 'char-buri', '🐔': 'char-moa', '🐙': 'char-nine' };
  function setPortrait(who) {
    const el = $('portrait');
    if (!who) { el.classList.add('hidden'); return; }
    el.classList.remove('hidden');
    const img = $('portraitImg');
    const art = who.art || PORTRAIT_ART[who.emoji];
    if (art) {
      img.onerror = function () { img.classList.add('hidden'); $('portraitEmoji').classList.remove('hidden'); };
      img.onload = function () { img.classList.remove('hidden'); $('portraitEmoji').classList.add('hidden'); };
      img.src = 'art/' + art + '.webp';
    } else {
      img.classList.add('hidden');
      $('portraitEmoji').classList.remove('hidden');
    }
    $('portraitEmoji').textContent = who.emoji || '';
    $('portraitName').textContent = who.name || '';
  }

  // ---- text reveal (+ backlog history, + optional typewriter) ------------
  const history = []; // this session's read paragraphs, for the 📖 backlog
  TB.history = history;
  let typing = null; // {p, segs, si, ci, timer, done}

  function cancelTyping() { if (typing) { clearInterval(typing.timer); typing = null; } }
  function finishTyping() {
    if (!typing) return;
    const t = typing; cancelTyping();
    t.p.innerHTML = t.html; // snap to the complete paragraph
    t.done();
  }
  TB.isTyping = function () { return !!typing; };

  // types plain text + <em> spans character by character; any other markup
  // falls back to an instant reveal
  function typeInto(p, html, done) {
    if (/<(?!\/?em>)[a-z!]/i.test(html)) { p.innerHTML = html; done(); return; }
    const segs = [];
    let em = false;
    for (const tok of html.split(/(<em>|<\/em>)/)) {
      if (tok === '<em>') em = true;
      else if (tok === '</em>') em = false;
      else if (tok) segs.push({ t: tok, em });
    }
    typing = { p, html, done, segs, si: 0, ci: 0, node: null };
    const log = $('textLog');
    typing.timer = setInterval(function () {
      if (!typing) return;
      for (let k = 0; k < 2; k++) { // two characters per tick
        const seg = typing.segs[typing.si];
        if (!seg) { finishTyping(); return; }
        if (!typing.node) {
          typing.node = seg.em ? document.createElement('em') : document.createTextNode('');
          typing.p.appendChild(typing.node);
        }
        typing.node.textContent = seg.t.slice(0, ++typing.ci);
        if (typing.ci >= seg.t.length) { typing.si++; typing.ci = 0; typing.node = null; }
      }
      log.scrollTop = log.scrollHeight;
    }, 14);
  }

  function showNextParagraph() {
    if (typing) { finishTyping(); return; } // a click completes the line first
    if (!queue.length) return;
    const log = $('textLog');
    for (const p of log.children) p.classList.add('faded');
    const html = queue.shift();
    const p = document.createElement('p');
    log.appendChild(p);
    history.push({ d: TB.state.day, sc: TB.state.scene, h: html });
    if (history.length > 500) history.splice(0, history.length - 500);
    const done = function () {
      log.scrollTop = log.scrollHeight;
      if (queue.length) {
        $('moreHint').classList.remove('hidden');
        $('panel').classList.add('clickable');
      } else {
        $('moreHint').classList.add('hidden');
        $('panel').classList.remove('clickable');
        showChoices();
      }
    };
    const tw = TB.Audio && TB.Audio.settings && TB.Audio.settings().type;
    if (tw) { log.scrollTop = log.scrollHeight; typeInto(p, html, done); }
    else { p.innerHTML = html; done(); }
  }

  function resolve(v, s) { return typeof v === 'function' ? v(s) : v; }

  function showChoices() {
    const s = TB.state;
    const box = $('choices');
    box.innerHTML = '';
    let list = resolve(currentDef.choices, s);
    if (list) list = list.filter((c) => !c.if || c.if(s));
    if (!list || !list.length) {
      // linear scene: single continue button
      if (!currentDef.next) return; // terminal scene (title handles itself)
      list = [{ t: currentDef.nextLabel || 'Continue ➤', go: currentDef.next }];
    }
    for (const c of list) {
      const b = document.createElement('button');
      b.innerHTML = c.t + (c.sub ? '<span class="sub">' + c.sub + '</span>' : '');
      if (c.cls) b.className = c.cls;
      b.onclick = function () {
        if (c.do) c.do(s);
        const target = resolve(c.go, s);
        if (target) TB.go(target);
      };
      box.appendChild(b);
    }
    box.scrollTop = 0; // first option always in view when choices appear
  }

  TB.go = function (id) {
    try { TB._go(id); } catch (e) {
      const b = $('crashBanner');
      if (b) { b.style.display = 'block'; b.textContent = '💥 scene "' + id + '": ' + e.message; }
      throw e;
    }
  };
  TB._go = function (id) {
    const def = TB.SCENES[id];
    if (!def) { throw new Error('Unknown scene: ' + id); }
    const s = TB.state;
    s.scene = id;
    currentDef = def;
    if (def.enter) def.enter(s);
    if (s.deathCause && id !== 'death' && id !== 'title') { TB.go('death'); return; }
    if (id === 'ending' && s.endingId) TB.recordEnd('ending', s.endingId);
    if (id === 'death' && s.deathCause) TB.recordEnd('death', s.deathCause);
    setBackdrop(resolve(def.bg, s));
    const who = resolve(def.who, s);
    setPortrait(who);
    if (TB.Audio) { const sp = animalCallFor(def, who, id); if (sp) TB.Audio.call(sp, id); }
    s.hudOn = def.hud === false ? false : s.hudOn;
    TB.renderHud();
    cancelTyping(); // never type into a cleared log
    $('textLog').innerHTML = '';
    $('choices').innerHTML = '';
    queue = (resolve(def.text, s) || ['…']).slice();
    showNextParagraph();
    if (id !== 'title') TB.save(); // saving on the title screen would clobber a real run
  };

  // ---- kit overlay ------------------------------------------------------
  const ITEM_NAMES = {
    flaregun: '🔫 Flare gun (one flare)', medkit: '🩹 Med-kit', toolbox: '🧰 Toolbox',
    rations: '🥫 Rations', tarp: '🟦 Tarpaulin', case: '💼 Locked courier case',
    lighter: '🔥 Lighter', knife: '🔪 Chef\'s knife', camera: '📷 Camera (cracked lens)',
    multitool: '🛠️ Multitool', coconut: '🥥 Coconut', photo: '🖼️ A stranger\'s photograph',
  };
  function openKit() {
    const s = TB.state;
    const items = $('kitItems');
    items.innerHTML = '';
    const keys = Object.keys(s.inv);
    if (!keys.length) items.innerHTML = '<div class="none">Empty hands, full ocean.</div>';
    for (const k of keys) {
      const d = document.createElement('div');
      d.textContent = (ITEM_NAMES[k] || k) + (s.inv[k] > 1 ? ' ×' + s.inv[k] : '');
      items.appendChild(d);
    }
    const facts = $('kitFacts');
    facts.innerHTML = '';
    const known = [];
    if (s.companion) {
      const nm = { kavi: '🐕 Kavi', ipo: '🐒 Ipo', vela: '🦅 Vela', buri: '🐗 Buri', moa: '🐔 Moa', nine: '🐙 Nine' }[s.companion];
      const tierLine = [
        'keeps a careful distance still, watching everything you do.',
        'shares your camp now, and takes food from your hand.',
        'comes when you call. You are, apparently, a fact of life.',
        'has started acting on your behalf without being asked.',
        'is family. There is no other word left.',
      ][TB.tier()];
      known.push(nm + ' ' + tierLine);
    }
    if (TB.is('EDDA_MET')) {
      const e = s.edda;
      known.push('👵 Edda ' + (e >= 60 ? 'trusts you now, in her flinty way. The grove is half yours to work.' : e >= 35 ? 'tolerates your visits, and feeds you while insulting you. Progress.' : 'is watching you the way she watches weather: for damage.'));
    }
    if (s.disease === 'fever') known.push('🤒 Marsh fever is in your blood. It will not leave on its own.');
    if (TB.is('RYO_MET')) known.push('⛵ Ryo Nakata ' + (s.ryo >= 40 ? 'is on his feet and already talking about hulls, tides, and home. He means all three.' : 'is mending in your camp, slowly. The sea nearly kept him.'));
    if (s.fire) known.push('🔥 You have fire.' + (s.fire > 1 ? ' A proper hearth, even.' : ''));
    if (s.shelter) known.push(s.shelter > 1 ? '🏠 Your shelter is sturdy.' : '⛺ You have a lean-to.');
    if (s.food) known.push('🍖 Food put by: ' + s.food + ' meal' + (s.food > 1 ? 's' : '') + '.');
    if (s.injury) known.push('🩸 You are hurt. It needs tending.');
    for (const a of Object.keys(s.met)) {
      const names = { kavi: '🐕 A grey dog watches you from the treeline.', ipo: '🐒 A monkey owes you a lighter.', vela: '🦅 A sea eagle paid you in fish.', buri: '🐗 A bearded pig knows where you sleep.', moa: '🐔 A junglefowl hen is still alive because of you.', nine: '🐙 Something in the tide pools has been watching you back.' };
      if (names[a]) known.push(names[a]);
    }
    if (s.flags.COMPASS_SPINS) known.push('🧭 Compasses lie here. Radios drown in a hum.');
    if (!known.length) facts.innerHTML = '<div class="none">Nothing yet but the sound of the reef.</div>';
    for (const f of known) { const d = document.createElement('div'); d.textContent = f; facts.appendChild(d); }
    $('kitOverlay').classList.remove('hidden');
  }

  // ---- boot -------------------------------------------------------------
  TB.start = function () {
    TB.state = TB.newState();
    $('panel').addEventListener('click', function (e) {
      if ((queue.length || typing) && !e.target.closest('#choices')) showNextParagraph();
    });
    $('moreHint').addEventListener('click', showNextParagraph);
    $('kitBtn').addEventListener('click', openKit);
    $('sndBtn').addEventListener('click', TB.Audio.toggleMute);
    $('sndBtn').textContent = TB.Audio.muted() ? '🔇' : '🔊';
    window.addEventListener('pointerdown', function once() { TB.Audio.kick(); window.removeEventListener('pointerdown', once); });
    TB.Menu.init();
    $('kitClose').addEventListener('click', () => $('kitOverlay').classList.add('hidden'));
    $('kitOverlay').addEventListener('click', (e) => { if (e.target.id === 'kitOverlay') e.target.classList.add('hidden'); });
    window.addEventListener('keydown', (e) => { if ((e.key === ' ' || e.key === 'Enter') && (queue.length || typing)) { e.preventDefault(); showNextParagraph(); } });
    TB.go('title');
  };

  TB.continueGame = function () {
    const st = TB.loadSave();
    if (!st) { TB.go('title'); return; }
    TB.state = st;
    TB.renderHud();
    // returning to a run in progress? one screen of "the story so far" first
    if (st.day >= 3 && st.scene !== 'recap' && TB.SCENES.recap) { st._resume = st.scene; TB.go('recap'); return; }
    TB.go(st.scene);
  };
})(window);
