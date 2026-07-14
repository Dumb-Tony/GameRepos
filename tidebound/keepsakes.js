/* =====================================================================
 * keepsakes.js — THE KEEPSAKE BOX. Every finished life leaves a card.
 * A slim state snapshot is stored at recordEnd time (once per run,
 * BOX_RECORDED guard) in 'tidebound.box.v1' (newest first, capped 24).
 * The almanac's 📜 Keepsakes tab lists them; tapping a row re-renders
 * the ACTUAL run card from the snapshot via TB.RunCard.render.
 * =================================================================== */
(function (G) {
  'use strict';
  const TB = G.TB;
  const KS = (TB.Keepsakes = {});
  const KEY = 'tidebound.box.v1';

  KS.list = function () { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; } };
  const save = (l) => { try { localStorage.setItem(KEY, JSON.stringify(l)); } catch (e) {} };

  const prevRecord = TB.recordEnd;
  TB.recordEnd = function (kind, id) {
    const s = TB.state;
    const fresh = s && !s.flags.BOX_RECORDED;
    prevRecord(kind, id);
    if (!fresh) return;
    s.flags.BOX_RECORDED = true;
    const snap = {
      day: s.day, chapter: s.chapter, endingId: s.endingId || null, deathCause: s.deathCause || null,
      companion: s.companion, trust: s.trust, route: s.route, stats: s.stats, nuts: s.nuts || 0,
      flags: Object.assign({}, s.flags),
      when: new Date().toLocaleDateString([], { month: 'short', day: 'numeric' }),
    };
    const l = KS.list();
    l.unshift(snap);
    if (l.length > 24) l.length = 24;
    save(l);
  };

  KS.stats = function () {
    const l = KS.list();
    const days = l.reduce((a, r) => a + (r.day || 0), 0);
    const comps = {};
    for (const r of l) if (r.companion) comps[r.companion] = (comps[r.companion] || 0) + 1;
    const fav = Object.keys(comps).sort((a, b) => comps[b] - comps[a])[0] || null;
    return { lives: l.length, days, fav };
  };
})(window);
