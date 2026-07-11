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
  // Vector-sprite icon as an <img> HTML string (falls back to empty if sprites
  // haven't loaded). kind: 'upgrade' | 'country' | 'hud'.
  const spr = (kind, id, size, color, cls) => (BR.Sprites ? BR.Sprites.img(BR.Sprites.iconFor(kind, id), size, color || '#efe6ff', cls) : '');
  const SLOTS = [1, 2, 3];
  const MET = { inf: 8, sev: 16, let: 8 };

  class UI {
    constructor(game) { this.game = game; this.mounted = false; this.nodeEls = {}; this.cssW = 0; this.cssH = 0; this.milestones = new Set(); this.selected = null; this.view = { zoom: 1, x: 0, y: 0 }; this._dpr = 1; }

    mount() {
      this.mapCanvas = $('mapCanvas'); this.fxCanvas = $('fxCanvas');
      this.mctx = this.mapCanvas.getContext('2d'); this.fctx = this.fxCanvas.getContext('2d');
      this.mapWrap = $('mapWrap');
      this.brainCanvas = $('brainCanvas'); this.bctx = this.brainCanvas ? this.brainCanvas.getContext('2d') : null;
      this._pathogenCv = $('pathogenCanvas'); this._pathogenCtx = this._pathogenCv ? this._pathogenCv.getContext('2d') : null;
      this._newsQueue = []; this._newsOpen = false; this._evoOpen = false;
      this._buildMeters(); this._buildTrees(); this._buildDiffs(); this._initBrainImgs();
      this._wireTabs(); this._wireControls(); this._wireMap();
      this._paintStaticIcons();
      this.mounted = true; this.onNewGame(); this._resize(); this._renderOverview(); this.tickHud();
    }

    // Replace every static [data-spr="kind:id"] placeholder in the HTML with a
    // crisp vector sprite, so no emoji remain in the chrome. Optional
    // data-sprsize / data-sprcolor tune it.
    _paintStaticIcons() {
      if (!BR.Sprites) return;
      document.querySelectorAll('[data-spr]').forEach((e) => {
        const [kind, id] = e.getAttribute('data-spr').split(':');
        const size = +(e.getAttribute('data-sprsize') || 18), color = e.getAttribute('data-sprcolor') || '#efe6ff';
        e.innerHTML = spr(kind, id, size, color);
      });
    }

    _buildMeters() {
      const host = $('meters'); host.innerHTML = '';
      const mk = (key, name, cls) => { const w = el('div', 'meter ' + cls, `<div class="meter-top"><span class="meter-name">${name}</span><span class="meter-val" id="mv-${key}"></span></div><div class="meter-bar"><div class="meter-fill" id="mf-${key}"></div></div>`); host.appendChild(w); };
      const ic = (id, col) => `<span class="mtr-ic" data-spr="hud:${id}" data-sprsize="13" data-sprcolor="${col}"></span>`;
      mk('heat', ic('heat', '#ff8a3d') + ' Trend Heat', 'm-heat'); mk('inf', ic('infectivity', '#43c6ac') + ' Infectivity', 'm-inf'); mk('sev', ic('severity', '#f2c94c') + ' Severity', 'm-sev'); mk('let', ic('lethality', '#ff5c8a') + ' Lethality', 'm-let'); mk('aware', ic('awareness', '#8fb2ff') + ' Awareness', 'm-aware');
    }

    // Plague-style tech tree: nodes BRANCH out from their prerequisites in a
    // tidy top-down tree, connector branches behind them, shared detail panel.
    _buildTrees() {
      this._computeDepths();
      this._lineCanvas = {};
      for (const tree of BR.TREES) {
        const host = $('tab-' + tree.id); host.innerHTML = '';
        host.appendChild(el('div', 'tree-blurb', `${tree.emoji} ${tree.blurb}`));
        const scroll = el('div', 'tree-scroll');
        const stage = el('div', 'tree-stage'); stage.id = 'tiers-' + tree.id;
        const canvas = el('canvas', 'tree-lines'); stage.appendChild(canvas);
        this._lineCanvas[tree.id] = canvas;
        const nodes = BR.UPGRADE_TREE.filter((u) => u.tree === tree.id);
        const lay = this._layoutTree(nodes);
        stage.style.width = lay.w + 'px'; stage.style.height = lay.h + 'px';
        for (const u of nodes) {
          const p = lay.xy[u.id];
          const n = el('button', 'tnode' + (u.combo ? ' combo' : ''));
          n.dataset.id = u.id; n.style.left = p.x + 'px'; n.style.top = p.y + 'px';
          n.innerHTML = `<span class="tn-ico">${spr('upgrade', u.id, 32)}</span><span class="tn-cost">${spr('hud', 'virality', 11, '#ff6bd6')}${fmt(u.cost)}</span><span class="tn-tick">✔</span>`;
          n.addEventListener('click', () => this._selectNode(u));
          stage.appendChild(n); this.nodeEls[u.id] = n;
        }
        scroll.appendChild(stage); host.appendChild(scroll);
      }
      this._updateTree(); this._renderNodeDetail(); this._drawLines('transmission');
    }

    // Tidy top-down tree layout (Reingold-Tilford-ish). Each node hangs under
    // its PRIMARY prerequisite (first in-tree req); leaves fill columns left to
    // right and parents centre over their children, so branches never overlap.
    // Extra prerequisites (combos) just add converging branch lines.
    _layoutTree(nodes) {
      const NODE = 66, COLW = 72, ROWH = 74, PADX = 24, PADY = 10, GAP = 0.7;
      const inTree = new Set(nodes.map((u) => u.id));
      const parentOf = (u) => { for (const r of u.req) if (inTree.has(r)) return r; return null; };
      const kids = {}; nodes.forEach((u) => { const p = parentOf(u); if (p) (kids[p] = kids[p] || []).push(u.id); });
      const roots = nodes.filter((u) => !parentOf(u)).map((u) => u.id);
      const col = {}; let leaf = 0;
      const assign = (id) => {
        const cs = kids[id] || [];
        if (!cs.length) { col[id] = leaf++; return; }
        cs.forEach(assign);
        col[id] = (col[cs[0]] + col[cs[cs.length - 1]]) / 2;
      };
      roots.forEach((r, i) => { if (i) leaf += GAP; assign(r); });
      const xy = {}; let maxCol = 0, maxDepth = 0;
      nodes.forEach((u) => {
        const c = col[u.id] || 0, d = this._depth[u.id];
        xy[u.id] = { x: PADX + c * COLW, y: PADY + d * ROWH };
        if (c > maxCol) maxCol = c; if (d > maxDepth) maxDepth = d;
      });
      return { xy, w: PADX * 2 + maxCol * COLW + NODE, h: PADY * 2 + maxDepth * ROWH + NODE };
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
      const host = $('nodeDetailBody') || $('nodeDetail'); if (!host) return; const u = this.selectedNode;
      if (!u) { host.innerHTML = this._vitalsHtml(); return; }
      const g = this.game, owned = g.purchased.has(u.id), ok = g.isUnlockable(u), afford = g.virality >= u.cost;
      let action;
      if (owned) action = g.canDeEvolve(u) ? `<button class="nd-btn de" id="ndDe">✕ De-evolve (refund 💜${Math.round(u.cost * BR.CONST.DEEVOLVE_REFUND)})</button>` : '<div class="nd-owned">✔ Evolved</div>';
      else if (!ok) action = `<div class="nd-lock">🔒 Requires: ${u.req.map((r) => BR.UPGRADE_BY_ID[r].name).join(', ')}</div>`;
      else action = `<button class="nd-btn ${afford ? '' : 'dis'}" id="ndBuy">Evolve · 💜${fmt(u.cost)}</button>`;
      host.innerHTML = `<div class="nd-head"><span class="nd-ico">${spr('upgrade', u.id, 40, '#ffffff')}</span><div><div class="nd-name">${u.name}${u.combo ? ' <span class="nd-combo">★ COMBO</span>' : ''}</div><div class="nd-tree">${BR.TREES.find((t) => t.id === u.tree).name}</div></div></div>
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
          ctx.strokeStyle = owned ? 'rgba(95,251,224,0.9)' : avail ? 'rgba(181,123,255,0.6)' : 'rgba(150,120,200,0.22)';
          ctx.lineWidth = owned ? 2.6 : avail ? 1.8 : 1.3;
          ctx.shadowBlur = owned ? 8 : avail ? 5 : 0;
          ctx.shadowColor = owned ? 'rgba(95,251,224,0.7)' : 'rgba(181,123,255,0.45)';
          // vertical S-curve so branches grow down from the parent node
          const my = (from.y + to.y) / 2;
          ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.bezierCurveTo(from.x, my, to.x, my, to.x, to.y); ctx.stroke();
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
      if (fx.heatGain) b.push(`<span class="bdg gold">🔥+${fx.heatGain}</span>`);
      if (fx.heatDecayReduce) b.push(`<span class="bdg gold">🔥 stays hot</span>`);
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
      document.querySelectorAll('.modal').forEach((m) => m.addEventListener('click', (e) => {
        if (e.target !== m || m.id === 'introModal' || m.id === 'endModal') return;
        // Route the pausing overlays through their proper close paths so the
        // pause flag is cleared. A raw _closeModal() only hides the element and
        // would leave game.paused stuck true with no visible popup — the
        // "game just stops, no more progress" freeze (worse at high Heat, which
        // spawns more event popups to accidentally backdrop-dismiss).
        if (m.id === 'newsModal') this._dismissNews();
        else if (m.id === 'evoModal') this._closeEvo();
        else this._closeModal(m.id);
      }));

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

    // Insets for the map projection so the whole world sits between the floating
    // HUD panels (top bar/cure, bottom bars, left & right cards) — nothing hidden.
    _mapInsets() {
      const mr = this.mapWrap.getBoundingClientRect();
      const rect = (id) => { const e = $(id); if (!e) return null; const r = e.getBoundingClientRect(); return (r.width > 2 && r.height > 2) ? r : null; };
      let left = 12, right = 12, top = 12, bottom = 12;
      const cure = rect('curebar'); if (cure) top = cure.bottom - mr.top + 10;
      const log = rect('logbar'), stat = rect('statusbar');
      const bt = log ? log.top : (stat ? stat.top : mr.bottom);
      bottom = mr.bottom - bt + 10;
      const lc = rect('left'); if (lc) left = lc.right - mr.left + 14;
      const rc = rect('right'); if (rc) right = mr.right - rc.left + 14;
      return { left, right, top, bottom };
    }
    // Convert a client (screen) point into map/layout coordinates, undoing pan+zoom.
    _toMap(clientX, clientY) {
      const r = this.mapCanvas.getBoundingClientRect(), v = this.view;
      return { x: (clientX - r.left - v.x) / v.zoom, y: (clientY - r.top - v.y) / v.zoom };
    }
    _clampView() {
      const v = this.view; v.zoom = clamp(v.zoom, 1, 6);
      const w = this.cssW || 1, h = this.cssH || 1;
      v.x = clamp(v.x, w - w * v.zoom, 0); v.y = clamp(v.y, h - h * v.zoom, 0);
    }
    _wireMap() {
      const cv = this.mapCanvas, v = this.view;
      let down = false, moved = false, sx = 0, sy = 0, ox = 0, oy = 0;
      cv.addEventListener('pointerdown', (e) => { down = true; moved = false; sx = e.clientX; sy = e.clientY; ox = v.x; oy = v.y; try { cv.setPointerCapture(e.pointerId); } catch (err) {} });
      cv.addEventListener('pointermove', (e) => {
        if (down) {
          const dx = e.clientX - sx, dy = e.clientY - sy;
          if (!moved && Math.abs(dx) + Math.abs(dy) > 4) moved = true;
          if (moved) { v.x = ox + dx; v.y = oy + dy; this._clampView(); if (this.popupCountry) this._positionPopup(); cv.style.cursor = 'grabbing'; }
          return;
        }
        const m = this._toMap(e.clientX, e.clientY);
        const hit = this.game.world.pick(m.x, m.y, this.game);
        this.game.hoverCountry = hit && hit.type === 'country' ? hit.obj : null;
        cv.style.cursor = hit ? 'pointer' : (this.game.phase === 'select' ? 'crosshair' : 'grab');
      });
      const endDrag = (e) => {
        if (!down) return; down = false; try { cv.releasePointerCapture(e.pointerId); } catch (err) {}
        cv.style.cursor = 'grab';
        if (moved) return;                 // it was a pan, not a click
        this.game.audio && this.game.audio.ensure();
        const m = this._toMap(e.clientX, e.clientY);
        const hit = this.game.world.pick(m.x, m.y, this.game);
        if (!hit) { this.selectCountry(null); this._hideCountryPopup(); return; }
        if (hit.type === 'viral') { this.game.clickViral(hit.obj); this.game.audio && this.game.audio.click(); }
        else if (hit.type === 'cure') { this.game.clickCure(hit.obj); }
        else if (this.game.phase === 'select') { this.game.chooseStart(hit.obj); this.selectCountry(hit.obj); }
        else { this.selectCountry(hit.obj); this._showCountryPopup(hit.obj); }
      };
      cv.addEventListener('pointerup', endDrag);
      cv.addEventListener('pointercancel', () => { down = false; });
      cv.addEventListener('wheel', (e) => {
        e.preventDefault();
        const r = cv.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top;
        const lx = (mx - v.x) / v.zoom, ly = (my - v.y) / v.zoom;
        v.zoom = clamp(v.zoom * (e.deltaY < 0 ? 1.15 : 1 / 1.15), 1, 6);
        v.x = mx - lx * v.zoom; v.y = my - ly * v.zoom; this._clampView();
        if (this.popupCountry) this._positionPopup();
      }, { passive: false });
      // double-click to reset the view
      cv.addEventListener('dblclick', () => { v.zoom = 1; v.x = 0; v.y = 0; if (this.popupCountry) this._positionPopup(); });
    }

    // ---- lifecycle ----------------------------------------------------
    onNewGame() {
      if (!this.mounted) return;
      this.milestones.clear(); this.selected = null; this.game.selected = null;
      if (this.view) { this.view.zoom = 1; this.view.x = 0; this.view.y = 0; }
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
    onBuy(u) { this._updateTree(); this._drawLines(this._activeTree()); this._renderNodeDetail(); this._evoVir(); this._flash('chipVir'); this.toast(spr('upgrade', u.id, 20), `Evolved <b>${u.name}</b>`, u.tree === 'symptom' && u.fx.sev > 1 ? 'bad' : 'good'); }
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
      this._renderOverview(); this._updateTree(); this._updateEvoStats(); this._openModal('evoModal'); this._drawLines(this._activeTree());
    }
    _closeEvo() { this._evoOpen = false; this._updatePause(); this._closeModal('evoModal'); }
    // Bottom stat bars (Virality + Infectivity / Severity / Lethality meters).
    _updateEvoStats() {
      const g = this.game, set = (id, v) => { const e = $(id); if (e) e.textContent = v; };
      const bar = (id, v, max) => { const e = $(id); if (e) e.style.width = clamp(v / max * 100, 0, 100) + '%'; };
      set('esbDna', fmt(g.virality));
      bar('esbInf', g.infectivity(), 12); set('esbInfV', g.infectivity().toFixed(1));
      bar('esbSev', g.severity(), 14); set('esbSevV', g.severity().toFixed(1));
      bar('esbLet', g.lethality(), 8); set('esbLetV', g.lethality().toFixed(1));
    }
    _renderOverview() {
      const g = this.game, host = $('etab-overview'); if (!host) return;
      const bar = (label, v, max, color) => `<div class="ov-bar"><div class="ov-bar-top"><span>${label}</span><span>${v.toFixed(1)}</span></div><div class="ov-track"><div style="width:${clamp(v / max * 100, 0, 100)}%;background:${color}"></div></div></div>`;
      const top = g.world.countries.filter((c) => c.total() > 0.004).sort((a, b) => b.total() - a.total()).slice(0, 6);
      const mi = top.length ? top.map((c) => { const st = c.stage(); return `<div class="mi-row"><span class="mi-emo">${spr('country', c.name, 18, st.color)}</span><span class="mi-name">${c.short}</span><span class="mi-bar"><span style="width:${clamp(c.brainrotPct(), 0, 100)}%;background:${st.color}"></span></span><span class="mi-pct" style="color:${st.color}">${BR.fmtPct(c.brainrotPct())}</span></div>`; }).join('') : '<div class="cp-empty">Nothing infected yet — evolve a Transmission to start.</div>';
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

    // Realistic anatomical brain art: load local file first (self-contained),
    // fall back to the hosted URL, and to the procedural brain if both fail.
    _initBrainImgs() {
      const mk = (spec) => {
        if (!spec) return null;
        const img = new Image(); img._ready = false; let tried = false;
        img.onload = () => { img._ready = true; };
        img.onerror = () => { if (!tried && spec.url) { tried = true; img.src = spec.url; } };
        img.src = spec.local || spec.url;
        return img;
      };
      const B = BR.BRAIN_IMG || {};
      this._brainHealthy = mk(B.healthy); this._brainRot = mk(B.rot);
    }

    // ---- rotting brain (left panel; rots as global brainrot rises) -----
    _drawBrain(t) {
      const cv = this.brainCanvas, ctx = this.bctx; if (!cv || !ctx) return;
      const w = cv.clientWidth || 280, h = cv.clientHeight || 150;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      if (cv.width !== Math.round(w * dpr)) { cv.width = w * dpr; cv.height = h * dpr; }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
      const pct = clamp(this.game.globalBrainrot() / 100, 0, 1);

      // Anatomical brain crossfade: healthy -> rotted as infection spreads,
      // mirroring the original game's body/organ view. Falls back below.
      const hImg = this._brainHealthy, rImg = this._brainRot;
      if (hImg && hImg._ready) {
        const cover = (img) => { const s = Math.max(w / img.width, h / img.height); const dw = img.width * s, dh = img.height * s; return [(w - dw) / 2, (h - dh) / 2, dw, dh]; };
        const pulse = 1 + Math.sin(t * 2) * 0.008 + pct * Math.sin(t * 10) * 0.006;
        ctx.save(); ctx.translate(w / 2, h / 2); ctx.scale(pulse, pulse); ctx.translate(-w / 2, -h / 2);
        ctx.drawImage(hImg, ...cover(hImg));
        if (rImg && rImg._ready && pct > 0.002) { ctx.globalAlpha = Math.min(1, pct * 1.08); ctx.drawImage(rImg, ...cover(rImg)); ctx.globalAlpha = 1; }
        ctx.restore();
        return;
      }

      const cx = w / 2, cy = h / 2 + 4, rx = Math.min(w * 0.36, 92), ry = Math.min(h * 0.34, 50);
      const col = (a, b, tt) => `rgb(${Math.round(BR.lerp(a[0], b[0], tt))},${Math.round(BR.lerp(a[1], b[1], tt))},${Math.round(BR.lerp(a[2], b[2], tt))})`;
      const healthy = [255, 150, 225], mid = [180, 95, 230], rot = [150, 65, 205];
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
    onHeatSpike() { const m = $('mf-heat'), meter = m && m.closest('.meter'); if (meter) { meter.classList.remove('spike'); void meter.offsetWidth; meter.classList.add('spike'); } }
    onWin() { this.game.fx && this.game.fx.confetti(this.cssW, this.cssH); this._showEnd(true); }
    onLose(reason) { this._showEnd(false, reason); }
    autoStart() { // ?auto — jump straight into a playable game (screenshots/demo)
      this._autoDemo = true; // demo mode: news popups auto-dismiss so it keeps flowing
      this._closeModal('introModal'); this.game.chooseStart(this.game.world.byName['India'] || this.game.world.countries[0]); this.game.releaseBrainrot();
    }

    // ---- per-tick HUD -------------------------------------------------
    tickHud() {
      if (!this.mounted) return; const g = this.game;
      // Self-heal: if the sim is paused for a news/evolve overlay but neither
      // overlay is actually on-screen, the pause flags desynced from the DOM.
      // Recover instead of freezing forever ("game just stops, no progress").
      if (g.paused && g.phase === 'play' && !g.ended) {
        const evoOn = $('evoModal') && $('evoModal').classList.contains('on');
        const newsOn = $('newsModal') && $('newsModal').classList.contains('on');
        if (!evoOn && !newsOn) { this._evoOpen = false; this._newsOpen = false; this._newsQueue = []; this._updatePause(); }
      }
      $('valVir').textContent = fmt(g.virality);
      $('valInfected').textContent = fmt(g.infectedPeople() * 1e6);
      $('valTerminal').textContent = fmt(g.necroticPeople() * 1e6);
      $('valGlobal').textContent = BR.fmtPct(g.globalBrainrot());
      $('valTrend').textContent = g.trend || '—';
      const bp = $('brainPct'); if (bp) bp.textContent = BR.fmtPct(g.globalBrainrot());

      this._meter('heat', g.heat, BR.CONST.HEAT_MAX, g.heatLabel());
      const hm = $('mf-heat'), hmeter = hm && hm.closest('.meter'); if (hmeter) hmeter.classList.toggle('hot', g.heat >= BR.CONST.HEAT_HOT);
      this._meter('inf', g.infectivity(), MET.inf, g.infectivity().toFixed(1));
      this._meter('sev', g.severity(), MET.sev, g.severity().toFixed(1));
      this._meter('let', g.lethality(), MET.let, g.lethality().toFixed(1));
      this._meter('aware', g.awareness * 100, 100, BR.fmtPct(g.awareness * 100));

      const cf = $('cureFill'); cf.style.width = g.cure + '%';
      cf.style.background = g.cure > 66 ? 'linear-gradient(90deg,#ff4bd8,#ff2d6f)' : g.cure > 33 ? 'linear-gradient(90deg,#b57bff,#ff6bd6)' : 'linear-gradient(90deg,#4be7ff,#5ffbe0)';
      $('cureVal').textContent = BR.fmtPct(g.cure); $('cureLabel').textContent = g.cureLabel();
      const cb = $('curebar'); if (cb) cb.classList.toggle('danger', g.cure >= 80);

      if (this._evoOpen) this._updateEvoStats();
      this._treeAfford(); this._updateStatusBar(); this._updateCountryPanel(); this._refreshSpeedBtns(); this._milestones();
      // Pulse the round EVOLVE button when something is actually affordable.
      const be = $('btnEvolve');
      if (be) { const can = g.phase === 'play' && !g.ended && BR.UPGRADE_TREE.some((u) => g.canBuy(u)); be.classList.toggle('can-evolve', can); }
      if (this.selectedNode && !g.purchased.has(this.selectedNode.id)) { const nb = $('ndBuy'); if (nb) nb.classList.toggle('dis', g.virality < this.selectedNode.cost); }
      if (this.popupCountry) this._tickPopup();
    }
    _meter(k, v, max, label) { const f = $('mf-' + k), t = $('mv-' + k); if (f) f.style.width = clamp(v / max * 100, 0, 100) + '%'; if (t) t.textContent = label; }
    refreshSpeed() { this._refreshSpeedBtns(); }
    _refreshSpeedBtns() { document.querySelectorAll('#speeds button').forEach((b) => b.classList.toggle('on', +b.dataset.sp === this.game.speed)); }

    // ---- render loop --------------------------------------------------
    render(t, dt) {
      if (!this.mounted) return; this._resize();
      const v = this.view, dpr = this._dpr;
      // clear the whole canvas in device space, then draw under the pan+zoom view
      this.mctx.setTransform(1, 0, 0, 1, 0, 0); this.mctx.clearRect(0, 0, this.mapCanvas.width, this.mapCanvas.height);
      this.mctx.setTransform(dpr * v.zoom, 0, 0, dpr * v.zoom, dpr * v.x, dpr * v.y);
      this.game.world.render(this.mctx, this.game, t);
      if (this.game.fx) {
        this.fctx.setTransform(1, 0, 0, 1, 0, 0); this.fctx.clearRect(0, 0, this.fxCanvas.width, this.fxCanvas.height);
        this.fctx.setTransform(dpr * v.zoom, 0, 0, dpr * v.zoom, dpr * v.x, dpr * v.y);
        this.game.fx.update(dt); this.game.fx.render(this.fctx);
      }
      this._drawBrain(t);
      if (this._evoOpen) this._drawPathogen(t);
    }

    // Animated "meme pathogen": a sinister rotting brain-virus. It pulses,
    // oozes, sprouts sharp receptor spikes and stares back with glowing eyes.
    // Grows nastier (more necrosis-green, more spikes, angrier eyes) as
    // Severity / Lethality climb.
    _drawPathogen(t) {
      const cv = this._pathogenCv, ctx = this._pathogenCtx; if (!cv || !ctx) return;
      const w = cv.clientWidth || 260, h = cv.clientHeight || 150;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      if (cv.width !== Math.round(w * dpr)) { cv.width = w * dpr; cv.height = h * dpr; }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
      const g = this.game, cx = w / 2, cy = h / 2 + h * 0.02, R = Math.min(w, h) * 0.26;
      const sev = g.severity(), let_ = g.lethality(), rot = t * 0.35;
      const sp = clamp(sev / 24, 0, 1);                              // severity 0..1
      const lp = clamp(let_ / 6, 0, 1);                              // lethality -> necrosis
      const pulse = 0.5 + 0.5 * Math.sin(t * 2.3);
      const N = 12 + Math.round(sp * 12);                            // spikier with severity
      // brain-blob radius: lumpy, two-hemisphere feel, breathing with the pulse
      const RR = R * (1 + 0.03 * pulse);
      const blob = (a) => RR * (1 + 0.13 * Math.sin(a * 7 + rot) + 0.07 * Math.sin(a * 3 - rot * 0.7) + 0.05 * Math.sin(a * 11 + rot * 1.7));
      const sicK = lp > 0.55 ? '#8fd14a' : '#d94bff';               // spike/glow color shifts to necrosis-green
      ctx.save(); ctx.translate(cx, cy);

      // ---- dark aura behind the pathogen -------------------------------
      const aura = ctx.createRadialGradient(0, 0, R * 0.4, 0, 0, R * 2.1);
      aura.addColorStop(0, lp > 0.55 ? 'rgba(120,220,80,.22)' : 'rgba(220,60,255,.22)');
      aura.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = aura; ctx.beginPath(); ctx.arc(0, 0, R * 2.1, 0, Math.PI * 2); ctx.fill();

      // ---- dripping ooze below (menacing, elongating globs) ------------
      const drips = 5, dr = BR.rng(77);
      for (let i = 0; i < drips; i++) {
        const dx = (dr() - 0.5) * R * 1.5, ph = (t * 0.5 + dr() * 6) % 3;
        const dl = R * (0.2 + 0.9 * Math.min(1, ph)) * (0.4 + dr() * 0.8);
        const dy0 = Math.sqrt(Math.max(0, RR * RR - dx * dx)) * 0.9 || RR * 0.5;
        ctx.strokeStyle = lp > 0.55 ? 'rgba(120,200,60,.5)' : 'rgba(190,40,220,.5)';
        ctx.lineWidth = 3 - i * 0.2; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(dx, dy0); ctx.lineTo(dx, dy0 + dl); ctx.stroke();
        ctx.fillStyle = lp > 0.55 ? 'rgba(140,220,70,.65)' : 'rgba(210,60,240,.65)';
        ctx.beginPath(); ctx.arc(dx, dy0 + dl, 2.6 - i * 0.15, 0, Math.PI * 2); ctx.fill();
      }

      // ---- sharp receptor spikes radiating out -------------------------
      for (let i = 0; i < N; i++) {
        const a = (i / N) * Math.PI * 2 + rot * 1.4;
        const bob = 0.88 + 0.12 * Math.sin(a * 2 + t * 2);
        const br = blob(a) * 0.98, len = R * (0.28 + 0.12 * Math.sin(a * 5 + t)) * bob;
        const bx = Math.cos(a) * br, by = Math.sin(a) * br;
        const tx = Math.cos(a) * (br + len), ty = Math.sin(a) * (br + len);
        const pa = a + 0.14, na = a - 0.14, wr = br * 0.5;
        ctx.fillStyle = sicK; ctx.globalAlpha = 0.35 + 0.35 * bob;
        ctx.beginPath();
        ctx.moveTo(Math.cos(pa) * wr, Math.sin(pa) * wr);
        ctx.lineTo(tx, ty);
        ctx.lineTo(Math.cos(na) * wr, Math.sin(na) * wr);
        ctx.closePath(); ctx.fill();
      }
      ctx.globalAlpha = 1;

      // ---- the rotting brain body --------------------------------------
      ctx.beginPath();
      for (let a = 0; a <= Math.PI * 2 + 0.001; a += Math.PI / 40) {
        const rr = blob(a), x = Math.cos(a) * rr, y = Math.sin(a) * rr;
        if (a === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
      const body = ctx.createRadialGradient(-R * 0.3, -R * 0.35, R * 0.12, 0, R * 0.1, R * 1.25);
      body.addColorStop(0, lp > 0.55 ? '#e8ffb0' : '#ffc8f2');
      body.addColorStop(0.35, lp > 0.55 ? '#7fae3a' : '#c23bb0');
      body.addColorStop(0.72, lp > 0.55 ? '#3f5a1e' : '#6d1470');
      body.addColorStop(1, '#1b0620');
      ctx.save();
      ctx.shadowColor = sicK; ctx.shadowBlur = 18 + 10 * pulse;
      ctx.fillStyle = body; ctx.fill();
      ctx.restore();
      ctx.save(); ctx.clip();

      // brain folds / sulci — squiggly grooves across the surface
      ctx.strokeStyle = lp > 0.55 ? 'rgba(30,50,15,.55)' : 'rgba(60,8,70,.55)';
      ctx.lineWidth = 2; ctx.lineCap = 'round';
      for (let r = 0; r < 6; r++) {
        ctx.beginPath();
        for (let a = -0.2; a <= Math.PI * 2; a += 0.25) {
          const rr = (R * 0.28 + r * R * 0.22) * (1 + 0.08 * Math.sin(a * 6 + r + rot));
          const x = Math.cos(a) * rr, y = Math.sin(a) * rr * 0.92;
          if (a < 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      // central fissure between hemispheres
      ctx.beginPath(); ctx.moveTo(0, -RR * 0.95);
      ctx.bezierCurveTo(R * 0.14, -R * 0.3, -R * 0.14, R * 0.3, 0, RR * 0.95);
      ctx.lineWidth = 2.6; ctx.stroke();

      // necrosis blotches (grow greener/darker with lethality)
      const nb = BR.rng(1234), nBlobs = 5 + Math.round((sp + lp) * 5);
      for (let i = 0; i < nBlobs; i++) {
        const a = nb() * Math.PI * 2 + rot, rr = nb() * R * 0.85;
        const bx = Math.cos(a) * rr, by = Math.sin(a) * rr, sz = 2 + nb() * 5;
        const green = nb() < lp + 0.2;
        ctx.globalAlpha = 0.32; ctx.fillStyle = green ? '#2e4d16' : '#4a0c58';
        ctx.beginPath(); ctx.arc(bx, by, sz, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.restore(); // unclip

      // ---- glowing sinister eyes ---------------------------------------
      const ex = R * 0.4, ey = -R * 0.12, er = R * 0.19;
      const look = Math.sin(t * 0.9) * er * 0.28;                    // eyes shift, unsettling
      const angry = 0.35 + 0.65 * sp;                                // narrower / redder when severe
      const eyeCol = lp > 0.55 ? '210,80,60' : '120,255,240';        // acid red when lethal, hypno-cyan otherwise
      [-1, 1].forEach((s) => {
        const x = s * ex, y = ey;
        // glow
        const gg = ctx.createRadialGradient(x, y, 1, x, y, er * 1.8);
        gg.addColorStop(0, `rgba(${eyeCol},${0.85})`); gg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(x, y, er * 1.8, 0, Math.PI * 2); ctx.fill();
        // sclera
        ctx.fillStyle = `rgba(${eyeCol},0.95)`;
        ctx.beginPath(); ctx.ellipse(x, y, er, er * (1.05 - 0.5 * angry), 0, 0, Math.PI * 2); ctx.fill();
        // slit pupil
        ctx.fillStyle = '#05030a';
        ctx.beginPath(); ctx.ellipse(x + look, y, er * 0.26, er * 0.9, 0, 0, Math.PI * 2); ctx.fill();
        // hot spec
        ctx.fillStyle = 'rgba(255,255,255,.8)';
        ctx.beginPath(); ctx.arc(x + look - er * 0.2, y - er * 0.3, er * 0.13, 0, Math.PI * 2); ctx.fill();
      });
      // angry brow ridges when severity is high
      if (sp > 0.25) {
        ctx.strokeStyle = lp > 0.55 ? 'rgba(40,60,15,.8)' : 'rgba(50,5,60,.8)';
        ctx.lineWidth = 3.4; ctx.lineCap = 'round';
        [-1, 1].forEach((s) => { ctx.beginPath(); ctx.moveTo(s * ex - s * er, ey - er * (0.8 + angry * 0.5)); ctx.lineTo(s * ex + s * er * 0.7, ey - er * 0.55); ctx.stroke(); });
      }

      ctx.restore();
    }
    _resize() {
      const w = this.mapWrap.clientWidth, h = this.mapWrap.clientHeight; if (w === this.cssW && h === this.cssH) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1); this._dpr = dpr;
      [this.mapCanvas, this.fxCanvas].forEach((c) => { c.width = w * dpr; c.height = h * dpr; });
      this.cssW = w; this.cssH = h; this.game.world.layout(w, h, this._mapInsets()); this._clampView();
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
      host.innerHTML = `<div class="cp-head"><div class="cp-emoji">${spr('country', c.name, 34, st.color)}</div><div><div class="cp-name">${c.name}</div><span class="cp-stage" style="background:${st.color}22;color:${st.color}">${st.name}</span></div></div>
        <div class="pc"><div class="pc-h good">✔ Pros</div>${pc.pros.map((p) => `<div class="pc-row good">+ ${p}</div>`).join('')}<div class="pc-h bad">✘ Cons</div>${pc.cons.map((p) => `<div class="pc-row bad">– ${p}</div>`).join('')}</div>
        ${this._bar('💰 Wealth', c.wealth, '#f2c94c')}${this._bar('📶 Internet', c.internet, '#4ea1ff')}${this._bar('🏛️ Censorship', c.moderation, '#b06cf0')}${this._bar('🗣️ Meme-native', c.english, '#43c6ac')}
        <button class="release-btn" id="btnRelease">☣️ Release the Brainrot here</button>`;
      const rb = $('btnRelease'); if (rb) rb.addEventListener('click', () => { if (this.game.releaseBrainrot()) this.game.setSpeed(1); });
    }
    _renderDiseasePanel() {
      const g = this.game, host = $('countryPanel');
      const top = g.world.countries.filter((c) => c.total() > 0.004).sort((a, b) => b.total() - a.total()).slice(0, 9);
      const row = (c) => { const st = c.stage(); return `<div class="mi-row"><span class="mi-emo">${spr('country', c.name, 18, st.color)}</span><span class="mi-name">${c.short}</span><span class="mi-bar"><span style="width:${clamp(c.brainrotPct(), 0, 100)}%;background:${st.color}"></span></span><span class="mi-pct" style="color:${st.color}">${BR.fmtPct(c.brainrotPct())}</span></div>`; };
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
      p.innerHTML = `<div class="cpop-head"><span class="cpop-emo">${spr('country', c.name, 22, c.stage().color)}</span><span class="cpop-name">${c.name}</span><button class="cpop-x" id="cpopX">✕</button></div>
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
      const v = this.view, w = 190, h = p.offsetHeight || 130, mw = this.cssW, mh = this.cssH;
      const cx = c.px * v.zoom + v.x, cy = c.py * v.zoom + v.y, cr = c.r * v.zoom;   // map -> screen
      const left = clamp(cx - w / 2, 6, Math.max(6, mw - w - 6));
      let top = cy - cr - 12 - h;
      if (top < 6) top = clamp(cy + cr + 12, 6, Math.max(6, mh - h - 6));
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
