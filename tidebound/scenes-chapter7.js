/* =====================================================================
 * scenes-chapter7.js — Chapter Seven: Convergence, and the endings.
 * A short bridge (the aftermath of the Tidewell), then THE CONVERGENCE
 * — the run's final choice, whose options are assembled from the whole
 * Ledger — and a parameterized ending engine: each ending is a core
 * card plus epilogue paragraphs assembled from this run's specific
 * flags, closing with THE LEDGER OPENS report.
 * =================================================================== */
(function (G) {
  'use strict';
  const TB = G.TB;

  const NAMES = { kavi: 'Kavi', ipo: 'Ipo', vela: 'Vela', buri: 'Buri', moa: 'Moa', nine: 'Nine' };
  const homeName = () => (TB.is('NAME_ROOTSTEAD') ? 'Rootstead' : TB.is('NAME_DRIFTWOOD') ? 'Driftwood' : TB.is('NAME_LANDING') ? 'The Landing' : 'the homestead');

  // ---- Chapter open: the aftermath week ------------------------------------------------
  TB.scene('ch7_open', {
    bg: (s) => (TB.is('TIDEWELL_SILENCE') ? 'beach-day' : TB.is('TIDEWELL_KEEP') ? 'temple' : 'beach-night'),
    enter: (s) => { if (s.chapter < 7) { s.chapter = 7; s.day = 34; s.seg = 0; } },
    text: (s) => {
      const t = ['<em>CHAPTER SEVEN — CONVERGENCE</em>', 'The week after the mountain is the strangest of your life, and you measure strangeness differently now.'];
      if (TB.is('TIDEWELL_SILENCE')) t.push('The island changes key around you, day by day: the lagoon\'s glow fading like a lamp turned down slow, the compass needle settling — actually settling, trembling toward a true and ordinary north — and on the sixth morning, high and glinting and impossible, an aircraft alters course. A wing dips. Someone, seven miles up, has seen an island that was never there before, and somewhere in the world a chart is being corrected, and after the chart, ships.', 'You have perhaps days. The world is coming, with everything the world brings, and every life on this island — yours, Edda\'s, the Green\'s two thousand — is about to be found with you.');
      else if (TB.is('TIDEWELL_FEED')) t.push('The island settles around your pledge like a patient after the splint: the tremors gone, the lagoon burning its seven beats brighter than you\'ve ever seen, the veil whole and deep. The world will not come. The world CANNOT come — you gave your strength to that certainty at the top of the mountain.', 'Which leaves, standing quietly at the center of everything you\'ve built, the question the island cannot answer for you: inside the veil you saved — what now, castaway? The hundred days come due.');
      else if (TB.is('TIDEWELL_KEEP')) t.push('You learn the post the way you learned everything here: by doing it wrong slightly less each day. The parish reports in constantly now — you feel the reef\'s weather and the Green Deep\'s hunger and the wound\'s slow knitting the way you feel your own pulse — and the work is real: a fouled channel worried loose, a sick heronry visited, the Boar King\'s wallow (you know now, always, exactly where he is) given its wide respectful margin.', 'But the covenant, you\'re finding, binds the island to you as much as you to it — and it leaves your two feet free. Keepers walked to their own choices, the murals say. The hundred days come due, keeper. Where do you keep FROM?');
      else t.push('You come down the ten thousand stairs having chosen not to choose, and find the island — you\'d swear it — treating you more gently for it: the tremors easing on their own, the pulse steadier, as if the Tidewell\'s reading of you settled something the mountain had been asking. Naia was right. The not-doing weighed.', 'But your own question kept every step of the way down with you, patient as tide, and it is waiting at your fire when you arrive: the hundred days come due. What does the castaway of Vessakai do with the life they built?');
      if (s.companion) t.push(NAMES[s.companion] + ' — who climbed a mountain for you, or with you; the distinction stopped existing weeks ago — resumes the old routines at your side and watches you think. Whatever you choose, the choosing has an audience now, and the audience has a stake.');
      return t;
    },
    nextLabel: 'The hundred days come due ➤',
    next: 'convergence',
  });

  // ---- THE CONVERGENCE -------------------------------------------------------------------
  TB.scene('convergence', {
    bg: 'beach-dusk',
    text: (s) => [
      '<em>THE CONVERGENCE</em>',
      'You give it the honest setting: dusk, the tideline, the whole bright toy of your world laid out — the camp' + (TB.is('HOME_NAMED') ? ' (no: <em>' + homeName() + '</em>; it earned the name)' : '') + ', the smoke of your fire' + (TB.is('EDDA_WINTER') ? ', Edda\'s second smoke beside it' : '') + (TB.is('RYO_MET') ? ', the Kingfisher\'s patched mast against the sky' : '') + ', the mountain behind everything with its broken crown and its kept secrets.',
      'One hundred days ago the sea threw you onto this sand with a lighter and a photograph. Tonight the island — hidden or found, kept or keeping — waits on your word.',
      'Choose the rest of your life, castaway.',
    ],
    choices: (s) => {
      const c = [];
      const kindred = s.companion && s.trust >= 90;
      const perfect = kindred && TB.regard() >= 6 && s.edda >= 60 && (TB.is('INNER_GREEN') || TB.is('TIDEWELL_KEEP') || TB.is('TIDEWELL_WITNESS'));
      if (TB.is('TIDEWELL_SILENCE')) {
        c.push({ t: '🚢 Meet the ships. Go home — and carry the island\'s story carefully.', sub: 'The Found Shore. Rescue, return, and everything after.', do: () => { TB.state.endingId = 'RESCUE'; }, go: 'ending' });
        c.push({ t: '🏝️ Stay as the world arrives. Be the one who was here first.', sub: 'The First Citizen. Homestead deed and all.', do: () => { TB.state.endingId = 'STAY_OPEN'; }, go: 'ending' });
        if (TB.is('INNER_GREEN') || TB.is('NAIA_TRUSTED')) c.push({ t: '🌿 Stand between the world and the Inner Green. Someone must translate.', sub: 'The Interpreter. The hardest job the new charts will create.', do: () => { TB.state.endingId = 'BROKER'; }, go: 'ending' });
      } else if (TB.is('TIDEWELL_KEEP')) {
        c.push({ t: '🕯️ Keep the island. This is the post, and the post is home.', sub: 'Guardian of the Deep.', do: () => { TB.state.endingId = TB.is('INNER_GREEN') ? 'COVENANT' : 'KEEPER'; }, go: 'ending' });
        if (TB.is('CONTACT_MADE')) c.push({ t: '📻 Keep the island — and keep the window. A voice through the skips, forever.', sub: 'Keeper of the Window. Hidden, and not alone.', do: () => { TB.state.endingId = 'TWO_WORLDS'; }, go: 'ending' });
      } else {
        // FEED or WITNESS: the veil holds (or holds itself); life inside it
        c.push({ t: '🏡 Stay. This is home now — dig the roots all the way down.', sub: (TB.is('HOME_NAMED') ? homeName() + ' forever. ' : '') + (TB.is('RYO_MET') ? 'And where two castaways settle, more will wash in. The island provides.' : 'The life you built, chosen twice.'), do: () => { TB.state.endingId = (TB.is('RYO_MET') && (TB.is('EDDA_WINTER') || TB.is('EDDA_TENDED'))) ? 'VILLAGE' : 'HOME'; }, go: 'ending' });
        if (TB.is('INNER_GREEN')) c.push({ t: '🌿 Go up the mountain for good. The Green has a door with your name on it.', sub: 'The Inner Green. First outsider; last outsider.', do: () => { TB.state.endingId = 'JOIN'; }, go: 'ending' });
        if (TB.is('VESSEL_READY') || TB.is('CONTACT_MADE')) {
          if (perfect) c.push({ t: '🌅 Sail — with the island\'s blessing, and the right of return.', sub: 'The Whole Sky. Everything, held with open hands.', do: () => { TB.state.endingId = 'WHOLE_SKY'; }, go: 'ending' });
          else if (TB.is('RYO_MET') && TB.state.ryo >= 40) c.push({ t: '⛵ Sail with Ryo when the fair season opens.', sub: 'Two Sails Out. The Kingfisher keeps her promise.', do: () => { TB.state.endingId = 'RYO_BOAT'; }, go: 'ending' });
          else c.push({ t: '🌊 Sail. Through the veil\'s one window, out, and away.', sub: kindred ? 'Two tickets. ' + NAMES[s.companion] + ' boards or it doesn\'t happen.' : 'The Long Swim — alone, the way you arrived.', do: () => { TB.state.endingId = kindred ? 'SAIL_BLESSED' : 'LONG_SWIM'; }, go: 'ending' });
        }
      }
      if (!s.companion && TB.is('COCO')) c.push({ t: '🥥 …Run the whole plan past Coco first.', sub: 'He has been very patient.', do: () => { TB.state.endingId = 'COCO'; }, go: 'ending' });
      return c;
    },
  });

  // ---- The ending engine -----------------------------------------------------------------
  const CORES = {
    RESCUE: { icon: '🌅', title: 'THE FOUND SHORE', bg: 'beach-day', body: [
      'The ship comes on the ninth day of the found world — grey-hulled, astonished, its whole rail lined with binoculars — and you meet it standing in the surf of your own beach, burned dark and rope-muscled, with one hundred days in your beard and your Ledger by heart.',
      'The rescue is chaos and paperwork and satellite phones, and you move through it strangely calm: you have negotiated with a crocodile; a coast guard lieutenant holds no terrors. You tell the truth carefully — the crash, the survival, the old woman on the mountain who declines (with a shotgun\'s eloquence) to be rescued — and you keep what needs keeping, and when the ship turns for home the island stands behind you on the horizon: found, charted, changed forever — and still, in the ways that matter, keeping its own counsel.',
      'You go home. Home is strange now — soft floors, loud rooms, water that arrives by pipe like a miracle nobody worships. You are, the doctors say, remarkably well. You are, you know privately, remarkably DIFFERENT: you own a compass that points true and you check it, some nights, hoping faintly that it\'s started to lie.',
    ] },
    STAY_OPEN: { icon: '🍂', title: 'THE FIRST CITIZEN', bg: 'beach-day', body: [
      'The world arrives in stages — survey ship, science teams, one bewildered consular officer — and finds, established on the southern shore with fortifications, agriculture, and opinions: <em>you</em>.',
      'You stay. Not marooned now — a resident. First resident: when the charts are drawn and the claims are argued (they are argued; you decline to care), your beach is grandfathered around you, and the maps that finally name this island mark, in small letters at the southern bay, your fire.',
      'The world builds a research station (a new one; you made them site it far from the old) and a small pier, and the world is mostly, blessedly, not interested in one weathered settler. You trade fish for coffee. You give the newcomers unbearably accurate advice. You are, within three years, a legend they tell arriving scientists: the one who was here when it lit up on the charts. The one the island kept first.',
    ] },
    BROKER: { icon: '🌀', title: 'THE INTERPRETER', bg: 'caldera', body: [
      'The world finds the island; you make sure it finds you first — standing on the beach beside its first landing party with the sun-dark authority of a hundred days and the words that will bend the next century: <em>"Before you walk inland, there are people here. And I speak for them until they choose to speak."</em>',
      'The years that follow are the hardest, best work of your life: treaties where there were never treaties, charts with a two-mile hole held blank at the caldera by international agreement and your unsleeping vigilance, journalists turned away, one government humiliated publicly and precisely when it tried to fly a survey drone over the crown. Tekau calls you, in Kaari, a word that means "the hinge." Naia — councilwoman Naia, now, her English no longer halting — stands beside you at every table.',
      'The Inner Green chooses its own pace into the found world: slow, sovereign, on terms carved — like everything they make — to last. The hinge holds. The door opens only as far as its people push it.',
    ] },
    HOME: { icon: '🌅', title: 'ROOTSTEAD', bg: 'camp-fringe', body: [
      'You stay. It isn\'t even a decision by the time you say it out loud — it\'s a description, the way the Tidewell is a description: this is home; you are held.',
      'The seasons take up their great wheel. The farm doubles, then learns to feed the soil that feeds it. The house grows rooms the way trees grow rings — the good table at the center of everything, the fire that has not fully died since the day you first coaxed it. You keep the calendar by the lagoon\'s pulse and the junglefowl\'s politics, and the day you catch yourself unable to remember what month the world would call it, you laugh alone in your rows for ten minutes.',
      'You are not waiting for anything. That\'s the crop that took longest: a life so present-tense that rescue, arriving now, would knock like a stranger at a full table.',
    ] },
    VILLAGE: { icon: '🌅', title: 'DRIFTWOOD RISING', bg: 'camp-fringe', body: [
      'It begins as a household and becomes, before you quite ratify it, a town.',
      'The island keeps reeling in its shipwrecked — a fishing crew the next wet season, two sailors the year after, once an entire capsized dive charter, indignant and dripping — and now, when the sea delivers them, there is a light on the southern shore, and a table, and Edda\'s medicine, and Ryo\'s boatyard, and your Ledger of everything this island will and will not forgive. Some stay. The stayers build.',
      'Driftwood, the charts would call it, if any charts could find it: population thirty-one and irregular, government by table, economy of salvage and generosity. You never named yourself anything in it, and it never needed you to. Everyone knows whose fire was first.',
    ] },
    JOIN: { icon: '🌅', title: 'THE INNER GREEN', bg: 'caldera', body: [
      'You go up the ten thousand stairs one last time as a visitor, and never again as one.',
      'They give you a house at the terrace-edge where the morning comes first, and work — real work, no guest\'s ceremony: irrigation to mind, walls to keep, and (Tekau insists, to your alarm and then your life\'s strange joy) TEACHING: the world\'s words, the world\'s ways, banked like fire against the day the veil is ever tested. Naia\'s children learn your language sitting on your steps. You learn theirs badly, to general delight.',
      'You dream in Kaari within two years. You stand at the Tidewell festivals in the keeper\'s line with everyone else, one more pair of hands the island counted and kept. Of the world you came from you miss, in the end, exactly two things — and you could no longer say what they were, only that the missing has become part of the shape of a whole and honored life.',
    ] },
    KEEPER: { icon: '🌀', title: 'GUARDIAN OF THE DEEP', bg: 'temple', body: [
      'The post is real, and you keep it.',
      'Your years take the shape of the island\'s: monsoon and dry, spawn and bloom, the wound under the mountain knitting by slow degrees under your attention like a fire banked just so. You know the reef\'s moods now the way you knew streets once. The Boar King dies old, in his wallow, and you sit with him; Old Grin outlives everything, as was always his policy, and the two of you maintain, at the ford, a courtesy of long standing.',
      'Sailors\' stories grow up around your sea like coral: an island that isn\'t there, and something in it that decides. They\'re wrong about every detail and right about the whole. The island hides; the keeper tends; the lagoon keeps its seven beats against the dark, brighter every year — and if some nights the post is lonely past all telling, it is never once, in all your years, unloved.',
    ] },
    COVENANT: { icon: '🌅', title: 'THE COVENANT PASSED', bg: 'temple', body: [
      'Keeper — but never alone. That is the covenant as the Inner Green restores it, whole, around you: the post filled and the people back at the pool.',
      'They rebuild the temple stair within the year. The festivals return to the nave — the first in three centuries, Tekau weeping openly and denying it in the same breath — and your keeping becomes what the murals always showed: one hooded figure at the water, and a whole civilization at their back. Naia trains beside you at the pool; her daughter, years on, trains beside her; the line that waited three hundred years for one freely-choosing stranger will never again be one deep.',
      'Edda, in her last spring, comes up the mountain on a chair the Green carries — furious about it, radiant — to see the pool kept properly before the end. "Well," she says at the water\'s edge, sixty years of exile resolving in her face like weather clearing. "Well. Ilsa. Look at this."',
    ] },
    TWO_WORLDS: { icon: '🌀', title: 'KEEPER OF THE WINDOW', bg: 'station', body: [
      'You keep the island — and once a night, in the skip\'s held black seconds, the island lets you keep a voice.',
      'It becomes the strangest correspondence on Earth: four seconds at a time, station to station across a veil no chart can pierce, with an operator somewhere in the found world who has learned your rhythm and keeps your secret because you asked and because — she says, in four-second installments spread over a month — nobody in her life has ever needed her at 2:14 a.m. as reliably as you. News comes in over years like sediment: elections, seasons, her daughter\'s wedding. Your reports go out: sailors saved, storms coming, once a drifting yacht steered to safe harbor by "an anonymous coastal station" that seven navies never found.',
      'The island permits it, you understand eventually, because the island LIKES it: a keeper who holds the door closed and the window open. Hidden, and not alone. It was always possible. It just needed someone to be both.',
    ] },
    SAIL_BLESSED: { icon: '🍂', title: 'TWO TICKETS OUT', bg: 'ocean-night', body: [
      'You sail on the first fair morning of the dry season, through the reef gate at slack tide, with your whole hundred days stowed and lashed — and your companion aboard, because that was the one term the horizon was never getting you without.',
      'The crossing takes nine days and tries to kill you twice, in the old sea\'s old ways, and fails: you are not who the sky dropped here. When the shipping lane finally lifts a hull over the horizon, your flare — the last one, kept a hundred days for exactly this — goes up like a promise kept.',
      'The world takes you back with paperwork and wonder. It has no category for what stands beside you on the rescue deck — quarantine is discussed, briefly, by people who have not yet met the animal in question — and it adjusts, as the world does. You live near the sea, after. You were always going to. And some nights, on the right wind, you both go down to the water and stand very still, listening for a rhythm the charts never found.',
    ] },
    RYO_BOAT: { icon: '🌅', title: 'TWO SAILS OUT', bg: 'ocean-night', body: [
      'The Kingfisher goes out through the reef gate on the first fair morning of the dry season, patched and graceless and singing at every seam, with two castaways aboard who between them owe the sea nothing at all.',
      'Ryo cries at the wheel for the first hour and blames the salt. The crossing is his masterpiece: eleven days threaded through weather you\'d never have read alone, to a shipping lane, to a stunned freighter, to a harbor where a man who lost everything to the sailing dream brings his salvaged boat and his salvaged self alongside, very gently, and just sits there awhile with his hands on the wheel.',
      'You stay friends the way crew stay friends: permanently, at any distance. The Kingfisher, rebuilt properly, does eventually finish a circumnavigation — you fly out for the last leg — and if her log\'s middle chapter reads like myth, the two of you have long since stopped arguing with anyone about it. You know where the island is. It knows where you are. Everyone keeps the arrangement.',
    ] },
    LONG_SWIM: { icon: '🍂', title: 'THE LONG SWIM', bg: 'ocean-night', body: [
      'You go alone, the way you arrived.',
      'The raft holds. The window in the veil lets you through — you feel it happen, a pressure lifting off the compass at dusk on the second day, like a hand opening — and after that it is only the ocean, the old honest enormous ocean, and you, for eleven days that burn off everything inessential that a hundred island days hadn\'t already claimed.',
      'The tanker that finds you gives you a bunk and a phone and the world back. You take it. You use it well — you find, to your surprise, that you know how to live now, anywhere, which was perhaps the island\'s parting gift or perhaps its point. But you left the fire banked and the door unlatched, wherever it was you left them, and on quiet nights for the rest of your life the seventh beat of anything — music, rain, a heart — turns your head toward the sea.',
    ] },
    WHOLE_SKY: { icon: '🌅', title: 'THE WHOLE SKY', bg: 'title', body: [
      'You leave with the island\'s blessing, which is a thing no chart, no science, and no story you\'ll ever tell can hold: the Tidewell read your going and APPROVED it, and the veil opens for your sail like a hand ushering you through.',
      'And you come back. That is the whole of the miracle, the ending past the endings: the world takes you in, hears what you choose to tell, gives you your life — and every year, when the dry season opens, a small weathered boat threads a passage that exists for no other hull on Earth, and the island rises green off the bow, and they are all on the beach. The old woman with the braid, straighter-backed than her years allow, pretending she wasn\'t watching for the sail since dawn. The sailor and his boatyard flags. The watcher-turned-friend, waving from the surf like the girl she never got to be. And at the water\'s edge, before everyone, first into the shallows —',
      '— your companion, who never doubted, because you promised, and the island keeps the promises of those it keeps.',
      'Two lives, held with open hands, and the whole sky between them yours.',
    ] },
    COCO: { icon: '😂', title: 'COCO UNDERSTANDS', bg: 'beach-night', body: [
      'You explain the whole thing to Coco: the options, the stakes, the Tidewell, the state of your heart. It takes two hours. You use diagrams.',
      'Coco listens the way he has listened through everything — the storms, the fevers, the mountain — with his three dark pores arranged in that expression of measured, unshakable confidence. When you finish, the fire ticks. The lagoon runs its seven beats. And in the silence where his answer would go, you finally hear it: the thing he has been telling you since Day 6.',
      'It was never about which door, castaway. It was about the fact that you stopped, and asked, and could bear to hear an answer. You\'re not the person the sky dropped here. THAT person needed rescuing.',
      'You thank him. You mean it more than you\'ve meant anything. And then — properly briefed at last — you turn back toward the fire, and the doors, and choose like someone who was always going to be all right.',
      '<em>(Achievement unlocked: he was a good listener. He was the ONLY listener.)</em>',
    ] },
  };

  function epilogue(s, id) {
    const t = [];
    const leaving = id === 'RESCUE' || id === 'SAIL_BLESSED' || id === 'RYO_BOAT' || id === 'LONG_SWIM';
    if (s.companion && id !== 'COCO') {
      const c = s.companion;
      if (leaving && id !== 'SAIL_BLESSED' && id !== 'WHOLE_SKY') {
        t.push('— ' + ({ kavi: 'Kavi watches your boat from the tideline until it is nothing, and then — the pack has long since made its peace — turns inland, to the wild that always held his other half. Some nights, sailors becalmed off an uncharted sea swear they hear a dog singing.', ipo: 'Ipo inspects the boat, the horizon, and you — and delivers his verdict by climbing to the highest palm and NOT following. His island, his kingdom, his troop to run at last. The lighter, you find later, is in your pack. Paid in full.', vela: 'Vela escorts you to the reef gate and one mile beyond — further over open water than she has flown in years — and banks away at last in one wide, deliberate circle: the blind side, then the good eye, then gone. The account closes in credit. Hers.', buri: 'Buri cannot come — you know it, he knows it, and the last morning he leans his whole warm mass against you one final time and then, with the dignity of a king, does not watch you go. The homestead is his now. Heaven help anything that raids it.', moa: 'Moa you carry to Edda\'s grove yourself, the night before — the one goodbye you couldn\'t do at a tideline. The old woman takes the basket without a word, and the small copper hen stands on her wrist facing the sea, and between the two of them your leaving is, at last, permitted.', nine: 'Nine follows the hull out — you see her in the bow-wave glow, keeping pace, one long arm breaking the surface once in that unmistakable spiral — to the reef gate, and no further. Her whole world ends at that line. Yours, she has always known, never did. The last you see is the light of her, going down.' }[c]));
      } else if (!leaving) {
        t.push('— ' + ({ kavi: 'Kavi grows grey-muzzled at your fire, patriarch of a line of half-wild pups who own the middle distance of your every horizon. He sleeps touching your back to the end of his days, and he is buried on the hill with honors, and the pack sings over it, and you finally, fully, sing back.', ipo: 'Ipo achieves everything: the troop (his, in time, by a palace intrigue you witnessed and still don\'t understand), the treasury (moved to your rafters, an honor), and the audience — you, forever, front row. His grandchildren steal from you with your blessing. Mostly.', vela: 'Vela outlives every actuarial table for her kind, imperious to the last, and raises three more broods off Kestrel Cliffs with her fish-debts always settled at your rock. When she is gone the wind over the cliffs is never quite unoccupied — and the young eagle who takes her ledge, pale-eyed, knows your silhouette on sight.', buri: 'Buri anchors your world like a warm boulder for years upon years, foreman of every project, uncle to every arriving creature, undefeated in the field of enthusiastic destruction. He dies old, in the sun, mid-nap, entirely certain of his welcome everywhere — the only fate he would have accepted.', moa: 'Moa rules. There is no other verb: the flock she founds owns your acres, her descendants carry her copper and her courage, and she herself lives to a preposterous age, storm-proof to the end, and dies on Edda\'s old blanket, on duty. You bury the bravest heart you ever met under the good tree, with a full parade.', nine: 'Nine\'s three springs come due, as they were always coming. She grows slow the last season; she shows you the den, and the clutch, and stays your hand from the useless things with one long patient arm — and the island, which repays its debts, sends you at the end what it sends no one: her hatchlings hunting your tide pools, and one among them, in time, who rises to watch you with a slotted golden eye, and traces, unmistakably, a spiral.' }[c]));
      }
    } else if (!s.companion && id !== 'COCO') {
      t.push('— You did the whole of it alone — the solo route, the hardest road on the island — and the Ledger marks it in the old way: <em>Alone, unbroken.</em>' + (TB.is('COCO') ? ' (Coco ' + (leaving ? 'sails with you, lashed to the mast with full honors.' : 'keeps his shelf, and his counsel, to the end.') + ')' : ''));
    }
    if (TB.is('EDDA_MET')) t.push('— Edda: ' + (leaving ? 'she refuses rescue, refuses goodbye ceremonies, and presses on you at the last a wax-sealed letter "for the world, if it must have one" — which proves to contain, in full, her resignation from Project Halcyon, dated 1979, effective immediately, tone scorching. You deliver it. It is framed, eventually, in an archive. She\'d hate that, and know it was funny.' : s.edda >= 60 ? 'her last years are warm ones — your fire and her grove, tea and insults, the drawer\'s weight finally shared. She dies in her garden in her ninetieth spring, mid-argument with a seedling, and is buried under the flowering tree between Ilsa and Aleksander, where all three of them can supervise the sea.' : 'her mountain keeps her to the end, flinty and sovereign, and the island is never told a better secret-keeper.'));
    if (TB.is('RYO_MET') && id !== 'RYO_BOAT') t.push('— Ryo: ' + (leaving ? 'he sails out beside you as far as the veil, then — to your shout of protest across the water — puts the Kingfisher\'s helm over and turns BACK, laughing, pointing at the island like a man pointing at a keeper\'s post. "Somebody has to mind the sea things!" The island\'s harbormaster. It suits him better than arriving anywhere ever did.' : 'he never does sail for the world — the boatyard, the salvage, the arrivals who need a sailor\'s hands; the island gave him the thing the circumnavigation was for, and he knows it. The Kingfisher goes out and comes back, out and comes back, like a tide with a name.'));
    if (TB.is('KING_ALLY') || TB.is('KING_FED')) t.push('— The Boar King holds the treaty to the end of his old age, and the inland dark holds it after him: nothing with tusks ever again crosses your boundary uninvited. Rent, it turned out, was a language. You both spoke it.');
    if (TB.is('HOME_NAMED') && !leaving) t.push('— ' + homeName() + ' outlives every plan you had for it. Names hold, on this island. The island heard you give it.');
    if (TB.is('INNER_GREEN') && leaving) t.push('— The Inner Green keeps your name in its counting songs: the first guest, who ate first, and left, and kept the secret whole. Naia\'s letters — carried out once a year by means she declines to explain — find you anywhere you live, forever.');
    return t;
  }

  function ledgerReport(s) {
    const roads = [];
    if (!TB.is('TIDEWELL_KEEP') && TB.regard() >= 4) roads.push('a covenant went untaken at a mountain pool');
    if (s.companion !== 'nine') roads.push('something in the tide pools watched a castaway who never looked twice');
    if (!TB.is('E_WING_OPEN') && TB.is('STATION_OPENED')) roads.push('a steel door in the east kept its room');
    if (!TB.is('INNER_GREEN')) roads.push('a hidden town fed its fires unvisited');
    if (!TB.is('CONTACT_MADE')) roads.push('a radio\'s four-second window opened for no one');
    if (s.companion) roads.push('five other wild lives waited at a clearing that only ever chose one');
    return [
      '<em>— THE LEDGER OPENS —</em>',
      'Run of ' + s.day + ' days · ' + Object.keys(s.flags).length + ' entries in the Ledger · Signal ' + s.route.signal + ' / Roots ' + s.route.roots + ' / Depth ' + s.route.depth + (s.companion ? ' · Companion: ' + NAMES[s.companion] + ' (trust ' + ['wary', 'tolerant', 'bonded', 'devoted', 'kindred'][TB.tier()] + ')' : ' · Solo route'),
      'Roads not taken this life: ' + roads.slice(0, 3).join('; ') + '.',
      'The island is long, and other lives through it are still yours to try.',
    ];
  }

  TB.scene('ending', {
    bg: (s) => (CORES[s.endingId] || CORES.HOME).bg,
    text: (s) => {
      const core = CORES[s.endingId] || CORES.HOME;
      return ['<em>ENDING ' + core.icon + ' — ' + core.title + '</em>']
        .concat(core.body)
        .concat(epilogue(s, s.endingId))
        .concat(ledgerReport(s));
    },
    choices: (s) => {
      const c = [];
      if (s.endingId === 'COCO') c.push({ t: '↩️ Return to the fire, and the doors', sub: 'Properly briefed.', go: 'convergence' });
      c.push({ t: '🌊 Begin another life on Vessakai', sub: 'Different past, different companion, different doors.',
        do: () => { TB.wipe(); TB.state = TB.newState(); }, go: 'title' });
      return c;
    },
  });
})(window);
