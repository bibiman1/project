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
  await p.evaluate(()=>{bogiDebug.gameState.flags['lake.trig.vista']=true;});
  await p.evaluate(()=>bogiDebug.enterWorld('lake')); await W(1500);
  await tp(7*32, 48*32); await W(600); await shot('sg1');
  await tp(7*32, 38*32); await W(600); await shot('sg2');
  await load('shop','door'); await W(500); await tp(9*32,5.5*32); await W(400); await shot('sh1');
  let pos=null;
  for (const [x,y] of [[7.6,3.7],[7.6,3.9],[7.2,4.0],[8.0,4.0]]) { await tp(x*32,y*32); await W(200); const s=await st(); if (s.near==='chair'){pos=[x,y];break;} }
  console.log('chair pos',pos);
  for (const [x,y] of [[11.4,8.2],[9.5,7],[12.5,8.5]]) { await tp(x*32,y*32); await W(200); const s=await st(); if (s.near==='pot'){console.log('pot near at',x,y); await E(900); await shot('sh2'); await E(600); break;} }
  console.log('errors',errs); await b.close(); })();
