/* =====================================================================
 * upgrades.js — the three evolution trees (Transmission / Symptoms /
 * Abilities), each node with genuine tradeoffs, plus the evolved-stats
 * folding used by the simulation. Symptoms are de-evolvable; some nodes
 * are combos that need multiple prerequisites.
 *
 * Effect fields (all optional, additive):
 *   inf  — infectivity (spread)            sev — severity (income + cure + alarm)
 *   let  — lethality (infected→terminal)   virality — passive income multiplier
 *   online/offline/rich/poor/young/old — demographic/culture spread affinity
 *   languagePierce — reach non-English     offlineReach — reach low-internet
 *   borderPierce   — spread past lockdowns  moderationResist — beat censorship
 *   cureSlow — slows the Cure               skepticScale — scales innate resistance
 * =================================================================== */
(function (G) {
  'use strict';
  const BR = (G.BR = G.BR || {});

  BR.TREES = [
    { id: 'transmission', name: 'Transmission', emoji: '📡', color: '#43c6ac',
      blurb: 'How the brainrot spreads. Raises reach; some vectors raise visibility.' },
    { id: 'symptom', name: 'Symptoms', emoji: '🧠', color: '#f2c94c',
      blurb: 'Brainrot behaviors. Boost spread & income but raise Severity — and, high up, Necrosis. De-evolvable.' },
    { id: 'ability', name: 'Abilities', emoji: '🛡️', color: '#b06cf0',
      blurb: 'Resilience & Cure control. No spread of their own — pure strategy.' },
  ];

  // Global cost scale (v8): the base costs below are authored on a small scale;
  // this multiplier sets how scarce Virality is overall. Raising it means income
  // covers less of the tree, forcing you to commit to a build. Tuned via econ.js.
  const COST_SCALE = 4.0;
  const U = (id, tree, name, emoji, cost, desc, req, fx, extra) =>
    Object.assign({ id, tree, name, emoji, cost: Math.round(cost * COST_SCALE), desc, req: req || [], fx: fx || {} }, extra || {});
  const sym = { deEvolvable: true };

  BR.UPGRADE_TREE = [
    // =================== TRANSMISSION ===================
    U('dm','transmission','DMs & Group Chats','🗨️',8,'Quiet person-to-person seeding.',[], {inf:0.5, online:0.15, sev:0.2}, {root:true}),
    U('shortvid','transmission','Short-Form Video','📱',12,'The primary airborne vector. Very effective, very visible.',['dm'], {inf:1.0, young:0.25, sev:0.6}),
    U('crosspost','transmission','Cross-Platform Reposting','🔁',16,'Banned here, reborn there — survives takedowns.',['shortvid'], {inf:0.7, borderPierce:0.25, sev:0.4}),
    U('algo','transmission','Algorithm Amplification','🎯',20,'The feed does your work — and screams your presence.',['shortvid'], {inf:1.2, online:0.15, sev:1.2}),
    U('encrypted','transmission','Encrypted Group Chats','🔒',18,'Slips past censors. Stealthy: barely raises alarm.',['dm'], {inf:0.5, moderationResist:0.4, sev:0.1}),
    U('boomer','transmission','Boomer Facebook Shares','📢',14,'Reaches older, richer users. They also screenshot everything.',['dm'], {inf:0.5, old:0.25, rich:0.1, sev:0.5}),
    U('offline','transmission','IRL Meme Osmosis','🧍',16,'Word-of-mouth reaches the touch-grass, low-internet world.',['dm'], {inf:0.4, offline:0.3, offlineReach:0.6, sev:0.3}),
    U('translate','transmission','Meme Translation','🌐',22,'Localizes the rot into non-English cultures.',['crosspost'], {inf:0.3, languagePierce:0.7, sev:0.2}),
    U('influencer','transmission','Influencer Seeding','🤳',24,'Pay the algorithm gods. Loud, effective.',['algo'], {inf:0.9, rich:0.2, sev:0.8}),
    U('news','transmission','News Media Hijack','📰',28,'Mainstream coverage supercharges spread — and detection.',['influencer'], {inf:0.8, rich:0.15, sev:1.4}),
    U('aislop','transmission','AI Slop Firehose','🤖',22,'Endless AI-generated slop floods every feed. Relentless, and always trending.',['shortvid'], {inf:0.9, online:0.15, sev:1.0, heatGain:0.25}),
    U('podcast','transmission','Podcast Bro Pipeline','🎙️',18,'Three-hour episodes radicalize the entire commute.',['boomer'], {inf:0.5, old:0.2, rich:0.15, sev:0.6}),
    U('emoji','transmission','Emoji-Only Comms','🔣',12,'Language stops mattering when 💀🔥😭 says it all. Slips borders quietly.',['dm'], {inf:0.35, languagePierce:0.35, sev:0.25}),
    U('asmr','transmission','Brainrot ASMR','🎧',16,'Whispered nonsense straight into the earbuds at 2am.',['shortvid'], {inf:0.6, young:0.15, sev:0.5}),
    U('discord','transmission','Discord Server Sprawl','🟣',20,'Ten thousand servers no moderator can find. Reappears endlessly.',['encrypted'], {inf:0.6, online:0.2, moderationResist:0.25, sev:0.3}),
    U('mobilegame','transmission','Hyper-Casual Mobile Games','🕹️',22,'Subway ads with a brainrot skin. The kids are cooked.',['algo'], {inf:0.7, young:0.2, rich:0.1, sev:0.7}),
    U('streamer','transmission','Twitch Meltdown Clips','📹',30,'Streamer breakdowns get clipped, looped, and worshipped.',['influencer'], {inf:0.8, young:0.2, sev:1.0}),
    U('smarttv','transmission','Smart-TV Autoplay','📺',18,'The rot now autoplays in the living room. Grandma cannot escape.',['boomer'], {inf:0.6, old:0.2, rich:0.15, sev:0.6}),
    U('qrgraffiti','transmission','QR-Code Graffiti','🔳',16,'Scannable rot sprayed on every wall. No feed required.',['offline'], {inf:0.4, offlineReach:0.4, sev:0.4}),
    U('satellite','transmission','Satellite Internet Drop','🛰️',28,'Beams the rot into the last disconnected holdouts on Earth.',['offline'], {inf:0.5, offlineReach:0.5, borderPierce:0.2, sev:0.4}),
    U('voiceclone','transmission','Cloned Voice Notes','🎤',26,'AI clones of voices people trust. Crosses every language and every suspicion.',['aislop'], {inf:0.7, languagePierce:0.35, offlineReach:0.2, sev:0.7}),
    U('kidstablet','transmission','Tablet-Raised Cohort','🧸',24,'An entire generation handed a screen at eighteen months. They were never not infected.',['mobilegame'], {inf:0.8, young:0.35, sev:0.5}),
    U('dubbing','transmission','Auto-Dubbed Everything','🔊',30,'Every clip auto-dubs into every language. The last dialect walls fall.',['translate'], {inf:0.6, languagePierce:0.5, sev:0.5}),

    // =================== SYMPTOMS ===================
    U('postmemes','symptom','Posting Memes','🖼️',6,'Harmless-looking. The first behavioral tell.',[], {inf:0.2, sev:0.3, virality:0.05}, Object.assign({root:true, trend:'posting 🖼️'}, sym)),
    U('slang_skibidi','symptom','Skibidi','🚽',8,'A word that means nothing and everything.',['postmemes'], {inf:0.4, sev:0.5}, Object.assign({trend:'skibidi 🚽'}, sym)),
    U('slang_ohio','symptom','Ohio','💀',8,'Everything is now "only in Ohio".',['postmemes'], {inf:0.3, sev:0.5}, Object.assign({trend:'Ohio 💀'}, sym)),
    U('slang_rizz','symptom','Rizz','😏',8,'Charisma, weaponized into a suffix.',['postmemes'], {inf:0.35, sev:0.4, virality:0.05}, Object.assign({trend:'rizz 😏'}, sym)),
    U('slang_gyatt','symptom','Gyatt','🍑',8,'An exclamation. A worldview. A menace.',['postmemes'], {inf:0.35, sev:0.45}, Object.assign({trend:'gyatt 🍑'}, sym)),
    U('slang_fanum','symptom','Fanum Tax','🍗',8,'Communal theft of a friend\'s food, now a way of life.',['postmemes'], {inf:0.3, sev:0.4, virality:0.05}, Object.assign({trend:'fanum tax 🍗'}, sym)),
    U('slang_sigma','symptom','Sigma','🧊',8,'The lone-wolf grindset. Cold. Aloof. Extremely online.',['postmemes'], {inf:0.35, sev:0.45}, Object.assign({trend:'sigma 🧊'}, sym)),
    U('slang_delulu','symptom','Delulu','🦄',8,'Delusion, but make it aspirational.',['postmemes'], {inf:0.3, sev:0.4, virality:0.05}, Object.assign({trend:'delulu 🦄'}, sym)),
    U('slang_mid','symptom','Mid','🫤',8,'The ultimate dismissal. Everything is now just… mid.',['postmemes'], {inf:0.3, sev:0.35}, Object.assign({trend:'mid 🫤'}, sym)),
    U('slang_aura','symptom','Aura Points','🕶️',8,'Social credit, but vibes-based and constantly audited.',['postmemes'], {inf:0.35, sev:0.4, virality:0.05}, Object.assign({trend:'aura 🕶️'}, sym)),
    U('slang_cooked','symptom','Cooked','🍳',8,'A universal status update. Everyone is, always.',['postmemes'], {inf:0.3, sev:0.45}, Object.assign({trend:'cooked 🍳'}, sym)),
    U('combo_aura','symptom','Negative Aura Farming','🌑',22,'COMBO. Losing status on purpose becomes the highest status move.',['slang_aura','slang_sigma'], {inf:0.65, virality:0.15, sev:0.8}, Object.assign({combo:true}, sym)),
    U('reaction','symptom','Reaction-Image Speech','😲',10,'Words replaced by GIFs. Great engagement.',['postmemes'], {virality:0.15, sev:0.6}, sym),
    U('braindead','symptom','Braindead Takes','🧠',12,'Confidently wrong, endlessly shareable.',['reaction'], {virality:0.15, sev:0.7}, sym),
    U('combo_delulu','symptom','Delulu Sigma Grindset','🌈',22,'COMBO. Cope and grindset fuse into one unshakeable delusion.',['slang_sigma','slang_delulu'], {inf:0.6, virality:0.15, sev:0.8}, Object.assign({combo:true}, sym)),
    U('ragebait','symptom','Rage Bait','😡',14,'Nothing spreads like fury. Keeps you trending far longer.',['reaction'], {inf:0.3, sev:0.9, heatGain:0.3}, sym),
    U('combo_sor','symptom','Skibidi Ohio Rizz','🌟',20,'COMBO. The slang trinity fuses into one cursed phrase.',['slang_skibidi','slang_ohio','slang_rizz'], {inf:0.8, virality:0.2, sev:0.7}, Object.assign({combo:true}, sym)),
    U('combo_looksmax','symptom','Mewing Looksmaxxing','🗿',22,'COMBO. Jaw tension elevated to an entire personality.',['slang_gyatt','slang_rizz'], {inf:0.7, virality:0.15, sev:0.8}, Object.assign({combo:true}, sym)),
    U('doomscroll','symptom','Doomscrolling','🌒',16,'3am, still going. Mildly corrosive to the host.',['reaction'], {inf:0.5, sev:1.0, let:0.05}, sym),
    U('npc','symptom','NPC Dialogue','🤖',16,'Only preset phrases remain. Big engagement.',['reaction'], {virality:0.2, sev:0.9}, sym),
    U('edits','symptom','Velocity Edits','🎬',20,'Everything is a shaky, over-saturated edit set to phonk. Nobody blinks.',['npc'], {inf:0.5, sev:0.9}, sym),
    U('fragment','symptom','Attention Fragmentation','🧩',18,'Wait, what were we— oh, a new video.',['doomscroll'], {inf:0.6, sev:1.2, let:0.1}, sym),
    U('hyperfix','symptom','Hyperfixation Spiral','🎯',18,'18 hours on one topic, zero memory of eating.',['doomscroll'], {inf:0.4, sev:0.9, let:0.15}, sym),
    U('tics','symptom','Algorithmic Tics','⚡',24,'Involuntary catchphrases mid-sentence. Skibidi. Sorry. Skibidi.',['fragment'], {sev:1.1, let:0.3}, sym),
    U('brainfog','symptom','Brain Fog','🌫️',18,'The lights are on. Nobody is scrolling home.',['doomscroll'], {sev:0.8, let:0.2}, sym),
    U('combo_sigma','symptom','Sigma Grindset Psychosis','🐺',24,'COMBO. Doomscrolling meets NPC ideology. Corrosive.',['doomscroll','npc'], {inf:0.4, sev:0.9, let:0.4}, Object.assign({combo:true}, sym)),
    U('nosentences','symptom','Can\'t Form Sentences','🗯️',26,'Grammar optional. It\'s giving spread.',['fragment'], {inf:0.6, sev:1.6, let:0.4}, sym),
    U('detach','symptom','Reality Detachment','🌀',28,'The feed is realer than the room.',['brainfog'], {sev:1.5, let:0.6}, sym),
    U('parasocial','symptom','Parasocial Breakdown','🫥',26,'You know them. They do not know you. It hurts.',['npc'], {sev:1.3, let:0.5}, sym),
    U('collapse','symptom','Total Attention Collapse','🕳️',40,'The attention span reaches zero seconds.',['nosentences','detach'], {inf:0.3, sev:2.0, let:1.4}, sym),
    U('terminal','symptom','Terminal Brainrot','🧟',55,'Full brain necrosis. THE finisher — evolve last.',['collapse'], {sev:2.5, let:3.0}, sym),

    // =================== ABILITIES ===================
    U('modresist','ability','Moderation Resistance I','🛡️',14,'Shrug off platform bans and takedowns.',[], {moderationResist:0.4}, {root:true}),
    U('modresist2','ability','Moderation Resistance II','🛡️',26,'Reappear faster than moderators can click delete.',['modresist'], {moderationResist:0.5, borderPierce:0.2}),
    U('multiling','ability','Multilingual Memes','🗣️',20,'Reach every language. Stacks with Meme Translation.',[], {languagePierce:0.6}, {root:true}),
    U('offgrid','ability','Off-Grid Reach','📻',18,'Even the low-internet world is not safe.',[], {offlineReach:0.6}, {root:true}),
    U('obfuscate','ability','Algorithm Obfuscation','🌫️',22,'Mutate faster than fact-checkers. Slows the Cure.',[], {cureSlow:0.3}, {root:true}),
    U('astroturf','ability','Astroturfing','🌾',30,'Flood the zone so nobody trusts the alarm. Lowers Severity.',['obfuscate'], {cureSlow:0.35, sev:-0.6}),
    U('deepfake','ability','Deepfake Ambiguity','🎭',34,'"Is it even real?" The Cure stalls hard.',['obfuscate'], {cureSlow:0.5}),
    U('remix','ability','Infinite Meme Remix','♻️',45,'Every debunk becomes a fresh meme. Cure nearly freezes.',['deepfake'], {cureSlow:0.6}),
    U('trendsurf','ability','Trend Surfing','🏄',20,'Ride every wave. Your Trend Heat cools far more slowly.',[], {heatDecayReduce:0.45}, {root:true}),
    U('botfarm','ability','Bot Farm Amplification','👥',26,'Ten thousand fake accounts boost every post. You trend on command.',['trendsurf'], {heatGain:0.5, sev:0.3}),
    U('vpn','ability','VPN Mesh','🕶️',18,'Pop up wherever you\'re banned. Borders mean nothing.',['modresist'], {borderPierce:0.3, moderationResist:0.2}),
    U('firewall','ability','Firewall Immunity','🧱',34,'Great Firewalls filter everything except this.',['modresist2'], {moderationResist:0.5, borderPierce:0.3}),
    U('sockpuppets','ability','Sockpuppet Swarm','🧦',24,'A thousand fake yous, all trending in unison.',['botfarm'], {heatGain:0.3, cureSlow:0.15}),
    U('algocapture','ability','Algorithm Capture','🎛️',30,'You don\'t ride the algorithm anymore — you own it.',['botfarm'], {heatDecayReduce:0.35, heatGain:0.3}),
    U('cryptogrift','ability','Crypto Grift Funding','🪙',22,'Rug-pull the believers to bankroll the rot. Passive income.',['trendsurf'], {virality:0.2, cureSlow:0.1}),
    U('griefarmy','ability','Comment Grief Army','💢',30,'Bury every fact-check under a landslide of replies. Lowers Severity.',['astroturf'], {cureSlow:0.25, sev:-0.3}),
    U('memoryhole','ability','Memory-Hole PR','🧽',32,'Yesterday\'s exposé? Never happened. The Cure forgets too.',['deepfake'], {cureSlow:0.3, sev:-0.3}),
    U('shadowban','ability','Shadowban Immunity','👻',28,'Throttled, not stopped. The rot routes around suppression like damage.',['vpn'], {moderationResist:0.45, borderPierce:0.15}),
    U('zeroday','ability','Recommender Zero-Day','🕳️',40,'An exploit in the ranking model itself. You are the algorithm now.',['firewall'], {borderPierce:0.35, moderationResist:0.3, heatGain:0.25}),
  ];

  BR.UPGRADE_BY_ID = {};
  BR.UPGRADE_TREE.forEach((u) => { BR.UPGRADE_BY_ID[u.id] = u; });

  BR.baseEv = function () {
    return {
      inf: 0, sev: 0, let: 0, virality: 0,
      online: 0, offline: 0, rich: 0, poor: 0, young: 0, old: 0,
      languagePierce: 0, offlineReach: 0, borderPierce: 0, moderationResist: 0,
      cureSlow: 0, skepticScale: 1,
      heatGain: 0, heatDecayReduce: 0,   // Trend-Heat modifiers (v6 content)
    };
  };

  BR.foldEffects = function (ev, fx) {
    for (const k in fx) if (typeof fx[k] === 'number') ev[k] = (ev[k] || 0) + fx[k];
    return ev;
  };

})(typeof window !== 'undefined' ? window : globalThis);
