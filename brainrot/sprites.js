/* =====================================================================
 * sprites.js — a runtime VECTOR icon atlas. Every icon is drawn from code
 * (no image files → fully offline, crisp at any DPI, and tintable). Icons
 * are authored in a 0..1 unit box; we bake each (name,color) into a cached
 * offscreen canvas and blit it. A packed debug atlas is exposed too.
 *
 * Public API:
 *   BR.Sprites.draw(ctx, name, x, y, size, color, glow)   // centered blit
 *   BR.Sprites.dataURL(name, size, color)                 // for <img>/DOM
 *   BR.Sprites.iconFor(kind, id)                          // 'upgrade'|'country'|'hud'
 *   BR.Sprites.has(name)
 * =================================================================== */
(function (G) {
  'use strict';
  const BR = (G.BR = G.BR || {});
  const TAU = Math.PI * 2;

  // ---- tiny path helpers (all coords in the 0..1 unit box) ----------
  const mv = (c, x, y) => c.moveTo(x, y), ln = (c, x, y) => c.lineTo(x, y);
  const stroke = (c) => c.stroke(), fill = (c) => c.fill();
  function path(c, fn, doFill) { c.beginPath(); fn(c); doFill ? c.fill() : c.stroke(); }
  function seg(c, x1, y1, x2, y2) { c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); }
  function circ(c, x, y, r, f) { c.beginPath(); c.arc(x, y, r, 0, TAU); f ? c.fill() : c.stroke(); }
  function poly(c, pts, closed, f) { c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); if (closed) c.closePath(); f ? c.fill() : c.stroke(); }
  function rr(c, x, y, w, h, r, f) { c.beginPath(); c.roundRect(x, y, w, h, r); f ? c.fill() : c.stroke(); }

  // ================= ICON LIBRARY (name -> draw fn) ==================
  // Each fn draws in 0..1 with stroke/fill already set to the tint colour and
  // lineWidth ~0.09. Round caps everywhere for the neon line look.
  const I = {};

  // ---------- system / HUD ----------
  I.heart = (c) => path(c, (c) => { mv(c, 0.5, 0.86); c.bezierCurveTo(0.02, 0.55, 0.16, 0.13, 0.5, 0.34); c.bezierCurveTo(0.84, 0.13, 0.98, 0.55, 0.5, 0.86); }, true);
  I.skull = (c) => { path(c, (c) => { mv(c, 0.2, 0.52); c.bezierCurveTo(0.2, 0.16, 0.8, 0.16, 0.8, 0.52); ln(c, 0.72, 0.68); ln(c, 0.28, 0.68); c.closePath(); }, true);
    c.save(); c.globalCompositeOperation = 'destination-out'; circ(c, 0.37, 0.46, 0.09, true); circ(c, 0.63, 0.46, 0.09, true); c.restore();
    c.lineWidth = 0.05; poly(c, [[0.42, 0.68], [0.42, 0.82], [0.58, 0.82], [0.58, 0.68]], false); seg(c, 0.5, 0.68, 0.5, 0.82); };
  I.zombie = (c) => { circ(c, 0.5, 0.46, 0.32); c.lineWidth = 0.06; seg(c, 0.3, 0.4, 0.42, 0.44); seg(c, 0.42, 0.4, 0.3, 0.44); seg(c, 0.58, 0.4, 0.7, 0.44); seg(c, 0.7, 0.4, 0.58, 0.44); path(c, (c) => { mv(c, 0.34, 0.62); ln(c, 0.42, 0.58); ln(c, 0.5, 0.62); ln(c, 0.58, 0.58); ln(c, 0.66, 0.62); }, false); seg(c, 0.5, 0.14, 0.5, 0.04); circ(c, 0.5, 0.03, 0.03, true); };
  I.globe = (c) => { circ(c, 0.5, 0.5, 0.36); c.save(); c.beginPath(); c.arc(0.5, 0.5, 0.36, 0, TAU); c.clip(); c.lineWidth = 0.05; for (let i = -2; i <= 2; i++) circ(c, 0.5, 0.5, 0.36 * (i / 2.5 + 0.01) + 0.001, false); c.beginPath(); c.ellipse(0.5, 0.5, 0.14, 0.36, 0, 0, TAU); c.stroke(); seg(c, 0.14, 0.5, 0.86, 0.5); c.restore(); };
  I.chartUp = (c) => { c.lineWidth = 0.06; poly(c, [[0.16, 0.84], [0.16, 0.16]], false); poly(c, [[0.16, 0.84], [0.84, 0.84]], false); c.lineWidth = 0.09; path(c, (c) => { mv(c, 0.24, 0.68); ln(c, 0.42, 0.5); ln(c, 0.56, 0.6); ln(c, 0.8, 0.28); }, false); poly(c, [[0.64, 0.28], [0.8, 0.28], [0.8, 0.44]], false); };
  I.flask = (c) => { path(c, (c) => { mv(c, 0.4, 0.14); ln(c, 0.4, 0.42); ln(c, 0.2, 0.78); c.bezierCurveTo(0.16, 0.86, 0.22, 0.9, 0.3, 0.9); ln(c, 0.7, 0.9); c.bezierCurveTo(0.78, 0.9, 0.84, 0.86, 0.8, 0.78); ln(c, 0.6, 0.42); ln(c, 0.6, 0.14); }, false); seg(c, 0.34, 0.14, 0.66, 0.14); c.save(); c.globalAlpha = 0.5; path(c, (c) => { mv(c, 0.3, 0.62); ln(c, 0.7, 0.62); ln(c, 0.78, 0.78); c.bezierCurveTo(0.82, 0.86, 0.76, 0.9, 0.7, 0.9); ln(c, 0.3, 0.9); c.bezierCurveTo(0.24, 0.9, 0.18, 0.86, 0.22, 0.78); }, true); c.restore(); };
  I.flame = (c) => path(c, (c) => { mv(c, 0.5, 0.06); c.bezierCurveTo(0.3, 0.34, 0.66, 0.38, 0.52, 0.56); c.bezierCurveTo(0.72, 0.5, 0.74, 0.28, 0.66, 0.22); c.bezierCurveTo(0.84, 0.42, 0.86, 0.72, 0.62, 0.86); c.bezierCurveTo(0.9, 0.66, 0.7, 0.44, 0.6, 0.52); c.bezierCurveTo(0.66, 0.72, 0.5, 0.78, 0.48, 0.66); c.bezierCurveTo(0.3, 0.82, 0.14, 0.62, 0.26, 0.44); c.bezierCurveTo(0.28, 0.56, 0.38, 0.56, 0.4, 0.48); c.bezierCurveTo(0.28, 0.34, 0.44, 0.2, 0.5, 0.06); }, true);
  I.dna = (c) => { c.lineWidth = 0.07; for (let k = 0; k < 2; k++) { c.beginPath(); for (let t = 0; t <= 1.001; t += 0.05) { const y = 0.1 + t * 0.8, x = 0.5 + Math.sin(t * TAU + k * Math.PI) * 0.24; t ? ln(c, x, y) : mv(c, x, y); } c.stroke(); } c.lineWidth = 0.045; for (let t = 0.12; t < 1; t += 0.16) { const y = 0.1 + t * 0.8, x1 = 0.5 + Math.sin(t * TAU) * 0.24, x2 = 0.5 + Math.sin(t * TAU + Math.PI) * 0.24; seg(c, x1, y, x2, y); } };
  I.brain = (c) => { path(c, (c) => { mv(c, 0.5, 0.16); c.bezierCurveTo(0.28, 0.1, 0.14, 0.28, 0.2, 0.42); c.bezierCurveTo(0.08, 0.52, 0.16, 0.72, 0.32, 0.74); c.bezierCurveTo(0.34, 0.88, 0.66, 0.88, 0.68, 0.74); c.bezierCurveTo(0.84, 0.72, 0.92, 0.52, 0.8, 0.42); c.bezierCurveTo(0.86, 0.28, 0.72, 0.1, 0.5, 0.16); }, false); c.lineWidth = 0.05; seg(c, 0.5, 0.16, 0.5, 0.82); path(c, (c) => { mv(c, 0.36, 0.3); c.bezierCurveTo(0.26, 0.36, 0.3, 0.44, 0.38, 0.46); }, false); path(c, (c) => { mv(c, 0.64, 0.3); c.bezierCurveTo(0.74, 0.36, 0.7, 0.44, 0.62, 0.46); }, false); path(c, (c) => { mv(c, 0.34, 0.56); c.bezierCurveTo(0.28, 0.62, 0.32, 0.7, 0.4, 0.68); }, false); };
  I.biohazard = (c) => { c.lineWidth = 0.07; for (let k = 0; k < 3; k++) { const a = -Math.PI / 2 + k * TAU / 3; c.save(); c.translate(0.5, 0.5); c.rotate(a); c.beginPath(); c.arc(0, -0.26, 0.14, Math.PI * 0.15, Math.PI * 0.85, false); c.stroke(); c.beginPath(); c.arc(0, -0.12, 0.05, 0, Math.PI, true); c.stroke(); c.restore(); } circ(c, 0.5, 0.5, 0.08); };
  I.bars = (c) => { c.lineWidth = 0.1; seg(c, 0.18, 0.28, 0.82, 0.28); seg(c, 0.18, 0.5, 0.82, 0.5); seg(c, 0.18, 0.72, 0.82, 0.72); };
  I.barchart = (c) => { c.lineWidth = 0.06; poly(c, [[0.16, 0.14], [0.16, 0.86], [0.86, 0.86]], false); c.lineWidth = 0.12; seg(c, 0.34, 0.86, 0.34, 0.62); seg(c, 0.52, 0.86, 0.52, 0.42); seg(c, 0.7, 0.86, 0.7, 0.54); };
  I.trophy = (c) => { path(c, (c) => { mv(c, 0.3, 0.16); ln(c, 0.7, 0.16); ln(c, 0.68, 0.42); c.bezierCurveTo(0.66, 0.56, 0.34, 0.56, 0.32, 0.42); c.closePath(); }, false); path(c, (c) => { mv(c, 0.3, 0.2); c.bezierCurveTo(0.14, 0.22, 0.14, 0.4, 0.32, 0.42); }, false); path(c, (c) => { mv(c, 0.7, 0.2); c.bezierCurveTo(0.86, 0.22, 0.86, 0.4, 0.68, 0.42); }, false); seg(c, 0.5, 0.56, 0.5, 0.7); seg(c, 0.36, 0.84, 0.64, 0.84); seg(c, 0.42, 0.7, 0.58, 0.7); };
  I.pause = (c) => { rr(c, 0.28, 0.2, 0.14, 0.6, 0.04, true); rr(c, 0.58, 0.2, 0.14, 0.6, 0.04, true); };
  I.play = (c) => poly(c, [[0.3, 0.18], [0.82, 0.5], [0.3, 0.82]], true, true);
  I.ff = (c) => { poly(c, [[0.16, 0.22], [0.5, 0.5], [0.16, 0.78]], true, true); poly(c, [[0.5, 0.22], [0.84, 0.5], [0.5, 0.78]], true, true); };
  I.ff2 = (c) => { poly(c, [[0.1, 0.24], [0.38, 0.5], [0.1, 0.76]], true, true); poly(c, [[0.38, 0.24], [0.66, 0.5], [0.38, 0.76]], true, true); poly(c, [[0.66, 0.24], [0.9, 0.5], [0.66, 0.76]], true, true); };
  I.gear = (c) => { c.save(); c.translate(0.5, 0.5); for (let i = 0; i < 8; i++) { c.rotate(TAU / 8); c.beginPath(); c.roundRect(-0.07, -0.44, 0.14, 0.16, 0.03); c.fill(); } c.restore(); circ(c, 0.5, 0.5, 0.26, true); c.save(); c.globalCompositeOperation = 'destination-out'; circ(c, 0.5, 0.5, 0.12, true); c.restore(); };
  I.coin = (c) => { circ(c, 0.5, 0.5, 0.36); circ(c, 0.5, 0.5, 0.27); c.lineWidth = 0.08; c.font = ''; seg(c, 0.5, 0.34, 0.5, 0.66); path(c, (c) => { mv(c, 0.6, 0.4); c.bezierCurveTo(0.44, 0.36, 0.4, 0.5, 0.56, 0.52); c.bezierCurveTo(0.64, 0.54, 0.6, 0.64, 0.44, 0.6); }, false); };
  I.star = (c) => { c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 0.16 : 0.4; const x = 0.5 + Math.cos(a) * r, y = 0.5 + Math.sin(a) * r; i ? ln(c, x, y) : mv(c, x, y); } c.closePath(); c.fill(); };
  I.lock = (c) => { rr(c, 0.26, 0.44, 0.48, 0.42, 0.06, false); path(c, (c) => { mv(c, 0.34, 0.44); ln(c, 0.34, 0.34); c.arc(0.5, 0.34, 0.16, Math.PI, 0, false); ln(c, 0.66, 0.44); }, false); circ(c, 0.5, 0.62, 0.05, true); };
  I.shield = (c) => { path(c, (c) => { mv(c, 0.5, 0.12); ln(c, 0.82, 0.24); ln(c, 0.82, 0.52); c.bezierCurveTo(0.82, 0.74, 0.66, 0.84, 0.5, 0.9); c.bezierCurveTo(0.34, 0.84, 0.18, 0.74, 0.18, 0.52); ln(c, 0.18, 0.24); c.closePath(); }, false); c.lineWidth = 0.07; path(c, (c) => { mv(c, 0.38, 0.5); ln(c, 0.47, 0.6); ln(c, 0.64, 0.38); }, false); };
  I.shield2 = (c) => { I.shield(c); c.lineWidth = 0.05; c.save(); c.globalAlpha = 0.6; seg(c, 0.5, 0.16, 0.5, 0.86); c.restore(); };
  I.check = (c) => path(c, (c) => { mv(c, 0.22, 0.54); ln(c, 0.42, 0.74); ln(c, 0.8, 0.28); }, false);
  I.alert = (c) => { poly(c, [[0.5, 0.14], [0.88, 0.82], [0.12, 0.82]], true, false); c.lineWidth = 0.09; seg(c, 0.5, 0.4, 0.5, 0.62); circ(c, 0.5, 0.72, 0.03, true); };
  I.sprout = (c) => { seg(c, 0.5, 0.86, 0.5, 0.44); path(c, (c) => { mv(c, 0.5, 0.56); c.bezierCurveTo(0.3, 0.56, 0.24, 0.4, 0.26, 0.32); c.bezierCurveTo(0.42, 0.32, 0.5, 0.44, 0.5, 0.56); }, false); path(c, (c) => { mv(c, 0.5, 0.5); c.bezierCurveTo(0.7, 0.5, 0.76, 0.34, 0.74, 0.26); c.bezierCurveTo(0.58, 0.26, 0.5, 0.38, 0.5, 0.5); }, false); };
  I.clock = (c) => { circ(c, 0.5, 0.52, 0.34); seg(c, 0.5, 0.52, 0.5, 0.3); seg(c, 0.5, 0.52, 0.64, 0.58); seg(c, 0.5, 0.14, 0.5, 0.2); };
  // travellers (drawn pointing +x; caller rotates to heading)
  I.plane = (c) => path(c, (c) => { mv(c, 0.9, 0.5); ln(c, 0.34, 0.62); ln(c, 0.12, 0.62); ln(c, 0.26, 0.5); ln(c, 0.12, 0.38); ln(c, 0.34, 0.38); c.closePath(); }, true);
  I.ship = (c) => { path(c, (c) => { mv(c, 0.16, 0.56); ln(c, 0.84, 0.56); ln(c, 0.72, 0.72); ln(c, 0.28, 0.72); c.closePath(); }, true); c.lineWidth = 0.06; seg(c, 0.5, 0.56, 0.5, 0.3); poly(c, [[0.5, 0.3], [0.72, 0.42], [0.5, 0.42]], true, true); };
  I.road = (c) => { poly(c, [[0.32, 0.16], [0.68, 0.16], [0.82, 0.84], [0.18, 0.84]], true, false); c.lineWidth = 0.05; c.setLineDash && c.setLineDash([0.08, 0.07]); seg(c, 0.5, 0.18, 0.5, 0.82); c.setLineDash && c.setLineDash([]); };

  // ---------- transmission ----------
  I.chat = (c) => { path(c, (c) => { mv(c, 0.2, 0.62); c.arc(0.5, 0.42, 0.32, Math.PI * 0.75, Math.PI * 0.25, false); ln(c, 0.66, 0.62); ln(c, 0.66, 0.74); ln(c, 0.5, 0.62); c.closePath(); }, false); c.lineWidth = 0.06; for (let i = 0; i < 3; i++) circ(c, 0.36 + i * 0.14, 0.42, 0.02, true); };
  I.phone = (c) => { rr(c, 0.32, 0.1, 0.36, 0.8, 0.07, false); poly(c, [[0.46, 0.4], [0.6, 0.5], [0.46, 0.6]], true, true); c.lineWidth = 0.05; seg(c, 0.44, 0.16, 0.56, 0.16); };
  I.repost = (c) => { c.lineWidth = 0.08; path(c, (c) => { mv(c, 0.24, 0.4); c.arc(0.5, 0.4, 0.26, Math.PI, Math.PI * 1.6, false); }, false); poly(c, [[0.72, 0.28], [0.78, 0.46], [0.6, 0.42]], true, true); path(c, (c) => { mv(c, 0.76, 0.6); c.arc(0.5, 0.6, 0.26, 0, Math.PI * 0.6, false); }, false); poly(c, [[0.28, 0.72], [0.22, 0.54], [0.4, 0.58]], true, true); };
  I.target = (c) => { circ(c, 0.5, 0.5, 0.36); circ(c, 0.5, 0.5, 0.22); circ(c, 0.5, 0.5, 0.07, true); };
  I.megaphone = (c) => { path(c, (c) => { mv(c, 0.2, 0.42); ln(c, 0.5, 0.42); ln(c, 0.78, 0.24); ln(c, 0.78, 0.72); ln(c, 0.5, 0.56); ln(c, 0.2, 0.56); c.closePath(); }, false); seg(c, 0.32, 0.56, 0.32, 0.74); seg(c, 0.44, 0.56, 0.44, 0.78); c.lineWidth = 0.05; seg(c, 0.86, 0.38, 0.94, 0.34); seg(c, 0.86, 0.5, 0.95, 0.5); };
  I.person = (c) => { circ(c, 0.5, 0.28, 0.16); path(c, (c) => { mv(c, 0.22, 0.86); c.bezierCurveTo(0.22, 0.56, 0.78, 0.56, 0.78, 0.86); }, false); };
  I.selfie = (c) => { I.person(c); c.lineWidth = 0.05; rr(c, 0.66, 0.2, 0.2, 0.16, 0.03, false); circ(c, 0.76, 0.28, 0.04, false); };
  I.newspaper = (c) => { rr(c, 0.16, 0.2, 0.6, 0.62, 0.04, false); rr(c, 0.68, 0.36, 0.16, 0.46, 0.03, false); c.lineWidth = 0.05; rr(c, 0.24, 0.28, 0.24, 0.18, 0.02, false); seg(c, 0.54, 0.3, 0.68, 0.3); seg(c, 0.54, 0.4, 0.68, 0.4); seg(c, 0.24, 0.56, 0.68, 0.56); seg(c, 0.24, 0.66, 0.68, 0.66); seg(c, 0.24, 0.74, 0.56, 0.74); };
  I.robot = (c) => { rr(c, 0.24, 0.3, 0.52, 0.5, 0.08, false); seg(c, 0.5, 0.3, 0.5, 0.16); circ(c, 0.5, 0.13, 0.04, true); circ(c, 0.38, 0.5, 0.06, true); circ(c, 0.62, 0.5, 0.06, true); seg(c, 0.4, 0.68, 0.6, 0.68); seg(c, 0.24, 0.5, 0.14, 0.5); seg(c, 0.76, 0.5, 0.86, 0.5); };
  I.mic = (c) => { rr(c, 0.4, 0.12, 0.2, 0.4, 0.1, false); path(c, (c) => { mv(c, 0.28, 0.44); c.arc(0.5, 0.44, 0.22, 0, Math.PI, false); }, false); seg(c, 0.5, 0.66, 0.5, 0.82); seg(c, 0.36, 0.86, 0.64, 0.86); };
  I.emojiFace = (c) => { circ(c, 0.5, 0.5, 0.36); circ(c, 0.38, 0.42, 0.05, true); circ(c, 0.62, 0.42, 0.05, true); path(c, (c) => { mv(c, 0.34, 0.6); c.arc(0.5, 0.56, 0.18, Math.PI * 0.15, Math.PI * 0.85, false); }, false); };
  I.headphones = (c) => { path(c, (c) => { mv(c, 0.2, 0.6); c.arc(0.5, 0.5, 0.3, Math.PI, 0, false); ln(c, 0.8, 0.6); }, false); rr(c, 0.14, 0.56, 0.14, 0.26, 0.05, true); rr(c, 0.72, 0.56, 0.14, 0.26, 0.05, true); };
  I.controller = (c) => { path(c, (c) => { mv(c, 0.3, 0.36); ln(c, 0.7, 0.36); c.bezierCurveTo(0.88, 0.36, 0.92, 0.64, 0.82, 0.66); c.bezierCurveTo(0.72, 0.68, 0.68, 0.54, 0.58, 0.54); ln(c, 0.42, 0.54); c.bezierCurveTo(0.32, 0.54, 0.28, 0.68, 0.18, 0.66); c.bezierCurveTo(0.08, 0.64, 0.12, 0.36, 0.3, 0.36); }, false); c.lineWidth = 0.05; seg(c, 0.3, 0.45, 0.4, 0.45); seg(c, 0.35, 0.4, 0.35, 0.5); circ(c, 0.62, 0.43, 0.03, true); circ(c, 0.7, 0.48, 0.03, true); };
  I.joystick = (c) => { rr(c, 0.22, 0.5, 0.56, 0.34, 0.06, false); seg(c, 0.5, 0.5, 0.5, 0.24); circ(c, 0.5, 0.2, 0.08, false); c.lineWidth = 0.05; seg(c, 0.32, 0.64, 0.42, 0.64); seg(c, 0.37, 0.59, 0.37, 0.69); circ(c, 0.64, 0.62, 0.03, true); circ(c, 0.72, 0.68, 0.03, true); };
  I.videocam = (c) => { rr(c, 0.16, 0.34, 0.44, 0.34, 0.05, false); poly(c, [[0.62, 0.44], [0.84, 0.34], [0.84, 0.68], [0.62, 0.58]], true, false); circ(c, 0.28, 0.51, 0.02, true); };
  I.tv = (c) => { rr(c, 0.14, 0.3, 0.72, 0.46, 0.05, false); seg(c, 0.4, 0.14, 0.5, 0.3); seg(c, 0.6, 0.14, 0.5, 0.3); c.lineWidth = 0.05; seg(c, 0.3, 0.82, 0.7, 0.82); };
  I.qr = (c) => { c.lineWidth = 0.06; rr(c, 0.16, 0.16, 0.24, 0.24, 0.02, false); rr(c, 0.6, 0.16, 0.24, 0.24, 0.02, false); rr(c, 0.16, 0.6, 0.24, 0.24, 0.02, false); circ(c, 0.28, 0.28, 0.05, true); circ(c, 0.72, 0.28, 0.05, true); circ(c, 0.28, 0.72, 0.05, true); c.fillRect(0.58, 0.58, 0.1, 0.1); c.fillRect(0.74, 0.58, 0.1, 0.1); c.fillRect(0.58, 0.74, 0.1, 0.1); c.fillRect(0.74, 0.74, 0.1, 0.1); };
  I.satellite = (c) => { c.save(); c.translate(0.5, 0.5); c.rotate(-0.4); rr(c, -0.1, -0.28, 0.2, 0.56, 0.03, false); c.lineWidth = 0.05; seg(c, -0.1, -0.14, 0.1, -0.14); seg(c, -0.1, 0.0, 0.1, 0.0); seg(c, -0.1, 0.14, 0.1, 0.14); c.restore(); path(c, (c) => { mv(c, 0.62, 0.3); c.arc(0.5, 0.42, 0.28, -Math.PI * 0.4, Math.PI * 0.1, false); }, false); circ(c, 0.7, 0.24, 0.04, true); };

  // ---------- symptoms ----------
  I.picture = (c) => { rr(c, 0.16, 0.22, 0.68, 0.56, 0.05, false); circ(c, 0.34, 0.4, 0.06, true); path(c, (c) => { mv(c, 0.2, 0.72); ln(c, 0.42, 0.5); ln(c, 0.56, 0.62); ln(c, 0.68, 0.5); ln(c, 0.8, 0.66); }, false); };
  I.toilet = (c) => { path(c, (c) => { mv(c, 0.26, 0.34); c.bezierCurveTo(0.24, 0.6, 0.4, 0.68, 0.5, 0.68); c.bezierCurveTo(0.6, 0.68, 0.76, 0.6, 0.74, 0.34); }, false); seg(c, 0.24, 0.34, 0.76, 0.34); seg(c, 0.5, 0.68, 0.5, 0.84); path(c, (c) => { mv(c, 0.36, 0.84); ln(c, 0.64, 0.84); }, false); rr(c, 0.6, 0.14, 0.16, 0.2, 0.02, false); };
  I.smirk = (c) => { circ(c, 0.5, 0.5, 0.36); circ(c, 0.38, 0.42, 0.04, true); circ(c, 0.62, 0.42, 0.04, true); path(c, (c) => { mv(c, 0.36, 0.62); c.bezierCurveTo(0.48, 0.72, 0.64, 0.66, 0.68, 0.56); }, false); };
  I.peach = (c) => { path(c, (c) => { mv(c, 0.5, 0.26); c.bezierCurveTo(0.2, 0.24, 0.16, 0.66, 0.5, 0.86); c.bezierCurveTo(0.84, 0.66, 0.8, 0.24, 0.5, 0.26); }, false); seg(c, 0.5, 0.34, 0.5, 0.78); path(c, (c) => { mv(c, 0.5, 0.26); c.bezierCurveTo(0.56, 0.12, 0.72, 0.1, 0.74, 0.16); }, false); };
  I.drumstick = (c) => { circ(c, 0.34, 0.36, 0.16); c.save(); c.translate(0.34, 0.36); for (let i = 0; i < 3; i++) { c.rotate(0.5); seg(c, 0.1, -0.1, 0.16, -0.14); } c.restore(); seg(c, 0.44, 0.46, 0.74, 0.76); c.lineWidth = 0.14; c.lineCap = 'round'; seg(c, 0.72, 0.74, 0.8, 0.82); c.lineWidth = 0.09; };
  I.ice = (c) => { poly(c, [[0.5, 0.12], [0.82, 0.36], [0.7, 0.82], [0.3, 0.82], [0.18, 0.36]], true, false); c.lineWidth = 0.05; seg(c, 0.5, 0.12, 0.5, 0.82); seg(c, 0.18, 0.36, 0.82, 0.36); };
  I.unicorn = (c) => { poly(c, [[0.5, 0.1], [0.56, 0.36], [0.44, 0.36]], true, true); circ(c, 0.4, 0.5, 0.04, true); circ(c, 0.6, 0.5, 0.04, true); for (let i = 0; i < 4; i++) { const a = i * 0.5 + 0.3; seg(c, 0.5 + Math.cos(a) * 0.2, 0.62 + Math.sin(a) * 0.2, 0.5 + Math.cos(a) * 0.3, 0.62 + Math.sin(a) * 0.3); } };
  I.flatFace = (c) => { circ(c, 0.5, 0.5, 0.36); c.lineWidth = 0.06; seg(c, 0.32, 0.42, 0.42, 0.42); seg(c, 0.58, 0.42, 0.68, 0.42); seg(c, 0.36, 0.64, 0.64, 0.64); };
  I.surprised = (c) => { circ(c, 0.5, 0.5, 0.36); circ(c, 0.38, 0.42, 0.05, true); circ(c, 0.62, 0.42, 0.05, true); circ(c, 0.5, 0.66, 0.08, false); };
  I.angry = (c) => { circ(c, 0.5, 0.5, 0.36); c.lineWidth = 0.06; seg(c, 0.3, 0.36, 0.44, 0.44); seg(c, 0.7, 0.36, 0.56, 0.44); circ(c, 0.38, 0.5, 0.03, true); circ(c, 0.62, 0.5, 0.03, true); path(c, (c) => { mv(c, 0.36, 0.68); c.bezierCurveTo(0.48, 0.6, 0.52, 0.6, 0.64, 0.68); }, false); };
  I.stone = (c) => { poly(c, [[0.3, 0.2], [0.7, 0.2], [0.74, 0.6], [0.5, 0.86], [0.26, 0.6]], true, false); c.lineWidth = 0.05; seg(c, 0.36, 0.44, 0.46, 0.44); seg(c, 0.54, 0.44, 0.64, 0.44); seg(c, 0.4, 0.64, 0.6, 0.64); };
  I.moon = (c) => path(c, (c) => { c.arc(0.5, 0.5, 0.36, Math.PI * 0.4, Math.PI * 1.6, false); c.arc(0.34, 0.5, 0.3, Math.PI * 1.6, Math.PI * 0.4, true); }, true);
  I.clapper = (c) => { rr(c, 0.16, 0.4, 0.68, 0.42, 0.04, false); path(c, (c) => { mv(c, 0.16, 0.4); ln(c, 0.22, 0.24); ln(c, 0.84, 0.32); ln(c, 0.84, 0.4); c.closePath(); }, false); c.lineWidth = 0.05; seg(c, 0.34, 0.26, 0.28, 0.4); seg(c, 0.5, 0.28, 0.44, 0.42); seg(c, 0.66, 0.3, 0.6, 0.42); };
  I.puzzle = (c) => path(c, (c) => { mv(c, 0.22, 0.22); ln(c, 0.42, 0.22); c.arc(0.5, 0.22, 0.08, Math.PI, 0, true); ln(c, 0.78, 0.22); ln(c, 0.78, 0.42); c.arc(0.78, 0.5, 0.08, Math.PI * 1.5, Math.PI * 0.5, false); ln(c, 0.78, 0.78); ln(c, 0.22, 0.78); ln(c, 0.22, 0.58); c.arc(0.22, 0.5, 0.08, Math.PI * 0.5, Math.PI * 1.5, false); c.closePath(); }, false);
  I.eyeTarget = (c) => { path(c, (c) => { mv(c, 0.16, 0.5); c.bezierCurveTo(0.32, 0.28, 0.68, 0.28, 0.84, 0.5); c.bezierCurveTo(0.68, 0.72, 0.32, 0.72, 0.16, 0.5); }, false); circ(c, 0.5, 0.5, 0.12); circ(c, 0.5, 0.5, 0.04, true); };
  I.bolt = (c) => poly(c, [[0.56, 0.1], [0.28, 0.54], [0.46, 0.54], [0.4, 0.9], [0.72, 0.42], [0.52, 0.42]], true, true);
  I.fog = (c) => { c.lineWidth = 0.09; for (let i = 0; i < 4; i++) { const y = 0.3 + i * 0.14; seg(c, 0.18 + (i % 2) * 0.08, y, 0.78 - (i % 2) * 0.06, y); } };
  I.wolf = (c) => { poly(c, [[0.24, 0.28], [0.36, 0.5], [0.3, 0.66], [0.5, 0.82], [0.7, 0.66], [0.64, 0.5], [0.76, 0.28], [0.6, 0.4], [0.4, 0.4]], true, false); circ(c, 0.42, 0.54, 0.03, true); circ(c, 0.58, 0.54, 0.03, true); seg(c, 0.5, 0.62, 0.5, 0.7); };
  I.scribble = (c) => { c.lineWidth = 0.07; c.beginPath(); mv(c, 0.18, 0.4); for (let x = 0.18; x <= 0.72; x += 0.02) ln(c, x, 0.4 + Math.sin(x * 40) * 0.06); c.stroke(); c.beginPath(); mv(c, 0.18, 0.6); for (let x = 0.18; x <= 0.6; x += 0.02) ln(c, x, 0.6 + Math.sin(x * 40) * 0.06); c.stroke(); };
  I.spiral = (c) => { c.lineWidth = 0.07; c.beginPath(); for (let t = 0; t <= 5; t += 0.12) { const r = 0.06 + t * 0.055, x = 0.5 + Math.cos(t) * r, y = 0.5 + Math.sin(t) * r; t ? ln(c, x, y) : mv(c, x, y); } c.stroke(); };
  I.ghost = (c) => { path(c, (c) => { mv(c, 0.22, 0.84); ln(c, 0.22, 0.44); c.arc(0.5, 0.44, 0.28, Math.PI, 0, false); ln(c, 0.78, 0.84); ln(c, 0.68, 0.74); ln(c, 0.58, 0.84); ln(c, 0.5, 0.74); ln(c, 0.42, 0.84); ln(c, 0.32, 0.74); c.closePath(); }, false); circ(c, 0.4, 0.44, 0.04, true); circ(c, 0.6, 0.44, 0.04, true); };
  I.blackhole = (c) => { circ(c, 0.5, 0.5, 0.18, true); c.lineWidth = 0.05; for (let i = 0; i < 3; i++) { c.beginPath(); c.ellipse(0.5, 0.5, 0.24 + i * 0.06, 0.34 + i * 0.06, 0, 0, TAU); c.stroke(); } };
  I.tombstone = (c) => { path(c, (c) => { mv(c, 0.26, 0.86); ln(c, 0.26, 0.42); c.arc(0.5, 0.42, 0.24, Math.PI, 0, false); ln(c, 0.74, 0.86); }, false); seg(c, 0.2, 0.86, 0.8, 0.86); c.lineWidth = 0.05; seg(c, 0.5, 0.34, 0.5, 0.5); seg(c, 0.42, 0.42, 0.58, 0.42); };
  I.rainbow = (c) => { c.lineWidth = 0.08; for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(0.5, 0.72, 0.14 + i * 0.11, Math.PI, 0, false); c.globalAlpha = 1 - i * 0.22; c.stroke(); } c.globalAlpha = 1; };

  // ---------- abilities ----------
  I.speechGlobe = (c) => { I.globe((() => { c.save(); c.scale(0.8, 0.8); c.translate(0.06, 0.02); const r = c; I.globe(r); c.restore(); return c; })()); };
  I.radio = (c) => { rr(c, 0.16, 0.44, 0.68, 0.4, 0.05, false); circ(c, 0.66, 0.64, 0.1, false); seg(c, 0.28, 0.58, 0.44, 0.58); seg(c, 0.28, 0.7, 0.4, 0.7); seg(c, 0.3, 0.44, 0.6, 0.2); circ(c, 0.62, 0.18, 0.04, true); };
  I.grass = (c) => { c.lineWidth = 0.07; for (let i = 0; i < 5; i++) { const x = 0.24 + i * 0.13; path(c, (c) => { mv(c, x, 0.84); c.bezierCurveTo(x - 0.02, 0.5, x + 0.04, 0.42, x + (i % 2 ? 0.06 : -0.06), 0.3); }, false); } };
  I.mask = (c) => { path(c, (c) => { mv(c, 0.2, 0.3); c.bezierCurveTo(0.5, 0.24, 0.5, 0.24, 0.8, 0.3); c.bezierCurveTo(0.82, 0.6, 0.66, 0.82, 0.5, 0.82); c.bezierCurveTo(0.34, 0.82, 0.18, 0.6, 0.2, 0.3); }, false); c.lineWidth = 0.05; path(c, (c) => { mv(c, 0.3, 0.44); c.bezierCurveTo(0.36, 0.4, 0.42, 0.4, 0.46, 0.44); }, false); path(c, (c) => { mv(c, 0.54, 0.44); c.bezierCurveTo(0.58, 0.4, 0.64, 0.4, 0.7, 0.44); }, false); };
  I.recycle = (c) => { c.lineWidth = 0.075; c.save(); c.translate(0.5, 0.5); for (let k = 0; k < 3; k++) { c.rotate(TAU / 3); c.beginPath(); c.arc(0, 0, 0.3, -Math.PI * 0.72, -Math.PI * 0.28, false); c.stroke(); const a = -Math.PI * 0.28, x = Math.cos(a) * 0.3, y = Math.sin(a) * 0.3; poly(c, [[x, y], [x + 0.02, y - 0.12], [x + 0.12, y - 0.02]], true, true); } c.restore(); };
  I.wave = (c) => { c.lineWidth = 0.08; for (let j = 0; j < 2; j++) { c.beginPath(); mv(c, 0.12, 0.44 + j * 0.18); for (let x = 0.12; x <= 0.88; x += 0.02) ln(c, x, 0.44 + j * 0.18 + Math.sin(x * 14) * 0.08); c.stroke(); } };
  I.bots = (c) => { const sm = (dx, dy, s) => { c.save(); c.translate(dx, dy); c.scale(s, s); rr(c, -0.2, -0.16, 0.4, 0.36, 0.06, false); seg(c, 0, -0.16, 0, -0.28); circ(c, 0, -0.3, 0.04, true); circ(c, -0.08, 0, 0.04, true); circ(c, 0.08, 0, 0.04, true); c.restore(); }; sm(0.34, 0.42, 0.8); sm(0.66, 0.42, 0.8); sm(0.5, 0.66, 0.8); };
  I.sunglasses = (c) => { path(c, (c) => { mv(c, 0.16, 0.4); ln(c, 0.84, 0.4); }, false); path(c, (c) => { mv(c, 0.18, 0.42); c.bezierCurveTo(0.18, 0.64, 0.44, 0.64, 0.44, 0.44); c.closePath(); }, true); path(c, (c) => { mv(c, 0.56, 0.44); c.bezierCurveTo(0.56, 0.64, 0.82, 0.64, 0.82, 0.42); c.closePath(); }, true); seg(c, 0.44, 0.46, 0.56, 0.46); };
  I.wall = (c) => { c.lineWidth = 0.055; const rows = [0.28, 0.44, 0.6, 0.76]; rows.forEach((y, r) => { seg(c, 0.16, y, 0.84, y); const off = r % 2 ? 0.16 : 0; for (let x = 0.16 + off; x < 0.84; x += 0.22) if (y < 0.76) seg(c, x, y, x, y + 0.16); }); seg(c, 0.16, 0.28, 0.16, 0.76); seg(c, 0.84, 0.28, 0.84, 0.76); };
  I.sock = (c) => path(c, (c) => { mv(c, 0.36, 0.16); ln(c, 0.58, 0.16); ln(c, 0.58, 0.5); ln(c, 0.78, 0.66); c.bezierCurveTo(0.86, 0.72, 0.82, 0.84, 0.72, 0.84); ln(c, 0.44, 0.84); c.bezierCurveTo(0.38, 0.84, 0.36, 0.8, 0.36, 0.72); c.closePath(); }, false);
  I.sliders = (c) => { c.lineWidth = 0.06; [0.3, 0.5, 0.7].forEach((y, i) => { seg(c, 0.16, y, 0.84, y); circ(c, 0.3 + i * 0.22, y, 0.07, true); }); };
  I.burst = (c) => { c.save(); c.translate(0.5, 0.5); for (let i = 0; i < 8; i++) { c.rotate(TAU / 8); seg(c, 0, 0.12, 0, 0.3); } c.restore(); circ(c, 0.5, 0.5, 0.1, false); };
  I.sponge = (c) => { rr(c, 0.2, 0.34, 0.6, 0.4, 0.08, false); c.lineWidth = 0.04; for (let i = 0; i < 6; i++) circ(c, 0.28 + (i % 3) * 0.22, 0.46 + Math.floor(i / 3) * 0.16, 0.03, false); };

  // ---------- country emblems ----------
  I.leaf = (c) => { path(c, (c) => { mv(c, 0.5, 0.14); c.bezierCurveTo(0.16, 0.32, 0.2, 0.74, 0.5, 0.86); c.bezierCurveTo(0.8, 0.74, 0.84, 0.32, 0.5, 0.14); }, false); seg(c, 0.5, 0.2, 0.5, 0.84); c.lineWidth = 0.05; seg(c, 0.5, 0.4, 0.34, 0.32); seg(c, 0.5, 0.4, 0.66, 0.32); seg(c, 0.5, 0.6, 0.32, 0.52); seg(c, 0.5, 0.6, 0.68, 0.52); };
  I.maple = (c) => { c.beginPath(); const pts = [[0.5, 0.1], [0.56, 0.32], [0.74, 0.26], [0.66, 0.44], [0.86, 0.5], [0.68, 0.58], [0.74, 0.76], [0.56, 0.66], [0.5, 0.9], [0.44, 0.66], [0.26, 0.76], [0.32, 0.58], [0.14, 0.5], [0.34, 0.44], [0.26, 0.26], [0.44, 0.32]]; pts.forEach((p, i) => (i ? ln(c, p[0], p[1]) : mv(c, p[0], p[1]))); c.closePath(); c.fill(); };
  I.cactus = (c) => { c.lineWidth = 0.12; c.lineCap = 'round'; seg(c, 0.5, 0.88, 0.5, 0.3); c.lineWidth = 0.09; path(c, (c) => { mv(c, 0.5, 0.56); c.bezierCurveTo(0.3, 0.56, 0.3, 0.44, 0.3, 0.34); }, false); path(c, (c) => { mv(c, 0.5, 0.5); c.bezierCurveTo(0.7, 0.5, 0.7, 0.38, 0.7, 0.28); }, false); };
  I.palm = (c) => { seg(c, 0.5, 0.86, 0.54, 0.44); c.lineWidth = 0.07; for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * 0.55; path(c, (c) => { mv(c, 0.54, 0.42); c.bezierCurveTo(0.54 + Math.cos(a) * 0.16, 0.42 + Math.sin(a) * 0.16, 0.54 + Math.cos(a) * 0.3, 0.44 + Math.sin(a) * 0.18, 0.54 + Math.cos(a) * 0.36, 0.5 + Math.sin(a) * 0.14); }, false); } };
  I.ball = (c) => { circ(c, 0.5, 0.5, 0.36); c.lineWidth = 0.05; const p = []; for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * TAU / 5; p.push([0.5 + Math.cos(a) * 0.14, 0.5 + Math.sin(a) * 0.14]); } poly(c, p, true, false); for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * TAU / 5; seg(c, p[i][0], p[i][1], 0.5 + Math.cos(a) * 0.36, 0.5 + Math.sin(a) * 0.36); } };
  I.sun = (c) => { circ(c, 0.5, 0.5, 0.18, false); c.save(); c.translate(0.5, 0.5); for (let i = 0; i < 12; i++) { c.rotate(TAU / 12); seg(c, 0, 0.24, 0, 0.36); } c.restore(); };
  I.mountain = (c) => { poly(c, [[0.1, 0.78], [0.36, 0.34], [0.52, 0.56], [0.66, 0.28], [0.9, 0.78]], true, false); c.lineWidth = 0.05; seg(c, 0.28, 0.5, 0.36, 0.34); seg(c, 0.36, 0.34, 0.44, 0.48); };
  I.crown = (c) => { path(c, (c) => { mv(c, 0.2, 0.72); ln(c, 0.26, 0.34); ln(c, 0.4, 0.56); ln(c, 0.5, 0.28); ln(c, 0.6, 0.56); ln(c, 0.74, 0.34); ln(c, 0.8, 0.72); c.closePath(); }, false); seg(c, 0.24, 0.78, 0.76, 0.78); };
  I.tower = (c) => { poly(c, [[0.5, 0.12], [0.66, 0.86], [0.34, 0.86]], false, false); seg(c, 0.42, 0.5, 0.58, 0.5); seg(c, 0.38, 0.68, 0.62, 0.68); path(c, (c) => { mv(c, 0.44, 0.68); c.bezierCurveTo(0.44, 0.58, 0.56, 0.58, 0.56, 0.68); }, false); };
  I.mug = (c) => { rr(c, 0.24, 0.28, 0.4, 0.54, 0.04, false); path(c, (c) => { mv(c, 0.64, 0.38); c.bezierCurveTo(0.84, 0.38, 0.84, 0.66, 0.64, 0.66); }, false); c.lineWidth = 0.05; path(c, (c) => { mv(c, 0.3, 0.28); c.bezierCurveTo(0.34, 0.16, 0.42, 0.16, 0.44, 0.24); c.bezierCurveTo(0.48, 0.14, 0.56, 0.16, 0.56, 0.26); }, false); };
  I.cheese = (c) => { poly(c, [[0.16, 0.66], [0.82, 0.36], [0.82, 0.66]], true, false); c.lineWidth = 0.05; circ(c, 0.6, 0.54, 0.04, false); circ(c, 0.7, 0.46, 0.03, false); circ(c, 0.48, 0.58, 0.03, false); };
  I.column = (c) => { seg(c, 0.28, 0.3, 0.72, 0.3); c.lineWidth = 0.06; seg(c, 0.36, 0.34, 0.36, 0.76); seg(c, 0.5, 0.34, 0.5, 0.76); seg(c, 0.64, 0.34, 0.64, 0.76); c.lineWidth = 0.09; seg(c, 0.24, 0.8, 0.76, 0.8); poly(c, [[0.3, 0.3], [0.4, 0.2], [0.6, 0.2], [0.7, 0.3]], true, false); };
  I.dome = (c) => { path(c, (c) => { mv(c, 0.34, 0.76); ln(c, 0.34, 0.46); c.bezierCurveTo(0.34, 0.28, 0.5, 0.16, 0.5, 0.16); c.bezierCurveTo(0.5, 0.16, 0.66, 0.28, 0.66, 0.46); ln(c, 0.66, 0.76); }, false); seg(c, 0.5, 0.16, 0.5, 0.06); seg(c, 0.28, 0.8, 0.72, 0.8); };
  I.snowflake = (c) => { c.save(); c.translate(0.5, 0.5); c.lineWidth = 0.055; for (let i = 0; i < 6; i++) { c.rotate(TAU / 6); seg(c, 0, 0, 0, -0.38); seg(c, 0, -0.24, 0.08, -0.32); seg(c, 0, -0.24, -0.08, -0.32); } c.restore(); };
  I.paw = (c) => { circ(c, 0.5, 0.62, 0.18, true); circ(c, 0.28, 0.44, 0.08, true); circ(c, 0.44, 0.32, 0.08, true); circ(c, 0.6, 0.32, 0.08, true); circ(c, 0.74, 0.44, 0.08, true); };
  I.dune = (c) => { path(c, (c) => { mv(c, 0.12, 0.7); c.bezierCurveTo(0.3, 0.5, 0.4, 0.66, 0.56, 0.56); c.bezierCurveTo(0.72, 0.46, 0.8, 0.62, 0.88, 0.6); }, false); path(c, (c) => { mv(c, 0.12, 0.82); c.bezierCurveTo(0.34, 0.66, 0.5, 0.8, 0.66, 0.72); c.bezierCurveTo(0.78, 0.66, 0.84, 0.76, 0.88, 0.76); }, false); circ(c, 0.7, 0.32, 0.1, false); };
  I.pyramid = (c) => { poly(c, [[0.5, 0.16], [0.86, 0.8], [0.14, 0.8]], true, false); seg(c, 0.5, 0.16, 0.5, 0.8); c.lineWidth = 0.05; seg(c, 0.32, 0.8, 0.5, 0.5); };
  I.drum = (c) => { path(c, (c) => { mv(c, 0.28, 0.4); ln(c, 0.72, 0.4); ln(c, 0.66, 0.8); ln(c, 0.34, 0.8); c.closePath(); }, false); c.beginPath(); c.ellipse(0.5, 0.4, 0.22, 0.08, 0, 0, TAU); c.stroke(); c.lineWidth = 0.05; seg(c, 0.3, 0.44, 0.66, 0.76); seg(c, 0.7, 0.44, 0.34, 0.76); seg(c, 0.62, 0.2, 0.72, 0.36); seg(c, 0.62, 0.2, 0.8, 0.3); };
  I.note = (c) => { circ(c, 0.34, 0.72, 0.12, false); seg(c, 0.46, 0.72, 0.46, 0.24); circ(c, 0.66, 0.64, 0.12, false); seg(c, 0.78, 0.64, 0.78, 0.18); path(c, (c) => { mv(c, 0.46, 0.24); ln(c, 0.78, 0.18); }, false); };
  I.tree = (c) => { seg(c, 0.5, 0.86, 0.5, 0.5); c.lineWidth = 0.07; for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * 0.42; seg(c, 0.5, 0.5, 0.5 + Math.cos(a) * 0.32, 0.5 + Math.sin(a) * 0.32); } path(c, (c) => { mv(c, 0.24, 0.44); c.bezierCurveTo(0.34, 0.3, 0.66, 0.3, 0.76, 0.44); }, false); };
  I.oildrop = (c) => path(c, (c) => { mv(c, 0.5, 0.14); c.bezierCurveTo(0.28, 0.44, 0.24, 0.6, 0.3, 0.72); c.bezierCurveTo(0.38, 0.88, 0.62, 0.88, 0.7, 0.72); c.bezierCurveTo(0.76, 0.6, 0.72, 0.44, 0.5, 0.14); }, false);
  I.lotus = (c) => { for (let i = -2; i <= 2; i++) { const a = i * 0.5; path(c, (c) => { mv(c, 0.5, 0.78); c.bezierCurveTo(0.5 + Math.cos(a - Math.PI / 2) * 0.18 - i * 0.02, 0.5, 0.5 + Math.sin(a) * 0.3, 0.36 + Math.abs(i) * 0.06, 0.5 + Math.sin(a) * 0.36, 0.3 + Math.abs(i) * 0.08); c.bezierCurveTo(0.5 + Math.sin(a) * 0.2, 0.5, 0.5, 0.62, 0.5, 0.78); }, false); } };
  I.temple = (c) => { poly(c, [[0.18, 0.4], [0.5, 0.16], [0.82, 0.4]], true, false); seg(c, 0.24, 0.4, 0.24, 0.78); seg(c, 0.4, 0.4, 0.4, 0.78); seg(c, 0.6, 0.4, 0.6, 0.78); seg(c, 0.76, 0.4, 0.76, 0.78); seg(c, 0.16, 0.82, 0.84, 0.82); };
  I.lantern = (c) => { seg(c, 0.5, 0.1, 0.5, 0.2); rr(c, 0.3, 0.2, 0.4, 0.56, 0.2, false); seg(c, 0.5, 0.76, 0.5, 0.86); c.lineWidth = 0.05; seg(c, 0.36, 0.28, 0.64, 0.28); seg(c, 0.36, 0.68, 0.64, 0.68); seg(c, 0.5, 0.32, 0.5, 0.64); };
  I.volcano = (c) => { poly(c, [[0.16, 0.82], [0.36, 0.42], [0.64, 0.42], [0.84, 0.82]], true, false); path(c, (c) => { mv(c, 0.4, 0.42); c.bezierCurveTo(0.42, 0.28, 0.46, 0.3, 0.5, 0.22); c.bezierCurveTo(0.54, 0.3, 0.58, 0.28, 0.6, 0.42); }, false); c.lineWidth = 0.05; seg(c, 0.5, 0.22, 0.44, 0.1); seg(c, 0.5, 0.22, 0.58, 0.12); };
  I.torii = (c) => { seg(c, 0.2, 0.24, 0.8, 0.18); seg(c, 0.24, 0.36, 0.76, 0.36); seg(c, 0.34, 0.24, 0.34, 0.84); seg(c, 0.66, 0.24, 0.66, 0.84); c.lineWidth = 0.05; seg(c, 0.16, 0.28, 0.84, 0.22); };
  I.taegeuk = (c) => { circ(c, 0.5, 0.5, 0.36); path(c, (c) => { c.arc(0.5, 0.5, 0.36, -Math.PI / 2, Math.PI / 2, false); c.arc(0.5, 0.68, 0.18, Math.PI / 2, -Math.PI / 2, true); c.arc(0.5, 0.32, 0.18, Math.PI / 2, -Math.PI / 2, false); }, true); };
  I.boomerang = (c) => { c.lineWidth = 0.14; c.lineCap = 'round'; c.lineJoin = 'round'; path(c, (c) => { mv(c, 0.24, 0.28); c.bezierCurveTo(0.6, 0.3, 0.7, 0.4, 0.72, 0.76); }, false); };
  I.eagle = (c) => { path(c, (c) => { mv(c, 0.5, 0.32); c.bezierCurveTo(0.3, 0.24, 0.16, 0.4, 0.14, 0.52); c.bezierCurveTo(0.34, 0.46, 0.42, 0.5, 0.5, 0.56); c.bezierCurveTo(0.58, 0.5, 0.66, 0.46, 0.86, 0.52); c.bezierCurveTo(0.84, 0.4, 0.7, 0.24, 0.5, 0.32); }, true); seg(c, 0.5, 0.56, 0.5, 0.74); poly(c, [[0.44, 0.74], [0.56, 0.74], [0.5, 0.86]], true, true); circ(c, 0.5, 0.26, 0.06, true); };
  I.dragon = (c) => { c.lineWidth = 0.07; path(c, (c) => { mv(c, 0.16, 0.7); c.bezierCurveTo(0.36, 0.5, 0.28, 0.34, 0.46, 0.28); c.bezierCurveTo(0.64, 0.22, 0.72, 0.36, 0.66, 0.44); c.bezierCurveTo(0.6, 0.5, 0.5, 0.46, 0.52, 0.4); }, false); circ(c, 0.6, 0.34, 0.02, true); for (let i = 0; i < 4; i++) seg(c, 0.3 + i * 0.1, 0.58 - i * 0.06, 0.34 + i * 0.1, 0.5 - i * 0.06); };

  // ================= UPGRADE / COUNTRY / HUD MAPPING ==================
  const UP = {
    dm: 'chat', shortvid: 'phone', crosspost: 'repost', algo: 'target', encrypted: 'lock', boomer: 'megaphone',
    offline: 'person', translate: 'globe', influencer: 'selfie', news: 'newspaper', aislop: 'robot', podcast: 'mic',
    emoji: 'emojiFace', asmr: 'headphones', discord: 'controller', mobilegame: 'joystick', streamer: 'videocam',
    smarttv: 'tv', qrgraffiti: 'qr', satellite: 'satellite',
    postmemes: 'picture', slang_skibidi: 'toilet', slang_ohio: 'skull', slang_rizz: 'smirk', slang_gyatt: 'peach',
    slang_fanum: 'drumstick', slang_sigma: 'ice', slang_delulu: 'unicorn', slang_mid: 'flatFace', reaction: 'surprised',
    braindead: 'brain', ragebait: 'angry', combo_sor: 'star', combo_looksmax: 'stone', doomscroll: 'moon', npc: 'robot',
    edits: 'clapper', fragment: 'puzzle', hyperfix: 'eyeTarget', tics: 'bolt', brainfog: 'fog', combo_sigma: 'wolf',
    nosentences: 'scribble', detach: 'spiral', parasocial: 'ghost', collapse: 'blackhole', terminal: 'tombstone', combo_delulu: 'rainbow',
    modresist: 'shield', modresist2: 'shield2', multiling: 'speechGlobe', offgrid: 'radio', obfuscate: 'fog',
    astroturf: 'grass', deepfake: 'mask', remix: 'recycle', trendsurf: 'wave', botfarm: 'bots', vpn: 'sunglasses',
    firewall: 'wall', sockpuppets: 'sock', algocapture: 'sliders', cryptogrift: 'coin', griefarmy: 'burst', memoryhole: 'sponge',
  };
  const CO = {
    'United States': 'eagle', 'Canada': 'maple', 'Mexico': 'cactus', 'Central America': 'palm', 'Brazil': 'ball',
    'Argentina': 'sun', 'Andean States': 'mountain', 'United Kingdom': 'crown', 'France': 'tower', 'Germany': 'mug',
    'Western Europe': 'cheese', 'Southern Europe': 'column', 'Central Europe': 'mug', 'Eastern Europe': 'dome',
    'Scandinavia': 'snowflake', 'Russia': 'paw', 'North Africa': 'dune', 'Egypt': 'pyramid', 'West Africa': 'drum',
    'Nigeria': 'note', 'Central Africa': 'tree', 'East Africa': 'tree', 'Southern Africa': 'mountain', 'South Africa': 'paw',
    'Middle East': 'oildrop', 'Central Asia': 'mountain', 'India': 'lotus', 'South Asia': 'temple', 'China': 'dragon',
    'Southeast Asia': 'temple', 'Indonesia': 'volcano', 'Japan': 'torii', 'South Korea': 'taegeuk', 'Australia': 'boomerang', 'Oceania': 'wave',
  };
  const HUD = { virality: 'heart', infected: 'zombie', terminal: 'skull', global: 'globe', trending: 'chartUp',
    cure: 'flask', heat: 'flame', dna: 'dna', brain: 'brain', biohazard: 'biohazard', menu: 'bars', stats: 'barchart',
    awards: 'trophy', pause: 'pause', play: 'play', ff: 'ff', ff2: 'ff2', coin: 'coin', evolve: 'dna',
    healthy: 'sprout', news: 'newspaper', awareness: 'eyeTarget', infectivity: 'bolt', severity: 'alert', lethality: 'skull',
    clock: 'clock', transmission: 'satellite', symptom: 'brain', ability: 'shield', check: 'check',
    plane: 'plane', ship: 'ship', road: 'road', eye: 'eyeTarget' };

  // ================= RENDER + CACHE ==================
  const CELL = 100;                          // authoring resolution
  const cache = new Map();                   // key name|color -> canvas
  function bake(name, color) {
    const key = name + '|' + color, hit = cache.get(key); if (hit) return hit;
    const cv = document.createElement('canvas'); cv.width = cv.height = CELL;
    const c = cv.getContext('2d');
    c.scale(CELL, CELL); c.strokeStyle = color; c.fillStyle = color; c.lineWidth = 0.09; c.lineCap = 'round'; c.lineJoin = 'round';
    const fn = I[name]; if (fn) { try { fn(c); } catch (e) { /* never break the frame */ } }
    cache.set(key, cv); return cv;
  }
  const Sprites = {
    has: (name) => !!I[name],
    iconFor(kind, id) { const m = kind === 'upgrade' ? UP : kind === 'country' ? CO : HUD; return m[id] || (kind === 'country' ? 'globe' : kind === 'upgrade' ? 'chat' : 'heart'); },
    // Blit centered at (x,y) filling a size×size box. color tints; glow adds neon halo.
    draw(ctx, name, x, y, size, color, glow) {
      const cv = bake(name, color || '#eef');
      ctx.save();
      if (glow) { ctx.shadowColor = color || '#ff4bd8'; ctx.shadowBlur = glow === true ? size * 0.4 : glow; }
      ctx.drawImage(cv, x - size / 2, y - size / 2, size, size);
      ctx.restore();
    },
    // Data URL for DOM <img>. Rendered at the requested pixel size × DPR.
    dataURL(name, size, color) {
      const dpr = Math.min(3, (typeof window !== 'undefined' && window.devicePixelRatio) || 1);
      const px = Math.round(size * dpr);
      const cv = document.createElement('canvas'); cv.width = cv.height = px;
      const c = cv.getContext('2d'); c.scale(px, px);
      c.strokeStyle = color || '#eef'; c.fillStyle = color || '#eef'; c.lineWidth = 0.09; c.lineCap = 'round'; c.lineJoin = 'round';
      const fn = I[name]; if (fn) { try { fn(c); } catch (e) {} }
      return cv.toDataURL();
    },
    // <img>-ready HTML string for an icon (used inside tree nodes, chips, etc.).
    img(name, size, color, cls) {
      return `<img class="${cls || 'spr'}" width="${size}" height="${size}" src="${this.dataURL(name, size, color || '#eef')}" alt="">`;
    },
    _icons: I, _up: UP, _co: CO, _hud: HUD,
    // Build one packed debug atlas of every icon (for export / screenshot).
    buildAtlas(color) {
      const names = Object.keys(I), cols = 12, cell = 64, rows = Math.ceil(names.length / cols);
      const cv = document.createElement('canvas'); cv.width = cols * cell; cv.height = rows * cell;
      const c = cv.getContext('2d'); c.fillStyle = '#140a26'; c.fillRect(0, 0, cv.width, cv.height);
      names.forEach((n, i) => { const gx = (i % cols) * cell, gy = Math.floor(i / cols) * cell; this.draw(c, n, gx + cell / 2, gy + cell / 2, cell * 0.72, color || '#ff8be6', false); });
      return cv;
    },
  };
  BR.Sprites = Sprites;
})(typeof window !== 'undefined' ? window : globalThis);
