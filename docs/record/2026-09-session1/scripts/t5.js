const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage({ viewport: { width: 1100, height: 900 } });
  const errs=[]; p.on('pageerror', e=>errs.push(e.message));
  await p.goto('http://localhost:8765/field/index.html');
  await p.evaluate(()=>localStorage.clear()); await p.reload(); await p.waitForTimeout(800);
  await p.keyboard.down('ArrowUp'); await p.waitForTimeout(2100); await p.keyboard.up('ArrowUp');
  await p.waitForTimeout(300); await p.keyboard.press('Enter'); await p.waitForTimeout(300); await p.keyboard.press('Enter'); await p.waitForTimeout(1800);
  await p.locator('.game-frame').screenshot({path:'t5.png'});
  console.log('errors',errs);
  await b.close();
})();
