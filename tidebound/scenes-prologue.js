/* =====================================================================
 * scenes-prologue.js — Title, the crash, who-you-were, the sinking
 * fuselage salvage threshold, and the first night. Ends at Chapter 1.
 * Convention: all effects happen in choice `do` handlers (never in
 * `enter`), so a reloaded save can't double-apply anything.
 * =================================================================== */
(function (G) {
  'use strict';
  const TB = G.TB;

  // ---- Title ----------------------------------------------------------
  TB.scene('title', {
    bg: 'title', hud: false,
    text: (s) => {
      const t = [
        '<span class="game-title"><span class="gtWave">🌊</span> <span class="gtWord">TIDEBOUND</span></span>',
        '<span class="game-sub">a survival visual novel</span>',
        '<span class="game-sub">One island. One companion. Every choice has a price.</span>',
      ];
      // the island's ledger, worn as quiet medals — chips instead of a wall of text
      const m = TB.meta();
      if (m.runs > 0) {
        const chips = [];
        const ks = TB.Keepsakes ? TB.Keepsakes.stats() : null;
        chips.push('🌀 ' + m.runs + (m.runs === 1 ? ' life' : ' lives'));
        if (ks && ks.days) chips.push('☀️ ' + ks.days + ' island days');
        chips.push('🏁 ' + Object.keys(m.endings).length + '/' + Object.keys(TB.CORES || {}).length + ' endings');
        if (TB.Trophies) { const tc = TB.Trophies.counts(); if (tc.got) chips.push('🏆 ' + tc.got + '/' + tc.total); }
        if (ks && ks.fav) chips.push('❤️ ' + ({ kavi: 'Kavi', ipo: 'Ipo', vela: 'Vela', buri: 'Buri', moa: 'Moa', nine: 'Nine' }[ks.fav] || ks.fav));
        t.push('<span class="titleChips">' + chips.map((c) => '<span class="tChip">' + c + '</span>').join('') + '</span>');
      }
      return t;
    },
    choices: (s) => {
      const m = TB.meta();
      const list = [{
        t: m.runs > 0 ? '🛫 Begin a new life' : '🛫 Begin', cls: 'title-btn',
        do: () => { TB.wipe(); TB.state = TB.newState(); },
        go: 'falling',
      }];
      if (TB.hasSave() && TB.loadSave().scene !== 'title') {
        list.unshift({ t: '📖 Continue', cls: 'title-btn', go: () => { TB.continueGame(); return null; } });
      }
      if (TB.Loops && TB.Loops.data().loops > 0) {
        list.push({ t: '🌀 Driftwood Loops', cls: 'title-btn', go: 'loops_menu' });
      }
      if (m.runs > 0 && Object.keys(m.endings).length) {
        list.push({ t: '🏁 The ways it has ended', cls: 'title-btn title-btn-quiet', go: 'title_gallery' });
      }
      if (m.runs > 0) {
        list.push({ t: '📔 Field Almanac', cls: 'title-btn title-btn-quiet', go: () => { if (TB.Almanac) TB.Almanac.open(); return null; } });
      }
      return list;
    },
  });

  // ---- the gallery of endings (title, once any are found) -----------------
  TB.scene('title_gallery', {
    bg: 'title', hud: false,
    text: (s) => {
      const m = TB.meta();
      const found = Object.keys(m.endings);
      const total = Object.keys(TB.CORES || {}).length;
      const t = [
        '<em>🏁 THE WAYS IT HAS ENDED</em>',
        'The island keeps every ending the way the tide keeps glass: worn smooth, given back. ' + found.length + ' of ' + total + ' found.',
      ];
      if (TB.CORES) {
        t.push('<span class="titleChips titleChips-wrap">' + found
          .map((id) => (TB.CORES[id] ? '<span class="tChip tChipBtn" data-eid="' + id + '">' + TB.CORES[id].icon + ' ' + TB.CORES[id].title + '</span>' : ''))
          .filter(Boolean).join('') + '</span>');
        t.push('<span class="game-sub">Tap an ending to open its keepsake card.</span>');
        if (found.length < total) t.push('<span class="game-sub">' + (total - found.length) + ' still out there, past the reef of what you\'ve tried.</span>');
      }
      const deaths = Object.values(m.deaths || {}).reduce((a, b) => a + b, 0);
      if (deaths) t.push('<span class="game-sub">…and ' + deaths + (deaths === 1 ? ' life' : ' lives') + ' the island kept before the story was done.</span>');
      return t;
    },
    choices: [{ t: '↩️ Back', cls: 'title-btn title-btn-quiet', go: 'title' }],
  });

  // gallery chips open the matching keepsake run card (delegated through
  // #textLog, the same pattern the Wayfinder chart uses)
  document.addEventListener('click', function (ev) {
    const chip = ev.target && ev.target.closest ? ev.target.closest('.tChipBtn') : null;
    if (!chip || !TB.state || TB.state.scene !== 'title_gallery') return;
    const id = chip.dataset.eid;
    let wrap = document.getElementById('galCardWrap');
    if (!wrap) {
      wrap = document.createElement('p');
      wrap.id = 'galCardWrap';
      wrap.className = 'almCardWrap';
      const log = document.getElementById('textLog');
      if (log) log.appendChild(wrap); // engine clears textLog per scene, so it self-removes
    }
    const snap = (TB.Keepsakes ? TB.Keepsakes.list() : []).find((r) => r.endingId === id);
    if (!snap || !TB.RunCard) {
      wrap.innerHTML = '<span class="game-sub">That ending predates the Keepsake Box — its card lives only in memory. Reach it again to file one.</span>';
      return;
    }
    try {
      wrap.innerHTML = '<img class="almCardImg" alt="run card">';
      wrap.querySelector('img').src = TB.RunCard.render(snap).toDataURL();
      wrap.scrollIntoView({ block: 'nearest' });
    } catch (e) { wrap.innerHTML = ''; }
  });

  // ---- The crash --------------------------------------------------------
  TB.scene('falling', {
    bg: 'sky', hud: false,
    text: (s) => [
      'The seatbelt light comes on over the middle of nowhere.',
      'You are one of four passengers on a charter hop between islands whose names you learned yesterday. Below the wing there is ocean, and then more ocean, and then — you sit up — <em>green</em>. An island. A big one. It isn\'t on the seat-pocket map.',
      'Up front, the pilot taps the compass. Taps it again. The needle turns like it\'s looking for something it lost. The radio gives out a long, low tone that rises and falls, seven beats, like a chord hummed underwater. It does not sound like static.',
      'The engines are fine. The instruments are drunk. The plane begins, gently and unarguably, to descend.',
      TB.meta().runs > 0 ? '<em>(The seven-beat tone under the static… you know it. From somewhere. A dream, a life, a story someone told you — the thought slides away like water off a wing, and does not quite leave.)</em>' : '',
      'Someone behind you starts to pray. The man across the aisle — a quiet passenger with a battered courier case chained to his wrist — looks at the island, not the water, and says, to nobody: <em>"There you are."</em>',
      'The descent stops being gentle. In the last minute, you—',
    ].filter(Boolean),
    choices: [
      {
        t: 'Brace, and breathe, and count the seconds.',
        sub: 'Stay calm. Whatever comes, meet it with your body ready.',
        do: (s) => { TB.flag('BRACED'); TB.stat('hope', 4); },
        go: 'whowere',
      },
      {
        t: 'Help the courier — he can\'t get his case unchained.',
        sub: 'A stranger\'s trouble is still trouble.',
        do: (s) => { TB.flag('HELPED_COURIER'); TB.item('photo'); TB.stat('hope', 2); },
        go: 'falling_courier',
      },
      {
        t: 'Look out the window. Memorize everything.',
        sub: 'The shape of a bay. A river mouth. A mountain with a broken crown.',
        do: (s) => { TB.flag('SAW_ISLAND'); TB.route('depth', 1); },
        go: 'whowere',
      },
    ],
  });

  TB.scene('falling_courier', {
    bg: 'sky', hud: false,
    text: [
      'The chain won\'t give. His hands are shaking too badly for the little key; yours aren\'t much better, but between you the cuff opens on the second try.',
      'He doesn\'t thank you. He presses something into your palm — a photograph, soft at the corners, folded and refolded — and closes your fingers over it with both of his.',
      '<em>"If it\'s the same island,"</em> he says, which is not a sentence that means anything, <em>"you\'ll want to know it can be left."</em>',
      'Then the water comes up to meet the windows.',
    ],
    next: 'whowere',
  });

  // ---- Who you were -------------------------------------------------------
  TB.scene('whowere', {
    bg: 'ocean-night', hud: false,
    text: [
      'Cold. Roar. Salt. Somewhere between the impact and the dark, your life does the thing lives are said to do — but it doesn\'t flash. It settles, like sand, on one picture.',
      'Who were you, before?',
    ],
    choices: [
      {
        t: '🚑 A flight medic.',
        sub: 'Steady hands, other people\'s worst days. You keep a pocket kit even off duty. (Wounds heal faster; poor hunter.)',
        do: (s) => { s.bgnd = 'medic'; TB.item('medkit', 1); TB.flag('BG_MEDIC'); },
        go: 'ashore',
      },
      {
        t: '📷 A wildlife photographer.',
        sub: 'Patience as a profession. You read animals the way others read faces. (Animals warm to you faster; clumsy hands.)',
        do: (s) => { s.bgnd = 'photog'; TB.item('camera'); TB.flag('BG_PHOTOG'); },
        go: 'ashore',
      },
      {
        t: '🔪 A line cook.',
        sub: 'Twelve years of heat and knives. You can make anything edible. (Better meals, iron stomach; the crash hit your spirits hardest.)',
        do: (s) => { s.bgnd = 'cook'; TB.item('knife'); TB.stat('hope', -8); TB.flag('BG_COOK'); },
        go: 'ashore',
      },
      {
        t: '⚙️ A marine engineer.',
        sub: 'If it\'s broken, it\'s a puzzle. You were flying home from a rig. (Building and fire come easier; you get lost on land.)',
        do: (s) => { s.bgnd = 'engineer'; TB.item('multitool'); TB.flag('BG_ENGINEER'); },
        go: 'ashore',
      },
    ],
  });

  // ---- Ashore -----------------------------------------------------------
  TB.scene('ashore', {
    bg: 'beach-dusk',
    enter: (s) => { s.hudOn = true; },
    text: (s) => {
      const hurt = TB.is('BRACED')
        ? 'You ache everywhere, but everything answers when you call it. Bracing saved you the worst.'
        : 'Your ribs light up when you cough. Nothing broken — probably — but the sea did not handle you kindly.';
      return [
        'You wake with your cheek in wet sand and your legs still in the ocean, being pulled at, patiently, like the water hasn\'t decided whether to keep you.',
        hurt,
        'The beach is long and white and utterly empty. Behind it, jungle rises in green terraces toward a mountain with a broken crown' + (TB.is('SAW_ISLAND') ? ' — the one you memorized from the air. You know, roughly, the shape of this island. That already feels like wealth.' : '.'),
        'Of the plane, the pilot, the praying woman, the courier — there is a floating seat cushion, a slick of fuel rainbowing the shallows, and silence.',
        'You have a working lighter in one zipped pocket' + (TB.has('photo') ? ', a stranger\'s photograph in the other,' : '') + ' and the clothes you nearly died in.',
        'Out on the reef, caught on the coral shelf like a moth on a pin, is the broken rear half of the fuselage. It is visibly, slowly, going under.',
      ];
    },
    next: 'salvage',
    nextLabel: 'Wade out to the wreck ➤',
  });

  // ---- Salvage threshold: take two of five ---------------------------------
  const BUNDLES = {
    flaregun: { t: '🔫 The flare gun', sub: 'One flare. One argument with the horizon. You will only get to make it once.' },
    medkit: { t: '🩹 The first-aid kit', sub: 'Bandages, antiseptic, painkillers. Three real treatments between you and infection.' },
    toolbox: { t: '🧰 The pilot\'s toolbox', sub: 'Pliers, saw blade, wire, tape. Every camp job gets easier; some become possible.' },
    rations: { t: '🥫 Rations and a tarpaulin', sub: 'Four tinned meals and a sheet of sky-proof plastic. The gentlest first week on offer.' },
    case: { t: '💼 The courier\'s case', sub: 'Locked. Heavy. Chained to nothing now. You have no idea what\'s in it, and it isn\'t food.' },
  };
  function bundleChoices(s, second) {
    return Object.keys(BUNDLES).filter((k) => !s.flags['SALV_' + k]).map((k) => ({
      t: BUNDLES[k].t, sub: BUNDLES[k].sub,
      do: () => {
        TB.flag('SALV_' + k);
        if (k === 'rations') { TB.item('rations', 4); TB.item('tarp'); }
        else if (k === 'medkit') { TB.item('medkit', 3); }
        else { TB.item(k); }
        if (k === 'case') TB.route('depth', 1);
      },
      go: second ? 'night0' : 'salvage2',
    }));
  }
  TB.scene('salvage', {
    bg: 'beach-dusk',
    text: [
      'The water over the reef is chest-deep and losing its light. The fuselage groans on the coral with every swell, a sound like a door asking to be closed.',
      'Inside, in the cold tilting dark, you find what the ocean hasn\'t claimed: five things worth carrying. The hull shifts under your feet. The math is brutal and simple — <em>two trips\' worth of arms, no third trip.</em>',
      'You take—',
    ],
    choices: (s) => bundleChoices(s, false),
  });
  TB.scene('salvage2', {
    bg: 'beach-dusk',
    text: [
      'One bundle safe above the tideline. The fuselage is lower in the water already; the swell breaks over the doorway now, insistent.',
      'One more. Choose.',
    ],
    choices: (s) => bundleChoices(s, true),
  });

  // ---- First night ---------------------------------------------------------
  TB.scene('night0', {
    bg: 'beach-night',
    text: (s) => [
      'By the time you\'re ashore with the second load, the reef holds nothing but reef. The fuselage is gone as completely as if you\'d imagined it. Day one of — something — ends with you shivering above the tideline, too tired to be afraid properly.',
      'Then the lagoon begins to glow.',
      'Soft blue-green light blooms in the water, in slow pulses — seven beats, rising and falling. The same rhythm the radio drowned in. You watch the whole bay breathe light like something enormous is sleeping under it, and despite everything — the cold, the dead, the distance from every mapped thing — it is the most beautiful thing you have ever seen.',
      TB.is('HELPED_COURIER')
        ? 'You think of the courier\'s photograph in your pocket. <em>If it\'s the same island.</em> You are starting to suspect it is.'
        : 'The compass on your zipper pull turns, slowly, all the way around, pointing at everything. Fine, you think. I\'ll find my own north.',
    ],
    choices: [
      {
        t: 'Watch the water until sleep takes you.',
        sub: 'Beauty is also a resource.',
        do: (s) => { TB.stat('hope', 6); TB.route('depth', 1); TB.flag('COMPASS_SPINS'); s.day = 1; s.seg = 0; TB.stat('energy', 15); },
        go: 'ch1_open',
      },
      {
        t: 'Turn your back on it and sleep. Tomorrow is a working day.',
        sub: 'Wonder doesn\'t boil water.',
        do: (s) => { TB.route('roots', 1); TB.flag('COMPASS_SPINS'); s.day = 1; s.seg = 0; TB.stat('energy', 22); },
        go: 'ch1_open',
      },
    ],
  });

  // ---- THE STORY SO FAR — one recap screen when a save is continued -------
  const CH_NAMES = { 1: 'The First Fire', 2: 'Foothold', 3: 'The Green Deep', 4: 'The Hum', 5: 'The Long Rain', 6: 'Ashes and Stairs', 7: 'Convergence' };
  const COMP_RECAP = {
    kavi: 'Kavi 🐕 — the storm-grey dog who chose your fire', ipo: 'Ipo 🐒 — the thief who pays in kind',
    vela: 'Vela 🦅 — the one-eyed empress of Kestrel Cliffs', buri: 'Buri 🐗 — a warm boulder with opinions',
    moa: 'Moa 🐔 — the bravest heart on the island', nine: 'Nine 🐙 — the tide pools\' oldest question',
  };
  const RECAP_DEEDS = {
    EDDA_MET: 'you found the hermit of the mountain', RYO_MET: 'you salvaged a sailor and his boat',
    INNER_GREEN: 'the hidden town opened its door', CONTACT_MADE: 'a living voice answered the radio',
    CASE_OPEN: 'the courier\'s case gave up its answer', ROSA_DONE: 'you dove a dead ship for its gold',
    KING_ALLY: 'the Boar King holds your treaty', GRIN_ESCORTED: 'Old Grin\'s toll stands paid',
    VISION_SEEN: 'the temple showed you the Sundering', HEARTGLASS: 'you carried heart-glass out of the deep',
    TIDEWELL_KEEP: 'you took the covenant at the pool', OTHER_HEARD: 'the nine-beat station spoke',
    HOME_NAMED: 'your camp earned a name', FLOCK: 'one brave hen became a flock',
    HATCHLING: 'you saved the high nest\'s egg', KAARI_SEEDS: 'the old colors grow in your rows',
  };
  TB.scene('recap', {
    bg: (s) => (s.chapter >= 2 ? 'camp-fringe' : 'beach-day'),
    text: (s) => {
      const t = ['<em>THE STORY SO FAR</em>',
        'Day ' + s.day + ' on Vessakai — Chapter ' + s.chapter + ', <em>' + (CH_NAMES[s.chapter] || 'the island') + '</em>.'];
      t.push(s.companion ? 'At your side: ' + COMP_RECAP[s.companion] + '.' : 'You walk the solo route — you, the island, and whatever watches from the treeline.');
      const deeds = Object.keys(s.flags).filter((f) => RECAP_DEEDS[f]).slice(-3).map((f) => RECAP_DEEDS[f]);
      if (deeds.length) t.push('The Ledger\'s freshest ink: ' + deeds.join('; ') + '.');
      const st = s.stats;
      const low = Object.keys(st).reduce((a, b) => (st[a] <= st[b] ? a : b));
      if (st[low] <= 40) t.push('And your body files one report before anything else: ' + ({ health: 'you are hurt, and pretending otherwise', hunger: 'you are hungry enough to be stupid about it', thirst: 'you need water more than you need plans', energy: 'you are running on fumes and stubbornness', hope: 'the gray weather is inside you today' }[low]) + '.');
      t.push('The fire is where you left it. The island kept your place.');
      return t;
    },
    nextLabel: '⛵ Back to the island ➤',
    next: (s) => { const r = s._resume || 'camp'; delete s._resume; return r; },
  });
})(window);
