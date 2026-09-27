const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage({ viewport: { width: 1100, height: 900 } });
  const errs=[]; p.on('pageerror', e=>errs.push(e.message)); p.on('console', m=>{if(m.type()==='error'&&!m.text().includes('404'))errs.push(m.text())});
  await p.goto('http://localhost:8765/field/index.html?debug');
  await p.evaluate(()=>{localStorage.clear(); localStorage.setItem('bogidachi.field.v1', JSON.stringify({items:[],words:[],cleared:['lake'],flags:{'void.found.lake':true}}));});
  await p.reload(); await p.waitForTimeout(1000);
  const W=ms=>p.waitForTimeout(ms);
  const shot=n=>p.locator('.game-frame').screenshot({path:`k_${n}.png`});
  const st=()=>p.evaluate(()=>bogiDebug.rpg.debug.state());
  const tp=(x,y)=>p.evaluate(([x,y])=>bogiDebug.rpg.debug.teleport(x,y),[x,y]);
  const load=(m,s)=>p.evaluate(([m,s])=>bogiDebug.rpg.debug.load(m,s),[m,s]);
  const E=async(ms=700)=>{await p.keyboard.press('Enter'); await W(ms);};
  // hub: 廃兵院の台座に近づく
  await tp(33*32, 23.2*32); await W(400); await shot('00_hub'); console.log(await st(), await p.locator('#progressText').innerText());
  await p.keyboard.down('ArrowUp'); await W(500); await p.keyboard.up('ArrowUp'); await W(600); await shot('01_hubtouch');
  await E(300); await E(1800); console.log(await st());
  await W(1500); await shot('02_yard');
  await load('hall','south'); await W(400); await tp(8*32,6*32); await W(300); await shot('h_stage');
  await load('window','door'); await W(500); await tp(4.5*32,5.2*32); await W(300); console.log(await st()); await E(300); await W(700); await shot('h_window');
  await load('room1','door'); await W(500); await shot('h_room1');
  await load('roof','up'); await W(500); await tp(7*32,5*32); await W(300); await shot('h_roof');
  console.log('errors',errs); await b.close(); })();
