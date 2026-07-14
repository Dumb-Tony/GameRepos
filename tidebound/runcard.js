/* =====================================================================
 * runcard.js — shareable run cards. At any ending (or death) the player
 * can download a canvas-rendered keepsake image of the run: the ending's
 * title over a painted mini-backdrop, the run's vitals, and a handful of
 * Ledger deeds. No assets, no dependencies — pure canvas, like everything
 * else here. TB.RunCard.render(state) returns the canvas (tests use it);
 * TB.RunCard.download(state) saves it as a PNG.
 * =================================================================== */
(function (G) {
  'use strict';
  const TB = G.TB;
  const RC = (TB.RunCard = {});

  // mini palettes per ending backdrop: [skyTop, skyBottom, sea, sand, accent]
  const PAL = {
    'beach-day': ['#7db8dd', '#eef6f4', '#2f8fa8', '#e8d7ae', '#fff3c4'],
    'beach-dusk': ['#3f3f74', '#ecb26b', '#2c3550', '#b9a37f', '#ffd9a0'],
    'beach-night': ['#050d1a', '#14304a', '#0e2438', '#3d3931', '#2fe0c9'],
    'ocean-night': ['#040b16', '#10263d', '#0c2033', '#071626', '#e8ecf2'],
    'jungle': ['#274b31', '#6fa05c', '#1e3d27', '#233c24', '#f5ffce'],
    'jungle-night': ['#04120c', '#113322', '#081c12', '#0b1c11', '#dfe8ec'],
    'camp-fringe': ['#3b6a44', '#8fb46a', '#2c4f31', '#4a5c39', '#f8ffd6'],
    'cliff-camp': ['#89b7d6', '#f0e9d8', '#2e8aa5', '#8b7f6b', '#fff1c0'],
    'grove': ['#79a86b', '#e6ecc0', '#5d8a4e', '#7a8a54', '#fffbe0'],
    'tidepools': ['#8fc3d8', '#f2f4ea', '#57b3ad', '#c9c3a4', '#fff7d0'],
    'station': ['#9fb3ba', '#e8e9dc', '#5d7a54', '#a9a99a', '#fbf7dd'],
    'gullet': ['#02070c', '#0b1f2e', '#0a2331', '#0a141c', '#2fe0c9'],
    'temple': ['#3d4f63', '#93a08f', '#1b2f3d', '#5a5f55', '#e8ecda'],
    'caldera': ['#7f9bb5', '#e6ecd2', '#4d7a49', '#6f6a58', '#fef8d8'],
    'river': ['#8fbfae', '#f0f5e2', '#7fb5c9', '#8b9a7a', '#fdfce0'],
    'mangrove': ['#5e7768', '#b5bd97', '#4a5c43', '#3d4a36', '#f2f5d9'],
    'sky': ['#5f8fc7', '#dfe9f2', '#a8c6e2', '#dfe9f2', '#fff7d9'],
    'title': ['#0e2a44', '#f7c777', '#175066', '#082331', '#ffe3a3'],
  };
  const DEATH_TITLES = {
    thirst: 'THE DRIFTWOOD TONGUE', hunger: 'HUNGER\'S QUIET', undertow: 'UNDERTOW',
    fever: 'MARSH FEVER', despair: 'THE GREEN SWALLOWS', dark: 'THE LONG DARK',
    grin: 'OLD GRIN', injury: 'THE SMALL LOAN',
    boarking: 'THE BOAR KING', fall: 'THE FALL', coldfire: 'COLD FIRE', ash: 'MOTHER ASH',
  };
  const NAMES = { kavi: 'Kavi 🐕', ipo: 'Ipo 🐒', vela: 'Vela 🦅', buri: 'Buri 🐗', moa: 'Moa 🐔', nine: 'Nine 🐙' };
  const TIERS = ['wary', 'tolerant', 'bonded', 'devoted', 'kindred'];

  // deeds, in bragging order — first five that apply make the card
  const DEEDS = [
    ['TIDEWELL_KEEP', 'took the covenant at the mountain pool'],
    ['INNER_GREEN', 'was welcomed into the Inner Green'],
    ['VISION_SEEN', 'saw the Sundering from inside'],
    ['HEARTGLASS', 'carried heart-glass out of the deep'],
    ['OTHER_HEARD', 'heard the nine-beat station through the Hum'],
    ['CONTACT_MADE', 'raised a living voice on a dead radio'],
    ['KING_ALLY', 'made treaty with the Boar King'],
    ['ROSA_DONE', 'dove the Rosa Dourada'],
    ['TREASURE_LEFT', 'left a dead ship\'s gold sleeping'],
    ['CASE_OPEN', 'opened the locked courier case'],
    ['Q_KAVI_DONE', 'carried Bosun\'s collar home'],
    ['HATCHLING', 'saved the high nest\'s last egg'],
    ['FLOCK', 'raised a flock from one brave hen'],
    ['KAARI_SEEDS', 'grew the old colors from the seed vault'],
    ['REEF_LEARNS', 'taught the reef something new'],
    ['Q_ROOSTER_DONE', 'gave Edda\'s grove its voice back'],
    ['EDDA_WINTER', 'wintered the hermit of the mountain'],
    ['RYO_MET', 'salvaged the Kingfisher\'s sailor'],
    ['GRIN_ESCORTED', 'settled accounts with Old Grin'],
    ['HOME_NAMED', 'named a home and made it true'],
  ];

  function wrap(ctx, text, x, y, maxW, lh) {
    const words = text.split(' ');
    let line = '';
    for (const w of words) {
      const t = line ? line + ' ' + w : w;
      if (ctx.measureText(t).width > maxW && line) { ctx.fillText(line, x, y); y += lh; line = w; }
      else line = t;
    }
    if (line) ctx.fillText(line, x, y);
    return y + lh;
  }
  function rrect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }

  RC.render = function (s) {
    const dead = !!s.deathCause;
    const core = !dead && TB.CORES && TB.CORES[s.endingId];
    const icon = dead ? '🌑' : (core ? core.icon : '🏝️');
    const title = dead ? (DEATH_TITLES[s.deathCause] || 'THE ISLAND KEEPS') : (core ? core.title : 'TIDEBOUND');
    const bg = dead ? 'ocean-night' : (core ? core.bg : 'beach-dusk');
    const P = PAL[bg] || PAL['beach-dusk'];
    const W = 1080, H = 1350;
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d');

    // --- painted mini-backdrop ---
    let g = ctx.createLinearGradient(0, 0, 0, H * 0.62);
    g.addColorStop(0, P[0]); g.addColorStop(1, P[1]);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H * 0.62);
    ctx.save(); // the sun / moon
    ctx.shadowColor = P[4]; ctx.shadowBlur = 90;
    ctx.fillStyle = P[4]; ctx.beginPath(); ctx.arc(W * 0.72, H * 0.16, 64, 0, 7); ctx.fill();
    ctx.restore();
    g = ctx.createLinearGradient(0, H * 0.55, 0, H * 0.85);
    g.addColorStop(0, P[2]); g.addColorStop(1, P[3]);
    ctx.fillStyle = g; ctx.fillRect(0, H * 0.55, W, H * 0.45);
    ctx.globalAlpha = 0.85; ctx.font = '110px serif';
    ctx.fillText('🌴', 40, H - 60); ctx.fillText('🌴', 140, H - 90);
    ctx.globalAlpha = 1;

    // --- header ---
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f2ede2';
    ctx.shadowColor = '#000000aa'; ctx.shadowBlur = 24;
    try { ctx.letterSpacing = '14px'; } catch (e) {}
    ctx.font = '64px Georgia, serif';
    ctx.fillText('T I D E B O U N D', W / 2, 130);
    try { ctx.letterSpacing = '0px'; } catch (e) {}
    ctx.font = 'italic 30px Georgia, serif';
    ctx.fillText('a survival visual novel', W / 2, 180);
    ctx.shadowBlur = 0;

    // --- the panel ---
    const px = 70, py = 250, pw = W - 140, ph = 850;
    ctx.fillStyle = 'rgba(4,16,26,0.90)';
    ctx.strokeStyle = 'rgba(255,255,255,0.28)'; ctx.lineWidth = 2;
    rrect(ctx, px, py, pw, ph, 28); ctx.fill(); ctx.stroke();

    ctx.font = '84px serif';
    ctx.fillText(icon, W / 2, py + 130);
    ctx.fillStyle = P[4];
    ctx.font = '52px Georgia, serif';
    let y = wrap(ctx, title, W / 2, py + 220, pw - 120, 60);
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillRect(px + 90, y - 20, pw - 180, 2);
    y += 40;

    ctx.fillStyle = '#f2ede2';
    ctx.font = '34px Georgia, serif';
    ctx.fillText('Run of ' + s.day + ' days · Chapter ' + (s.chapter || 1), W / 2, y); y += 52;
    ctx.fillText(s.companion ? 'Companion: ' + NAMES[s.companion] + ' — ' + TIERS[TB.tier()] : 'The solo route — alone the whole way', W / 2, y); y += 52;
    ctx.font = '30px Georgia, serif'; ctx.fillStyle = '#cfd8d4';
    ctx.fillText('Signal ' + s.route.signal + '  ·  Roots ' + s.route.roots + '  ·  Depth ' + s.route.depth + '  ·  ' + Object.keys(s.flags).length + ' Ledger entries', W / 2, y); y += 70;

    const deeds = DEEDS.filter((d) => TB.is(d[0])).slice(0, 5);
    if (deeds.length) {
      ctx.fillStyle = '#ffe9b8'; ctx.font = 'italic 30px Georgia, serif';
      ctx.fillText('— the Ledger remembers —', W / 2, y); y += 48;
      ctx.fillStyle = '#e8e3d8'; ctx.font = '29px Georgia, serif';
      for (const d of deeds) { y = wrap(ctx, '· ' + d[1], W / 2, y, pw - 160, 38) + 6; }
    }

    // --- footer ---
    const m = TB.meta();
    const found = Object.keys(m.endings || {}).length, total = Object.keys(TB.CORES || {}).length || 33;
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillRect(px + 90, py + ph - 96, pw - 180, 2);
    ctx.fillStyle = '#cfd8d4'; ctx.font = '28px Georgia, serif';
    ctx.fillText('Endings found: ' + found + ' / ' + total + '  ·  Lives lived: ' + (m.runs || 1), W / 2, py + ph - 44);
    ctx.fillStyle = '#f2ede2'; ctx.globalAlpha = 0.9; ctx.font = '26px Georgia, serif';
    ctx.shadowColor = '#000000aa'; ctx.shadowBlur = 16;
    ctx.fillText('dumb-tony.github.io/GameRepos/tidebound', W / 2, H - 150);
    ctx.shadowBlur = 0; ctx.globalAlpha = 1;
    return cv;
  };

  RC.download = function (s) {
    try {
      const cv = RC.render(s);
      const name = 'tidebound-' + (s.deathCause ? 'death-' + s.deathCause : (s.endingId || 'run').toLowerCase()) + '-day' + s.day + '.png';
      if (cv.toBlob) cv.toBlob((b) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(b); a.download = name;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      }, 'image/png');
      else window.open(cv.toDataURL('image/png')); // ancient fallback
    } catch (e) { /* a keepsake must never break the game */ }
  };
})(window);
