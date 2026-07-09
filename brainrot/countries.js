/* =====================================================================
 * countries.js — the world roster with Plague-like attributes, the
 * Country simulation unit (healthy / infected / terminal populations +
 * lockdown state), the brainrot "stages", and continent geometry.
 * =================================================================== */
(function (G) {
  'use strict';
  const BR = (G.BR = G.BR || {});
  const clamp = BR.clamp;

  // Escalating absurdity ladder, keyed off a country's total-brainrot %.
  BR.STAGES = [
    { min: 0,   name: 'Healthy',                flavor: 'People still read whole articles.',              color: '#4be7ff' },
    { min: 12,  name: 'Posting Memes',          flavor: 'Group chats are 60% reaction images.',           color: '#6f8bff' },
    { min: 30,  name: 'Speaking in Slang',      flavor: 'Every sentence contains "lowkey".',              color: '#b06bff' },
    { min: 52,  name: "Can't Form Sentences",   flavor: "Verbs optional. It's giving collapse.",          color: '#ff6bd6' },
    { min: 74,  name: 'Gov Posts TikTok Comments', flavor: 'Parliament debates in the replies.',          color: '#ff3ea5' },
    { min: 92,  name: 'Terminal Brainrot',      flavor: 'Brain fully necrotic. Only skibidi remains.',    color: '#ff2d6f' },
  ];
  BR.stageFor = function (v) {
    const s = BR.STAGES;
    for (let i = s.length - 1; i >= 0; i--) if (v >= s[i].min) return s[i];
    return s[0];
  };

  const SHORT = {
    'United States': 'USA', 'United Kingdom': 'UK', 'South Korea': 'S. Korea', 'South Africa': 'S. Africa',
    'Central America': 'C. America', 'Andean States': 'Andes', 'Western Europe': 'W. Europe',
    'Southern Europe': 'S. Europe', 'Central Europe': 'C. Europe', 'Eastern Europe': 'E. Europe',
    'North Africa': 'N. Africa', 'West Africa': 'W. Africa', 'Central Africa': 'C. Africa',
    'East Africa': 'E. Africa', 'Southern Africa': 'Sthn Africa', 'Middle East': 'Mid East',
    'Central Asia': 'C. Asia', 'South Asia': 'S. Asia', 'Southeast Asia': 'SE Asia',
  };

  // Roster. Every axis is 0..1 unless noted. These are the pros/cons the
  // player weighs when choosing where patient-zero starts.
  //   internet  — device/feed penetration (spread medium)
  //   wealth    — rich → funds the Cure faster & detects sooner; poor → stealthy
  //   age       — median age (young → far more susceptible)
  //   moderation— state censorship/control (high → locks down hard, funds cure)
  //   skepticism— innate meme resistance
  //   online    — "terminally online" culture (vs touch-grass)
  //   english   — meme-native language (low → needs Meme Translation to fully rot)
  //   port/air  — has a major seaport / airport (cross-border links)
  //   land      — land-border neighbours (by name)
  // A gameplay unit is a country OR a region. `features` lists the real
  // map-feature names it covers (all painted together); omit for a single
  // country whose feature name matches (USA is aliased in world.js).
  const R = (name, emoji, lon, lat, pop, internet, wealth, age, moderation, skepticism, online, english, port, air, land, features) =>
    ({ name, emoji, lon, lat, pop, internet, wealth, age, moderation, skepticism, online, english, port, air, land, features });

  // 35 gameplay units — a Plague-style mix of major countries and regional
  // groupings, together covering the whole world. `features` lists the real
  // map shapes each unit paints; land[] links are made mutual in world.js.
  BR.COUNTRY_DATA = [
    R('United States',  '🦅', -98,  39,  333, 0.92, 0.95, 38, 0.25, 0.35, 0.85, 1.00, 1, 1, ['Canada', 'Mexico']),
    R('Canada',         '🍁', -100, 58,  40,  0.93, 0.90, 41, 0.30, 0.40, 0.78, 0.90, 1, 1, ['United States'], ['Canada', 'Greenland']),
    R('Mexico',         '🌮', -102, 23,  128, 0.72, 0.40, 29, 0.30, 0.25, 0.72, 0.15, 1, 1, ['United States', 'Central America']),
    R('Central America','🌴', -84,  14,  95,  0.60, 0.35, 27, 0.30, 0.20, 0.75, 0.30, 1, 1, ['Mexico', 'Andean States'], ['Guatemala','Honduras','Nicaragua','Costa Rica','Panama','El Salvador','Belize','Cuba','Dominican Rep.','Haiti','Jamaica','Puerto Rico','Bahamas']),
    R('Brazil',         '⚽', -51, -10,  214, 0.81, 0.42, 33, 0.25, 0.20, 0.88, 0.10, 1, 1, ['Andean States', 'Argentina']),
    R('Argentina',      '🧉', -63, -35,  56,  0.80, 0.45, 33, 0.30, 0.30, 0.80, 0.10, 1, 1, ['Brazil', 'Andean States'], ['Argentina','Uruguay','Paraguay']),
    R('Andean States',  '🦙', -72,  -8,  163, 0.70, 0.40, 30, 0.30, 0.25, 0.80, 0.10, 1, 1, ['Brazil', 'Argentina', 'Central America'], ['Colombia','Venezuela','Ecuador','Peru','Bolivia','Chile','Guyana','Suriname']),
    R('United Kingdom', '☕', -2,   54,  71,  0.95, 0.88, 40, 0.50, 0.45, 0.76, 1.00, 1, 1, [], ['United Kingdom','Ireland']),
    R('France',         '🥐',  2,   47,  65,  0.92, 0.85, 42, 0.55, 0.50, 0.66, 0.30, 1, 1, ['Germany', 'Western Europe', 'Southern Europe']),
    R('Germany',        '🥨',  10,  51,  84,  0.94, 0.90, 45, 0.55, 0.55, 0.60, 0.35, 1, 1, ['France', 'Western Europe', 'Central Europe']),
    R('Western Europe', '🧀', -2,   40,  96,  0.93, 0.82, 44, 0.42, 0.48, 0.70, 0.30, 1, 1, ['France', 'Germany', 'Southern Europe'], ['Spain','Portugal','Netherlands','Belgium','Switzerland']),
    R('Southern Europe','🏛️', 18,  42,  110, 0.90, 0.70, 45, 0.45, 0.50, 0.70, 0.20, 1, 1, ['Western Europe', 'Central Europe', 'France', 'Middle East'], ['Italy','Greece','Croatia','Serbia','Bosnia and Herz.','Albania','Slovenia','Montenegro','Macedonia','Kosovo','Bulgaria','Cyprus','N. Cyprus']),
    R('Central Europe', '🍺', 19,   49,  94,  0.85, 0.65, 42, 0.45, 0.50, 0.62, 0.25, 1, 1, ['Germany', 'Eastern Europe', 'Southern Europe'], ['Poland','Czechia','Slovakia','Hungary','Austria','Romania','Moldova']),
    R('Eastern Europe', '⛪', 29,   52,  55,  0.75, 0.35, 42, 0.55, 0.40, 0.65, 0.15, 1, 1, ['Central Europe', 'Russia', 'Scandinavia'], ['Ukraine','Belarus','Lithuania','Latvia','Estonia']),
    R('Scandinavia',    '❄️', 15,  63,  27,  0.96, 0.90, 42, 0.35, 0.50, 0.72, 0.60, 1, 1, ['Eastern Europe', 'Russia'], ['Sweden','Norway','Finland','Denmark','Iceland']),
    R('Russia',         '🐻', 90,   62,  144, 0.85, 0.50, 40, 0.85, 0.50, 0.60, 0.15, 1, 1, ['Eastern Europe', 'Scandinavia', 'Central Asia', 'China']),
    R('North Africa',   '🏜️', 5,   28,  105, 0.72, 0.40, 29, 0.55, 0.35, 0.68, 0.15, 1, 1, ['West Africa', 'Egypt'], ['Morocco','Algeria','Tunisia','Libya','W. Sahara','Mauritania']),
    R('Egypt',          '🐫', 30,   26,  104, 0.57, 0.30, 24, 0.65, 0.30, 0.60, 0.20, 1, 1, ['North Africa', 'East Africa', 'Middle East']),
    R('West Africa',    '🥁', -3,   12,  280, 0.45, 0.25, 18, 0.30, 0.20, 0.62, 0.30, 1, 1, ['North Africa', 'Nigeria', 'Central Africa'], ['Ghana',"Côte d'Ivoire",'Senegal','Mali','Niger','Burkina Faso','Guinea','Benin','Togo','Sierra Leone','Liberia','Guinea-Bissau','Gambia','Chad','Cameroon']),
    R('Nigeria',        '🎶',  8,   9,   214, 0.55, 0.20, 18, 0.25, 0.15, 0.72, 0.60, 1, 1, ['West Africa', 'Central Africa']),
    R('Central Africa', '🦍', 20,  -3,   163, 0.35, 0.25, 17, 0.30, 0.20, 0.55, 0.20, 1, 1, ['West Africa', 'Nigeria', 'East Africa', 'Southern Africa'], ['Dem. Rep. Congo','Congo','Gabon','Central African Rep.','Angola','Zambia','Eq. Guinea']),
    R('East Africa',    '🦓', 38,   3,   470, 0.30, 0.20, 19, 0.45, 0.25, 0.55, 0.30, 1, 1, ['Egypt', 'Central Africa', 'Middle East'], ['Ethiopia','Kenya','Tanzania','Uganda','Somalia','Somaliland','Sudan','S. Sudan','Rwanda','Burundi','Eritrea','Djibouti','Madagascar','Malawi','Mozambique']),
    R('Southern Africa','🦏', 24,  -20,  20,  0.55, 0.35, 22, 0.35, 0.30, 0.60, 0.60, 1, 1, ['Central Africa', 'South Africa'], ['Namibia','Botswana','Zimbabwe']),
    R('South Africa',   '🦁', 25,  -29,  60,  0.68, 0.40, 28, 0.30, 0.25, 0.70, 0.70, 1, 1, ['Southern Africa'], ['South Africa','Lesotho','eSwatini']),
    R('Middle East',    '🛢️', 45,  33,  360, 0.75, 0.55, 30, 0.70, 0.40, 0.72, 0.15, 1, 1, ['Egypt', 'East Africa', 'Central Asia', 'Southern Europe', 'Russia'], ['Turkey','Iran','Iraq','Syria','Jordan','Israel','Lebanon','Yemen','Oman','United Arab Emirates','Kuwait','Qatar','Saudi Arabia','Armenia','Azerbaijan','Georgia']),
    R('Central Asia',   '🐎', 65,   45,  120, 0.60, 0.40, 26, 0.65, 0.40, 0.60, 0.10, 0, 1, ['Russia', 'Middle East', 'China', 'South Asia'], ['Kazakhstan','Uzbekistan','Turkmenistan','Kyrgyzstan','Tajikistan','Mongolia','Afghanistan']),
    R('India',          '🪷', 79,   22,  1408,0.62, 0.25, 28, 0.40, 0.20, 0.75, 0.40, 1, 1, ['South Asia', 'China']),
    R('South Asia',     '🛕', 90,   24,  508, 0.40, 0.20, 25, 0.45, 0.25, 0.62, 0.30, 1, 1, ['India', 'China', 'Central Asia', 'Southeast Asia'], ['Pakistan','Bangladesh','Sri Lanka','Nepal','Bhutan','Myanmar']),
    R('China',          '🐉', 104,  35,  1412,0.72, 0.60, 38, 0.97, 0.60, 0.80, 0.10, 1, 1, ['Russia', 'Central Asia', 'South Asia', 'Southeast Asia', 'South Korea'], ['China','Taiwan']),
    R('Southeast Asia', '🛺', 108,  12,  348, 0.66, 0.35, 29, 0.50, 0.25, 0.82, 0.20, 1, 1, ['China', 'South Asia', 'Indonesia'], ['Vietnam','Thailand','Philippines','Malaysia','Cambodia','Laos','Papua New Guinea']),
    R('Indonesia',      '🌋', 118,  -2,  276, 0.66, 0.35, 30, 0.40, 0.20, 0.80, 0.15, 1, 1, ['Southeast Asia'], ['Indonesia','Timor-Leste','Brunei']),
    R('Japan',          '🗾', 138,  37,  125, 0.93, 0.85, 48, 0.45, 0.60, 0.70, 0.10, 1, 1, []),
    R('South Korea',    '🌶️', 127, 38,  77,  0.90, 0.70, 42, 0.60, 0.50, 0.90, 0.10, 1, 1, ['China'], ['South Korea','North Korea']),
    R('Australia',      '🦘', 134, -25,  26,  0.90, 0.90, 37, 0.40, 0.35, 0.75, 0.95, 1, 1, []),
    R('Oceania',        '🏄', 172, -20,  13,  0.85, 0.70, 35, 0.35, 0.35, 0.70, 0.80, 1, 1, [], ['New Zealand','Fiji','Solomon Is.','New Caledonia']),
  ];

  class Country {
    constructor(def, index) {
      Object.assign(this, def);
      this.id = index;
      this.short = SHORT[this.name] || this.name;

      // Populations tracked as fractions (× pop millions).
      this.infected = 0;    // currently-brainrotted (actively spreading)
      this.necrotic = 0;    // terminal — full brainrot, no longer spreads
      // healthy = 1 - infected - necrotic

      this.detected = false;        // has the world noticed brainrot here?
      this.awareness = 0;           // 0..1 local alarm level
      this.airOpen = true; this.seaOpen = true; this.landOpen = true;

      const p = BR.project(this.lon, this.lat);
      this.mx = p.x; this.my = p.y;

      // Youth susceptibility: peaks ~18, tapers past 45.
      this.youth = clamp(1.15 - Math.abs(this.age - 18) / 42, 0.25, 1.0);
    }

    total() { return this.infected + this.necrotic; }     // brainrot fraction
    healthy() { return clamp(1 - this.infected - this.necrotic, 0, 1); }
    brainrotPct() { return this.total() * 100; }
    stage() { return BR.stageFor(this.brainrotPct()); }
    isSaturated() { return this.necrotic >= 0.995; }

    seed(frac) { this.infected = Math.max(this.infected, frac); this.detected = this.detected; }

    // Intrinsic per-person susceptibility given the evolved plague affinities.
    susceptibility(ev, diffSusc) {
      // Base draw from device penetration, youth, and low skepticism.
      let s = 0.20 + 0.55 * this.internet + 0.60 * this.youth - 0.55 * this.skepticism * (ev.skepticScale || 1);
      // Evolved culture/demographic affinities (transmission upgrades).
      s *= 1 + ev.online * (this.online - 0.5) * 2 + ev.offline * (0.5 - this.online) * 2;
      s *= 1 + ev.rich * (this.wealth - 0.5) * 2 + ev.poor * (0.5 - this.wealth) * 2;
      s *= 1 + ev.young * (this.youth - 0.5) * 2 + ev.old * (0.5 - this.youth) * 2;
      // Language gate: low-english countries resist until Meme Translation.
      // A gate SLOWS these regions dramatically (you really want the ability),
      // but never freezes them — the rot still creeps in eventually.
      const langBlock = (1 - this.english) * (1 - clamp(ev.languagePierce, 0, 1));
      s *= 1 - 0.62 * langBlock;
      // Low-internet countries resist unless Offline Spread is evolved.
      const offlineBlock = (1 - this.internet) * (1 - clamp(ev.offlineReach, 0, 1));
      s *= 1 - 0.42 * offlineBlock;
      // Floor keeps even the most resistant holdouts inching toward saturation
      // so a run always CAN finish (the genre's Greenland/Madagascar holdouts) —
      // the penetration abilities just make it far faster. The floor also sets
      // how long the end-game "resistant tail" drags: too low and the last few
      // countries crawl for minutes while the Cure catches up.
      return clamp(s, BR.CONST.SUSC_FLOOR, 3) * (diffSusc || 1);
    }

    snapshot() {
      return { i: this.infected, n: this.necrotic, d: this.detected, a: this.awareness,
        ao: this.airOpen, so: this.seaOpen, lo: this.landOpen };
    }
    restore(s) {
      if (!s) return;
      this.infected = s.i || 0; this.necrotic = s.n || 0;
      this.detected = !!s.d; this.awareness = s.a || 0;
      this.airOpen = s.ao !== false; this.seaOpen = s.so !== false; this.landOpen = s.lo !== false;
    }
  }
  BR.Country = Country;

})(typeof window !== 'undefined' ? window : globalThis);
