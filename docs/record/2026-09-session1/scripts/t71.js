const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage({ viewport: { width: 1100, height: 900 } });
  const errs=[]; p.on('pageerror', e=>errs.push(e.message));
  await p.goto('http://localhost:8765/field/index.html?debug');
  await p.evaluate(()=>localStorage.clear()); await p.reload(); await p.waitForTimeout(1500);
  const W=ms=>p.waitForTimeout(ms);
  const shot=n=>p.locator('.game-frame').screenshot({path:`q_${n}.png`});
  const tp=(x,y)=>p.evaluate(([x,y])=>bogiDebug.rpg.debug.teleport(x,y),[x,y]);
  const hold=async(k,ms)=>{await p.keyboard.down(k); await W(ms); await p.keyboard.up(k);};
  // 懲罰空間で廃兵院の台座に近づく
  await tp(33*32,22.6*32); await W(800); await shot('v1');
  // 廃兵院へ(フェードの途中を撮る)
  await p.evaluate(()=>bogiDebug.enterWorld('haihei'));
  for (const t of [500,1000,1500,2200]) { await W(t===500?500:500); await shot('h'+t); }
  // 霞ヶ浦の格納庫でジャンプを習う(キーボード)
  await p.evaluate(()=>bogiDebug.enterWorld('kasumi')); await W(1800);
  await p.evaluate(()=>bogiDebug.rpg.debug.load('hangar','door')); await W(1500);
  await tp(6.2*32,7.6*32); await hold('ArrowUp',120); await W(300); await p.keyboard.press('Enter'); await W(2400); await shot('j1');
  console.log(errs); await b.close(); })();
