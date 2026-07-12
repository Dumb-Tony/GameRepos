/* =====================================================================
 * scenes-extra.js — The Locked Things + the Living Island.
 *
 * LOCKED THINGS: the courier case arc (three openings, contents,
 * Edda's confirmation), the Rosa Dourada treasure dive, the radio
 * listening vigil, and new ending cores appended to TB.CORES.
 * LIVING ISLAND: the random-event layer (TB.randomEvent) — regional
 * flavor, companion idle moments, and once-per-run rare wonders —
 * plus this file loads AFTER the chapters, so it may decorate them.
 * =================================================================== */
(function (G) {
  'use strict';
  const TB = G.TB;
  const R = Math.random;
  const pick = (a) => a[Math.floor(R() * a.length)];

  function campBg2(s) {
    if (s.chapter < 2) return s.seg === 2 ? 'beach-dusk' : 'beach-day';
    if (s.site === 'fringe') return 'camp-fringe';
    if (s.site === 'overhang') return 'cliff-camp';
    return s.seg === 2 ? 'beach-dusk' : 'beach-day';
  }
  const backToCamp = (s) => (s.chapter >= 2 ? 'camp2' : 'camp');

  // ==================================================================
  //  THE COURIER'S CASE
  // ==================================================================
  const prevActions = TB.ch3Actions;
  TB.ch3Actions = function (s) {
    const c = prevActions(s);
    if (TB.has('case') && !TB.is('CASE_OPEN')) c.push({
      t: '💼 The courier\'s case', sub: TB.is('CASE_EDDA') ? '"Some locks are the only honest warning you get." It has waited long enough.' : 'Locked. Heavy. Not food. Still yours.',
      do: () => { TB.tickSegment(); }, go: 'case_scene',
    });
    if (TB.is('CASE_OPEN') && TB.is('DOSSIER') && TB.is('EDDA_MET') && !TB.is('SPONSORS_KNOWN')) c.push({
      t: '💼 Take the dossier up to Edda', sub: 'She went pale at the crest on the lock. She should see what was under it.',
      do: () => { TB.stat('energy', -6); TB.tickSegment(); }, go: 'case_edda',
    });
    if (TB.is('CHART_ROSA') && s.chapter >= 4 && !TB.is('ROSA_DONE')) c.push({
      t: '🗺️ Follow the courier\'s chart — the Rosa Dourada', sub: TB.is('CHART_TORN') ? 'What survives of the chart marks a reef on the north shore. Half the annotations burned with the smashing.' : 'An oilskin chart, older than the case: a wreck marked on the north reef, annotated in two centuries of hands.',
      do: () => { TB.stat('energy', -10); TB.tickSegment(); }, go: 'rosa_dive',
    });
    if (TB.is('RADIO_DONE') && !TB.is('OTHER_HEARD')) c.push({
      t: '📻 Night vigil at the radio — listen, don\'t speak', sub: TB.is('LISTEN1') ? 'There was something under the static last time. You have to know.' : 'The skips are windows. Windows work both ways.',
      do: () => { TB.stat('energy', -5); TB.tickSegment(); }, go: 'radio_listen',
    });
    return c;
  };

  TB.scene('case_scene', {
    bg: campBg2,
    text: (s) => [
      'You set the courier\'s case on the flat stone in good light and look at it properly, maybe for the first time: marine steel, lead-heavy for its size, the worn crest by the lock' + (TB.is('CASE_EDDA') ? ' that stopped Edda Voss mid-sentence — the mark of the people who funded Halcyon, on an object that crossed the sky with you fifty years after they "stopped existing."' : ' — a maker\'s mark, you\'d assumed, though it\'s drawn like something that means more.'),
      'The courier\'s voice, from the falling plane: <em>"If it\'s the same island — you\'ll want to know it can be left."</em>',
      'The lock is serious. The question is how serious you are.',
    ],
    choices: (s) => {
      const c = [];
      if (s.companion === 'ipo' && s.trust >= 50) c.push({
        t: '🐒 Give Ipo the audience of his life.', sub: 'The finest fingers on the island, and a lock with a reputation.',
        do: () => { TB.flag('CASE_OPEN'); TB.bond(4); }, go: 'case_open_ipo' });
      if (TB.is('BG_ENGINEER') && TB.has('toolbox')) c.push({
        t: '⚙️ Defeat it properly: drill the lock body.', sub: 'Two patient hours. Locks are just puzzles that think highly of themselves.',
        do: () => { TB.flag('CASE_OPEN'); TB.stat('energy', -8); }, go: 'case_open_drill' });
      c.push({
        t: '🔨 Smash it open. Enough mystery.', sub: '⚠️ Brutal and certain — but whatever\'s fragile in there answers to physics too.',
        do: () => { TB.flag('CASE_OPEN'); TB.flag('CHART_TORN'); TB.stat('energy', -10); }, go: 'case_open_smash' });
      c.push({
        t: 'Leave it closed. Today isn\'t the day.', sub: 'The dead woman\'s drawer taught you patience about locked things.',
        do: () => { TB.state.flags.CASE_OPEN = undefined; delete TB.state.flags.CASE_OPEN; TB.route('roots', 1); }, go: (s2) => backToCamp(TB.state) });
      return c;
    },
  });
  const CASE_CONTENTS = [
    'Inside, packed in fifty-year-old felt, three things.',
    'First: a lead-lined pouch, surgeon-stitched, and inside it — your breath goes somewhere else — <em>gems</em>. A dozen of them, cut and polished: dark, glassy, catching your lamp and holding it a half-beat too long. Heartglass. Someone, somewhere off this island, has been CUTTING it. Faceted like diamonds. Sold, presumably, like them. They are the most beautiful wrong thing you have ever held.',
    'Second: a dossier in a waxed envelope, typed pages and photostats under the crest from the lock. You read it twice. The sponsors never stopped existing — they renamed. And they never stopped looking: the file is a fifty-year hunt for "Site 9," compiled from satellite anomaly maps, shipping-lane reports, and — page after page — testimony from people who LEFT this island and lived. The ship photo\'s twin is here, catalogued. The courier wasn\'t traveling with the case. The courier was <em>delivering himself</em>: an agent, riding the one aircraft their models said the island would take.',
    'Third: an oilskin chart of Vessakai itself — crude, pre-Halcyon, older than everything — annotated in two centuries of different hands. And on the north reef, in the oldest ink of all, a wreck is marked with a word and a cross: <em>ROSA DOURADA. GOLD.</em>',
  ];
  TB.scene('case_open_ipo', {
    bg: campBg2, who: { emoji: '🐒', name: 'Ipo' },
    text: (s) => ['Ipo approaches the case the way a maestro approaches a difficult hall: one slow circuit, tapping; a period of theatrical limbering; and then twenty minutes of the most focused work you have ever seen from any living thing — one ear pressed flat to the steel, fingers reading the lock\'s small resistances like braille.', 'The CLACK of it opening is followed by a bow. You applaud. It is expected, and deserved.'].concat(CASE_CONTENTS),
    enter: (s) => { if (!TB.is('CASE_LOOT')) { TB.flag('CASE_LOOT'); TB.flag('GEMS'); TB.flag('DOSSIER'); TB.flag('CHART_ROSA'); TB.route('depth', 2); TB.route('signal', 1); } },
    next: (s) => backToCamp(s),
  });
  TB.scene('case_open_drill', {
    bg: campBg2,
    text: (s) => ['You do it the engineer\'s way: brace, center-punch, and two patient hours of hand-drill work through the lock body, resting the bit, saving the toolbox\'s last good edges. The lock surrenders like an argument running out of premises.'].concat(CASE_CONTENTS),
    enter: (s) => { if (!TB.is('CASE_LOOT')) { TB.flag('CASE_LOOT'); TB.flag('GEMS'); TB.flag('DOSSIER'); TB.flag('CHART_ROSA'); TB.route('depth', 2); TB.route('signal', 1); } },
    next: (s) => backToCamp(s),
  });
  TB.scene('case_open_smash', {
    bg: campBg2,
    text: (s) => ['You wedge it against the boundary stone and put the heavy end of your resolve through the hinge line, again, again — the case dying hard, the way things built by serious people do — until it yawns open, bent and beaten.'].concat(CASE_CONTENTS).concat(['The smashing had a price: the old oilskin chart took the worst of the final blow — torn through, a corner gone entirely, half its annotations lost to the tear. The wreck-mark survives. Much of what two centuries of hands wrote AROUND it did not.']),
    enter: (s) => { if (!TB.is('CASE_LOOT')) { TB.flag('CASE_LOOT'); TB.flag('GEMS'); TB.flag('DOSSIER'); TB.flag('CHART_ROSA'); TB.route('depth', 2); TB.route('signal', 1); } },
    next: (s) => backToCamp(s),
  });

  TB.scene('case_edda', {
    bg: 'grove', who: { emoji: '👵', name: 'Edda Voss', art: 'char-edda' },
    text: [
      'She reads the dossier at her table, straight through, in a silence with weather in it. When she reaches the photostats — the testimony of the ones who left — her hand goes flat on the pages and stays there.',
      '"Meridian Applied Materials," she says at last, tapping the renamed crest. "So that\'s what the committee grew up to be. We used to joke they\'d outlive us all. Bad joke. True." She turns one of the cut gems in the lamplight, and her face does something complicated: recognition, revulsion, and — underneath, ineradicable, the scientist — <em>wonder</em>. "They\'ve been mining the anomaly the only way they could reach it: the shards Halcyon shipped out before the Incident. Fifty years of cutting stones and hunting the seam they came from."',
      'She pushes it all back across the table like it\'s warm. "You wanted to know what finds this island if the veil ever thins, castaway. Now you know its NAME. Mind what you do with that knowing — and mind harder what you do with those stones. Everything they touch, they price."',
    ],
    enter: (s) => { if (!TB.is('SPONSORS_KNOWN')) { TB.flag('SPONSORS_KNOWN'); s.edda = TB.clamp(s.edda + 5, 0, 100); TB.route('depth', 2); } },
    next: (s) => backToCamp(s),
  });

  // ---- The Rosa Dourada -----------------------------------------------------
  TB.scene('rosa_dive', {
    bg: 'tidepools',
    text: (s) => [
      'The chart is honest. Two hundred years of honest: on the north reef, in four fathoms of surge-washed blue, lies the ribcage of a ship — swallowed by coral, mast-stumps like broken teeth, her iron long gone to rust-bloom and her timbers to stone.',
      'And in the sand-pooled hollow of her stern castle, where the chart\'s oldest hand drew its cross: <em>gold</em>. Real, stupid, storybook gold — coins fused in coral-crusted slabs, a spill of them loose across the hollow like dropped sunlight, untouched for two centuries because no chart but this one ever told anyone where to grieve for her.',
      s.companion === 'nine' ? 'Nine turns the loose coins over with her arms, tastes one, and files the entire hoard as: <em>not crab</em>. Her indifference is somehow the truest appraisal the Rosa\'s cargo has ever received.' : 'The surge breathes through the wreck. The reef\'s shadows move their slow patrols. You are a long swim from shore, in the north sea\'s cold, doing arithmetic about air and greed.',
      'How much of a dead ship\'s luck do you carry home?',
    ],
    choices: (s) => [
      { t: '🪙 A handful. Enough to matter, light enough to swim.', sub: 'The sensible plunder.',
        do: () => { TB.flag('ROSA_DONE'); TB.flag('TREASURE_SOME'); TB.stat('hope', 5); TB.route('depth', 1); }, go: 'rosa_out' },
      { t: '💰 All you can lift. You may never come back; the sea may not allow twice.', sub: '⚠️ Heavy, cold, far from shore. Greed has drowned better swimmers.',
        do: () => { const s2 = TB.state; TB.flag('ROSA_DONE'); TB.flag('TREASURE_ALL');
          if (R() < (TB.is('CHART_TORN') ? 0.6 : 0.4)) { s2.injury = 'laceration'; TB.stat('health', -18); TB.stat('energy', -15); TB.flag('ROSA_PRICE'); }
          else TB.stat('energy', -12); }, go: 'rosa_out' },
      { t: '🌊 Leave her cargo with her crew.', sub: 'Two hundred years of quiet. Some banks shouldn\'t be robbed.',
        do: () => { TB.flag('ROSA_DONE'); TB.flag('TREASURE_LEFT'); TB.stat('hope', 4); TB.route('depth', 1); TB.route('roots', 1); }, go: 'rosa_out' },
    ],
  });
  TB.scene('rosa_out', {
    bg: 'beach-dusk',
    text: (s) => [
      TB.is('TREASURE_LEFT') ? 'You surface with empty hands and a full accounting, and swim home lighter than you came. The Rosa keeps her gold and her crew and her two hundred years, and something in you — the something this island has been building since Day 1 — is glad all the way down.'
        : TB.is('ROSA_PRICE') ? 'Greed nearly pays its classic wage: overloaded, cold-slowed, you misjudge the surge on the second lift and the wreck\'s coral opens your shoulder to the bone-ache. The swim home is long, red-threaded, one-armed, the gold dragging at your sling like the dead arguing. You make the beach. You keep the gold. The reef keeps its tax, and the scar will keep the story.'
        : TB.is('TREASURE_ALL') ? 'Three trips down, lungs burning, and you carry out everything your improvised slings can hold — coin-slabs, the loose spill, one small coral-fused ingot. On the beach at dusk you stand over a dead ship\'s fortune, dripping, rich beyond any use this island has for the word, and laugh until the gulls complain.'
        : 'You carry out one honest handful — heavy, cold, older than every country you\'ve ever stood in — and leave the rest to the Rosa\'s long patience. On the swim home the coins knock together at your hip like a small, absurd bell.',
      'Gold, on Vessakai, buys exactly nothing. Somewhere out past the horizon, it buys everything. Which world you spend it in is a question for the Convergence.',
    ],
    next: (s) => backToCamp(s),
  });

  // ---- The listening vigil -----------------------------------------------------
  TB.scene('radio_listen', {
    bg: 'station',
    text: (s) => {
      if (!TB.is('LISTEN1')) return [
        'You keep the vigil with the transmitter cold and the receiver hot, headphones on in the amber dark, waiting on the island\'s held breaths.',
        'The first skip comes at midnight: the Hum drops, the black window opens — and you don\'t key the mic. You just LISTEN, to four seconds of the emptiest silence on any band, on any Earth.',
        'Except. At the very bottom of it, at the edge of the noise floor — something. A rhythm. Too faint to swear to, too regular to dismiss: a pulse that isn\'t yours, isn\'t seven. You count what you can before the window slams: <em>nine</em>. Nine beats.',
        'You walk home with your skin prickling. There is another voice in the deep of the world, and it keeps a different time.',
      ];
      return [
        'The second vigil, you\'re ready: antenna trimmed, gain wide open, your own breath held with the island\'s.',
        'The window opens at 2:31, and she\'s THERE — faint as a star behind cloud, a woman\'s voice, calm, unhurried, speaking English with an accent you can\'t place, as if she\'s been broadcasting into her own skips for years and long since stopped expecting anyone:',
        '<em>"…calling the seven-beat island. I hear your MAYDAY nights, seven-beat. This is the nine-beat station. We are — "</em> the window flexes, the Hum leaning in, <em>" — the same kind of place. There are more of us than two. When you understand your island, seven-beat, you will understand why I say: be careful what you teach the world to find. Nine-beat, listening, out."</em>',
        'The Hum closes over her like the sea over a stone. You sit in the amber dark a long time, holding the headphones, holding the new shape of everything: <em>islands</em>. Plural. A hidden ARCHIPELAGO of the world\'s quiet places — and at least one other keeper of a radio, somewhere, keeping her vigil too.',
      ];
    },
    enter: (s) => {
      if (!TB.is('LISTEN1')) { TB.flag('LISTEN1'); TB.route('depth', 1); }
      else if (!TB.is('OTHER_HEARD')) { TB.flag('OTHER_HEARD'); TB.route('depth', 2); TB.stat('hope', 5); }
    },
    next: (s) => backToCamp(s),
  });

  // ==================================================================
  //  NEW ENDING CORES (appended into the ch7 engine's live object)
  // ==================================================================
  Object.assign(TB.CORES, {
    THREE_SPRINGS: { icon: '🍂', title: 'THREE SPRINGS', bg: 'tidepools', body: [
      'You stay for her springs, because that was always the shape of this route, known and unsaid: octopuses are lanterns, not hearths. They burn brilliantly, and briefly, and you had — the almanac in your head has always known it — three springs, and you have spent two.',
      'The third is the best of them. She is slower now, and stays nearer, and the games change: less hunting, more touching, long hours in the warm shallows with one arm curled at your wrist while the tide does the work. She shows you, in her last month, the den under the coral shelf — the one you were never shown before — and the pale garden of her eggs strung from its ceiling like a sky. And she stops eating, as her kind do, and stands guard over her hundred thousand children, and you stand guard over her.',
      'You are there at the end, at dawn at low water, your hand in the pool. The last thing she does — deliberate, unhurried, the whole alien length of her gathered into it — is trace the spiral on your palm. Then the arm settles. The water breathes seven beats. The lantern goes out.',
      'You keep the garden. You tend the tide pools like a keeper\'s parish, and you are there in the autumn when the eggs lift off in their glass-dust thousands, and you are there two springs later when a young day octopus rises in HER pool and studies you with a slotted golden eye — and reaches up one arm, tip curled like a question mark, toward the fire-tending gesture you didn\'t realize you were making.',
      'The island repays its debts. Not the way you\'d write it. The way tide does: again, and again, and again.',
    ] },
    LAST_PACK: { icon: '🌀', title: 'THE LAST PACK', bg: 'jungle-night', body: [
      'In the end you go to where Kavi\'s other half lives, because after everything — the fires, the ford, the mountain — the truest sentence you know is: where one of you goes, both of you go.',
      'The pack takes months to permit you. You learn to be permitted: to keep your eyes soft and your fire small, to feed the thin ones without ceremony, to be the strange tall packmate who cannot smell anything and yet always knows where the storm is. Kavi ages into the old-dog seat at the fire\'s edge, grey-muzzled, gravitational; the young ones bring him their disputes, and he brings the unsolvable ones to you, and between the two of you the pack crosses three hard seasons without losing a single soul, which the wild almost never allows.',
      'You keep one human fire in the world, and it burns in the middle of a wolf-story. On clear nights the singing starts on the ridge and rolls down through the sleeping bodies around you, and Kavi\'s rusty voice lifts with it, and then — because you are pack, because it is expected, because it is TRUE — so does yours.',
    ] },
    TRICKSTER: { icon: '😂', title: 'THE TRICKSTER\'S CROWN', bg: 'jungle', body: [
      'What Ipo has been building in the canopy, it turns out, is a GOVERNMENT.',
      'He walks you up the rope-bridge roads one morning — his roads; you understand now where the vine-craft went — to the great fig at the center of the troop\'s territory, and presents: the hoard, institutionalized. Caches, tribute lines, a sentry rotation bribed in figs, the old matriarch pensioned off with the shiniest third of everything, and forty macaques who part around him like a bead curtain around a returning king.',
      'Your homestead becomes the crown\'s summer palace. The taxes flow both ways: your tools stay miraculously un-stolen and your trees miraculously un-raided, while a steady tribute of fruit, shellfish, and the occasional deeply useful stolen object (a working compass, once; you don\'t ask) arrives on your table with ceremony. In exchange, the king requires only what he always required, from the very first day, from the lighter to the crown:',
      'An audience. Front row. Forever. You never miss a show.',
    ] },
    ROSAS_RANSOM: { icon: '🌑', title: 'THE ROSA\'S RANSOM', bg: 'ocean-night', body: [
      'You leave rich. That\'s the plain of it: a dead ship\'s gold and a dead project\'s cut stones, sewn into your gear through the whole crossing, heavy as a second conscience.',
      'The world receives a castaway and audits a fortune. There are rooms, afterward — polite rooms, with flags in the corners and men who say "provenance" the way priests say sin — and you tell the truth minus one island: storm, raft, a reef that isn\'t on the charts, salvage law. The gold clears eventually. Gold always does; that\'s what it\'s FOR. The heartglass you sell one stone at a time, carefully, to buyers who don\'t advertise — and stop, the third time a purchaser\'s crest looks a half-century familiar, and quietly drop the rest into a harbor at night.',
      'You are, by any accounting, set for life. The accounting runs at night anyway: the seventh beat of anything turns your head; wealth, it turns out, is a lighthouse pointed backward. You know exactly what it illuminates. You paid the Rosa\'s ransom to leave, and some nights — most nights — you understand at last why her crew never did.',
    ] },
    OTHER_SIGNAL: { icon: '🌀', title: 'THE OTHER SIGNAL', bg: 'station', body: [
      'You stay — but not for the island. For the ARCHIPELAGO.',
      'Night after night, skip after skip, four seconds at a time, you and the nine-beat station build the strangest friendship in the history of radio: two keepers of two hidden worlds, trading survival tricks and storm warnings and, eventually, in hundred-night installments, whole life stories. Her island is cold where yours is green; her Hum lives in aurora, not tide; her people went IN, too, a thousand years before yours did. There are, she has confirmed across her longer vigil, at least FIVE. The world\'s quiet places know each other. Now their keepers do.',
      'Your radio room grows into a listening post the world will never chart: logbooks of skips, a map of nothing anyone else can see. And on the first night of your third year, a third voice arrives in the windows — hesitant, terrified, brand new, some fresh castaway on some far quiet place, keying a MAYDAY into what they think is dead air.',
      'You and nine-beat answer together, the old way, the way she once answered you: <em>"We hear you. You\'re not alone. Count the beats, keeper. Count the beats, and be careful what you teach the world to find."</em>',
    ] },
    FIRST_KAARI: { icon: '🌀', title: 'THE FIRST KAARI', bg: 'temple', body: [
      'What happened when you touched the triple-spiral was not a dream, and you have stopped calling it one.',
      'You stood on the Terrace of Steps under an unbroken mountain, in air that smelled of a thousand cook-fires, and you watched the boats come in with sails like wings — the arrival itself, the first landing, nine centuries deep. And a woman turned on the great stair — sea-speaker\'s hood, spiral at her collar, the whole of the unfallen world behind her — and she looked AT you. Across everything. As the pool looks at you. And she raised one hand, palm out: not a greeting. A PLACING. The gesture you make to set a stone in a wall.',
      'You choose, after, to live as what she made you: a placed stone. Keeper or witness, settler or wanderer — whatever else your days here become, you are the one the island showed its beginning to, and the knowing organizes everything. The Kaari have a word for it, Tekau tells you, very quietly, when you finally describe the hood and the hand: <em>vessa-tau</em>. The one the mother waits FOR. It appears in their counting songs exactly once a century.',
      'The last panel of the temple mural — the hooded figure, hand extended, facing out of the wall — was never unfinished, he says. It was a mirror.',
    ] },
  });

  // ==================================================================
  //  THE LIVING ISLAND — random event layer
  // ==================================================================
  const COMP_IDLE = {
    kavi: ['Mid-afternoon you look up and Kavi is asleep on his back, all four paws in the air, dignity entirely abandoned. You memorize it. He would deny it to his grave.', 'Kavi spends an hour today moving between three patches of shade in strict rotation, auditing each. Some patrols, you understand now, are just for the pleasure of the route.'],
    ipo: ['Ipo has invented a game involving a coconut shell, a slope, and gravity. He loses to gravity eleven consecutive times, with mounting outrage, and quits while insisting — you can tell — that the slope cheated.', 'You catch Ipo grooming his own reflection in your water gourd, parting his scruff with tremendous care. He sees you seeing. You both agree, silently, that this never happened.'],
    vela: ['Vela rides the afternoon thermal for an hour without one wingbeat, going nowhere, doing nothing but being magnificent at altitude. Not every flight is business. Some are just the wind, taken personally.', 'You find a single huge wing-feather planted upright in the sand at the tideline, precisely where you wash your catch. An invoice? A gift? With her, the ambiguity IS the message.'],
    buri: ['Buri discovers his own echo against the cliff and conducts a shouting match with it for the better part of the morning. It ends, as near as you can tell, in a draw he is very proud of.', 'Buri naps against the woodpile and the woodpile loses: a slow avalanche of logs over a sleeping pig who does not wake, merely resettles under the new blanket with a sound like distant thunder approving.'],
    moa: ['Moa has begun sorting your pebble pile — by size, you think, or by some poultry taxonomy past human knowing. She works at it daily. The pile is nearly HALF done, whatever done is.', 'A gull lands inside Moa\'s patrol perimeter and is escorted off the premises with such bureaucratic fury that you actually stand up to watch. The gull outweighs her twice. The gull leaves.'],
    nine: ['The tide pool by the point has been rearranged again: shells sorted, stones stacked two high, one blue bottle-glass fragment set at the center like a jewel in a setting. Her gallery. You never catch her curating it.', 'You wash your hands in the shallows and something patient and eight-armed grips your wrist gently, tastes your pulse for a moment, and lets go. Just checking. Just her.'],
  };

  const POOL = [
    { id: 'rev_drift', w: 3, when: (s) => s.site !== 'fringe' || s.chapter < 2 },
    { id: 'rev_bottle', w: 1.5, when: (s) => !TB.is('REV_BOTTLE3') },
    { id: 'rev_heron', w: 2, when: (s) => true },
    { id: 'rev_snake', w: 2, when: (s) => s.chapter >= 2 },
    { id: 'rev_hornbill', w: 2, when: (s) => s.site === 'fringe' || s.chapter >= 3 },
    { id: 'rev_windfall', w: 2.5, when: (s) => true },
    { id: 'rev_boarsign', w: 1.5, when: (s) => s.chapter >= 2 && s.chapter <= 4 && !TB.is('KING_FED') },
    { id: 'rev_orchid', w: 1.5, when: (s) => TB.is('EDDA_MET') && !TB.is('REV_ORCHID') },
    { id: 'rev_compidle', w: 4, when: (s) => !!s.companion },
    { id: 'rev_humflicker', w: 1, when: (s) => s.seg === 2 && !TB.is('REV_HUM') },
    // rare wonders — once per run, low weight
    { id: 'rev_greenflash', w: 0.5, rare: true, when: (s) => s.seg === 2 },
    { id: 'rev_hatching', w: 0.5, rare: true, when: (s) => s.chapter >= 3 },
    { id: 'rev_whales', w: 0.5, rare: true, when: (s) => s.chapter >= 3 },
    { id: 'rev_superbloom', w: 0.5, rare: true, when: (s) => s.seg === 2 },
  ];

  TB.randomEvent = function (s) {
    if (s.day <= 1 || s.seg >= 3 || R() > 0.18) return null;
    s.rlast = s.rlast || [];
    const eligible = POOL.filter((e) => {
      if (s.rlast.indexOf(e.id) >= 0) return false;
      if (e.rare && TB.is('DONE_' + e.id)) return false;
      try { return e.when(s); } catch (err) { return false; }
    });
    if (!eligible.length) return null;
    let total = 0; for (const e of eligible) total += e.w;
    let roll = R() * total, chosen = eligible[0];
    for (const e of eligible) { roll -= e.w; if (roll <= 0) { chosen = e; break; } }
    if (chosen.rare) TB.flag('DONE_' + chosen.id);
    s.rlast.push(chosen.id); if (s.rlast.length > 4) s.rlast.shift();
    return chosen.id;
  };

  const rev = (id, def) => { def.next = def.next || ((s) => backToCamp(s)); TB.scene(id, def); };

  rev('rev_drift', { bg: 'beach-day', text: (s) => {
    const finds = [
      ['The morning tide has left you a gift at the wrack line: a fisherman\'s float of blue glass, netted in rotten cord, whole and beautiful. Useless. You hang it by the door anyway. Some wealth is just blue.', 'hope'],
      ['Drift haul: a pallet plank (good wood), half a plastic crate (good everything), and a sealed jar of something fermented enough that you rebury it at the tideline with honors.', 'wood'],
      ['The sea sends breakfast: a raft of coconuts from some other island\'s storm, bobbing in the shallows like a delegation. You wade out and welcome them all.', 'food'],
    ];
    const f = pick(finds);
    if (f[1] === 'food') { TB.stat('hunger', 10); TB.stat('thirst', 10); } else if (f[1] === 'hope') TB.stat('hope', 3); else TB.state.food += 1;
    return ['<em>The tideline, on your morning round —</em>', f[0]];
  } });

  rev('rev_bottle', { bg: 'beach-dusk', text: (s) => {
    const stage = TB.is('REV_BOTTLE2') ? 3 : TB.is('REV_BOTTLE1') ? 2 : 1;
    TB.flag('REV_BOTTLE' + stage);
    if (stage === 1) return ['A bottle in the surf — a real one, corked, paper inside. Your heart does the whole stupid dance while you work the cork.', 'It is a wine label. On the back, in ballpoint, in Portuguese, a decade faded: <em>"If found, tell Marta the fish soup needed more salt and I said so to the end. — R."</em>', 'You laugh alone on an empty beach for a good minute, and add the bottle to the windowsill. Whoever Marta is: it needed more salt. He said so to the end.'];
    if (stage === 2) return ['Another bottle, months-traveled by the state of it. Inside, a child\'s drawing: a house, a dog, a sun with sunglasses, and careful block letters: <em>TO THE OSHEN. FROM LEO. 7.</em>', 'You pin Leo\'s work to the shelter post at eye level, where art belongs. The dog is excellent. The ocean, for its part, delivered.'];
    TB.stat('hope', 4); TB.route('signal', 1);
    return ['A third bottle — and this one is EMPTY, except for a stub of pencil and a curl of dry paper. An invitation if you\'ve ever held one.', 'You think for a long time, and write the truest small thing you own, and cork it hard, and throw it far past the reef line on the ebb.', 'What you wrote is yours. The sea is a slow post but it has never once lost a letter — every bottle on your sill proves it. Somewhere, someday, a stranger on a tideline. You wave to them across the years, and go back to work.'];
  } });

  rev('rev_heron', { bg: (s) => (TB.is('RIVER_KNOWN') && R() < 0.5 ? 'river' : 'beach-day'), text: (s) => {
    const n = (s.flags.HERON_N = (s.flags.HERON_N || 0) + 1);
    TB.stat('hope', 2);
    return [n === 1 ? 'A sandbar heron has adopted your fishing spot — stilt-legged, ash-grey, professionally unimpressed. It works the shallows an exact spear-length from you, which you both pretend is coincidence.' : pick(['The heron is back at its post, supervising your cast with the air of a foreman who has seen better. You catch two; it catches three, and makes sure you saw.', 'The heron today: one leg, one hour, zero movement, one fish. You have never respected any colleague more.']), ''].filter(Boolean);
  } });

  rev('rev_snake', { bg: 'camp-fringe', text: ['Reaching into the woodpile, you stop — a hand\'s breadth from a coil of banded muscle sleeping in the warm gap between logs. Sea krait: gentle, deadly, and exactly where hands go.', 'You back away with enormous politeness and evict it with the long pole and the old ceremony. It departs radiating offense. You shake the next three logs before lifting them, and will for a month.'], enter: (s) => { if (R() < 0.15 && !s.injury) { TB.stat('hope', -2); } } });

  rev('rev_hornbill', { bg: 'jungle', text: (s) => { TB.stat('hope', 3); return [pick(['A hornbill crosses the canopy like a thrown hatchet, whooshing with every beat — you HEAR the wings before you see the bird — and the whole jungle pauses a half-second in respect.', 'Two hornbills argue over a fig high above you, a sound like sticks in a bucket, until the fig drops and bounces off your shoulder. Verdict delivered. You eat the evidence.'])]; } });

  rev('rev_windfall', { bg: (s) => (s.chapter >= 2 && s.site === 'fringe' ? 'camp-fringe' : 'jungle'), text: (s) => { TB.stat('hunger', 12); TB.state.food += 1; return [pick(['The night wind has shaken the big fig, and the ground beneath is paved with breakfast. You fill the bag and leave the split ones to the ants, who arrived first and filed the paperwork.', 'A breadfruit branch has given up its whole arm in the night — a windfall in the oldest sense. You process the bounty like a shift at the world\'s greenest cannery.'])]; } });

  rev('rev_boarsign', { bg: (s) => campBg2(s), text: ['New sign at the treeline this morning: a rubbing-post rebarked at shoulder height — HIS shoulder height — and one deliberate print, deep as a post-hole, planted square in the middle of your path.', 'Not a raid. A memo. The inland dark keeps its books too, and it wants you to know your account remains open.'], enter: (s) => { if (!TB.is('REV_BOAR1')) { TB.flag('REV_BOAR1'); TB.route('depth', 1); } } });

  rev('rev_orchid', { bg: 'jungle', text: ['In the crook of a strangler fig, at exactly eye height, an orchid is doing something indecent with the color white: a spray of blooms like carved moonlight, scent like honey over cold stone.', 'You take one bloom and the location of the rest. There is an old botanist on a mountain who has definitely already found this species — but who has, you suspect, gone a very long time without anyone bringing her a flower about it.'], enter: (s) => { if (!TB.is('REV_ORCHID')) { TB.flag('REV_ORCHID'); s.edda = TB.clamp(s.edda + 3, 0, 100); TB.stat('hope', 2); } } });

  rev('rev_compidle', { bg: (s) => campBg2(s), who: (s) => ({ kavi: { emoji: '🐕', name: 'Kavi' }, ipo: { emoji: '🐒', name: 'Ipo' }, vela: { emoji: '🦅', name: 'Vela' }, buri: { emoji: '🐗', name: 'Buri' }, moa: { emoji: '🐔', name: 'Moa' }, nine: { emoji: '🐙', name: 'Nine' } }[s.companion]), text: (s) => [pick(COMP_IDLE[s.companion] || ['The day passes in good company.'])], enter: (s) => { TB.stat('hope', 2); TB.bond(1); } });

  rev('rev_humflicker', { bg: 'beach-dusk', text: ['At dusk, for three heartbeats, the lagoon glows EARLY — a soft premature shimmer running the length of the bay before the light has even properly left the sky. Then it subsides, embarrassed, to wait for dark like always.', 'You note it the way you note everything now. The island\'s clock keeps strange seconds lately.'], enter: (s) => { if (!TB.is('REV_HUM')) { TB.flag('REV_HUM'); TB.route('depth', 1); } } });

  // ---- rare wonders ------------------------------------------------------------
  rev('rev_greenflash', { bg: 'beach-dusk', text: ['You happen to be looking — that\'s the whole of it; the sea owes you nothing and pays anyway — at the exact half-second the sun\'s last edge goes under, and the horizon flares GREEN. One emerald heartbeat, gone before your breath finishes catching.', 'Sailors argue about whether it\'s real. You are done arguing about what\'s real. You stand a long time in the ordinary purple afterward, rich.'], enter: (s) => { TB.flag('GREENFLASH'); TB.stat('hope', 8); } });

  rev('rev_hatching', { bg: 'beach-night', text: ['The beach is MOVING. You come down to the tideline at dusk and the sand itself is boiling — turtle hatchlings, hundreds upon hundreds, erupting from the nests you never knew were under your feet, all of them scrambling seaward under the gathering stars.', 'You spend the whole night as a shepherd: warding the ghost crabs off with a brand, walking the gauntlet line, tipping the flipped ones right-side up with one gentle finger. By dawn the sand is stitched with ten thousand tiny tracks, all of them ending at the sea.', 'The island watched you do it. You know that now, the way you know the tide. Somewhere in a ledger older than the Kaari, ten thousand small debts were entered in your name.'], enter: (s) => { TB.flag('TURTLES'); TB.stat('hope', 6); TB.stat('energy', -8); TB.route('depth', 1); } });

  rev('rev_whales', { bg: (s) => (s.site === 'overhang' ? 'cliff-camp' : 'beach-day'), text: ['The sea breathes out — visibly, a mile off: a column of spray, then another, then FIVE, then the backs themselves, dark islands moving south in slow procession. Whales. A whole nation of them, passing your little kingdom without slowing.', 'You watch until they are weather on the horizon. The ocean feels different for days afterward: not emptier. Occupied. Neighborly. Very, very large.'], enter: (s) => { TB.flag('WHALES'); TB.stat('hope', 6); } });

  rev('rev_superbloom', { bg: 'beach-night', text: (s) => ['The lagoon outdoes itself tonight: not the usual soft pulse but a SUPERBLOOM, the whole bay burning blue-green rim to rim, every wavelet edged in cold fire, the seven beats rolling through it in visible waves like wind through wheat.', s.companion === 'nine' ? 'And out in the middle of the burning water, a familiar shape is DANCING — there is no other word: Nine, wheeling and jetting through the bloom, trailing spirals of light like a signature written over and over. Showing off. For the island, for the light, for you. You wade in to your knees and glow alongside.' : 'You wade in to your knees and stand in the light like standing in a sky. Every step you take blooms. You write your name in the water with one finger and watch the island hold it, bright, for three full beats before letting it go.'].filter(Boolean), enter: (s) => { TB.flag('SUPERBLOOM'); TB.stat('hope', 7); } });
})(window);
