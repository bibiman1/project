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
  await tp(7*32, 30*32); await W(600); await shot('g1');
  // walk into the layby rail from below
  await tp(8*32, 9.4*32); await W(300);
  await p.keyboard.down('ArrowUp'); await W(900); await p.keyboard.up('ArrowUp'); await W(100);
  console.log('after push up to rail', await st());
  await W(400); console.log('bounced', await st());
  // homeward
  await p.evaluate(()=>{bogiDebug.gameState.flags['lake.ate']=true;});
  await tp(10*32, 30.5*32); await W(600); await shot('g2');
  const a=await st(); console.log('onroad',a); await p.keyboard.down('ArrowRight'); await W(400); await p.keyboard.up('ArrowRight');
  const b1=await st(); await W(500); const b2=await st();
  console.log('slide x', a.x, b1.x, b2.x);
  await load('lake','west'); await W(500); await shot('g3');
  console.log('errors',errs); await b.close(); })();
