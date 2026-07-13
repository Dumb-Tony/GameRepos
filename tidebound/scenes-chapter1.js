/* =====================================================================
 * scenes-chapter1.js — Chapter One: The First Fire (Days 1–5).
 * The survival hub, the six animal encounters, the Clearing of Eyes
 * threshold, companion courtship vignettes, and the slice endings.
 *
 * Actions all funnel through the generic 'act_result' scene: the camp
 * choice's `do` resolves everything (costs, rng, text) into s.out.
 * =================================================================== */
(function (G) {
  'use strict';
  const TB = G.TB;
  const R = Math.random;
  const pick = (a) => a[Math.floor(R() * a.length)];

  // ---- chapter opener ---------------------------------------------------
  TB.scene('ch1_open', {
    bg: 'beach-day',
    text: (s) => [
      '<em>CHAPTER ONE — THE FIRST FIRE</em>',
      'Morning arrives the way it will arrive every day from now on: without an alarm, without mercy, and more beautiful than anything has a right to be.',
      'Rule one of being alive out here writes itself before breakfast, mostly because there is no breakfast: <em>water, fire, shelter, food — in whatever order the island allows.</em>',
      'Three days, you tell yourself. Search parties, transponders, somebody\'s satellite. Three days of doing everything right, and this becomes a story you tell.' + (TB.is('COMPASS_SPINS') ? ' The spinning compass in your pocket has opinions about that plan. You choose not to consult it.' : ''),
      'And you are not alone. All morning the island watches you — a shape in the treeline, a shadow under the tide pools, wings riding the thermal off the point. You are new here, and the locals are curious.',
    ],
    next: 'camp',
    nextLabel: 'Begin the day ➤',
  });

  // ---- the hub ------------------------------------------------------------
  function campBg(s) { return s.seg === 2 ? 'beach-dusk' : 'beach-day'; }

  TB.scene('camp', {
    bg: campBg,
    text: (s) => {
      const t = [];
      const segName = ['The sun is barely up.', 'The sun stands high and hot.', 'The light is turning gold and long.'][s.seg] || '';
      t.push('<em>Day ' + s.day + ' — ' + TB.SEGS[s.seg] + '.</em> ' + segName);
      const w = [];
      if (s.stats.thirst <= 30) w.push('your tongue feels like driftwood');
      if (s.stats.hunger <= 30) w.push('your stomach has stopped asking politely');
      if (s.stats.energy <= 25) w.push('your arms are lead');
      if (s.injury) w.push('the gash you\'re carrying throbs with your pulse');
      if (w.length) t.push('You take stock, and the stock is worrying: ' + w.join('; ') + '.');
      else if (s.stats.hope >= 65) t.push('Against all sense, you feel almost equal to this place today.');
      const camp = [];
      camp.push(s.shelter >= 2 ? 'Your shelter is snug and storm-braced.' : s.shelter === 1 ? 'Your lean-to stands — barely a roof, but yours.' : 'You still have no shelter worth the word.');
      camp.push(s.fire >= 1 ? 'Your fire mutters comfortably in its ring of stones.' : 'You have no fire.');
      t.push(camp.join(' '));
      if (s.day === 4) t.push('Four days. The horizon has offered nothing but weather. Whatever you keep telling yourself about search parties is getting harder to say with a straight face.');
      t.push('What do you spend this part of the day on?');
      return t;
    },
    choices: (s) => {
      const c = [];
      c.push({
        t: '🥥 Coconuts — drink and eat', sub: 'The palms provide. Costs energy, buys you the rest.',
        do: () => { TB.stat('thirst', 28); TB.stat('hunger', 10); TB.stat('energy', -8);
          TB.state.nuts = (TB.state.nuts || 0) + 2;
          TB.state.out = { bg: campBg(TB.state), text: ['You knock down green coconuts and open them ' + (TB.has('knife') ? 'with the chef\'s knife, cleanly, like you\'ve done it forever.' : TB.has('multitool') ? 'with the multitool and a rock and some language.' : 'with a rock, eventually, and wear half of the first one.'), pick([
            'The water inside is faintly sweet and absurdly cold-tasting. You drink until your headache loosens its grip, and scrape the soft flesh after.',
            'You drink two straight down, standing in the palm shade, and feel your body\'s complaints settle one by one like a room going quiet.',
            'The second one you take slowly, sitting, watching the reef breathe — hydration as a meal, a meeting, and a view.',
          ])] };
          TB.tickSegment(); },
        go: 'act_result',
      });
      if (TB.SCENES.wayfinder) c.push({
        t: '🗺️ Chart an expedition', sub: 'Spread the Wayfinder and pick a region. The island is bigger than the camp.',
        go: 'wayfinder',
      });
      c.push({
        t: '🌿 Forage the treeline', sub: 'Fruit, crabs, grubs if you\'re honest with yourself. Energy −, food +.',
        do: () => {
          const s2 = TB.state; TB.stat('energy', -8); TB.stat('hunger', 16); TB.stat('thirst', 4);
          const lines = ['You work the jungle fringe where beach and green negotiate: seagrapes, a crab that objects, pale figs the birds have been at first — the birds know their business, so you trust their leavings.'];
          if (R() < 0.3 && !TB.has('knife') && !TB.has('multitool')) { TB.stat('health', -6); TB.stat('hope', -2); lines.push('A thorn vine opens the back of your hand — shallow, but out here every cut is a small loan from a lender you don\'t know yet. You wash it in the sea and think clean thoughts.'); }
          else if (R() < 0.35) { TB.stat('hope', 3); lines.push('Deeper in, a hornbill crosses the canopy like a thrown hatchet, and for a moment you forget to be a castaway and are merely somewhere astonishing.'); }
          s2.out = { bg: 'jungle', text: lines };
          TB.tickSegment(); },
        go: 'act_result',
      });
      if (s.shelter < 2) c.push({
        t: s.shelter ? '⛺ Improve the shelter' : '⛺ Build a shelter', sub: (TB.has('tarp') && !s.shelter ? 'The tarp makes this fast work. ' : '') + 'Hard labor now, better nights after. Energy −−.',
        do: () => { const s2 = TB.state; TB.stat('energy', TB.has('toolbox') || TB.is('BG_ENGINEER') ? -10 : -14); s2.shelter += 1; TB.route('roots', 2);
          s2.out = { bg: campBg(s2), text: [ s2.shelter === 1 ? (TB.has('tarp') ? 'Driftwood frame, palm-frond walls, and the tarpaulin stretched over it all like a stolen piece of sky. It is ugly and it is waterproof and you could weep with pride.' : 'You sweat a frame of driftwood into the sand and thatch it with palm fronds, layered against the grain the way roofs want. It would insult a real carpenter. It will hold off a squall.') : 'You brace the frame, double the thatch, dig a runoff trench uphill. Somewhere in the second hour it stops being a pile of luck and starts being a structure.' ] };
          TB.tickSegment(); },
        go: 'act_result',
      });
      if (s.fire < 1) c.push({
        t: '🔥 Make fire', sub: TB.has('lighter') ? 'You have a lighter. This is the easiest it will ever be.' : 'Friction and stubbornness. It may take more than one try.',
        do: () => { const s2 = TB.state; TB.stat('energy', -12);
          const p = TB.has('lighter') ? 1 : (0.45 + (TB.is('BG_ENGINEER') ? 0.2 : 0) + (TB.has('toolbox') ? 0.15 : 0) + (TB.is('TRIED_FIRE') ? 0.2 : 0));
          if (R() < p) { s2.fire = 1; TB.stat('hope', 8); TB.route('roots', 1);
            s2.out = { bg: campBg(s2), text: [TB.has('lighter') ? 'Dry palm thatch, a pyramid of driftwood, one click of the lighter you have never loved so much. Fire.' : 'Your palms burn against the drill for the length of three separate arguments with despair — and then: smoke. An ember. A flame the size of a secret, which you feed like royalty until it roars.', 'Everything changes with fire. Cooked food. Boiled water. A voice against the dark that says, on your behalf: <em>occupied.</em>'] };
          } else { TB.flag('TRIED_FIRE'); TB.stat('hope', -4);
            s2.out = { bg: campBg(s2), text: ['You drill until your hands blister and your shoulders quit, and get smoke, and smell of promise, and no fire. The trick is real. Today just wasn\'t the day you learn it. Next time — the wood drier, your angle steeper — next time.'] }; }
          TB.tickSegment(); },
        go: 'act_result',
      });
      if (!TB.is('SOS')) c.push({
        t: '🆘 Stamp SOS into the beach', sub: 'Giant letters, dark stones. For whoever is looking.',
        do: () => { const s2 = TB.state; TB.stat('energy', -8); TB.stat('hope', 4); TB.route('signal', 3); TB.flag('SOS');
          s2.out = { bg: campBg(s2), text: ['You haul dark volcanic stones until the beach spells your whole situation in three letters, each taller than a bus. From the air it will be unmissable.', 'From the air. You look up at the enormous, indifferent blue, and you make yourself believe in it: someone will fly over. Someone will look down. This works.'] };
          TB.tickSegment(); },
        go: 'act_result',
      });
      c.push({
        t: '🐚 Work the tide pools', sub: 'Shellfish, and whatever else lives in the shallows\' little worlds.',
        do: () => { const s2 = TB.state; TB.stat('energy', -6); TB.stat('hunger', 8); TB.stat('thirst', -2); s2.pools += 1; TB.route('depth', 1);
          s2.out = { bg: 'tidepools', text: ['The pools are cities at low tide — anemones, hermit crabs in stolen mansions, a moray no thicker than your thumb pretending to be furious. You pry limpets and one insolent oyster off the rocks and eat with your feet in someone\'s living room.',
            s2.pools === 1 ? 'Twice, you get the specific prickling feeling of being <em>studied</em>. Nothing is there when you look. A rock that might have moved. A smear of shifting color you decide was light on water.' : ''].filter(Boolean) };
          if (s2.pools === 2 && !s2.met.nine) s2.out.go = 'ev_nine';
          TB.tickSegment(); },
        go: 'act_result',
      });
      if (s.day === 1 && !TB.is('DIVED')) c.push({
        t: '🤿 Dive for the rest of the salvage', sub: s.stats.energy < 25 ? '⚠️ You are exhausted. The undertow out there is real, and patient.' : s.stats.energy < 40 ? '⚠️ You\'re tired, and the reef has teeth. Risky.' : 'The fuselage went down shallow. What you left is still there — today only.',
        do: () => { const s2 = TB.state; TB.flag('DIVED'); TB.route('depth', 1); TB.stat('energy', -18);
          if (s2.stats.energy < 10) { s2.deathCause = 'undertow'; s2.out = { text: ['…'] }; TB.tickSegment(); return; }
          const left = ['flaregun', 'medkit', 'toolbox', 'rations', 'case'].filter((k) => !s2.flags['SALV_' + k]);
          const k = left[Math.floor(R() * left.length)];
          TB.flag('SALV_' + k);
          if (k === 'rations') { TB.item('rations', 4); TB.item('tarp'); } else if (k === 'medkit') { TB.item('medkit', 3); } else { TB.item(k); }
          const names = { flaregun: 'the flare gun, dry in its case', medkit: 'the first-aid kit', toolbox: 'the pilot\'s toolbox', rations: 'the rations and the folded tarpaulin', case: 'the courier\'s locked case, heavy as a bad conscience' };
          const lines = ['The wreck sits on white sand in three fathoms of blue light, door open like an invitation it can no longer mean. You dive on burning lungs, once, twice—', 'You surface with <em>' + names[k] + '</em>.'];
          if (s2.stats.energy < 22) { s2.injury = 'laceration'; TB.stat('health', -15); TB.stat('hope', -3); lines.push('The price: coral, across your calf, deep enough to matter. The reef writes its receipt in red as you kick for shore. That needs tending — soon, and properly.'); }
          else lines.push('The undertow tugs your ankle on the last ascent, once, like a reminder: <em>this was lent to you, not given.</em> You believe it. You\'re done diving today.');
          s2.out = { bg: 'tidepools', text: lines };
          TB.tickSegment(); },
        go: 'act_result',
      });
      if (s.injury && TB.has('medkit')) c.push({
        t: '🩹 Clean and dress your wound', sub: 'Uses the med-kit. Infections out here do not negotiate.',
        do: () => { const s2 = TB.state; TB.item('medkit', -1); s2.injury = null; TB.stat('health', 10); TB.stat('hope', 3);
          s2.out = { bg: campBg(s2), text: [TB.is('BG_MEDIC') ? 'You do it the way you\'ve done it for strangers a hundred times — irrigate, debride, butterfly the edges, dress it — and your hands are rock steady right up until you finish, which is how it always goes.' : 'You clean it until it screams and dress it the way the little printed diagram suggests. It\'s not pretty. It\'s clean. Out here, clean is the whole war.'] };
          TB.tickSegment(); },
        go: 'act_result',
      });
      if (s.fire >= 1 && s.stats.hunger < 80) c.push({
        t: '🍲 Cook a real meal', sub: 'Crab, limpets, figs, fire. Food that argues you\'re still a person.',
        do: () => { const s2 = TB.state; const cook = TB.is('BG_COOK'); TB.stat('energy', -6); TB.stat('hunger', cook ? 36 : 26); TB.stat('hope', cook ? 8 : 5); TB.stat('thirst', -2);
          s2.out = { bg: campBg(s2), text: [cook ? 'Twelve years of line work did not anticipate this kitchen, and it doesn\'t matter. Crab roasted in the shell, limpets on hot stone with wild fig glaze, salt from a rock pool. You plate it on a palm leaf out of sheer professional spite. It is, objectively, good.' : 'You roast crab and limpets over the coals and burn exactly one of everything, which is the traditional first-meal tax. It is hot, and it is savory, and eating it changes the shape of the evening entirely.'] };
          TB.tickSegment(); },
        go: 'act_result',
      });
      c.push({
        t: '😴 Rest in the shade', sub: 'Do the bravest thing: recover.',
        do: () => { const s2 = TB.state; TB.stat('energy', 16); TB.stat('hope', 2); TB.stat('health', s2.injury ? 0 : 3);
          s2.out = { bg: campBg(s2), text: ['You lie in palm shade and let the island carry on without your supervision. The reef breathes. The palms tick and rattle. Somewhere inland a bird laughs at an excellent joke, twice.', 'You don\'t quite sleep. You come back anyway with your edges reattached.'] };
          TB.tickSegment(); },
        go: 'act_result',
      });
      return c;
    },
  });

  // Generic action-outcome scene: reads whatever the camp choice stashed in s.out.
  // s.out.go lets an action chain into a bespoke scene (the tide pools → Nine).
  TB.scene('act_result', {
    bg: (s) => (s.out && s.out.bg) || campBg(s),
    text: (s) => (s.out && s.out.text) || ['The hours pass.'],
    next: (s) => (s.out && s.out.go) || TB.advance(),
  });

  // ---- nights ----------------------------------------------------------------
  TB.scene('night', {
    bg: 'beach-night',
    text: (s) => {
      const t = ['<em>Night.</em> The lagoon takes up its slow blue-green pulse, seven beats, like the island keeping time for itself.'];
      if (s.shelter && s.fire) t.push('You bank the fire, crawl under your roof, and listen to the jungle change shifts — day birds clocking out, night things clocking in, everyone remarkably businesslike about it.');
      else if (s.shelter) t.push('No fire, but a roof. You wrap yourself in everything you own and listen to the dark being enormous.');
      else if (s.fire) t.push('No roof, but the fire holds a room-shaped piece of night open around you. You sleep in it like a stray.');
      else t.push('No roof. No fire. You dig a body-shaped trench in sand still warm from the day and learn what the stars look like at 3 a.m. when nothing between you and them belongs to you.');
      if (TB.has('rations') && s.stats.hunger < 55) t.push('You allow yourself one of the tins, eaten slowly, label memorized like scripture. <em>' + (s.inv.rations - 1) + ' left.</em>');
      return t;
    },
    nextLabel: 'Sleep ➤',
    next: (s) => {
      if (TB.has('rations') && s.stats.hunger < 55) { TB.item('rations', -1); TB.stat('hunger', 25); }
      const floor = 45 + s.shelter * 12 + s.fire * 8;
      if (s.stats.energy < floor) s.stats.energy = floor;
      TB.stat('hope', s.shelter || s.fire ? 1 : -3);
      TB.tickSegment();
      return TB.advance();
    },
  });

  // ---- the six encounters ------------------------------------------------------
  TB.SCHEDULE.push(
    { d: 1, s: 2, id: 'ev_vela' },
    { d: 1, s: 3, id: 'ev_howls' },
    { d: 2, s: 0, id: 'ev_ipo' },
    { d: 3, s: 2, id: 'ev_squall' },
    { d: 3, s: 3, id: 'ev_buri' },
    { d: 4, s: 0, id: 'ev_moa' },
    { d: 4, s: 1, id: 'ev_kavi2' },
    { d: 4, s: 2, id: 'ev_lights', when: (s) => TB.has('flaregun') },
  );

  TB.scene('ev_vela', {
    bg: 'beach-dusk',
    who: { emoji: '🦅', name: 'A sea eagle' },
    text: [
      'Something falls out of the sky and lands at your feet with a wet slap.',
      'It is half a fish. A good fish — was a good fish. You look up into the gold light and find her: a white-bellied sea eagle the size of a mistake, banking once over your camp on wings you can hear.',
      'She lands on the dead palm at the edge of camp and regards you with one fierce amber eye. The other, you notice, is pale as sea-glass — blind. She does not look at you like a beggar. She looks at you like an accountant.',
      'Earlier — you\'d barely registered it — a monitor lizard had been nosing up the beach toward the point, and your blundering around the tide pools turned it back. Below her nest, you realize. The fish is not a gift.',
      'It\'s a <em>payment</em>.',
    ],
    choices: [
      { t: 'Cook and eat it. Honor the transaction.', sub: 'She\'s watching. Somehow this feels like the right answer.',
        do: (s) => { TB.meet('vela', 1); TB.stat('hunger', 14); TB.stat('hope', 3); }, go: 'camp' },
      { t: 'Eat half. Leave half on the high rock, and step back.', sub: 'Open a ledger of your own.',
        do: (s) => { TB.meet('vela', 2); TB.stat('hunger', 7); TB.stat('hope', 2); }, go: 'camp' },
      { t: 'Just watch her until she tires of you.', sub: 'Patience is a profession too.',
        do: (s) => { TB.meet('vela', TB.is('BG_PHOTOG') ? 2 : 1); TB.stat('hope', 2); if (TB.is('BG_PHOTOG')) TB.flag('VELA_STUDIED'); }, go: 'camp' },
    ],
  });

  TB.scene('ev_howls', {
    bg: 'beach-night',
    who: { emoji: '🐕', name: 'Eyes at the treeline' },
    text: [
      'You wake — or half-wake — to singing.',
      'Far inland, a pack of something is howling: ragged, many-voiced, rising and falling against the lagoon\'s slow pulse of light. Wild dogs. The island has wild dogs.',
      'And one of them is <em>here</em>. At the treeline, at the exact edge of the dark, two eyes catch the glow — low, steady, unblinking. A big dog, storm-grey where the light touches, standing apart from the far chorus and pointedly not joining it.',
      'It does not come closer. It does not leave. It watches you the way you\'d watch weather.',
    ],
    choices: [
      { t: 'Toss a scrap of food halfway to the treeline, then lie back down.', sub: 'A word in a language every stray knows.',
        do: (s) => { TB.meet('kavi', 2); TB.stat('hunger', -4); }, go: 'night' },
      { t: 'Sit up and watch back. Calm, both hands visible.', sub: 'Not prey, not threat. Just… neighbors.',
        do: (s) => { TB.meet('kavi', 1); TB.stat('hope', 1); }, go: 'night' },
      { t: 'It\'s a wild animal. Keep your food, mind your fire, go to sleep.', sub: 'Sentiment is a luxury item.',
        do: (s) => { TB.meet('kavi', 0); TB.route('roots', 1); }, go: 'night' },
    ],
  });

  TB.scene('ev_ipo', {
    bg: 'beach-day',
    who: { emoji: '🐒', name: 'A macaque, delighted with himself' },
    text: (s) => [
      'You wake to tiny hands going through your pockets.',
      'The thief is a young macaque with a scruffy coat and the eyes of a card sharp, sitting on your chest with tremendous self-possession. Before you\'re even fully upright he springs away down the beach — and he has, you realize with a lurch, <em>your lighter</em>.',
      s.fire ? 'You have fire already banked in its ring, which is the only reason this is a comedy and not a catastrophe.' : 'You do not have a fire yet. The full arithmetic of what he\'s just taken lands on you like cold water.',
      'He stops a stone\'s throw away, holds the lighter up to the sun, turns it over, and then looks back at you. Deliberately. He is not fleeing. He is <em>waiting for the show</em>.',
    ],
    choices: [
      { t: 'Chase him. That lighter is survival.', sub: 'You will not win. Some things you do anyway.',
        do: (s) => { TB.item('lighter', -99); TB.meet('ipo', 1); TB.stat('energy', -8); TB.stat('hope', 1); TB.flag('LIGHTER_GONE'); }, go: 'ev_ipo2' },
      { t: 'Sit down, hold out a fig, and applaud.', sub: 'He wants an audience? Fine. Negotiate like it\'s theater.',
        do: (s) => { TB.item('lighter', -99); TB.meet('ipo', 2); TB.stat('hunger', -3); TB.stat('hope', 3); TB.flag('LIGHTER_GONE'); }, go: 'ev_ipo3' },
      { t: 'Curse all monkeys, comprehensively, and let it go.', sub: 'Chasing him burns energy you can\'t spare.',
        do: (s) => { TB.item('lighter', -99); TB.meet('ipo', 0); TB.flag('LIGHTER_GONE'); }, go: 'camp' },
    ],
  });
  TB.scene('ev_ipo2', {
    bg: 'beach-day', who: { emoji: '🐒', name: 'The thief' },
    text: [
      'What follows is not a chase so much as a demonstration. He flows up a palm trunk like poured water, drops behind you, lets you get within an arm\'s length twice — exactly twice, the showman — and finishes on a branch just out of reach, hanging upside down, watching you wheeze.',
      'He clicks the lighter. A tiny flame. His eyes go wide with the purest scientific joy you have ever seen on any face, on any species.',
      'You sit down in the sand, utterly beaten, and — it surprises you — laugh. He chirps back. It sounds suspiciously like applause.',
    ],
    next: 'camp',
  });
  TB.scene('ev_ipo3', {
    bg: 'beach-day', who: { emoji: '🐒', name: 'The thief' },
    text: [
      'He watches you sit. Watches the fig. Sidles three steps closer, wildly casual, examining the sky, the sea, his own fingernails.',
      'Then in one liquid movement the fig is gone from your hand and he\'s ten feet away eating it — lighter in the other fist, because he is not an amateur and this was never a <em>trade</em>.',
      'But he stays while he eats. That close, curious, one eye always on you. When he finally swaggers off up the beach he looks back twice, and the second look lasts longer.',
    ],
    next: 'camp',
  });

  TB.scene('ev_squall', {
    bg: 'beach-dusk',
    text: (s) => {
      const t = ['The sky goes from gold to green-black in the time it takes to notice. The reef stops breathing and starts <em>hissing</em>. Then the squall arrives all at once, a wall of warm rain marching up the lagoon like it has an appointment.'];
      if (s.shelter >= 1) { t.push('You get under your roof as the world turns to white noise. The thatch drums; the trench runs; the structure — <em>your</em> structure — holds. You sit in the dry dark grinning like an idiot at fifteen square feet of victory.'); }
      else if (TB.has('tarp')) { t.push('No shelter — but the tarp. You wrap yourself and your supplies in it and crouch against a palm while the squall does its worst, a human parcel, damp at the seams but whole.'); }
      else { t.push('There is nowhere to be but in it. The rain hits blood-warm and hammering, and in ninety seconds you are as wet as the ocean and colder than you\'ve been since the crash. Your fire dies without a sound, like something giving up.'); }
      return t;
    },
    next: (s) => 'camp',
    enter: (s) => {
      if (TB.is('SQUALL_APPLIED')) return; // reloading a save mid-scene must not double-apply
      TB.flag('SQUALL_APPLIED');
      if (s.shelter >= 1) { TB.stat('hope', 5); TB.stat('thirst', 10); TB.flag('SQUALL_DRY'); }
      else if (TB.has('tarp')) { TB.stat('thirst', 10); }
      else { TB.stat('energy', -10); TB.stat('hope', -6); TB.stat('thirst', 12); if (s.fire) { s.fire = 0; TB.flag('FIRE_DROWNED'); } }
    },
  });

  TB.scene('ev_buri', {
    bg: 'beach-night',
    who: { emoji: '🐗', name: 'A bearded pig, uninvited' },
    text: (s) => [
      'You wake to the sound of your camp being <em>audited</em>.',
      'The auditor is a bearded pig — young, bristled, built like a barrel that learned to run — and he is going through your supplies with the joyful thoroughness of a customs officer who has decided to keep everything.',
      TB.has('rations') ? 'He has found the rations. He is wearing one tin\'s worth of your future on his snout and looking for the opener, which is to say, stepping on the rest.' : 'There is precious little to steal, which does not discourage him. He upends what there is on principle, snuffling with the satisfaction of a job well done.',
      'He notices you noticing him. He does not run. He looks at you, sand and larceny all over his face, with an expression of total moral innocence.',
    ],
    choices: (s) => [
      { t: 'Charge at him, yelling, arms wide.', sub: 'This is YOUR beach. Establish that.',
        do: () => { const s2 = TB.state; TB.meet('buri', 1); TB.stat('energy', -6); if (TB.has('rations')) TB.item('rations', -1); }, go: 'ev_buri2' },
      { t: 'Toss him something and watch him work.', sub: 'Feed the invasion. See what it does.',
        do: () => { const s2 = TB.state; TB.meet('buri', 2); if (TB.has('rations')) TB.item('rations', -1); else TB.stat('hunger', -5); TB.stat('hope', 3); }, go: 'ev_buri3' },
      { t: 'Guard what matters and wait him out.', sub: 'He\'s two hundred pounds of appetite. Pick your battles.',
        do: () => { TB.meet('buri', 1); if (TB.has('rations')) TB.item('rations', -1); }, go: 'ev_buri4' },
    ],
  });
  TB.scene('ev_buri2', { bg: 'beach-night', who: { emoji: '🐗', name: 'The auditor' }, text: ['He holds his ground for exactly one and a half seconds of your charge, then wheels and gallops for the treeline with a squeal that is ninety percent outrage and ten percent glee, tail up like a flag.', 'At the trees he stops, turns, and looks back at you — not afraid, you notice. <em>Interested.</em> You have the unsettling impression you\'ve just introduced yourself.'], next: 'night' });
  TB.scene('ev_buri3', { bg: 'beach-night', who: { emoji: '🐗', name: 'The auditor' }, text: ['He inhales your offering, then — instead of leaving — flops down at the edge of the firelight\'s memory with a seismic grunt, entirely at home, and dozes off mid-chew.', 'You sit awake a while, robbed and somehow charmed, listening to a wild pig snore in your camp like a drunk uncle. In the morning he is gone, and every crab within fifty yards of camp has been excavated and eaten, which — you suspect — he considered rent.'], next: 'night' });
  TB.scene('ev_buri4', { bg: 'beach-night', who: { emoji: '🐗', name: 'The auditor' }, text: ['You plant yourself over what matters and let him have the rest of his inspection. He works around you with perfect professional courtesy, taking what isn\'t nailed down, testing what is.', 'At last he stands a moment in the lagoon-glow, looks at you — a long, frank, appraising look, one settler to another — and trots off up the beach with his spoils. You have the strong feeling this was a first visit, not a last one.'], next: 'night' });

  TB.scene('ev_moa', {
    bg: 'beach-day',
    who: { emoji: '🐔', name: 'A junglefowl hen' },
    text: [
      'Dawn arrives pre-shattered: the jungle edge explodes with alarm calls, and a scatter of junglefowl — small, copper-and-flame, absurdly beautiful — bursts from the fringe onto the open sand, panicked past sense.',
      'The reason rides down the morning air behind them: a hawk, stooping, wings shut like a decision.',
      'The flock makes the treeline. One hen doesn\'t — she\'s cut off, flat to the sand in the open, frozen the way prey freezes when the plan runs out. The hawk banks around for its second pass.',
      'It happens to be banking over <em>your</em> beach.',
    ],
    choices: [
      { t: 'Charge out roaring, waving both arms at the sky.', sub: 'Ruin a hawk\'s morning. Cost: dignity, some energy.',
        do: (s) => { TB.meet('moa', 2); TB.stat('energy', -4); TB.stat('hope', 3); }, go: 'ev_moa2' },
      { t: 'Throw a stone — high, to spoil the stoop, not to hit.', sub: 'Precision sympathy.',
        do: (s) => { TB.meet('moa', 2); }, go: 'ev_moa2' },
      { t: 'Stand still. This is the island\'s business, not yours.', sub: 'The hawk is hungry too. Nothing here is a villain.',
        do: (s) => { TB.meet('moa', 0); TB.route('depth', 1); }, go: 'ev_moa3' },
    ],
  });
  TB.scene('ev_moa2', { bg: 'beach-day', who: { emoji: '🐔', name: 'The survivor' }, text: ['The hawk aborts with an offended flare of wings and rows away down the shore to find a breakfast with less commotion attached.', 'The hen stays frozen a long moment more — then unfreezes all at once and sprints, not for the treeline, but into the shadow of <em>your camp</em>, where she stands behind a water gourd, vibrating, one bright eye fixed on you.', 'She stays an hour. She inspects everything. She leaves the way queens leave. And that evening, back at the jungle edge, you notice she has not gone far at all.'], next: 'camp' });
  TB.scene('ev_moa3', { bg: 'beach-day', who: { emoji: '🐔', name: 'The survivor' }, text: ['The stoop misses — barely, a spray of sand and one copper feather — and the hawk climbs away empty. The hen finds her legs and streaks for cover.', 'All day you catch her at the fringe, watching your camp from under the ferns. You watched. She noticed. What she concludes from that is apparently still being decided.'], next: 'camp' });

  TB.scene('ev_kavi2', {
    bg: 'beach-day',
    who: { emoji: '🐕', name: 'The grey dog' },
    text: [
      'Midday. You look up from your work and the grey dog from the treeline is simply <em>there</em>, thirty feet away in the open, as if he\'s been assigned to you.',
      'By daylight he\'s bigger than the dark suggested, and thinner than he should be — ribs like a hull under the storm-grey coat, and an old scar of a burn along one flank where the fur grows wrong. He is hunting crabs, and he is terrible at it: too big, too slow on the turn, dignity everywhere.',
      'He catches you watching. Stops. And instead of melting back into the trees, he sits — deliberately, facing half away, giving you his scarred side and one watchful eye.',
      'Far off, faint, the pack sings its daytime song. His ear turns toward it. The rest of him doesn\'t.',
    ],
    choices: [
      { t: 'Toss him your next crab, underhand, easy.', sub: 'Hunger is a door. Open it.',
        do: (s) => { TB.warm('kavi', 3); TB.state.met.kavi = true; TB.stat('hunger', -4); }, go: 'ev_kavi3' },
      { t: 'Sit down at his height and talk. Low, unhurried, about nothing.', sub: 'The weather. The crab market. Anything.',
        do: (s) => { TB.warm('kavi', TB.is('BG_PHOTOG') ? 3 : 2); TB.state.met.kavi = true; TB.stat('hope', 2); }, go: 'ev_kavi3' },
      { t: 'Nod to him and keep working.', sub: 'Two professionals, sharing a beach.',
        do: (s) => { TB.warm('kavi', 1); TB.state.met.kavi = true; TB.route('roots', 1); }, go: 'ev_kavi3' },
    ],
  });
  TB.scene('ev_kavi3', { bg: 'beach-day', who: { emoji: '🐕', name: 'The grey dog' }, text: ['He doesn\'t come closer. That, you sense, is not on today\'s agenda, and pushing would end the meeting. But the watchful eye softens by some canine degree, and when he finally rises and pads back toward the treeline, he stops once and looks back at you over the scarred shoulder.', 'It is not a beggar\'s look, and not a stray\'s. It\'s the look of someone who has been let down by his own kind and is running the numbers on yours.'], next: 'camp' });

  TB.scene('ev_nine', {
    bg: 'tidepools',
    who: { emoji: '🐙', name: 'Something in the pool' },
    text: [
      'You\'re prying at an oyster when the rock beside your hand opens an eye.',
      'The whole "rock" un-rocks itself in one impossible ripple — texture, color, certainty, all abandoned at once — and becomes an octopus the size of a cat, hanging in the pool\'s clear water, regarding you with a slotted golden eye that is doing, unmistakably, the same thing you\'re doing: <em>studying</em>.',
      'She has been here before. You understand this suddenly and completely — the watched feeling, the moved rocks, the day you talked out loud to yourself at this pool for an hour. She was attending.',
      'She reaches one arm out of the water — slow, deliberate, tip curled like a question mark — and taps the oyster you\'re holding. Then taps the rock. Then waits.',
      'She is showing you where to strike it open. She has <em>opinions about your technique</em>.',
    ],
    choices: [
      { t: 'Follow her instructions exactly.', sub: 'Be teachable.',
        do: (s) => { TB.meet('nine', 3); TB.stat('hunger', 6); TB.stat('hope', 4); TB.route('depth', 2); }, go: 'ev_nine2' },
      { t: 'Offer her the oyster instead.', sub: 'Tribute for the professor.',
        do: (s) => { TB.meet('nine', 2); TB.stat('hope', 3); TB.route('depth', 2); }, go: 'ev_nine2' },
      { t: 'Withdraw your hand slowly and give the pool some distance.', sub: 'Respect. Also: those arms are strong and you are far from help.',
        do: (s) => { TB.meet('nine', 1); TB.route('depth', 1); }, go: 'ev_nine2' },
    ],
  });
  TB.scene('ev_nine2', { bg: 'tidepools', who: { emoji: '🐙', name: 'The neighbor' }, text: ['When the business of the oyster is concluded to her satisfaction, she settles back into the pool, pours herself into a crevice you\'d have sworn was too small — and stops, one eye out, watching you go.', 'At the last moment, an arm rises above the water and traces one slow spiral in the air. It might be nothing. It might be a wave goodbye. It does not, in any way you can name, feel like nothing.'], next: (s) => TB.advance() });

  TB.scene('ev_lights', {
    bg: 'beach-dusk',
    text: [
      'Dusk, day three. You\'re coaxing the evening chores along when your whole body freezes before your mind knows why.',
      'A light. Out on the darkening horizon — a single pale light, low on the water, crawling from south to north. A ship. Far, terribly far, but <em>real</em>: the first human-made thing you\'ve seen move since the crash.',
      'The flare gun is in your hand before you remember crossing the camp. One flare. One argument with the horizon. At this distance, in this light… maybe they\'re looking this way. Maybe nobody\'s on deck at all.',
      'You will only get to make this argument once.',
    ],
    choices: [
      { t: 'Fire it. Now, high, while there\'s any chance at all.', sub: 'This is what it\'s FOR.',
        do: (s) => { TB.item('flaregun', -1); TB.flag('FLARE_SPENT'); TB.route('signal', 4); TB.stat('hope', -8); }, go: 'ev_lights2' },
      { t: 'Lower the gun. Not this one. Not a maybe.', sub: 'Save the argument for a ship that can hear it.',
        do: (s) => { TB.flag('FLARE_HELD'); TB.route('signal', 1); TB.stat('hope', 2); }, go: 'ev_lights3' },
    ],
  });
  TB.scene('ev_lights2', { bg: 'beach-night', text: ['The flare goes up with a sound like torn cloth and hangs over the lagoon, a small red sun, painting the whole beach in emergency. You stand in its light with your arms raised, shouting at the sea.', 'The light on the horizon crawls on, south to north, unchanged, until it isn\'t there anymore. The flare hisses into the water. The dark comes back all at once.', 'The island lagoon glows on, seven slow beats, as it always has and always will, entirely unimpressed by red.'], next: (s) => TB.advance() });
  TB.scene('ev_lights3', { bg: 'beach-dusk', text: ['You watch the light the whole way north, gun heavy at your side, doing the cold arithmetic again and again and getting the same cold answer. It was never going to see you.', 'When it\'s gone you exhale, holster the argument you didn\'t spend, and notice your hands are shaking. Not with regret, you decide. With change: some part of you just stopped waiting to be found and started planning to be <em>ready</em>.'], next: (s) => TB.advance() });

  // ---- THE CLEARING OF EYES ------------------------------------------------------
  const COURTS = {
    kavi: { emoji: '🐕', name: 'the grey dog', go: 'court_kavi',
      t: '🐕 The grey dog', sub: 'Watchful. Burn-scarred. Cast out of his own pack — and choosing, maybe, to be near yours.' },
    ipo: { emoji: '🐒', name: 'the macaque', go: 'court_ipo',
      t: '🐒 The macaque', sub: 'Thief, showman, menace. The smartest hands on this island — and the loneliest act.' },
    vela: { emoji: '🦅', name: 'the sea eagle', go: 'court_vela',
      t: '🦅 The sea eagle', sub: 'One blind eye, no sentiment, impeccable books. She pays her debts. Earn a place in them.' },
    buri: { emoji: '🐗', name: 'the bearded pig', go: 'court_buri',
      t: '🐗 The bearded pig', sub: 'A barrel of appetite and goodwill. Strong as three of you. Zero self-preservation.' },
    moa: { emoji: '🐔', name: 'the junglefowl hen', go: 'court_moa',
      t: '🐔 The junglefowl hen', sub: 'Small, terrified, still here. There is something in her that refuses, and refuses, and refuses.' },
    nine: { emoji: '🐙', name: 'the octopus', go: 'court_nine',
      t: '🐙 The octopus', sub: 'Nine brains, three hearts, one eye that studies you back. Whatever this island is hiding, she is nearer to it.' },
  };

  TB.scene('clearing', {
    bg: 'beach-dusk',
    text: (s) => {
      const met = Object.keys(COURTS).filter((k) => s.met[k]);
      return [
        '<em>THE CLEARING OF EYES</em>',
        'Dusk, the fifth day. You sit by your camp doing the honest arithmetic at last: no search plane has come. No ship has turned. Whatever happens next, it happens <em>here</em>, and it happens to you — and five days of this island have taught you exactly how long your two hands are.',
        'And as the light goes long and gold, you realize you have company. You\'ve had company all along.',
        'They are all, in their various ways, present: ' + met.map((k) => COURTS[k].name).join('; ') + '. Wild lives, orbiting your small fire of a life these five days, each for their own reasons. Curious. Hungry. Lonely, maybe — you\'re projecting, probably — or maybe not.',
        'Trust, out here, is the most expensive thing you can build, and you only have the hours to build it once. If you give your scarce time to one of them — food you can\'t spare, patience you can\'t spare, days you can\'t spare — one of these lives might tie itself to yours. For good.',
        TB.meta().runs > 0 ? '<em>(And — strange — the choosing feels rehearsed, like a step your feet already know. As if you have stood at this exact dusk before, and chosen, and lived whole lives on the far side of it. The feeling passes. The eyes wait.)</em>' : '',
        '<em>One.</em>',
      ].filter(Boolean);
    },
    choices: (s) => {
      if (s.mod === 'silent') { // NG+ Silent Island: the eyes keep their distance this loop
        return [{
          t: '🧍 Alone, then. The island asked for this loop unwitnessed.',
          sub: 'Silent Island: the wild watches from further back this life. The solo route, enforced.',
          do: () => { TB.flag('CLEARING_DONE'); TB.flag('SOLO_ROUTE'); TB.route('roots', 1); },
          go: 'court_none',
        }];
      }
      const list = Object.keys(COURTS).filter((k) => s.met[k]).map((k) => ({
        t: COURTS[k].t, sub: COURTS[k].sub,
        do: () => { const s2 = TB.state; s2.companion = k; TB.flag('CLEARING_DONE'); },
        go: COURTS[k].go,
      }));
      list.push({
        t: '🧍 No one. You will do this alone.',
        sub: 'No mouths to feed but yours. No one to lose but yourself. The hardest road, and wholly your own.',
        do: () => { TB.flag('CLEARING_DONE'); TB.flag('SOLO_ROUTE'); TB.route('roots', 1); },
        go: 'court_none',
      });
      return list;
    },
  });

  // ---- courtship vignettes -----------------------------------------------------
  TB.scene('court_kavi', {
    bg: 'beach-night', who: { emoji: '🐕', name: 'Kavi' },
    text: (s) => [
      'You take your food to the open sand between the camp and the treeline, sit down at his height, and wait.',
      'It takes most of the evening. He circles twice at the dark\'s edge; sits; lies down; gets up; and finally crosses the distance the way a man crosses a rope bridge — committed and hating it — until two hundred pounds of storm-grey wild dog is standing an arm\'s length away, reading your face like a track.',
      (s.interest.kavi >= 3 ? 'The crab you threw him, the low easy talk, the scrap in the dark — he has been running those numbers for days. Whatever total he reaches, it tips him: ' : 'You have given him little enough reason. But whatever he was cast out of cost him more: ') + 'he takes the fish from the sand beside your hand, gravely, without snatching — and then he does not leave.',
      'When you finally bank the fire and lie down, he arranges himself precisely at the edge of camp, back to you, scarred flank to the flames\' dying warmth, facing the treeline. On guard. You fall asleep to the sound of a wild thing breathing between you and the dark, and far away — one last time that night — the pack sings without him.',
      'He does not answer them.',
    ],
    choices: [
      { t: '"Kavi." You name him after the sound the reef makes at low tide.', sub: 'Named things stay.',
        do: (s) => { TB.warm('kavi', 2); TB.stat('hope', 6); }, go: 'ch2_open' },
      { t: 'Say nothing. Let him keep his own name a while longer.', sub: 'He\'ll tell you when it\'s time.',
        do: (s) => { TB.warm('kavi', 1); TB.route('depth', 1); TB.stat('hope', 4); }, go: 'ch2_open' },
    ],
  });

  TB.scene('court_ipo', {
    bg: 'beach-dusk', who: { emoji: '🐒', name: 'Ipo' },
    text: (s) => [
      'You find him where you knew you would — the dead palm at the camp\'s edge, working his audience of nobody — and you do the one thing no creature on this island has done for him: you sit down in the front row.',
      'The effect is instantaneous and total. He runs his entire repertoire: the hanging-by-one-foot bit, the lighter (your lighter — flick, flame, flourish), a heartbreakingly accurate impression of you opening a coconut. You laugh until your ribs — still crash-sore — make you stop, and the sound of it does something visible to him, like sun on a plant.',
      (s.interest.ipo >= 2 ? 'When the show ends he doesn\'t swagger off. He descends, sidles, and — with the fastidious ceremony of a maître d\' — deposits the lighter in your open palm.' : 'When the show ends he studies you for a long, mercantile moment. Then he descends, and with visible internal struggle, places the lighter in your palm.') + ' The most valuable thing he owns. The bit that killed, given away for the encore.',
      'Then he climbs your arm like furniture, settles his small weight on your shoulder, takes a fistful of your hair for security, and surveys the beach — <em>his</em> beach now, clearly; the whole act upgraded to a double bill.',
      'You are, you understand, no longer the audience. You\'re the act\'s other half.',
    ],
    choices: [
      { t: '"Ipo." It means gift where you learned it — and he\'d hate a humble name.', sub: 'Star billing.',
        do: (s) => { TB.item('lighter'); TB.warm('ipo', 2); TB.stat('hope', 6); }, go: 'ch2_open' },
      { t: 'Flick the lighter once, in salute, and pocket it.', sub: 'Between professionals.',
        do: (s) => { TB.item('lighter'); TB.warm('ipo', 1); TB.stat('hope', 5); }, go: 'ch2_open' },
    ],
  });

  TB.scene('court_vela', {
    bg: 'beach-dusk', who: { emoji: '🦅', name: 'Vela' },
    text: (s) => [
      'You do not go to her. You have understood this much: nothing approaches a sea eagle. You go to the tide pools instead, spear the fattest mullet of your five days, and lay it — whole, untouched — on the high rock below the dead palm. Then you step back exactly ten paces and stand in plain view, empty-handed, in the evening light.',
      'She makes you wait long enough to establish that waiting is happening. Then she drops from the palm in one silent falling arc, mantles over the fish, and eats — never once taking the amber eye off you. Payment received. Books balanced. That should be the whole transaction.',
      'Except that when she finishes, she doesn\'t leave. She sidles along the rock — an awkward, deliberate, un-flightlike walk — and turns her head to study you with the <em>pale</em> eye, the blind one, the one she shows nothing.',
      (s.interest.vela >= 2 ? 'She has watched you honor a debt before. Something in the ledger tips.' : 'Whatever she reads in you, it is sufficient — barely, provisionally, pending review.') + ' She stands one full minute in the last gold light, blind side offered like the most reluctant gift on earth. Then she is simply airborne, gone up the darkening sky toward the cliffs.',
      'But the next dawn — and every dawn after — you wake to find a fish on the high rock, and a huge patient shape on the dead palm, waiting to see what you\'re worth.',
    ],
    choices: [
      { t: '"Vela." A sail. Something that works with the wind and owes it nothing.', sub: 'She would approve, insofar as she approves of anything.',
        do: (s) => { TB.warm('vela', 2); TB.stat('hope', 5); }, go: 'ch2_open' },
      { t: 'Name nothing. Feed the account. Let the books speak.', sub: 'Transactional. She\'d call it correct.',
        do: (s) => { TB.warm('vela', 1); TB.route('signal', 1); TB.stat('hope', 4); }, go: 'ch2_open' },
    ],
  });

  TB.scene('court_buri', {
    bg: 'beach-night', who: { emoji: '🐗', name: 'Buri' },
    text: (s) => [
      'Strategy is not required. Strategy would, in fact, be wasted. You simply cook dinner — a real one, doubled — and leave the second portion on a flat stone at the edge of the firelight, and by full dark the beach transmits the seismic information that he is inbound.',
      'He eats the offering in one biblical inhalation. Then he inspects the empty stone, inspects you, inspects the stone again — establishing the facts of the case — and, satisfied, performs the least wild act you have ever seen from a wild animal: he walks a circle exactly three times and collapses against your legs like scaffolding coming down.',
      'Two hundred pounds of bristled, sand-crusted, gently steaming pig, pinning you to the spot, asleep in under a minute. Trusting you with all of it, instantly and completely, the way he does everything.',
      (s.interest.buri >= 2 ? 'You think of him dozing in your camp that first night, rent paid in excavated crabs. Apparently that was the interview, and you passed.' : 'It occurs to you that you have been adopted, and that consent was never really on the agenda.') + ' Somewhere in the small hours he begins — softly at first, then with gathering orchestral confidence — to snore.',
      'You fall asleep against a wild pig\'s back, warmer than you\'ve been in five days, listening to the lagoon keep time. It is completely ridiculous. It is the safest you have felt since the sky broke.',
    ],
    choices: [
      { t: '"Buri." Short, sturdy, shouts well across a beach.', sub: 'You\'ll be shouting it a lot.',
        do: (s) => { TB.warm('buri', 2); TB.stat('hope', 7); }, go: 'ch2_open' },
      { t: 'Whatever you name him, he\'s clearly staying. Budget accordingly.', sub: 'He eats like a delegation.',
        do: (s) => { TB.warm('buri', 1); TB.route('roots', 1); TB.stat('hope', 6); }, go: 'ch2_open' },
    ],
  });

  TB.scene('court_moa', {
    bg: 'beach-dusk', who: { emoji: '🐔', name: 'Moa' },
    text: (s) => [
      'You do it the slow way, the only way: a scatter of grubs a little nearer the camp each time, and yourself — planted, quiet, unthreatening — a little nearer the scatter. All evening the copper hen shuttles between the fern-shadow and the food, wound like a spring, retreating from every noise the island makes.',
      'And every time, she comes back. That is the whole of her, you are learning: everything frightens her, and nothing stops her. Terror as a lifestyle. Persistence as a rebuttal.',
      (s.interest.moa >= 2 ? 'You are the human who ruined a hawk\'s morning on her behalf, and she has clearly filed that information somewhere behind the bright, frantic eyes. ' : '') + 'At full dark, the decision arrives — hers, entirely. She crosses the last open ground at a fast, affronted trot, hops onto the driftwood at your fire\'s edge, and settles into a loaf of copper feathers, facing the treeline, exactly one arm\'s length from your knee.',
      'Guarding you, plainly. All two pounds of her. Against the entire night.',
      'When the jungle makes its midnight noises she flattens and trembles and does not leave. You watch the smallest, most frightened creature on this beach refuse — and refuse — and refuse — and you think: <em>of all of them, this one might have the most to teach you about surviving here.</em>',
    ],
    choices: [
      { t: '"Moa." An old word for a bird too stubborn for its own story.', sub: 'It suits her.',
        do: (s) => { TB.warm('moa', 2); TB.stat('hope', 6); }, go: 'ch2_open' },
      { t: 'Slide one more grub across the driftwood. Words later.', sub: 'The vocabulary you share is food and staying.',
        do: (s) => { TB.warm('moa', 1); TB.stat('hunger', -2); TB.stat('hope', 5); }, go: 'ch2_open' },
    ],
  });

  TB.scene('court_nine', {
    bg: 'tidepools', who: { emoji: '🐙', name: 'Nine' },
    text: (s) => [
      'You give your last free hours to the pools, which is — by every survival arithmetic you know — indefensible. You bring a live crab, and your patience, and you sit down at the edge of her pool in the low gold light like a student early for class.',
      'She emerges the way she does everything: as a correction to your assumptions about matter. She takes the crab — a brief, expert, upsetting demonstration of what those arms are — and then, meal concluded, she does the thing that ends any argument you were still having with yourself.',
      'She reaches up out of the water and lays one arm-tip, light as a thought, on the back of your hand. Tasting you, you\'ll learn later; octopuses read the world by touch. But what it feels like, in the moment, is being <em>read</em> — thoroughly, gently, without judgment — by something with three hearts and no reason to bother.',
      (s.interest.nine >= 3 ? 'The oyster lesson, the offered tribute, the hours you gave a rock that watched: it was all, apparently, syllabus. ' : '') + 'When she withdraws, she traces the spiral again — in the wet sand this time, unmistakable, deliberate — and then points herself out toward the darkening reef and pauses. Looking back. An invitation, patient as tide.',
      'There is so much water around this island. You are beginning to suspect she knows what\'s in all of it.',
    ],
    choices: [
      { t: '"Nine." For the brains, the arms\' near-count, the ninth wave.', sub: 'Every version of the name is true.',
        do: (s) => { TB.warm('nine', 2); TB.stat('hope', 5); TB.route('depth', 1); }, go: 'ch2_open' },
      { t: 'Trace the spiral back in the sand beside hers.', sub: 'Answer in her language.',
        do: (s) => { TB.warm('nine', 1); TB.route('depth', 2); TB.stat('hope', 4); }, go: 'ch2_open' },
    ],
  });

  TB.scene('court_none', {
    bg: 'beach-night',
    text: [
      'You bank the fire alone, on purpose, and sit with the decision while the lagoon keeps its slow time.',
      'It isn\'t coldness. It\'s arithmetic, and honesty: every mouth tied to yours is food you must find twice, every bond a hostage the island can take. You have watched this place for five days now. It is beautiful the way knives are beautiful. You will cross it faster alone, risk less, grieve less.',
      'The grey dog sings somewhere inland with a pack that isn\'t his. The monkey\'s treetops go quiet. Small feet and large ones print the morning sand at the edges of your life, and you will let them stay at the edges: neighbors, all of them. Not family.',
      'Alone, then. Unbroken, if you can manage it. The night is enormous, and you are exactly one person, and you find — checking, the way you\'d check a knot — that this holds.',
    ],
    next: 'ch2_open',
  });

  // ---- slice end & death ----------------------------------------------------------
  const COMP_NAMES = { kavi: 'Kavi the island dog 🐕', ipo: 'Ipo the macaque 🐒', vela: 'Vela the sea eagle 🦅', buri: 'Buri the bearded pig 🐗', moa: 'Moa the junglefowl 🐔', nine: 'Nine the octopus 🐙' };

  TB.scene('slice_end', {
    bg: 'beach-night',
    text: (s) => {
      const t = ['<em>END OF CHAPTER ONE — THE FIRST FIRE</em>', 'The Ledger opens. This island forgets nothing; neither does this game. Your first five days, as the island will remember them:'];
      const bg = { medic: 'a flight medic', photog: 'a wildlife photographer', cook: 'a line cook', engineer: 'a marine engineer' }[s.bgnd] || 'a stranger';
      t.push('— You came here as <em>' + bg + '</em>, and from the drowning fuselage you saved: ' + ['flaregun', 'medkit', 'toolbox', 'rations', 'case'].filter((k) => s.flags['SALV_' + k]).map((k) => ({ flaregun: 'the flare gun', medkit: 'the med-kit', toolbox: 'the toolbox', rations: 'the rations and tarp', case: 'the courier\'s case' })[k]).join(', ') + '.');
      if (s.companion) t.push('— At the Clearing of Eyes, of every wild life on this island, you chose <em>' + COMP_NAMES[s.companion] + '</em>. This single choice will bend everything that follows: where you can go, how you survive, what you learn, and how this story can end.');
      else t.push('— At the Clearing of Eyes you chose <em>no one</em>. The Solo route: the hardest road on the island, and wholly yours.');
      if (TB.is('FLARE_SPENT')) t.push('— You spent your only flare on a far light that never turned. The island saw.');
      if (TB.is('FLARE_HELD')) t.push('— A ship\'s light crossed the horizon, and you held your only flare. The island saw that too.');
      if (TB.is('SOS')) t.push('— Your SOS waits on the beach for eyes that fly.');
      if (TB.is('HELPED_COURIER')) t.push('— A stranger\'s photograph is still in your pocket. <em>"If it\'s the same island…"</em>');
      if (s.flags.SALV_case) t.push('— The courier\'s case is still locked. It is not going to open itself.');
      t.push('— The compass still spins. The lagoon still keeps its seven-beat time. And something under this island is still humming.');
      t.push('Route leanings — Signal ' + s.route.signal + ' · Roots ' + s.route.roots + ' · Depth ' + s.route.depth + '. Nothing is decided. Everything is remembered.');
      t.push('<em>Chapter Two: Foothold — in development.</em> The full design (7 chapters, 6 companions, 49 endings) lives in this folder\'s design documents.');
      return t;
    },
    choices: [
      { t: '🌊 Start a new run', sub: 'Different past, different salvage, different companion — different island, in every way that matters.',
        do: () => { TB.wipe(); TB.state = TB.newState(); }, go: 'title' },
    ],
  });

  TB.scene('death', {
    bg: 'ocean-night', hud: false,
    who: null,
    text: (s) => {
      const cause = s.deathCause;
      const t = [];
      if (cause === 'thirst') { t.push('<em>ENDING — THE DRIFTWOOD TONGUE</em>', 'The island is nine-tenths water and it let you die of thirst — which is to say, it didn\'t. You did, one skipped coconut at a time, one more urgent task after another, until the headache became the world and the world became very small and very bright.', 'You are found by no one. The tide is respectful. The palms drop their green flasks on the empty sand, punctually, forever.'); }
      else if (cause === 'hunger') { t.push('<em>ENDING — HUNGER\'S QUIET</em>', 'Starvation is a patient bookkeeper: it took the loud hungers first, then the strength, then the wanting itself, until you sat above the tideline in the gentle sun, weightless, watching the reef breathe light, feeling nothing so much as <em>excused</em>.', 'The junglefowl inherit your camp. They find it adequate.'); }
      else if (cause === 'undertow') { t.push('<em>ENDING — UNDERTOW</em>', 'You knew. That\'s the cruelest inventory of the last minute — you knew you were too spent for one more dive, and the salvage gleamed, and you traded a maybe for a certainty the way tired people always do.', 'The fuselage keeps its remaining treasures, and, now, its returning guest. The reef grows on. It has never once been in a hurry.'); }
      else if (cause === 'fever') { t.push('<em>ENDING — MARSH FEVER</em>', 'The mosquitos were such a small tax, at dusk, at the fringe of the green. You paid it without counting for days — and then the fever came to audit, and it audited everything: your strength first, then your hours, then the line between the island and your dreams of it.', 'In the last of the dreams the lagoon\'s slow light comes up the beach and through the camp and into you, seven beats, and it does not hurt at all. There was a cure on this island. There was a woman on a mountain who knew it. The Ledger records, without comment, the distance between you and her door.'); }
      else if (cause === 'despair') { t.push('<em>ENDING — THE GREEN SWALLOWS</em>', 'You stop keeping the days, and the days, courteously, stop keeping you.', 'It isn\'t dramatic. That was the appeal. You walk inland one bright morning without a plan to walk out, and the Green Deep receives you the way it received the terraces and the stones and every other made thing: patiently, greenly, without malice. For a while there are still habits — water found, fruit taken, a fire some nights. Then fewer. The count blurs, as requested. The paths you cut heal over behind you.', 'The island does not judge it. The island has folded over grander surrenders than yours, and will again, and holds what it takes gently and forever. Somewhere, on a shelf above an abandoned fire, three dark pores face the treeline where you went in — the last thing keeping any kind of watch, for as long as weather allows.'); }
      else if (cause === 'dark') { t.push('<em>ENDING — THE LONG DARK</em>', 'The lull does not hold.', 'You hear her before you feel her — the sea, clearing her throat somewhere below your marked line, the boom rolling up gallery by gallery — and you run, and the heartglass lights your running like a corridor of your own late reflections, and the black water takes the marks behind your heels faster than heels can be lifted. The last gallery is a ceiling and a breath. The breath is the kind you count. You count it.', 'The Kaari painted the sea as a woman with seven arms, and they sealed their dead galleries and drew hands around the door. They knew her. She is not cruel, and she is not slow, and she keeps what the tide brings all the way down.', 'Far below, unhurried, something begins to glow.'); }
      else if (cause === 'grin') { t.push('<em>ENDING — OLD GRIN</em>', 'The mangroves have one landlord, and you knew his terms, and you were sure — swift-water sure, spear-in-hand sure, too-far-to-turn-back sure — that terms were negotiable.', 'It is very fast. The water closes like a ledger. Far upriver the herons resettle, the crabs resume their offices, and the oldest patience on the island slides back under the tea-dark water, undefeated, unhurried, owed nothing now at all.', 'Edda\'s eulogy, delivered to her garden, is four words: "Told it. Didn\'t listen."'); }
      else { t.push('<em>ENDING — THE SMALL LOAN</em>', 'It was never the wound. It was the wound, untended, plus the day after, plus the day after that — the little loan you took from the lender you didn\'t know, compounding quietly under a bandage of optimism until the fever came to collect.', 'You had a med-kit for this, or a day of rest for this, or a choice, somewhere back down the path, for this. The island files your story under its oldest heading: <em>almost.</em>'); }
      t.push('The Ledger closes: Day ' + s.day + '. ' + (Object.keys(s.met).length ? 'The wild lives that had begun to orbit yours scatter back to their own stories. ' : '') + 'Every death here is an ending, not an error — but the island is long, and other lives through it are still yours to try.');
      return t;
    },
    choices: [
      { t: '📜 Save your run card', sub: 'Even the endings that end you are worth keeping.',
        do: (s) => { if (TB.RunCard) TB.RunCard.download(s); } },
      { t: '🌅 Try the island again', sub: 'The Ledger remembers. So do you, now.',
        do: () => { if (TB.Loops) TB.Loops.bank(TB.state, null); TB.wipe(); TB.state = TB.newState(); }, go: 'title' },
    ],
  });
})(window);
