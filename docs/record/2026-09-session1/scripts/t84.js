const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage({ viewport: { width: 1100, height: 900 } });
  const errs=[]; p.on('pageerror', e=>errs.push(e.message));
  await p.goto('http://localhost:8765/field/index.html?debug'); await p.waitForTimeout(1500);
  const W=ms=>p.waitForTimeout(ms);
  const st=()=>p.evaluate(()=>bogiDebug.rpg.debug.state());
  await p.evaluate(()=>bogiDebug.enterWorld('kasumi')); await W(1500);
  await p.evaluate(()=>bogiDebug.rpg.debug.load('cockpit','door')); await W(1200);
  await p.evaluate(()=>bogiDebug.rpg.debug.teleport(3*32,4.9*32)); await p.keyboard.down('ArrowUp'); await W(100); await p.keyboard.up('ArrowUp'); await W(300);
  await p.keyboard.press('Enter'); await W(2500); await p.locator('.game-frame').screenshot({path:'q_mm1.png'});
  await p.keyboard.press('ArrowDown'); await W(150); await p.locator('.game-frame').screenshot({path:'q_mm2.png'});
  await p.keyboard.press('Enter'); await W(800); console.log('after Нет', await st());
  await p.keyboard.press('Enter'); await W(2500); await p.keyboard.press('Enter'); await W(1500); console.log('after Да', await st());
  console.log(errs); await b.close(); })();
