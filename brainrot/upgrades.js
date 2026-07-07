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

  const U = (id, tree, name, emoji, cost, desc, req, fx, extra) =>
    Object.assign({ id, tree, name, emoji, cost, desc, req: req || [], fx: fx || {} }, extra || {});
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

    // =================== SYMPTOMS ===================
    U('postmemes','symptom','Posting Memes','🖼️',6,'Harmless-looking. The first behavioral tell.',[], {inf:0.2, sev:0.3, virality:0.05}, Object.assign({root:true, trend:'posting 🖼️'}, sym)),
    U('slang_skibidi','symptom','Skibidi','🚽',8,'A word that means nothing and everything.',['postmemes'], {inf:0.4, sev:0.5}, Object.assign({trend:'skibidi 🚽'}, sym)),
    U('slang_ohio','symptom','Ohio','💀',8,'Everything is now "only in Ohio".',['postmemes'], {inf:0.3, sev:0.5}, Object.assign({trend:'Ohio 💀'}, sym)),
    U('slang_rizz','symptom','Rizz','😏',8,'Charisma, weaponized into a suffix.',['postmemes'], {inf:0.35, sev:0.4, virality:0.05}, Object.assign({trend:'rizz 😏'}, sym)),
    U('slang_gyatt','symptom','Gyatt','🍑',8,'An exclamation. A worldview. A menace.',['postmemes'], {inf:0.35, sev:0.45}, Object.assign({trend:'gyatt 🍑'}, sym)),
    U('slang_fanum','symptom','Fanum Tax','🍗',8,'Communal theft of a friend\'s food, now a way of life.',['postmemes'], {inf:0.3, sev:0.4, virality:0.05}, Object.assign({trend:'fanum tax 🍗'}, sym)),
    U('reaction','symptom','Reaction-Image Speech','😲',10,'Words replaced by GIFs. Great engagement.',['postmemes'], {virality:0.15, sev:0.6}, sym),
    U('ragebait','symptom','Rage Bait','😡',14,'Nothing spreads like fury. Keeps you trending far longer.',['reaction'], {inf:0.3, sev:0.9, heatGain:0.3}, sym),
    U('combo_sor','symptom','Skibidi Ohio Rizz','🌟',20,'COMBO. The slang trinity fuses into one cursed phrase.',['slang_skibidi','slang_ohio','slang_rizz'], {inf:0.8, virality:0.2, sev:0.7}, Object.assign({combo:true}, sym)),
    U('combo_looksmax','symptom','Mewing Looksmaxxing','🗿',22,'COMBO. Jaw tension elevated to an entire personality.',['slang_gyatt','slang_rizz'], {inf:0.7, virality:0.15, sev:0.8}, Object.assign({combo:true}, sym)),
    U('doomscroll','symptom','Doomscrolling','🌒',16,'3am, still going. Mildly corrosive to the host.',['reaction'], {inf:0.5, sev:1.0, let:0.05}, sym),
    U('npc','symptom','NPC Dialogue','🤖',16,'Only preset phrases remain. Big engagement.',['reaction'], {virality:0.2, sev:0.9}, sym),
    U('fragment','symptom','Attention Fragmentation','🧩',18,'Wait, what were we— oh, a new video.',['doomscroll'], {inf:0.6, sev:1.2, let:0.1}, sym),
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
