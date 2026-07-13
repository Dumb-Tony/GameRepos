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
        c.push({ t: '🚢 Meet the ships. Go home — and carry the island\'s story carefully.', sub: 'The Found Shore. Rescue, return, and everything after.', do: () => { TB.state.endingId = TB.state.stats.hope <= 25 ? 'REGRET' : 'RESCUE'; }, go: 'ending' });
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
          else c.push({ t: '🌊 Sail. Through the veil\'s one window, out, and away.', sub: kindred ? 'Two tickets. ' + NAMES[s.companion] + ' boards or it doesn\'t happen.' : 'The Long Swim — alone, the way you arrived.', do: () => { TB.state.endingId = kindred ? 'SAIL_BLESSED' : (TB.state.stats.hope <= 25 ? 'REGRET' : 'LONG_SWIM'); }, go: 'ending' });
        } else {
          c.push({ t: '🛶 Lash a raft anyway. Go NOW — ready or not.', sub: 'The sea does not grade on intention. You know that. You\'re going anyway.',
            do: () => { TB.state.endingId = 'EMPTY_HORIZON'; }, go: 'ending' });
        }
        if (TB.is('CONTACT_MADE') || TB.is('SOS')) c.push({
          t: '🫥 And when the rescue you once called for comes — hide until it leaves.', sub: 'Remain, willingly. Say it out loud so the island hears you mean it.',
          do: () => { TB.state.endingId = 'REMAIN'; }, go: 'ending' });
        if ((TB.is('HEARTGLASS') || TB.is('HEART2_LOW')) && (TB.is('TIDEWELL_WITNESS') || TB.is('TIDEWELL_FEED'))) c.push({
          t: '🏮 Carry the covenant lamp down to the wound. And stay with it.', sub: 'The Tide Price. Someone holds the seam. It was always going to be someone.',
          do: () => { TB.state.endingId = 'TIDE_PRICE'; }, go: 'ending' });
      }
      // --- the Locked Things: endings unlocked by deep or secret play ---
      const treasure = TB.is('TREASURE_SOME') || TB.is('TREASURE_ALL') || TB.is('GEMS');
      if (treasure && (TB.is('VESSEL_READY') || TB.is('CONTACT_MADE') || TB.is('TIDEWELL_SILENCE'))) c.push({
        t: '🪙 Leave RICH — the Rosa\'s gold, the cut stones, the whole ransom.', sub: 'The world out there prices everything. Arrive holding the prices.',
        do: () => { TB.state.endingId = 'ROSAS_RANSOM'; }, go: 'ending' });
      if (TB.is('OTHER_HEARD') && !TB.is('TIDEWELL_SILENCE')) c.push({
        t: '📻 Stay — and answer the nine-beat station. Keep the archipelago\'s watch.', sub: '"There are more of us than two."',
        do: () => { TB.state.endingId = 'OTHER_SIGNAL'; }, go: 'ending' });
      if (TB.is('VISION_SEEN') && (TB.is('TIDEWELL_KEEP') || TB.is('TIDEWELL_WITNESS'))) c.push({
        t: '🗿 Live as what the sea-speaker made you: a placed stone.', sub: 'The last mural was a mirror. Vessa-tau.',
        do: () => { TB.state.endingId = 'FIRST_KAARI'; }, go: 'ending' });
      if (!TB.is('TIDEWELL_SILENCE')) {
        if (s.companion === 'nine' && s.trust >= 75) c.push({
          t: '🐙 Stay for her springs — every one she has left.', sub: 'Octopuses are lanterns, not hearths. You always knew the shape of this route.',
          do: () => { TB.state.endingId = 'THREE_SPRINGS'; }, go: 'ending' });
        if (s.companion === 'kavi' && s.trust >= 90) c.push({
          t: '🐕 Go where Kavi\'s other half lives. The pack.', sub: 'Where one of you goes, both of you go.',
          do: () => { TB.state.endingId = 'LAST_PACK'; }, go: 'ending' });
        if (s.companion === 'ipo' && s.trust >= 90) c.push({
          t: '🐒 Let Ipo show you what he\'s been building in the canopy.', sub: 'He has been hinting for WEEKS.',
          do: () => { TB.state.endingId = 'TRICKSTER'; }, go: 'ending' });
        if (s.companion === 'vela' && s.trust >= 75) c.push({
          t: '🦅 Walk to Kestrel Cliffs at first light. And open your hand.', sub: 'The wind has been asking after her all season. You\'ve heard it too.',
          do: () => { TB.state.endingId = 'WIND_TAKES'; }, go: 'ending' });
        if (s.companion === 'buri' && s.trust >= 75 && (TB.is('KING_ALLY') || TB.is('KING_FED') || TB.is('KING_TITHED'))) c.push({
          t: '🐗 Open the fence line. Let the wild sounder in.', sub: 'Buri has family out there under the treaty. Farms can hold multitudes.',
          do: () => { TB.state.endingId = 'SOUNDER'; }, go: 'ending' });
        if (s.companion === 'moa' && (TB.is('FLOCK') || TB.is('Q_MOA_DONE')) && TB.is('EDDA_MET')) c.push({
          t: '🐔 Move the flock to the grove. Give Edda\'s garden its voice back.', sub: 'The Rooster\'s Dawn. Some medicines cannot be brewed.',
          do: () => { TB.state.endingId = 'ROOSTER_DAWN'; }, go: 'ending' });
        if (s.companion === 'nine' && s.trust >= 50) c.push({
          t: '🐙 Rebuild your life at the tideline. On her terms, in her hours.', sub: 'Nine\'s Garden. Half your world drowned; none of it lonely.',
          do: () => { TB.state.endingId = 'NINES_GARDEN'; }, go: 'ending' });
        if (TB.is('EDDA_MET') && s.edda >= 60 && (TB.is('EDDA_GRAVES') || TB.is('EDDA_WINTER'))) c.push({
          t: '🌳 Accept what Edda has been trying to give you all season.', sub: 'The grove, the graves, and the last thing she never told Vane.',
          do: () => { TB.state.endingId = 'HERMIT_HEIR'; }, go: 'ending' });
        if (TB.is('VANE_J1') && TB.is('VANE_J2') && TB.is('VANE_J3') && s.edda >= 45) c.push({
          t: '🎻 Finish Vane\'s instrument. Take Ilsa\'s last measurement — and give it home.', sub: 'Understanding as an act of love, not disclosure.',
          do: () => { TB.state.endingId = 'ILSA_ANSWER'; }, go: 'ending' });
        if ((s.companion === 'nine' || s.route.depth >= 22) && (TB.is('GULLET_MAP') || TB.is('DEEP3') || TB.is('DIVED'))) c.push({
          t: '🚪 Wait for the king tide. Then go down, under the Tidewell, to the door.', sub: 'The sea keeps one room no map admits to. You\'ve known for weeks.',
          do: () => { TB.state.endingId = 'DROWNED_DOOR'; }, go: 'ending' });
        if (!TB.is('TIDEWELL_KEEP') && (TB.is('VESSEL_READY') || TB.is('CONTACT_MADE')) && s.route.depth >= 18 && (TB.is('VISION_SEEN') || TB.is('GULLET_MAP') || TB.is('HEARTGLASS'))) c.push({
          t: '🗺️ Leave — and come back heavy: expedition, instruments, the whole found world.', sub: 'The Cartographer\'s Return. Some doors punish knocking.',
          do: () => { TB.state.endingId = 'CARTOGRAPHER'; }, go: 'ending' });
      }
      if (s.flags.NGPLUS && TB.is('LOOP_KNOWN')) c.push({
        t: '🌀 Go back to the grotto. Ask the pool who is counting with you.', sub: 'The journal in your handwriting. The seventh beat. The Loop.',
        do: () => { TB.state.endingId = 'LOOP'; }, go: 'ending' });
      if (!s.companion && s.stats.hope >= 75 && TB.is('HOME3')) c.push({
        t: '🌄 Stand at the tideline alone and claim the whole of it.', sub: 'No companion, no covenant, no rescue. Just the life you built with two hands.',
        do: () => { TB.state.endingId = 'ALONE_UNBROKEN'; }, go: 'ending' });
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
    // ---- the Endings Expansion ----------------------------------------------------
    REGRET: { icon: '🌑', title: 'THE REGRET', bg: 'ocean-night', body: [
      'You leave because leaving is offered, which is not the same as wanting to go, and you know it in the boat, and you know it on the ship, and you know it — with a completeness that has its own terrible calm — at a window in a city, years later, watching rain.',
      'You are fine. That\'s the cruelty of it: the world took you back without a seam, gave you the job and the noise and the rooms, and nothing is wrong, and you never found out. What the grove would have told you. What the seventh beat was counting toward. Who you were becoming there, in the last light, before you traded that person for a berth and a hot shower — you left in the low season of your own heart, and low seasons, you understand now, are exactly when the island does its quietest work.',
      'Some nights you take out the lighter — they let you keep the lighter — and turn it over, and put it away. The island is still there. It is not on any chart. Neither, entirely, are you.',
    ] },
    EMPTY_HORIZON: { icon: '🌑', title: 'THE EMPTY HORIZON', bg: 'ocean-night', body: [
      'The raft is willing and the sea is not asked. You go because staying had begun to feel like drowning slowly, and the horizon promised — the way horizons do, to people at the end of themselves — that anywhere else was air.',
      'Nine days. You will never tell anyone the true arithmetic of them: the water gone on the fourth, the sail gone on the fifth, the bargains you made aloud with no one in the white middle of the sixth. The freighter that finds you finds eleven stone of sunburn and salt with your name somewhere inside it, and the crew are kind, and the kindness is almost the worst part, because you know — you knew by the second dawn — that you had left a green and singing world with your fences half-mended and your fire still lit, for this.',
      'You live. The word does its plain work and no more. Somewhere behind you an island the charts never held goes on without you, unfound, unfinished — and the one mercy the sea granted is that it let you carry out the knowing: it was never the island you were escaping.',
    ] },
    CARTOGRAPHER: { icon: '🌀', title: 'THE CARTOGRAPHER\'S RETURN', bg: 'sky', body: [
      'You leave with coordinates in your head and depth in your bones, and you do the thing you swore in the boat you\'d decide about later: you tell. Carefully, credibly, to serious people with serious funding — and eighteen months later you stand at the rail of a research vessel threading the exact latitudes of your hundred days, with sonar and satellites and a hold full of instruments, coming back heavy.',
      'The island is not where it was. It is not anywhere. Three weeks of grid-search find seamounts the charts already knew, a horizon scrubbed clean, and — on the last night, on every instrument at once, for four seconds — a rhythm. Seven beats. The oceanographers call it an anomaly. You call it, privately, what it is: a door being not slammed but <em>held</em>, politely, from the inside, by something that read your intentions across two thousand miles of open water and found them wanting.',
      'You go back to your life as the world\'s leading expert on a place that declines to exist. The expedition\'s data is sealed in three archives. Your compass, on quiet nights, still points true — and you understand at last that it was never lying before. It was telling you where you were welcome. It has stopped.',
    ] },
    REMAIN: { icon: '🍂', title: 'REMAIN, WILLINGLY', bg: 'jungle', body: [
      'The ship comes exactly as you once begged it to: grey hull, white water, the horn\'s long civilized bellow rolling across your bay like the answer to every prayer you sent up from the early fires. And you take your kit, and your quiet heart, and you walk up into the treeline, and you hide.',
      'They search for two days — you did the arithmetic; you left them a cold camp and no graves, and the sea keeps drowning\'s secrets cheap — and from the green shade you watch strangers grieve you carefully, write you down, and go. The horn sounds once more off the reef, long and fading. You stand in the surf of your own beach and listen to your old life leave without you, and what fills you is not loss. It has taken you one hundred days to learn its true name: it is <em>arrival</em>.',
      'The island does not remark on it. The tide comes in on schedule; the junglefowl resume their parliament; your fire takes on the second match. But that night the lagoon runs its seven beats so bright the wet sand holds the light after each pulse — and you have lived here long enough to know a door being bolted from your side of it, at your word, forever, gently. You asked to stay. Everything heard you.',
    ] },
    HERMIT_HEIR: { icon: '🍂', title: 'THE HERMIT\'S HEIR', bg: 'grove', body: [
      'She does it without ceremony, because ceremony was Aleksander\'s department: one grey morning she puts the grove\'s ledger in your hands — seed-lines and grave-lines and forty years of weather in a hand that stopped being neat decades ago — and says, "Well. Somebody competent had better," and that is the whole of the bequest, and both of you pretend your eyes are fine.',
      'You learn the grove the way she demands: by argument. Which trees forgive pruning and which hold grudges; where Ilsa is, and Aleksander, and the small stone with no name that she will explain exactly once, near the end, in nine words that reorganize everything you thought you knew about her exile. She teaches you the last thing she never told Vane — not the science; the <em>reason</em> — and when she goes, in her sleep, in her chair, facing the sea, the island loses its oldest secret-keeper and does not lose the secrets.',
      'You keep the grove. Tea still happens at the hour tea happened; her mug stays on its hook and works better there than anywhere else you could put it. In her tenth spring gone, a seedling she never told you about comes up flowering between the graves, and you sit down on the cold ground and laugh and grieve at once — supervised, you are certain, from somewhere with a good view of the sea.',
    ] },
    ILSA_ANSWER: { icon: '🍂', title: 'ILSA\'S ANSWER', bg: 'station', body: [
      'Vane\'s instrument takes you a season to finish: his journals\' impossible diagrams, your salvaged parts, Edda at your shoulder disagreeing with a dead man\'s handwriting in a voice that keeps catching. It is a listening device. It was always a listening device — not to find the Hum. To <em>resolve</em> it. Ilsa\'s question, the one the fever took her before she could ask properly: not "what is it" but "what is it FOR."',
      'You take the measurement on a king-tide midnight at the temple pool, the needle-drum turning, the seven beats coming up the mountain\'s bones — and the instrument does what thirty years of Halcyon\'s money never could, because it was built the way she designed it: to listen the way you listen to a heart, not a suspect. And the answer resolves out of the noise so simply that you and Edda sit in silence for a long time afterward. You will not write it here. It is two words. Ilsa, dying, guessed both of them.',
      'You give the finished work — instrument, journals, answer — not to the world but home: to Edda, who carries it up the mountain herself, and to the Kaari, who receive it the way one receives back a borrowed grief. Understanding as an act of love, not disclosure. Somewhere in the Green\'s keeping-house, a machine built by three castaways across sixty years listens to the island being alive, and is at peace, and so — at very long last — is everyone who built it.',
    ] },
    DROWNED_DOOR: { icon: '🌀', title: 'THE DROWNED DOOR', bg: 'gullet', body: [
      'The king tide opens the way at slack water, exactly as the maps you were never shown promised: below the Tidewell, below the temple\'s drowned nave, a stair going down where stairs have no business, lit — you stopped pretending otherwise weeks ago — for you.',
      'What is at the bottom of the stair is written exactly once, in no language, on the inside of your understanding, in the four minutes before the tide turns. You will spend the rest of your life failing to repeat it and declining to try. It is not a machine and not a god and not a garden, and it is a little like all three, and it knows your name the way the Hum knows it — seventh, softly — and it shows you, unmistakably, that you were expected.',
      'You surface at dawn into a world with one more room in it than anyone will ever believe, and you live differently afterward — not transformed; <em>oriented</em>, the way a needle is oriented, quietly, all the time, toward something true that nobody else can see. The door does not open for you twice. It does not need to. Some things you visit once and then simply, permanently, know the way home to.',
    ] },
    TIDE_PRICE: { icon: '🌅', title: 'THE TIDE PRICE', bg: 'temple', body: [
      'The wound under the mountain is losing, and everyone who can read the island knows it: the tremors climbing their ladder, the lagoon\'s beats arrhythmic, the heartglass seam bleeding light like a lamp burning its last oil. The covenant lamp has to go down — all the way down, to the seam itself — and it has to be carried, and the carrier stays. The murals are unambiguous. Someone holds the seam. It was always going to be someone.',
      'You go because you can, which is the whole of the reason and always was: no lineage, no sanction, just a castaway the island fed and taught and kept, paying the only bill that was ever going to come due for all of it. The descent takes a day. The lamp knows the way. And at the seam — hands on the wounded glass, the island\'s whole pulse coming up your arms — you feel the price taken and the payment <em>received</em>: the tremors easing, the beats steadying, two thousand lives above you unclenching in a night, forever.',
      'The epilogue is not yours; that is the point of the price. It belongs to the ones on the beaches and the terraces: to the fires that keep burning, the boats that come home, the festivals that return year on year to a lagoon that pulses seven and true. They tell your story in the counting songs — the hundredth-day stranger who carried the lamp — and every king tide, at the temple pool, someone leaves a light burning all night at the waterline. You are not there to see it. You are not entirely not.',
    ] },
    WIND_TAKES: { icon: '🍂', title: 'THE WIND TAKES HER', bg: 'cliff-camp', body: [
      'The exodus builds for a week — every thermal off Kestrel Cliffs stacked with wings going somewhere, the whole island\'s bird-nations answering a season older than the charts — and Vela watches it from your shoulder with her one good eye, and you feel it through her talons: the pull, and the choosing not to, and the cost of the choosing not to.',
      'So you walk to the cliffs at first light and you do the thing that a hundred days of debts and fish and stubborn one-eyed grace have earned you both: you open your hand. She stands on your wrist a long moment — heavier than she looks; she was always heavier than she looks — and then the wind comes up the cliff face like a door opening, and she goes into it, and does not circle, because circling is for birds with doubts.',
      'What you were to each other survives what you couldn\'t keep; that is the whole lesson of her, learned at last. The ledge stays hers — nothing on the island dares it for three winters. And on a spring morning years on, a young eagle with a pale eye and a familiar contempt for gravity lands on your fence post, inspects your holdings like an auditor, and accepts — gravely, imperiously, exactly the way you were taught — one fish. The account, whoever now holds it, remains open.',
    ] },
    SOUNDER: { icon: '🌅', title: 'SOUNDER', bg: 'camp-fringe', body: [
      'It begins with Buri standing at the fence line on a grey morning, ears up, absolutely still — and out of the treeline, under the treaty\'s old terms, comes a wild sow with three striped piglets and the wary dignity of a delegation. He looks at them. He looks at you. You have never opened a gate faster in your life.',
      'The farm stops being a farm that year and becomes a commonwealth: Buri\'s sounder rooting the back acres on a rotation you did not design and cannot improve, piglets underfoot in numbers that defy your census, the Boar King\'s inland dark sending — you\'d swear it — the occasional emissary to inspect how the treaty\'s strangest clause is prospering. Chaos, mud, tomatoes lost to enthusiasm, fences renegotiated weekly. Joy, in short, at a tonnage you had not budgeted for.',
      'Buri himself presides over it all like a warm boulder with a title: foreman, patriarch, uncle-of-state, undefeated. He sleeps by your fire still — some appointments are permanent — but he goes out each morning to his multitudes, and comes back each evening smelling of the whole green world, and the sound of your holdings at dusk, grunt and squeal and settling contentment from tideline to treeline, is the sound of the only kingdom on Earth founded entirely on one shared coconut.',
    ] },
    ROOSTER_DAWN: { icon: '🌅', title: 'THE ROOSTER\'S DAWN', bg: 'grove', body: [
      'You move the flock to the grove in one absurd, glorious caravan — Moa riding your shoulder like an admiral, Trouble crowing from the crate at everything, the hens complaining in committee — and Edda stands at her gate watching forty years of silence walk up her path on eight sets of scaly legs, and says nothing, and has to go inside for a while.',
      'The grove gets its voice back. That is the plain miracle of it: dawn breaking over the graves to Trouble\'s form-improving reveille, the beds turned and bug-picked by professionals, eggs on the old woman\'s table and noise — argument, industry, small feathered outrage — in a garden that had gone quiet the year her own rooster died and taken a piece of her hearing with it. Some medicines cannot be brewed. You watched this one work by inches, every morning, for years.',
      'Moa rules the new territory the way she ruled the old: absolutely, by courage-per-ounce mathematics no hawk ever solved. Her descendants carry the copper and the nerve into a dynasty the grove will host for fifty years. And Edda\'s last springs have eggs, and racket, and company at the fence — and when she goes, the flock roosts three nights running on the flowering tree above her, unbidden, on duty, because the bravest hearts on the island know a keeper when they\'ve been kept by one.',
    ] },
    NINES_GARDEN: { icon: '🌀', title: 'NINE\'S GARDEN', bg: 'tidepools', body: [
      'You rebuild at the tideline because that is where the treaty line runs: half your world drowned, all of it strange, none of it lonely. The new camp stands with its feet in the pools — a platform, a walkway, a fire that has learned to live with spray — and your nearest neighbor, landlord, and closest friend occupies the presidential pool at the center of everything, one golden eye keeping your hours.',
      'Life on her terms turns out to mean: gifts on the doorstep whose meanings you decode over years (the good shells are thanks; the crab claws are invoices; the sea-glass, you understand eventually, is <em>art</em>). It means being shown things — the nursery reefs, the current-doors, the drowned garden she tends below the third pool that no scientist will ever publish — at her pace, in her seasons, as you prove ready. It means learning to think tide-wise and moon-wise until your old land-clock rusts out of you entirely.',
      'The reef learns you the way the pack learned the fire-keeper: as a fixed strangeness that belongs. Octopuses who have never met you surface to watch you work, because watching you is, locally, a tradition now. You keep the garden. The garden, in its eight-armed, thousand-minded, salt-and-moonlight way, keeps you. Nobody anywhere has your life. That was the trade, and you\'d make it again every tide.',
    ] },
    LOOP: { icon: '🌀', title: 'THE LOOP', bg: 'gullet', body: [
      'You go back to the grotto at king tide with the journal\'s last line in your teeth, and you kneel at the pool, and you ask it — out loud, feeling foolish for exactly four seconds — <em>who is counting with me?</em>',
      'And the pool answers the way the island has answered everything, all along, in every life: seven beats. But this time — knowing what you know, having written what you wrote, having <em>arrived</em> as many times as you have arrived — you finally hear the seventh beat for what it is. Not a door closing. A stroke of a tally. Something on the far side of the water is counting crossings, patiently, the way you count days in the Ledger: not to imprison. To <em>remember</em>. The island does not trap its castaways. It keeps them — the way you keep entries, the way the sea keeps salt — and what it has been humming since your first fire is not a lullaby and not a warning. It is a count, and the count includes you, and the count is not finished.',
      'You write the new last entry with your own hand, for your own eyes, for the next time: <em>"It isn\'t a loop. It\'s a ledger. We are being kept — carefully. Find out what for. I\'ll start."</em> And you put the tin box back on the shelf, and you walk out into the ninety-ninth morning of this life or the first morning of the next — the distinction, you suspect, was always the island\'s to make — and for the first time in any of your lives, the Hum sounds <em>glad</em>.',
    ] },
    ALONE_UNBROKEN: { icon: '🌅', title: 'ALONE, UNBROKEN', bg: 'beach-day', body: [
      'No companion ever chose you, or you never chose one — the clearing had its afternoon, and you walked home alone, and the island watched what you did with that. What you did with that was: everything. Every fence, every filter, every fire, every yard of thatch and every jar of stores, one pair of hands, one stubborn ledger-keeping heart, one hundred days.',
      'This is the hardest ordinary life on the island and you built it without witnesses — which means you built it without the thing witnesses provide, the cheap fuel of being seen — and so the island, which measures such things exactly, paid you in the rarer coin: competence that answers to no one, quiet that stopped being empty somewhere around Day 60, and a self so thoroughly yours that rescue, rescue itself, has become a thing you could take or leave. You know which. You knew at dusk tonight, at the tideline, when the choosing came due and your heart came back level.',
      'The epilogue is one image, because it only needs one: sunrise, the good chair, the sea doing its two-a-day miracle, and on the shelf at your elbow a coconut with a painted face, who has heard the whole of it, every word, and who regards the both of you this morning — survivor and survivor — with what you have long since stopped pretending isn\'t pride.',
    ] },
  };

  function epilogue(s, id) {
    const t = [];
    const leaving = id === 'RESCUE' || id === 'SAIL_BLESSED' || id === 'RYO_BOAT' || id === 'LONG_SWIM' || id === 'ROSAS_RANSOM' || id === 'REGRET' || id === 'EMPTY_HORIZON' || id === 'CARTOGRAPHER';
    const companionCovered = id === 'THREE_SPRINGS' || id === 'LAST_PACK' || id === 'TRICKSTER' || id === 'WIND_TAKES' || id === 'SOUNDER' || id === 'ROOSTER_DAWN' || id === 'NINES_GARDEN'; // their cores ARE the companion's fate
    if (id === 'TIDE_PRICE') {
      // the one ending whose epilogue the player doesn't live to keep — it
      // belongs to the ones left at the fires
      if (s.companion) t.push('— ' + NAMES[s.companion] + ' keeps the temple stair for nine days past all sense — the Kaari bring food, and are studied, and are permitted — and then walks down the mountain and takes up your fire, and tends it, in the way of their kind, for the rest of a long and honored life. The Green feeds that fire forever. Nobody on the island calls it anything but yours.');
      if (TB.is('EDDA_MET')) t.push('— Edda plants a tree at the temple pool with her own hands, which she lets exactly two people help with, and argues with your memory every day of her remaining springs the way she argues with everything she cannot do without.');
      t.push('— And the lagoon runs seven beats and true, year upon year upon year — which is the receipt, and the monument, and the point.');
      return t;
    }
    if (s.companion && id !== 'COCO' && !companionCovered) {
      const c = s.companion;
      if (id === 'REMAIN' && c === 'moa') {
        t.push('— Moa stood with you in the treeline while your old life called your name across the water — a small copper hen, holding still because you were holding still, on duty because you were on watch. When the horn faded she looked up at you once, and led the way home, down the path, at the head of the column, as if the choosing had been jointly ratified. As far as she was ever concerned, it had been. You never once told the story without stopping at that part.');
      } else if (leaving && id !== 'SAIL_BLESSED' && id !== 'WHOLE_SKY') {
        t.push('— ' + ({ kavi: 'Kavi watches your boat from the tideline until it is nothing, and then — the pack has long since made its peace — turns inland, to the wild that always held his other half. Some nights, sailors becalmed off an uncharted sea swear they hear a dog singing.', ipo: 'Ipo inspects the boat, the horizon, and you — and delivers his verdict by climbing to the highest palm and NOT following. His island, his kingdom, his troop to run at last. The lighter, you find later, is in your pack. Paid in full.', vela: 'Vela escorts you to the reef gate and one mile beyond — further over open water than she has flown in years — and banks away at last in one wide, deliberate circle: the blind side, then the good eye, then gone. The account closes in credit. Hers.', buri: 'Buri cannot come — you know it, he knows it, and the last morning he leans his whole warm mass against you one final time and then, with the dignity of a king, does not watch you go. The homestead is his now. Heaven help anything that raids it.', moa: 'Moa you carry to Edda\'s grove yourself, the night before — the one goodbye you couldn\'t do at a tideline. The old woman takes the basket without a word, and the small copper hen stands on her wrist facing the sea, and between the two of them your leaving is, at last, permitted.', nine: 'Nine follows the hull out — you see her in the bow-wave glow, keeping pace, one long arm breaking the surface once in that unmistakable spiral — to the reef gate, and no further. Her whole world ends at that line. Yours, she has always known, never did. The last you see is the light of her, going down.' }[c]));
      } else if (!leaving) {
        t.push('— ' + ({ kavi: 'Kavi grows grey-muzzled at your fire, patriarch of a line of half-wild pups who own the middle distance of your every horizon. He sleeps touching your back to the end of his days, and he is buried on the hill with honors, and the pack sings over it, and you finally, fully, sing back.', ipo: 'Ipo achieves everything: the troop (his, in time, by a palace intrigue you witnessed and still don\'t understand), the treasury (moved to your rafters, an honor), and the audience — you, forever, front row. His grandchildren steal from you with your blessing. Mostly.', vela: 'Vela outlives every actuarial table for her kind, imperious to the last, and raises three more broods off Kestrel Cliffs with her fish-debts always settled at your rock. When she is gone the wind over the cliffs is never quite unoccupied — and the young eagle who takes her ledge, pale-eyed, knows your silhouette on sight.', buri: 'Buri anchors your world like a warm boulder for years upon years, foreman of every project, uncle to every arriving creature, undefeated in the field of enthusiastic destruction. He dies old, in the sun, mid-nap, entirely certain of his welcome everywhere — the only fate he would have accepted.', moa: 'Moa rules. There is no other verb: the flock she founds owns your acres, her descendants carry her copper and her courage, and she herself lives to a preposterous age, storm-proof to the end, and dies on Edda\'s old blanket, on duty. You bury the bravest heart you ever met under the good tree, with a full parade.', nine: 'Nine\'s three springs come due, as they were always coming. She grows slow the last season; she shows you the den, and the clutch, and stays your hand from the useless things with one long patient arm — and the island, which repays its debts, sends you at the end what it sends no one: her hatchlings hunting your tide pools, and one among them, in time, who rises to watch you with a slotted golden eye, and traces, unmistakably, a spiral.' }[c]));
      }
    } else if (!s.companion && id !== 'COCO' && id !== 'ALONE_UNBROKEN') { // ALONE_UNBROKEN's core IS this line, expanded
      t.push('— You did the whole of it alone — the solo route, the hardest road on the island — and the Ledger marks it in the old way: <em>Alone, unbroken.</em>' + (TB.is('COCO') ? ' (Coco ' + (leaving ? 'sails with you, lashed to the mast with full honors.' : 'keeps his shelf, and his counsel, to the end.') + ')' : ''));
    }
    if (TB.is('EDDA_MET') && id !== 'HERMIT_HEIR') t.push('— Edda: ' + (leaving ? 'she refuses rescue, refuses goodbye ceremonies, and presses on you at the last a wax-sealed letter "for the world, if it must have one" — which proves to contain, in full, her resignation from Project Halcyon, dated 1979, effective immediately, tone scorching. You deliver it. It is framed, eventually, in an archive. She\'d hate that, and know it was funny.' : s.edda >= 60 ? 'her last years are warm ones — your fire and her grove, tea and insults, the drawer\'s weight finally shared. She dies in her garden in her ninetieth spring, mid-argument with a seedling, and is buried under the flowering tree between Ilsa and Aleksander, where all three of them can supervise the sea.' : 'her mountain keeps her to the end, flinty and sovereign, and the island is never told a better secret-keeper.'));
    if (TB.is('RYO_MET') && id !== 'RYO_BOAT') t.push('— Ryo: ' + (leaving ? 'he sails out beside you as far as the veil, then — to your shout of protest across the water — puts the Kingfisher\'s helm over and turns BACK, laughing, pointing at the island like a man pointing at a keeper\'s post. "Somebody has to mind the sea things!" The island\'s harbormaster. It suits him better than arriving anywhere ever did.' : 'he never does sail for the world — the boatyard, the salvage, the arrivals who need a sailor\'s hands; the island gave him the thing the circumnavigation was for, and he knows it. The Kingfisher goes out and comes back, out and comes back, like a tide with a name.'));
    if (TB.is('KING_ALLY') || TB.is('KING_FED')) t.push('— The Boar King holds the treaty to the end of his old age, and the inland dark holds it after him: nothing with tusks ever again crosses your boundary uninvited. Rent, it turned out, was a language. You both spoke it.');
    if (TB.is('HOME_NAMED') && !leaving) t.push('— ' + homeName() + ' outlives every plan you had for it. Names hold, on this island. The island heard you give it.');
    if (TB.is('INNER_GREEN') && leaving) t.push('— The Inner Green keeps your name in its counting songs: the first guest, who ate first, and left, and kept the secret whole. Naia\'s letters — carried out once a year by means she declines to explain — find you anywhere you live, forever.');
    if (TB.is('SPONSORS_KNOWN') && (leaving || id === 'BROKER' || id === 'STAY_OPEN' || id === 'RESCUE')) t.push('— And you carry the dossier\'s cold gift everywhere: you know Meridian\'s name, and they don\'t know you know. When their surveyors come sniffing — and they come, they always come — you are, every time, three moves ahead of people who think they\'re hunting an anomaly instead of being watched by one\'s friend.');
    if (TB.is('TREASURE_LEFT')) t.push('— The Rosa Dourada keeps her gold and her crew, undisturbed. You never once regretted the empty hands; the knowing where it sleeps turned out to be the whole treasure.');
    else if ((TB.is('TREASURE_SOME') || TB.is('TREASURE_ALL')) && id !== 'ROSAS_RANSOM' && !leaving) t.push('— A dead ship\'s gold sits in a jar on your shelf, funding nothing, meaning everything: proof that on this island you finally learned the difference between what glitters and what keeps.');
    if (TB.is('OTHER_HEARD') && id !== 'OTHER_SIGNAL' && !leaving) t.push('— And some nights, at the radio, in the skips: the nine-beat station, keeping her vigil across the hidden world. You are two lighthouses who know each other\'s light.');
    // quest afterglow
    if (TB.is('Q_KAVI_DONE')) t.push('— On the singing ridge, on the highest stone, a brass collar weathers in the wind: BOSUN, 1887, found and carried home. The pack sings over it on clear nights. First of the line, last debt paid.');
    if (TB.is('HATCHLING') && !leaving && id !== 'WIND_TAKES') t.push('— The gargoyle from the high nest grows into an eagle the cliffs will talk about for thirty years — huge, loud, and convinced to the end of its days that your shoulder is furniture. Vela pretends not to be proud. Vela is entirely proud.');
    if (TB.is('KAARI_SEEDS') && !leaving) t.push('— And the old colors grow again: the vault\'s rice, the impossible beans, five centuries of sealed patience coming up green in your rows. Somewhere below the terrace wall, a carved wooden boar stands watch over an empty shelf, its work complete.');
    if (TB.is('Q_ROOSTER_DONE')) t.push('— Trouble crows from Edda\'s fence post every dawn, form improving under daily correction, and the grove has a voice again after forty years. Some medicines cannot be brewed.');
    if (TB.is('REEF_LEARNS')) t.push('— And in the far pools, at low tide, if you are very patient: small wild arms, practicing. The lessons are out of the classroom now, moving through the reef\'s bright network on a timescale that has nothing to do with anyone. Sixty years from now, the island will know things. You started that.');
    return t;
  }

  function ledgerReport(s) {
    const roads = [];
    if (!TB.is('TIDEWELL_KEEP') && TB.regard() >= 4) roads.push('a covenant went untaken at a mountain pool');
    if (s.companion !== 'nine') roads.push('something in the tide pools watched a castaway who never looked twice');
    if (!TB.is('E_WING_OPEN') && TB.is('STATION_OPENED')) roads.push('a steel door in the east kept its room');
    if (TB.has('case') && !TB.is('CASE_OPEN')) roads.push('a locked courier\'s case kept its answer to the end');
    if (TB.is('CHART_ROSA') && !TB.is('ROSA_DONE')) roads.push('a marked wreck on the north reef kept two centuries of gold');
    if (TB.is('LISTEN1') && !TB.is('OTHER_HEARD')) roads.push('something under the static waited for a second vigil that never came');
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

  TB.CORES = CORES; // exposed for the title screen's endings gallery

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
      c.push({ t: '📜 Save your run card', sub: 'A keepsake image of this life — download it, keep it, brag with it.',
        do: (s2) => { if (TB.RunCard) TB.RunCard.download(s2); } });
      if (TB.Loops && !TB.is('LOOP_BANKED')) c.push({
        t: '🎁 Choose a keepsake for the next loop', sub: 'One made-true thing crosses the water with what you know.', go: 'keepsake' });
      c.push({ t: '🌊 Begin another life on Vessakai', sub: 'Different past, different companion, different doors.',
        do: () => { if (TB.Loops) TB.Loops.bank(TB.state, null); TB.wipe(); TB.state = TB.newState(); }, go: 'title' });
      return c;
    },
  });
})(window);
