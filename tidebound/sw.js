/* =====================================================================
 * sw.js — Tidebound's service worker: the island in your pocket.
 *
 * Precaches the whole game at install — the code files listed below,
 * plus every generated asset (art, audio, icons) by reading
 * art/manifest.txt, which is already the single source of truth for
 * what exists. After one online visit, the complete game plays with
 * no connection at all.
 *
 * VERSION must be bumped in lockstep with index.html's ?v cache-bust
 * on every release: a new version installs a fresh cache and the old
 * one is purged on activate. Lookups ignore the ?v query, so the
 * versioned requests the page makes are served from the unversioned
 * precache.
 * =================================================================== */
'use strict';

const VERSION = 'v49';
const CACHE = 'tidebound-' + VERSION;

const CODE = [
  './',
  'index.html',
  'style.css',
  'manifest.webmanifest',
  'engine.js',
  'audio.js',
  'fx.js',
  'menu.js',
  'runcard.js',
  'loops.js',
  'almanac.js',
  'keepsakes.js',
  'trophies.js',
  'scenes-prologue.js',
  'scenes-chapter1.js',
  'scenes-chapter2.js',
  'scenes-chapter3.js',
  'scenes-chapter4.js',
  'scenes-chapter5.js',
  'scenes-chapter6.js',
  'scenes-chapter7.js',
  'scenes-extra.js',
  'scenes-quests.js',
  'scenes-milestones.js',
  'scenes-peril.js',
  'scenes-ways.js',
  'scenes-vigil.js',
  'map.js',
  'trinkets.js',
  'tutorial.js',
  'art/manifest.txt',
];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(CODE);
    // every generated asset rides the art manifest — cache them all,
    // one by one, tolerating stragglers (addAll would fail atomically)
    try {
      const txt = await (await fetch('art/manifest.txt')).text();
      const files = txt.split('\n')
        .map((l) => l.trim())
        .filter((l) => l && l[0] !== '#')
        .map((l) => 'art/' + l.split('|')[0]);
      await Promise.all(files.map((f) => cache.add(f).catch(() => {})));
    } catch (err) { /* art tops up lazily via the fetch handler */ }
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) {
      if (k !== CACHE && k.indexOf('tidebound-') === 0) await caches.delete(k);
    }
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(e.request, { ignoreSearch: true });
    if (hit) return hit;
    try {
      const res = await fetch(e.request);
      // top up the cache (keyed without the ?v query, like the precache)
      if (res && res.ok) { try { cache.put(new Request(url.pathname), res.clone()); } catch (err) {} }
      return res;
    } catch (err) {
      if (e.request.mode === 'navigate') {
        const shell = await cache.match('index.html');
        if (shell) return shell;
      }
      throw err;
    }
  })());
});
