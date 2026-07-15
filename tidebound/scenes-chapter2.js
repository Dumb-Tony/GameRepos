/* =====================================================================
 * scenes-chapter2.js — Chapter Two: Foothold (Days 6–18).
 * Base-site threshold, the trust system made real, companion abilities,
 * the Boar King's raid, the first storm (with companion fear arcs),
 * the smoke inland, and the chapter-ending Smoke threshold.
 * Conventions unchanged: effects in `do`/`next`, never in `enter`
 * (except idempotent, guarded init); camp actions stash s.out and
 * route through 'act_result'.
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
  const BOAR_KING = { emoji: '🐗', name: 'The Boar King', art: 'char-boarking' };
  const EDDA_SHAPE = { emoji: '👵', name: 'The lantern-bearer', art: 'char-edda' };

  function campBg2(s) {
    if (s.site === 'fringe') return 'camp-fringe';
    if (s.site === 'overhang') return 'cliff-camp';
    return s.seg === 2 ? 'beach-dusk' : 'beach-day';
  }

  // ---- Chapter open: the base-site threshold -------------------------------
  TB.scene('ch2_open', {
    bg: 'beach-day',
    enter: (s) => {
      if (s.chapter >= 2) return; // reload guard
      s.chapter = 2; s.day = 6; s.seg = 0;
      if (s.companion && !TB.is('TRUST_INIT')) {
        s.trust = TB.clamp(18 + (s.interest[s.companion] || 0) * 5, 0, 45);
        TB.flag('TRUST_INIT');
      }
    },
    text: (s) => {
      const c = s.companion;
      return [
        '<em>CHAPTER TWO — FOOTHOLD</em>',
        'Day six dawns different. Not easier — different: the difference between falling and standing somewhere. You have fire' + (s.fire ? '' : ' — well, you\'ve had fire, and will again') + ', a roof of sorts, five days of hard schooling, and ' + (c ? NAMES[c] + ', watching you wake with the expression of a colleague waiting on a decision.' : 'nobody to consult but yourself, which at least keeps meetings short.'),
        'And a decision is due. The crash beach was where you washed up, not where you chose. If this is going to be a <em>camp</em> — a base, a foothold, the address of your survival — it\'s time to pick the ground on purpose. You\'ve scouted three candidates.',
        'Each is a bargain. None is safe.',
      ];
    },
    choices: [
      {
        t: '🏖️ Stay on the crash beach.',
        sub: 'Best view of the sea and the sky — nothing passes without you seeing it. But storms and tides own this ground, and everything inland is a hike.',
        do: (s) => { s.site = 'beach'; TB.flag('SITE_BEACH'); TB.route('signal', 1);
          s.out = { bg: 'beach-day', text: ['You stay. It costs nothing to stay, which is its own kind of trap — but you\'ve thought it through: the beach is where rescue looks, where wrecks wash in, where the horizon is a fact instead of a rumor. You spend the morning making the accident of your camp into a decision: fire ring rebuilt above the spring-tide line, stores lashed higher, the SOS renewed stone by stone.', 'The sea watches you do it, patient as arithmetic. You have chosen to live with a large, moody neighbor.'] };
          TB.tickSegment(); },
        go: 'act_result',
      },
      {
        t: '🌿 Move to the jungle fringe.',
        sub: 'Shade, forage, building wood at arm\'s reach. But the green breathes bugs at dusk, and the sea — and its rescue — goes out of sight.',
        do: (s) => { s.site = 'fringe'; TB.flag('SITE_FRINGE'); TB.route('roots', 1);
          if (!TB.has('toolbox') && s.shelter > 0) s.shelter -= 1;
          TB.stat('energy', -10);
          s.out = { bg: 'camp-fringe', text: ['You spend the morning hauling your life a quarter mile inland, to a clearing where the palms give way to real trees and the ground stops being sand and starts being soil.' + (TB.has('toolbox') ? ' With the toolbox, the lean-to comes apart and goes back together like it was designed for it.' : ' The lean-to doesn\'t survive the move; you\'ll rebuild better with better wood.'), 'By noon your camp sits in green light, forage within a stone\'s throw in every direction. The jungle accepts you the way a city accepts anyone: indifferently, and with mosquitos.'] };
          TB.tickSegment(); },
        go: 'act_result',
      },
      {
        t: '🪨 Claim the cliff overhang.',
        sub: 'Stone roof, storm-proof, defensible, and a view like a throne. But it\'s dry country — every drop of water gets carried up.',
        do: (s) => { s.site = 'overhang'; TB.flag('SITE_OVERHANG'); TB.route('depth', 1);
          if (!TB.has('toolbox') && s.shelter > 0) s.shelter -= 1;
          TB.stat('energy', -14);
          s.out = { bg: 'cliff-camp', text: ['The overhang takes the whole morning and most of your arms: relay after relay up the goat-track with everything you own. But when you finally sit down under fifty feet of solid stone roof and look out — the lagoon below, the reef drawn on the sea like a chart, weather visible an hour before it arrives — you understand what you\'ve bought.', 'No storm touches you here. No tide. Nothing without wings arrives unannounced. You will pay for it in water, one hauled gourd at a time, and you suspect the ledger will feel that price daily.'] };
          TB.tickSegment(); },
        go: 'act_result',
      },
    ],
  });

  // ---- The Chapter 2 camp hub -----------------------------------------------
  const SITE_LINE = {
    beach: 'The sea keeps its enormous counsel beside your camp.',
    fringe: 'Green light moves on everything; the jungle conducts its business around you.',
    overhang: 'Wind combs the ledge; the lagoon glitters far below like something owned.',
  };
  // Companion idle life: each visit to camp, one vignette from the tier's
  // pool — trust shown as behavior, never numbers, and never the same day
  // twice in a row (pure flavor; safe to re-roll on reload).
  const TIER_LINE = {
    kavi: [
      ['Kavi patrols a wide circle around camp, pretending not to be yours.', 'Kavi has excavated a shallow day-bed at the exact radius where leaving would be easy. He uses it facing you.', 'Kavi accepts a fish head at arm\'s length, retreats three lengths to eat it, and watches you the whole time like a debt he\'s deciding whether to honor.'],
      ['Kavi lies where he can see both you and the treeline.', 'Kavi has begun escorting you to the waterline and back — five paces behind, eyes out, pretending it\'s his own errand.', 'Something moved in the fringe an hour ago. You know because Kavi stood, took two stiff steps toward it, and placed himself exactly on the line between it and you.'],
      ['Kavi sleeps touching your back now. It happened without negotiation.', 'Kavi brings a stick and drops it two paces off — not for throwing, you eventually understand. It\'s inventory. He\'s contributing.', 'You wake from a doze to find Kavi\'s chin resting on your ankle, eyes open, on duty. He looks away the moment you notice, deeply casual about it.'],
      ['Kavi moves when you move, like a shadow that learned tactics.', 'Kavi has opinions about your route now — a low huff for the fringe path after rain, one ear flat for the rocks at low tide. You\'ve learned to consult him.', 'When you laugh at something, Kavi\'s tail answers from wherever he is, like a second voice agreeing sight unseen.'],
      ['Kavi is not a wild dog who tolerates you. You are pack.', 'On the ridge at dusk the pack sings, and Kavi answers from beside your fire — one long note that means, as best you can translate it: <em>accounted for, both of us.</em>', 'Kavi sleeps flat on his side now, belly to the fire, paws twitching through some running dream — the sleep of an animal with a sentry he trusts. The sentry is you.'],
    ],
    ipo: [
      ['Ipo watches from the trees, auditing your possessions.', 'A fig lands at your feet, thrown from the canopy with insulting accuracy. Payment, or bait, or both. Ipo\'s ledger is complicated.', 'Your spoon has moved four feet since you last put it down. Nothing else touched. Somewhere above, Ipo\'s audit continues.'],
      ['Ipo has moved into camp and rearranged it to his taste.', 'Ipo naps in your best shade with one arm over his eyes, radiating ownership. You rate a spot in the second-best shade, which he has graciously left vacant.', 'Ipo has sorted your shells by a system you don\'t understand. When you re-sort them, he sighs — audibly, theatrically — and does it back.'],
      ['Ipo rides your shoulder like the whole island is a parade.', 'Ipo performs the morning\'s inventory from your shoulder, gripping your ear for balance and narrating everything in small emphatic sounds.', 'A gull came to case the camp earlier. Ipo saw it off with a fury so operatic the gull may write about it. He accepted applause afterward. It was expected, and deserved.'],
      ['Ipo brings you things now — useful ones, mostly, and always with ceremony.', 'Ipo\'s tribute today, presented on your knee with both hands: a bottle cap, polished to a shine. His finest piece. You wear it on your hat cord. He checks, hourly, that it\'s still there.', 'Ipo has started grooming the camp itself — a leaf off the tarp, a beetle escorted from the bedding — small custodial acts he performs only when he thinks you\'re not watching.'],
      ['Ipo grooms your hair each dusk with the gravity of a priest.', 'Ipo sleeps in the crook of your arm now, one fist knotted in your collar, and defends the position at dawn against nobody, on principle.', 'You caught Ipo showing your camp to a young troop cousin from the tree line — sweeping gestures, proprietary tone. Giving the tour. Of his estate. Which is you.'],
    ],
    vela: [
      ['Vela keeps to the dead palm, books open, judgment pending.', 'Vela times her patrols over your camp — high, once, at noon — the way an inspector visits a establishment she has not yet decided to certify.', 'Vela watched you fumble the fish spear from her snag for a full hour today and offered nothing. The tuition is observation. Class dismissed at dusk.'],
      ['Vela lands nearer now, and stays longer than transactions require.', 'Vela has begun announcing her arrivals — one short call on approach, so you\'ll look up. She does not perform for nobody.', 'The dead palm is bare this morning; Vela is on the driftwood inside camp instead, at the edge of it, testing the word <em>inside</em>.'],
      ['Vela walks on your left, giving you her good eye.', 'Vela rides the wind above you on the long beach walks, stationed off your shoulder like a second thought. When you stop, she circles. When you turn, she\'s already turned.', 'Today Vela stood on the sand — actually stood, folded, earthbound — a full wingspan from you for the better part of an hour. From an empress, this is an embrace.'],
      ['Vela brings fish you didn\'t ask for and pretends otherwise.', 'A commotion of gulls off the point at midday, and Vela returning low over the water: she took something back from them. It lands by your fire, hers by conquest, yours by decree.', 'Vela has learned the sound of your knife on the whetstone and arrives shortly after, supervising the fish-cleaning with an accountant\'s interest in her percentage.'],
      ['Vela mantles over your camp in storms like it were a nest.', 'You woke in the night to weather turning and a shape on the ridgepole: Vela, hunched against the first rain, guarding a camp that could not fly away. She was gone by light. The dry patch under her stayed.', 'Vela preens on the snag while you work below, and every so often a small white feather spirals down into camp. You have started keeping them. She has, you suspect, started counting them.'],
    ],
    buri: [
      ['Buri visits at mealtimes with the innocence of a tax collector.', 'Buri arrives, inspects the cook-fire\'s output, finds it insufficient, and leaves — but not before rubbing one itchy flank against your best post hard enough to loosen it. A calling card.', 'You found Buri asleep in the wet wallow he\'s dug scandalously close to camp. Squatter\'s rights are being established. There will be no appeal.'],
      ['Buri sleeps against the woodpile, camp\'s warmest fixture.', 'Buri has appointed himself taster of everything you forage. The tax is one sample per basket. The service — an honest opinion, instantly rendered — is, he feels, worth it.', 'It rained in the night and Buri relocated to the driest corner of camp, which was yours. You woke half-under a warm boulder with opinions. Neither of you mentions it.'],
      ['Buri plants himself between you and every unfamiliar noise.', 'Something big moved in the fringe at dusk and Buri was up before you were — planted, head low, two hundred pounds of NO between camp and the dark. It reconsidered.', 'Buri leans against you while you work now — just stands there, shoulder to your hip, a warm freight of company. You brace for it without looking. He counts on that.'],
      ['Buri escorts you to the forage line like a one-pig honor guard.', 'Buri has learned your gathering route and improves it as you walk — a nose-flip here turning up tubers, a shoulder there opening a path — resurfacing the road for his person.', 'You sat down hard today, just tired, just for a minute — and Buri came and lay down against your back without ceremony, a wall to lean on, for exactly as long as you needed one.'],
      ['Buri would follow you into the sea, and has tried.', 'The wallow has been extended. There are now, unambiguously, two person-sized depressions in it, one guest-sized. Buri waits by it on hot afternoons, looking from the mud to you, extending the invitation.', 'Buri sleeps flat against your shelter wall these nights, and the whole structure breathes with him — slow, enormous, seaworthy. Your house has a heartbeat now.'],
    ],
    moa: [
      ['Moa observes camp from the fringe, wound like a spring.', 'Moa has established a forward post on the big driftwood log — close enough to study you, far enough to disavow the whole arrangement if questioned.', 'A junglefowl skirmish erupted at the tree line this morning and Moa returned from it with one feather askew and the unmistakable air of a won argument.'],
      ['Moa dust-bathes by the fire ring and scolds the wind.', 'Moa has begun reporting to you — a low running commentary as she patrols, delivered whether or not you\'re listening. You are being briefed. Attendance is assumed.', 'Moa found the shiny tin lid you lost. She stood by it, announcing, until you came. She does not fetch. She <em>locates</em>. Fetching is for dogs.'],
      ['Moa sleeps on the driftwood by your knee, facing the dark.', 'A hawk\'s shadow crossed camp at noon and Moa hit full alarm — wings out, voice like a whistle drill — putting the entire beach on notice. The hawk moved on. She logged it as a rout.', 'Moa inspects your work over your shoulder now, head cocked, one bright eye at a time. When she mutters approval, you notice you sit straighter. Her methods work.'],
      ['Moa walks the camp perimeter at dusk like a tiny sergeant.', 'Moa has instituted a curfew. You don\'t know its exact terms, but when you\'re out past it she comes and gets you — marching ahead of you back to camp, muttering about castaways who wander.', 'Moa stood her watch through the whole grey afternoon on the highest stone, feathers doubled against the wind, relieving herself of duty only when you banked the fire. Somewhere, an army misses her.'],
      ['Moa has decided you are her flock, and guards you accordingly.', 'You woke before dawn to Moa on your chest, fast asleep, facing the door. At some point in the night the last perimeter contracted to this: you, personally, held.', 'Moa\'s morning report has changed tone lately — shorter, softer, delivered from your knee instead of the log. The sergeant, off duty. Just a small copper hen who chose her person.'],
    ],
    nine: [
      ['Nine surfaces at the tideline when you pass, one eye out, noting.', 'There is a new shell on the flat rock at the tideline — placed, not washed. When you pick it up, the water twenty feet out swirls once — Nine, satisfied.', 'You have started narrating your shore walks without meaning to. Somewhere under the glitter, Nine, you are fairly sure, is taking minutes.'],
      ['Nine waits at the pool\'s edge when you come down to the shore.', 'Nine has begun trading. Today: your dropped fishhook, recovered from four feet of water, exchanged at the pool\'s edge for one crab, market rate, no haggling.', 'The tide pools have been rearranged again overnight — but this time the sorted shells spell out a rough spiral pointing at YOUR camp. Filed. Catalogued. Claimed, possibly, by Nine.'],
      ['Nine touches your hand when you reach into the water now.', 'Nine held your wrist a long moment today — reading your pulse the way you\'d read a letter — then let go and slid back down into the dark, taking the news of you with her.', 'You cut your palm on coral and rinsed it in the shallows, and Nine came up out of nowhere and hovered her arms around the hurt without touching it — the reef\'s own triage, gentle and grave.'],
      ['Nine solves things for you — knots, latches, shells — unasked.', 'The knot you couldn\'t manage last night is retied this morning. Correctly. Underwater, presumably, by touch alone, by Nine, who has eight separate opinions about your rope-work.', 'Nine has started leaving you puzzles: today a stone jar, lid screwed tight, one hermit crab inside, alive. You open it, release the crab, and leave the jar. By dusk: new crab. It\'s school, you realize. You\'re enrolled.'],
      ['Nine watches you the way you watch the horizon: like it matters.', 'At slack tide Nine floated in the shallows while you waded, one arm around your ankle — not holding you back, not pulling. Just keeping. The way you\'d rest a hand on a shoulder.', 'The gallery in the third pool has a new centerpiece: your lost button, the one from the wreck, recovered from wherever the sea filed it — mounted on the highest stone, facing your camp. You are in Nine\'s collection now.'],
    ],
  };

  TB.scene('camp2', {
    bg: campBg2,
    text: (s) => {
      const t = [];
      const segName = ['The sun is barely up.', 'The sun stands high.', 'The light is going long and gold.'][s.seg] || '';
      t.push('<em>Day ' + s.day + ' — ' + TB.SEGS[s.seg] + '.</em> ' + segName + ' ' + SITE_LINE[s.site || 'beach']);
      if (s.seg === 0 && s.gift) { t.push(s.gift); }
      const w = [];
      if (s.stats.thirst <= 30) w.push('thirst has moved from complaint to command');
      if (s.stats.hunger <= 30) w.push('hunger is doing the thinking now');
      if (s.stats.energy <= 25) w.push('your body is running on argument alone');
      if (s.injury) w.push('the wound needs more respect than you\'re giving it');
      if (w.length) t.push('Honest accounting: ' + w.join('; ') + '.');
      if (s.companion) t.push(pick(TIER_LINE[s.companion][TB.tier()]));
      // the island's other people, felt at dawn: smoke, hammering, song
      if (s.seg === 0) {
        const folk = [];
        if (TB.is('EDDA_MET')) {
          folk.push('Inland, Edda\'s hearth-smoke climbs the mountain\'s knee in its thin grey line, banked and punctual — the island\'s oldest clock, still keeping.',
            'A single far-off shotgun report rolls down from the terraces and flattens over the water. Somewhere on the mountain, Edda is renegotiating with the pest population.');
          if (s.edda >= 50) folk.push('Edda\'s smoke rises early and generous this morning — baking smoke, you\'ve learned to read it, the kind that means the next visitor up the mountain leaves with more than they carried in.',
            'There\'s a palm-leaf bundle on the boundary stone this morning: dried figs and one scandalously good tomato. No note. The old woman\'s accounting travels downhill by itself.');
        }
        if (TB.is('RYO_MET') && s.ryo >= 40) {
          folk.push('From down the beach, carried on the offshore air: hammering. Two strikes, a pause for argument, three more. The Kingfisher and her captain, negotiating.',
            'Ryo\'s voice drifts up the beach in pieces this morning — some working song in no language you know, timed to a caulking mallet, cheerfully off-key. The sound of a man mid-repair, in every sense.',
            'A thread of pitch-smoke rises from down the shore where the Kingfisher lies. Ryo is boiling tar before the heat comes up, which means today is a hull day, which means tonight he\'ll talk your ear off about strakes.');
        }
        if (folk.length && R() < 0.45) t.push(pick(folk));
      }
      if (TB.is('SMOKE_SEEN') && !TB.is('CLEARING_DONE2')) t.push('And inland, above the green — you catch yourself checking, every hour — the thin grey thread of <em>someone else\'s fire</em> still climbs the sky.');
      t.push('What do you spend this part of the day on?');
      return t;
    },
    choices: (s) => {
      const c = [];
      const bg = campBg2(s);
      // --- water & food core ---
      c.push({
        grp: 'daily',
        t: s.site === 'overhang' ? '💧 Haul water and coconuts up the track' : '🥥 Coconuts — drink and eat',
        sub: s.site === 'overhang' ? 'The overhang\'s daily tax. Energy −−, thirst restored.' : 'The palms keep providing. Energy −, thirst restored.',
        do: () => { const s2 = TB.state; TB.stat('thirst', 34); TB.stat('hunger', 10); TB.stat('energy', s2.site === 'overhang' ? -12 : -8);
          if (s2.site !== 'overhang') s2.nuts = (s2.nuts || 0) + 2;
          s2.out = { bg, text: [s2.site === 'overhang' ? pick([
            'Down the goat-track, load, up the goat-track — twice. Your calves have opinions; the gourds sweat cool against your back. From the ledge you drink looking down at the whole shining lagoon, which almost makes carrying a personal ocean uphill feel reasonable.',
            'The water run, morning edition. You know every root-step of the goat-track now, every resting ledge, the exact spot where the wind arrives to dry your back. The gourds ride up full and heavy. Civilization, one trip at a time.',
            'You haul the day\'s water with your mind elsewhere and your feet on autopilot, and only notice at the top that you\'ve carried an extra half-load without registering it. The mountain is making you into someone specific.',
          ]) : pick([
            'The green coconuts come down, come open, and go down easier. You will never again drink anything without noticing you\'re drinking.',
            'You work the near grove with the long pole and the practiced twist, and drink the first one standing right there under the palms, warm and green-tasting, tribute at the source.',
            'Coconut arithmetic: two for thirst, one for the shreds, husks for the fire pile. Nothing wasted. Edda would grunt approval, which is her highest civilian honor.',
          ])] };
          TB.tickSegment(); },
        go: 'act_result',
      });
      c.push({
        grp: 'daily',
        t: '🌿 Forage', sub: (s.site === 'fringe' ? 'The fringe is generous. ' : '') + 'Fruit, crabs, roots. Energy −, food +.',
        do: () => { const s2 = TB.state; const bonus = s2.site === 'fringe' ? 6 : 0; TB.stat('energy', -8); TB.stat('hunger', 16 + bonus); TB.stat('thirst', 3);
          s2.out = { bg: s2.site === 'beach' ? 'jungle' : bg, text: [pick([
            'You work the gathering lines you\'ve learned: seagrape, fig, the breadfruit tree you\'ve started thinking of possessively' + (s2.site === 'fringe' ? ' — all of it minutes from your fire now, which still feels like cheating.' : '.'),
            'A good forage day: the figs are dropping, the crabs are careless, and you find a stand of palm-hearts you\'ve been saving like money. The bag comes home with weight in it.',
            'You gather on autopilot and let your eyes do the newer work — reading the jungle\'s margins for sign, for change, for the island\'s small daily edits. The food is almost a byproduct now. Almost.',
            'Half the harvest today is knowledge: which fig tree the birds hit first (theirs is riper), where the crabs shifted after the last tide, what the ants know about tomorrow\'s weather (rain, they vote, moving house uphill).',
          ])] };
          TB.tickSegment(); },
        go: 'act_result',
      });
      c.push({
        grp: 'daily',
        t: '🎣 Spearfish the shallows', sub: (s.site === 'beach' ? 'Your home water. ' : 'A walk to the water first. ') + 'Protein, if your aim holds.',
        do: () => { const s2 = TB.state; const skill = (s2.site === 'beach' ? 0.75 : 0.6) + (s2.companion === 'vela' && s2.trust >= 40 ? 0.2 : 0);
          TB.stat('energy', -9);
          if (R() < skill) { TB.stat('hunger', 24); s2.food += 1;
            s2.out = { bg: 'tidepools', text: [pick([
              'An hour of stillness, three misses, and then the spear comes up arguing — a fat mullet, then a second. One for now, one smoked for later.',
              'The tide brings a parrotfish within honest range and your arm remembers everything you\'ve taught it. Clean strike. You thank the fish the way you\'ve started thanking everything, quietly, like paying at a till.',
              'Today the shallows are generous: a school working the weed-line, unbothered, and you take two with the patience of a heron and the smugness of a person who was once wholly incompetent at this.',
            ]) + (s2.companion === 'vela' && s2.trust >= 40 ? ' Vela, wheeling above the shallows, stoops twice to drive fish toward your legs. You are, you realize, being <em>assisted</em>.' : '')] }; }
          else { s2.out = { bg: 'tidepools', text: [pick([
            'The fish hold a meeting somewhere you aren\'t. An hour of stalking buys you two misses, one splinter, and a renewed respect for herons.',
            'You spook the school on the first cast and spend the rest of the hour being watched by everything you might have eaten. The sea keeps its side of the counter shut today.',
            'A near-thing on a big trevally that would have fed three days — the spear kisses scale and comes back empty, and the swirl it leaves is the ocean\'s version of laughter.',
          ])] }; }
          TB.tickSegment(); },
        go: 'act_result',
      });
      // --- camp works ---
      if (s.shelter < 3) c.push({
        grp: 'camp',
        t: s.shelter >= 2 ? '🛡️ Fortify the camp' : '⛺ Rebuild the shelter',
        sub: s.shelter >= 2 ? 'Palisade, raised cache, storm-bracing. Roots put down on purpose.' : 'Get a roof worth the word again.',
        do: () => { const s2 = TB.state; const cost = (TB.has('toolbox') || TB.is('BG_ENGINEER') ? -10 : -14) + (s2.companion === 'buri' && s2.trust >= 40 ? 4 : 0);
          TB.stat('energy', cost); s2.shelter += 1; TB.route('roots', 2);
          s2.out = { bg, text: [s2.shelter >= 3 ? 'By dusk it isn\'t a camp anymore. It\'s a <em>position</em>: palisade of sharpened stakes, stores raised on a platform no pig on earth could reach, fire ring walled against wind. You walk the perimeter twice for no practical reason at all.' : 'Frame, thatch, lashings — faster this time, better this time. Your hands have learned things your head is only now writing down.' + (s2.companion === 'buri' && s2.trust >= 40 ? ' Buri drags the heavy poles like it\'s a game he\'s winning.' : '')] };
          TB.tickSegment(); },
        go: 'act_result',
      });
      if (s.fire < 1) c.push({
        grp: 'camp',
        t: '🔥 Make fire', sub: TB.has('lighter') ? 'The lighter, reclaimed and priceless.' : 'Friction and stubbornness.',
        do: () => { const s2 = TB.state; TB.stat('energy', -12);
          const p = TB.has('lighter') ? 1 : (0.55 + (TB.is('BG_ENGINEER') ? 0.2 : 0) + (TB.has('toolbox') ? 0.15 : 0));
          if (R() < p) { s2.fire = 1; TB.stat('hope', 6); s2.out = { bg, text: ['Fire again. The camp exhales. So do you.'] }; }
          else { TB.stat('hope', -3); s2.out = { bg, text: ['Smoke, heat, blisters — no flame. The drill wins today. Tomorrow it won\'t.'] }; }
          TB.tickSegment(); },
        go: 'act_result',
      });
      if (s.injury && TB.has('medkit')) c.push({
        grp: 'top',
        t: '🩹 Clean and dress your wound', sub: 'Uses the med-kit.',
        do: () => { const s2 = TB.state; TB.item('medkit', -1); s2.injury = null; TB.stat('health', 10); TB.stat('hope', 3);
          s2.out = { bg, text: ['Clean, dress, breathe. Out here, clean is the whole war — you keep winning it on purpose.'] };
          TB.tickSegment(); },
        go: 'act_result',
      });
      if (s.fire >= 1 && s.stats.hunger < 85) c.push({
        grp: 'daily',
        t: '🍲 Cook a real meal', sub: 'Fire plus patience equals personhood.',
        do: () => { const s2 = TB.state; const cook = TB.is('BG_COOK'); TB.stat('energy', -6); TB.stat('hunger', (cook ? 34 : 25) + (s2.food > 0 ? 6 : 0)); if (s2.food > 0) s2.food -= 1; TB.stat('hope', cook ? 7 : 5); TB.stat('thirst', 4);
          if (s2.companion) TB.bond(2);
          s2.out = { bg, text: [(cook ? 'You cook like it\'s a shift: smoked fish, roast breadfruit, fig reduction on hot stone. Plated on a leaf. Reviewed by an audience of ' : 'You cook it slow and eat it slower, broth and roast and smoke, and the day\'s weight comes off your shoulders one swallow at a time. Sharing the scraps is ') + (s2.companion ? NAMES[s2.companion] + ', who finds no fault.' : 'no one, which is the one seasoning you\'re short of.')] };
          TB.tickSegment(); },
        go: 'act_result',
      });
      // --- companion actions ---
      if (s.companion) {
        c.push({
          grp: 'daily',
          t: '❤️ Spend time with ' + NAMES[s.companion],
          sub: 'Food shared, patience spent, trust built. Nothing else gets done.',
          do: () => { const s2 = TB.state; TB.bond(5); TB.stat('hope', 3); TB.stat('hunger', -4);
            const texts = {
              kavi: 'You sit at his distance and let the afternoon pass through both of you. Somewhere in the middle of it, the distance is smaller. Neither of you moved, that you noticed.',
              ipo: 'You dedicate the hours to his curriculum: chase, be robbed, applaud, negotiate. He falls asleep against your neck mid-lesson, one fist knotted in your collar, entirely certain of his safety.',
              vela: 'You bring fish and stand in the open and expect nothing, which is the entire etiquette. Today she eats without watching you once. From her, this is a sonnet.',
              buri: 'You scratch the spot behind his ear that dismantles him. Two hundred pounds of pig capsizes into your lap like a ferry sinking, and stays.',
              moa: 'You sit low and talk to her about the day — supply lines, hawk sightings, morale. She patrols your crossed legs, mutters answers, and finally settles in the crook of your knee, on duty.',
              nine: 'You go down to her pool with a live crab and your full attention. She takes your wrist — gently, thoroughly, reading — and today, for the first time, she doesn\'t let go when she\'s done. You stay until the tide asks you to leave.',
            };
            s2.out = { bg: s2.companion === 'nine' ? 'tidepools' : campBg2(s2), text: [texts[s2.companion]] };
            TB.tickSegment(); },
          go: 'act_result',
        });
        const abil = {
          kavi: { t: '🐕 Hunt with Kavi', sub: 'He tracks, you finish. The island\'s best protein.',
            fn: (s2) => { TB.stat('energy', -10); TB.stat('hunger', 30); s2.food += 1; TB.bond(2);
              return { bg: 'jungle', text: ['Kavi works the pig-trails like a professional reading a ledger — nose down, ears up, one glance back to check you\'re keeping station. By dusk there\'s a plump junglefowl' + (s2.companion === 'moa' ? '' : ' (you don\'t mention it to anyone copper-colored)' ) + ' and a fat monitor tail across your shoulder, and a dog walking beside you with the specific satisfaction of competence witnessed.'] }; } },
          ipo: { t: '🐒 Canopy run with Ipo', sub: 'The jungle\'s ceiling is his pantry. Occasionally his crime scene.',
            fn: (s2) => { TB.stat('energy', -6); TB.stat('hunger', 20); TB.bond(2);
              const inc = R() < 0.3;
              if (inc) TB.flag('IPO_INCIDENT');
              return { bg: 'jungle', text: ['Ipo vanishes upward and the canopy starts raining breakfast: figs, palm hearts, one affronted beetle the size of a doorknob. He keeps a running commentary you\'re glad not to understand.', inc ? 'He also brings something he should not have: a bright tin token, old and stamped with a marching goose — a <em>trinket from somewhere with people</em>. When you try to see where he got it, he performs innocence at a level that confirms guilt absolutely.' : ''] .filter(Boolean) }; } },
          vela: { t: '🦅 Read the sky with Vela', sub: 'Weather and salvage, from the only vantage that matters.',
            fn: (s2) => { TB.stat('energy', -4); TB.bond(2); TB.route('signal', 1); TB.flag('FORECAST');
              return { bg: 'cliff-camp', text: ['You climb to open ground and watch her ride the standing wind, tilting, reading pages you can\'t see. She comes down the sky in stages and lands heavily beside you, and you\'ve learned her grammar now: the mantled wings, the low rattle. <em>Weather coming.</em> You spend the rest of the light moving your world under cover, and you\'ll be glad of every minute of it.'] }; } },
          buri: { t: '🐗 Dig with Buri', sub: 'Tubers, grubs, and whatever the ground is hiding.',
            fn: (s2) => { TB.stat('energy', -6); TB.stat('hunger', 24); s2.food += 1; TB.bond(2);
              return { bg: 'camp-fringe', text: ['Buri plows the soft ground behind the tree-line like agriculture personally offended him: yams, fat white grubs, a nest of tubers he shares with the magnanimity of a king distributing land. You gather in his wake. It is, you both feel, an extremely fair division of labor.'] }; } },
          moa: (TB.is('NEST_BOX') ? null : { t: '🐔 Build Moa a storm-box', sub: 'A covered nest, braced and dark and hers. She will need it.',
            fn: (s2) => { TB.stat('energy', -8); TB.bond(4); TB.flag('NEST_BOX'); TB.route('roots', 1);
              return { bg: campBg2(s2), text: ['You build it the way you\'d build for yourself if you were two pounds of nerves: low, braced, dark, one entrance, lined with the softest thatch you own. Moa inspects it for a full quarter hour — perimeter, roof, sight-lines — before stepping inside and issuing one soft note you haven\'t heard before.', 'You are almost certain it means <em>adequate</em>. From her, this is a parade.'] }; } }),
          nine: { t: '🐙 Work the reef with Nine', sub: 'Salvage from water you can\'t reach alone.' + (s.site !== 'beach' ? ' A trek to the shore first.' : ''),
            fn: (s2) => { TB.stat('energy', s2.site === 'beach' ? -8 : -12); TB.bond(2); TB.route('depth', 1);
              const finds = ['a coil of aircraft wire', 'a sealed jar of pilot-bread, dry inside', 'a pearl the size of a currant', 'a brass hinge and a handful of screws'];
              const f = finds[Math.floor(R() * finds.length)];
              if (f.indexOf('pilot-bread') >= 0) TB.stat('hunger', 18);
              return { bg: 'tidepools', text: ['You swim the inner reef with Nine flowing ahead of you, pointing — actually pointing, one arm extended, at things your ape eyes miss: today, ' + f + ', freed from the coral with a patience no human hand could copy.', 'She takes her wage in crab and attention, and escorts you back to the shallows like a harbor pilot.'] }; } },
        };
        const a = abil[s.companion];
        if (a) c.push({ grp: 'daily', t: a.t, sub: a.sub,
          do: () => { const s2 = TB.state; s2.out = a.fn(s2); TB.tickSegment(); }, go: 'act_result' });
      } else {
        c.push({
          grp: 'camp',
          t: '🧍 Keep your own counsel', sub: 'Rest, order, and the discipline of being enough.',
          do: () => { const s2 = TB.state; TB.stat('energy', 10); TB.stat('hope', 4);
            s2.out = { bg, text: ['You mend, sort, sharpen, stack. Solitude, you\'re learning, is a structure too — it holds if you build it daily.', s2.day >= 6 && !TB.is('COCO') ? 'Among the water gourds you notice one coconut with three dark pores arranged, unmistakably, like a face. It has been watching you work this whole time, and its expression suggests it finds your methods sound.' : ''].filter(Boolean) };
            if (s2.day >= 6) TB.flag('COCO');
            TB.tickSegment(); },
          go: 'act_result',
        });
      }
      if (TB.is('SMOKE_SEEN')) c.push({
        grp: 'story',
        t: '🔭 Study the smoke inland', sub: 'Learn what a fire an hour\'s trek away can teach from here.',
        do: () => { const s2 = TB.state; TB.stat('energy', -4); TB.route('depth', 1);
          s2.out = { bg: 'jungle', text: ['You watch it through the noon and into the slant light: thin, steady, banked and tended — not a wildfire, not a signal. A <em>hearth</em>. Whoever feeds it has fed it for years; you can tell by how little it wanders.', 'Someone on this island knows how to live here. The question you keep circling is why they haven\'t come to look at <em>your</em> smoke.'] };
          TB.tickSegment(); },
        go: 'act_result',
      });
      c.push({
        grp: 'camp',
        t: '😴 Rest' + (s.injury ? ' and tend your wound' : ''), sub: s.injury ? 'No kit — just rest, clean seawater, and time. It may knit.' : 'Recovery is also production.',
        do: () => { const s2 = TB.state; TB.stat('energy', 16); TB.stat('hope', 2); TB.stat('health', s2.injury ? 0 : 3);
          if (s2.injury && (s2.fire ? R() < 0.45 : R() < 0.25)) { s2.injury = null; TB.stat('health', 6);
            s2.out = { bg, text: ['You give the day to the wound: seawater-washed, sun-dried, dressed in the cleanest cloth you own, and then honest rest beside it' + (s2.fire ? ', the fire keeping everything dry and warm' : '') + '.', 'By dusk the edges have closed to a clean pink seam. It held. It\'s knitting. Out here that\'s not luck — that\'s discipline paying its dividend.'] }; }
          else s2.out = { bg, text: [s2.injury ? 'You rest, and clean the wound, and rest again. It\'s not worse. It\'s not better. Wounds keep their own calendar out here — all you can do is keep appearing for the appointments.' : pick([
            'You let the island run itself for a few hours. It manages. When you get up, so do you.',
            'You sleep in the shade with one arm over your eyes and dream, for once, of nothing at all — no sea, no sky, no falling. Just green. You wake restored in a way sleep alone doesn\'t explain.',
            'You spend the hours on small maintenance — hands, feet, tools, thoughts — the quiet servicing that keeps a castaway from becoming driftwood. Nothing to show for it but tomorrow.',
            'You rest, and the island fills the time with its unbilled entertainment: cloud armadas, crab politics, the tide doing its two-a-day miracle. You\'d pay for worse. You have paid for worse.',
          ])] };
          TB.tickSegment(); },
        go: 'act_result',
      });
      if (TB.ch3Actions) c.push(...TB.ch3Actions(s)); // later chapters extend the hub
      return TB.hubOrganize ? TB.hubOrganize(c, s) : c;
    },
  });

  // ---- Night, chapter 2 ------------------------------------------------------
  TB.scene('night2', {
    bg: (s) => (s.site === 'fringe' ? 'jungle-night' : 'beach-night'),
    text: (s) => {
      const t = ['<em>Night, Day ' + s.day + '.</em> ' + (s.site === 'fringe' ? 'The jungle turns its sound up and its lights on — fireflies stitching the dark between the trunks.' : s.site === 'overhang' ? 'From the ledge, the whole lagoon glows its slow seven-beat pulse below you, a heartbeat you live on top of.' : 'The lagoon takes up its seven-beat glow, faithful as tide.')];
      if (s.companion) {
        // night idle life: trust as behavior after dark, dealt from tier pools
        const NIGHT_LINE = {
          kavi: [
            ['Kavi settles at the camp\'s edge, facing out.', 'Kavi sleeps beyond the firelight, a grey suggestion in the dark that is gone if you look straight at it, there again when you don\'t.'],
            ['Kavi has moved his night post inside the firelight\'s rim — barely inside, exactly inside, a treaty measured in inches.', 'Twice in the night you hear Kavi stand, listen, and lie back down. The dark is being managed.'],
            ['Kavi lies against your back, one ear working all night like a lighthouse.', 'You wake once and Kavi\'s head is up, silhouetted, reading the treeline. He glances at you — <em>go back to sleep</em> — and you do.'],
            ['Kavi runs somewhere in his sleep tonight, paws working, a whine like a far-off gull — and when you rest a hand on his ribs, the running stops.', 'The ridge pack sings late and Kavi answers without getting up, one note from beside your knee. Present. Elsewhere spoken for.'],
            ['Kavi sleeps in full surrender tonight, belly to the stars — the posture of an animal whose watch is shared.', 'You dream something bad and surface from it to a weight settling against your chest: Kavi, arrived before the dream even ended, seeing it off.'],
          ],
          ipo: [
            ['Ipo roosts somewhere in the dark canopy, position undisclosed. A fig stone drops on your tarp at intervals. Surveillance, or comment.', 'Ipo watches your fire from the treeline, two small coals in the dark that blink out whenever you look up.'],
            ['Ipo nests in the thatch above you, muttering small commerce in his sleep.', 'Something small rearranges your kit in the night. In the morning nothing is missing and one shell is better sorted. Ipo\'s night audit passes you.'],
            ['Ipo has bedded down in the crook of the shelter frame, one long arm hanging into your airspace like a possessive flag.', 'You wake to Ipo sleep-grooming the edge of your blanket, fingers working, entirely unconscious. Housekeeping goes deep in him.'],
            ['A night bird lands too close and Ipo is awake and shrieking territorial curses before you\'ve even opened your eyes. Then, honor satisfied: instantly asleep again.', 'Ipo has dragged his bedding — leaves, one prized rag — to the edge of yours. Not on. At the edge. The negotiation continues in his sleep.'],
            ['Ipo sleeps in the crook of your arm, fist knotted in your collar, and the night noises that used to wake you don\'t anymore. He\'d hear them first, and you both know it.', 'In the smallest hours Ipo whimpers — some monkey grief, some old fall — and when you cup a hand over his back he quiets mid-note, like a lid gently set on a pot.'],
          ],
          vela: [
            ['Vela is a shape on the high snag, head under wing — no night watch from her; the night is yours to hold.', 'Far up the beach, Vela\'s snag stands empty tonight. Wherever empresses go after dark, they don\'t file the itinerary.'],
            ['Vela has taken the nearer perch tonight — the dead palm at camp\'s edge — for no reason she\'d admit to.', 'At moonrise you see Vela shake out her feathers and resettle, one round eye catching the firelight, unreadable as a coin.'],
            ['Vela roosts on the ridgepole itself now on rough nights, a carved figure on the ship of your camp.', 'Twice tonight, between wind gusts, you hear it: the small chesty rattle Vela makes when all is well. A lighthouse in her own language.'],
            ['You bank the fire and Vela is already asleep above it, close enough that the updraft warms her keel. Royalty knows where the heating is.', 'Something crossed the beach at midnight; you know because Vela\'s wings opened once — a sound like a sail filling — and closed. Whatever it was reconsidered.'],
            ['Vela mantles over your camp in storms like it were a nest.', 'You wake before dawn and Vela is watching you from the ridgepole with her good eye, patient as tide. Not hungry. Not asking. Keeping.'],
          ],
          buri: [
            ['Buri sleeps elsewhere, but the flattened grass at camp\'s edge says he considered here first.', 'From somewhere in the fringe, at intervals: the seismic sigh of Buri settling somewhere close. The night has furniture.'],
            ['Buri\'s snore rolls through camp like weather. It is, against all reason, a comfort.', 'Buri has bedded down against the woodpile again, and the woodpile, again, has migrated an inch by morning.'],
            ['Buri sleeps parallel to your shelter wall now, a windbreak with a heartbeat.', 'A branch cracked inland at midnight and Buri was on his feet before the echo — head low, ears wide — until the dark apologized. Then: instantly, thunderously, back asleep.'],
            ['On cold nights Buri arranges himself so exactly one warm flank is available for leaning. It is used. This is not discussed.', 'You wake once to find Buri\'s snout resting on the shelter threshold, breathing your camp\'s air like a guard smelling the till.'],
            ['Buri would follow you into the sea, and has tried.', 'The whole camp breathes with Buri\'s sleeping bulk these nights — slow, enormous, tidal. Your house has a heartbeat, and it is his.'],
          ],
          moa: [
            ['Moa roosts far up the beach, one bird-shaped shadow among the driftwood, officially unaffiliated.', 'From the dark, at intervals, one soft interrogative cluck: Moa, taking the night\'s roll. You appear to be on it.'],
            ['Moa roosts on the driftwood, feathers doubled against the dark.', 'Moa has moved her roost one log closer to the fire. No announcement accompanied the redeployment.'],
            ['Moa sleeps on the driftwood by your knee, facing the dark.', 'Something rustled at the fringe and Moa answered from her roost — one flat warning note, sentry to trespasser — without opening more than one eye.'],
            ['Moa patrols once at moonrise — a full perimeter walk, muttering — then remounts her post and sleeps at attention.', 'You shifted in the night and a small copper weight resettled immediately against your calf. Moa\'s post moves with the flock.'],
            ['Moa has decided the night watch is hers alone, and stands it from your blanket\'s edge, small and unyielding, facing out.', 'You wake before dawn with Moa asleep on your chest, facing the door. At some point the perimeter contracted to exactly you.'],
          ],
          nine: [
            ['Nine is down in her black water, doing whatever she does with her hours. Twice, from the shore, a soft slap of arm on rock: checking.', 'The tide pools catch the starlight strangely tonight — rearranged again, you\'d swear, since dusk. The night shift is working.'],
            ['At full dark a soft weight of water moves in the nearest pool — Nine, surfacing to look at your fire the way you look at the stars.', 'A shell arrived on the tideline stone during the evening. It wasn\'t there at dusk. Nine\'s night post delivers.'],
            ['You walk the tideline before sleep and the water walks with you — a smooth bow-wave twenty feet out, keeping your pace exactly.', 'Nine has learned when you bank the fire. The little slap-slap of arm on rock comes right after, every night now: <em>logged; goodnight.</em>'],
            ['Tonight the lagoon\'s seven-beat glow lit her for a moment — Nine, hanging in the bright pulse, arms open to it like a dancer in stage light, sure nobody watched. Somebody did.', 'You left a puzzle for Nine this time — a knotted cord on the tide stone. By moonrise: untied, re-tied better, returned. Extra credit, the arrangement implies.'],
            ['Nine watches you the way you watch the horizon: like it matters — and these nights she does it from the shallowest pool, the one nearest your fire, rent be damned.', 'You wake at the smallest hour, certain you heard your name — not spoken; tapped, on stone, in the little slap-code you and Nine never formally invented. You tap the driftwood twice. The water settles.'],
          ],
        };
        let pool = NIGHT_LINE[s.companion][TB.tier()];
        if (s.companion === 'moa' && TB.is('NEST_BOX')) pool = pool.concat(['Moa is battened into her storm-box, one bright eye at the door until sleep takes it.']);
        t.push(pick(pool));
      }
      // the held breath: the island telegraphs its two great blows a night early
      if (s.day === 10 && s.chapter === 2) t.push('Then, mid-pulse, the lagoon does something you have never seen it do: it <em>holds</em> — one long unlit beat where the glow should rise, the whole bay dark and waiting, before the rhythm resumes as if nothing happened. The island, holding its breath.' + (s.shelter >= 2 ? ' You check your lashings twice anyway, and sleep with one hand on the ridgepole.' : ' You lie awake a while counting what this camp could lose to real weather, and the honest count is: most of it.'));
      if (s.day === 57 && s.chapter === 5) t.push(TB.is('M_WEATHERWISE')
        ? 'And there it is — the thing M. taught you across four thousand miles of hidden sea: the Hum <em>holds its breath</em>. Not a skip. A HOLD, longer than any storm yet has bought, the rain itself seeming to lean. You count it the way she taught you, and the count says <em>hours</em>. Move what matters. Go deep. Tomorrow the monsoon stops being weather and becomes an event.'
        : 'And under the rain\'s roar, something stranger: the Hum — the constant you\'ve long stopped hearing — goes <em>silent</em>, one long held breath that makes the whole night feel like a lung at the top of its arc. Every animal on the island is already under cover. Whatever they know, know it too: tomorrow, be somewhere deep.');
      if (s.site === 'fringe') t.push('Dusk was billed to you in mosquitos; you pay along your arms and the back of your neck. Something to solve, before it solves you.');
      if (TB.has('rations') && s.stats.hunger < 55) t.push('You allow yourself a tin. <em>' + (s.inv.rations - 1) + ' left.</em>');
      return t;
    },
    nextLabel: 'Sleep ➤',
    next: (s) => {
      if (s.stats.hope <= 8 && !TB.is('DESPAIR_OFFERED') && TB.SCENES.ev_despair) { TB.flag('DESPAIR_OFFERED'); return 'ev_despair'; }
      if (TB.has('rations') && s.stats.hunger < 55) { TB.item('rations', -1); TB.stat('hunger', 25); }
      const floor = 45 + s.shelter * 11 + s.fire * 8;
      if (s.stats.energy < floor) s.stats.energy = floor;
      TB.stat('hope', s.shelter || s.fire ? 1 : -3);
      if (s.chapter === 5 && s.fire && s.shelter < 2 && s.site !== 'overhang') { s.fire = 0; TB.flag('MONSOON_FIRE_LOST'); }
      if (s.site === 'fringe' && R() < 0.25) TB.flag('FEVER_SEED');
      s.gift = null;
      if (s.companion === 'moa') { TB.stat('hunger', 8); s.gift = '🥚 Moa\'s morning egg waits by the fire ring, warm and entirely matter-of-fact. The steadiest wealth on the island.'; }
      if (s.companion === 'vela' && s.trust >= 40) { TB.stat('hunger', 6); s.gift = '🐟 A fish lies on the high stone — headless; she takes her broker\'s fee — delivered before you woke. The account stays open.'; }
      TB.tickSegment();
      return TB.advance();
    },
  });

  // ---- Chapter 2 scheduled events ---------------------------------------------
  TB.SCHEDULE.push(
    { d: 7, s: 0, id: 'ev2_boarking' },
    { d: 9, s: 2, id: 'ev2_bond', when: (s) => !!s.companion },
    { d: 9, s: 2, id: 'ev2_solo', when: (s) => !s.companion },
    { d: 11, s: 2, id: 'ev2_storm' },
    { d: 13, s: 1, id: 'ev2_smoke' },
    { d: 15, s: 0, id: 'ev2_heart', when: (s) => !!s.companion && s.trust >= 50 },
    { d: 15, s: 0, id: 'ev2_heart_low', when: (s) => !!s.companion && s.trust < 50 },
    { d: 15, s: 0, id: 'ev2_coco', when: (s) => !s.companion },
    { d: 16, s: 3, id: 'ev2_kingtide', when: (s) => s.site === 'beach' },
    { d: 18, s: 2, id: 'ch2_threshold' },
  );

  // ---- The Boar King ------------------------------------------------------------
  TB.scene('ev2_boarking', {
    art: 'ev-boarking',
    bg: campBg2,
    who: (s) => (s.companion === 'kavi' || s.companion === 'buri' ? BOAR_KING : null),
    enter: (s) => {
      if (TB.is('BOARKING_APPLIED')) return;
      TB.flag('BOARKING_APPLIED');
      if (s.companion === 'kavi' || s.companion === 'buri') TB.flag('KING_SEEN');
      if (s.stats.hunger > 30) TB.stat('hunger', -8);
    },
    text: (s) => {
      const guarded = s.companion === 'kavi' || s.companion === 'buri';
      const t = ['You wake on day seven to a camp that has been <em>edited</em>.'];
      if (guarded) {
        t.push(s.companion === 'kavi'
          ? 'You saw him, in the night — because Kavi saw him first. The growl woke you like a hand on the shoulder: low, continuous, deadly serious. And there at the treeline, filling it, stood the biggest boar you have ever seen or heard credibly described — grey-black, plated in scar, one tusk broken to a fighting stump, watching your camp with small, furious, <em>calculating</em> eyes.'
          : 'You saw him, in the night — because Buri woke screaming pig-outrage and planted himself in the gap of your half-built defenses like a wedge. And out of the dark walked the reason: a boar the size of a cart, grey-black and scar-plated, one tusk broken, with eyes that did arithmetic on your camp and on Buri and, unhurried, on you.');
        t.push('It did not charge. That was somehow worse. It took two steps in, took the measure of the resistance, ate your entire drying rack — deliberately, watching you the whole time — and withdrew like a landlord who\'ll be back for the rest.');
      } else {
        t.push('The drying rack is kindling. The forage cache is a crater with your gathering bag at the bottom of it, licked flat. Whatever visited in the night was enormous — the prints are the size of your two fists together, deep as a post-hole — and contemptuous: your palisade stakes weren\'t breached, they were <em>walked through</em>.');
        t.push('At the treeline, on a torn sapling, a single coarse grey-black bristle, thick as fishing line. Something owns the inland dark, and it has just informed you of the rent.');
      }
      return t;
    },
    choices: [
      { t: 'Track it. Know your enemy before it knows you\'re worth knowing.', sub: 'Dangerous knowledge — the useful kind.',
        do: (s) => { TB.flag('KING_TRACKED'); TB.route('depth', 1); if (s.companion === 'kavi') { TB.bond(3); } }, go: 'ev2_boarking2' },
      { t: 'Rebuild stronger. Let the jungle keep its monsters if it keeps them out there.', sub: 'Roots, defenses, and the long game.',
        do: (s) => { TB.route('roots', 2); TB.stat('energy', -6); TB.flag('KING_WALLED'); }, go: 'ev2_boarking3' },
      { t: 'Leave an offering at the treeline. Some tolls are cheaper paid.', sub: 'Feed the mountain and it may not come to dine.',
        do: (s) => { TB.stat('hunger', -6); TB.flag('KING_TITHED'); TB.route('depth', 1); TB.stat('hope', 2); }, go: 'ev2_boarking4' },
      { t: '⚔️ Hunt it down today. End this before it begins.', sub: '⚠️ You know nothing about it yet, and it has plainly survived everything this island ever sent. Strong, rested, and backed, you might live to learn better. Otherwise this is how castaways become notches.',
        do: (s) => {
          const s2 = TB.state;
          const backed = s2.companion === 'kavi' || s2.companion === 'buri';
          if (backed && s2.stats.health >= 60 && s2.stats.energy >= 45) { TB.flag('KING_FACED'); s2.injury = 'laceration'; TB.stat('health', -30); TB.stat('energy', -20); TB.stat('hope', -4); TB.route('depth', 1); }
          else { s2.deathCause = 'boarking'; }
        }, go: (s) => (TB.state.deathCause ? 'death' : 'ev2_boarkface') },
    ],
  });

  TB.scene('ev2_boarkface', {
    art: 'ev-boarking',
    bg: 'jungle', who: BOAR_KING,
    text: (s) => [
      'You find him because he lets you. That much is clear within the first hundred meters of the trail: the prints get fresher too fast, the rooting-sign too neat, and then the jungle opens into a wallow-clearing and he is simply THERE, facing you, having chosen the ground, the light, and the moment you\'d arrive.',
      s.companion === 'kavi' ? 'What follows is not a fight. It is an audit with tusks. Kavi\'s speed is the only reason it isn\'t an execution — twice the grey shape cuts the charge\'s angle, screaming pack-fury, buying you the half-seconds your spear-arm needs to matter at all—' : 'What follows is not a fight. It is an audit with tusks, and Buri is the only reason it isn\'t an execution — planting his young bulk in the charge-lane, taking a hit meant for you with a CRACK you feel in your own ribs, giving you the half-seconds your spear-arm needs to matter at all—',
      'And then, having opened your leg to the bone-ache and flattened your spear-side into the mud — having established, beyond appeal, exactly what he could do — the Boar King stops. Steps back. Looks at the two of you, bleeding and defiant and DONE, with those small calculating eyes, and delivers his verdict: one long breath out through the scarred snout, contempt and something else. Something almost like marking a ledger: <em>paid enough.</em>',
      'He walks away unhurried. He does not look back. You have learned the only thing the trail was ever going to teach: the inland dark has a landlord, the rent is real, and today — at a price you\'ll be repaying for a week — he chose to make you a tenant instead of a notch.',
    ],
    next: (s) => { TB.tickSegment(); return TB.advance(); },
  });
  TB.scene('ev2_boarking2', { bg: 'jungle', art: 'ev-boarking', who: (s) => (TB.is('KING_SEEN') ? BOAR_KING : null),
    text: (s) => [
      (s.companion === 'kavi' ? 'Kavi takes the trail like it\'s a manuscript, and reads you the terrible parts. ' : 'You follow the post-hole prints inland, slowly, loudly enough to be honest about it. ') + 'The trail is a road — <em>his</em> road, worn deep by years, running from a wallow the size of a pond up toward the grass highlands. Along it: trees stripped of bark at shoulder height, old snare-wire grown into scar tissue on a tusk-scraped trunk, and once — you stop and look for a long time — the rusted spring-arm of a man-made trap, snapped clean.',
      'He is old. He has been hunted before, by people with better equipment than yours, and he has outlived every one of them. Whatever this is going to be between you, it will not be simple, and it will not be quick.',
    ], next: (s) => 'camp2' });
  TB.scene('ev2_boarking3', { bg: campBg2, text: ['You spend the morning turning damage into design: stakes reset and angled out, the cache raised beyond even a rearing giant\'s reach, brush cleared so nothing crosses open ground unseen. It costs sweat you\'d budgeted elsewhere. It buys you the first camp you\'d bet on.', 'The jungle watches you work. Fine. Let the message travel: this ground is spoken for.'], next: (s) => 'camp2' });
  TB.scene('ev2_boarking4', { bg: campBg2, text: ['You leave a mound of tubers and windfall figs at the treeline, where the post-hole prints turn back into the dark. It feels absurd, tithing to a pig. It also feels — you can\'t shake this — <em>correct</em>, the way paying respect on a border always is.', 'In the morning the mound is gone, taken neatly, without one further stake disturbed. A receipt, of sorts. Negotiations are open.'], next: (s) => 'camp2' });

  // ---- Day-5 dusk vignettes -------------------------------------------------------
  TB.scene('ev2_bond', {
    bg: campBg2, who: (s) => WHO[s.companion],
    text: (s) => {
      const v = {
        kavi: ['At dusk Kavi does something new: he brings you a stick. Not to throw — he\'s no one\'s puppy — he lays it on your woodpile. Then another. He has watched you gather wood for a week and more, worked out that it matters, and decided to be implicated.', 'You say thank you like it\'s normal. He looks away like it\'s nothing. The woodpile grows all week.'],
        ipo: ['At dusk you catch Ipo teaching himself to strike the lighter — flick, fail, flick, fail — with a scholar\'s frown. When he finally raises a flame he doesn\'t crow. He looks straight at you, checks you saw, and puts it out responsibly.', 'It occurs to you that you are being <em>studied for later usefulness</em>, and that from him, this is devotion.'],
        vela: ['At dusk Vela drops from the snag and walks — that grave, unwieldy walk — a full circle around your camp, inspecting it: fire, stores, shelter, you. An audit.', 'At the end she stands a moment on the high stone, both eyes on you, and issues one short note you haven\'t heard before. Then she\'s gone up the dark. You have the unaccountable feeling you just passed something.'],
        buri: ['At dusk Buri presents you with a problem: he has carried the entire root-ball of a fallen sapling into camp, beaming, and it is in the fire pit. The negotiation to remove it takes twenty minutes and two figs.', 'Later you realize what it was: you hauled wood yesterday, so today <em>he</em> hauled wood. The size of the heart in that barrel is going to be a problem, and you already know whose.'],
        moa: ['At dusk a hawk crosses high over camp, and Moa — two pounds of prey animal — does not run. She flattens, tracks it across the whole sky, and places herself, you realize slowly, between the raptor\'s line and <em>you</em>.', 'It\'s absurd. It\'s the bravest thing you\'ve seen since the crash. When the sky is clear she shakes out her feathers and resumes patrol as if nothing happened, and you resolve never to tell her otherwise.'],
        nine: ['At dusk you find your fishing spear — lost that morning to a wave you misjudged — laid on the rocks above the tideline, blade seaward, exactly as you\'d have placed it yourself.', 'Nine is nowhere visible. Nine is unquestionably responsible. You stand a while with your recovered property, absorbing the fact that something with three hearts and no bones has begun <em>looking after your equipment</em>.'],
      };
      return v[s.companion] || ['The dusk passes quietly.'];
    },
    enter: (s) => { if (!TB.is('BOND1_DONE')) { TB.flag('BOND1_DONE'); TB.bond(4); TB.stat('hope', 3); } },
    next: (s) => 'camp2',
  });
  TB.scene('ev2_solo', {
    bg: campBg2,
    text: [
      'At dusk the wild dogs sing inland, and the macaque troop answers from the canopy, and the junglefowl mutter their roll-call at the fringe — the whole island talking around you, through you, past you.',
      'You chose this. You re-choose it now, deliberately, the way you check a knot: alone travels lighter, risks less, grieves nothing. The knot holds.',
      'It holds. You bank the fire and tell the dark, out loud, just to hear a voice: "Just us, then." The dark, companionably, does not answer.',
    ],
    enter: (s) => { if (!TB.is('SOLO1_DONE')) { TB.flag('SOLO1_DONE'); TB.stat('hope', 2); TB.route('roots', 1); } },
    next: (s) => 'camp2',
  });

  // ---- The first storm -------------------------------------------------------------
  TB.scene('ev2_storm', {
    bg: 'beach-dusk',
    text: (s) => [
      (TB.is('FORECAST') ? 'Vela called it, and here it comes on schedule: ' : 'It comes up the sea with almost no warning: ') + 'a bruise-green wall off the southern horizon, dragging rain like a dropped curtain, and under it the water going the color of slate and bad news.',
      'This is no squall. This is the island\'s first real argument with you: a night of it, at least. You have one part of one hour, and everything you own is about to be weather.',
      'You can\'t save it all. What do you protect <em>first</em>?',
    ],
    choices: (s) => [
      { t: '📦 The stores — food, tools, tinder, everything dry.', sub: 'Property survives; comfort takes its chances.',
        do: () => { TB.flag('STORM_STORES'); }, go: 'ev2_storm2' },
      { t: '🔥 The fire — bank it deep, wall it, keep the ember alive.', sub: 'Losing fire in what\'s coming could cost days.',
        do: () => { TB.flag('STORM_FIRE'); }, go: 'ev2_storm2' },
      s.companion ? { t: '❤️ ' + NAMES[s.companion] + ' — get them under cover before anything.', sub: 'Things can be rebuilt.',
        do: () => { TB.flag('STORM_COMPANION'); TB.bond(6); }, go: 'ev2_storm2' } : null,
    ].filter(Boolean),
  });
  TB.scene('ev2_storm2', {
    bg: (s) => (s.site === 'fringe' ? 'jungle-night' : 'beach-night'),
    enter: (s) => {
      if (TB.is('STORM_APPLIED')) return;
      TB.flag('STORM_APPLIED');
      // site outcomes
      if (s.site === 'overhang') { TB.stat('hope', 5); }
      else if (s.shelter >= 2) { TB.stat('hope', 2); TB.stat('energy', -4); }
      else { TB.stat('energy', -12); TB.stat('hope', -5); TB.stat('health', -5); }
      if (!TB.is('STORM_FIRE') && s.site !== 'overhang' && s.fire) { s.fire = 0; TB.flag('FIRE_DROWNED2'); }
      if (!TB.is('STORM_STORES')) { if (s.food > 0) s.food -= 1; if (TB.has('rations')) TB.item('rations', -1); }
      // companion fear outcomes
      if (s.companion === 'moa' && !TB.is('NEST_BOX') && !TB.is('STORM_COMPANION')) { TB.flag('MOA_BOLTED'); TB.bond(-4); }
      if (s.companion === 'vela') TB.flag('VELA_GONE');
      if (s.companion === 'kavi' && TB.is('STORM_FIRE')) TB.flag('KAVI_FIRE_TEST');
    },
    text: (s) => {
      const t = [];
      t.push(s.site === 'overhang'
        ? 'The storm arrives like a landslide made of water — and breaks on fifty feet of stone above your head. You sit in the dry dark of the overhang with the fire muttering, watching the world end politely at your doorstep, feeling like the first person in history to be owed something by geology.'
        : s.shelter >= 2
          ? 'The storm lands on your camp like a thrown sea. The shelter — braced, double-thatched, trench-drained — bends, drums, leaks in two places, and <em>holds</em>. You spend the night with your back against the good main post, keeping company with your own competence.'
          : 'The storm dismantles your camp with the indifference of an auditor. The lean-to lasts an hour; the rest of the night is warm rain, cold wind, and endurance arithmetic, crouched in the ruins holding what you can.');
      if (TB.is('FIRE_DROWNED2')) t.push('Somewhere in the middle of it, the fire dies. You feel it go — a change in the dark behind you — and file the cost under morning.');
      if (!TB.is('STORM_STORES')) t.push('Dawn\'s inventory: the storm fed itself from your stores. Some of what you\'d put by is simply <em>elsewhere</em> now, distributed across a mile of soaked beach.');
      if (s.companion === 'moa') t.push(TB.is('NEST_BOX')
        ? 'And Moa — Moa spends the whole screaming night in her storm-box, feathers doubled, terrified and <em>staying</em>. At the worst of it you put your hand flat on the box roof, and through the wood you feel her stop shaking. Small bird. Enormous ledger entry.'
        : TB.is('STORM_COMPANION')
          ? 'Moa spends the night inside your shirt, a trembling coal of feathers against your sternum, because you went and got her before you saved one single possession. She knows. Birds keep books too.'
          : 'And Moa is <em>gone</em> — bolted at the first thunder, into everything a storm-blind night can hold. You call until the wind takes your voice. Morning\'s first job has already assigned itself.');
      if (s.companion === 'vela') t.push('Vela vanished before the front arrived — to some hidden roost, storm-wise and gone — and her absence is a shape all night: no watching weight on the snag, no rattle of advice. The sky\'s partner, missing exactly when the sky goes to war.');
      if (s.companion === 'kavi') t.push(TB.is('KAVI_FIRE_TEST')
        ? 'And Kavi meets his oldest enemy: you kept the fire alive, so all night the wind throws its light around like a threat, and all night he shakes at the far edge of the shelter, ears flat, eyes white-rimmed — and does not run. Stays, at the exact distance his fear allows, watching over you from inside it.'
        : 'Kavi presses against you the whole night through, storm-steady — thunder holds no history for him. It\'s only the fire he fears, and tonight there is none to fear.');
      if (s.companion === 'buri') t.push('Buri sleeps through what he can and leans his whole warm mass against you through what he can\'t. As shelter goes, two hundred pounds of loyal pig turns out to rank surprisingly high.');
      if (s.companion === 'ipo') t.push('Ipo rides the night out under your arm, soaked and silent and gripping — no showman now, just a small cold body that chose your heartbeat over the trees. By morning he\'s himself again and denies everything.');
      if (s.companion === 'nine') t.push('Somewhere below, Nine is having a wonderful time. Storms mean the sea rearranges its shelves. You genuinely cannot say the same for the land.');
      return t;
    },
    nextLabel: 'Endure until morning ➤',
    next: (s) => { TB.tickSegment(); if (TB.is('MOA_BOLTED')) return 'ev2_moasearch'; return TB.advance(); },
  });
  TB.scene('ev2_moasearch', {
    bg: 'jungle-night', who: WHO.moa,
    text: [
      'You go out into the tail of the storm with a torch that won\'t stay lit and a name that isn\'t really a name, calling into the streaming dark.',
      'You find her an hour before dawn, half a mile inland, wedged into a root-hollow — soaked to a third her size, blinking, alive. When you reach in she pecks you once, hard, on principle, and then climbs into your hands and presses her head against your thumb and stays that way the whole walk home.',
      'Neither of you sleeps. At sunrise she stands on your knee facing the wrecked, dripping, gold-lit world, and produces — defiantly, right there — an egg.',
    ],
    enter: (s) => { if (!TB.is('MOA_FOUND')) { TB.flag('MOA_FOUND'); TB.bond(8); TB.stat('energy', -8); TB.stat('hope', 5); TB.stat('hunger', 8); } },
    nextLabel: 'Face the morning ➤',
    next: (s) => { // the search consumed the night; skip straight to dawn, barely rested
      if (s.stats.energy < 38) s.stats.energy = 38;
      TB.tickSegment();
      return TB.advance();
    },
  });

  // ---- The smoke -------------------------------------------------------------------
  TB.scene('ev2_smoke', {
    bg: 'jungle',
    text: (s) => [
      'Day thirteen, mid-morning, you\'re working with your eyes down when the back of your neck reports before your mind does: <em>something in the sky has changed.</em>',
      'Inland, above the deep green — up where the land climbs toward the broken mountain — a thread of smoke stands in the washed post-storm air. Thin. Grey. Vertical. <em>Banked</em>.',
      s.companion === 'vela' ? 'Vela follows your stare and does not react at all — and that lands late but hard: she isn\'t surprised. She has known that fire her whole life. It\'s part of her map, filed with the cliffs and the thermals: furniture.' : 'A wildfire sprawls and browns. A signal fire billows and dies. This does neither. This is a <em>kept</em> fire, a hearth fire, tended by hands that have tended it so long it burns with table manners.',
      'You are not alone on this island. You never were.',
    ],
    choices: [
      { t: 'Take a bearing. Mark it against the mountain. Say nothing to the horizon.', sub: 'Knowledge first. Decisions later.',
        do: (s) => { TB.flag('SMOKE_SEEN'); TB.route('depth', 1); }, go: 'camp2' },
      { t: 'Build your own fire high and smoky. Answer.', sub: 'Whoever they are, let them know the island gained a resident.',
        do: (s) => { TB.flag('SMOKE_SEEN'); TB.flag('SMOKE_ANSWERED'); TB.route('signal', 1); TB.stat('energy', -4); }, go: 'ev2_smoke2' },
      { t: 'Feel the cold thing under the wonder: strangers are a risk.', sub: 'You\'ve built too much to gamble it on company.',
        do: (s) => { TB.flag('SMOKE_SEEN'); TB.flag('SMOKE_WARY'); TB.route('roots', 1); }, go: 'camp2' },
    ],
  });
  TB.scene('ev2_smoke2', { bg: campBg2, text: ['You feed your fire green fronds until it climbs the sky in fat grey coils that can be read for miles: <em>here. Alive. Talking.</em>', 'You watch the inland thread for an answer until the light goes. It burns on exactly as before — steady, banked, indifferent — like a person who has heard the question perfectly well and gone back to their book.', 'Somehow that non-answer tells you more than smoke ever could: whoever is up there has seen castaways\' fires before. And has opinions about them.'], next: (s) => 'camp2' });

  // ---- Day 8: hearts, doubts, and coconuts ---------------------------------------------
  TB.scene('ev2_heart', {
    art: (s) => (s.companion ? 'ev-heart-' + s.companion : null),
    bg: campBg2, who: (s) => WHO[s.companion],
    text: (s) => {
      const v = {
        kavi: ['It happens on the fifteenth morning, without announcement: Kavi crosses the camp, lies down against your leg, and rolls — deliberately, watching your face — to bare the burned flank. The scar tissue is slick and hairless, older than your acquaintance, shaped like a long paw of flame.', 'You rest your hand on it, light as you know how. He exhales — a long, unbuilding breath, years going out of it — and sleeps, there, under the hand on his worst place.', 'Whatever cast him out and whatever burned him, he has decided you are not it.'],
        ipo: ['On the fifteenth morning Ipo sits on your shoulder, takes your ear in one hand for security, and begins — with terrible tenderness and total concentration — to groom your hair. Parting, inspecting, smoothing. Finding you acceptable, strand by strand.', 'Grooming, you dimly know, is not payment among his kind. It is <em>membership</em>. Somewhere between the crash and this morning, you were adopted, and the paperwork is being finished on your scalp.', 'You sit very still, absurdly moved, while the smallest showman on the island tells you the one thing he\'ll never perform: <em>mine</em>.'],
        vela: ['On the fifteenth morning Vela does not leave the fish on the high stone. She stands over it and waits, watching you, until you understand and come — and then she steps back exactly one pace and lets you take it <em>from under her</em>.', 'Then, business concluded, she does the impossible thing: sidles, feather-light for something so heavy, and presses her wind-cold head once against your jaw. One second. Two.', 'Then she\'s gone to the snag, glaring at the sea as if daring it to have witnessed. The books, you understand, no longer balance. She has begun to extend you <em>credit</em>.'],
        buri: ['On the fifteenth morning Buri is missing at breakfast — until you follow the sound of industrious ruin and find him at the treeline, digging like a machine, and beside the crater a mound of truffles the size of your two hands.', 'He has been at it since first light. When you arrive he steps back from the mound and looks up at you, filthy, beaming, and it is unmistakably a <em>presentation</em>: for the crab you shared, for the rack he cost you, for every meal since. Restitution, pig-style, with interest.', 'You eat one raw right there, and his tail helicopter is the happiest thing on the island.'],
        moa: ['On the fifteenth morning you sit down by the fire and Moa, without ceremony, steps into your lap, turns twice, and folds herself down like a small copper cat. And sleeps. In daylight. In the open.', 'You know what daylight sleep costs a prey animal — she has spent every hour of her life on watch, and she is spending this one <em>off duty, on you</em>, because somewhere in her fast small heart it has been settled that you watch well enough for two.', 'You sit unmoving until your legs die of pins, and consider it the best lease you\'ve ever signed.'],
        nine: ['On the fifteenth morning Nine plays the game back at you. You reach into the pool to give her the crab, and the crab is refused — set aside, one arm firm on your wrist, and then she pours herself up out of the water and touches, one by one, your knuckles, your palm, the pale scar the reef gave you. Reading the week off your skin.', 'And then, unmistakably, she copies your fire-tending gesture — the little two-fingered coax you do at the coals — with a curl of kelp against a stone. Watches you see it. Does it again.', '<em>I know you</em>, says the whole alien length of her, in the only grammar there is. <em>I have been studying, and I know you.</em>'],
      };
      return v[s.companion];
    },
    enter: (s) => { if (!TB.is('HEART1_DONE')) { TB.flag('HEART1_DONE'); TB.bond(10); TB.stat('hope', 8); } },
    next: (s) => 'camp2',
  });
  TB.scene('ev2_heart_low', {
    bg: campBg2, who: (s) => WHO[s.companion],
    text: (s) => [
      'On the fifteenth morning you catch ' + NAMES[s.companion] + ' watching you from the old first distance — the day-three distance — and you feel the gap you haven\'t closed.',
      'Trust, out here, is the most expensive thing you can build, and you\'ve been spending your hours on walls and stores and smoke instead. Fair choices. Survivable choices. But the wild keeps honest books: you get exactly the bond you feed.',
      'There is still time. There is not unlimited time.',
    ],
    enter: (s) => { if (!TB.is('HEART1_LOW')) { TB.flag('HEART1_LOW'); TB.bond(3); } },
    next: (s) => 'camp2',
  });
  TB.scene('ev2_coco', {
    bg: campBg2,
    text: (s) => [
      'On the fifteenth morning you find yourself explaining your fortification plan — out loud, with gestures — to the coconut with the face.',
      TB.is('COCO') ? 'Coco (the name happened at some point; you don\'t recall consenting) regards you with his three-pored expression of measured confidence. You move him to the flat stone with the good view of the works. He has earned it. He is, you would testify, a remarkable listener.' : 'It has three dark pores arranged like a face, and the face — you would swear this before a court — looks <em>interested</em>. You set it upright on the flat stone. "Don\'t just sit there," you tell it, and get back to work, oddly heartened.',
      'This is either perfectly healthy or the opposite, and you have decided, executively, not to look into it.',
    ],
    enter: (s) => { if (!TB.is('COCO_TALKED')) { TB.flag('COCO_TALKED'); TB.flag('COCO'); TB.stat('hope', 4); } },
    next: (s) => 'camp2',
  });

  // ---- King tide (beach camps only) --------------------------------------------------
  TB.scene('ev2_kingtide', {
    bg: 'beach-night',
    text: (s) => {
      const safe = s.shelter >= 3;
      return [
        'You wake mid-dark to a wrong sound: water where water has never reached. The moon is huge and low, and under it the sea has quietly claimed twenty extra feet of the world — a king tide, sliding silver fingers up the beach and <em>into your camp</em>.',
        safe ? 'And it finds your stores exactly where you put them: up, lashed, on the raised platform your fortifying built. The tide noses around the posts like a thief reading a locked door, and withdraws with nothing. You go back to sleep listening to your own foresight hold.' : 'You spend a soaked, moonlit hour hauling your life uphill by armfuls while the sea works through what you don\'t save. It is patient, thorough, and completely without malice, which somehow makes it worse.',
      ];
    },
    enter: (s) => {
      if (TB.is('KINGTIDE_APPLIED')) return;
      TB.flag('KINGTIDE_APPLIED');
      if (s.shelter < 3) { if (s.food > 0) s.food -= 1; TB.stat('energy', -8); TB.stat('hope', -3); if (TB.has('rations')) TB.item('rations', -1); }
      else { TB.stat('hope', 3); }
    },
    next: 'night2',
  });

  // ---- THE SMOKE (chapter threshold) --------------------------------------------------
  TB.scene('ch2_threshold', {
    bg: 'beach-dusk',
    text: (s) => [
      '<em>THE SMOKE</em>',
      'Dusk, day eighteen. Two weeks of foothold behind you: ' + (s.shelter >= 3 ? 'a fortified camp' : 'a working camp') + ', ' + (s.companion ? 'a bond growing real enough to plan around' : 'a solitude you\'ve built into a structure') + ', and inland — patient, banked, unanswered — <em>that fire</em>.',
      'You\'ve run every version of it. A castaway like you, decades deeper. A hermit who chose this. Someone the island keeps. Someone the island <em>couldn\'t get rid of</em>. Every version knows things that would take you years and cost you fingers to learn alone.',
      'Every version also watched your smoke for thirteen days and never came.',
      'The monsoon months are out there past the horizon somewhere, and knowledge has a season too. What do you do about the fire on the mountain?',
    ],
    choices: [
      {
        t: '🏮 Go now. Tonight. Walk into the dark and knock.',
        sub: 'Bold, fast, and first impressions can\'t be rehearsed. The jungle at night is nobody\'s friend.',
        do: (s) => { TB.flag('SMOKE_NOW'); TB.route('depth', 2); TB.flag('CLEARING_DONE2'); },
        go: 'ch2_end_trek',
      },
      {
        t: '🛡️ Prepare first. Go at first light, provisioned and presentable.',
        sub: 'Slower, safer, and whoever it is has waited years — they\'ll wait a night.',
        do: (s) => { TB.flag('SMOKE_LATER'); TB.route('roots', 2); TB.flag('CLEARING_DONE2'); },
        go: 'ch2_end_fort',
      },
      {
        t: '🆘 Let the mountain keep its hermit. Your fire talks to the SEA.',
        sub: 'Strangers are a risk and rescue is a bearing. Double down on the signal.',
        do: (s) => { TB.flag('SMOKE_IGNORED'); TB.route('signal', 2); TB.flag('CLEARING_DONE2'); },
        go: 'ch2_end_signal',
      },
    ],
  });

  TB.scene('ch2_end_trek', {
    bg: 'jungle-night', who: EDDA_SHAPE,
    text: (s) => [
      'You bank your fire, ' + (s.companion ? ({ kavi: 'whistle Kavi to heel', ipo: 'collect Ipo onto your shoulder', vela: 'leave word with the sleeping cliffs — Vela finds you or she doesn\'t', buri: 'give up on leaving Buri behind before you finish having the idea', moa: 'settle Moa in her carried basket, grumbling', nine: 'touch the water of Nine\'s pool once, for luck' }[s.companion]) + ', and walk into the jungle at night' : 'and walk into the jungle at night, alone') + ', following a bearing and a resolve that both feel thinner with every dark mile.',
      'The jungle at night is a rumor of itself — root and drip and eyeshine — and you are deep in it, past the point of sensible return, when the smell of woodsmoke arrives like a hand out of the dark.',
      'Then the light. Not a campfire: a <em>lantern</em>, swinging knee-high, coming down the slope toward you through the trees with the unhurried gait of someone on their own ground. It stops at conversational distance. Above it: a weathered face, a long grey braid, eyes that have finished their assessment before you\'ve started yours.',
      'Below it, held with the casual competence of long habit: the twin dark circles of a shotgun\'s mouth.',
      '"Well," says a voice rusty with disuse, in the tone of a woman finding a pig in her garden. "It talks, walks at night like a fool, and smells of the sea. Sixty years I\'ve kept this island\'s one quiet mountain—" the lantern lifts; the old eyes rake you, your companion, your empty hands, "—and the tide brings me <em>another one</em>."',
      'The shotgun, you notice, has not been raised. It has also, you notice, not been lowered.',
      '<em>To be continued.</em>',
    ],
    next: 'ch2_end',
    nextLabel: 'Chapter Two ends ➤',
  });
  TB.scene('ch2_end_fort', {
    bg: campBg2,
    text: [
      'You spend the last light preparing like it\'s a state visit, because it might be: food packed as gift and as ballast, fire triple-banked, camp secured, your one salvageable shirt made as presentable as sea and jungle allow.',
      'You go up at first light, provisioned, rested, and deliberate — and find, an hour along the inland trail, that the mountain has been ahead of you the whole time: laid on a flat stone in the middle of your path, arranged so you cannot possibly miss it, a single dried sprig of some herb you don\'t know, and beneath it, weighted, a strip of bark with charcoal writing in a firm, old-fashioned hand.',
      '"<em>If you must come — come at noon, come slow, and don\'t bring the pig smell if you can help it. — E.</em>"',
      'You stand there in the green light, holding the first written words you\'ve seen since the crash, laughing and unnerved in equal measure. Whoever E is: they\'ve known where your camp is all along. They knew you\'d come today. And they have opinions.',
      '<em>To be continued.</em>',
    ],
    next: 'ch2_end',
    nextLabel: 'Chapter Two ends ➤',
  });
  TB.scene('ch2_end_signal', {
    bg: 'beach-night',
    text: [
      'You choose the sea. Whatever the mountain knows, it isn\'t a way home — and you have finite hours, finite hands, and one horizon that matters.',
      'You spend the eighteenth night building your answer to it: the signal pyre rebuilt taller on the point, tinder-dry under its rain cap, ready to turn one match into a pillar visible from the shipping lanes you have to believe are out there. Your SOS renewed. Your mirror-glass angled and stacked.',
      'And yet, banking your fire at midnight, you catch yourself looking inland one more time. The thread of the mountain\'s smoke is invisible in the dark — but somewhere up there it burns, tended by hands that saw your fire and chose the same silence you\'re choosing now.',
      'Two fires on one island, each deciding the other can wait. The island keeps its own counsel about how that usually goes.',
      '<em>To be continued.</em>',
    ],
    next: 'ch2_end',
    nextLabel: 'Chapter Two ends ➤',
  });

  // ---- Chapter 2 end card ----------------------------------------------------------------
  const COMP_TITLE = { kavi: 'Kavi the island dog 🐕', ipo: 'Ipo the macaque 🐒', vela: 'Vela the sea eagle 🦅', buri: 'Buri the bearded pig 🐗', moa: 'Moa the junglefowl 🐔', nine: 'Nine the octopus 🐙' };
  TB.scene('ch2_end', {
    bg: 'beach-night',
    text: (s) => {
      const t = ['<em>END OF CHAPTER TWO — FOOTHOLD</em>', 'The Ledger turns another page. Days four through nine, as the island will remember them:'];
      t.push('— You chose your ground: <em>' + ({ beach: 'the crash beach, eyes on the horizon', fringe: 'the jungle fringe, deep in the green', overhang: 'the cliff overhang, stone above and the world below' }[s.site || 'beach']) + '</em>.');
      if (s.companion) {
        const tierWord = ['wary of you still', 'tolerating you, and pretending otherwise', 'bonded to you — it shows in everything', 'devoted to you past all argument', 'kindred'][TB.tier()];
        t.push('— ' + COMP_TITLE[s.companion] + ' is ' + tierWord + '.' + (TB.is('HEART1_DONE') ? ' The fifteenth morning happened. Neither of you will mention it. Both of you are changed by it.' : ''));
      } else {
        t.push('— You are alone by choice, and the choice still holds.' + (TB.is('COCO_TALKED') ? ' Coco has been briefed on all major decisions.' : ''));
      }
      t.push('— The Boar King ' + (TB.is('KING_TITHED') ? 'accepts your tribute. For now. Negotiations continue.' : TB.is('KING_TRACKED') ? 'is known to you now — his roads, his scars, his snapped traps. Knowledge with teeth in it.' : TB.is('KING_WALLED') ? 'found your walls raised against him. The inland dark took note.' : 'came in the night and taught you the rent.'));
      t.push('— The first storm ' + (s.site === 'overhang' ? 'broke on your stone roof and owed you nothing.' : s.shelter >= 2 ? 'tested your walls and lost.' : 'took its tax in full.') + (TB.is('MOA_FOUND') ? ' You went out into it and brought Moa home.' : '') + (TB.is('KAVI_FIRE_TEST') ? ' Kavi kept watch all night from inside his own fear.' : ''));
      t.push('— And the smoke: ' + (TB.is('SMOKE_NOW') ? 'you walked into the night and met a lantern, a braid, and a shotgun that never quite lowered. Her name starts with E, and Chapter Three belongs to her mountain.' : TB.is('SMOKE_LATER') ? 'you prepared first — and the mountain left you a note. "Come at noon. Come slow." Signed E. Chapter Three has an appointment.' : 'you turned your back on it and fed your signal instead. The mountain\'s fire burns on, unanswered, patient. Chapter Three will not wait forever.'));
      t.push('Route leanings — Signal ' + s.route.signal + ' · Roots ' + s.route.roots + ' · Depth ' + s.route.depth + '.');
      return t;
    },
    choices: [
      { t: '🌴 Continue — Chapter Three: The Green Deep ➤', sub: 'The mountain, the river, the mangroves and what owns them, and the woman with the lantern.',
        go: 'ch3_open' },
      { t: '🌊 Start a new run instead', sub: 'Different ground, different companion, different storms.',
        do: () => { TB.wipe(); TB.state = TB.newState(); }, go: 'title' },
    ],
  });
})(window);
