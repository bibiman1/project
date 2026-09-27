const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage({ viewport: { width: 1100, height: 900 } });
  await p.goto('http://localhost:8765/field/index.html?debug');
  await p.evaluate(()=>{localStorage.clear(); localStorage.setItem('bogidachi.field.v1', JSON.stringify({items:[],words:[],cleared:['lake'],flags:{'void.found.lake':true,'void.found.haihei':true}}));});
  await p.reload(); await p.waitForTimeout(1800);
  for (const k of ['KeyC','ArrowDown','ArrowDown','ArrowDown','Enter']) await p.keyboard.press(k);
  await p.waitForTimeout(200); await p.locator('.game-frame').screenshot({path:'q_n1.png'});
  await p.keyboard.press('ArrowDown'); await p.waitForTimeout(200); await p.locator('.game-frame').screenshot({path:'q_n2.png'});
  await b.close(); })();
