const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage({ viewport: { width: 1100, height: 900 } });
  const errs=[]; p.on('pageerror', e=>errs.push(e.message)); p.on('console', m=>{if(m.type()==='error'&&!m.text().includes('404'))errs.push(m.text())});
  await p.goto('http://localhost:8765/field/index.html?debug');
  await p.evaluate(()=>localStorage.clear()); await p.reload(); await p.waitForTimeout(1000);
  const W=ms=>p.waitForTimeout(ms);
  const shot=n=>p.locator('.game-frame').screenshot({path:`h_${n}.png`});
  const st=()=>p.evaluate(()=>bogiDebug.rpg.debug.state());
  await shot('01_start'); console.log(await st(), await p.locator('#progressText').innerText());
  await p.keyboard.down('ArrowUp'); await W(1500); await p.keyboard.up('ArrowUp'); await W(200); await shot('02_near'); console.log(await st());
  await p.keyboard.down('ArrowUp'); await W(1500); await p.keyboard.up('ArrowUp'); await W(600); await shot('03_touch'); console.log(await st());
  await p.keyboard.press('Enter'); await W(250); await p.keyboard.press('Enter'); await W(1500); await shot('04_inlake'); console.log(await st(), await p.locator('#progressText').innerText());
  // 世界のゴールまで飛ばして帰る
  await p.evaluate(()=>{ const g=bogiDebug.gameState; g.flags['lake.memory']=true; });
  await p.evaluate(()=>bogiDebug.rpg.debug.load('shop','door')); await W(300);
  await p.evaluate(()=>bogiDebug.rpg.debug.teleport(8.3*32, 4.3*32)); await W(300);
  await p.keyboard.press('Enter'); await W(2500); await p.keyboard.press('Enter'); await W(1500); await p.keyboard.press('Enter'); await W(2500);
  await shot('05_back'); console.log(await st(), await p.locator('#progressText').innerText());
  await W(300); await shot('06_back2');
  console.log('errors',errs);
  await b.close();
})();
