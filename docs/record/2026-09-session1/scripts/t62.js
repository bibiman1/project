const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage({ viewport: { width: 1100, height: 900 } });
  p.on('response', r=>{ if(r.status()>=400) console.log('HTTP',r.status(),r.url()); });
  const errs=[]; p.on('pageerror', e=>errs.push(e.message));
  await p.goto('http://localhost:8765/field/index.html?debug');
  await p.evaluate(()=>{localStorage.clear(); localStorage.setItem('bogidachi.field.v1', JSON.stringify({items:[],words:[],cleared:['lake','haihei'],flags:{'found.lake':true,'found.haihei':true,'found.kasumi':true,'kasumi.jump':true}}));});
  await p.reload(); await p.waitForTimeout(1200);
  const W=ms=>p.waitForTimeout(ms);
  const shot=n=>p.locator('.game-frame').screenshot({path:`q_${n}.png`});
  const st=()=>p.evaluate(()=>bogiDebug.rpg.debug.state());
  const tp=(x,y)=>p.evaluate(([x,y])=>bogiDebug.rpg.debug.teleport(x,y),[x,y]);
  const hold=async(k,ms)=>{await p.keyboard.down(k); await W(ms); await p.keyboard.up(k);};
  await p.evaluate(()=>bogiDebug.enterWorld('kasumi')); await W(1500);
  await hold('ArrowUp',4200); await W(1200);
  await tp(16.5*32,9.5*32); await hold('ArrowUp',150); await p.keyboard.press('KeyX'); await W(1800); console.log(await st());
  // 南の翼の先から南へ跳ぶと岸へ
  await hold('ArrowDown',150); await p.keyboard.press('KeyX'); await W(1800); console.log('back to shore?',await st());
  await tp(16.5*32,9.5*32); await hold('ArrowUp',150); await p.keyboard.press('KeyX'); await W(1800);
  await tp(17.55*32,8*32); await W(1500);
  await tp(3*32,4.9*32); await hold('ArrowUp',100); await W(300); await p.keyboard.press('Enter'); await W(22000); await shot('v'); 
  await p.keyboard.press('Enter'); await W(2500); console.log('after', await st(), await p.evaluate(()=>bogiDebug.gameState.cleared)); await shot('h');
  console.log('errors',errs); await b.close(); })();
