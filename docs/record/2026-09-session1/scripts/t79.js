const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage({ viewport: { width: 1100, height: 900 } });
  await p.goto('http://localhost:8765/field/index.html?debug'); await p.waitForTimeout(1500);
  await p.evaluate(()=>bogiDebug.enterWorld('lake')); await p.waitForTimeout(1500);
  await p.evaluate(()=>bogiDebug.rpg.debug.load('shop','door')); await p.waitForTimeout(1200);
  await p.evaluate(()=>bogiDebug.rpg.debug.teleport(8.2*32,3.9*32)); await p.keyboard.down('ArrowUp'); await p.waitForTimeout(100); await p.keyboard.up('ArrowUp'); await p.waitForTimeout(400);
  await p.locator('.game-frame').screenshot({path:'q_mk.png'});
  await b.close(); })();
