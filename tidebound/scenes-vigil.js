/* =====================================================================
 * scenes-vigil.js — THE OTHER CASTAWAY. After OTHER_HEARD, the
 * nine-beat station stops being a single haunting night and becomes a
 * correspondence: five vigils, four seconds at a time, across the
 * hidden world. Protocols → tradecraft → her silent night (the arc's
 * one choice) → the archipelago → the two-lighthouse pact
 * (M_VIGIL_DONE). One vigil per day, night work, always optional.
 * The OTHER_SIGNAL ending and the ch7 epilogues honor the whole of it.
 * =================================================================== */
(function (G) {
  'use strict';
  const TB = G.TB;
  const backTo = (s) => (s.chapter >= 2 ? 'camp2' : 'camp');

  const prevActs = TB.ch3Actions;
  TB.ch3Actions = function (s) {
    const c = prevActs ? prevActs(s) : [];
    const st = s.vigil | 0;
    if (TB.is('OTHER_HEARD') && st < 5 && s.vigilDay !== s.day) c.push({
      grp: 'story',
      t: '📻 Keep the nine-beat vigil' + (st ? ' (' + (st + 1) + ')' : ''),
      sub: ['She said "listening, out." Listening means schedules. Find hers.', 'Two keepers, four seconds a night. There is so much to trade.', 'Her window was empty last vigil. And the one before.', 'She promised you a number tonight: how many quiet places the world is keeping.', 'One thing left to settle between two lighthouses: the terms.'][st],
      do: () => { const s2 = TB.state; s2.vigilDay = s2.day; s2.vigil = (s2.vigil | 0) + 1; TB.stat('energy', -5); TB.tickSegment(); },
      go: (s2) => 'vigil_' + ((TB.state.vigil | 0)),
    });
    // THE TWELFTH HOUR — NG+ only: after the pact, M.'s dead-station hour
    // becomes something a second keeper can hold with her. Two beats, and
    // the Archipelago stops being a number and becomes a future.
    if (s.flags.NGPLUS && TB.is('M_VIGIL_DONE') && TB.is('RADIO_DONE') && !TB.is('TWELVE_DONE') && s.twelveDay !== s.day) c.push({
      grp: 'story',
      t: '🕛 Keep the twelve-beat hour' + (TB.is('TWELVE1') ? ' (again)' : ''),
      sub: TB.is('TWELVE1')
        ? 'Last hour, at the end, the Hum held its breath on a dead station\'s frequency. M. heard it too. The hour has come around again.'
        : 'First vigil of the month, M. still listens on the twelve-beat island\'s hour. Nine years of nothing. Tonight, keep it with her.',
      do: () => { const s2 = TB.state; s2.twelveDay = s2.day; TB.stat('energy', -5); TB.tickSegment(); },
      go: (s2) => (TB.is('TWELVE1') ? 'twelve_2' : 'twelve_1'),
    });
    return c;
  };

  TB.scene('vigil_1', {
    bg: 'station', art: 'ev-vigil',
    enter: (s) => { if (!TB.is('VIGIL1')) { TB.flag('VIGIL1'); TB.stat('hope', 4); TB.route('signal', 1); } },
    text: [
      'It takes three skips to learn her schedule and one to learn her manners. She keys on the alternate windows — hers to yours, yours to hers, so nobody talks over anybody\'s four seconds — and she runs her transmissions like telegrams from a person who has done this for years: <em>facts first, feelings last, sign always.</em>',
      '<em>"Nine-beat station. Island: cold. Hum: lives in the aurora, not the tide. Keeper: one. Duration: eleven years."</em> A breath — even her breaths are budgeted — <em>"Good to not be one of one, seven-beat. Sign: M."</em>',
      'M. That\'s all you get, and you understand immediately that it\'s not caution, it\'s CUSTOM: names are for the ends of things, and neither of your islands is done with either of you. You key back your own telegram — island green, Hum in the water, keeper one, duration ninety-some days — and sign it the only way that makes sense now: <em>S.,</em> for seven.',
      'Eleven years. You sit with that number a long time after the Hum closes. Eleven years of keeping a light nobody ordered her to keep. The amber dials hold steady. Somewhere across the curve of the world, so does she.',
    ],
    next: (s) => backTo(s),
  });

  TB.scene('vigil_2', {
    bg: 'station', art: 'ev-vigil',
    enter: (s) => { if (!TB.is('VIGIL2')) { TB.flag('VIGIL2'); TB.flag('M_WEATHERWISE'); TB.stat('hope', 4); } },
    text: [
      'Tonight is trade night, and she goes first: <em>"Before big weather, your Hum will hold its breath. Not skip — HOLD. Longer than the pattern. Count it. Hours of warning, seven-beat. My aurora does the same. All of them do."</em> You write it on the wall above the console, where the important arithmetic lives. The island\'s weather report, hiding in the rests all along.',
      'Your turn. You give her the counting song — six for the living, one for the door — tapping it out beat-slow across two windows, and the seven-beat structure of everything, and, because the window has room left, the coconut arithmetic of your first week.',
      'And then it happens, half-swallowed by the closing Hum, unmistakable: <em>she laughs.</em> Four seconds of static with a laugh inside it, eleven years old and rusty at the hinges and entirely real. "<em>Coconuts,</em>" she manages, the way you\'d say a password. "<em>Ours was LICHEN. Sign: M.</em>"',
      'You walk home under the wheeling stars feeling — there is no other word for this — <em>neighborly</em>. The world has a street now. There is a light on across it.',
    ],
    next: (s) => backTo(s),
  });

  TB.scene('vigil_3', {
    bg: 'station', art: 'ev-vigil',
    text: [
      'Her window opens empty.',
      'It has never opened empty. You wait through the skip with your whole body, and the next one, and the one after — three black rectangles of honest nothing where a person is supposed to be — and then, on the fourth, a fragment, faint even by her standards, and wrong in a way that reorganizes your chest: <em>"…ice storm. Tower dark. Generator — "</em> the Hum leans in — <em>" — working the problem. Not afraid. Sign—"</em> and the window slams before the lie about not being afraid can finish.',
      'Her light is out. Her hands are working a dead generator in the kind of cold your island has never once asked you to imagine, and the only thing on Earth that knows is a castaway an ocean away with four seconds a night and a transmitter that drinks fuel like a bonfire.',
    ],
    choices: (s) => [
      { t: '🔥 Burn the transmitter reserve. Talk her through the night.', sub: 'Boost the signal and hold every window till dawn. Costs the fuel you were saving, and most of you.',
        do: () => { const s2 = TB.state; TB.flag('VIGIL3'); TB.flag('M_SAVED'); TB.stat('energy', -10); TB.stat('hope', 8); s2.out = { bg: 'station', art: 'ev-vigil', text: [
          'You run the transmitter hot on the reserve and you do the only thing four seconds at a time can do: you keep her company at full strength. Window after window, all night, you read her your island — the grove and the crabs and the ridiculous coconut with the face, the lagoon\'s slow glow, the way dawn comes up the beach like a tide of its own — pushing each little postcard of warm through the dark to a woman fixing a generator by feel in the screaming cold.',
          'She doesn\'t answer for six hours. You keep sending. That\'s the whole of the job description, you understand now, hers and yours both: <em>you keep sending.</em>',
          'At the grey edge of morning her window opens and the nine beats are THERE — strong, steady, indecently casual — and then: <em>"Tower lit. Generator: argued with. Seven-beat—"</em> a pause that costs her something, <em>"—I heard every word. All night. It helped. Nobody has read me a coconut in eleven years. Sign: M."</em>',
          'You sleep till noon and wake up certain of one thing: whatever the sea thinks it separated when it hid these islands, it has failed.',
        ] }; },
        go: 'act_result' },
      { t: '📻 Hold the protocol. Trust her craft.', sub: 'Eleven years says she knows her tower. Burning your reserve helps nobody twice.',
        do: () => { const s2 = TB.state; TB.flag('VIGIL3'); TB.stat('hope', 2); s2.out = { bg: 'station', art: 'ev-vigil', text: [
          'You hold. It is the hardest kind of help there is — the kind that looks exactly like doing nothing — and you keep the ordinary vigil through two empty nights with your discipline gripped in both hands, telling yourself what you know is true: eleven years. She has survived eleven years of nights you know nothing about.',
          'On the third night the nine beats return, steady as ever, and her telegram is four seconds of pure understatement: <em>"Tower lit. Weather: educational. Status: one of one, still. Sign: M."</em>',
          'Relief arrives with a splinter in it that never quite works loose: she was in the dark for three days, and the protocol says you did the right thing, and the protocol is probably even correct. You add a line to the wall above the console anyway, where the important arithmetic lives: <em>next time, burn the fuel.</em>',
        ] }; },
        go: 'act_result' },
    ],
  });

  TB.scene('vigil_4', {
    bg: 'station', art: 'ev-vigil',
    enter: (s) => { if (!TB.is('VIGIL4')) { TB.flag('VIGIL4'); TB.flag('ARCHIPELAGO'); TB.route('depth', 2); TB.stat('hope', 4); } },
    text: (s) => [
      'She promised you a number, and she keeps it the way she keeps everything: precisely, and with eleven years of weight behind it. <em>"Five,"</em> she says. <em>"That I have HEARD. Seven-beat, nine-beat, and three more: a four, a twelve, and one that does not count at all — it sings. The world keeps more quiet places than two, seven-beat. We are an ARCHIPELAGO. No chart will ever hold us, and that is the point of us."</em>',
      'Then, in the next window, quieter: <em>"The twelve went silent nine years ago. Mid-schedule. I still listen on their hour, first vigil of every month."</em> A held breath you\'ve learned to read. <em>"Keepers end, seven-beat. Islands wait. Somewhere on the twelve-beat island there is a radio going to rust, and one day someone will wash in and find it, and my hour will be waiting for them. That is the job. Now you know the whole of it."</em>',
      'You trade the last trade: the things you\'d carry out of a fire. You read her the photograph — the pier, the laugh, the half-painted board — all nine fragments across three nights of windows' + (TB.is('COURIER_RESTED') ? ', and the cairn on the point that holds the story now' : '') + '. Hers is a brass compass, uncased, needle long gone: <em>"It pointed at my mountain the day my compass died with everyone else\'s. I keep it to remember the world has more norths than one."</em>',
      'Five islands. Five, at least. You stand outside the station afterward under the enormous practical stars and feel the planet quietly reorganize itself: not a world with one impossible island in it. A world with a hidden ARCHIPELAGO — and you, now, one of its keepers on the roll.',
    ],
    next: (s) => backTo(s),
  });

  TB.scene('vigil_5', {
    bg: 'station', art: 'ev-vigil',
    enter: (s) => { if (!TB.is('M_VIGIL_DONE')) { TB.flag('M_VIGIL_DONE'); TB.stat('hope', 8); TB.route('signal', 1); TB.route('depth', 1); } },
    text: (s) => [
      'The last thing between you is terms, and she proposes them like the treaty they are: <em>"Every seventh night. One hour, your midnight. Whoever is still keeping, keeps it. No goodbyes on the schedule — goodbyes are for the ends of things, and lighthouses do not end, they just change keepers. Agreed?"</em>',
      '<em>"Agreed,"</em> you send, and the word barely fits in the window, and it is the most binding thing you have signed in your life.',
      'And then she breaks her own custom, once, deliberately, in the exact middle of the night\'s last skip — no facts first, no sign after, just a name, HER name, plain and whole, spent like a coin she\'d saved eleven years. You give her yours back with two seconds to spare. The Hum closes over both of them.',
      'You never write it down. Neither, you are certain, does she. Names are for the ends of things — except once, between keepers, at the founding of a pact: <em>every seventh night, one hour, whoever is still keeping.</em> Two lighthouses, one hidden sea. The light is on. The light stays on.',
    ],
    next: (s) => backTo(s),
  });

  // ---- THE TWELFTH HOUR (NG+): the dead station's hour, kept by two -------
  TB.scene('twelve_1', {
    bg: 'station', art: 'ev-vigil',
    enter: (s) => { if (!TB.is('TWELVE1')) { TB.flag('TWELVE1'); TB.route('depth', 1); TB.stat('hope', 2); } },
    text: (s) => [
      'First vigil of the month, and tonight you do what she has done alone for nine years: you turn your dial to a dead island\'s frequency and you keep its hour.',
      'She walks you into the custom like a sexton showing you the bells. <em>"Twelve-beat went silent mid-schedule. No distress, no sign-off. Keepers end, seven-beat; islands wait. So: one hour, first vigil, every month. You listen. You log the nothing. The nothing is the record that somebody is still expecting them."</em> For fifty-eight minutes the two of you sit an ocean apart in the same silence, trading no telegrams, spending your windows on company instead — and the hour is not sad, which surprises you. It\'s a lit doorway. It\'s a chair kept empty on purpose.',
      'And then, in the hour\'s last minute, the Hum does the thing you know from before big weather — it holds its breath. Longer than the pattern. Longer than any storm ever bought.' + (TB.is('M_WEATHERWISE') ? ' You count it the way she taught you, and the count comes back wrong for weather and wrong for tide and wrong for everything except the one thing you don\'t dare say first.' : ' You have no name for the count it makes.'),
      'M.\'s window opens with two seconds spent on protocol and the rest on a whisper she\'d deny: <em>"You felt that. Sign: M."</em> Not a question. You look at the amber dials a long time before you sleep' + (s.flags.NGPLUS ? ', and the feeling that walks you home is one the island has given you before: the certainty of a song you know before the second verse. Something is coming around again.' : '.'),
    ],
    next: (s) => backTo(s),
  });
  TB.scene('twelve_2', {
    bg: 'station', art: 'ev-vigil',
    enter: (s) => { if (!TB.is('TWELVE_HEARD')) { TB.flag('TWELVE_HEARD'); TB.flag('TWELVE_DONE'); TB.route('depth', 2); TB.stat('hope', 8); } },
    text: (s) => [
      'The hour comes around, and the two of you take your chairs in the dark, and for forty minutes the dead frequency is its faithful, kept-empty self.',
      'Then, at 3:07 by your wall of important arithmetic, the window opens on something that is not nothing: <em>twelve beats.</em> Ragged. Wrong-spaced. Halting where the old recordings M. once described never halted — like someone playing an instrument found in an attic, with cold hands, from a diagram. Twelve, a silence that lasts a lifetime, and twelve again. Then the Hum closes, and the frequency is empty, and stays empty, and the hour ends.',
      'M. spends her entire next window on four seconds of silence — paid deliberately, like coins on a counter — before the telegram comes: <em>"Nine years. Somebody washed in. Somebody FOUND IT. They don\'t know the language yet — they counted twelve because the radio was LABELED."</em> A breath. <em>"That is how I started, seven-beat. That is how everyone starts."</em>',
      'The two of you adopt the hour on the spot, no discussion needed, terms amended like a treaty gaining a clause: first vigil of every month, both lighthouses listening, until the new keeper of the twelve-beat island finds their hands. Somewhere out on the hidden sea a terrified castaway has just keyed twelve beats into what they believe is dead air, and two islands they cannot imagine are already keeping their light.',
      '<em>The Archipelago is not a number anymore. It\'s a roll being called — and it grows.</em>',
    ],
    next: (s) => backTo(s),
  });
})(window);
