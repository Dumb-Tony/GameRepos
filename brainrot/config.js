/* =====================================================================
 * Brainrot: Rise of the Meme  —  config.js  (v2: Plague-like model)
 * ---------------------------------------------------------------------
 * Central tuning + tiny shared helpers on the global `BR` namespace.
 *
 * v2 emulates the mechanics of the classic global-infection strategy
 * genre (start-country choice, DNA/Virality economy, Transmission /
 * Symptom / Ability trees with real tradeoffs, a researched Cure, border
 * lockdowns, infect-then-finish pacing). Original theme, art, text, code.
 * =================================================================== */
(function (G) {
  'use strict';
  const BR = (G.BR = G.BR || {});

  BR.CONST = {
    // Simulation clock
    SIM_DT: 0.1,            // game-seconds per sim step
    SIM_INTERVAL: 100,      // ms between steps at 1x
    SPEEDS: [0, 1, 2, 3],
    SPEED_LABELS: ['Paused', '1×', '2×', '3×'],

    // --- Spread (deliberately slow; a run should take many minutes) ---
    // v7 rebalance: markedly slower spread + slower finisher + stronger, income
    // starved economy so a run is a long, deliberate race the Cure can win.
    // Good play still wins Normal — but by a hair (Cure ~90%); Brutal is a wall.
    // Tuned via the headless balance harness (see scratchpad/balance.js).
    INFECT_BASE: 0.006,     // master internal-spread coefficient (tuned via harness)
    INF_SCALE: 0.14,        // how strongly evolved Infectivity multiplies spread
    SEED_FLOOR: 0.05,       // minimum growth pressure in a seeded country
    MOMENTUM: 0.5,          // self-reinforcing S-curve strength (low = gradual, not bursty)
    NECROSIS_BASE: 0.006,   // master lethality (infected -> terminal) coeff — the finish is a race
    SEED_INFECT: 0.006,     // fraction infected in the chosen start country

    // --- Cross-border transmission (air / sea / land) -----------------
    LINK_AIR: 0.0012,       // per-step air-route seeding coefficient
    LINK_SEA: 0.0008,       // sea-route seeding
    LINK_LAND: 0.0025,      // land-border seeding (strongest)

    // --- Economy (Virality = DNA) -------------------------------------
    START_VIRALITY: 8,
    VIR_INFECT: 0.040,      // per million newly infected (income-starved: evolve deliberately)
    VIR_SEVERITY: 0.001,    // passive trickle scaled by severity × infected
    BUBBLE_MIN: 7, BUBBLE_MAX: 22,      // seconds between virality bubbles
    VIRAL_BUBBLE_REWARD: [8, 28],

    // --- Trend Heat (viral momentum) ----------------------------------
    // A meter that spikes on viral moments (new regions catching on, bubbles,
    // events, fresh evolutions) and decays fast. While you're HOT, virality
    // income surges — but you're on everyone's radar, so the Cure researches
    // faster. Ride the wave, cash in, then lie low before it burns you.
    HEAT_MAX: 100,
    HEAT_DECAY: 6.0,        // heat lost per game-second (fast — it's momentum)
    HEAT_GAIN_INFECT: 0.06, // heat per million newly infected this step
    HEAT_BUBBLE: 16,        // heat spike from tapping a viral bubble
    HEAT_EVENT: 12,         // heat spike from a viral/chaos world event
    HEAT_EVOLVE: 16,        // heat spike when you evolve a new upgrade ("a drop")
    HEAT_INCOME_MULT: 1.15, // at full heat, income is +115%
    HEAT_SPREAD: 0.55,      // at full heat, internal + cross-border spread +55%
    HEAT_AWARE: 0.10,       // at full heat, +0.10 global awareness (feeds Cure)
    HEAT_HOT: 62,           // threshold considered "trending hot" (UI cue)

    // --- The Cure ("Touch-Grass Campaign") — a real threat if you're loud
    CURE_MAX: 100,
    CURE_BASE: 1.7,         // base research rate (× difficulty × research power)
    CURE_SEV_GAIN: 0.16,    // how much severity accelerates the cure
    CURE_BUBBLE_MIN: 11, CURE_BUBBLE_MAX: 24,
    CURE_BUBBLE_SETBACK: [3, 7],        // % knocked off the cure per bubble

    // --- Lockdowns (borders / ports / airports close as world reacts) -
    LOCKDOWN_START: 22,     // global awareness % before governments react
    LOCKDOWN_STEP: 0.005,   // per-step close probability scaler

    // --- Detection / awareness ----------------------------------------
    DETECT_INFECT: 0.30,    // country infected-fraction that trips detection
    DETECT_SEV: 5,          // OR this much global severity trips detection

    // --- Mutation (symptoms self-evolve, uncontrolled) ----------------
    MUTATE_MIN: 30, MUTATE_MAX: 60,     // seconds between random mutations

    // --- Win / lose ----------------------------------------------------
    WIN_NECROSIS: 0.995,    // fraction of world fully terminal to win

    // De-evolve refund fraction of a symptom's cost
    DEEVOLVE_REFUND: 0.5,
  };

  // Difficulty presets scale the cure, hygiene (susceptibility), and how
  // fast the world locks down — mirroring the genre's difficulty tiers.
  BR.DIFFICULTIES = [
    { id: 'casual',  name: 'Casual',  emoji: '😌', cure: 0.55, susc: 1.20, lockdown: 0.6, skeptic: 0.85, chaos: 1.0,
      blurb: 'People barely notice. The cure crawls. Learn the ropes.' },
    { id: 'normal',  name: 'Normal',  emoji: '🙂', cure: 1.00, susc: 1.00, lockdown: 1.0, skeptic: 1.00, chaos: 1.0,
      blurb: 'A fair fight between your memes and humanity’s attention span.' },
    { id: 'brutal',  name: 'Brutal',  emoji: '😰', cure: 1.55, susc: 0.85, lockdown: 1.5, skeptic: 1.15, chaos: 1.0,
      blurb: 'Fact-checkers are caffeinated. Borders slam shut. Good luck.' },
    { id: 'chaos',   name: 'Chaos',   emoji: '🎲', cure: 1.10, susc: 1.05, lockdown: 1.0, skeptic: 1.00, chaos: 2.4,
      blurb: 'Reality has left the chat. Events & mutations fire nonstop. Anything can happen.' },
  ];
  BR.difficultyById = (id) => BR.DIFFICULTIES.find((d) => d.id === id) || BR.DIFFICULTIES[1];

  // Rotating strategy tips shown in the evolve panel's default state.
  BR.EVO_TIPS = [
    'Spread <b>quietly</b> first — high Severity feeds the Cure faster than it feeds you.',
    'Buy <b>Transmission</b> before Symptoms. Reach the world, <i>then</i> turn up the rot.',
    'Save loud symptoms &amp; <b>Terminal Brainrot</b> for last — evolve them once you\'re everywhere.',
    'Symptoms are <b>de-evolvable</b>. If the Cure surges, refund your noisiest ones.',
    'Abilities like <b>Deepfake Ambiguity</b> stall the Cure — pure defense, no visibility.',
    'Tap 🔥 virality bubbles on the map for free income, and 🧪 cure bubbles to set it back.',
    'Locked out by borders? <b>Cross-Platform Reposting</b> and border-pierce nodes slip through.',
    'Combos (★) need every prerequisite — but pack a serious punch when they land.',
  ];

  // ---- PRNG (mulberry32) — reproducible per seed ------------------------
  BR.rng = function (seed) {
    let s = seed >>> 0;
    return function () {
      s |= 0; s = (s + 0x6d2b79f5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  // ---- helpers ----------------------------------------------------------
  BR.clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
  BR.lerp = (a, b, t) => a + (b - a) * t;

  BR.fmt = function (n) {
    if (n === undefined || n === null || isNaN(n)) return '0';
    const neg = n < 0; n = Math.abs(n);
    let out;
    if (n < 1000) out = (n < 10 && n % 1 !== 0) ? n.toFixed(1) : Math.round(n).toString();
    else if (n < 1e6) out = (n / 1e3).toFixed(n < 1e4 ? 1 : 0) + 'K';
    else if (n < 1e9) out = (n / 1e6).toFixed(n < 1e7 ? 1 : 0) + 'M';
    else if (n < 1e12) out = (n / 1e9).toFixed(n < 1e10 ? 1 : 0) + 'B';
    else out = (n / 1e12).toFixed(1) + 'T';
    return (neg ? '-' : '') + out;
  };
  BR.fmtPct = (n) => (n < 10 && n > 0 ? n.toFixed(1) : Math.round(n)) + '%';
  BR.project = (lon, lat) => ({ x: (lon + 180) / 360, y: (90 - lat) / 180 });

})(typeof window !== 'undefined' ? window : globalThis);
