/* =====================================================================
 * map.js — THE WAYFINDER. A clickable chart of Vessakai as the
 * exploration hub. The 🗺️ HUD button (live from any camp hub) opens
 * the `wayfinder` scene; the chart IS the picker — tapping a charted
 * region mounts the expedition directly. The old hub scout actions
 * (Green Deep glyph pushes, the mangrove Grin scout, the grove trek)
 * live here now as region-priority behaviors, so the chores list
 * stays camp-specific.
 * Fog of war: regions render as dark silhouettes with '?' until
 * discovered (by chapter, flags, or NG+ carried knowledge).
 * Each region holds a first-visit set-piece and a rotating deck of
 * return finds (tracked in state.visits) — and the collectibles get
 * geography: stones weight to the green and the river, Vane's pages
 * to the station, photograph fragments to the shorelines.
 * =================================================================== */
(function (G) {
  'use strict';
  const TB = G.TB;
  const M = (TB.Map = {});
  const $ = (id) => document.getElementById(id);
  const R = Math.random;
  const pick = (a) => a[Math.floor(R() * a.length)];
  const NAMES = { kavi: 'Kavi', ipo: 'Ipo', vela: 'Vela', buri: 'Buri', moa: 'Moa', nine: 'Nine' };

  // grant helper: returns extra paragraphs for a collectible find, or null
  function grant(s, set, intro) {
    if (!TB.Almanac || !TB.Almanac.remaining(s, set)) return null;
    const g = TB.Almanac.grantFor(s, set);
    if (!g || !g.key) return null;
    return [intro + ' <em>' + g.name + '.</em>', g.line ? '<em>' + g.line + '</em>' : ''].filter(Boolean);
  }

  // ---- the regions -----------------------------------------------------------
  const REGIONS = {
    bay: {
      name: 'Castaway Bay', e: '🏖️', x: 220, y: 266, bg: 'beach-day', sub: 'Your beach — but have you ever walked ALL of it?',
      disc: () => true,
      first: ['You give your own bay the expedition it never got: end to end, headland to headland, at a surveyor\'s pace instead of a survivor\'s. It takes the whole stretch of the day\'s light, and it repays it: the freshwater seep you\'d half-forgotten, the honey-hole in the reef where the mullet stack at slack tide, the wind-shadow behind the second dune where a fire would never gutter.',
        'Strange, to be introduced to your own address. The bay has been keeping things for you all along — it was only waiting for you to stop sprinting past them.'],
      fx1: (s) => { TB.route('roots', 2); TB.stat('hope', 4); },
      deck: [
        { t: 'The wrack line is a market today: good cordage off some far wreck, a float, a hatch-board worth planking. You beachcomb the morning into real wealth.', fx: (s) => { TB.stat('hope', 3); TB.route('roots', 1); return null; } },
        { t: 'You work the reef\'s honey-hole at slack tide and come home heavy: fish for today, fish for the rack, and one insolent oyster for dessert.', fx: (s) => { TB.stat('hunger', 14); s.food += 1; return null; } },
        { t: 'You walk the bay for no reason the Ledger would accept — and the bay, which knows the difference, gives you its best light, its second-best breeze, and an hour where being marooned and being home are the same fact at rest.', fx: (s) => { TB.stat('hope', 5); return (TB.has('photo') ? grant(s, 'frags', 'And sitting with the photograph in the good light, another piece silvers into sense:') : null); } },
      ],
    },
    tidepools: {
      name: 'The Tide Pools', e: '🪸', x: 314, y: 258, bg: 'tidepools', sub: 'Cities at low tide. Citizens with opinions.',
      disc: () => true,
      first: ['You take the pools as a naturalist instead of a scavenger, working the terraces from the barnacle line to the drop-off, and the pools return the compliment by showing off: anemones like buried fireworks, a decorator crab in this season\'s kelp, the moray pretending fury from its crevice, and in the last pool before deep water, sorted shells and stacked stones — the gallery, curated by eight patient arms you don\'t see today, that see you.',
        'You leave a whelk shell at the gallery\'s edge, dealer\'s courtesy. Tomorrow it will be part of the exhibition, or the price of admission. With curators, who can say.'],
      fx1: (s) => { s.pools = (s.pools || 0) + 1; TB.route('depth', 2); if (TB.Almanac) TB.Almanac.markSeen('moray'); },
      deck: [
        { t: 'Low tide bares the far terraces and you go out to the raw edge, where the pools stop being cities and start being embassies of the deep: things with too many arms and lamplight skins, conducting their business in an inch of sky-water.', fx: (s) => { s.pools = (s.pools || 0) + 1; TB.route('depth', 2); return null; } },
        { t: 'You harvest with a curator\'s restraint — limpets here, an urchin there, never twice from one pool — and the reef, which keeps accounts, lets you see the octopus garden\'s new acquisition on your way in: your own lost sinker, displayed prominently.', fx: (s) => { TB.stat('hunger', 12); s.pools = (s.pools || 0) + 1; return null; } },
        { t: 'A heron owns the shallows this morning and you fish beside it in professional silence, matching its patience, losing on points.', fx: (s) => { TB.stat('hunger', 8); if (TB.Almanac) TB.Almanac.markSeen('heron'); return null; } },
      ],
    },
    bonebeach: {
      name: 'Bone Beach', e: '🦴', x: 116, y: 258, bg: 'beach-dusk', sub: 'The storm shore. What the sea files, it files here.',
      disc: () => true,
      first: ['The storm shore past the west point earns its name in the first hundred yards: driftwood bleached to skeleton, whole trees delivered and stripped, wreck-timber from decades of seas — the island\'s filing cabinet, sorted by violence. Everything the ocean means to keep, it keeps here.',
        'You walk it to the far cliffs with your hackles politely raised the whole way. It isn\'t menace. It\'s memory — the crabs administering their bleached republic, the sand full of edges, and under everything the sense of an archive that hasn\'t finished receiving.'],
      fx1: (s) => { TB.route('depth', 1); TB.route('signal', 1); },
      deck: [
        { t: 'The last blow has turned the archive over: new timber up the strand, a fuel can (empty, but the CAN), and a boot — not yours, not recent, philosophically troubling. You salvage the useful and re-file the rest.', fx: (s) => { TB.route('roots', 1); TB.stat('hope', 2); return null; } },
        { t: 'You pay your respects at the crab republic\'s capital and audit the driftwood parliament buildings. Attendance is taken. You suspect you are now in the minutes.', fx: (s) => { TB.stat('hope', 3); if (TB.Almanac) TB.Almanac.markSeen('crab'); return null; } },
        { t: 'You dig where the storm-sand lies freshest, on the archivist\'s hunch that Bone Beach never gives up everything at once.', fx: (s) => { TB.route('depth', 1); return (TB.has('photo') ? grant(s, 'frags', 'In the lee of a great grey log, out of the weather, you sit with the photograph — and the beach\'s strange patience is contagious:') : null); } },
      ],
    },
    fringe: {
      name: 'The Jungle Fringe', e: '🌿', x: 220, y: 214, bg: 'jungle', sub: 'Where beach and green negotiate. Everything begins here.',
      disc: () => true,
      first: ['You walk the whole treeline for once — not foraging, MAPPING: where the game trails enter, where the fig trees stand, where the land drinks and where it drains. The fringe resolves from a green wall into a green DOOR, hinged in a dozen places you now have names for.',
        'By dusk you can close your eyes and walk it in your head. That\'s the whole difference between lost and living somewhere: the map moves inside.'],
      fx1: (s) => { TB.route('roots', 2); TB.stat('hope', 3); },
      deck: [
        { t: 'You run your trapline of knowledge along the fringe: which fig is dropping, which trail is fresh, what the ants are voting. The bag comes home respectable and the map inside gets another hinge.', fx: (s) => { TB.stat('hunger', 12); TB.route('roots', 1); return null; } },
        { t: 'A hornbill works the crowns above you the whole way out and back, your loud unlovely escort, tithing figs.', fx: (s) => { TB.stat('hunger', 8); if (TB.Almanac) TB.Almanac.markSeen('hornbill'); return null; } },
        { t: 'Where a storm took an old tree, the root-plate has lifted a room of earth — and earth on this island has a habit of holding things.', fx: (s) => { const g = grant(s, 'stones', 'Down among the torn roots, cut faces catching the light:'); if (!g) TB.route('roots', 1); return g; } },
      ],
    },
    deepgreen: {
      name: 'The Green Deep', e: '🌳', x: 224, y: 164, bg: 'jungle', sub: 'The interior. It does not negotiate.',
      disc: (s) => s.chapter >= 2,
      first: ['Past the fringe the jungle stops negotiating. The canopy closes like a lid; the light goes green and submarine; the paths are game-made and answer to game logic. You push in a careful spiral, marking your line, and the Green Deep permits it the way the sea permits swimmers — provisionally, on its terms, with its own ideas about depth.',
        'You come out with your line intact, your legs shaking pleasantly, and a new respect for every creature that calls the interior a neighborhood. Something paced you for the middle third. It never showed itself. That, you understand, was the whole message: <em>seen. tolerated. counted.</em>'],
      fx1: (s) => { TB.route('depth', 2); TB.route('roots', 1); TB.stat('energy', -4); },
      deck: [
        { t: 'You push a new spoke into the spiral and the interior pays in kind: a stand of wild ginger, a water-vine gallery, and one clearing where every tree is hung with orchids like a room decorated for someone.', fx: (s) => { TB.stat('hunger', 8); TB.stat('hope', 3); return null; } },
        { t: 'Boar-sign, old and new, and a wallow like a crater: you are traversing the King\'s home counties, and you do it with your tread soft and your tithe-arithmetic ready.', fx: (s) => { TB.route('depth', 1); if (TB.Almanac) TB.Almanac.markSeen('buri'); return null; } },
        { t: 'The interior keeps the island\'s oldest furniture: fallen stones under moss, worked once by hands.', fx: (s) => { const g = grant(s, 'stones', 'You peel the moss back gently, and the strokes are waiting:'); if (!g) TB.route('depth', 1); return g; } },
      ],
    },
    cliffs: {
      name: 'Kestrel Cliffs', e: '🪶', x: 94, y: 172, bg: 'cliff-camp', sub: 'The empress\'s coast. Wind with a view.',
      disc: (s) => s.chapter >= 2 || !!s.met.vela,
      first: ['The west cliffs take a morning to climb and give back the whole world: your bay a bright bite out of the coast, the reef drawn in surf-lines, the mountain wearing its cloud like a hat it will not discuss. Wind owns everything up here — wind, and the eagles who ride it like landlords touring the estate.',
        'You sit at the edge a long time doing the thing cliffs are for: getting exactly large enough to see how small the problems are, and exactly small enough to see how large the world is. Both arrive at once, on the same wind. That\'s the toll and the payment, and you\'ll be back.'],
      fx1: (s) => { TB.route('signal', 2); TB.stat('hope', 4); if (TB.Almanac && s.met.vela) TB.Almanac.markSeen('vela'); },
      deck: [
        { t: 'You work the cliff path with a climber\'s economy, checking the horizon by quarters. Ships: none. Weather: legible. The sea-lanes keep their distance and their smoke, and you keep your watch, and the watching itself steadies something.', fx: (s) => { TB.route('signal', 2); return null; } },
        { t: 'The tern colony is in session on the stacks, ten thousand strong, arguing airspace. A hawk tries the northern approach and is escorted off the docket by committee.', fx: (s) => { TB.stat('hope', 3); if (TB.Almanac) { TB.Almanac.markSeen('tern'); TB.Almanac.markSeen('hawk'); } return null; } },
        { t: 'You gather eggs where the ledges allow it — never twice from one shelf, imperial law — and rob the wind of an hour sitting in the old watcher\'s notch, worn smooth by someone\'s decades of exactly this.', fx: (s) => { TB.stat('hunger', 12); TB.route('depth', 1); return null; } },
      ],
    },
    river: {
      name: 'The River & Ford', e: '🏞️', x: 150, y: 136, bg: 'river', sub: 'The island\'s one honest courier. Mind the landlord.',
      disc: (s) => s.chapter >= 3 || TB.is('RIVER_KNOWN') || TB.is('KNOW_GRIN'),
      first: ['You give the river a full day: down from the falls-line pool by pool, reading it like the road it is — the island\'s one honest courier, carrying mountain news to the sea twice a day and taking the sea\'s mail back on the tide.',
        'At the ford you stop well back and pay the long look that the tea-dark water requires. The landlord does not surface. The landlord does not need to. His terms are posted in the stillness itself, and you check your distance twice and read on: fish-runs, sweet-water seeps, clay banks worth a potter\'s envy, and stones — everywhere, rolled and patient — that the mountain has been mailing downstream for ten thousand years.'],
      fx1: (s) => { TB.flag('RIVER_KNOWN'); TB.route('roots', 1); TB.route('depth', 1); if (TB.Almanac) TB.Almanac.markSeen('heron'); },
      deck: [
        { t: 'The mullet are running the color-line where river meets sea, and you take a respectful tax from the queue.', fx: (s) => { TB.stat('hunger', 14); s.food += 1; return null; } },
        { t: 'You dig the clay bank and come home smeared and rich: pot-clay, hearth-liner, and the specific joy of a material the island simply GIVES.', fx: (s) => { TB.flag('CLAY'); TB.route('roots', 2); return null; } },
        { t: 'The mountain\'s mail has come downstream in the night: rolled stones re-sorted along the gravel bar, and your reading eye is better than it was.', fx: (s) => { const g = grant(s, 'stones', 'One stone in the bar is not river-rolled. It is CUT, and the water has kept it legible:'); if (!g) TB.route('depth', 1); return g; } },
      ],
    },
    mangrove: {
      name: 'The Mangroves', e: '🌫️', x: 318, y: 176, bg: 'mangrove', sub: 'The east\'s drowned forest. Half water, half secret.',
      disc: (s) => s.chapter >= 3,
      first: ['The eastern mangroves are a country with its own physics: forest standing in sea, roots like drowned cathedrals, channels that go somewhere and channels that only pretend to. You pole in on a borrowed tide, and the light goes green-gold and strange, and the usual island noises hand over to frog-parliament and drip and the patient conversation of water with wood.',
        'It is the best larder on the island and the easiest place on the island to stop existing, and it makes no apology for being both. You take crabs and mud-clams and one wrong turn — one — and the wrong turn is the real lesson: in here, attention is the fee, charged continuously.'],
      fx1: (s) => { TB.route('depth', 2); TB.stat('hunger', 10); },
      deck: [
        { t: 'You run the channels at slack water with yesterday\'s wrong turn corrected, and the drowned forest pays out: crabs, clams, a mullet trapped in a root-pen that was practically an invoice.', fx: (s) => { TB.stat('hunger', 14); s.food += 1; return null; } },
        { t: 'Deep in, where the channels stop pretending, a heron rookery rules a flooded clearing — dozens of nests, grey sentries, an entire hidden capital going about its business above the tea-dark water.', fx: (s) => { TB.stat('hope', 4); TB.route('depth', 1); if (TB.Almanac) TB.Almanac.markSeen('heron'); return null; } },
        { t: 'You find claw-marks on a root-buttress, high as your chest, old as rumor — the landlord\'s eastern boundary, filed where tenants can read it.', fx: (s) => { TB.route('depth', 2); if (TB.Almanac) TB.Almanac.markSeen('grin'); return null; } },
      ],
    },
    grove: {
      name: 'Edda\'s Grove', e: '🍵', x: 288, y: 110, bg: 'grove', sub: 'Tea, insults, and the best-tended ground on the island.',
      disc: (s) => TB.is('EDDA_MET') || TB.is('KNOW_EDDA'),
      first: ['You climb to the grove without an errand for once, and Edda — after establishing at length that you have no errand, and auditing the concept — puts you to WORK, which you slowly understand is the honor: the beds weeded side by side, the seedlings pricked out, the compost turned, two people keeping ground together in the oldest arrangement there is.',
        'Tea happens when the work says so, not the clock. You leave with greens, a cutting she pretends is nothing, and the strange warm cargo of having been, for one afternoon, somebody\'s help rather than somebody\'s problem.'],
      fx1: (s) => { s.edda = TB.clamp((s.edda || 0) + 6, 0, 100); TB.stat('hope', 4); TB.stat('hunger', 8); },
      deck: [
        { t: 'A grove day: labor, tea, and Edda\'s running commentary on your technique, your posture, your generation, and — once, sidelong, almost inaudible — your progress, which is apparently \'not entirely hopeless.\' You float home.', fx: (s) => { s.edda = TB.clamp((s.edda || 0) + 5, 0, 100); TB.stat('hope', 4); return null; } },
        { t: 'She teaches with her hands today more than her mouth: graft, tie, seal, the old orchard-craft. You catch her watching you repeat it, and her face doing arithmetic about the future she won\'t name.', fx: (s) => { s.edda = TB.clamp((s.edda || 0) + 5, 0, 100); TB.route('roots', 2); return null; } },
        { t: 'You trade the day\'s catch for the garden\'s surplus and the island\'s best gossip (the junglefowl are feuding; the bees have expanded; the mountain, she says, glancing up without stopping her hands, is \'talkative lately\').', fx: (s) => { TB.stat('hunger', 12); s.edda = TB.clamp((s.edda || 0) + 3, 0, 100); return null; } },
      ],
    },
    station: {
      name: 'Station Halcyon', e: '📡', x: 352, y: 130, bg: 'station', sub: 'Fifty years of questions, filed under dust.',
      disc: (s) => TB.is('STATION_OPENED'),
      first: ['You give the station the systematic sweep it has been quietly demanding: room by room, drawer by drawer, the whole sad clever kingdom of 1970s science inventoried at last. The mess hall\'s frozen calendar. The lab\'s crazed glassware. The bunkroom\'s paperbacks, swollen to bricks, one still bookmarked with a boarding pass.',
        'It stops being spooky somewhere in the second hour and becomes what it actually is: an archive of people who were curious in the wrong direction with the right hearts. You dust the photograph on the office shelf on your way out. Someone should.'],
      fx1: (s) => { TB.route('signal', 2); TB.route('depth', 1); },
      deck: [
        { t: 'You strip and inventory another room: wire, fasteners, a sound capacitor, the small change of civilization that adds up to real money out here.', fx: (s) => { TB.route('signal', 2); return null; } },
        { t: 'The station\'s paper keeps surfacing, drawer by drawer, like the building is dealing you a hand one card at a time.', fx: (s) => { const g = grant(s, 'pages', 'Under the tray-liner of a locked-then-forced desk drawer:'); if (!g) TB.route('signal', 1); return g; } },
        { t: 'You wind the office clock — pointless, perfect — and sit in the operator\'s chair through its first hour of ticking in fifty years, keeping the station company. Somewhere in the walls, the building resettles, like a held breath let go.', fx: (s) => { TB.stat('hope', 4); return null; } },
      ],
    },
    grotto: {
      name: 'The Grotto', e: '🕳️', x: 126, y: 104, bg: 'gullet', sub: 'The breathing gap behind the falls. Respect the tide-clock.',
      disc: (s) => TB.is('GULLET1') || TB.is('GULLET_MAP') || TB.is('KNOW_GULLET'),
      first: ['You visit the grotto mouth in good light with no descent in mind — reconnaissance, and something more like a social call. Behind the waterfall the gap breathes its seven-beat breath, and you sit at the threshold with your lamp unlit, learning the entry the way you\'d learn a face: the handholds, the high-water stains, the exact pitch of the exhale.',
        'You chalk your marks and leave before the tide asks you to. Knowing a door is not opening it. But doors, the island keeps teaching, appreciate being KNOWN.'],
      fx1: (s) => { TB.route('depth', 2); },
      deck: [
        { t: 'You extend the chalk-work at the mouth galleries: tide-lines dated, handholds numbered, a rope cached dry above the reach of any sea you\'ve seen. Whatever the deep asks later, the answer is readier now.', fx: (s) => { TB.route('depth', 2); return null; } },
        { t: 'At the threshold you sit through one full tide-breath with your palm on the stone, counting. The stone counts back. You are almost used to that. Almost.', fx: (s) => { TB.stat('hope', 2); TB.route('depth', 2); return null; } },
        { t: 'Heartglass gravel glitters in the entry pool — shed from below like the mountain losing eyelashes.', fx: (s) => { const g = grant(s, 'stones', 'And among the gravel, one flat worked piece, carried up from galleries no one has walked in centuries:'); if (!g) TB.route('depth', 2); return g; } },
      ],
    },
    caldera: {
      name: 'The Broken Crown', e: '🌋', x: 222, y: 66, bg: 'caldera', sub: '—', locked: true,
      disc: () => true, // visible from everywhere; walkable by no one, yet
      first: [], deck: [],
    },
  };
  M.REGIONS = REGIONS;

  const discovered = (id, s) => { try { return REGIONS[id].disc(s); } catch (e) { return false; } };
  const explorable = (id, s) => id !== 'caldera' && discovered(id, s);

  // ---- run an expedition (from chart taps; the map IS the picker) ----------------
  // ---- companions have history with places -----------------------------------
  const COMP_NOTES = {
    bay: {
      kavi: 'Kavi walks the whole survey at your heel until the old wreck-line, where he stops and sits and waits — the one stretch of his beach he has never once set foot on.',
      moa: 'Moa treats the bay tour as an inspection of outlying provinces, gravely disappointed by each unguarded dune.',
    },
    tidepools: {
      nine: 'Nine is home here, and shows it off shamelessly: doors you can\'t see opened in the rock, a crab produced from nowhere like a coin from an ear, the whole reef performing for its keeper\'s guest.',
      kavi: 'Kavi hunts the shallows beside you with total commitment and zero technique, and comes up dripping, empty-jawed, dignified. Some wars are hereditary.',
      moa: 'Moa patrols the pool rims like a harbormaster, scolding anemones. One closes at her. She logs the insubordination.',
    },
    bonebeach: {
      kavi: 'Bone Beach unsettles most creatures. Kavi walks it like an archivist — nose down among the ribs and wrack, reading the beach\'s long obituary column with professional respect.',
      buri: 'Buri excavates the high wrack with seismic enthusiasm and presents you, at length, with a whale vertebra the size of a stool. It is a gift. You will be carrying it home.',
      ipo: 'Ipo works the wrack line like an estate sale, appraising and discarding, and pockets exactly one thing he refuses to show you.',
    },
    fringe: {
      buri: 'The fringe is Buri\'s pantry and he tours it like a landlord — a rub on this trunk, a nose-flip under that log, rent collected in grubs the whole green mile.',
      ipo: 'Ipo runs the canopy roads above you the entire way, calling down commentary at every fork like a tout who owns the route.',
    },
    deepgreen: {
      kavi: 'The pack\'s trails thread the Green Deep, and Kavi reads each crossing aloud in his own way — a pause, a long nose-write in the air, once a single answered howl from far upslope. Family news.',
      ipo: 'Somewhere past the second ridge Ipo goes quiet and rides low on your shoulder: troop boundary. Whatever treaty governs it, he\'d rather owe you than test it.',
    },
    cliffs: {
      vela: 'This is Vela\'s nation, and crossing into it changes her: she rises off your shoulder-line and takes the high wind like a queen resuming a throne, escorting you along her own coast at altitude.',
      moa: 'Moa spends the whole cliff walk pressed to your boot, one eye on the wheeling specks above — hawk country — and her courage, which never once breaks, costs her visibly the entire time.',
    },
    river: {
      buri: 'The river bank is Buri\'s spa, and no argument survives contact: you conduct the survey; he conducts the mud.',
      nine: 'Nine rides the last brackish pool as far up the river as sea-blood dares, and watches the fresh water beyond like a sailor reading a chart of somewhere she\'ll never berth.',
    },
    mangrove: {
      kavi: 'Kavi will not drink here. The whole drowned forest through, he keeps between you and the channels, hackles in a low permanent ridge, reading the tea-dark water\'s one long word.',
      moa: 'Moa rides your shoulder through the mangroves at full alert and utters not one sound the entire transit — the only place on the island that has ever bought her silence.',
    },
    grotto: {
      nine: 'In the grotto\'s pool Nine becomes a ribbon of light — the heartglass glow runs her skin in slow waves, and she hangs in the blue dark signing something with all eight arms that you are years from reading.',
      kavi: 'Kavi comes into the grotto exactly three body-lengths and no further, and holds the entrance the whole time you\'re inside — not afraid, you\'d swear, so much as OBSERVANT of some very old protocol.',
    },
    caldera: {
      vela: 'Vela will not overfly the crown. She rides the rim wind in one great circle while you climb, always level with you, never above the broken lip — the only ceiling you have ever seen her honor.',
      buri: 'Buri\'s people don\'t come up here, and he makes clear the custom is wisdom: every hundred paces he tests the ground ahead with one hoof, like a sapper who has read the mountain\'s file.',
    },
    station: {
      kavi: 'Kavi tours the station\'s yard stiff-legged, filing fifty-year-old smells under headings only he keeps — and places himself, as always, between you and the E wing\'s heavy door.',
      ipo: 'The station is Ipo\'s cathedral of latches, and he holds himself to a strict devotional order: one drawer per visit, opened with ceremony, contents assessed, verdict rendered.',
    },
  };
  // NG+: places a banked life KNEW arrive pre-remembered on first visit
  const DEJA_VU = {
    mangrove: { know: 'KNOW_GRIN', line: '<em>And under it all, before you ever reach open water: a certainty, old as a scar you don\'t have, of a cold hour and a patient landlord. You have never been here. You slow down anyway.</em>' },
    grotto: { know: 'KNOW_GULLET', line: '<em>Your hands know this dark. Before the lamp even settles you\'ve turned toward the right gallery — a map you never drew in this life, unfolding under your skin.</em>' },
    grove: { know: 'KNOW_EDDA', line: '<em>The kettle, the fence, the two mounds under the flowering tree — you have never seen any of it, and all of it is exactly where you left it.</em>' },
    tidepools: { know: 'KNOW_NINE', line: '<em>You check the third pool first — the gallery pool — before anything has told you it matters. Something eight-armed surfaces, regards you a long moment, and does not startle. As if you were expected. As if you were LATE.</em>' },
    caldera: { know: 'KNOW_SUNDERING', line: '<em>You have dreamed this skyline breaking. Standing under the crown now, whole, you cannot stop seeing the seam.</em>' },
    bay: { know: 'KNOW_ROSA', line: '<em>Looking north along the reef, a word arrives unasked, in old ink, in a hand you have never seen: GOLD. You know exactly which stretch of surf hides her bones.</em>' },
  };

  M.run = function (id) {
    const s = TB.state, Rg = REGIONS[id];
    if (!Rg || Rg.locked) return;
    s.visits = s.visits || {}; // before the story branches — they read it too
    try { if (TB.Audio && TB.Audio.motif) TB.Audio.motif(id); } catch (e) {} // the region's signature phrase
    // regions with story mechanics take priority over the sightseeing decks
    if (id === 'grove' && TB.is('GROVE_OPENED')) { // the real grove scene (tea, Edda, incidents)
      TB.stat('energy', -6); TB.tickSegment(); TB.go('grove'); return;
    }
    if (id === 'deepgreen' && s.chapter >= 3 && !TB.is('GLYPH3')) { runGlyphPush(s); return; }
    if (id === 'mangrove' && TB.is('GRIN_MET') && !TB.is('GRIN_SCOUTED') && !TB.is('CLEARING_DONE3')) { runGrinScout(s); return; }
    if (id === 'grotto' && TB.is('GEMS') && !TB.is('GEMS_RETURNED') && s.chapter >= 4) { runGemsReturn(s); return; }
    if (id === 'cliffs' && s.chapter >= 3 && (s.visits.cliffs || 0) >= 1 && !TB.is('CLIFF_LEDGE')) { runCliffLedge(s); return; }
    if (id === 'cliffs' && s.chapter >= 3 && TB.is('CLIFF_LEDGE') && !TB.is('TOWER_FOUND')) { runTowerFind(s); return; }
    TB.stat('energy', -9);
    const n = s.visits[id] || 0;
    s.visits[id] = n + 1;
    let text;
    if (n === 0) {
      text = Rg.first.slice();
      if (Rg.fx1) { try { const ex = Rg.fx1(s); if (ex) text = text.concat(ex); } catch (e) {} }
    } else {
      const entry = Rg.deck[(n - 1) % Rg.deck.length];
      text = [entry.t];
      if (entry.fx) { try { const ex = entry.fx(s); if (ex) text = text.concat(ex); } catch (e) {} }
    }
    // companions have history with places — the strong pairs get their beat
    const note = s.companion && COMP_NOTES[id] && COMP_NOTES[id][s.companion];
    if (note && (n === 0 || R() < 0.45)) text.push(note);
    else if (n > 0 && s.companion && R() < 0.3) text.push(pick([
      NAMES[s.companion] + ' makes the expedition with you, on ' + (s.companion === 'vela' ? 'the wing' : s.companion === 'nine' ? 'the water-side of every path' : 'point') + ', and the going is better for the company.',
      'You travel accompanied, as always now — and the island reads differently through four eyes than two.',
    ]));
    // NG+: the first arrival somewhere a past life knew arrives already remembered
    if (n === 0 && s.flags.NGPLUS) {
      const deja = DEJA_VU[id];
      if (deja && s.flags[deja.know]) text.push(deja.line);
    }
    s.out = { bg: Rg.bg, text };
    M.hide();
    TB.tickSegment();
  };

  // ported from the old ch3 hub actions — the map is their home now
  function runGlyphPush(s) {
    TB.stat('energy', s.companion === 'kavi' ? -8 : -12); TB.route('depth', 1);
    s.visits = s.visits || {}; s.visits.deepgreen = (s.visits.deepgreen || 0) + 1;
    const g = TB.is('GLYPH2') ? 3 : TB.is('GLYPH1') ? 2 : 1;
    const lines = [];
    if (g === 1) { TB.flag('GLYPH1'); lines.push('Hours in, in the green cathedral dark where the canopy closes like water overhead, you find it: a standing stone the height of your chest, moss-shouldered, carved past weathering with a deep-cut <em>spiral</em> — and around the spiral, rows of smaller marks that are unmistakably, impossibly, <em>writing</em>.', 'People made this. Long-ago people, unhurried people, people with time to carve. You put your palm flat on the spiral' + (s.companion === 'nine' ? ' — the same spiral Nine traced in the sand, and the jungle goes very quiet while you fail to explain that to yourself' : '') + ', and the stone is warm past what the shade should allow.'); }
    else if (g === 2) { TB.flag('GLYPH2'); lines.push('You find the second stone by learning to look: a fallen one this time, half-swallowed, its spiral fern-split but legible. And past it — your breath goes — a <em>terrace wall</em>, dry-laid stone running dead level through the chaos of roots for fifty yards before the jungle takes it back.', 'Fields. These were fields. Someone farmed this island — cleared it, walled it, worked it — long enough ago that hundred-foot trees now stand in the furrows. Where did they go?'); }
    else { TB.flag('GLYPH3'); lines.push('The third stone stands where the land begins to climb toward the broken mountain, and it is different: taller, uncut by weather, its spiral inlaid with something dark and glassy that holds your reflection wrong — a half-beat behind, you\'d swear, like an echo of you.', 'Below the spiral, one line of the old writing has been re-cut — <em>recently</em>. Within years, not centuries. The chisel marks are still bright.', 'Someone still reads these.'); }
    if (!s.companion && R() < 0.3 && !TB.is('BG_ENGINEER')) { TB.stat('energy', -6); lines.push('You lose the way back twice — the Green Deep folds behind you like water — and pay for the shortcut in hours and scratches.'); }
    s.out = { bg: 'jungle', text: lines };
    TB.tickSegment();
  }
  function runCliffLedge(s) {
    // second cliffs expedition finds the egg-ledge — the choice (and THE
    // FALL) live in the cliff_ledge scene (scenes-ways.js)
    TB.stat('energy', -6);
    s.visits.cliffs = (s.visits.cliffs || 0) + 1;
    s.out = { bg: 'cliff-camp', text: ['You work the Kestrel coast further out than you\'ve gone before, past the empress\'s ledge, to where the cliff face bellies over the sea and the wind never once stops talking.'], go: 'cliff_ledge' };
    TB.tickSegment();
  }
  function runTowerFind(s) {
    // third cliffs expedition: the Kaari fire-tower (Keeper of the Light)
    TB.stat('energy', -7); TB.flag('TOWER_FOUND'); TB.route('signal', 1); TB.route('depth', 1); TB.stat('hope', 5);
    s.visits.cliffs = (s.visits.cliffs || 0) + 1;
    s.out = { bg: 'cliff-camp', text: [
      'Past the egg-ledges, on the highest knuckle of the Kestrel coast, you find what the wind has been hiding in plain sight: a <em>tower</em>. Kaari-built, dry-stone, squat as a molar and older than every map — its top course tumbled, its spiral stair choked with nettle and bird-bone, and its crown, when you climb into it, unmistakable: a fire-bowl. A great carved basin, glazed inside with four centuries of soot.',
      'A light-tower. Not for ships to find the island — nothing helps ships find this island — but the other way around: for the island to bring its own boats home through the veil. The counting songs mention it, you realize; Edda\'s stories mention it; the sea\'s strays, the collected, the driftwood people. Somebody used to burn a light for them.',
      'The bowl is intact. The stair can be cleared. The wind up here would feed a fire like a bellows. Somebody could keep this light again.',
    ] };
    TB.tickSegment();
  }
  function runGemsReturn(s) {
    // the courier case's cut heartglass, carried back to the seam it was stolen from
    TB.stat('energy', -8); TB.flag('GEMS_RETURNED'); TB.stat('hope', 6); TB.route('depth', 1);
    s.visits = s.visits || {}; s.visits.grotto = (s.visits.grotto || 0) + 1;
    s.out = { bg: 'gullet', text: [
      'You take the lead-lined pouch behind the falls at the tide-clock\'s kindest hour, into the breathing dark where the island keeps its veins — twelve cut stones that were shipped out as samples fifty years ago and came home as <em>jewelry</em>.',
      'There is a seam in the grotto\'s far wall where the heartglass runs living and uncut, bleeding its half-beat light. You wedge the stones into it one at a time, deep as your fingers can push, facet against raw vein — wrong shape meeting right place — and you say nothing, because what would you even say. Sorry somebody priced you?',
      'On the twelfth stone the Hum changes. Not louder. <em>Rounder</em> — the way a room changes when the last person expected finally arrives and sits down. The seventh beat, when it comes, holds a half-breath longer than you\'ve ever heard it hold.',
      'You walk out lighter by a pound of stolen light, into rain that feels, briefly and unaccountably, like applause.',
    ] };
    TB.tickSegment();
  }
  function runGrinScout(s) {
    TB.stat('energy', -8); TB.flag('GRIN_SCOUTED'); TB.route('depth', 1);
    s.visits = s.visits || {}; s.visits.mangrove = (s.visits.mangrove || 0) + 1;
    s.out = { bg: 'mangrove', text: ['You spend the hours on high roots with a sightline and an exit, watching the East Passage\'s landlord run his estate. He has habits: the deep channel at the ford is his larder; the mud bar is his throne between the tide\'s offices; and at first light, cold-blooded and logy, he hauls out and does not care to work.', 'Knowledge with teeth in it. A crossing exists inside what you now know — for someone punctual, quiet, and lucky.'] };
    TB.tickSegment();
  }

  // ---- the wayfinder scene (the chart renders INSIDE the panel) ----------------------
  TB.scene('wayfinder', {
    bg: (s) => (s.site === 'fringe' ? 'camp-fringe' : s.site === 'overhang' ? 'cliff-camp' : 'beach-day'),
    text: (s) => {
      const found = Object.keys(REGIONS).filter((id) => explorable(id, s)).length;
      const total = Object.keys(REGIONS).length - 1; // the Crown charts itself, on its own terms
      return ['<em>🗺️ THE WAYFINDER</em> — You spread the working chart, sailcloth and charcoal and a hundred days\' worth of hard-won ink, and weight its corners against the wind. ' + found + ' of ' + total + ' regions charted; the rest of the island waits in outline. An expedition spends this part of the day — <em>tap where it goes.</em>',
        '<span id="mapWrap">' + svg(s) + '<span id="mapHint">Tap a charted region to set out. The silhouettes are still out there.</span></span>'];
    },
    choices: (s) => [
      { t: '↩️ Fold the chart', sub: 'The day\'s other work is waiting.', do: () => M.hide(), go: (s2) => (TB.state.chapter >= 2 ? 'camp2' : 'camp') },
    ],
  });

  // the 🗺️ HUD button is the door — live from any camp hub
  const HUBS = { camp: 1, camp2: 1 };
  const mapBtn = $('mapBtn');
  if (mapBtn) mapBtn.addEventListener('click', () => {
    const sc = TB.state && TB.state.scene;
    if (sc === 'wayfinder') return;
    if (HUBS[sc]) { TB.go('wayfinder'); return; }
    mapBtn.classList.add('mapBtnNo');
    setTimeout(() => mapBtn.classList.remove('mapBtnNo'), 400);
  });

  // ---- the chart itself (SVG overlay, synced to the scene's choices) ------------------
  function svg(s) {
    const regs = Object.keys(REGIONS).map((id) => {
      const Rg = REGIONS[id];
      const disc = discovered(id, s);
      const lock = Rg.locked || !disc;
      const label = !disc ? '?' : Rg.name;
      return '<g class="mapReg' + (lock ? ' mapLocked' : '') + '" data-r="' + id + '">' +
        '<ellipse cx="' + Rg.x + '" cy="' + Rg.y + '" rx="30" ry="17"/>' +
        '<text x="' + Rg.x + '" y="' + (Rg.y + 3) + '" class="mapEmoji">' + (disc ? Rg.e : '❔') + '</text>' +
        '<text x="' + Rg.x + '" y="' + (Rg.y + 30) + '" class="mapLabel">' + label + '</text></g>';
    }).join('');
    // the chart reads as a hand-drawn survey: parchment sea, inked coast,
    // dashed annotation lines — and the generated art carries the same style
    const whole = M.charted(s);
    // the surveyor's habit shows: the most-walked region wears a ring
    let worn = '';
    {
      let best = null, bestN = 3; // needs real traffic before the paper shows it
      for (const id of Object.keys(REGIONS)) {
        const v = (s.visits && s.visits[id]) || 0;
        if (v > bestN) { bestN = v; best = id; }
      }
      if (best) {
        const Rg = REGIONS[best];
        worn = '<ellipse class="mapWornRing" cx="' + (Rg.x + 2) + '" cy="' + (Rg.y + 2) + '" rx="34" ry="20"/>';
      }
    }
    return '<svg viewBox="0 0 440 320" id="mapSvg" role="img" aria-label="Chart of Vessakai">' +
      '<defs>' +
      '<radialGradient id="mgSea" cx="50%" cy="45%" r="78%"><stop offset="0%" stop-color="#e9dab8"/><stop offset="80%" stop-color="#d3ba8d"/><stop offset="100%" stop-color="#bd9d6c"/></radialGradient>' +
      '<linearGradient id="mgLand" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#d9c9a0"/><stop offset="100%" stop-color="#c6b184"/></linearGradient>' +
      '</defs>' +
      '<rect width="440" height="320" fill="url(#mgSea)"/>' +
      '<path d="M60 300 Q 40 240 70 190 Q 50 150 90 110 Q 120 60 180 45 Q 225 25 275 50 Q 340 60 370 110 Q 400 160 375 210 Q 390 250 350 280 Q 300 305 240 296 Q 200 312 150 300 Q 100 310 60 300 Z" fill="url(#mgLand)" stroke="#4a2f16" stroke-width="2" opacity="0.95"/>' +
      '<path d="M60 300 Q 40 240 70 190 Q 50 150 90 110 Q 120 60 180 45 Q 225 25 275 50 Q 340 60 370 110 Q 400 160 375 210 Q 390 250 350 280 Q 300 305 240 296 Q 200 312 150 300 Q 100 310 60 300 Z" fill="none" stroke="#4a2f16" stroke-width="1" stroke-dasharray="2 3" opacity="0.5" transform="translate(3,3)"/>' + // the surveyor's second pass
      // painted chart art (generated; degrades silently to the inked parchment above)
      '<image href="art/bg-map.webp" x="0" y="0" width="440" height="320" preserveAspectRatio="xMidYMid slice" opacity="0.95"/>' +
      '<path d="M180 95 L 222 48 L 264 95 L 240 88 L 222 100 L 204 88 Z" fill="#4a2f1614" stroke="#4a2f16" stroke-width="1.4" opacity="0.8"/>' +
      '<path d="M215 100 Q 190 120 160 132 Q 140 142 128 118" fill="none" stroke="#3c5a6a" stroke-width="1.8" stroke-linecap="round" stroke-dasharray="7 4" opacity="0.55"/>' +
      '<path d="M128 118 Q 110 160 118 210 Q 112 240 118 252" fill="none" stroke="#3c5a6a" stroke-width="1.6" stroke-linecap="round" stroke-dasharray="7 4" opacity="0.5"/>' +
      '<path d="M175 296 Q 220 282 265 294" fill="none" stroke="#3c5a6a" stroke-width="1.8" stroke-linecap="round" stroke-dasharray="2 5" opacity="0.55"/>' +
      worn +
      regs +
      (whole
        ? '<rect x="7" y="7" width="426" height="306" rx="5" fill="none" stroke="#4a2f16" stroke-width="1.6" opacity="0.6"/>' +
          '<rect x="12" y="12" width="416" height="296" rx="4" fill="none" stroke="#4a2f16" stroke-width="0.8" stroke-dasharray="3 3" opacity="0.45"/>' +
          '<text x="12" y="22" class="mapTitle">VESSAKAI — charted whole ✦</text>'
        : '<text x="12" y="22" class="mapTitle">VESSAKAI — the chart so far</text>') +
      '</svg>';
  }
  // the whole chart: every walkable region discovered AND walked (the
  // permanently locked Crown is visible from everywhere, walkable by no one)
  M.charted = function (s) {
    return Object.keys(REGIONS).every((id) => {
      const Rg = REGIONS[id];
      if (Rg.locked) return true;
      return discovered(id, s) && !!(s.visits && (s.visits[id] || 0) >= 1);
    });
  };

  M.chart = svg; // exposed for tests

  // one delegated listener: chart taps click the matching scene choice, so
  // the map and the text choices stay one system (and bots/readers see both)
  $('textLog').addEventListener('click', function (e) {
    const g = e.target.closest && e.target.closest('.mapReg');
    if (!g) return;
    e.stopPropagation(); // a chart tap is not a "next paragraph" tap
    const id = g.dataset.r;
    const hint = $('mapHint');
    if (id === 'caldera') { if (hint) hint.textContent = 'The Broken Crown does not receive visitors. It sends for them.'; return; }
    if (!discovered(id, TB.state)) { if (hint) hint.textContent = 'Uncharted. The island will introduce you when you\'ve earned the introduction.'; return; }
    if (TB.state.scene !== 'wayfinder') return;
    M.run(id); // sets s.out (or routes itself) and spends the segment…
    if (TB.state.scene === 'wayfinder') TB.go('act_result'); // …then the result plays
  });
  M.hide = function () {}; // the chart lives in the scene text now; nothing to hide
})(window);
