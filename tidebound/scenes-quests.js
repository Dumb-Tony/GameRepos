/* =====================================================================
 * scenes-quests.js — the Companion Quests update.
 * Each companion's exclusive quest line from the design bible
 * (design/03), built as: a trigger event on a clean schedule slot →
 * one or more camp actions → a payoff with flags that feed epilogues.
 * Plus the two missing dark endings: despair (The Green Swallows) and
 * the Gullet's greed (The Long Dark) — wired from night2/ev5_deep2.
 * =================================================================== */
(function (G) {
  'use strict';
  const TB = G.TB;
  const R = Math.random;

  function campBg2(s) {
    if (s.chapter < 2) return s.seg === 2 ? 'beach-dusk' : 'beach-day';
    if (s.site === 'fringe') return 'camp-fringe';
    if (s.site === 'overhang') return 'cliff-camp';
    return s.seg === 2 ? 'beach-dusk' : 'beach-day';
  }
  const backToCamp = (s) => (s.chapter >= 2 ? 'camp2' : 'camp');
  const WHO = {
    kavi: { emoji: '🐕', name: 'Kavi' }, ipo: { emoji: '🐒', name: 'Ipo' },
    vela: { emoji: '🦅', name: 'Vela' }, buri: { emoji: '🐗', name: 'Buri' },
    moa: { emoji: '🐔', name: 'Moa' }, nine: { emoji: '🐙', name: 'Nine' },
  };
  const EDDA = { emoji: '👵', name: 'Edda Voss', art: 'char-edda' };

  // ---- quest triggers (clean slots; all gated on companion + trust) ------------
  TB.SCHEDULE.push(
    { d: 12, s: 0, id: 'q_kavi_1', when: (s) => s.companion === 'kavi' && s.trust >= 40 },
    { d: 12, s: 1, id: 'q_buri_1', when: (s) => s.companion === 'buri' && s.trust >= 40 },
    { d: 13, s: 0, id: 'q_vela_1', when: (s) => s.companion === 'vela' && s.trust >= 40 },
    { d: 13, s: 2, id: 'q_nine_1', when: (s) => s.companion === 'nine' && s.trust >= 45 },
    { d: 14, s: 1, id: 'q_moa_1', when: (s) => s.companion === 'moa' && s.trust >= 40 },
    { d: 14, s: 2, id: 'q_ipo_1', when: (s) => s.companion === 'ipo' && s.trust >= 45 },
    { d: 17, s: 0, id: 'q_vela_3', when: (s) => TB.is('Q_VELA_EGGS') && !TB.is('Q_VELA_DONE') },
  );

  // ---- quest actions (hub decorator) ----------------------------------------------
  const prevActions = TB.ch3Actions;
  TB.ch3Actions = function (s) {
    const c = prevActions(s);
    if (TB.is('Q_KAVI_ACTIVE') && !TB.is('Q_KAVI_DONE')) c.push({
      t: '🦴 Dig with Kavi at the old dune', sub: 'Whatever he\'s found down there, he won\'t leave it — and he wants you with him.',
      do: () => { TB.stat('energy', -10); TB.tickSegment(); }, go: 'q_kavi_2' });
    if (TB.is('Q_IPO_ACTIVE') && !TB.is('Q_IPO_STATUS')) c.push({
      t: '🐒 Engineer Ipo\'s comeback', sub: 'Salt a "discovery" where the troop will witness the finding. Politics is theater; you know a showman.',
      do: () => { TB.stat('energy', -6); TB.tickSegment(); }, go: 'q_ipo_2' });
    if (TB.is('Q_IPO_STATUS') && !TB.is('Q_IPO_DONE')) c.push({
      t: '🐒 The mirror gambit', sub: 'Give him the one prop no macaque on this island can counterfeit: light itself.',
      do: () => { TB.tickSegment(); }, go: 'q_ipo_3' });
    if (TB.is('Q_BURI_ACTIVE') && !TB.is('Q_BURI_DONE')) c.push({
      t: '⛏️ Excavate the cellar with Buri', sub: TB.is('Q_BURI_STAGE') ? 'The stair is clear. The back chamber waits.' : 'Stone-lined, cool-breathing, deliberately sealed. The Kaari built this.',
      do: () => { TB.stat('energy', -12); TB.tickSegment(); }, go: 'q_buri_2' });
    if (TB.is('Q_MOA_ACTIVE') && !TB.is('FLOCK')) c.push({
      t: '🐔 Help Moa gather the flock', sub: TB.is('Q_MOA_STAGE') ? 'The coop stands. Recruitment continues, by drill sergeant.' : 'Two scraggly hens already shadow her. She has plans. You are the infrastructure.',
      do: () => { TB.stat('energy', -8); TB.tickSegment(); }, go: 'q_moa_2' });
    if (TB.is('FLOCK') && TB.is('EDDA_GRAVES') && !TB.is('Q_ROOSTER_DONE')) c.push({
      t: '🐓 Take the young rooster up to Edda', sub: 'You know about Aleksander. You know exactly what you\'re doing.',
      do: () => { TB.stat('energy', -6); TB.tickSegment(); }, go: 'q_rooster' });
    if (TB.is('Q_NINE_ACTIVE') && ((s.flags.NINE_TRICKS || 0) < 3)) c.push({
      t: '🐙 Teach Nine a trick (' + (s.flags.NINE_TRICKS || 0) + '/3)', sub: 'She has asked, in her way. Choose the curriculum with care — she never forgets, and she never UN-learns.',
      do: () => { TB.stat('energy', -6); TB.tickSegment(); }, go: 'q_nine_2' });
    return c;
  };

  // ==================================================================
  //  KAVI — OLD BONES
  // ==================================================================
  TB.scene('q_kavi_1', {
    bg: 'beach-day', who: WHO.kavi,
    text: [
      'Kavi has found something at the old dune — the high, grass-bound one past the point, where the beach keeps its oldest wrack — and it has unmade his composure entirely.',
      'He has been digging since before you woke: a crater already shoulder-deep to him, sand flying, and when you arrive he doesn\'t stop, doesn\'t perform his usual grave dignity — just looks up at you once, eyes urgent over the working forepaws, and KEEPS DIGGING. Whatever is down there, his nose has been reading it all morning like a letter from home.',
      'You fetch the digging stick. This is clearly now a two-person job.',
    ],
    enter: (s) => { if (!TB.is('Q_KAVI_ACTIVE')) { TB.flag('Q_KAVI_ACTIVE'); } },
    next: (s) => backToCamp(s),
  });
  TB.scene('q_kavi_2', {
    bg: 'beach-day', who: WHO.kavi,
    text: [
      'An hour down, in the dune\'s cool dark heart, your stick strikes wood.',
      'Old wood — ship\'s wood, black and iron-hard, ribs of some vessel the sea buried here so long ago the dune grew over her grave. And tangled in the ribs, where Kavi\'s nose said it would be: leather gone to stone, a ring of it, and on the ring a plate of green-crusted brass. You clean it with your thumb, and the stamped letters come up like a voice from underwater:',
      '<em>"BOSUN" — and beneath, worn to ghosts: a ship\'s name ending in "—LANI", and a date: 1887.</em>',
      'A dog\'s collar. A ship\'s dog — the ship\'s dog, wrecked here with his crew a century and a half ago, and buried by no one, by weather, wearing his name.',
      'Kavi takes the collar from your hand — takes it, gently, jaws like a reliquary — and sits with it a long moment in the crater you dug together, utterly still. His line began here. The pariah dogs, the pack, the singing on the ridges: every wild dog on Vessakai is this animal\'s inheritance. Bosun, of the sea, 1887. The first castaway dog. Kavi\'s many-times-grandfather.',
    ],
    choices: [
      { t: 'Walk with him wherever he wants to take it.', sub: 'This is his. Follow.',
        do: (s) => { TB.flag('Q_KAVI_DONE'); TB.bond(8); TB.stat('hope', 5); TB.route('depth', 1); }, go: 'q_kavi_3' },
    ],
  });
  TB.scene('q_kavi_3', {
    bg: 'jungle-night', who: WHO.kavi,
    text: [
      'He carries it inland at dusk, and you follow, and you know where you\'re going a mile before you arrive: the singing ridge. The pack\'s high place, where the chorus rises on clear nights, where every wild dog on this island announces itself to every other.',
      'He climbs to the bare crown of it, sets the collar down on the highest stone — precisely, adjusting it twice — and steps back. And sings. Alone, unprompted, the long rusty howl rolling down over the darkening jungle: not a position call, not an answer. An ANNOUNCEMENT. <em>The first of us is found. The first of us came home.</em>',
      'And from three directions in the dark, the pack answers — long and full, the whole wild nation of Bosun\'s children singing back — and Kavi stands over the brass nameplate of his ancestor with his eyes shut, taking it in like weather, like sunlight, like something owed a hundred and forty years finally paid.',
      'The collar stays on the ridge. Some things you dig up in order to put them somewhere higher.',
    ],
    next: (s) => backToCamp(s),
  });

  // ==================================================================
  //  IPO — TROOP POLITICS
  // ==================================================================
  TB.scene('q_ipo_1', {
    bg: 'jungle', who: WHO.ipo,
    text: [
      'Something is wrong with Ipo, and it takes you until dusk to piece together what: the troop\'s new matriarch has robbed him.',
      'You get the story in fragments and pantomime, and from the crime scene itself when he finally leads you there: his backup stash — the peripheral one he keeps in troop territory, his diplomatic reserve — cleaned out, publicly, by the matriarch herself, in front of everyone, with (you infer from the reenactment) devastating casualness. Not theft as need. Theft as STATEMENT: <em>the little showman ranks wherever I say he ranks.</em>',
      'And Ipo — Ipo of the ten thousand performances, who turned your lighter into a comedy and Old Grin into a heckling victim — sits on your shoulder that evening genuinely, wordlessly small, and doesn\'t perform ANYTHING.',
      'Absolutely not. You have a showman down. You know exactly what you two do to a rigged game: you rig it back.',
    ],
    enter: (s) => { if (!TB.is('Q_IPO_ACTIVE')) { TB.flag('Q_IPO_ACTIVE'); TB.bond(3); } },
    next: (s) => backToCamp(s),
  });
  TB.scene('q_ipo_2', {
    bg: 'jungle', who: WHO.ipo,
    text: [
      'Operation Comeback, phase one: the salted discovery.',
      'You spend the morning assembling a cache no macaque could ignore — bottle-glass in three colors, a spiral of bright shells, the sardine tin you\'ve been saving, all of it arranged with theatrical care under one liftable stone on the troop\'s main highway — and then you and your co-conspirator wait downwind, and Ipo, briefed within an inch of his life, does not so much as GLANCE at the stone until the audience is maximal.',
      'The finding is a masterpiece. He works the crowd. He lifts the stone like a magician lifting a hat, lets the glass catch the sun, distributes EXACTLY three shells to exactly the right mid-ranked aunts — patronage, you realize; he\'s building a FACTION — and swaggers the sardine tin past the matriarch at a distance calculated to the centimeter: close enough to be seen, far enough to be unpunishable.',
      'By nightfall the troop\'s whole grooming order has shifted two seats. Ipo rides home on your shoulder restored to full volume, narrating his own triumph in squeaks, and you nod along like a campaign manager who knows the real fight is still ahead.',
    ],
    enter: (s) => { if (!TB.is('Q_IPO_STATUS')) { TB.flag('Q_IPO_STATUS'); TB.bond(4); TB.stat('hope', 3); } },
    next: (s) => backToCamp(s),
  });
  TB.scene('q_ipo_3', {
    bg: 'jungle', who: WHO.ipo,
    text: [
      'Phase two: the mirror gambit. You give him the prop no rival can counterfeit — the polished lens-shard from the broken camera, taught in secret over two evenings until he can throw a spot of sunlight forty feet with a flick of his wrist.',
      'The demonstration, staged at high noon at the troop\'s bathing pool, is the single greatest moment of his career, and he has clearly structured it in ACTS: first the dancing light on the water (alarm, wonder); then the spot climbing the great fig (awe); then — the little apostate — a burning dot settled square on the matriarch\'s chest like the finger of a god (chaos, screaming, three aunts openly defecting).',
      'She charges him, of course. The whole pool holds its breath — and here it is, the moment you rehearsed him for and can\'t help him with:',
    ],
    choices: [
      { t: 'Hold still and trust the showman. This is HIS stage.', sub: 'If he breaks and runs, he\'s finished. If he holds the bluff…',
        do: (s) => { TB.flag('Q_IPO_DONE'); TB.flag('IPO_FACED_HER'); TB.bond(8); TB.stat('hope', 5); }, go: 'q_ipo_4' },
      { t: 'Step out of the treeline — a two-hundred-pound ally changes any negotiation.', sub: 'Safer. But the troop will remember WHO won this.',
        do: (s) => { TB.flag('Q_IPO_DONE'); TB.flag('IPO_BACKED'); TB.bond(4); }, go: 'q_ipo_4' },
    ],
  });
  TB.scene('q_ipo_4', {
    bg: 'jungle', who: WHO.ipo,
    text: (s) => [
      TB.is('IPO_FACED_HER')
        ? 'He holds. Two feet of furious matriarch bearing down on him and the little showman DOES NOT MOVE — just raises the lens, slow and terrible as a priest, and sets the burning dot on the ground one inch before her feet, and draws a line with it. She stops. The pool is silent. And Ipo, master of timing, holding the eye of every macaque on the island — yawns.'
        : 'You step from the treeline, and the arithmetic changes the way big allies always change it: the matriarch pulls up, recalculates, and settles for furious dignity. The troop takes note of Ipo\'s new light-magic — and takes harder note of the tall shape behind him. He won. You both know the asterisk.',
      TB.is('IPO_FACED_HER')
        ? 'It\'s over in that yawn. Rank on Vessakai\'s troop was never about mass; it was always about nerve, and no animal on this island has EVER out-nerved the one who heckled a crocodile. The matriarch grooms him before sundown — the formal surrender — and the aunts form a queue.'
        : 'Still: a win banked is a win. His faction holds, his stash is returned with interest by nervous functionaries, and the matriarch gives him — and your treeline — a wide, calculating berth.',
      'That evening he sits on your shoulder at the fire, worrying the lens-shard, watching the light. King-in-waiting or client-prince — either way, the crown you saw in the canopy\'s future got measurably closer today, and he knows who staged it with him.',
    ],
    next: (s) => backToCamp(s),
  });

  // ==================================================================
  //  VELA — THE HIGH NESTS
  // ==================================================================
  TB.scene('q_vela_1', {
    bg: 'cliff-camp', who: WHO.vela,
    text: [
      'Vela hits your camp at first light like thrown weather — no fish, no ceremony, screaming the finding-cry over and over, wheeling back toward the cliffs and returning when you don\'t move fast enough. Whatever this is, it is NOW.',
      'You run the point trail with your kit and your heart in your ears, and from the cliff shoulder you see it: her nest ledge, the high one, the late-season clutch she\'s been brooding — and flowing up the crag toward it, patient as tax law, six feet of monitor lizard.',
      'She strafes it — talons, wind, fury — but a monitor is armor and appetite and it has done this exact climb before, on this exact cliff, for more eggs than she has years. It doesn\'t need to win the fight. It only needs her to leave the ledge one more time.',
      'She can\'t hold it alone. That\'s why she came to you — SHE CAME TO YOU — and the ledge is a hard scramble up, and the lizard is nearly there.',
    ],
    choices: [
      { t: '🧗 Climb. Get between the lizard and the ledge.', sub: '⚠️ Real fall, real teeth. But nothing else fully stops it.',
        do: (s) => { const s2 = TB.state; TB.flag('Q_VELA_EGGS');
          if (R() < 0.3) { s2.injury = 'laceration'; TB.stat('health', -12); TB.flag('VELA_CLIMB_PRICE'); }
          TB.stat('energy', -14); TB.bond(8); }, go: 'q_vela_2' },
      { t: '🪨 Work it from below — stones, precisely, on the exposed traverse.', sub: 'Safer. It only needs to decide today\'s climb costs too much.',
        do: (s) => { TB.flag('Q_VELA_EGGS'); TB.flag('VELA_STONED'); TB.stat('energy', -8); TB.bond(5); }, go: 'q_vela_2' },
      { t: '🐟 Bait it down — a fish cache where it can\'t resist breaking off.', sub: 'Costs your best catch. Bloodless. It will remember the easy meal.',
        do: (s) => { const s2 = TB.state; TB.flag('Q_VELA_EGGS'); TB.flag('VELA_BAITED'); if (s2.food > 0) s2.food -= 1; TB.stat('hunger', -5); TB.bond(5); }, go: 'q_vela_2' },
    ],
  });
  TB.scene('q_vela_2', {
    bg: 'cliff-camp', who: WHO.vela,
    text: (s) => [
      TB.is('VELA_CLIMB_PRICE') ? 'You climb, and the cliff charges you for it — a handhold that isn\'t, a long scrape of rock through your forearm — but you get there: wedged onto the traverse below the ledge, alpenstock in hand, exactly where six feet of reptile does not expect the vertical world to contain a shouting primate. The negotiations are brief and physical. The monitor concedes the cliff.' :
      TB.is('VELA_STONED') ? 'You work it like artillery: ranging shot, correction, then a steady rain of fist-sized stones onto the one exposed traverse it must cross. Monitors are patient, not stupid. It hangs there recalculating for a full minute — Vela screaming her contribution above — then flows back down the crag, unhurried, filing the route under CLOSED.' :
      'You lay the bribe where its nose must find it — your best smoked catch, an unmissable windfall on a flat stone at the crag\'s foot — and appetite does the arithmetic you knew it would: a sure meal below beats contested eggs above. It descends, dines, departs. Vela watches it eat your fish with an expression you can only call itemized.',
      'The eggs hold. Two of them, pale and enormous, warm in the high nest\'s wind-shadow — and Vela lands beside them, mantles once over her unstolen future, then turns the amber eye on you, down on your ledge, for a long, recalibrating moment.',
      'She doesn\'t bring you a fish that evening. She brings you TWO — and stands over them on the high stone until you\'ve seen the count. Whatever ledger she keeps you in, you have just been moved to a page she reserves for very few living things.',
    ],
    next: (s) => backToCamp(s),
  });
  TB.scene('q_vela_3', {
    bg: 'cliff-camp', who: WHO.vela,
    text: [
      'The finding-cry again at dawn — but pitched entirely differently, and when you make the cliff shoulder you understand: the eggs have become a PROBLEM, and the problem has feathers.',
      'One chick. Huge-footed, gray-downed, cavernously loud, ugly in the way only raptor chicks achieve — a gargoyle made of appetite — and alive, and hers, and (she makes this immediately, unmistakably clear by the way she looks from the chick to you to the chick) now also somehow YOURS.',
      'You spend the morning on the ledge as designated perch, wind-block, and audience while Vela runs the fish relay, and the gargoyle screams at you between deliveries with total confidence in your relevance. Somewhere in hour two, it falls asleep against your boot.',
      'The old sea eagle watches that happen from the nest rim — her blind side toward the sea, her good eye on the small gray heap snoring on your foot — and makes, quietly, a sound you have never heard from her. It is not a transaction sound. There is no entry for it in any ledger. You both pretend it didn\'t happen, and it changes everything.',
    ],
    enter: (s) => { if (!TB.is('Q_VELA_DONE')) { TB.flag('Q_VELA_DONE'); TB.flag('HATCHLING'); TB.bond(8); TB.stat('hope', 6); } },
    next: (s) => backToCamp(s),
  });

  // ==================================================================
  //  BURI — THE ROOT CELLAR
  // ==================================================================
  TB.scene('q_buri_1', {
    bg: 'jungle', who: WHO.buri,
    text: [
      'Buri\'s digging breaks through into NOTHING — and the nothing has cold breath.',
      'It happens at the old terrace line where he\'s been excavating his usual agriculture of destruction: a forefoot punches through, he startles backward with a squeal of pure affront, and where his leg went is a black gap exhaling cool, still, mineral air. You clear the edge with your hands: cut stone. A lintel. STAIRS, going down under the terrace wall, packed with five centuries of soil and root.',
      'The Kaari sealed this. Deliberately — the top of the stair is blocked with fitted stones, laid by hands that meant to come back.',
      'Buri looks from the hole to you with his ears all the way forward, doing the thing he does when the world turns out to contain more buried food than previously believed. You go get the digging stick, the pry pole, and the torch. Some partnerships are simply fated.',
    ],
    enter: (s) => { if (!TB.is('Q_BURI_ACTIVE')) { TB.flag('Q_BURI_ACTIVE'); TB.route('depth', 1); } },
    next: (s) => backToCamp(s),
  });
  TB.scene('q_buri_2', {
    bg: 'jungle', who: WHO.buri,
    text: (s) => {
      if (!TB.is('Q_BURI_STAGE')) {
        return ['The first day of excavation is brute archaeology: you on the pry pole, Buri as the entire earthmoving department, fitted stone after fitted stone levered up and shouldered aside until the stair stands open — eight steps down into a chamber the size of your shelter, dry as the day it was sealed.',
          'A root cellar. THE root cellar: stone shelves in ranks, and on them, sealed clay jars by the dozen — most cracked and long surrendered, but a stubborn number still whole, wax-and-resin sealed, and when you crack the first one the smell that rises is impossibly, gloriously, FOOD: fermented breadfruit paste, five hundred years old and, by every test you dare, still what it was meant to be. Preserved against a famine that came and went half a millennium ago, waiting for descendants who went into the mountain instead.',
          'You carry up an armload of the sound jars. Buri carries up, by actual count, nine, and eats the contents of a cracked tenth with the reverence of a pilgrim. There is a further chamber behind a second sealed door at the back. Tomorrow.'];
      }
      return ['The back chamber is smaller, drier, and holier — you feel it before the torchlight explains it.',
        'Gourds. Ranks of clay-sealed gourds, each one labeled with a pressed-in glyph you recognize from the stones — and inside the first, packed in ash and utterly dry: SEED. Rice that isn\'t Halcyon\'s rice; taro crowns desiccated to stone; beans in colors the island no longer grows. A seed vault. The Kaari\'s hedge against the end of their world — laid down in the very years the mountain was breaking, by farmers who sealed their future underground before walking into the caldera.',
        'And on the lowest shelf, alone, deliberately placed: a child\'s toy. A carved wooden boar, tusked and bristled and worn smooth by small hands, left facing the door. Guarding the seeds. Someone\'s child put their bravest thing on watch before the family climbed.',
        'Buri noses it once, very gently — gentler than you have ever seen him touch anything — and then stands aside while you lift it. You put it back, in the end, exactly where it stood. Still on watch. But the seed gourds come up into the light, and if this island ever grows those colors again, it will be because a pig broke into the right nothing.'];
    },
    enter: (s) => {
      if (!TB.is('Q_BURI_STAGE')) { TB.flag('Q_BURI_STAGE'); TB.state.food += 3; TB.stat('hunger', 10); TB.route('roots', 2); TB.bond(4); }
      else if (!TB.is('Q_BURI_DONE')) { TB.flag('Q_BURI_DONE'); TB.flag('KAARI_SEEDS'); TB.route('roots', 2); TB.route('depth', 2); TB.bond(6); TB.stat('hope', 4); }
    },
    next: (s) => backToCamp(s),
  });

  // ==================================================================
  //  MOA — THE FLOCK (and EDDA'S ROOSTER)
  // ==================================================================
  TB.scene('q_moa_1', {
    bg: campBg2, who: WHO.moa,
    text: [
      'Moa has begun recruiting.',
      'It starts as two extra shapes at the fringe — scraggly feral hens, all nerves and bad feathers, shadowing her patrols at a worshipful distance — and by week\'s end it is unmistakably a MOVEMENT: your small copper sergeant drilling her ragged volunteers up and down the treeline, demonstrating (you watch her do it) the correct response to hawk-shadow, the correct reporting of found grubs, the correct attitude toward the perimeter.',
      'The island\'s junglefowl have lived wild and short and terrified for ten thousand generations. Moa has discovered an alternative — the fire, the watch, the alliance with the tall thing — and she is, apparently, DONE keeping it to herself.',
      'She needs infrastructure. She makes this clear by standing pointedly where the coop should go.',
    ],
    enter: (s) => { if (!TB.is('Q_MOA_ACTIVE')) { TB.flag('Q_MOA_ACTIVE'); TB.bond(3); } },
    next: (s) => backToCamp(s),
  });
  TB.scene('q_moa_2', {
    bg: campBg2, who: WHO.moa,
    text: (s) => {
      if (!TB.is('Q_MOA_STAGE')) {
        return ['You build the coop to her specification, which she supplies by inspection and veto: raised on posts (rats), deep eaves (rain), one entrance (defensibility), interior sight-lines (obviously). It is, when finished, the most militarily serious henhouse in the Pacific.',
          'Moa reviews the completed works twice, issues one soft approving note — the ADEQUATE noise, her highest honor — and moves her two recruits in that same dusk, personally, herding them up the ramp like a tugboat docking liners.',
          'Recruitment, her posture announces, will now begin in earnest.'];
      }
      return ['The gathering takes days and is the best comedy the island has ever staged: Moa marching her growing column along the fringe; Moa breaking up a hen fight with the fury of a very small god; Moa personally escorting one hopeless, half-bald straggler the whole way home at a pace the straggler can manage, one deliberate step at a time, and you had something in your eye for that one, and you don\'t care who knows.',
        'Final muster: EIGHT. Eight feral junglefowl, coop-broke and patrol-trained, laying in the boxes like it\'s civic duty — plus one gangly young rooster with ambitious tail feathers and no idea what he\'s doing, whom the hens tolerate and Moa supervises like a project.',
        'Your food problem, the old tyrant of every dawn since the crash, is not merely solved. It is INSTITUTIONALIZED. The eggs arrive daily now in threes and fours, and Moa presides over the whole operation from the coop roof at dusk — the founder, the sergeant, the smallest and most consequential empire-builder on Vessakai.'];
    },
    enter: (s) => {
      if (!TB.is('Q_MOA_STAGE')) { TB.flag('Q_MOA_STAGE'); TB.route('roots', 2); TB.bond(4); }
      else if (!TB.is('FLOCK')) { TB.flag('FLOCK'); TB.flag('Q_MOA_DONE'); TB.route('roots', 2); TB.bond(6); TB.stat('hope', 5); }
    },
    next: (s) => backToCamp(s),
  });
  TB.scene('q_rooster', {
    bg: 'grove', who: EDDA,
    text: [
      'You carry the young rooster up the mountain in Moa\'s old travel basket, and you don\'t announce why, and Edda Voss knows why before you\'re through the fence, because she watches the basket the whole way up her path with her jaw set like mortar.',
      '"No," she says.',
      'You set the basket on her table anyway and open it, and the gangly young rooster hops out, shakes himself into what he plainly believes is magnificence, surveys the grove of the greatest poultry-keeper in this ocean — and crows. Badly. A cracked, earnest, adolescent bugle, delivered with his whole chest, at completely the wrong time of day.',
      'The silence afterward has sixty years in it. Edda looks at the ridiculous bird. The two mounds under the flowering tree hold their peace; the small one most of all.',
      '"…He\'s doing it wrong," she says at last, in a voice you politely ignore the crack in. "Aleksander would\'ve— you don\'t just STAND anywhere and shout, you take the high post, you absolute—" and she\'s up, and she\'s showing the rooster the fence post, actually showing him, hands on either side of him like bookends, and the rooster hops up and crows again — worse — and Edda Voss laughs. Full, helpless, decades-deep. You have never heard her laugh before. You look away from it, the way you\'d look away from someone crying.',
      '"Trouble," she names him, wiping her eyes, daring you to comment. "Because that\'s what he is, and that\'s what you are, bringing him. Now get down my mountain before I remember I\'m unsociable."',
      'From the first switchback you hear him crow again — and hear her, faintly, correcting his form.',
    ],
    enter: (s) => { if (!TB.is('Q_ROOSTER_DONE')) { TB.flag('Q_ROOSTER_DONE'); TB.state.edda = TB.clamp(TB.state.edda + 10, 0, 100); TB.stat('hope', 6); TB.route('roots', 1); } },
    next: (s) => backToCamp(s),
  });

  // ==================================================================
  //  NINE — EIGHT ARMS, THREE TRICKS
  // ==================================================================
  TB.scene('q_nine_1', {
    bg: 'tidepools', who: WHO.nine,
    text: [
      'Nine has decided your apprenticeship should flow the other way.',
      'She makes the proposal the way she makes everything: demonstration. You arrive at the pools to find your fish trap — YOUR trap, hauled from wherever you staked it — sitting on the bottom of her pool, and Nine beside it, and as you watch she runs one arm over its knots, its door, its throat, in exactly the slow deliberate way you check a line: <em>studying the tool</em>. Then she looks up at you, taps the trap once, and waits.',
      'It lands on you slowly and completely: she has watched you use tools for a month, and she has understood the CATEGORY, and she wants in. Not food. Not play. <em>Instruction.</em>',
      'You sit down at the pool\'s edge with your heart going strangely, because you are fairly sure no human being has ever been exactly here before: choosing a curriculum for a student with nine brains, three hearts, and no bones — who will remember every lesson for the whole of her bright, brief life, and teach it, perhaps, to no one. Or to everyone.',
      'Choose carefully. She never un-learns.',
    ],
    enter: (s) => { if (!TB.is('Q_NINE_ACTIVE')) { TB.flag('Q_NINE_ACTIVE'); TB.route('depth', 1); } },
    next: (s) => backToCamp(s),
  });
  TB.scene('q_nine_2', {
    bg: 'tidepools', who: WHO.nine,
    text: ['You settle at the pool with today\'s lesson in mind. She rises to meet you, arms already reaching for the materials, the slotted eye bright with the thing you have no better word for than enrollment.', 'What do you teach her?'],
    choices: (s) => {
      const c = [];
      const done = (k, fl, go2) => () => { const s2 = TB.state; TB.flag(fl); s2.flags.NINE_TRICKS = (s2.flags.NINE_TRICKS || 0) + 1; TB.bond(4); TB.route('depth', 1); };
      if (!TB.is('NINE_T_TRAP')) c.push({ t: '🪤 The trap-line trick', sub: 'Set, check, and re-bait the fish traps. Turn her patrols into your harvest.',
        do: done('trap', 'NINE_T_TRAP'), go: 'q_nine_3' });
      if (!TB.is('NINE_T_KNOT')) c.push({ t: '🪢 The knot trick', sub: 'Hitches and lashings. Eight arms that can moor, secure, and — eventually — untie anything you can tie.',
        do: done('knot', 'NINE_T_KNOT'), go: 'q_nine_3' });
      if (!TB.is('NINE_T_LEVER')) c.push({ t: '🪵 The lever trick', sub: 'Mechanical advantage. The drowned world is full of wedged and stubborn things.',
        do: done('lever', 'NINE_T_LEVER'), go: 'q_nine_3' });
      if (!TB.is('NINE_T_LIGHT') && TB.is('HEARTGLASS')) c.push({ t: '💡 The light trick', sub: 'The heartglass shard glows brighter for warm hands — and, it turns out, for careful arms. Give her a lantern for the deep places.',
        do: done('light', 'NINE_T_LIGHT'), go: 'q_nine_3' });
      return c;
    },
  });
  TB.scene('q_nine_3', {
    bg: 'tidepools', who: WHO.nine,
    text: (s) => {
      const n = s.flags.NINE_TRICKS || 0;
      const lessons = {
        1: 'The lesson takes three tides and then it takes FOREVER, in the way of everything she learns: total, casual, hers. By week\'s end she runs the routine better than you do, with improvements you didn\'t teach and can\'t quite follow.',
        2: 'The second lesson goes faster — she has your pedagogy mapped now, anticipates the steps, corrects YOUR demonstration once (she is right). You are less her teacher every session and more her colleague, and you suspect she planned that arc from the start.',
        3: 'The third lesson she treats almost as ceremony: unhurried, exact, one long dusk of it — and at the end she does each of the three tricks once, in order, a little graduation she has clearly choreographed, and then rests one arm on your wrist for a long while, and the curriculum is complete.',
      };
      const t = [lessons[Math.min(n, 3)] || lessons[1]];
      if (n >= 3 && !TB.is('Q_NINE_DONE')) {
        t.push('It\'s a week later that you see the thing you will be turning over for the rest of your life.',
          'Low tide, the far pools, and Nine is not alone: a second octopus — smaller, wilder, one of the reef\'s own — hangs in the water at a wary distance, watching her. And Nine, patient as tide, is running your trap-line routine on an empty trap. Slowly. Demonstratively. <em>Teaching it.</em>',
          'The wild one bolts, that first time. But you saw what you saw: the lesson leaving the classroom. Whatever you gave her isn\'t YOURS anymore, or even hers. It\'s the island\'s now, moving outward through the reef\'s bright network of nine-brained attention, on a timescale that has nothing to do with you.',
          'Edda\'s voice in your memory, dry as bark: <em>"Sixty years I have waited for one of them to pick a person."</em> You begin to wonder, with a prickle down your spine, what the reef is breeding toward — and what it will know in another sixty.');
      }
      return t;
    },
    enter: (s) => { if ((s.flags.NINE_TRICKS || 0) >= 3 && !TB.is('Q_NINE_DONE')) { TB.flag('Q_NINE_DONE'); TB.flag('REEF_LEARNS'); TB.route('depth', 2); TB.stat('hope', 4); } },
    next: (s) => backToCamp(s),
  });

  // ==================================================================
  //  THE DARK DOORS — despair, offered once, at the bottom of the night
  // ==================================================================
  TB.scene('ev_despair', {
    bg: 'beach-night',
    text: (s) => [
      'You can\'t sleep, and tonight you stop pretending the reason is noise.',
      'It has been building for days — you\'ve felt it the way you feel weather now: the tasks getting heavier while meaning nothing, the horizon you\'ve stopped checking, the fire you feed out of habit rather than argument. Tonight it arrives whole and sits down across from you, patient, unhurried, like the island\'s other tide:',
      '<em>What if you just… stopped keeping the days?</em>',
      'Not dying. Nothing so decisive. Just — setting down the count. Letting the ledger blur. Walking into the green some morning without a plan to walk out, and letting Vessakai fold over you the way it folded over the terraces, the station, the Rosa and all her crew.',
      s.companion ? 'By the banked fire, ' + ({ kavi: 'Kavi', ipo: 'Ipo', vela: 'nothing — Vela sleeps on her far snag, and her absence is part of tonight\'s arithmetic', buri: 'Buri', moa: 'Moa', nine: 'nothing — Nine keeps her black water, and even she feels far tonight' }[s.companion]) + (s.companion === 'vela' || s.companion === 'nine' ? '.' : ' shifts in sleep — one small warm fact against the whole enormous dark.') : 'The fire ticks. Coco watches from his shelf, three pores of patient attention, and for once has nothing.',
      'The night waits for your answer. It is not in a hurry. It is never in a hurry.',
    ],
    choices: (s) => [
      { t: '🕯️ Name one thing for the morning. Out loud. Then sleep.', sub: 'One thing. That\'s the whole discipline. That\'s always been the whole discipline.',
        do: () => { TB.stat('hope', 8); TB.flag('DESPAIR_REFUSED'); }, go: 'night2' },
      { t: '🌫️ Stop keeping the days.', sub: 'Set down the count. Let the green have the rest.',
        do: () => { TB.state.deathCause = 'despair'; }, go: 'death' },
    ],
  });
})(window);
