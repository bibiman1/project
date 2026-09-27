const { chromium, devices } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage({ viewport: { width: 1100, height: 900 } });
  const errs=[]; p.on('pageerror', e=>errs.push(e.message));
  await p.goto('http://localhost:8765/field/index.html?debug');
  await p.evaluate(()=>{localStorage.clear(); localStorage.setItem('bogidachi.field.v1', JSON.stringify({items:['氷のかけら','スタンプ台紙','おたかぽっぽ'],words:['金星の天気予報'],cleared:['lake'],flags:{'void.found.lake':true,'void.found.haihei':true,'kasumi.jump':true}}));});
  await p.reload(); await p.waitForTimeout(1500);
  await p.keyboard.press('KeyC'); await p.waitForTimeout(1500);
  await p.locator('.game-frame').screenshot({path:'q_st1.png'});
  await p.keyboard.down('ArrowRight'); await p.waitForTimeout(400); await p.keyboard.up('ArrowRight');
  const pos1 = await p.evaluate(()=>bogiDebug.rpg.debug.state());
  await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  console.log('hidden after close', await p.evaluate(()=>document.getElementById('statusOverlay').hidden), pos1);
  // スマホ
  const ctx = await b.newContext({ ...devices['iPhone 13'], isMobile:true, hasTouch:true, viewport:{width:844,height:390} });
  const m = await ctx.newPage(); m.on('pageerror', e=>errs.push(e.message));
  await m.goto('http://localhost:8765/field/index.html'); await m.waitForTimeout(1500);
  await m.screenshot({path:'q_st2.png'});
  await m.tap('#actionBtnC'); await m.waitForTimeout(1500); await m.screenshot({path:'q_st3.png'});
  await m.tap('#actionBtnB'); await m.waitForTimeout(300);
  console.log('mobile closed', await m.evaluate(()=>document.getElementById('statusOverlay').hidden));
  console.log(errs); await b.close(); })();
