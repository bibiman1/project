const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage({ viewport: { width: 1100, height: 900 } });
  const errs=[]; p.on('pageerror', e=>errs.push(e.message));
  await p.goto('http://localhost:8765/field/index.html?debug');
  await p.evaluate(()=>localStorage.clear()); await p.reload(); await p.waitForTimeout(800);
  await p.evaluate(()=>{ BOGI_WORLDS.lake.maps.road.vectorRoad = true; bogiDebug.enterWorld('lake'); });
  await p.waitForTimeout(1500);
  await p.evaluate(()=>bogiDebug.rpg.debug.teleport(6*32, 44*32)); await p.waitForTimeout(300);
  await p.locator('.game-frame').screenshot({path:'t6_vec.png'});
  console.log('errors',errs);
  await b.close();
})();
