/* =====================================================================
 * tutorial.js — THE ISLAND TOUR. A brief spotlight walkthrough of the
 * UI on the first camp morning after the wreck, so first-time players
 * find the Wayfinder and the backpack instead of harvesting coconuts
 * until Day 100.
 *
 * Mechanics: a fixed overlay (#tutOverlay) dims everything except a
 * spotlight cutout (#tutSpot — one div with a giant box-shadow) over
 * the current target, with a caption card (#tutCard) placed beside it.
 * Clicking anywhere advances; Skip ends it. Pure DOM — no game state
 * is touched, so it is reload-trivial.
 *
 * Shown ONCE per device ('tidebound.tut.v1' — marked at first show, so
 * a mid-tour reload doesn't nag). Replayable from the menu (🎓, calls
 * TB.Tut.start(true)). NEVER shown under automation: navigator.webdriver
 * hides it from the Playwright harness (set 'tidebound.tut.force'='1'
 * before boot to test the tour itself).
 * Trigger: wraps the ch1 camp scene's enter — day 1, chapter 1 only.
 * =================================================================== */
(function (G) {
  'use strict';
  const TB = G.TB;
  const TUT = (TB.Tut = {});
  const KEY = 'tidebound.tut.v1';

  const seen = () => { try { return localStorage.getItem(KEY) === 'done'; } catch (e) { return true; } };
  const mark = () => { try { localStorage.setItem(KEY, 'done'); } catch (e) {} };
  const automated = () => { try { return !!navigator.webdriver && localStorage.getItem('tidebound.tut.force') !== '1'; } catch (e) { return false; } };

  const STEPS = [
    { sel: '#hud .clock', t: 'The clock', d: 'A hundred days start here. Each day has four turns — dawn, day, dusk, night — and most things you do spend one. Nights go easier with shelter and a fire.' },
    { sel: '#hud .meters', t: 'Your five truths', d: 'Health, food, water, energy, hope. The island never kills anyone without warning — but it never warns twice, either. When a bar runs low, believe it.' },
    { sel: '#panel', t: 'The day\'s work', d: 'Tap the text to read on, then choose. Every option shows its price in the small print, and everything — even the failures — moves your story somewhere.' },
    { sel: '#mapBtn', t: 'The Wayfinder 🗺️', d: 'The island is bigger than this beach. From camp, this opens your chart — tap a charted region to mount an expedition. Out there are food, friends, secrets, and the things endings are made of. Do not spend a hundred days on coconuts.' },
    { sel: '#kitBtn', t: 'Your backpack 🎒', d: 'Gear, beach-finds, the canteen, and what you know. The island tips attentive guests — small treasures turn up while you work, and some of them the locals will care about very much.' },
    { sel: '#almBtn', t: 'The Field Almanac 📔', d: 'Every neighbor you meet, every stone and page and recipe, your trophy shelf. It remembers across every life you live here.' },
    { sel: '#menuBtn', t: 'The menu ☰', d: 'Saves, sound, music, colors, text size, and the story backlog if you missed a line. TAB opens it any time. The game autosaves every scene — your place keeps itself.' },
    { sel: null, t: 'That\'s the kit', d: 'The rest, the island teaches — it\'s patient. Mostly. One thing more, castaway: when the chores are done, go <em>see</em> it.' },
  ];

  let overlay = null, idx = 0;

  function build() {
    if (overlay) return;
    overlay = document.createElement('div');
    overlay.id = 'tutOverlay';
    overlay.innerHTML = '<div id="tutSpot"></div><div id="tutCard"><h3 id="tutTitle"></h3><p id="tutText"></p><div id="tutBtns"><span id="tutDots"></span><span><button id="tutSkip">Skip</button><button id="tutNext">Next ➤</button></span></div></div>';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', (e) => { if (e.target.id !== 'tutSkip') advance(); });
    overlay.querySelector('#tutSkip').addEventListener('click', end);
    window.addEventListener('resize', () => { if (overlay) place(); });
  }

  function place() {
    const step = STEPS[idx];
    const spot = overlay.querySelector('#tutSpot');
    const card = overlay.querySelector('#tutCard');
    const target = step.sel ? document.querySelector(step.sel) : null;
    const vw = window.innerWidth, vh = window.innerHeight;
    let r = null;
    if (target) r = target.getBoundingClientRect();
    if (r && r.width > 0) {
      const pad = 6;
      spot.style.display = 'block';
      spot.style.left = (r.left - pad) + 'px';
      spot.style.top = (r.top - pad) + 'px';
      spot.style.width = (r.width + pad * 2) + 'px';
      spot.style.height = (r.height + pad * 2) + 'px';
    } else {
      // final card: no cutout — park the spot (its shadow still dims everything)
      spot.style.display = 'block';
      spot.style.left = (vw / 2) + 'px'; spot.style.top = (vh / 2) + 'px';
      spot.style.width = '0px'; spot.style.height = '0px';
    }
    // caption: below top-half targets, above bottom-half ones, clamped on-screen
    card.style.visibility = 'hidden';
    requestAnimationFrame(() => {
      const cw = card.offsetWidth, ch = card.offsetHeight;
      let x, y;
      if (r && r.width > 0) {
        x = Math.min(Math.max(10, r.left + r.width / 2 - cw / 2), vw - cw - 10);
        y = (r.top + r.height / 2 < vh / 2) ? Math.min(r.bottom + 16, vh - ch - 10) : Math.max(10, r.top - ch - 16);
      } else { x = (vw - cw) / 2; y = (vh - ch) / 2; }
      card.style.left = x + 'px'; card.style.top = y + 'px';
      card.style.visibility = 'visible';
    });
    overlay.querySelector('#tutTitle').textContent = step.t;
    overlay.querySelector('#tutText').innerHTML = step.d;
    overlay.querySelector('#tutDots').textContent = (idx + 1) + ' / ' + STEPS.length;
    overlay.querySelector('#tutNext').textContent = idx === STEPS.length - 1 ? 'Begin ➤' : 'Next ➤';
  }

  function advance() { idx += 1; if (idx >= STEPS.length) end(); else place(); }
  function end() { mark(); if (overlay) { overlay.remove(); overlay = null; } }

  TUT.active = () => !!overlay;
  TUT.start = function (force) {
    if (!force && (seen() || automated())) return;
    mark(); // a mid-tour reload shouldn't nag
    idx = 0;
    build();
    place();
  };

  // trigger: the first camp morning after the wreck
  const camp = TB.SCENES.camp;
  if (camp) {
    const prevEnter = camp.enter;
    camp.enter = function (s) {
      if (prevEnter) prevEnter(s);
      if (s.day <= 1 && s.chapter <= 1 && !seen() && !automated()) {
        setTimeout(() => { if (TB.state && TB.state.scene === 'camp') TUT.start(); }, 700);
      }
    };
  }
})(window);
