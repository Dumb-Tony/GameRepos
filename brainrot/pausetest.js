const { chromium } = require('playwright-core');
const path = require('path');
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const GAME = 'file://' + path.resolve(__dirname, '../brainrot/index.html');
(async () => {
  const b = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const errs=[]; p.on('pageerror',e=>errs.push(String(e.message)));
  await p.goto(GAME, { waitUntil: 'networkidle' }); await p.waitForTimeout(300);
  await p.evaluate(() => document.body.classList.add('rg-dismissed'));
  await p.click('#btnBegin').catch(()=>{});
  await p.evaluate(() => { const g=window.GAME; g.chooseStart(g.world.byName['China']); g.releaseBrainrot(); for(let i=0;i<200;i++) g.simStep(0.1); });
  for (let i=0;i<8;i++){ const ok=await p.$('#newsModal.on #newsOk'); if(!ok)break; await ok.click().catch(()=>{}); await p.waitForTimeout(40); }
  const r = await p.evaluate(() => {
    const g = window.GAME, out = {};
    out.playing = g.paused;                 // false while playing
    g.ui._openModal('menuModal'); out.menuPaused = g.paused;
    g.ui._closeModal('menuModal'); out.menuClosed = g.paused;
    g.ui._openModal('statsModal'); out.statsPaused = g.paused;
    g.ui._closeModal('statsModal'); out.statsClosed = g.paused;
    // toasts cleared on end?
    g.ui.toast('x','test','info');
    g.won = true; g.ended = true; g.ui._showEnd(true);
    out.toastsAfterEnd = document.getElementById('toasts').children.length;
    return out;
  });
  console.log(JSON.stringify(r), errs.length?('ERR '+errs[0]):'ok');
  await b.close();
})().catch(e=>{console.error(e);process.exit(1);});
