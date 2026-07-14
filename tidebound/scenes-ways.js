/* =====================================================================
 * scenes-ways.js — THE WAYS IT ENDS: content for the last designed
 * endings. The egg-ledge on Kestrel Cliffs (THE FALL lives here — a
 * warned gamble, never RNG), and the Kaari fire-tower restoration
 * (three work stages → TOWER_BUILT → the LIGHTKEEPER ending at the
 * Convergence). The cliffs expeditions that route here live in map.js;
 * the death cards live in ch1's death scene; the convergence doors and
 * CORES live in ch7.
 * =================================================================== */
(function (G) {
  'use strict';
  const TB = G.TB;
  const backTo = (s) => (s.chapter >= 2 ? 'camp2' : 'camp');

  // ---- the egg-ledge: honest terms, published in stone -----------------------
  TB.scene('cliff_ledge', {
    bg: 'cliff-camp',
    text: (s) => [
      'And there, forty sheer meters above the boil, you find the cliff\'s one secret worth a life: an egg-ledge. A dozen seabird nests crowded onto a guano-white shelf, fat with eggs — a week of breakfasts, a feast of protein, the single richest cache of food you have seen since the wreck.',
      'The route to it is published in the stone, honest as the sea: a traverse on slick handholds, a bulge to shoulder past, wind-shear that comes in fists. The cliff is not hiding anything. The cliff never does.',
      (s.stats.energy < 30 ? 'Your arms, after the day you\'ve already spent, are a rumor. You know exactly how much is left in them, if you let yourself know it.' : s.chapter === 5 ? 'The monsoon has every hold running like a gutter. Even the birds are landing twice.' : 'You\'re fresh enough, and the rock is dry. It would still be the boldest climb of your hundred days.'),
    ],
    choices: (s) => {
      const risky = s.stats.energy < 30 || s.chapter === 5;
      return [
        { t: '🥚 Climb for the cache.', sub: risky ? '⚠️ ' + (s.stats.energy < 30 ? 'On spent arms.' : 'On monsoon-wet rock.') + ' The cliff has published its terms all the way down.' : 'Bold, honest work. The richest single haul on the coast.',
          do: () => {
            const s2 = TB.state;
            if (s2.stats.energy < 30 || s2.chapter === 5) { s2.deathCause = 'fall'; return; }
            TB.flag('CLIFF_LEDGE'); TB.stat('hunger', 22); TB.stat('hope', 6); TB.route('depth', 1);
            s2.food = (s2.food || 0) + 2;
            s2.out = { bg: 'cliff-camp', text: ['You climb it the way the island has taught you to do everything: slowly, honestly, three points on the rock and no lies to yourself about the fourth. The wind tries you twice. The bulge costs you a fingernail. And then you are on the shelf among the outraged citizenry, filling your wrap with eggs while the colony files formal complaints from the air.', 'You leave every nest one egg — the island\'s arithmetic, learned deep — and downclimb into the day\'s last gold feeling ten feet tall and made of luck you EARNED. Egg-cache: found, mapped, and yours each season. The cliffs pay the attentive, and the cliffs bury the proud, and today you were exactly attentive enough.'] };
            TB.tickSegment();
          },
          go: (s2) => (TB.state.deathCause ? 'death' : 'act_result') },
        { t: '🧗 Mark it, and come back strong and dry.', sub: 'The eggs will keep. So, this way, will you.',
          do: () => { TB.flag('CLIFF_LEDGE'); TB.flag('LEDGE_MARKED'); TB.route('roots', 1); TB.stat('hope', 2);
            TB.state.out = { bg: 'cliff-camp', text: ['You build a small cairn at the traverse-start, memorize the line the way you\'d memorize a debt, and walk away from the richest food on the coast — which is, you understand now, the single most island-taught thing you have ever done. The eggs will keep. The cliff isn\'t going anywhere. And neither, this way, are you.'] };
            TB.tickSegment(); },
          go: 'act_result' },
      ];
    },
  });

  // ---- the fire-tower: three honest days of work ------------------------------
  const TOWER_STAGES = [
    ['You give the tower its first day: clearing the spiral stair hand over hand — nettle, bird-bone, four hundred years of wind-blown soil — and re-seating the tumbled crown course stone by stone, dry-fit, the way the Kaari masons left instructions for in the very shapes of the blocks. By dusk the bowl stands clean and true against the sky, and the wind moves through the tower like something waking up.', 'One more day for the lens-work. One more after that for the oil and the proving. The tower has waited four hundred years; it can wait two more days.'],
    ['Day two is the light itself: the fire-bowl\'s old genius revealed under the soot — a curved back-wall of fitted reef-glass, salvage-polished, that throws the flame\'s light seaward in a fan. Half its facets are wind-cracked. You spend the day cutting and setting replacements: reef-glass, bottle-glass, the mirror-shard from camp, every bright thing the island ever handed you, fitted into a four-century-old design that accepts them all like it was expecting them.', 'At sunset you strike a test-flame in the bowl, one handful of tinder only — and the fan of light leaps off the water so far and so true that you laugh out loud, alone, on top of a tower, at the top of the coast.'],
    ['The last day is fuel and proof: rendered oil and hard palm-char laid in the keeping-lockers the stair was hiding all along, a rain-cap rigged over the bowl, and then, at full dark, the real thing — the fire-bowl lit whole for the first time since the Sundering.', 'The light goes out over the sea like a road. And the island answers: the lagoon\'s seven-beat glow shifts — you would swear it — a half-shade brighter, and somewhere on the mountain a second light kindles briefly, once, and is gone. Acknowledged. Logged. <em>Welcomed back.</em>', 'The Kaari built this tower so the island\'s own could find their way home through the veil. It is lit again. Whoever the sea is carrying tonight — the light is on.'],
  ];
  const prevActs = TB.ch3Actions;
  TB.ch3Actions = function (s) {
    const c = prevActs ? prevActs(s) : [];
    if (TB.is('TOWER_FOUND') && !TB.is('TOWER_BUILT')) {
      const st = s.tower | 0;
      c.push({
        t: '🗼 Work on the fire-tower' + (st ? ' (day ' + (st + 1) + ' of 3)' : ''),
        sub: st === 0 ? 'Clear the stair; re-seat the crown. The bowl is intact — somebody could keep this light again.' : st === 1 ? 'The lens-work: reef-glass and every bright thing you own, into a four-century-old design.' : 'Oil, char, rain-cap — and the first true lighting since the Sundering.',
        do: () => {
          const s2 = TB.state;
          s2.tower = (s2.tower | 0) + 1;
          TB.stat('energy', -10); TB.route('signal', 1); TB.stat('hope', 4);
          if (s2.tower >= 3) { TB.flag('TOWER_BUILT'); TB.stat('hope', 4); TB.route('roots', 1); }
          s2.out = { bg: 'cliff-camp', text: TOWER_STAGES[Math.min(s2.tower - 1, 2)] };
          TB.tickSegment();
        },
        go: 'act_result',
      });
    }
    return c;
  };
})(window);
