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
  await p.evaluate(()=>bogiDebug.enterWorld('lake')); await W(1500);
  const s0=await st(); console.log('start',s0);
  // find a road cell around row 13.5
  await tp(7.5*32, 13.6*32); await W(300); console.log(await st());
  await p.keyboard.down('ArrowUp'); await W(700); await p.keyboard.up('ArrowUp'); await W(700); await shot('pan1'); await W(1500); await shot('pan2'); await W(3500);
  await tp(7.5*32, 13.6*32); await W(3000); await p.keyboard.down('ArrowUp'); await W(700); await p.keyboard.up('ArrowUp'); await W(2000); await shot('pan3');
  console.log(await st(), await p.evaluate(()=>Object.keys(bogiDebug.gameState.flags)));
  console.log('errors',errs); await b.close(); })();
