const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage({ viewport: { width: 1100, height: 900 } });
  const errs=[]; p.on('pageerror', e=>errs.push(e.message));
  await p.goto('http://localhost:8765/field/index.html?debug'); await p.waitForTimeout(1500);
  await p.evaluate(()=>bogiDebug.enterWorld('haihei')); await p.waitForTimeout(1500);
  await p.evaluate(()=>bogiDebug.rpg.debug.load('hall','south')); await p.waitForTimeout(1500);
  await p.evaluate(()=>bogiDebug.rpg.debug.teleport(8*32,7*32)); await p.waitForTimeout(300);
  await p.evaluate(()=>{const api=bogiDebug.rpg.debug.api(); ['band3','band1','band2','band4','band5'].forEach((id,i)=>api.later(i*180,()=>api.bubble(id,'Hi Hey Win！',2600)));});
  await p.waitForTimeout(1200); await p.locator('.game-frame').screenshot({path:'q_hw.png'});
  console.log(errs, await p.evaluate(()=>bogiDebug.rpg.debug.state())); await b.close(); })();
