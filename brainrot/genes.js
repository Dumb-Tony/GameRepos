/* =====================================================================
 * genes.js — "Rot Genes": persistent meta-progression. Each gene unlocks
 * when you earn its linked achievement, and up to 3 can be slotted before a
 * run on the intro screen. Effects fold into the game at start via
 * game.applyGenes(). Pure data + a tiny apply spec (mods) — no closures, so
 * it stays serializable and testable.
 * =================================================================== */
(function (G) {
  'use strict';
  const BR = (G.BR = G.BR || {});

  // ach: the achievement id that unlocks this gene. icon: sprites.js icon name.
  // mods: { virality, seedMult, incomeMult, cureMult, startHeat, ev:{...} }
  BR.GENES = [
    { id: 'nest',    name: 'Nest Egg',          icon: 'coin',        ach: 'firstmeme',  color: '#f2c94c',
      desc: 'Begin every run with +30 Virality in the bank.', mods: { virality: 30 } },
    { id: 'seeded',  name: 'Patient Zero+',     icon: 'biohazard',   ach: 'patient0',   color: '#8fd14a',
      desc: 'Your starting country begins more thoroughly infected.', mods: { seedMult: 2.4 } },
    { id: 'soil',    name: 'Viral Soil',        icon: 'sprout',      ach: 'combo',      color: '#43c6ac',
      desc: '+18% Virality income from every new infection.', mods: { incomeMult: 1.18 } },
    { id: 'hardy',   name: 'Hardened Meme',     icon: 'shield',      ach: 'braincell',  color: '#b06cf0',
      desc: 'Start with innate Moderation Resistance (+0.3).', mods: { ev: { moderationResist: 0.3 } } },
    { id: 'stealth', name: 'Native Stealth',    icon: 'mask',        ach: 'stealth',    color: '#5ffbe0',
      desc: 'Start with innate Cure-slowing camouflage (+0.25).', mods: { ev: { cureSlow: 0.25 } } },
    { id: 'polygene',name: 'Born Multilingual', icon: 'speechGlobe', ach: 'polyglot',   color: '#4ea1ff',
      desc: 'Cross language barriers from the start (+0.4 pierce).', mods: { ev: { languagePierce: 0.4 } } },
    { id: 'resil',   name: 'Thick Skin',        icon: 'wall',        ach: 'photofinish',color: '#ff8be6',
      desc: 'Slip past closed borders more easily (+0.3 border pierce).', mods: { ev: { borderPierce: 0.3 } } },
    { id: 'spark',   name: 'Instant Trend',     icon: 'flame',       ach: 'worldwide',  color: '#ff8a3d',
      desc: 'Launch already trending — start with 35 Trend Heat.', mods: { startHeat: 35 } },
    { id: 'muddy',   name: 'Muddy Waters',      icon: 'flask',       ach: 'brutal',     color: '#c86bff',
      desc: 'The Cure researches 14% slower all game.', mods: { cureMult: 0.86 } },
    { id: 'prolific',name: 'Prolific Poster',   icon: 'chartUp',     ach: 'speedrun',   color: '#ff6bd6',
      desc: '+30% income, but you start with 10 less Virality.', mods: { incomeMult: 1.3, virality: -10 } },
  ];
  BR.GENE_BY_ID = {}; BR.GENES.forEach((g) => (BR.GENE_BY_ID[g.id] = g));
  BR.MAX_GENES = 3;
  BR.geneUnlocked = (save, id) => { const g = BR.GENE_BY_ID[id]; return !!(g && save && save.isUnlocked(g.ach)); };

})(typeof window !== 'undefined' ? window : globalThis);
