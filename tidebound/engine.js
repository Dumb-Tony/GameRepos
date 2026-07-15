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
  // The 100-day calendar: chapter boundaries. Ch1 1-5 · Ch2 6-18 · Ch3 19-35 ·
  // Ch4 36-52 · Ch5 (the Long Rain, a real season) 53-70 · Ch6 71-85 ·
  // Ch7 86-100 — the Convergence lands on Day 100 itself.
  TB.CAL = { clearing: 5, ch2: 6, ch2end: 18, ch3: 19, ch3end: 35, ch4: 36, ch4end: 52, ch5: 53, ch5end: 70, ch6: 71, ch7: 93, convergence: 100 };
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
      _cal: 2,                          // save-calendar version (100-day)
    };
  };

  // ---- state helpers (used heavily by scene files) --------------------
  TB.stat = function (k, d) {
    const s = TB.state.stats;
    const before = s[k];
    s[k] = TB.clamp(Math.round(s[k] + d), 0, 100);
    const real = s[k] - before;
    if (real) statDeltas[k] = (statDeltas[k] || 0) + real; // shown as floaters when the next scene lands
    TB.renderHud();
  };

  // ---- stat floaters: the net effect of an action, worn on the meters ----
  let statDeltas = {};
  function flushStatFloaters() {
    const s = TB.state;
    const buf = statDeltas; statDeltas = {};
    if (!s.hudOn) return;
    let i = 0;
    for (const k of ['health', 'hunger', 'thirst', 'energy', 'hope']) {
      const v = buf[k];
      if (!v) continue;
      try {
        const host = $('m' + k[0].toUpperCase() + k.slice(1)).closest('.meter');
        const f = document.createElement('span');
        f.className = 'statFloat ' + (v > 0 ? 'sfUp' : 'sfDown');
        f.textContent = (v > 0 ? '+' : '') + v;
        f.style.animationDelay = (i * 110) + 'ms';
        host.appendChild(f);
        setTimeout(function () { try { f.remove(); } catch (e) {} }, 2100 + i * 110);
        i++;
      } catch (e) {}
    }
  }
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
  TB.bond = function (d) {
    const s = TB.state;
    s.trust = TB.clamp(s.trust + d, 0, 100);
    // a quiet one-time beat when trust crosses into a new tier (upward only)
    if (d > 0 && s.companion && s.hudOn) { // hud-off crossings hold the beat for later
      const tier = TB.tier();
      if (tier > (s.tierSeen || 0)) { s.tierSeen = tier; bondToast(s.companion, tier); }
    }
  };
  TB.tier = function () { const t = TB.state.trust; return t >= 100 ? 4 : t >= 75 ? 3 : t >= 50 ? 2 : t >= 25 ? 1 : 0; };

  const BOND_NAMES = { kavi: 'Kavi', ipo: 'Ipo', vela: 'Vela', buri: 'Buri', moa: 'Moa', nine: 'Nine' };
  const BOND_LINES = [
    null,
    (n) => n + ' has decided you\'re worth watching.',
    (n) => n + ' trusts you now. It shows in everything.',
    (n) => 'You and ' + n + ' move like one animal.',
    (n) => n + ' is family. The island knows it too.',
  ];
  function bondToast(comp, tier) {
    try {
      const line = BOND_LINES[tier];
      if (!line) return;
      let el = document.getElementById('bondToast');
      if (!el) { el = document.createElement('div'); el.id = 'bondToast'; el.setAttribute('aria-live', 'polite'); document.body.appendChild(el); }
      el.innerHTML = '';
      const tag = document.createElement('span'); tag.className = 'btTag'; tag.textContent = '❤️';
      const name = document.createElement('span'); name.className = 'btName'; name.textContent = line(BOND_NAMES[comp] || comp);
      el.appendChild(tag); el.appendChild(name);
      el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
      if (TB.Audio && TB.Audio.ui) TB.Audio.ui('bond');
      setTimeout(function () { el.classList.remove('show'); }, 3600);
    } catch (e) {}
  }

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
    // an untended companion heals on the wild's own schedule — nobody dies
    if (s.chInjured && s.day - s.chInjured.day >= 5) { s.chInjured = null; s.flags.PERIL_SELFHEALED = true; }
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
      if (s.day === TB.CAL.clearing && s.seg === 3 && !TB.is('CLEARING_DONE')) return 'clearing';
      if (s.day > TB.CAL.clearing) return 'slice_end'; // safety net; courtship normally hands off to ch2
    }
    if (s.chapter === 2 && s.day > TB.CAL.ch2end) return 'ch2_end'; // safety net; the Smoke threshold normally ends the chapter
    if (s.chapter === 3 && s.day > TB.CAL.ch3end) return 'ch3_end'; // safety net; Old Grin's Toll normally ends the chapter
    if (s.chapter === 4 && s.day > TB.CAL.ch4end) return 'ch4_end'; // safety net; Vane's Question normally ends the chapter
    if (s.chapter === 5 && s.day > TB.CAL.ch5end) return 'ch5_end'; // safety net; each variant's finale normally ends the chapter
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
      if (!st._cal) { // migrate pre-100-day saves: keep within-chapter progress
        const OLD = { 1: 1, 2: 4, 3: 10, 4: 16, 5: 22, 6: 29, 7: 34 };
        const NEW = { 1: 1, 2: 6, 3: 19, 4: 36, 5: 53, 6: 71, 7: 93 };
        st.day = (NEW[st.chapter] || 1) + Math.max(0, st.day - (OLD[st.chapter] || 1));
        st._cal = 2;
      }
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
      const el = $('m' + k[0].toUpperCase() + k.slice(1));
      el.style.width = s.stats[k] + '%';
      // danger telegraph: a critical meter pulses until it's answered —
      // every death on this island traces to a warning that was ignorable
      const host = el.closest('.meter');
      if (host) host.classList.toggle('crit', s.stats[k] <= 20);
    }
  };

  // ---- the day banner: a quiet chapter-mark when a new day arrives -------
  let bannerDay = null;
  function maybeDayBanner(s) {
    if (!s.hudOn) { bannerDay = s.day; return; }
    if (bannerDay === null || s.day === bannerDay) { bannerDay = s.day; return; }
    bannerDay = s.day;
    try {
      let b = document.getElementById('dayBanner');
      if (!b) { b = document.createElement('div'); b.id = 'dayBanner'; document.body.appendChild(b); }
      b.textContent = '🌅 Day ' + s.day;
      b.classList.remove('show');
      void b.offsetWidth; // restart the animation
      b.classList.add('show');
    } catch (e) {}
  }

  function setBackdrop(name, artFile) {
    const bd = $('backdrop');
    const artEl = bd.querySelector('.art');
    const fadeEl = bd.querySelector('.artFade');
    // remember what's on screen so the swap can be a crossfade, not a pop
    const prevCss = artEl ? getComputedStyle(artEl).backgroundImage : 'none';
    bd.className = 'bg-' + (name || 'beach-day');
    // per-scene illustration override: layers over the class art; a
    // missing file simply leaves the painted scene showing through
    if (artEl) artEl.style.backgroundImage = artFile ? "url('art/" + artFile + ".webp')" : '';
    if (fadeEl && artEl) {
      const newCss = getComputedStyle(artEl).backgroundImage;
      if (prevCss !== 'none' && prevCss !== newCss) {
        fadeEl.style.backgroundImage = prevCss; // the old scene lingers a beat, fading out over the new
        fadeEl.classList.remove('fading');
        void fadeEl.offsetWidth;
        fadeEl.classList.add('fading');
      }
    }
    if (TB.Audio) TB.Audio.setScene(name || 'beach-day', TB.state);
    if (TB.FX) TB.FX.setScene(name || 'beach-day', TB.state);
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
    for (const p of log.children) if (!p.querySelector('#mapWrap')) p.classList.add('faded'); // the chart never dims
    const html = queue.shift();
    const p = document.createElement('p');
    log.appendChild(p);
    if (html.indexOf('id="mapWrap"') === -1) { // the chart is UI, not story — keep it out of the backlog
      history.push({ d: TB.state.day, sc: TB.state.scene, h: html });
      if (history.length > 500) history.splice(0, history.length - 500);
    }
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

  // ---- camp hub organizer -----------------------------------------------------
  // Sorts a hub action list into pinned / story / daily / camp groups, inserts
  // header rows (rendered as .chHdr dividers by showChoices), and badges story
  // actions the player hasn't tried yet this life. Actions opt in via `grp`;
  // untagged actions are treated as story so nothing new ever gets buried.
  TB.hubOrganize = function (c, s) {
    const ORD = { top: 0, story: 1, daily: 2, camp: 3 };
    const HDR = { story: '⭐ Threads to pull', daily: '🧺 The day’s work', camp: '🏕️ Camp & recovery' };
    const keyOf = (t) => String(t).replace(/<[^>]*>/g, '').replace(/\([^)]*\)/g, '').replace(/\d+\s*\/\s*\d+/g, '').trim();
    s.seenActs = s.seenActs || {};
    const list = c.map((a, i) => ({ a, i, g: ORD[a.grp] !== undefined ? a.grp : 'story' }));
    list.sort((x, y) => (ORD[x.g] - ORD[y.g]) || (x.i - y.i));
    const out = [];
    let last = null;
    for (const it of list) {
      if (it.g !== last && HDR[it.g]) out.push({ hdr: HDR[it.g] });
      last = it.g;
      const a = it.a;
      if (it.g === 'story') {
        const k = keyOf(a.t);
        if (!s.seenActs[k]) {
          a.t += ' <span class="newBadge">new</span>';
          const prevDo = a.do;
          a.do = function (st) { (st || TB.state).seenActs[k] = 1; if (prevDo) prevDo(st); };
        }
      }
      out.push(a);
    }
    return out;
  };

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
      if (c.hdr) { // section divider (camp hub grouping) — not a button
        const d = document.createElement('div');
        d.className = 'chHdr';
        d.textContent = c.hdr;
        box.appendChild(d);
        continue;
      }
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
    // long menus admit they scroll: a fade mask until the bottom is reached
    const scrollFade = function () {
      box.classList.toggle('canScroll', box.scrollHeight - box.scrollTop - box.clientHeight > 12);
    };
    box.onscroll = scrollFade;
    scrollFade();
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
    if (TB.Almanac) { try { TB.Almanac.note(id, s); } catch (e) {} } // field almanac sightings
    if (def.enter) def.enter(s);
    if (s.deathCause && id !== 'death' && id !== 'title') { TB.go('death'); return; }
    if (id === 'ending' && s.endingId) TB.recordEnd('ending', s.endingId);
    if (id === 'death' && s.deathCause) TB.recordEnd('death', s.deathCause);
    if (TB.Trophies && id !== 'title') { try { TB.Trophies.check(s); } catch (e) {} } // 🏆 after recordEnd, so ending counts are fresh
    setBackdrop(resolve(def.bg, s), resolve(def.art, s));
    const who = resolve(def.who, s);
    setPortrait(who);
    if (TB.Audio) { const sp = animalCallFor(def, who, id); if (sp) TB.Audio.call(sp, id); }
    s.hudOn = def.hud === false ? false : s.hudOn;
    TB.renderHud();
    flushStatFloaters(); // the action's net cost/reward, worn on the meters
    maybeDayBanner(s);
    // endings and deaths arrive like title cards (styling hooks only)
    document.body.classList.toggle('on-ending', id === 'ending');
    document.body.classList.toggle('on-death', id === 'death');
    cancelTyping(); // never type into a cleared log
    $('textLog').innerHTML = '';
    $('choices').innerHTML = '';
    queue = (resolve(def.text, s) || ['…']).slice();
    showNextParagraph();
    if (id !== 'title' && id !== 'title_gallery' && id !== 'loops_menu') TB.save(); // saving on the title screens would clobber a real run
  };

  // ---- kit overlay ------------------------------------------------------
  const ITEM_NAMES = {
    flaregun: '🔫 Flare gun (one flare)', medkit: '🩹 Med-kit', toolbox: '🧰 Toolbox',
    rations: '🥫 Rations', tarp: '🟦 Tarpaulin', case: '💼 Locked courier case',
    lighter: '🔥 Lighter', knife: '🔪 Chef\'s knife', camera: '📷 Camera (cracked lens)',
    multitool: '🛠️ Multitool', coconut: '🥥 Coconut', photo: '🖼️ A stranger\'s photograph',
    canteen: '🍶 Steel canteen',
  };
  function openKit() {
    const s = TB.state;
    const items = $('kitItems');
    items.innerHTML = '';
    const keys = Object.keys(s.inv);
    if (!keys.length) items.innerHTML = '<div class="none">Empty hands, full ocean.</div>';
    for (const k of keys) {
      const d = document.createElement('div');
      d.textContent = (ITEM_NAMES[k] || k) + (s.inv[k] > 1 ? ' ×' + s.inv[k] : '')
        + (k === 'canteen' ? ' — ' + ((s.canteenSips | 0) === 2 ? 'full, two good drinks' : (s.canteenSips | 0) === 1 ? 'one drink left' : 'empty; the river refills it in passing') : '');
      items.appendChild(d);
    }
    // ✨ beach-finds shelf (trinkets.js)
    const tk = $('kitTrinkets');
    if (tk) {
      tk.innerHTML = '';
      const cat = (TB.Trinkets && TB.Trinkets.CATALOG) || [];
      const owned = cat.filter((t) => s.trinkets && s.trinkets[t.id]);
      const cnt = $('kitTkCount');
      if (cnt) cnt.textContent = owned.length ? '— ' + owned.length + ' of ' + cat.length + ' this life' : '';
      if (!owned.length) tk.innerHTML = '<div class="none">The island\'s little gifts will gather here. Work the shore; wade the pools; look down.</div>';
      // shelved by where the island gave them
      const SRC_HDR = [
        ['shore', '🌊 Off the wrack line'], ['wade', '💧 Waded up'], ['mud', '🟤 Dug from the mud'],
        ['forage', '🌿 Found in the green'], ['deep', '🕳️ Up from the deep'], ['', '✨ Along the way'],
      ];
      for (const [src, hdr] of SRC_HDR) {
        const shelf = owned.filter((t) => (t.src || '') === src);
        if (!shelf.length) continue;
        const h = document.createElement('div');
        h.className = 'tkHdr'; h.textContent = hdr;
        tk.appendChild(h);
        for (const t of shelf) {
          const d = document.createElement('div');
          d.className = 'tkRow';
          d.innerHTML = '<span class="tkBody"><span class="tkName">' + t.name.replace(/^(a|an) /, (m) => m[0].toUpperCase() + m.slice(1)) + (s.flags['TPAID_' + t.id] ? ' <em class="tkPaid">· Edda knows it</em>' : '') + '</span><span class="tkLine">' + t.line + '</span></span>';
          // painted icon from art/, degrading to the emoji if absent
          const img = document.createElement('img');
          img.className = 'tkImg'; img.alt = ''; img.src = 'art/tk-' + t.id + '.webp';
          img.onerror = function () { const e = document.createElement('span'); e.className = 'tkIcon'; e.textContent = t.e; img.replaceWith(e); };
          d.insertBefore(img, d.firstChild);
          tk.appendChild(d);
        }
      }
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
    $('almBtn').addEventListener('click', () => { if (TB.Almanac) TB.Almanac.open(); });
    $('sndBtn').addEventListener('click', TB.Audio.toggleMute);
    $('sndBtn').textContent = TB.Audio.muted() ? '🔇' : '🔊';
    window.addEventListener('pointerdown', function once() { TB.Audio.kick(); window.removeEventListener('pointerdown', once); });
    // the UI's voice: one delegated listener (capture phase, so re-rendered
    // buttons are covered) — soft ticks + a phone-side haptic on choices
    document.addEventListener('click', function (ev) {
      const b = ev.target && ev.target.closest ? ev.target.closest('button') : null;
      if (!b || !TB.Audio || !TB.Audio.ui) return;
      if (b.closest('#choices')) {
        TB.Audio.ui('tap');
        try { if (navigator.vibrate && TB.Audio.settings().sfx && !TB.Audio.muted()) navigator.vibrate(8); } catch (e) {}
      } else if (b.id === 'kitBtn' || b.id === 'almBtn' || b.id === 'mapBtn' || b.id === 'menuBtn' || b.id === 'menuAlm' || b.id === 'menuLog' || b.id === 'menuTour') {
        TB.Audio.ui('open');
      } else if (/Close$/.test(b.id || '')) {
        TB.Audio.ui('close');
      }
    }, true);
    TB.Menu.init();
    if (TB.Almanac) TB.Almanac.init();
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
