const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage({ viewport: { width: 1100, height: 900 } });
  const errs=[]; p.on('pageerror', e=>errs.push(e.message));
  await p.goto('http://localhost:8765/field/index.html?debug');
  await p.evaluate(()=>localStorage.clear()); await p.reload(); await p.waitForTimeout(1500);
  await p.evaluate(()=>bogiDebug.rpg.debug.teleport(33*32,23.5*32)); await p.keyboard.down('ArrowUp'); await p.waitForTimeout(500); await p.keyboard.up('ArrowUp');
  await p.waitForTimeout(3000);
  console.log(await p.evaluate(()=>[bogiDebug.rpg.debug.state(), document.getElementById('storyOverlay').hidden]), errs);
  await b.close(); })();
