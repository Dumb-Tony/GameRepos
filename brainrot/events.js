/* =====================================================================
 * events.js — the news ticker: random world events + government/cure
 * responses. Transient code (not saved). Each has a weight, optional
 * cond(game), and run(game) returning { msg, tone }.
 * =================================================================== */
(function (G) {
  'use strict';
  const BR = (G.BR = G.BR || {});
  const EVENT_MIN = 16, EVENT_MAX = 30;

  BR.EVENTS = [
    // ---- GOOD (accelerate the rot) ----
    { id: 'celeb', emoji: '🌟', weight: 10, tone: 'good',
      run(g) { const c = g.spreadTarget(); const v = 15 + g.rnd() * 40; g.addVirality(v); if (c) g.boostCountry(c, 0.05 + g.rnd() * 0.06);
        return { msg: `A celebrity ${c ? 'in ' + c.name + ' ' : ''}accidentally reposts the rot. +${BR.fmt(v)} virality.` }; } },
    { id: 'livestream', emoji: '📡', weight: 8, tone: 'good',
      run(g) { g.world.countries.forEach((c) => { if (c.infected > 0.02) g.boostCountry(c, 0.03); }); return { msg: 'A 12-hour livestream melts brains across every infected feed.' }; } },
    { id: 'newslang', emoji: '🆕', weight: 8, tone: 'good',
      run(g) { g.addVirality(20 + g.rnd() * 30); g.reduceCure(2); return { msg: 'New slang just dropped. Yesterday\'s fact-checks are already irrelevant.' }; } },
    { id: 'grandparents', emoji: '👵', weight: 6, tone: 'good',
      run(g) { g.world.countries.forEach((c) => { if (c.age >= 42 && c.infected > 0.01) g.boostCountry(c, 0.06); }); return { msg: 'Grandparents discover the algorithm. It is over for the boomers.' }; } },
    { id: 'influencer', emoji: '🤳', weight: 8, tone: 'good',
      run(g) { const c = g.spreadTarget(); if (c) g.boostCountry(c, 0.08 + g.rnd() * 0.08); return { msg: `A mega-influencer in ${c ? c.name : 'the feed'} goes fully unhinged. Followers follow.` }; } },
    { id: 'migrate', emoji: '🚚', weight: 0, tone: 'good',
      run(g) { g.world.countries.forEach((c) => { if (c.infected > 0.01) g.boostCountry(c, 0.04); }); return { msg: 'Everyone migrates to a new app overnight. The swarm relocates, unbothered.' }; } },

    // ---- BAD (help the Cure / lockdowns) ----
    { id: 'factcheck', emoji: '🔍', weight: 8, tone: 'bad', cond: (g) => g.world.anyDetected(),
      run(g) { g.addCure(3 / (1 + g.ev.cureSlow * 2)); return { msg: 'Fact-checkers mobilize. Nobody reads them, but the Cure ticks up.' }; } },
    { id: 'funding', emoji: '💰', weight: 6, tone: 'bad', cond: (g) => g.world.anyDetected(),
      run(g) { g.addCure(4 / (1 + g.ev.cureSlow * 2)); return { msg: 'Governments fund a "Digital Literacy Initiative". Research accelerates.' }; } },
    { id: 'lockdown', emoji: '🏛️', weight: 7, tone: 'bad', cond: (g) => g.awareness > 0.25,
      run(g) { let hit = null; const cs = g.world.countries.filter((c) => c.wealth > 0.6 && (c.airOpen || c.seaOpen)); if (cs.length) { hit = cs[(g.rnd() * cs.length) | 0]; g.closeLinks(hit); g.queueEvent && g.queueEvent('migrate', 3 + g.rnd() * 3); } return { msg: `${hit ? hit.name : 'A government'} shuts down platforms and closes its borders.` }; } },
    { id: 'detox', emoji: '🌱', weight: 6, tone: 'bad', cond: (g) => g.world.anyDetected(),
      run(g) { g.addCure(2.5 / (1 + g.ev.cureSlow * 2)); return { msg: 'A "digital detox" trend spreads. Some people briefly touch grass.' }; } },
    { id: 'expose', emoji: '📰', weight: 6, tone: 'bad',
      run(g) { const c = g.randomInfected(); if (c) { c.detected = true; g.addCure(1.5); } return { msg: `An exposé "${c ? 'in ' + c.name + ' ' : ''}reveals the brainrot epidemic". The world takes note.` }; } },

    // ---- CHAOS / AI ----
    { id: 'aicursed', emoji: '🤖', weight: 7, tone: 'chaos',
      run(g) { const c = g.spreadTarget(); if (c) g.boostCountry(c, 0.10); g.addCure(1); return { msg: `AI generates a cursed meme. It should not exist. It is thriving${c ? ' in ' + c.name : ''}.` }; } },
    { id: 'deepfake', emoji: '🎭', weight: 6, tone: 'chaos', cond: (g) => g.world.anyDetected(),
      run(g) { g.reduceCure(3 + g.rnd() * 4); return { msg: 'A viral deepfake makes people distrust every fact-check. The Cure stalls.' }; } },
    { id: 'reality', emoji: '🌀', weight: 5, tone: 'chaos', cond: (g) => g.globalBrainrot() > 50,
      run(g) { g.world.countries.forEach((c) => { if (c.infected > 0.02) g.boostCountry(c, 0.05); }); return { msg: 'Reality becomes indistinguishable from memes. Nobody notices the difference.' }; } },
    { id: 'onecomment', emoji: '💬', weight: 5, tone: 'chaos', cond: (g) => g.globalBrainrot() > 60,
      run(g) { const v = 120 + g.rnd() * 180; g.addVirality(v); return { msg: `The entire internet becomes one comment section. +${BR.fmt(v)} virality of pure noise.` }; } },

    // ---- v6 GOOD ----
    { id: 'ratio', emoji: '📉', weight: 8, tone: 'good',
      run(g) { const c = g.spreadTarget(); const v = 12 + g.rnd() * 30; g.addVirality(v); if (c) g.boostCountry(c, 0.04 + g.rnd() * 0.05);
        return { msg: `Someone gets ratio'd into another dimension. The dunks spread faster than the take. +${BR.fmt(v)} virality.` }; } },
    { id: 'maincharacter', emoji: '🎭', weight: 7, tone: 'good',
      run(g) { const c = g.spreadTarget(); if (c) g.boostCountry(c, 0.07 + g.rnd() * 0.07); return { msg: `Today's main character has been selected${c ? ' in ' + c.name : ''}. Everyone piles on. Nobody logs off.` }; } },
    { id: 'italianbrainrot', emoji: '🦈', weight: 6, tone: 'good',
      run(g) { g.world.countries.forEach((c) => { if (c.age < 34 && c.infected > 0.01) g.boostCountry(c, 0.06); }); return { msg: 'A CGI shark-crocodile-espresso hybrid becomes sentient in the feed. The youth are gone.' }; } },
    { id: 'touchgrassfail', emoji: '🌱', weight: 6, tone: 'good', cond: (g) => g.world.anyDetected(),
      run(g) { g.reduceCure(3 + g.rnd() * 3); return { msg: 'A "Touch Grass" awareness campaign launches. Its ads become the season\'s hottest memes. The Cure backfires.' }; } },

    // ---- v6 BAD ----
    { id: 'phoneban', emoji: '📵', weight: 6, tone: 'bad', cond: (g) => g.awareness > 0.2,
      run(g) { const cs = g.world.countries.filter((c) => c.wealth > 0.5 && c.landOpen); let hit = cs.length ? cs[(g.rnd() * cs.length) | 0] : null; if (hit) { hit.landOpen = false; hit.detected = true; g.addCure(1.5); } return { msg: `${hit ? hit.name : 'A government'} bans smartphones for under-16s. A generation is temporarily saved.` }; } },
    { id: 'whistleblower', emoji: '🕵️', weight: 6, tone: 'bad', cond: (g) => g.world.anyDetected(),
      run(g) { g.addCure(4 / (1 + g.ev.cureSlow * 2)); g.queueEvent('hearings', 5 + g.rnd() * 4); return { msg: 'A platform whistleblower leaks everything to congress. Hearings are scheduled. The Cure surges.' }; } },
    // chain-only reversal: the crackdown becomes content
    { id: 'hearings', emoji: '⚖️', weight: 0, tone: 'chaos',
      run(g) { const v = 40 + g.rnd() * 50; g.addVirality(v); g.reduceCure(5 + g.rnd() * 4); return { msg: `The congressional hearings go viral as reaction memes. The crackdown becomes the content. +${BR.fmt(v)} virality; the Cure stalls.` }; } },

    // ---- v6 CHAOS (with a story chain) ----
    { id: 'rogueintern', emoji: '📱', weight: 6, tone: 'chaos',
      run(g) { const v = 30 + g.rnd() * 40; g.addVirality(v); g.queueEvent('internfired', 4 + g.rnd() * 4); const c = g.randomInfected(); if (c) g.boostCountry(c, 0.05); return { msg: `A major brand's social intern goes fully rogue and posts pure, uncut brainrot. +${BR.fmt(v)} virality.` }; } },
    { id: 'internfired', emoji: '🔥', weight: 0, tone: 'good',
      run(g) { const c = g.spreadTarget(); if (c) g.boostCountry(c, 0.06 + g.rnd() * 0.06); return { msg: 'The rogue intern gets fired, instantly becomes a folk hero, and starts a movement. It spreads.' }; } },
    { id: 'aislopflood', emoji: '🤖', weight: 6, tone: 'chaos', cond: (g) => g.globalBrainrot() > 25,
      run(g) { g.world.countries.forEach((c) => { if (c.infected > 0.02) g.boostCountry(c, 0.04); }); g.addCure(1); return { msg: 'Overnight, every platform is 90% AI slop. Nobody can tell what\'s real. Nobody tries.' }; } },

    /* ===== v9 batch ==================================================
     * Phase-gated so a run's news feels like it's escalating rather than
     * shuffling the same deck: EARLY events only fire before the world
     * notices, LATE ones only once the rot is everywhere. ============ */

    // ---- EARLY (pre-detection flavour; quiet, cheap, funny) ----
    { id: 'nichecommunity', emoji: '🕳️', weight: 7, tone: 'good', cond: (g) => g.globalBrainrot() < 12,
      run(g) { const c = g.spreadTarget(); const v = 10 + g.rnd() * 20; g.addVirality(v); if (c) g.boostCountry(c, 0.04);
        return { msg: `A tiny niche community${c ? ' in ' + c.name : ''} adopts the rot ironically. It will not stay ironic.` }; } },
    { id: 'copypasta', emoji: '📋', weight: 7, tone: 'good', cond: (g) => g.globalBrainrot() < 20,
      run(g) { const v = 14 + g.rnd() * 22; g.addVirality(v); g.addHeat(6);
        return { msg: `A copypasta mutates in every retelling until nobody knows the original. +${BR.fmt(v)} virality.` }; } },
    { id: 'algotest', emoji: '🧪', weight: 6, tone: 'chaos', cond: (g) => g.globalBrainrot() < 25,
      run(g) { const c = g.spreadTarget(); if (c) g.boostCountry(c, 0.05 + g.rnd() * 0.05); g.addHeat(8);
        return { msg: `A platform quietly A/B tests a worse feed${c ? ' in ' + c.name : ''}. Engagement soars. They keep it.` }; } },

    // ---- MID (the world starts reacting) ----
    { id: 'brainrotdictionary', emoji: '📖', weight: 6, tone: 'good', cond: (g) => g.globalBrainrot() > 18,
      run(g) { const v = 25 + g.rnd() * 35; g.addVirality(v); g.addHeat(10);
        return { msg: `A dictionary adds this year's slang. Lexicographers are visibly unwell. +${BR.fmt(v)} virality.` }; } },
    { id: 'schoolban', emoji: '🎒', weight: 6, tone: 'bad', cond: (g) => g.awareness > 0.18,
      run(g) { g.addCure(2.5 / (1 + g.ev.cureSlow * 2)); g.queueEvent('schoolbackfire', 5 + g.rnd() * 5);
        return { msg: 'Schools ban phones at lunch. Teachers describe the silence as "eerie".' }; } },
    { id: 'schoolbackfire', emoji: '🚻', weight: 0, tone: 'good',
      run(g) { const c = g.spreadTarget(); if (c) g.boostCountry(c, 0.06); const v = 20 + g.rnd() * 25; g.addVirality(v);
        return { msg: 'The phone ban simply relocates the brainrot to the bathrooms. Attendance in stalls is up 400%.' }; } },
    { id: 'sponsorpanic', emoji: '💸', weight: 6, tone: 'bad', cond: (g) => g.globalBrainrot() > 30,
      run(g) { g.addCure(3 / (1 + g.ev.cureSlow * 2));
        return { msg: 'Advertisers panic about "brand safety" and pull budgets. Platforms suddenly care about moderation.' }; } },
    { id: 'brainrotolympics', emoji: '🏅', weight: 5, tone: 'chaos', cond: (g) => g.globalBrainrot() > 35,
      run(g) { g.world.countries.forEach((c) => { if (c.infected > 0.03) g.boostCountry(c, 0.035); }); g.addHeat(14); g.addCure(0.8);
        return { msg: 'Nations compete to post the most unhinged official account. It is somehow a diplomatic incident.' }; } },
    { id: 'churchdiscovers', emoji: '⛪', weight: 5, tone: 'good', cond: (g) => g.globalBrainrot() > 25,
      run(g) { g.world.countries.forEach((c) => { if (c.age >= 38 && c.infected > 0.01) g.boostCountry(c, 0.05); });
        return { msg: 'A sermon goes viral for using the slang correctly. The congregation is cooked.' }; } },

    // ---- LATE (the world is mostly gone; absurdist) ----
    { id: 'govtaccount', emoji: '🏛️', weight: 6, tone: 'chaos', cond: (g) => g.globalBrainrot() > 55,
      run(g) { const v = 45 + g.rnd() * 45; g.addVirality(v); g.reduceCure(2);
        return { msg: `A national emergency broadcast is posted as a lowercase shitpost. Nobody questions it. +${BR.fmt(v)} virality.` }; } },
    { id: 'lastlibrary', emoji: '📚', weight: 5, tone: 'bad', cond: (g) => g.globalBrainrot() > 60,
      run(g) { g.addCure(3.5 / (1 + g.ev.cureSlow * 2));
        return { msg: 'The last people who finish books form a resistance cell. They are annoyingly well-rested.' }; } },
    { id: 'attentionmarket', emoji: '📉', weight: 5, tone: 'chaos', cond: (g) => g.globalBrainrot() > 65,
      run(g) { const v = 50 + g.rnd() * 60; g.addVirality(v); g.addCure(1.5);
        return { msg: `Global markets crash because no trader can focus for a full minute. Somehow, +${BR.fmt(v)} virality.` }; } },
    { id: 'terminalwedding', emoji: '💍', weight: 4, tone: 'good', cond: (g) => g.globalBrainrot() > 70,
      run(g) { g.world.countries.forEach((c) => { if (c.infected > 0.05) g.boostCountry(c, 0.05); });
        return { msg: 'A wedding is officiated entirely in slang. The vows are two syllables. Everyone weeps.' }; } },
    { id: 'holdoutdoc', emoji: '🎬', weight: 5, tone: 'good', cond: (g) => g.globalBrainrot() > 75,
      run(g) { const c = g.spreadTarget(); if (c) g.boostCountry(c, 0.08); g.reduceCure(2 + g.rnd() * 3);
        return { msg: 'A documentary about the last unrotted region becomes the most-watched thing ever. It rots them.' }; } },
    { id: 'silentcities', emoji: '🌃', weight: 4, tone: 'chaos', cond: (g) => g.globalBrainrot() > 80,
      run(g) { g.addHeat(18); const v = 40 + g.rnd() * 40; g.addVirality(v);
        return { msg: 'Cities fall silent. Not peace — everyone is just scrolling. The hum is constant.' }; } },

    // ---- CURE-ENDGAME pressure (only once they're genuinely close) ----
    { id: 'curetrial', emoji: '💉', weight: 7, tone: 'bad', cond: (g) => g.cure > 45,
      run(g) { g.addCure(4 / (1 + g.ev.cureSlow * 2)); g.queueEvent('trialsetback', 6 + g.rnd() * 5);
        return { msg: 'The Touch-Grass Campaign enters human trials. Volunteers report "boredom, but the good kind".' }; } },
    { id: 'trialsetback', emoji: '🥱', weight: 0, tone: 'good',
      run(g) { g.reduceCure(4 + g.rnd() * 4); const v = 25 + g.rnd() * 30; g.addVirality(v);
        return { msg: 'Trial participants relapse within a week. The control group had already relapsed. The Cure stalls.' }; } },
    { id: 'internationalpact', emoji: '🤝', weight: 5, tone: 'bad', cond: (g) => g.cure > 55,
      run(g) { g.addCure(3 / (1 + g.ev.cureSlow * 2)); const cs = g.world.countries.filter((c) => c.detected && c.airOpen);
        if (cs.length) { const h = cs[(g.rnd() * cs.length) | 0]; g.closeLinks(h); }
        return { msg: 'Nations sign an emergency anti-brainrot pact. It is announced in a 90-second vertical video.' }; } },
  ];

  class EventSystem {
    constructor(game) { this.game = game; this.timer = this.roll(); this.queued = []; }
    roll() { return (EVENT_MIN + this.game.rnd() * (EVENT_MAX - EVENT_MIN)) / (this.game.difficulty.chaos || 1); }
    update(dt) {
      for (let i = this.queued.length - 1; i >= 0; i--) { this.queued[i].t -= dt; if (this.queued[i].t <= 0) { const ev = BR.EVENTS.find((e) => e.id === this.queued[i].id); this.queued.splice(i, 1); if (ev) this.fire(ev); } }
      this.timer -= dt; if (this.timer <= 0) { this.timer = this.roll(); this.fireRandom(); }
    }
    fireRandom() {
      const g = this.game, pool = BR.EVENTS.filter((e) => e.weight > 0 && (!e.cond || e.cond(g)));
      let total = pool.reduce((s, e) => s + e.weight, 0), r = g.rnd() * total, chosen = pool[0];
      for (const e of pool) { r -= e.weight; if (r <= 0) { chosen = e; break; } }
      if (chosen) this.fire(chosen);
    }
    fire(ev) {
      const g = this.game, res = ev.run(g) || {};
      const tone = res.tone || ev.tone || 'info';
      // Viral/chaotic news is itself a trend moment — stoke the Heat.
      if (tone === 'good' || tone === 'chaos') g.addHeat(BR.CONST.HEAT_EVENT, true);
      g.onEvent(ev.emoji, res.msg || ev.id, tone);
    }
  }
  BR.EventSystem = EventSystem;

})(typeof window !== 'undefined' ? window : globalThis);
