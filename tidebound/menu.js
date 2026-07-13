/* =====================================================================
 * menu.js — the in-game menu (TAB or the ☰ button).
 * Settings (master volume, brightness, ambience & animal-call toggles)
 * persisted via TB.Audio.settings, plus three manual save slots and an
 * autosave loader. Slot save/load reuses the engine's own serialized
 * save format, so slot loads go through the same migration path as
 * Continue.
 * =================================================================== */
(function (G) {
  'use strict';
  const TB = G.TB;
  const $ = (id) => document.getElementById(id);
  const SLOT = (i) => 'tidebound.slot' + i;

  // Color themes: swatch pickers write settings.theme / settings.bars and
  // TB.Audio.applySettings stamps them onto <body data-theme data-bars>,
  // where style.css's CSS-variable blocks take over.
  const THEMES = [
    { id: 'midnight', name: 'Midnight', chip: '#0b1c2c' },
    { id: 'driftwood', name: 'Driftwood', chip: '#efe4c8' },
    { id: 'lagoon', name: 'Lagoon', chip: '#0a3a33' },
    { id: 'ember', name: 'Ember', chip: '#3a1e10' },
    { id: 'abyss', name: 'Abyss', chip: '#000000' },
  ];
  const BARS = [
    { id: 'island', name: 'Island', colors: ['#e35d6a', '#e0a558', '#58aee0', '#b9d857', '#d5a7e8'] },
    { id: 'tropic', name: 'Tropic', colors: ['#ff4d67', '#ffa726', '#29d3f5', '#8ef05e', '#d67cff'] },
    { id: 'seaglass', name: 'Seaglass', colors: ['#f0a3ab', '#f0cf9e', '#a3d5f0', '#d5eda0', '#e8c6f5'] },
    { id: 'signal', name: 'Signal', colors: ['#d55e00', '#f0e442', '#56b4e9', '#009e73', '#cc79a7'] },
  ];
  function stripes(colors) { // five hard stops for the bar-palette chip
    const w = 100 / colors.length;
    return 'linear-gradient(90deg,' + colors.map((c, i) => c + ' ' + (i * w) + '% ' + ((i + 1) * w) + '%').join(',') + ')';
  }
  function buildSwatches(holderId, list, key) {
    const holder = $(holderId);
    list.forEach((t) => {
      const b = document.createElement('button');
      b.className = 'mSwatch'; b.dataset.pick = t.id;
      const chip = document.createElement('span');
      chip.className = 'chip';
      chip.style.background = t.colors ? stripes(t.colors) : t.chip;
      b.appendChild(chip); b.appendChild(document.createTextNode(t.name));
      b.addEventListener('click', () => { const p = {}; p[key] = t.id; setSetting(p); render(); });
      holder.appendChild(b);
    });
  }

  function slotMeta(i) {
    try {
      const raw = localStorage.getItem(SLOT(i));
      if (!raw) return null;
      const st = JSON.parse(raw);
      const comp = { kavi: 'Kavi 🐕', ipo: 'Ipo 🐒', vela: 'Vela 🦅', buri: 'Buri 🐗', moa: 'Moa 🐔', nine: 'Nine 🐙' }[st.companion] || 'solo 🧍';
      return 'Day ' + st.day + ' · Ch.' + st.chapter + ' · ' + comp + (st._savedAt ? ' · ' + st._savedAt : '');
    } catch (e) { return null; }
  }

  function render() {
    const s = TB.Audio.settings();
    $('mVol').value = s.vol; $('mBright').value = s.bright; $('mText').value = s.tsize || 100;
    $('mAmb').checked = !!s.amb; $('mSfx').checked = !!s.sfx; $('mMus').checked = !!s.music; $('mType').checked = !!s.type;
    document.querySelectorAll('#mThemes .mSwatch').forEach((b) => b.classList.toggle('sel', b.dataset.pick === s.theme));
    document.querySelectorAll('#mBars .mSwatch').forEach((b) => b.classList.toggle('sel', b.dataset.pick === s.bars));
    const inGame = TB.state && TB.state.scene !== 'title';
    for (let i = 1; i <= 3; i++) {
      const meta = slotMeta(i);
      $('slotLabel' + i).textContent = meta || 'Empty slot';
      $('slotSave' + i).disabled = !inGame;
      $('slotLoad' + i).disabled = !meta;
    }
    let auto = null;
    try { auto = JSON.parse(localStorage.getItem(TB.SAVE_KEY) || 'null'); } catch (e) {}
    $('autoLabel').textContent = auto && auto.scene !== 'title' ? 'Autosave — Day ' + auto.day + ' · Ch.' + (auto.chapter || 1) : 'No autosave yet';
    $('autoLoad').disabled = !(auto && auto.scene !== 'title');
  }

  function setSetting(patch) {
    const s = Object.assign(TB.Audio.settings(), patch);
    TB.Audio.saveSettings(s);
    TB.Audio.applySettings();
  }

  // the 📖 backlog: everything read this session, grouped by island day
  function showBacklog() {
    const body = $('logBody');
    body.innerHTML = '';
    const hist = TB.history || [];
    if (!hist.length) body.innerHTML = '<div class="none">Nothing read yet this session — the backlog fills as you play.</div>';
    let lastDay = null;
    for (const e of hist) {
      if (e.d !== lastDay) { lastDay = e.d; const h = document.createElement('h3'); h.textContent = '— Day ' + e.d + ' —'; body.appendChild(h); }
      const p = document.createElement('p'); p.innerHTML = e.h; body.appendChild(p);
    }
    $('logOverlay').classList.remove('hidden');
    body.scrollTop = body.scrollHeight; // land on the freshest text
  }

  const Menu = (TB.Menu = {
    open() { render(); $('menuOverlay').classList.remove('hidden'); },
    close() { $('menuOverlay').classList.add('hidden'); },
    toggle() { $('menuOverlay').classList.contains('hidden') ? Menu.open() : Menu.close(); },
    init() {
      $('menuBtn').addEventListener('click', Menu.toggle);
      $('menuClose').addEventListener('click', Menu.close);
      $('menuOverlay').addEventListener('click', (e) => { if (e.target.id === 'menuOverlay') Menu.close(); });
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') { e.preventDefault(); TB.Audio.kick(); Menu.toggle(); }
        else if (e.key === 'Escape' && !$('menuOverlay').classList.contains('hidden')) Menu.close();
      });
      $('mVol').addEventListener('input', (e) => setSetting({ vol: +e.target.value }));
      $('mBright').addEventListener('input', (e) => setSetting({ bright: +e.target.value }));
      $('mAmb').addEventListener('change', (e) => setSetting({ amb: e.target.checked }));
      $('mSfx').addEventListener('change', (e) => setSetting({ sfx: e.target.checked }));
      $('mMus').addEventListener('change', (e) => setSetting({ music: e.target.checked }));
      $('mText').addEventListener('input', (e) => setSetting({ tsize: +e.target.value }));
      $('mType').addEventListener('change', (e) => setSetting({ type: e.target.checked }));
      $('menuLog').addEventListener('click', () => { Menu.close(); showBacklog(); });
      $('logClose').addEventListener('click', () => $('logOverlay').classList.add('hidden'));
      $('logOverlay').addEventListener('click', (e) => { if (e.target.id === 'logOverlay') e.target.classList.add('hidden'); });
      buildSwatches('mThemes', THEMES, 'theme');
      buildSwatches('mBars', BARS, 'bars');
      for (let i = 1; i <= 3; i++) {
        (function (n) {
          $('slotSave' + n).addEventListener('click', () => {
            TB.state._savedAt = new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
            TB.save();
            try { localStorage.setItem(SLOT(n), localStorage.getItem(TB.SAVE_KEY)); } catch (e) {}
            render();
          });
          $('slotLoad' + n).addEventListener('click', () => {
            try {
              const raw = localStorage.getItem(SLOT(n));
              if (!raw) return;
              localStorage.setItem(TB.SAVE_KEY, raw);
              Menu.close();
              TB.continueGame();
            } catch (e) {}
          });
        })(i);
      }
      $('autoLoad').addEventListener('click', () => { Menu.close(); TB.continueGame(); });
      $('menuTitle').addEventListener('click', () => { Menu.close(); TB.go('title'); });
      TB.Audio.applySettings(); // brightness on boot, pre-audio
    },
  });
})(window);
