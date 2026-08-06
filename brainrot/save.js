/* =====================================================================
 * save.js — persistence (multi-slot + autosave), achievements, lifetime
 * stats. Degrades gracefully to in-memory if localStorage is blocked.
 * =================================================================== */
(function (G) {
  'use strict';
  const BR = (G.BR = G.BR || {});
  const SAVE_VERSION = 2;
  const KEY = { slot: (s) => `br_save_${s}`, ach: 'br_ach', stats: 'br_stats', settings: 'br_settings' };

  BR.ACHIEVEMENTS = [
    { id: 'firstmeme', name: 'First Symptom', emoji: '🦠', desc: 'Evolve your first upgrade.',
      check: (g) => g.purchased.size >= 1 },
    { id: 'patient0', name: 'Patient Zero', emoji: '🧫', desc: 'Release the brainrot into the world.',
      check: (g) => g.phase === 'play' },
    { id: 'combo', name: 'Combo Breaker', emoji: '🌟', desc: 'Unlock a symptom combo.',
      check: (g) => g.purchased.has('combo_sor') || g.purchased.has('combo_sigma') },
    { id: 'braincell', name: 'Braincell Evaporated', emoji: '🧠', desc: 'Push a country past "Can\'t Form Sentences".',
      check: (g) => g.world.countries.some((c) => c.brainrotPct() >= 52) },
    { id: 'terminal', name: 'First to Fall', emoji: '🧟', desc: 'Take a country to full Terminal Brainrot.',
      check: (g) => g.world.countries.some((c) => c.necrotic >= 0.99) },
    { id: 'stealth', name: 'Under the Radar', emoji: '🤫', desc: 'Reach 50% global brainrot with the Cure below 15%.',
      check: (g) => g.globalBrainrot() >= 50 && g.cure < 15 },
    { id: 'polyglot', name: 'Multilingual Menace', emoji: '🗣️', desc: 'Evolve the ability to cross language barriers.',
      check: (g) => g.ev.languagePierce > 0 },
    { id: 'photofinish', name: 'Photo Finish', emoji: '📸', desc: 'Win with the Cure above 80%.',
      check: (g) => g.won && g.cure >= 80 },
    { id: 'brutal', name: 'Brutal Brainrot', emoji: '😈', desc: 'Win a game on Brutal difficulty.',
      check: (g) => g.won && g.difficulty.id === 'brutal' },
    { id: 'worldwide', name: 'Worldwide Brainrot', emoji: '🌍', desc: 'Achieve total global brainrot. You won.',
      check: (g) => g.won },
    { id: 'speedrun', name: 'Gotta Go Fast', emoji: '⚡', desc: 'Win in under 6 minutes of game time.',
      check: (g) => g.won && g.elapsed < 360 },
    { id: 'purist', name: 'Efficient Rot', emoji: '✂️', desc: 'Win having evolved 12 or fewer upgrades.',
      check: (g) => g.won && g.purchased.size <= 12 },
  ];

  class SaveSystem {
    constructor() {
      this.mem = {}; this.ok = this._probe();
      this.unlockedAch = this._readJSON(KEY.ach, {});
      this.stats = this._readJSON(KEY.stats, this._blankStats());
      this.settings = this._readJSON(KEY.settings, { muted: false, music: true, haptics: true });
      if (this.settings.haptics === undefined) this.settings.haptics = true;
    }
    _probe() { try { localStorage.setItem('br_t', '1'); localStorage.removeItem('br_t'); return true; } catch (e) { return false; } }
    _get(k) { return this.ok ? localStorage.getItem(k) : (this.mem[k] ?? null); }
    _set(k, v) { if (this.ok) { try { localStorage.setItem(k, v); } catch (e) { this.mem[k] = v; } } else this.mem[k] = v; }
    _del(k) { if (this.ok) localStorage.removeItem(k); else delete this.mem[k]; }
    _readJSON(k, d) { try { const s = this._get(k); return s ? JSON.parse(s) : d; } catch (e) { return d; } }
    _writeJSON(k, v) { this._set(k, JSON.stringify(v)); }
    _blankStats() { return { gamesStarted: 0, gamesWon: 0, gamesLost: 0, totalVirality: 0, totalMemes: 0, bestTime: null, playSeconds: 0 }; }

    serialize(game) {
      return {
        v: SAVE_VERSION, seed: game.seed, difficulty: game.difficulty.id, phase: game.phase,
        elapsed: game.elapsed, virality: game.virality, totalVir: game.totalViralityEarned, cure: game.cure, heat: game.heat,
        purchased: [...game.purchased], countries: game.world.countries.map((c) => c.snapshot()),
        won: game.won, lost: game.lost,
        // patient zero (by index) + the strain name, so a resumed run keeps its
        // identity — without these the origin country got re-announced as a
        // fresh outbreak and the strain reverted to the default name.
        pz: game.patientZero ? game.patientZero.id : null, name: game.plagueName || null,
      };
    }
    save(slot, game) {
      const d = this.serialize(game); d.savedAt = game.elapsed;
      d.label = game.phase === 'select' ? 'Not started' : `${BR.fmtPct(game.globalBrainrot())} rot · cure ${BR.fmtPct(game.cure)}`;
      this._writeJSON(KEY.slot(slot), d); return d;
    }
    load(slot) { return this._readJSON(KEY.slot(slot), null); }
    hasSlot(slot) { return !!this._get(KEY.slot(slot)); }
    deleteSlot(slot) { this._del(KEY.slot(slot)); }
    listSlots(slots) { return slots.map((s) => { const d = this.load(s); return { slot: s, exists: !!d, label: d ? d.label : null, elapsed: d ? d.elapsed : 0 }; }); }

    unlock(id) { if (this.unlockedAch[id]) return false; this.unlockedAch[id] = true; this._writeJSON(KEY.ach, this.unlockedAch); return true; }
    isUnlocked(id) { return !!this.unlockedAch[id]; }
    // ---- equipped Rot Genes (persisted in settings) ----
    getGenes() { return Array.isArray(this.settings.genes) ? this.settings.genes.slice() : []; }
    setGenes(ids) { this.settings.genes = (ids || []).slice(0, BR.MAX_GENES || 3); this.saveSettings(); }
    toggleGene(id) {
      const cur = this.getGenes(), i = cur.indexOf(id);
      if (i >= 0) cur.splice(i, 1);
      else if (cur.length < (BR.MAX_GENES || 3)) cur.push(id);
      else return false;                       // slots full
      this.setGenes(cur); return true;
    }
    saveStats() { this._writeJSON(KEY.stats, this.stats); }
    saveSettings() { this._writeJSON(KEY.settings, this.settings); }
  }
  BR.SaveSystem = SaveSystem;

})(typeof window !== 'undefined' ? window : globalThis);
