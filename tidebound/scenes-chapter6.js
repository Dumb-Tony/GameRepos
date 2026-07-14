/* =====================================================================
 * scenes-chapter6.js — Chapter Six: Ashes and Stairs (Days 71–85).
 * The rains break; the mountain opens. A LINEAR expedition chapter:
 * the Terrace of Steps, the Tidewell Temple, the tremor ladder, the
 * Inner Green (admission gated on the run's accumulated regard), and
 * the chapter threshold: THE TIDEWELL's three doors.
 * Scenes chain directly (no camp hub); each leg ticks time via chain().
 * =================================================================== */
(function (G) {
  'use strict';
  const TB = G.TB;

  const NAMES = { kavi: 'Kavi', ipo: 'Ipo', vela: 'Vela', buri: 'Buri', moa: 'Moa', nine: 'Nine' };
  const EDDA = { emoji: '👵', name: 'Edda Voss', art: 'char-edda' };
  const NAIA = { emoji: '🌿', name: 'Naia', art: 'char-naia' };
  const TEKAU = { emoji: '🗿', name: 'Tekau, Elder Speaker', art: 'char-tekau' };

  // advance most of a day and continue the chain (with an honest death check)
  const chain = (id, ticks) => () => {
    for (let i = 0; i < (ticks || 2); i++) TB.tickSegment();
    return TB.state.deathCause ? 'death' : id;
  };
  // how the island has "scored" this run — used for Inner Green admission
  TB.regard = function () {
    let r = 0;
    if (TB.is('KING_FED') || TB.is('KING_TITHED') || TB.is('KING_SYMPATHY')) r++;
    if (TB.is('EAST_OPEN') && !TB.is('GRIN_FOUGHT')) r++;
    if (TB.is('FILES_BURNED') || TB.is('FILES_TO_EDDA')) r++;
    if (TB.is('EDDA_WINTER') || TB.is('EDDA_TENDED')) r++;
    if (TB.state.trust >= 75) r++;
    if (TB.is('SUNDERING_SEEN')) r++;
    if (TB.is('NAIA_TRUSTED') || TB.is('NAIA_TERMS')) r++;
    if (TB.is('MOA_FOUND') || TB.is('VELA_MANTLED') || TB.is('HEART2_DONE')) r++;
    if (TB.is('TURTLES') || TB.is('TREASURE_LEFT')) r++; // mercies the island witnessed
    return r;
  };

  // ---- Chapter open: the rains break -------------------------------------------------
  TB.scene('ch6_open', {
    bg: 'beach-day',
    enter: (s) => { if (s.chapter < 6) { s.chapter = 6; s.day = 71; s.seg = 0; } },
    text: (s) => [
      '<em>CHAPTER SIX — ASHES AND STAIRS</em>',
      'On the twenty-ninth morning you wake to a wrongness and take a full minute to name it: <em>silence</em>. The drumming has stopped. The ceiling has lifted. The world stands rinsed and dripping and impossibly green under a sky you\'d half forgotten, and the broken mountain — the whole chapter of it, crown to knee — stands clear against the washed blue like a door finally lit.',
      TB.is('INNER_INVITED') ? 'And at your fire, waiting with two woven packs and the patience of a professional watcher: Naia. "The rains end," she says, rising. "The old ones remember your name. We walk." It is not entirely a request.' : 'The mountain waits. Whatever the season decided in you, its proof lies up there — the temple the paintings promised, the caldera behind the broken crown, the source of the seven beats you\'ve slept against for a month.',
      s.companion ? NAMES[s.companion] + ' reads the pack you\'re loading and takes up position by the trailhead: coming. That was never going to be a discussion.' : 'You bank the fire, square Coco on his shelf facing the mountain — someone should keep an eye on camp — and shoulder the pack alone.',
      TB.is('RYO_MET') ? 'Ryo talks himself out of coming at his own boat\'s gunwale: "Mountains," he says, with a sailor\'s full contempt for gradients, "are just waves that gave up. Somebody has to mind the sea things. Come back with a good story." His handshake says the rest of it.' : '',
      'You provision for five days on the mountain. How do you load?',
    ].filter(Boolean),
    choices: [
      { t: '🎒 Heavy: full stores, full water, the whole kit.', sub: 'Slow and certain. The mountain won\'t starve you.',
        do: (s) => { TB.stat('hunger', 25); TB.stat('thirst', 20); TB.stat('energy', -10); if (s.food > 0) s.food -= 2; TB.flag('PACK_HEAVY'); },
        go: 'ch6_terrace' },
      { t: '🪶 Light: speed, weapons, and trust in the trail.', sub: 'Fast and hungry. Forage as you climb.',
        do: (s) => { TB.stat('energy', 6); TB.flag('PACK_LIGHT'); },
        go: 'ch6_terrace' },
    ],
  });

  // ---- The Terrace of Steps ------------------------------------------------------------
  TB.scene('ch6_terrace', {
    bg: 'jungle',
    text: (s) => [
      'The first day is jungle, then the jungle changes its mind.',
      'It happens underfoot before it happens to your eyes: the trail firms, levels, <em>squares</em> — and then the green opens and you are standing at the foot of the Terrace of Steps, and you stop walking because some things demand it.',
      'Stairs. A processional stair twenty people wide, dry-laid, riding the mountain\'s knee in flight after flight after flight — hundreds of steps, thousands — each tread worn spoon-deep at its center by bare feet across centuries. Terraced fields step away from it on both sides to the edge of sight, walls holding, forms holding, a whole civilization\'s agriculture asleep under fifty generations of green.',
      TB.is('GLYPH2') ? 'Your fallen terrace wall in the Green Deep was an outlying farm. This is the <em>capital</em>.' : 'The stones you found in the Green Deep were margins. This is the text.',
      TB.is('INNER_INVITED') ? 'Naia climbs beside you and watches you take it in with open, wolfish satisfaction — the pride of someone showing you their family\'s house. "All this, ours," she says. "Before the mountain broke. You walk on my grandmothers\' road, castaway." She takes the spoon-worn center of each step, deliberately, and after the third flight, so do you.' : 'You climb the worn centers of the steps — it feels wrong anywhere else — and the mountain accepts you upward, flight after flight, the sea unrolling behind you until your whole known world is a bright toy at the stair\'s foot.',
      s.companion === 'buri' ? 'Buri takes the ten thousand stairs as a personal enemy and defeats them one by one, with commentary. By the top of the fourth flight he has opinions about the Kaari\'s attitude to ramps.' : s.companion === 'vela' ? 'Vela rides the mountain\'s standing wind alongside the stair, level with you, then above — and for once she doesn\'t range. She keeps station. Escort formation, the whole climb.' : '',
      'You camp the first night on a terrace lip under the washed stars, the stair vanishing up into the dark above like an argument the mountain hasn\'t finished making.',
    ].filter(Boolean),
    nextLabel: 'Climb on ➤',
    next: chain('ch6_temple', 3),
  });

  // ---- The Tidewell Temple ---------------------------------------------------------------
  TB.scene('ch6_temple', {
    bg: 'temple',
    enter: (s) => { if (!TB.is('TEMPLE_SEEN')) { TB.flag('TEMPLE_SEEN'); TB.route('depth', 2); } },
    text: (s) => [
      'The stair ends at the temple, and the temple ends at the sea — which is impossible, because you are eight hundred feet above it.',
      'The Tidewell Temple is cut into the mountain\'s shoulder: a nave of standing stone open to the sky, walls carved past weathering with the spiral in every size — and half its floor is <em>water</em>. A pool, black and utterly clear, fills the nave\'s lower end, and the water breathes. Rises, falls. Seven beats. You watch it run its cycle three times before your mind accepts what your eyes and the last month have already agreed on: the pool is plumbed to the sea through the whole body of the mountain — the throat, the Gullet, the channels the Kaari drew — and it keeps the island\'s time here, at the top of everything, like a heart on an altar.',
      'The Tidewell. Not a name. A <em>description</em>.',
      TB.is('SUNDERING_SEEN') ? 'The murals here continue the Gallery of Hands — the same painters\' tradition, later chapters: the survivors\' descendants at this pool, generation after generation, and always one figure alone at the water\'s edge in a marked hood: a keeper. A guardian. The covenant, kept in unbroken sequence, right up to a final panel where the hooded figure stands facing OUT of the wall, at the viewer, hand extended. At you. The way every mural tradition ends when it hasn\'t ended.' : 'Murals ring the nave in fading procession: boats, fields, the mountain breaking, the survivors walking into stone — and, repeated down the centuries of panels, one hooded figure alone at the pool\'s edge. A keeper. Generations of them. The last panel\'s keeper faces outward, hand extended, unfinished — or waiting.',
      s.companion === 'moa' ? 'The nave\'s acoustics take the sea-boom of the pool and roll it around the stone like weather — storm-sound, everywhere, constant. Moa flattens once, feathers slicked… and then, deliberately, in the little sergeant\'s march she does when she has decided something is HERS to patrol, she walks the whole rim of the sounding nave at your side without breaking. Brave feather. All the way to the top of the world.' : s.companion === 'nine' ? 'And Nine — Nine you gave the shore weeks ago is HERE, in the Tidewell pool, rising against the black water with her mantle running its seven-beat light: she has come up through the inside of the mountain, through channels no map holds, to be at this pool when you reached it. However far you travel on this island, you understand at last, you have never once traveled away from her.' : '',
      'You do not touch the water. Not yet. Some doors you knock on from a respectful distance first.',
    ].filter(Boolean),
    nextLabel: 'Higher ➤',
    next: () => {
      for (let i = 0; i < 3; i++) TB.tickSegment();
      if (TB.state.deathCause) return 'death';
      return TB.is('GLYPH1') && TB.is('GLYPH2') && TB.is('GLYPH3') && !TB.is('VISION_SEEN') ? 'ch6_vision' : 'ch6_tremor';
    },
  });

  // ---- The time-slip (all three glyph stones found) ---------------------------------
  TB.scene('ch6_vision', {
    bg: 'temple',
    text: [
      'Before you leave the nave, the wall stops you.',
      'You\'ve been carrying the three glyph stones in your head for weeks — the spiral cut three ways, the re-carved line, the inlay that held your reflection late. And here, low on the temple\'s oldest course, where a casual eye slides past: all three marks TOGETHER, nested, a triple spiral the size of your spread hand — and worn into its center, polished by centuries of exactly this, a hollow.',
      'At the height of your own palm. Like the one in the Gallery of Hands. You already know you\'re going to do it. You already know the island knows.',
      'You place your hand in the hollow, at the turn of the tide —',
      '— and you are standing on the Terrace of Steps under an UNBROKEN mountain, in air thick with a thousand cook-fires, and the sea below is full of wings: boats, hundreds of boats, sails like herons\' wings, coming in to the first landing. Nine centuries deep. The arrival itself.',
      'And on the great stair a woman turns — sea-speaker\'s hood, the spiral at her collar, the whole unfallen world at her back — and she looks AT you. Across everything. The way the pool looks at you. She is not surprised. She raises one hand, palm out: not a greeting. A <em>placing</em> — the gesture for setting a stone in a wall.',
      'Then the tide turns fully, and you are on your knees in the drowned nave with your hand aching and the water running its seven beats, and eight hundred years of dust motes settling around you like something that has just moved through, going home.',
    ],
    enter: (s) => { if (!TB.is('VISION_SEEN')) { TB.flag('VISION_SEEN'); TB.route('depth', 3); TB.stat('hope', 4); } },
    nextLabel: 'Higher ➤',
    next: chain('ch6_tremor', 1),
  });

  // ---- The tremor ladder --------------------------------------------------------------------
  TB.scene('ch6_tremor', {
    bg: 'cliff-camp',
    enter: (s) => { if (!TB.is('TREMORS')) { TB.flag('TREMORS'); TB.stat('hope', -4); } },
    text: (s) => [
      'The mountain moves on the third day.',
      s.companion === 'moa' ? 'Moa knows first — a full minute first: she goes rigid on your pack, issues one flat mechanical note you have never heard from her, and every bird on the mountainside goes up at once like thrown grain—' : 'The birds know first: every wing on the mountainside goes up at once, a rattling sheet of them against the blue—',
      'Then the ground shrugs. Not violently — a long, muscular roll, like something enormous turning over in shallow sleep — but it goes ON, seven, eight, nine seconds, while the stair\'s ancient stones grate and settle and a slab of cliff lets go somewhere across the valley with a boom like the E-wing door.',
      'Then stillness. Then, distinctly, twenty minutes later: again, smaller. And in the evening: again.',
      'A ladder of tremors, climbing.' + (TB.is('WOUND_SEEN') ? ' And you have seen the rungs\' source with your own lamp: the guttering seam, the spiderweb crack around Halcyon\'s bore, the wound that never healed — flickering now in your memory in exact time with the ground\'s complaint. The island isn\'t stirring in its sleep. It\'s <em>favoring an injury</em>.' : TB.is('INCIDENT_FILES') ? ' Vane\'s last page stands up in your memory in her deliberate architecture: <em>If it ever begins skipping — I hope no one is here to read what that means.</em> You are here. You are reading it.' : ' The skipping pulse, the stuttering lagoon, and now the ground itself. Whatever conversation the island has been having with itself all month, it is getting louder.'),
      TB.is('INNER_INVITED') ? 'Naia\'s face, through all of it, is the worst part: not surprised. Grim, and young, and <em>unsurprised</em>. "Since the rains started," she says. "Worse each week. It is why the old ones agreed to see you at all, castaway. Come. We are close, and they will want the daylight."' : 'You make the night\'s camp on bedrock, away from anything that can fall, and sleep in your boots with the ground\'s pulse in your teeth.',
    ],
    nextLabel: 'The last ascent ➤',
    next: chain('ch6_inner', 2),
  });

  // ---- The Inner Green / the rim ---------------------------------------------------------------
  TB.scene('ch6_inner', {
    bg: 'caldera',
    who: (s) => (TB.is('INNER_INVITED') ? TEKAU : null),
    enter: (s) => {
      if (TB.is('INNER_JUDGED')) return;
      TB.flag('INNER_JUDGED');
      const admitted = TB.is('INNER_INVITED') && TB.regard() >= 4;
      if (admitted) { TB.flag('INNER_GREEN'); TB.route('depth', 3); TB.stat('hope', 8); }
      else if (TB.is('INNER_INVITED')) { TB.flag('INNER_PROBATION'); TB.route('depth', 2); }
      else { TB.flag('RIM_ONLY'); TB.route('depth', 2); }
    },
    text: (s) => {
      const t = ['The broken crown takes the last morning: a scramble up ash-slopes and rope-worn chimneys to the rim itself — and then the world ends, and starts over.',
        'The caldera opens under you like a secret the size of a valley: two miles across, ringed in shattered crown-rock — and <em>green</em>. Not jungle-green: <em>garden</em>-green. Terraces, orchards, roofs of woven living trees, threads of smoke rising straight in the sheltered air, water gleaming in channels that run — you follow them with your eye and your breath goes — in spirals. A town. A living town, in the wound of the mountain, invisible to every chart, every plane, every year of the world since the seventeenth century.',
        'The Inner Green. They went in. <em>They stayed in.</em>'];
      if (TB.is('INNER_GREEN')) {
        t.push('They meet you on the rim path — a dozen of them, silent, watchful, dressed like Naia in the colors of the walls — and at their center an old man with a staff of black heartglass-veined wood and eyes like the Tidewell: Tekau, Elder Speaker, who looks at you for a long moment and then speaks in slow, rust-thick English, learned — you realize with a jolt — from the same decades of listening that taught Naia:',
          '"Castaway. Seventy days and more, the island has watched you." He begins, staff striking soft time on the stone, to recite — and it is your Ledger, spoken aloud on a mountaintop by a stranger: the fires you built and banked. The one you fed at your boundary. The toll you paid without blood. The graves you didn\'t disturb, the drawer you ' + (TB.is('FILES_BURNED') ? 'burned' : TB.is('FILES_TO_EDDA') ? 'carried, unopened, up a mountain' : 'weighed') + ', the hand you set in the hollow of a people you\'d never met.' + (s.companion ? ' And last, longest: "…and the ' + ({ kavi: 'grey dog', ipo: 'laughing thief', vela: 'old blind-eyed queen of the cliffs', buri: 'young tusker', moa: 'small brave hen', nine: 'nine-armed daughter of the tide' }[s.companion]) + ', who chose you, and stayed. The island speaks through its lives, castaway. That one\'s testimony outweighs the rest of this list."' : ''),
          'He lowers the staff. Behind him, Naia is not breathing. "Come down," Tekau says simply, and turns. "Guests eat first. It is a rule older than the mountain\'s temper."',
          'You walk down into the Inner Green as the first outsider in three hundred and something years, and the town watches you pass with eyes like held questions — and children, at the edges, whose curiosity has already escaped custody entirely.');
      } else if (TB.is('INNER_PROBATION')) {
        t.push('They meet you on the rim path — a dozen, silent — and their Speaker, an old man with a heartglass-veined staff, hears Naia\'s long recitation of your month… and stops her, gently, with one raised hand, at the parts that weigh the other way: ' + (TB.is('GRIN_FOUGHT') ? 'the blood you spilled in the landlord\'s water. ' : '') + (TB.is('INCIDENT_FILES') ? 'The dead woman\'s drawer you opened against her asking. ' : '') + (TB.state.trust < 50 && s.companion ? 'The bond you let thin while you built. ' : '') + 'The scales, his silence says, have not settled.',
          '"Not down," he says at last, in slow rust-thick English. "Not yet. The mountain is troubled, and we are careful, and you are — new." He studies you, long and not unkindly. "Stand at the water tonight, castaway. The Tidewell reads truer than lists. Then we will speak again."',
          'You camp on the rim, above a hidden civilization and below the verdict, and Naia sits with you in the dark, furious on your behalf in two languages.');
      } else {
        t.push('You lie flat on the rim-rock and watch the impossible town for an hour, heart hammering — and you are not surprised, somehow, when the watchers find you: three of them, rising out of the crown-rock where nothing was, spears grounded but present, faces closed.',
          'No words reach across. They do not attack; they do not invite; they stand between you and the downward path with the settled patience of a wall, and one of them — youngest, fiercest, familiar in a way you can\'t place — points, once, back the way you came, and then, after a heartbeat\'s hesitation, at the temple below. <em>Not here. There.</em>',
          'The island\'s people keep their door. But they have pointed you, unmistakably, at the water.');
      }
      return t;
    },
    nextLabel: 'To the water ➤',
    next: chain('ch6_threshold', 2),
  });

  // ---- THE TIDEWELL (chapter threshold) -----------------------------------------------------------
  TB.scene('ch6_threshold', {
    bg: 'temple',
    text: (s) => [
      '<em>THE TIDEWELL</em>',
      'You come back down to the temple at dusk on the eighty-fourth day' + (TB.is('INNER_GREEN') ? ', with Tekau and Naia and half the Inner Green\'s council standing back at the nave\'s edge — this part, their bearing says, is walked alone' : '') + ', and the pool receives your lamplight and gives it back changed, seven beats at a time.',
      'And standing at the water\'s edge, at the exact spot where fifty generations of painted keepers stood, you finally understand what this place is for. The knowledge doesn\'t arrive as words. It arrives the way the tide arrives — total, patient, indifferent to doubt: the pool is the island\'s <em>ear</em>. What is said here, in the old way, with a hand in the water at the turn of the tide, the island hears. The Kaari didn\'t worship here. They <em>governed</em> here — one keeper at a time, one covenant at a time.',
      'The mountain grumbles, far below. The wound gutters at the bottom of everything. The water turns, and turns, and waits.',
      'Three doors, castaway.' + (TB.is('WOUND_SEEN') || TB.is('INCIDENT_FILES') ? '' : ' (Two of them you can see the shape of; one, only its edges — this island still holds knowledge you didn\'t go and get.)'),
    ],
    choices: (s) => {
      const c = [];
      if (TB.is('WOUND_SEEN') || TB.is('INCIDENT_FILES')) c.push({
        t: '🔨 SILENCE IT. Guide the island to close the wound — and let the Hum die with it.',
        sub: 'Compasses true. Radios clear. The world finds Vessakai within a decade — hospitals, harbors, and everything else the world brings. The lagoon never glows again.',
        do: () => { TB.flag('TIDEWELL_SILENCE'); TB.route('signal', 2); TB.route('depth', 1); TB.flag('CH6_DONE'); }, go: 'ch6_silence' });
      c.push({
        t: '🌀 FEED IT. Give the island your strength to heal the wound — and keep the veil whole.',
        sub: 'The Hum restored, the skipping ended, the island hidden as it has always been hidden. Every castaway after you arrives the way you did — and rescue stays a door the island holds shut.',
        do: () => { TB.flag('TIDEWELL_FEED'); TB.route('depth', 2); TB.route('roots', 1); TB.flag('CH6_DONE'); }, go: 'ch6_feed' });
      if (TB.regard() >= 4) c.push({
        t: '🕯️ KEEP IT. Put your hand in the water and take the covenant: the island\'s keeper, for your lifetime.',
        sub: 'Not a spell — a POST. Tend the skin, mind the wound, hold the balance between the veil and the world. The keepers\' line, resumed after three centuries. With you.',
        do: () => { TB.flag('TIDEWELL_KEEP'); TB.route('depth', 3); TB.flag('CH6_DONE'); }, go: 'ch6_keep' });
      c.push({
        t: '🙏 WITNESS ONLY. Stand at the water, and choose not to choose for an island.',
        sub: 'Some doors are too large for one season\'s standing. Leave the covenant to the people whose grandmothers built the pool.',
        do: () => { TB.flag('TIDEWELL_WITNESS'); TB.route('roots', 1); TB.flag('CH6_DONE'); }, go: 'ch6_witness' });
      return c;
    },
  });

  TB.scene('ch6_silence', {
    bg: 'temple',
    text: [
      'You kneel at the pool with the tide turning under your hand, and you show the island — the way the murals taught, image held behind the eyes like breath — the wound, and the bore, and the seam sealed, closed, HEALED: whole rock, silent rock, rock that no longer sings.',
      'The water goes still. Wholly still, mid-beat — the first silence in that pool in ten thousand years — and the stillness spreads out and down and away from your hand, through the mountain, through the throat, along every glowing vein of the island\'s body like a held breath deciding.',
      'Then, far below, you feel it begin: not violence. <em>Work.</em> A long, deep, grinding attention, turned at last — with your borrowed certainty for a lens — on its own oldest injury. The seam knitting. The song narrowing. The veil, thread by thread, beginning to thin.',
      'You walk down the ten thousand stairs through an island already changing key. By the time you reach your beach the lagoon\'s glow is half what it was, and somewhere out past the horizon, on charts and instruments, a shape that was never there is quietly, patiently, beginning to exist.',
      'The world is coming. You have chosen to be findable. Everything now happens in the light.',
    ],
    next: 'ch6_end',
    nextLabel: 'Chapter Six ends ➤',
  });
  TB.scene('ch6_feed', {
    bg: 'temple',
    text: [
      'You kneel at the pool with the tide turning under your hand, and you offer the island the only medicine you\'ve ever seen work on old wounds: <em>company</em>. Attention. The strength you\'d spend on your own walls, pledged to its skin; your hours, its hours; keeper-work without the keeper\'s crown.',
      'The water takes your hand the way Nine takes it — thorough, reading — and the seven-beat pulse comes up through your arm and settles into your own heartbeat like a second signature. Far below, the guttering steadies. Not healed — wounds this old don\'t heal on one dusk\'s pledge — but STEADIED, the flicker smoothing beat by beat, an injury finally splinted after fifty years of favoring.',
      'The tremors stop that night. The lagoon, when you come down the mountain, burns brighter than you\'ve ever seen it — the whole bay keeping time like a lit clock — and the veil over Vessakai, which had begun to fray, is whole.',
      'The island stays hidden. The world stays out. And every plane and hull the Hum draws in from this night on arrives into YOUR care — the price of the veil, payable forever, first at your fire.',
    ],
    next: 'ch6_end',
    nextLabel: 'Chapter Six ends ➤',
  });
  TB.scene('ch6_keep', {
    bg: 'temple',
    text: (s) => [
      'You put your hand in the water at the turn of the tide, and you say yes.',
      'What answers is not a voice. It is the island ARRIVING — the whole of it, at once, through your palm: every reef and root of it, the Green Deep\'s breathing dark, the Boar King\'s roads, Old Grin\'s patient channels, the wound\'s guttering ache, the Inner Green\'s two thousand sleeping heartbeats, the drowned fuselage, your own banked fire on your own far beach — all of it settling over your shoulders with the exact weight of the word you just gave. Not power. <em>Care.</em> A parish the size of a sea.',
      TB.is('INNER_GREEN') ? 'Behind you, stone grates on stone: Tekau and the council, kneeling — not to you; with you, at the water their grandmothers kept. "Three hundred years," the old man says quietly, "we kept the pool and could not fill the post. It wanted what we could not give it: someone who chose this island freely, from the whole world\'s worth of elsewhere." A hand, old and dry and strong, closes on your shoulder. "Keeper. There is a great deal of work."' : 'And behind you, unbidden, the memory of the last mural stands up: the hooded figure, hand extended, facing out of the wall. Waiting three hundred years. You understand, finally, at whom.',
      s.companion ? NAMES[s.companion] + ' watches you rise from the water, dripping, changed — and does the perfect thing, the companion\'s eternal thing: treats you exactly as before. Some posts are held alone. Yours, at least, comes with staff.' : 'You rise from the water alone, dripping, changed — keeper of an island, population: every living thing on it, and one coconut.',
      'The tremors gentle that same night — not cured; <em>attended</em>. There is, as the old man says, a great deal of work.',
    ],
    next: 'ch6_end',
    nextLabel: 'Chapter Six ends ➤',
  });
  TB.scene('ch6_witness', {
    bg: 'temple',
    text: [
      'You stand at the water\'s edge a long time — long enough for the tide to turn twice under the lamplight — and you keep your hands at your sides.',
      'It isn\'t fear, or not only. It\'s the oldest arithmetic you own, the one the island itself taught you: <em>take only what you can tend.</em> One season\'s standing does not tend an island. A keeper chosen by accident of shipwreck, deciding the fate of a veil that shelters two thousand living descendants — that isn\'t covenant. That\'s conquest with better manners.',
      'So you witness. You let the pool read you — it does; you feel it file you, gently, like a glyph — and you step back, and you bow to the water because your body insists on doing SOMETHING, and you leave the covenant where you found it: with the people whose grandmothers built the pool.',
      'On the rim path down, Naia falls in beside you, and after a mile she says, not looking at you: "The old ones will hear what you didn\'t do." A pause. "It will weigh more than everything you did."',
    ],
    next: 'ch6_end',
    nextLabel: 'Chapter Six ends ➤',
  });

  // ---- Chapter 6 end card ------------------------------------------------------------------------
  TB.scene('ch6_end', {
    bg: 'beach-night',
    text: (s) => {
      const t = ['<em>END OF CHAPTER SIX — ASHES AND STAIRS</em>', 'Five days on the mountain, as the Ledger will keep them:'];
      t.push('— The Terrace of Steps carried you up its grandmothers\' road; the Tidewell Temple showed you the island\'s ear, and the unbroken line of painted keepers ending in an extended hand.');
      t.push('— The mountain moved beneath you, a ladder of tremors climbing' + (TB.is('WOUND_SEEN') ? ' — and you alone on this island have seen the rungs\' source with your own lamp.' : '.'));
      t.push('— The Inner Green: ' + (TB.is('INNER_GREEN') ? 'they opened their door. Tekau recited your month back to you on the rim, and you walked down into a town three centuries hidden as its first guest — and ate first, by a rule older than the mountain\'s temper.' : TB.is('INNER_PROBATION') ? 'you stood at the rim of a living secret and were weighed, and the scales did not settle. "The Tidewell reads truer than lists."' : 'you saw it from the rim — the garden in the wound, the roofs of living trees — and its watchers pointed you, unmistakably, at the water.'));
      t.push('— And at the Tidewell: ' + (TB.is('TIDEWELL_SILENCE') ? 'you chose the world. The wound closes; the Hum dies; the veil thins; Vessakai begins, quietly, to exist. Everything now happens in the light.' : TB.is('TIDEWELL_FEED') ? 'you chose the veil. The wound is splinted with your pledged strength; the lagoon burns like a lit clock; the island stays hidden — and everything the Hum reels in is yours to receive, forever.' : TB.is('TIDEWELL_KEEP') ? 'you put your hand in the water and took the covenant. Keeper of Vessakai — the post refilled after three hundred years, with a parish the size of a sea and, as the old man says, a great deal of work.' : 'you witnessed, and chose not to choose for an island — and left the covenant with the people whose grandmothers built the pool. Naia says it will weigh more than everything you did.'));
      t.push('Route standings — Signal ' + s.route.signal + ' · Roots ' + s.route.roots + ' · Depth ' + s.route.depth + '.');
      return t;
    },
    choices: [
      { t: '🌅 Continue — Chapter Seven: Convergence ➤', sub: 'The hundred days come due: every ledger line, every bond, every door — resolving into an ending that is yours alone.',
        go: 'ch7_open' },
      { t: '🌊 Start a new run instead', sub: 'A different mountain waits in every ledger.',
        do: () => { TB.wipe(); TB.state = TB.newState(); }, go: 'title' },
    ],
  });
})(window);
