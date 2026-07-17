/* =====================================================================
 * rumors.js — RUMORS ON THE TIDE. The discoverability layer: the island
 * gossips, in-fiction, about the content this player hasn't found yet.
 *
 * HOW IT WORKS — a catalog of rumors, each aimed at one ending the
 * player hasn't reached across ANY run (cross-run check via TB.meta()).
 * Each rumor carries lines in one or more VOICES:
 *   edda  — grove visits + the dawn folk block (she alludes, flintily)
 *   ryo   — the dawn folk block (sailor talk, superstition, salvage)
 *   tide  — the wrack line speaks (camp2, occasional)
 *   night — the player's own wondering at the fire (night2)
 * A rumor retires forever the moment its ending is earned. `when(s)`
 * gates each rumor to the run-state where the hint makes sense — and
 * every line obeys the lore-order law: no unlearned proper nouns.
 * All render hooks are PURE (no state writes) — safe in text functions,
 * reroll-on-reload harmless, per the idle-vignette precedent.
 *
 * The title gallery also asks this file for RIDDLES: one-line teasers
 * for unfound endings, shown as fogged chips ("The tide brings rumors").
 * =================================================================== */
(function (G) {
  'use strict';
  const TB = G.TB;
  const RM = (TB.Rumors = {});
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const earned = (id) => !!((TB.meta().endings || {})[id]);

  // ---- the catalog ----------------------------------------------------------
  // { ending, when(s), lines: { voice: [variants] } }
  RM.CATALOG = [
    { ending: 'LIGHTKEEPER', when: (s) => s.chapter >= 3, lines: {
      edda: ['"There was a light above the cliffs once," Edda says, apropos of a teacup. "Before the station people. Before me. The old ones kept it burning for the sea\'s strays." She looks at you one beat too long. "The stair\'s still there. Legs are the only key."'],
      night: ['On the cliffs\' high shoulder, against the last of the light, you catch an angular silhouette — too regular for stone, too old to be the station people\'s work. Something built. Something that faced the sea on purpose.'],
    } },
    { ending: 'OTHER_SIGNAL', when: (s) => TB.is('RADIO_SURVEYED'), lines: {
      ryo: ['Ryo taps the Kingfisher\'s dead radio set at your mention of the station\'s. "Old operators used to say the sea talks first, if you let it. Crewed with a man once who never broadcast at all — just listened, night after night. Said seven nights was the trick." He shrugs, sailor-superstitious. "Never would say what he heard."'],
      night: ['The radio waits up at the station, and it comes to you, watching the fire: you have only ever thought about what to SAY into it. Never once about what you might hear — if you said nothing, and let the night finish its sentence.'],
    } },
    { ending: 'CRAB_TOWN', when: (s) => s.chapter >= 2, lines: {
      tide: ['On the storm shore this morning, the crabs had arranged themselves in a rough and patient semicircle facing your approach — a civic assembly, visibly short one benefactor. Fed regularly, you suspect, they would formalize the relationship.'],
    } },
    { ending: 'COCONUT_MOGUL', when: (s) => s.chapter >= 2, lines: {
      ryo: ['"Knew a copra trader," Ryo says, watching you crack your morning coconut, "who swore any cargo becomes a KINGDOM at five hundred units. Five hundred." He laughs; then he squints at your palm grove with a broker\'s eye; then he stops laughing.'],
    } },
    { ending: 'LOOP', when: (s) => TB.is('NGPLUS') && !TB.is('LOOP_KNOWN'), lines: {
      night: ['You dream — again — of the gap behind the falls, and of paper in it: a journal, sea-swollen, in a hand you know better than any other hand on earth. You wake with your fingers curled around a pen that isn\'t there.'],
    } },
    { ending: 'THREE_SPRINGS', when: (s) => s.companion === 'nine' && TB.is('GROVE_OPENED') && s.edda >= 35, lines: {
      edda: ['Edda looks toward the tide pools a long time before she speaks. "Sixty years I\'ve waited to watch one of her kind finish what they start. They get three springs, castaway. Three." Her voice does something it almost never does. "Stay for the third, if she\'ll show you. Nobody has ever stayed for the third."'],
    } },
    { ending: 'WHOLE_SKY', when: (s) => s.chapter >= 5 && s.edda >= 50, lines: {
      edda: ['"There is a leaving this island doesn\'t punish," Edda says once, out of nowhere, to her bean rows. "The stones speak of it — a going with the right of return, blessed at the water. Never seen it done." A snort. "Never seen anyone worth blessing try, either."'],
    } },
    { ending: 'FIRST_KAARI', when: (s) => s.chapter >= 4 && (TB.is('GLYPH1') || TB.is('GLYPH2') || TB.is('GLYPH3')), lines: {
      edda: ['"You keep finding the stones," Edda says. It isn\'t a question. "Find the REST, then. Things said in pieces want saying whole — and there\'s a place under the mountain where the whole of it would be heard." She goes back to her rows and will not elaborate.'],
      night: ['The carved stones turn in your memory like keys trying a lock in the dark. Separately they say things. Together — you feel this the way you feel weather coming, now — together, at the right water, in the right place, they would OPEN something.'],
    } },
    { ending: 'DROWNED_DOOR', when: (s) => s.chapter >= 5 && (s.companion === 'nine' || TB.is('GULLET1')), lines: {
      tide: ['At the lowest tide you have ever seen, the water over the deep channel goes strangely still — flat, attentive, like glass laid over a stair. Whatever is down there has been waiting longer than you have been alive, and gives every sign of being willing to wait longer.'],
    } },
    { ending: 'ROSAS_RANSOM', when: (s) => TB.is('CHART_ROSA'), lines: {
      ryo: ['Ryo\'s eyes keep drifting to the north reef while he talks. "If that old chart of yours is honest, there\'s a rich man\'s leaving sitting out there in three fathoms." He rubs the back of his neck. "Rich and haunted, mind. Salvage law is a superstition with paperwork. But rich."'],
    } },
    { ending: 'ALONE_UNBROKEN', when: (s) => !s.companion && s.chapter >= 3, lines: {
      night: ['No one shares this fire, and tonight the fact sits beside you not as a wound but as a summit: somewhere above the treeline of what most people ever attempt. Keep hope banked high enough, all hundred days, and the sunrise at the top of it belongs to a category of one.'],
    } },
    { ending: 'SOUNDER', when: (s) => s.companion === 'buri' && s.chapter >= 4 && s.edda >= 35, lines: {
      edda: ['"That pig of yours will want a herd one day," Edda says, scratching Buri\'s ear like a woman who claims not to like pigs. "When the old tusker inland goes — and he\'ll go; mind WHICH way he goes — the wild ones will need an anchorage. Farms have held stranger harbors."'],
    } },
    { ending: 'TRICKSTER', when: (s) => s.companion === 'ipo' && s.chapter >= 3, lines: {
      night: ['Ipo watches the canopy some evenings like a man reading election returns. There is politics up there — a troop, a matriarch, a whole succession question working itself out in the high roads — and your small showman has, you would swear it, ambitions.'],
    } },
    { ending: 'LAST_PACK', when: (s) => s.companion === 'kavi' && s.trust >= 60, lines: {
      night: ['The pack sings inland and Kavi doesn\'t answer — but his ears file every note. There is a debt out there in those voices, something old and unfinished between him and the ridge, and some night, you suspect, the island will ask the two of you to go and settle it.'],
    } },
    { ending: 'KEEPER', when: (s) => s.chapter >= 5 && (TB.is('WOUND_SEEN') || TB.is('GULLET1')), lines: {
      edda: ['"The pool under the mountain has kept itself for three hundred years," Edda says, and trims the same stem three times. "That is not the same as KEPT. The island has been interviewing, castaway. Sixty years, I\'ve watched it interview." She looks at you, once, level. "It doesn\'t post the position."'],
    } },
    { ending: 'REMAIN', when: (s) => s.chapter >= 5 && s.route && s.route.signal >= 8, lines: {
      night: ['You catch yourself rehearsing the rescue — the ship, the questions, the going — and underneath the rehearsal, quiet as an undertow, a stranger thought arrives: that when the horn finally sounds, a person could simply… step back into the green, and let it pass.'],
    } },
    { ending: 'WIND_TAKES', when: (s) => s.companion === 'vela' && s.chapter >= 5, lines: {
      night: ['The birds have begun their weather-councils on the cliff face — the year turning, an exodus building somewhere in their numbers. When they lift, all of them at once, what will the empress on your ridgepole do? You catch her watching the horizon these nights, doing arithmetic of her own.'],
    } },
    { ending: 'ROOSTER_DAWN', when: (s) => s.companion === 'moa' && TB.is('EDDA_MET'), lines: {
      edda: ['Edda feeds Moa from her hand, which she does for no other living creature on this island, you included. "I kept chickens," she says, curt, and then nothing else for a long while. There is a grief in her grove with feathers on it, and your small brave hen is standing exactly in its doorway.'],
    } },
    { ending: 'HERMIT_HEIR', when: (s) => s.chapter >= 5 && s.edda >= 60, lines: {
      night: ['Edda is old. The thought arrives plainly, without drama, the way island facts do. Sixty years of graves and gardens up that mountain — and no hands after hers. Unless the island has already chosen the hands, and is simply waiting for the two of you to notice.'],
    } },
  ];

  // ---- pure pickers (safe in text functions; no state writes) ---------------
  const eligible = (s, voice) => RM.CATALOG.filter((r) =>
    r.lines[voice] && !earned(r.ending) && (!r.when || r.when(s)));

  RM.line = function (s, voice) {
    const el = eligible(s, voice);
    if (!el.length) return null;
    return pick(pick(el).lines[voice]);
  };

  // the dawn folk block: Edda's and Ryo's voices, whoever's around
  RM.folk = function (s) {
    const vs = [];
    if (TB.is('EDDA_MET')) vs.push('edda');
    if (TB.is('RYO_MET')) vs.push('ryo');
    while (vs.length) {
      const v = vs.splice(Math.floor(Math.random() * vs.length), 1)[0];
      const l = RM.line(s, v);
      if (l) return l;
    }
    return null;
  };

  // ---- gallery riddles -------------------------------------------------------
  // one line per ending, shown fogged in the title gallery while unfound.
  // Law of the land: tease the shape, never name the unlearned.
  RM.RIDDLES = {
    LIGHTKEEPER: 'a light above the cliffs, relit for the sea\'s strays',
    OTHER_SIGNAL: 'seven nights of listening instead of speaking',
    CRAB_TOWN: 'a month of tribute on the storm shore, formalized',
    COCONUT_MOGUL: 'five hundred of anything is a kingdom',
    LOOP: 'a journal behind the falls, in a hand you know',
    THREE_SPRINGS: 'stay for the third spring',
    WHOLE_SKY: 'a leaving the island blesses, with right of return',
    FIRST_KAARI: 'every stone, spoken whole, at the right water',
    DROWNED_DOOR: 'a stair under the stillest tide',
    ROSAS_RANSOM: 'a rich man\'s leaving, three fathoms down',
    ALONE_UNBROKEN: 'a hundred days, hope banked high, and no one to share the fire',
    SOUNDER: 'an anchorage for the wild ones, when the old tusker goes',
    TRICKSTER: 'a succession question in the canopy, resolved',
    LAST_PACK: 'a debt sung from the ridge, finally answered',
    REMAIN: 'when the horn sounds, step back into the green',
    WIND_TAKES: 'when the birds lift all at once, an open hand',
    ROOSTER_DAWN: 'the grief with feathers, given descendants',
    HERMIT_HEIR: 'hands after hers',
    KEEPER: 'the pool has been interviewing',
    COVENANT: 'stood-for at the water, by mountain and grove together',
    TWO_WORLDS: 'a door held closed and a window held open',
    RYO_BOAT: 'two castaways, one patched hull, eleven days of weather',
    SAIL_BLESSED: 'two tickets, and one term the horizon insists on',
    HUM_SILENCED: 'compasses true, and the lagoon dark forever',
    ILSA_ANSWER: 'her last measurement, finished — and given to love, not the world',
    TIDE_PRICE: 'someone must carry the lamp down, and stay',
    COCO: 'he was the only listener',
    ISLANDS_OWN: 'the island keeps one of its own',
    VILLAGE: 'a light on the southern shore, and a table that grows',
    JOIN: 'up the ten thousand stairs, the last time as a visitor',
    CARTOGRAPHER: 'come back with an expedition, and find the island forewarned',
    EMPTY_HORIZON: 'a raft the storm season warned you about',
    LAST_DELIVERY: 'the courier\'s last mile, carried',
    WHAT_REMAINS: 'graves tended, bees kept, grief that stays',
  };

  RM.riddles = function (max) {
    const m = TB.meta();
    const pool = Object.keys(RM.RIDDLES).filter((id) =>
      !(m.endings || {})[id] && TB.CORES && TB.CORES[id]);
    const out = [];
    while (pool.length && out.length < (max || 5)) {
      out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    }
    return out.map((id) => RM.RIDDLES[id]);
  };
})(window);
