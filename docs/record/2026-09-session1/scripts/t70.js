const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage({ viewport: { width: 1100, height: 900 } });
  const errs=[]; p.on('pageerror', e=>errs.push(e.message));
  await p.goto('http://localhost:8765/field/index.html?debug'); await p.waitForTimeout(1000);
  const W=ms=>p.waitForTimeout(ms);
  const st=()=>p.evaluate(()=>bogiDebug.rpg.debug.state());
  const tp=(x,y)=>p.evaluate(([x,y])=>bogiDebug.rpg.debug.teleport(x,y),[x,y]);
  const hold=async(k,ms)=>{await p.keyboard.down(k); await W(ms); await p.keyboard.up(k);};
  await p.evaluate(()=>bogiDebug.enterWorld('kasumi')); await W(1500);
  for (const x of [15.6, 16.1, 17.0, 17.9, 18.2]) {
    await p.evaluate(()=>bogiDebug.rpg.debug.load('wing','land')); await W(1300);
    await tp(x*32, 10.6*32); await W(100);
    await hold('ArrowUp',1200); await W(1300);
    const s=await st(); console.log(x, s.map, (s.x/32).toFixed(2), (s.y/32).toFixed(2));
  }
  // 翼の先から、ななめ入力(右上)で乗降口へ
  await p.evaluate(()=>bogiDebug.rpg.debug.load('wing','land')); await W(1300);
  await p.keyboard.down('ArrowUp'); await p.keyboard.down('ArrowRight'); await W(2500); await p.keyboard.up('ArrowRight'); await W(1500); await p.keyboard.up('ArrowUp'); await W(1500);
  console.log('diagonal:', await st());
  console.log(errs); await b.close(); })();
