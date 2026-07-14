/* =====================================================================
 * trophies.js — THE TROPHY SHELF. Twenty-six cross-run achievements,
 * named in the island's own voice, kept in 'tidebound.ach.v1' =
 * { got: { id: true } } — like the almanac, they survive every life.
 *
 * The engine calls TB.Trophies.check(state) on every scene entry
 * (after recordEnd, so ending-count trophies see fresh numbers).
 * New unlocks queue a small 🏆 toast, one at a time, top-center.
 * The shelf itself renders as the 🏆 tab of the Field Almanac.
 * =================================================================== */
(function (G) {
  'use strict';
  const TB = G.TB;
  const TR = (TB.Trophies = {});
  const KEY = 'tidebound.ach.v1';

  TR.data = function () {
    try { return Object.assign({ got: {} }, JSON.parse(localStorage.getItem(KEY) || '{}')); }
    catch (e) { return { got: {} }; }
  };
  const save = (d) => { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} };

  // helpers the tests lean on
  const F = (s, k) => !!(s && s.flags && s.flags[k]);
  const nEndings = (m) => Object.keys(m.endings || {}).length;

  // sub = how it reads once earned · hint = the nudge while it's still dark
  TR.LIST = [
    { id: 'still_here', e: '🌅', name: 'Still Here', sub: 'Saw a second dawn. The first of everything else.', hint: 'Survive your first night.', test: (s) => s.day >= 2 },
    { id: 'seven_sunrises', e: '📅', name: 'Seven Sunrises', sub: 'A whole week, and the island stopped checking on you hourly.', hint: 'Live a full week.', test: (s) => s.day >= 7 },
    { id: 'month_of_tides', e: '🌗', name: 'A Month of Tides', sub: 'Thirty days. The beach has learned your footprints.', hint: 'Reach Day 30.', test: (s) => s.day >= 30 },
    { id: 'hundredth_day', e: '💯', name: 'The Hundredth Day', sub: 'You stood at the Convergence with a hundred days behind you.', hint: 'Reach Day 100.', test: (s) => s.day >= 100 },
    { id: 'through_the_rain', e: '🌧️', name: 'Through the Long Rain', sub: 'The monsoon spent itself before you did.', hint: 'Outlast the wet season.', test: (s) => s.chapter >= 6 },
    { id: 'one_story', e: '🏁', name: 'One Story Told', sub: 'An ending, reached on purpose. The gallery is open.', hint: 'Reach any ending.', test: (s, m) => nEndings(m) >= 1 },
    { id: 'shelf_begun', e: '🖼️', name: 'A Shelf Begun', sub: 'Five different farewells. You are becoming a connoisseur.', hint: 'Reach five different endings.', test: (s, m) => nEndings(m) >= 5 },
    { id: 'farewell_collector', e: '🗄️', name: 'Collector of Farewells', sub: 'Fifteen endings. Edda would call this showing off. Quietly, so would the island.', hint: 'Reach fifteen different endings.', test: (s, m) => nEndings(m) >= 15 },
    { id: 'long_gallery', e: '🏛️', name: 'The Long Gallery', sub: 'Thirty endings — most lives this island has watched one castaway live.', hint: 'Reach thirty different endings.', test: (s, m) => nEndings(m) >= 30 },
    { id: 'island_keeps_score', e: '🪦', name: 'The Island Keeps Score', sub: 'You died honestly. Every death here traces to an ignored warning — you know which one.', hint: 'The island is patient. You were not.', test: (s, m) => Object.keys(m.deaths || {}).length >= 1 },
    { id: 'old_salt', e: '⚓', name: 'Old Salt', sub: 'Ten lives on the same shore. The tide pools greet you by name now.', hint: 'Live ten runs.', test: (s, m) => (m.runs || 0) >= 10 },
    { id: 'driftwood_again', e: '♻️', name: 'Driftwood, Again', sub: 'You went back in knowing. That is either wisdom or love; the island scores them the same.', hint: 'Begin a Driftwood Loop.', test: (s) => F(s, 'NGPLUS') },
    { id: 'loop_closed', e: '🌀', name: 'The Loop, Closed', sub: 'The grotto journal was in your own hand all along.', hint: 'Some journals are written forward.', test: (s, m) => !!(m.endings || {}).LOOP },
    { id: 'thick_as_tides', e: '💛', name: 'Thick as Tides', sub: 'A friendship past all bookkeeping. They would cross the island for you; you already have for them.', hint: 'Earn a companion\'s whole trust.', test: (s) => (s.trust || 0) >= 75 },
    { id: 'full_house', e: '🎪', name: 'Full House', sub: 'All six of them, met in one life. The island introduced you around.', hint: 'Meet every animal in a single run.', test: (s) => ['kavi', 'ipo', 'vela', 'buri', 'moa', 'nine'].every((k) => s.met && s.met[k]) },
    { id: 'ninth_life', e: '🐙', name: 'The Ninth Life', sub: 'The tide pools\' oldest question chose to keep asking it beside you.', hint: 'Something in the pools rewards the twice-curious.', test: (s) => s.companion === 'nine' },
    { id: 'tended_whole', e: '🩹', name: 'Tended, Whole', sub: 'They took the hit; you did the sitting, the salve, the staying. Scars, not graves.', hint: 'Nurse a hurt friend all the way back.', test: (s) => F(s, 'PERIL_HEALED') },
    { id: 'three_stones', e: '🗿', name: 'Three Stones Deep', sub: 'The Green Deep gave up all three of its standing stones to you.', hint: 'The deep jungle keeps its writing in threes.', test: (s) => F(s, 'GLYPH3') },
    { id: 'cartographers_eye', e: '🗺️', name: 'Cartographer\'s Eye', sub: 'Every reachable region walked in one life. The chart has no fog left to give you.', hint: 'Walk the whole Wayfinder chart in a single run.', test: (s) => Object.keys(s.visits || {}).length >= 11 },
    { id: 'someone_answered', e: '📻', name: 'Someone Answered', sub: 'Static, static, static — a voice. The sky has people in it after all.', hint: 'Make the radio matter.', test: (s) => F(s, 'CONTACT_MADE') },
    { id: 'kings_peace', e: '🐗', name: 'The King\'s Peace', sub: 'The inland dark has a landlord, and you are a tenant in good standing.', hint: 'The Boar King honors those who learn the language of rent.', test: (s) => F(s, 'KING_ALLY') },
    { id: 'paid_in_full', e: '🐊', name: 'Paid in Full', sub: 'Old Grin\'s toll, posted and met. The east bank remembers your manners.', hint: 'The mangrove crossing is fair, posted, and non-negotiable.', test: (s) => F(s, 'EAST_OPEN') },
    { id: 'crab_mayor', e: '🦀', name: 'Mayor of Crab Town', sub: 'You fed a municipality into existence and it elected you sideways.', hint: 'The beach\'s government responds to infrastructure spending.', test: (s, m) => !!(m.endings || {}).CRAB_TOWN },
    { id: 'nut_baron', e: '🥥', name: 'Nut Baron', sub: 'A fortune in coconuts. The market was always there; it was just waiting for a visionary.', hint: 'Someone should really count all these coconuts.', test: (s, m) => !!(m.endings || {}).COCONUT_MOGUL },
    { id: 'two_lighthouses', e: '📻', name: 'Two Lighthouses', sub: 'Every seventh night, one hour, whoever is still keeping. Signed, sealed, never written down.', hint: 'The nine-beat station keeps a schedule. Learn it.', test: (s) => F(s, 'M_VIGIL_DONE') },
    { id: 'last_mile', e: '📮', name: 'The Last Mile', sub: 'A stone for the story, and both errands finished for a man who couldn\'t.', hint: 'Somebody\'s delivery is still open. You\'re holding the manifest.', test: (s, m) => F(s, 'COURIER_RESTED') || !!(m.endings || {}).LAST_DELIVERY },
    { id: 'magpie', e: '✨', name: 'Magpie', sub: 'The island tipped you, and you noticed, and you kept it.', hint: 'Look down. The wrack line pays attention tax.', test: (s) => !!(TB.Trinkets && TB.Trinkets.count(s) >= 1) },
    { id: 'wrackline_ledger', e: '🧺', name: 'The Wrack-Line Ledger', sub: 'A dozen little gifts in one life. Beachcombing, the island has noticed, is just paying attention with your hands.', hint: 'Keep a dozen beach-finds in a single run.', test: (s) => !!(TB.Trinkets && TB.Trinkets.count(s) >= 12) },
    { id: 'twelfth_hour', e: '🕛', name: 'The Twelfth Hour', sub: 'Nine years of kept silence, and you were listening the night it ended.', hint: 'Some vigils only open to a keeper the island already remembers. Keep the dead station\'s hour.', test: (s) => !!(s && s.flags && s.flags.TWELVE_HEARD) },
    { id: 'every_neighbor', e: '🐾', name: 'Every Neighbor Named', sub: 'The whole almanac of the living, seen with your own eyes — even the seven that refuse the page.', hint: 'The species pages still have strangers on them.', test: (s, m, al) => al && al.species >= al.speciesTotal },
    { id: 'whole_archive', e: '📦', name: 'The Whole Archive', sub: 'Stones, pages, recipes, and her photograph — the island\'s paper memory, complete in your keeping.', hint: 'Four collections, one attentive life at a time.', test: (s, m, al) => al && al.stones >= al.stonesTotal && al.pages >= al.pagesTotal && al.recipes >= al.recipesTotal && al.frags >= al.fragsTotal },
  ];

  TR.counts = function () {
    const got = TR.data().got;
    return { got: TR.LIST.filter((t) => got[t.id]).length, total: TR.LIST.length };
  };

  // ---- the check + toast ---------------------------------------------------
  let queue = [], showing = false;

  TR.check = function (s) {
    if (!s) return;
    const d = TR.data();
    const m = TB.meta();
    let al = null;
    try { al = TB.Almanac ? TB.Almanac.counts() : null; } catch (e) {}
    let dirty = false;
    for (const t of TR.LIST) {
      if (d.got[t.id]) continue;
      let hit = false;
      try { hit = !!t.test(s, m, al); } catch (e) {}
      if (hit) { d.got[t.id] = true; dirty = true; queue.push(t); }
    }
    if (dirty) { save(d); pump(); }
  };

  function pump() {
    if (showing || !queue.length) return;
    const t = queue.shift();
    showing = true;
    let el = document.getElementById('trophyToast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'trophyToast';
      el.setAttribute('aria-live', 'polite');
      document.body.appendChild(el);
    }
    el.innerHTML = '';
    const tag = document.createElement('span'); tag.className = 'ttTag'; tag.textContent = '🏆 Trophy';
    const name = document.createElement('span'); name.className = 'ttName'; name.textContent = t.e + ' ' + t.name;
    el.appendChild(tag); el.appendChild(name);
    el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
    setTimeout(() => {
      el.classList.remove('show');
      setTimeout(() => { showing = false; pump(); }, 450);
    }, 3400);
  }
})(window);
