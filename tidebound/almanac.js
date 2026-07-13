/* =====================================================================
 * almanac.js — the Field Almanac & collections. Four collectible sets
 * (Kaari glyph stones, Vane's journal pages, Edda's recipes, the
 * photograph's fragments) plus a species almanac with painted portraits
 * and seven "impossible" entries that are Hum lore in disguise.
 *
 * Persistence is CROSS-RUN by design (Driftwood Loops: knowledge
 * carries): 'tidebound.almanac.v1' = { seen:{species}, got:{keys} }.
 * Sightings are written the moment their scene renders (engine calls
 * TB.Almanac.note(sceneId, state) from _go); collectible grants write
 * through immediately too; flag-derived entries (recipes, temple
 * glyphs, Vane's numbered journals) are banked when a run ends.
 * The overlay opens from the 📔 button in the TAB menu.
 * =================================================================== */
(function (G) {
  'use strict';
  const TB = G.TB;
  const AL = (TB.Almanac = {});
  const KEY = 'tidebound.almanac.v1';
  const $ = (id) => document.getElementById(id);

  AL.data = function () {
    try { return Object.assign({ seen: {}, got: {} }, JSON.parse(localStorage.getItem(KEY) || '{}')); }
    catch (e) { return { seen: {}, got: {} }; }
  };
  const save = (d) => { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} };
  AL.markSeen = function (sp) { const d = AL.data(); if (!d.seen[sp]) { d.seen[sp] = true; save(d); } };
  AL.mark = function (key) { const d = AL.data(); if (!d.got[key]) { d.got[key] = true; save(d); } };

  // ---- species ------------------------------------------------------------
  // pred() may read state; scene-sightings arrive via note(). art = file in
  // art/ (companions reuse their portraits). Impossible entries have no art —
  // they render a spiral mark, because some things refuse the page.
  const SPECIES = [
    { id: 'kavi', e: '🐕', name: 'Island Dog', art: 'char-kavi', pred: (s) => s.met.kavi, blurb: 'Storm-grey, burn-scarred, terrible at crabs. Descended — the collar proved it — from a ship\'s dog wrecked here in 1887. Sings with the ridge pack on clear nights.', hint: 'Something hunts crabs on the beach, badly.' },
    { id: 'ipo', e: '🐒', name: 'Long-tailed Macaque', art: 'char-ipo', pred: (s) => s.met.ipo, blurb: 'Thief, tactician, patron of the canopy roads. Pays his debts in kind and his insults in fruit rinds. The troop\'s politics would shame a senate.', hint: 'Your camp inventory has begun to disagree with your memory.' },
    { id: 'vela', e: '🦅', name: 'White-bellied Sea Eagle', art: 'char-vela', pred: (s) => s.met.vela, blurb: 'One-eyed empress of Kestrel Cliffs. Runs the shoreline as a ledger of debts and payments; forgets nothing, forgives at market rates.', hint: 'Something enormous owns the wind off the cliffs.' },
    { id: 'buri', e: '🐗', name: 'Island Boar', art: 'char-buri', pred: (s) => s.met.buri, blurb: 'A warm boulder with opinions. Ribs like a hull, heart like a hearth; audits camps at night and pays rent in excavated crabs.', hint: 'Someone raided the midden and left the site TIDIER.' },
    { id: 'moa', e: '🐔', name: 'Junglefowl Hen', art: 'char-moa', pred: (s) => s.met.moa, blurb: 'Copper, small, storm-proof. The bravest heart on the island by courage-per-ounce mathematics no predator has ever solved.', hint: 'Something small refuses to yield the path.' },
    { id: 'nine', e: '🐙', name: 'Reef Octopus', art: 'char-nine', pred: (s) => s.met.nine, blurb: 'The tide pools\' oldest question. Three hearts, nine brains, one gallery of sorted shells she curates when nobody is watching. Nobody is ever watching.', hint: 'The pools by the point keep being… rearranged.' },
    { id: 'boarking', e: '🐗', name: 'The Boar King', art: 'char-boarking', pred: (s) => TB.is('KING_SEEN') || TB.is('KING_ALLY') || TB.is('KING_FED') || TB.is('KING_TITHED') || TB.is('BOARKING_APPLIED'), blurb: 'The inland dark, incarnate: a boar the size of a cart with a treaty-keeper\'s memory. Rent is a language. Learn it or fence higher.', hint: 'The deep jungle has a landlord. You have not met him. He knows.' },
    { id: 'grin', e: '🐊', name: 'Old Grin', art: 'char-grin', pred: (s) => TB.is('GRIN_MET'), blurb: 'Saltwater crocodile; the mangroves\' one landlord; the oldest patience on the island. His toll is fair, posted, and non-negotiable. Edda\'s advice runs four words.', hint: 'The river ford smells of cold mud and long waiting.' },
    { id: 'hawk', e: '🪶', name: 'Island Hawk', art: 'char-hawk', pred: (s) => s.met.moa, blurb: 'Banded chest, golden eye, the reason junglefowl invented courage. Loses exactly one duel on record — to an opponent one-twentieth its weight.', hint: 'A shadow crosses the clearing and everything goes quiet.' },
    { id: 'heron', e: '🪶', name: 'Reef Heron', art: 'char-heron', pred: () => false, blurb: 'Grey as dawn water, patient as tide. Fishes the glassy pools at first light like a monk keeping an office.', hint: 'Something stands in the dawn shallows without one ripple.' },
    { id: 'whale', e: '🐋', name: 'Humpback Whale', art: 'char-whale', pred: () => false, blurb: 'Passes offshore with the season, singing down where the Hum lives. The two songs are polite to each other. You have heard them take turns.', hint: 'On some far-off days, the horizon breathes.' },
    { id: 'turtle', e: '🐢', name: 'Green Sea Turtle', art: 'char-turtle', pred: (s) => TB.is('TURTLES'), blurb: 'Ancient, unbothered, punctual to beaches by clocks written in her blood. The island keeps her nests the way banks keep vaults.', hint: 'Wide track-marks climb the sand some mornings, and return.' },
    { id: 'crab', e: '🦀', name: 'Scarlet Land Crab', art: 'char-crab', pred: (s) => s.day >= 2, blurb: 'Citizen, laborer, occasional dinner. Runs the beach\'s entire municipal government at knee height. Objects to everything.', hint: 'The beach is administered. Look down.' },
    { id: 'rooster', e: '🐓', name: 'Junglefowl Rooster', art: 'char-rooster', pred: (s) => TB.is('FLOCK') || TB.is('Q_ROOSTER_DONE'), blurb: '"Trouble." Form improving under daily correction. The grove\'s voice, restored after forty years of silence — some medicines cannot be brewed.', hint: 'Somewhere a dawn is going un-announced. This is fixable.' },
    { id: 'moray', e: '🐍', name: 'Dwarf Moray', art: 'char-moray', pred: (s) => s.pools >= 1, blurb: 'No thicker than your thumb; furious about it. Rents a crevice in the third pool and pretends to be a fair landlord. The shrimps know better.', hint: 'Something in the pools is pretending to be furious.' },
    { id: 'tern', e: '🕊️', name: 'Fairy Tern', art: 'char-tern', pred: (s) => s.day >= 3, blurb: 'White as paper, curious as a question. Hovers over your work like a supervisor who has decided, on balance, to let it slide.', hint: 'You are being inspected from above.' },
    { id: 'snake', e: '🌿', name: 'Emerald Racer', art: 'char-snake', pred: () => false, blurb: 'A ribbon of jungle that decided to travel. Harmless, gorgeous, and deeply committed to being mistaken for a vine.', hint: 'One of the vines was watching you back.' },
    { id: 'hornbill', e: '🦜', name: 'Great Hornbill', art: 'char-hornbill', pred: () => false, blurb: 'Arrives like a cargo flight, departs like a rumor. Tithes the fig trees and pays the canopy in seed-fall. Ipo maintains a respectful rivalry.', hint: 'Something big works the fig crowns at midday.' },
    // — the impossible seven: species that shouldn't be on any island —
    { id: 'sevenfish', e: '🌀', name: 'The Counting School', imp: true, pred: (s) => TB.is('DIVED') || TB.is('SEA1') || TB.is('CH5_SEA'), blurb: 'Reef fish that school in sevens. Always sevens. Take one, and somewhere a fish joins to keep the count. No taxonomy admits them. The reef declines to explain.', hint: 'Count the schools on the reef. Then count again.' },
    { id: 'glasseel', e: '🌀', name: 'Heartglass Eel', imp: true, pred: (s) => TB.is('GULLET1') || TB.is('HEARTGLASS') || TB.is('GULLET_MAP'), blurb: 'Transparent but for a seam of light down the spine — the same light the deep galleries bleed. Swims through stone. Or the stone permits it. The distinction may not exist down there.', hint: 'The dark under the mountain has veins.' },
    { id: 'mothstar', e: '🌀', name: 'Compass Moth', imp: true, pred: (s) => TB.is('REV_HUM') || TB.is('TEMPLE_SEEN'), blurb: 'Wing-marks form a perfect compass rose that points true north anywhere on Earth. Here, every one of them points at the mountain. They are not wrong. The mountain is north of something.', hint: 'At dusk, the moths all face the same way.' },
    { id: 'stonecrab', e: '🌀', name: 'Glyph-backed Crab', imp: true, pred: (s) => TB.is('VISION_SEEN') || TB.is('GLYPH1') || TB.is('STONE1'), blurb: 'Carapace-marks that match the temple glyphs, stroke for stroke — including, on one specimen, a glyph the murals do not contain yet. The Kaari do not eat them. Now you know why.', hint: 'Some of the old writing walks.' },
    { id: 'palewhale', e: '🌀', name: 'The Pale Listener', imp: true, pred: (s) => TB.is('OTHER_HEARD') || TB.is('CONTACT_MADE'), blurb: 'Surfaces only in the radio hour, only alone, always facing the island. Bone-white. The hydrophone record shows it holds its breath through the skips — as if it, too, is waiting for the voice.', hint: 'Something else listens on the seventh beat.' },
    { id: 'mirrorbird', e: '🌀', name: 'The Echo Starling', imp: true, pred: (s) => TB.is('FORECAST') || TB.is('SUPERBLOOM'), blurb: 'Sings tomorrow\'s weather, verbatim, a day early. Sailors\' myth on every chart but this one, where it is simply the island being considerate with its bookkeeping.', hint: 'That birdsong this morning: you\'ll hear the weather match it tomorrow.' },
    { id: 'deepvine', e: '🌀', name: 'The Walking Mangrove', imp: true, pred: (s) => TB.is('RIVER_KNOWN') || TB.is('GROVE_OPENED'), blurb: 'A mangrove that is never in the same place twice, surveyed root by root. Either the maps are wrong, or the tree keeps appointments. Edda\'s notes say only: "Leave it be. It\'s counting too."', hint: 'One tree on the river bank has moved. You are sure of it. Almost.' },
  ];

  // scene-id → sighting(s) (engine calls note() on every scene entry)
  const SIGHT = {
    rev_heron: 'heron', rev_snake: 'snake', rev_hornbill: 'hornbill', rev_whales: 'whale',
    rev_hatching: 'turtle', ev_moa: 'hawk', ev2_boarking: 'boarking',
    rev_turtletracks: 'turtle', rev_birdwar: ['hawk', 'tern'], rev_windshift: 'mirrorbird',
    rev_boartrail: 'buri', rev_figriot: 'hornbill',
  };
  const SIGHT_PREFIX = [[/^(ev3_grin|ch3_toll)/, 'grin']];

  // ---- collectible sets -----------------------------------------------------
  const STONES = [
    { key: 'GLYPH1', name: 'Temple Stone I — The Arrival', line: '"We came over water that counted us as we crossed. Nine boats. Nine hundred. One mother waiting."' },
    { key: 'GLYPH2', name: 'Temple Stone II — The Bargain', line: '"She asked no worship. She asked ATTENTION. The pool is where attention is paid."' },
    { key: 'GLYPH3', name: 'Temple Stone III — The Sundering', line: '"The mountain broke its crown so the world would look away. Grief with a purpose is called a veil."' },
    { key: 'STONE1', name: 'Beach Stone — The Crossing Song', line: '"Seven beats: six for the living, one for the door."' },
    { key: 'STONE2', name: 'River Stone — The Keeping', line: '"The mother under the mountain does not sleep. She keeps. Ask the kept how they know: they are still here."' },
    { key: 'STONE3', name: 'Reef Stone — The Ledger', line: '"Feed the reef and the reef remembers. Wound the reef and the reef remembers. There is no third option. There never was."' },
    { key: 'STONE4', name: 'Fog Stone — The Pale Ones', line: '"The pale ones came with instruments, asking the water its weight. We sang them fog. Some of them heard the song inside the fog, and those ones we kept."' },
    { key: 'STONE5', name: 'Stair Stone — The Keeper\'s Test', line: '"A keeper is not chosen. A keeper is the one still kneeling when the tide has asked everyone else to leave."' },
    { key: 'STONE6', name: 'Grove Stone — The Guests', line: '"Feed the guest first. The sea reads tables the way we read skies, and it seats its castaways deliberately."' },
    { key: 'STONE7', name: 'Tide Stone — The Count', line: '"When the count is finished, the door opens from OUR side. Sing the seventh beat kindly. It is somebody arriving."' },
  ];
  const PAGES = [
    { key: 'VANE_J1', name: 'Journal I — Field Notes', line: 'Vane\'s survey hand, still steady: anomaly intervals, tide tables, and the first appearance of the phrase "the seventh interval is not longer. It is DEEPER."' },
    { key: 'VANE_J2', name: 'Journal II — The Station Year', line: 'Halcyon\'s good season: the generators, the arguments, Ilsa\'s instrument taking shape in the east wing. In the margins, someone has drawn the same spiral eleven times.' },
    { key: 'VANE_J3', name: 'Journal III — The Incident', line: 'Water-stained, half legible, wholly changed in tone. "We measured the wound before we understood we had made it. E. was right. E. was right about all of it."' },
    { key: 'PAGE4', name: 'Loose Page — Calibration', line: '"Recalibrated thrice. The instrument is fine. The island is giving different answers to the same question, the way you answer a child differently as it grows. What does that make us?"' },
    { key: 'PAGE5', name: 'Loose Page — The Sponsors', line: 'A carbon copy of a letter never sent: "Meridian\'s money wants a HARBOR here. I have stopped reporting the southern anchorage. Forgive me, or audit me. — V."' },
    { key: 'PAGE6', name: 'Loose Page — Ilsa\'s Margin', line: 'Her hand, not his, correcting his mathematics with visible affection: "Aleksander. Darling. The residual isn\'t error. LISTEN to it."' },
    { key: 'PAGE7', name: 'Loose Page — The Fog Log', line: 'Every aerial survey day, tabulated: fog. Every one. Forty-one attempts, forty-one fogs. The final entry in the column is not a measurement; it is the word "deliberate," underlined twice.' },
    { key: 'PAGE8', name: 'Loose Page — Last Entry', line: '"I no longer believe we found the island. I believe it collected us — as it collects driftwood, and dogs, and the drowned. The question is not how to leave. The question is what we were collected FOR."' },
  ];
  const RECIPES = [
    { key: 'R_TEA', name: 'Feverbark Tea', pred: (s) => TB.is('EDDA_MET'), line: 'Inner bark, stripped at dawn, steeped until the water goes the color of the river. Tastes like punishment; works like forgiveness.' },
    { key: 'R_SALVE', name: 'Green Salve', pred: (s) => TB.is('SALVE'), line: 'Crushed riverweed, rendered fat, and patience. For coral cuts, tusk grazes, and — Edda\'s annotation — "arguments lost to rocks."' },
    { key: 'R_SMOKE', name: 'Ash-Smoked Reeffish', pred: (s) => TB.is('EDDA_LORE1'), line: 'Green wood, low fire, all afternoon. Keeps a week in monsoon, two in the dry. The grove\'s smell on smoking days is the island\'s best argument for staying.' },
    { key: 'R_STEW', name: 'Palm-Heart Stew', pred: (s) => TB.is('EDDA_LORE2'), line: 'One palm heart, one handful of shellfish, one lie about how many chilies. Serves two, or one castaway who has earned it.' },
    { key: 'R_BROTH', name: 'Sickbed Broth', pred: (s) => TB.is('EDDA_TENDED') || TB.is('EDDA_CURED_YOU'), line: 'Fish frames, feverbark, ginger-root, and the part that can\'t be written down: someone has to sit with it, and with you, until it\'s done.' },
    { key: 'R_JAM', name: 'Storm-Jar Fig Preserve', pred: (s) => TB.is('EDDA_WINTER'), line: 'Figs, palm sugar, a sealed jar against the wet season. "Sweetness is a store, same as firewood." — E.' },
  ];
  const FRAGS = [
    { key: 'FRAG1', name: 'Fragment — a corner', line: 'Weathered planking, a harbor bollard, a coil of rope. A pier, somewhere with clean paint and mild weather. The very edge of a photograph you have carried since the plane.' },
    { key: 'FRAG2', name: 'Fragment — a hem', line: 'The hem of a summer dress, mid-turn, caught by the same wind that\'s ruffling the harbor water. Whoever she is, she was moving when the shutter went.' },
    { key: 'FRAG3', name: 'Fragment — a hand', line: 'A hand holding a paper cup, steam still rising. Morning, then. An ordinary, unrepeatable morning of the kind nobody photographs on purpose.' },
    { key: 'FRAG4', name: 'Fragment — the name-board', line: 'Behind her shoulder, the pier\'s name-board, half in frame: KAI—. The rest is out of the picture. You have started testing endings against it in your head.' },
    { key: 'FRAG5', name: 'Fragment — her face', line: 'Laughing, mid-word, at whoever holds the camera. Not posing — arguing, delightedly, with the photographer. You know that exact argument. You have watched Edda have it with a seedling.' },
    { key: 'FRAG6', name: 'Fragment — the date', line: 'On the reverse, in pencil: a date. Monsoon season, nine years gone. The ink of the harbor stamp beside it has run, as if the photograph got wet once and was dried very, very carefully.' },
    { key: 'FRAG7', name: 'Fragment — the doodle', line: 'Beside the date, small, absent-minded, unmistakable: a seven-spiral. Drawn by someone who had seen it somewhere and couldn\'t stop their hand. You would know. Your margins look the same now.' },
    { key: 'FRAG8', name: 'Fragment — the shadow', line: 'On the sunlit boards at her feet: the photographer\'s shadow. Broad shoulders. A case in one hand, chained at the wrist. He was already carrying it, even then. Even there.' },
    { key: 'FRAG9', name: 'Fragment — the inscription', line: 'The last of it, faded to a whisper: "Until the island lets me back — wait for me. — A." And below, in a different hand, newer, pressed hard: "Ninth year. Still waiting. Bringing you home."' },
  ];
  const SETS = { stones: STONES, pages: PAGES, frags: FRAGS };

  const have = (s, key) => !!(AL.data().got[key] || (s && s.flags[key]));
  AL.nextGrant = function (s, set) {
    const list = SETS[set];
    for (const it of list) { if (it.grantable !== false && !have(s, it.key) && !/^(GLYPH|VANE_J)/.test(it.key)) return it; }
    return null;
  };
  AL.remaining = function (s, set) { return AL.nextGrant(s, set) ? true : false; };

  // reload-safe sequential grant for the rev_* find events
  AL.grantFor = function (s, set) {
    const g = s.lastGrant;
    if (g && g.set === set && g.day === s.day && g.seg === s.seg) return g; // scene re-entered on continue
    const it = AL.nextGrant(s, set);
    if (!it) { s.lastGrant = { set, day: s.day, seg: s.seg, none: true }; return s.lastGrant; }
    s.flags[it.key] = true;
    AL.mark(it.key);
    s.lastGrant = { set, day: s.day, seg: s.seg, key: it.key, name: it.name, line: it.line };
    return s.lastGrant;
  };

  // ---- engine hook: sightings + end-of-run banking ---------------------------
  AL.note = function (id, s) {
    const sp = SIGHT[id] || (SIGHT_PREFIX.find(([re]) => re.test(id)) || [])[1];
    if (sp) for (const one of [].concat(sp)) AL.markSeen(one);
    if (id === 'ending' || id === 'death') AL.bank(s);
  };
  AL.bank = function (s) {
    if (!s) return;
    const d = AL.data();
    for (const sp of SPECIES) { try { if (!d.seen[sp.id] && sp.pred(s)) d.seen[sp.id] = true; } catch (e) {} }
    for (const set of [STONES, PAGES, FRAGS]) for (const it of set) if (s.flags[it.key]) d.got[it.key] = true;
    for (const r of RECIPES) { try { if (r.pred(s)) d.got[r.key] = true; } catch (e) {} }
    save(d);
  };

  // union view: banked ∪ this run
  function seenNow(sp) { const s = TB.state; try { return !!(AL.data().seen[sp.id] || (s && sp.pred(s))); } catch (e) { return !!AL.data().seen[sp.id]; } }
  function gotNow(it) { const s = TB.state; return !!(AL.data().got[it.key] || (s && s.flags[it.key]) || (it.pred && s && (() => { try { return it.pred(s); } catch (e) { return false; } })())); }
  AL.counts = function () {
    return {
      species: SPECIES.filter(seenNow).length, speciesTotal: SPECIES.length,
      stones: STONES.filter(gotNow).length, stonesTotal: STONES.length,
      pages: PAGES.filter(gotNow).length, pagesTotal: PAGES.length,
      recipes: RECIPES.filter(gotNow).length, recipesTotal: RECIPES.length,
      frags: FRAGS.filter(gotNow).length, fragsTotal: FRAGS.length,
    };
  };

  // ---- the overlay ------------------------------------------------------------
  const TABS = [['species', '🐾 Species'], ['stones', '🗿 Stones'], ['pages', '📄 Pages'], ['recipes', '🍲 Recipes'], ['photo', '🖼️ The Photograph']];
  let curTab = 'species';

  function entryRow(icon, title, text, dim) {
    const row = document.createElement('div');
    row.className = 'almRow' + (dim ? ' almDim' : '');
    row.appendChild(icon);
    const body = document.createElement('div'); body.className = 'almBody';
    const h = document.createElement('div'); h.className = 'almName'; h.textContent = title;
    const p = document.createElement('div'); p.className = 'almText'; p.textContent = text;
    body.appendChild(h); body.appendChild(p); row.appendChild(body);
    return row;
  }
  function thumb(sp, seen) {
    if (seen && sp.art) { const img = document.createElement('img'); img.className = 'almThumb'; img.src = 'art/' + sp.art + '.webp'; img.onerror = function () { const e = document.createElement('span'); e.className = 'almEmoji'; e.textContent = sp.e; img.replaceWith(e); }; return img; }
    const e = document.createElement('span'); e.className = 'almEmoji'; e.textContent = seen ? sp.e : (sp.imp ? '🌀' : '❔');
    return e;
  }
  function renderTab() {
    const body = $('almBody'); body.innerHTML = '';
    const c = AL.counts();
    const setTab = (list, count, total, completeLine) => {
      let n = 0;
      for (const it of list) {
        const got = gotNow(it);
        const e = document.createElement('span'); e.className = 'almEmoji'; e.textContent = got ? (curTab === 'stones' ? '🗿' : curTab === 'pages' ? '📄' : curTab === 'recipes' ? '🍲' : '🖼️') : '❔';
        body.appendChild(entryRow(e, got ? it.name : '— undiscovered —', got ? it.line : (it.pred ? 'Edda has more to teach.' : 'Keep living. The island leaves these where attentive lives will cross them.'), !got));
        if (got) n++;
      }
      if (n === total && completeLine) { const done = document.createElement('div'); done.className = 'almDone'; done.innerHTML = completeLine; body.appendChild(done); }
    };
    if (curTab === 'species') {
      for (const sp of SPECIES) {
        const seen = seenNow(sp);
        body.appendChild(entryRow(thumb(sp, seen), seen ? sp.name : (sp.imp ? '· · · · · · ·' : '— unmet —'), seen ? sp.blurb : sp.hint, !seen));
      }
    } else if (curTab === 'stones') setTab(STONES, c.stones, c.stonesTotal, '<em>The counting song, whole:</em> six for the living, one for the door — and the door opens from their side. You have the entire hymn now. Sing it at the pool sometime, and watch the water.');
    else if (curTab === 'pages') setTab(PAGES, c.pages, c.pagesTotal, '<em>The journals, complete.</em> Vane\'s whole arc in your hands: surveyor, believer, penitent. Somewhere between page one and the last entry, a man stopped measuring an island and started being measured by it.');
    else if (curTab === 'recipes') setTab(RECIPES, c.recipes, c.recipesTotal, '<em>Edda\'s kitchen, entire.</em> Six recipes and the seventh no card can hold: someone to cook them for.');
    else if (curTab === 'photo') {
      setTab(FRAGS, c.frags, c.fragsTotal, '<em>The photograph, whole.</em> A woman on a pier called KAI—something, nine monsoons ago, laughing at a broad-shouldered man with a case chained to his wrist. He had been here. He spent nine years finding his way back to her promise. And when the island rose off the bow at last, he looked at it — not the water, the ISLAND — and said: <em>"There you are."</em> You carry the photograph now. Whatever you do with the rest of your days here — someone was coming home.');
    }
    // header counts
    $('almCounts').textContent = 'Species ' + c.species + '/' + c.speciesTotal + ' · Stones ' + c.stones + '/' + c.stonesTotal + ' · Pages ' + c.pages + '/' + c.pagesTotal + ' · Recipes ' + c.recipes + '/' + c.recipesTotal + ' · Photograph ' + c.frags + '/' + c.fragsTotal;
    for (const b of document.querySelectorAll('#almTabs button')) b.classList.toggle('sel', b.dataset.tab === curTab);
  }

  AL.open = function () { AL.bank(TB.state); renderTab(); $('almOverlay').classList.remove('hidden'); };
  AL.close = function () { $('almOverlay').classList.add('hidden'); };
  AL.init = function () {
    const tabs = $('almTabs');
    for (const [id, label] of TABS) {
      const b = document.createElement('button'); b.dataset.tab = id; b.textContent = label;
      b.addEventListener('click', () => { curTab = id; renderTab(); });
      tabs.appendChild(b);
    }
    $('almClose').addEventListener('click', AL.close);
    $('almOverlay').addEventListener('click', (e) => { if (e.target.id === 'almOverlay') AL.close(); });
  };
})(window);
