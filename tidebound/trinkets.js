/* =====================================================================
 * trinkets.js — BEACH-FINDS & THE CANTEEN. The island starts tipping
 * its guests: little discoveries salted through ordinary work.
 *
 * HOW FINDS HAPPEN — one hook, everywhere: every camp chore and every
 * Wayfinder expedition funnels through the act_result scene, so this
 * file wraps act_result.enter (reload-guarded via s.lastFind) and rolls
 * a find themed by s.out.bg — the tide line gives sea-things, the mud
 * gives old things, the leaf-litter gives green things. Finds live in
 * s.trinkets (per-run, they're physical objects in THIS life), pay +3
 * hope on the spot, and collect in the 🎒 backpack's Beach-finds shelf.
 *
 * PAYOFFS: Edda notices certain old things (a '🎁 take it up to Edda'
 * hub action, one gift per trip, each paid once); the Kaari at the
 * temple recognize the truly old ones (flag-guarded beat in ch6); the
 * first thing the shore ever gives you is the CANTEEN — two cold sips
 * carried on your hip, refilled free any time an action touches
 * running water (Silverthread hauls, river/grotto expeditions).
 * Loads LAST so its ch3Actions decoration wraps the whole chain.
 * =================================================================== */
(function (G) {
  'use strict';
  const TB = G.TB;
  const TK = (TB.Trinkets = {});

  // ---- the catalog ----------------------------------------------------------
  // src: shore (wrack line) · wade (shallows underfoot) · mud (banks &
  // mangrove) · forage (leaf-litter) · deep (the old world's litter).
  // edda: her reaction when you carry it up the mountain (paid once).
  // old: the Kaari know it at the temple. min: earliest chapter.
  TK.CATALOG = [
    { id: 'seaglass', e: '🟦', name: 'a lozenge of blue sea glass', short: 'sea glass', src: 'shore', line: 'Fifty years of surf have worn some bottle\'s worst day into something the sky would envy.' },
    { id: 'glassfloat', e: '🟢', name: 'a glass fishing float', short: 'glass float', src: 'shore', line: 'Blown glass, netted in rotten cord, escaped from some fleet a thousand miles and half a century away. It has been at sea longer than you\'ve been alive, and it is UNBROKEN.' },
    { id: 'brassbutton', e: '🔘', name: 'a brass button stamped 1887', short: 'brass button', src: 'shore', line: 'Naval, polished blind by sand. 1887 — the year a ship\'s dog swam ashore with a collar that outlived the ship.',
      edda: '"1887." Edda turns the button in the light for a long time, and when she speaks it\'s softer than you\'ve ever heard her. "The wreck that brought the first dog. Kavi\'s whole line runs back to a night this button was on someone\'s coat." She gives it back like it\'s warm. "The island returns things when it\'s ready. Keep that with the photograph."', efx: (s) => { TB.stat('hope', 6); if (s.companion === 'kavi') s.trust = TB.clamp(s.trust + 6, 0, 100); } },
    { id: 'ambergris', e: '🪨', name: 'a fist of ambergris', short: 'ambergris', src: 'shore', line: 'Grey, waxy, smelling of low tide and, underneath, impossibly, of flowers. Whale-treasure. Somewhere a perfumer would faint.',
      edda: 'Edda weighs the ambergris in one hand, snorts at your ignorance, and trades you for it on the spot — a sealed jar of honey, a string of smoked fish, and the recipe-lecture that comes free with everything. "The bees will want thanking. Not my problem how."', efx: (s) => { s.food = (s.food || 0) + 2; TB.stat('hunger', 18); } },
    { id: 'tinsoldier', e: '🪖', name: 'a tin soldier', short: 'tin soldier', src: 'shore', line: 'Paint gone, rifle bent, standing at attention in the wrack line as if the tide were an inspecting officer. Some child on some coast is seventy years old now and never knew where he went.' },
    { id: 'harmonica', e: '🎼', name: 'a rusted harmonica', short: 'harmonica', src: 'shore', line: 'Four reeds still sound. The chord they make belongs to no key ever written, and the reef seems to lean in when you play it.',
      edda: 'Edda takes the harmonica, wipes it on her sleeve with great ceremony, and plays the worst rendition of anything you have ever heard — eyes closed, entirely unembarrassed, foot keeping time. "Aleksander had one," she says afterward, pocketing it as if that settles the ownership question. It does.', efx: (s) => { TB.stat('hope', 5); } },
    { id: 'whalebone', e: '🐋', name: 'a whale\'s ear-bone', short: 'ear-bone', src: 'shore', line: 'Dense as stone, shaped like a conch dreamed by an engineer. Held to your own ear it doesn\'t give the sea back. It gives something lower. Seven-ish. You put it down carefully.',
      edda: 'Edda holds the ear-bone to her ear so long you start to worry. "Hm," she says at last, which from her is a monograph. "It hears what we hear. Bury it above the tideline, castaway — things that listen deserve to finish doing it." You do. It felt correct.', efx: (s) => { TB.stat('hope', 4); TB.route('depth', 1); } },
    { id: 'pearl', e: '⚪', name: 'a baroque pearl', short: 'pearl', src: 'wade', line: 'Lopsided, luminous, the size of a pea — an oyster\'s grievance turned into the only wealth on this island that would also be wealth anywhere else.' },
    { id: 'cowrie', e: '🐚', name: 'a golden cowrie', short: 'cowrie', src: 'wade', line: 'Collectors have wept over these. It sits in your palm like a drop of poured sun, and the finding of it, you realize, has fixed your whole afternoon.' },
    { id: 'sharktooth', e: '🦷', name: 'a fossil shark tooth', short: 'shark tooth', src: 'wade', line: 'Serrated, heavy, older than the island itself — the sea\'s way of mentioning that it has been doing this for a very, very long time.' },
    { id: 'anchorring', e: '⚓', name: 'a wrought-iron anchor ring', short: 'anchor ring', src: 'wade', line: 'Hand-forged, sea-fattened with rust, torn from some cable in some storm nobody survived to log. It is astonishingly heavy. You keep it anyway. It kept somebody once.' },
    { id: 'netneedle', e: '🪡', name: 'a whalebone net needle', short: 'net needle', src: 'mud', line: 'Carved, worn silk-smooth by a working lifetime of hands, dropped in the mud a century before your grandparents met.',
      edda: 'Edda goes still when she sees the net needle — then holds out her hand, imperious. "My mother had one. Island women all did, where I\'m from." She mends the demonstration into your fishing gear on the spot, fingers remembering forty years ahead of her eyes, and sends you home with the needle AND the skill.', efx: (s) => { TB.stat('hope', 4); s.flags.NET_MENDED = true; } },
    { id: 'potsherd', e: '🏺', name: 'a spiral-marked potsherd', short: 'potsherd', src: 'mud', old: true, line: 'Fired clay, rim of a bowl, and around it — unmistakable, your breath actually stops — the seven-spiral, drawn by a thumb that has been dead for centuries and is somehow still perfectly legible.',
      edda: 'Edda looks at the potsherd and does NOT touch it, which tells you more than an hour of her talking. "Not mine to handle. Not yours to keep, either — but you knew that." A long look up toward the broken crown. "You\'ll know who to show it to, when the mountain gets around to introducing you."', efx: (s) => { TB.stat('hope', 3); TB.route('depth', 1); } },
    { id: 'arrowhead', e: '🏹', name: 'an obsidian arrowhead', short: 'arrowhead', src: 'forage', old: true, line: 'Knapped volcanic glass, edge still eager after centuries in the leaf-litter. Someone stood exactly here, once, and loosed at dinner, and missed, and the island kept the miss for you.' },
    { id: 'driftidol', e: '🗿', name: 'a drift-carved boar idol', short: 'boar idol', src: 'mud', old: true, line: 'Palm-sized, tusked, polished by generations of worried thumbs. Whoever carved it knew boars the way you are coming to know them: as weather with opinions.',
      edda: 'Edda turns the little boar idol over twice. "Kaari work. Travel-charm — you carried one so the King\'s people would read your manners at a distance." She sets it in your palm facing OUTWARD, deliberately. "Wear it on the fence-line side. Old politeness still counts inland."', efx: (s) => { TB.stat('hope', 3); s.flags.IDOL_SET = true; } },
    { id: 'beetlewing', e: '🪲', name: 'a jewel-beetle wing case', short: 'beetle wing', src: 'forage', line: 'Metallic green-gold, harder than it has any right to be, glittering in the litter like a coin minted by the jungle for the jungle\'s own economy.' },
    { id: 'orchid', e: '🌸', name: 'a ghost orchid', short: 'ghost orchid', src: 'forage', line: 'White past white, blooming in deep shade for an audience of nobody. You take one bloom of five and press it flat, feeling both like a thief and like the only honest witness it will ever get.',
      edda: 'Edda opens a drawer without a word and produces a book — ILSA\'s book, pressed flowers going back fifty years — and slots your ghost orchid onto the first empty page. Her hand rests on it a moment. "She never found one," Edda says. "Now she has." You are not invited to comment on her eyes.', efx: (s) => { TB.stat('hope', 6); } },
    { id: 'figamber', e: '🟠', name: 'a lump of fig-tree amber', short: 'amber', src: 'forage', line: 'Honey-colored, warm in the hand — and inside, wings forever half-open, a bee that has been almost home for ten thousand years.' },
    { id: 'boneflute', e: '🦴', name: 'a cracked bone flute', short: 'bone flute', src: 'deep', old: true, line: 'Five holes, split down its length, silent forever. The spacing of the holes is strange until you count them against the Hum, and then it is not strange at all.' },
    { id: 'surveybadge', e: '🎖️', name: 'a Halcyon survey badge', short: 'survey badge', src: 'deep', line: 'Enamel and brass: PROJECT HALCYON — SITE SURVEY, a serial number, and a name worn down to two letters. Somebody clipped this on every morning of the good season, before the word "incident" meant anything.',
      edda: 'Edda reads the survey badge\'s serial number once and hands it back fast, like it\'s hot. "Kim. Hydrology." A long silence with weather in it. "Put it in the station with the recorder, castaway. People belong with their work." You do, later, and the station feels — settled — after.', efx: (s) => { TB.stat('hope', 4); s.flags.BADGE_HOME = true; } },
    { id: 'compassrose', e: '🧭', name: 'a broken brass compass card', short: 'compass card', src: 'deep', line: 'The needle is long gone, which — on this island — arguably makes it the only accurate compass you own.' },
    { id: 'raindrop', e: '💧', name: 'a bead of storm-glass', short: 'storm-glass', src: 'forage', min: 5, line: 'Fulgurite: lightning\'s signature, fused into the wet sand of some monsoon before this one. The season signs its work. You are living inside the pen.' },
  ];

  const my = (s) => s.trinkets || (s.trinkets = {});
  TK.count = (s) => Object.keys(my(s)).length;

  // ---- where does this backdrop find things? --------------------------------
  const SRC_BY_BG = {
    'beach-day': 'shore', 'beach-dusk': 'shore', 'beach-night': 'shore', 'ocean-night': 'shore',
    tidepools: 'wade', river: 'mud', mangrove: 'mud',
    jungle: 'forage', 'jungle-night': 'forage', 'camp-fringe': 'forage', grove: 'forage', 'cliff-camp': 'forage',
    station: 'deep', gullet: 'deep', temple: 'deep', caldera: 'deep',
  };
  const INTRO = {
    shore: 'The tide has left something on the wrack line: ',
    wade: 'Your foot finds something in the shallows that is not a stone: ',
    mud: 'The mud gives up something smooth: ',
    forage: 'Under the leaf-litter, a glint: ',
    deep: 'In the old world\'s litter, half in shadow: ',
  };

  // ---- the one hook: act_result carries every chore and expedition ----------
  const AR = TB.SCENES.act_result;
  const prevEnter = AR.enter;
  AR.enter = function (s) {
    if (prevEnter) prevEnter(s);
    if (!s.out || !s.out.text) return;
    const key = s.day + '.' + s.seg + '.' + String(s.out.text[0] || '').slice(0, 24);
    if (s.lastFind === key) return; // reload-safe: same result re-entered
    s.lastFind = key;
    const bg = s.out.bg;
    // running water refills the canteen, free, every time
    if ((bg === 'river' || bg === 'gullet') && TB.has('canteen') && (s.canteenSips | 0) < 2) {
      s.canteenSips = 2;
      s.out = Object.assign({}, s.out, { text: s.out.text.concat(['🍶 You hold the canteen under the cold run until it overflows, and cap it, and feel briefly, unreasonably wealthy: <em>water, portable, yours.</em>']) });
    }
    if (s.out.go) return; // story-routed results (quests, perils) keep their focus
    const src = SRC_BY_BG[bg];
    if (!src || Math.random() > 0.22) return;
    // the sea's first gift is always the useful one
    if (src === 'shore' && !TB.has('canteen')) {
      TB.item('canteen'); s.canteenSips = 0; TB.stat('hope', 4);
      s.out = Object.assign({}, s.out, { text: s.out.text.concat(['✨ ' + INTRO.shore + '<em>a steel canteen</em>, dented, cork long gone, some sailor\'s day ruined decades back — but the threads still hold and the seams ring true. Fill it at running water and thirst becomes a thing you carry answers to. <span class="tkNote">(kept — 🎒)</span>']) });
      return;
    }
    const pool = TK.CATALOG.filter((t) => t.src === src && !my(s)[t.id] && (!t.min || s.chapter >= t.min));
    if (!pool.length) return;
    const t = pool[Math.floor(Math.random() * pool.length)];
    my(s)[t.id] = true;
    TB.stat('hope', 3);
    s.out = Object.assign({}, s.out, { text: s.out.text.concat(['✨ ' + INTRO[src] + t.e + ' <em>' + t.name + '</em>. ' + t.line + ' <span class="tkNote">(kept — 🎒)</span>']) });
  };

  // ---- the canteen sip + Edda's eye: hub actions ------------------------------
  function drinkAction(s) {
    return {
      t: '🍶 Drink from the canteen' + ((s.canteenSips | 0) > 1 ? '' : ' — last of it'),
      sub: 'Cold running water, no walk required. Costs nothing; refills whenever you touch the river.',
      do: () => {
        const s2 = TB.state;
        s2.canteenSips = (s2.canteenSips | 0) - 1;
        TB.stat('thirst', 26);
        s2.out = { bg: s2.site === 'fringe' ? 'camp-fringe' : s2.site === 'overhang' ? 'cliff-camp' : 'beach-day', text: ['You thumb the cap off and drink standing, two long swallows of the mountain\'s own cold, and the day improves by exactly that much. ' + ((s2.canteenSips | 0) > 0 ? 'A sip still sloshes in the steel.' : 'Empty now — it rings when you tap it. The river will fix that in passing.')] };
        // deliberately no tickSegment: a sip is free
      },
      go: 'act_result',
    };
  }
  const nextGift = (s) => TK.CATALOG.find((t) => t.edda && my(s)[t.id] && !s.flags['TPAID_' + t.id]);

  const prevActs = TB.ch3Actions;
  TB.ch3Actions = function (s) {
    const c = prevActs ? prevActs(s) : [];
    if (TB.has('canteen') && (s.canteenSips | 0) > 0 && s.stats.thirst < 88) c.unshift(drinkAction(s));
    const gift = TB.is('GROVE_OPENED') ? nextGift(s) : null;
    if (gift) c.push({
      t: '🎁 Take the ' + gift.short + ' up to Edda',
      sub: 'She notices old things. Sometimes she pays; she always explains.',
      do: () => {
        const s2 = TB.state;
        s2.flags['TPAID_' + gift.id] = true;
        s2.edda = TB.clamp((s2.edda || 0) + 4, 0, 100);
        TB.stat('energy', -6);
        try { if (gift.efx) gift.efx(s2); } catch (e) {}
        s2.out = { bg: 'grove', text: [gift.edda] };
        TB.tickSegment();
      },
      go: 'act_result',
    });
    return c;
  };

  // ch1's camp keeps its own list — give it the canteen too
  const camp = TB.SCENES.camp;
  if (camp && typeof camp.choices === 'function') {
    const prevChoices = camp.choices;
    camp.choices = function (s) {
      const c = prevChoices(s);
      if (TB.has('canteen') && (s.canteenSips | 0) > 0 && s.stats.thirst < 88) c.unshift(drinkAction(s));
      return c;
    };
  }
})(window);
