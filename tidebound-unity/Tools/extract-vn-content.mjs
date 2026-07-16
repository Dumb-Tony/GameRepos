#!/usr/bin/env node
/* =====================================================================
 * extract-vn-content.mjs — Tidebound VN → Unity narrative database.
 *
 * Loads the shipped VN's scene files (../tidebound/*.js) inside a
 * sandbox with a mocked TB engine, walks every registered scene, and
 * dumps Assets/_Game/Data/Narrative/tidebound-content.json:
 *   scene id → prose, choices, flags read/set, effects, schedule day,
 *   plus regions (map.js), trinkets, species, endings (TB.CORES),
 *   the event calendar (TB.SCHEDULE) and chapter calendar (TB.CAL).
 *
 * Dynamic text/choice functions are evaluated ONCE against a default
 * new-game state with seeded randomness, and marked `textDynamic` /
 * `goDynamic` so later phases know to consult the JS source for the
 * other branches. Output is deterministic run-to-run.
 *
 * Usage: node Tools/extract-vn-content.mjs   (from tidebound-unity/)
 * =================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const VN_DIR = path.resolve(HERE, '../../tidebound');
const OUT_FILE = path.resolve(HERE, '../Assets/_Game/Data/Narrative/tidebound-content.json');

// index.html load order, minus pure-UI files (engine, audio, fx, menu,
// runcard, tutorial). Everything here registers scenes or exposes data.
const FILES = [
  'loops.js', 'almanac.js', 'keepsakes.js', 'trophies.js',
  'scenes-prologue.js', 'scenes-chapter1.js', 'scenes-chapter2.js',
  'scenes-chapter3.js', 'scenes-chapter4.js', 'scenes-chapter5.js',
  'scenes-chapter6.js', 'scenes-chapter7.js', 'scenes-extra.js',
  'scenes-quests.js', 'scenes-milestones.js', 'scenes-peril.js',
  'scenes-ways.js', 'scenes-vigil.js', 'map.js', 'trinkets.js',
];

// ---- deterministic RNG ------------------------------------------------
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
let rng = mulberry32(0x71DEB0);
const reseed = () => { rng = mulberry32(0x71DEB0); };

// ---- DOM / browser stubs ----------------------------------------------
function makeElement() {
  const el = {
    style: {}, dataset: {}, children: [],
    classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
    innerHTML: '', textContent: '', value: '', className: '',
    addEventListener() {}, removeEventListener() {}, setAttribute() {},
    appendChild(c) { return c; }, removeChild() {}, remove() {}, focus() {},
    closest() { return makeElement(); },
    querySelector() { return makeElement(); },
    querySelectorAll() { return []; },
    getBoundingClientRect() { return { top: 0, left: 0, width: 0, height: 0 }; },
  };
  return el;
}
const documentStub = {
  getElementById: () => makeElement(),
  createElement: () => makeElement(),
  querySelector: () => makeElement(),
  querySelectorAll: () => [],
  addEventListener() {}, removeEventListener() {},
  body: makeElement(), documentElement: makeElement(), head: makeElement(),
};
const storageStub = { getItem: () => null, setItem() {}, removeItem() {}, clear() {} };

// A callable that swallows anything: TB.Audio.play(...), etc.
function noopNamespace() {
  return new Proxy(function () {}, {
    get: (t, p) => (p === Symbol.toPrimitive ? () => '' : noopNamespace()),
    apply: () => undefined,
  });
}

// ---- the recording TB mock ---------------------------------------------
// `rec` captures the effects of whatever function we're currently
// evaluating (enter hooks, choice `do` handlers, text conditions).
function freshRec() {
  return {
    flagsRead: new Set(), flagsSet: {}, stats: {}, route: {},
    items: {}, bond: 0, meets: [], segments: 0,
  };
}
let rec = freshRec();

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function newState() {
  return {
    scene: 'title', day: 3, seg: 0, hudOn: true,
    chapter: 1, site: null, trust: 0, edda: 0, disease: null, ryo: 0,
    stats: { health: 100, hunger: 80, thirst: 75, energy: 85, hope: 55 },
    bgnd: null, inv: {}, flags: {}, met: {}, interest: {},
    route: { signal: 0, roots: 0, depth: 0 },
    companion: null, fire: 0, shelter: 0, food: 0, injury: null,
    pools: 0, fired: {}, deathCause: null, mod: null, _cal: 2,
    trinkets: {}, visits: {},
  };
}

let currentFile = '(mock)';
const TB = {
  SCENES: {}, SCHEDULE: [],
  CAL: { clearing: 5, ch2: 6, ch2end: 18, ch3: 19, ch3end: 35, ch4: 36, ch4end: 52, ch5: 53, ch5end: 70, ch6: 71, ch7: 93, convergence: 100 },
  SEGS: ['🌅 Dawn', '☀️ Day', '🌇 Dusk', '🌙 Night'],
  SAVE_KEY: 'tidebound.save.v1',
  clamp,
  newState,
  state: newState(),
  scene(id, def) { def.id = id; if (!def.__file) def.__file = currentFile; TB.SCENES[id] = def; },
  stat(k, d) {
    const s = TB.state.stats;
    s[k] = clamp(Math.round(s[k] + d), 0, 100);
    rec.stats[k] = (rec.stats[k] || 0) + d;
  },
  item(k, d) {
    const inv = TB.state.inv;
    const dd = d === undefined ? 1 : d;
    inv[k] = Math.max(0, (inv[k] || 0) + dd);
    if (!inv[k]) delete inv[k];
    rec.items[k] = (rec.items[k] || 0) + dd;
  },
  has: (k) => (TB.state.inv[k] || 0) > 0,
  flag(k, v) {
    const val = v === undefined ? true : v;
    TB.state.flags[k] = val;
    rec.flagsSet[k] = typeof val === 'boolean' ? val : true;
  },
  is(k) { rec.flagsRead.add(k); return !!TB.state.flags[k]; },
  route(k, d) { TB.state.route[k] += d; rec.route[k] = (rec.route[k] || 0) + d; },
  meet(k, warmth) {
    TB.state.met[k] = true;
    TB.state.interest[k] = (TB.state.interest[k] || 0) + (warmth || 0);
    if (!rec.meets.includes(k)) rec.meets.push(k);
  },
  warm(k, d) { TB.state.interest[k] = (TB.state.interest[k] || 0) + d; },
  bond(d) { TB.state.trust = clamp(TB.state.trust + d, 0, 100); rec.bond += d; },
  tier() { const t = TB.state.trust; return t >= 100 ? 4 : t >= 75 ? 3 : t >= 50 ? 2 : t >= 25 ? 1 : 0; },
  // faithful port of engine.js tickSegment, minus HUD rendering
  tickSegment() {
    const s = TB.state;
    const monsoon = s.chapter === 5 || (s.mod === 'hard' && s.chapter >= 4);
    const k = s.mod === 'kind' ? 0.6 : 1;
    s.stats.hunger = clamp(s.stats.hunger - (monsoon ? 8 : 6) * k, 0, 100);
    s.stats.thirst = clamp(s.stats.thirst - (monsoon ? 3 : s.site === 'overhang' ? 8 : 6) * k, 0, 100);
    s.stats.energy = clamp(s.stats.energy - (monsoon ? 4 : 3) * k, 0, 100);
    if (s.stats.hunger === 0) s.stats.health = clamp(s.stats.health - 8 * k, 0, 100);
    if (s.stats.thirst === 0) s.stats.health = clamp(s.stats.health - 12 * k, 0, 100);
    if (s.injury) s.stats.health = clamp(s.stats.health - 2, 0, 100);
    if (s.disease === 'fever') {
      s.stats.health = clamp(s.stats.health - 1, 0, 100);
      if (s.stats.energy > 55) s.stats.energy = 55;
    }
    if (s.stats.health <= 0 && !s.deathCause) {
      s.deathCause = s.disease === 'fever' ? 'fever' : s.stats.thirst === 0 ? 'thirst' : s.stats.hunger === 0 ? 'hunger' : 'injury';
    }
    s.seg += 1;
    if (s.seg > 3) { s.seg = 0; s.day += 1; }
    rec.segments += 1;
  },
  advance: () => 'camp',
  renderHud() {}, go() {}, wipe() {}, recordEnd() {},
  // cross-run meta save: any shape the UI asks for resolves to empty
  meta: () => new Proxy({}, { get: (t, p) => (p === Symbol.toPrimitive ? () => '' : {}) }),
  hasSave: () => false, loadSave() {}, continueGame() {},
  hubOrganize: (c) => c,
  knowsGlass: () => false,     // overwritten for real by scenes-extra.js
  randomEvent: () => null,     // overwritten for real by scenes-extra.js
  Audio: noopNamespace(), RunCard: noopNamespace(),
};

// ---- sandbox ------------------------------------------------------------
const sandbox = {
  console, JSON, Object, Array, Math: Object.create(Math),
  document: documentStub, localStorage: storageStub,
  navigator: { userAgent: 'tidebound-extractor' },
  location: { href: 'about:blank', search: '' },
  setTimeout: () => 0, clearTimeout() {}, setInterval: () => 0, clearInterval() {},
  requestAnimationFrame: () => 0,
};
sandbox.Math.random = () => rng();
sandbox.window = sandbox;
sandbox.self = sandbox;
sandbox.globalThis = sandbox;
sandbox.TB = TB;
vm.createContext(sandbox);

for (const f of FILES) {
  const file = path.join(VN_DIR, f);
  let code = fs.readFileSync(file, 'utf8');
  // almanac.js keeps SPECIES closure-local; surface it for the dump.
  if (f === 'almanac.js') {
    code = code.replace('const SPECIES = [', 'const SPECIES = window.__TB_SPECIES = [');
  }
  currentFile = f;
  reseed();
  try {
    vm.runInContext(code, sandbox, { filename: f });
  } catch (e) {
    console.error(`FATAL loading ${f}: ${e.message}`);
    process.exit(1);
  }
}
currentFile = '(post-load)';

// ---- evaluation helpers ---------------------------------------------------
function attempt(fn, ...args) {
  try { return { ok: true, value: fn(...args) }; }
  catch (e) { return { ok: false, error: e.message }; }
}
function recSnapshot() {
  const out = {};
  if (rec.flagsRead.size) out.flagsRead = [...rec.flagsRead].sort();
  if (Object.keys(rec.flagsSet).length) out.flagsSet = rec.flagsSet;
  if (Object.keys(rec.stats).length) out.stats = rec.stats;
  if (Object.keys(rec.route).length) out.route = rec.route;
  if (Object.keys(rec.items).length) out.items = rec.items;
  if (rec.bond) out.bond = rec.bond;
  if (rec.meets.length) out.meets = rec.meets;
  if (rec.segments) out.segments = rec.segments;
  return Object.keys(out).length ? out : null;
}
function cleanText(arr) {
  if (!Array.isArray(arr)) return null;
  return arr.filter((p) => typeof p === 'string' && p.length > 0);
}
// drop functions/private keys so data files serialize cleanly
function sanitize(v, depth = 0) {
  if (depth > 8 || v === undefined || typeof v === 'function') return undefined;
  if (v === null || typeof v !== 'object') return v;
  if (Array.isArray(v)) return v.map((x) => sanitize(x, depth + 1)).filter((x) => x !== undefined);
  const out = {};
  for (const [k, val] of Object.entries(v)) {
    if (k.startsWith('__')) continue;
    const s = sanitize(val, depth + 1);
    if (s !== undefined) out[k] = s;
  }
  return out;
}

// ---- walk every scene -----------------------------------------------------
const scenes = [];
const flagsSetIndex = {};
const flagsReadIndex = {};
const staticGoTargets = new Set();

for (const [id, def] of Object.entries(TB.SCENES)) {
  reseed();
  TB.state = newState();
  const entry = { id, file: def.__file || null };

  if (typeof def.bg === 'string') entry.bg = def.bg;
  else if (def.bg) entry.bgDynamic = true;
  if (def.who) entry.who = typeof def.who === 'function' ? '(dynamic)' : sanitize(def.who);

  // enter runs before text in the real engine; same order here
  if (def.enter) {
    entry.hasEnter = true;
    rec = freshRec();
    const r = attempt(() => def.enter(TB.state));
    if (!r.ok) entry.enterError = r.error;
    const fx = recSnapshot();
    if (fx) entry.enterEffects = fx;
  }

  if (def.text) {
    rec = freshRec();
    if (typeof def.text === 'function') {
      entry.textDynamic = true;
      const r = attempt(() => def.text(TB.state));
      if (r.ok) entry.text = cleanText(r.value);
      else entry.textError = r.error;
    } else {
      entry.text = cleanText(def.text);
    }
    if (rec.flagsRead.size) entry.textFlagsRead = [...rec.flagsRead].sort();
  }

  let choices = def.choices;
  if (typeof choices === 'function') {
    entry.choicesDynamic = true;
    rec = freshRec();
    const r = attempt(() => def.choices(TB.state));
    choices = r.ok ? r.value : null;
    if (!r.ok) entry.choicesError = r.error;
  }
  if (Array.isArray(choices)) {
    entry.choices = choices.filter(Boolean).map((c) => {
      const ch = { t: typeof c.t === 'string' ? c.t : String(c.t ?? '') };
      if (typeof c.sub === 'string') ch.sub = c.sub;
      if (c.if) {
        ch.conditional = true;
        rec = freshRec();
        attempt(() => c.if(TB.state));
        if (rec.flagsRead.size) ch.conditionFlagsRead = [...rec.flagsRead].sort();
      }
      if (c.do) {
        const saved = TB.state;
        TB.state = structuredClone(saved);
        rec = freshRec();
        const r = attempt(() => c.do(TB.state));
        if (!r.ok) ch.doError = r.error;
        const fx = recSnapshot();
        if (fx) ch.effects = fx;
        TB.state = saved;
      }
      if (typeof c.go === 'string') { ch.go = c.go; staticGoTargets.add(c.go); }
      else if (typeof c.go === 'function') {
        ch.goDynamic = true;
        const saved = TB.state;
        TB.state = structuredClone(saved);
        rec = freshRec();
        const r = attempt(() => c.go(TB.state));
        if (r.ok && typeof r.value === 'string') ch.goResolved = r.value;
        TB.state = saved;
      }
      return ch;
    });
  }

  if (typeof def.next === 'string') { entry.next = def.next; staticGoTargets.add(def.next); }
  else if (typeof def.next === 'function') {
    entry.nextDynamic = true;
    rec = freshRec();
    const r = attempt(() => def.next(TB.state));
    if (r.ok && typeof r.value === 'string') entry.nextResolved = r.value;
  }
  if (def.nextLabel) entry.nextLabel = def.nextLabel;

  // flag indexes (from everything recorded above)
  const allSet = { ...(entry.enterEffects?.flagsSet || {}) };
  for (const c of entry.choices || []) Object.assign(allSet, c.effects?.flagsSet || {});
  for (const f of Object.keys(allSet)) (flagsSetIndex[f] = flagsSetIndex[f] || []).push(id);
  const allRead = new Set([...(entry.textFlagsRead || []), ...(entry.enterEffects?.flagsRead || [])]);
  for (const c of entry.choices || []) for (const f of c.conditionFlagsRead || []) allRead.add(f);
  for (const f of allRead) (flagsReadIndex[f] = flagsReadIndex[f] || []).push(id);

  scenes.push(entry);
}

// go/next targets that no loaded file registers (engine/menu-owned scenes)
const unknownGoTargets = [...staticGoTargets].filter((t) => !TB.SCENES[t]).sort();

// ---- assemble -------------------------------------------------------------
const indexHtml = fs.readFileSync(path.join(VN_DIR, 'index.html'), 'utf8');
const sourceVersion = (indexHtml.match(/\?v=(\d+)/) || [])[1] || null;

const result = {
  format: 1,
  meta: {
    source: 'tidebound VN (GameRepos/tidebound)',
    sourceVersion: sourceVersion ? Number(sourceVersion) : null,
    files: FILES,
    sceneCount: scenes.length,
    scheduleCount: TB.SCHEDULE.length,
    unknownGoTargets,
    note: 'Dynamic text/choices evaluated once against a fresh default state with seeded RNG; *Dynamic flags mark beats whose full branching lives in the JS source.',
  },
  calendar: TB.CAL,
  segments: TB.SEGS,
  scenes,
  schedule: TB.SCHEDULE.map((e) => ({
    day: e.d ?? null, seg: e.s ?? null, sceneId: e.id, conditional: !!e.when,
  })),
  regions: sanitize(TB.Map?.REGIONS) || null,
  trinkets: sanitize(TB.Trinkets?.CATALOG) || null,
  species: sanitize(sandbox.__TB_SPECIES) || null,
  endings: sanitize(TB.CORES) || null,
};

fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
fs.writeFileSync(OUT_FILE, JSON.stringify(result, null, 2) + '\n');

const dynamicScenes = scenes.filter((s) => s.textDynamic || s.choicesDynamic).length;
const errs = scenes.filter((s) => s.textError || s.choicesError || s.enterError).length;
console.log(`Wrote ${path.relative(process.cwd(), OUT_FILE)}`);
console.log(`  scenes: ${scenes.length} (${dynamicScenes} with dynamic text/choices, ${errs} with eval errors)`);
console.log(`  schedule entries: ${TB.SCHEDULE.length}`);
console.log(`  regions: ${Object.keys(result.regions || {}).length}, trinkets: ${(result.trinkets || []).length}, species: ${(result.species || []).length}, endings: ${Object.keys(result.endings || {}).length}`);
console.log(`  flags set: ${Object.keys(flagsSetIndex).length}, flags read: ${Object.keys(flagsReadIndex).length}`);
console.log(`  unresolved go targets (engine/menu scenes): ${unknownGoTargets.join(', ') || 'none'}`);
