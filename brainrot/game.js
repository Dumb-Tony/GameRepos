/* =====================================================================
 * game.js — orchestrator. Country-select → play → win/lose. Owns the
 * Virality economy, evolved stats, the Cure race, lockdown pressure,
 * viral/cure bubbles, random mutation, de-evolve, and the two loops.
 * Runs headless (no DOM) for the test harness.
 * =================================================================== */
(function (G) {
  'use strict';
  const BR = (G.BR = G.BR || {});
  const C = BR.CONST, clamp = BR.clamp;
  const DAY = 24, TREND_ROTATE = 14;

  class Game {
    constructor(opts) {
      opts = opts || {};
      this.headless = !!opts.headless;
      this.save = new BR.SaveSystem();
      if (!this.headless) { this.audio = new BR.Audio(); this.fx = new BR.FX(); this.ui = new BR.UI(this); }
      this._simTimer = null; this._raf = null; this._lastFrame = 0;
      this.newGame(opts.seed, opts.difficulty);
    }

    // ---- lifecycle ----------------------------------------------------
    newGame(seed, difficulty) {
      this._detSeed = (this._detSeed || 0) + 1;
      this.seed = (seed >>> 0) || (0x9e3779b9 ^ (this._detSeed * 2654435761)) >>> 0 || 12345;
      this.rnd = BR.rng(this.seed);
      this.world = new BR.World();

      this.difficulty = BR.difficultyById(difficulty || 'normal');
      this.phase = 'select';                // 'select' | 'play'
      this.startChoice = null;              // chosen patient-zero country

      this.virality = C.START_VIRALITY;
      this.totalViralityEarned = 0;
      this.cure = 0;
      this.peakCure = 0; this.cureEndgame = false; this._ms = {};   // milestone/endgame state
      this.heat = 0;                        // Trend Heat — viral momentum (0..100)
      this.peakHeat = 0;
      this.awareness = 0;
      this.lockdownPressure = 0;
      this.elapsed = 0;
      this._lastAuto = 0;

      this.purchased = new Set();
      this.ev = BR.baseEv();
      this.recomputeEv();

      this.speed = 1;
      this.paused = false;              // true while a news popup / evolve overlay is open
      this.won = false; this.lost = false; this.ended = false; this.loseReason = null;
      this.selected = null; this.hoverCountry = null;
      this.viralBubbles = []; this.cureBubbles = [];
      this.log = []; this.currentEvent = null;
      this.history = []; this._histAcc = 0;   // time-series for the stats charts
      this.trend = null; this.trendTimer = 0; this.trendIndex = 0;
      this.newAchievements = [];

      this._bubbleT = this._roll(C.BUBBLE_MIN, C.BUBBLE_MAX);
      this._cureBubbleT = this._roll(C.CURE_BUBBLE_MIN, C.CURE_BUBBLE_MAX);
      this._mutateT = this._roll(C.MUTATE_MIN, C.MUTATE_MAX);

      this.events = new BR.EventSystem(this);
      this.save.stats.gamesStarted++; this.save.saveStats();
      if (this.ui) this.ui.onNewGame();
    }

    _roll(a, b) { return a + this.rnd() * (b - a); }
    setDifficulty(id) { this.difficulty = BR.difficultyById(id); this.recomputeEv(); if (this.ui) this.ui.onDifficulty(); }

    // Player picks patient-zero (called from UI select screen or harness).
    chooseStart(country) { this.startChoice = country; this.selected = country; if (this.ui) this.ui.onChooseStart(); }

    releaseBrainrot() {
      if (this.phase !== 'select' || !this.startChoice) return false;
      this.phase = 'play';
      this.startChoice.seed(C.SEED_INFECT);
      this.patientZero = this.startChoice;
      this.majorEvent('🦠', `Patient zero: ${this.plagueName || 'the brain rot'} is released in ${this.patientZero.name}. The rot begins.`, 'good');
      if (this.ui) this.ui.onRelease();
      return true;
    }

    // Convenience: scripted start (harness).
    startWith(countryId, difficultyId) {
      this.setDifficulty(difficultyId || 'normal');
      this.chooseStart(this.world.countries[countryId || 0]);
      this.releaseBrainrot();
    }

    start() {
      if (this._simTimer) return;
      this._simTimer = setInterval(() => this._simFrame(), C.SIM_INTERVAL);
      if (!this.headless) this._renderLoop();
    }
    stop() { if (this._simTimer) { clearInterval(this._simTimer); this._simTimer = null; } if (this._raf) { cancelAnimationFrame(this._raf); this._raf = null; } }
    setSpeed(s) { this.speed = s; if (this.ui) this.ui.refreshSpeed(); }

    // ---- evolved stats ------------------------------------------------
    recomputeEv() {
      const ev = BR.baseEv();
      this.purchased.forEach((id) => { const u = BR.UPGRADE_BY_ID[id]; if (u) BR.foldEffects(ev, u.fx); });
      ev.skepticScale = this.difficulty.skeptic;
      ['borderPierce', 'moderationResist', 'languagePierce', 'offlineReach', 'cureSlow', 'heatDecayReduce'].forEach((k) => (ev[k] = clamp(ev[k], 0, 1)));
      this.ev = ev;
    }
    infectivity() { return Math.max(0, this.ev.inf); }
    severity() { return Math.max(0, this.ev.sev); }
    lethality() { return Math.max(0, this.ev.let); }

    // ---- evolution economy --------------------------------------------
    isUnlockable(u) { return u.req.every((r) => this.purchased.has(r)); }
    canBuy(u) { return !this.purchased.has(u.id) && this.isUnlockable(u) && this.virality >= u.cost; }
    buy(id) {
      const u = BR.UPGRADE_BY_ID[id];
      if (!u || !this.canBuy(u)) return false;
      this.virality -= u.cost; this.purchased.add(id); this.recomputeEv();
      if (this.phase === 'play') this.addHeat(C.HEAT_EVOLVE, true);   // a fresh evolution = a viral drop
      this.save.stats.totalMemes++; this.save.saveStats();
      if (this.audio) this.audio.buyUpgrade(u);
      if (this.ui) this.ui.onBuy(u);
      this.checkAchievements();
      return true;
    }
    // Symptoms can be de-evolved (partial refund) to cut Severity.
    dependentsOwned(id) { return BR.UPGRADE_TREE.some((u) => this.purchased.has(u.id) && u.req.includes(id)); }
    canDeEvolve(u) { return u && u.deEvolvable && this.purchased.has(u.id) && !this.dependentsOwned(u.id); }
    deEvolve(id) {
      const u = BR.UPGRADE_BY_ID[id];
      if (!this.canDeEvolve(u)) return false;
      this.purchased.delete(id); this.recomputeEv();
      this.virality += Math.round(u.cost * C.DEEVOLVE_REFUND);
      if (this.audio) this.audio.click();
      if (this.ui) this.ui.onDeEvolve(u);
      return true;
    }

    // ---- simulation frame ---------------------------------------------
    _simFrame() {
      if (this.speed <= 0 || this.paused || this.ended || this.phase !== 'play') { if (this.ui) this.ui.tickHud(); return; }
      for (let i = 0; i < this.speed && !this.ended; i++) this.simStep(C.SIM_DT);
      if (this.ui) this.ui.tickHud();
    }

    simStep(dt) {
      if (this.ended || this.phase !== 'play') return;
      this.elapsed += dt;
      this.save.stats.playSeconds += dt;

      // Trend Heat: fast-decaying viral momentum. Spikes elsewhere (bubbles,
      // events, evolutions); here it decays and drives its two effects.
      // Trend-Surfing abilities slow the decay so you stay viral longer.
      this.heat = clamp(this.heat - C.HEAT_DECAY * (1 - this.ev.heatDecayReduce) * dt, 0, C.HEAT_MAX);
      const heatFrac = this.heat / C.HEAT_MAX;

      // Global awareness + lockdown pressure. Heat adds transient visibility.
      let detPop = 0;
      for (const c of this.world.countries) if (c.detected) detPop += c.pop;
      const detFrac = detPop / this.world.totalPop;
      this.awareness = clamp(this.severity() * 0.014 + detFrac * 0.45 + (this.cure / 100) * 0.4 + heatFrac * C.HEAT_AWARE, 0, 1);
      this.lockdownPressure = this.awareness > C.LOCKDOWN_START / 100 ? clamp((this.awareness - C.LOCKDOWN_START / 100) / 0.5, 0, 1) : 0;

      const res = this.world.simStep(dt, {
        ev: this.ev, diff: this.difficulty,
        globalAwareness: this.awareness, lockdownPressure: this.lockdownPressure, rnd: this.rnd,
        spreadMult: 1 + heatFrac * C.HEAT_SPREAD,   // a hot trend spreads faster
      });

      this._simRes = res;   // telemetry for balance harnesses (internal vs cross split)
      // New infections stoke the trend (a region catching on is a viral moment).
      this.addHeat(res.newlyInfected * C.HEAT_GAIN_INFECT, false);

      // Virality income: new infections + a severity trickle, amplified while
      // you're trending. This is the payoff for riding a hot wave.
      let gain = res.newlyInfected * C.VIR_INFECT + this.severity() * this.world.infectedPeople() * C.VIR_SEVERITY * dt;
      gain *= (1 + this.ev.virality) * (1 + heatFrac * C.HEAT_INCOME_MULT);
      this.virality += gain; this.totalViralityEarned += gain; this.save.stats.totalVirality += gain;

      // The Cure — only after the world has noticed the brainrot. Heat makes
      // the researchers work faster too (you're impossible to ignore).
      if (this.world.anyDetected()) {
        let rate = C.CURE_BASE * this.difficulty.cure * res.research * (1 + this.severity() * C.CURE_SEV_GAIN) * (1 + heatFrac * 0.5);
        rate /= 1 + this.ev.cureSlow * 2.5;
        this.cure = clamp(this.cure + rate * dt, 0, C.CURE_MAX);
      }
      if (this.cure > (this.peakCure || 0)) this.peakCure = this.cure;

      // sample the run for the stats charts (~ every 2 game-seconds, capped)
      this._histAcc += dt;
      if (this._histAcc >= 2) {
        this._histAcc = 0;
        const tot = this.world.totalPop;
        this.history.push({ t: this.elapsed,
          inf: this.infectedPeople() / tot, nec: this.necroticPeople() / tot,
          glob: this.globalBrainrot() / 100, cure: this.cure / 100, vir: this.virality });
        if (this.history.length > 400) this.history.shift();
      }

      this._timers(dt);
      this.events.update(dt);
      this._milestones();
      this.checkAchievements();
      this._checkEnd();

      if (!this.headless && !this.ended && this.elapsed - this._lastAuto >= 15) {
        this._lastAuto = this.elapsed; try { this.save.save('auto', this); } catch (e) {}
      }
    }

    _timers(dt) {
      // Trend ticker (from evolved slang symptoms).
      const trends = [];
      this.purchased.forEach((id) => { const u = BR.UPGRADE_BY_ID[id]; if (u && u.trend) trends.push(u.trend); });
      if (trends.length) { this.trendTimer -= dt; if (this.trend === null || this.trendTimer <= 0 || trends.indexOf(this.trend) < 0) { this.trendIndex = (this.trendIndex + 1) % trends.length; this.trend = trends[this.trendIndex]; this.trendTimer = TREND_ROTATE; } }
      else this.trend = null;

      // Viral (income) bubbles.
      this._bubbleT -= dt;
      if (this._bubbleT <= 0) { this._bubbleT = this._roll(C.BUBBLE_MIN, C.BUBBLE_MAX); this.spawnViralBubble(); }
      // Cure (setback) bubbles — only once the cure effort exists.
      if (this.world.anyDetected()) { this._cureBubbleT -= dt; if (this._cureBubbleT <= 0) { this._cureBubbleT = this._roll(C.CURE_BUBBLE_MIN, C.CURE_BUBBLE_MAX); this.spawnCureBubble(); } }
      // Uncontrolled mutation (a random symptom evolves on its own).
      this._mutateT -= dt;
      if (this._mutateT <= 0) { this._mutateT = this._roll(C.MUTATE_MIN, C.MUTATE_MAX) / (this.difficulty.chaos || 1); this._mutate(); }

      const age = (arr) => { for (let i = arr.length - 1; i >= 0; i--) { arr[i].ttl -= dt; if (arr[i].ttl <= 0) arr.splice(i, 1); } };
      age(this.viralBubbles); age(this.cureBubbles);
    }

    _mutate() {
      const cands = BR.UPGRADE_TREE.filter((u) => u.tree === 'symptom' && !this.purchased.has(u.id) && this.isUnlockable(u));
      if (!cands.length) return;
      const u = cands[(this.rnd() * cands.length) | 0];
      this.purchased.add(u.id); this.recomputeEv();
      this.onEvent('🧬', `Mutation! "${u.name}" evolved on its own. (De-evolve it if it's raising the alarm.)`, 'chaos');
      if (this.ui) this.ui.onBuy(u);
    }

    // ---- bubbles ------------------------------------------------------
    _bubbleAt() {
      const cs = this.world.countries.filter((c) => c.infected > 0.02);
      const c = cs.length ? cs[(this.rnd() * cs.length) | 0] : this.world.countries[(this.rnd() * this.world.countries.length) | 0];
      return { c, x: c.px !== undefined ? c.px + (this.rnd() - 0.5) * 26 : 0, y: c.py !== undefined ? c.py - c.r - 16 : 0 };
    }
    spawnViralBubble() {
      const { c, x, y } = this._bubbleAt();
      const e = ['🔥', '💯', '🤯', '💀', '🗿', '📈', '✨'][(this.rnd() * 7) | 0];
      this.viralBubbles.push({ x, y, country: c, emoji: e, reward: C.VIRAL_BUBBLE_REWARD[0] + this.rnd() * (C.VIRAL_BUBBLE_REWARD[1] - C.VIRAL_BUBBLE_REWARD[0]), ttl: 6, maxTtl: 6 });
      if (this.viralBubbles.length > 5) this.viralBubbles.shift();
    }
    spawnCureBubble() {
      // Cure bubbles surface near wealthy, aware countries (the researchers).
      const cs = this.world.countries.filter((c) => c.detected && c.wealth > 0.5);
      const c = cs.length ? cs[(this.rnd() * cs.length) | 0] : this.world.countries[(this.rnd() * this.world.countries.length) | 0];
      this.cureBubbles.push({ x: c.px !== undefined ? c.px + (this.rnd() - 0.5) * 26 : 0, y: c.py !== undefined ? c.py - c.r - 16 : 0, country: c, emoji: '🧪', setback: C.CURE_BUBBLE_SETBACK[0] + this.rnd() * (C.CURE_BUBBLE_SETBACK[1] - C.CURE_BUBBLE_SETBACK[0]), ttl: 7, maxTtl: 7 });
      if (this.cureBubbles.length > 5) this.cureBubbles.shift();
    }
    clickViral(m) {
      const i = this.viralBubbles.indexOf(m); if (i < 0) return; this.viralBubbles.splice(i, 1);
      const r = m.reward * (1 + this.ev.virality); this.virality += r; this.totalViralityEarned += r;
      this.addHeat(C.HEAT_BUBBLE, true);
      if (this.world) this.world.addBurst(m.x, m.y, '#f2c94c', true);
      if (this.fx) { this.fx.floatText(m.x, m.y - 20, '+' + BR.fmt(r), '#f2c94c'); }
      if (this.audio) this.audio.viral();
    }
    clickCure(m) {
      const i = this.cureBubbles.indexOf(m); if (i < 0) return; this.cureBubbles.splice(i, 1);
      this.cure = clamp(this.cure - m.setback, 0, C.CURE_MAX);
      if (this.world) this.world.addBurst(m.x, m.y, '#4ea1ff', true);
      if (this.fx) { this.fx.floatText(m.x, m.y - 20, '-' + m.setback.toFixed(1) + '% cure', '#4ea1ff'); }
      if (this.audio) this.audio.pop();
    }

    // ---- event helper API (events.js) ---------------------------------
    get countries() { return this.world.countries; }
    addVirality(v) { this.virality += v; this.totalViralityEarned += v; }
    // Stoke Trend Heat. `spike` marks discrete viral moments (bubbles, events,
    // drops) so the UI can flash; passive infection heat passes spike=false.
    addHeat(v, spike) { if (v <= 0) return; v *= 1 + (this.ev.heatGain || 0); this.heat = clamp(this.heat + v, 0, C.HEAT_MAX); if (this.heat > this.peakHeat) this.peakHeat = this.heat; if (spike && this.ui) this.ui.onHeatSpike && this.ui.onHeatSpike(); }
    heatLabel() { const h = this.heat; return h < C.HEAT_HOT * 0.35 ? 'Cold' : h < C.HEAT_HOT ? 'Warming' : h < 88 ? '🔥 Trending' : '🔥 Viral!'; }
    reduceCure(v) { this.cure = clamp(this.cure - v, 0, C.CURE_MAX); }
    addCure(v) { this.cure = clamp(this.cure + v, 0, C.CURE_MAX); }
    boostCountry(c, amt) { const g = Math.min(c.healthy(), amt); c.infected += g; if (this.fx && c.px !== undefined) this.fx.burst(c.px, c.py, c.stage().color, 10); }
    closeLinks(c) { c.airOpen = false; c.seaOpen = false; c.detected = true; }
    randomInfected() { const cs = this.world.countries.filter((c) => c.infected > 0.01 && c.total() < 0.99); return cs.length ? cs[(this.rnd() * cs.length) | 0] : null; }
    randomHealthy() { const cs = this.world.countries.filter((c) => c.total() < 0.5); return cs.length ? cs[(this.rnd() * cs.length) | 0] : null; }
    // Where a "goes viral" event lands. It stays ANCHORED to the current
    // outbreak — an already-infected country, or (early on, before anything has
    // crossed the detection floor) the patient-zero region — never a random
    // country on the far side of the planet. Keeps spread traceable & Plague-like.
    spreadTarget() {
      const cs = this.world.countries.filter((c) => c.infected > 0.004 && c.total() < 0.99);
      if (cs.length) return cs[(this.rnd() * cs.length) | 0];
      return this.patientZero || this.startChoice || null;
    }
    // Schedule a follow-up event to fire `delay` seconds later (story chains).
    queueEvent(id, delay) { if (this.events) this.events.queued.push({ id, t: Math.max(0, delay || 0) }); }
    onEvent(emoji, msg, tone, major) {
      const e = { emoji, msg, tone, t: this.elapsed, major: !!major };
      this.log.unshift(e); if (this.log.length > 80) this.log.pop();
      this.currentEvent = e;
      if (this.ui) this.ui.onEvent(e);
      if (this.audio) this.audio.event(tone);
    }
    // A pausing bulletin for a genuine milestone (patient zero, detection, cure
    // stages, big saturation marks). Random flavour events only scroll the
    // ticker — Plague Inc only interrupts you for the beats that matter.
    majorEvent(emoji, msg, tone) { this.onEvent(emoji, msg, tone, true); }
    // Fire once-per-run milestone bulletins based on the world state.
    _milestones() {
      this._ms = this._ms || {};
      const fire = (k, emoji, msg, tone) => { if (!this._ms[k]) { this._ms[k] = true; this.majorEvent(emoji, msg, tone); } };
      const gb = this.globalBrainrot();
      if (this.world.anyDetected()) fire('detected', '🔍', 'The world has noticed. Scientists label the outbreak "digital brain rot" and begin work on a Cure.', 'bad');
      if (gb >= 25) fire('g25', '🌍', 'A quarter of humanity is rotting. Group chats worldwide are now 90% reaction images.', 'good');
      if (gb >= 50) fire('g50', '🌍', 'Half the planet has succumbed. Nobody can read past a headline.', 'good');
      if (gb >= 90) fire('g90', '🌍', 'Ninety percent global brain rot. Only the strongest touch-grassers remain.', 'good');
      if (this.necroticPeople() > 0.5) fire('firstTerm', '💀', 'The first minds have gone fully terminal — brains completely necrotic. Only skibidi remains.', 'chaos');
      if (this.cure >= 25) fire('c25', '🧪', 'The Cure ("Touch-Grass Campaign") reaches 25%. Ad councils are mobilizing.', 'bad');
      if (this.cure >= 50 && !this.cureEndgame) { this.cureEndgame = true; fire('c50', '⚠️', 'THE CURE IS AT 50%. Humanity is fighting back — funding surges and borders slam shut. Finish this, fast.', 'bad'); }
      if (this.cure >= 75) fire('c75', '🚨', 'The Cure hits 75%. It is very nearly over for the brain rot. De-evolve loud symptoms and stall it!', 'bad');
    }

    // ---- readouts -----------------------------------------------------
    globalBrainrot() { return this.world.globalBrainrot(); }
    infectedPeople() { return this.world.infectedPeople(); }
    necroticPeople() { return this.world.necroticPeople(); }
    healthyPeople() { return this.world.healthyPeople(); }
    cureLabel() { const c = this.cure; return c < 1 ? 'Dormant' : c < 30 ? 'Researching' : c < 60 ? 'Trials' : c < 85 ? 'Rolling out' : 'Nearly cured!'; }

    // ---- achievements & end -------------------------------------------
    checkAchievements() {
      for (const a of BR.ACHIEVEMENTS) if (!this.save.isUnlocked(a.id) && a.check(this)) {
        if (this.save.unlock(a.id)) { this.newAchievements.push(a); if (this.ui) this.ui.onAchievement(a); if (this.audio) this.audio.pop(); }
      }
    }
    _checkEnd() {
      if (this.ended) return;
      if (this.world.allTerminal()) {
        this.won = true; this.ended = true; this.save.stats.gamesWon++;
        if (this.save.stats.bestTime === null || this.elapsed < this.save.stats.bestTime) this.save.stats.bestTime = this.elapsed;
        this.save.saveStats(); this.checkAchievements();
        if (this.audio) this.audio.win(); if (this.ui) this.ui.onWin(); return;
      }
      if (this.cure >= C.CURE_MAX) {
        this.lost = true; this.ended = true; this.loseReason = 'cured'; this.save.stats.gamesLost++; this.save.saveStats();
        if (this.audio) this.audio.lose(); if (this.ui) this.ui.onLose('cured');
      }
    }

    // ---- save / load --------------------------------------------------
    saveGame(slot) { const d = this.save.save(slot, this); if (this.ui) this.ui.toast('💾', 'Saved to slot ' + slot, 'info'); return d; }
    loadGame(slot) {
      const d = this.save.load(slot); if (!d) return false;
      this.stop();
      this.seed = d.seed; this.rnd = BR.rng(this.seed);
      this.world = new BR.World();
      this.difficulty = BR.difficultyById(d.difficulty);
      this.phase = d.phase || 'play';
      (d.countries || []).forEach((s, i) => { if (this.world.countries[i]) this.world.countries[i].restore(s); });
      this.virality = d.virality; this.totalViralityEarned = d.totalVir || 0;
      this.cure = d.cure || 0; this.heat = d.heat || 0; this.peakHeat = d.heat || 0; this.elapsed = d.elapsed || 0;
      this.purchased = new Set(d.purchased || []); this.recomputeEv();
      this.won = !!d.won; this.lost = !!d.lost; this.ended = this.won || this.lost;
      this.viralBubbles = []; this.cureBubbles = []; this.startChoice = this.patientZero = null;
      this.events = new BR.EventSystem(this);
      if (this.ui) { this.ui.onNewGame(); this.ui.onRelease(); this.ui.toast('📂', 'Loaded slot ' + slot, 'info'); }
      this.start();
      return true;
    }

    // ---- render loop --------------------------------------------------
    _renderLoop() {
      const step = (ts) => {
        this._raf = requestAnimationFrame(step);
        const dt = this._lastFrame ? Math.min(0.05, (ts - this._lastFrame) / 1000) : 0.016;
        this._lastFrame = ts;
        if (this.ui) this.ui.render(ts / 1000, dt);
      };
      this._raf = requestAnimationFrame(step);
    }
  }
  BR.Game = Game;

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
      try {
        const game = new BR.Game({});
        window.GAME = game; game.ui.mount(); game.start();
        const params = new URLSearchParams(location.search);
        const auto = params.get('auto');
        if (auto !== null) { const sp = parseInt(auto, 10); game.setSpeed(sp >= 0 && sp <= 3 ? sp : 1); if (game.ui.autoStart) game.ui.autoStart(); }
        if (params.get('news')) { game.ui._autoDemo = false; setTimeout(() => game.events.fireRandom(), 250); }
        if (params.get('evo')) { game.ui._openEvo(); const tb = document.querySelector('#evoTabs .etab[data-etab="transmission"]'); if (tb) tb.click(); }
      } catch (e) {
        const b = document.getElementById('crashBanner');
        if (b) { b.style.display = 'block'; b.textContent = '💥 ' + (e && e.message || e); }
        console.error(e);
      }
    });
  }

})(typeof window !== 'undefined' ? window : globalThis);
