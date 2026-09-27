const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage({ viewport: { width: 1100, height: 900 } });
  await p.goto('http://localhost:8765/field/index.html?debug');
  await p.evaluate(()=>{localStorage.clear(); localStorage.setItem('bogidachi.field.v1', JSON.stringify({items:[],words:[],cleared:[],flags:{'void.found.haihei':true}}));});
  await p.reload(); await p.waitForTimeout(1500);
  await p.evaluate(()=>bogiDebug.rpg.debug.teleport(33*32,22.3*32)); 
  await p.keyboard.down('ArrowUp'); await p.waitForTimeout(100); await p.keyboard.up('ArrowUp'); await p.waitForTimeout(300);
  console.log(await p.evaluate(()=>bogiDebug.rpg.debug.state()));
  await p.keyboard.press('Enter'); await p.waitForTimeout(500); await p.keyboard.press('Enter');
  const t0=Date.now(); const log=[];
  for(let i=0;i<40;i++){ const o=await p.evaluate(()=>[getComputedStyle(document.getElementById('fadeOverlay')).opacity, document.getElementById('fadeOverlay').className, bogiDebug.rpg.debug.state().map]); log.push(((Date.now()-t0)/1000).toFixed(2)+' '+o.join(' ')); await p.waitForTimeout(100);}
  console.log(log.join('\n')); await b.close(); })();
