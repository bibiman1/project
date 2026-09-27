const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage({ viewport: { width: 1100, height: 900 } });
  const errs=[]; p.on('pageerror', e=>errs.push(e.message));
  await p.goto('http://localhost:8765/field/index.html?debug');
  await p.evaluate(()=>localStorage.clear()); await p.reload(); await p.waitForTimeout(1500);
  const shot=n=>p.locator('.game-frame').screenshot({path:`q_${n}.png`});
  await p.evaluate(()=>bogiDebug.rpg.debug.teleport(33*32,23.5*32)); await p.keyboard.down('ArrowUp'); await p.waitForTimeout(500); await p.keyboard.up('ArrowUp');
  await p.waitForTimeout(1500); await shot('w1');
  await p.keyboard.press('KeyC'); await p.waitForTimeout(300); await shot('w2'); await p.keyboard.press('Enter'); await p.keyboard.press('ArrowDown'); await p.waitForTimeout(200); await p.locator('.game-frame').screenshot({path:'q_w4.png'}); await p.keyboard.press('KeyC'); await p.keyboard.press('KeyC');
  await p.evaluate(()=>bogiDebug.enterWorld('lake')); await p.waitForTimeout(2500);
  await p.evaluate(()=>bogiDebug.rpg.debug.load('shop','door')); await p.waitForTimeout(1200);
  await p.evaluate(()=>bogiDebug.rpg.debug.teleport(13.2*32,2.4*32)); await p.keyboard.down('ArrowUp'); await p.waitForTimeout(100); await p.keyboard.up('ArrowUp'); await p.waitForTimeout(400); await shot('w3');
  console.log(errs); await b.close(); })();
