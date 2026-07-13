/* =====================================================================
 * loops.js — Driftwood Loops (New Game+). The island remembers, and
 * eventually, so do you.
 *
 * Cross-run knowledge lives in localStorage 'tidebound.loops.v1':
 *   { loops, keepsake, know: {KNOW_*} }
 * Knowledge (not stuff) carries: banked at every ending or death via
 * TB.Loops.bank(), applied to fresh runs via TB.Loops.applyNew(), which
 * stamps the NGPLUS flag, copies KNOW_* flags, and applies the chosen
 * keepsake's heirloom perk. Run modifiers (s.mod) are chosen from the
 * Driftwood Loops title menu: 'hard' | 'silent' | 'kind' | 'chaos' —
 * their teeth live in engine.js (clock), scenes-extra.js (event roll),
 * and scenes-chapter1.js (the Clearing).
 * =================================================================== */
(function (G) {
  'use strict';
  const TB = G.TB;
  const KEY = 'tidebound.loops.v1';
  const L = (TB.Loops = {});

  L.data = function () {
    try { return Object.assign({ loops: 0, keepsake: null, know: {} }, JSON.parse(localStorage.getItem(KEY) || '{}')); }
    catch (e) { return { loops: 0, keepsake: null, know: {} }; }
  };
  L.saveData = function (d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} };

  // what a life leaves behind as *knowing*
  const KNOWLEDGE = [
    ['KNOW_GRIN', (s) => TB.is('GRIN_MET')],
    ['KNOW_GULLET', (s) => TB.is('GULLET_MAP') || TB.is('GULLET1')],
    ['KNOW_EDDA', (s) => TB.is('EDDA_MET')],
    ['KNOW_NINE', (s) => !!s.met.nine],
    ['KNOW_ROSA', (s) => TB.is('CHART_ROSA')],
    ['KNOW_SUNDERING', (s) => TB.is('VISION_SEEN')],
  ];

  // keepsakes — one heirloom perk, chosen at an ending, kept until replaced
  const KEEPSAKES = {
    rope: {
      name: '🪢 A coil of good rope', sub: 'Every castaway\'s first wealth. You arrive already believing in yourself.',
      avail: () => true,
      apply: (s) => { s.stats.hope = TB.clamp(s.stats.hope + 10, 0, 100); s.inv.multitool = true; },
    },
    tin: {
      name: '🩹 Edda\'s medicine tin', sub: 'Feverbark and salve, packed by hands that argued while they packed.',
      avail: (s) => TB.is('EDDA_MET'),
      apply: (s) => { s.inv.medkit = true; s.flags.SALVE = true; },
    },
    chart: {
      name: '🗺️ The gullet chart', sub: 'A dead man\'s survey and your own marks. The under-island, pre-known.',
      avail: (s) => TB.is('GULLET_MAP') || TB.is('DEEP3') || TB.is('DIVED'),
      apply: (s) => { s.flags.GULLET_MAP = true; s.route.depth += 4; },
    },
    collar: {
      name: '🐕 Bosun\'s brass collar', sub: 'First of the line, last debt paid. Dogs know it on sight — and know you.',
      avail: (s) => TB.is('Q_KAVI_DONE') || (s.companion === 'kavi' && s.trust >= 75),
      apply: (s) => { s.interest.kavi = (s.interest.kavi || 0) + 3; },
    },
    seeds: {
      name: '🌾 A jar of the old colors', sub: 'The vault\'s rice, the impossible beans. Roots that arrive before you do.',
      avail: (s) => TB.is('KAARI_SEEDS') || TB.is('FARM'),
      apply: (s) => { s.flags.SEEDS = true; s.route.roots += 4; },
    },
    lamp: {
      name: '🏮 The covenant lamp', sub: 'It has been down to the pool. Some part of you never quite comes back up.',
      avail: (s) => TB.is('TIDEWELL_KEEP') || TB.is('TIDEWELL_WITNESS'),
      apply: (s) => { s.stats.hope = TB.clamp(s.stats.hope + 6, 0, 100); s.route.depth += 3; },
    },
  };
  L.KEEPSAKES = KEEPSAKES;

  // bank a finished life (once): knowledge always; keepsake only when chosen
  L.bank = function (s, keepsakeId) {
    if (s.flags.LOOP_BANKED && !keepsakeId) return;
    const d = L.data();
    if (!s.flags.LOOP_BANKED) { d.loops += 1; s.flags.LOOP_BANKED = true; }
    for (const [k, test] of KNOWLEDGE) { try { if (test(s)) d.know[k] = true; } catch (e) {} }
    if (keepsakeId && KEEPSAKES[keepsakeId]) d.keepsake = keepsakeId;
    L.saveData(d);
  };

  // dress a fresh state in everything the loops remember
  L.applyNew = function (s) {
    const d = L.data();
    if (!d.loops) return;
    s.flags.NGPLUS = true;
    for (const k in d.know) s.flags[k] = true;
    const kp = d.keepsake && KEEPSAKES[d.keepsake];
    if (kp) { try { kp.apply(s); s.flags['KEEPSAKE_' + d.keepsake.toUpperCase()] = true; } catch (e) {} }
  };

  const fresh = (mod) => () => {
    TB.wipe(); TB.state = TB.newState();
    L.applyNew(TB.state);
    if (mod) TB.state.mod = mod;
  };

  // ---- the Driftwood Loops menu (title screen, after the first life) ------
  TB.scene('loops_menu', {
    bg: 'title', hud: false,
    text: (s) => {
      const d = L.data();
      const kp = d.keepsake && KEEPSAKES[d.keepsake];
      return [
        '<em>🌀 DRIFTWOOD LOOPS</em>',
        'The island remembers ' + d.loops + (d.loops === 1 ? ' life' : ' lives') + ' of yours. And you — in the way of dreams, and water, and songs you know before the second verse — are starting to remember it back.',
        'Knowledge carries. Names, paths, terms, the shape of the dark under the mountain — whatever you have truly learned arrives with you, humming under the skin of a stranger who has never seen this island before.' + (kp ? ' And in your pack, impossibly: <em>' + kp.name.slice(kp.name.indexOf(' ') + 1) + '</em>.' : ''),
        'Begin again — or begin again <em>differently</em>. The loops permit conditions.',
      ];
    },
    choices: (s) => [
      { t: '🌀 Begin the next loop', sub: 'Everything you know, nothing you owned. The standard crossing.', cls: 'title-btn', do: fresh(null), go: 'falling' },
      { t: '⛈️ Hard Season', sub: 'The Long Rain comes a chapter early. The island tests what you think you know.', do: fresh('hard'), go: 'falling' },
      { t: '🤫 Silent Island', sub: 'No eyes at the clearing. The solo route, enforced — the wild keeps its distance this loop.', do: fresh('silent'), go: 'falling' },
      { t: '🕯️ Kind Tide', sub: 'Story mode: the meters soften. The island tells its tale with gentler hands.', do: fresh('kind'), go: 'falling' },
      { t: '🌪️ Chaos Drift', sub: 'The living island, doubled. Events crowd the days; wonders stop being rare.', do: fresh('chaos'), go: 'falling' },
      { t: '↩️ Back', go: 'title' },
    ],
  });

  // ---- the keepsake choice, offered at every ending ------------------------
  TB.scene('keepsake', {
    bg: 'beach-dusk', hud: false,
    text: (s) => [
      '<em>🎁 THE KEEPSAKE</em>',
      'At the edge of this life, the island makes its strange NG+ arithmetic plain: nothing you own crosses the water. But one thing you <em>made true</em> — one object soaked in enough of this run to have become part of you — will find its way into the next stranger\'s pack, impossibly, and hum there.',
      'Choose what carries.',
    ],
    choices: (s) => {
      const c = Object.keys(KEEPSAKES).filter((id) => { try { return KEEPSAKES[id].avail(s); } catch (e) { return false; } })
        .map((id) => ({
          t: KEEPSAKES[id].name, sub: KEEPSAKES[id].sub,
          do: () => { L.bank(TB.state, id); TB.wipe(); TB.state = TB.newState(); }, go: 'title',
        }));
      c.push({ t: '🌊 Nothing. Let the sea have all of it.', sub: 'Knowledge still carries. Objects were never the point.',
        do: () => { L.bank(TB.state, null); TB.wipe(); TB.state = TB.newState(); }, go: 'title' });
      return c;
    },
  });

  // ---- NG+-only: the grotto journal → ending X3, THE LOOP ------------------
  TB.SCHEDULE.push({ d: 30, s: 1, id: 'ev_loop', when: (s) => !!s.flags.NGPLUS && !TB.is('LOOP_KNOWN') });
  TB.scene('ev_loop', {
    bg: 'tidepools',
    text: (s) => [
      'You find the grotto because you were sure — sure the way you are sure of your own name — that it would be behind the third fall of vines past the tide pools, and it is, and you stand in its blue-green light with your certainty curdling into something colder.',
      'There is a dry shelf above the waterline. There is a tin box on the shelf. There is a journal in the box, swollen with salt and years, and the handwriting in it is <em>yours</em>.',
      'Not similar. Yours. The loops of the g\'s, the crossed-out second thoughts, the little ledger columns you have kept since Day 1 — kept since Day 1 of <em>which life?</em> — and the last entry, dated no date, reads: <em>"The island remembers. I keep arriving. If you are reading this — and you are; I remember reading it — then listen: the seventh beat is a door closing so gently it sounds like a heart. Count the lives. Ask the pool who is counting WITH you."</em>',
      'You put the journal back, because — you understand this with the deep, terrible calm of the water finding its level — you have put it back before.',
    ],
    next: (s) => (s.chapter >= 2 ? 'camp2' : 'camp'),
    enter: (s) => { if (!TB.is('LOOP_KNOWN')) { TB.flag('LOOP_KNOWN'); TB.route('depth', 3); TB.stat('hope', -4); } },
  });
})(window);
