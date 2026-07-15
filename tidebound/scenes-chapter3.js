/* =====================================================================
 * scenes-chapter3.js — Chapter Three: The Green Deep (Days 19–35).
 * Edda Voss met properly (three openings by the Smoke decision), her
 * grove as a visitable location, the Silverthread river, marsh fever,
 * the Boar King thread continued, heart scenes II, and the chapter
 * threshold: Old Grin's Toll.
 * Conventions unchanged: effects in `do`/`next`/guarded `enter`;
 * camp actions stash s.out and route through 'act_result'.
 * =================================================================== */
(function (G) {
  'use strict';
  const TB = G.TB;
  const R = Math.random;
  const pick = (a) => a[Math.floor(R() * a.length)];

  const NAMES = { kavi: 'Kavi', ipo: 'Ipo', vela: 'Vela', buri: 'Buri', moa: 'Moa', nine: 'Nine' };
  const WHO = {
    kavi: { emoji: '🐕', name: 'Kavi' }, ipo: { emoji: '🐒', name: 'Ipo' },
    vela: { emoji: '🦅', name: 'Vela' }, buri: { emoji: '🐗', name: 'Buri' },
    moa: { emoji: '🐔', name: 'Moa' }, nine: { emoji: '🐙', name: 'Nine' },
  };
  const EDDA = { emoji: '👵', name: 'Edda Voss', art: 'char-edda' };
  const BOAR_KING = { emoji: '🐗', name: 'The Boar King', art: 'char-boarking' };

  function campBg2(s) {
    if (s.site === 'fringe') return 'camp-fringe';
    if (s.site === 'overhang') return 'cliff-camp';
    return s.seg === 2 ? 'beach-dusk' : 'beach-day';
  }
  // Edda's first-impression chemistry with your companion
  function eddaChem(s) {
    return { kavi: 5, moa: 6, nine: 8, vela: 3, buri: 0, ipo: -8 }[s.companion] ?? 4; // solo: she respects self-reliance
  }

  // ---- Chapter open (branches on the Smoke decision) --------------------------
  TB.scene('ch3_open', {
    bg: 'jungle',
    enter: (s) => {
      if (s.chapter >= 3) return; // reload guard
      s.chapter = 3; s.day = 19; s.seg = 0;
    },
    text: [
      '<em>CHAPTER THREE — THE GREEN DEEP</em>',
      'Day nineteen. The island stops being a shore with a mystery behind it, and becomes a <em>country</em>: the deep jungle, the silver river that drains the broken mountain, the drowned tangle of the mangroves in the east — and, on the mountain\'s knee, a garden, a grove, and the woman who has kept them for sixty years.',
    ],
    next: (s) => (TB.is('SMOKE_NOW') ? 'ch3_edda_now' : TB.is('SMOKE_LATER') ? 'ch3_edda_later' : 'ch3_open_signal'),
    nextLabel: 'Begin ➤',
  });

  TB.scene('ch3_edda_now', {
    bg: 'grove', who: EDDA,
    text: (s) => [
      'You spent what was left of the night on the floor of a stranger\'s hut, under a stranger\'s blanket, with a shotgun standing in the corner like a chaperone. In the morning there is tea — bitter as a verdict, steaming — pushed into your hands without a word.',
      'By daylight her domain explains itself: a grove cut into the mountain\'s knee, terraced and tended — beds of greens and root crops, fruit trees pruned low against wind, drying racks, rain tanks, a garden that is really a <em>system</em>, decades deep. Two low mounds sit at its edge under a flowering tree, kept clear of weeds. You don\'t ask. She watches you not ask, and something in her ledger moves.',
      '"Edda," she says finally, like a door opening a hand\'s width. "Voss. You\'ll be wanting three things —" she counts them off with the teacup, "— my food, my knowledge, and my company. You may earn the first two."',
      s.companion === 'ipo' ? 'Then her eyes find Ipo, who is halfway into her seed basket, and the temperature drops forty degrees. "And <em>that</em>," she says, with feeling, "stays outside the fence, or I shoot it and we both pretend I didn\'t enjoy it."' :
      s.companion === 'moa' ? 'Then her eyes find Moa, riding your basket like copper cargo, and something happens to the old face that it clearly wasn\'t warned about — a softening, quickly arrested. "…You keep fowl," she says, in an entirely different voice, and pours Moa a saucer of water like it\'s nothing at all.' :
      s.companion === 'nine' ? 'Then you mention — carefully, testing — what lives in your tide pools and works your reef, and Edda Voss puts down her cup. "Sixty years," she says slowly, "I have waited for one of them to pick a person. Describe her. Slowly. Leave nothing out."' :
      s.companion === 'kavi' ? 'Then her eyes find Kavi, sitting grave and grey at the fence line, and she nods once, dog to woman, woman to dog, two watchful professionals recognizing each other. "The pariah," she says. "The pack put him out two springs back. He chose better this time."' :
      s.companion === 'buri' ? 'Then her eyes find Buri, asleep against your leg, and she snorts. "The tide brings me a castaway with a <em>pig</em>. Fatten it through monsoon and it\'ll winter you better than a smokehouse." You decide not to translate for Buri.' :
      s.companion === 'vela' ? 'Then a shadow crosses the grove — Vela, wheeling once overhead, checking — and Edda tracks her with genuine respect. "The old sea eagle. Blind-eyed. She\'s buried two mates and raised nine broods off Kestrel Cliffs. If she\'s keeping accounts with you, mind you stay solvent."' :
      'She studies you a while, alone as you are, and something like approval crosses the old face. "No pets, no partners, no nonsense. You\'ll either die quick or do well. I\'ve seen both."',
    ],
    choices: [
      { t: '"Thank you. For the blanket, and for not shooting me."', sub: 'Start with the honest ledger.',
        do: (s) => { TB.flag('EDDA_MET'); s.edda = TB.clamp(20 + eddaChem(s), 0, 100); TB.stat('hope', 5); TB.tickSegment(); }, go: 'ch3_after_open' },
      { t: '"Sixty years. You were here before the station, or with it?"', sub: 'You noticed the word she didn\'t say.',
        do: (s) => { TB.flag('EDDA_MET'); TB.flag('EDDA_PRESSED'); s.edda = TB.clamp(14 + eddaChem(s), 0, 100); TB.route('depth', 2); TB.tickSegment(); }, go: 'ch3_after_press' },
    ],
  });

  TB.scene('ch3_edda_later', {
    bg: 'grove', who: EDDA,
    text: (s) => [
      'You come at noon. You come slow. ' + (s.companion === 'buri' ? 'You do what can be done about the pig smell, which is: nothing.' : 'You come presentable, insofar as the island allows.'),
      'The grove takes your breath before its keeper does: terraces cut into the mountain\'s knee, beds and orchards and rain tanks, sixty years of system disguised as a garden. She is waiting at the fence with two cups already poured, which tells you she watched your whole approach and most of your week.',
      '"You read the note, followed the instructions, and brought a gift." She inspects your offering, then you, over it. "Manners. From the <em>sea</em>. Wonders will never." The tea is bitter as a verdict. You are, you understand, being admitted on probation.',
      '"Edda Voss. Botanist, once. Keeper of this, now." A nod at the mountain, the grove, possibly the entire island. "You\'ll want food and knowledge. Earn them. Company\'s not on offer —" the old eyes flick over your shoulder, at your companion or your solitude, and soften by one degree, "— you seem to have arranged your own."',
    ],
    choices: [
      { t: 'Ask what a botanist is still doing here, sixty years on.', sub: 'The question under all the others.',
        do: (s) => { TB.flag('EDDA_MET'); s.edda = TB.clamp(28 + eddaChem(s), 0, 100); TB.route('depth', 1); TB.tickSegment(); }, go: 'ch3_after_open' },
      { t: 'Ask nothing. Drink the tea. Let her set the pace.', sub: 'Sixty years alone: she\'ll talk when talking is hers.',
        do: (s) => { TB.flag('EDDA_MET'); TB.flag('EDDA_PATIENT'); s.edda = TB.clamp(32 + eddaChem(s), 0, 100); TB.stat('hope', 4); TB.tickSegment(); }, go: 'ch3_after_open' },
    ],
  });

  TB.scene('ch3_open_signal', {
    bg: campBg2,
    text: [
      'You chose the sea, and the sea is where your hours go: the pyre maintained, the mirror drilled at any glint of the horizon, the SOS re-blacked after every tide.',
      'The mountain, for its part, says nothing. The thread of smoke rises every morning, banked and patient, a neighbor you\'ve decided not to have.',
      'The island, however, was not consulted about your decision — and the island has plans for your week.',
    ],
    next: (s) => { TB.tickSegment(); return TB.advance(); },
    nextLabel: 'Begin the day ➤',
  });

  TB.scene('ch3_after_open', {
    bg: 'grove',
    text: (s) => [
      'The rest of the morning is a masterclass disguised as chores. She walks you down the terraces naming what you\'ve been eating wrong and what you haven\'t dared eat at all: which fig is dinner and which is three days of regret, the vine whose pith is water, the bark — she taps a tall straight tree at the grove\'s edge — "for fever. Marsh fever. You\'ll want to know that one, where you\'re camped."',
      'You leave with a basket you didn\'t earn and instructions you didn\'t ask for, and the path down the mountain feels shorter than it did coming up.',
      '<em>Edda\'s grove is open to you now — the trek costs part of a day, and pays it back with interest.</em>',
    ],
    enter: (s) => { if (!TB.is('GROVE_OPENED')) { TB.flag('GROVE_OPENED'); TB.stat('hunger', 12); TB.flag('LORE_FEVERBARK'); } },
    next: (s) => TB.advance(),
  });
  TB.scene('ch3_after_press', {
    bg: 'grove', who: EDDA,
    text: [
      'The word lands the way thrown words do. The cup stops halfway to her mouth. The grove is very quiet, in the way of gardens and courtrooms.',
      '"Before it. With it. <em>After</em> it," she says at last, each word placed like a stone. "And that\'s the whole of that conversation until I know you considerably better — or you find the place yourself, which I\'d advise against doing stupidly." She stands, brushing earth from her knees, audience concluded.',
      'But at the fence, as you leave, she stops you with two fingers on your arm and — grudging, exact — points out the tall straight tree at the grove\'s edge. "Feverbark. For the marsh fever, if the fringe bugs have been at you. Whatever else you think you\'ve learned here today, learn that one."',
      '<em>Edda\'s grove is open to you now — warily.</em>',
    ],
    enter: (s) => { if (!TB.is('GROVE_OPENED')) { TB.flag('GROVE_OPENED'); TB.flag('LORE_FEVERBARK'); } },
    next: (s) => TB.advance(),
  });

  // ---- New hub actions for Chapter 3+ (hooked into camp2) ---------------------------
  TB.ch3Actions = function (s) {
    if (s.chapter < 3) return [];
    const c = [];
    // (the grove trek lives on the Wayfinder chart now — map.js routes it to this file's 'grove' scene)
    if (TB.is('RIVER_KNOWN')) c.push({
      grp: 'daily',
      t: '🏞️ Haul water from the Silverthread', sub: 'Cold, clean, and endless. The island\'s artery is yours now.',
      do: () => { const s2 = TB.state; TB.stat('thirst', 40); TB.stat('energy', s2.site === 'overhang' ? -10 : -6); TB.stat('health', 2);
        s2.out = { bg: 'river', text: [[
          'The Silverthread runs cold out of the mountain\'s shadow, so clear the fish seem to hang in air. You drink until your ribs creak and fill everything that holds water.',
          'The river is running bright today, talking over its stones. You drink, fill the gourds, and stand a while midstream letting the cold argue with your ankles — the island\'s best free medicine.',
          'Water run to the Silverthread: routine now, and still never routine — kingfishers working the far bank, the mountain upside-down in the pools, the gourds going heavy and cold.',
        ][Math.floor(Math.random() * 3)], TB.is('CLAY') ? '' : 'On the cut bank you find grey riverside clay in thick seams — pots, water jars, a real kitchen, all sleeping in that bank. You carry back an armload to dry.'].filter(Boolean) };
        TB.flag('CLAY'); TB.tickSegment(); },
      go: 'act_result',
    });
    // (the Green Deep push and mangrove scout now live on the Wayfinder chart — map.js)
    if (s.disease === 'fever' && TB.is('BG_MEDIC') && (s.inv.medkit || 0) >= 2) c.push({
      grp: 'top',
      t: '🩺 Burn the fever out yourself', sub: 'Antipyretics, fluids, and a medic\'s discipline. Costs two kit uses.',
      do: () => { const s2 = TB.state; TB.item('medkit', -2); s2.disease = null; TB.stat('health', -5); TB.stat('hope', 4);
        s2.out = { bg: campBg2(s2), text: ['You treat yourself the way you\'d treat a stranger: ruthlessly. Fluids on schedule, the kit\'s antipyretics split and rationed, cold compresses through the worst of the spikes, and no heroics about staying on your feet.', 'It takes a day you can\'t spare and most of the kit. On the far side of it you are wrung out, five pounds lighter — and <em>clear</em>. The fever\'s hooks are out.'] };
        TB.tickSegment(); },
      go: 'act_result',
    });
    return c;
  };

  // ---- Edda's grove (visitable) -------------------------------------------------------
  TB.scene('grove', {
    bg: 'grove', who: EDDA,
    text: (s) => {
      const t = ['The grove receives you the way she does: without ceremony, with tea.'];
      if (s.companion === 'ipo' && !TB.is('IPO_GROVE')) { t.push('It takes Ipo ninety seconds to breach the fence, and you find him in the seed store, cheeks packed like saddlebags, wearing a stolen twist of dried fish as a hat. Edda\'s hand is already moving toward where the shotgun would be if she\'d brought it to the garden.'); }
      else if (s.edda >= 60) t.push('She sets you working beside her without asking — that\'s the promotion, out here: from guest to hands. The talk comes easier over shared rows.');
      else if (s.edda >= 35) t.push('She feeds you and insults you in the same breath, which you\'ve learned to bank as affection.');
      else t.push('She keeps the fence between you for the first while, and the old eyes do their auditing. Probation continues.');
      // the grove keeps a calendar: what the terraces are doing follows the season
      const GROVE_SEASON = {
        3: ['The terraces are in their green ascendancy: beans running their poles like rigging, the fig heavy, the beds weeded to parade order. Sixty years of system, showing off quietly.',
          'A new bed has been turned since your last visit — dark, raked, deliberate. She\'s planting for a season she has no reason to assume you\'ll see, which is, you realize, how she plants everything.',
          'The drying racks are full today: bark in flats, herbs hung head-down, the pharmacopoeia being banked. She works while she talks, and the talk keeps the rhythm of the hands.'],
        4: ['The grove is battening down: young trees staked and double-lashed, the rain tanks scoured and their lids stone-weighted, whole beds going under woven covers. "Monsoon\'s coming," she says, catching your look. "The garden knows. Try to be as smart as the garden."',
          'She has you hauling stones for the terrace lips all visit — the little walls that will keep her soil from going to the sea when the sky opens. "Sixty monsoons," she says, tapping a stone home. "Soil\'s still here. That\'s the whole of my genius: I stack rocks."',
          'Half the harvest is coming in early, green and gambled — she\'d rather ripen it under a roof than race the first big rain for it. The kitchen smells of everything at once.'],
        5: ['The grove in the Long Rain is a different country: terraces sheeted in runoff, the fig dark and dripping, and Edda moving through it in oilskins like the weather\'s own auditor, unbothered, checking her little walls.',
          'You find her in the lee of the hut, potting on seedlings under cover — next season already underway at bench height while this one drums on the roof. "Rain\'s not weather to a garden," she says. "It\'s payroll."',
          'The rain tanks are full for the first time since you\'ve known her, and she shows you with the pride most people save for grandchildren: a tapped knuckle, a deep sweet note. "That," she says, "is the sound of not carrying water till March."'],
      };
      t.push(pick(GROVE_SEASON[Math.min(Math.max(s.chapter, 3), 5)]));
      t.push('What do you give the visit to?');
      return t;
    },
    choices: (s) => {
      const c = [];
      if (s.companion === 'ipo' && !TB.is('IPO_GROVE')) {
        return [
          { t: 'Scold him — loudly, for the audience — and return every seed.', sub: 'Diplomacy demands a sacrifice. Ipo will sulk.',
            do: () => { const s2 = TB.state; TB.flag('IPO_GROVE'); s2.edda = TB.clamp(s2.edda + 6, 0, 100); TB.bond(-3);
              s2.out = { bg: 'grove', text: ['You perform the scolding with full theatrical severity while Ipo produces, one by one, from places you don\'t want to think about, eleven seed packets and the fish hat. Edda watches the restitution with grim satisfaction.', '"Hm," she says at the end, which from her is a treaty. Ipo sulks on your shoulder the whole walk home, radiating betrayal, and steals your ear ornament out of principle.'] }; },
            go: 'act_result' },
          { t: 'Laugh. You couldn\'t help it. The hat.', sub: 'Honest, fatal to diplomacy.',
            do: () => { const s2 = TB.state; TB.flag('IPO_GROVE'); s2.edda = TB.clamp(s2.edda - 6, 0, 100); TB.bond(3); TB.stat('hope', 4);
              s2.out = { bg: 'grove', text: ['The laugh escapes before any part of you can stop it, and Ipo — vindicated, adored — takes a bow that scatters seeds like confetti.', 'Edda\'s expression could pickle vegetables. "Out," she says, "the pair of you," and you spend the walk home in disgrace, both of you entirely unrepentant, sharing the stolen fish.'] }; },
            go: 'act_result' },
        ];
      }
      c.push({
        t: '🌱 Work the terraces with her', sub: 'Earn with your back. She pays in food and thaw.',
        do: () => { const s2 = TB.state; s2.edda = TB.clamp(s2.edda + 7, 0, 100); TB.stat('hunger', 14); TB.stat('energy', -6); TB.route('roots', 1);
          s2.out = { bg: 'grove', text: ['You weed, stake, haul and mulch to her exacting standard, and somewhere in the second hour the instruction stops being suspicious and becomes — teaching. Real teaching, decades deep, poured into the first hands that have turned up to receive it.', '"You\'ll do," she says at the end, loading your basket with more than you earned, and looks appalled at herself all the way to the fence.'] }; },
        go: 'act_result',
      });
      c.push({
        t: '🌿 Learn her plants', sub: 'The pharmacopoeia of sixty years. Some of it is life and death.',
        do: () => { const s2 = TB.state; s2.edda = TB.clamp(s2.edda + 3, 0, 100); TB.flag('LORE_PLANTS');
          const first = !TB.is('SALVE');
          TB.flag('SALVE');
          s2.out = { bg: 'grove', text: ['She walks you through the beds like a general reviewing troops: the fever-tree and how to strip its bark without killing it; the fat-leafed aloe-kin for burns; bittergreen for guts; and a grey-green shrub whose crushed leaves smell like medicine feels.', first ? '"Marshmint," she says. "Rub it on at dusk and the biting flies will dine elsewhere." You take cuttings. Your evenings — and your blood — just got considerably safer.' : 'You take fresh cuttings and better instructions, and the almanac in your head gains pages.'] }; },
        go: 'act_result',
      });
      if (s.injury) c.push({
        t: '🩸 Let her see to the wound', sub: 'Sixty years of island medicine, and no bedside manner whatsoever.',
        do: () => { const s2 = TB.state; s2.injury = null; s2.edda = TB.clamp(s2.edda + 3, 0, 100); TB.stat('health', 8);
          s2.out = { bg: 'grove', text: ['She unwraps your dressing, pronounces your field medicine "ambitious," and redoes all of it: the wound irrigated with something that hisses, packed with honey and a moss you now know by name, bound in boiled cloth.', '"Keep it dry, which on this island in this season is a joke, so keep it CLEAN." She flicks your ear like a schoolmistress. "You heal fast, castaway. Stop giving it so much to do."'] }; },
        go: 'act_result',
      });
      if (s.disease === 'fever') c.push({
        t: '🤒 Ask for the cure. You\'re sick, and getting sicker.', sub: 'Feverbark, and no pride about it.',
        do: () => { const s2 = TB.state; s2.disease = null; s2.edda = TB.clamp(s2.edda + 4, 0, 100); TB.stat('health', 5); TB.stat('hope', 6);
          s2.out = { bg: 'grove', text: ['She takes one look at your eyes and the conversation is over — you are steered into shade, dosed with a decoction so bitter your ancestors flinch, wrapped, watered, and ordered to sleep like it\'s a chore assignment.', 'You surface hours later, soaked through and ravenous, with the fever\'s grip broken and an old woman pretending to garden nearby, exactly within earshot. "Three more doses," she says, not looking up, pressing a paper of stripped bark into your kit. "And move your camp off that fringe at dusk, fool."'] }; },
        go: 'act_result',
      });
      // once she has given the whole of it (LORE_HALCYON), the asking retires;
      // a refusal (low regard at stage 3) keeps the door open for later
      if (!TB.is('LORE_HALCYON')) c.push({
        t: '🗿 Ask about the island — the stones, the spiral, the ones who left', sub: 'She knows. Every visit, she lets go of a little more.',
        do: () => { const s2 = TB.state; TB.route('depth', 1);
          const stage = TB.is('EDDA_LORE2') ? 3 : TB.is('EDDA_LORE1') ? 2 : 1;
          let text;
          if (stage === 1) { TB.flag('EDDA_LORE1'); text = ['"You\'ve found the stones, then." Not a question. "There are thirty on this island that I know, and I don\'t claim to know them all. The people who cut them were farmers and sailors — better sailors than anyone who\'s wrecked here since, which is every one of us."', '"The spiral?" She traces one in the air, exactly right. "It\'s the island. The way in, the way down, the way the water moves under it. They didn\'t worship this place, whatever a fool would tell you. They <em>kept</em> it. There\'s a difference. I\'d know."']; }
          else if (stage === 2) { TB.flag('EDDA_LORE2'); text = ['"Where did they go." She looks at the mountain a long time. "The mountain broke — you\'ve seen the crown. The east half of the island tore, the sea came in over the fields, ash for years after. The stones stop being cut about then. Every book would tell you they died or sailed away."', 'She pulls a weed with great attention. "Books," she says, "have never once walked up my mountain and looked in the caldera. That\'s all I\'ll say, and I\'ve already said more of it than I meant to."']; }
          else { TB.flag('EDDA_LORE3'); text = s2.edda >= 55
            ? ['She\'s quiet so long you think the door has shut. Then: "You\'ll have noticed your compass is a liar and your radio drowned. There\'s a reason, and it\'s not spirits, whatever I let fools believe. It\'s in the rock. It sings in the rock, seven beats — you\'ve seen the lagoon keep time to it."', '"There was a station, once. East side, past the mangroves — past that damned crocodile. People with instruments and funding and no sense at all, come to find out what sings." Her jaw sets like mortar. "I was the youngest of them. The bark you take your fever cure from is a tree I planted in nineteen sixty-nine."', '"They drilled it. The rock. The song. And the island—" she stops, and finishes with her voice hoarse: "—<em>answered</em>. Two graves under my flowering tree, and I stayed. That\'s the whole story you\'re getting today, and more than the world ever got."']
            : ['She studies you over the tea. "No," she says at last, gently enough. "The rest of it isn\'t a story I hand to acquaintances. Earn your way past the fence and ask again."']; }
          s2.out = { bg: 'grove', text };
          if (stage === 3 && s2.edda >= 55) { TB.flag('LORE_HALCYON'); TB.route('depth', 2); }
        },
        go: 'act_result',
      });
      // the gems can be ASKED about — Edda supplies the name the island hasn't
      if (TB.is('GEMS') && TB.knowsGlass && !TB.knowsGlass(s)) c.push({
        t: '💎 Show her the courier\'s cut stones', sub: 'A dozen gems that hold your lamplight a half-beat too long. If anyone on this island can name them, it\'s her.',
        do: () => { const s2 = TB.state; TB.flag('GEMS_NAMED'); s2.edda = TB.clamp(s2.edda + 2, 0, 100); TB.route('depth', 1);
          s2.out = { bg: 'grove', text: ['You unroll the lead-lined pouch on her table, and Edda Voss looks at the dozen cut stones for a long, level moment — and then, notably, does <em>not</em> touch them.',
            '"Heartglass," she says. "The mountain\'s own. It runs in veins under this island, down where the survey drilled — alive, for any definition of the word that will stretch. Cutting cores of it was the station\'s sin, and the island answered it." A nod at the pouch. "Someone kept the habit. Someone out in the world has been cutting it into <em>trinkets</em>."',
            'She pushes the pouch back across the table with one knuckle, lead-side in. "Keep it wrapped. And when you finally see it living in the rock, castaway — you\'ll understand why I didn\'t touch it."'] };
          TB.tickSegment(); },
        go: 'act_result',
      });
      if (TB.has('case') && s.edda >= 35 && !TB.is('CASE_EDDA')) c.push({
        t: '💼 Show her the courier\'s case', sub: 'She has been on this island sixty years. Maybe she\'s seen its like.',
        do: () => { const s2 = TB.state; TB.flag('CASE_EDDA'); TB.route('depth', 2);
          s2.out = { bg: 'grove', text: ['You unwrap the courier\'s case and set it on her table, and Edda Voss goes still in a way you have not seen her go still.', '"Where," she says quietly, "did you get that." Not the case, you realize — she\'s not looking at the case. She\'s looking at the small stamped crest by the lock, half worn away, that you\'d taken for a maker\'s mark.', 'She turns it to the light with one finger, like it might wake. "This crest belonged to the people who funded the station," she says at last. "It stopped existing — publicly — in nineteen eighty. And a man was carrying this over the island last week." She pushes it back across the table as if returning something to a fire. "Don\'t open that near me. And don\'t open it stupidly. Some locks are the only honest warning you get."'] }; },
        go: 'act_result',
      });
      if (s.edda >= 50 && !TB.is('EDDA_GRAVES')) c.push({
        t: '🌸 Ask about the two mounds under the flowering tree', sub: 'Gently. You\'ve waited to have the right to ask.',
        do: () => { const s2 = TB.state; TB.flag('EDDA_GRAVES'); s2.edda = TB.clamp(s2.edda + 5, 0, 100); TB.stat('hope', 2);
          s2.out = { bg: 'grove', text: ['She doesn\'t answer for a long time, and you let the silence do its work, the way she taught you without teaching.', '"Ilsa," she says finally. "Doctor Ilsa Vane. The best mind ever wasted on this island, and the only person I\'ve loved past the age of reason. The tree is hers; she chose it herself, at the end. Faces the sea, because she never did stop watching for the ship that would take her results home."', 'A pause. Your eye moves to the second, smaller mound, and the old woman almost — almost — smiles. "Aleksander," she says. "A rooster. Absolute tyrant. Ilsa\'s, then mine, then neither of ours; he owned us both and crowed like the sun answered to him personally, seventeen years." She stands, briskly, gathering cups' + (s2.companion === 'moa' ? ', and her eyes go — helplessly, briefly — to Moa, copper and alive on your basket. "Keep that hen close," she says, rough as bark. "The small ones take the biggest holes out of you."' : '. "That\'s enough archaeology for one visit."'), ''].filter(Boolean) };
        },
        go: 'act_result',
      });
      return c;
    },
  });

  // ---- Chapter 3 scheduled events -----------------------------------------------------
  TB.SCHEDULE.push(
    { d: 20, s: 2, id: 'ev3_river' },
    { d: 21, s: 0, id: 'ev3_eddavisit', when: (s) => TB.is('SMOKE_IGNORED') && !TB.is('EDDA_MET') },
    { d: 22, s: 2, id: 'ev3_fever', when: (s) => TB.is('FEVER_SEED') && !TB.is('SALVE') && !s.disease },
    { d: 24, s: 2, id: 'ev3_grin1' },
    { d: 27, s: 1, id: 'ev3_king2' },
    { d: 28, s: 3, id: 'ev3_pulse' },
    { d: 31, s: 0, id: 'ev3_heart2', when: (s) => !!s.companion && s.trust >= 75 },
    { d: 31, s: 0, id: 'ev3_heart2_low', when: (s) => !!s.companion && s.trust < 75 },
    { d: 31, s: 0, id: 'ev3_coco2', when: (s) => !s.companion },
    { d: 35, s: 2, id: 'ch3_threshold' },
  );

  // ---- The river --------------------------------------------------------------------
  TB.scene('ev3_river', {
    bg: 'river',
    text: (s) => [
      'You hear it before you see it — a sound your body identifies faster than your mind, older than either: <em>running water</em>. Real, cold, moving water.',
      'The Silverthread comes down out of the mountain\'s shadow through a green ravine, wide as a road, clear as glass over amber stones. Fish hang in the current like held breath. The banks are cut clay, grey and thick. Upstream, the water sounds bigger — falls, somewhere up in the folded country.',
      s.companion === 'nine' ? 'Fresh water is not Nine\'s country and she isn\'t here — but you find her mark anyway: at the river mouth where salt meets sweet, arranged on a flat stone above the tideline, a neat pile of freshwater mussel shells. Pointed upstream. She has known about this river the whole time, and has apparently been waiting, with some exasperation, for you to find the front door.' : 'You drink like a horse, laugh at nothing, and drink again. The daily arithmetic of coconuts and rain-catch — the tax your every plan has paid since Day 1 — just fell over dead.',
      'The island has an artery, and now you hold it.',
    ],
    enter: (s) => { if (!TB.is('RIVER_KNOWN')) { TB.flag('RIVER_KNOWN'); TB.stat('thirst', 40); TB.stat('hope', 8); TB.route('roots', 1); } },
    next: (s) => 'camp2',
  });

  // ---- Edda comes to you (signal branch) -----------------------------------------------
  TB.scene('ev3_eddavisit', {
    bg: campBg2, who: EDDA,
    text: (s) => [
      'On the twenty-first morning there is a woman in your camp.',
      'Not arriving — <em>in</em> it: standing at your fire ring with a shotgun broken open over one arm and the proprietary air of a health inspector, an old woman, weathered as driftwood, with a long grey braid and eyes that have finished three audits since you sat up.',
      '"Twenty-one days," she says, without preamble. "Twenty-one days of watching you signal an empty sea and ignore a lit fire on a mountain. I came down to see if you were proud, stupid, or dying." A glance at your camp — the stores, the defenses, ' + (s.companion ? NAMES[s.companion] + ', whom she takes in with one long unreadable look' : 'your tidy solitary arrangements') + '. "Hm. Not dying."',
      '"Edda Voss. Up the mountain, past the third ridge, the fire you\'ve been snubbing. Marshmint for the flies, feverbark for the fever you\'re courting, camped where you\'re camped — I\'ll leave cuttings." She snaps the shotgun closed, business concluded. "The sea\'s deaf, castaway. The mountain isn\'t. When you\'re done being proud, the path is marked."',
      'She is gone into the treeline before your manners finish rebooting.',
    ],
    enter: (s) => { if (!TB.is('EDDA_MET')) { TB.flag('EDDA_MET'); TB.flag('GROVE_OPENED'); TB.flag('LORE_FEVERBARK'); TB.flag('SALVE'); s.edda = TB.clamp(10 + eddaChem(s), 0, 100); } },
    next: (s) => 'camp2',
  });

  // ---- Marsh fever ----------------------------------------------------------------------
  TB.scene('ev3_fever', {
    bg: campBg2,
    text: [
      'It starts as a headache with ambitions.',
      'By dusk you\'re cold in the tropics — cold from the inside, teeth chattering in air like soup — and then the pendulum swings and you\'re burning, wringing wet, joints full of ground glass. You know this catalogue. You\'ve been paying the fringe\'s little dusk tax in bites for a week, and the bill has come due.',
      '<em>Marsh fever.</em> It will not leave on its own. Left to run, it will take your strength, then your hours, then everything else — and there is a cure on this island, in a grey-barked tree on an old woman\'s mountain, if you can get to it.',
    ],
    enter: (s) => { if (!s.disease && !TB.is('FEVER_STRUCK')) { TB.flag('FEVER_STRUCK'); s.disease = 'fever'; TB.stat('energy', -15); TB.stat('hope', -6); } },
    next: (s) => 'camp2',
  });

  // ---- Old Grin, introduced ---------------------------------------------------------------
  TB.scene('ev3_grin1', {
    art: 'ev-grin',
    bg: 'mangrove',
    text: (s) => {
      const warn = s.companion === 'kavi' ? 'Kavi stops you. Flat stop: a shoulder against your knee, hackles in a ridge, a growl pitched below hearing — aimed at a stretch of tea-dark water you\'d already put your next footstep beside.' :
        s.companion === 'vela' ? 'Vela\'s cry hits the mangroves like a thrown stone — the danger cry, the one that empties the shallows — and every heron in the channel goes up at once. You freeze with one foot lifted.' :
        s.companion === 'moa' ? 'Moa detonates in her basket — full alarm, wings drumming your back — at nothing you can see, which you have learned means something you can\'t.' :
        'Some assembly of small wrongnesses stops you — the herons all facing one way, the crabs gone from a socketed log, a silence with a shape to it.';
      return [
        'You take the day east, following Edda\'s hand-drawn line toward the mangroves — the drowned forest that guards the island\'s other half — to see the East Passage for yourself.',
        warn,
        'And the log in the channel opens an eye.',
        'It is not a log. It was never a log. It is six meters of saltwater crocodile, moss-backed and patient as geology, lying in the one channel every crossing of the East Passage must use — and it has been watching you since before you knew there was anything to watch. It does not lunge. It does something worse: it settles, minutely, into perfect comfort. <em>No hurry</em>, says every line of it. <em>You\'ll be back. They always come back. I am always here.</em>',
        'You withdraw with great correctness, heart hammering, and the mangroves let you go — this time, the courtesy of a landlord who prefers his tenants to understand the lease before signing.',
      ];
    },
    enter: (s) => { if (!TB.is('GRIN_MET')) { TB.flag('GRIN_MET'); TB.stat('hope', -3); TB.route('depth', 1); } },
    next: (s) => 'camp2',
  });

  // ---- The Boar King, continued --------------------------------------------------------------
  TB.scene('ev3_king2', {
    art: 'ev-boarking',
    bg: (s) => (TB.is('KING_TITHED') ? campBg2(s) : 'jungle'),
    who: (s) => (TB.is('KING_SEEN') || TB.is('KING_TRACKED') ? BOAR_KING : null),
    text: (s) => {
      if (TB.is('KING_TITHED')) return [
        'Mid-morning, the treeline delivers a state visit.',
        'The Boar King walks the edge of your camp in full daylight — unhurried, enormous, scar-plated — and does not touch one stake, one store, one stone. He inspects the boundary like a magistrate reviewing a treaty, pauses at the spot where you leave the offerings, and looks at you for a long, level moment across the clearing.',
        s.companion === 'buri' ? 'Beside you, Buri has gone very still — not afraid; <em>attentive</em>, nose working, some old recognition moving through him like weather. The King\'s gaze crosses him and something passes between the two of them, old blood to young, that you are not invited into.' : 'Then he is gone, at his own pace, the jungle closing behind him like a door with good hinges.',
        'The tithe holds. You are, apparently, the first neighbor in some time to grasp the concept of rent.',
      ];
      if (TB.is('KING_TRACKED')) return [
        'You go back along his road, deeper this time, to the wallow the trail promised — a mud pan the size of a house floor, generations deep, walled with rubbing-posts polished like furniture.',
        'And at its edge, half-grown into a strangler fig: more snare wire. Old, rusted, industrial — not castaway improvisation. Dozens of loops of it, and among them, pressed into the fig\'s grown-over bark, small tusked skulls. Young ones. A sounder\'s worth.',
        'You stand a while in the quiet, recalculating your monster. Something with instruments and funding came to this island once, and it snared and it took, and one scar-plated survivor has been at war with the smell of people ever since. He is not a monster. He is a <em>veteran</em>.',
        s.companion === 'buri' ? 'Buri noses one small skull, once, and leans against your leg the whole way home.' : '',
      ].filter(Boolean);
      if (TB.is('KING_WALLED')) return [
        'He tests the wall on the thirteenth day — once, at dawn, a shuddering headlong blow you feel through the ground and your teeth — and the wall, your wall, groans and <em>holds</em>.',
        'Through the stakes you watch him back off three paces and regard the structure: not enraged, you realize, but assessing, the way you\'d assess weather. Then he screams at the jungle — a sound like sheet metal tearing, purely for the record — and departs.',
        'The message is received in both directions: you will not be moved cheaply; he has not conceded the ground. The treaty is the wall itself.',
      ];
      return [
        'He comes back on the thirteenth day, at dusk, and this time you\'re in camp to meet it: the Boar King, scar-plated and enormous, testing your boundary with the confidence of prior success.',
        'What follows is loud, close, and expensive — pans beaten, brands waved, one stake splintered, one store scattered — before he withdraws into the dark, unhurried even in retreat, promising nothing.',
        'You rebuild by firelight, doing the honest math: he is a fact of the inland, like weather, and your policy toward him — wall, war, or tribute — is still unwritten. Facts don\'t wait forever.',
      ];
    },
    enter: (s) => {
      if (TB.is('KING2_APPLIED')) return;
      TB.flag('KING2_APPLIED');
      if (TB.is('KING_TITHED')) { TB.stat('hunger', -4); TB.route('roots', 1); if (s.companion === 'buri') TB.flag('BURI_KING_BLOOD'); }
      else if (TB.is('KING_TRACKED')) { TB.route('depth', 2); TB.flag('KING_SYMPATHY'); }
      else if (TB.is('KING_WALLED')) { TB.route('roots', 1); TB.stat('hope', 3); }
      else { TB.stat('energy', -8); if (s.food > 0) s.food -= 1; }
    },
    next: (s) => 'camp2',
  });

  // ---- The pulse skips -------------------------------------------------------------------------
  TB.scene('ev3_pulse', {
    bg: 'beach-night',
    text: (s) => [
      'You wake at the black bottom of the night with no idea why — and then you have exactly an idea why, and it raises the hair on your arms:',
      '<em>The lagoon missed a beat.</em>',
      'Thirteen nights you have slept against that slow glow, seven beats, rising and falling, reliable as your own pulse. Tonight, once — you\'d testify to it — the whole bay went dark on the sixth beat, held its breath for a count that felt like the island listening, and resumed.',
      s.companion === 'kavi' ? 'Kavi is sitting bolt upright beside you, ears full forward — at the water. Not the treeline. The <em>water</em>.' :
      s.companion === 'moa' ? 'Moa is awake in her box, utterly silent, feathers slicked flat — and facing the lagoon, which she has never once considered worth her professional attention before.' :
      s.companion === 'nine' ? 'And down at the tideline, half out of the water in the returning glow, Nine is watching — not the lagoon. <em>You.</em> As if the interesting question isn\'t what the island just did, but whether you finally noticed.' :
      'Nothing else stirs. The reef breathes. The palms tick. Whatever counted that pause, it wasn\'t counting for your benefit.',
    ],
    enter: (s) => { if (!TB.is('PULSE_SKIPPED')) { TB.flag('PULSE_SKIPPED'); TB.route('depth', s.companion === 'nine' ? 2 : 1); } },
    next: 'night2',
  });

  // ---- Heart scenes II (Devoted) -------------------------------------------------------------------
  TB.scene('ev3_heart2', {
    art: (s) => (s.companion ? 'ev-heart-' + s.companion : null),
    bg: (s) => (s.companion === 'nine' ? 'tidepools' : campBg2(s)),
    who: (s) => WHO[s.companion],
    text: (s) => {
      const v = {
        kavi: ['On the fourteenth night the pack sings inland, the old ragged chorus, and you feel Kavi lift his head against your knee the way he does — and then, for the first time in your acquaintance, he answers.', 'He sings from beside your fire — long, rough, unpracticed, a voice with two springs of rust in it — and the inland chorus stumbles, recalibrates around the new bearing, and answers back. He sings his position. He sings it from <em>here</em>.', 'When it\'s done he looks at you, embarrassed as a dog can be, and thumps his tail once. You have just been declared, to the entire island, in the only language that ever mattered to him.'],
        ipo: ['On the fourteenth day Ipo takes your hand — actually takes it, both of his around one finger, pulling with intent — and leads you up through the canopy roads to a hollow in a strangler fig, and shows you the single most valuable thing he owns: <em>everything</em>.', 'The hoard. Years of it: bottle glass sorted by color, a doll\'s porcelain hand, coins green with age, your long-mourned second-best fishhook (you let it pass), and — your breath stops — a flat steel key on a rotted lanyard, stamped with letters gone black with age: <em>HALCYON — E WING</em>.', 'He watches your face as you take it in, vibrating with pride, and then makes the gesture you know: <em>take</em>. Anything. All of it. The whole treasury, opened to the audience of one.'],
        vela: ['On the fourteenth morning, on the high stone, Vela does the impossible thing.', 'She steps close — closer than transaction, closer than the blind-side courtesy — and lowers her head, and presses it to your chest, and <em>leaves it there</em>. One breath. Three. Wind-cold feathers and forty knots of muscle standing utterly still against your heartbeat, letting itself be — for exactly as long as she permits — held.', 'Then it\'s over, and she\'s three feet away tidying a wing like nothing occurred, and the sea and you both know better than to remark on it. Some payments aren\'t in fish. The books have gone somewhere past balance, into whatever birds keep instead of love.'],
        buri: ['On the fourteenth day you finally understand what Buri does at dusk when he vanishes toward the treeline: he walks the perimeter. Your perimeter. All of it — beach line, water path, forage trail — nose down, unhurried, thorough as a nightwatchman, before galloping back to collapse into your fire\'s light.', 'Tonight you follow, and at the treeline you find his work: every fence-gap rubbed with his scent, every approach marked, the whole map of your small kingdom re-signed, nightly, in the only ink the inland dark respects: <em>occupied. Defended. His.</em>', 'He finds you watching and grins his whole pig grin, tail going, absurd and mighty. You walk the last of the rounds together, landlord and enforcer, and the night makes way.'],
        moa: ['On the fourteenth night a sound comes off the treeline — a real one, heavy, close, wrong — and before your hand finds the spear, before Kavi-sized courage from anything Kavi-sized could be expected, two pounds of copper feathers has planted itself between you and the dark, wings mantled to twice her size, screaming defiance in a voice to strip paint.', 'The sound retreats. Whatever it was weighed a hundred times what she does, and it retreated, from her, because retreat was simpler than whatever she was promising.', 'She stands guard, quivering, magnificent, until you gather her in — heart hammering against your palm like a fast little engine — and she scolds you, at length, for the disorderly state of your defenses. You accept the review in full. Brave feather. Bravest on the island.'],
        nine: ['On the fourteenth low tide Nine leads you out — deliberately, surfacing and waiting, surfacing and waiting — along the reef line to the drop-off where the sunk fuselage lies blue and quiet in three fathoms, and she goes down into it, into the drowned dark you cannot follow, and is gone a long two minutes.', 'She comes back up with her arms full and lays it on the coral shelf between you like a verdict: the courier\'s photograph' + (TB.has('photo') ? ' — its twin; the copy he kept' : '') + ', bleached but legible: a shoreline. A broken-crowned mountain. <em>This island</em> — photographed from the deck of a departing ship, dated in fountain pen, decades before your crash.', 'Someone left this place, once, the ordinary way, and lived to file the picture. Nine holds the proof flat under one arm against the current, and watches you with her slotted golden eye, and you would swear on the wreck below that she knows exactly what she has just given you: <em>hope, with a bearing on it</em>.'],
      };
      return v[s.companion];
    },
    enter: (s) => {
      if (TB.is('HEART2_DONE')) return;
      TB.flag('HEART2_DONE'); TB.bond(10); TB.stat('hope', 8);
      if (s.companion === 'ipo') { TB.flag('IPO_KEY'); TB.route('depth', 2); }
      if (s.companion === 'nine') { TB.flag('SHIP_PHOTO'); TB.route('depth', 2); TB.route('signal', 1); }
    },
    next: (s) => 'camp2',
  });
  TB.scene('ev3_heart2_low', {
    bg: campBg2, who: (s) => WHO[s.companion],
    text: (s) => [
      NAMES[s.companion] + ' is still here. That\'s not nothing — out here, staying is the first vow and the hardest. But on the fourteenth morning you catch yourself narrating your plans to the fire instead of to them, and you feel the shape of the distance you\'ve kept.',
      'The wild keeps honest books. Walls, water, smoke, survival — all fair entries. But the bond is a crop like any other on this island: it grows exactly as much as you tend it, and the season does not wait.',
    ],
    enter: (s) => { if (!TB.is('HEART2_LOW')) { TB.flag('HEART2_LOW'); TB.bond(3); } },
    next: (s) => 'camp2',
  });
  TB.scene('ev3_coco2', {
    bg: campBg2,
    text: [
      'On the fourteenth morning you build Coco a shelf.',
      'It isn\'t much — a flat of driftwood lashed at eye height, out of the rain, with a view of the fire, the works, and the sea. He presides. You find, arranging him, that you\'ve started angling his face toward whatever you\'re working on, for the supervision.',
      'You are aware of what this is. You have decided it\'s <em>working</em>, which out here is the only review that counts. Morale infrastructure, you note in the day\'s mental log, and Coco — three pores of him, weathered and constant — declines, with perfect tact, to comment.',
    ],
    enter: (s) => { if (!TB.is('COCO_SHELF')) { TB.flag('COCO_SHELF'); TB.stat('hope', 5); TB.route('roots', 1); } },
    next: (s) => 'camp2',
  });

  // ---- OLD GRIN'S TOLL (chapter threshold) ------------------------------------------------------------
  TB.scene('ch3_threshold', {
    bg: 'mangrove',
    text: (s) => {
      const why = s.route.signal >= s.route.roots && s.route.signal >= s.route.depth
        ? 'Because the east is where the answers to <em>leaving</em> live: Edda\'s station had a radio once, and radios have parts, and parts can be made to speak.'
        : s.route.roots >= s.route.depth
          ? 'Because the east is where the old terraces run richest — seed stock, tools, ground that remembers farming — everything a real foothold becomes a real <em>home</em> with.'
          : 'Because the east is where the island keeps its locked drawers: the station, the stones, the answers under the answers.';
      return [
        '<em>OLD GRIN\'S TOLL</em>',
        'Day thirty-five. You stand at the mangrove edge with your kit weighed and your reasons rehearsed. ' + why,
        'Between you and all of it: the East Passage — one crossing, one channel, one landlord. He is there now. He is always there. Six meters of patience in tea-dark water, older than Edda, undefeated by everyone who ever carried better equipment than yours into this swamp.',
        'The toll gets paid one way or another. Choose the currency.',
      ];
    },
    choices: (s) => {
      const c = [];
      if (s.food >= 2) c.push({
        t: '🍖 Pay him in meat. Bait the far channel and cross behind his back.', sub: 'Costs your smoked reserve (2 stores). Undignified, effective, honest.',
        do: () => { const s2 = TB.state; s2.food -= 2; TB.flag('GRIN_BAITED'); TB.flag('EAST_OPEN'); }, go: 'ch3_toll_baited' });
      if (TB.is('GRIN_SCOUTED') || (s.companion === 'moa' && s.trust >= 50)) c.push({
        t: '🌅 The dawn window. Cross while the cold still owns him.', sub: (s.companion === 'moa' ? 'Moa\'s weather-sense plus ' : '') + 'your scouting: first light, low tide, a lethargic landlord.',
        do: () => { TB.flag('GRIN_TIMED'); TB.flag('EAST_OPEN'); if (TB.state.companion === 'moa') TB.bond(4); }, go: 'ch3_toll_timed' });
      if (s.companion === 'ipo' && s.trust >= 50) c.push({
        t: '🐒 Ipo\'s diversion. The greatest performance of his career.', sub: 'A monkey, a mudbank, and professional-grade audacity.',
        do: () => { TB.flag('GRIN_DISTRACTED'); TB.flag('EAST_OPEN'); TB.bond(5); }, go: 'ch3_toll_ipo' });
      if (s.companion === 'nine' && s.trust >= 50) c.push({
        t: '🐙 Nine\'s chart. She\'s already mapped his kingdom from below.', sub: 'Cross where the water says he never goes.',
        do: () => { TB.flag('GRIN_MAPPED'); TB.flag('EAST_OPEN'); TB.bond(4); TB.route('depth', 1); }, go: 'ch3_toll_nine' });
      if (s.companion === 'kavi' && s.trust >= 50) c.push({
        t: '🐕 Cross under Kavi\'s watch. Slow, loud, and unblinking.', sub: 'Predator etiquette: you are not prey if you never once act it.',
        do: () => { TB.flag('GRIN_STANDOFF'); TB.flag('EAST_OPEN'); TB.bond(4); }, go: 'ch3_toll_kavi' });
      if (s.companion === 'buri' && s.trust >= 50) c.push({
        t: '🐗 Convoy with Buri. Mass answers mass.', sub: 'Crocodiles take the cheap meal. Make yours expensive.',
        do: () => { TB.flag('GRIN_CONVOY'); TB.flag('EAST_OPEN'); TB.bond(4); }, go: 'ch3_toll_buri' });
      if (s.companion === 'vela' && s.trust >= 50) c.push({
        t: '🦅 Cross under Vela\'s overwatch.', sub: 'Nothing moves in that channel that she won\'t call first.',
        do: () => { TB.flag('GRIN_OVERWATCH'); TB.flag('EAST_OPEN'); TB.bond(4); }, go: 'ch3_toll_vela' });
      c.push({
        t: '🗡️ Fight him for it.', sub: s.stats.health < 35 ? '⚠️ You are in no state for this. He will collect you like rent.' : s.stats.health < 60 ? '⚠️ Hurt as you are, this is close to a coin flip.' : 'Spear, fire, and the worst idea available. It might even work.',
        do: () => { const s2 = TB.state;
          if (s2.stats.health < 35) { s2.deathCause = 'grin'; return; }
          TB.flag('GRIN_FOUGHT'); TB.flag('EAST_OPEN'); s2.injury = 'laceration'; TB.stat('health', -25); TB.stat('hope', 4); },
        go: (s2) => (TB.state.deathCause ? 'death' : 'ch3_toll_fight') });
      c.push({
        t: '↩️ Turn back. The east can wait; the toll\'s too rich today.', sub: 'Live castaways get to change their minds later.',
        do: () => { TB.flag('GRIN_UNRESOLVED'); TB.route('roots', 1); }, go: 'ch3_end_stay' });
      return c;
    },
  });

  const TOLLS = {
    ch3_toll_baited: ['You lay your smoked reserve on the far mudbank at slack tide, upwind and obvious, and it costs you exactly what food costs on an island: everything it took to make. Then you wait in the roots, not breathing, while six meters of appetite makes its unhurried, regal way toward the free meal.', 'You cross the channel with your heart in your ears while the landlord dines. It is the least heroic thing you have ever done flawlessly. From the far bank you watch him finish, settle, and slide one eye across the water to where you now stand — and the eye holds no grudge at all. Rent was paid. The lease is stamped. Business is business in the mangrove country.'],
    ch3_toll_timed: ['First light, low tide. You come to the ford exactly on the schedule the swamp taught you, and there he is — hauled out on his mud throne, grey-cold and logy, a king at his most constitutional.', 'You cross the channel at a steady wade, close enough to count his teeth if your eyes had dared leave the far bank, and the cold holds him like a law of physics. By the time the sun finds the water you are east of everything, standing in country no castaway footprint has touched in fifty years, shaking slightly, entirely whole.'],
    ch3_toll_ipo: ['What Ipo does at the East Passage will be, you are certain, the standard against which you measure audacity for the rest of your life.', 'He crosses the canopy alone to the far bank, descends to the mud in full view, and <em>heckles</em> the largest predator on the island — hurling sticks, shrieking abuse, performing a strut so insolent it has structure — until Old Grin, in the nearest thing a crocodile has to exasperation, commits his whole terrible length up the far mudbank after him. Ipo ascends a root like smoke going up a chimney. You cross the emptied channel at a dead sprint.', 'He rejoins you east of the water, swaggering fit to dislocate something, and accepts his fee — the whole fig ration, prepaid — like a professional. Somewhere behind you, the landlord subsides into his channel, gypped for the first time in decades.'],
    ch3_toll_nine: ['Nine\'s chart is drawn in patience: three nights of her moving through the drowned kingdom below while you slept, and this morning, in the wet sand, the result — channels, depths, and one line, traced twice, through backwaters where the water runs too thin and root-choked for six meters of anything.', 'You cross the East Passage without ever entering his country at all — waist-deep in nursery channels among mudskippers and fiddler crabs, guided turn by turn by a russet arm surfacing ahead of you like a ferryman\'s lamp. From the last pool she watches you climb the eastern bank, and the slotted eye holds something you\'d call, in anyone else, professional satisfaction.'],
    ch3_toll_kavi: ['Kavi teaches you the crossing the way the wild taught him: <em>never once be prey</em>. You enter the ford side by side, slow as ceremony, loud as ownership — no darting, no freezing, no scent of flight — while he holds the water\'s edge with his eyes and a growl pitched to travel through mud and bone.', 'Old Grin surfaces at thirty feet and considers you both: the upright thing that isn\'t running, the grey thing that isn\'t backing down, the whole expensive, unprofitable prospect of it. Patience does arithmetic. Arithmetic says wait for cheaper. He sinks like a decision, and you walk — walk — up the eastern bank.'],
    ch3_toll_buri: ['Buri crosses the ford the way a bulldozer crosses an objection. You go with him, hip against his shoulder, one fist in his bristles, a two-body convoy displacing water and doubt in equal measure.', 'Old Grin rises once, measures the proposition — two hundred pounds of tusked, furious calcium with a human attachment, all of it radiating expense — and declines the meal with the dignity of a king who was, of course, never hungry in the first place. Buri screams one entirely unnecessary victory scream at the settling water. You do not tell him it was unnecessary. It wasn\'t, quite.'],
    ch3_toll_vela: ['You cross on Vela\'s word and nothing else — and it is enough. She holds station over the channel, riding the swamp\'s bad air in flat circles, and twice her cry cracks across the water and you stop dead mid-ford, thigh-deep, while something vast realigns itself invisibly below the tea-dark surface.', 'Twice the cry softens. Twice you move. It takes an hour to cross two hundred yards, on a bird\'s syllables, and when your boots find the eastern bank the relief arrives with a strange gift inside it: the knowledge that you just trusted your one life, entirely, to her — and that she took the weight like it was nothing at all.'],
    ch3_toll_fight: ['You fight him for it, because the island has not yet taught you everything, and this lesson enrolls you the hard way.', 'It is fast and enormous and wrong — the lunge like the ground itself moving, the fire-hardened spear finding the one soft seam above the foreleg more by fate than skill, the tail-blow that takes your legs and opens your side on the mangrove roots. There is a white interval you never fully recover the order of. Then you are on the eastern bank, bleeding, alive, and six meters of affronted antiquity is withdrawing into deep water with your spear standing in its shoulder like a flag it intends to keep.', 'You have crossed. You are torn open and lighter one spear, and something tells you the ledger between you and the landlord now has a standing entry — but you have crossed, on your own terms, which were terrible terms, which were yours.'],
  };
  for (const id of Object.keys(TOLLS)) {
    TB.scene(id, { bg: 'mangrove', text: TOLLS[id], next: 'ch3_east', nextLabel: 'The east opens ➤' });
  }

  TB.scene('ch3_east', {
    bg: 'cliff-camp',
    text: (s) => [
      'The eastern country opens from the first rise like a held breath released: fold on fold of green running down to a coast you\'ve never seen, wilder than yours, wreck-strewn — and climbing the far light, unmistakable, <em>made</em>:',
      'A mast. Steel, guyed, red-rusted, standing crooked above the canopy miles off — an antenna mast, the tallest human thing on the island, marking a compound of pale rooftops half-drowned in green.',
      TB.is('LORE_HALCYON') ? 'Edda\'s station. <em>The</em> station — the one that drilled the singing rock and dug two graves under her flowering tree. Her whole warning stands in the air between you and it, and so does everything the place must still hold: tools, records, machines. A radio.' : 'A station. Buildings, order, purpose — decades abandoned by the look of the mast\'s lean, and utterly out of place, like finding a filing cabinet in a cathedral. Who measured this island, and what did they find, and why did they stop?',
      TB.is('IPO_KEY') ? 'In your pocket, the flat steel key from Ipo\'s hoard seems suddenly heavier: <em>HALCYON — E WING</em>.' : '',
      'The light is going. You mark the bearing, build a dry camp on the high ground, and sit a long time watching the mast rust against the sunset, tomorrow already knocking.',
    ].filter(Boolean),
    next: 'ch3_end',
    nextLabel: 'Chapter Three ends ➤',
  });
  TB.scene('ch3_end_stay', {
    bg: 'mangrove',
    text: [
      'You look at the tea-dark water a long time, and then you turn around.',
      'Not defeat — <em>policy</em>. The east has waited fifty years; it will wait for a better-provisioned, better-informed, better-armed version of you. Live castaways get to change their minds. Drowned ones file no appeals.',
      'The walk home is long, and the mast you never saw stands in your imagination taller than any real one could — but your fire, when you reach it, is your fire, and the west half of an island is still an island.',
      'Old Grin keeps his toll, uncollected. The east keeps its answers. Everyone\'s patience, on this island, is very long.',
    ],
    next: 'ch3_end',
    nextLabel: 'Chapter Three ends ➤',
  });

  // ---- Chapter 3 end card -------------------------------------------------------------------------------
  TB.scene('ch3_end', {
    bg: 'beach-night',
    text: (s) => {
      const t = ['<em>END OF CHAPTER THREE — THE GREEN DEEP</em>', 'The Ledger fills another page. Days ten through fifteen, as the island will remember them:'];
      t.push('— Edda Voss: ' + (s.edda >= 60 ? 'the fence is open, the tea is poured without asking, and the teaching has begun in earnest. Sixty years of island, cracking open for you.' : s.edda >= 35 ? 'probation continues, but she feeds you while insulting you now, which you\'ve learned to bank as affection.' : TB.is('EDDA_MET') ? 'wary, watchful, unconvinced. She has buried better-prepared castaways than you.' : 'still a thread of smoke on a mountain you haven\'t climbed.'));
      if (TB.is('EDDA_GRAVES')) t.push('— You know about Ilsa now. And Aleksander. Two mounds under a flowering tree, and the shape of what staying sixty years actually costs.');
      if (TB.is('LORE_HALCYON')) t.push('— She told you about the station. About the drilling, and the answer, and the graves. The east half of this island has a wound in it with a roof over it.');
      t.push('— The Silverthread runs through your daily life now' + (TB.is('CLAY') ? ', and its clay is drying into your first real pottery' : '') + '. The water problem, that old tyrant, is dead.');
      t.push('— Glyph stones found: ' + (TB.is('GLYPH3') ? '3 — and the third was re-carved recently. Someone still reads the old writing.' : TB.is('GLYPH2') ? '2, and a terrace wall running dead level through wild jungle. This island was farmed.' : TB.is('GLYPH1') ? '1, moss-shouldered, spiral-cut, warm past what the shade allows.' : 'none yet. The Green Deep keeps them patiently.'));
      if (s.disease === 'fever') t.push('— ⚠️ The marsh fever is still in your blood, and it is not idling. Edda\'s bark or a medic\'s discipline — soon.');
      else if (TB.is('FEVER_STRUCK')) t.push('— You caught the marsh fever, and you beat it. The fringe\'s dusk tax has been renegotiated.');
      t.push('— The Boar King: ' + (TB.is('KING_TITHED') ? 'the treaty holds. He inspected your boundary like a magistrate and touched nothing. Rent, it turns out, is a language.' : TB.is('KING_SYMPATHY') ? 'you found the wallow, the industrial snare-wire, the small skulls. Your monster is a veteran of someone else\'s war.' : TB.is('KING_WALLED') ? 'he tested your wall once, at dawn, and your wall won. The treaty is the wall itself.' : 'still unfinished business, circling.'));
      t.push('— And Old Grin\'s Toll: ' + (TB.is('GRIN_BAITED') ? 'paid in smoked meat, crossed in cold blood. Business is business.' : TB.is('GRIN_TIMED') ? 'dodged entirely — you crossed at the dawn window while the cold held him. The swamp respects homework.' : TB.is('GRIN_DISTRACTED') ? 'paid by Ipo, in the single greatest performance of his career. He will never let you forget it.' : TB.is('GRIN_MAPPED') ? 'never owed — Nine walked you through the back door of his kingdom.' : TB.is('GRIN_STANDOFF') ? 'faced down, side by side with Kavi, at a walk. Never once prey.' : TB.is('GRIN_CONVOY') ? 'declined — Buri made the meal too expensive. One unnecessary victory scream was screamed.' : TB.is('GRIN_OVERWATCH') ? 'crossed on Vela\'s syllables alone. You bet your life on her word and she took the weight.' : TB.is('GRIN_FOUGHT') ? 'paid in blood — some his, more yours. You crossed on your own terrible terms, and the ledger between you has a standing entry now.' : 'refused. The east keeps its answers, and the landlord keeps his channel. For now.'));
      if (TB.is('EAST_OPEN')) t.push('— The east is open. A rusted mast stands above the far canopy, and under it, everything Halcyon left behind.' + (TB.is('IPO_KEY') ? ' The key in your pocket says E WING.' : ''));
      t.push('Route leanings — Signal ' + s.route.signal + ' · Roots ' + s.route.roots + ' · Depth ' + s.route.depth + '.');
      return t;
    },
    choices: [
      { t: '📡 Continue — Chapter Four: The Hum ➤', sub: 'Station Halcyon, the journals of Dr. Ilsa Vane, and what answered the drill.',
        go: 'ch4_open' },
      { t: '🌊 Start a new run instead', sub: 'Different companion, different tolls, different ledger.',
        do: () => { TB.wipe(); TB.state = TB.newState(); }, go: 'title' },
    ],
  });
})(window);
