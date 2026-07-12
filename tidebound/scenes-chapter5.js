/* =====================================================================
 * scenes-chapter5.js — Chapter Five: The Long Rain (Days 22–28).
 * The monsoon crucible. The player commits the season to one master
 * plan — THE COUNTDOWN (sea), THE HOMESTEAD (roots), or THE DESCENT
 * (depth) — and the chapter's spine events (d23/25/27) and finale
 * (d28) run that variant, over shared monsoon survival, the cyclone
 * night, and Edda's failing season.
 * =================================================================== */
(function (G) {
  'use strict';
  const TB = G.TB;
  const R = Math.random;

  const NAMES = { kavi: 'Kavi', ipo: 'Ipo', vela: 'Vela', buri: 'Buri', moa: 'Moa', nine: 'Nine' };
  const EDDA = { emoji: '👵', name: 'Edda Voss', art: 'char-edda' };
  const RYO = { emoji: '⛵', name: 'Ryo Nakata', art: 'char-ryo' };
  const NAIA = { emoji: '🌿', name: 'The watcher', art: 'char-naia' };
  const BOAR_KING = { emoji: '🐗', name: 'The Boar King', art: 'char-boarking' };

  function campBg2(s) {
    if (s.site === 'fringe') return 'camp-fringe';
    if (s.site === 'overhang') return 'cliff-camp';
    return s.seg === 2 ? 'beach-dusk' : 'beach-day';
  }
  const plan = () => TB.state.plan;

  // ---- Chapter open: the season's master plan ------------------------------------------
  TB.scene('ch5_open', {
    bg: 'beach-dusk',
    enter: (s) => { if (s.chapter < 5) { s.chapter = 5; s.day = 22; s.seg = 0; } },
    text: (s) => [
      '<em>CHAPTER FIVE — THE LONG RAIN</em>',
      'It arrives on the twenty-second day, not as a storm but as a <em>change of government</em>: the southern wall walks ashore at dawn and the sky becomes a low grey ceiling that has no further interest in negotiation. Rain — warm, vertical, endless — becomes the medium you live in. The lagoon\'s glow blurs to a haze. Thunder moves in upstairs, permanently, like bad neighbors.',
      'Edda\'s verdict, shouted cheerfully over the drumming when you last saw her: <em>"Eight weeks of this, castaway, give or take the mountain\'s mood. The rain solves your water and rots everything else. Whatever you meant to do with your season — you do it IN this, or not at all."</em>',
      'She\'s right, and you feel it: the monsoon is a crucible, and a crucible only shapes what commits. Your hands, your hours, your allies\' strength — one master plan gets them. The Ledger\'s tally so far — Signal ' + s.route.signal + ' · Roots ' + s.route.roots + ' · Depth ' + s.route.depth + ' — leans where it leans. The choice is still yours.',
    ],
    choices: (s) => [
      { t: '⛵ THE COUNTDOWN — the season bends toward leaving.', sub: (TB.is('RADIO_STAGED') ? 'The radio is staged for assembly. ' : '') + (TB.is('RYO_MET') ? 'Ryo and the Kingfisher are willing. ' : '') + 'Voice, vessel, horizon: build the way out.',
        do: () => { TB.state.plan = 'sea'; TB.route('signal', 2); TB.flag('CH5_SEA'); TB.tickSegment(); }, go: 'ch5_committed' },
      { t: '🏡 THE HOMESTEAD — the season bends toward staying.', sub: (TB.is('SEEDS') ? 'Halcyon\'s seed cabinet waits. ' : '') + (TB.is('GLYPH2') ? 'The old Kaari terraces remember farming. ' : '') + 'Farm, granary, hearth: build the life.',
        do: () => { TB.state.plan = 'home'; TB.route('roots', 2); TB.flag('CH5_HOME'); TB.tickSegment(); }, go: 'ch5_committed' },
      { t: '🌀 THE DESCENT — the season bends toward the answer.', sub: (TB.is('GULLET_MAP') ? 'Vane\'s map names the throat. ' : TB.is('DRILL_ROAD') ? 'Vela\'s road points at the bore site. ' : 'You\'d be going in on courage and tide-math alone. ') + 'The skipping pulse has a source. Find it.',
        do: () => { TB.state.plan = 'deep'; TB.route('depth', 2); TB.flag('CH5_DEEP'); TB.tickSegment(); }, go: 'ch5_committed' },
    ],
  });
  TB.scene('ch5_committed', {
    bg: campBg2,
    text: (s) => [
      s.plan === 'sea' ? 'The Countdown, then. You say it out loud to the rain, and the rain applauds without opinion. Every dry hour this season now has an owner: the voice, the vessel, the way out.' :
      s.plan === 'home' ? 'The Homestead, then. You say it to the rain, and the saying changes the rain: it stops being a siege and becomes, at a stroke, <em>irrigation</em>. Every wet hour this season now has an owner: the ground, and what you\'ll raise from it.' :
      'The Descent, then. You say it quietly, and the thunder upstairs rolls over once like something turning in its sleep. Every surge-lull this season now has an owner: the throat under the mountain, and the wound that\'s skipping.',
      'The Long Rain has your answer. Now it gets to test it.',
    ],
    next: (s) => TB.advance(),
    nextLabel: 'Into the season ➤',
  });

  // ---- Chapter 5 scheduled events -------------------------------------------------------
  TB.SCHEDULE.push(
    { d: 23, s: 2, id: 'ev5_sea1', when: (s) => s.plan === 'sea' },
    { d: 23, s: 2, id: 'ev5_home1', when: (s) => s.plan === 'home' },
    { d: 23, s: 2, id: 'ev5_deep1', when: (s) => s.plan === 'deep' },
    { d: 24, s: 3, id: 'ev5_cyclone' },
    { d: 25, s: 1, id: 'ev5_sea2', when: (s) => s.plan === 'sea' },
    { d: 25, s: 1, id: 'ev5_home2', when: (s) => s.plan === 'home' },
    { d: 25, s: 1, id: 'ev5_deep2', when: (s) => s.plan === 'deep' },
    { d: 26, s: 0, id: 'ev5_edda' },
    { d: 27, s: 2, id: 'ev5_sea3', when: (s) => s.plan === 'sea' },
    { d: 27, s: 2, id: 'ev5_home3', when: (s) => s.plan === 'home' },
    { d: 27, s: 2, id: 'ev5_deep3', when: (s) => s.plan === 'deep' },
    { d: 28, s: 2, id: 'ch5_finale' },
  );

  // ==================================================================
  //  VARIANT A — THE COUNTDOWN
  // ==================================================================
  TB.scene('ev5_sea1', {
    bg: (s) => (TB.is('RADIO_STAGED') ? 'station' : 'beach-day'),
    text: (s) => TB.is('RADIO_STAGED') ? [
      'Assembly day. You cross at the cold hour with everything dry wrapped twice, and give the radio room the longest, most careful day of work you\'ve done since the crash: transmitter seated and torqued, cable dressed and soldered' + (TB.is('RADIO_PARTS_BONUS') ? ' (Ipo\'s looted fuses and tubes filling gaps you didn\'t know the list had)' : '') + ', the generator fed its filtered fifty-year diesel and coaxed, coughing, shuddering, <em>running</em>.',
      'At dusk you flip the main bus, and the console — dead since the year of the interrupted breakfast — lights amber and hums.',
      'And that\'s the problem. Everything hums. You put on the operator\'s phones and sweep the bands and hear the island\'s field lying over every frequency like deep water: the seven-beat chorus, vast and total, drowning your little transmitter\'s voice in its own. You broadcast anyway, an hour of it. It\'s like shouting into the sea.',
      TB.is('PULSE2') || TB.is('RECORDER') ? 'But walking home along the loud dark shore, the thought arrives with the force of a shove: <em>the pulse skips now.</em> You\'ve heard it. You\'ve inked it on the drum. For those held black seconds, the island\'s voice stops — and a window with nothing in it will carry ANY voice. You stop dead in the rain, doing the beautiful arithmetic. You don\'t need to out-shout the Hum. You need to speak in its rests.' : 'You walk home through the loud dark with the failure riding your shoulders, missing something — you can feel it, a thought that won\'t finish. The sea drums. The lagoon pulses its seven beats through the haze. Somewhere in that rhythm is a thing you know and haven\'t noticed you know.',
    ] : [
      'No station radio for this plan — the sea path you\'ve chosen runs on hull and canvas. You give the day to the vessel: ' + (TB.is('RYO_MET') ? 'the Kingfisher\'s last two strakes, her fished mast, her patched suit of sails, Ryo working opposite you plank for plank with the monsoon drumming the upturned hull like impatience.' : 'the raft — your raft, the third and by far the least embarrassing of your designs — lashed frame, sealed floats, a mast you can step alone, a steering oar you\'ve learned to trust.'),
      'By dark the shape under the tarps is unmistakably a going-somewhere shape. The rain drums on it. You lie awake listening, doing sums about weather windows.',
    ],
    enter: (s) => { if (!TB.is('SEA1')) { TB.flag('SEA1'); if (TB.is('RADIO_STAGED')) { TB.flag('RADIO_DONE'); if (TB.is('PULSE2') || TB.is('RECORDER')) TB.flag('WINDOW_PLAN'); } else { TB.flag('BOAT_PUSH'); } TB.route('signal', 2); TB.stat('energy', -8); } },
    next: (s) => 'camp2',
  });

  TB.scene('ev5_sea2', {
    bg: 'beach-day', who: (s) => (TB.is('RYO_MET') ? RYO : null),
    text: (s) => [
      TB.is('RYO_MET')
        ? 'The Kingfisher swims on the twenty-fifth day. You and Ryo walk her down the rollers into the lagoon between squalls and she takes the water like an apology accepted — low, patched, graceless, and <em>floating</em>, bailing-bucket dry through a full hour of sea trial inside the reef.'
        : 'The raft swims on the twenty-fifth day. You walk her down the rollers between squalls and pole out into the lagoon, and she carries you — you, your weight, your gear-weight, a deliberate soaking capsize test and remount — through a full hour of trial inside the reef.',
      TB.is('RYO_MET') ? 'Ryo brings her about at the reef gate and holds there a moment, bow to the open sea, canvas trembling, and you watch him look at the horizon the way the starving look at bread. "After the rains," he says — steady, a promise to the boat as much as you. "First fair window. She\'ll be ready. Will—" and he doesn\'t finish it, again, and the question stands in the cockpit between you like a third sailor.' : 'At the reef gate you hold a moment, bow to the open sea, and let yourself feel the full size of what a working vessel means: that door out there is no longer locked. Only closed, and weathered, and yours to choose.',
      'The monsoon slams the window shut within the hour, of course. But the sea trial holds in your chest all day, bright as the flare you did or didn\'t fire: <em>it can be done.</em>',
    ],
    enter: (s) => { if (!TB.is('SEA2')) { TB.flag('SEA2'); TB.flag('VESSEL_READY'); TB.route('signal', 2); if (TB.is('RYO_MET')) TB.state.ryo = TB.clamp(TB.state.ryo + 6, 0, 100); TB.stat('hope', 6); } },
    next: (s) => 'camp2',
  });

  TB.scene('ev5_sea3', {
    bg: (s) => (TB.is('RADIO_DONE') ? 'station' : 'beach-night'),
    text: (s) => {
      if (TB.is('RADIO_DONE')) return [
        'The twenty-seventh night, you keep vigil at the radio with a flask of Edda\'s tea and the chart recorder\'s drum turning beside you like a patient heart' + (TB.is('WINDOW_PLAN') ? ', waiting for the skip.' : ', still hunting the thought you can\'t finish — until, past midnight, watching the needle draw its seventh tooth, it finishes itself: <em>the skips. Speak in the rests.</em>'),
        'At 2:14 the needle drops flat.',
        'You key the transmitter into dead air — <em>"MAYDAY MAYDAY MAYDAY, this is survivor of downed aircraft, island position unknown, at least two souls, DO YOU COPY"</em> — once, twice, the black window standing open around your voice like held breath—',
        '—and the phones crackle, distant as another life, human as a heartbeat: <em>"—station calling MAYDAY, copy you broken, say again your posi—"</em>',
        'The seventh beat slams back down over everything. The window closes. The Hum rolls on, vast and total, and you sit in the amber light with your pulse everywhere, having heard — for four seconds, for the first time in twenty-seven days — <em>the world</em>.',
        'They copied. Broken, but they copied. Someone, somewhere, has a bearing on a ghost — and every skip from now on is a door you know how to knock through.',
      ];
      return [
        'The twenty-seventh day you provision like a navigator: water in every vessel, smoked stores wrapped and wrapped again, the sea-anchor rigged, Edda\'s hand-drawn current notes (she\'d pressed them on you with insults) sealed in wax against the chart-lack.',
        'And at dusk, between squalls, the sea sends its answer to your season of work: far out, hull-down on the streaming horizon, running lights — a ship, real, the first since the flare-light of Day 3 — crossing south to north, oblivious, <em>there</em>.',
        'You stand in the rain and watch it the whole way across, and this time it doesn\'t hollow you out. This time you have a vessel above the tideline and trial-hours in her log, and the sight files itself not as grief but as <em>traffic report</em>: the lane is out there. The lane is reachable. After the rains.',
      ];
    },
    enter: (s) => { if (!TB.is('SEA3')) { TB.flag('SEA3'); if (TB.is('RADIO_DONE')) { TB.flag('CONTACT_MADE'); TB.route('signal', 3); TB.stat('hope', 10); } else { TB.flag('LANE_SEEN'); TB.route('signal', 2); TB.stat('hope', 5); } } },
    next: (s) => 'camp2',
  });

  // ==================================================================
  //  VARIANT B — THE HOMESTEAD
  // ==================================================================
  TB.scene('ev5_home1', {
    bg: (s) => (TB.is('GLYPH2') ? 'jungle' : 'camp-fringe'),
    text: (s) => [
      'Planting day. You choose your ground the way the season taught you: ' + (TB.is('GLYPH2') ? 'the old Kaari terrace, cleared back to its dry-laid wall — ground that was a farm before your language existed, drained and leveled by hands that knew this exact rain.' : 'the high fringe flat behind camp, ditched and mounded against the wet.'),
      TB.is('SEEDS') ? 'Halcyon\'s seed cabinet gives up its dead and its living: half the foil packets are dust, but the heavy-foil rice runs a sprout test at nearly full strength, the beans wake up angry, and Moa\'s feral tomatoes transplant like they\'ve been waiting fifty years for staff.' : 'Your stock is the island\'s own: taro crowns from the river margins, yam vines, seagrape cuttings, the breadfruit saplings you\'ve been nursing — wild things half-tamed, like everything else you love here.',
      s.companion === 'buri' ? 'Buri plows. There is no other verb: harnessed to nothing but enthusiasm, he opens your rows in dark wet ribbons, and by dusk the plot looks professional and he looks like a delighted landslide.' : s.companion === 'moa' ? 'Moa works the turned rows behind you all day like a tiny inspector-general, executing grubs, and by dusk has eaten approximately her own weight in future crop failures.' : '',
      'By dark it\'s in the ground — all of it, everything you have to bet, planted into the loudest, wettest, most generous season the sky owns. Farming, you realize, standing soaked and filthy in the last light, is just hope with drainage.',
    ].filter(Boolean),
    enter: (s) => { if (!TB.is('HOME1')) { TB.flag('HOME1'); TB.flag('FARM'); TB.route('roots', 3); TB.stat('energy', -12); TB.stat('hope', 6); } },
    next: (s) => 'camp2',
  });

  TB.scene('ev5_home2', {
    bg: 'river',
    text: (s) => [
      'On the twenty-fifth day the Silverthread stands up.',
      'You hear it change in the night — the voice dropping an octave — and by grey dawn the river is twice itself, tea-brown and muscled, eating its banks in slabs. And it is reaching, with the season\'s first real malice, for everything you\'ve built downslope of it.',
      'You have one streaming morning to answer.',
    ],
    choices: (s) => [
      { t: '🛡️ Dike the farm — trench and mound the upslope line, hold the ground.', sub: (TB.is('TRAILER') ? 'Buri\'s trailer hauls fill like a dream. ' : '') + 'Brutal hours. The crop is the season.',
        do: () => { const s2 = TB.state; TB.flag('FLOOD_DIKED'); TB.stat('energy', -16); TB.route('roots', 2);
          s2.out = { bg: 'river', text: ['You dike. Hours of it, mud to the thighs, ' + (TB.is('RYO_MET') && s2.ryo >= 40 ? 'Ryo opposite you matching you shovel for shovel and singing something filthy in three languages, ' : '') + (s2.companion === 'buri' ? 'Buri compacting each lift with joyful violence, ' : '') + 'the river arriving even as you work — and the line <em>holds</em>. Brown water noses along your trench, sulks, and takes the old channel instead.', 'You stand on the mound at dusk, destroyed and victorious, watching your rows drink the flood\'s edges from behind their wall. The homestead just paid its first real tax and kept its first real ground.'] };
          TB.tickSegment(); }, go: 'act_result' },
      { t: '📦 Save the stores first — the granary, the tools, the seed reserve.', sub: 'The crop can be regrown from what you hold back. Nothing regrows the granary.',
        do: () => { const s2 = TB.state; TB.flag('FLOOD_STORES'); TB.stat('energy', -12);
          s2.out = { bg: 'river', text: ['You make the cold call: the stores. Everything portable goes up — the seed reserve, the smoked cache, the tools, load after streaming load to the high ground — while the river takes its bite of the low rows and chews.', 'By dusk the flood crests and falls short of ruin: a third of the planting drowned, the rest silt-fed and, Edda will tell you later, better for it. Your reserve is dry to the last packet. You lost a battle to armor the war, and you\'d do it again.'] };
          TB.tickSegment(); }, go: 'act_result' },
    ],
    enter: (s) => { if (!TB.is('HOME2')) TB.flag('HOME2'); },
  });

  TB.scene('ev5_home3', {
    bg: 'camp-fringe', who: BOAR_KING,
    text: (s) => {
      const t = ['On the twenty-seventh dusk, the Boar King comes to the homestead — and this time is not like the other times.',
        'He comes slow. He comes <em>light</em> — the monsoon has stripped him; the scar-plated bulk hangs on him now like borrowed armor, and the small furious eyes have gone hollow at the rims. The flood has drowned the tuber flats; the mast crop rotted early; the inland is starving its king.',
        'He stops at your boundary — at the exact line of it, which he has never once honored before — and stands in the rain, swaying slightly, watching your fire and your fat granary. Not raiding. <em>Standing.</em> Asking, in the only grammar a king has left when the kingdom fails.'];
      return t;
    },
    choices: (s) => [
      { t: '🍠 Feed him. Openly, largely, from the winter stores.', sub: 'It will cost real reserve. Some debts run ahead of reason.',
        do: () => { const s2 = TB.state; TB.flag('KING_FED'); TB.flag('KING_ALLY'); if (s2.food > 0) s2.food -= 2; TB.stat('hunger', -6); TB.route('roots', 2); TB.stat('hope', 6);
          s2.out = { bg: 'camp-fringe', text: ['You carry it out to him yourself — an armload of yams and flood-spoiled rice, laid on the boundary stone — and step back, and stand in the rain at a respectful distance while the old veteran eats like the starving eat: carefully, forcing slowness, dignity gripped in both tusks.', 'When he\'s done he does not leave. He raises the great scarred head and looks at you — a long, level, unhurried accounting — and then he walks the boundary of your homestead, once, the full circuit, and puts his shoulder against the biggest fence post gently, like a signature, and goes.', s2.companion === 'buri' ? 'Buri watches him into the dark, utterly silent, and then leans against you with his whole weight, and you stand together in the rain like a family seeing off a hard old relative.' : 'Whatever you just bought, it wasn\'t bought with yams.'] };
          TB.tickSegment(); }, go: 'act_result' },
      { t: '🚪 Hold the line. Sympathy is not a food surplus.', sub: 'The stores are the winter. The winter is everyone you feed already.',
        do: () => { const s2 = TB.state; TB.flag('KING_REFUSED'); TB.route('roots', 1);
          s2.out = { bg: 'camp-fringe', text: ['You stand at the boundary with a brand in the rain and do not move, and you make yourself meet the hollow eyes while you do it. The arithmetic is what it is: the granary is Edda\'s winter, Ryo\'s recovery, your companion\'s meals, your own margin. Kings fall. Households don\'t have to fall with them.', 'He holds a long minute — the rain hammering both of you — and then turns and goes back into the failing dark, unhurried even now, and the last you see of him is the drenched grey rampart of his back.', 'You bar nothing that night. He was never going to charge. That, somehow, is the heaviest part to carry to bed.'] };
          TB.tickSegment(); }, go: 'act_result' },
    ],
    enter: (s) => { if (!TB.is('HOME3')) TB.flag('HOME3'); },
  });

  // ==================================================================
  //  VARIANT C — THE DESCENT
  // ==================================================================
  TB.scene('ev5_deep1', {
    bg: 'gullet',
    text: (s) => [
      'The Gullet takes you on the twenty-third day, at the surge-lull ' + (TB.is('GULLET_MAP') ? 'Vane\'s tide tables name to the minute' : 'you\'ve gambled out of three days of watching the grotto breathe') + ': behind the waterfall, through the gap, down the throat of the island.',
      'It is a drowned world that empties twice a day and resents it. Walls sea-smoothed a hundred feet above the sea; galleries that boom with the far surge like a held word; and everywhere, threading the black rock in veins and lenses — <em>heartglass</em>, dark and glassy, catching your lamp and returning it a half-beat late, so that you walk in a crowd of your own delayed reflections.',
      s.companion === 'ipo' ? 'And Ipo — Ipo of the shrieking dark-terrors, Ipo who bolted from the temple shadows of every scary story you\'ve told yourself about this — Ipo walks INTO it ahead of you. He carries the spare brand in both small hands, teeth chattering audibly, tail wrapped around your arm like a mooring line, and he does not bolt. You are limping on a reef-cut; someone had to lead; the mathematics of that reached him before his fear did. It is the bravest thing you have ever watched anyone do at knee height.' : s.companion === 'nine' ? 'You expected to enter alone — and then, in the first sea-pool inside the throat, a shape rises against your lamp: Nine. She has come in from the reef side, through channels only she could thread, and she is <em>lit</em> — faintly, unmistakably, her mantle running slow waves of the same seven-beat glow as the walls. In here, she doesn\'t reflect the island\'s pulse. She keeps time with it.' : 'The seven-beat pulse doesn\'t glow down here — it <em>sounds</em>: felt in the breastbone, in the water, in the rock under your palms, the island\'s voice heard at last from inside the instrument.',
      'You go as deep as the lull allows and mark your high-water line like a debt, and climb out with the surge already talking behind you. Day one of the throat. It knows you were there.',
    ],
    enter: (s) => { if (!TB.is('DEEP1')) { TB.flag('DEEP1'); TB.flag('GULLET1'); TB.route('depth', 3); TB.stat('energy', -12); if (TB.state.companion === 'ipo') TB.bond(8); if (TB.state.companion === 'nine') TB.bond(5); } },
    next: (s) => 'camp2',
  });

  TB.scene('ev5_deep2', {
    bg: 'gullet',
    text: [
      'The second descent finds the Gallery of Hands.',
      'It opens off the main throat where the sea never quite reaches: a dry vault, breath-still, and your lamp goes up the wall and your heart goes with it — <em>paintings</em>. A ceiling of them, a cathedral of them, ochre and char and heartglass-dust that glitters as the light moves:',
      'The mountain, whole, its crown unbroken, wearing its spiral like a badge. The sea drawn as a woman with seven arms. Boats — hundreds of boats, sails like wings, coming ashore in procession. Fields. Terraces. The island fat and worked and loved.',
      'Then: the mountain <em>opening</em>. The crown shattering outward in painted fire, the sea-woman rearing, boats and fields going under a wave drawn with terrible honesty. And then the last panel, largest, the one they clearly built this vault to hold: the survivors — small painted rows of them, carrying children and fire and seed — walking not to their boats but <em>into the broken mountain itself</em>, into a painted door in the caldera\'s side, above a spiral drawn larger than everything, and around that spiral, hundreds upon hundreds of stenciled hands. Small hands. Large hands. Hands with missing fingers. A whole people, signing.',
      'They didn\'t die. They didn\'t leave. <em>They went in.</em> And below the great spiral, in the stone itself, worn to a gloss by centuries of touching: one hand-hollow, at exactly the height of your own.',
      'You stand a very long time in the drum of the far surge. Then you put your hand in the hollow, because there is no version of you that doesn\'t.',
    ],
    enter: (s) => { if (!TB.is('DEEP2')) { TB.flag('DEEP2'); TB.flag('GULLET2'); TB.flag('SUNDERING_SEEN'); TB.route('depth', 3); TB.stat('hope', 4); } },
    choices: (s) => [
      { t: '⛰️ Mark your line and climb out with the surge, as planned.', sub: 'The tide-clock is the only law down here. Honor it.',
        do: () => { TB.route('depth', 1); }, go: 'camp2' },
      { t: '🕳️ Press past the marked line. The lull might hold.', sub: '⚠️ The Gallery\'s painters drew the sea as a woman with seven arms. They knew her. You are gambling that she\'s slow today.',
        do: () => { const s2 = TB.state;
          if (R() < 0.35) { s2.deathCause = 'dark'; }
          else { TB.flag('HEARTGLASS'); TB.flag('DEEP_GREED_PAID'); TB.route('depth', 2); TB.stat('energy', -12); } },
        go: (s2) => (TB.state.deathCause ? 'death' : 'ch5_deepgreed') },
    ],
  });
  TB.scene('ch5_deepgreed', {
    bg: 'gullet',
    text: [
      'Past the marked line the throat narrows and brightens at once — the heartglass veins thickening toward the seam\'s true body, the walls alive with your own delayed reflections — and there, in a surge-scoured pocket, you find what the wound has been shedding: a spur of heartglass the size of your forearm, fallen clean, pulsing its seven beats in your hands like a warm, slow instrument.',
      'You are still wrapping it when the sea clears her throat below you.',
      'The climb out is the worst twenty minutes of your island life: the lull failing early, the boom of the returning surge chasing you gallery by gallery, black water taking the marked line behind your heels — and then daylight, and the grotto\'s mouth, and your legs giving out on honest stone.',
      'You have the spur. The sea, this once, let the gamble stand. You lie on your back listening to the throat roar shut below, and make the tide a promise you intend to keep about never, ever doing that again.',
    ],
    next: (s) => 'camp2',
  });

  TB.scene('ev5_deep3', {
    bg: 'gullet', who: NAIA,
    text: (s) => [
      'The third descent goes for the Heartroom — and the island has run out of patience with your progress.',
      'You find the wound first. ' + (TB.is('GULLET_MAP') ? 'It is exactly where Vane\'s pencil hatched it' : 'You find it the way you\'d find a wound blind: by the wrongness') + ': a side gallery where the old bore comes down through the ceiling like a scar through skin — rusted casing, fifty years of mineral weep — and around it the heartglass seam is <em>cracked</em>. Not clean lamp-lit veins here: a spiderweb of fractures radiating from the bore, and the light in them doesn\'t pulse. It <em>gutters</em>. Runs its seven beats, drops one, stutters, resumes — the skip, found at its source, leaking around a wound that has never healed. The whole gallery flickers like a failing bulb the size of a room.',
      'You are still standing in it, cold to the bones in a way the water doesn\'t explain, when the voice comes from the dark behind you — human, young, accented like nothing you\'ve ever heard, in careful, furious English:',
      '<em>"Stop."</em>',
      'She steps into your lamplight like she\'s been part of the dark all along — early twenties, barefoot on wet stone that has been cutting your boots, dressed in woven stuff the color of the walls, a heartglass lamp cold in one hand and a very functional bone knife loose in the other. And her face is a war: fear, discipline, and a curiosity so fierce it keeps breaking through the other two.',
      '"Edda\'s words," she says — tapping her own mouth: <em>explaining herself</em>, absurdly, in the middle of it. "I learn from listening. Many years, listening her." The knife-hand gestures — controlled, precise — at the guttering wound, the bore, the whole flickering room. "The last ones who touched — the island closed their door on them. You—" and here the fury slips and the curiosity floods through, helpless, and she looks at you the way you looked at the Gallery of Hands: "—<em>you</em> put your hand in the hollow. We watched. I watched. Since the first fire on your beach, castaway. Twenty-eight days, I watch you." A breath. The knife goes away. "So. Not further. Please. And — hello."',
      '<em>The watcher has a face now.</em>',
    ],
    enter: (s) => { if (!TB.is('DEEP3')) { TB.flag('DEEP3'); TB.flag('NAIA_MET'); TB.flag('WOUND_SEEN'); TB.route('depth', 3); } },
    next: (s) => 'camp2',
  });

  // ==================================================================
  //  SHARED EVENTS
  // ==================================================================
  TB.scene('ev5_cyclone', {
    bg: 'beach-night',
    enter: (s) => {
      if (TB.is('CYCLONE_APPLIED')) return;
      TB.flag('CYCLONE_APPLIED');
      if (s.site === 'overhang') { TB.stat('hope', 4); }
      else if (s.shelter >= 3) { TB.stat('energy', -6); TB.stat('hope', 2); }
      else { if (s.shelter > 0) s.shelter -= 1; TB.stat('energy', -14); TB.stat('hope', -6); TB.stat('health', -6); }
      if (s.fire && s.site !== 'overhang') s.fire = 0;
      if (s.companion === 'vela' && s.trust >= 75) TB.flag('VELA_MANTLED');
      if (s.companion === 'kavi') TB.flag('KAVI_FIRE_NIGHT');
    },
    text: (s) => {
      const t = ['The season\'s true fist arrives on the twenty-fourth night: a cyclone\'s outer arm, and the world simply becomes velocity. Rain traveling flat. The reef\'s roar relocated directly overhead. Trees inland surrendering with sounds like artillery.'];
      t.push(s.site === 'overhang' ? 'And you sit behind fifty feet of stone with your fire burning — <em>burning</em>, in this — listening to the apocalypse miss you by a geological accident you chose on Day 4. You have never loved a rock before.'
        : s.shelter >= 3 ? 'Your fortified camp takes it the way a good hull takes a sea: groaning, flexing, shedding. You lose thatch, a windbreak, a night\'s sleep — and keep everything that bleeds. Every hour you ever spent bracing and lashing pays out tonight, with interest.'
        : 'Your camp loses its argument with the sky in the first hour. After that it\'s endurance: you and everything living pressed into the lee of what holds, taking the night one gust at a time while your work disassembles around you in the dark.');
      if (s.companion === 'vela') t.push(TB.is('VELA_MANTLED')
        ? 'And Vela stays. The storm-wise one, the one with a hidden roost and a blind eye full of cyclone history and every reason to be gone — she plants herself on your food cache in the screaming dark, shaking, wings mantled over it like it\'s a nest, her whole broken-weather past held down by will alone, because the flock she has left is you and yours. In the morning she is soaked to the pin-feathers and furious and PRESENT, and you understand you have seen the whole of her heart, once, by storm-light.'
        : 'Vela was gone before the front hit — storm-wise as ever, to her hidden roost — and the night is longer for the empty snag where the weight of her should be.');
      if (s.companion === 'kavi') t.push(TB.is('KAVI_FIRE_NIGHT') && s.site === 'overhang'
        ? 'The fire is Kavi\'s war tonight: it must burn — the overhang holds it safe — and so he lies all night at the far wall, ears flat, watching his oldest enemy dance in the wind-eddies, trembling and unmoving, guarding you from inside his fear. Twice you wake and find his eyes going between you and the flames, doing sums. Twice you put your hand on the scarred flank until the shaking stops.'
        : 'Lightning walks the inland ridges half the night, and with every white crash Kavi presses harder against you — the burn-scar side, always turned away from the flashes. You keep one hand on him through the worst of it, and he lets you, which is its own kind of milestone.');
      if (s.companion === 'moa') t.push('And here is the miracle nobody sane would have bet on Day 3: Moa rides the cyclone in her storm-box like a commodore — flattened, grim, terrified, and NOT BOLTING — and twice, in the loudest passages, you hear her issue one furious clucking note at the storm itself. Correcting it. The most frightened creature on this island has organized her fear into a position.');
      if (s.companion === 'buri') t.push('Buri sleeps through a measurable portion of a cyclone. What wakes him — a snapped palm going over — he assesses, repositions himself more thoroughly against you, and re-sleeps. Two hundred pounds of unbothered is worth any three walls.');
      if (s.companion === 'ipo') t.push('Ipo spends it inside your shirt, a heartbeat against your sternum, silent all night. In the morning he emerges, checks the state of the world, and — visibly deciding the audience needs it — performs his coconut-opening impression in the wreckage until you laugh. Morale officer. Never off duty.');
      if (s.companion === 'nine') t.push('Somewhere below the white chaos of the lagoon, Nine rides out the night in the deep channels. At dawn\'s first slack you find her mark on the tideline rock: one neat spiral, freshly traced in the storm\'s rearranged sand. <em>Still here. You?</em>');
      if (!s.companion) t.push('You ride it out alone with Coco under one arm — you fetched him in from the shelf at the first real gust, an act you have elected not to examine — and you talk to him through the worst hours, steady nothing-talk, the way you\'d steady a rookie. It helps. You have also elected not to examine why.');
      return t;
    },
    nextLabel: 'Morning, eventually ➤',
    next: (s) => { TB.tickSegment(); return TB.advance(); },
  });

  TB.scene('ev5_edda', {
    bg: 'grove', who: EDDA,
    text: (s) => {
      const t = ['Word arrives on the twenty-sixth morning the island\'s way: Edda\'s smoke doesn\'t.',
        'You\'re moving before you\'ve finished noticing — up the streaming mountain path with your kit and your heart in your ears — and you find her not dead (the relief nearly sits you down in the mud) but <em>down</em>: feverish, rattling, furious about it, wrapped in blankets in a cold hut because she couldn\'t keep the fire fed and wouldn\'t burn her seed-drying racks. "Wet season chest," she rasps, waving you off even as you build the fire up. "Had it forty times. Die of it eventually. Not — <em>ffh</em> — today."'];
      if (TB.is('BG_MEDIC')) t.push('You do the exam over her objections, and your hands know what they\'re hearing: it\'s bronchitis riding old lungs, real but beatable — with warmth, steam, feverbark, and someone making her rest, none of which live up here alone with her.');
      if (TB.is('EDDA_CURED_YOU')) t.push('And it costs her nothing, flat on her back, to diagnose YOU across the hut: "Marsh fever. You\'re glowing with it, fool — sit DOWN." She directs the brewing of her own feverbark from the pillow, supervises your dose like a customs official, and visibly draws strength from having a patient worse off than herself. You both leave the morning better than you found it.');
      return t;
    },
    choices: (s) => [
      { t: '🏡 Bring her down. She winters at your camp, and that\'s the end of the argument.', sub: 'Your stores, your fire, your problem now. Family math.',
        do: () => { const s2 = TB.state; TB.flag('EDDA_WINTER'); s2.edda = TB.clamp(s2.edda + 10, 0, 100); TB.stat('energy', -12); TB.route('roots', 2);
          s2.out = { bg: campBg2(s2), text: ['The argument lasts an hour and you win it by packing while she conducts it. The trip down takes the day — her on the travois past the worst stretches, radiating indignity, gripping your arm at the steep parts with a strength that tells you exactly how frightened she\'s actually been, alone up there, listening to her own chest.', 'By nightfall Edda Voss is installed at your fire in the driest corner of everything you own, criticizing the camp\'s layout in a voice already stronger, and something in the household clicks into place that you didn\'t know was loose. ' + (s2.companion === 'moa' ? 'Moa takes up permanent post on her blanketed feet. Neither of them acknowledges the arrangement. Neither of them ends it.' : 'The rain drums on. The fire holds. The census of your kingdom is up one.')] };
          TB.tickSegment(); }, go: 'act_result' },
      { t: '⛺ Winter her in place — provision the grove, split your weeks up the mountain.', sub: 'Her ground, her pride, your legs. The costliest kindness.',
        do: () => { const s2 = TB.state; TB.flag('EDDA_TENDED'); s2.edda = TB.clamp(s2.edda + 7, 0, 100); TB.stat('energy', -8);
          s2.out = { bg: 'grove', text: ['She won\'t leave the grove — you knew before you offered — so the grove learns to hold two. You wood her up for a month, rig her rain tanks to fill without hauling, drum the feverbark decoction into a routine even a mule-headed botanist honors, and build your week around the mountain path.', 'It costs you. Every third day, up and down through the streaming green, whatever the season is doing. And every third day she\'s stronger, and ruder, which is the same thing — and on the fourth visit there\'s tea already poured when you make the fence, and you both pretend that\'s always been true.'] };
          TB.tickSegment(); }, go: 'act_result' },
    ],
    enter: (s) => {
      if (TB.is('EDDA_ILL')) return;
      TB.flag('EDDA_ILL');
      // she may be the patient, but she's still the doctor: a feverish visitor
      // does not leave her hut untreated
      if (s.disease === 'fever') { s.disease = null; TB.stat('health', 5); TB.flag('EDDA_CURED_YOU'); }
    },
  });

  // ==================================================================
  //  FINALES (Day 28)
  // ==================================================================
  TB.scene('ch5_finale', {
    bg: (s) => (s.plan === 'deep' ? 'gullet' : s.plan === 'home' ? 'camp-fringe' : 'beach-dusk'),
    text: (s) => {
      if (s.plan === 'sea') return [
        '<em>THE PROMISE OF THE HORIZON</em>',
        'Day twenty-eight. The season\'s work stands finished around you: ' + (TB.is('CONTACT_MADE') ? 'a radio that has touched the world through the island\'s held breath — they COPIED you, broken but real, and every skip is a knockable door now' : 'a vessel with trial-hours in her log and the shipping lane\'s address in your head') + (TB.is('RYO_MET') ? ', and a sailor at your fire who looks at the horizon like a homeland' : '') + '.',
        'The rains will end. The weather will open. And then the way out — the actual, buildable, sailable way out — will stand open in front of everything you\'ve grown here: the camp, the ground, ' + (s.companion ? NAMES[s.companion] + ',' : '') + ' Edda\'s mountain, the island\'s unfinished riddle.',
        'You don\'t have to decide tonight who boards and who stays and what gets said to the world about a place that hides. But tonight, for the first time since the sky broke — <em>leaving is real.</em> Say what that feels like.',
      ];
      if (s.plan === 'home') return [
        '<em>THE TABLE</em>',
        'Day twenty-eight. You build the table first — that\'s the part you\'ll remember: a real table, riven hardwood on braced legs, under the big rain-fly, with benches. Then you cook everything the season can spare: smoked fish and roast yams, flood-silt greens, Halcyon rice, honey from the immortal jar. And they come to it: ' + [TB.is('EDDA_WINTER') ? 'Edda, wrapped and imperious at the head' : (TB.is('EDDA_TENDED') ? 'Edda, down off her mountain for one night, under extreme protest, carried up the last stretch by dignity alone' : null), TB.is('RYO_MET') ? 'Ryo, who has made something with lime and sugarcane that should be illegal' : null, s.companion ? NAMES[s.companion] + ', at your side where the world belongs' : null].filter(Boolean).join('; ') + '.',
        'The rain drums the fly. The fire holds. The food goes around, and around again, and somewhere in the second hour you look down the table at your <em>household</em> — castaway, the word stopped fitting weeks ago — and understand that the season\'s real crop was never in the ground.',
        'A place like this should have a name. Yours to give.',
      ];
      return [
        '<em>THE WATCHER\'S OFFER</em>',
        'Day twenty-eight, and she comes to YOU — walks out of the dusk treeline into your firelight, hands open, the bone knife conspicuously absent: Naia, the watcher, standing in a castaway\'s camp for the first time in her life and cataloguing everything with those fierce curious eyes.',
        '"I spoke of you," she says, without preamble — she has clearly rehearsed on the walk. "To the old ones. Long — <em>ffh</em> — long arguing." A quick glance at ' + (s.companion ? NAMES[s.companion] : 'your tidy, solitary fire') + ', and something in her face you\'d call, on anyone, respect. "I say: this one, the island watched twenty-eight days, and the island is not angry. I say what you did." She counts on her fingers, your own Ledger recited back to you in broken English by a stranger: the tide pools, the fires, the graves-question you didn\'t ask Edda, the hand in the hollow. "They listen. Slow — they are old — but they listen."',
        '"So: when the rains end. The mountain. The door you saw painted." She points, once, at the broken crown, lost in rain and dark, and the sentence she has practiced most comes out whole and quiet: <em>"Come and stand before my people, castaway. Come and be decided."</em>',
      ];
    },
    choices: (s) => {
      if (s.plan === 'sea') return [
        { t: '"Like a door unlocking." The horizon is the plan. It was always the plan.', sub: 'Signal, sworn.',
          do: () => { TB.flag('FINALE_SEA_GO'); TB.route('signal', 3); TB.flag('CH5_DONE'); }, go: 'ch5_end' },
        { t: '"Like a door unlocking — in a house I\'m no longer sure I want to leave."', sub: 'Say the complicated true thing.',
          do: () => { TB.flag('FINALE_SEA_TORN'); TB.route('roots', 2); TB.route('signal', 1); TB.flag('CH5_DONE'); }, go: 'ch5_end' },
      ];
      if (s.plan === 'home') return [
        { t: '🏡 "Rootstead."', sub: 'For what the season proved: things put down here, hold.',
          do: () => { TB.flag('HOME_NAMED'); TB.flag('NAME_ROOTSTEAD'); TB.route('roots', 3); TB.flag('CH5_DONE'); }, go: 'ch5_end' },
        { t: '🌊 "Driftwood."', sub: 'For what everyone at this table used to be.',
          do: () => { TB.flag('HOME_NAMED'); TB.flag('NAME_DRIFTWOOD'); TB.route('roots', 3); TB.flag('CH5_DONE'); }, go: 'ch5_end' },
        { t: '🕯️ "The Landing."', sub: 'For how everyone arrived — and the light you\'ll keep for whoever\'s next.',
          do: () => { TB.flag('HOME_NAMED'); TB.flag('NAME_LANDING'); TB.route('roots', 2); TB.route('signal', 1); TB.flag('CH5_DONE'); }, go: 'ch5_end' },
      ];
      return [
        { t: '"I\'ll come. When the rains end, I\'ll stand and be decided."', sub: 'The door in the painting, in this life. Yes.',
          do: () => { TB.flag('INNER_INVITED'); TB.flag('NAIA_TRUSTED'); TB.route('depth', 3); TB.flag('CH5_DONE'); }, go: 'ch5_end' },
        { t: '"I\'ll come — and I want the truth of the wound first. All of it."', sub: 'Terms. She\'ll respect them or she won\'t.',
          do: () => { TB.flag('INNER_INVITED'); TB.flag('NAIA_TERMS'); TB.route('depth', 3); TB.flag('CH5_DONE'); }, go: 'ch5_end' },
      ];
    },
  });

  // ---- Chapter 5 end card ------------------------------------------------------------------
  TB.scene('ch5_end', {
    bg: 'beach-night',
    text: (s) => {
      const t = ['<em>END OF CHAPTER FIVE — THE LONG RAIN</em>', 'The crucible season, as the Ledger will keep it:'];
      if (s.plan === 'sea') {
        t.push('— You gave the rains to THE COUNTDOWN: ' + (TB.is('CONTACT_MADE') ? 'the radio lives, and through a skip in the island\'s voice, the world answered. Four seconds. They copied.' : 'a vessel stands trialed above the tideline, and the shipping lane has an address.') + (TB.is('RYO_MET') ? ' Ryo\'s question — <em>will you?</em> — still stands in the cockpit, patient as the boat.' : ''));
      } else if (s.plan === 'home') {
        t.push('— You gave the rains to THE HOMESTEAD: the farm is in' + (TB.is('FLOOD_DIKED') ? ', diked against the flood that came for it' : TB.is('FLOOD_STORES') ? ', a third drowned to keep the granary whole' : '') + ', and on the twenty-eighth night you fed your whole strange household at a real table and named the place <em>' + (TB.is('NAME_ROOTSTEAD') ? 'Rootstead' : TB.is('NAME_DRIFTWOOD') ? 'Driftwood' : 'The Landing') + '</em>.');
        t.push('— The Boar King came to your boundary starving, and you ' + (TB.is('KING_FED') ? 'fed him from the winter stores. He walked your fence line once, signed it with his shoulder, and the inland dark has an ally in it now.' : 'held the line. He went back into the failing dark unhurried, and you carry the weight of the arithmetic.'));
      } else {
        t.push('— You gave the rains to THE DESCENT: the throat, the Gallery of Hands — <em>they went in</em> — and the wound itself, guttering around Halcyon\'s bore. And the dark finally introduced itself: Naia, watcher, twenty-eight days your shadow, who ended the season standing in your firelight saying <em>come and be decided</em>.');
      }
      t.push('— The cyclone night: ' + (s.site === 'overhang' ? 'the mountain kept you like a promise.' : s.shelter >= 3 ? 'your walls earned every hour you ever spent on them.' : 'the sky took its tax in full, and you paid and rebuilt.') + (TB.is('VELA_MANTLED') ? ' And Vela stayed through it — mantled over your stores, shaking, present. The whole of her heart, seen once by storm-light.' : '') + (TB.is('MONSOON_FIRE_LOST') ? ' (The season has been drowning your fire nightly; you\'ve learned to sleep colder.)' : ''));
      t.push('— Edda\'s season turned: ' + (TB.is('EDDA_WINTER') ? 'she winters at your fire now, imperious and mending, and the household clicked around her like a joint finding its socket.' : TB.is('EDDA_TENDED') ? 'she winters in her grove on your legs and stubbornness, and there\'s tea already poured when you make the fence.' : 'her smoke faltered once, and the mountain felt suddenly very far.'));
      if (TB.is('FILES_TO_EDDA')) t.push('— And one wet evening, by your shared fire, she opened Ilsa\'s drawer with you — her testimony filling the torn pages: the bore, the nine hours, the two she buried. <em>Tend the skin,</em> Vane wrote. Edda\'s translation: "Don\'t be them, castaway. Don\'t ever be them."');
      t.push('Route standings — Signal ' + s.route.signal + ' · Roots ' + s.route.roots + ' · Depth ' + s.route.depth + '.');
      return t;
    },
    choices: [
      { t: '🌋 Continue — Chapter Six: Ashes and Stairs ➤', sub: 'The rains break. The mountain waits. Everything decided this season walks up it with you.',
        go: 'ch6_open' },
      { t: '🌊 Start a new run instead', sub: 'A different season, a different crucible.',
        do: () => { TB.wipe(); TB.state = TB.newState(); }, go: 'title' },
    ],
  });
})(window);
