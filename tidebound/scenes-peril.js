/* =====================================================================
 * scenes-peril.js — SCARS, NOT GRAVES. Once per run (chapters 3–5, at
 * Bonded+ trust), the island nearly takes your companion — and doesn't.
 * The peril event injures them (state.chInjured = {day, tends}); a
 * '🩹 Tend' hub action drives a three-stage nursing arc to a recovery
 * scene worth more trust than any fish ever bought; and if the player
 * somehow ignores it, wild things heal on wild schedules (five days,
 * quietly, in tickSegment) — nobody dies. Ever. Owner's orders.
 * Healed runs unlock the gentled WHAT REMAINS ending in ch7.
 * =================================================================== */
(function (G) {
  'use strict';
  const TB = G.TB;
  const NAMES = { kavi: 'Kavi', ipo: 'Ipo', vela: 'Vela', buri: 'Buri', moa: 'Moa', nine: 'Nine' };

  // ---- the peril itself, one authored near-miss per species -------------------
  const PERIL = {
    kavi: {
      bg: 'jungle',
      hit: ['It happens at the treeline, and it happens FAST: a young boar — not the King; one of the King\'s hot-blooded grandsons, all tusk and no treaty — breaking cover at you head-down, and Kavi arriving from nowhere at full stretch, taking the charge broadside that was measured for your legs.',
        'The collision is a sound you will hear for years. The boar tumbles, rights itself, thinks better of everything, and crashes away — and Kavi gets up, which is the first miracle, and then sits down again very suddenly, which ends the morning. A tusk-line along his ribs, shallow but long, and a foreleg he will not put weight on, and eyes that keep checking — even now, even like this — that YOU are unhurt.',
        'You carry him back to camp. He is heavier than he looks and lighter than the alternative, and you do not put him down, even when your arms ask, until he is on your own bedroll by the fire.'],
      tend: ['You clean the tusk-line with boiled water and honest hands, and he lets you — flinching, held still by an act of will you can feel trembling through him — because it is you doing it, and for no other reason on this earth.',
        'The salve goes on morning and night; the foreleg gets your one clean shirt as a wrap. He has learned the routine and presents himself for it, ears down, stoic — and takes his fee afterward in forehead-against-your-chest, which you pay gladly and at length.',
        'He stands on the leg today. Puts weight on it. Takes three steps, checks with you — is this allowed? — and does a slow, careful lap of the fire, tail moving. The relief hits you somewhere behind the sternum, harder than you were braced for.'],
      whole: ['On the sixth morning Kavi meets you at the shelter mouth standing square on four legs, tail going like a metronome in a hurricane, and dares you — plainly, loudly, insufferably — to a run down the beach.',
        'You run it. Both of you. He wins, pulling up at the tideline barking at the sea, at the gulls, at the joy of a body that works — and when you catch up he plants both forepaws on your chest and knocks you flat in the shallows, which the rules of the beach have always permitted between packmates.',
        'The scar along his ribs will carry no fur. You will find yourself resting your hand on it, some nights at the fire, and he will let his breath out long and slow when you do — the sound of an account both of you understand now: paid. Both directions. In full.'],
    },
    ipo: {
      bg: 'jungle',
      hit: ['The monsoon wind is the liar, not Ipo. The canopy gap he has crossed a thousand times is two feet wider in a gust, and you watch — helpless, forty feet below, the whole thing in slow motion — as the branch he catches bows, cracks, and drops him through three stories of green.',
        'The jungle gentles falls for its own; that is the only reason this is a story and not a grave. He comes down through vines and fronds and lands badly on the root-shelf, and by the time you reach him he has dragged himself upright against the trunk, one arm cradled wrong, chattering at you in a register you have never heard from him: small. Scared. Asking.',
        'You bring him home inside your shirt, against your heartbeat, the way you\'d carry something that had just remembered it was breakable.'],
      tend: ['The arm is sprained, not snapped — you splint it small with driftwood and cloth, and he watches the whole operation with huge eyes, gripping your thumb throughout with his good hand, hard.',
        'An ape with one arm is an ape with no kingdom, and he grieves it: sulking, refusing fruit, staring up at HIS canopy. So you become the canopy — you carry him on your shoulder everywhere, all day, to every chore, and by dusk he is himself enough to steal your last fig, one-handed, out of your very fingers.',
        'Splint off. He flexes the arm, examines it with a jeweler\'s suspicion, hangs from a low branch — one arm, then both, then a slow chin-up with his tongue out. The look he gives you afterward is shamelessly triumphant, as if the recovery were his idea and your nursing a lucky coincidence.'],
      whole: ['He goes back up on the seventh day, and you stand at the bottom rubbing your neck and watching a small king reclaim a green country: careful at first, testing each hold — then faster — then SHOWING OFF, blatantly, a victory lap through the middle terraces with a rain of insults down at gravity itself.',
        'That evening he brings you a mango. A real one, from wherever the mangoes have been all along, placed in your hand with ceremony and a long look from those amber eyes.',
        'He never misjudges a gap again. But you notice, from that season on, that his routes bend nearer the ground when the wind is up — and that some nights he sleeps not in the rafters but against your shoulder, one hand wrapped in your collar, holding on to the thing that held on to him.'],
    },
    vela: {
      bg: 'cliff-camp',
      hit: ['The squall line comes over Kestrel Cliffs like a thrown net, and Vela — empress, veteran, one-eyed reader of every wind this coast has ever produced — is caught mid-stoop in the one gust even she cannot ride.',
        'You watch the sky slap her down. There is no kinder verb. She cartwheels once, recovers halfway — magnificent even in catastrophe — and hits the high beach hard enough to bounce, and by the time you reach her she is upright, soaked, hissing at the entire atmosphere, one great wing held at an angle that wings do not have.',
        'Approaching a downed sea eagle is a negotiation with knives. She lets you. That is the measure of everything the fish and the years have bought: she looks at you with the gold eye, and folds the hurt wing as best she can, and LETS YOU.'],
      tend: ['You bind the wing to her body — sprained at the wrist-joint, Edda\'s books say, not broken — and she endures the handling like royalty enduring a tailor: rigid, affronted, and precisely cooperative.',
        'A grounded empress must be fed, and the protocol matters: fish presented whole, at arm\'s length, gaze averted. She takes each one with terrifying delicacy and watches the water she cannot have — and on the third evening she does something unprecedented: she walks — WALKS, like a commoner — across the camp, and stands beside your fire, and stays.',
        'Wing unbound. She spreads it slowly, feather by feather, testing the span against the evening breeze — and the breeze moves through it, and something in her posture comes back online that you hadn\'t known was missing: altitude, restored to a body built of it.'],
      whole: ['She takes the sky back at dawn, in front of you, on purpose: three steps, the great double beat, and UP — a climbing spiral off the cliff face into the gold, higher and higher, wringing the wind out like a debt collected with interest.',
        'She is gone the whole day. You do not begrudge it; some reunions need privacy. But at dusk she returns to the snag with a fish so absurdly large it can only be a statement, and drops it at your feet, and arranges herself, and waits to be admired.',
        'The wing carries a notch in its silhouette now, one flight feather that grew back crooked — you can find her against any sky on the coast by it. You never once tell her it makes her more magnificent. She never once needs telling.'],
    },
    buri: {
      bg: 'camp-fringe',
      hit: ['The young rival comes at dusk — a boar in his brash first prime, testing whether the big scarred one by the human fire has gone soft — and Buri, who has never once in his life declined a question honestly asked, meets him at the boundary.',
        'It is loud, brief, and decided — the youngster leaves at speed with recalibrated opinions — but decided at a price: a gore-line up Buri\'s shoulder, deep where it starts, and he comes back to the fire trying so hard to walk like a winner that it breaks your heart to watch.',
        'He lies down where you point, which he has never done before, and that frightens you more than the wound.'],
      tend: ['The gore-line takes all your boiled water and both your hands, and he bears it with his eyes shut and his great head in your lap, making, very quietly, the smallest sounds his enormous voice can produce.',
        'A pig who will not eat is a crisis; a Buri who will not eat is an emergency. You cook for him — actually cook, the good tubers, mashed soft, honey on top — and hand-feed the foreman of your whole world until, somewhere in the second bowl, the tail gives one low, tentative wag.',
        'He is up today, moving carefully, supervising your fence work from a supervisory distance instead of the middle of it. By afternoon the distance has halved. By dusk he is asleep against the post you were trying to set, which is his way of signing off on it.'],
      whole: ['On the sixth day he eats his own body weight, destroys one woodpile out of sheer convalescent joy, and reports for duty at the garden with the shoulder moving clean under the new scar.',
        'The young rival, you notice in the weeks after, has taken to patrolling the OUTER boundary — respectfully, at distance, like an apprenticeship conducted by treaty. Buri permits it. Kings who have been young themselves keep generous borders.',
        'The scar seals silver-grey up his shoulder, and he wears it the way he wears everything: as furniture, as fact, as another line in the long warm ledger of a body spent freely on the things it loves. He naps against your back the same as ever. You lean into it harder than you used to.'],
    },
    moa: {
      bg: 'camp-fringe',
      hit: ['The hawk comes back. Older now, wiser now, and it has done the arithmetic on every creature in your clearing except the one that matters — and it stoops on the youngest hen at the woodline, and Moa, forty grams of copper fury, gets there first.',
        'She wins. Understand that first: the hawk leaves empty-clawed, escorted off the premises trailing two of its own feathers. But she wins the way the very small win against the very large — by spending everything — and when the dust settles she is upright in the churned sand with one wing dragging and half her tail plumage gone and the entire flock gathered around her in awed, clucking silence.',
        'She consents to be picked up. First time ever. You carry the bravest heart on the island back to the fire in two cupped hands, and she weighs nothing, and she weighs everything.'],
      tend: ['The wing is wrenched, not broken. You make her a recovery ward from the salvage basket, lined with your softest spare cloth, positioned — per her furious insistence — with full tactical view of the entire camp.',
        'She runs the flock from the basket. This is not a joke: hens report to the basket rim, disputes are adjudicated from the basket, the evening perimeter is inspected BY PROXY, with follow-up questions. You are, on three occasions, sent back out to re-verify the treeline. You go.',
        'Wing test at dawn: a hop to the basket rim, a flap, a short glide to the fence post — a landing that would shame no one — and then the crow-adjacent noise of triumph she makes, which brings the whole flock at a run, and Trouble himself bows his head to be pecked, once, affectionately, hard.'],
      whole: ['Six days after a sea hawk learned the price of her flock, Moa resumes patrol at full strength, tail feathers regrowing in defiant copper, gait unchanged, dignity — this is the miracle — entirely intact.',
        'The hawk never comes back. Word travels, in the air-nations. Somewhere over the cliffs it is presumably explaining the scar on its foot to skeptical colleagues.',
        'She sleeps that season not on her usual post but on the ridgepole above YOUR bed — new habit, never explained, never dropped. The bravest heart on the island has redrawn her perimeter, and you are inside it, and you sleep better for knowing it.'],
    },
    nine: {
      bg: 'tidepools',
      hit: ['The king low strands her. Chasing the tide out too far along her own channels — bolder than usual, because the reef was showing her something — Nine misjudges the one thing she has never misjudged, and the sea leaves without her: a golden-eyed sovereign in a pool shrinking by the minute, under a sun with no opinion of octopus.',
        'You find her because you had a strange itch to walk the pools at noon — you will think about that later — and the state of her stops your breath: dulled skin, cramped arms, the gallery-keeper of the whole reef pressed into the last wet corner of a dying puddle.',
        'You carry her home in the water gourd, both hands, at a run.'],
      tend: ['You build her a convalescent pool at the tideline — dug deep, shaded with the tarp, refreshed bucket by bucket, every hour, from the true sea. She hangs in the clean water like a mended flag, and one arm rises to touch your wrist each time you pour: noted. Noted. Noted.',
        'Her color comes back in weather-fronts — grey, then dun, then, on the third evening, the first slow wave of her true patterning moving across her mantle like a lamp relit. She eats the crab you bring, delicately, and does the wrist-taste of your pulse, and holds on a beat longer than diagnosis requires.',
        'Today the gallery reopens: through the shade-slats you watch her arranging the convalescent pool\'s pebbles — sorting, stacking, one blue shell placed at the center. If she is curating again, she is HERSELF again. You leave a whelk on the rim. By dusk it is part of the exhibition.'],
      whole: ['On the sixth tide she goes home — flowing out of the recovery pool and down the beach in that impossible pour of hers, into the shallows, gone — and you stand there rubbing salt off your hands, ambushed by how empty a hole full of seawater can look.',
        'She is back at moonrise. Not to stay — to collect you: one arm out of the water at the tideline, unmistakable, imperious. You wade in. She takes your wrist and leads you to the presidential pool, where the night\'s exhibition is laid out under the lagoon\'s glow: your lost fishhook. The blue bottle glass. A pebble from the recovery pool you built. The whole story of the season, curated, in stones.',
        'The wrist-hold that night has a new pattern in it — deliberate, repeated, seven beats and a rest — and you understand, at last, at least one entry in her ledger: the sea keeps what the tide brings all the way down. And so, it turns out, do you. And so does she.'],
    },
  };

  // fires from the living-island pool (see scenes-extra.js): once per run
  TB.scene('ev_peril', {
    bg: (s) => (PERIL[s.companion] || PERIL.kavi).bg,
    enter: (s) => {
      if (!TB.is('PERIL_DONE')) {
        TB.flag('PERIL_DONE'); TB.flag('PERIL_' + String(s.companion || 'kavi').toUpperCase());
        s.chInjured = { day: s.day, tends: 0 };
        TB.stat('hope', -6);
      }
    },
    text: (s) => (PERIL[s.companion] || PERIL.kavi).hit,
    next: (s) => (s.chapter >= 2 ? 'camp2' : 'camp'),
    nextLabel: '🩹 Whatever it takes ➤',
  });

  // the tending arc + recovery, via the shared hub decorator
  const prevActs = TB.ch3Actions;
  TB.ch3Actions = function (s) {
    const c = prevActs ? prevActs(s) : [];
    if (s.chInjured && s.companion) {
      const stage = Math.min(s.chInjured.tends, 2);
      c.unshift({
        t: '🩹 Tend to ' + NAMES[s.companion], sub: ['Clean the wound, and be the reason it\'s bearable.', 'Food, patience, and company. The medicine under the medicine.', 'Nearly there. Let them show you what works again.'][stage] + ' Energy −, trust ++.',
        do: () => {
          const s2 = TB.state;
          TB.stat('energy', -8); TB.bond(4); TB.stat('hope', 2);
          const P = PERIL[s2.companion] || PERIL.kavi;
          const t = s2.chInjured.tends;
          s2.chInjured.tends = t + 1;
          if (s2.chInjured.tends >= 3) {
            s2.out = { bg: P.bg, text: [P.tend[Math.min(t, 2)]], go: 'peril_whole' };
          } else {
            s2.out = { bg: P.bg, text: [P.tend[Math.min(t, 2)]] };
          }
          TB.tickSegment();
        },
        go: 'act_result',
      });
    }
    return c;
  };

  TB.scene('peril_whole', {
    bg: (s) => (PERIL[s.companion] || PERIL.kavi).bg,
    enter: (s) => {
      if (s.chInjured) { s.chInjured = null; TB.flag('PERIL_HEALED'); TB.bond(10); TB.stat('hope', 8); }
    },
    text: (s) => (PERIL[s.companion] || PERIL.kavi).whole,
    next: (s) => (s.chapter >= 2 ? 'camp2' : 'camp'),
    nextLabel: 'Paid. Both directions. In full. ➤',
  });
})(window);
