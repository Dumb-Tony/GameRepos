/* =====================================================================
 * scenes-milestones.js — the 100-day expansion, Phase 4: authored
 * punctuation. Milestone days that make the long calendar FEEL long —
 * the first rain, the first month, the Great King Tide, the halfway
 * vigil, the still night in the monsoon's middle — plus Edda and Ryo
 * lore nights and the fever-dream cycle (a POOL event, heavily
 * weighted while fevered, so being sick finally pays lore).
 * =================================================================== */
(function (G) {
  'use strict';
  const TB = G.TB;
  const NAMES = { kavi: 'Kavi', ipo: 'Ipo', vela: 'Vela', buri: 'Buri', moa: 'Moa', nine: 'Nine' };
  const back = (s) => (s.chapter >= 2 ? 'camp2' : 'camp');

  TB.SCHEDULE.push(
    { d: 10, s: 2, id: 'ev_firstrain' },
    { d: 25, s: 2, id: 'ev_month1' },
    { d: 30, s: 2, id: 'ev_eddastory1', when: (s) => TB.is('EDDA_MET') },
    { d: 42, s: 3, id: 'ev_kingtide2' },
    { d: 45, s: 2, id: 'ev_eddastory2', when: (s) => TB.is('EDDA_MET') },
    { d: 48, s: 2, id: 'ev_ryoyarn', when: (s) => TB.is('RYO_MET') },
    { d: 50, s: 2, id: 'ev_halfway' },
    { d: 65, s: 3, id: 'ev_stillnight', when: (s) => s.chapter === 5 },
  );

  // ---- Day 10: the First Rain -------------------------------------------------
  TB.scene('ev_firstrain', {
    bg: 'beach-dusk',
    enter: (s) => { if (!TB.is('FIRST_RAIN')) { TB.flag('FIRST_RAIN'); TB.stat('thirst', 14); TB.stat('hope', s.shelter >= 1 ? 5 : 2); } },
    text: (s) => [
      'Ten days without rain — you hadn\'t counted until the sky did it for you. It comes at dusk with no ceremony at all: a greying, a hush, then the first fat drops printing dark coins on the sand, then everything, everywhere, warm and vertical and loud.',
      s.shelter >= 1 ? 'And you get to do the single most luxurious thing a castaway can do: you get to go INSIDE. You sit under your own thatch with your own fire muttering and the rain hammering someone else\'s problem out there, and the shelter — every hour you sweated into it — pays its whole mortgage in one evening.' : 'You have no roof, so you attend the rain in person: standing out in it, arms out, mouth open, doing laundry and bathing and drinking all at once like a fool, like a child, like the only sensible response. Tomorrow, you tell the streaming sky, we build the roof. TOMORROW.',
      'Every container fills. The jungle drinks so loudly you can hear it — a hiss of a million leaves taking their cut — and when the rain walks off over the reef an hour later, the whole island smells like the inside of a green jar, and the frogs hold their first parliament of the season.',
    ],
    next: back,
    nextLabel: 'Listen a while, then sleep ➤',
  });

  // ---- Day 25: the First Month (near enough) -----------------------------------
  TB.scene('ev_month1', {
    bg: (s) => (s.site === 'fringe' ? 'camp-fringe' : s.site === 'overhang' ? 'cliff-camp' : 'beach-dusk'),
    enter: (s) => { if (!TB.is('MONTH1')) { TB.flag('MONTH1'); TB.stat('hope', 4); TB.route('roots', 1); } },
    text: (s) => [
      'You catch it in the Ledger at dusk: the tally marks have crossed twenty-five. Nearly a month. A MONTH — the word belongs to rent and calendars and another person\'s life, and here it is on a stick of charcoal, yours.',
      'So you hold the small ceremony the date demands: an inventory of the person keeping the tally. Hands: callused in a new map. Feet: leather. Body: lean, salt-cured, competent in eleven ways it wasn\'t. And the pilot-light behind your ribs that the first week nearly drowned — you check it the way you check the fire, and find it, against every reasonable forecast, burning.',
      s.companion ? NAMES[s.companion] + ' watches the whole audit from arm\'s reach, and when you finally look up, the look you get back is the plainest sentence a wild thing can write: <em>a month, and you\'re still here, and so am I.</em> You split the good fish two ways for dinner. Anniversaries are for households.' : 'You mark the day the solo way: the good fish, cooked properly, eaten slowly at the good spot at the good hour. The island makes the vast golden fuss it makes of every dusk, which tonight you elect to take personally.',
    ],
    next: back,
    nextLabel: 'Month two, then ➤',
  });

  // ---- Day 30: Edda's story, part one -------------------------------------------
  TB.scene('ev_eddastory1', {
    bg: 'grove', who: { emoji: '👵', name: 'Edda Voss', art: 'char-edda' },
    enter: (s) => { if (!TB.is('EDDA_STORY1')) { TB.flag('EDDA_STORY1'); s.edda = TB.clamp((s.edda || 0) + 8, 0, 100); TB.stat('hope', 3); } },
    text: (s) => [
      'You\'re at the grove at dusk trading fish for greens when Edda, unprompted, mid-pour of the tea, says: "Fifty-three years ago this season, I saw this island from a ship\'s rail and told the botanist beside me it looked like a green cathedral. She said it looked like a trap that had learned patience." A pause. "We were both right. She was righter."',
      'It comes out in pieces, the way she does everything: the research charter of \'72, the mad sponsor money, the year the world was going to be measured into obedience. Twenty-six years old, the expedition\'s plant-woman, seasick the whole way out — "and then the fog opened, castaway, and the island was THERE, and every instrument on the bridge lost its mind at once, and I looked at all that green not-on-any-chart and I thought — God forgive the young — <em>finders keepers.</em>"',
      'She stops there tonight — the kettle\'s empty; the rest, her face says, costs more than one evening — but as you leave she adds, at your back, quietly: "It kept us instead, of course. It keeps everyone worth keeping. You\'ll have noticed." You walk home down her mountain in the last light, carrying vegetables and half a history, and the island is a different shape around you: not your predicament. Her whole life.',
    ],
    next: back,
  });

  // ---- Day 42: the Great King Tide ------------------------------------------------
  TB.scene('ev_kingtide2', {
    bg: 'beach-night',
    enter: (s) => { if (!TB.is('GREAT_TIDE')) { TB.flag('GREAT_TIDE'); TB.route('depth', 2); TB.stat('hope', 4); } },
    text: (s) => [
      'The sea has been climbing all day — the year\'s great king tide, the moon hauling the whole Pacific up your beach — and at midnight it peaks, and the island shows you what the spring tides are FOR.',
      'The lagoon\'s glow doesn\'t haze tonight; it BURNS: seven beats running the reef line like a lit fuse, bright enough to read by, bright enough to cast your shadow up the sand. And out past the reef gate, where the tide has drowned rocks that are never drowned, the light goes down and down and down — and there is a stair. You will argue with yourself about this for days; you are not arguing tonight. Steps. Cut steps, wide as a road, descending out of the world\'s reach, lit seven at a time, patient as everything here is patient.',
      'The tide turns. The sea walks back down the beach with its lantern dimming, hanging its wrack-line crown a full six feet above the usual mark. By morning it will all be arguable again.' + (s.companion ? ' ' + NAMES[s.companion] + ' watched the whole hour beside you without one sound, and does not look at you after — the way you don\'t look at someone when you\'ve been to church together by accident.' : ' You stand alone on the returned beach with your feet in the ordinary foam, and add the stair to the Ledger, in small letters, where the island can see you keeping its secret.'),
    ],
    next: (s) => (s.chapter >= 2 ? 'night2' : 'night'),
  });

  // ---- Day 45: Edda's story, part two — Ilsa and Aleksander -------------------------
  TB.scene('ev_eddastory2', {
    bg: 'grove', who: { emoji: '👵', name: 'Edda Voss', art: 'char-edda' },
    enter: (s) => { if (!TB.is('EDDA_STORY2')) { TB.flag('EDDA_STORY2'); TB.flag('EDDA_GRAVES'); s.edda = TB.clamp((s.edda || 0) + 8, 0, 100); } },
    text: (s) => [
      'The kettle\'s second evening comes two weeks later, unannounced. She hands you your tea, sits, looks at the flowering tree at the grove\'s heart for a while, and says: "Ilsa Vane heard it first. Before the instruments. She stood on the survey deck our third morning and said the island was HUMMING, and her husband — the great Aleksander Vane, measurer of everything — laughed at her." A long sip. "He spent the next thirty years trying to apologize in mathematics."',
      'Ilsa: the expedition\'s acoustician, the one true genius of the lot — "the rest of us were clever; she was LISTENING" — who befriended a seasick young botanist, and taught her the seven-beat count on a night watch, and swore her to the only oath that ever mattered here: <em>we describe; we do not disturb.</em> And Aleksander, who loved his wife and loved his sponsors and discovered too late which love the island was grading. The Incident. The fever after. The choosing — hers, to stay in the ground she\'d listened to; his, to stay above it, unforgiven by exactly one person, forever, in the second person.',
      'She walks you to the flowering tree before you go — you understand now; you\'ve always half-understood — and rests one hand on it, the way you\'d wake a sleeper gently. Two stones beneath, moss-kept, tended half a century. "You asked once why I stayed," she says. "I didn\'t. I just stopped pretending anywhere else was real." She pours the last of the pot at the roots, and that, tonight, is the whole of the service, and being let stand in it is the largest thing anyone on this island has given you yet.',
    ],
    next: back,
  });

  // ---- Day 48: Ryo's yarn ------------------------------------------------------------
  TB.scene('ev_ryoyarn', {
    bg: 'beach-night', who: { emoji: '⛵', name: 'Ryo Nakata', art: 'char-ryo' },
    enter: (s) => { if (!TB.is('RYO_YARN')) { TB.flag('RYO_YARN'); s.ryo = TB.clamp((s.ryo || 0) + 8, 0, 100); TB.stat('hope', 4); } },
    text: (s) => [
      'Ryo turns up at your fire at dusk with two mugs of his terrible tea and the specific expression of a sailor who has decided it is story night, and there is no mechanism for refusal.',
      'He tells you about the wave. Not the one that brought him here — the OTHER one, Tasman Sea, year two of the voyage: the freak sea that took the Kingfisher\'s first mast at three in the morning, "and I am standing in the companionway, castaway, holding a mug — this mug — and the whole sky is where the mast should be." He rebuilt her in a fishing town over four months with borrowed tools and sign language, and the town turned out to launch her, "and an old man who never once spoke to me kisses her hull, like THIS, and walks away. Boats collect people. It is what they are for. The sailing is a side effect."',
      'He\'s quiet a while, firelight on the mug\'s chipped rim. "So. This island collects people, same as her." A nod at the dark, at the mountain, at all of it. "I am angry about it some mornings still. And then I remember the old man, and I think — maybe be the town, eh? Maybe be the town." He washes both mugs in the surf before he goes, and you sit up a while with the fire, being, as far as you can manage it, the town.',
    ],
    next: back,
  });

  // ---- Day 50: the Halfway Vigil -----------------------------------------------------
  TB.scene('ev_halfway', {
    bg: (s) => (s.site === 'fringe' ? 'camp-fringe' : s.site === 'overhang' ? 'cliff-camp' : 'beach-dusk'),
    enter: (s) => { if (!TB.is('HALFWAY')) { TB.flag('HALFWAY'); TB.stat('hope', 6); } },
    text: (s) => {
      const known = [TB.is('EDDA_MET') && 'a hermit\'s tea', TB.is('RYO_MET') && 'a sailor\'s terrible jokes', s.companion && ('the whole weather-system of ' + NAMES[s.companion]), TB.is('GRIN_MET') && 'a crocodile\'s posted terms', TB.is('KING_SEEN') && 'a king\'s boundary', (TB.is('GULLET1') || TB.is('TEMPLE_SEEN')) && 'the shape of the dark under the mountain'].filter(Boolean);
      return [
        'Day fifty. You do the arithmetic twice at dusk because the first result seems impertinent: half of one hundred. If the island\'s old accounting is real — and you\'ve stopped betting against its accounting — you stand tonight at the exact middle of whatever this is.',
        'So you keep the vigil the number seems to ask for: fire built high, the good log dragged around to face the sea, and the whole first half reviewed like a captain reading back the log. The person who washed up here could not make fire, read weather, gut a fish, or sit still with their own heart for ten minutes. The person at this fire tonight holds ' + (known.length ? known.join(', ') + ', and ' : '') + 'a Ledger going on ' + Object.keys(s.flags).length + ' entries deep — every one of them paid for in daylight.',
        'And the second half stands out there past the firelight where tomorrow keeps its country: the rain season\'s reckoning, the mountain\'s unfinished business, the hundred days\' question waiting at the end like a held-out hand. You bank the fire at moonrise and make the middle of your life here the only promise it needs: <em>whoever finishes this, let it still be you.</em>',
      ];
    },
    next: back,
    nextLabel: 'Into the second half ➤',
  });

  // ---- Day 65: the Stillnight (monsoon's held breath) ---------------------------------
  TB.scene('ev_stillnight', {
    bg: 'beach-night',
    enter: (s) => { if (!TB.is('STILLNIGHT')) { TB.flag('STILLNIGHT'); TB.stat('hope', 5); TB.stat('energy', 8); TB.route('depth', 1); } },
    text: (s) => [
      'You wake at midnight to a sound you cannot place, and place it, and sit straight up: <em>nothing.</em> The rain has stopped. Twelve days of drumming — on thatch, on leaves, on the sea, on the inside of your skull — and the monsoon has simply, impossibly, held its breath.',
      'The whole island is awake in it. You can feel that from your doorway: the dripping dark standing at attention, frogs silent, surf gentled, the cloud ceiling split down the middle like a drawn curtain and the stars pouring through the gap in a river. And in the hush, unhurried, unmissable, the lagoon runs its seven beats so purely you finally hear what the rain has been muffling for two weeks: the island never once stopped saying it.',
      'It lasts perhaps an hour. You spend all of it outside' + (s.companion ? ', ' + NAMES[s.companion] + ' pressed warm against your side, both of you listening like guests who know better than to speak during the music' : ', alone at the tideline with your heart beating six and resting one, which you notice, and decline to examine') + '. Then the curtain draws back over, one polite drop taps your shoulder like an usher, and the deluge resumes as if it never paused. Back under the thatch, warmer than the night explains, you sleep better than you have all season.',
    ],
    next: (s) => 'night2',
  });

  // ---- the fever-dream cycle: being sick finally pays lore -----------------------------
  // The pool entry lives in scenes-extra (heavy weight while fevered).
  TB.scene('ev_feverdream', {
    bg: 'jungle-night',
    enter: (s) => {
      const key = s.day + '.' + s.seg;
      if (s.lastDreamKey === key) return; // scene re-entered on continue
      s.lastDreamKey = key;
      const stage = TB.is('FEVERDREAM2') ? 3 : TB.is('FEVERDREAM1') ? 2 : 1;
      TB.flag('FEVERDREAM' + stage); TB.route('depth', 2);
      s.lastDream = stage;
    },
    text: (s) => {
      const stage = s.lastDream || 1;
      if (stage === 1) return ['The fever takes the afternoon and hands it to somewhere else.',
        'You are on the mountain — the mountain WHOLE, its crown unbroken, wearing terraces like a green robe sewn with cook-smoke — and the light is the amber of no hour you\'ve ever lived. Boats below, sails like wings. Songs you almost know, in a language your bones read fluently. And on the great stair, far up, a figure in a sea-speaker\'s hood turns — slowly, the way lighthouses turn — toward the exact place where you are standing in a dream fifty generations too late.',
        'You surface soaked and shaking with the fever\'s hand still on you, and the dream does not fade the way fevers\' dreams are supposed to. It files itself. Somewhere between your ribs, it is still filed now. <em>(The fever burns; the island shows. There is more, if the sickness runs its course — though no one sane would choose that price.)</em>'];
      if (stage === 2) return ['The second dream goes DOWN.',
        'Under the island — under the under — you sink through galleries your waking feet have walked and past them, past the marked lines, past the painted hands, to water that has never once been lit… except that it is lit. Ahead. Below. A door of light the size of weather, opening and closing, opening and closing, seven and one, seven and one — a heart, or a lung, or a lighthouse for things that navigate by patience. Shapes cross it. Slow, vast, unbothered shapes, coming and going like citizens through a harbor gate.',
        'And the door notices you — dreams have no distance; it simply KNOWS you, the way the pool knows you — and its light dims once, deliberately. Not a threat. A nod. <em>Seen. Counted. Not yet.</em>',
        'You wake with your pulse tapping seven-and-rest and your mouth full of the word "harbor." The fever bark is bitter beyond description. You drink every drop.'];
      return ['The last dream is quiet, and it is the worst, and the best.',
        'A room you\'ve never entered: lamplight, paper, instrument parts on a workbench, and a woman with silver-streaked hair bent to a listening horn, her back to you. You know her from a photograph on a station wall. Ilsa Vane does not turn around. She only says, conversationally, to the horn, or the island, or you — the dream declines to distinguish: <em>"They keep asking what it means. It\'s a LULLABY, obviously. The question — write this down, whoever\'s there — the question is what it\'s keeping asleep, and what wakes it, and whether we are the song or the dreamer."</em> Then, softer, in Edda\'s exact cadence: <em>"Drink your bark. Mind the seventh beat. And tell my idiot husband the residual was never error."</em>',
        'The fever breaks that night — you feel it go like a tide releasing a hull — and you lie in the sweat-wrecked dark absurdly certain that you were visited, and dismissed, and prescribed for, by the best listener this island ever kept. In the morning you write down every word. The Ledger takes them without comment, but it takes them, you\'d swear, GENTLY.'];
    },
    next: back,
  });
})(window);
