const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage({ viewport: { width: 1100, height: 900 } });
  const errs=[]; p.on('pageerror', e=>errs.push(e.message));
  await p.goto('http://localhost:8765/field/index.html?debug'); await p.waitForTimeout(1200);
  const W=ms=>p.waitForTimeout(ms);
  await p.evaluate(()=>bogiDebug.enterWorld('lake')); await W(1500);
  await p.evaluate(()=>bogiDebug.rpg.debug.load('shop','door')); await W(1200);
  await p.evaluate(()=>bogiDebug.rpg.debug.teleport(13.2*32,2.4*32)); await p.keyboard.down('ArrowUp'); await W(150); await p.keyboard.up('ArrowUp'); await W(300);
  console.log(await p.evaluate(()=>bogiDebug.rpg.debug.state()));
  await p.locator('.game-frame').screenshot({path:'q_p1.png'});
  await p.keyboard.press('Enter'); await W(1200); await p.locator('.game-frame').screenshot({path:'q_p2.png'});
  console.log(errs); await b.close(); })();
