/* =====================================================================
 * ui.js — all DOM + canvas presentation for the v2 (Plague-like) game:
 * country-select flow, difficulty, the Cure bar, Inf/Sev/Let meters, the
 * three evolution trees (with tradeoff badges + de-evolve), the country
 * inspector, news ticker, toasts, and modals. DOM touched only post-mount.
 * =================================================================== */
(function (G) {
  'use strict';
  const BR = (G.BR = G.BR || {});
  const clamp = BR.clamp, fmt = BR.fmt;
  const $ = (id) => document.getElementById(id);
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const clock = (s) => { s = Math.floor(s); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
  const SLOTS = [1, 2, 3];
  const MET = { inf: 8, sev: 16, let: 8 };

  class UI {
    constructor(game) { this.game = game; this.mounted = false; this.nodeEls = {}; this.cssW = 0; this.cssH = 0; this.milestones = new Set(); this.selected = null; }

    mount() {
      this.mapCanvas = $('mapCanvas'); this.fxCanvas = $('fxCanvas');
      this.mctx = this.mapCanvas.getContext('2d'); this.fctx = this.fxCanvas.getContext('2d');
      this.mapWrap = $('mapWrap');
      this.brainCanvas = $('brainCanvas'); this.bctx = this.brainCanvas ? this.brainCanvas.getContext('2d') : null;
      this._newsQueue = []; this._newsOpen = false; this._evoOpen = false;
      this._buildMeters(); this._buildTrees(); this._buildDiffs();
      this._wireTabs(); this._wireControls(); this._wireMap();
      this.mounted = true; this.onNewGame(); this._resize(); this._renderOverview(); this.tickHud();
    }

    _buildMeters() {
      const host = $('meters'); host.innerHTML = '';
      const mk = (key, name, cls) => { const w = el('div', 'meter ' + cls, `<div class="meter-top"><span class="meter-name">${name}</span><span class="meter-val" id="mv-${key}"></span></div><div class="meter-bar"><div class="meter-fill" id="mf-${key}"></div></div>`); host.appendChild(w); };
      mk('inf', '⚡ Infectivity', 'm-inf'); mk('sev', '🚨 Severity', 'm-sev'); mk('let', '☠️ Lethality', 'm-let'); mk('aware', '👁️ Awareness', 'm-aware');
    }

    // Plague-style tech tree: icon nodes laid out in prerequisite tiers,
    // connector lines behind them, and a shared detail/Evolve panel.
    _buildTrees() {
      this._computeDepths();
      this._lineCanvas = {};
      for (const tree of BR.TREES) {
        const host = $('tab-' + tree.id); host.innerHTML = '';
        host.appendChild(el('div', 'tree-blurb', `${tree.emoji} ${tree.blurb}`));
        const scroll = el('div', 'tree-scroll');
        const tiers = el('div', 'tiers'); tiers.id = 'tiers-' + tree.id;
        const canvas = el('canvas', 'tree-lines'); tiers.appendChild(canvas);
        this._lineCanvas[tree.id] = canvas;
        const nodes = BR.UPGRADE_TREE.filter((u) => u.tree === tree.id);
        const maxD = nodes.reduce((m, u) => Math.max(m, this._depth[u.id]), 0);
        for (let d = 0; d <= maxD; d++) {
          const col = el('div', 'tier');
          nodes.filter((u) => this._depth[u.id] === d).forEach((u) => {
            const n = el('button', 'tnode' + (u.combo ? ' combo' : ''));
            n.dataset.id = u.id;
            n.innerHTML = `<span class="tn-ico">${u.emoji}</span><span class="tn-cost">💜${fmt(u.cost)}</span><span class="tn-tick">✔</span>`;
            n.addEventListener('click', () => this._selectNode(u));
            col.appendChild(n); this.nodeEls[u.id] = n;
          });
          tiers.appendChild(col);
        }
        scroll.appendChild(tiers); host.appendChild(scroll);
      }
      this._updateTree(); this._renderNodeDetail(); this._drawLines('transmission');
    }

    _computeDepths() {
      if (this._depth) return; this._depth = {};
      const dep = (id) => { if (this._depth[id] != null) return this._depth[id]; const u = BR.UPGRADE_BY_ID[id]; const d = u.req.length ? 1 + Math.max(...u.req.map(dep)) : 0; return (this._depth[id] = d); };
      BR.UPGRADE_TREE.forEach((u) => dep(u.id));
    }
    _activeTree() { const b = document.querySelector('#evoTabs .etab.on'); return b ? b.dataset.etab : 'transmission'; }

    _selectNode(u) {
      this.selectedNode = u;
      for (const id in this.nodeEls) this.nodeEls[id].classList.toggle('sel', id === u.id);
      this._renderNodeDetail();
    }
    _renderNodeDetail() {
      const host = $('nodeDetail'); if (!host) return; const u = this.selectedNode;
      if (!u) { host.innerHTML = this._vitalsHtml(); return; }
      const g = this.game, owned = g.purchased.has(u.id), ok = g.isUnlockable(u), afford = g.virality >= u.cost;
      let action;
      if (owned) action = g.canDeEvolve(u) ? `<button class="nd-btn de" id="ndDe">✕ De-evolve (refund 💜${Math.round(u.cost * BR.CONST.DEEVOLVE_REFUND)})</button>` : '<div class="nd-owned">✔ Evolved</div>';
      else if (!ok) action = `<div class="nd-lock">🔒 Requires: ${u.req.map((r) => BR.UPGRADE_BY_ID[r].name).join(', ')}</div>`;
      else action = `<button class="nd-btn ${afford ? '' : 'dis'}" id="ndBuy">Evolve · 💜${fmt(u.cost)}</button>`;
      host.innerHTML = `<div class="nd-head"><span class="nd-ico">${u.emoji}</span><div><div class="nd-name">${u.name}${u.combo ? ' <span class="nd-combo">★ COMBO</span>' : ''}</div><div class="nd-tree">${BR.TREES.find((t) => t.id === u.tree).name}</div></div></div>
        <div class="nd-desc">${u.desc}</div><div class="nd-fx">${this._badges(u.fx)}</div>${action}`;
      const b = $('ndBuy'); if (b) b.addEventListener('click', () => this._tryBuy(u));
      const dz = $('ndDe'); if (dz) dz.addEventListener('click', () => this._tryDeEvolve(u));
    }

    // Default detail-panel content: live disease vitals + a rotating tip,
    // so the panel is useful even before a node is selected.
    _vitalsHtml() {
      const g = this.game;
      const bar = (cls, name, val, frac) => `<div class="ndv ${cls}"><div class="ndv-top"><span class="ndv-name">${name}</span><span class="ndv-val">${val}</span></div><div class="ndv-track"><div style="width:${clamp(frac * 100, 0, 100)}%"></div></div></div>`;
      const tips = BR.EVO_TIPS || ['Spread quietly first — high Severity feeds the Cure.'];
      const tip = tips[(Math.floor(g.elapsed / 9) % tips.length + tips.length) % tips.length];
      return `<div class="nd-vitals"><div class="nd-vitals-h">🧬 Disease Vitals</div>
        ${bar('inf', '⚡ Infectivity', g.infectivity().toFixed(1), g.infectivity() / 12)}
        ${bar('sev', '🚨 Severity', g.severity().toFixed(1), g.severity() / 14)}
        ${bar('let', '☠️ Lethality', g.lethality().toFixed(1), g.lethality() / 8)}
        ${bar('cure', '🧪 The Cure', BR.fmtPct(g.cure), g.cure / 100)}
        <div class="nd-tip">💡 <b>Tip:</b> ${tip}</div></div>`;
    }

    _drawLines(treeId) {
      treeId = treeId || this._activeTree();
      const canvas = this._lineCanvas && this._lineCanvas[treeId], tiers = $('tiers-' + treeId);
      if (!canvas || !tiers || typeof canvas.getContext !== 'function') return;
      const W = tiers.scrollWidth || tiers.clientWidth, H = tiers.scrollHeight || tiers.clientHeight;
      if (!W || !H) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = W * dpr; canvas.height = H * dpr; canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      const ctx = canvas.getContext('2d'); if (!ctx) return; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
      const g = this.game, ctr = (id) => { const n = this.nodeEls[id]; return n ? { x: n.offsetLeft + n.offsetWidth / 2, y: n.offsetTop + n.offsetHeight / 2 } : null; };
      BR.UPGRADE_TREE.filter((u) => u.tree === treeId).forEach((u) => {
        const to = ctr(u.id); if (!to) return;
        u.req.forEach((r) => {
          const from = ctr(r); if (!from) return;
          const owned = g.purchased.has(r) && g.purchased.has(u.id), avail = g.purchased.has(r);
          ctx.strokeStyle = owned ? 'rgba(182,239,63,0.85)' : avail ? 'rgba(138,127,240,0.55)' : 'rgba(120,130,165,0.20)';
          ctx.lineWidth = owned ? 2.4 : avail ? 1.6 : 1.2;
          ctx.shadowBlur = owned ? 8 : avail ? 5 : 0;
          ctx.shadowColor = owned ? 'rgba(182,239,63,0.6)' : 'rgba(138,127,240,0.4)';
          const mx = (from.x + to.x) / 2;
          ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.bezierCurveTo(mx, from.y, mx, to.y, to.x, to.y); ctx.stroke();
        });
        ctx.shadowBlur = 0;
      });
    }

    _updateStatusBar() {
      const g = this.game, w = g.world, tp = w.totalPop;
      const set = (id, v) => { const e = $(id); if (e) e.textContent = v; };
      set('sbInf', fmt(w.infectedPeople() * 1e6)); set('sbNec', fmt(w.necroticPeople() * 1e6)); set('sbHea', fmt(Math.max(0, w.healthyPeople()) * 1e6));
      const wi = $('wbInf'), wn = $('wbNec');
      if (wi) wi.style.width = clamp(w.infectedPeople() / tp * 100, 0, 100) + '%';
      if (wn) wn.style.width = clamp(w.necroticPeople() / tp * 100, 0, 100) + '%';
      set('sbTime', clock(g.elapsed));
    }

    _badges(fx) {
      const b = [];
      if (fx.inf) b.push(`<span class="bdg good">⚡+${fx.inf}</span>`);
      if (fx.virality) b.push(`<span class="bdg gold">💜+${fx.virality}</span>`);
      if (fx.sev) b.push(`<span class="bdg ${fx.sev > 0 ? 'bad' : 'good'}">🚨${fx.sev > 0 ? '+' : ''}${fx.sev}</span>`);
      if (fx.let) b.push(`<span class="bdg warn">☠️+${fx.let}</span>`);
      if (fx.cureSlow) b.push(`<span class="bdg good">🧪↓${fx.cureSlow}</span>`);
      const tags = { languagePierce: '🌐 langs', offlineReach: '📻 off-grid', borderPierce: '🧱 borders', moderationResist: '🔓 censors', online: '🎯 online', offline: '🎯 IRL', rich: '🎯 rich', poor: '🎯 poor', young: '🎯 young', old: '🎯 old' };
      for (const k in tags) if (fx[k]) b.push(`<span class="bdg neut">${tags[k]}</span>`);
      return b.join('');
    }

    _buildDiffs() {
      const host = $('diffOpts'); host.innerHTML = '';
      BR.DIFFICULTIES.forEach((d) => {
        const c = el('button', 'diff' + (d.id === this.game.difficulty.id ? ' on' : ''), `<div class="diff-emo">${d.emoji}</div><div class="diff-name">${d.name}</div><div class="diff-blurb">${d.blurb}</div>`);
        c.addEventListener('click', () => { this.game.setDifficulty(d.id); this._buildDiffs(); });
        host.appendChild(c);
      });
    }

    _wireTabs() {
      document.querySelectorAll('#evoTabs .etab').forEach((btn) => btn.addEventListener('click', () => {
        document.querySelectorAll('#evoTabs .etab').forEach((b) => b.classList.remove('on'));
        document.querySelectorAll('.etabpane').forEach((p) => p.classList.remove('on'));
        btn.classList.add('on');
        const t = btn.dataset.etab;
        $((t === 'overview' ? 'etab-' : 'tab-') + t).classList.add('on');
        if (t === 'overview') this._renderOverview(); else this._drawLines(t);
      }));
    }

    _wireControls() {
      $('speeds').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; this.game.audio && this.game.audio.ensure(); this.game.setSpeed(+b.dataset.sp); });
      $('menuBtn').addEventListener('click', () => { this._fillSlots(); this._openModal('menuModal'); });
      document.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => this._closeModal(b.dataset.close)));
      document.querySelectorAll('.modal').forEach((m) => m.addEventListener('click', (e) => { if (e.target === m && m.id !== 'introModal' && m.id !== 'endModal') this._closeModal(m.id); }));

      $('btnBegin').addEventListener('click', () => { this.game.audio && this.game.audio.ensure(); this._closeModal('introModal'); this._showSelect(); });
      const cont = $('btnContinue');
      const resumable = () => (this.game.save.hasSlot('auto') ? 'auto' : SLOTS.find((s) => this.game.save.hasSlot(s)));
      cont.disabled = !resumable();
      cont.addEventListener('click', () => { this.game.audio && this.game.audio.ensure(); const s = resumable(); if (s && this.game.loadGame(s)) this._closeModal('introModal'); });

      const mute = $('setMute'), music = $('setMusic');
      mute.checked = this.game.save.settings.muted; music.checked = this.game.save.settings.music;
      mute.addEventListener('change', () => { this.game.save.settings.muted = mute.checked; this.game.save.saveSettings(); this.game.audio && this.game.audio.setMuted(mute.checked); });
      music.addEventListener('change', () => { this.game.save.settings.music = music.checked; this.game.save.saveSettings(); this.game.audio && (this.game.audio.ensure(), this.game.audio.setMusic(music.checked)); });

      $('btnRestart').addEventListener('click', () => { this._closeModal('menuModal'); this.game.stop(); this.game.newGame(undefined, this.game.difficulty.id); this.game.start(); this._openModal('introModal'); });
      $('btnHelp').addEventListener('click', () => { this._closeModal('menuModal'); this._openModal('introModal'); });
      $('btnStats').addEventListener('click', () => { this._renderStats(); this._openModal('statsModal'); });
      $('btnAwards').addEventListener('click', () => { this._renderAwards(); this._openModal('awardsModal'); });
      $('btnAgain').addEventListener('click', () => { this._closeModal('endModal'); this.game.stop(); this.game.newGame(undefined, this.game.difficulty.id); this.game.start(); this._openModal('introModal'); });

      $('btnEvolve').addEventListener('click', () => { this.game.audio && this.game.audio.ensure(); this._openEvo(); });
      $('evoClose').addEventListener('click', () => this._closeEvo());
      $('newsOk').addEventListener('click', () => { this.game.audio && this.game.audio.click(); this._dismissNews(); });

      window.addEventListener('keydown', (e) => this._onKey(e));
      window.addEventListener('resize', () => this._resize());
    }

    _onKey(e) {
      if (e.target.tagName === 'INPUT') return; const g = this.game;
      if (this._newsOpen) { if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') { e.preventDefault(); this._dismissNews(); } return; }
      if (this._evoOpen) { if (e.key === 'Escape' || e.key === 'e' || e.key === 'E') { e.preventDefault(); this._closeEvo(); } return; }
      if (e.key === 'e' || e.key === 'E') this._openEvo();
      else if (e.key === ' ') { e.preventDefault(); g.setSpeed(g.speed > 0 ? 0 : 1); }
      else if (e.key >= '1' && e.key <= '3') g.setSpeed(+e.key);
      else if (e.key === 'Escape') ['menuModal', 'statsModal', 'awardsModal'].forEach((m) => this._closeModal(m));
    }

    _wireMap() {
      this.mapCanvas.addEventListener('click', (e) => {
        const r = this.mapCanvas.getBoundingClientRect(); const x = e.clientX - r.left, y = e.clientY - r.top;
        this.game.audio && this.game.audio.ensure();
        const hit = this.game.world.pick(x, y, this.game);
        if (!hit) { this.selectCountry(null); this._hideCountryPopup(); return; }
        if (hit.type === 'viral') { this.game.clickViral(hit.obj); this.game.audio && this.game.audio.click(); }
        else if (hit.type === 'cure') { this.game.clickCure(hit.obj); }
        else {
          if (this.game.phase === 'select') { this.game.chooseStart(hit.obj); this.selectCountry(hit.obj); }
          else { this.selectCountry(hit.obj); this._showCountryPopup(hit.obj); }
        }
      });
      this.mapCanvas.addEventListener('mousemove', (e) => {
        const r = this.mapCanvas.getBoundingClientRect();
        const hit = this.game.world.pick(e.clientX - r.left, e.clientY - r.top, this.game);
        this.game.hoverCountry = hit && hit.type === 'country' ? hit.obj : null;
        this.mapCanvas.style.cursor = hit ? 'pointer' : (this.game.phase === 'select' ? 'crosshair' : 'default');
      });
    }

    // ---- lifecycle ----------------------------------------------------
    onNewGame() {
      if (!this.mounted) return;
      this.milestones.clear(); this.selected = null; this.game.selected = null;
      $('recentEvents').innerHTML = ''; $('eventLog').innerHTML = '';
      $('timeline').innerHTML = '<div class="tl"><b>0:00</b> Choose a starting country…</div>';
      this._buildDiffs(); this._updateTree(); this.selectCountry(null); this._hideCountryPopup();
      this._newsQueue = []; this._newsOpen = false; this._evoOpen = false; this._updatePause();
      this._closeModal('evoModal'); this._closeModal('newsModal'); this.selectedNode = null; this._renderNodeDetail(); this._renderOverview();
      $('selectBanner').style.display = this.game.phase === 'select' ? 'block' : 'none';
      this.tickHud();
    }
    _showSelect() { $('selectBanner').style.display = 'block'; this.selectCountry(null); }
    onChooseStart() { this.selectCountry(this.game.startChoice); }
    onDifficulty() { this._buildDiffs(); }
    onRelease() { $('selectBanner').style.display = 'none'; this._pushTimeline(this.game.elapsed, `Patient zero: <b>${this.game.patientZero ? this.game.patientZero.name : '?'}</b>`); this.selectCountry(null); }
    _evoVir() { const ev = $('evoVir'); if (ev) ev.textContent = fmt(this.game.virality); if (this._evoOpen && this._activeTree() === 'overview') this._renderOverview(); }
    onBuy(u) { this._updateTree(); this._drawLines(this._activeTree()); this._renderNodeDetail(); this._evoVir(); this._flash('chipVir'); this.toast(u.emoji, `Evolved <b>${u.name}</b>`, u.tree === 'symptom' && u.fx.sev > 1 ? 'bad' : 'good'); }
    onDeEvolve(u) { this._updateTree(); this._drawLines(this._activeTree()); this._renderNodeDetail(); this._evoVir(); this.toast('✂️', `De-evolved <b>${u.name}</b> (severity down)`, 'info'); }
    onEvent(e) {
      const re = el('div', 're ' + e.tone, `<span class="re-ico">${e.emoji}</span><span class="re-msg">${e.msg}</span>`);
      const host = $('recentEvents'); host.prepend(re); while (host.children.length > 12) host.removeChild(host.lastChild);
      const le = el('span', 'le ' + e.tone, `<b>${e.emoji} </b>${e.msg}`); const log = $('eventLog'); log.prepend(le); while (log.children.length > 14) log.removeChild(log.lastChild);
      $('evIco').textContent = e.emoji; $('valEvent').textContent = e.msg;
      this._queueNews(e);
    }
    // ---- pausing news popups (like the original's bulletins) ----------
    _queueNews(e) {
      if (this.game.phase !== 'play') return;   // ignore pre-game (patient-zero) notice
      (this._newsQueue = this._newsQueue || []).push(e);
      if (!this._newsOpen) this._showNextNews();
    }
    _showNextNews() {
      const q = this._newsQueue || [];
      if (!q.length || this.game.ended || this.game.phase !== 'play') { this._newsOpen = false; this._updatePause(); this._closeModal('newsModal'); return; }
      const e = q.shift();
      $('newsEmoji').textContent = e.emoji;
      $('newsHead').textContent = e.tone === 'bad' ? 'Bad News' : e.tone === 'good' ? 'Good News' : e.tone === 'chaos' ? '⚡ Chaos' : 'News';
      $('newsMsg').textContent = e.msg;
      $('newsModal').querySelector('.news-card').className = 'news-card ' + e.tone;
      this._newsOpen = true; this._updatePause(); this._openModal('newsModal');
      if (this._autoDemo) setTimeout(() => this._dismissNews(), 700);
    }
    _dismissNews() { this._showNextNews(); }

    // ---- evolution overlay (pauses the game) --------------------------
    _updatePause() { this.game.paused = !!(this._evoOpen || this._newsOpen); }
    _openEvo() {
      if (this.game.phase !== 'play' || this.game.ended) return;
      // Clear any open news popup first so the two overlays can't stack their
      // pause flags and leave the sim stuck paused after the overlay closes.
      if (this._newsOpen) { this._newsOpen = false; this._newsQueue = []; this._closeModal('newsModal'); }
      this._evoOpen = true; this._updatePause();
      const ev = $('evoVir'); if (ev) ev.textContent = fmt(this.game.virality);
      this._renderOverview(); this._updateTree(); this._openModal('evoModal'); this._drawLines(this._activeTree());
    }
    _closeEvo() { this._evoOpen = false; this._updatePause(); this._closeModal('evoModal'); }
    _renderOverview() {
      const g = this.game, host = $('etab-overview'); if (!host) return;
      const bar = (label, v, max, color) => `<div class="ov-bar"><div class="ov-bar-top"><span>${label}</span><span>${v.toFixed(1)}</span></div><div class="ov-track"><div style="width:${clamp(v / max * 100, 0, 100)}%;background:${color}"></div></div></div>`;
      const top = g.world.countries.filter((c) => c.total() > 0.004).sort((a, b) => b.total() - a.total()).slice(0, 6);
      const mi = top.length ? top.map((c) => { const st = c.stage(); return `<div class="mi-row"><span class="mi-emo">${c.emoji}</span><span class="mi-name">${c.short}</span><span class="mi-bar"><span style="width:${clamp(c.brainrotPct(), 0, 100)}%;background:${st.color}"></span></span><span class="mi-pct" style="color:${st.color}">${BR.fmtPct(c.brainrotPct())}</span></div>`; }).join('') : '<div class="cp-empty">Nothing infected yet — evolve a Transmission to start.</div>';
      host.innerHTML = `<div class="ov-grid">
          <div class="ov-card"><div class="ov-k">🧟 Infected</div><div class="ov-v">${fmt(g.infectedPeople() * 1e6)}</div></div>
          <div class="ov-card"><div class="ov-k">☠️ Terminal</div><div class="ov-v">${fmt(g.necroticPeople() * 1e6)}</div></div>
          <div class="ov-card"><div class="ov-k">🌍 Global rot</div><div class="ov-v">${BR.fmtPct(g.globalBrainrot())}</div></div>
          <div class="ov-card"><div class="ov-k">🧪 The Cure</div><div class="ov-v" style="color:${g.cure > 60 ? '#ff6b6b' : '#4ea1ff'}">${BR.fmtPct(g.cure)}</div></div>
        </div>
        <div class="ov-bars">${bar('⚡ Infectivity', g.infectivity(), 8, '#43c6ac')}${bar('🚨 Severity', g.severity(), 16, '#ff5a5a')}${bar('☠️ Lethality', g.lethality(), 8, '#b06cf0')}</div>
        <div class="ov-tip">${this._overviewTip()}</div>
        <div class="section-h" style="padding:12px 0 5px">🌍 Most infected regions</div>
        <div class="mi-list">${mi}</div>`;
    }
    _overviewTip() {
      const g = this.game;
      if (g.cure > 55) return '⚠️ The Cure is close — buy Abilities to slow it, or de-evolve loud symptoms.';
      if (g.severity() > 6 && g.globalBrainrot() < 60) return '🚨 High Severity before saturation makes the Cure race. Consider Astroturfing / de-evolving.';
      if (g.globalBrainrot() > 85 && g.lethality() < 1) return '🧟 The world is infected — evolve Terminal Brainrot to finish everyone.';
      if (g.purchased.size === 0) return '💡 Start with a cheap Transmission (DMs) + a mild Symptom to begin spreading.';
      return '💡 Spread quietly (low Severity), reach every region, then go lethal before the Cure lands.';
    }

    // ---- rotting brain (left panel; rots as global brainrot rises) -----
    _drawBrain(t) {
      const cv = this.brainCanvas, ctx = this.bctx; if (!cv || !ctx) return;
      const w = cv.clientWidth || 280, h = cv.clientHeight || 150;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      if (cv.width !== Math.round(w * dpr)) { cv.width = w * dpr; cv.height = h * dpr; }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
      const pct = clamp(this.game.globalBrainrot() / 100, 0, 1);
      const cx = w / 2, cy = h / 2 + 4, rx = Math.min(w * 0.36, 92), ry = Math.min(h * 0.34, 50);
      const col = (a, b, tt) => `rgb(${Math.round(BR.lerp(a[0], b[0], tt))},${Math.round(BR.lerp(a[1], b[1], tt))},${Math.round(BR.lerp(a[2], b[2], tt))})`;
      const healthy = [235, 150, 168], mid = [120, 120, 70], rot = [110, 80, 150];
      const base = pct < 0.5 ? col(healthy, mid, pct / 0.5) : col(mid, rot, (pct - 0.5) / 0.5);
      ctx.save();
      const pulse = 1 + Math.sin(t * 2) * 0.012 + pct * Math.sin(t * 11) * 0.012;
      ctx.translate(cx, cy); ctx.scale(pulse, pulse); ctx.translate(-cx, -cy);
      // lumpy brain body
      ctx.beginPath();
      for (let i = 0; i <= 48; i++) { const a = (i / 48) * Math.PI * 2, bump = 1 + 0.07 * Math.sin(a * 7) + 0.04 * Math.sin(a * 13 + 1); const x = cx + Math.cos(a) * rx * bump, y = cy + Math.sin(a) * ry * bump; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.closePath(); ctx.fillStyle = base; ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 1.5; ctx.stroke();
      // central fissure
      ctx.strokeStyle = 'rgba(0,0,0,0.28)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, cy - ry * 0.85); ctx.bezierCurveTo(cx - 6, cy - ry * 0.2, cx + 6, cy + ry * 0.2, cx, cy + ry * 0.85); ctx.stroke();
      // sulci
      ctx.strokeStyle = 'rgba(0,0,0,0.16)'; ctx.lineWidth = 1.2;
      for (let s = 0; s < 6; s++) { const yy = cy - ry * 0.68 + s * (ry * 1.36 / 5); ctx.beginPath(); for (let x = cx - rx * 0.82; x < cx + rx * 0.82; x += 6) { const y = yy + Math.sin((x + s * 30) * 0.16) * 3; (x <= cx - rx * 0.82) ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.stroke(); }
      // rot blotches
      const rnd = BR.rng(4242), nb = Math.floor(pct * 16);
      for (let i = 0; i < nb; i++) { const a = rnd() * Math.PI * 2, rr = rnd() * 0.82; const x = cx + Math.cos(a) * rx * rr, y = cy + Math.sin(a) * ry * rr, rad = 2 + rnd() * 3 + pct * 3; ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI * 2); ctx.fillStyle = `rgba(${70 + (rnd() * 30) | 0},50,${90 + (rnd() * 40) | 0},0.5)`; ctx.fill(); }
      ctx.restore();
      // glitch at high rot
      if (pct > 0.55) { const inten = (pct - 0.55) / 0.45; for (let i = 0; i < Math.floor(inten * 3); i++) { const yy = cy - ry + (Math.sin(t * 3 + i * 7) * 0.5 + 0.5) * ry * 2; ctx.globalAlpha = 0.16 * inten; ctx.fillStyle = i % 2 ? '#ff00e6' : '#00fff0'; ctx.fillRect(cx - rx, yy, rx * 2, 2); ctx.globalAlpha = 1; } }
    }
    onAchievement(a) { this.toast(a.emoji, `Achievement: <b>${a.name}</b>`, 'ach'); }
    onWin() { this.game.fx && this.game.fx.confetti(this.cssW, this.cssH); this._showEnd(true); }
    onLose(reason) { this._showEnd(false, reason); }
    autoStart() { // ?auto — jump straight into a playable game (screenshots/demo)
      this._autoDemo = true; // demo mode: news popups auto-dismiss so it keeps flowing
      this._closeModal('introModal'); this.game.chooseStart(this.game.world.byName['India'] || this.game.world.countries[0]); this.game.releaseBrainrot();
    }

    // ---- per-tick HUD -------------------------------------------------
    tickHud() {
      if (!this.mounted) return; const g = this.game;
      $('valVir').textContent = fmt(g.virality);
      $('valInfected').textContent = fmt(g.infectedPeople() * 1e6);
      $('valTerminal').textContent = fmt(g.necroticPeople() * 1e6);
      $('valGlobal').textContent = BR.fmtPct(g.globalBrainrot());
      $('valTrend').textContent = g.trend || '—';
      const bp = $('brainPct'); if (bp) bp.textContent = BR.fmtPct(g.globalBrainrot());

      this._meter('inf', g.infectivity(), MET.inf, g.infectivity().toFixed(1));
      this._meter('sev', g.severity(), MET.sev, g.severity().toFixed(1));
      this._meter('let', g.lethality(), MET.let, g.lethality().toFixed(1));
      this._meter('aware', g.awareness * 100, 100, BR.fmtPct(g.awareness * 100));

      const cf = $('cureFill'); cf.style.width = g.cure + '%';
      cf.style.background = g.cure > 66 ? 'linear-gradient(90deg,#ff5a5a,#ff2020)' : g.cure > 33 ? 'linear-gradient(90deg,#f2c94c,#ff5a5a)' : 'linear-gradient(90deg,#4ea1ff,#43c6ac)';
      $('cureVal').textContent = BR.fmtPct(g.cure); $('cureLabel').textContent = g.cureLabel();
      const cb = $('curebar'); if (cb) cb.classList.toggle('danger', g.cure >= 80);

      this._treeAfford(); this._updateStatusBar(); this._updateCountryPanel(); this._refreshSpeedBtns(); this._milestones();
      if (this.selectedNode && !g.purchased.has(this.selectedNode.id)) { const nb = $('ndBuy'); if (nb) nb.classList.toggle('dis', g.virality < this.selectedNode.cost); }
      if (this.popupCountry) this._tickPopup();
    }
    _meter(k, v, max, label) { const f = $('mf-' + k), t = $('mv-' + k); if (f) f.style.width = clamp(v / max * 100, 0, 100) + '%'; if (t) t.textContent = label; }
    refreshSpeed() { this._refreshSpeedBtns(); }
    _refreshSpeedBtns() { document.querySelectorAll('#speeds button').forEach((b) => b.classList.toggle('on', +b.dataset.sp === this.game.speed)); }

    // ---- render loop --------------------------------------------------
    render(t, dt) {
      if (!this.mounted) return; this._resize();
      this.game.world.render(this.mctx, this.game, t);
      if (this.game.fx) { this.fctx.clearRect(0, 0, this.cssW, this.cssH); this.game.fx.update(dt); this.game.fx.render(this.fctx); }
      this._drawBrain(t);
    }
    _resize() {
      const w = this.mapWrap.clientWidth, h = this.mapWrap.clientHeight; if (w === this.cssW && h === this.cssH) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      [this.mapCanvas, this.fxCanvas].forEach((c) => { c.width = w * dpr; c.height = h * dpr; });
      this.mctx.setTransform(dpr, 0, 0, dpr, 0, 0); this.fctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.cssW = w; this.cssH = h; this.game.world.layout(w, h);
      this._drawLines(this._activeTree());
      if (this.popupCountry) this._positionPopup();
    }

    // ---- evolution tree state -----------------------------------------
    _tryBuy(u) {
      const g = this.game; if (g.purchased.has(u.id)) return;
      if (!g.isUnlockable(u)) { this.toast('🔒', `Needs: ${u.req.map((r) => BR.UPGRADE_BY_ID[r].name).join(', ')}`, 'bad'); return; }
      if (g.virality < u.cost) { this.toast('💸', `Need 💜${fmt(u.cost)}`, 'bad'); return; }
      g.buy(u.id);
    }
    _tryDeEvolve(u) { if (this.game.canDeEvolve(u)) this.game.deEvolve(u.id); else this.toast('🔒', 'Can\'t de-evolve: another symptom depends on it.', 'bad'); }
    _updateTree() { for (const id in this.nodeEls) this._nodeState(id); }
    _treeAfford() { const g = this.game; for (const id in this.nodeEls) { if (g.purchased.has(id)) continue; const u = BR.UPGRADE_BY_ID[id], n = this.nodeEls[id]; const ok = g.isUnlockable(u); n.classList.toggle('affordable', ok && g.virality >= u.cost); n.classList.toggle('locked', !ok); } }
    _nodeState(id) { const g = this.game, u = BR.UPGRADE_BY_ID[id], n = this.nodeEls[id]; const owned = g.purchased.has(id), ok = g.isUnlockable(u); n.classList.toggle('owned', owned); n.classList.toggle('locked', !owned && !ok); n.classList.toggle('affordable', !owned && ok && g.virality >= u.cost); }

    // ---- country panel ------------------------------------------------
    selectCountry(c) { this.selected = c; this.game.selected = c; this._updateCountryPanel(true); }
    _prosCons(c) {
      const pros = [], cons = [];
      (c.wealth >= 0.6 ? cons : pros).push(c.wealth >= 0.6 ? 'Rich: funds the Cure fast & detects early' : 'Poor: stealthy — the Cure barely funds');
      (c.internet >= 0.6 ? pros : cons).push(c.internet >= 0.6 ? 'High device use: memes fly' : 'Low internet: needs Off-Grid Reach');
      (c.youth >= 0.6 ? pros : cons).push(c.youth >= 0.6 ? 'Young: extremely susceptible' : 'Older: more resistant');
      (c.moderation >= 0.6 ? cons : pros).push(c.moderation >= 0.6 ? 'Heavy censorship: locks down hard' : 'Free internet: spreads unchecked');
      (c.english >= 0.5 ? pros : cons).push(c.english >= 0.5 ? 'Meme-native language' : 'Non-English: needs Meme Translation');
      (c.pop >= 200 ? pros : cons).push(c.pop >= 200 ? 'Huge population reservoir' : 'Small population');
      if (!c.land.length) cons.push('Island-ish: only air & sea links to seed the world');
      return { pros, cons };
    }
    _bar(name, val, color) { return `<div class="cp-stat"><div class="cp-stat-top"><span>${name}</span><span>${BR.fmtPct(val * 100)}</span></div><div class="cp-stat-bar"><div class="cp-stat-fill" style="width:${clamp(val * 100, 0, 100)}%;background:${color}"></div></div></div>`; }
    _updateCountryPanel(force) {
      const g = this.game, host = $('countryPanel');
      // During play the right panel is a disease/leaderboard overview; per-region
      // detail lives in the on-map popup. In select it shows pros/cons + Release.
      if (g.phase !== 'select') { this._panelKey = null; this._renderDiseasePanel(); return; }
      const c = this.selected;
      // tickHud() calls this ~10×/sec. Only rebuild when the selection actually
      // changes — re-rendering every tick replaced the Release button's DOM node
      // mid-click and swallowed the click (felt like needing a double-click / a
      // "perfect spot"). With the panel stable between selections, one click lands.
      const key = c ? 'sel:' + c.id : 'none';
      if (!force && key === this._panelKey) return;
      this._panelKey = key;
      if (!c) { host.innerHTML = '<div class="cp-empty">☣️ Click a region on the map to see its pros &amp; cons, then release the brainrot there.</div>'; return; }
      const st = c.stage(), pc = this._prosCons(c);
      host.innerHTML = `<div class="cp-head"><div class="cp-emoji">${c.emoji}</div><div><div class="cp-name">${c.name}</div><span class="cp-stage" style="background:${st.color}22;color:${st.color}">${st.name}</span></div></div>
        <div class="pc"><div class="pc-h good">✔ Pros</div>${pc.pros.map((p) => `<div class="pc-row good">+ ${p}</div>`).join('')}<div class="pc-h bad">✘ Cons</div>${pc.cons.map((p) => `<div class="pc-row bad">– ${p}</div>`).join('')}</div>
        ${this._bar('💰 Wealth', c.wealth, '#f2c94c')}${this._bar('📶 Internet', c.internet, '#4ea1ff')}${this._bar('🏛️ Censorship', c.moderation, '#b06cf0')}${this._bar('🗣️ Meme-native', c.english, '#43c6ac')}
        <button class="release-btn" id="btnRelease">☣️ Release the Brainrot here</button>`;
      const rb = $('btnRelease'); if (rb) rb.addEventListener('click', () => { if (this.game.releaseBrainrot()) this.game.setSpeed(1); });
    }
    _renderDiseasePanel() {
      const g = this.game, host = $('countryPanel');
      const top = g.world.countries.filter((c) => c.total() > 0.004).sort((a, b) => b.total() - a.total()).slice(0, 9);
      const row = (c) => { const st = c.stage(); return `<div class="mi-row"><span class="mi-emo">${c.emoji}</span><span class="mi-name">${c.short}</span><span class="mi-bar"><span style="width:${clamp(c.brainrotPct(), 0, 100)}%;background:${st.color}"></span></span><span class="mi-pct" style="color:${st.color}">${BR.fmtPct(c.brainrotPct())}</span></div>`; };
      host.innerHTML = `<div class="dp-stats"><span class="dp-inf">🧟 <b>${fmt(g.infectedPeople() * 1e6)}</b></span><span class="dp-nec">☠️ <b>${fmt(g.necroticPeople() * 1e6)}</b></span><span class="dp-hea">🌱 <b>${fmt(Math.max(0, g.healthyPeople()) * 1e6)}</b></span></div>
        <div class="section-h" style="padding:8px 0 4px">🌍 Most Infected Regions</div>
        <div class="mi-list">${top.length ? top.map(row).join('') : '<div class="cp-empty" style="padding:10px">No regions infected yet.</div>'}</div>`;
    }
    // ---- on-map country/region popup (Plague-style) -------------------
    _lnk(ok, ic) { return `<span class="${ok ? 'open' : 'shut'}">${ic}</span>`; }
    _showCountryPopup(c) { this.popupCountry = c; this._renderCountryPopup(); this._positionPopup(); }
    _hideCountryPopup() { this.popupCountry = null; const p = $('countryPopup'); if (p) p.classList.remove('show'); }
    _renderCountryPopup() {
      const p = $('countryPopup'), c = this.popupCountry; if (!p) return;
      if (!c) { p.classList.remove('show'); return; }
      const st = c.stage();
      p.innerHTML = `<div class="cpop-head"><span class="cpop-emo">${c.emoji}</span><span class="cpop-name">${c.name}</span><button class="cpop-x" id="cpopX">✕</button></div>
        <div class="cpop-stage" id="cpopStage" style="color:${st.color}">${st.name}</div>
        <div class="seg"><span class="seg-fill nec" id="cpopNec"></span><span class="seg-fill inf" id="cpopInf"></span></div>
        <div class="cpop-row"><span class="k-inf" id="cpopIP"></span><span class="k-nec" id="cpopNP"></span><span class="k-hea" id="cpopHP"></span></div>
        <div class="cpop-pop">Pop ${fmt(c.pop * 1e6)} · age ${c.age}</div>
        <div class="cpop-links" id="cpopLinks"></div>`;
      const x = $('cpopX'); if (x) x.addEventListener('click', (e) => { e.stopPropagation(); this._hideCountryPopup(); });
      p.classList.add('show'); this._tickPopup();
    }
    _tickPopup() {
      const c = this.popupCountry; if (!c) return;
      const set = (id, v) => { const e = $(id); if (e) e.textContent = v; };
      const setw = (id, w) => { const e = $(id); if (e) e.style.width = clamp(w, 0, 100) + '%'; };
      setw('cpopNec', c.necrotic * 100); setw('cpopInf', c.infected * 100);
      set('cpopIP', '🧟 ' + BR.fmtPct(c.infected * 100)); set('cpopNP', '☠️ ' + BR.fmtPct(c.necrotic * 100)); set('cpopHP', '🌱 ' + BR.fmtPct(c.healthy() * 100));
      const se = $('cpopStage'); if (se) { const st = c.stage(); se.textContent = st.name; se.style.color = st.color; }
      const le = $('cpopLinks'); if (le) le.innerHTML = `${this._lnk(c.airOpen, '✈️')}${this._lnk(c.seaOpen, '🚢')}${this._lnk(c.landOpen, '🛣️')}${c.detected ? '<span class="shut">👁️ seen</span>' : ''}`;
    }
    _positionPopup() {
      const p = $('countryPopup'), c = this.popupCountry; if (!p || !c || c.px === undefined) return;
      const w = 190, h = p.offsetHeight || 130, mw = this.cssW, mh = this.cssH;
      const left = clamp(c.px - w / 2, 6, Math.max(6, mw - w - 6));
      let top = c.py - c.r - 12 - h;
      if (top < 6) top = clamp(c.py + c.r + 12, 6, Math.max(6, mh - h - 6));
      p.style.left = left + 'px'; p.style.top = top + 'px'; p.style.width = w + 'px';
    }

    // ---- stats / awards / timeline ------------------------------------
    _renderStats() {
      const g = this.game, s = g.save.stats;
      const rows = [['🌍 Global brainrot', BR.fmtPct(g.globalBrainrot())], ['🧟 Infected', fmt(g.infectedPeople() * 1e6)], ['☠️ Terminal', fmt(g.necroticPeople() * 1e6)], ['🧪 Cure', BR.fmtPct(g.cure)], ['⚡/🚨/☠️ Inf/Sev/Let', `${g.infectivity().toFixed(1)} / ${g.severity().toFixed(1)} / ${g.lethality().toFixed(1)}`], ['🧬 Upgrades', g.purchased.size + ' / ' + BR.UPGRADE_TREE.length], ['⏱️ Time', clock(g.elapsed)], ['😈 Difficulty', g.difficulty.name]];
      const life = [['Games started', s.gamesStarted], ['Games won', s.gamesWon], ['Games lost', s.gamesLost], ['Best win', s.bestTime ? clock(s.bestTime) : '—'], ['Lifetime virality', fmt(s.totalVirality)]];
      $('statsBody').innerHTML = `<div class="stat-block-h">This run</div>` + rows.map((r) => `<div class="stat-row"><span>${r[0]}</span><b>${r[1]}</b></div>`).join('') + `<div class="stat-block-h">Lifetime</div>` + life.map((r) => `<div class="stat-row"><span>${r[0]}</span><b>${r[1]}</b></div>`).join('');
    }
    _renderAwards() {
      $('awardsBody').innerHTML = '<div class="ach-grid">' + BR.ACHIEVEMENTS.map((a) => `<div class="ach ${this.game.save.isUnlocked(a.id) ? 'got' : ''}"><div class="ach-ico">${a.emoji}</div><div><div class="ach-name">${a.name}</div><div class="ach-desc">${a.desc}</div></div></div>`).join('') + '</div>';
    }
    _milestones() {
      const g = this.game, gb = g.globalBrainrot();
      const add = (k, txt) => { if (this.milestones.has(k)) return; this.milestones.add(k); this._pushTimeline(g.elapsed, txt); };
      [10, 25, 50, 75, 90].forEach((m) => { if (gb >= m) add('gb' + m, `World hit <b>${m}%</b> brainrot`); });
      if (g.world.countries.some((c) => c.necrotic >= 0.99)) add('firstterm', 'First country went <b>Terminal</b> 🧟');
      if (g.world.anyDetected()) add('detected', 'The world <b>detected</b> the brainrot 👁️');
      if (g.cure >= 50) add('cure50', '🧪 Cure passed <b>50%</b> — danger');
    }
    _pushTimeline(t, txt) { $('timeline').prepend(el('div', 'tl', `<b>${clock(t)}</b> ${txt}`)); }

    // ---- toasts / modals ----------------------------------------------
    toast(emoji, msg, tone) {
      if (!this.mounted) return; const t = el('div', 'toast ' + (tone || 'info'), `<span class="t-ico">${emoji}</span><span>${msg}</span>`);
      const host = $('toasts'); host.appendChild(t); while (host.children.length > 5) host.removeChild(host.firstChild);
      setTimeout(() => { t.classList.add('leaving'); setTimeout(() => t.remove(), 320); }, 3600);
    }
    _flash(id) { const e = $(id); if (!e) return; e.classList.remove('flash'); void e.offsetWidth; e.classList.add('flash'); }
    _openModal(id) { $(id).classList.add('on'); }
    _closeModal(id) { const m = $(id); if (m) m.classList.remove('on'); }

    _fillSlots() {
      const host = $('saveSlots'); host.innerHTML = '';
      this.game.save.listSlots(SLOTS).forEach((info) => {
        const row = el('div', 'slot', `<div class="slot-info">${info.exists ? `<b>Slot ${info.slot}</b> — ${info.label} <span style="color:var(--dim)">(${clock(info.elapsed)})</span>` : `<span class="slot-empty">Slot ${info.slot} — empty</span>`}</div>`);
        const bs = el('button', null, '💾'); bs.title = 'Save'; bs.addEventListener('click', () => { this.game.saveGame(info.slot); this._fillSlots(); }); row.appendChild(bs);
        const bl = el('button', null, '📂'); bl.title = 'Load'; bl.disabled = !info.exists; bl.style.opacity = info.exists ? 1 : .4; bl.addEventListener('click', () => { if (this.game.loadGame(info.slot)) this._closeModal('menuModal'); }); row.appendChild(bl);
        host.appendChild(row);
      });
    }

    _showEnd(win, reason) {
      this._evoOpen = false; this._newsOpen = false; this._newsQueue = []; this._updatePause();
      this._closeModal('evoModal'); this._closeModal('newsModal');
      const g = this.game, card = $('endModal').querySelector('.modal-card');
      card.classList.toggle('win', win); card.classList.toggle('lose', !win);
      $('endEmoji').textContent = win ? '🌍🧠💥' : '🧪';
      $('endTitle').textContent = win ? 'Worldwide Brainrot!' : 'Cured.';
      $('endMsg').innerHTML = win ? 'Every brain on Earth is fully necrotic. Humanity communicates only in reaction images. You did this. 🏆' : 'Humanity’s Touch-Grass Campaign reached 100%. The world logged off and healed. Devastating.';
      $('endStats').innerHTML = [['🌍 Global rot', BR.fmtPct(g.globalBrainrot())], ['🧪 Cure', BR.fmtPct(g.cure)], ['⏱️ Time', clock(g.elapsed)], ['💜 Virality', fmt(g.totalViralityEarned)]].map((r) => `<div class="end-stat"><div class="es-val">${r[1]}</div><div class="es-lbl">${r[0]}</div></div>`).join('');
      this._openModal('endModal');
    }
  }
  BR.UI = UI;

})(typeof window !== 'undefined' ? window : globalThis);
