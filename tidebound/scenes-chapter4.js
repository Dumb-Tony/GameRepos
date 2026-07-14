/* =====================================================================
 * scenes-chapter4.js — Chapter Four: The Hum (Days 36–52).
 * Station Halcyon (one room per expedition), Dr. Vane's staged journals,
 * the radio-parts chain, Ryo Nakata's conditional arrival, companion
 * station beats, and the chapter threshold: Vane's Question.
 * A west variant exists for players who refused Old Grin's Toll.
 * =================================================================== */
(function (G) {
  'use strict';
  const TB = G.TB;
  const R = Math.random;

  const NAMES = { kavi: 'Kavi', ipo: 'Ipo', vela: 'Vela', buri: 'Buri', moa: 'Moa', nine: 'Nine' };
  const EDDA = { emoji: '👵', name: 'Edda Voss', art: 'char-edda' };
  const RYO = { emoji: '⛵', name: 'Ryo Nakata', art: 'char-ryo' };

  function campBg2(s) {
    if (s.site === 'fringe') return 'camp-fringe';
    if (s.site === 'overhang') return 'cliff-camp';
    return s.seg === 2 ? 'beach-dusk' : 'beach-day';
  }
  const radioReady = (s) => TB.is('RADIO_SURVEYED') && TB.is('TRANSMITTER') && TB.is('WIRE') && TB.is('FUEL');

  // ---- Chapter open ---------------------------------------------------------------
  TB.scene('ch4_open', {
    bg: 'jungle',
    enter: (s) => { if (s.chapter < 4) { s.chapter = 4; s.day = 36; s.seg = 0; } },
    text: [
      '<em>CHAPTER FOUR — THE HUM</em>',
      'Day thirty-six. The air has changed. You noticed it first at dawn — a heaviness riding in off the southern sea, a taste like coins — and Edda\'s word for it, delivered with a weather-eye and no comfort at all, was: <em>"Monsoon\'s coming. Weeks, not months. Whatever you mean to do about that mast, castaway, the sky won\'t hold the door forever."</em>',
    ],
    next: (s) => (TB.is('EAST_OPEN') ? 'ch4_arrive' : 'ch4_west_offer'),
    nextLabel: 'Begin ➤',
  });

  TB.scene('ch4_west_offer', {
    bg: 'grove', who: EDDA,
    text: [
      'She hears out your account of the mangrove ford — the channel, the landlord, the turning back — with the expression of a woman grading a paper that started well.',
      '"Sensible," she allows. "And useless. Everything the next season of your life needs is east of that water — the station\'s tools, its tins, and its troubles, which you\'ll hear about when you\'ve seen the place." She stands, takes up her walking staff and, after a moment\'s deliberation, the shotgun.',
      '"I\'ve crossed that ford twice a year for sixty years. There\'s an hour at first light when the old devil is cold to his bones and fussy about work. Be at my fence at the wrong end of tomorrow\'s dawn and I\'ll walk you over like a school crossing." A pause, and the ghost of a grim smile. "Or stay west and keep your whole skin. I\'ve buried people I liked better for choices I respected less."',
    ],
    choices: [
      { t: 'Be at her fence before dawn.', sub: 'Cross under sixty years of know-how.',
        do: (s) => { TB.flag('GRIN_ESCORTED'); TB.flag('EAST_OPEN'); s.edda = TB.clamp(s.edda + 5, 0, 100); }, go: 'ch4_escort' },
      { t: 'Stay west. Whole skin, your fire, your horizon.', sub: 'The station keeps. Your plans are here.',
        do: (s) => { TB.flag('WEST_LOCKED'); TB.route('roots', 1); TB.tickSegment(); }, go: 'ch4_west_open' },
    ],
  });
  TB.scene('ch4_escort', {
    bg: 'mangrove', who: EDDA,
    text: [
      'The crossing, with Edda Voss conducting, is almost insultingly uneventful.',
      'She reads the water like a page — "there; he\'s at the larder channel, hear the herons sulk" — walks you into the ford at the cold hour at an unhurried march, and pauses mid-channel, thigh-deep, to point out a medicinal moss on a root as if the largest predator on the island were not eighty yards downstream digesting the dawn.',
      'On the east bank she hands you a strip of dried fish like a schoolteacher paying out a sweet. "There. Now you know the hour and the manner of it, and can stop being dramatic about a crocodile." Her face turns up the rise, toward where the mast leans against the sky, and closes like a door. "The station\'s yours to pick over. I don\'t go past this bank anymore. Mind the E wing — and mind what you feel like doing, in there. The place has a way of making suggestions."',
      'She is back across the water before the sun properly finds it.',
    ],
    next: (s) => { TB.tickSegment(); return 'ch4_arrive'; },
    nextLabel: 'Up the rise ➤',
  });
  TB.scene('ch4_west_open', {
    bg: campBg2,
    text: [
      'West it is. You feel the decision settle — not defeat: <em>selection</em>. One coastline, one camp, one horizon, tended to a polish while the weather turns.',
      'The mast will stand in your mind\'s east all season, rusting its questions. You\'ve traded them for certainties you can hold: hull-wood, stores, the vigil. The island shrugs and deals to the hand you\'ve kept.',
    ],
    next: (s) => TB.advance(),
    nextLabel: 'To work ➤',
  });

  // ---- Station arrival --------------------------------------------------------------
  TB.scene('ch4_arrive', {
    bg: 'station',
    enter: (s) => { if (!TB.is('STATION_OPENED')) { TB.flag('STATION_OPENED'); TB.route('depth', 1); if (s.seg === 0 && s.day === 36) TB.tickSegment(); } },
    text: (s) => [
      'Station Halcyon, at the end of its swallowed service road, is a held breath fifty years long.',
      'Six pale prefab buildings on concrete pads, roofs green with moss-load, arranged around a yard the jungle has reclaimed to knee height. The mast leans over it all, guys slack, red rust weeping down its lattice into the trees. A flagless pole. A generator shed with its door ajar exactly as wide as a person leaving in a hurry. And painted on the largest building, ghost-letters under fifty wet seasons: <em>HALCYON RESEARCH STATION — SITE 9</em>.',
      'The mess hall\'s louvered windows hang open. Through them: a long table, chairs pushed back — <em>pushed back</em>, not tucked — crockery still at the places. Whatever ended this place ended it between one spoonful and the next.',
      s.companion === 'vela' ? 'Vela will not cross the yard\'s edge. She takes the mast instead — the very top, above the rust and the guys — and stands sentry against the sky, and nothing you call coaxes her lower. Some opinions predate you.' :
      s.companion === 'kavi' ? 'At the yard\'s edge Kavi stops, nose working, and a ridge of fur stands along his spine from collar to tail. He comes with you — he chooses to, visibly — but he walks the whole compound stiff-legged, placing himself always between you and the low white building at the yard\'s far end. The one with the heavy door. The E wing.' :
      s.companion === 'nine' ? 'You\'ve left Nine her half-day\'s signal at the shore — but the strangest thing meets you here anyway: the station\'s old cistern channel runs seaward from the compound, and in its brackish standing water, something has recently, methodically, stacked four rusted tins into a neat tower. She has been here before you. Of course she has.' :
      s.companion === 'moa' ? 'Moa rides your shoulder into the yard at full alert — and then, astonishingly, relaxes. Buildings, her posture declares, are simply large boxes, and boxes are for perching on. She annexes the compound on your behalf, one rooftop at a time.' :
      s.companion === 'buri' ? 'Buri finds the compound delicious. Fifty years of anything is compost, and he plows the yard\'s green chaos with commentary while you stand at the fence of a graveyard he\'s treating as a buffet. It helps, actually. It keeps the place\'s held breath from getting into yours.' :
      s.companion === 'ipo' ? 'Ipo goes silent on your shoulder — a full minute, a record — and then, softly, with the reverence of a pilgrim sighting the domes of paradise: begins to vibrate. An entire compound of latches, lockers, drawers and doors. You are going to have to watch him every second.' :
      'You stand alone at the yard\'s edge a long moment, the way you\'ve learned to at thresholds, and let the place finish saying its one long silent sentence before you interrupt.',
      '<em>Station Halcyon is open to you now — an expedition costs part of a day, one building at a time.</em>',
    ],
    next: (s) => TB.advance(),
  });

  // ---- Hub extension: expedition + Ryo actions ----------------------------------------
  const prevActions = TB.ch3Actions;
  TB.ch3Actions = function (s) {
    const c = prevActions(s);
    if (s.chapter >= 4 && TB.is('EAST_OPEN')) c.push({
      t: '📡 Expedition to Station Halcyon', sub: 'The crossing, the rise, and one building\'s worth of daylight.',
      do: () => { TB.stat('energy', -6); TB.tickSegment(); }, go: 'station',
    });
    if (TB.is('RYO_MET') && s.chapter >= 4) {
      if (s.ryo < 40) c.push({
        t: '⛵ Tend to Ryo', sub: 'Water, food, fresh dressings, and someone to talk at. He\'s a talker.',
        do: () => { const s2 = TB.state; s2.ryo = TB.clamp(s2.ryo + 7, 0, 100); TB.stat('hunger', -4); TB.stat('hope', 2);
          s2.out = { bg: campBg2(s2), text: [s2.ryo >= 40
            ? 'Today he makes it to sitting, then to standing, then — against direct orders — to the waterline, where he stands swaying like a mast in a swell, looking at the sea that nearly kept him. "Right," he says, color coming back over three long breaths. "Right. So. Introductions: Ryo Nakata, late of the sloop <em>Kingfisher</em>, currently of your fire pit. I owe you a life. I pay debts in boat-work and terrible cooking."'
            : 'He drifts in and out, and talks in both states — fragments of course headings, an argument with someone named for a bird, and once, clearly, with total conviction: "the compass didn\'t break, the compass was <em>answered</em>." You change the dressings and keep the water coming. He\'s knitting. Slowly.'] };
          TB.tickSegment(); },
        go: 'act_result',
      });
      else c.push({
        t: '⛵ Work the Kingfisher with Ryo', sub: 'Two sets of hands on a broken boat. He talks the whole time. It helps.',
        do: () => { const s2 = TB.state; s2.ryo = TB.clamp(s2.ryo + 3, 0, 100); TB.stat('energy', -8); TB.route('signal', 2); TB.flag('BOAT_WORKED');
          const stage = TB.is('BOAT2') ? 3 : TB.is('BOAT1') ? 2 : 1;
          let txt;
          if (stage === 1) { TB.flag('BOAT1'); txt = ['The Kingfisher lies canted on the sand above the tideline where the sea spat her out — mast snapped a meter up, hull stove along two strakes, rudder gone. Ryo walks her like a surgeon rounding on family. "She\'ll swim," he says at last, hand flat on the hull. "Not soon. Not cheap. But she\'ll swim." You start with the mud, the weed, and the list: timber, pitch, cordage, canvas, luck.']; }
          else if (stage === 2) { TB.flag('BOAT2'); txt = ['Strake by strake, the hull closes. Ryo works and talks — the circumnavigation that was supposed to fix his life, the marriage it cost before it started, the night the compass spun and the radio filled with a sound "like a choir underwater — you know it, I\'ve seen you know it." You know it.', 'He\'s Signal to the bone, your sailor: every plank he fits is aimed at the horizon. He assumes — kindly, completely — that you\'re coming. You notice yourself not answering.']; }
          else { txt = ['The Kingfisher looks like a boat again. Patched, graceless, mast fished with island hardwood and half her canvas — but a boat, above the tideline, pointed at the sea like a held argument.', '"Monsoon first," Ryo says, reading the southern sky the way Edda reads it. "Nobody sane crosses in what\'s coming. But after — first fair season after —" he doesn\'t finish. He looks at you instead, the question standing between you, patient as the boat.']; }
          s2.out = { bg: 'beach-day', text: txt };
          TB.tickSegment(); },
        go: 'act_result',
      });
    }
    return c;
  };

  // ---- The station (one room per expedition) --------------------------------------------
  TB.scene('station', {
    bg: 'station',
    text: (s) => {
      const t = ['The yard receives you with its fifty-year quiet. The mast ticks in the wind overhead' + (s.companion === 'vela' ? ' — Vela already on her sentry post at its top' : '') + '.'];
      const done = [];
      if (TB.is('STATION_MESS')) done.push('mess');
      if (TB.is('VANE_J1')) done.push('Vane\'s office begun');
      if (TB.is('RADIO_SURVEYED')) done.push('radio room surveyed');
      if (TB.is('E_WING_OPEN')) done.push('E wing opened');
      if (TB.is('FUEL')) done.push('fuel drained');
      if (done.length) t.push('<em>Progress: ' + done.join(' · ') + (radioReady(s) ? ' · 📻 all radio parts in hand' : '') + '.</em>');
      t.push('Where does today\'s daylight go?');
      return t;
    },
    choices: (s) => {
      const c = [];
      if (!TB.is('STATION_MESS')) c.push({
        t: '🍽️ The mess hall', sub: 'The interrupted breakfast. And fifty-year-old stores, some of which are immortal.',
        do: () => { const s2 = TB.state; TB.flag('STATION_MESS'); s2.food += 2; TB.stat('hunger', 15); TB.stat('hope', -2);
          s2.out = { bg: 'station', text: ['You make yourself walk the long table first, out of some respect you can\'t name: eight places, eight mugs, porridge fossilized in the bowls, a fork laid down mid-motion across a plate. A newspaper — Manila, March 1979 — folded to the crossword, three answers in. Nobody cleared breakfast. Nobody ever cleared breakfast.', 'The storeroom behind it is the real haul: swollen tins you leave, and sound ones you don\'t — sealed rice in wax-dipped drums, tinned fish with labels gone but seams true, salt, and a catering jar of honey, perfectly, eerily immortal. You pack out all your arms will carry and thank the dead in the doorway, quietly, because it feels owed.'] }; },
        go: 'act_result',
      });
      const jstage = TB.is('VANE_J2') ? 3 : TB.is('VANE_J1') ? 2 : 1;
      if (!TB.is('VANE_J3')) c.push({
        t: '📓 Dr. Vane\'s office', sub: jstage === 1 ? 'The lead researcher\'s room. Her journals are still on the desk.' : 'The journals continue. You\'ve been rationing them like water.',
        do: () => { const s2 = TB.state; TB.route('depth', 1);
          let txt;
          if (jstage === 1) { TB.flag('VANE_J1'); txt = ['The office is small, ordered, and hers: I. VANE, PhD on the door in machine tape, a spider-plant\'s skeleton in a pot, and on the desk — squared to the blotter, waiting fifty years for a reader — a stack of clothbound journals in a firm, fast hand.', '<em>"March \'68. Site 9 at last. The anomaly is real — not instrument error, not the pilots\' ghost stories. The island sits inside a standing electromagnetic field with a periodicity I can set my watch by: seven pulses, then rest. The birds navigate by it. The plankton bloom to it. My compass spins like a debutante. I have never been so happy in my professional life. — I.V."</em>', 'You read until the light moves. She loved it here. It\'s in every line: a mind meeting its one great question.']; }
          else if (jstage === 2) { TB.flag('VANE_J2'); txt = ['<em>"Sept \'74. Six years of data and the shape of it frightens me, quietly, at night. The field is not geological noise. It is COHERENT. It couples to the tides — the sea winds the island like a watch, twice daily, through channels in the rock we\'ve mapped by their song. The locals\' stones — the spirals — are DIAGRAMS. Whoever cut them understood this system better than my funding committee ever will."</em>', '<em>"…And it hides us. I\'ve stopped pretending otherwise in my own journal. Charts miss this island because the field bends every instrument that looks at it. The question my sponsors keep cabling — CAN IT BE REPRODUCED — is the wrong question. The right one is: what is it FOR? Systems this elegant are always for something. — I.V."</em>']; }
          else { TB.flag('VANE_J3'); TB.flag('DRAWER_KNOWN'); txt = ['<em>"Jan \'79. They\'ve sent the drill. Over my objection, over my resignation — tendered, refused, apparently I\'m \'essential to continuity.\' The committee wants a core of the resonant stratum. E wing is being fitted for the samples. Edda won\'t speak at meals. The island has been unusually quiet, which the junior staff find reassuring and I find like the pause a wave makes at the top of its arc."</em>', 'The next page — you turn to it with your pulse in your ears — is torn out. The stubs of five more torn pages follow. Then nothing but blank paper to the endboard.', 'And below the desk, catching your knee as you stand: the bottom drawer. Steel. Locked. Labeled in her hand, in letters gone brown:', '<em>"If found: burn unread. — I.V."</em>'] ; }
          s2.out = { bg: 'station', text: txt };
        },
        go: 'act_result',
      });
      if (!TB.is('RADIO_SURVEYED')) c.push({
        t: '📻 The radio room', sub: 'The mast is standing. What\'s at the bottom of it?',
        do: () => { const s2 = TB.state; TB.flag('RADIO_SURVEYED'); TB.route('signal', 2);
          s2.out = { bg: 'station', text: ['The radio room is a ruin with good bones. Console gutted by fifty wet seasons, mice in the wiring loom, the operator\'s chair rusted mid-swivel — but the mast feed runs true up the wall and out, and the antenna, for all its lean, is <em>up</em>.', TB.is('BG_ENGINEER') ? 'You read the wreck the way Vane read her instruments, and the verdict is: solvable. Three absences stand between this room and a working transmitter: the transmitter itself (the console\'s is corrosion in a box — but stations like this kept spares, crated, in secure storage: the E wing, if anywhere), heavy antenna cable to replace the perished run, and fuel for the generator. Parts, cable, fuel. A list. Lists can be finished.' : 'You\'re no radio engineer, but the shape of the problem shows even to you: the console\'s heart is corroded past prayer — a spare would live in secure storage, which means the E wing; the fat cable to the mast crumbles in your hand — salvage might replace it; and none of it means anything without generator fuel. Parts, cable, fuel. A list. You can work a list.'] };
          if (TB.state.companion === 'vela') { TB.flag('WIRE'); s2.out.text.push('And one absence, it turns out, is already solved: as you leave, Vela drops from the mast-top and deposits at your feet — with the air of a creditor settling an account you didn\'t know was open — a full coil of bright copper antenna wire, salvaged from only she knows where along fifty miles of coast. You stand there holding a solved problem, watching her resume her post, and revise your estimate of how much she understands upward, again.'); }
        },
        go: 'act_result',
      });
      if (!TB.is('E_WING_OPEN')) {
        const key = TB.is('IPO_KEY'), buri = s.companion === 'buri' && s.trust >= 50, eng = TB.is('BG_ENGINEER') && TB.has('toolbox');
        c.push({
          t: '🚪 The E wing', sub: key ? 'The heavy door — and the flat steel key from Ipo\'s hoard, stamped E WING.' : buri ? 'The heavy door. You have two hundred pounds of demolition with opinions.' : eng ? 'The heavy door. Hinges are just puzzles that rust.' : 'The heavy door. Sealed, steel, and not asking to be opened.',
          do: () => { const s2 = TB.state;
            if (!(key || buri || eng)) { s2.out = { bg: 'station', text: ['The E wing door is a slab of marine steel in a reinforced frame, and it defeats you — today. Pry-bar bends, hinges hold, and the building stands blank-walled and windowless, keeping the station\'s one locked thought.', 'There will be a way in — a key in this compound, a stronger lever, a better idea. The door isn\'t going anywhere. Neither, something tells you, is what\'s behind it.'] }; return; }
            TB.flag('E_WING_OPEN'); TB.flag('TRANSMITTER'); TB.flag('HEARTGLASS'); TB.flag('INCIDENT_HINTED'); TB.route('depth', 2);
            const how = key ? 'The flat steel key from Ipo\'s hoard turns in the lock like it was oiled yesterday — fifty years of jungle and the tumblers still know their business. (Somewhere in the canopy roads, a small showman\'s reputation compounds further.)' : buri ? 'Buri answers the door\'s argument with the only rebuttal he owns. The third blow bursts the frame\'s rusted anchors and two hundred pounds of pleased pig rides the slab down into the dark with a boom that scatters birds for a mile.' : 'You defeat it the engineer\'s way: not the lock but the hinges, drifted out pin by rusted pin over two patient hours, until the whole slab swings backward against its own intentions.';
            s2.out = { bg: 'station', text: [how,
              'Inside, the E wing is two rooms and a chill that has no business surviving the tropics. The first room is storage, and it pays the whole expedition: a spare transmitter, crated, greased, sealed — <em>intact</em>. Tools. Cable ties. A drum of desiccant that did its job for fifty years.',
              'The second room is the reason for the door.',
              'Core samples, racked like wine. Grey stone, unremarkable — except the seventh rack, double-strapped, its samples sleeved in lead-lined canvas. You unwrap one to the wrist and stop: the stone is <em>glassy</em>, dark, threaded with veins that catch your lamp and hold it a half-beat too long — the exact wrongness of the third glyph stone\'s inlay, the exact color of your reflection arriving late.', 'It is warm. Not sun-warm. <em>Pulse</em>-warm. Seven beats. You wrap it back with more care than you\'ve handled anything since the crash, and you take one — the smallest — because Vane\'s clipped sample-log ends with a line you can\'t unread: <em>"After yesterday, all further sectioning suspended. It isn\'t inert. It was never inert. — I.V."</em>'] };
          },
          go: 'act_result',
        });
      }
      if (!TB.is('FUEL')) c.push({
        t: '⛽ The generator shed', sub: 'If anything still holds fuel, it\'s here.',
        do: () => { const s2 = TB.state; TB.flag('FUEL');
          s2.out = { bg: 'station', text: ['The shed is rust and shadows and the fifty-year smell of diesel gone to varnish — but the main tank was built like a battleship, and when you sound it, it answers: a quarter full, settled and stratified, but <em>fuel</em>.', TB.is('BG_ENGINEER') ? 'You crack the drain, run off the water and sludge, and decant the good middle draw into every vessel you\'ve got. It\'ll burn. The old donkey-engine might even survive burning it, once you\'ve rebuilt its filters, which you catalogue by lamplight with something dangerously like joy.' : 'You draw it off the way the fading stencilled instructions insist — slowly, from the middle, wasting the top and bottom — and carry out enough to matter. Whether the generator will forgive fifty years and rough fuel is tomorrow\'s question, but it is at least now a question.'] };
        },
        go: 'act_result',
      });
      if (!TB.is('WIRE')) c.push({
        t: '🔌 Salvage sweep for cable', sub: 'The compound is veined with wire. Most is powder. Some isn\'t.',
        do: () => { const s2 = TB.state; TB.flag('WIRE');
          s2.out = { bg: 'station', text: ['You spend the daylight stripping the compound\'s veins: conduit runs, junction boxes, the lightning-ground off the water tower. Powder, powder, verdigris, powder — and then, under the eaves of the lab block where the sun never reached, a full run of armored antenna cable, jacket cracked but copper bright as the day it shipped.', 'You coil it out over your shoulder — heavier than it has any right to be, in every sense. Another line through the list.'] };
        },
        go: 'act_result',
      });
      if (radioReady(s) && !TB.is('RADIO_STAGED')) c.push({
        t: '📻 Stage the radio for assembly', sub: 'Transmitter, cable, fuel: the list is finished. Set the room to rights.',
        do: () => { const s2 = TB.state; TB.flag('RADIO_STAGED'); TB.route('signal', 2); TB.stat('hope', 6);
          s2.out = { bg: 'station', text: ['You spend the day doing the careful, unglamorous work that separates a pile of parts from a machine: console gutted and cleaned, the new cable run dressed up the wall and out to the mast\'s feed, the crated transmitter unpacked, inventoried, seated. Fuel filtered and staged at the shed.', 'By dusk the radio room looks like what it is: a held breath, one long day\'s assembly from a voice. The monsoon sky to the south stands like a wall. Whatever you\'re going to say to the world — and whether — the saying of it has become, for the first time since the crash, an <em>engineering</em> question.', '<em>The radio can be finished when the moment comes. That moment is a story for the next chapter.</em>'] };
        },
        go: 'act_result',
      });
      c.push({
        t: '🏠 Head home with the day\'s haul', sub: 'The crossing doesn\'t improve after dark.',
        do: () => { const s2 = TB.state; s2.out = { bg: campBg2(s2), text: ['You make the crossing at the hour you\'ve learned and reach your own fire with the light, the day\'s haul on your back and the station\'s held breath still in your ears.'] }; },
        go: 'act_result',
      });
      return c;
    },
  });

  // ---- Chapter 4 scheduled events -------------------------------------------------------
  TB.SCHEDULE.push(
    { d: 38, s: 2, id: 'ev4_recorder', when: (s) => TB.is('STATION_OPENED') },
    { d: 38, s: 2, id: 'ev4_west_wreck', when: (s) => !TB.is('EAST_OPEN') },
    { d: 40, s: 1, id: 'ev4_ryo', when: (s) => s.route.signal >= 5 },
    { d: 40, s: 1, id: 'ev4_noryo', when: (s) => s.route.signal < 5 },
    { d: 44, s: 2, id: 'ev4_companion', when: (s) => !!s.companion && TB.is('STATION_OPENED') },
    { d: 47, s: 3, id: 'ev4_pulse2' },
    { d: 52, s: 2, id: 'ch4_threshold', when: (s) => TB.is('STATION_OPENED') },
    { d: 52, s: 2, id: 'ch4_threshold_west', when: (s) => !TB.is('STATION_OPENED') },
  );

  TB.scene('ev4_recorder', {
    bg: 'station',
    text: [
      'In the lab block, under a dust sheet that comes away like a held breath, you find the station\'s patient heart: a chart recorder — clockwork-driven, mains-free, built in an age that trusted springs — and a cabinet of its paper drums, decades of them, filed by year.',
      'You wind it, because you have to know. It ticks. It <em>draws</em>: a fine inked needle laying down, in real time, the thing you\'ve slept against for twenty nights — rise, rise, rise, seven teeth to the wave, then the rest. The Hum, made visible. The island\'s pulse on paper.',
      'Then you pull the old drums, and the cabinet stops being an instrument and becomes an archive of a heartbeat: 1969, steady. 1973, steady. 1978, steady, page after page, teeth after teeth—',
      '—and the drum for March 1979 has a gap in it. Not a fault. A <em>silence</em>: the needle drops flat mid-page and stays flat for nine hours, and when the pulse resumes, its shape is changed — a new harmonic riding the seventh beat that every drum before lacks and every night since (you check your own memory of the lagoon, and your skin prickles) has carried.',
      'Something happened in March 1979 that stopped the island\'s heart for nine hours. And you have slept, every night since the crash, against the scar in the rhythm.',
    ],
    enter: (s) => { if (!TB.is('RECORDER')) { TB.flag('RECORDER'); TB.route('depth', 2); } },
    next: (s) => 'camp2',
  });

  TB.scene('ev4_west_wreck', {
    bg: 'beach-day',
    text: [
      'The turning season\'s first gift arrives on the morning tide: wreckage — fresh wreckage, pale unweathered timber, a shattered transom board with paint still glossy in the grain, half a nameplate: <em>—NGFISHER</em>.',
      'A boat broke up out there, and not long ago. You walk the tideline for an hour collecting what the sea deals out: good planks, a tangle of rigging wire, a sea-anchor, one deck shoe.',
      'You stack the salvage above the tideline and stand a while looking at the horizon that sent it, doing the arithmetic you can\'t not do: somewhere out there, recently, was a sailor.',
    ],
    enter: (s) => { if (!TB.is('WRECK_DRIFT')) { TB.flag('WRECK_DRIFT'); TB.route('signal', 1); TB.flag('WIRE'); } },
    next: (s) => 'camp2',
  });

  // ---- Ryo -------------------------------------------------------------------------------
  TB.scene('ev4_ryo', {
    bg: 'beach-day', who: RYO,
    text: (s) => [
      'The sail comes out of the southern haze mid-morning — wrong, everything about it wrong: canvas half-down and dragging, hull low, a course that isn\'t a course but a long helpless curve committed to the current. Drawn, you realize with a cold clarity, exactly the way your plane was drawn. The island is reeling something in again.',
      'She takes the outer reef with a crack you feel in your teeth, lurches, and comes over it on the surge — a small sloop, dismasted at the spreaders, and a figure in her cockpit slumped over the tiller, moving just enough to be alive.',
      'You go into the lagoon after her. Of course you do. The last thirty meters you swim, and haul yourself over her counter into ankle-deep water and wreckage, and the sailor — sun-flayed, salt-crusted, a week past his last full water ration by the cracked look of him — opens one eye and takes you in: the castaway beard, the island behind you, the whole impossible fact of a human being.',
      '"…Huh," he manages, in a voice like a dry hinge. "The chart said... there\'s no island here."',
      '"The chart\'s wrong about a lot," you say, and get your shoulder under him.',
    ],
    choices: (s) => [
      { t: 'Camp, water, and triage — everything you have, all at once.', sub: TB.is('BG_MEDIC') ? 'You\'ve done this professionally. He\'s in the best hands on the island.' : 'He\'s badly dehydrated and worse-burned. Spend the day on him.',
        do: (s) => { TB.flag('RYO_MET'); s.ryo = TB.clamp(20 + (TB.is('BG_MEDIC') ? 12 : 0), 0, 100); TB.stat('energy', -10); TB.stat('hope', 6); TB.route('signal', 1); }, go: 'ev4_ryo2' },
      { t: 'Stabilize him — but strip and secure the boat before the tide takes it back.', sub: 'Cold arithmetic: the sailor keeps; the salvage might not.',
        do: (s) => { TB.flag('RYO_MET'); TB.flag('KINGFISHER_STRIPPED'); s.ryo = 12; TB.state.food += 1; TB.item('rations', 2); TB.route('signal', 2); TB.stat('energy', -12); }, go: 'ev4_ryo2' },
    ],
  });
  TB.scene('ev4_ryo2', {
    bg: 'beach-dusk', who: RYO,
    text: (s) => [
      s.ryo >= 20 ? 'You spend the day the generous way: shade, water in sips on a schedule, salve for the burns, broth at dusk. By firelight he surfaces long enough to hold the mug himself and take a slow inventory — the camp, the fire, ' + (s.companion ? NAMES[s.companion] + ' (whom he regards with frank delight: "oh, <em>excellent</em>, I\'ve died and it\'s weird")' : 'your tidy solitary kingdom') + ' — and something in the wrecked sunburnt face relaxes past gratitude into simple wonder.' : 'You do the triage cold and fast — water, shade, wounds — and then leave him sleeping to fight the tide for his boat, and the tide makes you pay for every plank and tin of it. By the time the Kingfisher is stripped and her hulk dragged above the high-water line, it\'s dusk, you\'re wrung out, and your patient is awake, watching you stack his life\'s salvage by firelight with an expression you can\'t fully read.',
      '"Ryo," he rasps, eventually, by way of everything. "Nakata. That was — <em>is</em> — the Kingfisher. We were going around the world, her and me." A long pause, the fire ticking. "The compass spun three days ago. Radio drowned in a sound like — like a choir, underwater. And then there was an island where no island is." His eyes find yours, and the question in them is the first entirely sane thing he\'s said: "You too?"',
      '"Me too," you say, and his laugh — cracked, exhausted, real — is the first human laugh you\'ve heard since the sky broke, and it does something to your chest you weren\'t ready for.',
      '<em>There are two castaways on Vessakai now.</em>',
    ],
    next: (s) => 'camp2',
  });
  TB.scene('ev4_noryo', {
    bg: 'beach-day',
    text: [
      'Mid-morning, a sound you\'d stopped listening for: engines. High, faint, real — a contrail hardening out of the blue, a passenger jet crossing the island\'s sky seven miles up, straight as a ruled line, utterly indifferent.',
      'You stand with your neck craned in the middle of your SOS — your beautiful, huge, invisible-from-seven-miles SOS — and watch three hundred sleeping people cross your sky at ruinous speed, and the contrail\'s dissolve feels like a door drawn shut with great gentleness.',
      'The island\'s field bends instruments, Edda says. Whatever corridors the world flies, they thread past this place like water past a stone. Nobody up there is looking down. Nobody down here is on the charts.',
    ],
    choices: [
      { t: 'Let it hurt, then bank it as fuel.', sub: 'Every plank, every signal, every plan — aimed at that corridor.',
        do: (s) => { TB.stat('hope', -4); TB.route('signal', 2); }, go: 'camp2' },
      { t: 'Watch it go, and notice: you didn\'t reach for the flare thought first.', sub: 'The island under your feet felt — present. That\'s new.',
        do: (s) => { TB.stat('hope', 2); TB.route('roots', 2); }, go: 'camp2' },
    ],
  });

  // ---- Companion station beats -----------------------------------------------------------
  TB.scene('ev4_companion', {
    bg: 'station', who: (s) => ({ kavi: { emoji: '🐕', name: 'Kavi' }, ipo: { emoji: '🐒', name: 'Ipo' }, vela: { emoji: '🦅', name: 'Vela' }, buri: { emoji: '🐗', name: 'Buri' }, moa: { emoji: '🐔', name: 'Moa' }, nine: { emoji: '🐙', name: 'Nine' } }[s.companion]),
    text: (s) => {
      const v = {
        kavi: ['Kavi has kept his stiff-legged truce with the compound for days — but today, at the E wing\'s corner, he stops and will not be moved. Not at the door: at the <em>foundation</em>, where a hairline crack runs down into earth, and out of it, faint past your senses, comes whatever he has been smelling since the first hour.', 'He looks from the crack to you — the long, grave, weighing look — and then deliberately, unmistakably, he steps between you and it. Whatever is under this station, in the rock the drill touched: his nose files it with fire, floods, and the Boar King. <em>Things that end packs.</em>'],
        ipo: ['You lose Ipo for two hours in the lab block and find him enthroned amid systematic devastation: every drawer opened, every latch defeated, and his plunder sorted — actually sorted — into piles by a taxonomy you slowly decode: shiny, edible-maybe, USEFUL. The useful pile stops your heart: fuses. Bulbs. A sealed multimeter. Vacuum tubes in their cartons, intact.', 'He presents the collection with the modest gesture of a master unveiling a retrospective, then selects the finest vacuum tube and hands it to you personally. Somewhere along this coast he became your quartermaster. The radio\'s odds just improved, and he knows it, and he will be insufferable about it forever.'],
        vela: ['Vela has never once come down inside the compound — but today, from the mast-top, she starts <em>calling</em>: short, sharp, insistent, a note you know. The finding note. You climb the water tower to follow her sightline, out over the eastern canopy, and see it: a straightness in the green, running from behind the station toward the mountain\'s flank. A road. An overgrown service road, invisible from the ground, arrow-straight toward the high country.', 'The drill didn\'t operate here, you realize. The station only <em>housed</em> it. Somewhere up that swallowed road is where they actually put the hole in the island\'s song — and the only soul who\'d know that is one who\'s watched this compound from the sky for twenty years.'],
        buri: ['Buri, working the yard\'s compost like a paid contractor, hits something that clangs. He excavates it with mounting outrage — roots, mud, a grown-over tarpaulin — and stands back, filthy and triumphant, over his find: a service trailer, small-wheeled, rust-locked but sound, stenciled HALCYON STORES.', 'Inside: hand tools gone to rust and lime — and a wooden crate of unbroken glass carboys, and a coil of hose, and cement in drums gone to stone except the center of one. You look from the trailer to your pig — who is already asleep against it, guarding the claim — and start planning around a hauling capacity you didn\'t have this morning.'],
        moa: ['Moa\'s week-long annexation of the compound completes today at the greenhouse — a glass ruin you\'d written off, panes down, benches collapsed. She won\'t leave it. She scratches, insists, performs the found-food dance at a patch of riot growth in the corner until you finally look properly:', 'Tomatoes. Feral, tiny, centuries of selection collapsing back toward the wild — but tomatoes, and beside them the woody ghosts of pepper plants gone to seed, and volunteer greens, and in a rusted seed cabinet her scratching has burst open: foil packets, dozens, some certainly dead, some — the heavy foil ones — <em>maybe not</em>. Fifty years ago someone planted a garden against homesickness. Your hen just claimed the inheritance.'],
        nine: ['You take the shore way home and find Nine waiting at the station\'s old cistern channel — insistently, the arm-wave she uses when you are being slow about something. The channel, you finally attend, runs from the sea under the compound: the station\'s water intake, a drowned concrete throat no person could enter.', 'She enters it. Three minutes — you count, ancient fear rising — then four. Then she flows back out of the dark with her arms full and lays it on the concrete lip: a sealed steel film canister, military-gasketed, dry inside as the day it was hidden. Hidden — because taped to it, gone to brown lace, are the remains of instructions, and one legible fragment in a hand you now know at sight: <em>"…not the committee. Only if—"</em>', 'Only if. Only if what? Only if <em>who</em>? Somewhere below the station, Dr. Ilsa Vane kept a copy of something outside her own files, in a place only the sea could reach. And the sea just handed it to you.'],
      };
      return v[s.companion];
    },
    enter: (s) => {
      if (TB.is('COMP4_DONE')) return;
      TB.flag('COMP4_DONE'); TB.bond(4);
      if (s.companion === 'vela') { TB.flag('DRILL_ROAD'); TB.route('depth', 2); }
      if (s.companion === 'nine') { TB.flag('VANE_FILM'); TB.route('depth', 2); }
      if (s.companion === 'ipo') { TB.flag('RADIO_PARTS_BONUS'); TB.route('signal', 1); }
      if (s.companion === 'buri') { TB.flag('TRAILER'); TB.route('roots', 2); }
      if (s.companion === 'moa') { TB.flag('SEEDS'); TB.route('roots', 2); }
      if (s.companion === 'kavi') { TB.flag('KAVI_WARNING'); TB.route('depth', 1); }
    },
    next: (s) => 'camp2',
  });

  // ---- The pulse, again ---------------------------------------------------------------------
  TB.scene('ev4_pulse2', {
    bg: 'beach-night',
    text: (s) => [
      'It happens twice tonight.',
      'You\'re awake for both — you\'ve started half-listening in your sleep, the way you once listened for a phone — and there is no mistaking it now: the lagoon runs its seven beats, drops the seventh, holds a black beat too long, and resumes. And then, an hour before dawn, again.',
      TB.is('RECORDER') ? 'In the morning you cross to the station without eating and pull the night\'s drum off the chart recorder, and there it is in patient ink, twice: the needle\'s held flatline — longer, both times, than the skip you found from three nights ago. You set the drum beside March 1979\'s and the comparison closes your throat: the same signature. Smaller, but the same. Whatever stopped the island\'s heart for nine hours that year is <em>clearing its throat</em>.' : 'You lie awake till dawn with your hand flat on the sand, feeling for a pulse the way you would at a bedside, telling yourself islands do not have arrhythmias, and knowing — with the animal certainty this place has been teaching you since Day 1 — that something, somewhere under the mountain, is changing its mind.',
      'The monsoon wall stands higher in the south every day. Whatever season is coming, it isn\'t only weather.',
    ],
    enter: (s) => { if (!TB.is('PULSE2')) { TB.flag('PULSE2'); TB.route('depth', 2); } },
    next: 'night2',
  });

  // ---- VANE'S QUESTION (chapter threshold) -----------------------------------------------------
  TB.scene('ch4_threshold', {
    bg: 'station',
    text: (s) => [
      '<em>VANE\'S QUESTION</em>',
      'Day fifty-two. You come back to the small ordered office one more time' + (TB.is('DRAWER_KNOWN') ? '' : ' — and this time, kneeling to steady yourself against the desk, you find what your earlier visits missed: a steel bottom drawer, locked, labeled in a firm hand gone brown with age: <em>"If found: burn unread. — I.V."</em>') + ', because the drawer has been standing in the corner of your mind for days like a held note.',
      'You know what\'s in it. Not the details — the <em>shape</em>: the torn pages. The Incident. What the drill did and what answered it; what stopped the island\'s heart for nine hours in March 1979 and dug two graves under Edda\'s flowering tree. The one chapter of this place\'s story that its own chronicler decided no one should read.',
      'She asked. In her own hand, knowing she\'d likely be dead when it was found, she <em>asked</em>.',
      'The lock is fifty years old and your pry-bar is right there. So is the station\'s fire barrel. So is the long path up a mountain to a woman who was there.',
    ],
    choices: [
      {
        t: '🔓 Open it. The island\'s heart is skipping — you need what she knew.',
        sub: 'Her wishes against your survival, and the survival of whatever\'s coming. Depth calls.',
        do: (s) => { TB.flag('INCIDENT_FILES'); TB.route('depth', 3); TB.flag('CH4_DONE'); }, go: 'ch4_opened',
      },
      {
        t: '🔥 Burn it unread. She earned the last word on her own work.',
        sub: 'Some locks are the only honest warning you get. Let the dead keep their door.',
        do: (s) => { TB.flag('FILES_BURNED'); TB.stat('hope', 5); TB.route('roots', 1); TB.flag('CH4_DONE'); }, go: 'ch4_burned',
      },
      {
        t: '🏮 Carry it up the mountain, unopened, to the one person with the right to choose.',
        sub: 'Not your door. Not your dead. Edda was there.',
        do: (s) => { TB.flag('FILES_TO_EDDA'); TB.state.edda = TB.clamp(TB.state.edda + 8, 0, 100); TB.route('depth', 1); TB.route('roots', 1); TB.flag('CH4_DONE'); }, go: 'ch4_carried',
      },
    ],
  });

  TB.scene('ch4_opened', {
    bg: 'station',
    text: [
      'The lock was fifty years old. The pry-bar is not. You read it all by lamplight, cross-legged on her office floor, and Dr. Ilsa Vane — dead before your parents met — talks to you for three hours in a hand that degrades, page by page, from architecture into scrawl.',
      'The drill reached the resonant stratum on the 9th of March, 1979, at a site up the mountain\'s eastern flank — <em>her map is here</em>, folded, exact: the service road, the bore site, and below it, hatched in urgent pencil, a cave system she names only "the throat." The core came up at 04:11. The Hum stopped at 04:11. Nine hours of silence — her own log of those hours is the scrawl: instruments dead, the sea "wrong," birds rafting offshore in their thousands, and every person at the station reporting the same pressure behind the sternum, "like a word being withheld."',
      'At 13:0 6 the Hum resumed, changed. The bore site did not resume anything: the throat flooded — tidal, violent, impossible by her own hydrology — and it took Ostrander and Kim, and it was three days before the sea gave them back.',
      'Her last full page, in architecture again, deliberate: <em>"Conclusion, for whoever ignored my drawer: the system is not a resonance. It is a HOMEOSTASIS. It regulates — I no longer speculate as to what. We put a hole in it, and it closed the hole with my colleagues inside, and then it went back to its work, which was never about us. Do not touch the throat. Tend the skin. If it ever begins skipping — I hope no one is here to read what that means. — I.V."</em>',
      'You sit a long time with the map on your knees and the lamp burning down, in the office of a woman who hoped you\'d never exist. The island\'s pulse, out beyond the walls, runs its seven beats. Skips. Resumes.',
    ],
    enter: (s) => { if (!TB.is('GULLET_MAP')) { TB.flag('GULLET_MAP'); } },
    next: 'ch4_end',
    nextLabel: 'Chapter Four ends ➤',
  });
  TB.scene('ch4_burned', {
    bg: 'beach-night',
    text: [
      'You carry the drawer out whole and burn it in the station\'s rusted fire barrel at dusk, unopened, standing witness the way you\'d stand at a graveside — because that\'s what it is.',
      'It takes an hour to become ash, and you spend the hour arguing with yourself and losing on both sides, which is how you know the choice was real: everything in that steel might have been the answer to the skipping pulse, the coming season, the whole gathering weight — and it was hers, and she asked, and the asking was the last thing on this island she was able to do.',
      'The flames catch the folder-edges and for one moment — you will never be sure — a fold of paper opens in the updraft and shows you a single line of her architecture before it blackens: <em>"…tend the skin…"</em>',
      'You walk home along the glowing lagoon with the words for company. Whatever the island needs from you, you\'ll learn it the way she\'d have preferred: from the island.',
    ],
    next: 'ch4_end',
    nextLabel: 'Chapter Four ends ➤',
  });
  TB.scene('ch4_carried', {
    bg: 'grove', who: EDDA,
    text: [
      'You carry the steel drawer up the mountain unopened — a full day, the weight of it stupid and correct on your back — and set it on Edda\'s table without one word, label upward.',
      'She looks at it for a long time. Sixty years pass over the old face in no particular order.',
      '"You found her drawer," she says finally. "You read her label. And you carried it up my mountain — <em>unopened</em> — to a woman you\'ve known three weeks." She sits down slowly across from it, and does something you have never seen and will never see again: takes off her competence, entirely, like a coat. "Ilsa wrote that label expecting strangers. She didn\'t plan for there being anyone left who loved her."',
      'She rests her hand flat on the steel. "I know what\'s in it. I helped live it. When the monsoon\'s down on us and there\'s fire enough and tea enough — come up the mountain, castaway. We\'ll open it together, and I\'ll tell you what the pages don\'t say. You\'ve earned the parts I have to say out loud."',
      'The walk home is dark and long and you don\'t mind one step of it.',
    ],
    next: 'ch4_end',
    nextLabel: 'Chapter Four ends ➤',
  });

  TB.scene('ch4_threshold_west', {
    bg: 'beach-dusk',
    text: (s) => [
      '<em>THE VIGIL</em>',
      'Day fifty-two. The monsoon wall stands in the south like a verdict being drafted, and your west-side kingdom is as ready as hands can make it: stores deep, walls braced, water solved' + (TB.is('RYO_MET') ? ', a mending sailor by your fire with a boat above the tideline' : '') + '.',
      'What you don\'t have is the east: the station, its tools, its answers — the road not crossed. The season about to close will decide more than weather: it decides what kind of castaway comes out the other side of it.',
      'You give the last clear evening to the choice.',
    ],
    choices: (s) => [
      { t: '⛵ The sea. Boat, raft, signal — everything bends toward leaving.', sub: 'Commit the season to the horizon.',
        do: () => { TB.flag('WEST_PLAN_SEA'); TB.route('signal', 3); TB.flag('CH4_DONE'); }, go: 'ch4_end' },
      { t: '🏡 The ground. This is home now; build like you mean it.', sub: 'Commit the season to the roots.',
        do: () => { TB.flag('WEST_PLAN_HOME'); TB.route('roots', 3); TB.flag('CH4_DONE'); }, go: 'ch4_end' },
      { t: '🌄 Admit it: the east has been in your dreams all week. Cross when the weather allows.', sub: 'Edda\'s dawn-window offer stands. Late is not never.',
        do: () => { TB.flag('WEST_PLAN_EAST'); TB.route('depth', 2); TB.flag('CH4_DONE'); }, go: 'ch4_end' },
    ],
  });

  // ---- Chapter 4 end card -----------------------------------------------------------------------
  TB.scene('ch4_end', {
    bg: 'beach-night',
    text: (s) => {
      const t = ['<em>END OF CHAPTER FOUR — THE HUM</em>', 'The Ledger\'s pages are filling faster now. Days thirty-six through fifty-two:'];
      if (TB.is('STATION_OPENED')) {
        t.push('— Station Halcyon stands open: the interrupted breakfast, the stores' + (TB.is('E_WING_OPEN') ? ', and the E wing — the crated transmitter, and the seventh rack, and stone that holds your reflection a half-beat late' : ', and an E-wing door still keeping the station\'s one locked thought') + '.');
        const parts = [TB.is('TRANSMITTER') && 'transmitter', TB.is('WIRE') && 'cable', TB.is('FUEL') && 'fuel'].filter(Boolean);
        t.push('— The radio: ' + (TB.is('RADIO_STAGED') ? 'staged and one day\'s assembly from a voice. The monsoon will decide when that day comes.' : parts.length ? parts.join(', ') + ' in hand — the list is ' + (parts.length === 3 ? 'finished, awaiting assembly.' : 'still open.') : 'a surveyed ruin with good bones and an empty list.'));
        t.push('— Vane\'s journals: ' + (TB.is('VANE_J3') ? 'read to the torn pages. The drill, the objection overruled, and a locked drawer labeled in her hand.' : TB.is('VANE_J1') ? 'begun — a mind meeting its one great question.' : 'still squared to the blotter, waiting.'));
        if (TB.is('RECORDER')) t.push('— The chart recorder gave the Hum a body: decades of steady teeth, one nine-hour flatline in March 1979 — and now, in your own nights, the skipping has begun again.');
      } else {
        t.push('— You kept the west, and made it a kingdom: ' + (TB.is('WEST_PLAN_SEA') ? 'aimed, plank by plank, at the horizon.' : TB.is('WEST_PLAN_HOME') ? 'built, post by post, into a home.' : 'with your eyes, at last, turning east.'));
        if (TB.is('WRECK_DRIFT')) t.push('— The sea sent you a broken boat\'s bones, fresh-painted, and the arithmetic that came with them.');
      }
      if (TB.is('RYO_MET')) t.push('— Ryo Nakata, late of the sloop Kingfisher, sleeps by your fire. Two castaways now' + (s.ryo >= 40 ? ', and a boat above the tideline being argued back toward the sea.' : '. He owes you a life and has announced his currencies: boat-work and terrible cooking.'));
      else t.push('— A jet crossed your sky seven miles up, straight as a ruled line, and taught you the size of the silence you live in.');
      if (TB.is('COMP4_DONE') && s.companion) t.push('— ' + NAMES[s.companion] + '\'s station gift: ' + ({ kavi: 'a warning, filed by nose, about what sleeps under the E wing.', ipo: 'a quartermaster\'s trove — fuses, tubes, the radio\'s odds improved and an ego beyond salvage.', vela: 'a road no ground-bound eye could see — the drill\'s road, running for the mountain.', buri: 'a stores trailer excavated from the yard, and a hauling capacity you didn\'t have before.', moa: 'a dead station\'s living garden — feral tomatoes and a cabinet of maybe-viable seed.', nine: 'a film canister from a drowned throat, hidden by Vane herself outside her own files. "Only if—"' }[s.companion]));
      t.push('— And Vane\'s Question: ' + (TB.is('INCIDENT_FILES') ? 'you opened her drawer. The Incident has a shape now — the bore site, the throat, the nine silent hours, and her last instruction: <em>tend the skin.</em> Her map is in your kit.' : TB.is('FILES_BURNED') ? 'you burned it unread, standing witness, and one line escaped in the updraft: <em>tend the skin.</em> The dead keep their door; you keep the words.' : TB.is('FILES_TO_EDDA') ? 'you carried the drawer up the mountain unopened, and watched sixty years take its coat off. When the rains are down, you\'ll open it together.' : 'deferred — the drawer keeps, and the season won\'t.'));
      t.push('Route leanings — Signal ' + s.route.signal + ' · Roots ' + s.route.roots + ' · Depth ' + s.route.depth + '.');
      return t;
    },
    choices: [
      { t: '🌧️ Continue — Chapter Five: The Long Rain ➤', sub: 'The monsoon, the crucible, and the season that decides what kind of castaway you are.',
        go: 'ch5_open' },
      { t: '🌊 Start a new run instead', sub: 'Different station, different sailor, different question.',
        do: () => { TB.wipe(); TB.state = TB.newState(); }, go: 'title' },
    ],
  });
})(window);
