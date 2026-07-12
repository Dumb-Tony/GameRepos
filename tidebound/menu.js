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
    $('mVol').value = s.vol; $('mBright').value = s.bright;
    $('mAmb').checked = !!s.amb; $('mSfx').checked = !!s.sfx;
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
