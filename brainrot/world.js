/* =====================================================================
 * world.js — the World: owns countries, runs the Plague-like spread
 * simulation (pure, DOM-free) and draws the map (canvas, browser-only).
 *
 * Model: healthy → infected → terminal, driven by evolved Infectivity /
 * Severity / Lethality. Cross-border spread flows over air / sea / land
 * links that governments shut as they notice you. Rich, censored, infected
 * countries generate the Cure's research power.
 *
 * The map is drawn from real (Natural Earth 110m) country outlines in
 * BR.WORLDMAP: a cached neutral basemap of every country, with the 18
 * gameplay countries' actual shapes filled by infection.
 * =================================================================== */
(function (G) {
  'use strict';
  const BR = (G.BR = G.BR || {});
  const C = BR.CONST, clamp = BR.clamp;

  // Gameplay-country name → BR.WORLDMAP feature name (where they differ).
  const FEATURE_ALIAS = { 'United States': 'United States of America' };

  class World {
    constructor() {
      this.countries = BR.COUNTRY_DATA.map((d, i) => new BR.Country(d, i));
      this.byName = {};
      this.countries.forEach((c) => { this.byName[c.name] = c; });
      this.totalPop = this.countries.reduce((s, c) => s + c.pop, 0);

      this.countries.forEach((c) => { c.landRefs = (c.land || []).map((n) => this.byName[n]).filter(Boolean); });
      // Make land adjacency mutual (a neighbour only declared on one side still connects both ways).
      this.countries.forEach((c) => c.landRefs.forEach((n) => { if (!n.landRefs.includes(c)) n.landRefs.push(c); }));
      this.airHubs = this.countries.filter((c) => c.air);
      this.seaHubs = this.countries.filter((c) => c.port);
      this.links = this._links();
      // Bigger countries saturate slower (more people to reach), so no single
      // giant-population country can spike the global % as it crosses its
      // logistic midpoint — the last remaining snowball source. popFactor < 1
      // for the giants, > 1 for small nations, ~1 at POP_REF.
      const dk = C.POP_DRAG || 0, pr = C.POP_REF || 80;
      this.countries.forEach((c) => { c.popFactor = dk > 0 ? clamp(Math.pow(pr / Math.max(1, c.pop), dk), 0.32, 1.6) : 1; });
      // ---- living-map fx state ----
      this._travelers = [];      // planes/ships crossing active routes
      this._pings = [];          // expanding rings (arrivals, alerts, bursts)
      this._announced = new Set();  // countries that have flashed a "new outbreak"
      this._stamped = new Set();    // countries that have received a terminal skull
      this._lastT = 0; this._spawnAcc = 0;
    }
    // Called by the game when a map bubble is tapped — pops a burst on the map.
    addBurst(x, y, color, big) { this._pings.push({ x, y, r0: big ? 6 : 4, r1: big ? 46 : 30, age: 0, life: 0.6, color, w: 2.4 }); }

    // A sparse, connected transmission graph — the SAME edges the map draws and
    // the simulation spreads along. Land borders form the backbone; sea lanes
    // and flight routes bridge oceans hub-to-nearest-hub. No global mesh: the
    // disease must physically hop neighbour to neighbour.
    _links() {
      const out = [], seen = new Set();
      const add = (a, b, kind) => {
        if (a === b) return;
        const k = Math.min(a.id, b.id) + '-' + Math.max(a.id, b.id);
        if (seen.has(k)) return;                 // first (strongest) kind wins for a pair
        seen.add(k); out.push({ a, b, kind, dist: Math.sqrt(this._d(a, b)) });
      };
      const nearest = (c, pool, n) => pool.filter((o) => o !== c).sort((p, q) => this._d(c, p) - this._d(c, q)).slice(0, n);
      // Land borders — always-present, strongest.
      this.countries.forEach((c) => c.landRefs.forEach((n) => add(c, n, 'land')));
      // Sea lanes — each port to its 2 nearest other ports.
      this.seaHubs.forEach((c) => nearest(c, this.seaHubs, 2).forEach((n) => add(c, n, 'sea')));
      // Flight routes — each air hub to its 3 nearest other air hubs.
      this.airHubs.forEach((c) => nearest(c, this.airHubs, 3).forEach((n) => add(c, n, 'air')));
      // Connectivity guarantee — every country links to its single nearest
      // neighbour so no region is ever stranded (kind by available infrastructure).
      this.countries.forEach((c) => { const n = nearest(c, this.countries, 1)[0]; if (n) add(c, n, (c.air || n.air) ? 'air' : (c.port || n.port) ? 'sea' : 'land'); });
      return out;
    }
    _d(a, b) { const dx = a.mx - b.mx, dy = a.my - b.my; return dx * dx + dy * dy; }
    _openOf(c, kind) { return kind === 'land' ? c.landOpen : kind === 'sea' ? c.seaOpen : c.airOpen; }

    // ---- SIMULATION (pure) --------------------------------------------
    simStep(dt, ctx) {
      const ev = ctx.ev, diff = ctx.diff;
      const infS = Math.max(0, ev.inf);
      const sevS = Math.max(0, ev.sev);
      const letS = Math.max(0, ev.let);
      const sm = ctx.spreadMult || 1;   // Trend Heat spread multiplier
      let newly = 0, internalNew = 0, crossNew = 0;   // (last two: telemetry only)
      const closures = [];   // {c, kind} — routes that slammed shut this step

      for (const c of this.countries) {
        const h = c.healthy();
        // Internal growth ONLY happens in a country that has ALREADY been
        // seeded (total > 0). A pristine country stays at zero until a
        // transmission link physically brings the rot to it — otherwise the
        // SEED_FLOOR term would make every country on Earth spontaneously
        // generate its own brainrot in parallel, lighting up the whole world in
        // seconds with no path (the "China → USA in 10s for no reason" bug).
        if (h > 0 && c.total() > 0) {
          const susc = c.susceptibility(ev, diff.susc);
          const mult = 1 + infS * C.INF_SCALE;
          // Spread pressure scales with TOTAL brainrot (infected + terminal): a
          // fully-necrotic region's people are still online posting the rot, so
          // it keeps infecting its healthy holdouts. Using total() (not infected)
          // prevents "lethality burnout" — necrosis draining the spreader pool
          // before a resistant country finishes saturating, which used to freeze
          // the world at ~85% and make the win unreachable.
          const growth = C.INFECT_BASE * mult * sm * susc * c.popFactor * (C.SEED_FLOOR + C.MOMENTUM * c.total()) * h * dt;
          const g = Math.min(h, growth);
          c.infected += g; newly += g * c.pop; internalNew += g * c.pop;
        }
        if (letS > 0 && c.infected > 0) {
          const nec = Math.min(c.infected, C.NECROSIS_BASE * letS * c.infected * dt);
          c.infected -= nec; c.necrotic += nec;
        }
        if (!c.detected && (c.total() > C.DETECT_INFECT || sevS > C.DETECT_SEV)) c.detected = true;
        c.awareness = clamp(c.total() * 0.55 + sevS * 0.03 + ctx.globalAwareness * 0.45, 0, 1);
        if (c.detected && ctx.lockdownPressure > 0) {
          const p = C.LOCKDOWN_STEP * diff.lockdown * (0.4 + c.wealth * 0.6 + c.moderation * 0.6) * ctx.lockdownPressure * c.awareness;
          if (c.airOpen && ctx.rnd() < p) { c.airOpen = false; closures.push({ c, kind: 'air' }); }
          else if (c.seaOpen && ctx.rnd() < p * 0.8) { c.seaOpen = false; closures.push({ c, kind: 'sea' }); }
          else if (c.landOpen && ctx.rnd() < p * 0.6) { c.landOpen = false; closures.push({ c, kind: 'land' }); }
        }
      }

      // Cross-border spread flows ALONG THE LINK GRAPH the map draws — one
      // country seeding a linked neighbour, so every new outbreak has a
      // traceable path. A source must be ESTABLISHED (EXPORT_MIN) before it can
      // export, and farther links seed far slower (LINK_DIST_K falloff).
      const seed = new Float64Array(this.countries.length);
      const bp = clamp(ev.borderPierce, 0, 1);
      const chan = (open) => (open ? 1 : bp);
      const KIND = { land: C.LINK_LAND, sea: C.LINK_SEA, air: C.LINK_AIR };
      const ramp = C.EXPORT_RAMP || 0.0001;
      const cross = (src, dst, l) => {
        // Export strength RAMPS UP from 0 as the source grows past EXPORT_MIN
        // (full only once it's EXPORT_RAMP above the gate). A barely-established
        // origin exports weakly, so a dense cluster of close neighbours (e.g. a
        // European start) is revealed gradually — each crossing 1% at its own
        // time by susceptibility/distance — instead of all at once the instant
        // the origin crosses the gate. This is the fix for "spreads across the
        // world too fast at the start".
        const exp = clamp((src.total() - C.EXPORT_MIN) / ramp, 0, 1);
        if (exp <= 0) return;
        const f = chan(this._openOf(src, l.kind)) * chan(this._openOf(dst, l.kind));
        if (f <= 0) return;
        const distFall = 1 / (1 + l.dist * C.LINK_DIST_K);    // long-haul routes are weak
        // Infectivity gives a GENTLE, bounded boost (same scale as internal
        // growth) — never the raw multiplier, which used to let a high-Infectivity
        // plague saturate whole countries across borders in lockstep.
        const push = (1 + infS * C.INF_SCALE) * sm * src.total() * exp * dt;
        // Links only INTRODUCE the rot — they seed a fresh country up to a small
        // foothold and then fade out; the country's OWN internal growth does the
        // saturation. Without this, a dense cluster of established neighbours
        // mutually pumps seed and force-saturates the whole region in lockstep
        // (the mid-game snowball: ~95% of new infection was cross-border). The
        // intro taper -> 0 as the destination approaches CROSS_TAPER, so once a
        // country has a foothold each one rises on its own logistic clock.
        const introTaper = clamp(1 - dst.total() / C.CROSS_TAPER, 0, 1);
        if (introTaper <= 0) return;
        seed[dst.id] += KIND[l.kind] * push * f * distFall * introTaper * dst.susceptibility(ev, diff.susc);
      };
      for (const l of this.links) { cross(l.a, l.b, l); cross(l.b, l.a, l); }
      for (const b of this.countries) { if (seed[b.id] <= 0) continue; const g = Math.min(b.healthy(), seed[b.id]); b.infected += g; newly += g * b.pop; crossNew += g * b.pop; }

      let research = 0;
      for (const c of this.countries) research += c.wealth * (0.25 + c.moderation * 0.75) * c.total() * c.pop;
      research /= this.totalPop;
      return { newlyInfected: newly, research, internalNew, crossNew, closures };
    }

    // ---- aggregate readouts -------------------------------------------
    infectedPeople() { let s = 0; for (const c of this.countries) s += c.infected * c.pop; return s; }
    necroticPeople() { let s = 0; for (const c of this.countries) s += c.necrotic * c.pop; return s; }
    brainrotPeople() { let s = 0; for (const c of this.countries) s += c.total() * c.pop; return s; }
    healthyPeople() { return this.totalPop - this.brainrotPeople(); }
    globalBrainrot() { let s = 0; for (const c of this.countries) s += c.total() * c.pop; return (s / this.totalPop) * 100; }
    necroticFraction() { return this.necroticPeople() / this.totalPop; }
    anyDetected() { return this.countries.some((c) => c.detected); }
    allTerminal() { return this.necroticFraction() >= C.WIN_NECROSIS; }
    anyBrainrot() { return this.countries.some((c) => c.total() > 0.002); }

    // ---- RENDER (browser only) ----------------------------------------
    _tx(lon, lat) { const v = this._view, p = BR.project(lon, lat); return [v.padX + p.x * v.iw, v.padY + p.y * v.ih]; }
    _projFlat(flat) {
      const v = this._view, out = new Float32Array(flat.length);
      for (let i = 0; i < flat.length; i += 2) { out[i] = v.padX + ((flat[i] + 180) / 360) * v.iw; out[i + 1] = v.padY + ((90 - flat[i + 1]) / 180) * v.ih; }
      return out;
    }
    _matchFeatures() {
      const idx = {}; (BR.WORLDMAP || []).forEach((f) => { idx[f.n] = f; });
      for (const c of this.countries) {
        const names = (c.features && c.features.length) ? c.features : [FEATURE_ALIAS[c.name] || c.name];
        c._features = names.map((n) => idx[n]).filter(Boolean);
      }
    }

    layout(w, h, ins) {
      // Asymmetric insets keep the whole world projected into the area NOT
      // covered by the floating HUD panels, so no country is hidden.
      ins = ins || {};
      const padL = ins.left != null ? ins.left : w * 0.03;
      const padR = ins.right != null ? ins.right : w * 0.03;
      const padT = ins.top != null ? ins.top : h * 0.05;
      const padB = ins.bottom != null ? ins.bottom : h * 0.05;
      const iw = Math.max(60, w - padL - padR), ih = Math.max(60, h - padT - padB);
      this._view = { w, h, padX: padL, padY: padT, iw, ih };
      // Marker radius must track the map's on-screen SIZE, not just population —
      // otherwise the desktop-sized pins swamp the shrunken mobile map and
      // "cover the whole country". Scale by the tighter of the two axes vs a
      // desktop reference; capped at 1 so the desktop look is unchanged.
      this._markerScale = clamp(Math.min(iw / 820, ih / 620), 0.42, 1);
      const ms = this._markerScale;
      if (!this._matched) { this._matchFeatures(); this._matched = true; }
      for (const c of this.countries) {
        c.px = padL + c.mx * iw; c.py = padT + c.my * ih;
        c.r = (6 + Math.sqrt(c.pop) * 0.3) * ms;
        const rings = [];
        for (const f of c._features) for (const ring of f.r) rings.push(this._projFlat(ring));
        c.pxRings = rings.length ? rings : null;
        c.dots = c.pxRings ? this._seedDots(c) : [];
      }
      this._buildCache();
    }

    // Static basemap (ocean + graticule + all country land) drawn once.
    _buildCache() {
      if (typeof document === 'undefined') return;
      const v = this._view, dpr = Math.min(2, (typeof window !== 'undefined' && window.devicePixelRatio) || 1);
      const cv = this._cache = this._cache || document.createElement('canvas');
      cv.width = Math.max(1, v.w * dpr); cv.height = Math.max(1, v.h * dpr);
      const cx = cv.getContext('2d'); if (!cx) return;
      cx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Translucent vaporwave ocean — lets the sun/grid scene glow through
      // from behind, so the map "floats" over the vaporwave backdrop.
      cx.clearRect(0, 0, v.w, v.h);
      const bg = cx.createLinearGradient(0, 0, 0, v.h); bg.addColorStop(0, 'rgba(26,15,56,0.46)'); bg.addColorStop(1, 'rgba(11,6,32,0.64)');
      cx.fillStyle = bg; cx.fillRect(0, 0, v.w, v.h);
      // Neon magenta graticule (the vaporwave grid).
      cx.strokeStyle = 'rgba(255,75,216,0.06)'; cx.lineWidth = 1;
      for (let lon = -150; lon <= 150; lon += 30) { const [x] = this._tx(lon, 0); cx.beginPath(); cx.moveTo(x, 0); cx.lineTo(x, v.h); cx.stroke(); }
      for (let lat = -60; lat <= 60; lat += 30) { const [, y] = this._tx(0, lat); cx.beginPath(); cx.moveTo(0, y); cx.lineTo(v.w, y); cx.stroke(); }
      // All countries — neutral violet land.
      cx.lineWidth = 0.5; cx.strokeStyle = 'rgba(180,120,255,0.28)'; cx.fillStyle = '#2a1a54';
      for (const f of (BR.WORLDMAP || [])) { this._path(cx, f.r.map((r) => this._projFlat(r))); cx.fill('evenodd'); cx.stroke(); }
      // Gameplay countries — brighter violet with a magenta edge so they read as interactive.
      cx.lineWidth = 0.9; cx.strokeStyle = 'rgba(255,120,230,0.5)'; cx.fillStyle = '#3a2472';
      for (const c of this.countries) if (c.pxRings) { this._path(cx, c.pxRings); cx.fill('evenodd'); cx.stroke(); }
    }

    _path(ctx, rings) { ctx.beginPath(); for (const p of rings) { ctx.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) ctx.lineTo(p[i], p[i + 1]); ctx.closePath(); } }
    _fill(ctx, c, color, alpha) { if (!c.pxRings) return; ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = color; this._path(ctx, c.pxRings); ctx.fill('evenodd'); ctx.restore(); }

    render(ctx, game, t) {
      const v = this._view; if (!v) return;
      ctx.clearRect(0, 0, v.w, v.h);
      if (this._cache && this._cache.width > 0 && this._cache.height > 0) ctx.drawImage(this._cache, 0, 0, v.w, v.h);

      // Light infection tint on real shapes; the spreading DOTS carry the look.
      for (const c of this.countries) {
        const total = c.total(); if (total < 0.004) continue;
        this._fill(ctx, c, c.stage().color, clamp(0.14 + total * 0.4, 0, 0.58));
        if (c.necrotic > 0.03) this._fill(ctx, c, '#8a2fd0', clamp(c.necrotic * 0.42, 0, 0.52));
      }
      // Infection "spread dots" — creep out from the epicenter and take the
      // region over as % rises (bright magenta rot; necrotic cells go purple).
      for (const c of this.countries) {
        const total = c.total(); if (total < 0.004 || !c.dots || !c.dots.length) continue;
        const n = Math.max(1, Math.round(total * c.dots.length)), necN = Math.round(c.necrotic * c.dots.length);
        const rad = n < 4 ? 2.8 : 2.2;   // keep a lone patient-zero dot visible
        ctx.globalAlpha = 0.95; ctx.globalCompositeOperation = 'lighter';
        for (let i = 0; i < n; i++) { const d = c.dots[i]; if (!d) break; ctx.beginPath(); ctx.arc(d[0], d[1], rad, 0, Math.PI * 2); ctx.fillStyle = i < necN ? '#c86bff' : '#ff4bd8'; ctx.fill(); }
        ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
      }

      // Transmission links — faint base web, plus animated "spread beads" that
      // travel from an infected country toward the ones it's seeding.
      for (const l of this.links) {
        const heat = (l.a.total() + l.b.total()) / 2;
        const closed = !this._openOf(l.a, l.kind) || !this._openOf(l.b, l.kind);
        ctx.setLineDash(l.kind === 'air' ? [3, 5] : l.kind === 'sea' ? [1, 4] : []);
        ctx.strokeStyle = closed ? 'rgba(255,92,138,0.18)' : `rgba(255,75,216,${0.05 + heat * 0.3})`;
        ctx.lineWidth = closed ? 0.6 : 0.7 + heat * 1.2;
        ctx.beginPath(); ctx.moveTo(l.a.px, l.a.py); ctx.lineTo(l.b.px, l.b.py); ctx.stroke();
      }
      ctx.setLineDash([]); ctx.lineDashOffset = 0;

      // Living map: planes/ships crossing active routes, arrival pops, new-
      // outbreak alerts, terminal skull stamps, tap bursts.
      const dt = this._lastT ? clamp(t - this._lastT, 0, 0.1) : 0.016; this._lastT = t;
      if (game.phase === 'play' && !game.paused) this._mapFxUpdate(game, dt);
      this._mapFxDraw(ctx, game, t);

      // Selection / hover halos on the country shape.
      if (game.selected && game.selected.pxRings) { ctx.save(); ctx.lineWidth = 2; ctx.strokeStyle = '#5ffbe0'; ctx.shadowColor = '#5ffbe0'; ctx.shadowBlur = 10; this._path(ctx, game.selected.pxRings); ctx.stroke(); ctx.restore(); }
      if (game.phase === 'select' && game.hoverCountry && game.hoverCountry.pxRings && game.hoverCountry !== game.selected) { ctx.save(); ctx.lineWidth = 1.6; ctx.strokeStyle = '#ff4bd8'; this._path(ctx, game.hoverCountry.pxRings); ctx.stroke(); ctx.restore(); }

      for (const c of this.countries) this._marker(ctx, c, game, t);
      for (const b of game.viralBubbles) this._bubble(ctx, b, t, b.outbreak ? '#ff8be6' : '#f2c94c', b.outbreak ? 'brain' : 'flame', b.outbreak);
      for (const b of game.cureBubbles) this._bubble(ctx, b, t, '#4ea1ff', 'flask');
      this._glitch(ctx, this.globalBrainrot(), t);
    }

    // ---- LIVING MAP: travellers, alerts, stamps, bursts ---------------
    _activeRoutes() {
      const out = [];
      for (const l of this.links) {
        if (l.kind === 'land') continue;                         // land spread shown by dots/beads
        const src = l.a.total() >= l.b.total() ? l.a : l.b, dst = src === l.a ? l.b : l.a;
        if (src.total() < C.EXPORT_MIN || dst.total() > 0.9) continue;
        if (!this._openOf(l.a, l.kind) || !this._openOf(l.b, l.kind)) continue;
        out.push({ src, dst, kind: l.kind });
      }
      return out;
    }
    _mapFxUpdate(game, dt) {
      // new-outbreak alerts + terminal skull stamps
      for (const c of this.countries) {
        if (!this._announced.has(c.id) && c.total() > 0.012 && c !== game.patientZero) {
          this._announced.add(c.id);
          this._pings.push({ x: c.px, y: c.py, r0: c.r, r1: c.r + 26, age: 0, life: 1.1, color: '#ff3b6b', w: 2.2, alert: true });
          if (game.audio && game.audio.event) { try { game.audio.event('bad'); } catch (e) {} }
        }
        if (!this._stamped.has(c.id) && c.necrotic > 0.9) { this._stamped.add(c.id); this._pings.push({ x: c.px, y: c.py - c.r - 6, r0: 2, r1: 16, age: 0, life: 0.8, color: '#ff5c8a', w: 2 }); }
      }
      // cure "labs": once the Cure is researching, wealthy/controlled countries
      // pulse blue rings — the world visibly fighting back (Plague Inc's cure bubbles vibe).
      if (game.cure > 30) {
        this._labAcc = (this._labAcc || 0) + dt * (0.3 + game.cure / 120);
        if (this._labAcc >= 1) {
          this._labAcc -= 1;
          const labs = this.countries.filter((c) => c.detected && c.wealth > 0.55);
          const lc = labs[(BR.rng(((game.elapsed * 53) | 0))() * labs.length) | 0];
          if (lc) this._pings.push({ x: lc.px, y: lc.py, r0: 3, r1: 22, age: 0, life: 1.2, color: '#4ea1ff', w: 1.8 });
        }
      }
      // spawn travellers on active routes (rate scales with activity, capped)
      const routes = this._activeRoutes();
      this._spawnAcc += dt * (0.8 + routes.length * 0.5);
      while (this._spawnAcc >= 1 && this._travelers.length < 26 && routes.length) {
        this._spawnAcc -= 1;
        const rt = routes[(BR.rng(((game.elapsed * 97) | 0) + this._travelers.length * 13)() * routes.length) | 0];
        if (rt) this._travelers.push({ a: rt.src, b: rt.dst, kind: rt.kind, p: 0, spd: 0.22 + Math.random() * 0.16 });
      }
      // advance travellers; arrival pop at destination
      for (let i = this._travelers.length - 1; i >= 0; i--) {
        const tr = this._travelers[i]; tr.p += tr.spd * dt;
        if (tr.p >= 1) { this._pings.push({ x: tr.b.px, y: tr.b.py, r0: 2, r1: 14, age: 0, life: 0.5, color: tr.kind === 'air' ? '#ffd0f4' : '#9fe0ff', w: 1.8 }); this._travelers.splice(i, 1); }
      }
      // advance pings
      for (let i = this._pings.length - 1; i >= 0; i--) { const p = this._pings[i]; p.age += dt; if (p.age >= p.life) this._pings.splice(i, 1); }
    }
    _mapFxDraw(ctx, game, t) {
      const Spr = BR.Sprites;
      // travellers with a short comet trail
      for (const tr of this._travelers) {
        const x = tr.a.px + (tr.b.px - tr.a.px) * tr.p, y = tr.a.py + (tr.b.py - tr.a.py) * tr.p;
        const ang = Math.atan2(tr.b.py - tr.a.py, tr.b.px - tr.a.px);
        const fade = Math.sin(clamp(tr.p, 0, 1) * Math.PI);
        ctx.save(); ctx.globalAlpha = 0.35 * fade; ctx.strokeStyle = tr.kind === 'air' ? '#ffc4f2' : '#9fe0ff'; ctx.lineWidth = 1.4; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(x - Math.cos(ang) * 12, y - Math.sin(ang) * 12); ctx.lineTo(x, y); ctx.stroke(); ctx.restore();
        if (Spr) { ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.globalAlpha = 0.55 + 0.45 * fade; Spr.draw(ctx, tr.kind === 'air' ? 'plane' : 'ship', 0, 0, tr.kind === 'air' ? 13 : 12, tr.kind === 'air' ? '#ffe0f7' : '#bfeaff', 5); ctx.restore(); }
      }
      // expanding rings (arrivals / alerts / bursts)
      for (const p of this._pings) {
        const k = p.age / p.life, r = p.r0 + (p.r1 - p.r0) * k;
        ctx.save(); ctx.globalAlpha = (1 - k) * (p.alert ? 0.9 : 0.7); ctx.strokeStyle = p.color; ctx.lineWidth = p.w * (1 - k * 0.5);
        ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.stroke();
        if (p.alert && k < 0.6) { ctx.globalAlpha = (1 - k / 0.6); ctx.fillStyle = p.color; ctx.font = 'bold 12px Inter, system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('!', p.x, p.y - p.r0 - 8); }
        ctx.restore();
      }
    }

    _marker(ctx, c, game, t) {
      const total = c.total(), stage = c.stage(), inf = total > 0.02, terminal = c.necrotic > 0.85;
      const Spr = BR.Sprites;
      // Holdout nemesis: the last resistant region gets a golden pulsing crown
      // ring so the player can find the final boss on a fully-rotted map.
      if (game.holdout === c) {
        const pl = 0.5 + 0.5 * Math.sin(t * 3.5);
        ctx.save(); ctx.globalAlpha = 0.55 + 0.4 * pl; ctx.strokeStyle = '#ffd85c'; ctx.shadowColor = '#ffd85c'; ctx.shadowBlur = 12;
        ctx.lineWidth = 2.2; ctx.beginPath(); ctx.arc(c.px, c.py, c.r + 6 + pl * 3, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
        if (Spr) Spr.draw(ctx, 'star', c.px, c.py - c.r - 10, 13, '#ffd85c', 6);
      }
      // biohazard pulse behind a saturated (but not yet terminal) country
      if (Spr && total > 0.88 && !terminal) { const pl = 0.5 + 0.5 * Math.sin(t * 3 + c.id); ctx.save(); ctx.globalAlpha = 0.12 + 0.16 * pl; Spr.draw(ctx, 'biohazard', c.px, c.py, c.r * 3.4, '#8fd14a', false); ctx.restore(); }
      // pin
      ctx.beginPath(); ctx.arc(c.px, c.py, c.r, 0, Math.PI * 2);
      ctx.fillStyle = terminal ? 'rgba(30,6,20,0.82)' : 'rgba(10,14,26,0.72)'; ctx.fill();
      ctx.lineWidth = inf ? 1.6 : 1; ctx.strokeStyle = terminal ? '#ff5c8a' : inf ? stage.color : 'rgba(210,220,240,0.55)'; ctx.stroke();
      const wob = total > 0.7 ? Math.sin(t * 12 + c.id) * (total - 0.7) * 2.5 : 0;
      // vector country emblem, tinted by infection stage, glowing when infected.
      // A fully-terminal country is stamped with a skull instead of its emblem.
      if (Spr) {
        if (terminal) { Spr.draw(ctx, 'skull', c.px, c.py, c.r * 1.5, '#ff5c8a', c.r * 0.4); }
        else { const col = inf ? stage.color : 'rgba(220,228,248,0.82)'; Spr.draw(ctx, Spr.iconFor('country', c.name), c.px + wob, c.py, c.r * 1.55, col, inf ? c.r * 0.5 : false); }
      } else { ctx.font = `${Math.round(c.r * 1.15)}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(c.emoji, c.px + wob, c.py); }
      // closed-border padlock badge
      if (!c.airOpen || !c.seaOpen || !c.landOpen) { if (Spr) Spr.draw(ctx, 'lock', c.px + c.r + 4, c.py - c.r - 3, 11, '#ff5c8a'); }
      // research-lab badge: a rich, aware region is actively building the Cure.
      // Blinks brighter the closer the Cure gets — the visible source of the race.
      if (Spr && game.cure > 6 && c.detected && c.wealth > 0.62 && !terminal) {
        const pl = 0.55 + 0.45 * Math.sin(t * 4 + c.id * 2);
        ctx.save(); ctx.globalAlpha = 0.65 + 0.35 * pl * (game.cure / 100);
        Spr.draw(ctx, 'flask', c.px - c.r - 4, c.py - c.r - 3, 11, '#4ea1ff', c.r * 0.3 * pl); ctx.restore();
      }
      // label (name always subtle; % when infected) with outline for legibility
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const lbl = (s, y, color, weight) => { ctx.font = `${weight} 10px Inter, system-ui, sans-serif`; ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,0.72)'; ctx.strokeText(s, c.px, y); ctx.fillStyle = color; ctx.fillText(s, c.px, y); };
      // Declutter: only label a country's name when it matters (infected /
      // picked / hovered / during country select). Emoji marker is always on.
      const showName = game.phase === 'select' || total > 0.01 || c === game.selected || c === game.hoverCountry;
      if (showName) lbl(c.short, c.py + c.r + 8, 'rgba(238,242,255,0.92)', '700');
      if (total > 0.01) lbl(BR.fmtPct(c.brainrotPct()), c.py + c.r + 19, stage.color, '800');
    }

    _bubble(ctx, m, t, color, icon, big) {
      const life = clamp(m.ttl / m.maxTtl, 0, 1), pulse = 1 + Math.sin(t * 6 + m.x) * 0.1;
      const y = m.y - Math.sin(t * 3 + m.x) * 3, r = (big ? 19 : 15) * pulse;
      ctx.save();
      // a fresh-outbreak bubble gets a standing halo ring so it grabs the eye
      if (big) { ctx.globalAlpha = 0.5 * life; ctx.strokeStyle = color; ctx.lineWidth = 1.4; ctx.setLineDash([3, 4]);
        ctx.beginPath(); ctx.arc(m.x, y, r + 6 + Math.sin(t * 2 + m.x) * 2, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]); }
      // glowing disc
      ctx.globalAlpha = 0.28 + 0.22 * life; ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = big ? 20 : 14;
      ctx.beginPath(); ctx.arc(m.x, y, r, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0; ctx.globalAlpha = 0.85 * (0.6 + 0.4 * life); ctx.strokeStyle = color; ctx.lineWidth = big ? 2.4 : 1.8;
      ctx.beginPath(); ctx.arc(m.x, y, r, 0, Math.PI * 2); ctx.stroke();
      // expanding "about to pop" ring as it nears expiry
      if (life < 0.4) { ctx.globalAlpha = life * 1.6; ctx.beginPath(); ctx.arc(m.x, y, r + (0.4 - life) * 40, 0, Math.PI * 2); ctx.stroke(); }
      ctx.globalAlpha = 1; ctx.restore();
      if (BR.Sprites) BR.Sprites.draw(ctx, icon || 'flame', m.x, y, big ? 21 : 17, '#0a0e1a', false);
    }

    _glitch(ctx, brainrot, t) {
      if (brainrot < 40) return;
      const intensity = (brainrot - 40) / 60, v = this._view; ctx.save();
      for (let i = 0; i < Math.floor(intensity * 4); i++) {
        const y = (Math.sin(t * 2.3 + i * 11) * 0.5 + 0.5) * v.h;
        ctx.globalAlpha = 0.05 * intensity; ctx.fillStyle = i % 2 ? '#ff00e6' : '#00fff0'; ctx.fillRect(0, y, v.w, 2 + intensity * 3);
      }
      ctx.restore();
    }

    // Point-in-polygon over a country's projected rings (even-odd handles holes).
    _pointIn(x, y, rings) {
      let inside = false;
      for (const p of rings) for (let i = 0, j = p.length - 2; i < p.length; j = i, i += 2) {
        const xi = p[i], yi = p[i + 1], xj = p[j], yj = p[j + 1];
        if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) inside = !inside;
      }
      return inside;
    }

    // Deterministic seed points inside a region's shape, in reveal order,
    // for the infection dot bloom (bbox rejection sampling).
    _seedDots(c) {
      const rings = c.pxRings; if (!rings || !rings.length) return [];
      let mnx = 1e9, mny = 1e9, mxx = -1e9, mxy = -1e9;
      for (const p of rings) for (let i = 0; i < p.length; i += 2) { if (p[i] < mnx) mnx = p[i]; if (p[i] > mxx) mxx = p[i]; if (p[i + 1] < mny) mny = p[i + 1]; if (p[i + 1] > mxy) mxy = p[i + 1]; }
      const rnd = BR.rng(9001 + c.id * 733);
      const target = Math.round(clamp(Math.sqrt(c.pop) * 1.15, 22, 78));
      const dots = []; let tries = 0;
      while (dots.length < target && tries < target * 40) { tries++; const x = mnx + rnd() * (mxx - mnx), y = mny + rnd() * (mxy - mny); if (this._pointIn(x, y, rings)) dots.push([x, y]); }
      // Reveal from the epicenter (country marker) outward, so the rot visibly
      // creeps across the country as infection rises.
      const ex = c.px, ey = c.py;
      dots.sort((a, b) => ((a[0] - ex) ** 2 + (a[1] - ey) ** 2) - ((b[0] - ex) ** 2 + (b[1] - ey) ** 2));
      return dots;
    }

    pick(x, y, game) {
      for (const m of game.viralBubbles) if ((x - m.x) ** 2 + (y - m.y) ** 2 <= 24 * 24) return { type: 'viral', obj: m };
      for (const m of game.cureBubbles) if ((x - m.x) ** 2 + (y - m.y) ** 2 <= 24 * 24) return { type: 'cure', obj: m };
      // Marker hit (easy to tap), then the country shape itself. Keep a minimum
      // tap tolerance so the smaller mobile markers are still comfortably tappable.
      let best = null, bd = Infinity; const tol = (1 - (this._markerScale || 1)) * 18;
      for (const c of this.countries) { const d = (x - c.px) ** 2 + (y - c.py) ** 2; const rr = c.r + 7 + tol; if (d <= rr * rr && d < bd) { best = c; bd = d; } }
      if (best) return { type: 'country', obj: best };
      for (const c of this.countries) if (c.pxRings && this._pointIn(x, y, c.pxRings)) return { type: 'country', obj: c };
      return null;
    }
  }
  BR.World = World;

})(typeof window !== 'undefined' ? window : globalThis);
