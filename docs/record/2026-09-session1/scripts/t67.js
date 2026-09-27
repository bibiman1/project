const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage({ viewport: { width: 1100, height: 900 } });
  await p.goto('http://localhost:8765/field/index.html?debug'); await p.waitForTimeout(1000);
  const W=ms=>p.waitForTimeout(ms);
  const st=()=>p.evaluate(()=>bogiDebug.rpg.debug.state());
  const hold=async(k,ms)=>{await p.keyboard.down(k); await W(ms); await p.keyboard.up(k);};
  await p.evaluate(()=>bogiDebug.enterWorld('kasumi')); await W(1500);
  await p.evaluate(()=>bogiDebug.rpg.debug.load('wing','land')); await W(1500);
  await p.locator('.game-frame').screenshot({path:'q_w1.png'}); await hold('ArrowUp',1500); console.log(await st()); await p.locator('.game-frame').screenshot({path:'q_w2.png'});
  await hold('ArrowRight',1500); console.log(await st());
  await hold('ArrowUp',1500); await W(600); await hold('ArrowUp',600); await W(1200); console.log(await st());
  console.log('in cabin after holding up:', await st());
  await p.keyboard.press('Enter'); await W(1500); console.log('A at ladder:', await st());
  await b.close(); })();
